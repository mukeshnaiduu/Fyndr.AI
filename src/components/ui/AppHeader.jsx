import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const AppHeader = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication status from localStorage or context
    const authStatus = localStorage.getItem('isAuthenticated') === 'true';
    setIsAuthenticated(authStatus);
  }, []);

  const handleLogoClick = () => {
    if (isAuthenticated) {
      navigate('/homepage'); // Dashboard for authenticated users
    } else {
      navigate('/homepage'); // Homepage for public users
    }
  };

  const handleAuthClick = () => {
    if (isAuthenticated) {
      localStorage.removeItem('isAuthenticated');
      setIsAuthenticated(false);
      navigate('/homepage');
    } else {
      navigate('/authentication-login-register');
    }
  };

  const handleNotificationClick = () => {
    navigate('/notifications-center');
  };

  const handleProfileClick = () => {
    navigate('/profile-management');
  };

  const publicNavItems = [
    { label: 'Home', path: '/homepage', icon: 'Home' },
    { label: 'About', path: '/about-contact-page', icon: 'Info' },
  ];

  const authenticatedNavItems = [
    { label: 'Dashboard', path: '/homepage', icon: 'LayoutDashboard' },
    { label: 'Interview', path: '/video-interview-interface', icon: 'Video' },
  ];

  const currentNavItems = isAuthenticated ? authenticatedNavItems : publicNavItems;

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-header glassmorphic border-b spring-transition">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center">
            <button
              onClick={handleLogoClick}
              className="flex items-center space-x-3 hover:opacity-80 spring-transition"
            >
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-squircle flex items-center justify-center glow-primary">
                  <Icon name="Zap" size={24} color="white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-pulse"></div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-heading font-heading-bold text-foreground tracking-wide">
                  HireHub AI
                </h1>
                <p className="text-xs text-muted-foreground font-caption">
                  Intelligent Hiring Platform
                </p>
              </div>
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {currentNavItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-squircle spring-transition ripple ${
                  isActivePath(item.path)
                    ? 'bg-primary text-primary-foreground glow-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Icon name={item.icon} size={18} />
                <span className="font-body font-body-medium tracking-wide">
                  {item.label}
                </span>
              </button>
            ))}
          </nav>

          {/* Right Section */}
          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                {/* Notification Button */}
                <button
                  onClick={handleNotificationClick}
                  className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-squircle spring-transition ripple"
                >
                  <Icon name="Bell" size={20} />
                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-data animate-pulse">
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </span>
                  )}
                </button>

                {/* Profile Button */}
                <button
                  onClick={handleProfileClick}
                  className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-squircle spring-transition ripple"
                >
                  <Icon name="User" size={20} />
                </button>

                {/* Logout Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAuthClick}
                  iconName="LogOut"
                  iconPosition="left"
                  iconSize={16}
                >
                  Logout
                </Button>
              </>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={handleAuthClick}
                iconName="LogIn"
                iconPosition="left"
                iconSize={16}
                className="glow-primary"
              >
                Sign In
              </Button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-squircle spring-transition ripple"
            >
              <Icon name={isMobileMenuOpen ? "X" : "Menu"} size={20} />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border mt-2 pt-4 pb-4 space-y-2">
            {currentNavItems.map((item) => (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center space-x-3 w-full px-4 py-3 rounded-squircle spring-transition ${
                  isActivePath(item.path)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Icon name={item.icon} size={20} />
                <span className="font-body font-body-medium tracking-wide">
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Ambient Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-4 left-1/4 w-2 h-2 bg-primary/20 rounded-full particle-float"></div>
        <div className="absolute top-8 right-1/3 w-1 h-1 bg-accent/30 rounded-full particle-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-4 left-1/2 w-1.5 h-1.5 bg-secondary/25 rounded-full particle-float" style={{ animationDelay: '4s' }}></div>
      </div>
    </header>
  );
};

export default AppHeader;
