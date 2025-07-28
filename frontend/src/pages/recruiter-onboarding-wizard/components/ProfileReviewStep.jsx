import React from 'react';
import { motion } from 'framer-motion';

const ProfileReviewStep = ({ data, onUpdate, onPrev, onComplete, isLoading }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
        >
            <div>
                <h3 className="text-lg font-medium text-foreground dark:text-white">Review Your Profile</h3>
                <p className="text-sm text-muted-foreground dark:text-gray-400 mt-1">
                    Please review your recruiter profile information before completing the onboarding process.
                </p>
            </div>

            <div className="space-y-6">
                <div className="bg-muted/30 dark:bg-gray-800/50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-foreground dark:text-white mb-2 flex items-center">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="mr-2 text-primary dark:text-blue-400"
                        >
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        Personal Information
                    </h4>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-muted-foreground dark:text-gray-400">Name</p>
                            <p className="text-sm text-foreground dark:text-white">{data.first_name} {data.last_name}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground dark:text-gray-400">Email</p>
                            <p className="text-sm text-foreground dark:text-white">{data.email}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground dark:text-gray-400">Phone</p>
                            <p className="text-sm text-foreground dark:text-white">{data.phone || 'Not provided'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground dark:text-gray-400">Job Title</p>
                            <p className="text-sm text-foreground dark:text-white">{data.job_title || 'Not provided'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground dark:text-gray-400">LinkedIn</p>
                            <p className="text-sm text-foreground dark:text-white overflow-hidden text-ellipsis">{data.linkedin_url || 'Not provided'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground dark:text-gray-400">Experience</p>
                            <p className="text-sm text-foreground dark:text-white">{data.years_of_experience ? `${data.years_of_experience} years` : 'Not provided'}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-muted/30 dark:bg-gray-800/50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-foreground dark:text-white mb-2 flex items-center">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="mr-2 text-primary dark:text-blue-400"
                        >
                            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                        </svg>
                        Resume
                    </h4>

                    {data.resume ? (
                        <div className="flex items-center space-x-3">
                            <div className="rounded-md bg-muted dark:bg-gray-700 p-2">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="text-foreground dark:text-white"
                                >
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                    <polyline points="14 2 14 8 20 8"></polyline>
                                    <line x1="16" y1="13" x2="8" y2="13"></line>
                                    <line x1="16" y1="17" x2="8" y2="17"></line>
                                    <line x1="10" y1="9" x2="8" y2="9"></line>
                                </svg>
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-medium text-foreground dark:text-white truncate max-w-[300px]">
                                    {data.resume.name}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground dark:text-gray-400">No resume uploaded</p>
                    )}
                </div>

                <div className="bg-muted/30 dark:bg-gray-800/50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-foreground dark:text-white mb-2 flex items-center">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="mr-2 text-primary dark:text-blue-400"
                        >
                            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                        </svg>
                        Professional Experience
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-muted-foreground dark:text-gray-400">Specialization</p>
                            <p className="text-sm text-foreground dark:text-white">{data.specialization || 'Not specified'}</p>
                        </div>

                        <div>
                            <p className="text-xs text-muted-foreground dark:text-gray-400">Primary Industry</p>
                            <p className="text-sm text-foreground dark:text-white">{data.primary_industry || 'Not specified'}</p>
                        </div>

                        <div className="sm:col-span-2">
                            <p className="text-xs text-muted-foreground dark:text-gray-400 mb-1">Industries</p>
                            <div className="flex flex-wrap gap-2">
                                {data.industries && data.industries.length > 0 ? (
                                    data.industries.map((industry, index) => (
                                        <span
                                            key={index}
                                            className="bg-primary/10 dark:bg-blue-900/30 text-primary dark:text-blue-300 rounded-full px-2 py-1 text-xs"
                                        >
                                            {industry}
                                        </span>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground dark:text-gray-400">No industries specified</p>
                                )}
                            </div>
                        </div>

                        <div className="sm:col-span-2">
                            <p className="text-xs text-muted-foreground dark:text-gray-400 mb-1">Services Offered</p>
                            <div className="flex flex-wrap gap-2">
                                {data.services_offered && data.services_offered.length > 0 ? (
                                    data.services_offered.map((service, index) => (
                                        <span
                                            key={index}
                                            className="bg-primary/10 dark:bg-blue-900/30 text-primary dark:text-blue-300 rounded-full px-2 py-1 text-xs"
                                        >
                                            {service}
                                        </span>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground dark:text-gray-400">No services specified</p>
                                )}
                            </div>
                        </div>

                        <div className="sm:col-span-2">
                            <p className="text-xs text-muted-foreground dark:text-gray-400 mb-1">Certifications</p>
                            <div className="flex flex-wrap gap-2">
                                {data.certifications && data.certifications.length > 0 ? (
                                    data.certifications.map((cert, index) => (
                                        <span
                                            key={index}
                                            className="bg-primary/10 dark:bg-blue-900/30 text-primary dark:text-blue-300 rounded-full px-2 py-1 text-xs"
                                        >
                                            {cert}
                                        </span>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground dark:text-gray-400">No certifications specified</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-muted/30 dark:bg-gray-800/50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-foreground dark:text-white mb-2 flex items-center">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="mr-2 text-primary dark:text-blue-400"
                        >
                            <path d="M12 20h9"></path>
                            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                        </svg>
                        Preferences
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-muted-foreground dark:text-gray-400">Recruitment Type</p>
                            <p className="text-sm text-foreground dark:text-white capitalize">{data.recruitment_type || 'Not specified'}</p>
                        </div>

                        <div>
                            <p className="text-xs text-muted-foreground dark:text-gray-400">Remote Work</p>
                            <p className="text-sm text-foreground dark:text-white">{data.remote_work ? 'Yes' : 'No'}</p>
                        </div>

                        <div className="sm:col-span-2">
                            <p className="text-xs text-muted-foreground dark:text-gray-400">Salary Range</p>
                            <p className="text-sm text-foreground dark:text-white">
                                {data.salary_range_from && data.salary_range_to
                                    ? `${data.salary_currency} ${data.salary_range_from} - ${data.salary_range_to}`
                                    : 'Not specified'}
                            </p>
                        </div>

                        <div className="sm:col-span-2">
                            <p className="text-xs text-muted-foreground dark:text-gray-400 mb-1">Position Types</p>
                            <div className="flex flex-wrap gap-2">
                                {data.position_types && data.position_types.length > 0 ? (
                                    data.position_types.map((position, index) => (
                                        <span
                                            key={index}
                                            className="bg-primary/10 dark:bg-blue-900/30 text-primary dark:text-blue-300 rounded-full px-2 py-1 text-xs"
                                        >
                                            {position}
                                        </span>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground dark:text-gray-400">No position types specified</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="border-t border-border dark:border-gray-700 pt-4">
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground dark:text-gray-400">
                        Need to make changes? You can go back or edit your profile anytime after completion.
                    </p>
                    <div className="flex space-x-3">
                        <button
                            type="button"
                            onClick={onPrev}
                            className="inline-flex items-center justify-center rounded-md border border-input dark:border-gray-700 px-4 py-2 text-sm font-medium text-foreground dark:text-white hover:bg-accent dark:hover:bg-gray-800"
                            disabled={isLoading}
                        >
                            Back
                        </button>
                        <button
                            type="button"
                            onClick={onComplete}
                            className="inline-flex items-center justify-center rounded-md bg-primary dark:bg-blue-600 px-4 py-2 text-sm font-medium text-primary-foreground dark:text-white hover:bg-primary/90 dark:hover:bg-blue-500"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <div className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Completing...
                                </div>
                            ) : (
                                'Complete Setup'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ProfileReviewStep;
