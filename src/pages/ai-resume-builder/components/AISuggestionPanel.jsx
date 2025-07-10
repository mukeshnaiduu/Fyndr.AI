import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';

const AISuggestionPanel = ({ isVisible, onClose, suggestions = [], onAccept, onReject }) => {
  const [activeSuggestion, setActiveSuggestion] = useState(0);

  const defaultSuggestions = [
    {
      id: 1,
      type: 'content',
      section: 'experience',
      title: 'Enhance Job Description',
      original: 'Worked on web development projects',
      suggested: 'Led development of responsive web applications using React.js and Node.js, resulting in 40% improved user engagement and 25% faster load times',
      reason: 'More specific and quantified achievements',
      confidence: 85
    },
    {
      id: 2,
      type: 'keyword',
      section: 'skills',
      title: 'Add Relevant Keywords',
      original: 'JavaScript, HTML, CSS',
      suggested: 'JavaScript (ES6+), HTML5, CSS3, React.js, Node.js, RESTful APIs, Git, Agile/Scrum',
      reason: 'Includes trending technologies and methodologies',
      confidence: 92
    },
    {
      id: 3,
      type: 'format',
      section: 'summary',
      title: 'Improve Professional Summary',
      original: 'Software developer with experience in web technologies',
      suggested: 'Results-driven Full-Stack Developer with 5+ years of experience building scalable web applications. Proven track record of delivering high-quality solutions that increase user engagement by 40% and reduce development time by 30%.',
      reason: 'More compelling and results-focused',
      confidence: 78
    }
  ];

  const activeSuggestions = suggestions.length > 0 ? suggestions : defaultSuggestions;
  const currentSuggestion = activeSuggestions[activeSuggestion];

  const handleAccept = () => {
    onAccept(currentSuggestion);
    nextSuggestion();
  };

  const handleReject = () => {
    onReject(currentSuggestion);
    nextSuggestion();
  };

  const nextSuggestion = () => {
    if (activeSuggestion < activeSuggestions.length - 1) {
      setActiveSuggestion(activeSuggestion + 1);
    } else {
      onClose();
    }
  };

  const prevSuggestion = () => {
    if (activeSuggestion > 0) {
      setActiveSuggestion(activeSuggestion - 1);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'content': return 'FileText';
      case 'keyword': return 'Tag';
      case 'format': return 'Layout';
      default: return 'Lightbulb';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'content': return 'text-primary';
      case 'keyword': return 'text-secondary';
      case 'format': return 'text-accent';
      default: return 'text-muted-foreground';
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return 'text-success';
    if (confidence >= 60) return 'text-warning';
    return 'text-error';
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-96 glass-card border-l border-glass-border z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-glass-border">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <Icon name="Sparkles" size={16} color="white" />
                </div>
                <h3 className="font-semibold text-foreground">AI Suggestions</h3>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <Icon name="X" size={20} />
              </Button>
            </div>

            {/* Progress */}
            <div className="px-6 py-4 border-b border-glass-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">
                  Suggestion {activeSuggestion + 1} of {activeSuggestions.length}
                </span>
                <span className={`text-sm font-medium ${getConfidenceColor(currentSuggestion.confidence)}`}>
                  {currentSuggestion.confidence}% confidence
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((activeSuggestion + 1) / activeSuggestions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <motion.div
                key={activeSuggestion}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Suggestion Header */}
                <div className="flex items-center space-x-3 mb-4">
                  <Icon 
                    name={getTypeIcon(currentSuggestion.type)} 
                    size={20} 
                    className={getTypeColor(currentSuggestion.type)}
                  />
                  <div>
                    <h4 className="font-medium text-foreground">{currentSuggestion.title}</h4>
                    <p className="text-xs text-muted-foreground capitalize">
                      {currentSuggestion.section} • {currentSuggestion.type}
                    </p>
                  </div>
                </div>

                {/* Reason */}
                <div className="mb-6">
                  <div className="flex items-start space-x-2 p-3 bg-accent/10 rounded-card">
                    <Icon name="Info" size={16} className="text-accent mt-0.5" />
                    <p className="text-sm text-foreground">{currentSuggestion.reason}</p>
                  </div>
                </div>

                {/* Original vs Suggested */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Current
                    </label>
                    <div className="p-3 bg-error/10 border border-error/20 rounded-card">
                      <p className="text-sm text-foreground">{currentSuggestion.original}</p>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <Icon name="ArrowDown" size={20} className="text-muted-foreground" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      AI Suggested
                    </label>
                    <div className="p-3 bg-success/10 border border-success/20 rounded-card">
                      <p className="text-sm text-foreground">{currentSuggestion.suggested}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-glass-border">
              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={prevSuggestion}
                  disabled={activeSuggestion === 0}
                >
                  <Icon name="ChevronLeft" size={16} />
                  Previous
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={nextSuggestion}
                  disabled={activeSuggestion === activeSuggestions.length - 1}
                >
                  Next
                  <Icon name="ChevronRight" size={16} />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={handleReject}
                  iconName="X"
                  iconPosition="left"
                >
                  Reject
                </Button>
                <Button
                  variant="default"
                  onClick={handleAccept}
                  iconName="Check"
                  iconPosition="left"
                >
                  Accept
                </Button>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                fullWidth
                className="mt-3"
              >
                Close Suggestions
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AISuggestionPanel;
