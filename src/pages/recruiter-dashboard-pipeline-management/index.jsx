import React, { useState } from 'react';
import MainLayout from 'components/layout/MainLayout'
import SidebarLayout from 'components/layout/SidebarLayout';
import { RoleProvider } from 'components/ui/RoleBasedNavigation';
import RoleBasedNavigation from 'components/ui/RoleBasedNavigation';
import UserProfileDropdown from 'components/ui/UserProfileDropdown';
import NotificationCenter from 'components/ui/NotificationCenter';
import SearchInterface from 'components/ui/SearchInterface';
import MetricsCard from './components/MetricsCard';
import PipelineVisualization from './components/PipelineVisualization';
import CandidateTable from './components/CandidateTable';
import QuickActionCards from './components/QuickActionCards';
import ActivityFeed from './components/ActivityFeed';
import JobPostingManagement from './components/JobPostingManagement';
import DEIMetrics from './components/DEIMetrics';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';

const RecruiterDashboard = () => {
  const [activeView, setActiveView] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const metricsData = [
    {
      title: 'Open Positions',
      value: '24',
      change: '+3',
      changeType: 'increase',
      icon: 'Briefcase',
      color: 'primary'
    },
    {
      title: 'Active Candidates',
      value: '156',
      change: '+12',
      changeType: 'increase',
      icon: 'Users',
      color: 'success'
    },
    {
      title: 'Interviews Scheduled',
      value: '8',
      change: '+2',
      changeType: 'increase',
      icon: 'Calendar',
      color: 'warning'
    },
    {
      title: 'Avg. Time to Hire',
      value: '28 days',
      change: '-3 days',
      changeType: 'decrease',
      icon: 'Clock',
      color: 'accent'
    }
  ];

  const handleSearch = (query, filters) => {
    console.log('Search:', query, 'Filters:', filters);
  };

  const handleFilterChange = (filters) => {
    console.log('Filters changed:', filters);
  };

  const viewComponents = {
    overview: (
      <div className="space-y-6">
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metricsData.map((metric, index) => (
            <MetricsCard
              key={index}
              title={metric.title}
              value={metric.value}
              change={metric.change}
              changeType={metric.changeType}
              icon={metric.icon}
              color={metric.color}
            />
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
          <QuickActionCards />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pipeline Visualization */}
          <div className="lg:col-span-1">
            <PipelineVisualization />
          </div>

          {/* Activity Feed */}
          <div className="lg:col-span-2">
            <ActivityFeed />
          </div>
        </div>
      </div>
    ),
    candidates: <CandidateTable />,
    jobs: <JobPostingManagement />,
    analytics: <DEIMetrics />
  };

  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: 'BarChart3' },
    { id: 'candidates', label: 'Candidates', icon: 'Users' },
    { id: 'jobs', label: 'Job Postings', icon: 'Briefcase' },
    { id: 'analytics', label: 'Analytics', icon: 'TrendingUp' }
  ];

  return (
    <RoleProvider>
      <div className="min-h-screen bg-background">
        <Header />
        
        <div className="flex pt-16">
          {/* Sidebar */}
          <div className={`fixed left-0 top-16 h-[calc(100vh-4rem)] glassmorphic border-r border-white/20 transition-all duration-300 z-40 ${
            sidebarCollapsed ? 'w-16' : 'w-64'
          }`}>
            <div className="p-4">
              {/* Sidebar Toggle */}
              <div className="flex items-center justify-between mb-6">
                {!sidebarCollapsed && (
                  <h2 className="text-lg font-semibold text-foreground">Recruiter Hub</h2>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  iconName={sidebarCollapsed ? "ChevronRight" : "ChevronLeft"}
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="hover:bg-white/10"
                />
              </div>

              {/* Search */}
              {!sidebarCollapsed && (
                <div className="mb-6">
                  <SearchInterface
                    placeholder="Search candidates, jobs..."
                    onSearch={handleSearch}
                    onFilterChange={handleFilterChange}
                  />
                </div>
              )}

              {/* Navigation */}
              <nav className="space-y-2">
                {navigationItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105 ${
                      activeView === item.id
                        ? 'bg-primary/20 text-primary border border-primary/30' :'text-foreground hover:bg-white/10'
                    }`}
                    title={sidebarCollapsed ? item.label : undefined}
                  >
                    <Icon name={item.icon} size={20} />
                    {!sidebarCollapsed && (
                      <span className="font-medium">{item.label}</span>
                    )}
                  </button>
                ))}
              </nav>

              {/* Role-based Navigation */}
              {!sidebarCollapsed && (
                <div className="mt-8">
                  <RoleBasedNavigation />
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className={`flex-1 transition-all duration-300 ${
            sidebarCollapsed ? 'ml-16' : 'ml-64'
          }`}>
            <div className="p-6">
              {/* Header Actions */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-foreground mb-2">
                    {navigationItems.find(item => item.id === activeView)?.label || 'Dashboard'}
                  </h1>
                  <p className="text-muted-foreground">
                    Manage your recruitment pipeline and track hiring metrics
                  </p>
                </div>
                
                <div className="flex items-center space-x-3">
                  <NotificationCenter />
                  <UserProfileDropdown />
                </div>
              </div>

              {/* Dynamic Content */}
              {viewComponents[activeView]}
            </div>
          </div>
        </div>
      </div>
    </RoleProvider>
  );
};

export default RecruiterDashboard;

