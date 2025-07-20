# Lakewood Ranch Dog Training Website

A modern, responsive React website for Lakewood Ranch Dog Training, built with Vite, TailwindCSS, and Material-UI. The site provides information about dog training services, success stories, tips, and integrates with a Strapi CMS for dynamic content management.

## 🎯 Features

- **Responsive Design**: Mobile-first approach with dedicated mobile navigation
- **Dynamic Content**: Strapi CMS integration for hero section and content management
- **Contact Forms**: EmailJS integration for seamless customer communication
- **Success Stories**: Customer testimonials and training success stories
- **Training Programs**: Detailed information about available training services
- **Tips & Articles**: Educational content for dog owners
- **Analytics**: Firebase Analytics integration for user tracking
- **Interactive UI**: Parallax animations and smooth transitions

## 🛠️ Tech Stack

- **Frontend**: React 18 with Vite
- **Styling**: TailwindCSS with custom brand colors
- **UI Components**: Material-UI (@mui/material)
- **Routing**: React Router v6
- **State Management**: React hooks (useState, useEffect)
- **Email Service**: EmailJS for contact forms
- **CMS**: Strapi headless CMS
- **Analytics**: Firebase Analytics
- **Build Tool**: Vite
- **Package Manager**: Yarn

## 📁 Project Structure

```
src/
├── components/           # React components
│   ├── Hero.jsx         # Homepage hero with Strapi integration
│   ├── Contact.jsx      # Contact form with EmailJS
│   ├── Navbar.jsx       # Desktop navigation
│   ├── MobileNav.jsx    # Mobile navigation
│   ├── Programs.jsx     # Training programs display
│   ├── SuccessStories.jsx # Success stories component
│   ├── Testimonials.jsx # Customer testimonials
│   ├── Tips.jsx         # Tips and articles listing
│   ├── WhyUs.jsx        # Why choose us section
│   └── ...              # Other components
├── data/                # Static data files
│   ├── data.json        # General data
│   ├── programs.js      # Training programs data
│   ├── routes.js        # Navigation routes
│   ├── successStories.js # Success stories data
│   ├── testimonials.js  # Customer testimonials
│   └── tipArticles.js   # Tips and articles data
├── App.jsx              # Main app with routing
├── main.jsx             # React entry point
├── configuration.jsx    # Firebase configuration
└── index.css            # Global styles with TailwindCSS
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd dog-training
```

2. Install dependencies:
```bash
yarn install
```

3. Create a `.env` file in the root directory with the following variables:
```env
VITE_APP_FIREBASE_API_KEY=your_firebase_api_key
VITE_APP_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_APP_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_APP_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_APP_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_APP_FIREBASE_APP_ID=your_firebase_app_id
VITE_APP_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id
VITE_APP_STRAPI_API_KEY=your_strapi_api_key
```

4. Start the development server:
```bash
yarn dev
```

The application will be available at `http://localhost:5173`

## 📋 Available Scripts

- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn preview` - Preview production build locally
- `yarn lint` - Run ESLint to check code quality

## 🌐 Routes

- `/` - Homepage with hero, testimonials, success stories, and CTA
- `/about` - About page
- `/programs` - Training programs
- `/tips` - Tips and articles listing
- `/tips/:id` - Individual tip article
- `/success-stories` - All success stories
- `/success-stories/:id` - Individual success story
- `/contact` - Contact form
- `/admin` - Redirects to Strapi admin panel

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

- **Strapi CMS**: `https://natural-melody-8463e9c17b.strapiapp.com/api/`
- **EmailJS**: Contact form email service
- **Firebase**: Analytics tracking

## 📱 Responsive Design

- Mobile-first approach with breakpoint at 768px
- Separate navigation components for mobile and desktop
- Conditional rendering based on screen size
- Optimized layouts for all device sizes

## 🔧 Development Notes

- ESLint configured with React hooks and React refresh plugins
- Custom ESLint rule for unused variables: `varsIgnorePattern: '^[A-Z_]'`
- Parallax animations for enhanced user experience
- ScrollToTop component for proper route navigation
- No test framework currently configured

## 🚀 Deployment

The project includes a `_redirects` file in the public directory for proper routing in production environments (e.g., Netlify).

## 📄 License

This project is private and proprietary to Lakewood Ranch Dog Training.

## 🤝 Contributing

This is a private project. For any modifications or updates, please contact the development team.