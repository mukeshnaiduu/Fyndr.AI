import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { apiRequest, getApiUrl } from 'utils/api';

const ResumeUploadStep = ({ data, onUpdate, onNext, onPrev }) => {
    const [resume, setResume] = useState(data.resume || null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Check file type
        const validTypes = ['.pdf', '.doc', '.docx', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

        if (!validTypes.includes(file.type) && !validTypes.includes(fileExtension)) {
            setUploadError('Please upload a PDF or Word document (.pdf, .doc, .docx)');
            return;
        }

        // Check file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            setUploadError('File size exceeds the 10MB limit.');
            return;
        }

        setIsUploading(true);
        setUploadError('');
        setUploadSuccess(false);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', 'resume');

            const token = localStorage.getItem('accessToken');
            if (!token) {
                throw new Error('Authentication token not found');
            }

            const response = await fetch(getApiUrl('/auth/upload/'), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            setResume({
                name: file.name,
                size: file.size,
                type: file.type,
                url: result.url,
                uploadedAt: new Date().toISOString()
            });

            onUpdate({
                resume: {
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    url: result.url,
                    uploadedAt: new Date().toISOString()
                }
            });

            setUploadSuccess(true);
        } catch (error) {
            console.error('Resume upload failed:', error);
            setUploadError('Failed to upload resume. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemoveFile = () => {
        setResume(null);
        onUpdate({ resume: null });
        setUploadSuccess(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' bytes';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(1) + ' MB';
    };

    const handleSkip = () => {
        onNext();
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
        >
            <div>
                <h3 className="text-lg font-medium text-foreground dark:text-white">Upload Your Resume</h3>
                <p className="text-sm text-muted-foreground dark:text-gray-400 mt-1">
                    Upload your resume to help companies understand your qualifications and experience better. We'll use AI to analyze your resume and enhance your profile.
                </p>
            </div>

            <div className="bg-muted/50 dark:bg-gray-800 rounded-lg p-6">
                <div className="text-center">
                    {!resume ? (
                        <div className="space-y-4">
                            <div className="flex flex-col items-center justify-center space-y-2">
                                <div className="rounded-full bg-primary/10 p-3 dark:bg-blue-900/50">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="text-primary dark:text-blue-400"
                                    >
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                        <polyline points="14 2 14 8 20 8"></polyline>
                                        <line x1="16" y1="13" x2="8" y2="13"></line>
                                        <line x1="16" y1="17" x2="8" y2="17"></line>
                                        <line x1="10" y1="9" x2="8" y2="9"></line>
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="text-base font-medium text-foreground dark:text-white">Upload your resume</h4>
                                    <p className="text-sm text-muted-foreground dark:text-gray-400">
                                        PDF or Word documents up to 10MB
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col items-center space-y-3">
                                <label
                                    htmlFor="resumeUpload"
                                    className="flex cursor-pointer items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:bg-blue-600 dark:hover:bg-blue-500 dark:ring-offset-gray-900"
                                >
                                    {isUploading ? 'Uploading...' : 'Select File'}
                                </label>
                                <input
                                    ref={fileInputRef}
                                    id="resumeUpload"
                                    type="file"
                                    className="hidden"
                                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                    onChange={handleFileChange}
                                    disabled={isUploading}
                                />
                                <span className="text-xs text-muted-foreground dark:text-gray-400">
                                    or drag and drop file here
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-center space-x-3">
                                <div className="rounded-full bg-success/10 p-2 dark:bg-green-900/50">
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
                                        className="text-success dark:text-green-400"
                                    >
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                </div>
                                <span className="text-sm font-medium text-foreground dark:text-white">Resume uploaded successfully</span>
                            </div>

                            <div className="rounded-md border border-border dark:border-gray-700 p-3">
                                <div className="flex items-center justify-between">
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
                                            <h4 className="text-sm font-medium text-foreground dark:text-white truncate max-w-[200px]">
                                                {resume.name}
                                            </h4>
                                            <p className="text-xs text-muted-foreground dark:text-gray-400">
                                                {formatFileSize(resume.size)}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleRemoveFile}
                                        className="rounded-md p-1 text-muted-foreground hover:bg-muted dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                                    >
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
                                        >
                                            <line x1="18" y1="6" x2="6" y2="18"></line>
                                            <line x1="6" y1="6" x2="18" y2="18"></line>
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {uploadSuccess && (
                                <p className="text-sm text-muted-foreground dark:text-gray-400">
                                    Your resume has been uploaded and will be analyzed to enhance your profile.
                                </p>
                            )}
                        </div>
                    )}

                    {uploadError && (
                        <p className="text-sm text-red-500 dark:text-red-400 mt-2">{uploadError}</p>
                    )}
                </div>
            </div>

            <div className="flex justify-between pt-4">
                <button
                    type="button"
                    onClick={onPrev}
                    className="flex items-center justify-center rounded-md border border-input px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
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

                <div className="space-x-2">
                    <button
                        type="button"
                        onClick={handleSkip}
                        className="inline-flex items-center justify-center rounded-md border border-input px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
                    >
                        Skip for now
                    </button>
                    <button
                        type="button"
                        onClick={onNext}
                        disabled={isUploading}
                        className="inline-flex items-center justify-center rounded-md bg-primary dark:bg-blue-600 px-4 py-2 text-sm font-medium text-primary-foreground dark:text-white hover:bg-primary/90 dark:hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:ring-offset-gray-900 disabled:opacity-50"
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
            </div>
        </motion.div>
    );
};

export default ResumeUploadStep;
