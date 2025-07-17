import React from 'react';
import { motion } from 'framer-motion';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';


const LivePreview = ({ resumeData, selectedTemplate }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const renderModernTemplate = () => (
    <div className="bg-muted text-gray-900 dark:bg-muted dark:text-gray-100 p-8 min-h-full rounded-card">
      {/* Header */}
      <div className="border-b-2 border-purple-500 pb-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {resumeData.personal?.fullName || 'Your Name'}
        </h1>
        <p className="text-lg text-purple-600 mb-4">
          {resumeData.personal?.title || 'Professional Title'}
        </p>
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          {resumeData.personal?.email && (
            <div className="flex items-center space-x-1">
              <Icon name="Mail" size={14} />
              <span>{resumeData.personal.email}</span>
            </div>
          )}
          {resumeData.personal?.phone && (
            <div className="flex items-center space-x-1">
              <Icon name="Phone" size={14} />
              <span>{resumeData.personal.phone}</span>
            </div>
          )}
          {resumeData.personal?.location && (
            <div className="flex items-center space-x-1">
              <Icon name="MapPin" size={14} />
              <span>{resumeData.personal.location}</span>
            </div>
          )}
        </div>
      </div>

      {/* Summary */}
      {resumeData.personal?.summary && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
            <Icon name="User" size={18} className="mr-2 text-purple-500" />
            Professional Summary
          </h2>
          <p className="text-gray-700 leading-relaxed">{resumeData.personal.summary}</p>
        </div>
      )}

      {/* Experience */}
      {resumeData.experience && resumeData.experience.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Icon name="Briefcase" size={18} className="mr-2 text-purple-500" />
            Work Experience
          </h2>
          <div className="space-y-4">
            {resumeData.experience.map((exp, index) => (
              <div key={index} className="border-l-2 border-purple-200 pl-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">{exp.title}</h3>
                    <p className="text-purple-600">{exp.company}</p>
                  </div>
                  <span className="text-sm text-gray-500">
                    {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                  </span>
                </div>
                {exp.description && (
                  <p className="text-gray-700 text-sm leading-relaxed">{exp.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {resumeData.education && resumeData.education.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Icon name="GraduationCap" size={18} className="mr-2 text-purple-500" />
            Education
          </h2>
          <div className="space-y-3">
            {resumeData.education.map((edu, index) => (
              <div key={index} className="border-l-2 border-purple-200 pl-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {edu.degree} {edu.field && `in ${edu.field}`}
                    </h3>
                    <p className="text-purple-600">{edu.institution}</p>
                    {edu.gpa && <p className="text-sm text-gray-600">GPA: {edu.gpa}</p>}
                  </div>
                  {edu.year && <span className="text-sm text-gray-500">{edu.year}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {resumeData.skills && resumeData.skills.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Icon name="Zap" size={18} className="mr-2 text-purple-500" />
            Skills
          </h2>
          <div className="flex flex-wrap gap-2">
            {resumeData.skills.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderClassicTemplate = () => (
    <div className="bg-muted text-gray-900 dark:bg-muted dark:text-gray-100 p-8 min-h-full rounded-card">
      {/* Header */}
      <div className="text-center border-b border-gray-300 pb-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {resumeData.personal?.fullName || 'Your Name'}
        </h1>
        <p className="text-lg text-gray-700 mb-3">
          {resumeData.personal?.title || 'Professional Title'}
        </p>
        <div className="flex justify-center space-x-6 text-sm text-gray-600">
          {resumeData.personal?.email && <span>{resumeData.personal.email}</span>}
          {resumeData.personal?.phone && <span>{resumeData.personal.phone}</span>}
          {resumeData.personal?.location && <span>{resumeData.personal.location}</span>}
        </div>
      </div>

      {/* Summary */}
      {resumeData.personal?.summary && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3 uppercase tracking-wide">
            Professional Summary
          </h2>
          <p className="text-gray-700 leading-relaxed">{resumeData.personal.summary}</p>
        </div>
      )}

      {/* Experience */}
      {resumeData.experience && resumeData.experience.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 uppercase tracking-wide">
            Professional Experience
          </h2>
          <div className="space-y-4">
            {resumeData.experience.map((exp, index) => (
              <div key={index}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-gray-900">{exp.title}</h3>
                    <p className="text-gray-700 italic">{exp.company}</p>
                  </div>
                  <span className="text-sm text-gray-600">
                    {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                  </span>
                </div>
                {exp.description && (
                  <p className="text-gray-700 text-sm leading-relaxed ml-4">{exp.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {resumeData.education && resumeData.education.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 uppercase tracking-wide">
            Education
          </h2>
          <div className="space-y-3">
            {resumeData.education.map((edu, index) => (
              <div key={index} className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-900">
                    {edu.degree} {edu.field && `in ${edu.field}`}
                  </h3>
                  <p className="text-gray-700 italic">{edu.institution}</p>
                  {edu.gpa && <p className="text-sm text-gray-600">GPA: {edu.gpa}</p>}
                </div>
                {edu.year && <span className="text-sm text-gray-600">{edu.year}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {resumeData.skills && resumeData.skills.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 uppercase tracking-wide">
            Skills
          </h2>
          <p className="text-gray-700">{resumeData.skills.join(' • ')}</p>
        </div>
      )}
    </div>
  );

  const renderTemplate = () => {
    switch (selectedTemplate) {
      case 'classic':
        return renderClassicTemplate();
      case 'modern':
      default:
        return renderModernTemplate();
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Preview Header */}
      <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-border bg-card">
        <h3 className="font-semibold text-foreground">Live Preview</h3>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm">
            <Icon name="ZoomIn" size={16} />
          </Button>
          <Button variant="ghost" size="sm">
            <Icon name="ZoomOut" size={16} />
          </Button>
          <Button variant="ghost" size="sm">
            <Icon name="Maximize2" size={16} />
          </Button>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 overflow-y-auto bg-gray-100 p-4">
        <motion.div
          key={selectedTemplate}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="max-w-[8.5in] mx-auto bg-white shadow-lg rounded-lg overflow-hidden"
          style={{ minHeight: '11in' }}
        >
          {renderTemplate()}
        </motion.div>
      </div>
    </div>
  );
};

export default LivePreview;
