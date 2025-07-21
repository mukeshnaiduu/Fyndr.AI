import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Icon from '../../../components/AppIcon';

export const UserManagementTab = ({ data, isEditing, onUpdate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [users] = useState([
    { id: 1, name: 'John Smith', email: 'john@example.com', role: 'job_seeker', status: 'active', lastLogin: '2 hours ago' },
    { id: 2, name: 'Sarah Johnson', email: 'sarah@techcorp.com', role: 'recruiter', status: 'active', lastLogin: '1 day ago' },
    { id: 3, name: 'Tech Solutions Inc', email: 'hr@techsolutions.com', role: 'employer', status: 'active', lastLogin: '5 minutes ago' },
    { id: 4, name: 'Mike Wilson', email: 'mike@example.com', role: 'job_seeker', status: 'inactive', lastLogin: '1 week ago' },
    { id: 5, name: 'Lisa Chen', email: 'lisa@recruiting.com', role: 'recruiter', status: 'active', lastLogin: '3 hours ago' },
  ]);

  const [userStats] = useState({
    totalUsers: 1247,
    activeUsers: 1156,
    jobSeekers: 892,
    recruiters: 234,
    employers: 121,
    newThisMonth: 89,
  });

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const handleUserAction = (userId, action) => {
    console.log(`Performing action "${action}" on user ${userId}`);
    // In real app, this would call backend APIs
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'job_seeker': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'recruiter': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'employer': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'administrator': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusColor = (status) => {
    return status === 'active' 
      ? 'text-green-600 dark:text-green-400' 
      : 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">User Management</h3>
        <Button>
          <Icon name="UserPlus" size={16} className="mr-2" />
          Add User
        </Button>
      </div>

      {/* User Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-200">Total Users</h4>
              <p className="text-xl font-bold text-blue-700 dark:text-blue-300">{userStats.totalUsers.toLocaleString()}</p>
            </div>
            <Icon name="Users" size={24} className="text-blue-600" />
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-green-900 dark:text-green-200">Job Seekers</h4>
              <p className="text-xl font-bold text-green-700 dark:text-green-300">{userStats.jobSeekers}</p>
            </div>
            <Icon name="User" size={24} className="text-green-600" />
          </div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-purple-900 dark:text-purple-200">Recruiters</h4>
              <p className="text-xl font-bold text-purple-700 dark:text-purple-300">{userStats.recruiters}</p>
            </div>
            <Icon name="UserCheck" size={24} className="text-purple-600" />
          </div>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-orange-900 dark:text-orange-200">Employers</h4>
              <p className="text-xl font-bold text-orange-700 dark:text-orange-300">{userStats.employers}</p>
            </div>
            <Icon name="Building2" size={24} className="text-orange-600" />
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          <option value="all">All Roles</option>
          <option value="job_seeker">Job Seekers</option>
          <option value="recruiter">Recruiters</option>
          <option value="employer">Employers</option>
          <option value="administrator">Administrators</option>
        </select>
        <Button variant="outline">
          <Icon name="Filter" size={16} className="mr-2" />
          More Filters
        </Button>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                      {user.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${user.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className={`text-sm font-medium ${getStatusColor(user.status)}`}>
                        {user.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {user.lastLogin}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleUserAction(user.id, 'edit')}
                    >
                      <Icon name="Edit" size={14} className="mr-1" />
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleUserAction(user.id, user.status === 'active' ? 'deactivate' : 'activate')}
                    >
                      <Icon name={user.status === 'active' ? 'UserX' : 'UserCheck'} size={14} className="mr-1" />
                      {user.status === 'active' ? 'Deactivate' : 'Activate'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk Actions */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Bulk Actions</h4>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Icon name="Mail" size={16} className="mr-2" />
            Send Notification
          </Button>
          <Button variant="outline" size="sm">
            <Icon name="Download" size={16} className="mr-2" />
            Export Users
          </Button>
          <Button variant="outline" size="sm">
            <Icon name="UserX" size={16} className="mr-2" />
            Bulk Deactivate
          </Button>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-4">Recent User Activity</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <Icon name="UserPlus" size={16} className="text-green-600" />
              <span className="text-sm text-gray-900 dark:text-gray-100">New job seeker registered: Alice Cooper</span>
            </div>
            <span className="text-sm text-gray-500">5 minutes ago</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <Icon name="Edit" size={16} className="text-blue-600" />
              <span className="text-sm text-gray-900 dark:text-gray-100">Profile updated: TechCorp (Employer)</span>
            </div>
            <span className="text-sm text-gray-500">1 hour ago</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <Icon name="UserX" size={16} className="text-red-600" />
              <span className="text-sm text-gray-900 dark:text-gray-100">Account deactivated: John Inactive</span>
            </div>
            <span className="text-sm text-gray-500">2 hours ago</span>
          </div>
        </div>
      </div>
    </div>
  );
};
