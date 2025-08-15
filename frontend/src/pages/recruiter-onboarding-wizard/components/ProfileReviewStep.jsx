import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';
import Image from 'components/AppImage';
import { getApiUrl } from 'utils/api';

const ProfileReviewStep = ({ data, onPrev, onComplete, isLoading }) => {
    const [showConfetti, setShowConfetti] = useState(false);

    const completionScore = useMemo(() => {
        let score = 0;
        const maxScore = 100;
        if (data.firstName && data.lastName) score += 10;
        if (data.email) score += 5;
        if (data.phone) score += 5;
        if (data.location) score += 5;
        if (data.profileImage) score += 5;
        if (data.resume) score += 20;
        if (Array.isArray(data.focusRoles) && data.focusRoles.length > 0) score += 10;
        if (Array.isArray(data.candidateTypes) && data.candidateTypes.length > 0) score += 10;
        if (Array.isArray(data.workArrangements) && data.workArrangements.length > 0) score += 10;
        if (Array.isArray(data.industries) && data.industries.length > 0) score += 10;
        if (data.salaryMin || data.salaryMax) score += 10;
        return Math.min(score, maxScore);
    }, [data]);

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-success';
        if (score >= 60) return 'text-accent';
        if (score >= 40) return 'text-warning';
        return 'text-error';
    };

    const withToken = (url, bust = false) => {
        if (!url) return '';
        const token = localStorage.getItem('accessToken') || '';
        let out = `${url}${url.includes('?') ? '&' : '?'}token=${token}`;
        if (bust) out += `&t=${Date.now()}`;
        return out;
    };

    const safeProfileImage = useMemo(() => {
        if (!data?.profileImage) {
            const raw = data?.profileImageFile?.url || '';
            return raw ? withToken(raw, true) : '';
        }
        return data.profileImage.includes('token=') ? data.profileImage : withToken(data.profileImage, true);
    }, [data?.profileImage, data?.profileImageFile?.url]);

    const formatSalaryRange = (min, max) => {
        const toINR = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(parseInt(val));
        if (!min && !max) return 'Not specified';
        if (!min) return `Up to ${toINR(max)}`;
        if (!max) return `From ${toINR(min)}`;
        return `${toINR(min)} - ${toINR(max)}`;
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
        >
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-2">Review your recruiter profile</h2>
                <p className="text-muted-foreground">Make sure everything looks good before completing setup</p>
            </div>

            <div className="max-w-2xl mx-auto">
                <div className="glass-card p-6 rounded-card text-center">
                    <div className="relative w-24 h-24 mx-auto mb-4">
                        <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="none" className="text-muted" />
                            <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="none" strokeDasharray={`${2 * Math.PI * 40}`} strokeDashoffset={`${2 * Math.PI * 40 * (1 - completionScore / 100)}`} className={`${getScoreColor(completionScore)} transition-all duration-1000 ease-out`} strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className={`text-2xl font-bold ${getScoreColor(completionScore)}`}>{completionScore}%</span>
                        </div>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Profile Completion</h3>
                    <p className="text-sm text-muted-foreground">Higher completion helps us match better roles and candidates</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-card p-6 rounded-card">
                    <div className="flex items-center space-x-2 mb-4">
                        <Icon name="User" size={20} className="text-primary" />
                        <h3 className="text-lg font-semibold text-foreground">Personal Information</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center overflow-hidden">
                                {safeProfileImage ? (
                                    <Image src={safeProfileImage} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <Icon name="User" size={24} color="white" />
                                )}
                            </div>
                            <div>
                                <p className="font-medium text-foreground">{data.firstName} {data.lastName}</p>
                                <p className="text-sm text-muted-foreground">{data.email}</p>
                                <p className="text-sm text-muted-foreground">{data.phone}</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center space-x-2"><Icon name="MapPin" size={16} className="text-muted-foreground" /><span className="text-sm">{data.location || 'Not specified'}</span></div>
                            {data.linkedinUrl && (
                                <div className="flex items-center space-x-2"><Icon name="Linkedin" size={16} className="text-muted-foreground" /><a href={data.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">LinkedIn Profile</a></div>
                            )}
                            {/* Company website removed from Personal Info */}
                        </div>
                    </div>
                </div>

                <div className="glass-card p-6 rounded-card">
                    <div className="flex items-center space-x-2 mb-4">
                        <Icon name="FileText" size={20} className="text-primary" />
                        <h3 className="text-lg font-semibold text-foreground">Resume</h3>
                    </div>
                    {data.resume ? (
                        <div className="flex items-center space-x-3 p-3 bg-success/10 border border-success/20 rounded-card">
                            <Icon name="FileCheck" size={20} className="text-success" />
                            <div className="min-w-0 flex-1">
                                <p className="font-medium text-foreground truncate" title={data.resume.name}>{data.resume.name}</p>
                            </div>
                            <div className="ml-auto flex items-center space-x-2">
                                {data.resume.url && (
                                    <a href={withToken(data.resume.url)} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">View</a>
                                )}
                                {data.resume.url && (
                                    <a href={`${withToken(data.resume.url)}&download=1`} className="text-sm text-primary hover:underline">Download</a>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center space-x-3 p-3 bg-warning/10 border border-warning/20 rounded-card">
                            <Icon name="AlertTriangle" size={20} className="text-warning" />
                            <div>
                                <p className="font-medium text-warning">No resume uploaded</p>
                                <p className="text-sm text-muted-foreground">Optional but recommended</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="glass-card p-6 rounded-card">
                    <div className="flex items-center space-x-2 mb-4">
                        <Icon name="Target" size={20} className="text-primary" />
                        <h3 className="text-lg font-semibold text-foreground">Recruiting Focus</h3>
                    </div>
                    <div className="space-y-3">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Focus Roles</p>
                            {Array.isArray(data.focusRoles) && data.focusRoles.length > 0 ? (
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {data.focusRoles.map((role) => (
                                        <span key={role} className="px-2.5 py-1.5 bg-accent/10 text-accent text-sm font-semibold rounded-full">{role}</span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm">Not specified</p>
                            )}
                        </div>

                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Candidate Levels</p>
                            <p className="text-sm">{data.candidateTypes?.length ? data.candidateTypes.join(', ') : 'Not specified'}</p>
                        </div>

                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Work Arrangements</p>
                            <p className="text-sm">{data.workArrangements?.length ? data.workArrangements.join(', ') : 'Not specified'}</p>
                        </div>

                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Salary Range</p>
                            <p className="text-sm">{formatSalaryRange(data.salaryMin, data.salaryMax)}</p>
                        </div>

                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Recruiter Type</p>
                            <p className="text-sm">{data.recruiterType || 'Not specified'}</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Company Size</p>
                                <p className="text-sm">{data.companySize || 'Not specified'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Hiring Volume</p>
                                <p className="text-sm">{data.hiringVolume || 'Not specified'}</p>
                            </div>
                        </div>

                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Industries</p>
                            {Array.isArray(data.industries) && data.industries.length > 0 ? (
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {data.industries.map((ind) => (
                                        <span key={ind} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">{ind}</span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm">Not specified</p>
                            )}
                        </div>

                        {Array.isArray(data.atsTools) && data.atsTools.length > 0 && (
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">ATS / Tools</p>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {data.atsTools.map((tool) => (
                                        <span key={tool} className="px-2 py-1 bg-accent/10 text-accent text-xs rounded-full">{tool}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {data.notes && (
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Notes</p>
                                <p className="text-sm">{data.notes}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex justify-between pt-6">
                <Button variant="outline" onClick={onPrev} disabled={isLoading} iconName="ArrowLeft" iconPosition="left">Previous</Button>
                <Button onClick={onComplete} loading={isLoading} iconName="Sparkles" iconPosition="left" className="bg-gradient-primary text-white">{isLoading ? 'Saving…' : 'Complete Setup'}</Button>
            </div>
        </motion.div>
    );
};

export default ProfileReviewStep;
