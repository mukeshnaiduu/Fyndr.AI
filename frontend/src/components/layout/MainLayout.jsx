import React from 'react';
import { Helmet } from 'react-helmet';
import Footer from 'components/ui/Footer';
import { cn } from '../../utils/cn';
import ChatbotWidget from 'components/ChatbotWidget';

/**
 * MainLayout - Global layout component for all pages
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Page content
 * @param {string} props.title - Page title
 * @param {string} props.description - Page meta description
 * @param {string} props.className - Additional classes for the main content area
 * @param {string} props.containerClassName - Additional classes for the container
 * @param {boolean} props.fullWidth - Whether to use full width layout
 * @param {boolean} props.noPadding - Whether to remove default padding
 * @param {boolean} props.hideFooter - Whether to hide the footer
 * @param {string} props.ogTitle - Open Graph title
 * @param {string} props.ogDescription - Open Graph description
 * @param {string} props.canonicalPath - Canonical URL path
 */
const MainLayout = ({
  children,
  title,
  description,
  className,
  containerClassName,
  fullWidth = false,
  noPadding = false,
  hideFooter = false,
  hideFloatingChat = false,
  ogTitle,
  ogDescription,
  canonicalPath
}) => {
  return (
    <>
      {/* Meta tags */}
      {(title || description || ogTitle || ogDescription || canonicalPath) && (
        <Helmet>
          {title && <title>{title} - Fyndr.AI</title>}
          {description && <meta name="description" content={description} />}
          {ogTitle && <meta property="og:title" content={ogTitle} />}
          {ogDescription && <meta property="og:description" content={ogDescription} />}
          {canonicalPath && <link rel="canonical" href={canonicalPath} />}
        </Helmet>
      )}

      <div className="min-h-screen bg-background flex flex-col">
        {/* Main content area */}
        <div className={cn(
          "flex-grow w-full",
          !noPadding && "px-4 py-6 sm:px-6 lg:px-8",
          className
        )}>
          <div className={cn(
            !fullWidth && "max-w-7xl mx-auto",
            containerClassName
          )}>
            {children}
          </div>
          {/* Global floating chatbot */}
          {!hideFloatingChat && <ChatbotWidget />}
        </div>

        {/* Footer */}
        {!hideFooter && <Footer />}
      </div>
    </>
  );
};

export default MainLayout;
