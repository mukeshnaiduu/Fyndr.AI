import React, { useState } from 'react';
import { motion } from 'framer-motion';

const RecruiterPreferencesStep = ({ data, onUpdate, onNext, onPrev }) => {
    const [formData, setFormData] = useState({
        recruitmentType: data.recruitmentType || 'fullTime',
        remoteWork: data.remoteWork || false,
        positionTypes: data.positionTypes || [],
        salaryCurrency: data.salaryCurrency || 'USD',
        salaryRangeFrom: data.salaryRangeFrom || '',
        salaryRangeTo: data.salaryRangeTo || '',
        communication: data.communication || {
            email: true,
            phone: false,
            inApp: true
        },
        availabilityStartDate: data.availabilityStartDate || '',
        notes: data.notes || ''
    });

    const positionOptions = [
        'Entry Level',
        'Mid-Level',
        'Senior Level',
        'Management',
        'Executive',
        'C-Level',
        'Intern',
        'Contract',
        'Freelance'
    ];

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleCommunicationChange = (channel) => {
        setFormData((prev) => ({
            ...prev,
            communication: {
                ...prev.communication,
                [channel]: !prev.communication[channel]
            }
        }));
    };

    const handlePositionTypeToggle = (position) => {
        setFormData((prev) => {
            if (prev.positionTypes.includes(position)) {
                return {
                    ...prev,
                    positionTypes: prev.positionTypes.filter(pos => pos !== position)
                };
            } else {
                return {
                    ...prev,
                    positionTypes: [...prev.positionTypes, position]
                };
            }
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        onUpdate({
            recruitment_type: formData.recruitmentType,
            remote_work: formData.remoteWork,
            position_types: formData.positionTypes,
            salary_currency: formData.salaryCurrency,
            salary_range_from: formData.salaryRangeFrom ? parseFloat(formData.salaryRangeFrom) : null,
            salary_range_to: formData.salaryRangeTo ? parseFloat(formData.salaryRangeTo) : null,
            communication_preferences: formData.communication,
            availability_start_date: formData.availabilityStartDate || null,
            additional_notes: formData.notes
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
                <h3 className="text-lg font-medium text-foreground dark:text-white">Recruiter Preferences</h3>
                <p className="text-sm text-muted-foreground dark:text-gray-400">
                    Let us know your preferences as a recruiter to help optimize your experience.
                </p>

                <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-6">
                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-foreground dark:text-white mb-1">
                            Recruitment Type
                        </label>
                        <div className="flex flex-wrap gap-3">
                            <label className={`
                flex items-center px-4 py-2 rounded-md cursor-pointer border
                ${formData.recruitmentType === 'fullTime'
                                    ? 'bg-primary/10 border-primary dark:bg-blue-900/30 dark:border-blue-600'
                                    : 'bg-background border-input dark:bg-gray-800 dark:border-gray-700'}
              `}>
                                <input
                                    type="radio"
                                    name="recruitmentType"
                                    value="fullTime"
                                    checked={formData.recruitmentType === 'fullTime'}
                                    onChange={handleChange}
                                    className="sr-only"
                                />
                                <span className={`text-sm font-medium ${formData.recruitmentType === 'fullTime' ? 'text-primary dark:text-blue-400' : 'text-foreground dark:text-white'}`}>
                                    Full-time
                                </span>
                            </label>

                            <label className={`
                flex items-center px-4 py-2 rounded-md cursor-pointer border
                ${formData.recruitmentType === 'contract'
                                    ? 'bg-primary/10 border-primary dark:bg-blue-900/30 dark:border-blue-600'
                                    : 'bg-background border-input dark:bg-gray-800 dark:border-gray-700'}
              `}>
                                <input
                                    type="radio"
                                    name="recruitmentType"
                                    value="contract"
                                    checked={formData.recruitmentType === 'contract'}
                                    onChange={handleChange}
                                    className="sr-only"
                                />
                                <span className={`text-sm font-medium ${formData.recruitmentType === 'contract' ? 'text-primary dark:text-blue-400' : 'text-foreground dark:text-white'}`}>
                                    Contract
                                </span>
                            </label>

                            <label className={`
                flex items-center px-4 py-2 rounded-md cursor-pointer border
                ${formData.recruitmentType === 'both'
                                    ? 'bg-primary/10 border-primary dark:bg-blue-900/30 dark:border-blue-600'
                                    : 'bg-background border-input dark:bg-gray-800 dark:border-gray-700'}
              `}>
                                <input
                                    type="radio"
                                    name="recruitmentType"
                                    value="both"
                                    checked={formData.recruitmentType === 'both'}
                                    onChange={handleChange}
                                    className="sr-only"
                                />
                                <span className={`text-sm font-medium ${formData.recruitmentType === 'both' ? 'text-primary dark:text-blue-400' : 'text-foreground dark:text-white'}`}>
                                    Both
                                </span>
                            </label>
                        </div>
                    </div>

                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-foreground dark:text-white mb-1">
                            Remote Work Positions
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                name="remoteWork"
                                checked={formData.remoteWork}
                                onChange={handleChange}
                                className="rounded border-gray-300 text-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700"
                            />
                            <span className="text-sm text-foreground dark:text-gray-200">I recruit for remote positions</span>
                        </label>
                    </div>

                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-foreground dark:text-white mb-1">
                            Position Types
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {positionOptions.map(position => (
                                <button
                                    key={position}
                                    type="button"
                                    onClick={() => handlePositionTypeToggle(position)}
                                    className={`
                    px-3 py-1 rounded-full text-sm
                    ${formData.positionTypes.includes(position)
                                            ? 'bg-primary text-white dark:bg-blue-600 dark:text-white'
                                            : 'bg-muted text-muted-foreground dark:bg-gray-700 dark:text-gray-300 hover:bg-muted/80 dark:hover:bg-gray-600'}
                  `}
                                >
                                    {position}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-foreground dark:text-white mb-1">
                            Salary Range
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-end">
                            <div className="sm:col-span-1">
                                <select
                                    name="salaryCurrency"
                                    value={formData.salaryCurrency}
                                    onChange={handleChange}
                                    className="block w-full rounded-md border border-input dark:border-gray-700 bg-background dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                >
                                    <option value="USD">USD</option>
                                    <option value="EUR">EUR</option>
                                    <option value="GBP">GBP</option>
                                    <option value="CAD">CAD</option>
                                    <option value="AUD">AUD</option>
                                    <option value="JPY">JPY</option>
                                    <option value="INR">INR</option>
                                </select>
                            </div>
                            <div className="sm:col-span-2">
                                <label htmlFor="salaryRangeFrom" className="sr-only">From</label>
                                <input
                                    type="number"
                                    id="salaryRangeFrom"
                                    name="salaryRangeFrom"
                                    placeholder="Min"
                                    value={formData.salaryRangeFrom}
                                    onChange={handleChange}
                                    className="block w-full rounded-md border border-input dark:border-gray-700 bg-background dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                />
                            </div>
                            <div className="text-center sm:col-span-1">
                                <span className="text-sm text-muted-foreground dark:text-gray-400">to</span>
                            </div>
                            <div className="sm:col-span-2">
                                <label htmlFor="salaryRangeTo" className="sr-only">To</label>
                                <input
                                    type="number"
                                    id="salaryRangeTo"
                                    name="salaryRangeTo"
                                    placeholder="Max"
                                    value={formData.salaryRangeTo}
                                    onChange={handleChange}
                                    className="block w-full rounded-md border border-input dark:border-gray-700 bg-background dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-foreground dark:text-white mb-1">
                            Communication Preferences
                        </label>
                        <div className="flex space-x-4">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.communication.email}
                                    onChange={() => handleCommunicationChange('email')}
                                    className="rounded border-gray-300 text-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700"
                                />
                                <span className="text-sm text-foreground dark:text-gray-200">Email</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.communication.phone}
                                    onChange={() => handleCommunicationChange('phone')}
                                    className="rounded border-gray-300 text-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700"
                                />
                                <span className="text-sm text-foreground dark:text-gray-200">Phone</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.communication.inApp}
                                    onChange={() => handleCommunicationChange('inApp')}
                                    className="rounded border-gray-300 text-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700"
                                />
                                <span className="text-sm text-foreground dark:text-gray-200">In-App</span>
                            </label>
                        </div>
                    </div>

                    <div className="sm:col-span-2">
                        <label htmlFor="availabilityStartDate" className="block text-sm font-medium text-foreground dark:text-white">
                            Available to Start
                        </label>
                        <input
                            type="date"
                            id="availabilityStartDate"
                            name="availabilityStartDate"
                            value={formData.availabilityStartDate}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border border-input dark:border-gray-700 bg-background dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                    </div>

                    <div className="sm:col-span-2">
                        <label htmlFor="notes" className="block text-sm font-medium text-foreground dark:text-white">
                            Additional Notes
                        </label>
                        <textarea
                            id="notes"
                            name="notes"
                            rows="3"
                            value={formData.notes}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border border-input dark:border-gray-700 bg-background dark:bg-gray-800 px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                            placeholder="Any other information you'd like companies to know about your recruitment services..."
                        ></textarea>
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

export default RecruiterPreferencesStep;
