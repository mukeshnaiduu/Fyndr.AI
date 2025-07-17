import React from 'react';
import Icon from 'components/AppIcon';

const MatchPercentage = ({ matchPercentage, skillsMatched, totalSkills }) => {
  const circumference = 2 * Math.PI * 45;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (matchPercentage / 100) * circumference;

  const getMatchColor = (percentage) => {
    if (percentage >= 80) return 'text-success';
    if (percentage >= 60) return 'text-warning';
    return 'text-error';
  };

  const getMatchLabel = (percentage) => {
    if (percentage >= 80) return 'Excellent Match';
    if (percentage >= 60) return 'Good Match';
    return 'Partial Match';
  };

  return (
    <div className="glass-card p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading font-semibold text-lg text-foreground">
          AI Match Analysis
        </h3>
        <div className="flex items-center space-x-1">
          <Icon name="Zap" size={16} className="text-accent" />
          <span className="text-sm text-accent font-medium">AI Powered</span>
        </div>
      </div>

      <div className="flex items-center space-x-6">
        {/* Circular Progress */}
        <div className="relative">
          <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-muted"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              className={`transition-all duration-1000 ease-in-out ${getMatchColor(matchPercentage)}`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-2xl font-bold ${getMatchColor(matchPercentage)}`}>
              {matchPercentage}%
            </span>
          </div>
        </div>

        {/* Match Details */}
        <div className="flex-1">
          <div className="mb-3">
            <h4 className={`font-semibold text-lg ${getMatchColor(matchPercentage)}`}>
              {getMatchLabel(matchPercentage)}
            </h4>
            <p className="text-sm text-muted-foreground">
              Based on your profile and job requirements
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Skills Matched</span>
              <span className="text-sm font-medium text-foreground">
                {skillsMatched} of {totalSkills}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-gradient-primary h-2 rounded-full transition-all duration-500"
                style={{ width: `${(skillsMatched / totalSkills) * 100}%` }}
              />
            </div>
          </div>

          <div className="mt-4 flex items-center space-x-4 text-xs text-muted-foreground">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              <span>Strong Match</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-warning rounded-full"></div>
              <span>Partial Match</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-error rounded-full"></div>
              <span>Skill Gap</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchPercentage;
