import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { getApiUrl } from '../../../utils/api';

const CompanyInfoTab = ({ profile, onUpdate, isEditing, setIsEditing }) => {
  const [form, setForm] = useState({
    company_name: '',
    industry: '',
    company_size: '',
    website: '',
    description: ''
  });
  const [logoUrl, setLogoUrl] = useState('');
  const [logoError, setLogoError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    setForm({
      company_name: profile?.company_name || '',
      industry: profile?.industry || '',
      company_size: profile?.company_size || '',
      website: profile?.website || profile?.company_website || '',
      description: profile?.description || profile?.company_description || ''
    });
    // Tokenize secured logo URL for direct <img> access
    const token = localStorage.getItem('accessToken') || '';
    const withToken = (url) => (url ? `${url}${url.includes('?') ? '&' : '?'}token=${token}` : '');
    setLogoUrl(withToken(profile?.logo_url || ''));
  }, [profile]);

  const handleSave = () => {
    onUpdate(form);
    setIsEditing(false);
  };

  const handleLogoUpload = async (e) => {
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
      // Optimistic local preview
      const reader = new FileReader();
      reader.onload = (evt) => {
        const preview = evt.target?.result;
        if (preview) setLogoUrl(preview);
      };
      reader.readAsDataURL(file);

      const token = localStorage.getItem('accessToken');
      const fd = new FormData();
      fd.append('file', file);
      fd.append('type', 'logo');
      const res = await fetch(getApiUrl('/auth/upload/'), {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd
      });
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.error || 'Upload failed');
      const urlToken = localStorage.getItem('accessToken') || '';
      const finalUrl = data.url ? `${data.url}${data.url.includes('?') ? '&' : '?'}token=${urlToken}` : '';
      if (finalUrl) {
        setLogoUrl(finalUrl);
      }
      setLogoError('');
    } catch (err) {
      setLogoError('Logo upload failed. Try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Company Information</h3>
        <button
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className="px-4 py-2 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
        >
          {isEditing ? 'Save Changes' : 'Edit'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Company Name
          </label>
          <Input
            value={form.company_name}
            placeholder="Enter company name"
            readOnly={!isEditing}
            onChange={(e) => setForm({ ...form, company_name: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Industry
          </label>
          <Input
            value={form.industry}
            placeholder="e.g., Technology, Healthcare"
            readOnly={!isEditing}
            onChange={(e) => setForm({ ...form, industry: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Company Size
          </label>
          <Input
            value={form.company_size}
            placeholder="e.g., 10-50 employees"
            readOnly={!isEditing}
            onChange={(e) => setForm({ ...form, company_size: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Website
          </label>
          <Input
            value={form.website}
            placeholder="https://yourcompany.com"
            readOnly={!isEditing}
            onChange={(e) => setForm({ ...form, website: e.target.value })}
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Company Description
          </label>
          <textarea
            className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${!isEditing ? 'bg-gray-50 dark:bg-gray-700' : ''}`}
            rows="4"
            value={form.description}
            placeholder="Brief description of your company"
            readOnly={!isEditing}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        {/* Company Logo */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Company Logo
          </label>
          <div className="flex items-center space-x-4">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Company Logo"
                className="w-16 h-16 rounded-lg object-cover border-2 border-gray-200 dark:border-gray-600"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center border-2 border-gray-200 dark:border-gray-600">
                <Icon name="Building" size={24} className="text-gray-400" />
              </div>
            )}
            {isEditing && (
              <>
                <button
                  className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                  type="button"
                >
                  Upload Logo
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </>
            )}
          </div>
          {logoError && (
            <p className="text-sm text-red-500 mt-2">{logoError}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export { CompanyInfoTab };
