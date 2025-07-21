import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import { SystemManagementTab } from './components/SystemManagementTab';
import { UserManagementTab } from './components/UserManagementTab';

const AdminProfileManagement = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('system');
  const [adminProfile, setAdminProfile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch('/api/auth/profile/', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          navigate('/authentication-login-register');
          return;
        }
        const data = await res.json();
        
        // Check role authorization
        if (data.role !== 'administrator') {
          navigate('/404');
          return;
        }
        
        setAdminProfile(data);
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        navigate('/authentication-login-register');
      }
    };

    fetchProfile();
  }, [navigate]);

  const tabsConfig = [
    {
      id: 'system',
      label: 'System Management',
      icon: 'Settings',
    },
    {
      id: 'users',
      label: 'User Management',
      icon: 'Users',
    }
  ];

  const handleUpdateProfile = async (updatedData) => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/auth/profile/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      });
      if (!res.ok) throw new Error('Failed to update profile');
      const data = await res.json();
      setAdminProfile(data);
      setLastSaved(Date.now());
      
      // Success feedback
      const successMessage = document.createElement('div');
      successMessage.className = 'fixed top-20 right-4 bg-green-500 text-white px-4 py-2 rounded-lg z-50';
      successMessage.textContent = 'Profile updated successfully!';
      document.body.appendChild(successMessage);
      setTimeout(() => {
        document.body.removeChild(successMessage);
      }, 3000);
    } catch (err) {
      alert('Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'system':
        return (
          <SystemManagementTab 
            data={adminProfile}
            isEditing={isEditing}
            onUpdate={handleUpdateProfile}
          />
        );
      case 'users':
        return (
          <UserManagementTab 
            data={adminProfile}
            isEditing={isEditing}
            onUpdate={handleUpdateProfile}
          />
        );
      default:
        return (
          <SystemManagementTab 
            data={adminProfile}
            isEditing={isEditing}
            onUpdate={handleUpdateProfile}
          />
        );
    }
  };

  if (!adminProfile) {
    return (
      <MainLayout title="Admin Profile" description="Loading admin profile...">
        <div className="flex items-center justify-center min-h-[400px]">
          <span className="text-lg text-gray-500">Loading profile...</span>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      title="Administrator Profile Management"
      description="Manage system settings and user accounts"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
          <button
            onClick={() => navigate('/admin-dashboard-system-management')}
            className="hover:text-gray-700 dark:hover:text-gray-300"
          >
            Dashboard
          </button>
          <Icon name="ChevronRight" size={16} />
          <span className="text-gray-900 dark:text-gray-100">Admin Profile</span>
        </nav>

        {/* Header Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <Icon name="Shield" size={32} className="text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    System Administrator
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    {adminProfile.email || 'admin@fyndr.ai'} • Administrator Account
                  </p>
                  {lastSaved && (
                    <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                      Last saved: {new Date(lastSaved).toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 px-3 py-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-700 dark:text-green-300">System Online</span>
                </div>
                <Button variant="outline">
                  <Icon name="Bell" size={16} className="mr-2" />
                  Notifications
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              {tabsConfig.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-red-500 text-red-600 dark:text-red-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon name={tab.icon} size={16} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {renderTabContent()}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => navigate('/admin-dashboard-system-management')}
          >
            <Icon name="ArrowLeft" size={16} className="mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="flex space-x-3">
            <Button variant="outline">
              <Icon name="Download" size={16} className="mr-2" />
              Export System Report
            </Button>
            <Button variant="outline">
              <Icon name="AlertTriangle" size={16} className="mr-2" />
              Emergency Actions
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminProfileManagement;
