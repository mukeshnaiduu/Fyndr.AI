import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import Button from 'components/ui/Button';
import Navbar from 'components/ui/Navbar';
import AuthenticatedSidebar from 'components/ui/AuthenticatedSidebar';
import NotificationCard from './components/NotificationCard';
import NotificationFilters from './components/NotificationFilters';
import BulkActions from './components/BulkActions';
import NotificationStats from './components/NotificationStats';
import QuickFilters from './components/QuickFilters';
import EmptyState from './components/EmptyState';

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

  const navigate = useNavigate();

  // Mock notifications data
  const mockNotifications = [
    {
      id: 1,
      sender: "Sarah Johnson",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b9e0e4e4?w=150",
      title: "Interview Scheduled",
      message: "Your technical interview for Senior React Developer position has been scheduled for tomorrow at 2:00 PM. Please join the video call 5 minutes early.",
      type: "interview",
      priority: "high",
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      read: false,
      archived: false,
      tags: ["urgent", "technical-interview"]
    },
    {
      id: 2,
      sender: "TechCorp HR",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
      title: "Application Status Update",
      message: "Great news! Your application for the Frontend Developer role has moved to the next stage. We\'ll be in touch soon with next steps.",
      type: "application",
      priority: "medium",
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      read: false,
      archived: false,
      tags: ["application", "frontend"]
    },
    {
      id: 3,
      sender: "Alex Chen",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      title: "New Message",
      message: "Hi! I reviewed your portfolio and I\'m impressed with your React projects. Would you be interested in discussing a potential opportunity?",
      type: "message",
      priority: "medium",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: true,
      archived: false,
      tags: ["portfolio", "opportunity"]
    },
    {
      id: 4,
      sender: "HireHub AI System",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
      title: "Profile Optimization Tip",
      message: "Your profile is 85% complete! Add 2 more skills and a professional summary to increase your visibility to recruiters by 40%.",
      type: "system",
      priority: "low",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      read: true,
      archived: false,
      tags: ["profile", "optimization"]
    },
    {
      id: 5,
      sender: "Emma Wilson",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
      title: "Interview Reminder",
      message: "This is a friendly reminder about your interview tomorrow at 2:00 PM with TechCorp. Don\'t forget to test your camera and microphone beforehand.",
      type: "reminder",
      priority: "high",
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      read: false,
      archived: false,
      tags: ["reminder", "interview-prep"]
    },
    {
      id: 6,
      sender: "StartupXYZ",
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150",
      title: "Job Match Found",
      message: "We found a perfect match for your skills! Full-Stack Developer position at StartupXYZ offers remote work and competitive salary.",
      type: "application",
      priority: "medium",
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
      read: true,
      archived: false,
      tags: ["job-match", "remote", "full-stack"]
    },
    {
      id: 7,
      sender: "Michael Rodriguez",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
      title: "Connection Request",
      message: "I\'d like to connect with you on HireHub AI. I\'m a Senior Developer at Google and I think we could have some great conversations about React development.",
      type: "message",
      priority: "low",
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
      read: false,
      archived: false,
      tags: ["connection", "networking"]
    },
    {
      id: 8,
      sender: "DataTech Solutions",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150",
      title: "Interview Feedback",
      message: "Thank you for interviewing with us yesterday. We were impressed with your technical skills and will have a decision by end of week.",
      type: "interview",
      priority: "medium",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      read: true,
      archived: false,
      tags: ["feedback", "decision-pending"]
    }
  ];

  useEffect(() => {
    // Check authentication
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (!isAuthenticated) {
      navigate('/authentication-login-register');
      return;
    }

    // Simulate loading
    setTimeout(() => {
      setNotifications(mockNotifications);
      setIsLoading(false);
    }, 1000);
  }, [navigate]);

  // Filter notifications based on search and filters
  useEffect(() => {
    let filtered = [...notifications];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(notification =>
        notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notification.sender.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply quick filter
    if (activeQuickFilter !== 'all') {
      switch (activeQuickFilter) {
        case 'unread':
          filtered = filtered.filter(n => !n.read);
          break;
        case 'interview':
          filtered = filtered.filter(n => n.type === 'interview');
          break;
        case 'applications':
          filtered = filtered.filter(n => n.type === 'application');
          break;
        case 'messages':
          filtered = filtered.filter(n => n.type === 'message');
          break;
        case 'archived':
          filtered = filtered.filter(n => n.archived);
          break;
      }
    }

    // Apply advanced filters
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
      }
    }

    if (filters.priority !== 'all') {
      filtered = filtered.filter(n => n.priority === filters.priority);
    }

    // Apply date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      switch (filters.dateRange) {
        case 'today':
          filtered = filtered.filter(n => {
            const notificationDate = new Date(n.timestamp);
            return notificationDate.toDateString() === now.toDateString();
          });
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter(n => new Date(n.timestamp) >= weekAgo);
          break;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter(n => new Date(n.timestamp) >= monthAgo);
          break;
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <AuthenticatedSidebar />
        <main className="ml-0 md:ml-16 lg:ml-64 pt-16">
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
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar toggleNavbar={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
      <div className="flex flex-1">
        <AuthenticatedSidebar />
        <main className="flex-1 ml-0 md:ml-16 lg:ml-64 pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-heading font-heading-bold text-foreground mb-2">
                  Notifications Center
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
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Notifications List */}
              <div className="lg:col-span-3">
                {filteredNotifications.length > 0 ? (
                  <div className="space-y-4">
                    {filteredNotifications.map((notification, index) => (
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
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    type={getEmptyStateType()}
                    onClearFilters={handleClearFilters}
                  />
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <NotificationStats stats={stats} />
                <QuickFilters
                  activeFilter={activeQuickFilter}
                  onFilterChange={setActiveQuickFilter}
                  counts={counts}
                />
              </div>
            </div>
          </div>
        </main>

        {/* Ambient Particles */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary/10 rounded-full particle-float"></div>
          <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-accent/10 rounded-full particle-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-secondary/10 rounded-full particle-float" style={{ animationDelay: '4s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsCenter;
