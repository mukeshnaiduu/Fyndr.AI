import React from 'react';
import { motion } from 'framer-motion';

const PersonalInfoStep = ({ data, onUpdate, onNext }) => {
    const [formData, setFormData] = React.useState({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || '',
        phone: data.phone || '',
        jobTitle: data.jobTitle || '',
        linkedInUrl: data.linkedInUrl || '',
        yearsOfExperience: data.yearsOfExperience || '',
    });
    const [errors, setErrors] = React.useState({});

    React.useEffect(() => {
        setFormData({
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            email: data.email || '',
            phone: data.phone || '',
            jobTitle: data.jobTitle || '',
            linkedInUrl: data.linkedInUrl || '',
            yearsOfExperience: data.yearsOfExperience || '',
        });
    }, [data]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Clear error on field change
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: '',
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.firstName?.trim()) {
            newErrors.firstName = 'First name is required';
        }

        if (!formData.lastName?.trim()) {
            newErrors.lastName = 'Last name is required';
        }

        if (!formData.email?.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
            newErrors.email = 'Invalid email address';
        }

        if (!formData.phone?.trim()) {
            newErrors.phone = 'Phone number is required';
        }

        if (!formData.jobTitle?.trim()) {
            newErrors.jobTitle = 'Job title is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (validateForm()) {
            onUpdate({
                first_name: formData.firstName,
                last_name: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                job_title: formData.jobTitle,
                linkedin_url: formData.linkedInUrl,
                years_of_experience: formData.yearsOfExperience ? parseInt(formData.yearsOfExperience, 10) : null,
            });
            onNext();
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <h3 className="text-lg font-medium text-foreground dark:text-foreground">Personal Information</h3>
                <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                    Tell us about yourself so companies can get to know you better.
                </p>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
                    <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-foreground dark:text-foreground">
                            First Name*
                        </label>
                        <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            className={`mt-1 block w-full rounded-md border ${errors.firstName ? 'border-error dark:border-error' : 'border-input dark:border-input'
                                } bg-background dark:bg-input px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring`}
                            placeholder="John"
                        />
                        {errors.firstName && (
                            <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-foreground dark:text-foreground">
                            Last Name*
                        </label>
                        <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            className={`mt-1 block w-full rounded-md border ${errors.lastName ? 'border-error dark:border-error' : 'border-input dark:border-input'
                                } bg-background dark:bg-input px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring`}
                            placeholder="Doe"
                        />
                        {errors.lastName && (
                            <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-foreground dark:text-foreground">
                            Email Address*
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`mt-1 block w-full rounded-md border ${errors.email ? 'border-error dark:border-error' : 'border-input dark:border-input'
                                } bg-background dark:bg-input px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring`}
                            placeholder="john.doe@example.com"
                        />
                        {errors.email && (
                            <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-foreground dark:text-foreground">
                            Phone Number*
                        </label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className={`mt-1 block w-full rounded-md border ${errors.phone ? 'border-error dark:border-error' : 'border-input dark:border-input'
                                } bg-background dark:bg-input px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring`}
                            placeholder="(555) 123-4567"
                        />
                        {errors.phone && (
                            <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="jobTitle" className="block text-sm font-medium text-foreground dark:text-foreground">
                            Job Title*
                        </label>
                        <input
                            type="text"
                            id="jobTitle"
                            name="jobTitle"
                            value={formData.jobTitle}
                            onChange={handleChange}
                            className={`mt-1 block w-full rounded-md border ${errors.jobTitle ? 'border-error dark:border-error' : 'border-input dark:border-input'
                                } bg-background dark:bg-input px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring`}
                            placeholder="Senior Recruiter"
                        />
                        {errors.jobTitle && (
                            <p className="mt-1 text-sm text-red-500">{errors.jobTitle}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="yearsOfExperience" className="block text-sm font-medium text-foreground dark:text-foreground">
                            Years of Experience
                        </label>
                        <input
                            type="number"
                            id="yearsOfExperience"
                            name="yearsOfExperience"
                            value={formData.yearsOfExperience}
                            onChange={handleChange}
                            min="0"
                            max="50"
                            className="mt-1 block w-full rounded-md border border-input dark:border-input bg-background dark:bg-input px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                            placeholder="5"
                        />
                    </div>

                    <div className="sm:col-span-2">
                        <label htmlFor="linkedInUrl" className="block text-sm font-medium text-foreground dark:text-foreground">
                            LinkedIn URL
                        </label>
                        <input
                            type="url"
                            id="linkedInUrl"
                            name="linkedInUrl"
                            value={formData.linkedInUrl}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border border-input dark:border-input bg-background dark:bg-input px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                            placeholder="https://linkedin.com/in/johndoe"
                        />
                    </div>
                </div>

                <div className="flex justify-end pt-5">
                    <button
                        type="submit"
                        className="inline-flex items-center justify-center rounded-md bg-primary dark:bg-primary px-4 py-2 text-sm font-medium text-primary-foreground dark:text-primary-foreground hover:bg-primary/90 dark:hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:ring-offset-background"
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

export default PersonalInfoStep;
