import React, { useState } from 'react';
import { motion } from 'framer-motion';

const ProfessionalExperienceStep = ({ data, onUpdate, onNext, onPrev }) => {
    const [formData, setFormData] = useState({
        specialization: data.specialization || '',
        industries: data.industries || [],
        primaryIndustry: data.primaryIndustry || '',
        yearsOfExperience: data.yearsOfExperience || '',
        servicesOffered: data.servicesOffered || [],
        recruitingAreas: data.recruitingAreas || [],
        certifications: data.certifications || [],
    });

    const [newIndustry, setNewIndustry] = useState('');
    const [newService, setNewService] = useState('');
    const [newArea, setNewArea] = useState('');
    const [newCertification, setNewCertification] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleAddIndustry = () => {
        if (newIndustry.trim() && !formData.industries.includes(newIndustry.trim())) {
            setFormData((prev) => ({
                ...prev,
                industries: [...prev.industries, newIndustry.trim()],
            }));
            setNewIndustry('');
        }
    };

    const handleRemoveIndustry = (industry) => {
        setFormData((prev) => ({
            ...prev,
            industries: prev.industries.filter((i) => i !== industry),
        }));
    };

    const handleAddService = () => {
        if (newService.trim() && !formData.servicesOffered.includes(newService.trim())) {
            setFormData((prev) => ({
                ...prev,
                servicesOffered: [...prev.servicesOffered, newService.trim()],
            }));
            setNewService('');
        }
    };

    const handleRemoveService = (service) => {
        setFormData((prev) => ({
            ...prev,
            servicesOffered: prev.servicesOffered.filter((s) => s !== service),
        }));
    };

    const handleAddArea = () => {
        if (newArea.trim() && !formData.recruitingAreas.includes(newArea.trim())) {
            setFormData((prev) => ({
                ...prev,
                recruitingAreas: [...prev.recruitingAreas, newArea.trim()],
            }));
            setNewArea('');
        }
    };

    const handleRemoveArea = (area) => {
        setFormData((prev) => ({
            ...prev,
            recruitingAreas: prev.recruitingAreas.filter((a) => a !== area),
        }));
    };

    const handleAddCertification = () => {
        if (newCertification.trim() && !formData.certifications.includes(newCertification.trim())) {
            setFormData((prev) => ({
                ...prev,
                certifications: [...prev.certifications, newCertification.trim()],
            }));
            setNewCertification('');
        }
    };

    const handleRemoveCertification = (cert) => {
        setFormData((prev) => ({
            ...prev,
            certifications: prev.certifications.filter((c) => c !== cert),
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onUpdate({
            specialization: formData.specialization,
            industries: formData.industries,
            primary_industry: formData.primaryIndustry,
            years_of_experience: formData.yearsOfExperience ? parseInt(formData.yearsOfExperience, 10) : null,
            services_offered: formData.servicesOffered,
            recruiting_areas: formData.recruitingAreas,
            certifications: formData.certifications,
        });
        onNext();
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <h3 className="text-lg font-medium text-foreground dark:text-white">Professional Experience</h3>
                <p className="text-sm text-muted-foreground dark:text-gray-400">
                    Tell us more about your professional background and expertise as a recruiter.
                </p>

                <div className="space-y-4">
                    <div>
                        <label htmlFor="specialization" className="block text-sm font-medium text-foreground dark:text-white">
                            Specialization
                        </label>
                        <input
                            type="text"
                            id="specialization"
                            name="specialization"
                            value={formData.specialization}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border border-input dark:border-gray-700 bg-background dark:bg-gray-800 px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                            placeholder="e.g. Technical Recruiting, Executive Search"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground dark:text-white mb-1">
                            Industries You Recruit For
                        </label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {formData.industries.map((industry, index) => (
                                <div
                                    key={index}
                                    className="bg-primary/10 dark:bg-blue-900/30 text-primary dark:text-blue-300 rounded-full px-3 py-1 text-sm flex items-center"
                                >
                                    {industry}
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveIndustry(industry)}
                                        className="ml-2 focus:outline-none"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="14"
                                            height="14"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <line x1="18" y1="6" x2="6" y2="18"></line>
                                            <line x1="6" y1="6" x2="18" y2="18"></line>
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="flex">
                            <input
                                type="text"
                                value={newIndustry}
                                onChange={(e) => setNewIndustry(e.target.value)}
                                className="flex-1 rounded-l-md border border-input dark:border-gray-700 bg-background dark:bg-gray-800 px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                                placeholder="Add industry"
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddIndustry())}
                            />
                            <button
                                type="button"
                                onClick={handleAddIndustry}
                                className="rounded-r-md border border-l-0 border-input dark:border-gray-700 bg-muted dark:bg-gray-700 px-3 py-2 text-sm font-medium text-foreground dark:text-white hover:bg-muted/80 dark:hover:bg-gray-600 focus:outline-none focus:ring-1 focus:ring-ring"
                            >
                                Add
                            </button>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="primaryIndustry" className="block text-sm font-medium text-foreground dark:text-white">
                            Primary Industry Focus
                        </label>
                        <select
                            id="primaryIndustry"
                            name="primaryIndustry"
                            value={formData.primaryIndustry}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border border-input dark:border-gray-700 bg-background dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                        >
                            <option value="">Select primary industry</option>
                            {formData.industries.map((industry, index) => (
                                <option key={index} value={industry}>{industry}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground dark:text-white mb-1">
                            Services Offered
                        </label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {formData.servicesOffered.map((service, index) => (
                                <div
                                    key={index}
                                    className="bg-primary/10 dark:bg-blue-900/30 text-primary dark:text-blue-300 rounded-full px-3 py-1 text-sm flex items-center"
                                >
                                    {service}
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveService(service)}
                                        className="ml-2 focus:outline-none"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="14"
                                            height="14"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <line x1="18" y1="6" x2="6" y2="18"></line>
                                            <line x1="6" y1="6" x2="18" y2="18"></line>
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="flex">
                            <input
                                type="text"
                                value={newService}
                                onChange={(e) => setNewService(e.target.value)}
                                className="flex-1 rounded-l-md border border-input dark:border-gray-700 bg-background dark:bg-gray-800 px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                                placeholder="Add service offered"
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddService())}
                            />
                            <button
                                type="button"
                                onClick={handleAddService}
                                className="rounded-r-md border border-l-0 border-input dark:border-gray-700 bg-muted dark:bg-gray-700 px-3 py-2 text-sm font-medium text-foreground dark:text-white hover:bg-muted/80 dark:hover:bg-gray-600 focus:outline-none focus:ring-1 focus:ring-ring"
                            >
                                Add
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground dark:text-white mb-1">
                            Certifications & Qualifications
                        </label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {formData.certifications.map((cert, index) => (
                                <div
                                    key={index}
                                    className="bg-primary/10 dark:bg-blue-900/30 text-primary dark:text-blue-300 rounded-full px-3 py-1 text-sm flex items-center"
                                >
                                    {cert}
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveCertification(cert)}
                                        className="ml-2 focus:outline-none"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="14"
                                            height="14"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <line x1="18" y1="6" x2="6" y2="18"></line>
                                            <line x1="6" y1="6" x2="18" y2="18"></line>
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="flex">
                            <input
                                type="text"
                                value={newCertification}
                                onChange={(e) => setNewCertification(e.target.value)}
                                className="flex-1 rounded-l-md border border-input dark:border-gray-700 bg-background dark:bg-gray-800 px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                                placeholder="Add certification or qualification"
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCertification())}
                            />
                            <button
                                type="button"
                                onClick={handleAddCertification}
                                className="rounded-r-md border border-l-0 border-input dark:border-gray-700 bg-muted dark:bg-gray-700 px-3 py-2 text-sm font-medium text-foreground dark:text-white hover:bg-muted/80 dark:hover:bg-gray-600 focus:outline-none focus:ring-1 focus:ring-ring"
                            >
                                Add
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex justify-between pt-5">
                    <button
                        type="button"
                        onClick={onPrev}
                        className="inline-flex items-center justify-center rounded-md border border-input dark:border-gray-700 bg-background dark:bg-transparent px-4 py-2 text-sm font-medium text-foreground dark:text-white hover:bg-accent dark:hover:bg-gray-800"
                    >
                        <svg
                            className="mr-2 h-4 w-4"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                        >
                            <path
                                fillRule="evenodd"
                                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                                clipRule="evenodd"
                            />
                        </svg>
                        Back
                    </button>
                    <button
                        type="submit"
                        className="inline-flex items-center justify-center rounded-md bg-primary dark:bg-blue-600 px-4 py-2 text-sm font-medium text-primary-foreground dark:text-white hover:bg-primary/90 dark:hover:bg-blue-500"
                    >
                        Continue
                        <svg
                            className="ml-2 h-4 w-4"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                        >
                            <path
                                fillRule="evenodd"
                                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </button>
                </div>
            </form>
        </motion.div>
    );
};

export default ProfessionalExperienceStep;
