import React, { useState } from 'react';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';
import Image from 'components/AppImage';

const JobDetailModal = ({ job, isOpen, onClose, onApply, onSave }) => {
  const [isApplying, setIsApplying] = useState(false);
  const [isSaved, setIsSaved] = useState(job?.isSaved || false);
  const [activeTab, setActiveTab] = useState('overview');

  if (!isOpen || !job) return null;

  const handleApply = async () => {
    setIsApplying(true);
    await onApply(job.id);
    setIsApplying(false);
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    onSave(job.id, !isSaved);
  };

  const getMatchColor = (percentage) => {
    if (percentage >= 90) return 'text-success';
    if (percentage >= 70) return 'text-accent';
    if (percentage >= 50) return 'text-warning';
    return 'text-error';
  };

  const formatSalary = (min, max) => {
    if (min && max) {
      return `$${min}K - $${max}K`;
    }
    if (min) {
      return `$${min}K+`;
    }
    return 'Salary not disclosed';
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'FileText' },
    { id: 'requirements', label: 'Requirements', icon: 'CheckSquare' },
    { id: 'company', label: 'Company', icon: 'Building' },
    { id: 'benefits', label: 'Benefits', icon: 'Gift' }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="glassmorphic border border-white/20 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-white/10 flex-shrink-0">
                <Image
                  src={job.company.logo}
                  alt={`${job.company.name} logo`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{job.title}</h1>
                <p className="text-lg text-muted-foreground">{job.company.name}</p>
                <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Icon name="MapPin" size={14} />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Icon name="Clock" size={14} />
                    <span>{job.type}</span>
                  </div>
                  <div className={`font-medium ${getMatchColor(job.matchPercentage)}`}>
                    {job.matchPercentage}% match
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSave}
                className={`p-2 rounded-full transition-all duration-200 hover:scale-110 ${
                  isSaved 
                    ? 'text-error bg-error/20' :'text-muted-foreground hover:text-error hover:bg-error/10'
                }`}
              >
                <Icon name="Heart" size={20} fill={isSaved ? "currentColor" : "none"} />
              </button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="hover:bg-white/10"
              >
                <Icon name="X" size={20} />
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3 mt-4">
            {job.applicationStatus === 'not-applied' && (
              <Button
                variant="default"
                loading={isApplying}
                onClick={handleApply}
                iconName="Send"
                iconPosition="left"
                className="px-8"
              >
                Apply Now
              </Button>
            )}
            
            <Button
              variant="outline"
              iconName="Share"
              iconPosition="left"
            >
              Share Job
            </Button>
            
            <Button
              variant="outline"
              iconName="Flag"
              iconPosition="left"
            >
              Report
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-white/10">
          <div className="flex space-x-1 p-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-primary/20 text-primary border border-primary/30' :'text-muted-foreground hover:bg-white/10'
                }`}
              >
                <Icon name={tab.icon} size={16} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-96">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-foreground mb-3">Job Description</h3>
                <p className="text-muted-foreground leading-relaxed">{job.description}</p>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-3">Key Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="glassmorphic-surface p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Icon name="DollarSign" size={16} className="text-primary" />
                      <span className="font-medium text-foreground">Salary</span>
                    </div>
                    <p className="text-muted-foreground">{formatSalary(job.salary.min, job.salary.max)}</p>
                  </div>
                  
                  <div className="glassmorphic-surface p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Icon name="Users" size={16} className="text-primary" />
                      <span className="font-medium text-foreground">Team Size</span>
                    </div>
                    <p className="text-muted-foreground">{job.teamSize || '5-10 people'}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-3">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-accent/20 text-accent rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'requirements' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-foreground mb-3">Minimum Requirements</h3>
                <ul className="space-y-2">
                  {job.requirements?.minimum?.map((req, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <Icon name="Check" size={16} className="text-success mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{req}</span>
                    </li>
                  )) || [
                    "Bachelor's degree in Computer Science or related field",
                    "3+ years of experience with React and JavaScript",
                    "Strong understanding of web development fundamentals",
                    "Experience with version control systems (Git)"
                  ].map((req, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <Icon name="Check" size={16} className="text-success mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-3">Preferred Qualifications</h3>
                <ul className="space-y-2">
                  {job.requirements?.preferred?.map((req, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <Icon name="Plus" size={16} className="text-accent mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{req}</span>
                    </li>
                  )) || [
                    "Experience with TypeScript and modern build tools",
                    "Knowledge of testing frameworks (Jest, React Testing Library)",
                    "Familiarity with cloud platforms (AWS, Azure, GCP)",
                    "Previous experience in agile development environments"
                  ].map((req, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <Icon name="Plus" size={16} className="text-accent mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'company' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-foreground mb-3">About {job.company.name}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {job.company.description || `${job.company.name} is a leading technology company focused on innovation and excellence. We're committed to creating products that make a difference in people's lives while fostering a collaborative and inclusive work environment.`}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glassmorphic-surface p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Icon name="Users" size={16} className="text-primary" />
                    <span className="font-medium text-foreground">Company Size</span>
                  </div>
                  <p className="text-muted-foreground">{job.company.size || '500-1000 employees'}</p>
                </div>
                
                <div className="glassmorphic-surface p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Icon name="MapPin" size={16} className="text-primary" />
                    <span className="font-medium text-foreground">Headquarters</span>
                  </div>
                  <p className="text-muted-foreground">{job.company.headquarters || 'San Francisco, CA'}</p>
                </div>
                
                <div className="glassmorphic-surface p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Icon name="Calendar" size={16} className="text-primary" />
                    <span className="font-medium text-foreground">Founded</span>
                  </div>
                  <p className="text-muted-foreground">{job.company.founded || '2015'}</p>
                </div>
                
                <div className="glassmorphic-surface p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Icon name="TrendingUp" size={16} className="text-primary" />
                    <span className="font-medium text-foreground">Industry</span>
                  </div>
                  <p className="text-muted-foreground">{job.company.industry || 'Technology'}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'benefits' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-foreground mb-3">Benefits & Perks</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(job.benefits || [
                    'Health, Dental & Vision Insurance',
                    '401(k) with Company Match',
                    'Unlimited PTO',
                    'Remote Work Options',
                    'Professional Development Budget',
                    'Gym Membership',
                    'Catered Meals',
                    'Stock Options'
                  ]).map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 glassmorphic-surface rounded-lg">
                      <Icon name="Check" size={16} className="text-success flex-shrink-0" />
                      <span className="text-muted-foreground">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobDetailModal;
