// Shared subscription plans used in onboarding and profile management billing
export const PLANS = [
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

export const PLANS_BY_ID = PLANS.reduce((acc, p) => { acc[p.id] = p; return acc; }, {});
