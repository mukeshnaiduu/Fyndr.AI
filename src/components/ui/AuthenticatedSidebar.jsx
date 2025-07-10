import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const AuthenticatedSidebar = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication status
    const authStatus = localStorage.getItem('isAuthenticated') === 'true';
    setIsAuthenticated(authStatus);

    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsExpanded(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Don't render sidebar if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  const sidebarItems = [
    {
      section: 'Workspace',
      items: [
        { label: 'Dashboard', path: '/homepage', icon: 'LayoutDashboard', tooltip: 'Main dashboard' },
        { label: 'Profile', path: '/profile-management', icon: 'User', tooltip: 'Manage your profile' },
        { label: 'Notifications', path: '/notifications-center', icon: 'Bell', tooltip: 'View notifications' },
      ]
    },
    {
      section: 'Tools',
      items: [
        { label: 'Video Interview', path: '/video-interview-interface', icon: 'Video', tooltip: 'Start video interview' },
      ]
    },
    {
      section: 'Support',
      items: [
        { label: 'Help & Contact', path: '/about-contact-page', icon: 'HelpCircle', tooltip: 'Get help and support' },
      ]
    }
  ];

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  const handleItemClick = (path) => {
    navigate(path);
    if (isMobile) {
      setIsExpanded(false);
    }
  };

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isExpanded && (
        <div
          className="fixed inset-0 bg-black/50 z-sidebar"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-16 h-[calc(100vh-4rem)] z-sidebar glassmorphic border-r spring-transition ${
          isExpanded ? 'w-64' : 'w-16'
        } ${isMobile && !isExpanded ? '-translate-x-full' : 'translate-x-0'}`}
      >
        {/* Toggle Button */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          {isExpanded && (
            <h2 className="font-heading font-heading-semibold text-foreground tracking-wide">
              Workspace
            </h2>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            iconName={isExpanded ? "ChevronLeft" : "ChevronRight"}
            iconSize={18}
            className="ml-auto"
          />
        </div>

        {/* Navigation Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {sidebarItems.map((section, sectionIndex) => (
            <div key={section.section} className={`stagger-${sectionIndex + 1}`}>
              {isExpanded && (
                <h3 className="text-xs font-caption font-body-medium text-muted-foreground uppercase tracking-wide mb-3">
                  {section.section}
                </h3>
              )}
              <nav className="space-y-1">
                {section.items.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => handleItemClick(item.path)}
                    title={!isExpanded ? item.tooltip : ''}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-squircle spring-transition ripple group ${
                      isActivePath(item.path)
                        ? 'bg-primary text-primary-foreground glow-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <Icon 
                      name={item.icon} 
                      size={20} 
                      className={`flex-shrink-0 ${
                        isActivePath(item.path) ? '' : 'group-hover:scale-110 spring-transition'
                      }`}
                    />
                    {isExpanded && (
                      <span className="font-body font-body-medium tracking-wide truncate">
                        {item.label}
                      </span>
                    )}
                    {isActivePath(item.path) && (
                      <div className="ml-auto w-2 h-2 bg-accent rounded-full animate-pulse" />
                    )}
                  </button>
                ))}
              </nav>
            </div>
          ))}
        </div>

        {/* Footer Section */}
        <div className="p-4 border-t border-border">
          {isExpanded ? (
            <div className="glassmorphic p-3 rounded-squircle">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                  <Icon name="Sparkles" size={16} color="white" />
                </div>
                <div>
                  <p className="text-sm font-body font-body-medium text-foreground">
                    AI Assistant
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Ready to help
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                fullWidth
                iconName="MessageCircle"
                iconPosition="left"
                iconSize={14}
              >
                Chat Now
              </Button>
            </div>
          ) : (
            <button
              title="AI Assistant"
              className="w-full p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-squircle spring-transition ripple"
            >
              <Icon name="Sparkles" size={20} />
            </button>
          )}
        </div>

        {/* Ambient Particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 left-4 w-1 h-1 bg-primary/20 rounded-full particle-float"></div>
          <div className="absolute top-40 right-4 w-1.5 h-1.5 bg-accent/30 rounded-full particle-float" style={{ animationDelay: '3s' }}></div>
          <div className="absolute bottom-20 left-8 w-1 h-1 bg-secondary/25 rounded-full particle-float" style={{ animationDelay: '5s' }}></div>
        </div>
      </aside>

      {/* Mobile Toggle Button */}
      {isMobile && !isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="fixed left-4 top-20 z-sidebar p-2 glassmorphic rounded-squircle text-muted-foreground hover:text-foreground spring-transition ripple glow-primary"
        >
          <Icon name="Menu" size={20} />
        </button>
      )}
    </>
  );
};

export default AuthenticatedSidebar;
