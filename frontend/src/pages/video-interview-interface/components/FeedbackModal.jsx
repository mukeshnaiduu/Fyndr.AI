import React, { useState } from 'react';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';


const FeedbackModal = ({ isOpen, onClose, onSubmit, interviewData }) => {
  const [rating, setRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [technicalRating, setTechnicalRating] = useState(0);
  const [communicationRating, setCommunicationRating] = useState(0);
  const [problemSolvingRating, setProblemSolvingRating] = useState(0);
  const [recommendation, setRecommendation] = useState('');

  const feedbackTags = [
    { id: 'technical-strong', label: 'Strong Technical Skills', category: 'positive' },
    { id: 'communication-clear', label: 'Clear Communication', category: 'positive' },
    { id: 'problem-solving', label: 'Good Problem Solving', category: 'positive' },
    { id: 'creative-thinking', label: 'Creative Thinking', category: 'positive' },
    { id: 'team-player', label: 'Team Player', category: 'positive' },
    { id: 'quick-learner', label: 'Quick Learner', category: 'positive' },
    { id: 'needs-improvement', label: 'Needs Improvement', category: 'neutral' },
    { id: 'technical-gaps', label: 'Technical Gaps', category: 'concern' },
    { id: 'communication-issues', label: 'Communication Issues', category: 'concern' },
    { id: 'unclear-responses', label: 'Unclear Responses', category: 'concern' }
  ];

  const recommendations = [
    { value: 'hire', label: 'Recommend to Hire', color: 'text-success' },
    { value: 'maybe', label: 'Maybe - Need More Info', color: 'text-warning' },
    { value: 'no-hire', label: 'Do Not Recommend', color: 'text-error' }
  ];

  const handleTagToggle = (tagId) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const feedbackData = {
      overallRating: rating,
      technicalRating,
      communicationRating,
      problemSolvingRating,
      selectedTags,
      feedback,
      recommendation,
      timestamp: new Date(),
      interviewDuration: interviewData?.duration || 0,
      participantName: interviewData?.participantName || 'Unknown'
    };

    onSubmit(feedbackData);
    onClose();
  };

  const renderStarRating = (currentRating, onRatingChange, label) => (
    <div className="space-y-2">
      <label className="text-sm font-body font-body-medium text-foreground">
        {label}
      </label>
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            className="p-1 hover:scale-110 spring-transition"
          >
            <Icon
              name="Star"
              size={20}
              className={star <= currentRating ? 'text-warning fill-current' : 'text-muted-foreground'}
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-muted-foreground">
          {currentRating}/5
        </span>
      </div>
    </div>
  );

  const getTagColor = (category) => {
    switch (category) {
      case 'positive': return 'bg-success/10 text-success border-success/20';
      case 'concern': return 'bg-error/10 text-error border-error/20';
      case 'neutral': return 'bg-warning/10 text-warning border-warning/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-modal bg-black/50 flex items-center justify-center p-4">
      <div className="glassmorphic rounded-squircle max-w-2xl w-full max-h-[90vh] overflow-y-auto elevation-3">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-squircle flex items-center justify-center">
              <Icon name="MessageSquare" size={20} color="white" />
            </div>
            <div>
              <h3 className="font-heading font-heading-semibold text-foreground">
                Interview Feedback
              </h3>
              <p className="text-sm text-muted-foreground">
                Share your thoughts about the interview
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            iconName="X"
            iconSize={18}
          />
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Overall Rating */}
          <div className="space-y-4">
            <h4 className="font-heading font-heading-semibold text-foreground">
              Overall Assessment
            </h4>
            {renderStarRating(rating, setRating, 'Overall Interview Rating')}
          </div>

          {/* Detailed Ratings */}
          <div className="space-y-4">
            <h4 className="font-heading font-heading-semibold text-foreground">
              Detailed Ratings
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {renderStarRating(technicalRating, setTechnicalRating, 'Technical Skills')}
              {renderStarRating(communicationRating, setCommunicationRating, 'Communication')}
              {renderStarRating(problemSolvingRating, setProblemSolvingRating, 'Problem Solving')}
            </div>
          </div>

          {/* Feedback Tags */}
          <div className="space-y-4">
            <h4 className="font-heading font-heading-semibold text-foreground">
              Quick Feedback Tags
            </h4>
            <div className="flex flex-wrap gap-2">
              {feedbackTags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => handleTagToggle(tag.id)}
                  className={`px-3 py-1.5 rounded-full text-sm font-body font-body-medium border spring-transition ${
                    selectedTags.includes(tag.id)
                      ? getTagColor(tag.category)
                      : 'bg-muted text-muted-foreground border-border hover:border-primary/50'
                  }`}
                >
                  {tag.label}
                </button>
              ))}
            </div>
          </div>

          {/* Written Feedback */}
          <div className="space-y-2">
            <label className="text-sm font-body font-body-medium text-foreground">
              Detailed Feedback
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Share your detailed thoughts about the candidate's performance, strengths, and areas for improvement..."
              className="w-full h-32 p-3 bg-input border border-border rounded-squircle resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder-muted-foreground"
            />
          </div>

          {/* Recommendation */}
          <div className="space-y-4">
            <h4 className="font-heading font-heading-semibold text-foreground">
              Hiring Recommendation
            </h4>
            <div className="space-y-2">
              {recommendations.map((rec) => (
                <button
                  key={rec.value}
                  type="button"
                  onClick={() => setRecommendation(rec.value)}
                  className={`w-full flex items-center space-x-3 p-3 rounded-squircle border-2 spring-transition ${
                    recommendation === rec.value
                      ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    recommendation === rec.value ? 'border-primary' : 'border-muted-foreground'
                  }`}>
                    {recommendation === rec.value && (
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    )}
                  </div>
                  <span className={`font-body font-body-medium ${rec.color}`}>
                    {rec.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Interview Summary */}
          <div className="glassmorphic p-4 rounded-squircle">
            <h5 className="font-heading font-heading-semibold text-foreground mb-3">
              Interview Summary
            </h5>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Candidate:</span>
                <span className="ml-2 text-foreground font-body font-body-medium">
                  {interviewData?.participantName || 'John Doe'}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Duration:</span>
                <span className="ml-2 text-foreground font-body font-body-medium">
                  {Math.floor((interviewData?.duration || 1800) / 60)} minutes
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Date:</span>
                <span className="ml-2 text-foreground font-body font-body-medium">
                  {new Date().toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Position:</span>
                <span className="ml-2 text-foreground font-body font-body-medium">
                  Senior Developer
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              disabled={rating === 0 || !recommendation}
              iconName="Send"
              iconPosition="left"
              iconSize={16}
              className="glow-primary"
            >
              Submit Feedback
            </Button>
          </div>
        </form>

        {/* Ambient Particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-squircle">
          <div className="absolute top-8 left-8 w-1 h-1 bg-primary/20 rounded-full particle-float"></div>
          <div className="absolute bottom-12 right-12 w-1.5 h-1.5 bg-accent/30 rounded-full particle-float" style={{ animationDelay: '2s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;
