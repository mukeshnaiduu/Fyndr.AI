import React, { useState } from 'react';
import Icon from 'components/AppIcon';
import Input from 'components/ui/Input';
import Button from 'components/ui/Button';
import Select from 'components/ui/Select';
import IndustryInput from 'components/ui/IndustryInput';
import RoleInput from 'components/ui/RoleInput';
import { getApiUrl } from 'utils/api';
import { INDUSTRY_OPTIONS } from 'constants/industries';
import { Checkbox } from 'components/ui/Checkbox';

const ProfessionalDetailsTab = ({ userProfile, onUpdateProfile, onDraftChange }) => {
  const [formData, setFormData] = useState({
    jobTitle: userProfile.jobTitle || '',
    company: userProfile.company || '',
    experience: userProfile.experience || '',
    // normalize skills to objects with name + proficiency if available
    skills: Array.isArray(userProfile.skills) ? userProfile.skills : [],
    // bring desired roles from profile if present
    desiredRoles: Array.isArray(userProfile.desiredRoles) ? userProfile.desiredRoles : (Array.isArray(userProfile.preferred_roles) ? userProfile.preferred_roles : []),
    // single industry kept for recruiter; jobseeker uses industries[]
    industry: userProfile.industry || '',
    industries: Array.isArray(userProfile.industries) ? userProfile.industries : [],
    salary_min: userProfile.salary_min || '',
    salary_max: userProfile.salary_max || '',
    salary_currency: userProfile.salary_currency || 'INR',
    availability: userProfile.availability || '',
    resume: userProfile.resume || null,
    portfolio: userProfile.portfolio || '',
    certifications: userProfile.certifications || []
  });

  const [errors, setErrors] = useState({});
  const [newSkill, setNewSkill] = useState('');
  const [newSkillProficiency, setNewSkillProficiency] = useState('intermediate');
  const [newCertification, setNewCertification] = useState('');
  const [industryInput, setIndustryInput] = useState('');

  const experienceOptions = [
    { value: 'entry', label: 'Entry Level (0-2 years)' },
    { value: 'mid', label: 'Mid Level (2-5 years)' },
    { value: 'senior', label: 'Senior Level (5-10 years)' },
    { value: 'lead', label: 'Lead/Principal (10+ years)' },
    { value: 'executive', label: 'Executive/C-Level' }
  ];

  // Industry options now come from DB-backed IndustryInput

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
    if (onDraftChange) onDraftChange({ [name]: value });

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
    if (onDraftChange) onDraftChange({ [name]: value });

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Desired role input local state for typeahead
  const [desiredRoleInput, setDesiredRoleInput] = useState('');

  // Salary bands removed per request; use explicit min/max inputs like onboarding

  // Industries shared list

  const addDesiredRole = () => {
    const val = (desiredRoleInput || '').trim();
    if (!val) return;
    if (!formData.desiredRoles?.includes(val)) {
      const next = [...(formData.desiredRoles || []), val];
      setFormData(prev => ({ ...prev, desiredRoles: next }));
      if (onDraftChange) onDraftChange({ desiredRoles: next });
    }
    setDesiredRoleInput('');
    if (errors.desiredRoles) setErrors(prev => ({ ...prev, desiredRoles: '' }));
  };

  const toggleIndustry = (name) => {
    const current = Array.isArray(formData.industries) ? formData.industries : [];
    const exists = current.includes(name);
    const next = exists ? current.filter(i => i !== name) : [...current, name];
    setFormData(prev => ({ ...prev, industries: next }));
    if (onDraftChange) onDraftChange({ industries: next });
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      // Normalize into object shape {name, proficiency}
      const normName = newSkill.trim();
      const skillExists = formData.skills.some(skill => {
        const skillName = typeof skill === 'object' ? (skill.name || skill.skill || skill) : skill;
        return skillName === normName;
      });

      if (!skillExists) {
        const newObj = { name: normName, proficiency: newSkillProficiency };
        const next = [...formData.skills, newObj];
        setFormData(prev => ({ ...prev, skills: next }));
        if (onDraftChange) onDraftChange({ skills: next });
        setNewSkill('');
        setNewSkillProficiency('intermediate');
      }
    }
  };

  const removeSkill = (skillToRemove) => {
    const next = formData.skills.filter(skill => {
      if (typeof skillToRemove === 'object') {
        return (skill.name || skill) !== (skillToRemove.name || skillToRemove);
      }
      const skillName = typeof skill === 'object' ? (skill.name || skill) : skill;
      return skillName !== skillToRemove;
    });
    setFormData(prev => ({ ...prev, skills: next }));
    if (onDraftChange) onDraftChange({ skills: next });
  };

  const setSkillProficiency = (skillName, level) => {
    const next = formData.skills.map(s => {
      const name = typeof s === 'object' ? (s.name || s) : s;
      if (name === skillName) {
        return { name, proficiency: level };
      }
      return typeof s === 'object' ? s : { name };
    });
    setFormData(prev => ({ ...prev, skills: next }));
    if (onDraftChange) onDraftChange({ skills: next });
  };

  const addCertification = () => {
    if (newCertification.trim()) {
      // Check if certification already exists (handle both string and object formats)
      const certExists = formData.certifications.some(cert => {
        const certName = typeof cert === 'object' ? (cert.name || cert.certification || cert) : cert;
        return certName === newCertification.trim();
      });

      if (!certExists) {
        setFormData(prev => ({
          ...prev,
          certifications: [...prev.certifications, newCertification.trim()]
        }));
        if (onDraftChange) onDraftChange({ certifications: [...formData.certifications, newCertification.trim()] });
        setNewCertification('');
      }
    }
  };

  const removeCertification = (certToRemove) => {
    const next = formData.certifications.filter(cert => cert !== certToRemove);
    setFormData(prev => ({ ...prev, certifications: next }));
    if (onDraftChange) onDraftChange({ certifications: next });
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, resume: 'File size must be less than 10MB' }));
      return;
    }
    if (!file.type.includes('pdf') && !file.type.includes('doc')) {
      setErrors(prev => ({ ...prev, resume: 'Please upload a PDF or DOC file' }));
      return;
    }

    // Optimistic UI: show file name
    setFormData(prev => ({ ...prev, resume: file }));
    setErrors(prev => ({ ...prev, resume: '' }));

    try {
      const authToken = localStorage.getItem('accessToken');
      const formDataFd = new FormData();
      formDataFd.append('file', file);
      formDataFd.append('type', 'resume');
      const res = await fetch(getApiUrl('/auth/upload/'), {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
        body: formDataFd
      });
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.error || 'Upload failed');
      // Notify parent/draft so checklist updates
      const tokenParam = localStorage.getItem('accessToken') || '';
      const urlWithToken = data.url ? `${data.url}${data.url.includes('?') ? '&' : '?'}token=${tokenParam}` : '';
      if (onDraftChange) onDraftChange({ resume: urlWithToken || true, resume_url: urlWithToken });
    } catch (err) {
      setErrors(prev => ({ ...prev, resume: 'Upload failed. Try again.' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (userProfile.role === 'jobseeker') {
      // Desired roles take precedence over a single jobTitle now
      if (!formData.desiredRoles || formData.desiredRoles.length === 0) {
        newErrors.desiredRoles = 'Add at least one desired job title';
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
      // Ensure recruiter industry maps to primary_industry via parent mapper
      onUpdateProfile({ ...formData });
    }
  };

  const renderJobSeekerFields = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <RoleInput
                label="Desired Job Titles"
                value={desiredRoleInput}
                onChange={setDesiredRoleInput}
                onSelect={(val) => {
                  if (!val) return;
                  if (!formData.desiredRoles?.includes(val)) {
                    const next = [...(formData.desiredRoles || []), val];
                    setFormData(prev => ({ ...prev, desiredRoles: next }));
                    if (onDraftChange) onDraftChange({ desiredRoles: next });
                  }
                  setDesiredRoleInput('');
                  if (errors.desiredRoles) setErrors(prev => ({ ...prev, desiredRoles: '' }));
                }}
                clearOnSelect
                audience="jobseeker"
                placeholder="e.g., Frontend Developer, Data Scientist"
              />
            </div>
            <Button type="button" variant="outline" iconName="Plus" iconSize={16} className="mb-1" onClick={addDesiredRole}>
              Add
            </Button>
          </div>
          {errors.desiredRoles && (
            <p className="text-xs text-error mt-1">{errors.desiredRoles}</p>
          )}
          {Array.isArray(formData.desiredRoles) && formData.desiredRoles.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.desiredRoles.map((role) => (
                <span key={role} className="px-2 py-1 bg-accent/10 text-accent text-xs rounded-full flex items-center gap-1">
                  {role}
                  <button
                    type="button"
                    className="ml-1 text-accent hover:text-accent/80"
                    onClick={() => {
                      const next = formData.desiredRoles.filter(r => r !== role);
                      setFormData(prev => ({ ...prev, desiredRoles: next }));
                      if (onDraftChange) onDraftChange({ desiredRoles: next });
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Industries as checkboxes for jobseekers */}
        <div className="md:col-span-2">
          <div className="text-sm font-medium text-foreground mb-1">Industries</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {INDUSTRY_OPTIONS.map((opt) => {
              const checked = Array.isArray(formData.industries) && formData.industries.includes(opt.value);
              const containerClass = checked
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-border hover:border-primary/50 hover:bg-muted/50';
              return (
                <label
                  key={opt.value}
                  className={`flex items-center space-x-2 p-3 rounded-card border cursor-pointer transition-all duration-200 ${containerClass}`}
                >
                  <Checkbox checked={!!checked} onChange={() => toggleIndustry(opt.value)} />
                  <span className="text-sm font-medium">{opt.label}</span>
                </label>
              );
            })}
          </div>
        </div>

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

        {/* Expected Salary (like onboarding): min/max in INR */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Expected Salary (Min)"
            name="salary_min"
            type="number"
            value={formData.salary_min}
            onChange={(e) => {
              const v = e.target.value;
              setFormData(prev => ({ ...prev, salary_min: v }));
              if (onDraftChange) onDraftChange({ salary_min: v, salary_currency: 'INR' });
            }}
            placeholder="e.g., 600000"
            description="Enter annual min salary in INR"
          />
          <Input
            label="Expected Salary (Max)"
            name="salary_max"
            type="number"
            value={formData.salary_max}
            onChange={(e) => {
              const v = e.target.value;
              setFormData(prev => ({ ...prev, salary_max: v }));
              if (onDraftChange) onDraftChange({ salary_max: v, salary_currency: 'INR' });
            }}
            placeholder="e.g., 900000"
            description="Enter annual max salary in INR"
          />
        </div>

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

        <IndustryInput
          label="Primary Industry"
          value={formData.industry}
          onChange={(v) => handleSelectChange('industry', v)}
          placeholder="Start typing industry"
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
            <div className="flex gap-2 items-end flex-wrap">
              <Input
                label="Add Skill"
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="e.g., React, Python, Project Management"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              />
              <Select
                label="Proficiency"
                value={newSkillProficiency}
                onChange={(v) => setNewSkillProficiency(v)}
                options={[
                  { value: 'beginner', label: 'Beginner' },
                  { value: 'intermediate', label: 'Intermediate' },
                  { value: 'advanced', label: 'Advanced' },
                  { value: 'expert', label: 'Expert' },
                ]}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {formData.skills.map((skill, index) => {
                const name = typeof skill === 'object' ? (skill.name || skill) : skill;
                const level = typeof skill === 'object' ? (skill.proficiency || 'intermediate') : 'intermediate';
                return (
                  <div key={index} className="p-3 rounded-card border border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-foreground">{name}</div>
                        <div className="text-xs text-muted-foreground">Proficiency</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="text-muted-foreground hover:text-error"
                        title="Remove"
                      >
                        <Icon name="Trash2" size={14} />
                      </button>
                    </div>
                    <div className="flex gap-1 mt-2">
                      {['beginner', 'intermediate', 'advanced', 'expert'].map(lvl => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setSkillProficiency(name, lvl)}
                          className={`px-2 py-1 text-xs rounded ${level === lvl ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-muted/50 text-muted-foreground'}`}
                        >
                          {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
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
                  <span>{typeof cert === 'object' ? cert.name || cert.certification || cert : cert}</span>
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
              {userProfile.resume_url && (
                <div className="flex items-center gap-2 justify-end">
                  <a
                    href={userProfile.resume_url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="px-3 py-1 text-xs rounded-squircle bg-primary text-primary-foreground hover:opacity-90 spring-transition"
                  >
                    View
                  </a>
                  <a
                    href={`${userProfile.resume_url}${userProfile.resume_url.includes('?') ? '&' : '?'}download=1`}
                    className="px-3 py-1 text-xs rounded-squircle bg-secondary text-secondary-foreground hover:opacity-90 spring-transition"
                  >
                    Download
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
        {/* Submit */}
        <div className="flex justify-end">
          <Button type="submit" iconName="Save" iconSize={16}>
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProfessionalDetailsTab;
