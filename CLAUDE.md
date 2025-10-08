# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
This is a React-based dog training business management system for Flores Dog Training built with Vite, TailwindCSS, and Material-UI. The system includes a public marketing website AND a full client portal with authentication, admin dashboard, and database management. The application serves both public visitors and authenticated users (clients and admins).

## Development Commands

### Core Commands
- `bun dev` - Start development server (Vite)
- `bun build` - Build for production
- `bun preview` - Preview production build locally
- `bun lint` - Run ESLint to check code quality

### Testing
No test framework is configured in this project.

## Architecture

### Tech Stack
- **Frontend**: React 18 with Vite
- **Styling**: TailwindCSS with Material-UI components
- **Routing**: React Router v6
- **State Management**: React Context (AuthContext) + hooks
- **Forms**: React Hook Form with Zod validation
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Authentication**: Supabase Auth
- **Email Service**: Supabase Edge Functions for contact forms
- **SMS**: Twilio for notifications
- **Animations**: Framer Motion
- **Content Management**: Supabase database with dynamic content system
- **Analytics**: Firebase Analytics + Google Analytics Data API
- **Mobile Navigation**: Hamburger React
- **Undo/Redo**: ccundo library

### Project Structure
```
src/
├── components/           # All React components
│   ├── admin/           # Admin-only components
│   │   ├── ClientManagement.jsx    # Client CRUD operations
│   │   ├── ContactSubmissions.jsx  # Contact form management
│   │   ├── MessageComposer.jsx     # Send messages to clients
│   │   └── ...
│   ├── auth/            # Authentication components
│   │   ├── Login.jsx           # Login form
│   │   ├── Signup.jsx          # Registration form
│   │   ├── ProtectedRoute.jsx  # Route protection
│   │   └── ForgotPassword.jsx
│   ├── client/          # Client-only components
│   │   ├── MessageInbox.jsx     # Client message viewing
│   │   └── OnboardingWizard.jsx # New client setup
│   ├── Dashboard.jsx    # Role-based dashboard (admin/client views)
│   ├── Hero.jsx         # Homepage hero (public)
│   ├── Contact.jsx      # Contact form (public)
│   ├── Navbar.jsx       # Navigation with auth integration
│   └── ...              # Other public/shared components
├── contexts/            # React Context providers
│   └── AuthContext.jsx  # Authentication state management
├── hooks/               # Custom React hooks
│   └── useRealtime.js   # Supabase realtime subscriptions
├── lib/                 # Utility libraries
│   ├── supabase.js      # Main Supabase exports (backward compatibility)
│   └── supabase/        # Modular Supabase structure
│       ├── client.js    # Supabase client configuration
│       ├── utils.js     # Error handling and debug utilities
│       ├── auth.js      # Authentication functions
│       ├── users.js     # User and profile management
│       ├── dogs.js      # Dog-related operations
│       ├── sessions.js  # Training sessions
│       ├── messages.js  # Messaging system
│       ├── contacts.js  # Contact submissions and conversions
│       ├── storage.js   # File upload/storage operations
│       ├── website.js   # Website content management
│       └── index.js     # Main export file
├── data/                # Static data files (for public site)
│   ├── data.json        # Testimonials data
│   ├── programs.js      # Training programs
│   └── routes.js        # Navigation routes
├── App.jsx              # Main app with routing and auth
├── main.jsx             # React entry point with providers
└── configuration.jsx    # Firebase configuration
```

### Key Architecture Patterns

#### Authentication & Authorization
- **Context-based Auth**: `AuthContext` provides global authentication state
- **Role-based Access**: Two roles - 'admin' and 'client' with different capabilities
- **Protected Routes**: `ProtectedRoute` component guards authenticated areas
- **Row Level Security**: Database-level access control in Supabase

#### Component Organization
- **Role-based Structure**: Components organized by user role (admin/, client/, auth/)
- **Shared Components**: Public marketing components at root level
- **Single Dashboard**: `Dashboard.jsx` renders different views based on user role
- **Context Integration**: Components use `useAuth()` hook for authentication state

#### Data Management
- **Supabase Integration**: Primary database with comprehensive schema
- **Modular Structure**: `src/lib/supabase/` contains specialized modules for different data operations
- **Helper Functions**: Each module provides focused database operation helpers
- **Realtime Updates**: `useRealtime.js` hook for live data subscriptions
- **Static Marketing Data**: JSON files in `/src/data/` for public content
- **Forms**: Supabase Edge Functions for all forms (contact and authenticated)
- **Backward Compatibility**: `src/lib/supabase.js` re-exports everything for existing code

#### Database Schema (PostgreSQL/Supabase)
- **Core Tables**: users, profiles, dogs, sessions, messages, contact_submissions
- **Business Logic**: referrals, payments, discount_codes, system_settings
- **Analytics**: training_analytics with automatic calculations
- **Views**: dogs_with_owners, session_analytics for complex queries
- **Content Management**: website_sections, website_content, website_content_fields
- **Notes System**: client_notes with categorization and importance flags

