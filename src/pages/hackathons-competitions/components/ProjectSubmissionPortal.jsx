import React, { useState, useRef } from 'react';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';
import Input from 'components/ui/Input';

const ProjectSubmissionPortal = ({ hackathonId, teamId, onSubmit }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const fileInputRef = useRef(null);

  const allowedFileTypes = [
    'application/pdf',
    'application/zip',
    'application/x-zip-compressed',
    'image/jpeg',
    'image/png',
    'image/gif',
    'video/mp4',
    'video/webm'
  ];

  const maxFileSize = 50 * 1024 * 1024; // 50MB

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFiles = (files) => {
    const validFiles = [];
    const errors = [];

    Array.from(files).forEach((file) => {
      if (!allowedFileTypes.includes(file.type)) {
        errors.push(`${file.name}: File type not supported`);
        return;
      }

      if (file.size > maxFileSize) {
        errors.push(`${file.name}: File size exceeds 50MB limit`);
        return;
      }

      validFiles.push({
        id: Date.now() + Math.random(),
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadProgress: 0,
        status: 'pending'
      });
    });

    if (errors.length > 0) {
      console.error('File upload errors:', errors);
    }

    setUploadedFiles(prev => [...prev, ...validFiles]);

    // Simulate file upload
    validFiles.forEach((fileObj) => {
      simulateUpload(fileObj.id);
    });
  };

  const simulateUpload = (fileId) => {
    const interval = setInterval(() => {
      setUploadedFiles(prev => prev.map(file => {
        if (file.id === fileId) {
          const newProgress = Math.min(file.uploadProgress + 10, 100);
          return {
            ...file,
            uploadProgress: newProgress,
            status: newProgress === 100 ? 'completed' : 'uploading'
          };
        }
        return file;
      }));
    }, 200);

    setTimeout(() => {
      clearInterval(interval);
      setUploadedFiles(prev => prev.map(file => {
        if (file.id === fileId) {
          return { ...file, uploadProgress: 100, status: 'completed' };
        }
        return file;
      }));
    }, 2000);
  };

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return 'Image';
    if (fileType.startsWith('video/')) return 'Video';
    if (fileType.includes('pdf')) return 'FileText';
    if (fileType.includes('zip')) return 'Archive';
    return 'File';
  };

  const handleSubmit = async () => {
    if (!projectTitle.trim() || !projectDescription.trim()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate submission
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const submissionData = {
        hackathonId,
        teamId,
        title: projectTitle,
        description: projectDescription,
        githubUrl,
        liveUrl,
        videoUrl,
        files: uploadedFiles.filter(file => file.status === 'completed'),
        submittedAt: new Date().toISOString()
      };

      onSubmit(submissionData);
      setSubmissionStatus('success');
    } catch (error) {
      setSubmissionStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = projectTitle.trim() && projectDescription.trim() && 
                     uploadedFiles.some(file => file.status === 'completed');

  if (submissionStatus === 'success') {
    return (
      <div className="glassmorphic rounded-xl p-8 text-center">
        <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="CheckCircle" size={32} className="text-success" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">Submission Successful!</h3>
        <p className="text-muted-foreground mb-6">
          Your project has been submitted successfully. You can still update your submission until the deadline.
        </p>
        <Button
          variant="outline"
          onClick={() => setSubmissionStatus(null)}
        >
          Submit Another Version
        </Button>
      </div>
    );
  }

  return (
    <div className="glassmorphic rounded-xl p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Icon name="Upload" size={24} className="text-primary" />
        <h2 className="text-xl font-semibold text-foreground">Project Submission</h2>
      </div>

      <div className="space-y-6">
        {/* Project Details */}
        <div className="space-y-4">
          <Input
            label="Project Title"
            type="text"
            placeholder="Enter your project title"
            value={projectTitle}
            onChange={(e) => setProjectTitle(e.target.value)}
            required
          />

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Project Description *
            </label>
            <textarea
              className="w-full h-32 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              placeholder="Describe your project, its features, and the problem it solves..."
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="GitHub Repository"
              type="url"
              placeholder="https://github.com/username/repo"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
            />

            <Input
              label="Live Demo URL"
              type="url"
              placeholder="https://your-project-demo.com"
              value={liveUrl}
              onChange={(e) => setLiveUrl(e.target.value)}
            />
          </div>

          <Input
            label="Demo Video URL"
            type="url"
            placeholder="https://youtube.com/watch?v=..."
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
          />
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Project Files *
          </label>
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-spring ${
              dragActive
                ? 'border-primary bg-primary/5' :'border-white/20 hover:border-white/40'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.zip,.jpg,.jpeg,.png,.gif,.mp4,.webm"
              onChange={(e) => handleFiles(e.target.files)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            
            <div className="space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Icon name="Upload" size={24} className="text-primary" />
              </div>
              <div>
                <p className="text-foreground font-medium mb-1">
                  Drop files here or click to browse
                </p>
                <p className="text-sm text-muted-foreground">
                  Supports PDF, ZIP, Images, Videos (Max 50MB each)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Uploaded Files */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground">Uploaded Files</h3>
            {uploadedFiles.map((file) => (
              <div key={file.id} className="bg-white/5 rounded-lg p-3 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <Icon name={getFileIcon(file.type)} size={20} className="text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {file.status === 'completed' && (
                      <Icon name="CheckCircle" size={16} className="text-success" />
                    )}
                    <button
                      onClick={() => removeFile(file.id)}
                      className="text-error hover:text-error/80 transition-spring"
                    >
                      <Icon name="X" size={16} />
                    </button>
                  </div>
                </div>
                
                {file.status === 'uploading' && (
                  <div className="w-full bg-white/10 rounded-full h-1">
                    <div
                      className="bg-primary h-1 rounded-full transition-spring"
                      style={{ width: `${file.uploadProgress}%` }}
                    ></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Submission Guidelines */}
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <h3 className="text-sm font-medium text-foreground mb-2 flex items-center space-x-2">
            <Icon name="Info" size={16} />
            <span>Submission Guidelines</span>
          </h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Include a README file with setup instructions</li>
            <li>• Provide a demo video (max 3 minutes)</li>
            <li>• Submit source code and any necessary documentation</li>
            <li>• Ensure your project runs without external dependencies</li>
            <li>• You can update your submission until the deadline</li>
          </ul>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <div className="text-sm text-muted-foreground">
            Deadline: July 15, 2025 at 11:59 PM
          </div>
          <Button
            variant="default"
            onClick={handleSubmit}
            disabled={!isFormValid || isSubmitting}
            loading={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Project'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProjectSubmissionPortal;
