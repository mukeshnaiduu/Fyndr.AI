import React, { useState } from 'react';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';
import Input from 'components/ui/Input';

const SessionFeedback = ({ isVisible, onClose, onSubmit, sessionData }) => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [improvements, setImprovements] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const improvementAreas = [
    { id: 'communication', label: 'Communication Skills', icon: 'MessageSquare' },
    { id: 'technical', label: 'Technical Knowledge', icon: 'Code' },
    { id: 'problem-solving', label: 'Problem Solving', icon: 'Lightbulb' },
    { id: 'confidence', label: 'Confidence', icon: 'Zap' },
    { id: 'time-management', label: 'Time Management', icon: 'Clock' },
    { id: 'clarity', label: 'Answer Clarity', icon: 'Target' }
  ];

  const handleRatingClick = (value) => {
    setRating(value);
  };

  const handleImprovementToggle = (improvementId) => {
    setImprovements(prev => 
      prev.includes(improvementId)
        ? prev.filter(id => id !== improvementId)
        : [...prev, improvementId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const feedbackData = {
      rating,
      feedback,
      improvements,
      sessionId: sessionData?.id,
      timestamp: new Date().toISOString()
    };

    try {
      await onSubmit(feedbackData);
      // Reset form
      setRating(0);
      setFeedback('');
      setImprovements([]);
      onClose();
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="glassmorphic rounded-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden border border-white/20">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Session Feedback</h2>
            <p className="text-muted-foreground text-sm">
              Help us improve your interview experience
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Session Summary */}
          <div className="glassmorphic rounded-lg p-4 mb-6 border border-white/10">
            <h3 className="font-medium text-foreground mb-3">Session Summary</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Duration:</span>
                <span className="text-foreground ml-2">45 minutes</span>
              </div>
              <div>
                <span className="text-muted-foreground">Questions Asked:</span>
                <span className="text-foreground ml-2">8</span>
              </div>
              <div>
                <span className="text-muted-foreground">Interviewer:</span>
                <span className="text-foreground ml-2">Sarah Chen</span>
              </div>
              <div>
                <span className="text-muted-foreground">Session Type:</span>
                <span className="text-foreground ml-2">Technical Interview</span>
              </div>
            </div>
          </div>

          {/* Overall Rating */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-foreground mb-3">
              Overall Session Rating
            </label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRatingClick(star)}
                  className={`w-8 h-8 transition-spring ${
                    star <= rating 
                      ? 'text-yellow-400 hover:text-yellow-500' :'text-muted-foreground hover:text-yellow-400'
                  }`}
                >
                  <Icon name="Star" size={24} fill={star <= rating ? 'currentColor' : 'none'} />
                </button>
              ))}
              <span className="text-sm text-muted-foreground ml-4">
                {rating === 0 ? 'No rating' : `${rating} star${rating !== 1 ? 's' : ''}`}
              </span>
            </div>
          </div>

          {/* Improvement Areas */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-foreground mb-3">
              Areas for Improvement (Optional)
            </label>
            <div className="grid grid-cols-2 gap-3">
              {improvementAreas.map((area) => (
                <button
                  key={area.id}
                  type="button"
                  onClick={() => handleImprovementToggle(area.id)}
                  className={`flex items-center space-x-3 p-3 rounded-lg border transition-spring ${
                    improvements.includes(area.id)
                      ? 'border-primary bg-primary/10 text-primary' :'border-white/20 hover:border-primary/50 text-foreground'
                  }`}
                >
                  <Icon name={area.icon} size={16} />
                  <span className="text-sm">{area.label}</span>
                  {improvements.includes(area.id) && (
                    <Icon name="Check" size={14} className="ml-auto" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Written Feedback */}
          <div className="mb-6">
            <Input
              label="Additional Comments"
              type="textarea"
              placeholder="Share your thoughts about the session, what went well, and what could be improved..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          {/* AI-Generated Insights */}
          <div className="glassmorphic rounded-lg p-4 mb-6 border border-white/10">
            <h3 className="font-medium text-foreground mb-3 flex items-center">
              <Icon name="Brain" size={16} className="mr-2 text-primary" />
              AI-Generated Insights
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-2">
                <Icon name="TrendingUp" size={14} className="text-green-500 mt-0.5" />
                <div>
                  <p className="text-foreground font-medium">Strong Performance</p>
                  <p className="text-muted-foreground">
                    Excellent problem-solving approach and clear communication throughout the session.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <Icon name="Target" size={14} className="text-yellow-500 mt-0.5" />
                <div>
                  <p className="text-foreground font-medium">Improvement Opportunity</p>
                  <p className="text-muted-foreground">
                    Consider practicing time management for coding challenges to optimize your approach.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <Icon name="BookOpen" size={14} className="text-blue-500 mt-0.5" />
                <div>
                  <p className="text-foreground font-medium">Recommended Resources</p>
                  <p className="text-muted-foreground">
                    Check out our System Design fundamentals course to strengthen your architecture skills.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4 border-t border-white/10">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Skip Feedback
            </Button>
            <Button
              type="submit"
              className="flex-1"
              loading={isSubmitting}
              disabled={rating === 0}
            >
              Submit Feedback
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SessionFeedback;
