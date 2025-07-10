import React, { useState } from 'react';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';

const ApplyButton = ({ onApply, isApplied = false, applicationDeadline }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleApply = async () => {
    setIsLoading(true);
    try {
      await onApply();
      setShowConfirmation(true);
      setTimeout(() => setShowConfirmation(false), 3000);
    } catch (error) {
      console.error('Application failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDaysUntilDeadline = () => {
    const deadline = new Date(applicationDeadline);
    const today = new Date();
    const diffTime = deadline - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysLeft = getDaysUntilDeadline();

  if (showConfirmation) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 glass-card border-t border-glass-border p-4">
        <div className="flex items-center justify-center space-x-3 text-success">
          <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center">
            <Icon name="Check" size={16} color="white" />
          </div>
          <div>
            <p className="font-medium">Application Submitted!</p>
            <p className="text-sm text-muted-foreground">We'll notify you about updates</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 glass-card border-t border-glass-border">
      <div className="px-4 py-4">
        {/* Application Deadline Warning */}
        {daysLeft <= 7 && daysLeft > 0 && (
          <div className="mb-3 p-3 bg-warning/10 border border-warning/20 rounded-card">
            <div className="flex items-center space-x-2">
              <Icon name="Clock" size={16} className="text-warning" />
              <span className="text-sm font-medium text-warning">
                Application closes in {daysLeft} day{daysLeft !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        )}

        {/* Apply Button */}
        <div className="flex items-center space-x-3">
          {isApplied ? (
            <div className="flex-1 flex items-center justify-center space-x-2 py-3 bg-success/10 text-success rounded-card">
              <Icon name="CheckCircle" size={16} />
              <span className="font-medium">Applied</span>
            </div>
          ) : (
            <Button
              onClick={handleApply}
              loading={isLoading}
              disabled={daysLeft <= 0}
              className="flex-1 py-3 text-base font-semibold"
            >
              <Icon name="Send" size={16} />
              {daysLeft <= 0 ? 'Application Closed' : 'Apply Now'}
            </Button>
          )}
          
          <Button variant="outline" size="icon" className="w-12 h-12">
            <Icon name="Share2" size={16} />
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center justify-center space-x-6 mt-3 text-xs text-muted-foreground">
          <button className="flex items-center space-x-1 hover:text-foreground transition-colors">
            <Icon name="Bookmark" size={12} />
            <span>Save for later</span>
          </button>
          <button className="flex items-center space-x-1 hover:text-foreground transition-colors">
            <Icon name="MessageCircle" size={12} />
            <span>Ask questions</span>
          </button>
          <button className="flex items-center space-x-1 hover:text-foreground transition-colors">
            <Icon name="Flag" size={12} />
            <span>Report job</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplyButton;
