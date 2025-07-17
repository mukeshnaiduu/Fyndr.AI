import React, { useState } from 'react';
import { motion } from 'framer-motion';

import Input from 'components/ui/Input';
import Select from 'components/ui/Select';
import { Checkbox } from 'components/ui/Checkbox';
import Button from 'components/ui/Button';

const CareerPreferencesStep = ({ data, onUpdate, onNext, onPrev }) => {
  const [preferences, setPreferences] = useState({
    jobTitle: data.jobTitle || '',
    jobTypes: data.jobTypes || [],
    workArrangement: data.workArrangement || '',
    salaryMin: data.salaryMin || '',
    salaryMax: data.salaryMax || '',
    preferredLocations: data.preferredLocations || [],
    industries: data.industries || [],
    companySize: data.companySize || '',
    benefits: data.benefits || [],
    availabilityDate: data.availabilityDate || '',
    ...data
  });

  const [errors, setErrors] = useState({});

  const jobTypeOptions = [
    { value: 'full-time', label: 'Full-time' },
    { value: 'part-time', label: 'Part-time' },
    { value: 'contract', label: 'Contract' },
    { value: 'freelance', label: 'Freelance' },
    { value: 'internship', label: 'Internship' }
  ];

  const workArrangementOptions = [
    { value: 'remote', label: 'Remote' },
    { value: 'hybrid', label: 'Hybrid' },
    { value: 'on-site', label: 'On-site' },
    { value: 'flexible', label: 'Flexible' }
  ];

  const locationOptions = [
    { value: 'san-francisco', label: 'San Francisco, CA' },
    { value: 'new-york', label: 'New York, NY' },
    { value: 'seattle', label: 'Seattle, WA' },
    { value: 'austin', label: 'Austin, TX' },
    { value: 'chicago', label: 'Chicago, IL' },
    { value: 'boston', label: 'Boston, MA' },
    { value: 'los-angeles', label: 'Los Angeles, CA' },
    { value: 'denver', label: 'Denver, CO' },
    { value: 'remote', label: 'Remote (Anywhere)' }
  ];

  const industryOptions = [
    { value: 'technology', label: 'Technology' },
    { value: 'finance', label: 'Finance' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'education', label: 'Education' },
    { value: 'retail', label: 'Retail' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'consulting', label: 'Consulting' },
    { value: 'media', label: 'Media & Entertainment' },
    { value: 'nonprofit', label: 'Non-profit' },
    { value: 'government', label: 'Government' }
  ];

  const companySizeOptions = [
    { value: 'startup', label: 'Startup (1-50 employees)' },
    { value: 'small', label: 'Small (51-200 employees)' },
    { value: 'medium', label: 'Medium (201-1000 employees)' },
    { value: 'large', label: 'Large (1000+ employees)' },
    { value: 'enterprise', label: 'Enterprise (5000+ employees)' }
  ];

  const benefitOptions = [
    'Health Insurance',
    'Dental Insurance',
    'Vision Insurance',
    '401(k) Matching',
    'Flexible PTO',
    'Remote Work',
    'Professional Development',
    'Stock Options',
    'Gym Membership',
    'Commuter Benefits',
    'Parental Leave',
    'Mental Health Support'
  ];

  const handleInputChange = (field, value) => {
    setPreferences(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleMultiSelectChange = (field, value) => {
    setPreferences(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const handleBenefitChange = (benefit, checked) => {
    if (checked) {
      setPreferences(prev => ({
        ...prev,
        benefits: [...prev.benefits, benefit]
      }));
    } else {
      setPreferences(prev => ({
        ...prev,
        benefits: prev.benefits.filter(b => b !== benefit)
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!preferences.jobTitle.trim()) {
      newErrors.jobTitle = 'Job title is required';
    }

    if (preferences.jobTypes.length === 0) {
      newErrors.jobTypes = 'Select at least one job type';
    }

    if (!preferences.workArrangement) {
      newErrors.workArrangement = 'Work arrangement is required';
    }

    if (preferences.salaryMin && preferences.salaryMax) {
      const min = parseInt(preferences.salaryMin);
      const max = parseInt(preferences.salaryMax);
      if (min >= max) {
        newErrors.salaryMax = 'Maximum salary must be greater than minimum';
      }
    }

    if (preferences.preferredLocations.length === 0) {
      newErrors.preferredLocations = 'Select at least one preferred location';
    }

    if (preferences.industries.length === 0) {
      newErrors.industries = 'Select at least one industry';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onUpdate(preferences);
      onNext();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          What are you looking for?
        </h2>
        <p className="text-muted-foreground">
          Tell us about your career preferences to get personalized job recommendations
        </p>
      </div>

      {/* Job Title */}
      <div className="max-w-2xl mx-auto">
        <Input
          label="Desired Job Title"
          type="text"
          placeholder="e.g., Frontend Developer, Product Manager, Data Scientist"
          value={preferences.jobTitle}
          onChange={(e) => handleInputChange('jobTitle', e.target.value)}
          error={errors.jobTitle}
          required
        />
      </div>

      {/* Job Types */}
      <div className="max-w-2xl mx-auto">
        <div className="space-y-3">
          <label className="block text-sm font-medium text-foreground">
            Job Types <span className="text-error">*</span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {jobTypeOptions.map((option) => (
              <label
                key={option.value}
                className={`flex items-center space-x-2 p-3 rounded-card border cursor-pointer transition-all duration-200 ${
                  preferences.jobTypes.includes(option.value)
                    ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:border-primary/50 hover:bg-muted/50'
                }`}
              >
                <Checkbox
                  checked={preferences.jobTypes.includes(option.value)}
                  onChange={(e) => handleMultiSelectChange('jobTypes', option.value)}
                />
                <span className="text-sm font-medium">{option.label}</span>
              </label>
            ))}
          </div>
          {errors.jobTypes && (
            <p className="text-error text-sm">{errors.jobTypes}</p>
          )}
        </div>
      </div>

      {/* Work Arrangement */}
      <div className="max-w-2xl mx-auto">
        <Select
          label="Work Arrangement"
          placeholder="Select work arrangement"
          options={workArrangementOptions}
          value={preferences.workArrangement}
          onChange={(value) => handleInputChange('workArrangement', value)}
          error={errors.workArrangement}
          required
        />
      </div>

      {/* Salary Range */}
      <div className="max-w-2xl mx-auto">
        <div className="space-y-3">
          <label className="block text-sm font-medium text-foreground">
            Expected Salary Range (USD)
          </label>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Minimum"
              type="number"
              placeholder="50000"
              value={preferences.salaryMin}
              onChange={(e) => handleInputChange('salaryMin', e.target.value)}
              min="0"
            />
            <Input
              label="Maximum"
              type="number"
              placeholder="100000"
              value={preferences.salaryMax}
              onChange={(e) => handleInputChange('salaryMax', e.target.value)}
              error={errors.salaryMax}
              min="0"
            />
          </div>
        </div>
      </div>

      {/* Preferred Locations */}
      <div className="max-w-2xl mx-auto">
        <Select
          label="Preferred Locations"
          placeholder="Select preferred locations"
          options={locationOptions}
          value={preferences.preferredLocations}
          onChange={(value) => handleInputChange('preferredLocations', value)}
          error={errors.preferredLocations}
          multiple
          searchable
          required
        />
      </div>

      {/* Industries */}
      <div className="max-w-2xl mx-auto">
        <Select
          label="Preferred Industries"
          placeholder="Select industries of interest"
          options={industryOptions}
          value={preferences.industries}
          onChange={(value) => handleInputChange('industries', value)}
          error={errors.industries}
          multiple
          searchable
          required
        />
      </div>

      {/* Company Size */}
      <div className="max-w-2xl mx-auto">
        <Select
          label="Preferred Company Size"
          placeholder="Select company size preference"
          options={companySizeOptions}
          value={preferences.companySize}
          onChange={(value) => handleInputChange('companySize', value)}
        />
      </div>

      {/* Benefits */}
      <div className="max-w-2xl mx-auto">
        <div className="space-y-4">
          <label className="block text-sm font-medium text-foreground">
            Important Benefits & Perks
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {benefitOptions.map((benefit) => (
              <label
                key={benefit}
                className="flex items-center space-x-3 p-3 rounded-card border border-border hover:border-primary/50 hover:bg-muted/50 cursor-pointer transition-all duration-200"
              >
                <Checkbox
                  checked={preferences.benefits.includes(benefit)}
                  onChange={(e) => handleBenefitChange(benefit, e.target.checked)}
                />
                <span className="text-sm">{benefit}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Availability Date */}
      <div className="max-w-2xl mx-auto">
        <Input
          label="When can you start?"
          type="date"
          value={preferences.availabilityDate}
          onChange={(e) => handleInputChange('availabilityDate', e.target.value)}
          description="This helps employers understand your timeline"
          min={new Date().toISOString().split('T')[0]}
        />
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button
          variant="outline"
          onClick={onPrev}
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

export default CareerPreferencesStep;
