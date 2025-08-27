import React, { useState } from 'react';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';
import { getApiUrl } from 'utils/api';

// A focused tab for jobseekers to upload a resume, see parsed suggestions,
// select fields to apply, and persist updates to their profile.
const ResumeUpdatesTab = ({ userProfile, onUpdateProfile, onDraftChange }) => {
    const [uploadedFile, setUploadedFile] = useState(null);
    const [parseLoading, setParseLoading] = useState(false);
    const [parseError, setParseError] = useState('');
    const [parsedResume, setParsedResume] = useState(null);
    const [selected, setSelected] = useState({});

    // Helper: extract proposed roles from either parsedResume.suited_roles or userProfile.suitedRolesDetailed
    const getProposedRoles = (parsed, currentProfile) => {
        // Try parsed suited_roles first
        if (parsed && Array.isArray(parsed.suited_roles)) {
            // Only include roles with match_percent >= 70 when available
            return parsed.suited_roles
                .filter(r => {
                    if (typeof r === 'string') return true; // keep strings if no score provided
                    const mp = Number(r?.match_percent);
                    return !Number.isNaN(mp) ? mp >= 70 : true;
                })
                .map(r => (typeof r === 'string' ? r : r?.role))
                .filter(Boolean);
        }
        // Fallback to roles saved in profile (derived from detailed objects)
        let detailed = currentProfile?.suitedRolesDetailed;
        if (Array.isArray(detailed) && detailed.length) {
            return detailed.map(r => (typeof r === 'string' ? r : r?.role)).filter(Boolean);
        }
        // Also check nested original profile shape
        detailed = currentProfile?.profile?.suited_job_roles_detailed;
        if (Array.isArray(detailed) && detailed.length) {
            return detailed.map(r => (typeof r === 'string' ? r : r?.role)).filter(Boolean);
        }
        // Final fallback to any simple suitedRoles array
        if (Array.isArray(currentProfile?.suitedRoles)) return currentProfile.suitedRoles.filter(Boolean);
        return [];
    };

    // Helper: get current roles from multiple possible sources in profile
    const getCurrentRoles = (currentProfile) => {
        if (!currentProfile) return [];
        if (Array.isArray(currentProfile.desiredRoles) && currentProfile.desiredRoles.length) return currentProfile.desiredRoles;
        if (Array.isArray(currentProfile.suitedRoles) && currentProfile.suitedRoles.length) return currentProfile.suitedRoles;
        if (Array.isArray(currentProfile.suitedRolesDetailed) && currentProfile.suitedRolesDetailed.length) {
            return currentProfile.suitedRolesDetailed.map(r => (typeof r === 'string' ? r : r?.role)).filter(Boolean);
        }
        const prof = currentProfile.profile || {};
        if (Array.isArray(prof.desired_roles) && prof.desired_roles.length) return prof.desired_roles;
        if (Array.isArray(prof.preferred_roles) && prof.preferred_roles.length) return prof.preferred_roles;
        if (Array.isArray(prof.suited_job_roles_detailed) && prof.suited_job_roles_detailed.length) {
            return prof.suited_job_roles_detailed.map(r => (typeof r === 'string' ? r : r?.role)).filter(Boolean);
        }
        if (Array.isArray(prof.suited_job_roles) && prof.suited_job_roles.length) return prof.suited_job_roles.filter(Boolean);
        return [];
    };

    // Recompute selected fields when DB-backed userProfile changes, keeping UI in sync
    const computeSelectionFrom = (parsed, currentProfile) => {
        if (!parsed || !currentProfile) return {};
        const next = {};
        const parsedJob = Array.isArray(parsed.job_titles) && parsed.job_titles.length ? parsed.job_titles[0] : (parsed.job_title || '');
        if (parsedJob && parsedJob !== (currentProfile.jobTitle || '')) next.jobTitle = true;
        const parsedRoles = getProposedRoles(parsed, currentProfile);
        const currentRoles = getCurrentRoles(currentProfile);
        if (parsedRoles.length && JSON.stringify(parsedRoles) !== JSON.stringify(currentRoles)) next.desiredRoles = true;
        const pMin = parsed?.expected_salary_range?.min ?? parsed?.salary_min ?? parsed?.salaryMin;
        const pMax = parsed?.expected_salary_range?.max ?? parsed?.salary_max ?? parsed?.salaryMax;
        if (pMin !== undefined && String(pMin) !== String(currentProfile.salary_min || '')) next.salary_min = true;
        if (pMax !== undefined && String(pMax) !== String(currentProfile.salary_max || '')) next.salary_max = true;
        const parsedSkills = Array.isArray(parsed.skills_detailed) ? parsed.skills_detailed : (Array.isArray(parsed.skills) ? parsed.skills : []);
        const currentSkillsSource = (currentProfile.skills && currentProfile.skills.length)
            ? currentProfile.skills
            : (currentProfile.profile?.skills || []);
        const currentSkillNames = (currentSkillsSource || []).map(s => (typeof s === 'object' ? (s.name || s) : s));
        if (parsedSkills.length && JSON.stringify(parsedSkills.map(s => (typeof s === 'string' ? s : s.name || s.skill)).filter(Boolean)) !== JSON.stringify(currentSkillNames)) next.skills = true;
        const parsedProjects = Array.isArray(parsed.projects) ? parsed.projects : [];
        const currentProjectsSource = (currentProfile.projects && currentProfile.projects.length)
            ? currentProfile.projects
            : (currentProfile.profile?.projects || []);
        if (parsedProjects.length && JSON.stringify(parsedProjects.map(p => p?.title)) !== JSON.stringify((currentProjectsSource || []).map(p => p?.title))) next.projects = true;
        if (parsed.location && parsed.location !== (currentProfile.location || '')) next.location = true;
        if (parsed.phone && parsed.phone !== (currentProfile.phone || '')) next.phone = true;
        if (parsed.summary && parsed.summary !== (currentProfile.bio || '')) next.bio = true;
        return next;
    };

    React.useEffect(() => {
        if (parsedResume) {
            setSelected(computeSelectionFrom(parsedResume, userProfile));
            // Lightweight debug to verify "Current" sources
            try {
                const rolesNow = getCurrentRoles(userProfile);
                const skillsSrc = (userProfile?.skills?.length ? userProfile.skills : (userProfile?.profile?.skills || [])) || [];
                const projectsSrc = (userProfile?.projects?.length ? userProfile.projects : (userProfile?.profile?.projects || [])) || [];
                // eslint-disable-next-line no-console
                console.debug('[ResumeUpdatesTab] Current snapshot', {
                    roles: rolesNow,
                    skillsCount: Array.isArray(skillsSrc) ? skillsSrc.length : 0,
                    projectsCount: Array.isArray(projectsSrc) ? projectsSrc.length : 0
                });
            } catch (_) { /* no-op */ }
        }
    }, [userProfile, parsedResume]);

    // Helpers for comparison UI
    const getSkillNames = (arr) => (Array.isArray(arr) ? arr.map(s => (typeof s === 'object' ? (s.name || s.skill || '') : s)).filter(Boolean) : []);
    const arrayDiff = (curr = [], prop = []) => {
        const c = new Set(curr);
        const p = new Set(prop);
        const added = prop.filter(x => !c.has(x));
        const removed = curr.filter(x => !p.has(x));
        const unchanged = curr.filter(x => p.has(x));
        return { added, removed, unchanged };
    };
    const formatRange = (min, max) => {
        const fm = (v) => (v === null || v === undefined || v === '' ? '—' : String(v));
        return `${fm(min)} - ${fm(max)}`;
    };

    const handleResumeUpload = async (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        if (file.size > 10 * 1024 * 1024) {
            setParseError('File size must be less than 10MB');
            return;
        }
        if (!file.type.includes('pdf') && !file.type.includes('doc')) {
            setParseError('Please upload a PDF or DOC file');
            return;
        }

        setUploadedFile(file);
        setParseError('');

        try {
            const authToken = localStorage.getItem('accessToken');
            const fd = new FormData();
            fd.append('file', file);
            fd.append('type', 'resume');
            const res = await fetch(getApiUrl('/auth/upload/'), {
                method: 'POST',
                headers: { Authorization: `Bearer ${authToken}` },
                body: fd,
            });
            const data = await res.json();
            if (!res.ok || !data?.success) throw new Error(data?.error || 'Upload failed');

            // Update draft so other tabs see resume presence/link
            const tokenParam = localStorage.getItem('accessToken') || '';
            const resumeUrl = data.url ? `${data.url}${data.url.includes('?') ? '&' : '?'}token=${tokenParam}` : '';
            onDraftChange && onDraftChange({ resume: resumeUrl || true, resume_url: resumeUrl });

            // Parse resume for suggestions
            setParseLoading(true);
            const parseRes = await fetch(getApiUrl('/auth/resume/parse/'), {
                method: 'POST',
                headers: { Authorization: `Bearer ${authToken}` },
            });
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
        if (selected.desiredRoles && Array.isArray(parsedResume.suited_roles)) {
            // Persist detailed roles to DB and set preferred roles from matches >= 70
            const detailed = parsedResume.suited_roles
                .map(r => {
                    if (typeof r === 'string') return { role: r, match_percent: null };
                    const role = r?.role || r?.name || '';
                    const mpRaw = r?.match_percent;
                    const mp = mpRaw === null || mpRaw === undefined ? null : Number(mpRaw);
                    return { role, match_percent: Number.isNaN(mp) ? null : mp };
                })
                .filter(d => !!d.role);
            const filteredNames = detailed
                .filter(d => d.match_percent === null || d.match_percent >= 70)
                .map(d => d.role);
            updated.suitedRolesDetailed = detailed;
            updated.desiredRoles = filteredNames;
        }
        if (selected.salary_min) updated.salary_min = parsedResume?.expected_salary_range?.min ?? parsedResume?.salary_min ?? parsedResume?.salaryMin ?? '';
        if (selected.salary_max) updated.salary_max = parsedResume?.expected_salary_range?.max ?? parsedResume?.salary_max ?? parsedResume?.salaryMax ?? '';

        // Merge skills: append only new by name (case-insensitive), keep existing
        const parsedSkillsSource = parsedResume.skills_detailed || parsedResume.skillsDetailed || parsedResume.skills;
        if (selected.skills && Array.isArray(parsedSkillsSource)) {
            const base = Date.now();
            const currentSkillsSource = (userProfile.skills && userProfile.skills.length)
                ? userProfile.skills
                : (userProfile.profile?.skills || []);
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

        // Merge projects: append new by unique title (case-insensitive); keep existing
        if (selected.projects && Array.isArray(parsedResume.projects)) {
            const currentProjectsSource = (userProfile.projects && userProfile.projects.length)
                ? userProfile.projects
                : (userProfile.profile?.projects || []);
            const normalizedCurrent = (currentProjectsSource || []).filter(Boolean);
            const byTitle = new Map();
            normalizedCurrent.forEach(p => {
                const t = (p?.title || '').trim().toLowerCase();
                if (t) byTitle.set(t, p);
            });
            (parsedResume.projects || []).forEach(p => {
                const t = (p?.title || '').trim().toLowerCase();
                if (t && !byTitle.has(t)) byTitle.set(t, p);
            });
            updated.projects = Array.from(byTitle.values());
        }

        if (selected.location && parsedResume.location) updated.location = parsedResume.location;
        if (selected.phone && parsedResume.phone) updated.phone = parsedResume.phone;
        if (selected.bio && parsedResume.summary) updated.bio = parsedResume.summary;

        if (Object.keys(updated).length > 0) {
            onDraftChange && onDraftChange(updated);
            await onUpdateProfile(updated);
            // Close suggestions panel after successful save
            setParsedResume(null);
            setUploadedFile(null);
            setSelected({});
        }
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
                        <input id="resume-upload-new" type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleResumeUpload} />
                        <Button type="button" variant="outline" onClick={() => document.getElementById('resume-upload-new').click()} iconName="Upload" iconPosition="left" iconSize={16}>
                            Choose File
                        </Button>
                    </div>

                    {(uploadedFile || userProfile.resume_url) && (
                        <div className="flex items-center justify-between bg-muted p-3 rounded-squircle">
                            <div className="flex items-center space-x-2">
                                <Icon name="FileText" size={16} className="text-primary" />
                                <span className="text-sm font-body font-body-medium">{uploadedFile?.name || 'Resume uploaded'}</span>
                            </div>
                            {userProfile.resume_url && (
                                <div className="flex items-center gap-2">
                                    <a href={userProfile.resume_url} target="_blank" rel="noreferrer noopener" className="px-3 py-1 text-xs rounded-squircle bg-primary text-primary-foreground hover:opacity-90 spring-transition">
                                        View
                                    </a>
                                    <a href={`${userProfile.resume_url}${userProfile.resume_url.includes('?') ? '&' : '?'}download=1`} className="px-3 py-1 text-xs rounded-squircle bg-secondary text-secondary-foreground hover:opacity-90 spring-transition">
                                        Download
                                    </a>
                                </div>
                            )}
                        </div>
                    )}

                    {parseError && (
                        <p className="text-sm text-error">{parseError}</p>
                    )}
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
                            <Button size="sm" variant="ghost" onClick={() => setMany(['jobTitle', 'desiredRoles', 'salary_min', 'salary_max', 'skills', 'projects', 'location', 'phone', 'bio'], true)}>Select all</Button>
                            <Button size="sm" variant="ghost" onClick={() => setMany(['jobTitle', 'desiredRoles', 'salary_min', 'salary_max', 'skills', 'projects', 'location', 'phone', 'bio'], false)}>Clear</Button>
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

                        {/* Desired Roles (suggested) */}
                        {(() => {
                            const proposed = getProposedRoles(parsedResume, userProfile);
                            if (!proposed || proposed.length === 0) return null;
                            const current = getCurrentRoles(userProfile);
                            const { added, removed, unchanged } = arrayDiff(current, proposed);
                            const equal = added.length === 0 && removed.length === 0;
                            return (
                                <div className={`p-3 rounded-card border ${equal ? 'border-border' : 'border-primary/30 bg-primary/5'}`}>
                                    <div className="flex items-start gap-3">
                                        <input type="checkbox" className="mt-1" checked={!!selected.desiredRoles} onChange={() => toggle('desiredRoles')} />
                                        <div className="flex-1">
                                            <div className="text-xs text-muted-foreground mb-1">Suggested Roles</div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <div className="rounded-card bg-muted p-3">
                                                    <div className="text-2xs text-muted-foreground mb-1">Current</div>
                                                    <div className="flex flex-wrap gap-1">{current.length ? current.map(r => <span key={`c-${r}`} className="px-2 py-0.5 rounded-full text-2xs bg-secondary/15 text-foreground border border-border/60">{r}</span>) : <span className="text-sm text-foreground/80">—</span>}</div>
                                                </div>
                                                <div className="rounded-card bg-background p-3 border border-border">
                                                    <div className="text-2xs text-muted-foreground mb-1">From resume</div>
                                                    <div className="flex flex-wrap gap-1">{proposed.map(r => <span key={`p-${r}`} className="px-2 py-0.5 rounded-full text-2xs bg-accent/15 text-foreground border border-accent/40">{r}</span>)}</div>
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

                        {/* Salary Range */}
                        {((parsedResume.expected_salary_range && (parsedResume.expected_salary_range.min || parsedResume.expected_salary_range.max)) || parsedResume.salary_min || parsedResume.salaryMax) && (() => {
                            const pMin = parsedResume?.expected_salary_range?.min ?? parsedResume?.salary_min ?? parsedResume?.salaryMin;
                            const pMax = parsedResume?.expected_salary_range?.max ?? parsedResume?.salary_max ?? parsedResume?.salaryMax;
                            const equal = String(userProfile.salary_min || '') === String(pMin ?? '') && String(userProfile.salary_max || '') === String(pMax ?? '');
                            return (
                                <div className={`p-3 rounded-card border ${equal ? 'border-border' : 'border-primary/30 bg-primary/5'}`}>
                                    <div className="flex items-start gap-3">
                                        <input type="checkbox" className="mt-1" checked={!!selected.salary_min || !!selected.salary_max} onChange={() => { toggle('salary_min'); toggle('salary_max'); }} />
                                        <div className="flex-1">
                                            <div className="text-xs text-muted-foreground mb-1">Expected Salary</div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <div className="rounded-card bg-muted p-3">
                                                    <div className="text-2xs text-muted-foreground mb-1">Current</div>
                                                    <div className="text-sm font-medium">{formatRange(userProfile.salary_min, userProfile.salary_max)}</div>
                                                </div>
                                                <div className="rounded-card bg-background p-3 border border-border">
                                                    <div className="text-2xs text-muted-foreground mb-1">From resume</div>
                                                    <div className="text-sm font-medium">{formatRange(pMin, pMax)}</div>
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
                            const currentSkillsSource = (userProfile.skills && userProfile.skills.length)
                                ? userProfile.skills
                                : (userProfile.profile?.skills || []);
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

                        {/* Projects (titles overview) */}
                        {Array.isArray(parsedResume.projects) && parsedResume.projects.length > 0 && (() => {
                            const proposedTitles = parsedResume.projects.map(p => p?.title).filter(Boolean);
                            const currentProjectsSource = (userProfile.projects && userProfile.projects.length)
                                ? userProfile.projects
                                : (userProfile.profile?.projects || []);
                            const currentTitles = (currentProjectsSource || []).map(p => p?.title).filter(Boolean);
                            const { added, removed, unchanged } = arrayDiff(currentTitles, proposedTitles);
                            const equal = added.length === 0 && removed.length === 0;
                            return (
                                <div className={`p-3 rounded-card border ${equal ? 'border-border' : 'border-primary/30 bg-primary/5'}`}>
                                    <div className="flex items-start gap-3">
                                        <input type="checkbox" className="mt-1" checked={!!selected.projects} onChange={() => toggle('projects')} />
                                        <div className="flex-1">
                                            <div className="text-xs text-muted-foreground mb-1">Projects</div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <div className="rounded-card bg-muted p-3">
                                                    <div className="text-2xs text-muted-foreground mb-1">Current</div>
                                                    <div className="flex flex-wrap gap-1">{currentTitles.length ? currentTitles.slice(0, 10).map(t => <span key={`c-${t}`} className="px-2 py-0.5 rounded-full text-2xs bg-secondary/15 text-foreground border border-border/60">{t}</span>) : <span className="text-sm text-foreground/80">—</span>}</div>
                                                </div>
                                                <div className="rounded-card bg-background p-3 border border-border">
                                                    <div className="text-2xs text-muted-foreground mb-1">From resume</div>
                                                    <div className="flex flex-wrap gap-1">{proposedTitles.slice(0, 10).map(t => <span key={`p-${t}`} className="px-2 py-0.5 rounded-full text-2xs bg-accent/15 text-foreground border border-accent/40">{t}</span>)}</div>
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

                        {/* Bio / Summary */}
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
                    </div>

                    <div className="flex justify-end mt-5">
                        <Button type="button" onClick={applySelected} iconName="Check">Apply selected to profile & Save</Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResumeUpdatesTab;
