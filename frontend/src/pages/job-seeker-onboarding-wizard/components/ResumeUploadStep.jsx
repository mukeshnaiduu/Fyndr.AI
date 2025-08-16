import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';
import { getApiUrl } from 'utils/api';

const ResumeUploadStep = ({ data, onUpdate, onNext, onPrev }) => {
  const [uploadedFile, setUploadedFile] = useState(data.resume || null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiParsed, setAiParsed] = useState(null);
  const [readiness, setReadiness] = useState(null);
  const fileInputRef = useRef(null);

  const allowedTypes = ['.pdf', '.doc', '.docx'];
  const maxFileSize = 10 * 1024 * 1024; // 10MB

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleFileUpload = async (file) => {
    setError('');
    setAiError('');

    // Validate file type
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowedTypes.includes(fileExtension)) {
      setError('Please upload a PDF, DOC, or DOCX file');
      return;
    }

    // Validate file size
    if (file.size > maxFileSize) {
      setError('File size must be less than 10MB');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'resume');

      const token = localStorage.getItem('accessToken');
      console.log('Upload token:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN FOUND');

      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      // Test token validity first
      try {
        const testResponse = await fetch(getApiUrl('/auth/profile/'), {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        console.log('Token test response:', testResponse.status);
        if (!testResponse.ok) {
          // Clear the invalid token
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          throw new Error('Your session has expired. Please log in again to upload files.');
        }
      } catch (authError) {
        console.error('Authentication test failed:', authError);
        throw new Error('Authentication failed. Please log in again.');
      }

      if (!token) {
        throw new Error('No authentication token found');
      }

      // Upload progress simulation
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 20;
        });
      }, 200);

      // Actual file upload
      console.log('Uploading file to:', getApiUrl('/auth/upload/'));
      console.log('Authorization header:', `Bearer ${token.substring(0, 20)}...`);

      const response = await fetch(getApiUrl('/auth/upload/'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      clearInterval(progressInterval);

      console.log('Upload response status:', response.status);
      console.log('Upload response ok:', response.ok);

      if (!response.ok) {
        let errorMessage = 'Upload failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.detail || 'Upload failed';
        } catch (jsonError) {
          console.log('Failed to parse error response as JSON:', jsonError);
          errorMessage = `Upload failed with status ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      setUploadProgress(100);

      const fileData = {
        name: result.filename,
        size: result.size,
        type: result.type,
        uploadedAt: result.uploaded_at,
        url: result.url
      };

      setUploadedFile(fileData);
      setIsUploading(false);

      // Trigger sparkle animation
      setTimeout(() => {
        setUploadProgress(0);
      }, 1000);

      // After successful upload, trigger backend resume parsing (Gemini)
      try {
        setAiLoading(true);
        const parseRes = await fetch(getApiUrl('/auth/resume/parse/'), {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const parseJson = await parseRes.json();
        if (!parseRes.ok) {
          setReadiness(parseJson.readiness || null);
          // Clear the uploaded file locally if backend rejected it as invalid/non-resume
          setUploadedFile(null);
          if (fileInputRef.current) fileInputRef.current.value = '';
          throw new Error(parseJson.error || parseJson.detail || 'Failed to analyze resume');
        }
        const parsed = parseJson.parsed || {};
        setReadiness(parseJson.readiness || null);
        setAiParsed(parsed);

        // Derive quick insights for the preview card
        const skillsCount = Array.isArray(parsed.skills) ? parsed.skills.length : 0;
        const years = typeof parsed.years_experience === 'number' ? parsed.years_experience : null;
        const experienceLevel = years == null ? 'Not specified' : years >= 6 ? 'Senior (6+ years)' : years >= 3 ? 'Mid-level (3-5 years)' : 'Junior (0-2 years)';
        const matchReadiness = (() => {
          const base = 50;
          const skillsBoost = Math.min(30, skillsCount * 3);
          const expBoost = Math.min(20, (years || 0) * 4);
          return Math.max(50, Math.min(95, Math.round(base + skillsBoost + expBoost)));
        })();

        // Autofill onboarding fields (respect rules: don't change name/email)
        const firstName = data.firstName || '';
        const lastName = data.lastName || '';
        const normalizeSkills = (skillsArray) => {
          if (!Array.isArray(skillsArray)) return [];
          const base = Date.now();
          return skillsArray.map((s, i) => {
            if (!s) return null;
            if (typeof s === 'string') {
              return {
                id: base + i,
                name: s,
                proficiency: 'intermediate',
                category: 'Other',
              };
            }
            return {
              id: base + i,
              name: s.name || s.role || '',
              proficiency: s.proficiency || 'intermediate',
              category: s.category || 'Other',
            };
          }).filter(Boolean);
        };

        const updatePayload = {
          // camelCase used in UI
          firstName: firstName || data.firstName || '',
          lastName: lastName || data.lastName || '',
          // Do not override email from AI
          email: data.email || '',
          phone: parsed.phone || data.phone || '',
          location: parsed.location || data.location || '',
          years_of_experience: years ?? data.years_of_experience,
          // Normalize skills to objects expected by SkillAssessmentStep
          skills: Array.isArray(parsed.skills) ? normalizeSkills(parsed.skills) : (Array.isArray(data.skills) ? data.skills : []),
          education: Array.isArray(parsed.education) ? parsed.education : (data.education || []),
          bio: parsed.summary || data.bio || '',
          // Use camelCase jobTitle for onboarding UI
          jobTitle: Array.isArray(parsed.job_titles) && parsed.job_titles.length ? parsed.job_titles[0] : (data.jobTitle || data.job_title || ''),
          // suited_roles may be strings or objects; normalize to role names
          suited_job_roles: Array.isArray(parsed.suited_roles)
            ? parsed.suited_roles.map(r => (typeof r === 'string' ? r : r?.role)).filter(Boolean)
            : (data.suited_job_roles || data.suitedJobRoles || []),
          // preferred roles follow suited roles by default (use camelCase for UI)
          preferredRoles: Array.isArray(parsed.suited_roles)
            ? parsed.suited_roles.map(r => (typeof r === 'string' ? r : r?.role)).filter(Boolean).slice(0, 5)
            : (data.preferredRoles || data.preferred_roles || []),
          // Map preferred roles into desiredRoles so CareerPreferencesStep shows them
          desiredRoles: Array.isArray(parsed.suited_roles)
            ? parsed.suited_roles.map(r => (typeof r === 'string' ? r : r?.role)).filter(Boolean).slice(0, 5)
            : (data.desiredRoles || data.desired_roles || []),
          // salary hints if provided; force INR
          salary_currency: 'INR',
          // Ensure we always pass defined values (empty string fallback) so inputs render
          salaryMin: (parsed?.expected_salary_range?.min ?? (data.salaryMin ?? data.salary_min ?? '')) || '',
          salaryMax: (parsed?.expected_salary_range?.max ?? (data.salaryMax ?? data.salary_max ?? '')) || '',
          // store analysis snapshot to show in UI card
          ai_analysis: {
            skillsCount,
            experienceLevel,
            matchReadiness,
            suitedRoles: Array.isArray(parsed.suited_roles)
              ? parsed.suited_roles.map(r => (typeof r === 'string' ? r : r?.role)).filter(Boolean)
              : [],
            readinessScore: (parseJson.readiness && typeof parseJson.readiness.score === 'number') ? parseJson.readiness.score : undefined,
            readinessChecklist: parseJson.readiness?.checklist || undefined,
          },
        };
        onUpdate(updatePayload);
      } catch (e) {
        console.error('Resume analysis error:', e);
        setAiError(e.message || 'Failed to analyze resume');
      } finally {
        setAiLoading(false);
      }

    } catch (error) {
      console.error('Upload error:', error);
      setError(error.message || 'Upload failed. Please try again.');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setUploadProgress(0);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleNext = () => {
    onUpdate({ resume: uploadedFile });
    onNext();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Upload your resume
        </h2>
        <p className="text-muted-foreground">
          Our AI will analyze your resume to better match you with relevant opportunities
        </p>
      </div>

      {/* Upload Area */}
      <div className="max-w-2xl mx-auto">
        {!uploadedFile ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-card p-8 text-center transition-all duration-300 ${isDragging
              ? 'border-primary bg-primary/5 scale-105' : 'border-border hover:border-primary/50 hover:bg-muted/50'
              }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileSelect}
              className="hidden"
            />

            <div className="space-y-4">
              <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-primary flex items-center justify-center transition-transform duration-300 ${isDragging ? 'scale-110' : ''
                }`}>
                <Icon name="Upload" size={24} color="white" />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {isDragging ? 'Drop your resume here' : 'Drag & drop your resume'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  or click to browse your files
                </p>

                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  iconName="FileText"
                  iconPosition="left"
                >
                  Choose File
                </Button>
              </div>

              <div className="text-xs text-muted-foreground space-y-1">
                <p>Supported formats: PDF, DOC, DOCX</p>
                <p>Maximum file size: 10MB</p>
              </div>
            </div>

            {isDragging && (
              <div className="absolute inset-0 bg-primary/10 rounded-card flex items-center justify-center">
                <div className="text-primary font-medium">
                  <Icon name="Download" size={32} className="mx-auto mb-2" />
                  Drop to upload
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="glass-card p-6 rounded-card">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-success/10 rounded-card flex items-center justify-center flex-shrink-0">
                <Icon name="FileCheck" size={20} className="text-success" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground mb-1">
                  {uploadedFile.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {formatFileSize(uploadedFile.size)} • Uploaded successfully
                </p>

                <div className="flex items-center space-x-2 text-sm text-success">
                  <Icon name="CheckCircle" size={16} />
                  <span>
                    {aiParsed && !aiLoading && !aiError ? 'Resume analyzed and processed' : 'Resume uploaded'}
                  </span>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveFile}
                iconName="X"
              >
                Remove
              </Button>
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {isUploading && (
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Uploading...</span>
              <span className="text-primary font-medium">{Math.round(uploadProgress)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Error Message (persists until a new resume is uploaded) */}
        {(error || aiError) && (
          <div className="mt-4 p-3 bg-error/10 border border-error/20 rounded-card flex items-center space-x-2 text-error">
            <Icon name="AlertCircle" size={16} />
            <span className="text-sm">{aiError || error}</span>
          </div>
        )}

        {/* AI Analysis Preview */}
        {uploadedFile && (
          <div className="mt-6 p-4 bg-accent/5 border border-accent/20 rounded-card">
            <div className="flex items-center space-x-2 mb-3">
              <Icon name="Sparkles" size={16} className="text-accent" />
              <span className="text-sm font-medium text-accent">
                {aiLoading ? 'Analyzing your resume…' : aiError ? 'AI Analysis Unavailable' : 'AI Analysis'}
              </span>
            </div>

            {!aiLoading && !aiError && (data.ai_analysis || aiParsed) && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Skills Detected</p>
                  <p className="font-medium text-foreground">
                    {(data.ai_analysis?.skillsCount) ?? (Array.isArray(aiParsed?.skills) ? aiParsed.skills.length : 0)} technical skills
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Experience Level</p>
                  <p className="font-medium text-foreground">
                    {data.ai_analysis?.experienceLevel || (() => {
                      const yrs = typeof aiParsed?.years_experience === 'number' ? aiParsed.years_experience : null;
                      if (yrs == null) return 'Not specified';
                      return yrs >= 6 ? 'Senior (6+ years)' : yrs >= 3 ? 'Mid-level (3-5 years)' : 'Junior (0-2 years)';
                    })()}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Match Readiness</p>
                  <p className="font-medium text-success">
                    {(() => {
                      const explicit = readiness?.score ?? data.ai_analysis?.readinessScore;
                      if (typeof explicit === 'number') return `${explicit}% Ready`;
                      const skillsCount = Array.isArray(aiParsed?.skills) ? aiParsed.skills.length : 0;
                      const yrs = typeof aiParsed?.years_experience === 'number' ? aiParsed.years_experience : 0;
                      const base = 50 + Math.min(30, skillsCount * 3) + Math.min(20, yrs * 4);
                      return `${Math.max(50, Math.min(95, Math.round(base)))}% Ready`;
                    })()}
                  </p>
                </div>
              </div>
            )}

            {!aiLoading && readiness?.checklist && (
              <div className="mt-4 text-xs text-muted-foreground">
                <p className="font-medium text-foreground mb-1">Readiness Checklist</p>
                <ul className="grid grid-cols-2 md:grid-cols-3 gap-1">
                  {Object.entries(readiness.checklist).map(([key, val]) => (
                    <li key={key} className="flex items-center space-x-2">
                      <Icon name={val ? 'CheckCircle' : 'XCircle'} size={14} className={val ? 'text-success' : 'text-muted-foreground'} />
                      <span className="capitalize">{key.replaceAll('_', ' ')}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {aiError && (
              <div className="mt-2 text-sm text-error">{aiError}</div>
            )}
          </div>
        )}
      </div>

      {/* Skip Option */}
      <div className="text-center">
        <button
          onClick={handleNext}
          className="text-muted-foreground hover:text-foreground transition-colors text-sm"
        >
          Skip for now - I'll add this later
        </button>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button
          variant="outline"
          onClick={onPrev}
          iconName="ArrowLeft"
          iconPosition="left"
        >
          Previous
        </Button>

        <Button
          onClick={handleNext}
          iconName="ArrowRight"
          iconPosition="right"
          size="lg"
          className="font-semibold"
        >
          Next Step
        </Button>
      </div>
    </motion.div>
  );
};

export default ResumeUploadStep;
