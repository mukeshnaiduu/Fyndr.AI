import React, { useState, useEffect } from 'react';

import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';
import Input from 'components/ui/Input';
import MainLayout from 'components/layout/MainLayout';
import TeamMetricsCard from './components/TeamMetricsCard';
import TeamMemberCard from './components/TeamMemberCard';
import InviteTeamModal from './components/InviteTeamModal';
import TeamFilters from './components/TeamFilters';
import ActivityFeed from './components/ActivityFeed';
import BulkActionsBar from './components/BulkActionsBar';
import UserManagementModal from './components/UserManagementModal';

const TeamManagementDashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [filters, setFilters] = useState({});
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // grid, list

  // Mock team data
  const teamMetrics = [
    {
      title: 'Active Members',
      value: '24',
      change: { type: 'increase', value: '+3 this month' },
      icon: 'Users',
      color: 'primary'
    },
    {
      title: 'Pending Invitations',
      value: '6',
      change: { type: 'decrease', value: '-2 from last week' },
      icon: 'UserPlus',
      color: 'warning'
    },
    {
      title: 'Admin Users',
      value: '4',
      icon: 'Shield',
      color: 'success'
    },
    {
      title: 'Online Now',
      value: '18',
      change: { type: 'increase', value: '+5 from yesterday' },
      icon: 'Activity',
      color: 'accent'
    }
  ];

  const teamMembers = [
    {
      id: 1,
      name: 'Sarah Johnson',
      email: 'sarah.johnson@fyndr.ai',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b9b5c0e2?w=150',
      role: 'admin',
      department: 'hr',
      status: 'active',
      lastLogin: '2 hours ago',
      permissions: ['view_candidates', 'manage_jobs', 'schedule_interviews', 'send_offers', 'view_analytics', 'manage_team'],
      stats: { jobsPosted: 45, candidatesReviewed: 234, interviewsScheduled: 89, hiresMade: 23 },
      isActive: true
    },
    {
      id: 2,
      name: 'Michael Chen',
      email: 'michael.chen@fyndr.ai',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      role: 'manager',
      department: 'engineering',
      status: 'active',
      lastLogin: '30 minutes ago',
      permissions: ['view_candidates', 'manage_jobs', 'schedule_interviews', 'view_analytics'],
      stats: { jobsPosted: 32, candidatesReviewed: 156, interviewsScheduled: 67, hiresMade: 18 },
      isActive: true
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      email: 'emily.rodriguez@fyndr.ai',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      role: 'recruiter',
      department: 'hr',
      status: 'away',
      lastLogin: '1 day ago',
      permissions: ['view_candidates', 'schedule_interviews', 'view_analytics'],
      stats: { jobsPosted: 28, candidatesReviewed: 189, interviewsScheduled: 78, hiresMade: 15 },
      isActive: true
    },
    {
      id: 4,
      name: 'David Kim',
      email: 'david.kim@fyndr.ai',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      role: 'recruiter',
      department: 'marketing',
      status: 'offline',
      lastLogin: '3 days ago',
      permissions: ['view_candidates', 'schedule_interviews'],
      stats: { jobsPosted: 19, candidatesReviewed: 98, interviewsScheduled: 45, hiresMade: 12 },
      isActive: true
    },
    {
      id: 5,
      name: 'Lisa Thompson',
      email: 'lisa.thompson@fyndr.ai',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      role: 'coordinator',
      department: 'operations',
      status: 'active',
      lastLogin: '15 minutes ago',
      permissions: ['view_candidates', 'schedule_interviews'],
      stats: { jobsPosted: 12, candidatesReviewed: 67, interviewsScheduled: 34, hiresMade: 8 },
      isActive: true
    },
    {
      id: 6,
      name: 'James Wilson',
      email: 'james.wilson@fyndr.ai',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      role: 'viewer',
      department: 'sales',
      status: 'active',
      lastLogin: '1 hour ago',
      permissions: ['view_candidates'],
      stats: { jobsPosted: 5, candidatesReviewed: 23, interviewsScheduled: 12, hiresMade: 3 },
      isActive: true
    }
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'user_added',
      user: { name: 'Sarah Johnson', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b9b5c0e2?w=150' },
      description: 'added a new team member',
      details: 'Michael Chen joined as Manager',
      timestamp: new Date(Date.now() - 300000)
    },
    {
      id: 2,
      type: 'role_changed',
      user: { name: 'Emily Rodriguez', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150' },
      description: 'updated role permissions',
      details: 'Added interview scheduling permissions',
      timestamp: new Date(Date.now() - 900000)
    },
    {
      id: 3,
      type: 'login',
      user: { name: 'David Kim', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150' },
      description: 'logged in',
      timestamp: new Date(Date.now() - 1800000)
    },
    {
      id: 4,
      type: 'permission_updated',
      user: { name: 'Lisa Thompson', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150' },
      description: 'permissions were updated',
      details: 'Analytics access granted',
      timestamp: new Date(Date.now() - 3600000)
    }
  ];

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = !filters.role || member.role === filters.role;
    const matchesDepartment = !filters.department || member.department === filters.department;
    const matchesStatus = !filters.status || member.status === filters.status;

    return matchesSearch && matchesRole && matchesDepartment && matchesStatus;
  });

  const handleMemberSelect = (memberId) => {
    setSelectedMembers(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleSelectAll = () => {
    setSelectedMembers(filteredMembers.map(member => member.id));
  };

  const handleDeselectAll = () => {
    setSelectedMembers([]);
  };

  const handleInviteTeam = (inviteData) => {
    console.log('Inviting team members:', inviteData);
    // Handle team invitation logic
  };

  const handleRoleChange = (memberId) => {
    const member = teamMembers.find(m => m.id === memberId);
    setSelectedUser(member);
    setIsUserModalOpen(true);
  };

  const handleManageAccess = (memberId) => {
    const member = teamMembers.find(m => m.id === memberId);
    setSelectedUser(member);
    setIsUserModalOpen(true);
  };

  const handleMessage = (memberId) => {
    console.log('Messaging member:', memberId);
    // Handle messaging logic
  };

  const handleUserSave = (userData) => {
    console.log('Saving user data:', userData);
    // Handle user data save logic
  };

  const handleBulkRoleChange = () => {
    console.log('Bulk role change for:', selectedMembers);
    // Handle bulk role change logic
  };

  const handleBulkDelete = () => {
    console.log('Bulk delete for:', selectedMembers);
    // Handle bulk delete logic
  };

  const handleBulkExport = () => {
    console.log('Bulk export for:', selectedMembers);
    // Handle bulk export logic
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Team Management</h1>
            <p className="text-muted-foreground">
              Manage your hiring team members, assign roles, and oversee collaborative workflows
            </p>
          </div>

          <div className="flex items-center space-x-3 mt-4 lg:mt-0">
            <Button
              variant="outline"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              iconName={viewMode === 'grid' ? 'List' : 'Grid3X3'}
              iconPosition="left"
            >
              {viewMode === 'grid' ? 'List View' : 'Grid View'}
            </Button>
            <Button
              onClick={() => setIsInviteModalOpen(true)}
              iconName="UserPlus"
              iconPosition="left"
            >
              Invite Team
            </Button>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {teamMetrics.map((metric, index) => (
            <TeamMetricsCard
              key={index}
              title={metric.title}
              value={metric.value}
              change={metric.change}
              icon={metric.icon}
              color={metric.color}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Search and Filters */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Icon
                    name="Search"
                    size={20}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    type="text"
                    placeholder="Search team members..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    iconName="Download"
                    iconPosition="left"
                  >
                    Export
                  </Button>
                </div>
              </div>

              <TeamFilters
                onFilterChange={setFilters}
                activeFilters={filters}
              />
            </div>

            {/* Bulk Actions */}
            <BulkActionsBar
              selectedCount={selectedMembers.length}
              totalCount={filteredMembers.length}
              onSelectAll={handleSelectAll}
              onDeselectAll={handleDeselectAll}
              onBulkRoleChange={handleBulkRoleChange}
              onBulkDelete={handleBulkDelete}
              onBulkExport={handleBulkExport}
            />

            {/* Team Members Grid */}
            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'
              }`}>
              {filteredMembers.map((member) => (
                <div key={member.id} className="relative">
                  {/* Selection Checkbox */}
                  <div className="absolute top-4 left-4 z-10">
                    <input
                      type="checkbox"
                      checked={selectedMembers.includes(member.id)}
                      onChange={() => handleMemberSelect(member.id)}
                      className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary"
                    />
                  </div>

                  <TeamMemberCard
                    member={member}
                    onRoleChange={handleRoleChange}
                    onMessage={handleMessage}
                    onManageAccess={handleManageAccess}
                  />
                </div>
              ))}
            </div>

            {/* Empty State */}
            {filteredMembers.length === 0 && (
              <div className="text-center py-12">
                <Icon name="Users" size={48} className="text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No team members found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || Object.values(filters).some(Boolean)
                    ? 'Try adjusting your search or filters' : 'Start by inviting team members to collaborate'
                  }
                </p>
                <Button
                  onClick={() => setIsInviteModalOpen(true)}
                  iconName="UserPlus"
                  iconPosition="left"
                >
                  Invite Team Members
                </Button>
              </div>
            )}
          </div>

          {/* Activity Sidebar */}
          <div className="lg:col-span-1">
            <ActivityFeed activities={recentActivities} />
          </div>
        </div>
      </div>

      {/* Modals */}
      <InviteTeamModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onInvite={handleInviteTeam}
      />

      <UserManagementModal
        isOpen={isUserModalOpen}
        onClose={() => {
          setIsUserModalOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onSave={handleUserSave}
      />
    </MainLayout>
  );
};

export default TeamManagementDashboard;

