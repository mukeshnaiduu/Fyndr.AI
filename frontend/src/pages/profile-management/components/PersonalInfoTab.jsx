import React, { useState, useRef, useEffect } from 'react';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';
import Input from 'components/ui/Input';
import LocationInput from 'components/ui/LocationInput';
import Button from 'components/ui/Button';
import { getApiUrl } from 'utils/api';
// Location suggestions are now provided via LocationInput component

const PersonalInfoTab = ({ userProfile, onUpdateProfile, onDraftChange }) => {
  const [formData, setFormData] = useState({
    firstName: userProfile.firstName || '',
    lastName: userProfile.lastName || '',
    email: userProfile.email || '',
    phone: userProfile.phone || '',
    location: userProfile.location || '',
    bio: userProfile.bio || '',
    website: userProfile.website || '',
    linkedin: userProfile.linkedin || '',
    twitter: userProfile.twitter || ''
  });

  const [errors, setErrors] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [avatar, setAvatar] = useState(userProfile.avatar || '');
  const fileInputRef = useRef(null);
  // Location suggestions handled by LocationInput

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // bubble draft changes up for live checklist updates
    if (onDraftChange) {
      onDraftChange({ [name]: value });
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.phone && !/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = 'Please enter a valid URL (include http:// or https://)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onUpdateProfile({ ...formData, avatar });
    }
  };

  // Dynamic location suggestions moved into LocationInput

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setErrors(prev => ({
        ...prev,
        avatar: 'File size must be less than 5MB'
      }));
      return;
    }
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({
        ...prev,
        avatar: 'Please upload a valid image file (JPG, PNG, GIF, WEBP)'
      }));
      return;
    }

    setIsUploading(true);
    try {
      // Show local preview immediately
      const reader = new FileReader();
      reader.onload = (evt) => {
        const preview = evt.target?.result;
        if (preview) {
          setAvatar(preview);
          if (onDraftChange) onDraftChange({ avatar: preview });
        }
      };
      reader.readAsDataURL(file);

      // Upload to backend
      const token = localStorage.getItem('accessToken');
      const fd = new FormData();
      fd.append('file', file);
      fd.append('type', 'profile_image');
      const res = await fetch(getApiUrl('/auth/upload/'), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: fd
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Upload failed');
      }
      // Use served URL from backend so it persists and works across refreshes
      if (data.url) {
        const tokenVal = localStorage.getItem('accessToken') || '';
        const urlWithToken = `${data.url}${data.url.includes('?') ? '&' : '?'}token=${tokenVal}`;
        setAvatar(urlWithToken);
        if (onDraftChange) onDraftChange({ avatar: urlWithToken, profile_image_url: urlWithToken });
        // Update localStorage user and notify navbar/avatar listeners
        try {
          const userStr = localStorage.getItem('user');
          if (userStr) {
            const userObj = JSON.parse(userStr);
            // store the raw serve URL; Navbar will append token+bust
            userObj.profile_image_url = data.url;
            localStorage.setItem('user', JSON.stringify(userObj));
            localStorage.setItem('avatarVersion', Date.now().toString());
            window.dispatchEvent(new Event('avatar-updated'));
            window.dispatchEvent(new StorageEvent('storage', { key: 'user', newValue: JSON.stringify(userObj) }));
          }
        } catch { }
      }
      setErrors(prev => ({ ...prev, avatar: '' }));
    } catch (err) {
      setErrors(prev => ({ ...prev, avatar: 'Photo upload failed. Try again.' }));
    } finally {
      setIsUploading(false);
    }
  };

  const removeAvatar = async () => {
    // Clear locally
    setAvatar('');
    if (onDraftChange) onDraftChange({ avatar: '', profile_image_url: '' });
    // Persist removal to backend if supported
    try {
      const token = localStorage.getItem('accessToken');
      await fetch(getApiUrl('/auth/profile/'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ profile: { profile_image_url: '' } }),
      });
    } catch { }
    // Update localStorage user and notify navbar/avatar listeners
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const userObj = JSON.parse(userStr);
        userObj.profile_image_url = '';
        localStorage.setItem('user', JSON.stringify(userObj));
        localStorage.setItem('avatarVersion', Date.now().toString());
        window.dispatchEvent(new Event('avatar-updated'));
        window.dispatchEvent(new StorageEvent('storage', { key: 'user', newValue: JSON.stringify(userObj) }));
      }
    } catch { }
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text).then(() => {
      // Show success feedback
      const button = document.querySelector(`[data-copy="${type}"]`);
      if (button) {
        button.classList.add('bg-success', 'text-success-foreground');
        setTimeout(() => {
          button.classList.remove('bg-success', 'text-success-foreground');
        }, 1000);
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Avatar Section */}
      <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
        <div className="relative group">
          <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-primary/20 group-hover:ring-primary/40 spring-transition">
            {avatar ? (
              <Image
                src={avatar}
                alt="Profile Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Icon name="User" size={32} color="white" />
              </div>
            )}
          </div>
          {isUploading && (
            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
              <Icon name="Loader" size={20} className="text-white animate-spin" />
            </div>
          )}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center hover:scale-110 spring-transition glow-primary"
          >
            <Icon name="Camera" size={16} />
          </button>
        </div>

        <div className="text-center sm:text-left">
          <h3 className="font-heading font-heading-semibold text-foreground mb-1">
            Profile Photo
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            Upload a professional photo. Max size: 5MB
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              iconName="Upload"
              iconPosition="left"
              iconSize={16}
              loading={isUploading}
            >
              Upload Photo
            </Button>
            {avatar && (
              <Button
                variant="ghost"
                size="sm"
                onClick={removeAvatar}
                iconName="Trash2"
                iconPosition="left"
                iconSize={16}
                className="text-error hover:text-error"
              >
                Remove
              </Button>
            )}
          </div>
          {errors.avatar && (
            <p className="text-sm text-error mt-2">{errors.avatar}</p>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleAvatarUpload}
          className="hidden"
        />
      </div>

      {/* Personal Information Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="glassmorphic p-6 rounded-squircle">
          <h3 className="font-heading font-heading-semibold text-foreground mb-4 flex items-center">
            <Icon name="User" size={20} className="mr-2" />
            Basic Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="First Name"
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleInputChange}
              error={errors.firstName}
              required
              placeholder="Enter your first name"
            />

            <Input
              label="Last Name"
              name="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleInputChange}
              error={errors.lastName}
              required
              placeholder="Enter your last name"
            />

            <Input
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              error={errors.email}
              required
              placeholder="Enter your email"
              description="This will be your primary contact email"
            />

            <div className="relative">
              <Input
                label="Phone Number"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                error={errors.phone}
                placeholder="+1 (555) 123-4567"
                description="Include country code"
              />
              {formData.phone && (
                <button
                  type="button"
                  data-copy="phone"
                  onClick={() => copyToClipboard(formData.phone, 'phone')}
                  className="absolute right-3 top-8 p-1 text-muted-foreground hover:text-foreground rounded spring-transition"
                  title="Copy phone number"
                >
                  <Icon name="Copy" size={16} />
                </button>
              )}
            </div>
          </div>

          <div className="mt-4">
            <LocationInput
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              error={errors.location}
              placeholder="City, State (e.g., Bengaluru, Karnataka)"
              description="Your current location"
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-body font-body-medium text-foreground mb-2">
              Bio
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 bg-input border border-border rounded-squircle text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent spring-transition resize-none"
              placeholder="Tell us about yourself..."
              maxLength={500}
            />
            <p className={`text-xs mt-1 ${formData.bio.length < 50 ? 'text-error' : 'text-success'}`}>
              {formData.bio.length}/500 characters
            </p>
          </div>
        </div>

        {/* Social Links */}
        <div className="glassmorphic p-6 rounded-squircle">
          <h3 className="font-heading font-heading-semibold text-foreground mb-4 flex items-center">
            <Icon name="Globe" size={20} className="mr-2" />
            Social Links
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Website"
              name="website"
              type="url"
              value={formData.website}
              onChange={handleInputChange}
              error={errors.website}
              placeholder="https://yourwebsite.com"
              description="Your personal or professional website"
            />

            <Input
              label="LinkedIn"
              name="linkedin"
              type="url"
              value={formData.linkedin}
              onChange={handleInputChange}
              placeholder="https://linkedin.com/in/username"
              description="Your LinkedIn profile URL"
            />

            <Input
              label="Twitter"
              name="twitter"
              type="url"
              value={formData.twitter}
              onChange={handleInputChange}
              placeholder="https://twitter.com/username"
              description="Your Twitter profile URL"
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            variant="default"
            iconName="Save"
            iconPosition="left"
            iconSize={16}
            className="glow-primary"
          >
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PersonalInfoTab;
