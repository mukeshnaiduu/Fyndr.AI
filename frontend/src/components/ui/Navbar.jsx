import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';
import ThemeSwitcher from './ThemeSwitcher';
import { cn } from '../../utils/cn';
import { MAIN_NAV, RESOURCES_NAV } from '../../utils/routes';

const Navbar = ({ toggleNavbar }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const location = useLocation();
  const profileRef = useRef(null);
  const notificationsRef = useRef(null);

  // Sample user data - in a real app, this would come from auth context or redux
  const user = {
    name: "Alex Johnson",
    email: "alex@example.com",
    role: "Job Seeker",
    avatar: "https://i.pravatar.cc/150?img=11",
    unreadNotifications: 3
  };

  // Check if user has scrolled
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 10);
      // Auto-close mobile menu and desktop dropdowns on scroll
      setIsMobileMenuOpen(false);
      setIsProfileOpen(false);
      setIsNotificationsOpen(false);
      // Removed setScrollKey to prevent remounts
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close profile dropdown when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Use centralized navigation items from routes.js
  const mainNavItems = MAIN_NAV.map(item => ({
    label: item.label,
    href: item.path,
    icon: item.icon
  }));

  // Use centralized resources items from routes.js
  const resourceItems = RESOURCES_NAV.map(item => ({
    label: item.label,
    href: item.path,
    description: item.description,
    icon: item.icon
  }));

  // User menu options
  const userMenuItems = [
    {
      label: "Profile",
      href: "/profile-management",
      icon: "User"
    },
    {
      label: "Applications",
      href: "/job-search-application-hub",
      icon: "ClipboardCheck"
    },
    {
      label: "Notifications",
      href: "/notifications-center",
      icon: "Bell"
    },
    {
      label: "Settings",
      href: "#",
      icon: "Settings"
    },
    {
      label: "Sign out",
      href: "/authentication-login-register",
      icon: "LogOut"
    }
  ];

  // Sample notifications
  const notifications = [
    {
      id: 1,
      title: "Interview Invitation",
      description: "You've been invited to interview at TechCorp Inc.",
      time: "10 minutes ago",
      isRead: false,
      icon: "Calendar"
    },
    {
      id: 2,
      title: "Application Status",
      description: "Your application to Frontend Developer position is under review.",
      time: "2 hours ago",
      isRead: false,
      icon: "FileSearch"
    },
    {
      id: 3,
      title: "New Job Match",
      description: "We found 5 new jobs matching your profile.",
      time: "Yesterday",
      isRead: false,
      icon: "Briefcase"
    },
    {
      id: 4,
      title: "Profile Feedback",
      description: "AI recommendations to improve your profile visibility.",
      time: "2 days ago",
      isRead: true,
      icon: "TrendingUp"
    }
  ];

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-[1050] transition-all duration-300",
      isScrolled
        ? "bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-sm"
        : "bg-transparent dark:bg-gray-900/80"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and brand */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <Icon name="Zap" size={20} color="white" />
              </div>
              <span className="font-bold text-lg text-foreground dark:text-white">Fyndr.AI</span>
            </Link>
          </div>

          {/* Main navigation - desktop */}
          <div className="hidden md:flex items-center space-x-1">
            {mainNavItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1",
                  location.pathname === item.href
                    ? "text-primary bg-primary/10 dark:text-accent dark:bg-gray-800"
                    : "text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-accent hover:bg-primary/5 dark:hover:bg-gray-800"
                )}
              >
                <Icon name={item.icon} size={16} />
                <span>{item.label}</span>
              </Link>
            ))}

            {/* Resources dropdown */}
            <div className="relative group">
              <button className="px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1 text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-accent hover:bg-primary/5 dark:hover:bg-gray-800">
                <Icon name="BookOpen" size={16} />
                <span>Resources</span>
                <Icon name="ChevronDown" size={14} />
              </button>

              <div className="absolute left-0 mt-2 w-80 rounded-md shadow-lg bg-white dark:bg-gray-900 ring-1 ring-black ring-opacity-5 focus:outline-none origin-top-right opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                <div className="py-2 p-3 grid gap-2">
                  {resourceItems.map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      className="flex items-start p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <span className="flex items-center justify-center h-8 w-8 rounded-md bg-primary/10 dark:bg-accent/10 text-primary dark:text-accent mr-3">
                        <Icon name={item.icon} size={16} />
                      </span>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.label}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{item.description}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Hide navbar button */}
            {toggleNavbar && (
              <button
                onClick={toggleNavbar}
                className="p-2 rounded-md hover:bg-accent/10 transition-all"
                aria-label="Hide navigation"
                title="Hide navigation"
              >
                <Icon name="X" size={18} className="text-foreground" />
              </button>
            )}

            {/* Theme Switcher */}
            <ThemeSwitcher />

            {/* Notifications dropdown */}
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-1 rounded-full text-gray-500 hover:text-primary focus:outline-none"
              >
                <Icon name="Bell" size={20} />
                {user.unreadNotifications > 0 && (
                  <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-error text-white text-xs flex items-center justify-center">
                    {user.unreadNotifications}
                  </span>
                )}
              </button>

              {/* Notifications dropdown content */}
              {isNotificationsOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-lg shadow-lg bg-white dark:bg-gray-900 ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                  <div className="py-2">
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={cn(
                            "px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-start",
                            !notification.isRead ? "bg-primary/5 dark:bg-accent/5" : ""
                          )}
                        >
                          <span className={cn(
                            "flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center mr-3",
                            !notification.isRead ? "bg-primary/10 dark:bg-accent/10 text-primary dark:text-accent" : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                          )}>
                            <Icon name={notification.icon} size={16} />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{notification.title}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{notification.description}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{notification.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-800">
                      <Link
                        to="/notifications-center"
                        className="text-xs font-medium text-primary dark:text-accent hover:text-primary-dark dark:hover:text-accent-dark flex justify-center"
                      >
                        View all notifications
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile dropdown (hover) */}
            <div
              className="relative"
              ref={profileRef}
              onMouseEnter={() => setIsProfileOpen(true)}
              onMouseLeave={() => setIsProfileOpen(false)}
            >
              <button
                className="flex items-center space-x-2 focus:outline-none"
                tabIndex={0}
                aria-haspopup="true"
                aria-expanded={isProfileOpen}
              >
                <img
                  className="h-8 w-8 rounded-full object-cover border-2 border-white shadow-sm"
                  src={user.avatar}
                  alt={user.name}
                />
                <div className="hidden md:block text-left">
                  <div className="text-sm font-medium text-gray-700">{user.name}</div>
                  <div className="text-xs text-gray-500">{user.role}</div>
                </div>
                <Icon name="ChevronDown" size={14} className="hidden md:block text-gray-400" />
              </button>

              {/* Profile dropdown menu */}
              {isProfileOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-lg shadow-lg bg-white dark:bg-gray-900 ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                  <div className="py-2">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                      <p className="text-sm text-gray-900 dark:text-gray-100">{user.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                    </div>

                    <div className="py-1">
                      {userMenuItems.map((item) => (
                        <Link
                          key={item.label}
                          to={item.href}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          <Icon name={item.icon} size={16} className="mr-3 text-gray-400 dark:text-gray-300" />
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-primary hover:bg-primary/5 focus:outline-none"
              >
                <span className="sr-only">Open main menu</span>
                <Icon name={isMobileMenuOpen ? "X" : "Menu"} size={24} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {mainNavItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "block px-3 py-2 rounded-md text-base font-medium flex items-center space-x-3",
                  location.pathname === item.href
                    ? "text-primary bg-primary/10"
                    : "text-gray-600 hover:text-primary hover:bg-primary/5"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Icon name={item.icon} size={18} />
                <span>{item.label}</span>
              </Link>
            ))}

            {/* Resources section in mobile */}
            <div className="px-3 py-2 text-base font-medium text-gray-600">Resources</div>
            <div className="pl-5 space-y-1">
              {resourceItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="block px-3 py-2 rounded-md text-sm text-gray-600 hover:text-primary hover:bg-primary/5 flex items-center space-x-3"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon name={item.icon} size={16} />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
