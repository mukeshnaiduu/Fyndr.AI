import React, { useState, useEffect } from 'react';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';
import Select from 'components/ui/Select';

const PracticeMode = ({ isActive, onStartSession, onClose }) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState('medium');
  const [selectedCategory, setSelectedCategory] = useState('behavioral');
  const [sessionDuration, setSessionDuration] = useState(30);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [aiPrompts, setAiPrompts] = useState([]);

  const difficulties = [
    { value: 'easy', label: 'Easy' },
    { value: 'medium', label: 'Medium' },
    { value: 'hard', label: 'Hard' }
  ];

  const categories = [
    { value: 'behavioral', label: 'Behavioral' },
    { value: 'technical', label: 'Technical' },
    { value: 'system-design', label: 'System Design' },
    { value: 'coding', label: 'Coding' }
  ];

  const durations = [
    { value: 15, label: '15 minutes' },
    { value: 30, label: '30 minutes' },
    { value: 45, label: '45 minutes' },
    { value: 60, label: '60 minutes' }
  ];

  const practiceQuestions = {
    behavioral: {
      easy: [
        "Tell me about yourself.",
        "Why do you want to work here?",
        "What are your strengths and weaknesses?"
      ],
      medium: [
        "Describe a challenging project you worked on.",
        "How do you handle stress and pressure?",
        "Tell me about a time you had to work with a difficult team member."
      ],
      hard: [
        "Describe a time you failed and how you handled it.",
        "How would you handle a situation where you disagreed with your manager?",
        "Tell me about a time you had to make a difficult decision with limited information."
      ]
    },
    technical: {
      easy: [
        "What is the difference between let, const, and var in JavaScript?",
        "Explain what REST API is.",
        "What is the difference between SQL and NoSQL databases?"
      ],
      medium: [
        "How would you optimize a slow-performing web application?",
        "Explain the concept of microservices architecture.",
        "What are the differences between React and Angular?"
      ],
      hard: [
        "How would you design a scalable chat application?",
        "Explain how you would implement authentication and authorization.",
        "Describe how you would handle database migrations in a production environment."
      ]
    },
    'system-design': {
      easy: [
        "Design a simple URL shortener.",
        "How would you design a basic chat application?",
        "Design a simple file storage system."
      ],
      medium: [
        "Design a social media feed system.",
        "How would you design a ride-sharing application?",
        "Design a notification system for a mobile app."
      ],
      hard: [
        "Design a distributed cache system like Redis.",
        "How would you design a global content delivery network?",
        "Design a real-time collaborative document editor."
      ]
    },
    coding: {
      easy: [
        "Write a function to reverse a string.",
        "Find the maximum number in an array.",
        "Check if a string is a palindrome."
      ],
      medium: [
        "Implement a binary search algorithm.",
        "Find the longest substring without repeating characters.",
        "Merge two sorted linked lists."
      ],
      hard: [
        "Implement a LRU cache.",
        "Find the median of two sorted arrays.",
        "Design and implement a data structure for Least Recently Used (LRU) cache."
      ]
    }
  };

  useEffect(() => {
    let interval;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const generateQuestion = () => {
    const questions = practiceQuestions[selectedCategory]?.[selectedDifficulty] || [];
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    setCurrentQuestion(randomQuestion);
    setTimer(0);
    setIsTimerRunning(true);
    
    // Generate AI prompts based on the question
    generateAIPrompts(randomQuestion);
  };

  const generateAIPrompts = (question) => {
    const prompts = [
      "Take a moment to structure your thoughts before answering.",
      "Consider using the STAR method (Situation, Task, Action, Result) for behavioral questions.",
      "Break down complex problems into smaller, manageable parts.",
      "Don't forget to ask clarifying questions if needed.",
      "Remember to think out loud to show your problem-solving process."
    ];
    setAiPrompts(prompts.slice(0, 3));
  };

  const handleStartPractice = () => {
    generateQuestion();
  };

  const handleNextQuestion = () => {
    generateQuestion();
  };

  const handleStopPractice = () => {
    setCurrentQuestion(null);
    setTimer(0);
    setIsTimerRunning(false);
    setAiPrompts([]);
  };

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="glassmorphic rounded-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden border border-white/20">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Practice Mode</h2>
            <p className="text-muted-foreground text-sm">
              AI-powered interview practice with automated feedback
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        <div className="p-6">
          {!currentQuestion ? (
            /* Setup Screen */
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <Select
                  label="Duration"
                  options={durations}
                  value={sessionDuration}
                  onChange={setSessionDuration}
                />
              </div>

              <div className="glassmorphic rounded-lg p-6 border border-white/10">
                <h3 className="font-medium text-foreground mb-4 flex items-center">
                  <Icon name="Brain" size={20} className="mr-2 text-primary" />
                  AI Practice Features
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-3">
                    <Icon name="MessageSquare" size={16} className="text-green-500 mt-1" />
                    <div>
                      <p className="font-medium text-foreground">Smart Prompts</p>
                      <p className="text-sm text-muted-foreground">
                        AI-generated hints and guidance during practice
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Icon name="Clock" size={16} className="text-blue-500 mt-1" />
                    <div>
                      <p className="font-medium text-foreground">Time Tracking</p>
                      <p className="text-sm text-muted-foreground">
                        Monitor response time for each question
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Icon name="Target" size={16} className="text-purple-500 mt-1" />
                    <div>
                      <p className="font-medium text-foreground">Instant Feedback</p>
                      <p className="text-sm text-muted-foreground">
                        Real-time analysis of your responses
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Icon name="TrendingUp" size={16} className="text-orange-500 mt-1" />
                    <div>
                      <p className="font-medium text-foreground">Progress Tracking</p>
                      <p className="text-sm text-muted-foreground">
                        Track improvement over multiple sessions
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button onClick={handleStartPractice} className="flex-1">
                  <Icon name="Play" size={16} className="mr-2" />
                  Start Practice Session
                </Button>
                <Button variant="outline" onClick={() => onStartSession('live')}>
                  <Icon name="Users" size={16} className="mr-2" />
                  Join Live Session
                </Button>
              </div>
            </div>
          ) : (
            /* Practice Session */
            <div className="space-y-6">
              {/* Timer and Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 bg-black/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                    <Icon name="Clock" size={16} className="text-primary" />
                    <span className="font-mono text-foreground">{formatTime(timer)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 bg-primary/10 text-primary rounded text-sm">
                      {selectedCategory}
                    </span>
                    <span className="px-2 py-1 bg-muted text-muted-foreground rounded text-sm">
                      {selectedDifficulty}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={handleNextQuestion}>
                    <Icon name="SkipForward" size={16} className="mr-2" />
                    Next Question
                  </Button>
                  <Button variant="destructive" onClick={handleStopPractice}>
                    <Icon name="Square" size={16} className="mr-2" />
                    Stop Practice
                  </Button>
                </div>
              </div>

              {/* Current Question */}
              <div className="glassmorphic rounded-lg p-6 border border-white/10">
                <h3 className="text-lg font-medium text-foreground mb-4">
                  {currentQuestion}
                </h3>
                
                {/* AI Prompts */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground flex items-center">
                    <Icon name="Lightbulb" size={14} className="mr-2" />
                    AI Guidance
                  </h4>
                  {aiPrompts.map((prompt, index) => (
                    <div key={index} className="flex items-start space-x-2 text-sm">
                      <Icon name="ArrowRight" size={12} className="text-primary mt-1" />
                      <span className="text-muted-foreground">{prompt}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Practice Area */}
              <div className="glassmorphic rounded-lg p-6 border border-white/10">
                <div className="text-center py-12">
                  <Icon name="Mic" size={48} className="text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    Start Speaking Your Answer
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Practice your response out loud. The AI will analyze your speech patterns and provide feedback.
                  </p>
                  <div className="flex justify-center space-x-3">
                    <Button variant="outline">
                      <Icon name="Pause" size={16} className="mr-2" />
                      Pause Recording
                    </Button>
                    <Button>
                      <Icon name="RotateCcw" size={16} className="mr-2" />
                      Start Over
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PracticeMode;
