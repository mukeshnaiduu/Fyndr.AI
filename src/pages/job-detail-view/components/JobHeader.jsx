import React, { useState } from 'react';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';

const JobHeader = ({ jobData, onBookmark, onShare, onApply, jobHeaderTop }) => {
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

  // Use fixed positioning when header is at top (navbar closed)
  const isAtTop = jobHeaderTop === 'top-0';
  return (
    <div className={`${isAtTop ? 'fixed top-10000 left-0 w-full z-[1050] bg-background' : `sticky ${jobHeaderTop} z-50 glass-card border-b border-glass-border`} mb-16`}>
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
            <Button className="ml-2 bg-primary text-primary-foreground px-4 py-2 rounded-none font-semibold flex items-center gap-2" onClick={onApply}>
              <Icon name="Send" size={16} />
              <span>Apply Now</span>
            </Button>
            <Button variant="ghost" className="ml-2">
              <Icon name="MessageSquare" size={16} /> Ask questions
            </Button>
            <Button variant="ghost" className="ml-2">
              <Icon name="Flag" size={16} /> Report job
            </Button>
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
            <Button className="ml-2 bg-primary text-primary-foreground px-4 py-2 rounded-none font-semibold flex items-center gap-2" onClick={onApply}>
              <Icon name="Send" size={16} />
              <span>Apply Now</span>
            </Button>
            <Button variant="ghost" className="ml-2">
              <Icon name="MessageSquare" size={16} /> Ask questions
            </Button>
            <Button variant="ghost" className="ml-2">
              <Icon name="Flag" size={16} /> Report job
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default JobHeader;
