import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const BillingTab = ({ profile, onUpdate, isEditing, setIsEditing }) => {
  const handleSave = () => {
    setIsEditing(false);
  };

  const planFeatures = {
    basic: [
      'Up to 10 job postings per month',
      'Basic candidate filtering',
      'Email support',
      '5 team members'
    ],
    professional: [
      'Up to 50 job postings per month',
      'Advanced candidate filtering',
      'Priority support',
      '15 team members',
      'Analytics dashboard',
      'Integration with ATS'
    ],
    enterprise: [
      'Unlimited job postings',
      'AI-powered candidate matching',
      'Dedicated account manager',
      'Unlimited team members',
      'Advanced analytics',
      'Custom integrations',
      'White-label options'
    ]
  };

  const currentPlan = profile?.subscription_plan?.toLowerCase() || 'professional';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Billing & Subscription</h3>
        <Button variant="outline" size="sm">
          <Icon name="CreditCard" size={16} className="mr-2" />
          Update Payment Method
        </Button>
      </div>
      
      {/* Current Plan Overview */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-200 capitalize">
              {currentPlan} Plan
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Current subscription active until {profile?.next_billing_date || 'March 15, 2024'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-200">
              ${profile?.monthly_cost || '99'}/month
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              {profile?.billing_cycle || 'Monthly'} billing
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">
              Job Postings Used
            </label>
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                <div 
                  className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full" 
                  style={{ width: `${((profile?.job_postings_used || 12) / (profile?.job_postings_limit || 50)) * 100}%` }}
                ></div>
              </div>
              <span className="text-sm text-blue-800 dark:text-blue-300">
                {profile?.job_postings_used || 12}/{profile?.job_postings_limit || 50}
              </span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">
              Team Members
            </label>
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                <div 
                  className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full" 
                  style={{ width: `${((profile?.team_members_count || 8) / (profile?.team_members_limit || 15)) * 100}%` }}
                ></div>
              </div>
              <span className="text-sm text-blue-800 dark:text-blue-300">
                {profile?.team_members_count || 8}/{profile?.team_members_limit || 15}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Plan Features */}
      <div>
        <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-3">Current Plan Features</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {planFeatures[currentPlan]?.map((feature, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Icon name="Check" size={16} className="text-green-600" />
              <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Billing History */}
      <div>
        <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-3">Recent Billing History</h4>
        <div className="space-y-3">
          {[
            { date: 'Feb 15, 2024', amount: '$99.00', status: 'Paid', invoice: 'INV-001' },
            { date: 'Jan 15, 2024', amount: '$99.00', status: 'Paid', invoice: 'INV-002' },
            { date: 'Dec 15, 2023', amount: '$99.00', status: 'Paid', invoice: 'INV-003' }
          ].map((bill, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <Icon name="Receipt" size={16} className="text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{bill.invoice}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{bill.date}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{bill.amount}</span>
                <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
                  {bill.status}
                </span>
                <button className="text-primary hover:text-primary-dark">
                  <Icon name="Download" size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Method */}
      <div>
        <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-3">Payment Method</h4>
        <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <Icon name="CreditCard" size={20} className="text-gray-500" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Visa ending in {profile?.card_last_four || '4242'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Expires {profile?.card_expiry || '12/25'}
            </p>
          </div>
          <Button variant="outline" size="sm">
            Update
          </Button>
        </div>
      </div>

      {/* Plan Upgrade Options */}
      <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
        <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-3">Upgrade Options</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentPlan !== 'enterprise' && (
            <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
              <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                {currentPlan === 'basic' ? 'Professional Plan' : 'Enterprise Plan'}
              </h5>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {currentPlan === 'basic' 
                  ? 'Get advanced features and better support' 
                  : 'Unlimited access with dedicated support'
                }
              </p>
              <Button variant="primary" size="sm" className="w-full">
                Upgrade Now
              </Button>
            </div>
          )}
          <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
            <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Annual Billing</h5>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Save 20% with annual billing
            </p>
            <Button variant="outline" size="sm" className="w-full">
              Switch to Annual
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export { BillingTab };
