import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../../components/layout/MainLayout';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Icon } from '../../components/AppIcon';

const RecruiterProfileManagement = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('personal');
    const [recruiterProfile, setRecruiterProfile] = useState(null);
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

                // Set the profile data regardless of role
                // This allows the page to work for recruiters while avoiding navigation loops
                setRecruiterProfile(data);
            } catch (err) {
                console.error('Failed to fetch profile:', err);
                navigate('/authentication-login-register');
            }
        };

        fetchProfile();
    }, [navigate]);

    const tabsConfig = [
        {
            id: 'personal',
            label: 'Personal Info',
            icon: 'User',
        },
        {
            id: 'experience',
            label: 'Experience',
            icon: 'Briefcase',
        },
        {
            id: 'preferences',
            label: 'Preferences',
            icon: 'Settings',
        },
        {
            id: 'notifications',
            label: 'Notifications',
            icon: 'Bell',
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
            setRecruiterProfile(data);
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
            setIsEditing(false);
        }
    };

    if (!recruiterProfile) {
        return (
            <MainLayout title="Recruiter Profile" description="Loading recruiter profile...">
                <div className="flex items-center justify-center h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout
            title="Recruiter Profile Management"
            description="Manage your recruiter profile and preferences"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center mb-4 md:mb-0">
                            <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                                {recruiterProfile.profile_image ? (
                                    <img
                                        src={recruiterProfile.profile_image}
                                        alt="Profile"
                                        className="h-16 w-16 rounded-full object-cover"
                                    />
                                ) : (
                                    <Icon name="User" className="h-8 w-8 text-blue-500" />
                                )}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    {recruiterProfile.first_name || ''} {recruiterProfile.last_name || ''}
                                </h1>
                                <p className="text-gray-600">
                                    {recruiterProfile.title || 'Recruiter'} • {recruiterProfile.company_name || 'Company'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            {lastSaved && (
                                <span className="text-sm text-gray-500">
                                    Last saved: {new Date(lastSaved).toLocaleString()}
                                </span>
                            )}
                            <Button
                                variant={isEditing ? "outline" : "default"}
                                onClick={() => setIsEditing(!isEditing)}
                            >
                                {isEditing ? 'Cancel' : 'Edit Profile'}
                            </Button>
                            {isEditing && (
                                <Button
                                    variant="primary"
                                    onClick={handleUpdateProfile}
                                    loading={isSaving}
                                >
                                    Save Changes
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tabs & Content */}
                <div className="bg-white rounded-lg shadow-md">
                    <div className="border-b border-gray-200">
                        <nav className="flex overflow-x-auto">
                            {tabsConfig.map((tab) => (
                                <button
                                    key={tab.id}
                                    className={`px-4 py-4 text-sm font-medium whitespace-nowrap flex items-center ${activeTab === tab.id
                                        ? 'border-b-2 border-blue-500 text-blue-600'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                    onClick={() => setActiveTab(tab.id)}
                                >
                                    <Icon name={tab.icon} className="mr-2 h-5 w-5" />
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="p-6">
                        {activeTab === 'personal' && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold">Personal Information</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label="First Name"
                                        value={recruiterProfile.first_name || ''}
                                        readOnly={!isEditing}
                                        onChange={(e) => setRecruiterProfile({
                                            ...recruiterProfile,
                                            first_name: e.target.value
                                        })}
                                    />
                                    <Input
                                        label="Last Name"
                                        value={recruiterProfile.last_name || ''}
                                        readOnly={!isEditing}
                                        onChange={(e) => setRecruiterProfile({
                                            ...recruiterProfile,
                                            last_name: e.target.value
                                        })}
                                    />
                                    <Input
                                        label="Email"
                                        type="email"
                                        value={recruiterProfile.email || ''}
                                        readOnly
                                    />
                                    <Input
                                        label="Phone"
                                        value={recruiterProfile.phone || ''}
                                        readOnly={!isEditing}
                                        onChange={(e) => setRecruiterProfile({
                                            ...recruiterProfile,
                                            phone: e.target.value
                                        })}
                                    />
                                    <Input
                                        label="Job Title"
                                        value={recruiterProfile.title || ''}
                                        readOnly={!isEditing}
                                        onChange={(e) => setRecruiterProfile({
                                            ...recruiterProfile,
                                            title: e.target.value
                                        })}
                                    />
                                    <Input
                                        label="Company"
                                        value={recruiterProfile.company_name || ''}
                                        readOnly={!isEditing}
                                        onChange={(e) => setRecruiterProfile({
                                            ...recruiterProfile,
                                            company_name: e.target.value
                                        })}
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === 'experience' && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold">Professional Experience</h2>
                                {/* Experience fields would go here */}
                                <p className="text-gray-500">Experience tab content will be implemented in future updates.</p>
                            </div>
                        )}

                        {activeTab === 'preferences' && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold">Preferences</h2>
                                {/* Preferences fields would go here */}
                                <p className="text-gray-500">Preferences tab content will be implemented in future updates.</p>
                            </div>
                        )}

                        {activeTab === 'notifications' && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold">Notification Settings</h2>
                                {/* Notification settings would go here */}
                                <p className="text-gray-500">Notification settings will be implemented in future updates.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default RecruiterProfileManagement;
