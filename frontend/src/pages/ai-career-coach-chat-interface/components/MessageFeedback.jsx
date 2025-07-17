import React, { useState } from 'react';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';
import Input from 'components/ui/Input';

const MessageFeedback = ({ messageId, onFeedbackSubmit, className = '' }) => {
  const [showFeedback, setShowFeedback] = useState(false);
  const [rating, setRating] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRating = async (ratingValue) => {
    setRating(ratingValue);
    
    if (ratingValue === 'positive') {
      // For positive feedback, submit immediately
      setIsSubmitting(true);
      await onFeedbackSubmit(messageId, { rating: ratingValue });
      setIsSubmitting(false);
      setShowFeedback(false);
    } else {
      // For negative feedback, show detailed feedback form
      setShowFeedback(true);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!rating) return;
    
    setIsSubmitting(true);
    await onFeedbackSubmit(messageId, {
      rating,
      feedback: feedbackText,
      timestamp: new Date().toISOString()
    });
    setIsSubmitting(false);
    setShowFeedback(false);
    setFeedbackText('');
    setRating(null);
  };

  const handleCancel = () => {
    setShowFeedback(false);
    setFeedbackText('');
    setRating(null);
  };

  return (
    <div className={`${className}`}>
      {!showFeedback ? (
        <div className="flex items-center space-x-2 mt-2">
          <span className="text-xs text-muted-foreground">Was this helpful?</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleRating('positive')}
            disabled={isSubmitting}
            className="h-6 w-6 hover:bg-success/20 hover:text-success"
          >
            <Icon name="ThumbsUp" size={12} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleRating('negative')}
            disabled={isSubmitting}
            className="h-6 w-6 hover:bg-error/20 hover:text-error"
          >
            <Icon name="ThumbsDown" size={12} />
          </Button>
        </div>
      ) : (
        <div className="mt-3 p-3 glassmorphic-surface rounded-lg">
          <div className="flex items-center space-x-2 mb-3">
            <Icon name="MessageSquare" size={16} className="text-primary" />
            <span className="text-sm font-medium text-foreground">Help us improve</span>
          </div>
          
          <Input
            type="text"
            placeholder="What could be better about this response?"
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            className="mb-3"
          />
          
          <div className="flex items-center space-x-2">
            <Button
              variant="default"
              size="sm"
              onClick={handleSubmitFeedback}
              disabled={isSubmitting || !feedbackText.trim()}
              loading={isSubmitting}
            >
              Submit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageFeedback;
