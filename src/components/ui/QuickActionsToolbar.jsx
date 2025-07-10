import React, { useState } from 'react';
import Icon from '../AppIcon';
import Button from './Button';

const QuickActionsToolbar = ({ 
  context = 'job-detail', // job-detail, resume-builder, dashboard
  jobData = null,
  onBookmark = () => {},
  onShare = () => {},
  onApply = () => {},
  onExport = () => {},
  onSave = () => {},
  className = ''
}) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isLoading, setIsLoading] = useState({});

  const handleAction = async (actionType, callback) => {
    setIsLoading(prev => ({ ...prev, [actionType]: true }));
    
    try {
      await callback();
      
      // Handle specific action feedback
      if (actionType === 'bookmark') {
        setIsBookmarked(!isBookmarked);
      }
    } catch (error) {
      console.error(`Error in ${actionType}:`, error);
    } finally {
      setIsLoading(prev => ({ ...prev, [actionType]: false }));
    }
  };

  const shareOptions = [
    { label: 'Copy Link', icon: 'Link', action: () => navigator.clipboard.writeText(window.location.href) },
    { label: 'Email', icon: 'Mail', action: () => window.open(`mailto:?subject=Check this out&body=${window.location.href}`) },
    { label: 'LinkedIn', icon: 'Linkedin', action: () => window.open(`https://linkedin.com/sharing/share-offsite/?url=${window.location.href}`) },
    { label: 'Twitter', icon: 'Twitter', action: () => window.open(`https://twitter.com/intent/tweet?url=${window.location.href}`) }
  ];

  const getContextActions = () => {
    switch (context) {
      case 'job-detail':
        return [
          {
            key: 'bookmark',
            label: isBookmarked ? 'Bookmarked' : 'Bookmark',
            icon: isBookmarked ? 'BookmarkCheck' : 'Bookmark',
            variant: isBookmarked ? 'default' : 'outline',
            action: () => handleAction('bookmark', onBookmark),
            loading: isLoading.bookmark
          },
          {
            key: 'share',
            label: 'Share',
            icon: 'Share2',
            variant: 'outline',
            action: () => setIsShareOpen(!isShareOpen),
            loading: false
          },
          {
            key: 'apply',
            label: 'Apply Now',
            icon: 'Send',
            variant: 'default',
            action: () => handleAction('apply', onApply),
            loading: isLoading.apply,
            primary: true
          }
        ];

      case 'resume-builder':
        return [
          {
            key: 'save',
            label: 'Save Draft',
            icon: 'Save',
            variant: 'outline',
            action: () => handleAction('save', onSave),
            loading: isLoading.save
          },
          {
            key: 'export',
            label: 'Export PDF',
            icon: 'Download',
            variant: 'outline',
            action: () => handleAction('export', onExport),
            loading: isLoading.export
          },
          {
            key: 'share',
            label: 'Share Resume',
            icon: 'Share2',
            variant: 'outline',
            action: () => setIsShareOpen(!isShareOpen),
            loading: false
          }
        ];

      case 'dashboard':
        return [
          {
            key: 'refresh',
            label: 'Refresh',
            icon: 'RefreshCw',
            variant: 'outline',
            action: () => window.location.reload(),
            loading: false
          },
          {
            key: 'filter',
            label: 'Filters',
            icon: 'Filter',
            variant: 'outline',
            action: () => {},
            loading: false
          }
        ];

      default:
        return [];
    }
  };

  const actions = getContextActions();

  return (
    <>
      {/* Desktop Toolbar */}
      <div className={`hidden lg:flex items-center justify-end space-x-3 p-4 bg-card border-t border-border ${className}`}>
        {actions.map((action) => (
          <div key={action.key} className="relative">
            <Button
              variant={action.variant}
              size={action.primary ? 'default' : 'sm'}
              loading={action.loading}
              onClick={action.action}
              iconName={action.icon}
              iconPosition="left"
              className={action.primary ? 'px-6' : ''}
            >
              {action.label}
            </Button>

            {/* Share Dropdown */}
            {action.key === 'share' && isShareOpen && (
              <div className="absolute bottom-full right-0 mb-2 w-48 glass-card border border-glass-border rounded-card shadow-glass z-50">
                <div className="p-2">
                  {shareOptions.map((option) => (
                    <button
                      key={option.label}
                      onClick={() => {
                        option.action();
                        setIsShareOpen(false);
                      }}
                      className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-left hover:bg-muted rounded transition-colors"
                    >
                      <Icon name={option.icon} size={16} />
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Mobile Bottom Sheet */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 glass-card border-t border-glass-border">
        <div className="flex items-center justify-around p-4 space-x-2">
          {actions.map((action) => (
            <div key={action.key} className="relative flex-1">
              <Button
                variant={action.variant}
                size="sm"
                loading={action.loading}
                onClick={action.action}
                fullWidth
                iconName={action.icon}
                iconPosition="left"
                className={`${action.primary ? 'bg-primary text-primary-foreground' : ''}`}
              >
                <span className="hidden sm:inline">{action.label}</span>
                <span className="sm:hidden">
                  <Icon name={action.icon} size={16} />
                </span>
              </Button>

              {/* Mobile Share Dropdown */}
              {action.key === 'share' && isShareOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-2 glass-card border border-glass-border rounded-card shadow-glass">
                  <div className="p-2">
                    {shareOptions.map((option) => (
                      <button
                        key={option.label}
                        onClick={() => {
                          option.action();
                          setIsShareOpen(false);
                        }}
                        className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm hover:bg-muted rounded transition-colors"
                      >
                        <Icon name={option.icon} size={16} />
                        <span>{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Overlay for mobile share */}
      {isShareOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/20 z-40"
          onClick={() => setIsShareOpen(false)}
        />
      )}
    </>
  );
};

export default QuickActionsToolbar;
