import React, { useState } from 'react';
import { cn } from '../../utils/cn';
import Icon from '../AppIcon';

/**
 * SidebarLayout - For pages that need a sidebar layout
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Main content
 * @param {React.ReactNode} props.sidebar - Sidebar content
 * @param {string} props.className - Additional classes for wrapper
 * @param {string} props.sidebarClassName - Additional classes for sidebar
 * @param {string} props.contentClassName - Additional classes for content
 * @param {boolean} props.collapsible - Whether sidebar can be collapsed
 * @param {boolean} props.defaultCollapsed - Whether sidebar starts collapsed
 * @param {string} props.sidebarPosition - "left" or "right"
 * @param {number} props.sidebarWidth - Width in px, defaults to 280
 */
const SidebarLayout = ({
  children,
  sidebar,
  className,
  sidebarClassName,
  contentClassName,
  collapsible = false,
  defaultCollapsed = false,
  sidebarPosition = 'left',
  sidebarWidth = 280,
}) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  const handleToggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div 
      className={cn(
        "flex h-full w-full",
        sidebarPosition === 'right' && "flex-row-reverse",
        className
      )}
    >
      {/* Sidebar */}
      <div
        className={cn(
          "transition-all duration-300 ease-in-out border-border",
          sidebarPosition === 'left' ? "border-r" : "border-l",
          collapsed ? "w-16" : `w-[${sidebarWidth}px]`,
          sidebarClassName
        )}
      >
        {collapsible && (
          <div className="flex justify-end p-2">
            <button
              onClick={handleToggleCollapse}
              className="p-1 rounded-md hover:bg-gray-100 text-gray-500"
            >
              <Icon 
                name={collapsed 
                  ? (sidebarPosition === 'left' ? "ChevronRight" : "ChevronLeft")
                  : (sidebarPosition === 'left' ? "ChevronLeft" : "ChevronRight")
                } 
                size={16} 
              />
            </button>
          </div>
        )}
        
        <div className={cn(
          "h-full",
          collapsed && "overflow-hidden"
        )}>
          {sidebar}
        </div>
      </div>

      {/* Main Content */}
      <div className={cn(
        "flex-1 overflow-auto",
        contentClassName
      )}>
        {children}
      </div>
    </div>
  );
};

export default SidebarLayout;
