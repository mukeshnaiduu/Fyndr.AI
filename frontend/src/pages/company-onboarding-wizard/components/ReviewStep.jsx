import React, { useState } from 'react';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';
import Button from 'components/ui/Button';
import { Checkbox } from 'components/ui/Checkbox';
import { getApiUrl } from 'utils/api';

const ReviewStep = ({ data, onUpdate, onComplete, onPrev, onStepChange }) => {
  const [formData, setFormData] = useState({
    slaAcknowledged: data.slaAcknowledged || false,
    finalConfirmation: data.finalConfirmation || false,
    ...data
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const steps = [
    { key: 'company', label: 'Company Profile', icon: 'Building' },
    { key: 'team', label: 'Team Setup', icon: 'Users' },
    { key: 'dei', label: 'DEI & Compliance', icon: 'Shield' },
    { key: 'integrations', label: 'Integrations', icon: 'Link' },
    { key: 'billing', label: 'Billing', icon: 'CreditCard' }
  ];

  const handleComplete = async () => {
    if (!formData.slaAcknowledged || !formData.finalConfirmation) {
      return;
    }
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('accessToken');
      // Convert frontend camelCase to backend snake_case
      const payload = {
        company_name: formData.companyName || '',
        industry: formData.industry || '',
        company_size: formData.companySize || '',
        website: formData.website || '',
        description: formData.description || '',
        logo: formData.logo || '',
        headquarters: formData.headquarters || '',
        founded_year: formData.foundedYear || '',
        team_members: formData.teamMembers || [],
        invite_emails: formData.inviteEmails || [],
        default_role: formData.defaultRole || '',
        allow_invites: formData.allowInvites || false,
        require_approval: formData.requireApproval || true,
        activity_notifications: formData.activityNotifications || true,
        dei_commitment: formData.deiCommitment || '',
        diversity_goals: formData.diversityGoals || [],
        inclusion_policies: formData.inclusionPolicies || [],
        compliance_requirements: formData.complianceRequirements || [],
        reporting_frequency: formData.reportingFrequency || '',
        diversity_metrics: formData.diversityMetrics || false,
        anonymous_data: formData.anonymousData || false,
        bias_alerts: formData.biasAlerts || false,
        selected_integrations: formData.selectedIntegrations || [],
        hris_system: formData.hrisSystem || '',
        ats_system: formData.atsSystem || '',
        selected_plan: formData.selectedPlan || '',
        billing_cycle: formData.billingCycle || '',
        payment_method: formData.paymentMethod || '',
        billing_address: formData.billingAddress || {},
        agree_to_terms: formData.agreeToTerms || false,
        marketing_emails: formData.marketingEmails || false,
        sla_acknowledged: formData.slaAcknowledged || false,
        final_confirmation: formData.finalConfirmation || false,
      };

      // Use apiRequest utility for consistency
      await import('utils/api').then(({ apiRequest }) =>
        apiRequest('/auth/company-onboarding/', 'POST', payload, token)
      );

      // Fetch updated profile and update localStorage
      const profileRes = await fetch(getApiUrl('/auth/profile/'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!profileRes.ok) {
        throw new Error(`Failed to fetch updated profile: ${profileRes.status} ${profileRes.statusText}`);
      }

      const contentType = profileRes.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await profileRes.text();
        throw new Error(`Server returned non-JSON response: ${textResponse.substring(0, 200)}...`);
      }

      const profileData = await profileRes.json();

      // Merge profile data with onboarding data for complete user info
      const mergedProfile = {
        ...profileData,
        ...(profileData.onboarding || {}),
        id: profileData.id,
        username: profileData.username,
        email: profileData.email,
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        role: profileData.role,
        onboarding_complete: profileData.onboarding_complete
      };
      localStorage.setItem('user', JSON.stringify(mergedProfile));
      // Force Navbar to update by dispatching a storage event
      window.dispatchEvent(new StorageEvent('storage', { key: 'user', newValue: JSON.stringify(mergedProfile) }));

      localStorage.setItem('companyOnboardingComplete', 'true');
      onUpdate(formData);
      onComplete();
    } catch (error) {
      alert('Failed to save onboarding. Please try again.');
      console.error('Error completing onboarding:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const CompanySection = () => (
    <div className="glass-card p-6 rounded-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Company Profile</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onStepChange(0)}
          iconName="Edit"
          iconPosition="left"
        >
          Edit
        </Button>
      </div>

      <div className="flex items-start space-x-4">
        {data.logo && (
          <div className="w-16 h-16 rounded-card overflow-hidden bg-muted">
            <Image
              src={data.logo}
              alt="Company logo"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="flex-1">
          <h4 className="font-medium text-foreground mb-2">{data.companyName}</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Industry:</span>
              <span className="text-foreground ml-2 capitalize">{data.industry}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Size:</span>
              <span className="text-foreground ml-2">{data.companySize}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Website:</span>
              <span className="text-foreground ml-2">{data.website}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Location:</span>
              <span className="text-foreground ml-2">{data.headquarters}</span>
            </div>
          </div>
          {data.description && (
            <p className="text-sm text-muted-foreground mt-3 line-clamp-3">
              {data.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const TeamSection = () => (
    <div className="glass-card p-6 rounded-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Team Setup</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onStepChange(1)}
          iconName="Edit"
          iconPosition="left"
        >
          Edit
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-foreground mb-2">Invited Members</h4>
          <div className="space-y-2">
            {data.inviteEmails?.filter(email => email.trim()).map((email, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm">
                <Icon name="Mail" size={14} className="text-muted-foreground" />
                <span className="text-foreground">{email}</span>
                <span className="text-muted-foreground">({data.defaultRole})</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Allow invites:</span>
            <span className="text-foreground ml-2">
              {data.allowInvites ? 'Yes' : 'No'}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Require approval:</span>
            <span className="text-foreground ml-2">
              {data.requireApproval ? 'Yes' : 'No'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const DEISection = () => (
    <div className="glass-card p-6 rounded-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">DEI & Compliance</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onStepChange(2)}
          iconName="Edit"
          iconPosition="left"
        >
          Edit
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-foreground mb-2">Diversity Goals</h4>
          <div className="flex flex-wrap gap-2">
            {data.diversityGoals?.map((goal, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
              >
                {goal.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-medium text-foreground mb-2">Inclusion Policies</h4>
          <div className="flex flex-wrap gap-2">
            {data.inclusionPolicies?.map((policy, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-secondary/10 text-secondary text-xs rounded-full"
              >
                {policy.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
            ))}
          </div>
        </div>

        <div className="text-sm">
          <span className="text-muted-foreground">Reporting:</span>
          <span className="text-foreground ml-2 capitalize">{data.reportingFrequency}</span>
        </div>
      </div>
    </div>
  );

  const IntegrationsSection = () => (
    <div className="glass-card p-6 rounded-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Integrations</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onStepChange(3)}
          iconName="Edit"
          iconPosition="left"
        >
          Edit
        </Button>
      </div>

      <div>
        {data.selectedIntegrations?.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {data.selectedIntegrations.map((integration, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-accent/10 text-accent text-sm rounded-full"
              >
                {integration.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">No integrations selected</p>
        )}
      </div>
    </div>
  );

  const BillingSection = () => (
    <div className="glass-card p-6 rounded-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Billing & Subscription</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onStepChange(4)}
          iconName="Edit"
          iconPosition="left"
        >
          Edit
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-foreground capitalize">{data.selectedPlan} Plan</h4>
            <p className="text-sm text-muted-foreground capitalize">
              Billed {data.billingCycle}
            </p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-foreground">
              ${data.billingCycle === 'yearly' ?
                (data.selectedPlan === 'starter' ? 990 :
                  data.selectedPlan === 'professional' ? 1990 : 3990) :
                (data.selectedPlan === 'starter' ? 99 :
                  data.selectedPlan === 'professional' ? 199 : 399)
              }
            </p>
            <p className="text-sm text-muted-foreground">
              /{data.billingCycle === 'yearly' ? 'year' : 'month'}
            </p>
          </div>
        </div>

        <div className="text-sm">
          <p className="text-muted-foreground">Billing Address:</p>
          <p className="text-foreground">
            {data.billingAddress?.company}<br />
            {data.billingAddress?.address}<br />
            {data.billingAddress?.city}, {data.billingAddress?.state} {data.billingAddress?.zipCode}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Review & Complete</h2>
        <p className="text-muted-foreground">
          Review your configuration and complete the onboarding process
        </p>
      </div>

      {/* Progress Summary */}
      <div className="glass-card p-6 rounded-card">
        <h3 className="text-lg font-semibold text-foreground mb-4">Setup Progress</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {steps.map((step, index) => (
            <div key={step.key} className="text-center">
              <div className="w-12 h-12 bg-success rounded-full flex items-center justify-center mx-auto mb-2">
                <Icon name="Check" size={20} color="white" />
              </div>
              <p className="text-sm font-medium text-foreground">{step.label}</p>
              <p className="text-xs text-success">Complete</p>
            </div>
          ))}
        </div>
      </div>

      {/* Configuration Review */}
      <div className="space-y-6">
        <CompanySection />
        <TeamSection />
        <DEISection />
        <IntegrationsSection />
        <BillingSection />
      </div>

      {/* SLA Agreement */}
      <div className="glass-card p-6 rounded-card">
        <h3 className="text-lg font-semibold text-foreground mb-4">Service Level Agreement</h3>

        <div className="bg-muted p-4 rounded-card mb-4 max-h-48 overflow-y-auto">
          <div className="text-sm text-foreground space-y-3">
            <p><strong>1. Service Availability:</strong> We guarantee 99.9% uptime for our platform services.</p>
            <p><strong>2. Data Security:</strong> All data is encrypted in transit and at rest using industry-standard protocols.</p>
            <p><strong>3. Support Response:</strong> Priority support tickets will be responded to within 4 hours during business hours.</p>
            <p><strong>4. Data Backup:</strong> Daily automated backups with 30-day retention period.</p>
            <p><strong>5. Compliance:</strong> Our platform maintains SOC 2 Type II, GDPR, and CCPA compliance.</p>
            <p><strong>6. Performance:</strong> Page load times will not exceed 3 seconds under normal conditions.</p>
            <p><strong>7. Maintenance:</strong> Scheduled maintenance will be announced 48 hours in advance.</p>
          </div>
        </div>

        <Checkbox
          label="I acknowledge and agree to the Service Level Agreement"
          description="By checking this box, you confirm that you have read and agree to our SLA terms"
          checked={formData.slaAcknowledged}
          onChange={(e) => setFormData(prev => ({ ...prev, slaAcknowledged: e.target.checked }))}
          required
        />
      </div>

      {/* Final Confirmation */}
      <div className="glass-card p-6 rounded-card bg-primary/5 border-primary/20">
        <div className="flex items-start space-x-3">
          <Icon name="AlertCircle" size={20} className="text-primary mt-1" />
          <div className="flex-1">
            <h4 className="font-semibold text-foreground mb-2">Final Confirmation</h4>
            <p className="text-sm text-muted-foreground mb-4">
              By completing this onboarding process, you confirm that all information provided is accurate
              and you agree to our terms of service. Your account will be activated immediately.
            </p>

            <Checkbox
              label="I confirm that all information is accurate and complete"
              description="This confirmation is required to activate your account"
              checked={formData.finalConfirmation}
              onChange={(e) => setFormData(prev => ({ ...prev, finalConfirmation: e.target.checked }))}
              required
            />
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onPrev} iconName="ChevronLeft" iconPosition="left">
          Previous
        </Button>
        <Button
          onClick={handleComplete}
          loading={isSubmitting}
          disabled={!formData.slaAcknowledged || !formData.finalConfirmation}
          iconName="Check"
          iconPosition="left"
          className="px-8"
        >
          {isSubmitting ? 'Setting up your account...' : 'Complete Setup'}
        </Button>
      </div>
    </div>
  );
};

export default ReviewStep;
