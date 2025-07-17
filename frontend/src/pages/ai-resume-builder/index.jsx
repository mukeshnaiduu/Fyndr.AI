import React, { useState, useEffect } from 'react';

import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';
import MainLayout from 'components/layout/MainLayout';
import QuickActionsToolbar from 'components/ui/QuickActionsToolbar';

// Import components
import TemplateCarousel from './components/TemplateCarousel';
import OptimizationScore from './components/OptimizationScore';
import EditingPanel from './components/EditingPanel';
import LivePreview from './components/LivePreview';
import AISuggestionPanel from './components/AISuggestionPanel';
import ExportModal from './components/ExportModal';

const AIResumeBuilder = () => {
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isMobilePreview, setIsMobilePreview] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState('saved');
  const [resumeData, setResumeData] = useState({
    personal: {
      fullName: 'John Doe',
      title: 'Senior Software Engineer',
      email: 'john.doe@email.com',
      phone: '+1 (555) 123-4567',
      location: 'San Francisco, CA',
      summary: 'Experienced software engineer with 8+ years of expertise in full-stack development, specializing in React, Node.js, and cloud technologies. Proven track record of leading cross-functional teams and delivering scalable solutions that drive business growth.'
    },
    experience: [
      {
        title: 'Senior Software Engineer',
        company: 'TechCorp Inc.',
        startDate: '2021-03-01',
        endDate: '',
        current: true,
        description: 'Led development of microservices architecture serving 2M+ users daily. Implemented CI/CD pipelines reducing deployment time by 60%. Mentored junior developers and established coding standards across the engineering team.'
      },
      {
        title: 'Full Stack Developer',
        company: 'StartupXYZ',
        startDate: '2019-01-15',
        endDate: '2021-02-28',
        current: false,
        description: 'Built responsive web applications using React and Node.js. Collaborated with design team to implement pixel-perfect UI components. Optimized database queries resulting in 40% performance improvement.'
      }
    ],
    education: [
      {
        degree: 'Bachelor of Science',
        field: 'Computer Science',
        institution: 'University of California, Berkeley',
        year: '2018',
        gpa: '3.8/4.0'
      }
    ],
    skills: [
      'JavaScript', 'React.js', 'Node.js', 'Python', 'AWS', 'Docker', 'PostgreSQL', 'MongoDB', 'Git', 'Agile/Scrum'
    ]
  });

  // Auto-save functionality
  useEffect(() => {
    setAutoSaveStatus('saving');
    const saveTimer = setTimeout(() => {
      setAutoSaveStatus('saved');
    }, 1000);

    return () => clearTimeout(saveTimer);
  }, [resumeData]);

  const handleTemplateChange = (templateId) => {
    setSelectedTemplate(templateId);
  };

  const handleDataChange = (newData) => {
    setResumeData(newData);
  };

  const handleSave = async () => {
    setAutoSaveStatus('saving');
    // Simulate save operation
    await new Promise(resolve => setTimeout(resolve, 1000));
    setAutoSaveStatus('saved');
  };

  const handleExport = (exportConfig) => {
    console.log('Exporting resume with config:', exportConfig);
    // Implement export logic here
  };

  const handleAISuggestionAccept = (suggestion) => {
    console.log('Accepted suggestion:', suggestion);
    // Implement suggestion acceptance logic
  };

  const handleAISuggestionReject = (suggestion) => {
    console.log('Rejected suggestion:', suggestion);
    // Implement suggestion rejection logic
  };

  const getAutoSaveIcon = () => {
    switch (autoSaveStatus) {
      case 'saving': return 'Loader2';
      case 'saved': return 'Check';
      case 'error': return 'AlertCircle';
      default: return 'Save';
    }
  };

  const getAutoSaveColor = () => {
    switch (autoSaveStatus) {
      case 'saving': return 'text-warning';
      case 'saved': return 'text-success';
      case 'error': return 'text-error';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <MainLayout
      title="AI Resume Builder"
      description="Create professional resumes with AI assistance"
    >
      <div className="min-h-screen w-full bg-gradient-to-br from-pink-50 via-purple-50 to-cyan-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 flex flex-row items-stretch justify-stretch px-0 py-0">
        {/* Left Panel - Editing */}
        <div className={`${isMobilePreview ? 'hidden lg:flex' : 'flex'} flex-col w-full lg:w-1/2 border-r border-border bg-white dark:bg-gray-900 dark:text-gray-100 rounded-none shadow-none`}>
          {/* Top Section - Template & Score */}
          <div className="flex-shrink-0 p-6 border-b border-border bg-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">AI Resume Builder</h1>
                <div className="flex items-center space-x-2 text-sm">
                  <Icon
                    name={getAutoSaveIcon()}
                    size={16}
                    className={`${getAutoSaveColor()} ${autoSaveStatus === 'saving' ? 'animate-spin' : ''}`}
                  />
                  <span className={getAutoSaveColor()}>
                    {autoSaveStatus === 'saving' ? 'Saving...' :
                      autoSaveStatus === 'saved' ? 'All changes saved' :
                        autoSaveStatus === 'error' ? 'Save failed' : 'Auto-save enabled'}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAISuggestions(true)}
                  iconName="Sparkles"
                  iconPosition="left"
                >
                  AI Suggestions
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMobilePreview(!isMobilePreview)}
                  className="lg:hidden"
                >
                  <Icon name={isMobilePreview ? 'Edit' : 'Eye'} size={16} />
                </Button>
              </div>
            </div>

            <TemplateCarousel
              selectedTemplate={selectedTemplate}
              onTemplateChange={handleTemplateChange}
            />

            <OptimizationScore score={78} />

            <div className="mt-8">
              <div className="bg-card shadow-lg p-6">
                <EditingPanel
                  resumeData={resumeData}
                  onDataChange={handleDataChange}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Live Preview with merged QuickActionsToolbar */}
        <div className={`${isMobilePreview ? 'flex' : 'hidden lg:flex'} flex-col w-full lg:w-1/2 bg-white dark:bg-gray-900 dark:text-gray-100 rounded-none shadow-none`}>
          <div className="flex flex-col h-full justify-stretch items-stretch px-6 pt-6 pb-6">
            <div className="bg-card dark:bg-gray-950 shadow-lg w-full h-full flex flex-col">
              <div className="px-6 pt-6 pb-2">
                <QuickActionsToolbar
                  context="resume-builder"
                  onSave={handleSave}
                  onExport={() => setShowExportModal(true)}
                  onShare={() => console.log('Share resume')}
                />
              </div>
              <div className="flex-1 px-6 pb-6">
                <div className="bg-white text-gray-900 border border-border shadow-md w-full h-full">
                  <LivePreview
                    resumeData={resumeData}
                    selectedTemplate={selectedTemplate}
                    forceLightTheme={true}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Suggestion Panel */}
        <AISuggestionPanel
          isVisible={showAISuggestions}
          onClose={() => setShowAISuggestions(false)}
          onAccept={handleAISuggestionAccept}
          onReject={handleAISuggestionReject}
        />

        {/* Export Modal */}
        <ExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          onExport={handleExport}
        />

        {/* Mobile Toggle Button */}
        <div className="lg:hidden fixed bottom-20 right-4 z-30">
          <Button
            variant="default"
            size="icon"
            onClick={() => setIsMobilePreview(!isMobilePreview)}
            className="w-12 h-12 shadow-lg"
          >
            <Icon name={isMobilePreview ? 'Edit' : 'Eye'} size={20} />
          </Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default AIResumeBuilder;

