import React, { useState } from 'react';
import { motion } from 'framer-motion';

import Input from 'components/ui/Input';
import Select from 'components/ui/Select';
import LocationInput from 'components/ui/LocationInput';
import RoleInput from 'components/ui/RoleInput';
import { Checkbox } from 'components/ui/Checkbox';
import Button from 'components/ui/Button';
import { INDUSTRY_OPTIONS } from 'constants/industries';

const CareerPreferencesStep = ({ data, onUpdate, onNext, onPrev }) => {
  const [preferences, setPreferences] = useState({
    jobTitle: data.jobTitle || '',
    desiredRoles: data.desiredRoles || [],
    jobTypes: data.jobTypes || [],
    workArrangement: data.workArrangement || '', // legacy single
    workArrangements: data.workArrangements || [],
    salaryMin: data.salaryMin || '',
    salaryMax: data.salaryMax || '',
    preferredLocations: data.preferredLocations || [],
    industries: data.industries || [],
    companySize: data.companySize || '',
    benefits: data.benefits || [],
    availabilityDate: data.availabilityDate || '',
    ...data
  });

  // Local input state for typeahead fields
  const [desiredRoleInput, setDesiredRoleInput] = useState('');
  const [preferredLocationInput, setPreferredLocationInput] = useState('');

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

  // Locations now sourced from DB via LocationInput; no hardcoded US list

  const industryOptions = INDUSTRY_OPTIONS;

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

    if (!preferences.desiredRoles || preferences.desiredRoles.length === 0) {
      newErrors.desiredRoles = 'Add at least one desired job title';
    }

    if (preferences.jobTypes.length === 0) {
      newErrors.jobTypes = 'Select at least one job type';
    }

    if (!preferences.workArrangements || preferences.workArrangements.length === 0) {
      newErrors.workArrangements = 'Select at least one type';
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

      {/* Desired Job Titles */}
      <div className="max-w-2xl mx-auto space-y-3">
        <RoleInput
          label="Desired Job Titles"
          value={desiredRoleInput}
          onChange={setDesiredRoleInput}
          audience="jobseeker"
          onSelect={(val) => {
            if (!val) return;
            setPreferences(prev => ({
              ...prev,
              desiredRoles: prev.desiredRoles.includes(val)
                ? prev.desiredRoles
                : [...prev.desiredRoles, val]
            }));
            setDesiredRoleInput('');
            if (errors.desiredRoles) setErrors(prev => ({ ...prev, desiredRoles: '' }));
          }}
          clearOnSelect
          placeholder="e.g., Frontend Developer, Data Scientist"
        />
        <div className="flex flex-wrap gap-2">
          {preferences.desiredRoles.map((role) => (
            <span key={role} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full flex items-center gap-1">
              {role}
              <button
                type="button"
                className="ml-1 text-primary hover:text-primary/80"
                onClick={() => setPreferences(prev => ({
                  ...prev,
                  desiredRoles: prev.desiredRoles.filter(r => r !== role)
                }))}
                aria-label={`Remove ${role}`}
              >
                ×
              </button>
            </span>
          ))}
          {errors.desiredRoles && (
            <p className="text-xs text-error">{errors.desiredRoles}</p>
          )}
        </div>
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
                className={`flex items-center space-x-2 p-3 rounded-card border cursor-pointer transition-all duration-200 ${preferences.jobTypes.includes(option.value)
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

      {/* Work Type (multi-select with chips) */}
      <div className="max-w-2xl mx-auto">
        <label className="block text-sm font-medium text-foreground mb-2">
          Type <span className="text-error">*</span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {workArrangementOptions.map((opt) => (
            <label
              key={opt.value}
              className={`flex items-center space-x-2 p-3 rounded-card border cursor-pointer transition-all duration-200 ${preferences.workArrangements?.includes(opt.value)
                ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:border-primary/50 hover:bg-muted/50'
                }`}
            >
              <Checkbox
                checked={preferences.workArrangements?.includes(opt.value)}
                onChange={() => handleMultiSelectChange('workArrangements', opt.value)}
              />
              <span className="text-sm font-medium">{opt.label}</span>
            </label>
          ))}
        </div>
        {errors.workArrangements && (
          <p className="text-error text-sm">{errors.workArrangements}</p>
        )}
        {preferences.workArrangements?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {preferences.workArrangements.map((w) => (
              <span key={w} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full flex items-center gap-1">
                {workArrangementOptions.find(o => o.value === w)?.label || w}
                <button
                  type="button"
                  className="ml-1 text-primary hover:text-primary/80"
                  onClick={() => handleMultiSelectChange('workArrangements', w)}
                  aria-label={`Remove ${w}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Salary Range */}
      <div className="max-w-2xl mx-auto">
        <div className="space-y-3">
          <label className="block text-sm font-medium text-foreground">
            Expected Salary Range (INR)
          </label>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Minimum"
              type="number"
              placeholder="500000"
              value={preferences.salaryMin}
              onChange={(e) => handleInputChange('salaryMin', e.target.value)}
              min="0"
            />
            <Input
              label="Maximum"
              type="number"
              placeholder="2000000"
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
        <label className="block text-sm font-medium text-foreground mb-2">
          Preferred Locations <span className="text-error">*</span>
        </label>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <LocationInput
              label={null}
              value={preferredLocationInput}
              onChange={setPreferredLocationInput}
              onSelect={(val) => {
                if (!val) return;
                setPreferences(prev => ({
                  ...prev,
                  preferredLocations: prev.preferredLocations.includes(val)
                    ? prev.preferredLocations
                    : [...prev.preferredLocations, val]
                }));
                setPreferredLocationInput('');
                if (errors.preferredLocations) setErrors(prev => ({ ...prev, preferredLocations: '' }));
              }}
              clearOnSelect
              placeholder="e.g., Bengaluru, Hyderabad, Remote"
            />
            <button
              type="button"
              className="btn btn-sm px-3 py-1 bg-primary text-white rounded"
              onClick={() => {
                const val = (preferredLocationInput || '').trim();
                if (!val) return;
                setPreferences(prev => ({
                  ...prev,
                  preferredLocations: prev.preferredLocations.includes(val)
                    ? prev.preferredLocations
                    : [...prev.preferredLocations, val]
                }));
                setPreferredLocationInput('');
                if (errors.preferredLocations) setErrors(prev => ({ ...prev, preferredLocations: '' }));
              }}
            >
              Add
            </button>
          </div>
          {errors.preferredLocations && (
            <p className="text-xs text-error">{errors.preferredLocations}</p>
          )}
          <div className="flex flex-wrap gap-2">
            {preferences.preferredLocations.map((loc) => (
              <span key={loc} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full flex items-center gap-1">
                {loc}
                <button
                  type="button"
                  className="ml-1 text-primary hover:text-primary/80"
                  onClick={() => setPreferences(prev => ({
                    ...prev,
                    preferredLocations: prev.preferredLocations.filter(l => l !== loc)
                  }))}
                  aria-label={`Remove ${loc}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>
      {/* Preferred Locations selection handled above via LocationInput and chips */}

      {/* Preferred Industries (chips) */}
      <div className="max-w-2xl mx-auto">
        <label className="block text-sm font-medium text-foreground mb-2">
          Preferred Industries <span className="text-error">*</span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {industryOptions.map((opt) => (
            <label
              key={opt.value}
              className={`flex items-center space-x-2 p-3 rounded-card border cursor-pointer transition-all duration-200 ${preferences.industries.includes(opt.value)
                ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:border-primary/50 hover:bg-muted/50'
                }`}
            >
              <Checkbox
                checked={preferences.industries.includes(opt.value)}
                onChange={() => handleMultiSelectChange('industries', opt.value)}
              />
              <span className="text-sm font-medium">{opt.label}</span>
            </label>
          ))}
        </div>
        {errors.industries && (
          <p className="text-error text-sm">{errors.industries}</p>
        )}
        {preferences.industries.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {preferences.industries.map((ind) => (
              <span key={ind} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full flex items-center gap-1">
                {industryOptions.find(o => o.value === ind)?.label || ind}
                <button
                  type="button"
                  className="ml-1 text-primary hover:text-primary/80"
                  onClick={() => handleMultiSelectChange('industries', ind)}
                  aria-label={`Remove ${ind}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
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
