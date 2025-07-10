import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';
import Input from 'components/ui/Input';
import { Checkbox } from 'components/ui/Checkbox';

const EditingPanel = ({ resumeData, onDataChange, onSectionReorder }) => {
  const [activeSection, setActiveSection] = useState('personal');
  const [draggedItem, setDraggedItem] = useState(null);

  const sections = [
    { id: 'personal', label: 'Personal Information', icon: 'User', required: true },
    { id: 'experience', label: 'Work Experience', icon: 'Briefcase', required: true },
    { id: 'education', label: 'Education', icon: 'GraduationCap', required: true },
    { id: 'skills', label: 'Skills', icon: 'Zap', required: false },
    { id: 'achievements', label: 'Achievements', icon: 'Award', required: false },
    { id: 'certifications', label: 'Certifications', icon: 'Certificate', required: false }
  ];

  const handleInputChange = (section, field, value) => {
    onDataChange({
      ...resumeData,
      [section]: {
        ...resumeData[section],
        [field]: value
      }
    });
  };

  const handleArrayChange = (section, index, field, value) => {
    const updatedArray = [...(resumeData[section] || [])];
    updatedArray[index] = {
      ...updatedArray[index],
      [field]: value
    };
    onDataChange({
      ...resumeData,
      [section]: updatedArray
    });
  };

  const addArrayItem = (section, template) => {
    const updatedArray = [...(resumeData[section] || []), template];
    onDataChange({
      ...resumeData,
      [section]: updatedArray
    });
  };

  const removeArrayItem = (section, index) => {
    const updatedArray = (resumeData[section] || []).filter((_, i) => i !== index);
    onDataChange({
      ...resumeData,
      [section]: updatedArray
    });
  };

  const renderPersonalSection = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Full Name"
          type="text"
          value={resumeData.personal?.fullName || ''}
          onChange={(e) => handleInputChange('personal', 'fullName', e.target.value)}
          required
        />
        <Input
          label="Professional Title"
          type="text"
          value={resumeData.personal?.title || ''}
          onChange={(e) => handleInputChange('personal', 'title', e.target.value)}
          placeholder="e.g., Senior Software Engineer"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Email"
          type="email"
          value={resumeData.personal?.email || ''}
          onChange={(e) => handleInputChange('personal', 'email', e.target.value)}
          required
        />
        <Input
          label="Phone"
          type="tel"
          value={resumeData.personal?.phone || ''}
          onChange={(e) => handleInputChange('personal', 'phone', e.target.value)}
        />
      </div>

      <Input
        label="Location"
        type="text"
        value={resumeData.personal?.location || ''}
        onChange={(e) => handleInputChange('personal', 'location', e.target.value)}
        placeholder="City, State"
      />

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Professional Summary
        </label>
        <textarea
          value={resumeData.personal?.summary || ''}
          onChange={(e) => handleInputChange('personal', 'summary', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 bg-background border border-border rounded-card text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          placeholder="Brief overview of your professional background and key achievements..."
        />
      </div>
    </div>
  );

  const renderExperienceSection = () => (
    <div className="space-y-6">
      {(resumeData.experience || []).map((exp, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-muted rounded-card border border-border"
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-foreground">Experience {index + 1}</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeArrayItem('experience', index)}
            >
              <Icon name="Trash2" size={16} />
            </Button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Job Title"
                type="text"
                value={exp.title || ''}
                onChange={(e) => handleArrayChange('experience', index, 'title', e.target.value)}
                required
              />
              <Input
                label="Company"
                type="text"
                value={exp.company || ''}
                onChange={(e) => handleArrayChange('experience', index, 'company', e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Start Date"
                type="date"
                value={exp.startDate || ''}
                onChange={(e) => handleArrayChange('experience', index, 'startDate', e.target.value)}
              />
              <Input
                label="End Date"
                type="date"
                value={exp.endDate || ''}
                onChange={(e) => handleArrayChange('experience', index, 'endDate', e.target.value)}
                disabled={exp.current}
              />
            </div>

            <Checkbox
              label="I currently work here"
              checked={exp.current || false}
              onChange={(e) => handleArrayChange('experience', index, 'current', e.target.checked)}
            />

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Description
              </label>
              <textarea
                value={exp.description || ''}
                onChange={(e) => handleArrayChange('experience', index, 'description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-background border border-border rounded-card text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                placeholder="Describe your key responsibilities and achievements..."
              />
            </div>
          </div>
        </motion.div>
      ))}

      <Button
        variant="outline"
        onClick={() => addArrayItem('experience', {
          title: '',
          company: '',
          startDate: '',
          endDate: '',
          current: false,
          description: ''
        })}
        iconName="Plus"
        iconPosition="left"
        fullWidth
      >
        Add Experience
      </Button>
    </div>
  );

  const renderEducationSection = () => (
    <div className="space-y-6">
      {(resumeData.education || []).map((edu, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-muted rounded-card border border-border"
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-foreground">Education {index + 1}</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeArrayItem('education', index)}
            >
              <Icon name="Trash2" size={16} />
            </Button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Degree"
                type="text"
                value={edu.degree || ''}
                onChange={(e) => handleArrayChange('education', index, 'degree', e.target.value)}
                placeholder="e.g., Bachelor of Science"
                required
              />
              <Input
                label="Field of Study"
                type="text"
                value={edu.field || ''}
                onChange={(e) => handleArrayChange('education', index, 'field', e.target.value)}
                placeholder="e.g., Computer Science"
              />
            </div>

            <Input
              label="Institution"
              type="text"
              value={edu.institution || ''}
              onChange={(e) => handleArrayChange('education', index, 'institution', e.target.value)}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Graduation Year"
                type="number"
                value={edu.year || ''}
                onChange={(e) => handleArrayChange('education', index, 'year', e.target.value)}
              />
              <Input
                label="GPA (Optional)"
                type="text"
                value={edu.gpa || ''}
                onChange={(e) => handleArrayChange('education', index, 'gpa', e.target.value)}
                placeholder="3.8/4.0"
              />
            </div>
          </div>
        </motion.div>
      ))}

      <Button
        variant="outline"
        onClick={() => addArrayItem('education', {
          degree: '',
          field: '',
          institution: '',
          year: '',
          gpa: ''
        })}
        iconName="Plus"
        iconPosition="left"
        fullWidth
      >
        Add Education
      </Button>
    </div>
  );

  const renderSkillsSection = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Skills (comma-separated)
        </label>
        <textarea
          value={(resumeData.skills || []).join(', ')}
          onChange={(e) => onDataChange({
            ...resumeData,
            skills: e.target.value.split(',').map(skill => skill.trim()).filter(Boolean)
          })}
          rows={4}
          className="w-full px-3 py-2 bg-background border border-border rounded-card text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          placeholder="JavaScript, React, Node.js, Python, SQL..."
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {(resumeData.skills || []).map((skill, index) => (
          <span
            key={index}
            className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm flex items-center space-x-1"
          >
            <span>{skill}</span>
            <button
              onClick={() => {
                const updatedSkills = resumeData.skills.filter((_, i) => i !== index);
                onDataChange({ ...resumeData, skills: updatedSkills });
              }}
              className="hover:bg-primary/20 rounded-full p-0.5"
            >
              <Icon name="X" size={12} />
            </button>
          </span>
        ))}
      </div>
    </div>
  );

  const renderSection = () => {
    switch (activeSection) {
      case 'personal':
        return renderPersonalSection();
      case 'experience':
        return renderExperienceSection();
      case 'education':
        return renderEducationSection();
      case 'skills':
        return renderSkillsSection();
      default:
        return <div className="text-center text-muted-foreground py-8">Section coming soon...</div>;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Section Navigation */}
      <div className="flex-shrink-0 border-b border-border mb-6">
        <div className="flex space-x-1 overflow-x-auto pb-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-card text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                activeSection === section.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Icon name={section.icon} size={16} />
              <span>{section.label}</span>
              {section.required && (
                <span className="text-xs text-error">*</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Section Content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderSection()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default EditingPanel;
