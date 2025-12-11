import { getValidAccessToken, hasStoredSession, refreshSessionIfNeeded } from './supabase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.marleynme.in';
const API_PREFIX = '/api/v1';

// Configuration
const DEFAULT_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY_BASE = 1000; // 1 second base, exponential backoff

// Custom error types
export class ApiError extends Error {
  status: number;
  code?: string;
  isRetryable: boolean;

  constructor(message: string, status: number, code?: string, isRetryable: boolean = false) {
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

// Event emitter for API events
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
    this.handlers.get(event)?.forEach((handler) => {
      try {
        handler();
      } catch (e) {
        console.error(`Error in API event handler for ${event}:`, e);
      }
    });
  }
}

export const apiEvents = new ApiEventEmitter();

// Track last successful API call time for stale detection
let lastSuccessfulApiCall = Date.now();
const STALE_THRESHOLD = 2 * 60 * 1000; // 2 minutes

// Check if API client might be stale (Firefox background tab issue)
function isApiClientStale(): boolean {
  return Date.now() - lastSuccessfulApiCall > STALE_THRESHOLD;
}

// Reset API client state (called on page visibility change)
async function wakeUpApiClient(): Promise<void> {
  if (isApiClientStale() && hasStoredSession()) {
    console.log('API client appears stale, refreshing session...');
    await refreshSessionIfNeeded();
  }
  lastSuccessfulApiCall = Date.now();
}

// Set up visibility change listener to wake up API on tab focus
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      wakeUpApiClient();
    }
  });
}

// Token refresh lock to prevent multiple simultaneous refresh attempts
let isRefreshingToken = false;
let refreshPromise: Promise<string | null> | null = null;

async function getToken(): Promise<string | null> {
  if (!hasStoredSession()) {
    return null;
  }

  // If already refreshing, wait for it
  if (isRefreshingToken && refreshPromise) {
    return refreshPromise;
  }

  try {
    return await getValidAccessToken();
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
  refreshPromise = refreshSessionIfNeeded()
    .then(async (success) => {
      if (success) {
        return await getValidAccessToken();
      }
      return null;
    })
    .finally(() => {
      isRefreshingToken = false;
      refreshPromise = null;
    });

  return refreshPromise;
}

// Calculate retry delay with exponential backoff and jitter
function getRetryDelay(attempt: number): number {
  const exponentialDelay = RETRY_DELAY_BASE * Math.pow(2, attempt);
  const jitter = Math.random() * 500;
  return Math.min(exponentialDelay + jitter, 8000);
}

// Sleep utility
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class ApiClient {
  private async getHeaders(includeContentType: boolean = true): Promise<HeadersInit> {
    const token = await getToken();
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

      switch (response.status) {
        case 401:
          apiEvents.emit('auth_error');
          throw new AuthenticationError(errorMessage);

        case 403:
          throw new ApiError(errorMessage, 403, errorCode || 'FORBIDDEN', false);

        case 404:
          throw new ApiError(errorMessage, 404, errorCode || 'NOT_FOUND', false);

        case 429:
          throw new ApiError(errorMessage, 429, 'RATE_LIMITED', true);

        case 500:
        case 502:
        case 503:
        case 504:
          throw new ApiError(errorMessage, response.status, errorCode || 'SERVER_ERROR', true);

        default:
          throw new ApiError(errorMessage, response.status, errorCode, false);
      }
    }

    // Update last successful call time
    lastSuccessfulApiCall = Date.now();

    // Handle empty responses
    const contentLength = response.headers.get('content-length');
    if (contentLength === '0' || response.status === 204) {
      return {} as T;
    }

    try {
      return await response.json();
    } catch {
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
        // Handle abort/timeout - various browser error messages
        if (
          error.name === 'AbortError' ||
          error.name === 'NS_BINDING_ABORTED' ||
          error.message.includes('aborted') ||
          error.message.includes('cancelled') ||
          error.message.includes('canceled')
        ) {
          throw new TimeoutError(`Request timed out after ${timeout}ms`);
        }

        // Network errors
        const msg = error.message.toLowerCase();
        if (
          error.message.includes('Failed to fetch') ||
          error.message.includes('NetworkError') ||
          error.message.includes('Network request failed') ||
          msg.includes('network') ||
          msg.includes('connection refused') ||
          msg.includes('unable to connect') ||
          msg.includes('ns_error_') ||
          msg.includes('cors')
        ) {
          apiEvents.emit('network_error');
          throw new NetworkError(error.message);
        }

        // Firefox TypeError often indicates network issues
        if (error.name === 'TypeError' && !error.message.includes('Cannot read')) {
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
    const { body, timeout = DEFAULT_TIMEOUT, maxRetries = MAX_RETRIES, includeContentType = true } = options;

    const url = `${API_BASE_URL}${API_PREFIX}${endpoint}`;
    let lastError: Error | null = null;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        // Wake up API client if it might be stale
        if (isApiClientStale()) {
          await wakeUpApiClient();
        }

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

        // Handle authentication errors
        if (error instanceof AuthenticationError) {
          if (attempt === 0) {
            console.log('Attempting token refresh after 401...');
            try {
              const newToken = await attemptTokenRefresh();
              if (newToken) {
                attempt++;
                continue;
              }
            } catch (refreshError) {
              console.error('Token refresh failed:', refreshError);
            }
          }
          apiEvents.emit('session_expired');
          throw error;
        }

        // Only retry on retryable errors
        if (error instanceof ApiError && !error.isRetryable) {
          throw error;
        }

        // Check if error is retryable
        const isRetryableError =
          error instanceof NetworkError ||
          error instanceof TimeoutError ||
          (error instanceof ApiError && error.isRetryable);

        if (isRetryableError && attempt < maxRetries - 1) {
          const delay = getRetryDelay(attempt);
          console.log(
            `Request failed (${error instanceof Error ? error.name : 'unknown'}), retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})...`
          );
          await sleep(delay);
          attempt++;
          continue;
        }

        attempt++;
      }
    }

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
    timeout: number = 60000
  ): Promise<T> {
    const token = await getToken();
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
