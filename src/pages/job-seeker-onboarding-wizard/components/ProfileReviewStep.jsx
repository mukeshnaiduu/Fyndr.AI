import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';
import Image from 'components/AppImage';

const ProfileReviewStep = ({ data, onUpdate, onPrev }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const navigate = useNavigate();

  const completionScore = calculateCompletionScore(data);

  function calculateCompletionScore(profileData) {
    let score = 0;
    const maxScore = 100;

    // Personal Information (30 points)
    if (profileData.firstName && profileData.lastName) score += 10;
    if (profileData.email) score += 5;
    if (profileData.phone) score += 5;
    if (profileData.location) score += 5;
    if (profileData.profileImage) score += 5;

    // Resume (20 points)
    if (profileData.resume) score += 20;

    // Skills (25 points)
    if (profileData.skills && profileData.skills.length > 0) {
      score += Math.min(profileData.skills.length * 3, 25);
    }

    // Career Preferences (25 points)
    if (profileData.jobTitle) score += 5;
    if (profileData.jobTypes && profileData.jobTypes.length > 0) score += 5;
    if (profileData.workArrangement) score += 5;
    if (profileData.preferredLocations && profileData.preferredLocations.length > 0) score += 5;
    if (profileData.industries && profileData.industries.length > 0) score += 5;

    return Math.min(score, maxScore);
  }

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setShowConfetti(true);
    
    // Navigate to dashboard after celebration
    setTimeout(() => {
      navigate('/ai-powered-job-feed-dashboard');
    }, 3000);
  };

  const formatSalaryRange = (min, max) => {
    if (!min && !max) return 'Not specified';
    if (!min) return `Up to $${parseInt(max).toLocaleString()}`;
    if (!max) return `From $${parseInt(min).toLocaleString()}`;
    return `$${parseInt(min).toLocaleString()} - $${parseInt(max).toLocaleString()}`;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-accent';
    if (score >= 40) return 'text-warning';
    return 'text-error';
  };

  const getScoreMessage = (score) => {
    if (score >= 80) return 'Excellent! Your profile is ready for AI matching.';
    if (score >= 60) return 'Good profile! Consider adding more details for better matches.';
    if (score >= 40) return 'Your profile needs more information for optimal matching.';
    return 'Please complete more sections to improve your job matches.';
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
          Review your profile
        </h2>
        <p className="text-muted-foreground">
          Make sure everything looks good before we start finding you amazing opportunities
        </p>
      </div>

      {/* Profile Completion Score */}
      <div className="max-w-2xl mx-auto">
        <div className="glass-card p-6 rounded-card text-center">
          <div className="relative w-24 h-24 mx-auto mb-4">
            <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-muted"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - completionScore / 100)}`}
                className={`${getScoreColor(completionScore)} transition-all duration-1000 ease-out`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-2xl font-bold ${getScoreColor(completionScore)}`}>
                {completionScore}%
              </span>
            </div>
          </div>
          
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Profile Completion
          </h3>
          <p className={`text-sm ${getScoreColor(completionScore)}`}>
            {getScoreMessage(completionScore)}
          </p>
        </div>
      </div>

      {/* Profile Summary */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="glass-card p-6 rounded-card">
          <div className="flex items-center space-x-2 mb-4">
            <Icon name="User" size={20} className="text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Personal Information</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center overflow-hidden">
                {data.profileImage ? (
                  <Image
                    src={data.profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Icon name="User" size={24} color="white" />
                )}
              </div>
              <div>
                <p className="font-medium text-foreground">
                  {data.firstName} {data.lastName}
                </p>
                <p className="text-sm text-muted-foreground">{data.email}</p>
                <p className="text-sm text-muted-foreground">{data.phone}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Icon name="MapPin" size={16} className="text-muted-foreground" />
                <span className="text-sm">{data.location || 'Not specified'}</span>
              </div>
              
              {data.linkedinUrl && (
                <div className="flex items-center space-x-2">
                  <Icon name="Linkedin" size={16} className="text-muted-foreground" />
                  <a href={data.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                    LinkedIn Profile
                  </a>
                </div>
              )}
              
              {data.portfolioUrl && (
                <div className="flex items-center space-x-2">
                  <Icon name="Globe" size={16} className="text-muted-foreground" />
                  <a href={data.portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                    Portfolio
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Resume */}
        <div className="glass-card p-6 rounded-card">
          <div className="flex items-center space-x-2 mb-4">
            <Icon name="FileText" size={20} className="text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Resume</h3>
          </div>
          
          {data.resume ? (
            <div className="flex items-center space-x-3 p-3 bg-success/10 border border-success/20 rounded-card">
              <Icon name="FileCheck" size={20} className="text-success" />
              <div>
                <p className="font-medium text-foreground">{data.resume.name}</p>
                <p className="text-sm text-muted-foreground">
                  Uploaded and analyzed by AI
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-3 p-3 bg-warning/10 border border-warning/20 rounded-card">
              <Icon name="AlertTriangle" size={20} className="text-warning" />
              <div>
                <p className="font-medium text-warning">No resume uploaded</p>
                <p className="text-sm text-muted-foreground">
                  Consider uploading for better matches
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Skills */}
        <div className="glass-card p-6 rounded-card">
          <div className="flex items-center space-x-2 mb-4">
            <Icon name="Zap" size={20} className="text-primary" />
            <h3 className="text-lg font-semibold text-foreground">
              Skills ({data.skills?.length || 0})
            </h3>
          </div>
          
          {data.skills && data.skills.length > 0 ? (
            <div className="space-y-3">
              {data.skills.slice(0, 6).map((skill) => (
                <div key={skill.id} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{skill.name}</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    skill.proficiency === 'expert' ? 'bg-primary/10 text-primary' :
                    skill.proficiency === 'advanced' ? 'bg-success/10 text-success' :
                    skill.proficiency === 'intermediate'? 'bg-accent/10 text-accent' : 'bg-warning/10 text-warning'
                  }`}>
                    {skill.proficiency}
                  </span>
                </div>
              ))}
              {data.skills.length > 6 && (
                <p className="text-sm text-muted-foreground">
                  +{data.skills.length - 6} more skills
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No skills added yet</p>
          )}
        </div>

        {/* Career Preferences */}
        <div className="glass-card p-6 rounded-card">
          <div className="flex items-center space-x-2 mb-4">
            <Icon name="Target" size={20} className="text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Career Preferences</h3>
          </div>
          
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Job Title</p>
              <p className="text-sm">{data.jobTitle || 'Not specified'}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-muted-foreground">Job Types</p>
              <p className="text-sm">
                {data.jobTypes?.length > 0 ? data.jobTypes.join(', ') : 'Not specified'}
              </p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-muted-foreground">Work Arrangement</p>
              <p className="text-sm">{data.workArrangement || 'Not specified'}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-muted-foreground">Salary Range</p>
              <p className="text-sm">{formatSalaryRange(data.salaryMin, data.salaryMax)}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-muted-foreground">Preferred Locations</p>
              <p className="text-sm">
                {data.preferredLocations?.length > 0 ? data.preferredLocations.join(', ') : 'Not specified'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {Array.from({ length: 50 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{
                x: Math.random() * window.innerWidth,
                y: -10,
                rotate: 0,
                scale: 0
              }}
              animate={{
                y: window.innerHeight + 10,
                rotate: 360,
                scale: 1
              }}
              transition={{
                duration: 3,
                delay: Math.random() * 2,
                ease: "easeOut"
              }}
              className="absolute w-2 h-2 bg-gradient-primary rounded-full"
            />
          ))}
        </div>
      )}

      {/* Success Message */}
      {showConfetti && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed inset-0 flex items-center justify-center z-40 bg-black/50"
        >
          <div className="glass-card p-8 rounded-card text-center max-w-md mx-4">
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="CheckCircle" size={32} color="white" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              Welcome to Fyndr.AI!
            </h3>
            <p className="text-muted-foreground mb-4">
              Your profile has been created successfully. We're now finding the perfect job matches for you.
            </p>
            <div className="flex items-center justify-center space-x-2 text-primary">
              <div className="animate-spin">
                <Icon name="Loader2" size={16} />
              </div>
              <span className="text-sm">Redirecting to dashboard...</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button
          variant="outline"
          onClick={onPrev}
          disabled={isSubmitting}
          iconName="ArrowLeft"
          iconPosition="left"
        >
          Previous
        </Button>
        
        <Button
          onClick={handleSubmit}
          loading={isSubmitting}
          iconName="Sparkles"
          iconPosition="left"
          className="bg-gradient-primary text-white hover:scale-105 transition-all duration-300"
        >
          {isSubmitting ? 'Creating Profile...' : 'Complete Setup'}
        </Button>
      </div>
    </motion.div>
  );
};

export default ProfileReviewStep;
