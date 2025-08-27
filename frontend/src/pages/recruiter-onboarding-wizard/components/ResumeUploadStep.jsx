import React from 'react';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';
import JobSeekerResumeUploadStep from '../../job-seeker-onboarding-wizard/components/ResumeUploadStep.jsx';

// Wrapper to reuse the job-seeker upload/parse step but add a recruiter sample download CTA
const RecruiterResumeUploadStep = (props) => {
    const downloadSampleResume = () => {
        const content = `John Doe\nSenior Technical Recruiter\n\nContact\nPhone: +1 555-123-4567\nEmail: john.doe@example.com\nLocation: San Francisco, CA\nLinkedIn: linkedin.com/in/johndoe\n\nSummary\nSenior Technical Recruiter with 7+ years experience sourcing and hiring software engineers across startups and enterprises. Expertise in full-cycle recruiting, stakeholder management, and employer branding.\n\nCore Skills\n- Sourcing: LinkedIn Recruiter, GitHub, Boolean Search\n- ATS/CRM: Greenhouse, Lever\n- Screening: Technical phone screens, competency-based interviews\n- Tools: G-Suite, Notion, Jira\n\nExperience\nSenior Technical Recruiter — Acme Tech (2021–Present)\n- Hired 30+ engineers (Backend, Frontend, Data) with 85% offer acceptance rate\n- Built sourcing pipelines that reduced time-to-fill by 25%\n\nTechnical Recruiter — BetaSoft (2018–2021)\n- Managed 15–20 open reqs across product and engineering\n- Implemented structured interview rubrics with hiring managers\n\nEducation\nB.A. in Psychology — State University (2014–2018)\n\nCertifications\n- AIRS Certified Internet Recruiter (CIR)`;
        const blob = new Blob([content], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'recruiter_sample_resume.doc';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-center">
                <Button type="button" variant="ghost" onClick={downloadSampleResume} iconName="Download" iconPosition="left" iconSize={16}>
                    Download sample recruiter resume
                </Button>
            </div>
            <JobSeekerResumeUploadStep {...props} />
        </div>
    );
};

export default RecruiterResumeUploadStep;
