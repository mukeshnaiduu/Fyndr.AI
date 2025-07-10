import React, { useState } from 'react';
import Icon from 'components/AppIcon';
import Input from 'components/ui/Input';
import Select from 'components/ui/Select';
import Button from 'components/ui/Button';
import { Checkbox } from 'components/ui/Checkbox';

const BillingStep = ({ data, onUpdate, onNext, onPrev }) => {
  const [formData, setFormData] = useState({
    selectedPlan: data.selectedPlan || 'professional',
    billingCycle: data.billingCycle || 'monthly',
    paymentMethod: data.paymentMethod || '',
    billingAddress: data.billingAddress || {
      company: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US'
    },
    ...data
  });

  const [errors, setErrors] = useState({});

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      description: 'Perfect for small teams getting started',
      monthlyPrice: 99,
      yearlyPrice: 990,
      features: [
        'Up to 5 job postings',
        'Basic candidate tracking',
        'Email support',
        'Standard templates',
        'Basic analytics'
      ],
      limits: {
        jobs: 5,
        users: 3,
        candidates: 100
      }
    },
    {
      id: 'professional',
      name: 'Professional',
      description: 'Ideal for growing companies',
      monthlyPrice: 199,
      yearlyPrice: 1990,
      popular: true,
      features: [
        'Unlimited job postings',
        'Advanced candidate tracking',
        'Priority support',
        'Custom templates',
        'Advanced analytics',
        'Team collaboration',
        'API access'
      ],
      limits: {
        jobs: 'Unlimited',
        users: 10,
        candidates: 1000
      }
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'For large organizations with complex needs',
      monthlyPrice: 399,
      yearlyPrice: 3990,
      features: [
        'Everything in Professional',
        'Custom integrations',
        'Dedicated account manager',
        'Advanced security',
        'Custom reporting',
        'SLA guarantee',
        'White-label options'
      ],
      limits: {
        jobs: 'Unlimited',
        users: 'Unlimited',
        candidates: 'Unlimited'
      }
    }
  ];

  const countryOptions = [
    { value: 'US', label: 'United States' },
    { value: 'CA', label: 'Canada' },
    { value: 'UK', label: 'United Kingdom' },
    { value: 'DE', label: 'Germany' },
    { value: 'FR', label: 'France' },
    { value: 'AU', label: 'Australia' }
  ];

  const stateOptions = [
    { value: 'CA', label: 'California' },
    { value: 'NY', label: 'New York' },
    { value: 'TX', label: 'Texas' },
    { value: 'FL', label: 'Florida' },
    { value: 'IL', label: 'Illinois' }
  ];

  const handlePlanSelect = (planId) => {
    setFormData(prev => ({ ...prev, selectedPlan: planId }));
  };

  const handleBillingCycleChange = (cycle) => {
    setFormData(prev => ({ ...prev, billingCycle: cycle }));
  };

  const handleAddressChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      billingAddress: {
        ...prev.billingAddress,
        [field]: value
      }
    }));
  };

  const calculatePrice = (plan) => {
    const price = formData.billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
    const savings = formData.billingCycle === 'yearly' ? (plan.monthlyPrice * 12 - plan.yearlyPrice) : 0;
    return { price, savings };
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.selectedPlan) {
      newErrors.selectedPlan = 'Please select a plan';
    }
    
    if (!formData.billingAddress.company.trim()) {
      newErrors.company = 'Company name is required';
    }
    
    if (!formData.billingAddress.address.trim()) {
      newErrors.address = 'Address is required';
    }
    
    if (!formData.billingAddress.city.trim()) {
      newErrors.city = 'City is required';
    }
    
    if (!formData.billingAddress.zipCode.trim()) {
      newErrors.zipCode = 'ZIP code is required';
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

  const selectedPlan = plans.find(plan => plan.id === formData.selectedPlan);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Billing & Subscription</h2>
        <p className="text-muted-foreground">
          Choose your plan and configure billing preferences
        </p>
      </div>

      {/* Billing Cycle Toggle */}
      <div className="flex justify-center">
        <div className="glass-card p-2 rounded-card inline-flex">
          <button
            onClick={() => handleBillingCycleChange('monthly')}
            className={`px-4 py-2 rounded text-sm font-medium transition-all duration-300 ${
              formData.billingCycle === 'monthly' ?'bg-primary text-primary-foreground shadow-elevation-1' :'text-muted-foreground hover:text-foreground'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => handleBillingCycleChange('yearly')}
            className={`px-4 py-2 rounded text-sm font-medium transition-all duration-300 relative ${
              formData.billingCycle === 'yearly' ?'bg-primary text-primary-foreground shadow-elevation-1' :'text-muted-foreground hover:text-foreground'
            }`}
          >
            Yearly
            <span className="absolute -top-1 -right-1 bg-success text-success-foreground text-xs px-1 rounded">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* Plan Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const { price, savings } = calculatePrice(plan);
          const isSelected = formData.selectedPlan === plan.id;

          return (
            <div
              key={plan.id}
              className={`glass-card p-6 rounded-card transition-all duration-300 hover-lift cursor-pointer relative ${
                isSelected ? 'ring-2 ring-primary' : ''
              } ${plan.popular ? 'ring-2 ring-secondary' : ''}`}
              onClick={() => handlePlanSelect(plan.id)}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-xs font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-foreground mb-2">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                
                <div className="mb-4">
                  <span className="text-3xl font-bold text-foreground">${price}</span>
                  <span className="text-muted-foreground">
                    /{formData.billingCycle === 'yearly' ? 'year' : 'month'}
                  </span>
                  {savings > 0 && (
                    <p className="text-sm text-success mt-1">
                      Save ${savings} per year
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Icon name="Check" size={16} className="text-success" />
                    <span className="text-sm text-foreground">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4 mb-6">
                <h4 className="text-sm font-medium text-foreground mb-2">Limits</h4>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Job postings:</span>
                    <span className="text-foreground">{plan.limits.jobs}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Team members:</span>
                    <span className="text-foreground">{plan.limits.users}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Candidates:</span>
                    <span className="text-foreground">{plan.limits.candidates}</span>
                  </div>
                </div>
              </div>

              <Button
                variant={isSelected ? 'default' : 'outline'}
                fullWidth
                iconName={isSelected ? 'Check' : 'Plus'}
                iconPosition="left"
              >
                {isSelected ? 'Selected' : 'Select Plan'}
              </Button>
            </div>
          );
        })}
      </div>

      {/* Billing Address */}
      <div className="glass-card p-6 rounded-card">
        <h3 className="text-lg font-semibold text-foreground mb-6">Billing Address</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="lg:col-span-2">
            <Input
              label="Company Name"
              type="text"
              placeholder="Your Company Inc."
              value={formData.billingAddress.company}
              onChange={(e) => handleAddressChange('company', e.target.value)}
              error={errors.company}
              required
            />
          </div>

          <div className="lg:col-span-2">
            <Input
              label="Address"
              type="text"
              placeholder="123 Main Street"
              value={formData.billingAddress.address}
              onChange={(e) => handleAddressChange('address', e.target.value)}
              error={errors.address}
              required
            />
          </div>

          <Input
            label="City"
            type="text"
            placeholder="San Francisco"
            value={formData.billingAddress.city}
            onChange={(e) => handleAddressChange('city', e.target.value)}
            error={errors.city}
            required
          />

          <Select
            label="State/Province"
            options={stateOptions}
            value={formData.billingAddress.state}
            onChange={(value) => handleAddressChange('state', value)}
            placeholder="Select state"
          />

          <Input
            label="ZIP/Postal Code"
            type="text"
            placeholder="94105"
            value={formData.billingAddress.zipCode}
            onChange={(e) => handleAddressChange('zipCode', e.target.value)}
            error={errors.zipCode}
            required
          />

          <Select
            label="Country"
            options={countryOptions}
            value={formData.billingAddress.country}
            onChange={(value) => handleAddressChange('country', value)}
            required
          />
        </div>
      </div>

      {/* Order Summary */}
      {selectedPlan && (
        <div className="glass-card p-6 rounded-card bg-primary/5 border-primary/20">
          <h3 className="text-lg font-semibold text-foreground mb-4">Order Summary</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-foreground">{selectedPlan.name} Plan</span>
              <span className="font-medium text-foreground">
                ${calculatePrice(selectedPlan).price}
                /{formData.billingCycle === 'yearly' ? 'year' : 'month'}
              </span>
            </div>
            
            {formData.billingCycle === 'yearly' && calculatePrice(selectedPlan).savings > 0 && (
              <div className="flex justify-between text-success">
                <span>Annual discount</span>
                <span>-${calculatePrice(selectedPlan).savings}</span>
              </div>
            )}
            
            <div className="border-t border-border pt-3">
              <div className="flex justify-between font-semibold text-foreground">
                <span>Total</span>
                <span>${calculatePrice(selectedPlan).price}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-accent/10 rounded-card">
            <div className="flex items-start space-x-2">
              <Icon name="Info" size={16} className="text-accent mt-0.5" />
              <div className="text-sm text-accent">
                <p className="font-medium">Free 14-day trial included</p>
                <p>You won't be charged until your trial period ends. Cancel anytime.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Terms and Conditions */}
      <div className="glass-card p-6 rounded-card">
        <div className="space-y-4">
          <Checkbox
            label="I agree to the Terms of Service and Privacy Policy"
            description="By checking this box, you agree to our terms and conditions"
            checked={formData.agreeToTerms || false}
            onChange={(e) => setFormData(prev => ({ ...prev, agreeToTerms: e.target.checked }))}
            required
          />
          
          <Checkbox
            label="I agree to receive marketing communications"
            description="Get updates about new features and product announcements"
            checked={formData.marketingEmails || false}
            onChange={(e) => setFormData(prev => ({ ...prev, marketingEmails: e.target.checked }))}
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onPrev} iconName="ChevronLeft" iconPosition="left">
          Previous
        </Button>
        <Button onClick={handleNext} iconName="ChevronRight" iconPosition="right">
          Next: Review & Complete
        </Button>
      </div>
    </div>
  );
};

export default BillingStep;
