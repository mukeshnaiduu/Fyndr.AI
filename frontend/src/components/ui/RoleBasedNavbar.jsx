import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';
import ThemeSwitcher from './ThemeSwitcher';
import { cn } from '../../utils/cn';
import { getNavigationByRole } from '../../utils/roleNavigation';

// Build an authenticated, cache-busted avatar URL
const buildAvatarUrl = () => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return '';
    const user = JSON.parse(userStr);
    const raw = user?.profile_image_url || user?.avatar || '';
    if (!raw) return '';
    const token = localStorage.getItem('accessToken') || '';
    const ver = localStorage.getItem('avatarVersion') || '';
    let url = `${raw}${raw.includes('?') ? '&' : '?'}token=${token}`;
    if (ver) url += `&t=${ver}`;
    return url;
  } catch {
    return '';
  }
};

// Utility to get user from localStorage
function getStoredUser() {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

const RoleBasedNavbar = ({ toggleNavbar }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [user, setUser] = useState(getStoredUser());
  const location = useLocation();
  const profileRef = useRef(null);
  const notificationsRef = useRef(null);

  // Normalize role variants (e.g., 'jobseeker' -> 'job_seeker')
  const normalizeRole = (role) => {
    switch (role) {
      case 'jobseeker':
        return 'job_seeker';
      case 'employer':
      case 'company':
      case 'recruiter':
      case 'administrator':
      case 'job_seeker':
        return role;
      default:
        return role;
    }
  };
  const effectiveRole = user ? normalizeRole(user.role) : undefined;

  // Get role-specific navigation
  const navigation = effectiveRole ? getNavigationByRole(effectiveRole) : null;
  const [avatarUrl, setAvatarUrl] = useState(buildAvatarUrl());

  // Check if user has scrolled
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 10);
      // Auto-close mobile menu and desktop dropdowns on scroll
      setIsMobileMenuOpen(false);
      setIsProfileOpen(false);
      setIsNotificationsOpen(false);
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

  // Listen for localStorage changes (signout, login, onboarding, etc)
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'user' || e.key === 'accessToken' || e.key === 'isAuthenticated' || e.key === null) {
        const storedUser = getStoredUser();
        const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
        const hasToken = localStorage.getItem('accessToken');

        if (isAuthenticated && hasToken && storedUser) {
          setUser(storedUser);
          setAvatarUrl(buildAvatarUrl());
        } else {
          setUser(null);
          setAvatarUrl('');
        }
      }
    };
    const onAvatarUpdated = () => setAvatarUrl(buildAvatarUrl());
    window.addEventListener('storage', handleStorage);
    window.addEventListener('avatar-updated', onAvatarUpdated);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('avatar-updated', onAvatarUpdated);
    };
  }, []);

  // Also update user state on mount and check authentication
  useEffect(() => {
    const storedUser = getStoredUser();
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const hasToken = localStorage.getItem('accessToken');

    if (isAuthenticated && hasToken && storedUser) {
      setUser(storedUser);
      setAvatarUrl(buildAvatarUrl());
    } else {
      setUser(null);
      setAvatarUrl('');
    }
  }, []);

  // Role-specific styling
  const getRoleColor = (role) => {
    const colors = {
      'job_seeker': 'text-blue-600 dark:text-blue-400',
      'jobseeker': 'text-blue-600 dark:text-blue-400',
      'company': 'text-green-600 dark:text-green-400',
      'recruiter': 'text-purple-600 dark:text-purple-400', // Separate role for recruiters
      'employer': 'text-purple-600 dark:text-purple-400', // Keep for backward compatibility
      'administrator': 'text-red-600 dark:text-red-400'
    };
    return colors[role] || 'text-gray-600';
  };

  const getRoleLabel = (role) => {
    const labels = {
      'job_seeker': 'Job Seeker',
      'jobseeker': 'Job Seeker',
      'company': 'Company',
      'recruiter': 'Recruiter', // Separate role for recruiters
      'employer': 'Employer', // Keep for backward compatibility
      'administrator': 'Administrator'
    };
    return labels[role] || 'User';
  };

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

          {/* Main navigation - desktop (role-based) */}
          {user && navigation && (
            <div className="hidden md:flex items-center space-x-1">
              {navigation.main.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1",
                    location.pathname === item.path
                      ? "text-primary bg-primary/10 dark:text-accent dark:bg-gray-800"
                      : "text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-accent hover:bg-primary/5 dark:hover:bg-gray-800"
                  )}
                  title={item.description}
                >
                  <Icon name={item.icon} size={16} />
                  <span>{item.label}</span>
                </Link>
              ))}

              {/* Resources dropdown (role-based) */}
              {navigation.resources && navigation.resources.length > 0 && (
                <div className="relative group">
                  <button className="px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1 text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-accent hover:bg-primary/5 dark:hover:bg-gray-800">
                    <Icon name="BookOpen" size={16} />
                    <span>Resources</span>
                    <Icon name="ChevronDown" size={14} />
                  </button>

                  <div className="absolute left-0 mt-2 w-80 rounded-md shadow-lg bg-white dark:bg-gray-900 ring-1 ring-black ring-opacity-5 focus:outline-none origin-top-right opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                    <div className="py-2 p-3 grid gap-2">
                      {navigation.resources.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
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
              )}
            </div>
          )}

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

            {/* If not authenticated, show Sign In/Sign Up buttons */}
            {!user ? (
              <>
                <Link to="/authentication-login-register">
                  <Button variant="primary" className="ml-2">Sign In</Button>
                </Link>
                <Link to="/authentication-login-register" state={{ mode: 'register' }}>
                  <Button variant="outline" className="ml-2">Sign Up</Button>
                </Link>
              </>
            ) : (
              <>
                {/* Notifications dropdown */}
                <div className="relative" ref={notificationsRef}>
                  <button
                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                    className="relative p-1 rounded-full text-gray-500 hover:text-primary focus:outline-none"
                  >
                    <Icon name="Bell" size={20} />
                  </button>
                  {isNotificationsOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-lg shadow-lg bg-white dark:bg-gray-900 ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                      <div className="py-2">
                        <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800">
                          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Notifications</h3>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          <div className="px-4 py-3 text-gray-500 text-sm">No new notifications.</div>
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

                {/* Profile dropdown (role-based) */}
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
                    {avatarUrl ? (
                      <img
                        className="h-8 w-8 rounded-full object-cover border-2 border-white shadow-sm"
                        src={avatarUrl}
                        alt={user.name || user.first_name || user.email || 'User'}
                        onError={() => setAvatarUrl('')}
                      />
                    ) : (
                      <span className="h-8 w-8 rounded-full border-2 border-white shadow-sm bg-muted flex items-center justify-center">
                        <Icon name="User" size={16} className="text-muted-foreground" />
                      </span>
                    )}
                    <div className="hidden md:block text-left">
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        {user.name || user.first_name || user.email}
                      </div>
                      <div className={cn("text-xs", getRoleColor(effectiveRole))}>
                        {getRoleLabel(effectiveRole)}
                      </div>
                    </div>
                    <Icon name="ChevronDown" size={14} className="hidden md:block text-gray-400" />
                  </button>
                  {isProfileOpen && navigation && (
                    <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-lg shadow-lg bg-white dark:bg-gray-900 ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                      <div className="py-2">
                        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                          <p className="text-sm text-gray-900 dark:text-gray-100">
                            {user.name || user.first_name || user.email}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                          <p className={cn("text-xs font-medium", getRoleColor(effectiveRole))}>
                            {getRoleLabel(effectiveRole)}
                          </p>
                        </div>
                        <div className="py-1">
                          {navigation.profile.map((item) => (
                            <Link
                              key={item.label}
                              to={item.path}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                              onClick={() => {
                                if (item.label === 'Sign out') {
                                  import('../../utils/signOut').then(mod => mod.signOut());
                                }
                              }}
                              title={item.description}
                            >
                              <Icon name={item.icon} size={16} className="mr-3 text-gray-400 dark:text-gray-300" />
                              {item.label}
                            </Link>
                          ))}
                          {/* Always include sign out option */}
                          <Link
                            to="/authentication-login-register"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                            onClick={() => {
                              import('../../utils/signOut').then(mod => mod.signOut());
                            }}
                          >
                            <Icon name="LogOut" size={16} className="mr-3 text-gray-400 dark:text-gray-300" />
                            Sign out
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

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

      {/* Mobile menu, show/hide based on menu state (role-based) */}
      {isMobileMenuOpen && user && navigation && (
        <div className="md:hidden bg-white dark:bg-gray-900 shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {/* Role indicator in mobile */}
            <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800 mb-2">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {user.name || user.first_name || user.email}
              </p>
              <p className={cn("text-xs font-medium", getRoleColor(effectiveRole))}>
                {getRoleLabel(effectiveRole)}
              </p>
            </div>

            {navigation.main.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "block px-3 py-2 rounded-md text-base font-medium flex items-center space-x-3",
                  location.pathname === item.path
                    ? "text-primary bg-primary/10"
                    : "text-gray-600 dark:text-gray-300 hover:text-primary hover:bg-primary/5"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Icon name={item.icon} size={18} />
                <span>{item.label}</span>
              </Link>
            ))}

            {/* Resources section in mobile (role-based) */}
            {navigation.resources && navigation.resources.length > 0 && (
              <>
                <div className="px-3 py-2 text-base font-medium text-gray-600 dark:text-gray-400">Resources</div>
                <div className="pl-5 space-y-1">
                  {navigation.resources.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="block px-3 py-2 rounded-md text-sm text-gray-600 dark:text-gray-300 hover:text-primary hover:bg-primary/5 flex items-center space-x-3"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Icon name={item.icon} size={16} />
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default RoleBasedNavbar;
