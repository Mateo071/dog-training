# Flores Dog Training Business Management System

[![Netlify Status](https://api.netlify.com/api/v1/badges/adb741f2-87ed-421c-8c6b-4d6e8d82df48/deploy-status)](https://app.netlify.com/projects/floresdogtraining/deploys)

A comprehensive React-based business management platform for Flores Dog Training, featuring both a public marketing website and a complete client portal with authentication, admin dashboard, and database management. Built with Vite, TailwindCSS, Material-UI, and Supabase as the complete backend solution.

## 🚀 Technologies

![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6.2.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4.1-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Material-UI](https://img.shields.io/badge/Material--UI-5.15.7-007FFF?style=for-the-badge&logo=mui&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-2.52.1-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-12.2.1-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![React Router](https://img.shields.io/badge/React_Router-6.22.0-CA4245?style=for-the-badge&logo=react-router&logoColor=white)
![React Hook Form](https://img.shields.io/badge/React_Hook_Form-7.61.1-EC5990?style=for-the-badge&logo=reacthookform&logoColor=white)
![Zod](https://img.shields.io/badge/Zod-4.0.10-3E67B1?style=for-the-badge&logo=zod&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-12.5.0-0055FF?style=for-the-badge&logo=framer&logoColor=white)
![Twilio](https://img.shields.io/badge/Twilio-5.8.0-F22F46?style=for-the-badge&logo=twilio&logoColor=white)
![Google Analytics](https://img.shields.io/badge/Google_Analytics-159.0.0-E37400?style=for-the-badge&logo=google-analytics&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint-9.21.0-4B32C3?style=for-the-badge&logo=eslint&logoColor=white)
![Bun](https://img.shields.io/badge/Bun-Package_Manager-000000?style=for-the-badge&logo=bun&logoColor=white)

## 📋 Table of Contents

- [🚀 Technologies](#-technologies)
- [🎯 Features](#-features)
  - [🌐 Public Marketing Website](#-public-marketing-website)
  - [🔐 Authentication System](#-authentication-system)
  - [👥 Client Portal](#-client-portal)
  - [👨‍💼 Admin Dashboard](#️-admin-dashboard)
  - [📊 Analytics & Insights](#-analytics--insights)
  - [🔧 Advanced Features](#-advanced-features)
- [🛠️ Tech Stack](#️-tech-stack)
  - [Frontend](#frontend)
  - [Backend & Database](#backend--database)
  - [External Services](#external-services)
  - [Development Tools](#development-tools)
- [📁 Project Structure](#-project-structure)
- [🚀 Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [📋 Available Scripts](#-available-scripts)
- [🌐 Routes](#-routes)
  - [Public Routes](#public-routes)
  - [Authentication Routes](#authentication-routes)
  - [Client Portal (Protected)](#client-portal-protected)
  - [Admin Portal (Protected)](#admin-portal-protected)
- [🎨 Styling](#-styling)
- [🔗 External Integrations](#-external-integrations)
- [📱 Responsive Design](#-responsive-design)
- [🔧 Development Notes](#-development-notes)
- [🚀 Deployment](#-deployment)
- [📄 License](#-license)
- [🤝 Contributing](#-contributing)

## 🎯 Features

### 🌐 Public Marketing Website
- **Responsive Design**: Mobile-first approach with dedicated mobile navigation
- **SEO Optimized**: Dynamic meta tags and structured content for search engines
- **Dynamic Content**: Supabase-powered content management system
- **Contact Forms**: Supabase Edge Functions for customer communication
- **Success Stories**: Customer testimonials and training success stories
- **Training Programs**: Detailed information about available training services
- **Tips & Articles**: Educational content for dog owners
- **Interactive UI**: Parallax animations and smooth transitions

### 🔐 Authentication System
- **Secure Login/Signup**: Supabase Auth with email verification
- **Role-Based Access**: Admin and client roles with different permissions
- **Protected Routes**: Route guards for authenticated areas
- **Password Recovery**: Forgot password functionality
- **Profile Management**: User profile creation and editing

### 👥 Client Portal
- **Client Dashboard**: Personalized dashboard for dog owners
- **Dog Management**: Add, edit, and manage multiple dogs
- **Session History**: View past and upcoming training sessions
- **Message Inbox**: Receive and view messages from trainers
- **Referral Program**: Generate and share referral codes for rewards
- **Onboarding Wizard**: Guided setup for new clients

### 👨‍💼 Admin Dashboard
- **Business Analytics**: Real-time dashboard with key metrics
- **Client Management**: Complete CRUD operations for client profiles
- **Contact Submissions**: Lead management from website inquiries
- **Message System**: Send messages to clients with templates
- **Session Management**: Schedule and track training sessions
- **Referral Tracking**: View and manage client referral codes
- **Content Management**: Edit website content dynamically

### 📊 Analytics & Insights
- **Firebase Analytics**: Basic user tracking and engagement
- **Google Analytics Data API**: Real analytics insights and reporting
- **Real-time Visitor Tracking**: Live user activity monitoring
- **Business Metrics**: Training analytics and client progress tracking
- **Chart Visualizations**: Interactive charts for data analysis

### 🔧 Advanced Features
- **Real-time Updates**: Live data synchronization across all users
- **File Upload**: Supabase storage for profile pictures and documents
- **SMS Notifications**: Twilio integration for client updates
- **Rich Text Editing**: Advanced text editor for content creation
- **Undo/Redo**: Action history with ccundo integration
- **Form Validation**: Zod schemas with React Hook Form

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: TailwindCSS with custom brand colors
- **UI Components**: Material-UI (@mui/material)
- **Routing**: React Router v6
- **State Management**: React Context + hooks
- **Forms**: React Hook Form with Zod validation
- **Animations**: Framer Motion
- **Mobile Navigation**: Hamburger React
- **Undo/Redo**: ccundo library

### Backend & Database
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Authentication**: Supabase Auth
- **Real-time**: Supabase real-time subscriptions
- **File Storage**: Supabase Storage
- **Edge Functions**: Supabase Edge Functions for email processing

### External Services
- **Analytics**: Firebase Analytics + Google Analytics Data API
- **SMS**: Twilio for notifications
- **Cloud Functions**: Firebase Functions for server-side analytics
- **SEO**: Dynamic meta tag management

### Development Tools
- **Build Tool**: Vite
- **Package Manager**: Bun
- **Linting**: ESLint with React hooks and refresh plugins
- **Version Control**: Git with Husky pre-commit hooks

## 📁 Project Structure

```
src/
├── components/           # All React components
│   ├── admin/           # Admin-only components
│   │   ├── ClientManagement.jsx    # Client CRUD operations
│   │   ├── ContactSubmissions.jsx  # Contact form management
│   │   ├── MessageComposer.jsx     # Send messages to clients
│   │   └── ...          # Other admin components
│   ├── auth/            # Authentication components
│   │   ├── Login.jsx           # Login form
│   │   ├── Signup.jsx          # Registration form
│   │   ├── ProtectedRoute.jsx  # Route protection
│   │   └── ForgotPassword.jsx
│   ├── client/          # Client-only components
│   │   ├── MessageInbox.jsx     # Client message viewing
│   │   ├── OnboardingWizard.jsx # New client setup
│   │   ├── ReferralProgram.jsx  # Referral code management
│   │   └── PaymentCheckout.jsx  # Payment processing
│   ├── charts/          # Data visualization components
│   │   ├── AnalyticsChart.jsx   # Business metrics charts
│   │   └── SessionChart.jsx     # Session analytics
│   ├── Dashboard.jsx    # Role-based dashboard (admin/client views)
│   ├── Hero.jsx         # Homepage hero (public)
│   ├── Contact.jsx      # Contact form (public)
│   ├── Navbar.jsx       # Navigation with auth integration
│   ├── SEO.jsx          # SEO meta tag management
│   ├── RichTextEditor.jsx # Content editing
│   ├── Alert.jsx        # Notification component
│   ├── Programs.jsx     # Training programs display
│   ├── SuccessStories.jsx # Success stories component
│   ├── Testimonials.jsx # Customer testimonials
│   └── Tips.jsx         # Tips and articles listing
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
│       ├── contacts.js  # Contact submissions
│       ├── storage.js   # File upload/storage
│       ├── website.js   # Website content management
│       └── index.js     # Main export file
├── data/                # Static data files (for public site)
│   ├── programs.js      # Training programs
│   ├── routes.js        # Navigation routes
│   └── seoContent.js    # SEO metadata
├── App.jsx              # Main app with routing and auth
├── main.jsx             # React entry point with providers
├── configuration.jsx    # Firebase configuration
└── index.css            # Global styles with TailwindCSS

# Root level files
├── package.json         # Dependencies and scripts
├── vite.config.js       # Vite configuration
├── tailwind.config.js   # TailwindCSS configuration
├── eslint.config.js     # ESLint configuration
├── firebase.json        # Firebase hosting configuration
├── .env.example         # Environment variables template
├── database/
│   └── schema.sql       # Complete database schema
├── functions/           # Firebase Functions
│   └── index.js         # Analytics processing functions
└── public/
    ├── _redirects       # SPA routing rules
    ├── robots.txt       # SEO robots file
    └── sitemap.xml      # SEO sitemap
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Bun package manager ([install here](https://bun.sh))

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd dog-training
```

2. Install dependencies:
```bash
bun install
```

3. Create a `.env` file in the root directory with the following variables:
```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Firebase Configuration
VITE_APP_FIREBASE_API_KEY=your_firebase_api_key
VITE_APP_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_APP_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_APP_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_APP_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_APP_FIREBASE_APP_ID=your_firebase_app_id
VITE_APP_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id

# Google Analytics Data API (Optional)
GA4_PROPERTY_ID=your_ga4_property_id
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account"...}

# Firebase Functions (Optional)
VITE_ANALYTICS_FUNCTION_URL=your_analytics_function_url
VITE_REALTIME_FUNCTION_URL=your_realtime_function_url

# Twilio SMS (Optional)
VITE_TWILIO_ACCOUNT_SID=your_twilio_account_sid
VITE_TWILIO_AUTH_TOKEN=your_twilio_auth_token
VITE_TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

4. Start the development server:
```bash
bun dev
```

The application will be available at `http://localhost:5173`

## 📋 Available Scripts

- `bun dev` - Start development server
- `bun build` - Build for production
- `bun preview` - Preview production build locally
- `bun lint` - Run ESLint to check code quality

## 🌐 Routes

### Public Routes
- `/` - Homepage with hero, testimonials, success stories
- `/about` - About page and company information
- `/programs` - Training programs and services
- `/tips` - Tips and articles listing
- `/tips/:id` - Individual tip article
- `/success-stories` - All success stories
- `/success-stories/:id` - Individual success story
- `/contact` - Contact form for inquiries

### Authentication Routes
- `/login` - User login page
- `/signup` - User registration (invitation-only)
- `/forgot-password` - Password recovery

### Client Portal (Protected)
- `/dashboard` - Client dashboard with dogs and overview
- `/messages` - Message inbox from trainers
- `/sessions` - Training session history and upcoming sessions
- `/onboarding` - New client setup wizard
- `/referrals` - Referral program with personal codes

### Admin Portal (Protected)
- `/dashboard` - Admin dashboard with business analytics
- `/admin/clients` - Client management and profiles
- `/admin/contact-submissions` - Lead management from website
- `/admin/messages` - Message composer and templates
- `/admin/sessions` - Session scheduling and management

## 🎨 Styling

The project uses TailwindCSS with custom brand colors:

```css
colors: {
  'brand': {
    blue: '#2563eb',
    'blue-light': '#3b82f6',
    'blue-dark': '#1d4ed8',
    teal: '#0d9488',
    'teal-light': '#14b8a6',
    'teal-dark': '#0f766e',
  }
}
```

## 🔗 External Integrations

- **Supabase**: Complete backend solution - database, authentication, storage, and content management
- **Supabase Edge Functions**: Contact form processing and email handling
- **Firebase**: Analytics tracking and cloud functions for server-side processing
- **Google Analytics Data API**: Real analytics insights and reporting
- **Twilio**: SMS notifications for client updates
- **Firebase Functions**: Server-side analytics data processing

## 📱 Responsive Design

- Mobile-first approach with breakpoint at 768px
- Separate navigation components for mobile and desktop
- Conditional rendering based on screen size
- Optimized layouts for all device sizes

## 🔧 Development Notes

- **ESLint**: Configured with React hooks and React refresh plugins
- **Custom ESLint rule**: Unused variables pattern `varsIgnorePattern: '^[A-Z_]'`
- **Animations**: Parallax animations and Framer Motion for enhanced UX
- **Navigation**: ScrollToTop component for proper route navigation
- **Real-time**: Supabase real-time subscriptions for live updates
- **Security**: Row Level Security policies enforce data access rules
- **Database**: Triggers automatically update training analytics
- **Testing**: No test framework currently configured
- **Migration**: Fully migrated from Strapi CMS to Supabase content system
- **SEO**: Dynamic meta tags and structured content for search optimization

## 🚀 Deployment

### Firebase Hosting (Current)
The application is deployed using Firebase Hosting with:
- **Custom domain**: Configured for production use
- **Redirects**: Proper SPA routing with `_redirects` file
- **Firebase Functions**: Server-side analytics processing
- **Environment variables**: Production environment configuration

### Database
- **Supabase**: Production PostgreSQL database with Row Level Security
- **Migrations**: Database schema managed through SQL files
- **Backups**: Automated through Supabase

### Content Delivery
- **Static Assets**: Served through Firebase CDN
- **Images**: Supabase Storage for user uploads
- **SEO**: Server-side rendering for meta tags

### Monitoring
- **Firebase Analytics**: Production traffic tracking
- **Google Analytics**: Business insights and reporting
- **Error Tracking**: Built-in error handling and logging

Deployment configuration files:
- `firebase.json` - Firebase hosting configuration
- `_redirects` - SPA routing rules
- Database migrations in `/database/` directory

## 📄 License

This project is private and proprietary to Flores Dog Training.

## 🤝 Contributing

This is a private project. For any modifications or updates, please contact the development team.