# Guide to Updating Pages for Integration

This guide provides step-by-step instructions for updating pages to use the unified layout components. Following these steps will ensure all pages across the four repositories integrate seamlessly.

## Layout Components Available

### 1. MainLayout

Use this for standard pages that need a navbar, main content area, and optional footer.

```jsx
import MainLayout from "components/layout/MainLayout";

const YourPage = () => {
  return (
    <MainLayout title="Your Page Title" description="Meta description for SEO">
      <div>Your page content here</div>
    </MainLayout>
  );
};
```

### 2. SidebarLayout

Use this for pages that require a sidebar (like dashboards, chat interfaces, etc.).

```jsx
import MainLayout from "components/layout/MainLayout";
import SidebarLayout from "components/layout/SidebarLayout";

const YourDashboardPage = () => {
  return (
    <MainLayout title="Dashboard" noPadding>
      <SidebarLayout sidebar={<YourSidebarContent />} collapsible>
        <div className="p-6">Your main content here</div>
      </SidebarLayout>
    </MainLayout>
  );
};
```

## Converting Pages

### Example: Converting a Basic Page

**Before:**

```jsx
import React from "react";
import { Helmet } from "react-helmet";
import Header from "components/ui/Header";
import Footer from "components/ui/Footer";

const SomePage = () => {
  return (
    <>
      <Helmet>
        <title>Page Title - Fyndr.AI</title>
      </Helmet>
      <Header />
      <div className="container mx-auto py-8">{/* Content */}</div>
      <Footer />
    </>
  );
};
```

**After:**

```jsx
import React from "react";
import MainLayout from "components/layout/MainLayout";

const SomePage = () => {
  return (
    <MainLayout title="Page Title" description="Page description for SEO">
      <div>{/* Content */}</div>
    </MainLayout>
  );
};
```

### Example: Converting a Dashboard Page

**Before:**

```jsx
import React from "react";
import { Helmet } from "react-helmet";
import Header from "components/ui/Header";
import Sidebar from "./components/Sidebar";

const Dashboard = () => {
  return (
    <>
      <Helmet>
        <title>Dashboard - Fyndr.AI</title>
      </Helmet>
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">{/* Dashboard content */}</main>
      </div>
    </>
  );
};
```

**After:**

```jsx
import React from "react";
import MainLayout from "components/layout/MainLayout";
import SidebarLayout from "components/layout/SidebarLayout";
import Sidebar from "./components/Sidebar";

const Dashboard = () => {
  return (
    <MainLayout title="Dashboard" noPadding>
      <SidebarLayout sidebar={<Sidebar />} collapsible>
        <div className="p-6">{/* Dashboard content */}</div>
      </SidebarLayout>
    </MainLayout>
  );
};
```

## Dark Mode Support

The integrated application now supports dark mode using the ThemeProvider. Components will automatically respect the user's theme preference.

For custom styling with dark mode support, use:

```css
.some-element {
  background-color: white;
  color: black;
}

.dark .some-element {
  background-color: #1e1e2e;
  color: white;
}
```

Or with Tailwind:

```jsx
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  Dark mode compatible content
</div>
```

## Using Centralized Routes

Import routes from the routes.js utility:

```jsx
import { ROUTES_A, ROUTES_B, getRoute } from 'utils/routes';

// In your component
<Link to={ROUTES_A.PROFILE}>Profile</Link>
<Link to={getRoute('CAREER_COACH')}>AI Career Coach</Link>
```

## Next Steps

1. Convert one page at a time, starting with the most frequently used ones
2. Test each page after conversion to ensure it functions correctly
3. Pay special attention to any unique layout requirements or styles
4. Use the centralized routes whenever possible for consistency