#### Routing Structure
**Public Routes:**
- `/` - Homepage with Hero, Testimonials, Success Stories
- `/about`, `/programs`, `/tips`, `/contact` - Marketing pages
- `/login`, `/signup`, `/forgot-password` - Authentication

**Protected Routes (Client):**
- `/dashboard` - Client dashboard with dogs and messages
- `/messages` - Message inbox
- `/sessions` - Training session history
- `/onboarding` - New client setup wizard
- `/referrals` - Referral program with codes

**Protected Routes (Admin):**
- `/dashboard` - Admin dashboard with business metrics
- `/admin/clients` - Client management (includes referral codes)
- `/admin/contact-submissions` - Lead management
- `/admin/messages` - Message composer and templates
- `/admin/sessions` - Session scheduling and management

#### Responsive Design
- Mobile-first approach with breakpoint at 768px
- Separate MobileNav and Navbar components
- Conditional rendering based on screen size

## Environment Variables
Required environment variables (stored in `.env` or `.env.local`):

### Supabase Configuration
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key for client access
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for admin operations

### Firebase Configuration
- `VITE_APP_FIREBASE_API_KEY` - Firebase config (analytics)
- `VITE_APP_FIREBASE_AUTH_DOMAIN`
- `VITE_APP_FIREBASE_PROJECT_ID`
- `VITE_APP_STORAGE_BUCKET`
- `VITE_APP_MESSAGING_SENDER_ID`
- `VITE_APP_FIREBASE_APP_ID`
- `VITE_APP_FIREBASE_MEASUREMENT_ID`

### Google Analytics Data API
- `GA4_PROPERTY_ID` - Google Analytics 4 property ID
- `GOOGLE_APPLICATION_CREDENTIALS` - Path to service account JSON
- `GOOGLE_SERVICE_ACCOUNT_KEY` - Inline service account key (deployment)

### Firebase Functions
- `VITE_ANALYTICS_FUNCTION_URL` - Analytics data function endpoint
- `VITE_REALTIME_FUNCTION_URL` - Realtime users function endpoint

### Twilio SMS (Optional)
- `VITE_TWILIO_ACCOUNT_SID` - Twilio account SID
- `VITE_TWILIO_AUTH_TOKEN` - Twilio auth token
- `VITE_TWILIO_PHONE_NUMBER` - Twilio phone number

### Legacy (No Longer Used)
- `VITE_APP_STRAPI_API_KEY` - Strapi integration (fully migrated to Supabase)

## External Integrations
- **Supabase**: Complete backend solution - database, authentication, file storage, and content management
- **Supabase Edge Functions**: Contact form processing and email handling
- **Firebase**: Analytics tracking and cloud functions
- **Google Analytics Data API**: Real analytics data retrieval
- **Twilio**: SMS notifications for client updates
- **Firebase Functions**: Server-side analytics data processing

## Development Notes
- Uses Bun for package management
- ESLint configured with React hooks and React refresh plugins
- Custom ESLint rule for unused variables: `varsIgnorePattern: '^[A-Z_]'`
- TailwindCSS with custom brand colors (blue and teal variants)
- Supabase Row Level Security policies enforce data access rules
- Database triggers automatically update training analytics
- Parallax animations on public homepage
- ScrollToTop component for route navigation

## Key Development Patterns

### Database Operations
- Use helper functions from `src/lib/supabase/` modules for organized, focused operations
- Import specific modules: `import { users } from 'src/lib/supabase/users.js'`
- Or use the main export: `import { db } from 'src/lib/supabase.js'` (backward compatible)
- All database operations include proper error handling and retry logic
- Row Level Security automatically filters data by user permissions
- Real-time subscriptions available through `useRealtime.js` hook

### Authentication Flow
- AuthContext provides authentication state across the app
- Protected routes automatically redirect unauthenticated users
- Role-based rendering using `isAdmin()` helper function
- User profiles created automatically via database triggers

### State Management
- Global auth state managed by AuthContext
- Local component state for form data and UI interactions
- Database state synced via Supabase real-time subscriptions
- No external state management library (Redux, Zustand) used

### Form Handling
- React Hook Form for form state management
- Zod schemas for validation
- Error handling integrated with form components
- Consistent validation patterns across all forms

### Referral System
- Database-driven referral codes (not links)
- Codes displayed prominently for clients on `/referrals` page
- Admin access to all client referral codes in client management
- Copy-to-clipboard functionality for easy sharing

### Analytics Integration
- Firebase Analytics for basic tracking
- Google Analytics Data API for real analytics insights
- Firebase Functions process analytics data server-side
- Real-time visitor tracking available

### Content Management
- **Fully Supabase-based**: All content managed through Supabase database
- **Hybrid approach**: Static JSON files for basic data + dynamic Supabase content for complex sections
- **SEO components**: Meta tag management through database
- **Website sections**: Fully configurable through `website_sections`, `website_content`, and `website_content_fields` tables
- **Rich text editing**: Built-in capabilities for dynamic content management
- **Migration Complete**: Fully moved from Strapi CMS to Supabase content system