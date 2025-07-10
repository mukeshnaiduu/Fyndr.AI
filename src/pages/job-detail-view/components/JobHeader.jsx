import React, { useState } from 'react';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';

const JobHeader = ({ jobData, onBookmark, onShare, onApply }) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    onBookmark(!isBookmarked);
  };

  const shareOptions = [
    { label: 'LinkedIn', icon: 'Linkedin', url: `https://linkedin.com/sharing/share-offsite/?url=${window.location.href}` },
    { label: 'Twitter', icon: 'Twitter', url: `https://twitter.com/intent/tweet?url=${window.location.href}` },
    { label: 'Email', icon: 'Mail', url: `mailto:?subject=${jobData.title}&body=Check out this job: ${window.location.href}` },
    { label: 'Copy Link', icon: 'Link', action: () => navigator.clipboard.writeText(window.location.href) }
  ];

  return (
    <div className="sticky top-16 z-30 glass-card border-b border-glass-border">
      <div className="px-4 lg:px-6 py-4">
        {/* Mobile Header */}
        <div className="flex items-center justify-between lg:hidden">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
              <Icon name="ArrowLeft" size={20} />
            </Button>
            <div>
              <h1 className="font-heading font-semibold text-lg text-foreground truncate">
                {jobData.title}
              </h1>
              <p className="text-sm text-muted-foreground">{jobData.company}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={handleBookmark}>
              <Icon 
                name={isBookmarked ? "BookmarkCheck" : "Bookmark"} 
                size={20} 
                className={isBookmarked ? "text-primary" : ""} 
              />
            </Button>
            <div className="relative">
              <Button variant="ghost" size="icon" onClick={() => setIsShareOpen(!isShareOpen)}>
                <Icon name="Share2" size={20} />
              </Button>
              {isShareOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 glass-card border border-glass-border rounded-card shadow-glass z-50">
                  <div className="p-2">
                    {shareOptions.map((option) => (
                      <button
                        key={option.label}
                        onClick={() => {
                          if (option.action) {
                            option.action();
                          } else {
                            window.open(option.url, '_blank');
                          }
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
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-gradient-primary rounded-card flex items-center justify-center">
              <Icon name="Building" size={24} color="white" />
            </div>
            <div>
              <h1 className="font-heading font-bold text-2xl text-foreground mb-1">
                {jobData.title}
              </h1>
              <p className="text-lg text-muted-foreground mb-2">{jobData.company}</p>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Icon name="MapPin" size={16} />
                  <span>{jobData.location}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Icon name="Clock" size={16} />
                  <span>{jobData.type}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Icon name="DollarSign" size={16} />
                  <span>{jobData.salary}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={handleBookmark}>
              <Icon 
                name={isBookmarked ? "BookmarkCheck" : "Bookmark"} 
                size={16} 
                className={isBookmarked ? "text-primary" : ""} 
              />
              {isBookmarked ? "Bookmarked" : "Bookmark"}
            </Button>
            <div className="relative">
              <Button variant="outline" onClick={() => setIsShareOpen(!isShareOpen)}>
                <Icon name="Share2" size={16} />
                Share
              </Button>
              {isShareOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 glass-card border border-glass-border rounded-card shadow-glass z-50">
                  <div className="p-2">
                    {shareOptions.map((option) => (
                      <button
                        key={option.label}
                        onClick={() => {
                          if (option.action) {
                            option.action();
                          } else {
                            window.open(option.url, '_blank');
                          }
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
            <Button onClick={onApply} className="px-6">
              <Icon name="Send" size={16} />
              Apply Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobHeader;
