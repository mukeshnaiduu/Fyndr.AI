import React, { useState } from 'react';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';
import Select from 'components/ui/Select';

const ConversationExport = ({ conversation, onExport, className = '' }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState('pdf');
  const [showExportModal, setShowExportModal] = useState(false);

  const exportFormats = [
    { value: 'pdf', label: 'PDF Document', description: 'Formatted document with styling' },
    { value: 'txt', label: 'Plain Text', description: 'Simple text file' },
    { value: 'json', label: 'JSON Data', description: 'Structured data format' },
    { value: 'email', label: 'Email Summary', description: 'Send to your email' }
  ];

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const exportData = {
        conversationId: conversation.id,
        title: conversation.title,
        format: exportFormat,
        timestamp: new Date().toISOString(),
        messages: conversation.messages
      };
      
      await onExport(exportData);
      setShowExportModal(false);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const getFormatIcon = (format) => {
    const icons = {
      pdf: 'FileText',
      txt: 'File',
      json: 'Code',
      email: 'Mail'
    };
    return icons[format] || 'Download';
  };

  return (
    <div className={className}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowExportModal(true)}
        iconName="Download"
        iconPosition="left"
        className="hover:bg-white/10"
      >
        Export
      </Button>

      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glassmorphic-card p-6 rounded-2xl max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Export Conversation</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowExportModal(false)}
                className="hover:bg-white/10"
              >
                <Icon name="X" size={18} />
              </Button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-3">
                Export "{conversation.title}" in your preferred format
              </p>
              
              <Select
                label="Export Format"
                options={exportFormats}
                value={exportFormat}
                onChange={setExportFormat}
              />
            </div>

            <div className="glassmorphic-surface p-3 rounded-lg mb-4">
              <div className="flex items-center space-x-2 mb-2">
                <Icon name={getFormatIcon(exportFormat)} size={16} className="text-primary" />
                <span className="text-sm font-medium text-foreground">
                  {exportFormats.find(f => f.value === exportFormat)?.label}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {exportFormats.find(f => f.value === exportFormat)?.description}
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="default"
                onClick={handleExport}
                disabled={isExporting}
                loading={isExporting}
                className="flex-1"
              >
                {isExporting ? 'Exporting...' : 'Export'}
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowExportModal(false)}
                disabled={isExporting}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConversationExport;
