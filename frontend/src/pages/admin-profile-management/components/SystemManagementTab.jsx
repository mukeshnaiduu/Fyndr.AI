import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Icon from '../../../components/AppIcon';

export const SystemManagementTab = ({ data, isEditing, onUpdate }) => {
  const [systemStats] = useState({
    totalUsers: 1247,
    activeJobs: 89,
    pendingApplications: 156,
    systemUptime: '99.8%',
    lastBackup: '2 hours ago',
    storageUsed: '78%',
  });

  const [notifications, setNotifications] = useState([
    { id: 1, type: 'warning', message: 'Storage usage above 75%', time: '10 min ago' },
    { id: 2, type: 'info', message: 'Scheduled maintenance tonight 2:00 AM', time: '1 hour ago' },
    { id: 3, type: 'success', message: 'Backup completed successfully', time: '2 hours ago' },
  ]);

  const handleSystemAction = (action) => {
    console.log(`Performing system action: ${action}`);
    // In real app, this would call backend APIs
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">System Management</h3>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" onClick={() => handleSystemAction('refresh')}>
            <Icon name="RefreshCw" size={16} className="mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleSystemAction('backup')}>
            <Icon name="Download" size={16} className="mr-2" />
            Backup Now
          </Button>
        </div>
      </div>

      {/* System Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-200">Total Users</h4>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{systemStats.totalUsers.toLocaleString()}</p>
            </div>
            <Icon name="Users" size={32} className="text-blue-600" />
          </div>
          <div className="mt-4 text-sm text-blue-600 dark:text-blue-400">
            ↗ 15% from last month
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-green-900 dark:text-green-200">System Uptime</h4>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">{systemStats.systemUptime}</p>
            </div>
            <Icon name="Activity" size={32} className="text-green-600" />
          </div>
          <div className="mt-4 text-sm text-green-600 dark:text-green-400">
            30 days average
          </div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-purple-900 dark:text-purple-200">Active Jobs</h4>
              <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{systemStats.activeJobs}</p>
            </div>
            <Icon name="Briefcase" size={32} className="text-purple-600" />
          </div>
          <div className="mt-4 text-sm text-purple-600 dark:text-purple-400">
            Across all companies
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-4">System Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Storage Usage
            </label>
            <div className="flex items-center space-x-3">
              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className="bg-orange-500 h-3 rounded-full"
                  style={{ width: systemStats.storageUsed }}
                ></div>
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">{systemStats.storageUsed}</span>
            </div>
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">⚠ Consider cleanup or expansion</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Last Backup
            </label>
            <Input
              value={systemStats.lastBackup}
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Pending Applications
            </label>
            <Input
              value={systemStats.pendingApplications.toString()}
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Database Status
            </label>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-900 dark:text-gray-100">Operational</span>
            </div>
          </div>
        </div>
      </div>

      {/* System Notifications */}
      <div>
        <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-4">System Notifications</h4>
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg border ${notification.type === 'warning'
                  ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                  : notification.type === 'success'
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                    : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Icon
                    name={notification.type === 'warning' ? 'AlertTriangle' : notification.type === 'success' ? 'CheckCircle' : 'Info'}
                    size={20}
                    className={
                      notification.type === 'warning'
                        ? 'text-yellow-600'
                        : notification.type === 'success'
                          ? 'text-green-600'
                          : 'text-blue-600'
                    }
                  />
                  <span className={`text-sm font-medium ${notification.type === 'warning'
                      ? 'text-yellow-900 dark:text-yellow-200'
                      : notification.type === 'success'
                        ? 'text-green-900 dark:text-green-200'
                        : 'text-blue-900 dark:text-blue-200'
                    }`}>
                    {notification.message}
                  </span>
                </div>
                <span className={`text-xs ${notification.type === 'warning'
                    ? 'text-yellow-600 dark:text-yellow-400'
                    : notification.type === 'success'
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-blue-600 dark:text-blue-400'
                  }`}>
                  {notification.time}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-4">Quick Actions</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button variant="outline" onClick={() => handleSystemAction('maintenance')}>
            <Icon name="Settings" size={16} className="mr-2" />
            Maintenance Mode
          </Button>
          <Button variant="outline" onClick={() => handleSystemAction('cleanup')}>
            <Icon name="Trash2" size={16} className="mr-2" />
            System Cleanup
          </Button>
          <Button variant="outline" onClick={() => handleSystemAction('logs')}>
            <Icon name="FileText" size={16} className="mr-2" />
            View Logs
          </Button>
          <Button variant="outline" onClick={() => handleSystemAction('security')}>
            <Icon name="Shield" size={16} className="mr-2" />
            Security Scan
          </Button>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
        <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-4">Performance Metrics</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Response Time
            </label>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">245ms</div>
            <div className="text-sm text-green-600 dark:text-green-400">↗ 12% faster</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Error Rate
            </label>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">0.05%</div>
            <div className="text-sm text-green-600 dark:text-green-400">↘ 0.02% lower</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Concurrent Users
            </label>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">847</div>
            <div className="text-sm text-blue-600 dark:text-blue-400">Real-time</div>
          </div>
        </div>
      </div>
    </div>
  );
};
