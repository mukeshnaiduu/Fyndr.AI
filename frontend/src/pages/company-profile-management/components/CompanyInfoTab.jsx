import React, { useState, useEffect } from 'react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { INDUSTRY_OPTIONS } from 'constants/industries';

const CompanyInfoTab = ({ profile, onUpdate, isEditing, setIsEditing, registerSave }) => {
  const [form, setForm] = useState({
    company_name: '',
    industry: '',
    company_size: '',
    website: '',
    description: ''
  });

  useEffect(() => {
    setForm({
      company_name: profile?.company_name || '',
      industry: profile?.industry || '',
      company_size: profile?.company_size || '',
      website: profile?.website || profile?.company_website || '',
      description: profile?.description || profile?.company_description || ''
    });
  }, [profile]);

  const handleSave = async () => {
    await onUpdate(form);
  };

  useEffect(() => {
    if (registerSave) registerSave(handleSave);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, registerSave]);

  // Logo upload UI was removed as requested

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Company Information</h3>
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
          <Select
            placeholder="Select industry"
            options={INDUSTRY_OPTIONS}
            value={form.industry}
            onChange={(value) => setForm({ ...form, industry: value })}
            disabled={!isEditing}
            searchable
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Company Size
          </label>
          <Select
            placeholder="Select company size"
            options={[
              { value: '1-10', label: '1-10 employees' },
              { value: '11-50', label: '11-50 employees' },
              { value: '51-200', label: '51-200 employees' },
              { value: '201-500', label: '201-500 employees' },
              { value: '501-1000', label: '501-1000 employees' },
              { value: '1000+', label: '1000+ employees' }
            ]}
            value={form.company_size}
            onChange={(value) => setForm({ ...form, company_size: value })}
            disabled={!isEditing}
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

        {/* Company Logo section removed as requested */}
      </div>
    </div>
  );
};

export { CompanyInfoTab };
