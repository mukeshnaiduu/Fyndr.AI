import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Icon from '../../components/AppIcon';
import { CompanyInfoTab } from './components/CompanyInfoTab';
import { DiversityTab } from './components/DiversityTab';
import { BillingTab } from './components/BillingTab';
import { getApiUrl } from 'utils/api';

const CompanyProfileManagement = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('company');
  const [companyProfile, setCompanyProfile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [logoError, setLogoError] = useState('');
  const fileInputRef = useRef(null);
  const saveHandlersRef = useRef({});

  const registerSave = (tabId, fn) => {
    if (!tabId) return;
    saveHandlersRef.current[tabId] = fn;
  };

  const saveAllTabs = async () => {
    setIsSaving(true);
    try {
      const handlers = Object.values(saveHandlersRef.current).filter(Boolean);
      for (const fn of handlers) {
        const maybePromise = fn();
        if (maybePromise && typeof maybePromise.then === 'function') {
          await maybePromise;
        }
      }
      setIsEditing(false);
      setLastSaved(Date.now());
    } finally {
      setIsSaving(false);
    }
  };
  // Precompute a tokenized, cache-busted logo URL for header avatar
  const token = typeof window !== 'undefined' ? (localStorage.getItem('accessToken') || '') : '';
  const avatarVersion = typeof window !== 'undefined' ? (localStorage.getItem('avatarVersion') || '') : '';
  const headerLogoUrl = companyProfile?.logo_url
    ? `${companyProfile.logo_url}${companyProfile.logo_url.includes('?') ? '&' : '?'}token=${token}${avatarVersion ? `&t=${avatarVersion}` : ''}`
    : '';

  const handleHeaderLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoError('');
    if (file.size > 5 * 1024 * 1024) {
      setLogoError('Logo must be under 5MB');
      return;
    }
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setLogoError('Allowed types: JPG, PNG, GIF, WEBP');
      return;
    }
    try {
      setIsUploadingLogo(true);
      const token = localStorage.getItem('accessToken');
      const fd = new FormData();
      fd.append('file', file);
      fd.append('type', 'logo');
      const res = await fetch(getApiUrl('/auth/upload/'), {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.error || 'Upload failed');
      // Update profile state
      setCompanyProfile((prev) => ({ ...(prev || {}), logo_url: data.url }));
      // Bump avatar cache and update global user avatar for navbar
      try {
        localStorage.setItem('avatarVersion', Date.now().toString());
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const userObj = JSON.parse(userStr);
          userObj.avatar = data.url;
          userObj.profile_image_url = data.url;
          userObj.logo_url = data.url;
          userObj.logo = data.url;
          localStorage.setItem('user', JSON.stringify(userObj));
          window.dispatchEvent(new Event('avatar-updated'));
          window.dispatchEvent(new StorageEvent('storage', { key: 'user', newValue: JSON.stringify(userObj) }));
        }
      } catch { }
      setIsUploadingLogo(false);
    } catch (err) {
      setLogoError('Logo upload failed. Try again.');
      setIsUploadingLogo(false);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleHeaderLogoRemove = async () => {
    if (!window.confirm('Remove company logo?')) return;
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(getApiUrl('/auth/profile/'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ profile: { logo_url: '' } }),
      });
      if (!res.ok) throw new Error('Failed to remove logo');
      setCompanyProfile((prev) => ({ ...(prev || {}), logo_url: '' }));
      try {
        localStorage.setItem('avatarVersion', Date.now().toString());
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const userObj = JSON.parse(userStr);
          userObj.avatar = '';
          userObj.profile_image_url = '';
          userObj.logo_url = '';
          userObj.logo = '';
          localStorage.setItem('user', JSON.stringify(userObj));
          window.dispatchEvent(new Event('avatar-updated'));
          window.dispatchEvent(new StorageEvent('storage', { key: 'user', newValue: JSON.stringify(userObj) }));
        }
      } catch { }
    } catch (err) {
      alert('Failed to remove logo.');
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          navigate('/authentication-login-register');
          return;
        }
        const res = await fetch(getApiUrl('/auth/profile/'), {
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
        if (data.role !== 'company') {
          navigate('/404');
          return;
        }
        const profile = data.profile || {};
        // Normalize logo into logo_url for consistency if server uses a different key
        if (!profile.logo_url && profile.logo) {
          profile.logo_url = profile.logo;
        }
        setCompanyProfile(profile);
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        navigate('/authentication-login-register');
      }
    };

    fetchProfile();
  }, [navigate]);

  const tabsConfig = [
    {
      id: 'company',
      label: 'Company Info',
      icon: 'Building2',
    },
    {
      id: 'diversity',
      label: 'Diversity & Inclusion',
      icon: 'Heart',
    },
    {
      id: 'billing',
      label: 'Billing & Plans',
      icon: 'CreditCard',
    }
  ];

  const handleUpdateProfile = async (updatedData) => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(getApiUrl('/auth/profile/'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ profile: updatedData }),
      });
      if (!res.ok) throw new Error('Failed to update profile');
      const data = await res.json();
      setCompanyProfile(data.profile || updatedData);
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
      case 'company':
        return (
          <CompanyInfoTab
            profile={companyProfile}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            onUpdate={handleUpdateProfile}
            registerSave={(fn) => registerSave('company', fn)}
          />
        );
      // Team & Hiring tab removed as requested
      case 'diversity':
        return (
          <DiversityTab
            profile={companyProfile}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            onUpdate={handleUpdateProfile}
            registerSave={(fn) => registerSave('diversity', fn)}
          />
        );
      case 'billing':
        return (
          <BillingTab
            profile={companyProfile}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            onUpdate={handleUpdateProfile}
            registerSave={(fn) => registerSave('billing', fn)}
          />
        );
      default:
        return (
          <CompanyInfoTab
            data={companyProfile}
            isEditing={isEditing}
            onUpdate={handleUpdateProfile}
          />
        );
    }
  };

  if (!companyProfile) {
    return (
      <MainLayout title="Company Profile" description="Loading company profile...">
        <div className="flex items-center justify-center min-h-[400px]">
          <span className="text-lg text-gray-500">Loading profile...</span>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      title="Company Profile Management"
      description="Manage your company information and recruiting preferences"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
          <button
            onClick={() => navigate('/company-dashboard-pipeline-management')}
            className="hover:text-gray-700 dark:hover:text-gray-300"
          >
            Dashboard
          </button>
          <Icon name="ChevronRight" size={16} />
          <span className="text-gray-900 dark:text-gray-100">Company Profile</span>
        </nav>

        {/* Header Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative w-16 h-16">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-sm bg-white dark:bg-gray-800 flex items-center justify-center">
                    {headerLogoUrl ? (
                      <img src={headerLogoUrl} alt="Company Logo" className="w-full h-full object-cover" />
                    ) : (
                      <Icon name="Building2" size={28} className="text-gray-400" />
                    )}
                    {isUploadingLogo && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full">
                        <Icon name="Loader2" size={18} className="animate-spin text-white" />
                      </div>
                    )}
                  </div>
                  {isEditing && (
                    <>
                      <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors shadow-md">
                        <Icon name="Camera" size={14} className="text-white" />
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleHeaderLogoUpload}
                          className="hidden"
                        />
                      </label>
                      {headerLogoUrl && (
                        <button
                          type="button"
                          onClick={handleHeaderLogoRemove}
                          className="absolute -bottom-2 right-8 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-md"
                        >
                          <Icon name="Trash" size={14} className="text-white" />
                        </button>
                      )}
                    </>
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {companyProfile.company_name || 'Company Profile'}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    {companyProfile.industry || 'Technology'} • {companyProfile.company_size || 'Company size not specified'}
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
                  <Button onClick={saveAllTabs} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                )}
              </div>
            </div>
            {logoError && (
              <p className="text-sm text-red-500 mt-2">{logoError}</p>
            )}
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
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
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

        {/* Footer action buttons removed as requested */}
      </div>
    </MainLayout>
  );
};

export default CompanyProfileManagement;
