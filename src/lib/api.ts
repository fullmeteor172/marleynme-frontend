import { getAccessToken, refreshSession, isSessionValid } from './supabase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.marleynme.in';
const API_PREFIX = '/api/v1';

// Configuration
const DEFAULT_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY_BASE = 1000; // 1 second base, exponential backoff

// Detect Firefox for browser-specific handling
const isFirefox = typeof navigator !== 'undefined' && navigator.userAgent.toLowerCase().includes('firefox');

// Custom error types for better error handling
export class ApiError extends Error {
  status: number;
  code?: string;
  isRetryable: boolean;

  constructor(
    message: string,
    status: number,
    code?: string,
    isRetryable: boolean = false
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.isRetryable = isRetryable;
  }
}

export class AuthenticationError extends ApiError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401, 'AUTH_FAILED', false);
    this.name = 'AuthenticationError';
  }
}

export class NetworkError extends ApiError {
  constructor(message: string = 'Network error') {
    super(message, 0, 'NETWORK_ERROR', true);
    this.name = 'NetworkError';
  }
}

export class TimeoutError extends ApiError {
  constructor(message: string = 'Request timed out') {
    super(message, 0, 'TIMEOUT', true);
    this.name = 'TimeoutError';
  }
}

// Event emitter for API events (401 errors, etc.)
type ApiEventType = 'auth_error' | 'network_error' | 'session_expired';
type ApiEventHandler = () => void;

class ApiEventEmitter {
  private handlers: Map<ApiEventType, Set<ApiEventHandler>> = new Map();

  on(event: ApiEventType, handler: ApiEventHandler) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);
    return () => this.off(event, handler);
  }

  off(event: ApiEventType, handler: ApiEventHandler) {
    this.handlers.get(event)?.delete(handler);
  }

  emit(event: ApiEventType) {
    this.handlers.get(event)?.forEach(handler => {
      try {
        handler();
      } catch (e) {
        console.error(`Error in API event handler for ${event}:`, e);
      }
    });
  }
}

export const apiEvents = new ApiEventEmitter();

// Token refresh lock to prevent multiple simultaneous refresh attempts
let isRefreshingToken = false;
let refreshPromise: Promise<string | null> | null = null;

async function getValidToken(): Promise<string | null> {
  // Check if session is valid first
  if (!isSessionValid()) {
    return null;
  }

  // If already refreshing, wait for the existing refresh
  if (isRefreshingToken && refreshPromise) {
    return refreshPromise;
  }

  try {
    const token = await getAccessToken();
    return token;
  } catch (error) {
    console.error('Failed to get access token:', error);
    return null;
  }
}

async function attemptTokenRefresh(): Promise<string | null> {
  if (isRefreshingToken && refreshPromise) {
    return refreshPromise;
  }

  isRefreshingToken = true;
  refreshPromise = refreshSession().finally(() => {
    isRefreshingToken = false;
    refreshPromise = null;
  });

  return refreshPromise;
}

// Calculate retry delay with exponential backoff and jitter
function getRetryDelay(attempt: number): number {
  const exponentialDelay = RETRY_DELAY_BASE * Math.pow(2, attempt);
  const jitter = Math.random() * 1000; // Random 0-1000ms jitter
  return Math.min(exponentialDelay + jitter, 10000); // Cap at 10 seconds
}

// Sleep utility
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

class ApiClient {
  private async getHeaders(includeContentType: boolean = true): Promise<HeadersInit> {
    const token = await getValidToken();
    const headers: HeadersInit = {};

    if (includeContentType) {
      headers['Content-Type'] = 'application/json';
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = `Request failed with status ${response.status}`;
      let errorCode: string | undefined;

      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
        errorCode = errorData.code;
      } catch {
        // Response body is not JSON
      }

      // Handle specific status codes
      switch (response.status) {
        case 401:
          // Emit auth error event for global handling
          apiEvents.emit('auth_error');
          throw new AuthenticationError(errorMessage);

        case 403:
          throw new ApiError(errorMessage, 403, errorCode || 'FORBIDDEN', false);

        case 404:
          throw new ApiError(errorMessage, 404, errorCode || 'NOT_FOUND', false);

        case 429:
          // Rate limited - retryable
          throw new ApiError(errorMessage, 429, 'RATE_LIMITED', true);

        case 500:
        case 502:
        case 503:
        case 504:
          // Server errors - retryable
          throw new ApiError(errorMessage, response.status, errorCode || 'SERVER_ERROR', true);

        default:
          throw new ApiError(errorMessage, response.status, errorCode, false);
      }
    }

    // Handle empty responses
    const contentLength = response.headers.get('content-length');
    if (contentLength === '0' || response.status === 204) {
      return {} as T;
    }

