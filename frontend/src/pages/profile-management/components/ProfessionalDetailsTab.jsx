import React, { useState, useEffect } from 'react';
import Icon from 'components/AppIcon';
import Input from 'components/ui/Input';
import Button from 'components/ui/Button';
import Select from 'components/ui/Select';
import IndustryInput from 'components/ui/IndustryInput';
import RoleInput from 'components/ui/RoleInput';
import LocationInput from 'components/ui/LocationInput';
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
    certifications: userProfile.certifications || [],
    // New: resume-like sections
    experiences: Array.isArray(userProfile.experiences) ? userProfile.experiences : [],
    education: Array.isArray(userProfile.education) ? userProfile.education : [],
    // Projects: list of {title, link, description, domain, tech_stack}
    projects: Array.isArray(userProfile.projects) ? userProfile.projects : []
  });

  const [errors, setErrors] = useState({});
  // Resume parsing moved to ResumeUpdatesTab
  const [projectErrors, setProjectErrors] = useState({});
  const [newSkill, setNewSkill] = useState('');
  const [newSkillProficiency, setNewSkillProficiency] = useState('intermediate');
  const [newCertification, setNewCertification] = useState('');
  const [industryInput, setIndustryInput] = useState('');
  // Experience/Education temp states not required; we edit inline
  const [experienceErrors, setExperienceErrors] = useState({}); // { [idx]: { title, company, location, start_date, end_date, description } }
  const [educationErrors, setEducationErrors] = useState({}); // { [idx]: { start_year, end_year } }

  const experienceOptions = [
    { value: 'entry', label: 'Entry Level (0-2 years)' },
    { value: 'mid', label: 'Mid Level (2-5 years)' },
    { value: 'senior', label: 'Senior Level (5-10 years)' },
    { value: 'lead', label: 'Lead/Principal (10+ years)' },
    { value: 'executive', label: 'Executive/C-Level' }
  ];

  // Compute total experience and level from experiences tiles
  const computeExperienceStats = (exps) => {
    if (!Array.isArray(exps) || exps.length === 0) return { months: 0, years: 0, level: 'entry' };
    const today = new Date();
    let months = 0;
    exps.forEach((exp) => {
      // Support YYYY-MM or YYYY-MM-DD inputs gracefully
      const normalizeToDate = (val) => {
        if (!val) return null;
        // If only year-month, append first day
        if (/^\d{4}-\d{2}$/.test(val)) return new Date(val + '-01');
        // If full date, use as-is
        if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return new Date(val);
        // Fallback: attempt Date parse
        const d = new Date(val);
        return isNaN(d.getTime()) ? null : d;
      };
      const start = normalizeToDate(exp?.start_date);
      const end = exp?.current ? today : normalizeToDate(exp?.end_date);
      if (!start) return;
      const endUse = end || today;
      const diffMonths = (endUse.getFullYear() - start.getFullYear()) * 12 + (endUse.getMonth() - start.getMonth() + 1);
      if (diffMonths > 0) months += diffMonths;
    });
    const years = Math.floor(months / 12);
    let level = 'entry';
    if (years >= 10) level = 'lead';
    else if (years >= 5) level = 'senior';
    else if (years >= 2) level = 'mid';
    else level = 'entry';
    return { months, years, level };
  };

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

  // Projects helpers
  const addProject = () => {
    setFormData(prev => {
      const next = [
        ...(prev.projects || []),
        { title: '', link: '', description: '', domain: '', tech_stack: [] }
      ];
      if (onDraftChange) onDraftChange({ projects: next });
      return { ...prev, projects: next };
    });
  };

  const removeProject = (idx) => {
    setFormData(prev => {
      const next = (prev.projects || []).filter((_, i) => i !== idx);
      if (onDraftChange) onDraftChange({ projects: next });
      return { ...prev, projects: next };
    });
  };

  const setProjectField = (idx, key, value) => {
    setFormData(prev => {
      const next = (prev.projects || []).map((p, i) => (i === idx ? { ...p, [key]: value } : p));
      if (onDraftChange) onDraftChange({ projects: next });
      return { ...prev, projects: next };
    });
  };

  const removeCertification = (certToRemove) => {
    const next = formData.certifications.filter(cert => cert !== certToRemove);
    setFormData(prev => ({ ...prev, certifications: next }));
    if (onDraftChange) onDraftChange({ certifications: next });
  };

  // Removed resume upload/parse/apply functions; handled in ResumeUpdatesTab

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (userProfile.role === 'jobseeker') {
      // Desired roles take precedence over a single jobTitle now
      if (!formData.desiredRoles || formData.desiredRoles.length === 0) {
        newErrors.desiredRoles = 'Add at least one desired job title';
        isValid = false;
      }
      if (formData.skills.length === 0) {
        newErrors.skills = 'Please add at least one skill';
        isValid = false;
      }
    }

    // For recruiter/employer, Professional Information no longer requires company/industry inputs.

    // Education required fields validation (Year-only)
    if (Array.isArray(formData.education)) {
      const eduErrs = {};
      formData.education.forEach((ed, idx) => {
        const errs = { ...(educationErrors[idx] || {}) };
        if (!ed.institution || !ed.institution.trim()) errs.institution = 'Institution is required';
        if (!ed.degree || !ed.degree.trim()) errs.degree = 'Degree is required';
        if (!ed.field_of_study || !ed.field_of_study.trim()) errs.field_of_study = 'Field of Study is required';
        if (!ed.location || !ed.location.trim()) errs.location = 'Location is required';
        const startYear = ed.start_year || (ed.start_date ? String(ed.start_date).slice(0, 4) : '');
        const endYear = ed.end_year || (ed.end_date ? String(ed.end_date).slice(0, 4) : '');
        if (!startYear) errs.start_year = 'Start year is required';
        if (!ed.current && !endYear) errs.end_year = 'End year is required';
        if (!ed.description || !ed.description.trim()) errs.description = 'Description is required';
        if (Object.values(errs).some(Boolean)) {
          eduErrs[idx] = errs;
          isValid = false;
        }
      });
      if (Object.keys(eduErrs).length > 0) setEducationErrors(prev => ({ ...prev, ...eduErrs }));
    }

    setErrors(newErrors);
    return isValid && Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // For jobseekers, compute experience level from experiences tiles
    const payload = { ...formData };
    if (['jobseeker', 'recruiter', 'employer'].includes(userProfile.role)) {
      const stats = computeExperienceStats(formData.experiences);
      payload.experience = stats.level;
    }
    onUpdateProfile(payload);
  };

  // Month/Year picker with max cap (defaults to current month/year)
  const MonthYearPicker = ({ label, value, onChange, disabled = false, maxYM, required = false, error }) => {
    const months = [
      { value: '01', label: 'Jan' },
      { value: '02', label: 'Feb' },
      { value: '03', label: 'Mar' },
      { value: '04', label: 'Apr' },
      { value: '05', label: 'May' },
      { value: '06', label: 'Jun' },
      { value: '07', label: 'Jul' },
      { value: '08', label: 'Aug' },
      { value: '09', label: 'Sep' },
      { value: '10', label: 'Oct' },
      { value: '11', label: 'Nov' },
      { value: '12', label: 'Dec' }
    ];
    const now = new Date();
    const maxYear = maxYM && /^\d{4}-\d{2}$/.test(maxYM) ? parseInt(maxYM.slice(0, 4), 10) : now.getFullYear();
    const maxMonth = maxYM && /^\d{4}-\d{2}$/.test(maxYM) ? parseInt(maxYM.slice(5, 7), 10) : (now.getMonth() + 1);
    const years = Array.from({ length: 60 }, (_, i) => maxYear - i).map(y => ({ value: String(y), label: String(y) }));

    const year = value && /^\d{4}-\d{2}$/.test(value) ? value.slice(0, 4) : '';
    const month = value && /^\d{4}-\d{2}$/.test(value) ? value.slice(5, 7) : '';

    const apply = (y, m) => {
      if (y && m) {
        let yi = parseInt(y, 10);
        let mi = parseInt(m, 10);
        if (yi === maxYear && mi > maxMonth) mi = maxMonth;
        const mm = String(mi).padStart(2, '0');
        return onChange(`${y}-${mm}`);
      }
      onChange('');
    };

    return (
      <div className="space-y-2">
        <div className="text-sm font-medium text-foreground">{label}{required && <span className="text-destructive ml-1">*</span>}</div>
        <div className="grid grid-cols-2 gap-2">
          <Select
            placeholder="Month"
            options={(year && parseInt(year, 10) === maxYear) ? months.filter(m => parseInt(m.value, 10) <= maxMonth) : months}
            value={month}
            onChange={(m) => apply(year, m)}
            disabled={disabled}
          />
          <Select placeholder="Year" options={years} value={year} onChange={(y) => apply(y, month)} disabled={disabled} />
        </div>
        {error && (
          <p className="text-sm text-destructive mt-1">{error}</p>
        )}
      </div>
    );
  };

  // ========= Experience helpers =========
  const addExperience = () => {
    setFormData(prev => {
      const next = [
        ...(prev.experiences || []),
        {
          title: '',
          company: '',
          location: '',
          start_date: '',
          end_date: '',
          current: false,
          description: ''
        }
      ];
      if (onDraftChange) onDraftChange({ experiences: next });
      return { ...prev, experiences: next };
    });
  };

  const removeExperience = (idx) => {
    setFormData(prev => {
      const next = (prev.experiences || []).filter((_, i) => i !== idx);
      if (onDraftChange) onDraftChange({ experiences: next });
      return { ...prev, experiences: next };
    });
  };

  const setExperienceField = (idx, key, value) => {
    setFormData(prev => {
      const next = (prev.experiences || []).map((exp, i) => (i === idx ? { ...exp, [key]: value } : exp));
      // Clear field-level error for this experience field
      setExperienceErrors(prev => {
        const curr = prev[idx] || {};
        return { ...prev, [idx]: { ...curr, [key]: '' } };
      });
      if (onDraftChange) onDraftChange({ experiences: next });
      return { ...prev, experiences: next };
    });
  };

  // ========= Education helpers =========
  const addEducation = () => {
    setFormData(prev => {
      const next = [
        ...(prev.education || []),
        {
          institution: '',
          degree: '',
          field_of_study: '',
          location: '',
          start_year: '',
          end_year: '',
          current: false,
          description: ''
        }
      ];
      if (onDraftChange) onDraftChange({ education: next });
      return { ...prev, education: next };
    });
  };

  const removeEducation = (idx) => {
    setFormData(prev => {
      const next = (prev.education || []).filter((_, i) => i !== idx);
      if (onDraftChange) onDraftChange({ education: next });
      return { ...prev, education: next };
    });
  };

  const setEducationField = (idx, key, value) => {
    setFormData(prev => {
      const next = (prev.education || []).map((ed, i) => (i === idx ? { ...ed, [key]: value } : ed));
      if (onDraftChange) onDraftChange({ education: next });
      // Clear field-level error for this education field (non-date fields)
      setEducationErrors(prevErrs => {
        const curr = prevErrs[idx] || {};
        return { ...prevErrs, [idx]: { ...curr, [key]: '' } };
      });
      // Live validate after updating
      const ed = next[idx] || {};
      const errs = { start_year: '', end_year: '' };
      const currentYear = new Date().getFullYear();
      const toInt = (v) => { const n = parseInt(v, 10); return isNaN(n) ? null : n; };
      const sy = toInt(ed.start_year);
      const ey = toInt(ed.end_year);
      if (ed.start_year && (sy === null || sy < 1950 || sy > currentYear + 5)) {
        errs.start_year = `Enter a valid year between 1950 and ${currentYear + 5}`;
      }
      if (!ed.current && ed.end_year && (ey === null || ey < 1950 || ey > currentYear + 5)) {
        errs.end_year = `Enter a valid year between 1950 and ${currentYear + 5}`;
      }
      if (!ed.current && sy !== null && ey !== null && sy > ey) {
        errs.end_year = 'End year must be greater than or equal to start year';
      }
      setEducationErrors(prevErrs => ({ ...prevErrs, [idx]: errs }));
      return { ...prev, education: next };
    });
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

        {/* Removed company and manual experience level for jobseekers; computed from experiences */}
        {/* Show computed experience summary (read-only) */}
        <div className="rounded-card border border-border p-3">
          <div className="text-xs text-muted-foreground mb-1">Experience level (auto-calculated)</div>
          <div className="text-sm font-medium text-foreground">
            {(() => {
              const { years, level } = computeExperienceStats(formData.experiences);
              const labelMap = { entry: 'Entry (0-2 yrs)', mid: 'Mid (2-5 yrs)', senior: 'Senior (5-10 yrs)', lead: 'Lead (10+ yrs)', executive: 'Executive' };
              return `${labelMap[level] || level} • ~${years} yrs`;
            })()}
          </div>
        </div>

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
      <div className="rounded-card border border-border p-3">
        <div className="text-xs text-muted-foreground mb-1">Experience level (auto-calculated)</div>
        <div className="text-sm font-medium text-foreground">
          {(() => {
            const { years, level } = computeExperienceStats(formData.experiences);
            const labelMap = { entry: 'Entry (0-2 yrs)', mid: 'Mid (2-5 yrs)', senior: 'Senior (5-10 yrs)', lead: 'Lead (10+ yrs)', executive: 'Executive' };
            return `${labelMap[level] || level} • ~${years} yrs`;
          })()}
        </div>
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

        {/* Experience (Both roles) */}
        <div className="glassmorphic p-6 rounded-squircle">
          <h3 className="font-heading font-heading-semibold text-foreground mb-4 flex items-center">
            <Icon name="Calendar" size={20} className="mr-2" />
            Experience
          </h3>

          <div className="space-y-4">
            {(!formData.experiences || formData.experiences.length === 0) && (
              <p className="text-sm text-muted-foreground">No experience added yet.</p>
            )}

            {formData.experiences.map((exp, idx) => (
              <div key={idx} className="p-4 rounded-card border border-border">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-medium text-foreground">Experience #{idx + 1}</div>
                  <button type="button" className="text-muted-foreground hover:text-error" onClick={() => removeExperience(idx)}>
                    <Icon name="Trash2" size={16} />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <RoleInput
                    label="Job Title"
                    value={exp.title || ''}
                    onChange={(val) => setExperienceField(idx, 'title', val)}
                    audience={userProfile.role === 'jobseeker' ? 'jobseeker' : 'recruiter'}
                    placeholder={userProfile.role === 'jobseeker' ? 'e.g., Software Engineer' : 'e.g., Senior Recruiter'}
                    required
                    error={experienceErrors[idx]?.title}
                  />
                  <Input label="Company" value={exp.company || ''} onChange={(e) => setExperienceField(idx, 'company', e.target.value)} placeholder="e.g., TechCorp Inc." required error={experienceErrors[idx]?.company} />
                  <LocationInput label="Location" value={exp.location || ''} onChange={(val) => setExperienceField(idx, 'location', val)} placeholder="City, State (e.g., Bengaluru, Karnataka)" required error={experienceErrors[idx]?.location} />
                  <div className="grid grid-cols-2 gap-3">
                    <MonthYearPicker
                      label="Start Month"
                      value={exp.start_date || ''}
                      onChange={(val) => setExperienceField(idx, 'start_date', val)}
                      required
                      error={experienceErrors[idx]?.start_date}
                    />
                    <MonthYearPicker
                      label="End Month"
                      value={exp.end_date || ''}
                      onChange={(val) => setExperienceField(idx, 'end_date', val)}
                      disabled={!!exp.current}
                      required={!exp.current}
                      error={experienceErrors[idx]?.end_date}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={!!exp.current}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        // Single functional update to avoid batched state race
                        setFormData(prev => {
                          const next = (prev.experiences || []).map((item, i) => {
                            if (i !== idx) return item;
                            return {
                              ...item,
                              current: checked,
                              end_date: checked ? '' : item.end_date
                            };
                          });
                          if (onDraftChange) onDraftChange({ experiences: next });
                          return { ...prev, experiences: next };
                        });
                      }}
                      label="I currently work here"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-body font-body-medium text-foreground mb-1">Description</label>
                    <textarea
                      rows={3}
                      value={exp.description || ''}
                      onChange={(e) => setExperienceField(idx, 'description', e.target.value)}
                      className="w-full px-3 py-2 bg-input border border-border rounded-squircle text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent spring-transition resize-none"
                      placeholder="Describe your responsibilities and achievements"
                    />
                  </div>
                </div>
              </div>
            ))}

            <Button type="button" variant="outline" iconName="Plus" iconSize={16} onClick={addExperience}>
              Add Experience
            </Button>
          </div>
        </div>

        {/* Education (Both roles) */}
        <div className="glassmorphic p-6 rounded-squircle">
          <h3 className="font-heading font-heading-semibold text-foreground mb-4 flex items-center">
            <Icon name="BookOpen" size={20} className="mr-2" />
            Education
          </h3>

          <div className="space-y-4">
            {(!formData.education || formData.education.length === 0) && (
              <p className="text-sm text-muted-foreground">No education added yet.</p>
            )}

            {formData.education.map((ed, idx) => (
              <div key={idx} className="p-4 rounded-card border border-border">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-medium text-foreground">Education #{idx + 1}</div>
                  <button type="button" className="text-muted-foreground hover:text-error" onClick={() => removeEducation(idx)}>
                    <Icon name="Trash2" size={16} />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input label="Institution" value={ed.institution || ''} onChange={(e) => setEducationField(idx, 'institution', e.target.value)} placeholder="e.g., Stanford University" required error={educationErrors[idx]?.institution} />
                  <Input label="Degree" value={ed.degree || ''} onChange={(e) => setEducationField(idx, 'degree', e.target.value)} placeholder="e.g., B.Sc, M.Sc, MBA" required error={educationErrors[idx]?.degree} />
                  <Input label="Field of Study" value={ed.field_of_study || ''} onChange={(e) => setEducationField(idx, 'field_of_study', e.target.value)} placeholder="e.g., Computer Science" required error={educationErrors[idx]?.field_of_study} />
                  <LocationInput label="Location" value={ed.location || ''} onChange={(val) => setEducationField(idx, 'location', val)} placeholder="City, State (e.g., Bengaluru, Karnataka)" required error={educationErrors[idx]?.location} />
                  <div className="grid grid-cols-2 gap-3">
                    <Select
                      label="Start Year"
                      options={Array.from({ length: 60 }, (_, i) => {
                        const y = new Date().getFullYear() - i;
                        return { value: String(y), label: String(y) };
                      })}
                      value={ed.start_year || (ed.start_date ? String(ed.start_date).slice(0, 4) : '')}
                      onChange={(y) => setEducationField(idx, 'start_year', y)}
                      required
                      error={educationErrors[idx]?.start_year}
                      placeholder="Year"
                    />
                    <Select
                      label="End Year"
                      options={Array.from({ length: 60 }, (_, i) => {
                        const y = new Date().getFullYear() - i;
                        return { value: String(y), label: String(y) };
                      })}
                      value={ed.end_year || (ed.end_date ? String(ed.end_date).slice(0, 4) : '')}
                      onChange={(y) => setEducationField(idx, 'end_year', y)}
                      disabled={!!ed.current}
                      required={!ed.current}
                      error={educationErrors[idx]?.end_year}
                      placeholder="Year"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={!!ed.current}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setFormData(prev => {
                          const next = (prev.education || []).map((item, i) => {
                            if (i !== idx) return item;
                            return {
                              ...item,
                              current: checked,
                              end_date: checked ? '' : item.end_date,
                              end_year: checked ? '' : item.end_year
                            };
                          });
                          if (onDraftChange) onDraftChange({ education: next });
                          // clear end errors if set to current
                          if (checked) setEducationErrors(prev => ({ ...prev, [idx]: { ...(prev[idx] || {}), end_date: '', end_year: '' } }));
                          return { ...prev, education: next };
                        });
                      }}
                      label="Currently studying"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-body font-body-medium text-foreground mb-1">Description <span className="text-destructive">*</span></label>
                    <textarea
                      rows={3}
                      value={ed.description || ''}
                      onChange={(e) => setEducationField(idx, 'description', e.target.value)}
                      className="w-full px-3 py-2 bg-input border border-border rounded-squircle text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent spring-transition resize-none"
                      placeholder="Coursework, honors, or relevant details"
                    />
                    {educationErrors[idx]?.description && (
                      <p className="text-sm text-destructive mt-1">{educationErrors[idx]?.description}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}

            <Button type="button" variant="outline" iconName="Plus" iconSize={16} onClick={addEducation}>
              Add Education
            </Button>
          </div>
        </div>

        {/* Projects (Both roles) */}
        <div className="glassmorphic p-6 rounded-squircle">
          <h3 className="font-heading font-heading-semibold text-foreground mb-4 flex items-center">
            <Icon name="Layers" size={20} className="mr-2" />
            Projects
          </h3>

          <div className="space-y-4">
            {(!formData.projects || formData.projects.length === 0) && (
              <p className="text-sm text-muted-foreground">No projects added yet.</p>
            )}

            {formData.projects.map((p, idx) => (
              <div key={idx} className="p-4 rounded-card border border-border">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-medium text-foreground">Project #{idx + 1}</div>
                  <button type="button" className="text-muted-foreground hover:text-error" onClick={() => removeProject(idx)}>
                    <Icon name="Trash2" size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input label="Title" value={p.title || ''} onChange={(e) => setProjectField(idx, 'title', e.target.value)} placeholder="Project title" />
                  <Input label="Link" value={p.link || ''} onChange={(e) => setProjectField(idx, 'link', e.target.value)} placeholder="https://..." />
                  <Input label="Domain" value={p.domain || ''} onChange={(e) => setProjectField(idx, 'domain', e.target.value)} placeholder="e.g., Web, Mobile, Data" />
                  <Input label="Tech Stack (comma separated)" value={(p.tech_stack || []).join(', ')} onChange={(e) => setProjectField(idx, 'tech_stack', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} placeholder="React, Node.js, PostgreSQL" />
                  <div className="md:col-span-2">
                    <label className="block text-sm font-body font-body-medium text-foreground mb-1">Description</label>
                    <textarea
                      rows={3}
                      value={p.description || ''}
                      onChange={(e) => setProjectField(idx, 'description', e.target.value)}
                      className="w-full px-3 py-2 bg-input border border-border rounded-squircle text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent spring-transition resize-none"
                      placeholder="Short description of the project and your role"
                    />
                  </div>
                </div>
              </div>
            ))}

            <Button type="button" variant="outline" iconName="Plus" iconSize={16} onClick={addProject}>
              Add Project
            </Button>
          </div>
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
