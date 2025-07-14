import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';

const ResumeUploadStep = ({ data, onUpdate, onNext, onPrev }) => {
  const [uploadedFile, setUploadedFile] = useState(data.resume || null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const allowedTypes = ['.pdf', '.doc', '.docx'];
  const maxFileSize = 10 * 1024 * 1024; // 10MB

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleFileUpload = async (file) => {
    setError('');

    // Validate file type
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowedTypes.includes(fileExtension)) {
      setError('Please upload a PDF, DOC, or DOCX file');
      return;
    }

    // Validate file size
    if (file.size > maxFileSize) {
      setError('File size must be less than 10MB');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + Math.random() * 20;
      });
    }, 200);

    // Simulate upload delay
    setTimeout(() => {
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      const fileData = {
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
        url: URL.createObjectURL(file) // In real app, this would be server URL
      };
      
      setUploadedFile(fileData);
      setIsUploading(false);
      
      // Trigger sparkle animation
      setTimeout(() => {
        setUploadProgress(0);
      }, 1000);
    }, 2000);
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setUploadProgress(0);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleNext = () => {
    onUpdate({ resume: uploadedFile });
    onNext();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Upload your resume
        </h2>
        <p className="text-muted-foreground">
          Our AI will analyze your resume to better match you with relevant opportunities
        </p>
      </div>

      {/* Upload Area */}
      <div className="max-w-2xl mx-auto">
        {!uploadedFile ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-card p-8 text-center transition-all duration-300 ${
              isDragging
                ? 'border-primary bg-primary/5 scale-105' :'border-border hover:border-primary/50 hover:bg-muted/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileSelect}
              className="hidden"
            />

            <div className="space-y-4">
              <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-primary flex items-center justify-center transition-transform duration-300 ${
                isDragging ? 'scale-110' : ''
              }`}>
                <Icon name="Upload" size={24} color="white" />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {isDragging ? 'Drop your resume here' : 'Drag & drop your resume'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  or click to browse your files
                </p>
                
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  iconName="FileText"
                  iconPosition="left"
                >
                  Choose File
                </Button>
              </div>

              <div className="text-xs text-muted-foreground space-y-1">
                <p>Supported formats: PDF, DOC, DOCX</p>
                <p>Maximum file size: 10MB</p>
              </div>
            </div>

            {isDragging && (
              <div className="absolute inset-0 bg-primary/10 rounded-card flex items-center justify-center">
                <div className="text-primary font-medium">
                  <Icon name="Download" size={32} className="mx-auto mb-2" />
                  Drop to upload
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="glass-card p-6 rounded-card">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-success/10 rounded-card flex items-center justify-center flex-shrink-0">
                <Icon name="FileCheck" size={20} className="text-success" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground mb-1">
                  {uploadedFile.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {formatFileSize(uploadedFile.size)} • Uploaded successfully
                </p>
                
                <div className="flex items-center space-x-2 text-sm text-success">
                  <Icon name="CheckCircle" size={16} />
                  <span>Resume analyzed and processed</span>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveFile}
                iconName="X"
              >
                Remove
              </Button>
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {isUploading && (
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Uploading...</span>
              <span className="text-primary font-medium">{Math.round(uploadProgress)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-error/10 border border-error/20 rounded-card flex items-center space-x-2 text-error">
            <Icon name="AlertCircle" size={16} />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* AI Analysis Preview */}
        {uploadedFile && (
          <div className="mt-6 p-4 bg-accent/5 border border-accent/20 rounded-card">
            <div className="flex items-center space-x-2 mb-3">
              <Icon name="Sparkles" size={16} className="text-accent" />
              <span className="text-sm font-medium text-accent">AI Analysis Complete</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Skills Detected</p>
                <p className="font-medium text-foreground">12 technical skills</p>
              </div>
              <div>
                <p className="text-muted-foreground">Experience Level</p>
                <p className="font-medium text-foreground">Mid-level (3-5 years)</p>
              </div>
              <div>
                <p className="text-muted-foreground">Match Readiness</p>
                <p className="font-medium text-success">85% Ready</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Skip Option */}
      <div className="text-center">
        <button
          onClick={handleNext}
          className="text-muted-foreground hover:text-foreground transition-colors text-sm"
        >
          Skip for now - I'll add this later
        </button>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button
          variant="outline"
          onClick={onPrev}
          iconName="ArrowLeft"
          iconPosition="left"
        >
          Previous
        </Button>
        
        <Button
          onClick={handleNext}
          iconName="ArrowRight"
          iconPosition="right"
          size="lg"
          className="font-semibold"
        >
          Next Step
        </Button>
      </div>
    </motion.div>
  );
};

export default ResumeUploadStep;
