import React from 'react';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';
import { getApiUrl } from 'utils/api';

const RecruiterResumeUpdatesTab = ({ userProfile, onUpdateProfile, onDraftChange }) => {
    const [uploadedFile, setUploadedFile] = React.useState(null);
    const [parseLoading, setParseLoading] = React.useState(false);
    const [parseError, setParseError] = React.useState('');
    const [parsedResume, setParsedResume] = React.useState(null);
    const [selected, setSelected] = React.useState({});

    const getSkillNames = (arr) => (Array.isArray(arr) ? arr.map(s => (typeof s === 'object' ? (s.name || s.skill || '') : s)).filter(Boolean) : []);
    const arrayDiff = (curr = [], prop = []) => {
        const c = new Set(curr);
        const p = new Set(prop);
        return {
            added: prop.filter(x => !c.has(x)),
            removed: curr.filter(x => !p.has(x)),
            unchanged: curr.filter(x => p.has(x)),
        };
    };

    const computeSelectionFrom = (parsed, current) => {
        if (!parsed || !current) return {};
        const next = {};
        const parsedJob = Array.isArray(parsed.job_titles) && parsed.job_titles.length ? parsed.job_titles[0] : (parsed.job_title || '');
        if (parsedJob && parsedJob !== (current.jobTitle || '')) next.jobTitle = true;
        const pMin = parsed?.expected_salary_range?.min ?? parsed?.salary_min ?? parsed?.salaryMin;
        const pMax = parsed?.expected_salary_range?.max ?? parsed?.salary_max ?? parsed?.salaryMax;
        if (pMin !== undefined && String(pMin) !== String(current.salary_min || '')) next.salary_min = true;
        if (pMax !== undefined && String(pMax) !== String(current.salary_max || '')) next.salary_max = true;
        const parsedSkills = Array.isArray(parsed.skills_detailed) ? parsed.skills_detailed : (Array.isArray(parsed.skills) ? parsed.skills : []);
        const currentSkillsSource = (current.skills && current.skills.length) ? current.skills : (current.profile?.skills || []);
        const currentSkillNames = (currentSkillsSource || []).map(s => (typeof s === 'object' ? (s.name || s) : s));
        if (parsedSkills.length && JSON.stringify(parsedSkills.map(s => (typeof s === 'string' ? s : s.name || s.skill)).filter(Boolean)) !== JSON.stringify(currentSkillNames)) next.skills = true;
        if (parsed.location && parsed.location !== (current.location || '')) next.location = true;
        if (parsed.phone && parsed.phone !== (current.phone || '')) next.phone = true;
        if (parsed.summary && parsed.summary !== (current.bio || '')) next.bio = true;
        if (Array.isArray(parsed.education) && JSON.stringify(parsed.education) !== JSON.stringify(current.education || [])) next.education = true;
        if (Array.isArray(parsed.experiences) && JSON.stringify(parsed.experiences) !== JSON.stringify(current.experiences || [])) next.experiences = true;
        return next;
    };

    React.useEffect(() => {
        if (parsedResume) setSelected(computeSelectionFrom(parsedResume, userProfile));
    }, [userProfile, parsedResume]);

    const handleResumeUpload = async (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        if (file.size > 10 * 1024 * 1024) return setParseError('File size must be less than 10MB');
        // Accept by extension to avoid inconsistent MIME types across browsers (e.g., application/octet-stream)
        const ext = (file.name.split('.').pop() || '').toLowerCase();
        const allowed = ['pdf', 'doc', 'docx'];
        if (!allowed.includes(ext)) return setParseError('Please upload a PDF or DOC/DOCX file');
        setUploadedFile(file);
        setParseError('');
        try {
            const authToken = localStorage.getItem('accessToken');
            const fd = new FormData();
            fd.append('file', file);
            fd.append('type', 'resume');
            const res = await fetch(getApiUrl('/auth/upload/'), { method: 'POST', headers: { Authorization: `Bearer ${authToken}` }, body: fd });
            const data = await res.json();
            if (!res.ok || !data?.success) throw new Error(data?.error || 'Upload failed');
            const tokenParam = localStorage.getItem('accessToken') || '';
            const resumeUrl = data.url ? `${data.url}${data.url.includes('?') ? '&' : '?'}token=${tokenParam}` : '';
            onDraftChange && onDraftChange({ resume: resumeUrl || true, resume_url: resumeUrl });
            setParseLoading(true);
            const parseRes = await fetch(getApiUrl('/auth/resume/parse/'), { method: 'POST', headers: { Authorization: `Bearer ${authToken}` } });
            const parseJson = await parseRes.json();
            if (!parseRes.ok) {
                setParsedResume(null);
                setParseError(parseJson?.error || parseJson?.detail || 'Failed to analyze resume');
            } else {
                const parsed = parseJson.parsed || {};
                setParsedResume(parsed);
                setSelected(computeSelectionFrom(parsed, userProfile));
            }
        } catch (err) {
            setParseError(err?.message || 'Upload failed. Try again.');
        } finally {
            setParseLoading(false);
        }
    };

    const toggle = (key) => setSelected(prev => ({ ...prev, [key]: !prev[key] }));
    const setMany = (keys, val) => setSelected(prev => keys.reduce((acc, k) => ({ ...acc, [k]: val }), prev));

    const applySelected = async () => {
        if (!parsedResume) return;
        const updated = {};
        const parsedJob = Array.isArray(parsedResume.job_titles) && parsedResume.job_titles.length ? parsedResume.job_titles[0] : (parsedResume.job_title || '');
        if (selected.jobTitle && parsedJob) updated.jobTitle = parsedJob;
        if (selected.salary_min) updated.salary_min = parsedResume?.expected_salary_range?.min ?? parsedResume?.salary_min ?? parsedResume?.salaryMin ?? '';
        if (selected.salary_max) updated.salary_max = parsedResume?.expected_salary_range?.max ?? parsedResume?.salary_max ?? parsedResume?.salaryMax ?? '';

        // Merge skills keep-if-exists append-if-new
        const parsedSkillsSource = parsedResume.skills_detailed || parsedResume.skillsDetailed || parsedResume.skills;
        if (selected.skills && Array.isArray(parsedSkillsSource)) {
            const base = Date.now();
            const currentSkillsSource = (userProfile.skills && userProfile.skills.length) ? userProfile.skills : (userProfile.profile?.skills || []);
            const toObj = (s, idx = 0) => {
                if (!s) return null;
                if (typeof s === 'string') return { id: base + idx, name: s.trim(), proficiency: 'intermediate', category: 'Other' };
                const name = (s.name || s.skill || '').trim();
                return { id: (s.id ?? (base + idx)), name, proficiency: s.proficiency || 'intermediate', category: s.category || 'Other' };
            };
            const normalizedCurrent = (currentSkillsSource || []).map((s, i) => toObj(s, i)).filter(Boolean);
            const byName = new Map();
            normalizedCurrent.forEach(s => { if (s.name) byName.set(s.name.trim().toLowerCase(), s); });
            (parsedSkillsSource || []).forEach((s, i) => {
                const obj = toObj(s, 1000 + i);
                const key = (obj?.name || '').trim().toLowerCase();
                if (key && !byName.has(key)) byName.set(key, obj);
            });
            updated.skills = Array.from(byName.values());
        }

        if (selected.location && parsedResume.location) updated.location = parsedResume.location;
        if (selected.phone && parsedResume.phone) updated.phone = parsedResume.phone;
        if (selected.bio && parsedResume.summary) updated.bio = parsedResume.summary;
        if (selected.education && Array.isArray(parsedResume.education)) updated.education = parsedResume.education;
        if (selected.experiences && Array.isArray(parsedResume.experiences)) updated.experiences = parsedResume.experiences;

        if (Object.keys(updated).length > 0) {
            onDraftChange && onDraftChange(updated);
            await onUpdateProfile(updated);
            // Close panel on save
            setParsedResume(null);
            setUploadedFile(null);
            setSelected({});
        }
    };

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

    // Pretty render helpers
    const renderEducationList = (items = []) => {
        if (!Array.isArray(items) || items.length === 0) return <span className="text-sm text-foreground/80">—</span>;
        return (
            <ul className="space-y-2">
                {items.map((e, i) => {
                    const degree = (e && (e.degree || e.qualification)) || '';
                    const field = (e && (e.field_of_study || e.field)) || '';
                    const institution = (e && (e.institution || e.school)) || '';
                    const start = (e && (e.start_year || e.start || e.start_date)) || '';
                    const end = (e && (e.end_year || e.end || e.end_date)) || '';
                    const location = (e && e.location) || '';
                    const description = (e && e.description) || '';
                    const titleLine = [degree, field].filter(Boolean).join(' • ');
                    const meta = [[start, end || ''].filter(Boolean).join(' - '), location].filter(Boolean).join(' • ');
                    return (
                        <li key={`edu-${i}`} className="rounded-card border border-border p-2 bg-background">
                            <div className="text-sm font-medium">{titleLine || '—'}</div>
                            {institution ? <div className="text-xs text-muted-foreground">{institution}</div> : null}
                            {meta ? <div className="text-2xs text-muted-foreground">{meta}</div> : null}
                            {description ? <div className="text-xs mt-1 whitespace-pre-wrap line-clamp-4">{description}</div> : null}
                        </li>
                    );
                })}
            </ul>
        );
    };

    const renderExperienceList = (items = []) => {
        if (!Array.isArray(items) || items.length === 0) return <span className="text-sm text-foreground/80">—</span>;
        return (
            <ul className="space-y-2">
                {items.map((x, i) => {
                    const title = (x && (x.title || x.position)) || '';
                    const companyVal = x && x.company;
                    const company = typeof companyVal === 'string' ? companyVal : (companyVal && companyVal.name) || '';
                    const current = !!(x && x.current);
                    const start = (x && (x.start_date || x.start || x.start_year)) || '';
                    const end = (x && (x.end_date || x.end || x.end_year)) || '';
                    const location = (x && x.location) || '';
                    const description = (x && x.description) || '';
                    const dateRange = [start, end || (current ? 'Present' : '')].filter(Boolean).join(' - ');
                    return (
                        <li key={`exp-${i}`} className="rounded-card border border-border p-2 bg-background">
                            <div className="text-sm font-medium">
                                {title || '—'}{company ? <span className="text-muted-foreground"> at </span> : null}{company ? <span className="font-normal">{company}</span> : null}
                                {current ? <span className="ml-2 inline-block text-2xs px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 border border-emerald-500/30">Current</span> : null}
                            </div>
                            <div className="text-2xs text-muted-foreground">{[dateRange, location].filter(Boolean).join(' • ') || '—'}</div>
                            {description ? (
                                <ul className="mt-1 pl-4 list-disc marker:text-muted-foreground/60">
                                    {String(description)
                                        .split(/\n+/)
                                        .filter(Boolean)
                                        .map((b, idx) => (
                                            <li key={`exp-b-${i}-${idx}`} className="text-xs whitespace-pre-wrap">{b.trim()}</li>
                                        ))}
                                </ul>
                            ) : null}
                        </li>
                    );
                })}
            </ul>
        );
    };

    return (
        <div className="space-y-8">
            <div className="glassmorphic p-6 rounded-squircle">
                <h3 className="font-heading font-heading-semibold text-foreground mb-4 flex items-center">
                    <Icon name="FileText" size={20} className="mr-2" />
                    Resume
                </h3>
                <div className="space-y-4">
                    <div className="border-2 border-dashed border-border rounded-squircle p-6 text-center hover:border-primary/50 spring-transition">
                        <Icon name="Upload" size={32} className="text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground mb-2">Upload your resume (PDF or DOC, max 10MB)</p>
                        <input id="recruiter-resume-upload" type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleResumeUpload} />
                        <div className="flex items-center justify-center gap-2">
                            <Button type="button" variant="outline" onClick={() => document.getElementById('recruiter-resume-upload').click()} iconName="Upload" iconPosition="left" iconSize={16}>
                                Choose File
                            </Button>
                            <Button type="button" variant="ghost" onClick={downloadSampleResume} iconName="Download" iconPosition="left" iconSize={16}>
                                Download sample
                            </Button>
                        </div>
                    </div>

                    {(uploadedFile || userProfile.resume_url) && (
                        <div className="flex items-center justify-between bg-muted p-3 rounded-squircle">
                            <div className="flex items-center space-x-2">
                                <Icon name="FileText" size={16} className="text-primary" />
                                <span className="text-sm font-body font-body-medium">{uploadedFile?.name || 'Resume uploaded'}</span>
                            </div>
                            {userProfile.resume_url && (
                                <div className="flex items-center gap-2">
                                    <a href={userProfile.resume_url} target="_blank" rel="noreferrer noopener" className="px-3 py-1 text-xs rounded-squircle bg-primary text-primary-foreground hover:opacity-90 spring-transition">View</a>
                                    <a href={`${userProfile.resume_url}${userProfile.resume_url.includes('?') ? '&' : '?'}download=1`} className="px-3 py-1 text-xs rounded-squircle bg-secondary text-secondary-foreground hover:opacity-90 spring-transition">Download</a>
                                </div>
                            )}
                        </div>
                    )}
                    {parseError && <p className="text-sm text-error">{parseError}</p>}
                </div>
            </div>

            {parseLoading && (
                <div className="glassmorphic p-4 rounded-squircle flex items-center gap-2">
                    <Icon name="Loader" size={16} className="animate-spin text-primary" />
                    <span className="text-sm">Analyzing resume…</span>
                </div>
            )}

            {parsedResume && (
                <div className="mt-0 p-5 bg-card border border-border rounded-squircle">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Icon name="Sparkles" size={18} className="text-primary" />
                            <div className="text-sm font-semibold">Resume Suggestions</div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button size="sm" variant="ghost" onClick={() => setMany(['jobTitle', 'salary_min', 'salary_max', 'skills', 'location', 'phone', 'bio', 'education', 'experiences'], true)}>Select all</Button>
                            <Button size="sm" variant="ghost" onClick={() => setMany(['jobTitle', 'salary_min', 'salary_max', 'skills', 'location', 'phone', 'bio', 'education', 'experiences'], false)}>Clear</Button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {/* Job Title */}
                        {(() => {
                            const proposed = Array.isArray(parsedResume.job_titles) && parsedResume.job_titles.length ? parsedResume.job_titles[0] : parsedResume.job_title;
                            if (!proposed) return null;
                            const equal = (userProfile.jobTitle || '') === proposed;
                            return (
                                <div className={`p-3 rounded-card border ${equal ? 'border-border' : 'border-primary/30 bg-primary/5'}`}>
                                    <div className="flex items-start gap-3">
                                        <input type="checkbox" className="mt-1" checked={!!selected.jobTitle} onChange={() => toggle('jobTitle')} />
                                        <div className="flex-1">
                                            <div className="text-xs text-muted-foreground mb-1">Job Title</div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <div className="rounded-card bg-muted p-3">
                                                    <div className="text-2xs text-muted-foreground mb-1">Current</div>
                                                    <div className="text-sm font-medium">{userProfile.jobTitle || '—'}</div>
                                                </div>
                                                <div className="rounded-card bg-background p-3 border border-border">
                                                    <div className="text-2xs text-muted-foreground mb-1">From resume</div>
                                                    <div className="text-sm font-medium">{proposed}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Skills */}
                        {(() => {
                            const parsedSkills = Array.isArray(parsedResume.skills_detailed) ? parsedResume.skills_detailed : (Array.isArray(parsedResume.skills) ? parsedResume.skills : []);
                            if (!parsedSkills.length) return null;
                            const proposed = parsedSkills.map(s => (typeof s === 'string' ? s : (s.name || s.skill))).filter(Boolean);
                            const currentSkillsSource = (userProfile.skills && userProfile.skills.length) ? userProfile.skills : (userProfile.profile?.skills || []);
                            const current = getSkillNames(currentSkillsSource || []);
                            const { added, removed, unchanged } = arrayDiff(current, proposed);
                            const equal = added.length === 0 && removed.length === 0;
                            return (
                                <div className={`p-3 rounded-card border ${equal ? 'border-border' : 'border-primary/30 bg-primary/5'}`}>
                                    <div className="flex items-start gap-3">
                                        <input type="checkbox" className="mt-1" checked={!!selected.skills} onChange={() => toggle('skills')} />
                                        <div className="flex-1">
                                            <div className="text-xs text-muted-foreground mb-1">Skills</div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <div className="rounded-card bg-muted p-3">
                                                    <div className="text-2xs text-muted-foreground mb-1">Current</div>
                                                    <div className="flex flex-wrap gap-1">{current.length ? current.slice(0, 20).map(s => <span key={`c-${s}`} className="px-2 py-0.5 rounded-full text-2xs bg-secondary/15 text-foreground border border-border/60">{s}</span>) : <span className="text-sm text-foreground/80">—</span>}</div>
                                                </div>
                                                <div className="rounded-card bg-background p-3 border border-border">
                                                    <div className="text-2xs text-muted-foreground mb-1">From resume</div>
                                                    <div className="flex flex-wrap gap-1">{proposed.slice(0, 20).map(s => <span key={`p-${s}`} className="px-2 py-0.5 rounded-full text-2xs bg-accent/15 text-foreground border border-accent/40">{s}</span>)}</div>
                                                    {!equal && (
                                                        <div className="mt-2 flex flex-wrap gap-2 text-2xs">
                                                            {added.length > 0 && <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600">+ {added.length} new</span>}
                                                            {removed.length > 0 && <span className="px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-600">- {removed.length} removed</span>}
                                                            {unchanged.length > 0 && <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground">= {unchanged.length} same</span>}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Location */}
                        {parsedResume.location && (() => {
                            const equal = (userProfile.location || '') === parsedResume.location;
                            return (
                                <div className={`p-3 rounded-card border ${equal ? 'border-border' : 'border-primary/30 bg-primary/5'}`}>
                                    <div className="flex items-start gap-3">
                                        <input type="checkbox" className="mt-1" checked={!!selected.location} onChange={() => toggle('location')} />
                                        <div className="flex-1">
                                            <div className="text-xs text-muted-foreground mb-1">Location</div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <div className="rounded-card bg-muted p-3">
                                                    <div className="text-2xs text-muted-foreground mb-1">Current</div>
                                                    <div className="text-sm font-medium">{userProfile.location || '—'}</div>
                                                </div>
                                                <div className="rounded-card bg-background p-3 border border-border">
                                                    <div className="text-2xs text-muted-foreground mb-1">From resume</div>
                                                    <div className="text-sm font-medium">{parsedResume.location}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Phone */}
                        {parsedResume.phone && (() => {
                            const equal = (userProfile.phone || '') === parsedResume.phone;
                            return (
                                <div className={`p-3 rounded-card border ${equal ? 'border-border' : 'border-primary/30 bg-primary/5'}`}>
                                    <div className="flex items-start gap-3">
                                        <input type="checkbox" className="mt-1" checked={!!selected.phone} onChange={() => toggle('phone')} />
                                        <div className="flex-1">
                                            <div className="text-xs text-muted-foreground mb-1">Phone</div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <div className="rounded-card bg-muted p-3">
                                                    <div className="text-2xs text-muted-foreground mb-1">Current</div>
                                                    <div className="text-sm font-medium">{userProfile.phone || '—'}</div>
                                                </div>
                                                <div className="rounded-card bg-background p-3 border border-border">
                                                    <div className="text-2xs text-muted-foreground mb-1">From resume</div>
                                                    <div className="text-sm font-medium">{parsedResume.phone}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Bio */}
                        {parsedResume.summary && (() => {
                            const equal = (userProfile.bio || '') === parsedResume.summary;
                            return (
                                <div className={`p-3 rounded-card border ${equal ? 'border-border' : 'border-primary/30 bg-primary/5'}`}>
                                    <div className="flex items-start gap-3">
                                        <input type="checkbox" className="mt-1" checked={!!selected.bio} onChange={() => toggle('bio')} />
                                        <div className="flex-1">
                                            <div className="text-xs text-muted-foreground mb-1">Bio / Summary</div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <div className="rounded-card bg-muted p-3">
                                                    <div className="text-2xs text-muted-foreground mb-1">Current</div>
                                                    <div className="text-sm font-medium break-words line-clamp-4">{userProfile.bio || '—'}</div>
                                                </div>
                                                <div className="rounded-card bg-background p-3 border border-border">
                                                    <div className="text-2xs text-muted-foreground mb-1">From resume</div>
                                                    <div className="text-sm font-medium break-words line-clamp-4">{parsedResume.summary}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Education and Experiences simple replace (optional) */}
                        {Array.isArray(parsedResume.education) && parsedResume.education.length > 0 && (
                            <div className="p-3 rounded-card border border-border">
                                <div className="flex items-start gap-3">
                                    <input type="checkbox" className="mt-1" checked={!!selected.education} onChange={() => toggle('education')} />
                                    <div className="flex-1">
                                        <div className="text-xs text-muted-foreground mb-1">Education</div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div className="rounded-card bg-muted p-3">
                                                <div className="text-2xs text-muted-foreground mb-1">Current</div>
                                                {renderEducationList(userProfile.education || [])}
                                            </div>
                                            <div className="rounded-card bg-background p-3 border border-border">
                                                <div className="text-2xs text-muted-foreground mb-1">From resume</div>
                                                {renderEducationList(parsedResume.education || [])}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {Array.isArray(parsedResume.experiences) && parsedResume.experiences.length > 0 && (
                            <div className="p-3 rounded-card border border-border">
                                <div className="flex items-start gap-3">
                                    <input type="checkbox" className="mt-1" checked={!!selected.experiences} onChange={() => toggle('experiences')} />
                                    <div className="flex-1">
                                        <div className="text-xs text-muted-foreground mb-1">Experiences</div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div className="rounded-card bg-muted p-3">
                                                <div className="text-2xs text-muted-foreground mb-1">Current</div>
                                                {renderExperienceList(userProfile.experiences || [])}
                                            </div>
                                            <div className="rounded-card bg-background p-3 border border-border">
                                                <div className="text-2xs text-muted-foreground mb-1">From resume</div>
                                                {renderExperienceList(parsedResume.experiences || [])}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end mt-5">
                        <Button type="button" onClick={applySelected} iconName="Check">Apply selected to profile & Save</Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecruiterResumeUpdatesTab;
