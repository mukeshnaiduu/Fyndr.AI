import React, { useState, useRef, useEffect } from 'react';
import { signOut } from 'utils/signOut';
import Icon from '../AppIcon';
import Button from './Button';
import { useRole } from './RoleBasedNavigation';


const UserProfileDropdown = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);

  // Always read user info from localStorage on mount and when dropdown opens
  useEffect(() => {
    const getUser = () => {
      const token = localStorage.getItem('accessToken');
      const userString = localStorage.getItem('user');
      if (token && userString) {
        try {
          setUser(JSON.parse(userString));
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };
    getUser();
    // Listen for localStorage changes (logout in other tabs or signOut)
    const handleStorage = (e) => {
      if ((e.key === 'user' || e.key === 'accessToken') && !e.newValue) {
        setUser(null);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Also update user info when dropdown is opened
  useEffect(() => {
    if (isOpen) {
      const token = localStorage.getItem('accessToken');
      const userString = localStorage.getItem('user');
      if (token && userString) {
        try {
          setUser(JSON.parse(userString));
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    }
  }, [isOpen]);

  const { currentRole, availableRoles, switchRole } = useRole();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Listen for localStorage changes (logout in other tabs or signOut)
  useEffect(() => {
    const handleStorage = (e) => {
      if ((e.key === 'user' || e.key === 'accessToken') && !e.newValue) {
        setUser(null);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const handleRoleSwitch = (newRole) => {
    switchRole(newRole);
    setIsOpen(false);
  };

  const handleLogout = () => {
    setIsOpen(false);
    setUser(null);
    signOut();
  };

  const handleProfileEdit = () => {
    console.log('Edit profile clicked');
    setIsOpen(false);
  };

  const handleSettings = () => {
    console.log('Settings clicked');
    setIsOpen(false);
  };

  const getRoleLabel = (role) => {
    const labels = {
      jobseeker: 'Job Seeker',
      recruiter: 'Recruiter',
      admin: 'Administrator'
    };
    return labels[role] || role;
  };

  const getRoleIcon = (role) => {
    const icons = {
      jobseeker: 'User',
      recruiter: 'Briefcase',
      admin: 'Shield'
    };
    return icons[role] || 'User';
  };

  if (!user) return null;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Profile Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 hover:bg-white/10 px-3 py-2"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
          ) : (
            <span className="text-white text-sm font-medium">
              {user.name ? user.name.split(' ').map(n => n[0]).join('') : '?'}
            </span>
          )}
        </div>
        <div className="hidden md:block text-left">
          <div className="text-sm font-medium text-foreground">{user.name}</div>
          <div className="text-xs text-muted-foreground">{getRoleLabel(currentRole)}</div>
        </div>
        <Icon
          name={isOpen ? "ChevronUp" : "ChevronDown"}
          size={16}
          className="text-muted-foreground transition-transform duration-200"
        />
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 glassmorphic border border-white/20 rounded-lg shadow-glassmorphic-lg z-50">
          {/* User Info Header */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span className="text-white font-medium">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-foreground truncate">{user.name}</div>
                <div className="text-sm text-muted-foreground truncate">{user.email}</div>
                <div className="text-xs text-accent font-medium">{user.role}</div>
              </div>
            </div>
          </div>

          {/* Role Switching */}
          {availableRoles.length > 1 && (
            <div className="p-3 border-b border-white/10">
              <div className="text-xs font-medium text-muted-foreground mb-2">Switch Role</div>
              <div className="space-y-1">
                {availableRoles.map((role) => (
                  <button
                    key={role}
                    onClick={() => handleRoleSwitch(role)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${currentRole === role
                        ? 'bg-primary/20 text-primary border border-primary/30' : 'text-foreground hover:bg-white/10'
                      }`}
                  >
                    <Icon name={getRoleIcon(role)} size={16} />
                    <span className="flex-1 text-left">{getRoleLabel(role)}</span>
                    {currentRole === role && (
                      <Icon name="Check" size={14} className="text-primary" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Menu Items */}
          <div className="p-2">
            <button
              onClick={handleProfileEdit}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-white/10 transition-all duration-200"
            >
              <Icon name="User" size={16} />
              <span>Edit Profile</span>
            </button>

            <button
              onClick={handleSettings}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-white/10 transition-all duration-200"
            >
              <Icon name="Settings" size={16} />
              <span>Settings</span>
            </button>

            <button
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-white/10 transition-all duration-200"
            >
              <Icon name="HelpCircle" size={16} />
              <span>Help & Support</span>
            </button>

            <button
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-white/10 transition-all duration-200"
            >
              <Icon name="Moon" size={16} />
              <span>Dark Mode</span>
            </button>
          </div>

          {/* Logout */}
          <div className="p-2 border-t border-white/10">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-error hover:bg-error/10 transition-all duration-200"
            >
              <Icon name="LogOut" size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfileDropdown;
