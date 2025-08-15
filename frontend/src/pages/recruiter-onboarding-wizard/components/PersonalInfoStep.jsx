import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Icon from 'components/AppIcon';
import Input from 'components/ui/Input';
import LocationInput from 'components/ui/LocationInput';
import Button from 'components/ui/Button';
import Image from 'components/AppImage';
import { getApiUrl } from 'utils/api';
import RoleInput from 'components/ui/RoleInput';

const PersonalInfoStep = ({ data, onUpdate, onNext, onPrev }) => {
    const [formData, setFormData] = useState({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || '',
        phone: data.phone || '',
        location: data.location || '',
        profileImage: data.profileImage || null,
        linkedinUrl: data.linkedinUrl || '',
        jobTitle: data.jobTitle || '',
        ...data
    });

    React.useEffect(() => {
        setFormData(prev => ({
            ...prev,
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            email: data.email || '',
        }));
    }, [data.firstName, data.lastName, data.email]);

    React.useEffect(() => {
        const rawUrl = (data && (
            (data.profileImageFile && data.profileImageFile.url) ||
            data.profileImageUrl ||
            data.profile_image_url ||
            (typeof data.profile_image === 'string' ? data.profile_image : '')
        )) || '';
        if (!rawUrl) return;
        const tokenForFiles = localStorage.getItem('accessToken') || '';
        const base = `${rawUrl}${rawUrl.includes('?') ? '&' : '?'}token=${tokenForFiles}`;
        const displayUrl = `${base}&t=${Date.now()}`;
        setFormData(prev => ({
            ...prev,
            profileImage: displayUrl,
            profileImageFile: prev.profileImageFile || { url: rawUrl },
        }));
    }, [data?.profileImageFile?.url, data?.profileImageUrl, data?.profile_image_url, data?.profile_image]);

    const [errors, setErrors] = useState({});
    const [isUploading, setIsUploading] = useState(false);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            setErrors(prev => ({ ...prev, profileImage: 'Image size must be less than 5MB' }));
            return;
        }

        setIsUploading(true);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', 'profile_image');

            const token = localStorage.getItem('accessToken');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch(getApiUrl('/auth/upload/'), {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Upload failed');
            }

            const uploadResult = await response.json();
            const tokenForFiles = localStorage.getItem('accessToken') || '';
            const baseUrlWithToken = uploadResult.url
                ? `${uploadResult.url}${uploadResult.url.includes('?') ? '&' : '?'}token=${tokenForFiles}`
                : '';
            const urlWithToken = baseUrlWithToken ? `${baseUrlWithToken}&t=${Date.now()}` : '';
            setFormData(prev => ({
                ...prev,
                profileImage: urlWithToken,
                profileImageFile: {
                    name: uploadResult.filename,
                    url: uploadResult.url,
                    size: uploadResult.size,
                    uploadedAt: uploadResult.uploaded_at
                }
            }));
            localStorage.setItem('avatarVersion', Date.now().toString());
            try {
                const userStr = localStorage.getItem('user');
                if (userStr) {
                    const userObj = JSON.parse(userStr);
                    userObj.profile_image_url = uploadResult.url;
                    localStorage.setItem('user', JSON.stringify(userObj));
                    window.dispatchEvent(new Event('avatar-updated'));
                    window.dispatchEvent(new StorageEvent('storage', { key: 'user', newValue: JSON.stringify(userObj) }));
                }
            } catch { }
            setIsUploading(false);

            if (errors.profileImage) {
                setErrors(prev => ({ ...prev, profileImage: '' }));
            }
        } catch (error) {
            console.error('Profile image upload failed:', error);
            setErrors(prev => ({ ...prev, profileImage: `Upload failed: ${error.message}` }));
            setIsUploading(false);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!/^\+?[\d\s\-\(\)]{10,}$/.test(formData.phone)) {
            newErrors.phone = 'Please enter a valid phone number';
        }

        if (!formData.location) newErrors.location = 'Location is required';
        if (!formData.jobTitle?.trim()) newErrors.jobTitle = 'Role is required';

        // Optional URL validations
        const urlPattern = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/\S*)?$/i;
        if (formData.linkedinUrl && !urlPattern.test(formData.linkedinUrl.trim())) {
            newErrors.linkedinUrl = 'Enter a valid LinkedIn URL';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateForm()) {
            onUpdate(formData);
            onNext();
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                    Let's start with your basic information
                </h2>
                <p className="text-muted-foreground">
                    This helps us create your recruiter profile and tailor your experience
                </p>
            </div>

            {/* Profile Image Upload */}
            <div className="flex justify-center mb-8">
                <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gradient-primary flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                        {formData.profileImage ? (
                            <Image
                                src={formData.profileImage}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <Icon name="User" size={32} color="white" />
                        )}

                        {isUploading && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full">
                                <div className="animate-spin">
                                    <Icon name="Loader2" size={20} color="white" />
                                </div>
                            </div>
                        )}
                    </div>

                    <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors shadow-lg">
                        <Icon name="Camera" size={16} color="white" />
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                        />
                    </label>
                </div>
            </div>

            {errors.profileImage && (
                <p className="text-error text-sm text-center -mt-4 mb-4">{errors.profileImage}</p>
            )}

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                    label="First Name"
                    type="text"
                    placeholder="Enter your first name"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    error={errors.firstName}
                    required
                />

                <Input
                    label="Last Name"
                    type="text"
                    placeholder="Enter your last name"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    error={errors.lastName}
                    required
                />
            </div>

            <Input
                label="Email Address"
                type="email"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                error={errors.email}
                description="We'll use this for account and communication"
                required
            />

            <Input
                label="Phone Number"
                type="tel"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                error={errors.phone}
                required
            />

            <LocationInput
                label="Location"
                placeholder="e.g., Bengaluru, Karnataka"
                value={formData.location}
                onChange={(val) => handleInputChange('location', val)}
                error={errors.location}
                required
            />

            <div className="grid grid-cols-1 gap-6">
                <RoleInput
                    label="Your Role"
                    value={formData.jobTitle}
                    onChange={(val) => handleInputChange('jobTitle', val)}
                    onSelect={(val) => handleInputChange('jobTitle', val)}
                    audience="recruiter"
                    placeholder="Search and select your role"
                    required
                    error={errors.jobTitle}
                />
            </div>

            <div className="grid grid-cols-1 gap-6">
                <Input
                    label="LinkedIn Profile URL"
                    type="url"
                    placeholder="https://www.linkedin.com/in/your-profile"
                    value={formData.linkedinUrl}
                    onChange={(e) => handleInputChange('linkedinUrl', e.target.value)}
                    error={errors.linkedinUrl}
                />
            </div>

            {/* Navigation */}
            <div className="flex justify-between pt-6">
                <Button
                    variant="outline"
                    onClick={onPrev}
                    disabled
                    iconName="ArrowLeft"
                    iconPosition="left"
                >
                    Previous
                </Button>

                <Button
                    onClick={handleNext}
                    iconName="ArrowRight"
                    iconPosition="right"
                    size="lg"
                    className="font-semibold"
                >
                    Next Step
                </Button>
            </div>
        </motion.div>
    );
};

export default PersonalInfoStep;
