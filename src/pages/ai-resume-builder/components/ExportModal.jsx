import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';
import { Checkbox } from 'components/ui/Checkbox';

const ExportModal = ({ isOpen, onClose, onExport }) => {
  const [exportFormat, setExportFormat] = useState('pdf');
  const [exportOptions, setExportOptions] = useState({
    includePhoto: false,
    includeReferences: false,
    optimizeForATS: true,
    includePortfolio: false
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const formatOptions = [
    {
      id: 'pdf',
      name: 'PDF',
      description: 'Best for applications and printing',
      icon: 'FileText',
      recommended: true
    },
    {
      id: 'docx',
      name: 'Word Document',
      description: 'Editable format for further customization',
      icon: 'File',
      recommended: false
    },
    {
      id: 'html',
      name: 'Web Page',
      description: 'For online portfolios and sharing',
      icon: 'Globe',
      recommended: false
    }
  ];

  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress(0);

    // Simulate export progress
    const progressInterval = setInterval(() => {
      setExportProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      onExport({
        format: exportFormat,
        options: exportOptions
      });

      // Show success state briefly
      setTimeout(() => {
        setIsExporting(false);
        setExportProgress(0);
        onClose();
      }, 1000);
    } catch (error) {
      console.error('Export failed:', error);
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const handleOptionChange = (option, checked) => {
    setExportOptions(prev => ({
      ...prev,
      [option]: checked
    }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="glass-card border border-glass-border rounded-card w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-glass-border">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                    <Icon name="Download" size={16} color="white" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Export Resume</h3>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <Icon name="X" size={20} />
                </Button>
              </div>

              {/* Content */}
              <div className="p-6">
                {!isExporting ? (
                  <>
                    {/* Format Selection */}
                    <div className="mb-6">
                      <h4 className="font-medium text-foreground mb-3">Choose Format</h4>
                      <div className="space-y-2">
                        {formatOptions.map((format) => (
                          <label
                            key={format.id}
                            className={`flex items-center space-x-3 p-3 rounded-card border cursor-pointer transition-all duration-200 hover-lift ${
                              exportFormat === format.id
                                ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50'
                            }`}
                          >
                            <input
                              type="radio"
                              name="format"
                              value={format.id}
                              checked={exportFormat === format.id}
                              onChange={(e) => setExportFormat(e.target.value)}
                              className="sr-only"
                            />
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              exportFormat === format.id ? 'bg-primary' : 'bg-muted'
                            }`}>
                              <Icon 
                                name={format.icon} 
                                size={18} 
                                color={exportFormat === format.id ? 'white' : 'currentColor'}
                              />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-foreground">{format.name}</span>
                                {format.recommended && (
                                  <span className="px-2 py-0.5 bg-success/10 text-success text-xs rounded-full">
                                    Recommended
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">{format.description}</p>
                            </div>
                            {exportFormat === format.id && (
                              <Icon name="Check" size={20} className="text-primary" />
                            )}
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Export Options */}
                    <div className="mb-6">
                      <h4 className="font-medium text-foreground mb-3">Export Options</h4>
                      <div className="space-y-3">
                        <Checkbox
                          label="Optimize for ATS (Applicant Tracking Systems)"
                          description="Ensures better compatibility with automated screening"
                          checked={exportOptions.optimizeForATS}
                          onChange={(e) => handleOptionChange('optimizeForATS', e.target.checked)}
                        />
                        <Checkbox
                          label="Include profile photo"
                          description="Add your profile picture to the resume"
                          checked={exportOptions.includePhoto}
                          onChange={(e) => handleOptionChange('includePhoto', e.target.checked)}
                        />
                        <Checkbox
                          label="Include references section"
                          description="Add references or 'Available upon request'"
                          checked={exportOptions.includeReferences}
                          onChange={(e) => handleOptionChange('includeReferences', e.target.checked)}
                        />
                        <Checkbox
                          label="Include portfolio links"
                          description="Add links to your work samples and projects"
                          checked={exportOptions.includePortfolio}
                          onChange={(e) => handleOptionChange('includePortfolio', e.target.checked)}
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  /* Export Progress */
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon name="Download" size={24} color="white" />
                    </div>
                    <h4 className="text-lg font-semibold text-foreground mb-2">
                      Exporting Resume...
                    </h4>
                    <p className="text-sm text-muted-foreground mb-6">
                      Please wait while we prepare your {exportFormat.toUpperCase()} file
                    </p>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-muted rounded-full h-2 mb-2">
                      <motion.div
                        className="bg-gradient-primary h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${exportProgress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground">{exportProgress}%</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              {!isExporting && (
                <div className="flex items-center justify-end space-x-3 p-6 border-t border-glass-border">
                  <Button variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button
                    variant="default"
                    onClick={handleExport}
                    iconName="Download"
                    iconPosition="left"
                  >
                    Export {exportFormat.toUpperCase()}
                  </Button>
                </div>
              )}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ExportModal;
