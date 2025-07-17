import React, { useState } from 'react';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';
import Input from 'components/ui/Input';
import { Checkbox } from 'components/ui/Checkbox';
import Select from 'components/ui/Select';

const jobTypeOptions = [
    { value: 'full-time', label: 'Full-time' },
    { value: 'part-time', label: 'Part-time' },
    { value: 'contract', label: 'Contract' },
    { value: 'freelance', label: 'Freelance' },
    { value: 'internship', label: 'Internship' }
];

const experienceOptions = [
    { value: '0-1', label: 'Entry Level (0-1 years)' },
    { value: '2-4', label: 'Mid Level (2-4 years)' },
    { value: '5-7', label: 'Senior Level (5-7 years)' },
    { value: '8+', label: 'Expert Level (8+ years)' }
];

const companySizeOptions = [
    { value: 'startup', label: 'Startup (1-50)' },
    { value: 'small', label: 'Small (51-200)' },
    { value: 'medium', label: 'Medium (201-1000)' },
    { value: 'large', label: 'Large (1000+)' }
];

const industryOptions = [
    { value: 'technology', label: 'Technology' },
    { value: 'finance', label: 'Finance' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'education', label: 'Education' },
    { value: 'retail', label: 'Retail' },
    { value: 'manufacturing', label: 'Manufacturing' }
];

const benefitOptions = [
    'Health Insurance',
    'Dental Insurance',
    'Vision Insurance',
    '401(k)',
    'Paid Time Off',
    'Remote Work',
    'Flexible Hours',
    'Stock Options',
    'Professional Development',
    'Gym Membership'
];

const postedDateOptions = [
    { value: '24h', label: 'Last 24 hours' },
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: 'any', label: 'Any time' }
];

const JobFeedFilterSidebar = ({ filters, onFilterChange, onApplyFilters, onClearFilters }) => {
    const [localFilters, setLocalFilters] = useState(filters || {});

    const handleFilterChange = (key, value) => {
        setLocalFilters(prev => ({ ...prev, [key]: value }));
        if (onFilterChange) onFilterChange(key, value);
    };

    const handleApply = () => {
        if (onApplyFilters) onApplyFilters(localFilters);
    };

    const handleClear = () => {
        setLocalFilters({});
        if (onClearFilters) onClearFilters();
    };

    return (
        <aside className="hidden lg:block lg:col-span-3">
            <div className="glassmorphic border-r border-white/20 h-full p-6 overflow-y-auto">
                <div className="flex items-center space-x-2 mb-6">
                    <Icon name="Filter" size={20} className="text-primary" />
                    <h2 className="text-lg font-semibold text-foreground">Filters</h2>
                </div>
                <div className="space-y-6">
                    {/* Salary Range */}
                    <div>
                        <h3 className="font-medium text-foreground mb-3">Salary Range</h3>
                        <div className="space-y-3">
                            <Input
                                type="number"
                                placeholder="Min salary (K)"
                                value={localFilters.salaryMin || ''}
                                onChange={e => handleFilterChange('salaryMin', e.target.value)}
                            />
                            <Input
                                type="number"
                                placeholder="Max salary (K)"
                                value={localFilters.salaryMax || ''}
                                onChange={e => handleFilterChange('salaryMax', e.target.value)}
                            />
                        </div>
                    </div>
                    {/* Job Type */}
                    <div>
                        <h3 className="font-medium text-foreground mb-3">Job Type</h3>
                        <Select
                            options={jobTypeOptions}
                            value={localFilters.jobType || ''}
                            onChange={value => handleFilterChange('jobType', value)}
                            placeholder="Select job type"
                        />
                    </div>
                    {/* Experience Level */}
                    <div>
                        <h3 className="font-medium text-foreground mb-3">Experience Level</h3>
                        <Select
                            options={experienceOptions}
                            value={localFilters.experience || ''}
                            onChange={value => handleFilterChange('experience', value)}
                            placeholder="Select experience level"
                        />
                    </div>
                    {/* Remote Work */}
                    <div>
                        <Checkbox
                            label="Remote work available"
                            checked={localFilters.remote || false}
                            onChange={e => handleFilterChange('remote', e.target.checked)}
                        />
                    </div>
                    {/* Company Size */}
                    <div>
                        <h3 className="font-medium text-foreground mb-3">Company Size</h3>
                        <Select
                            options={companySizeOptions}
                            value={localFilters.companySize || ''}
                            onChange={value => handleFilterChange('companySize', value)}
                            placeholder="Select company size"
                        />
                    </div>
                    {/* Industry */}
                    <div>
                        <h3 className="font-medium text-foreground mb-3">Industry</h3>
                        <Select
                            options={industryOptions}
                            value={localFilters.industry || ''}
                            onChange={value => handleFilterChange('industry', value)}
                            placeholder="Select industry"
                        />
                    </div>
                    {/* Skills */}
                    <div>
                        <h3 className="font-medium text-foreground mb-3">Required Skills</h3>
                        <Input
                            type="text"
                            placeholder="e.g., React, JavaScript, Python"
                            value={localFilters.skills || ''}
                            onChange={e => handleFilterChange('skills', e.target.value)}
                        />
                    </div>
                    {/* Benefits */}
                    <div>
                        <h3 className="font-medium text-foreground mb-3">Benefits</h3>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                            {benefitOptions.map(benefit => (
                                <Checkbox
                                    key={benefit}
                                    label={benefit}
                                    checked={localFilters.benefits?.includes(benefit) || false}
                                    onChange={e => {
                                        const currentBenefits = localFilters.benefits || [];
                                        if (e.target.checked) {
                                            handleFilterChange('benefits', [...currentBenefits, benefit]);
                                        } else {
                                            handleFilterChange('benefits', currentBenefits.filter(b => b !== benefit));
                                        }
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                    {/* Posted Date */}
                    <div>
                        <h3 className="font-medium text-foreground mb-3">Posted Date</h3>
                        <div className="space-y-2">
                            {postedDateOptions.map(option => (
                                <Checkbox
                                    key={option.value}
                                    label={option.label}
                                    checked={localFilters.postedDate === option.value}
                                    onChange={e => {
                                        if (e.target.checked) {
                                            handleFilterChange('postedDate', option.value);
                                        } else {
                                            handleFilterChange('postedDate', null);
                                        }
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
                {/* Action Buttons */}
                <div className="flex space-x-3 mt-8 pt-6 border-t border-white/10">
                    <Button
                        variant="outline"
                        onClick={handleClear}
                        className="flex-1"
                        iconName="RotateCcw"
                        iconPosition="left"
                    >
                        Clear
                    </Button>
                    <Button
                        variant="default"
                        onClick={handleApply}
                        className="flex-1"
                        iconName="Check"
                        iconPosition="left"
                    >
                        Apply
                    </Button>
                </div>
            </div>
        </aside>
    );
};

export default JobFeedFilterSidebar;
