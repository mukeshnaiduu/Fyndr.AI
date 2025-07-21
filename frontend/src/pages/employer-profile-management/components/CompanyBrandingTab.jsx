import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Icon from '../../../components/AppIcon';

export const CompanyBrandingTab = ({ data, isEditing, onUpdate }) => {
  const [formData, setFormData] = useState({
    company_name: data?.company_name || '',
    industry: data?.industry || '',
    company_size: data?.company_size || '',
    company_website: data?.company_website || '',
    company_description: data?.company_description || '',
    company_logo: data?.company_logo || '',
    brand_colors: data?.brand_colors || [],
    company_culture: data?.company_culture || '',
    mission_statement: data?.mission_statement || '',
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    onUpdate(formData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Company Branding</h3>
        {isEditing && (
          <Button onClick={handleSave} size="sm">
            <Icon name="Save" size={16} className="mr-2" />
            Save Changes
          </Button>
        )}
      </div>

      {/* Company Logo Section */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
        <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-4">Company Logo & Visual Identity</h4>
        <div className="flex items-center space-x-6">
          <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
            {formData.company_logo ? (
              <img src={formData.company_logo} alt="Company Logo" className="w-full h-full object-cover" />
            ) : (
              <Icon name="Building2" size={32} className="text-gray-400" />
            )}
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Logo URL
            </label>
            <Input
              value={formData.company_logo}
              onChange={(e) => handleInputChange('company_logo', e.target.value)}
              placeholder="https://yourcompany.com/logo.png"
              disabled={!isEditing}
            />
            {isEditing && (
              <p className="text-sm text-gray-500 mt-1">Upload your company logo or provide a URL</p>
            )}
          </div>
        </div>
      </div>

      {/* Basic Company Information */}
      <div>
        <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-4">Company Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Company Name
            </label>
            <Input
              value={formData.company_name}
              onChange={(e) => handleInputChange('company_name', e.target.value)}
              placeholder="Enter company name"
              disabled={!isEditing}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Industry
            </label>
            <Input
              value={formData.industry}
              onChange={(e) => handleInputChange('industry', e.target.value)}
              placeholder="e.g., Technology, Healthcare"
              disabled={!isEditing}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Company Size
            </label>
            <Input
              value={formData.company_size}
              onChange={(e) => handleInputChange('company_size', e.target.value)}
              placeholder="e.g., 10-50 employees"
              disabled={!isEditing}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Website
            </label>
            <Input
              value={formData.company_website}
              onChange={(e) => handleInputChange('company_website', e.target.value)}
              placeholder="https://yourcompany.com"
              disabled={!isEditing}
            />
          </div>
        </div>
      </div>

      {/* Mission & Culture */}
      <div>
        <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-4">Mission & Culture</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mission Statement
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              rows="3"
              value={formData.mission_statement}
              onChange={(e) => handleInputChange('mission_statement', e.target.value)}
              placeholder="What is your company's mission?"
              disabled={!isEditing}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Company Description
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              rows="4"
              value={formData.company_description}
              onChange={(e) => handleInputChange('company_description', e.target.value)}
              placeholder="Tell us about your company"
              disabled={!isEditing}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Company Culture
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              rows="3"
              value={formData.company_culture}
              onChange={(e) => handleInputChange('company_culture', e.target.value)}
              placeholder="Describe your company culture and values"
              disabled={!isEditing}
            />
          </div>
        </div>
      </div>

      {/* Brand Colors */}
      <div>
        <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-4">Brand Colors</h4>
        <div className="flex items-center space-x-4">
          {formData.brand_colors?.length > 0 ? (
            formData.brand_colors.map((color, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div
                  className="w-8 h-8 rounded border border-gray-300"
                  style={{ backgroundColor: color }}
                ></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">{color}</span>
              </div>
            ))
          ) : (
            <span className="text-gray-500">No brand colors specified</span>
          )}
          {isEditing && (
            <Button variant="outline" size="sm">
              <Icon name="Plus" size={16} className="mr-2" />
              Add Color
            </Button>
          )}
        </div>
      </div>

      {/* Preview Section */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">Company Profile Preview</h4>
        <p className="text-sm text-blue-800 dark:text-blue-300">
          This is how your company will appear to job seekers on the platform. Make sure your branding represents your company well.
        </p>
      </div>
    </div>
  );
};
