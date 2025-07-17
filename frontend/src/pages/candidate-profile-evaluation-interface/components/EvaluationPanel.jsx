import React, { useState } from 'react';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';
import Input from 'components/ui/Input';
import { Checkbox } from 'components/ui/Checkbox';

const EvaluationPanel = ({ candidate, onEvaluationUpdate }) => {
  const [activeSection, setActiveSection] = useState('rating');
  const [evaluation, setEvaluation] = useState({
    overallRating: 4,
    technicalSkills: 4,
    communication: 5,
    culturalFit: 3,
    experience: 4,
    notes: `Strong technical background with excellent React and Node.js skills. Great communication during the initial screening call. Shows enthusiasm for the role and company mission.\n\nAreas to explore further:\n- Leadership experience\n- Experience with our tech stack\n- Availability for start date`,
    interviewFeedback: [],
    recommendation: 'proceed',
    tags: ['frontend-expert', 'react-specialist', 'good-communicator']
  });

  const [newNote, setNewNote] = useState('');
  const [selectedTags, setSelectedTags] = useState(evaluation.tags);

  const sections = [
    { id: 'rating', label: 'Rating', icon: 'Star' },
    { id: 'notes', label: 'Notes', icon: 'FileText' },
    { id: 'interview', label: 'Interview', icon: 'Video' },
    { id: 'decision', label: 'Decision', icon: 'CheckCircle' }
  ];

  const ratingCategories = [
    { key: 'technicalSkills', label: 'Technical Skills', icon: 'Code' },
    { key: 'communication', label: 'Communication', icon: 'MessageCircle' },
    { key: 'culturalFit', label: 'Cultural Fit', icon: 'Users' },
    { key: 'experience', label: 'Experience', icon: 'Briefcase' }
  ];

  const availableTags = [
    'frontend-expert', 'backend-developer', 'fullstack', 'react-specialist',
    'node-expert', 'good-communicator', 'team-player', 'leadership-potential',
    'quick-learner', 'problem-solver', 'creative-thinker', 'detail-oriented'
  ];

  const interviewTypes = [
    { id: 'technical', label: 'Technical Interview', icon: 'Code', duration: '60 min' },
    { id: 'behavioral', label: 'Behavioral Interview', icon: 'MessageCircle', duration: '45 min' },
    { id: 'cultural', label: 'Cultural Fit', icon: 'Users', duration: '30 min' },
    { id: 'final', label: 'Final Round', icon: 'Crown', duration: '90 min' }
  ];

  const handleRatingChange = (category, rating) => {
    setEvaluation(prev => ({
      ...prev,
      [category]: rating,
      overallRating: Math.round(
        (rating + prev.technicalSkills + prev.communication + prev.culturalFit + prev.experience - prev[category]) / 4
      )
    }));
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      const updatedNotes = evaluation.notes + '\n\n' + `[${new Date().toLocaleDateString()}] ${newNote}`;
      setEvaluation(prev => ({ ...prev, notes: updatedNotes }));
      setNewNote('');
    }
  };

  const handleTagToggle = (tag) => {
    const updatedTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    setSelectedTags(updatedTags);
    setEvaluation(prev => ({ ...prev, tags: updatedTags }));
  };

  const renderStarRating = (rating, onChange) => (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => onChange(star)}
          className={`w-6 h-6 transition-colors duration-200 ${
            star <= rating ? 'text-warning' : 'text-muted-foreground'
          }`}
        >
          <Icon name="Star" size={20} className={star <= rating ? 'fill-current' : ''} />
        </button>
      ))}
    </div>
  );

  const renderRatingSection = () => (
    <div className="space-y-6">
      <div className="glassmorphic-surface p-4 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Overall Rating</h3>
          <div className="flex items-center space-x-2">
            {renderStarRating(evaluation.overallRating, (rating) => 
              setEvaluation(prev => ({ ...prev, overallRating: rating }))
            )}
            <span className="text-lg font-bold text-primary">{evaluation.overallRating}/5</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {ratingCategories.map((category) => (
          <div key={category.key} className="glassmorphic-surface p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Icon name={category.icon} size={16} className="text-primary" />
                <span className="font-medium text-foreground">{category.label}</span>
              </div>
              <div className="flex items-center space-x-2">
                {renderStarRating(evaluation[category.key], (rating) => 
                  handleRatingChange(category.key, rating)
                )}
                <span className="text-sm font-medium text-muted-foreground w-8">
                  {evaluation[category.key]}/5
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderNotesSection = () => (
    <div className="space-y-4">
      <div className="glassmorphic-surface p-4 rounded-lg">
        <h3 className="font-semibold text-foreground mb-3">Evaluation Notes</h3>
        <textarea
          value={evaluation.notes}
          onChange={(e) => setEvaluation(prev => ({ ...prev, notes: e.target.value }))}
          className="w-full h-32 p-3 bg-white/10 border border-white/20 rounded-lg text-foreground placeholder-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
          placeholder="Add your evaluation notes here..."
        />
      </div>

      <div className="glassmorphic-surface p-4 rounded-lg">
        <h3 className="font-semibold text-foreground mb-3">Add Quick Note</h3>
        <div className="flex space-x-2">
          <Input
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add a quick note..."
            className="flex-1"
          />
          <Button onClick={handleAddNote} iconName="Plus">
            Add
          </Button>
        </div>
      </div>

      <div className="glassmorphic-surface p-4 rounded-lg">
        <h3 className="font-semibold text-foreground mb-3">Tags</h3>
        <div className="flex flex-wrap gap-2">
          {availableTags.map((tag) => (
            <button
              key={tag}
              onClick={() => handleTagToggle(tag)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                selectedTags.includes(tag)
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/20 text-muted-foreground hover:bg-muted/30'
              }`}
            >
              {tag.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderInterviewSection = () => (
    <div className="space-y-4">
      <div className="glassmorphic-surface p-4 rounded-lg">
        <h3 className="font-semibold text-foreground mb-4">Schedule Interview</h3>
        <div className="grid grid-cols-1 gap-3">
          {interviewTypes.map((type) => (
            <button
              key={type.id}
              className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all duration-200"
            >
              <div className="flex items-center space-x-3">
                <Icon name={type.icon} size={20} className="text-primary" />
                <div className="text-left">
                  <div className="font-medium text-foreground">{type.label}</div>
                  <div className="text-sm text-muted-foreground">{type.duration}</div>
                </div>
              </div>
              <Icon name="Calendar" size={16} className="text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>

      <div className="glassmorphic-surface p-4 rounded-lg">
        <h3 className="font-semibold text-foreground mb-3">Interview History</h3>
        <div className="space-y-3">
          {candidate.interviewHistory?.map((interview, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div className="flex items-center space-x-3">
                <Icon name={interview.type === 'technical' ? 'Code' : 'MessageCircle'} size={16} className="text-primary" />
                <div>
                  <div className="font-medium text-foreground">{interview.title}</div>
                  <div className="text-sm text-muted-foreground">{interview.date}</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  interview.status === 'completed' ? 'bg-success/20 text-success' :
                  interview.status === 'scheduled'? 'bg-warning/20 text-warning' : 'bg-muted/20 text-muted-foreground'
                }`}>
                  {interview.status}
                </span>
                <Icon name="ChevronRight" size={16} className="text-muted-foreground" />
              </div>
            </div>
          )) || (
            <p className="text-sm text-muted-foreground text-center py-4">No interviews scheduled yet</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderDecisionSection = () => (
    <div className="space-y-4">
      <div className="glassmorphic-surface p-4 rounded-lg">
        <h3 className="font-semibold text-foreground mb-4">Recommendation</h3>
        <div className="space-y-3">
          {[
            { value: 'proceed', label: 'Proceed to Next Round', color: 'success', icon: 'ArrowRight' },
            { value: 'hold', label: 'Put on Hold', color: 'warning', icon: 'Pause' },
            { value: 'reject', label: 'Reject', color: 'error', icon: 'X' }
          ].map((option) => (
            <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
              <Checkbox
                checked={evaluation.recommendation === option.value}
                onChange={() => setEvaluation(prev => ({ ...prev, recommendation: option.value }))}
              />
              <Icon name={option.icon} size={16} className={`text-${option.color}`} />
              <span className="font-medium text-foreground">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex space-x-3">
        <Button variant="outline" className="flex-1" iconName="Save">
          Save Draft
        </Button>
        <Button 
          variant="default" 
          className="flex-1" 
          iconName="Send"
          onClick={() => onEvaluationUpdate(evaluation)}
        >
          Submit Evaluation
        </Button>
      </div>
    </div>
  );

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'rating':
        return renderRatingSection();
      case 'notes':
        return renderNotesSection();
      case 'interview':
        return renderInterviewSection();
      case 'decision':
        return renderDecisionSection();
      default:
        return renderRatingSection();
    }
  };

  return (
    <div className="glassmorphic-card p-6">
      <h2 className="text-xl font-bold text-foreground mb-6">Evaluation</h2>

      {/* Section Navigation */}
      <div className="flex space-x-1 mb-6 bg-muted/10 p-1 rounded-lg">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeSection === section.id
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-white/10'
            }`}
          >
            <Icon name={section.icon} size={16} />
            <span>{section.label}</span>
          </button>
        ))}
      </div>

      {/* Section Content */}
      <div className="min-h-[500px]">
        {renderSectionContent()}
      </div>
    </div>
  );
};

export default EvaluationPanel;
