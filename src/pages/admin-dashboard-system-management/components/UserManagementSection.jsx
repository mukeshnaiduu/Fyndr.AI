import React, { useState } from 'react';

import Button from 'components/ui/Button';
import Input from 'components/ui/Input';
import Select from 'components/ui/Select';

const UserManagementSection = () => {
  const [users, setUsers] = useState([
    {
      id: 1,
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      role: 'jobseeker',
      status: 'active',
      lastActive: '2 hours ago',
      joinDate: '2024-01-15',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b9c5c4e4?w=150'
    },
    {
      id: 2,
      name: 'Michael Chen',
      email: 'michael.chen@company.com',
      role: 'recruiter',
      status: 'active',
      lastActive: '5 minutes ago',
      joinDate: '2024-02-20',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      email: 'emily.r@techcorp.com',
      role: 'admin',
      status: 'inactive',
      lastActive: '1 day ago',
      joinDate: '2023-11-10',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150'
    },
    {
      id: 4,
      name: 'David Kim',
      email: 'david.kim@startup.io',
      role: 'jobseeker',
      status: 'suspended',
      lastActive: '3 days ago',
      joinDate: '2024-03-05',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState([]);

  const roleOptions = [
    { value: 'all', label: 'All Roles' },
    { value: 'jobseeker', label: 'Job Seekers' },
    { value: 'recruiter', label: 'Recruiters' },
    { value: 'admin', label: 'Administrators' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'suspended', label: 'Suspended' }
  ];

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleUserSelect = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id));
    }
  };

  const handleBulkAction = (action) => {
    console.log(`Bulk action: ${action} for users:`, selectedUsers);
    setSelectedUsers([]);
  };

  const handleUserAction = (userId, action) => {
    console.log(`User action: ${action} for user:`, userId);
    if (action === 'suspend') {
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, status: 'suspended' } : user
      ));
    } else if (action === 'activate') {
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, status: 'active' } : user
      ));
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      jobseeker: 'text-accent bg-accent/10',
      recruiter: 'text-primary bg-primary/10',
      admin: 'text-warning bg-warning/10'
    };
    return colors[role] || 'text-muted-foreground bg-muted/10';
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'text-success bg-success/10',
      inactive: 'text-muted-foreground bg-muted/10',
      suspended: 'text-error bg-error/10'
    };
    return colors[status] || 'text-muted-foreground bg-muted/10';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">User Management</h3>
          <p className="text-sm text-muted-foreground">
            Manage platform users and their permissions
          </p>
        </div>
        <Button iconName="UserPlus" iconPosition="left">
          Add User
        </Button>
      </div>

      {/* Filters */}
      <div className="glassmorphic-surface p-4 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            type="search"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Select
            options={roleOptions}
            value={selectedRole}
            onChange={setSelectedRole}
            placeholder="Filter by role"
          />
          <Select
            options={statusOptions}
            value={selectedStatus}
            onChange={setSelectedStatus}
            placeholder="Filter by status"
          />
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <div className="glassmorphic-surface p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground">
              {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('activate')}
                iconName="CheckCircle"
              >
                Activate
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('suspend')}
                iconName="Ban"
              >
                Suspend
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleBulkAction('delete')}
                iconName="Trash2"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="glassmorphic-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-white/10">
              <tr>
                <th className="text-left p-4">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-white/20 bg-white/10 text-primary focus:ring-primary"
                  />
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">User</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Role</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Last Active</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Join Date</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleUserSelect(user.id)}
                      className="rounded border-white/20 bg-white/10 text-primary focus:ring-primary"
                    />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-medium text-foreground">{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">{user.lastActive}</td>
                  <td className="p-4 text-sm text-muted-foreground">{user.joinDate}</td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => console.log('Edit user:', user.id)}
                        iconName="Edit"
                      />
                      {user.status === 'active' ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleUserAction(user.id, 'suspend')}
                          iconName="Ban"
                        />
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleUserAction(user.id, 'activate')}
                          iconName="CheckCircle"
                        />
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => console.log('Delete user:', user.id)}
                        iconName="Trash2"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredUsers.length} of {users.length} users
        </p>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" disabled iconName="ChevronLeft">
            Previous
          </Button>
          <Button variant="outline" size="sm" disabled iconName="ChevronRight">
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserManagementSection;
