import React, { useState, useContext, createContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';

// Role Context
const RoleContext = createContext();

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};

export const RoleProvider = ({ children }) => {
  const [currentRole, setCurrentRole] = useState('jobseeker');
  const [availableRoles] = useState(['jobseeker', 'recruiter', 'admin']);

  const switchRole = (newRole) => {
    if (availableRoles.includes(newRole)) {
      setCurrentRole(newRole);
    }
  };

  return (
    <RoleContext.Provider value={{ currentRole, availableRoles, switchRole }}>
      {children}
    </RoleContext.Provider>
  );
};

const RoleBasedNavigation = ({ className = '' }) => {
  const location = useLocation();
  const { currentRole } = useRole();

  const navigationConfig = {
    jobseeker: {
      label: 'Job Seeker',
      color: 'text-accent',
      items: [
        {
          label: 'Learn',
          path: '/course-detail-learning-interface',
          icon: 'BookOpen',
          description: 'Course learning and skill development'
        },
        {
          label: 'AI Coach',
          path: '/ai-career-coach-chat-interface',
          icon: 'MessageCircle',
          description: 'Career guidance and coaching'
        },
        {
          label: 'Jobs',
          path: '/job-search-application-hub',
          icon: 'Briefcase',
          description: 'Job search and applications'
        }
      ]
    },
    recruiter: {
      label: 'Recruiter',
      color: 'text-primary',
      items: [
        {
          label: 'Dashboard',
          path: '/recruiter-dashboard-pipeline-management',
          icon: 'BarChart3',
          description: 'Pipeline management and analytics'
        },
        {
          label: 'Candidates',
          path: '/candidate-profile-evaluation-interface',
          icon: 'Users',
          description: 'Candidate evaluation and profiles'
        }
      ]
    },
    admin: {
      label: 'Administrator',
      color: 'text-warning',
      items: [
        {
          label: 'System',
          path: '/admin-dashboard-system-management',
          icon: 'Settings',
          description: 'System management and oversight'
        }
      ]
    }
  };

  const currentConfig = navigationConfig[currentRole];
  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`role-based-navigation ${className}`} role="navigation" aria-label={`${currentConfig.label} navigation`}>
      {/* Role Indicator */}
      <div className="mb-6 p-3 glassmorphic-surface rounded-lg">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full bg-current ${currentConfig.color}`}></div>
          <span className="text-sm font-medium text-muted-foreground">
            {currentConfig.label} Mode
          </span>
        </div>
      </div>

      {/* Navigation Items */}
      <div className="space-y-2">
        {currentConfig.items.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`group flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 hover:scale-105 ${
              isActive(item.path)
                ? 'bg-primary/20 text-primary border border-primary/30 shadow-md'
                : 'text-foreground hover:bg-white/10 hover:shadow-sm'
            }`}
            aria-current={isActive(item.path) ? 'page' : undefined}
          >
            <div className={`flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${
              isActive(item.path) ? 'text-primary' : 'text-muted-foreground'
            }`}>
              <Icon name={item.icon} size={20} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{item.label}</div>
              <div className="text-xs text-muted-foreground truncate mt-0.5">
                {item.description}
              </div>
            </div>

            {isActive(item.path) && (
              <div className="flex-shrink-0">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
              </div>
            )}
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 pt-6 border-t border-white/10">
        <div className="text-xs font-medium text-muted-foreground mb-3 px-4">
          Quick Actions
        </div>
        <div className="space-y-1">
          {currentRole === 'jobseeker' && (
            <>
              <button className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-foreground hover:bg-white/10 rounded-lg transition-all duration-200">
                <Icon name="Search" size={16} />
                <span>Search Jobs</span>
              </button>
              <button className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-foreground hover:bg-white/10 rounded-lg transition-all duration-200">
                <Icon name="FileText" size={16} />
                <span>Update Resume</span>
              </button>
            </>
          )}
          
          {currentRole === 'recruiter' && (
            <>
              <button className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-foreground hover:bg-white/10 rounded-lg transition-all duration-200">
                <Icon name="Plus" size={16} />
                <span>Post Job</span>
              </button>
              <button className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-foreground hover:bg-white/10 rounded-lg transition-all duration-200">
                <Icon name="Filter" size={16} />
                <span>Filter Candidates</span>
              </button>
            </>
          )}
          
          {currentRole === 'admin' && (
            <>
              <button className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-foreground hover:bg-white/10 rounded-lg transition-all duration-200">
                <Icon name="Users" size={16} />
                <span>Manage Users</span>
              </button>
              <button className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-foreground hover:bg-white/10 rounded-lg transition-all duration-200">
                <Icon name="Activity" size={16} />
                <span>System Health</span>
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default RoleBasedNavigation;
