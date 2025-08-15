import React, { useState } from 'react';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';
import Input from 'components/ui/Input';
import Select from 'components/ui/Select';
import LocationInput from 'components/ui/LocationInput';

const RequestReferralModal = ({ isOpen, onClose, onSubmitRequest }) => {
  const [formData, setFormData] = useState({
    position: '',
    company: '',
    location: '',
    jobUrl: '',
    timeline: '',
    experience: '',
    skills: [],
    message: '',
    resume: null
  });

  const timelineOptions = [
    { value: 'immediate', label: 'Immediate (within 1 week)' },
    { value: 'short', label: 'Short term (1-2 weeks)' },
    { value: 'medium', label: 'Medium term (2-4 weeks)' },
    { value: 'long', label: 'Long term (1+ months)' }
  ];

  const experienceOptions = [
    { value: 'entry', label: 'Entry Level (0-2 years)' },
    { value: 'mid', label: 'Mid Level (2-5 years)' },
    { value: 'senior', label: 'Senior Level (5-8 years)' },
    { value: 'lead', label: 'Lead/Principal (8+ years)' }
  ];

  const skillOptions = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'react', label: 'React' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'nodejs', label: 'Node.js' },
    { value: 'aws', label: 'AWS' },
    { value: 'docker', label: 'Docker' },
    { value: 'kubernetes', label: 'Kubernetes' },
    { value: 'product-management', label: 'Product Management' },
    { value: 'data-science', label: 'Data Science' },
    { value: 'machine-learning', label: 'Machine Learning' },
    { value: 'ui-ux', label: 'UI/UX Design' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        resume: file
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const request = {
      id: Date.now(),
      ...formData,
      status: 'pending',
      requestDate: new Date().toISOString(),
      requester: {
        name: 'John Doe',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
        title: 'Software Engineer'
      },
      points: calculatePoints(formData)
    };

    onSubmitRequest(request);
    handleReset();
    onClose();
  };

  const calculatePoints = (data) => {
    let points = 50; // Base points

    if (data.experience === 'senior' || data.experience === 'lead') points += 25;
    if (data.skills.length > 5) points += 15;
    if (data.timeline === 'immediate') points += 10;

    return points;
  };

  const handleReset = () => {
    setFormData({
      position: '',
      company: '',
      location: '',
      jobUrl: '',
      timeline: '',
      experience: '',
      skills: [],
      message: '',
      resume: null
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto glassmorphic rounded-xl shadow-elevation-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-semibold text-foreground">Request Referral</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Job Details */}
          <div className="space-y-4">
            <h3 className="font-medium text-foreground">Job Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Position Title"
                value={formData.position}
                onChange={(e) => handleInputChange('position', e.target.value)}
                placeholder="e.g., Senior Software Engineer"
                required
              />
              <Input
                label="Company"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                placeholder="e.g., Google"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <LocationInput
                label="Location"
                value={formData.location}
                onChange={(val) => handleInputChange('location', val)}
                placeholder="e.g., Bengaluru, Karnataka"
              />
              <Input
                label="Job URL (Optional)"
                value={formData.jobUrl}
                onChange={(e) => handleInputChange('jobUrl', e.target.value)}
                placeholder="https://..."
                type="url"
              />
            </div>
          </div>

          {/* Experience & Timeline */}
          <div className="space-y-4">
            <h3 className="font-medium text-foreground">Experience & Timeline</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Experience Level"
                options={experienceOptions}
                value={formData.experience}
                onChange={(value) => handleInputChange('experience', value)}
                placeholder="Select experience level"
                required
              />
              <Select
                label="Timeline"
                options={timelineOptions}
                value={formData.timeline}
                onChange={(value) => handleInputChange('timeline', value)}
                placeholder="Select timeline"
                required
              />
            </div>
          </div>

          {/* Skills */}
          <div className="space-y-4">
            <h3 className="font-medium text-foreground">Skills & Expertise</h3>

            <Select
              label="Relevant Skills"
              description="Select skills that match the job requirements"
              options={skillOptions}
              value={formData.skills}
              onChange={(value) => handleInputChange('skills', value)}
              multiple
              searchable
              placeholder="Select your skills"
              required
            />
          </div>

          {/* Message */}
          <div className="space-y-4">
            <h3 className="font-medium text-foreground">Personal Message</h3>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Message to Referrer
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                placeholder="Tell the referrer about your background, why you're interested in this role, and why you'd be a good fit..."
                rows={4}
                className="w-full bg-muted rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Be specific about your qualifications and motivation
              </p>
            </div>
          </div>

          {/* Resume Upload */}
          <div className="space-y-4">
            <h3 className="font-medium text-foreground">Resume</h3>

            <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center hover:border-primary/50 transition-spring">
              {formData.resume ? (
                <div className="flex items-center justify-center space-x-3">
                  <Icon name="FileText" size={24} className="text-primary" />
                  <div>
                    <p className="font-medium text-foreground">{formData.resume.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(formData.resume.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleInputChange('resume', null)}
                  >
                    <Icon name="X" size={16} />
                  </Button>
                </div>
              ) : (
                <div>
                  <Icon name="Upload" size={48} className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-2">Upload your resume</p>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="resume-upload"
                  />
                  <label
                    htmlFor="resume-upload"
                    className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg cursor-pointer hover:bg-primary/90 transition-spring"
                  >
                    <Icon name="Upload" size={16} className="mr-2" />
                    Choose File
                  </label>
                  <p className="text-xs text-muted-foreground mt-2">
                    PDF, DOC, or DOCX (max 5MB)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Points Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Icon name="Star" size={16} className="text-blue-500" />
              <span className="font-medium text-blue-700 dark:text-blue-300">Referral Points</span>
            </div>
            <p className="text-sm text-blue-600 dark:text-blue-400">
              This request will be worth approximately {calculatePoints(formData)} points for the referrer.
              Higher points increase the likelihood of getting a response.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-white/10">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!formData.position || !formData.company || !formData.message}
              className="min-w-[120px]"
            >
              Submit Request
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestReferralModal;
