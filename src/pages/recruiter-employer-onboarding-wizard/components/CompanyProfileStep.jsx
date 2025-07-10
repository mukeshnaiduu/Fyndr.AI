import React, { useState } from 'react';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';
import Input from 'components/ui/Input';
import Select from 'components/ui/Select';
import Button from 'components/ui/Button';

const CompanyProfileStep = ({ data, onUpdate, onNext, onPrev }) => {
  const [formData, setFormData] = useState({
    companyName: data.companyName || '',
    industry: data.industry || '',
    companySize: data.companySize || '',
    website: data.website || '',
    description: data.description || '',
    logo: data.logo || null,
    headquarters: data.headquarters || '',
    foundedYear: data.foundedYear || '',
    ...data
  });

  const [errors, setErrors] = useState({});
  const [logoPreview, setLogoPreview] = useState(data.logo || null);
  const [isDragOver, setIsDragOver] = useState(false);

  const industryOptions = [
    { value: 'technology', label: 'Technology' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'finance', label: 'Finance & Banking' },
    { value: 'education', label: 'Education' },
    { value: 'retail', label: 'Retail & E-commerce' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'consulting', label: 'Consulting' },
    { value: 'media', label: 'Media & Entertainment' },
    { value: 'nonprofit', label: 'Non-profit' },
    { value: 'other', label: 'Other' }
  ];

  const companySizeOptions = [
    { value: '1-10', label: '1-10 employees' },
    { value: '11-50', label: '11-50 employees' },
    { value: '51-200', label: '51-200 employees' },
    { value: '201-500', label: '201-500 employees' },
    { value: '501-1000', label: '501-1000 employees' },
    { value: '1000+', label: '1000+ employees' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleLogoUpload = (file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const logoUrl = e.target.result;
        setLogoPreview(logoUrl);
        setFormData(prev => ({ ...prev, logo: logoUrl }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleLogoUpload(files[0]);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }
    
    if (!formData.industry) {
      newErrors.industry = 'Please select an industry';
    }
    
    if (!formData.companySize) {
      newErrors.companySize = 'Please select company size';
    }
    
    if (!formData.website.trim()) {
      newErrors.website = 'Website URL is required';
    } else if (!/^https?:\/\/.+\..+/.test(formData.website)) {
      newErrors.website = 'Please enter a valid website URL';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Company description is required';
    } else if (formData.description.length < 50) {
      newErrors.description = 'Description must be at least 50 characters';
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
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Company Profile</h2>
        <p className="text-muted-foreground">
          Tell us about your company to create an engaging profile for candidates
        </p>
      </div>

      {/* Logo Upload Section */}
      <div className="glass-card p-6 rounded-card">
        <h3 className="text-lg font-semibold text-foreground mb-4">Company Logo</h3>
        
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Logo Preview */}
          <div className="flex-shrink-0">
            <div className="w-32 h-32 rounded-card border-2 border-dashed border-border bg-muted flex items-center justify-center overflow-hidden">
              {logoPreview ? (
                <Image
                  src={logoPreview}
                  alt="Company logo preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center">
                  <Icon name="Building" size={32} className="text-muted-foreground mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">Logo Preview</p>
                </div>
              )}
            </div>
          </div>

          {/* Upload Area */}
          <div className="flex-1">
            <div
              className={`border-2 border-dashed rounded-card p-6 text-center transition-all duration-300 ${
                isDragOver
                  ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Icon name="Upload" size={32} className="text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground mb-1">
                Drag and drop your logo here, or click to browse
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                PNG, JPG or SVG. Max file size 5MB. Recommended: 200x200px
              </p>
              
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleLogoUpload(e.target.files[0])}
                className="hidden"
                id="logo-upload"
              />
              <label htmlFor="logo-upload">
                <Button variant="outline" size="sm" asChild>
                  <span className="cursor-pointer">Choose File</span>
                </Button>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Company Information */}
      <div className="glass-card p-6 rounded-card">
        <h3 className="text-lg font-semibold text-foreground mb-6">Company Information</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Input
            label="Company Name"
            type="text"
            placeholder="Enter your company name"
            value={formData.companyName}
            onChange={(e) => handleInputChange('companyName', e.target.value)}
            error={errors.companyName}
            required
          />

          <Select
            label="Industry"
            placeholder="Select your industry"
            options={industryOptions}
            value={formData.industry}
            onChange={(value) => handleInputChange('industry', value)}
            error={errors.industry}
            required
            searchable
          />

          <Select
            label="Company Size"
            placeholder="Select company size"
            options={companySizeOptions}
            value={formData.companySize}
            onChange={(value) => handleInputChange('companySize', value)}
            error={errors.companySize}
            required
          />

          <Input
            label="Website"
            type="url"
            placeholder="https://yourcompany.com"
            value={formData.website}
            onChange={(e) => handleInputChange('website', e.target.value)}
            error={errors.website}
            required
          />

          <Input
            label="Headquarters"
            type="text"
            placeholder="City, Country"
            value={formData.headquarters}
            onChange={(e) => handleInputChange('headquarters', e.target.value)}
          />

          <Input
            label="Founded Year"
            type="number"
            placeholder="2020"
            value={formData.foundedYear}
            onChange={(e) => handleInputChange('foundedYear', e.target.value)}
            min="1800"
            max={new Date().getFullYear()}
          />
        </div>

        {/* Company Description */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-foreground mb-2">
            Company Description <span className="text-error">*</span>
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Describe your company, mission, values, and what makes it a great place to work..."
            rows={6}
            className="w-full px-4 py-3 bg-background border border-border rounded-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
          />
          <div className="flex justify-between items-center mt-2">
            <p className="text-xs text-muted-foreground">
              Minimum 50 characters required
            </p>
            <p className={`text-xs ${
              formData.description.length < 50 ? 'text-error' : 'text-success'
            }`}>
              {formData.description.length}/500
            </p>
          </div>
          {errors.description && (
            <p className="text-sm text-error mt-1">{errors.description}</p>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onPrev} iconName="ChevronLeft" iconPosition="left">
          Previous
        </Button>
        <Button onClick={handleNext} iconName="ChevronRight" iconPosition="right">
          Next: Team Setup
        </Button>
      </div>
    </div>
  );
};

export default CompanyProfileStep;
