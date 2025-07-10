import React from 'react';
import { cn } from '../../utils/cn';

// PageLayout provides consistent padding and max-width for pages
// with optional customization for specific pages
const PageLayout = ({ 
  children,
  className,
  fullWidth = false,
  noPadding = false,
  containerClassName = ""
}) => {
  return (
    <div 
      className={cn(
        "min-h-[calc(100vh-4rem)]", // Account for navbar height
        !noPadding && "px-4 py-6 sm:px-6 sm:py-8 lg:py-10",
        className
      )}
    >
      <div 
        className={cn(
          !fullWidth && "max-w-7xl mx-auto",
          containerClassName
        )}
      >
        {children}
      </div>
    </div>
  );
};

export default PageLayout;
