import React from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

const CompanyInfoTab = ({ profile, onUpdate, isEditing, setIsEditing }) => {
  const handleSave = () => {
    // Add save logic here if needed
    setIsEditing(false);
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
            value={profile?.company_name || ''}
            placeholder="Enter company name"
            readOnly={!isEditing}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Industry
          </label>
          <Input
            value={profile?.industry || ''}
            placeholder="e.g., Technology, Healthcare"
            readOnly={!isEditing}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Company Size
          </label>
          <Input
            value={profile?.company_size || ''}
            placeholder="e.g., 10-50 employees"
            readOnly={!isEditing}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Website
          </label>
          <Input
            value={profile?.company_website || ''}
            placeholder="https://yourcompany.com"
            readOnly={!isEditing}
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Company Description
          </label>
          <textarea
            className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${!isEditing ? 'bg-gray-50 dark:bg-gray-700' : ''}`}
            rows="4"
            value={profile?.company_description || ''}
            placeholder="Brief description of your company"
            readOnly={!isEditing}
          />
        </div>

        {/* Company Logo */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Company Logo
          </label>
          <div className="flex items-center space-x-4">
            {profile?.logo ? (
              <img
                src={profile.logo}
                alt="Company Logo"
                className="w-16 h-16 rounded-lg object-cover border-2 border-gray-200 dark:border-gray-600"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center border-2 border-gray-200 dark:border-gray-600">
                <Icon name="Building" size={24} className="text-gray-400" />
              </div>
            )}
            {isEditing && (
              <button className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                Upload Logo
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export { CompanyInfoTab };
