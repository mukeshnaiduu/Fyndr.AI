import React, { useState } from 'react';
import MainLayout from 'components/layout/MainLayout';
import SidebarLayout from 'components/layout/SidebarLayout';
import { RoleProvider } from 'components/ui/RoleBasedNavigation';
import SystemHealthPanel from './components/SystemHealthPanel';
import UserManagementSection from './components/UserManagementSection';
import ContentManagementSection from './components/ContentManagementSection';
import SecurityMonitoringSection from './components/SecurityMonitoringSection';
import AnalyticsSection from './components/AnalyticsSection';
import GlobalConfigSection from './components/GlobalConfigSection';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';

const AdminDashboardSystemManagement = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [notifications] = useState([
    {
      id: 1,
      type: 'critical',
      message: 'High memory usage detected on server-02',
      timestamp: '2 minutes ago'
    },
    {
      id: 2,
      type: 'warning',
      message: 'Failed login attempts from suspicious IP',
      timestamp: '5 minutes ago'
    }
  ]);

  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: 'BarChart3' },
    { id: 'users', label: 'User Management', icon: 'Users' },
    { id: 'content', label: 'Content Management', icon: 'FileText' },
    { id: 'security', label: 'Security Monitoring', icon: 'Shield' },
    { id: 'analytics', label: 'Analytics', icon: 'TrendingUp' },
    { id: 'config', label: 'Global Config', icon: 'Settings' }
  ];

  const quickStats = [
    {
      title: 'Total Users',
      value: '12,847',
      change: '+8.2%',
      trend: 'up',
      icon: 'Users',
      color: 'text-primary'
    },
    {
      title: 'Active Sessions',
      value: '3,421',
      change: '+12.5%',
      trend: 'up',
      icon: 'Activity',
      color: 'text-success'
    },
    {
      title: 'System Health',
      value: '98.5%',
      change: '+0.3%',
      trend: 'up',
      icon: 'Heart',
      color: 'text-accent'
    },
    {
      title: 'Security Score',
      value: '95%',
      change: '-1.2%',
      trend: 'down',
      icon: 'Shield',
      color: 'text-warning'
    }
  ];

  const getTrendIcon = (trend) => {
    return trend === 'up' ? 'TrendingUp' : 'TrendingDown';
  };

  const getTrendColor = (trend) => {
    return trend === 'up' ? 'text-success' : 'text-error';
  };

  const renderOverviewSection = () => (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => (
          <div key={index} className="glassmorphic-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center`}>
                <Icon name={stat.icon} size={20} className={stat.color} />
              </div>
              <div className={`flex items-center space-x-1 text-sm ${getTrendColor(stat.trend)}`}>
                <Icon name={getTrendIcon(stat.trend)} size={14} />
                <span>{stat.change}</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.title}</div>
          </div>
        ))}
      </div>

      {/* Critical Alerts */}
      {notifications.length > 0 && (
        <div className="glassmorphic-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Critical Alerts</h3>
            <Button variant="ghost" size="sm" iconName="Bell">
              View All
            </Button>
          </div>
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div key={notification.id} className="flex items-start space-x-3 p-3 glassmorphic-surface rounded-lg">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  notification.type === 'critical' ? 'bg-error animate-pulse' : 'bg-warning'
                }`}></div>
                <div className="flex-1">
                  <p className="text-sm text-foreground">{notification.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{notification.timestamp}</p>
                </div>
                <Button variant="ghost" size="sm" iconName="X" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* System Health Panel */}
      <SystemHealthPanel />
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return renderOverviewSection();
      case 'users':
        return <UserManagementSection />;
      case 'content':
        return <ContentManagementSection />;
      case 'security':
        return <SecurityMonitoringSection />;
      case 'analytics':
        return <AnalyticsSection />;
      case 'config':
        return <GlobalConfigSection />;
      default:
        return renderOverviewSection();
    }
  };

  // Create the sidebar content
  const sidebarContent = (
    <div className="p-6 h-full">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-foreground mb-2">Admin Dashboard</h2>
        <p className="text-sm text-muted-foreground">System Management</p>
      </div>
      
      <nav className="space-y-2">
        {navigationItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 hover:scale-105 ${
              activeSection === item.id
                ? 'bg-primary/20 text-primary border border-primary/30' :'text-foreground hover:bg-white/10'
            }`}
          >
            <Icon name={item.icon} size={20} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Emergency Actions */}
      <div className="mt-8 pt-6 border-t border-white/10">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Emergency Actions</h3>
        <div className="space-y-2">
          <Button
            variant="destructive"
            size="sm"
            fullWidth
            iconName="AlertTriangle"
            onClick={() => console.log('Emergency maintenance mode')}
          >
            Maintenance Mode
          </Button>
          <Button
            variant="outline"
            size="sm"
            fullWidth
            iconName="Database"
            onClick={() => console.log('Emergency backup')}
          >
            Emergency Backup
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <MainLayout title="Admin Dashboard | System Management" noPadding>
      <RoleProvider>
        <SidebarLayout
          sidebar={
            <div className="p-6">
              <div className="mb-8">
                <h2 className="text-xl font-bold text-foreground mb-2">Admin Dashboard</h2>
                <p className="text-sm text-muted-foreground">System Management</p>
              </div>
              
              <nav className="space-y-2">
                {navigationItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 hover:scale-105 ${
                      activeSection === item.id
                        ? 'bg-primary/20 text-primary border border-primary/30' :'text-foreground hover:bg-white/10'
                    }`}
                  >
                    <Icon name={item.icon} size={20} />
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
              </nav>

              {/* Emergency Actions */}
              <div className="mt-8 pt-6 border-t border-white/10">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Emergency Actions</h3>
                <div className="space-y-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    fullWidth
                    iconName="AlertTriangle"
                    onClick={() => console.log('Emergency maintenance mode')}
                  >
                    Maintenance Mode
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    iconName="Database"
                    onClick={() => console.log('Emergency backup')}
                  >
                    Emergency Backup
                  </Button>
                </div>
              </div>
            </div>
          }
          sidebarWidth={256}
          collapsible
        >

          {/* Main Content */}
          <div className="p-6 lg:p-8">
            {/* Mobile Navigation */}
            <div className="lg:hidden mb-6">
              <div className="glassmorphic-surface p-1 rounded-lg">
                <div className="flex space-x-1 overflow-x-auto">
                  {navigationItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                        activeSection === item.id
                          ? 'bg-primary/20 text-primary border border-primary/30' :'text-muted-foreground hover:text-foreground hover:bg-white/10'
                      }`}
                    >
                      <Icon name={item.icon} size={16} />
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Page Content */}
            <div className="max-w-7xl mx-auto">
              {renderContent()}
            </div>
          </div>
        </SidebarLayout>
      </RoleProvider>
    </MainLayout>
  );
};

export default AdminDashboardSystemManagement;
