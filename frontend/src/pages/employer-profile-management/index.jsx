import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import { CompanyBrandingTab } from './components/CompanyBrandingTab';
import { AnalyticsReportsTab } from './components/AnalyticsReportsTab';

const EmployerProfileManagement = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('branding');
  const [employerProfile, setEmployerProfile] = useState(null);
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
        if (data.role !== 'employer') {
          navigate('/404');
          return;
        }

        setEmployerProfile(data);
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        navigate('/authentication-login-register');
      }
    };

    fetchProfile();
  }, [navigate]);

  const tabsConfig = [
    {
      id: 'branding',
      label: 'Company Branding',
      icon: 'Palette',
    },
    {
      id: 'analytics',
      label: 'Analytics & Reports',
      icon: 'BarChart3',
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
      setEmployerProfile(data);
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
      case 'branding':
        return (
          <CompanyBrandingTab
            data={employerProfile}
            isEditing={isEditing}
            onUpdate={handleUpdateProfile}
          />
        );
      case 'analytics':
        return (
          <AnalyticsReportsTab
            data={employerProfile}
            isEditing={isEditing}
            onUpdate={handleUpdateProfile}
          />
        );
      default:
        return (
          <CompanyBrandingTab
            data={employerProfile}
            isEditing={isEditing}
            onUpdate={handleUpdateProfile}
          />
        );
    }
  };

  if (!employerProfile) {
    return (
      <MainLayout title="Employer Profile" description="Loading employer profile...">
        <div className="flex items-center justify-center min-h-[400px]">
          <span className="text-lg text-gray-500">Loading profile...</span>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      title="Employer Profile Management"
      description="Manage your company branding and analytics"
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
          <span className="text-gray-900 dark:text-gray-100">Employer Profile</span>
        </nav>

        {/* Header Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <Icon name="Crown" size={32} className="text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {employerProfile.company_name || 'Employer Profile'}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    {employerProfile.industry || 'Industry'} • Employer Account
                  </p>
                  {lastSaved && (
                    <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                      Last saved: {new Date(lastSaved).toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  variant={isEditing ? "outline" : "default"}
                  onClick={() => setIsEditing(!isEditing)}
                  disabled={isSaving}
                >
                  <Icon name={isEditing ? "X" : "Edit"} size={16} className="mr-2" />
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </Button>
                {isEditing && (
                  <Button
                    onClick={() => {
                      setIsEditing(false);
                    }}
                    disabled={isSaving}
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                )}
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
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${activeTab === tab.id
                      ? 'border-purple-500 text-purple-600 dark:text-purple-400'
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
              Export Analytics
            </Button>
            <Button>
              <Icon name="Save" size={16} className="mr-2" />
              Save All Changes
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default EmployerProfileManagement;
