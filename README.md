# Marley 'n' Me - Frontend

A modern, full-stack pet services platform built with React, TypeScript, and Supabase.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- A Supabase project with Google OAuth enabled
- Access to the Marley 'n' Me backend API

### Installation

1. **Clone the repository and install dependencies:**

```bash
npm install
```

2. **Configure environment variables:**

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=https://api.marleynme.in
```

3. **Run the development server:**

```bash
npm run dev
```

4. **Build for production:**

```bash
npm run build
```

## 🏗️ Project Structure

```
src/
├── assets/           # Images, GIFs, and static assets
├── components/       # React components
│   ├── auth/        # Authentication components (LoginDialog, ProtectedRoute)
│   ├── blocks/      # Landing page sections (Hero, Nav, Timeline, etc.)
│   ├── providers/   # Context providers (AuthProvider)
│   └── ui/          # Shadcn UI components
├── hooks/           # Custom React hooks for API calls
│   ├── use-profile.ts
│   ├── use-pets.ts
│   ├── use-addresses.ts
│   ├── use-services.ts
│   └── use-service-requests.ts
├── lib/             # Utility libraries
│   ├── api.ts       # API client with auth
│   ├── supabase.ts  # Supabase client configuration
│   └── utils.ts     # Helper functions
├── pages/           # Application pages
│   ├── landing.tsx               # Public landing page
│   ├── auth-callback.tsx         # OAuth callback handler
│   ├── onboarding.tsx            # User onboarding flow
│   └── dashboard/                # Authenticated pages
│       ├── layout.tsx            # Dashboard layout with sidebar
│       ├── pets-home.tsx         # Pets management home
│       ├── profile.tsx           # User profile settings
│       ├── addresses.tsx         # Address book
│       ├── adoption.tsx          # Adoption center (placeholder)
│       ├── partner.tsx           # Partner portal (placeholder)
│       └── admin.tsx             # Admin portal (placeholder)
├── services/        # API service layer
│   ├── profile-service.ts
│   ├── pet-service.ts
│   ├── address-service.ts
│   ├── service-service.ts
│   ├── service-request-service.ts
│   ├── partner-service.ts
│   └── admin-service.ts
├── stores/          # Zustand state management
│   └── auth-store.ts             # Authentication state
├── types/           # TypeScript type definitions
│   └── index.ts                  # All API types and interfaces
├── App.tsx          # Main app with routing
└── main.tsx         # Application entry point
```

## 🎨 Tech Stack

### Core
- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS 4** - Styling

### State Management & Data Fetching
- **Zustand** - Lightweight state management
- **TanStack Query (React Query)** - Server state management
- **React Hook Form** - Form handling
- **Zod** - Schema validation

### UI Components
- **Shadcn UI** - Beautiful, accessible components
- **Lucide React** - Icon library
- **React Icons** - Additional icons
- **Sonner** - Toast notifications
- **Motion** - Animations

### Authentication & Backend
- **Supabase** - Authentication and database
- **React Router DOM** - Client-side routing

## 📱 Application Flow

### 1. Landing Page (`/`)
- Clean, modern landing page with hero section
- "How It Works" timeline
- Services showcase
- Login button in navbar (always visible)

### 2. Authentication
- Click "Login" → Google OAuth dialog
- Apple OAuth (coming soon)
- Callback handled at `/auth/callback`

### 3. Onboarding (`/onboarding`)
**Typeform-style multi-step flow:**

**For all users (Steps 1-3):**
1. Name entry (first name required, last name optional)
2. City selection (beautifully designed city cards)
3. Role selection (Pet Parent / Prospective Parent / Service Partner)

**Additional steps for Service Partners (Steps 4-6):**
4. Contact number (+91 prefix, 10-digit validation)
5. Service interests (optional, can skip)
6. Pincode (optional, can skip)

**Features:**
- Progress bar and step indicators
- Theme toggle and signout in header
- Back/Next navigation
- Auto-save on each step
- Responsive design

### 4. Dashboard (`/dashboard/*`)

**Sidebar Navigation:**

**Main Section:**
- Your Pets Home - Manage pets and service history
- Adoption Center - Find pets to adopt (coming soon)
- Partner Portal - For service providers (role-based)
- Admin Portal - System administration (role-based)

**Account Section:**
- User Profile - Edit personal details and roles
- Address Book - Manage saved addresses
- Billing & Invoices - View invoices (coming soon)

**Footer:**
- Contact Us - Quick access to contact info
- User profile with avatar
- Sign out button

### 5. Your Pets Home (`/dashboard/pets`)

**Features:**
- Grid of pet cards with photos and details
- "Add Pet" button
- Service history table with:
  - Service name and pet
  - Scheduled date/time
  - Status badges (color-coded)
  - Pricing information
- Click pet card → View pet details
- Click service row → View/edit service request

## 🔐 Authentication & Authorization

### Auth Flow
1. User clicks Login → Google OAuth
2. Supabase handles authentication
3. JWT token stored in session
4. Token auto-attached to API requests
5. Profile fetched and stored in Zustand

### Protected Routes
- `/dashboard/*` - Requires authentication
- Onboarding check - Redirects to `/onboarding` if incomplete
- Role-based sidebar items (Partner Portal, Admin Portal)

### Auth Store (Zustand)
```typescript
{
  session: Session | null
  user: User | null
  profile: Profile | null
  isLoading: boolean
  isInitialized: boolean
  signOut: () => Promise<void>
  signInWithGoogle: () => Promise<void>
}
```

## 🔌 API Integration

### API Client (`src/lib/api.ts`)
Centralized API client with:
- Automatic JWT token injection
- Type-safe request/response
- Error handling
- File upload support

### Service Layer Pattern
Each domain has a dedicated service:
- `profileService` - User profiles and onboarding
- `petService` - Pet CRUD, avatars, share codes
- `addressService` - Address management
- `serviceService` - Available services and pricing
- `serviceRequestService` - Service bookings
- `partnerService` - Partner-specific operations
- `adminService` - Admin operations

### React Query Hooks
Custom hooks for each operation:
- Automatic caching
- Background refetching
- Optimistic updates
- Loading and error states

Example:
```typescript
const { data: pets, isLoading } = usePets();
const createPet = useCreatePet();

await createPet.mutateAsync({
  name: "Max",
  species_id: "uuid",
  breed_id: "uuid"
});
```

## 🎯 Key Features Implemented

### ✅ Complete
- [x] Landing page with refactored hero and nav
- [x] Google OAuth login dialog
- [x] 6-step typeform-style onboarding
- [x] Dashboard with shadcn sidebar
- [x] Protected routes with auth guards
- [x] Pets home page with cards and service table
- [x] User profile management
- [x] Role-based navigation
- [x] Theme toggle (dark/light mode)
- [x] Toast notifications
- [x] Responsive design
- [x] Type-safe API layer
- [x] Comprehensive error handling

### 🚧 Placeholders (Ready for Implementation)
- [ ] Add/Edit Pet page with avatar upload
- [ ] Pet detail page with available services
- [ ] Service request booking flow (4-step dialog)
- [ ] Service request detail/edit page
- [ ] Address book CRUD
- [ ] Adoption center
- [ ] Partner portal (KYC, service requests)
- [ ] Admin portal (full CRUD for all entities)

## 🚀 Next Steps

### High Priority
1. **Add/Edit Pet Page** - Complete pet management with avatar uploads
2. **Service Request Flow** - 4-step dialog (phone, address, datetime, notes)
3. **Address Book** - Full CRUD with pet assignments
4. **Pet Detail Page** - Show available services based on species

### Medium Priority
5. **Partner Portal** - KYC document management, service request handling
6. **Service Request Management** - View, edit, cancel requests
7. **Admin Portal** - Complete admin functionality

### Future Enhancements
8. **Adoption Center** - Browse and adopt pets
9. **Payment Integration** - Billing and invoices
10. **Notifications** - Real-time updates
11. **Chat** - In-app messaging

## 🧪 Development

### Available Scripts

```bash
# Development server
npm run dev

# Type checking
npm run build

# Linting
npm run lint

# Preview production build
npm run preview
```

### Code Quality
- TypeScript strict mode enabled
- ESLint for code linting
- Consistent import patterns
- Type-only imports for types

## 🎨 Design System

### Colors
- Uses Tailwind CSS v4 with custom color scheme
- Dark mode support via `ThemeProvider`
- Status-specific colors (success, warning, error, etc.)

### Components
- Shadcn UI components with New York style
- Custom animations via Motion
- Consistent spacing and padding
- Mobile-first responsive design

## 📝 Environment Variables

Required environment variables:

```env
VITE_SUPABASE_URL=         # Your Supabase project URL
VITE_SUPABASE_ANON_KEY=    # Your Supabase anon key
VITE_API_BASE_URL=         # Backend API URL (default: https://api.marleynme.in)
```

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

Private - Marley 'n' Me

---

Built with ❤️ using React, TypeScript, and Supabase
