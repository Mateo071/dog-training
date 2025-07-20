# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
This is a React-based dog training website for Lakewood Ranch Dog Training built with Vite, TailwindCSS, and Material-UI. The site includes service pages, contact forms, testimonials, and integrates with Strapi CMS for content management.

## Development Commands

### Core Commands
- `yarn dev` - Start development server (Vite)
- `yarn build` - Build for production
- `yarn preview` - Preview production build locally
- `yarn lint` - Run ESLint to check code quality

### Testing
No test framework is configured in this project.

## Architecture

### Tech Stack
- **Frontend**: React 18 with Vite
- **Styling**: TailwindCSS with Material-UI components
- **Routing**: React Router v6
- **State Management**: React hooks (useState, useEffect)
- **Email Service**: EmailJS for contact forms
- **CMS**: Strapi headless CMS
- **Analytics**: Firebase Analytics

### Project Structure
```
src/
├── components/           # All React components
│   ├── Hero.jsx         # Homepage hero section with Strapi integration
│   ├── Contact.jsx      # Contact form with EmailJS
│   ├── Navbar.jsx       # Desktop navigation
│   ├── MobileNav.jsx    # Mobile navigation
│   └── ...              # Other feature components
├── data/                # Static data files
│   ├── data.json        # Testimonials data
│   ├── programs.js      # Training programs
│   ├── routes.js        # Navigation routes
│   └── ...              # Other data files
├── App.jsx              # Main app component with routing
├── main.jsx             # React entry point
├── configuration.jsx    # Firebase configuration
└── index.css            # Global styles
```

### Key Architecture Patterns

#### Component Organization
- All components are in `/src/components/`
- Static data is centralized in `/src/data/`
- Each component is self-contained with its own state management
- Mobile-first responsive design using TailwindCSS

#### Data Management
- **Static Data**: JSON files in `/src/data/` for testimonials, programs, etc.
- **Dynamic Content**: Strapi CMS integration for Hero section content
- **Forms**: EmailJS for contact form submissions
- **Environment Variables**: Vite environment variables for API keys

#### Routing Structure
- `/` - Homepage with Hero, Testimonials, Success Stories, CTA, WhyUs
- `/about` - About page
- `/programs` - Training programs
- `/tips` - Tips listing
- `/tips/:id` - Individual tip article
- `/success-stories` - All success stories
- `/success-stories/:id` - Individual success story
- `/contact` - Contact form
- `/admin` - Redirects to Strapi admin panel

#### Responsive Design
- Mobile-first approach with breakpoint at 768px
- Separate MobileNav and Navbar components
- Conditional rendering based on screen size

## Environment Variables
Required environment variables (stored in `.env`):
- `VITE_APP_FIREBASE_API_KEY`
- `VITE_APP_FIREBASE_AUTH_DOMAIN`
- `VITE_APP_FIREBASE_PROJECT_ID`
- `VITE_APP_STORAGE_BUCKET`
- `VITE_APP_MESSAGING_SENDER_ID`
- `VITE_APP_FIREBASE_APP_ID`
- `VITE_APP_FIREBASE_MEASUREMENT_ID`
- `VITE_APP_STRAPI_API_KEY`

## External Integrations
- **Strapi CMS**: `https://natural-melody-8463e9c17b.strapiapp.com/api/`
- **EmailJS**: Contact form email service
- **Firebase**: Analytics tracking

## Development Notes
- Uses Yarn for package management
- ESLint configured with React hooks and React refresh plugins
- Custom ESLint rule for unused variables: `varsIgnorePattern: '^[A-Z_]'`
- TailwindCSS with custom brand colors (blue and teal variants)
- Parallax shapes animation on homepage
- ScrollToTop component for route navigation