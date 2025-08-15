import React, { useState } from 'react';
import Icon from 'components/AppIcon';

import Select from 'components/ui/Select';
import Button from 'components/ui/Button';
import { Checkbox } from 'components/ui/Checkbox';

const DEIComplianceStep = ({ data, onUpdate, onNext, onPrev }) => {
  const [formData, setFormData] = useState({
    deiCommitment: data.deiCommitment || '',
    diversityGoals: data.diversityGoals || [],
    inclusionPolicies: data.inclusionPolicies || [],
    complianceRequirements: data.complianceRequirements || [],
    reportingFrequency: data.reportingFrequency || '',
    diversityMetrics: data.diversityMetrics || false,
    ...data
  });

  const [errors, setErrors] = useState({});

  const diversityGoalOptions = [
    { value: 'gender-parity', label: 'Gender Parity in Leadership' },
    { value: 'ethnic-diversity', label: 'Ethnic Diversity Targets' },
    { value: 'age-diversity', label: 'Age Diversity Initiatives' },
    { value: 'disability-inclusion', label: 'Disability Inclusion Programs' },
    { value: 'lgbtq-support', label: 'LGBTQ+ Support Initiatives' },
    { value: 'veteran-hiring', label: 'Veteran Hiring Programs' }
  ];

  const inclusionPolicyOptions = [
    { value: 'bias-training', label: 'Unconscious Bias Training' },
    { value: 'inclusive-hiring', label: 'Inclusive Hiring Practices' },
    { value: 'mentorship', label: 'Diversity Mentorship Programs' },
    { value: 'employee-groups', label: 'Employee Resource Groups' },
    { value: 'pay-equity', label: 'Pay Equity Audits' },
    { value: 'flexible-work', label: 'Flexible Work Arrangements' }
  ];

  const complianceOptions = [
    { value: 'eeo-1', label: 'EEO-1 Reporting' },
    { value: 'affirmative-action', label: 'Affirmative Action Plans' },
    { value: 'ada-compliance', label: 'ADA Compliance' },
    { value: 'title-vii', label: 'Title VII Compliance' },
    { value: 'state-local', label: 'State & Local Requirements' },
    { value: 'international', label: 'International Standards' }
  ];

  const reportingFrequencyOptions = [
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'semi-annual', label: 'Semi-Annual' },
    { value: 'annual', label: 'Annual' }
  ];

  const handleMultiSelectChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.deiCommitment.trim()) {
      newErrors.deiCommitment = 'DEI commitment statement is required';
    } else if (formData.deiCommitment.length < 100) {
      newErrors.deiCommitment = 'Commitment statement must be at least 100 characters';
    }

    if (formData.diversityGoals.length === 0) {
      newErrors.diversityGoals = 'Please select at least one diversity goal';
    }

    if (formData.inclusionPolicies.length === 0) {
      newErrors.inclusionPolicies = 'Please select at least one inclusion policy';
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
        <h2 className="text-2xl font-bold text-foreground mb-2">DEI & Compliance</h2>
        <p className="text-muted-foreground">
          Configure your diversity, equity, and inclusion policies and compliance requirements
        </p>
      </div>

      {/* DEI Commitment */}
      <div className="glass-card p-6 rounded-card">
        <h3 className="text-lg font-semibold text-foreground mb-4">DEI Commitment Statement</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Company DEI Statement <span className="text-error">*</span>
            </label>
            <textarea
              value={formData.deiCommitment}
              onChange={(e) => setFormData(prev => ({ ...prev, deiCommitment: e.target.value }))}
              placeholder="Describe your company's commitment to diversity, equity, and inclusion. Include your values, goals, and specific initiatives..."
              rows={6}
              className="w-full px-4 py-3 bg-background border border-border rounded-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-muted-foreground">
                Minimum 100 characters required
              </p>
              <p className={`text-xs ${formData.deiCommitment.length < 100 ? 'text-error' : 'text-success'
                }`}>
                {formData.deiCommitment.length}/1000
              </p>
            </div>
            {errors.deiCommitment && (
              <p className="text-sm text-error mt-1">{errors.deiCommitment}</p>
            )}
          </div>
        </div>
      </div>

      {/* Diversity Goals */}
      <div className="glass-card p-6 rounded-card">
        <h3 className="text-lg font-semibold text-foreground mb-4">Diversity Goals</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Select the diversity initiatives your company is committed to pursuing
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {diversityGoalOptions.map((goal) => (
            <div key={goal.value}>
              <Checkbox
                label={goal.label}
                checked={formData.diversityGoals.includes(goal.value)}
                onChange={() => handleMultiSelectChange('diversityGoals', goal.value)}
              />
            </div>
          ))}
        </div>

        {errors.diversityGoals && (
          <p className="text-sm text-error mt-2">{errors.diversityGoals}</p>
        )}
      </div>

      {/* Inclusion Policies */}
      <div className="glass-card p-6 rounded-card">
        <h3 className="text-lg font-semibold text-foreground mb-4">Inclusion Policies</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Select the inclusion policies and programs your company has implemented or plans to implement
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {inclusionPolicyOptions.map((policy) => (
            <div key={policy.value}>
              <Checkbox
                label={policy.label}
                checked={formData.inclusionPolicies.includes(policy.value)}
                onChange={() => handleMultiSelectChange('inclusionPolicies', policy.value)}
              />
            </div>
          ))}
        </div>

        {errors.inclusionPolicies && (
          <p className="text-sm text-error mt-2">{errors.inclusionPolicies}</p>
        )}
      </div>

      {/* Compliance Requirements */}
      <div className="glass-card p-6 rounded-card">
        <h3 className="text-lg font-semibold text-foreground mb-4">Compliance Requirements</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Select the compliance requirements that apply to your organization
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {complianceOptions.map((requirement) => (
            <div key={requirement.value}>
              <Checkbox
                label={requirement.label}
                checked={formData.complianceRequirements.includes(requirement.value)}
                onChange={() => handleMultiSelectChange('complianceRequirements', requirement.value)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Reporting & Metrics */}
      <div className="glass-card p-6 rounded-card">
        <h3 className="text-lg font-semibold text-foreground mb-4">Reporting & Metrics</h3>

        <div className="space-y-6">
          <Select
            label="Reporting Frequency"
            description="How often would you like to receive DEI reports?"
            options={reportingFrequencyOptions}
            value={formData.reportingFrequency}
            onChange={(value) => setFormData(prev => ({ ...prev, reportingFrequency: value }))}
            placeholder="Select reporting frequency"
          />

          <div className="space-y-4">
            <Checkbox
              label="Enable diversity metrics tracking"
              description="Track and analyze diversity metrics across your hiring process"
              checked={formData.diversityMetrics}
              onChange={(e) => setFormData(prev => ({ ...prev, diversityMetrics: e.target.checked }))}
            />

            <Checkbox
              label="Anonymous demographic data collection"
              description="Collect optional demographic information from candidates for reporting purposes"
              checked={formData.anonymousData || false}
              onChange={(e) => setFormData(prev => ({ ...prev, anonymousData: e.target.checked }))}
            />

            <Checkbox
              label="Bias detection alerts"
              description="Receive alerts when potential bias is detected in hiring decisions"
              checked={formData.biasAlerts || false}
              onChange={(e) => setFormData(prev => ({ ...prev, biasAlerts: e.target.checked }))}
            />
          </div>
        </div>
      </div>

      {/* Best Practices */}
      <div className="p-6 rounded-card bg-white dark:bg-gray-900 dark:border-gray-700 dark:glass-card">
        <div className="flex items-start space-x-3">
          <Icon name="Lightbulb" size={20} className="text-accent mt-1" />
          <div>
            <h4 className="font-semibold text-foreground mb-2">DEI Best Practices</h4>
            <ul className="text-sm text-muted-foreground dark:text-gray-200 space-y-1">
              <li>• Regularly review and update your DEI policies</li>
              <li>• Provide ongoing training for all team members</li>
              <li>• Set measurable goals and track progress</li>
              <li>• Create safe spaces for feedback and discussion</li>
              <li>• Partner with diverse organizations and communities</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onPrev} iconName="ChevronLeft" iconPosition="left">
          Previous
        </Button>
        <Button onClick={handleNext} iconName="ChevronRight" iconPosition="right">
          Next: Integrations
        </Button>
      </div>
    </div>
  );
};

export default DEIComplianceStep;
