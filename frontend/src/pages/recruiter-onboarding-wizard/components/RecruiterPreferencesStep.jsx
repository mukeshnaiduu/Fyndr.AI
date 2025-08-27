import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Input from 'components/ui/Input';
import { Checkbox, CheckboxGroup } from 'components/ui/Checkbox';
import Button from 'components/ui/Button';
import { INDUSTRY_OPTIONS } from 'constants/industries';
import Select from 'components/ui/Select';

const RecruiterPreferencesStep = ({ data, onUpdate, onNext, onPrev }) => {
    const [prefs, setPrefs] = useState({
        candidateTypes: data.candidateTypes || [],
        workArrangements: data.workArrangements || [],
        salaryMin: data.salaryMin || '',
        salaryMax: data.salaryMax || '',
        industries: Array.isArray(data.industries) ? data.industries : [],
        notes: data.notes || '',
        recruiterType: data.recruiterType || '', // 'in-house' | 'agency'
        companySize: data.companySize || '', // '1-10','11-50','51-200','201-500','501-1000','1000+'
        hiringVolume: data.hiringVolume || '', // '<5/mo','5-20/mo','20+/mo'
        atsTools: Array.isArray(data.atsTools) ? data.atsTools : [], // e.g., 'Greenhouse','Lever','Ashby','Workday','BambooHR','Zoho','Other'
        ...data
    });

    const [errors, setErrors] = useState({});
    const MAX_SALARY_ALLOWED = 99999999; // 8 digits before decimal

    const candidateTypeOptions = [
        { value: 'entry', label: 'Entry' },
        { value: 'mid', label: 'Mid' },
        { value: 'senior', label: 'Senior' },
        { value: 'management', label: 'Management' },
        { value: 'executive', label: 'Executive/CxO' },
        { value: 'contract', label: 'Contract/Freelance' },
        { value: 'intern', label: 'Intern' },
    ];

    const workArrangementOptions = [
        { value: 'remote', label: 'Remote' },
        { value: 'hybrid', label: 'Hybrid' },
        { value: 'on-site', label: 'On-site' },
        { value: 'flexible', label: 'Flexible' }
    ];

    const recruiterTypeOptions = [
        { value: 'in-house', label: 'In-house' },
        { value: 'agency', label: 'Agency/Consultant' }
    ];

    const companySizeOptions = [
        { value: '1-10', label: '1-10' },
        { value: '11-50', label: '11-50' },
        { value: '51-200', label: '51-200' },
        { value: '201-500', label: '201-500' },
        { value: '501-1000', label: '501-1000' },
        { value: '1000+', label: '1000+' }
    ];

    const hiringVolumeOptions = [
        { value: '<5/mo', label: '< 5 per month' },
        { value: '5-20/mo', label: '5 - 20 per month' },
        { value: '20+/mo', label: '20+ per month' }
    ];

    const atsToolOptions = [
        'Greenhouse', 'Lever', 'Ashby', 'Workday', 'BambooHR', 'Zoho Recruit', 'SAP SuccessFactors', 'Oracle Taleo', 'JazzHR', 'Freshteam', 'Other'
    ].map(v => ({ value: v, label: v }));

    const handleToggle = (field, value) => {
        setPrefs(prev => ({
            ...prev,
            [field]: prev[field].includes(value)
                ? prev[field].filter(v => v !== value)
                : [...prev[field], value]
        }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    };

    const validateSalaryLive = (field, val, otherFieldVal) => {
        const nextErrors = { ...errors };
        const n = val === '' ? null : Number(val);
        if (n !== null) {
            if (Number.isNaN(n) || n < 0) {
                nextErrors[field] = 'Enter a valid non-negative number';
            } else if (n >= MAX_SALARY_ALLOWED) {
                nextErrors[field] = 'Must be less than 100,000,000 (8 digits)';
            } else {
                delete nextErrors[field];
            }
        } else {
            delete nextErrors[field];
        }
        // Cross-field check: max > min
        if (field === 'salaryMin' && otherFieldVal) {
            const maxN = Number(otherFieldVal);
            if (!Number.isNaN(maxN) && n !== null && maxN <= n) {
                nextErrors.salaryMax = 'Max must be greater than Min';
            } else {
                if (nextErrors.salaryMax === 'Max must be greater than Min') delete nextErrors.salaryMax;
            }
        } else if (field === 'salaryMax' && otherFieldVal) {
            const minN = Number(otherFieldVal);
            if (!Number.isNaN(minN) && n !== null && n <= minN) {
                nextErrors.salaryMax = 'Max must be greater than Min';
            } else {
                if (nextErrors.salaryMax === 'Max must be greater than Min') delete nextErrors.salaryMax;
            }
        }
        setErrors(nextErrors);
    };

    const validate = () => {
        const e = {};
        if (!prefs.industries || prefs.industries.length === 0) e.industries = 'Select at least one industry';
        const minN = prefs.salaryMin === '' ? null : Number(prefs.salaryMin);
        const maxN = prefs.salaryMax === '' ? null : Number(prefs.salaryMax);
        if (minN !== null && (Number.isNaN(minN) || minN < 0 || minN >= MAX_SALARY_ALLOWED)) {
            e.salaryMin = 'Must be less than 100,000,000 (8 digits)';
        }
        if (maxN !== null && (Number.isNaN(maxN) || maxN < 0 || maxN >= MAX_SALARY_ALLOWED)) {
            e.salaryMax = 'Must be less than 100,000,000 (8 digits)';
        }
        if (minN !== null && maxN !== null && maxN <= minN) {
            e.salaryMax = 'Max must be greater than Min';
        }
        if (!prefs.recruiterType) e.recruiterType = 'Select recruiter type';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleNext = () => {
        if (!validate()) return;
        onUpdate({ ...prefs });
        onNext();
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
                <h2 className="text-2xl font-bold text-foreground mb-2">Your recruiting focus</h2>
                <p className="text-muted-foreground">Tell us which industries you typically recruit for</p>
            </div>

            {/* Candidate Types */}
            <div className="max-w-2xl mx-auto">
                <label className="block text-sm font-medium text-foreground mb-2">Candidate Levels</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {candidateTypeOptions.map(opt => (
                        <label key={opt.value} className={`flex items-center space-x-2 p-3 rounded-card border cursor-pointer transition-all duration-200 ${prefs.candidateTypes.includes(opt.value) ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:border-primary/50 hover:bg-muted/50'
                            }`}>
                            <Checkbox
                                checked={prefs.candidateTypes.includes(opt.value)}
                                onChange={() => handleToggle('candidateTypes', opt.value)}
                            />
                            <span className="text-sm font-medium">{opt.label}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Work Arrangements */}
            <div className="max-w-2xl mx-auto">
                <label className="block text-sm font-medium text-foreground mb-2">Type</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {workArrangementOptions.map(opt => (
                        <label key={opt.value} className={`flex items-center space-x-2 p-3 rounded-card border cursor-pointer transition-all duration-200 ${prefs.workArrangements.includes(opt.value) ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:border-primary/50 hover:bg-muted/50'
                            }`}>
                            <Checkbox
                                checked={prefs.workArrangements.includes(opt.value)}
                                onChange={() => handleToggle('workArrangements', opt.value)}
                            />
                            <span className="text-sm font-medium">{opt.label}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Salary Range */}
            <div className="max-w-2xl mx-auto">
                <div className="space-y-3">
                    <label className="block text-sm font-medium text-foreground">Typical Salary Range You Hire For (INR)</label>
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Minimum"
                            type="number"
                            placeholder="300000"
                            value={prefs.salaryMin}
                            onChange={(e) => {
                                const v = e.target.value;
                                setPrefs(prev => ({ ...prev, salaryMin: v }));
                                validateSalaryLive('salaryMin', v, prefs.salaryMax);
                            }}
                            min="0"
                            max="99999999"
                            error={errors.salaryMin}
                        />
                        <Input
                            label="Maximum"
                            type="number"
                            placeholder="5000000"
                            value={prefs.salaryMax}
                            onChange={(e) => {
                                const v = e.target.value;
                                setPrefs(prev => ({ ...prev, salaryMax: v }));
                                validateSalaryLive('salaryMax', v, prefs.salaryMin);
                            }}
                            error={errors.salaryMax}
                            min="0"
                            max="99999999"
                        />
                    </div>
                </div>
            </div>

            {/* Recruiter Type and Company Size */}
            <div className="max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                    label="Recruiter Type"
                    required
                    options={recruiterTypeOptions}
                    value={prefs.recruiterType}
                    onChange={(val) => setPrefs(prev => ({ ...prev, recruiterType: val }))}
                    error={errors.recruiterType}
                    placeholder="Select type"
                />
                <Select
                    label="Company Size"
                    options={companySizeOptions}
                    value={prefs.companySize}
                    onChange={(val) => setPrefs(prev => ({ ...prev, companySize: val }))}
                    placeholder="Optional"
                />
            </div>

            {/* Hiring Volume and ATS Tools */}
            <div className="max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                    label="Typical Hiring Volume"
                    options={hiringVolumeOptions}
                    value={prefs.hiringVolume}
                    onChange={(val) => setPrefs(prev => ({ ...prev, hiringVolume: val }))}
                    placeholder="Optional"
                />
                <Select
                    label="ATS / Tools Used"
                    options={atsToolOptions}
                    multiple
                    searchable
                    value={prefs.atsTools}
                    onChange={(val) => setPrefs(prev => ({ ...prev, atsTools: val }))}
                    placeholder="Select one or more"
                    clearable
                />
            </div>

            {/* Industries (multi-select) */}
            <div className="max-w-2xl mx-auto">
                <CheckboxGroup label="Industries" required error={errors.industries}>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {INDUSTRY_OPTIONS.map(opt => (
                            <label key={opt.value} className={`flex items-center space-x-2 p-3 rounded-card border cursor-pointer transition-all duration-200 ${prefs.industries.includes(opt.value) ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:border-primary/50 hover:bg-muted/50'
                                }`}>
                                <Checkbox
                                    checked={prefs.industries.includes(opt.value)}
                                    onChange={() => setPrefs(prev => ({
                                        ...prev,
                                        industries: prev.industries.includes(opt.value)
                                            ? prev.industries.filter(v => v !== opt.value)
                                            : [...prev.industries, opt.value]
                                    }))}
                                />
                                <span className="text-sm font-medium">{opt.label}</span>
                            </label>
                        ))}
                    </div>
                </CheckboxGroup>
            </div>

            <div className="max-w-2xl mx-auto">
                <Input
                    label="Notes"
                    type="text"
                    placeholder="Briefly describe your niche or preferences"
                    value={prefs.notes}
                    onChange={(e) => setPrefs(prev => ({ ...prev, notes: e.target.value }))}
                />
            </div>

            <div className="flex justify-between pt-6">
                <Button variant="outline" onClick={onPrev} iconName="ArrowLeft" iconPosition="left">Previous</Button>
                <Button onClick={handleNext} iconName="ArrowRight" iconPosition="right" size="lg" className="font-semibold">Next Step</Button>
            </div>
        </motion.div>
    );
};

export default RecruiterPreferencesStep;
