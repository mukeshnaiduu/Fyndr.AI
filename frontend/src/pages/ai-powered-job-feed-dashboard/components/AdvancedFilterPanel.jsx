import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';
import Input from 'components/ui/Input';
import LocationInput from 'components/ui/LocationInput';
import Select from 'components/ui/Select';
import { Checkbox } from 'components/ui/Checkbox';

const AdvancedFilterPanel = ({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  onApplyFilters,
  onClearFilters
}) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const salaryRanges = [
    { value: '0-300000', label: '₹0 - ₹3,00,000' },
    { value: '300000-600000', label: '₹3,00,000 - ₹6,00,000' },
    { value: '600000-1000000', label: '₹6,00,000 - ₹10,00,000' },
    { value: '1000000-2000000', label: '₹10,00,000 - ₹20,00,000' },
    { value: '2000000-3000000', label: '₹20,00,000 - ₹30,00,000' },
    { value: '3000000+', label: '₹30,00,000+' }
  ];

  const experienceLevels = [
    { value: 'entry', label: 'Entry Level (0-1 years)' },
    { value: 'junior', label: 'Junior (1-3 years)' },
    { value: 'mid', label: 'Mid-level (3-5 years)' },
    { value: 'senior', label: 'Senior (5-8 years)' },
    { value: 'lead', label: 'Lead (8+ years)' },
    { value: 'executive', label: 'Executive' }
  ];

  const jobTypes = [
    { value: 'full-time', label: 'Full-time' },
    { value: 'part-time', label: 'Part-time' },
    { value: 'contract', label: 'Contract' },
    { value: 'freelance', label: 'Freelance' },
    { value: 'internship', label: 'Internship' },
    { value: 'temporary', label: 'Temporary' }
  ];

  const workModes = [
    { value: 'remote', label: 'Remote' },
    { value: 'hybrid', label: 'Hybrid' },
    { value: 'onsite', label: 'On-site' }
  ];

  const companySizes = [
    { value: 'startup', label: 'Startup (1-50)' },
    { value: 'small', label: 'Small (51-200)' },
    { value: 'medium', label: 'Medium (201-1000)' },
    { value: 'large', label: 'Large (1001-5000)' },
    { value: 'enterprise', label: 'Enterprise (5000+)' }
  ];

  const handleFilterChange = (key, value) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleApply = () => {
    onFiltersChange(localFilters);
    onApplyFilters();
    onClose();
  };

  const handleClear = () => {
    const clearedFilters = {
      location: '',
      salaryRange: '',
      experienceLevel: '',
      jobTypes: [],
      workMode: '',
      companySize: '',
      skills: '',
      benefits: [],
      postedWithin: '',
      matchPercentage: 0
    };
    setLocalFilters(clearedFilters);
    onClearFilters();
  };

  const panelVariants = {
    hidden: {
      x: '100%',
      opacity: 0
    },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 200
      }
    },
    exit: {
      x: '100%',
      opacity: 0,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Panel */}
          <motion.div
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed right-0 top-0 h-full w-full max-w-md bg-background border-l border-border z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-background border-b border-border p-6 z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-heading font-semibold text-foreground">
                  Advanced Filters
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                >
                  <Icon name="X" size={20} />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Location */}
              <div>
                <LocationInput
                  label="Location"
                  placeholder="e.g., Bengaluru, Karnataka or Remote"
                  value={localFilters.location}
                  onChange={(val) => handleFilterChange('location', val)}
                />
              </div>

              {/* Salary Range */}
              <div>
                <Select
                  label="Salary Range"
                  placeholder="Select salary range"
                  options={salaryRanges}
                  value={localFilters.salaryRange}
                  onChange={(value) => handleFilterChange('salaryRange', value)}
                />
              </div>

              {/* Experience Level */}
              <div>
                <Select
                  label="Experience Level"
                  placeholder="Select experience level"
                  options={experienceLevels}
                  value={localFilters.experienceLevel}
                  onChange={(value) => handleFilterChange('experienceLevel', value)}
                />
              </div>

              {/* Job Types */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  Job Types
                </label>
                <div className="space-y-2">
                  {jobTypes.map((type) => (
                    <Checkbox
                      key={type.value}
                      label={type.label}
                      checked={localFilters.jobTypes?.includes(type.value)}
                      onChange={(e) => {
                        const currentTypes = localFilters.jobTypes || [];
                        const newTypes = e.target.checked
                          ? [...currentTypes, type.value]
                          : currentTypes.filter(t => t !== type.value);
                        handleFilterChange('jobTypes', newTypes);
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Work Mode */}
              <div>
                <Select
                  label="Work Mode"
                  placeholder="Select work mode"
                  options={workModes}
                  value={localFilters.workMode}
                  onChange={(value) => handleFilterChange('workMode', value)}
                />
              </div>

              {/* Company Size */}
              <div>
                <Select
                  label="Company Size"
                  placeholder="Select company size"
                  options={companySizes}
                  value={localFilters.companySize}
                  onChange={(value) => handleFilterChange('companySize', value)}
                />
              </div>

              {/* Skills */}
              <div>
                <Input
                  label="Required Skills"
                  type="text"
                  placeholder="e.g., React, Python, AWS"
                  description="Separate multiple skills with commas"
                  value={localFilters.skills}
                  onChange={(e) => handleFilterChange('skills', e.target.value)}
                />
              </div>

              {/* Posted Within */}
              <div>
                <Select
                  label="Posted Within"
                  placeholder="Select time period"
                  options={[
                    { value: '24h', label: 'Last 24 hours' },
                    { value: '3d', label: 'Last 3 days' },
                    { value: '1w', label: 'Last week' },
                    { value: '2w', label: 'Last 2 weeks' },
                    { value: '1m', label: 'Last month' }
                  ]}
                  value={localFilters.postedWithin}
                  onChange={(value) => handleFilterChange('postedWithin', value)}
                />
              </div>

              {/* Match Percentage */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Minimum Match Percentage: {localFilters.matchPercentage}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={localFilters.matchPercentage}
                  onChange={(e) => handleFilterChange('matchPercentage', parseInt(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-background border-t border-border p-6">
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={handleClear}
                  className="flex-1"
                >
                  Clear All
                </Button>
                <Button
                  variant="default"
                  onClick={handleApply}
                  className="flex-1 bg-gradient-primary"
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AdvancedFilterPanel;
