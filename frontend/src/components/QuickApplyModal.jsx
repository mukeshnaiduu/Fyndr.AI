import React, { useState } from 'react';
import Button from 'components/ui/Button';
import Icon from 'components/AppIcon';
import { apiFormRequest } from '../utils/api';

const QuickApplyModal = ({ isOpen, onClose, job, onSuccess }) => {
  const [resumeFile, setResumeFile] = useState(null);
  const [coverLetterFile, setCoverLetterFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const form = new FormData();
      form.append('job_id', job?.id || job?.job_id || job?.pk);
      form.append('application_method', 'quick');
      if (resumeFile) form.append('resume', resumeFile);
      if (coverLetterFile) form.append('cover_letter', coverLetterFile);

      const result = await apiFormRequest('/applications/quick-apply/', 'POST', form);
      onSuccess?.(result);
      onClose?.();
    } catch (err) {
      setError(err?.message || 'Quick Apply failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-card rounded-xl shadow-xl max-w-lg w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Quick Apply</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <Icon name="X" size={18} />
          </button>
        </div>

        {job && (
          <div className="mb-4 text-sm text-muted-foreground">
            Applying to <span className="text-foreground font-medium">{job.title || 'Job'}</span>
            {job?.company?.name ? <> at <span className="text-foreground font-medium">{job.company.name}</span></> : null}
          </div>
        )}

        {error && (
          <div className="mb-3 bg-error/10 border border-error/20 text-error text-sm rounded px-3 py-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Resume (PDF/DOC)</label>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Cover Letter (optional)</label>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={(e) => setCoverLetterFile(e.target.files?.[0] || null)}
                className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2 mt-6">
            <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>Cancel</Button>
            <Button type="submit" variant="default" loading={submitting} iconName="Send" iconPosition="left">
              Submit Application
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuickApplyModal;
