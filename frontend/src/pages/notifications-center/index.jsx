import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import Button from 'components/ui/Button';
import RoleBasedNavbar from 'components/ui/RoleBasedNavbar';
import AuthenticatedSidebar from 'components/ui/AuthenticatedSidebar';
import NotificationCard from './components/NotificationCard';
import NotificationFilters from './components/NotificationFilters';
import BulkActions from './components/BulkActions';
import NotificationStats from './components/NotificationStats';
import QuickFilters from './components/QuickFilters';
import EmptyState from './components/EmptyState';
import { apiRequest } from 'utils/api';

const NotificationsCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeQuickFilter, setActiveQuickFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    priority: 'all',
    dateRange: 'all',
    startDate: '',
    endDate: ''
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);

  const navigate = useNavigate();

  const pollRef = useRef(null);

  const mapInvitesToNotifications = (role, invites) => {
    const items = [];
    const list = Array.isArray(invites) ? invites : [];
    if (role === 'company') {
      // Only recruiter-initiated join requests
      list.forEach((inv, idx) => {
        const initiatedBy = inv?.permissions?.initiated_by || inv.initiated_by;
        if (initiatedBy === 'recruiter') {
          const sender = inv.recruiter_name || 'Recruiter';
          const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(sender)}&background=random&color=fff&size=100`;
          items.push({
            id: inv.id || `req_${idx}`,
            sender,
            avatar,
            title: 'Join Request',
            message: inv.message || `${sender} requested to join your team as ${inv.role || 'recruiter'}.`,
            type: 'application',
            priority: 'medium',
            timestamp: inv.created_at ? new Date(inv.created_at) : (inv.invited_at ? new Date(inv.invited_at) : new Date()),
            read: false,
            archived: false,
            tags: ['join-request']
          });
        }
      });
    } else if (role === 'recruiter') {
      // Only company-initiated invitations to the recruiter
      list.forEach((inv, idx) => {
        const initiatedBy = inv?.permissions?.initiated_by || inv.initiated_by;
        if (initiatedBy === 'company' || !initiatedBy) {
          const sender = inv.company_name || 'Company';
          const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(sender)}&background=random&color=fff&size=100`;
          items.push({
            id: inv.id || `inv_${idx}`,
            sender,
            avatar,
            title: 'Team Invitation',
            message: `${sender} invited you to join as ${inv.role || 'recruiter'}. Status: ${inv.status}`,
            type: 'message',
            priority: 'medium',
            timestamp: inv.created_at ? new Date(inv.created_at) : (inv.invited_at ? new Date(inv.invited_at) : new Date()),
            read: false,
            archived: false,
            tags: ['invitation']
          });
        }
      });
    }
    return items;
  };

  useEffect(() => {
    // Check authentication
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (!isAuthenticated) {
      navigate('/authentication-login-register');
      return;
    }

    const fetchAndSetNotifications = async () => {
      try {
        const profile = await apiRequest('/auth/profile/');
        const invites = await apiRequest('/team/invitations/');
        const dynamic = mapInvitesToNotifications(profile.role, invites);
        setNotifications(dynamic);
      } catch (e) {
        // If API fails, leave notifications empty rather than mock
        setNotifications([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndSetNotifications();
    pollRef.current = setInterval(fetchAndSetNotifications, 30000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };

  }, []);

  // Derive filtered notifications from raw list and UI filters
  useEffect(() => {
    let filtered = [...notifications];

    // Quick filter
    switch (activeQuickFilter) {
      case 'unread':
        filtered = filtered.filter(n => !n.read);
        break;
      case 'archived':
        filtered = filtered.filter(n => n.archived);
        break;
      case 'messages':
        filtered = filtered.filter(n => n.type === 'message');
        break;
      case 'applications':
        filtered = filtered.filter(n => n.type === 'application');
        break;
      case 'today': {
        const today = new Date().toDateString();
        filtered = filtered.filter(n => new Date(n.timestamp).toDateString() === today);
        break;
      }
      default:
        break;
    }

    // Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(n =>
        (n.sender && n.sender.toLowerCase().includes(q)) ||
        (n.title && n.title.toLowerCase().includes(q)) ||
        (n.message && n.message.toLowerCase().includes(q)) ||
        (Array.isArray(n.tags) && n.tags.some(t => t.toLowerCase().includes(q)))
      );
    }

    // Detailed filters
    if (filters.type !== 'all') {
      filtered = filtered.filter(n => n.type === filters.type);
    }

    if (filters.status !== 'all') {
      switch (filters.status) {
        case 'unread':
          filtered = filtered.filter(n => !n.read);
          break;
        case 'read':
          filtered = filtered.filter(n => n.read);
          break;
        case 'archived':
          filtered = filtered.filter(n => n.archived);
          break;
        default:
          break;
      }
    }

    if (filters.priority !== 'all') {
      filtered = filtered.filter(n => n.priority === filters.priority);
    }

    if (filters.dateRange !== 'all') {
      const now = new Date();
      switch (filters.dateRange) {
        case 'today':
          filtered = filtered.filter(n => new Date(n.timestamp).toDateString() === now.toDateString());
          break;
        case 'week': {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter(n => new Date(n.timestamp) >= weekAgo);
          break;
        }
        case 'month': {
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter(n => new Date(n.timestamp) >= monthAgo);
          break;
        }
        case 'custom':
          if (filters.startDate && filters.endDate) {
            const start = new Date(filters.startDate);
            const end = new Date(filters.endDate);
            filtered = filtered.filter(n => {
              const date = new Date(n.timestamp);
              return date >= start && date <= end;
            });
          }
          break;
        default:
          break;
      }
    }

    setFilteredNotifications(filtered);
  }, [notifications, searchQuery, activeQuickFilter, filters]);

  // Calculate statistics
  const stats = {
    total: notifications.length,
    unread: notifications.filter(n => !n.read).length,
    high: notifications.filter(n => n.priority === 'high').length,
    today: notifications.filter(n => {
      const today = new Date();
      const notificationDate = new Date(n.timestamp);
      return notificationDate.toDateString() === today.toDateString();
    }).length
  };

  const counts = {
    total: notifications.length,
    unread: notifications.filter(n => !n.read).length,
    interview: notifications.filter(n => n.type === 'interview').length,
    application: notifications.filter(n => n.type === 'application').length,
    message: notifications.filter(n => n.type === 'message').length,
    archived: notifications.filter(n => n.archived).length,
    high: notifications.filter(n => n.priority === 'high').length,
    today: notifications.filter(n => {
      const today = new Date();
      const notificationDate = new Date(n.timestamp);
      return notificationDate.toDateString() === today.toDateString();
    }).length
  };

  // Handlers
  const handleNotificationSelect = (id) => {
    setSelectedNotifications(prev =>
      prev.includes(id)
        ? prev.filter(notificationId => notificationId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedNotifications(filteredNotifications.map(n => n.id));
  };

  const handleDeselectAll = () => {
    setSelectedNotifications([]);
  };

  const handleMarkRead = (id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const handleMarkAllRead = () => {
    setNotifications(prev =>
      prev.map(n =>
        selectedNotifications.includes(n.id) ? { ...n, read: true } : n
      )
    );
    setSelectedNotifications([]);
  };

  const handleMarkAllUnread = () => {
    setNotifications(prev =>
      prev.map(n =>
        selectedNotifications.includes(n.id) ? { ...n, read: false } : n
      )
    );
    setSelectedNotifications([]);
  };

  const handleArchive = (id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, archived: true } : n)
    );
  };

  const handleArchiveSelected = () => {
    setNotifications(prev =>
      prev.map(n =>
        selectedNotifications.includes(n.id) ? { ...n, archived: true } : n
      )
    );
    setSelectedNotifications([]);
  };

  const handleDeleteSelected = () => {
    setNotifications(prev =>
      prev.filter(n => !selectedNotifications.includes(n.id))
    );
    setSelectedNotifications([]);
  };

  const handleReply = (id) => {
    // Navigate to message or open reply modal
    console.log('Reply to notification:', id);
  };

  const handleClearFilters = () => {
    setFilters({
      type: 'all',
      status: 'all',
      priority: 'all',
      dateRange: 'all',
      startDate: '',
      endDate: ''
    });
    setSearchQuery('');
    setActiveQuickFilter('all');
  };

  const getEmptyStateType = () => {
    if (searchQuery) return 'search';
    if (activeQuickFilter === 'unread') return 'unread';
    if (activeQuickFilter === 'archived') return 'archived';
    if (Object.values(filters).some(value => value !== 'all' && value !== '')) return 'filtered';
    return 'all';
  };

  // Remove Navbar from inside isLoading conditional

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {showNavbar && (
        <RoleBasedNavbar toggleNavbar={() => setShowNavbar(false)} key={showNavbar ? 'navbar-visible' : 'navbar-hidden'} />
      )}
      <main className={`flex-1${showNavbar ? ' mt-16' : ''}`}>
        {isLoading ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-muted rounded-squircle w-1/3"></div>
              <div className="h-16 bg-muted rounded-squircle"></div>
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-24 bg-muted rounded-squircle"></div>
                  ))}
                </div>
                <div className="space-y-4">
                  <div className="h-32 bg-muted rounded-squircle"></div>
                  <div className="h-48 bg-muted rounded-squircle"></div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-heading font-heading-bold text-foreground mb-2">
                  Notifications Center - Fyndr.AI
                </h1>
                <p className="text-muted-foreground">
                  Manage all your notifications in one place
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  iconName="RefreshCw"
                  iconPosition="left"
                  iconSize={16}
                  onClick={() => window.location.reload()}
                >
                  Refresh
                </Button>
                <Button
                  variant="outline"
                  iconName="Settings"
                  iconPosition="left"
                  iconSize={16}
                >
                  Settings
                </Button>
              </div>
            </div>

            {/* Filters */}
            <div className="mb-6">
              <NotificationFilters
                filters={filters}
                onFiltersChange={setFilters}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                notificationCounts={counts}
                onClearFilters={handleClearFilters}
              />
            </div>

            {/* Bulk Actions */}
            <AnimatePresence>
              {selectedNotifications.length > 0 && (
                <div className="mb-6">
                  <BulkActions
                    selectedCount={selectedNotifications.length}
                    totalCount={filteredNotifications.length}
                    onSelectAll={handleSelectAll}
                    onDeselectAll={handleDeselectAll}
                    onMarkAllRead={handleMarkAllRead}
                    onMarkAllUnread={handleMarkAllUnread}
                    onArchiveSelected={handleArchiveSelected}
                    onDeleteSelected={handleDeleteSelected}
                    isAllSelected={selectedNotifications.length === filteredNotifications.length}
                  />
                </div>
              )}
            </AnimatePresence>

            {/* Main Content */}
            <div className="space-y-4">
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((notification, index) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    isSelected={selectedNotifications.includes(notification.id)}
                    onSelect={handleNotificationSelect}
                    onMarkRead={handleMarkRead}
                    onArchive={handleArchive}
                    onReply={handleReply}
                    index={index}
                  />
                ))
              ) : (
                <EmptyState
                  type={getEmptyStateType()}
                  onClearFilters={handleClearFilters}
                />
              )}
            </div>
          </div>
        )}
      </main>

      {/* Ambient Particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary/10 rounded-full particle-float"></div>
        <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-accent/10 rounded-full particle-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-secondary/10 rounded-full particle-float" style={{ animationDelay: '4s' }}></div>
      </div>
    </div>
  );
};

export default NotificationsCenter;
