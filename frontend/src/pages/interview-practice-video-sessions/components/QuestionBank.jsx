import React, { useState } from 'react';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';
import Select from 'components/ui/Select';

const QuestionBank = ({ onSelectQuestion, isVisible, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'behavioral', label: 'Behavioral' },
    { value: 'technical', label: 'Technical' },
    { value: 'system-design', label: 'System Design' },
    { value: 'coding', label: 'Coding' },
    { value: 'leadership', label: 'Leadership' }
  ];

  const difficulties = [
    { value: 'all', label: 'All Levels' },
    { value: 'easy', label: 'Easy' },
    { value: 'medium', label: 'Medium' },
    { value: 'hard', label: 'Hard' }
  ];

  const questions = [
    {
      id: 1,
      category: 'behavioral',
      difficulty: 'easy',
      question: "Tell me about yourself and your background.",
      followUp: "What motivated you to pursue this career path?",
      timeLimit: 300,
      tags: ['introduction', 'background']
    },
    {
      id: 2,
      category: 'behavioral',
      difficulty: 'medium',
      question: "Describe a challenging project you worked on and how you overcame obstacles.",
      followUp: "What would you do differently if you faced a similar situation again?",
      timeLimit: 420,
      tags: ['problem-solving', 'teamwork']
    },
    {
      id: 3,
      category: 'technical',
      difficulty: 'medium',
      question: "Explain the difference between REST and GraphQL APIs.",
      followUp: "When would you choose one over the other?",
      timeLimit: 600,
      tags: ['api', 'architecture']
    },
    {
      id: 4,
      category: 'technical',
      difficulty: 'hard',
      question: "How would you implement a real-time chat system?",
      followUp: "What technologies would you use and why?",
      timeLimit: 900,
      tags: ['real-time', 'system-design']
    },
    {
      id: 5,
      category: 'system-design',
      difficulty: 'hard',
      question: "Design a URL shortening service like bit.ly.",
      followUp: "How would you handle high traffic and ensure reliability?",
      timeLimit: 1800,
      tags: ['scalability', 'database']
    },
    {
      id: 6,
      category: 'coding',
      difficulty: 'medium',
      question: "Implement a function to reverse a linked list.",
      followUp: "Can you do it iteratively and recursively?",
      timeLimit: 1200,
      tags: ['data-structures', 'algorithms']
    },
    {
      id: 7,
      category: 'leadership',
      difficulty: 'medium',
      question: "How do you handle conflicts within your team?",
      followUp: "Can you give me a specific example?",
      timeLimit: 360,
      tags: ['conflict-resolution', 'management']
    },
    {
      id: 8,
      category: 'behavioral',
      difficulty: 'easy',
      question: "Why are you interested in this position?",
      followUp: "What do you know about our company?",
      timeLimit: 240,
      tags: ['motivation', 'company-research']
    }
  ];

  const filteredQuestions = questions.filter(q => {
    const categoryMatch = selectedCategory === 'all' || q.category === selectedCategory;
    const difficultyMatch = selectedDifficulty === 'all' || q.difficulty === selectedDifficulty;
    return categoryMatch && difficultyMatch;
  });

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-500 bg-green-500/10';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10';
      case 'hard': return 'text-red-500 bg-red-500/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    return `${mins}m`;
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="glassmorphic rounded-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden border border-white/20">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Question Bank</h2>
            <p className="text-muted-foreground text-sm">
              Select a question to ask during the interview
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Category"
              options={categories}
              value={selectedCategory}
              onChange={setSelectedCategory}
            />
            <Select
              label="Difficulty"
              options={difficulties}
              value={selectedDifficulty}
              onChange={setSelectedDifficulty}
            />
          </div>
        </div>

        {/* Questions List */}
        <div className="p-6 overflow-y-auto max-h-96">
          <div className="space-y-4">
            {filteredQuestions.map((question) => (
              <div
                key={question.id}
                className="glassmorphic rounded-lg p-4 border border-white/10 hover:border-primary/30 transition-spring cursor-pointer"
                onClick={() => onSelectQuestion(question)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
                      {question.difficulty}
                    </span>
                    <span className="px-2 py-1 rounded text-xs font-medium bg-primary/10 text-primary">
                      {question.category}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center">
                      <Icon name="Clock" size={12} className="mr-1" />
                      {formatTime(question.timeLimit)}
                    </span>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Icon name="Plus" size={16} />
                  </Button>
                </div>

                <h3 className="font-medium text-foreground mb-2">
                  {question.question}
                </h3>

                {question.followUp && (
                  <p className="text-sm text-muted-foreground mb-3">
                    <span className="font-medium">Follow-up:</span> {question.followUp}
                  </p>
                )}

                <div className="flex flex-wrap gap-1">
                  {question.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-muted rounded text-xs text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {filteredQuestions.length === 0 && (
            <div className="text-center py-12">
              <Icon name="Search" size={48} className="text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No questions found
              </h3>
              <p className="text-muted-foreground">
                Try adjusting your filters to see more questions.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 bg-muted/20">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {filteredQuestions.length} questions available
            </p>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionBank;
