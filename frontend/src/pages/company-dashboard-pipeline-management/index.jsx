import React, { useState } from 'react';
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
import MainLayout from 'components/layout/MainLayout';

const CompanyDashboard = () => {
    const [activeView, setActiveView] = useState('overview');
    const [selectedJobId, setSelectedJobId] = useState(null);
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
    candidates: (
        selectedJobId ? (
            <CandidateTable jobId={selectedJobId} />
        ) : (
            <div className="glassmorphic-card p-10 text-center">
                <div className="flex flex-col items-center justify-center space-y-3">
                    <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 7h18" />
                            <path d="M3 12h18" />
                            <path d="M3 17h18" />
                        </svg>
                    </span>
                    <h3 className="text-lg font-semibold text-foreground">Select a job to view candidates</h3>
                    <p className="text-sm text-muted-foreground">Go to the Job Postings tab and pick a job to see its applicant pipeline here.</p>
                </div>
            </div>
        )
    ),
    jobs: <JobPostingManagement selectedJobId={selectedJobId} onSelectJob={(id) => { setSelectedJobId(id); setActiveView('candidates'); }} />,
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
            <MainLayout title={(navigationItems.find(item => item.id === activeView)?.label || 'Dashboard') + ' - Fyndr.AI'} description="Manage your recruitment pipeline and track hiring metrics">
                <div className="flex flex-1">
                    <main className="flex-1 pt-0">
                        <div className="p-3">
                            {/* Header Actions
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
                            </div> */}

                            {/* Dynamic Content */}
                            {viewComponents[activeView]}
                        </div>
                    </main>
                </div>
            </MainLayout>
        </RoleProvider>
    );
};

export default CompanyDashboard;