    try {
      return await response.json();
    } catch {
      // Response is not JSON but request succeeded
      return {} as T;
    }
  }

  private async fetchWithTimeout(
    url: string,
    options: RequestInit,
    timeout: number = DEFAULT_TIMEOUT
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      return response;
    } catch (error) {
      if (error instanceof Error) {
        // Handle abort/timeout errors - Firefox may use different error names/messages
        if (
          error.name === 'AbortError' ||
          error.name === 'NS_BINDING_ABORTED' || // Firefox-specific
          error.message.includes('aborted') ||
          error.message.includes('cancelled') ||
          error.message.includes('canceled')
        ) {
          throw new TimeoutError(`Request timed out after ${timeout}ms`);
        }

        // Network errors (no internet, DNS failure, etc.)
        // Firefox may throw different error messages
        const errorMessage = error.message.toLowerCase();
        if (
          error.message.includes('Failed to fetch') ||
          error.message.includes('NetworkError') ||
          error.message.includes('Network request failed') ||
          error.name === 'TypeError' && errorMessage.includes('network') ||
          errorMessage.includes('connection refused') ||
          errorMessage.includes('unable to connect') ||
          errorMessage.includes('network error') ||
          errorMessage.includes('ns_error_') || // Firefox NS_ERROR codes
          errorMessage.includes('cors') // CORS errors often manifest as network errors
        ) {
          apiEvents.emit('network_error');
          throw new NetworkError(error.message);
        }

        // For Firefox: TypeError can indicate various network issues
        if (isFirefox && error.name === 'TypeError') {
          console.warn('Firefox TypeError in fetch - treating as network error:', error.message);
          apiEvents.emit('network_error');
          throw new NetworkError(error.message);
        }
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private async requestWithRetry<T>(
    method: string,
    endpoint: string,
    options: {
      body?: unknown;
      timeout?: number;
      maxRetries?: number;
      includeContentType?: boolean;
    } = {}
  ): Promise<T> {
    const {
      body,
      timeout = DEFAULT_TIMEOUT,
      maxRetries = MAX_RETRIES,
      includeContentType = true
    } = options;

    const url = `${API_BASE_URL}${API_PREFIX}${endpoint}`;
    let lastError: Error | null = null;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        const headers = await this.getHeaders(includeContentType);

        const fetchOptions: RequestInit = {
          method,
          headers,
        };

        if (body !== undefined && includeContentType) {
          fetchOptions.body = JSON.stringify(body);
        } else if (body !== undefined) {
          fetchOptions.body = body as BodyInit;
        }

        const response = await this.fetchWithTimeout(url, fetchOptions, timeout);
        return await this.handleResponse<T>(response);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Handle authentication errors specially
        if (error instanceof AuthenticationError) {
          // Try to refresh token once
          if (attempt === 0) {
            console.log('Attempting token refresh after 401...');
            try {
              const newToken = await attemptTokenRefresh();
              if (newToken) {
                attempt++;
                continue; // Retry with new token
              }
            } catch (refreshError) {
              console.error('Token refresh failed:', refreshError);
            }
          }
          // Token refresh failed or already tried - emit session expired
          apiEvents.emit('session_expired');
          throw error;
        }

        // Only retry on retryable errors
        if (error instanceof ApiError && !error.isRetryable) {
          throw error;
        }

        // For network/timeout errors, always retry (they're retryable by nature)
        const isRetryableError =
          error instanceof NetworkError ||
          error instanceof TimeoutError ||
          (error instanceof ApiError && error.isRetryable);

        // Check if we should retry
        if (isRetryableError && attempt < maxRetries - 1) {
          const delay = getRetryDelay(attempt);
          console.log(`Request failed (${error instanceof Error ? error.name : 'unknown'}), retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})...`);
          await sleep(delay);
          attempt++;
          continue;
        }

        // No more retries - throw the error
        attempt++;
      }
    }

    // All retries exhausted
    throw lastError || new Error('Request failed after all retries');
  }

  async get<T>(endpoint: string, timeout?: number): Promise<T> {
    return this.requestWithRetry<T>('GET', endpoint, { timeout });
  }

  async post<T>(endpoint: string, data?: unknown, timeout?: number): Promise<T> {
    return this.requestWithRetry<T>('POST', endpoint, { body: data, timeout });
  }

  async patch<T>(endpoint: string, data?: unknown, timeout?: number): Promise<T> {
    return this.requestWithRetry<T>('PATCH', endpoint, { body: data, timeout });
  }

  async put<T>(endpoint: string, data?: unknown, timeout?: number): Promise<T> {
    return this.requestWithRetry<T>('PUT', endpoint, { body: data, timeout });
  }

  async delete<T>(endpoint: string, timeout?: number): Promise<T> {
    return this.requestWithRetry<T>('DELETE', endpoint, { timeout });
  }

  async uploadFile<T>(
    endpoint: string,
    file: File,
    additionalData?: Record<string, string>,
    timeout: number = 60000 // Longer timeout for file uploads
  ): Promise<T> {
    const token = await getValidToken();
    const formData = new FormData();
    formData.append('file', file);

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // File uploads don't use the standard retry logic due to potential partial uploads
    const url = `${API_BASE_URL}${API_PREFIX}${endpoint}`;
    const response = await this.fetchWithTimeout(
      url,
      {
        method: 'POST',
        headers,
        body: formData,
      },
      timeout
    );

    return this.handleResponse<T>(response);
  }
}

export const api = new ApiClient();
