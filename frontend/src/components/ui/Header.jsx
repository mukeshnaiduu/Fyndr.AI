import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';
import Input from './Input';
import Navbar from './Navbar';

// This component is maintained for backward compatibility
// New pages should use the Navbar component directly
const Header = ({ showNavbarInstead = true }) => {
  // If showNavbarInstead is true, render the Navbar component instead
  if (showNavbarInstead) {
    return <Navbar />;
  }

  // Original Header code for backward compatibility
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(3);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navigationItems = [
    {
      label: 'Resources',
      path: '/resource-library',
      icon: 'BookOpen',
      description: 'Learning materials and practice tools'
    },
    {
      label: 'Mentorship',
      path: '/mentorship-platform',
      icon: 'Users',
      description: 'Professional guidance and coaching'
    },
    {
      label: 'Network',
      path: '/alumni-network-referrals',
      icon: 'Network',
      description: 'Alumni connections and referrals'
    },
    {
      label: 'Events',
      path: '/virtual-career-fair',
      icon: 'Calendar',
      description: 'Live career fairs and networking'
    },
    {
      label: 'Compete',
      path: '/hackathons-competitions',
      icon: 'Trophy',
      description: 'Hackathons and competitions'
    },
    {
      label: 'Practice',
      path: '/interview-practice-video-sessions',
      icon: 'Video',
      description: 'Video interview practice'
    }
  ];

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  useEffect(() => {
    const mockNotifications = [
      {
        id: 1,
        title: 'New mentorship request',
        message: 'Sarah Johnson wants to connect with you',
        time: '5 min ago',
        type: 'mentorship',
        unread: true
      },
      {
        id: 2,
        title: 'Hackathon reminder',
        message: 'AI Innovation Challenge starts in 2 hours',
        time: '1 hour ago',
        type: 'event',
        unread: true
      },
      {
        id: 3,
        title: 'Interview scheduled',
        message: 'Practice session with Alex Chen confirmed',
        time: '3 hours ago',
        type: 'interview',
        unread: true
      }
    ];
    setNotifications(mockNotifications);
  }, []);

  const handleThemeToggle = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);

    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('Searching for:', searchQuery);
      // Implement search logic here
    }
  };

  const handleNotificationClick = (notificationId) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId
          ? { ...notif, unread: false }
          : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 glassmorphic border-b border-white/20">
        <div className="flex items-center justify-between h-16 px-4 lg:px-6">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Icon name="Zap" size={20} color="white" />
            </div>
            <span className="text-xl font-semibold text-foreground hidden sm:block">
              Fyndr.AI
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-spring hover:bg-white/10 hover:shadow-elevation-1 group ${isActiveRoute(item.path)
                    ? 'bg-primary/20 text-primary border border-primary/30' : 'text-foreground hover:text-primary'
                  }`}
              >
                <Icon
                  name={item.icon}
                  size={18}
                  className={`transition-spring ${isActiveRoute(item.path) ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'
                    }`}
                />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Search, Notifications, Profile */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative hidden md:block">
              <form onSubmit={handleSearchSubmit} className="relative">
                <Input
                  type="search"
                  placeholder="Search resources, mentors, events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`transition-spring ${isSearchExpanded ? 'w-80' : 'w-64'
                    } bg-white/10 border-white/20 text-foreground placeholder:text-muted-foreground`}
                  onFocus={() => setIsSearchExpanded(true)}
                  onBlur={() => setIsSearchExpanded(false)}
                />
                <Button
                  type="submit"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-primary"
                >
                  <Icon name="Search" size={16} />
                </Button>
              </form>
            </div>

            {/* Mobile Search */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-muted-foreground hover:text-primary"
              onClick={() => setIsSearchExpanded(!isSearchExpanded)}
            >
              <Icon name="Search" size={20} />
            </Button>

            {/* Notifications */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="relative text-muted-foreground hover:text-primary"
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              >
                <Icon name="Bell" size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-error text-error-foreground text-xs rounded-full flex items-center justify-center pulse-glow">
                    {unreadCount}
                  </span>
                )}
              </Button>

              {/* Notifications Dropdown */}
              {isNotificationOpen && (
                <div className="absolute right-0 top-12 w-80 glassmorphic rounded-lg shadow-elevation-3 border border-white/20 py-2 z-50">
                  <div className="px-4 py-2 border-b border-white/10">
                    <h3 className="font-medium text-foreground">Notifications</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.map((notification) => (
                      <button
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification.id)}
                        className={`w-full px-4 py-3 text-left hover:bg-white/5 transition-spring ${notification.unread ? 'bg-primary/5' : ''
                          }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`w-2 h-2 rounded-full mt-2 ${notification.unread ? 'bg-primary' : 'bg-transparent'
                            }`} />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">
                              {notification.title}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {notification.time}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Menu */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-primary"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                <Icon name="User" size={20} />
              </Button>

              {/* Profile Dropdown */}
              {isProfileOpen && (
                <div className="absolute right-0 top-12 w-56 glassmorphic rounded-lg shadow-elevation-3 border border-white/20 py-2 z-50">
                  <div className="px-4 py-2 border-b border-white/10">
                    <p className="font-medium text-foreground">John Doe</p>
                    <p className="text-xs text-muted-foreground">john.doe@example.com</p>
                  </div>

                  <div className="py-1">
                    <button className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-white/5 transition-spring flex items-center space-x-2">
                      <Icon name="User" size={16} />
                      <span>Profile</span>
                    </button>
                    <button className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-white/5 transition-spring flex items-center space-x-2">
                      <Icon name="Settings" size={16} />
                      <span>Settings</span>
                    </button>
                    <button
                      onClick={handleThemeToggle}
                      className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-white/5 transition-spring flex items-center space-x-2"
                    >
                      <Icon name={isDarkMode ? "Sun" : "Moon"} size={16} />
                      <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
                    </button>
                  </div>

                  <div className="border-t border-white/10 pt-1">
                    <button className="w-full px-4 py-2 text-left text-sm text-error hover:bg-white/5 transition-spring flex items-center space-x-2">
                      <Icon name="LogOut" size={16} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-muted-foreground hover:text-primary"
              onClick={handleMobileMenuToggle}
            >
              <Icon name={isMobileMenuOpen ? "X" : "Menu"} size={20} />
            </Button>
          </div>
        </div>

        {/* Mobile Search Expanded */}
        {isSearchExpanded && (
          <div className="md:hidden px-4 pb-4 border-t border-white/10">
            <form onSubmit={handleSearchSubmit}>
              <Input
                type="search"
                placeholder="Search resources, mentors, events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/10 border-white/20 text-foreground placeholder:text-muted-foreground"
                autoFocus
              />
            </form>
          </div>
        )}
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={handleMobileMenuToggle} />
          <div className="fixed top-16 left-0 right-0 bottom-0 glassmorphic border-t border-white/20">
            <nav className="p-4 space-y-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={handleMobileMenuToggle}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-spring hover:bg-white/10 min-h-touch ${isActiveRoute(item.path)
                      ? 'bg-primary/20 text-primary border border-primary/30' : 'text-foreground hover:text-primary'
                    }`}
                >
                  <Icon
                    name={item.icon}
                    size={20}
                    className={`transition-spring ${isActiveRoute(item.path) ? 'text-primary' : 'text-muted-foreground'
                      }`}
                  />
                  <div>
                    <span className="font-medium">{item.label}</span>
                    <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                  </div>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
