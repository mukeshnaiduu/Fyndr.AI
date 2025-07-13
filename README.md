# Fyndr.AI - Unified Platform

## About the Project

Fyndr.AI is a comprehensive hiring and job search platform that leverages artificial intelligence to connect employers with the best talent and help job seekers find the perfect opportunities. This repository is a unified merge of four separate modules (A, B, C, and D) into a single cohesive application.

## Features

### For Job Seekers

- AI-powered job feed dashboard
- Resume builder with AI assistance
- Interview practice video sessions
- Job seeker onboarding wizard
- Job detail view
- Job search and application hub
- AI Career Coach Chat Interface
- Course Detail & Learning Interface
- Mentorship Platform
- Resource Library
- Alumni Network & Referrals
- Virtual Career Fair
- Hackathons & Competitions

### For Employers and Recruiters

- Team management dashboard
- Recruiter/employer onboarding wizard
- Recruiter dashboard with pipeline management
- Candidate Profile Evaluation Interface
- Video Interview Interface
- Admin Dashboard & System Management
- Candidate profile evaluation interface

### Learning and Development

- Course detail learning interface
- AI career coach chat interface
- Resource library

### Community Features

- Mentorship platform
- Alumni network referrals
- Virtual career fair
- Hackathons and competitions

### General Features

- User profile management
- Authentication (login/register)
- About/contact pages
- Notifications center

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository

```
git clone https://github.com/yourusername/fyndr_ai-final.git
```

2. Navigate to the project directory

```
cd fyndr_ai-final
```

3. Install dependencies

```
npm install
```

or

```
yarn
```

4. Start the development server

```
npm run start
```

or

```
yarn start
```

The application will be available at `http://localhost:4028`.

## Building for Production

To create a production build, run:

```
npm run build
```

or

```
yarn build
```

The output will be in the `build` directory.

## Technologies Used

- React.js
- Tailwind CSS
- Vite
- Framer Motion
- Redux Toolkit
- React Router
- Axios
- Recharts

## Project Structure

```
fyndr_ai-final/
├── public/                    # Static assets
├── src/
│   ├── components/            # Shared components
│   │   ├── ui/                # UI components
│   │   ├── AppIcon.jsx        # Icon component
│   │   ├── AppImage.jsx       # Image component
│   │   ├── ErrorBoundary.jsx  # Error handling
│   │   └── ScrollToTop.jsx    # Navigation utility
│   ├── pages/                 # All page components
│   │   ├── [page-name]/       # Page-specific components
│   │   │   ├── index.jsx      # Main page component
│   │   │   └── components/    # Page-specific components
│   │   └── NotFound.jsx       # 404 page
│   ├── styles/                # Global styles
│   │   ├── index.css          # Custom styles
│   │   └── tailwind.css       # Tailwind imports
│   ├── utils/                 # Utility functions
│   │   └── cn.js              # Class name utility
│   ├── App.jsx                # Main app component
│   ├── index.jsx              # Entry point
│   └── Routes.jsx             # Application routes
├── index.html                 # HTML template
├── jsconfig.json              # JavaScript config
├── package.json               # Dependencies
├── postcss.config.js          # PostCSS config
├── tailwind.config.js         # Tailwind config
└── vite.config.mjs            # Vite config
```

## Import Paths

This project uses path aliases for cleaner imports. Instead of relative paths, use:

```jsx
// Instead of
import Button from "../../components/ui/Button";

// Use
import Button from "components/ui/Button";
```

The following aliases are available:

- `components` - points to `./src/components`
- `pages` - points to `./src/pages`
- `styles` - points to `./src/styles`
- `utils` - points to `./src/utils`

## Merge Notes

This repository is the result of merging four separate repositories:

    - fyndr_ai-A-main
    - fyndr_ai-B-main
    - fyndr_ai-C-main
    - fyndr_ai-D-main

All components, pages, styles, and utilities have been consolidated into a single cohesive application while maintaining functionality.

- `/src`: Source code
  - `/components`: Reusable UI components
  - `/pages`: Application pages and features
  - `/styles`: CSS and styling
  - `/utils`: Utility functions

## License

This project is licensed under the MIT License.
made by RiceMill
