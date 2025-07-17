import React, { useState, useEffect } from 'react';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';

const InteractiveQuiz = ({ quiz, onComplete, onClose }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(quiz.timeLimit || 300); // 5 minutes default
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (timeLeft > 0 && !showResults) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      handleSubmit();
    }
  }, [timeLeft, showResults]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (questionIndex, answerIndex) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionIndex]: answerIndex
    });
  };

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Calculate score
    let correctAnswers = 0;
    quiz.questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        correctAnswers++;
      }
    });
    
    const finalScore = Math.round((correctAnswers / quiz.questions.length) * 100);
    setScore(finalScore);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setShowResults(true);
    
    if (onComplete) {
      onComplete(finalScore, selectedAnswers);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-error';
  };

  const getScoreMessage = (score) => {
    if (score >= 80) return 'Excellent work!';
    if (score >= 60) return 'Good job!';
    return 'Keep practicing!';
  };

  if (isSubmitting) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="glassmorphic p-8 rounded-lg text-center max-w-md mx-4">
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Submitting Quiz...</h3>
          <p className="text-muted-foreground">Please wait while we calculate your score</p>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="glassmorphic p-8 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Results Header */}
          <div className="text-center mb-8">
            <div className={`w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center ${
              score >= 80 ? 'bg-success/20' : score >= 60 ? 'bg-warning/20' : 'bg-error/20'
            }`}>
              <span className={`text-3xl font-bold ${getScoreColor(score)}`}>
                {score}%
              </span>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">{getScoreMessage(score)}</h2>
            <p className="text-muted-foreground">
              You answered {quiz.questions.filter((_, index) => selectedAnswers[index] === quiz.questions[index].correctAnswer).length} out of {quiz.questions.length} questions correctly
            </p>
          </div>

          {/* Question Review */}
          <div className="space-y-6 mb-8">
            {quiz.questions.map((question, questionIndex) => {
              const userAnswer = selectedAnswers[questionIndex];
              const isCorrect = userAnswer === question.correctAnswer;
              
              return (
                <div key={questionIndex} className="glassmorphic-surface p-4 rounded-lg">
                  <div className="flex items-start space-x-3 mb-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isCorrect ? 'bg-success/20 text-success' : 'bg-error/20 text-error'
                    }`}>
                      <Icon name={isCorrect ? "Check" : "X"} size={14} />
                    </div>
                    <h4 className="font-medium text-foreground">{question.question}</h4>
                  </div>
                  
                  <div className="ml-9 space-y-2">
                    {question.options.map((option, optionIndex) => (
                      <div
                        key={optionIndex}
                        className={`p-2 rounded text-sm ${
                          optionIndex === question.correctAnswer
                            ? 'bg-success/20 text-success border border-success/30'
                            : optionIndex === userAnswer && !isCorrect
                              ? 'bg-error/20 text-error border border-error/30' :'text-muted-foreground'
                        }`}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                  
                  {question.explanation && (
                    <div className="ml-9 mt-3 p-3 bg-primary/10 rounded text-sm text-muted-foreground">
                      <strong>Explanation:</strong> {question.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex justify-center space-x-4">
            <Button variant="outline" onClick={onClose}>
              Continue Learning
            </Button>
            <Button onClick={() => window.location.reload()}>
              Retake Quiz
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="glassmorphic p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-foreground">{quiz.title}</h2>
            <p className="text-muted-foreground">
              Question {currentQuestion + 1} of {quiz.questions.length}
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Icon name="Clock" size={16} className="text-warning" />
              <span className={`font-mono text-sm ${timeLeft < 60 ? 'text-error' : 'text-foreground'}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
            
            <Button variant="ghost" size="icon" onClick={onClose}>
              <Icon name="X" size={18} />
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-foreground mb-6">{question.question}</h3>
          
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(currentQuestion, index)}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                  selectedAnswers[currentQuestion] === index
                    ? 'border-primary bg-primary/20 text-primary' :'border-white/20 hover:border-white/40 hover:bg-white/5 text-foreground'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedAnswers[currentQuestion] === index
                      ? 'border-primary bg-primary' :'border-white/40'
                  }`}>
                    {selectedAnswers[currentQuestion] === index && (
                      <Icon name="Check" size={14} className="text-white" />
                    )}
                  </div>
                  <span>{option}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            iconName="ChevronLeft"
            iconPosition="left"
          >
            Previous
          </Button>
          
          <div className="flex space-x-2">
            {quiz.questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                  index === currentQuestion
                    ? 'bg-primary text-white'
                    : selectedAnswers[index] !== undefined
                      ? 'bg-success/20 text-success' :'bg-white/20 text-muted-foreground hover:bg-white/30'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
          
          {currentQuestion === quiz.questions.length - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={Object.keys(selectedAnswers).length !== quiz.questions.length}
              iconName="Send"
              iconPosition="right"
            >
              Submit Quiz
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={selectedAnswers[currentQuestion] === undefined}
              iconName="ChevronRight"
              iconPosition="right"
            >
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InteractiveQuiz;
