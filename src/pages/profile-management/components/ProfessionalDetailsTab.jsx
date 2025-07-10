import React, { useState } from 'react';
import Icon from 'components/AppIcon';
import Input from 'components/ui/Input';
import Button from 'components/ui/Button';
import Select from 'components/ui/Select';

const ProfessionalDetailsTab = ({ userProfile, onUpdateProfile }) => {
  const [formData, setFormData] = useState({
    jobTitle: userProfile.jobTitle || '',
    company: userProfile.company || '',
    experience: userProfile.experience || '',
    skills: userProfile.skills || [],
    industry: userProfile.industry || '',
    salary: userProfile.salary || '',
    availability: userProfile.availability || '',
    resume: userProfile.resume || null,
    portfolio: userProfile.portfolio || '',
    certifications: userProfile.certifications || []
  });

  const [errors, setErrors] = useState({});
  const [newSkill, setNewSkill] = useState('');
  const [newCertification, setNewCertification] = useState('');

  const experienceOptions = [
    { value: 'entry', label: 'Entry Level (0-2 years)' },
    { value: 'mid', label: 'Mid Level (2-5 years)' },
    { value: 'senior', label: 'Senior Level (5-10 years)' },
    { value: 'lead', label: 'Lead/Principal (10+ years)' },
    { value: 'executive', label: 'Executive/C-Level' }
  ];

  const industryOptions = [
    { value: 'technology', label: 'Technology' },
    { value: 'finance', label: 'Finance & Banking' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'education', label: 'Education' },
    { value: 'retail', label: 'Retail & E-commerce' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'consulting', label: 'Consulting' },
    { value: 'media', label: 'Media & Entertainment' },
    { value: 'nonprofit', label: 'Non-Profit' },
    { value: 'government', label: 'Government' },
    { value: 'other', label: 'Other' }
  ];

  const availabilityOptions = [
    { value: 'immediate', label: 'Available Immediately' },
    { value: '2weeks', label: 'Available in 2 weeks' },
    { value: '1month', label: 'Available in 1 month' },
    { value: '2months', label: 'Available in 2 months' },
    { value: 'not-looking', label: 'Not actively looking' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const addCertification = () => {
    if (newCertification.trim() && !formData.certifications.includes(newCertification.trim())) {
      setFormData(prev => ({
        ...prev,
        certifications: [...prev.certifications, newCertification.trim()]
      }));
      setNewCertification('');
    }
  };

  const removeCertification = (certToRemove) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter(cert => cert !== certToRemove)
    }));
  };

  const handleResumeUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setErrors(prev => ({
          ...prev,
          resume: 'File size must be less than 10MB'
        }));
        return;
      }

      if (!file.type.includes('pdf') && !file.type.includes('doc')) {
        setErrors(prev => ({
          ...prev,
          resume: 'Please upload a PDF or DOC file'
        }));
        return;
      }

      setFormData(prev => ({
        ...prev,
        resume: file
      }));

      setErrors(prev => ({
        ...prev,
        resume: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (userProfile.role === 'jobseeker') {
      if (!formData.jobTitle.trim()) {
        newErrors.jobTitle = 'Job title is required';
      }
      if (!formData.experience) {
        newErrors.experience = 'Experience level is required';
      }
      if (formData.skills.length === 0) {
        newErrors.skills = 'Please add at least one skill';
      }
    }

    if (userProfile.role === 'recruiter' || userProfile.role === 'employer') {
      if (!formData.company.trim()) {
        newErrors.company = 'Company name is required';
      }
      if (!formData.industry) {
        newErrors.industry = 'Industry is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onUpdateProfile(formData);
    }
  };

  const renderJobSeekerFields = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Desired Job Title"
          name="jobTitle"
          type="text"
          value={formData.jobTitle}
          onChange={handleInputChange}
          error={errors.jobTitle}
          required
          placeholder="e.g., Senior Software Engineer"
        />

        <Input
          label="Current/Previous Company"
          name="company"
          type="text"
          value={formData.company}
          onChange={handleInputChange}
          placeholder="e.g., TechCorp Inc."
        />

        <Select
          label="Experience Level"
          options={experienceOptions}
          value={formData.experience}
          onChange={(value) => handleSelectChange('experience', value)}
          error={errors.experience}
          required
          placeholder="Select your experience level"
        />

        <Select
          label="Industry"
          options={industryOptions}
          value={formData.industry}
          onChange={(value) => handleSelectChange('industry', value)}
          placeholder="Select your industry"
        />

        <Input
          label="Expected Salary"
          name="salary"
          type="text"
          value={formData.salary}
          onChange={handleInputChange}
          placeholder="e.g., $80,000 - $100,000"
          description="Annual salary range"
        />

        <Select
          label="Availability"
          options={availabilityOptions}
          value={formData.availability}
          onChange={(value) => handleSelectChange('availability', value)}
          placeholder="When can you start?"
        />
      </div>

      <Input
        label="Portfolio URL"
        name="portfolio"
        type="url"
        value={formData.portfolio}
        onChange={handleInputChange}
        placeholder="https://yourportfolio.com"
        description="Link to your portfolio or personal website"
      />
    </>
  );

  const renderRecruiterFields = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Company Name"
          name="company"
          type="text"
          value={formData.company}
          onChange={handleInputChange}
          error={errors.company}
          required
          placeholder="e.g., TechCorp Inc."
        />

        <Input
          label="Job Title"
          name="jobTitle"
          type="text"
          value={formData.jobTitle}
          onChange={handleInputChange}
          placeholder="e.g., Senior Recruiter"
        />

        <Select
          label="Industry"
          options={industryOptions}
          value={formData.industry}
          onChange={(value) => handleSelectChange('industry', value)}
          error={errors.industry}
          required
          placeholder="Select your industry"
        />

        <Select
          label="Experience Level"
          options={experienceOptions}
          value={formData.experience}
          onChange={(value) => handleSelectChange('experience', value)}
          placeholder="Your recruiting experience"
        />
      </div>
    </>
  );

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Professional Information */}
        <div className="glassmorphic p-6 rounded-squircle">
          <h3 className="font-heading font-heading-semibold text-foreground mb-4 flex items-center">
            <Icon name="Briefcase" size={20} className="mr-2" />
            Professional Information
          </h3>
          
          {userProfile.role === 'jobseeker' && renderJobSeekerFields()}
          {(userProfile.role === 'recruiter' || userProfile.role === 'employer') && renderRecruiterFields()}
        </div>

        {/* Skills Section */}
        <div className="glassmorphic p-6 rounded-squircle">
          <h3 className="font-heading font-heading-semibold text-foreground mb-4 flex items-center">
            <Icon name="Zap" size={20} className="mr-2" />
            Skills & Expertise
          </h3>
          
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                label="Add Skill"
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="e.g., React, Python, Project Management"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              />
              <Button
                type="button"
                variant="outline"
                onClick={addSkill}
                iconName="Plus"
                iconSize={16}
                className="mt-6"
              >
                Add
              </Button>
            </div>

            {errors.skills && (
              <p className="text-sm text-error">{errors.skills}</p>
            )}

            <div className="flex flex-wrap gap-2">
              {formData.skills.map((skill, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-body font-body-medium hover:bg-primary/20 spring-transition group"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="text-primary/60 hover:text-primary group-hover:scale-110 spring-transition"
                  >
                    <Icon name="X" size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Certifications Section */}
        <div className="glassmorphic p-6 rounded-squircle">
          <h3 className="font-heading font-heading-semibold text-foreground mb-4 flex items-center">
            <Icon name="Award" size={20} className="mr-2" />
            Certifications
          </h3>
          
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                label="Add Certification"
                type="text"
                value={newCertification}
                onChange={(e) => setNewCertification(e.target.value)}
                placeholder="e.g., AWS Certified Developer, PMP"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCertification())}
              />
              <Button
                type="button"
                variant="outline"
                onClick={addCertification}
                iconName="Plus"
                iconSize={16}
                className="mt-6"
              >
                Add
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {formData.certifications.map((cert, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 bg-accent/10 text-accent px-3 py-1.5 rounded-full text-sm font-body font-body-medium hover:bg-accent/20 spring-transition group"
                >
                  <span>{cert}</span>
                  <button
                    type="button"
                    onClick={() => removeCertification(cert)}
                    className="text-accent/60 hover:text-accent group-hover:scale-110 spring-transition"
                  >
                    <Icon name="X" size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Resume Upload (Job Seekers only) */}
        {userProfile.role === 'jobseeker' && (
          <div className="glassmorphic p-6 rounded-squircle">
            <h3 className="font-heading font-heading-semibold text-foreground mb-4 flex items-center">
              <Icon name="FileText" size={20} className="mr-2" />
              Resume
            </h3>
            
            <div className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-squircle p-6 text-center hover:border-primary/50 spring-transition">
                <Icon name="Upload" size={32} className="text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-2">
                  Upload your resume (PDF or DOC, max 10MB)
                </p>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleResumeUpload}
                  className="hidden"
                  id="resume-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('resume-upload').click()}
                  iconName="Upload"
                  iconPosition="left"
                  iconSize={16}
                >
                  Choose File
                </Button>
              </div>

              {formData.resume && (
                <div className="flex items-center justify-between bg-muted p-3 rounded-squircle">
                  <div className="flex items-center space-x-2">
                    <Icon name="FileText" size={16} className="text-primary" />
                    <span className="text-sm font-body font-body-medium">
                      {formData.resume.name || 'Resume uploaded'}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setFormData(prev => ({ ...prev, resume: null }))}
                    iconName="Trash2"
                    iconSize={14}
                    className="text-error hover:text-error"
                  >
                    Remove
                  </Button>
                </div>
              )}

              {errors.resume && (
                <p className="text-sm text-error">{errors.resume}</p>
              )}
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            variant="default"
            iconName="Save"
            iconPosition="left"
            iconSize={16}
            className="glow-primary"
          >
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProfessionalDetailsTab;
