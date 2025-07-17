import React from 'react';
import Icon from 'components/AppIcon';

const ProgressTracker = ({ progress, skills, badges, onSkillClick }) => {
  const CircularProgress = ({ percentage, size = 120, strokeWidth = 8, color = "text-primary" }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
          viewBox={`0 0 ${size} ${size}`}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-white/20"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={`${color} transition-all duration-1000 ease-out`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{Math.round(percentage)}%</div>
            <div className="text-xs text-muted-foreground">Complete</div>
          </div>
        </div>
      </div>
    );
  };

  const SkillRing = ({ skill, size = 80 }) => {
    const radius = (size - 6) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (skill.progress / 100) * circumference;

    return (
      <button
        onClick={() => onSkillClick(skill)}
        className="group relative transition-transform duration-200 hover:scale-105"
      >
        <div className="relative" style={{ width: size, height: size }}>
          <svg
            width={size}
            height={size}
            className="transform -rotate-90"
            viewBox={`0 0 ${size} ${size}`}
          >
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth={6}
              className="text-white/20"
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth={6}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className={`${skill.color} transition-all duration-1000 ease-out`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <Icon name={skill.icon} size={24} className={skill.color} />
          </div>
        </div>
        <div className="mt-2 text-center">
          <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
            {skill.name}
          </div>
          <div className="text-xs text-muted-foreground">{skill.progress}%</div>
        </div>
      </button>
    );
  };

  const BadgeItem = ({ badge, isUnlocked }) => (
    <div className={`relative group transition-all duration-300 ${isUnlocked ? 'scale-100' : 'scale-95 opacity-60'}`}>
      <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
        isUnlocked 
          ? 'bg-gradient-to-br from-warning to-accent shadow-lg' 
          : 'bg-muted/20 border-2 border-dashed border-muted-foreground/30'
      }`}>
        <Icon 
          name={badge.icon} 
          size={24} 
          className={isUnlocked ? 'text-white' : 'text-muted-foreground'} 
        />
      </div>
      
      {isUnlocked && (
        <div className="absolute -top-1 -right-1 w-6 h-6 bg-success rounded-full flex items-center justify-center animate-pulse">
          <Icon name="Check" size={12} className="text-white" />
        </div>
      )}
      
      <div className="mt-2 text-center">
        <div className={`text-xs font-medium ${isUnlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
          {badge.name}
        </div>
        {!isUnlocked && (
          <div className="text-xs text-muted-foreground mt-1">
            {badge.requirement}
          </div>
        )}
      </div>
      
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        <div className="bg-black/80 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap">
          {badge.description}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <div className="glassmorphic-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-foreground">Course Progress</h3>
          <div className="text-sm text-muted-foreground">
            {progress.completedLessons} of {progress.totalLessons} lessons
          </div>
        </div>
        
        <div className="flex items-center justify-center mb-6">
          <CircularProgress percentage={progress.overall} />
        </div>
        
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 glassmorphic-surface rounded-lg">
            <div className="text-lg font-semibold text-foreground">{progress.timeSpent}</div>
            <div className="text-sm text-muted-foreground">Time Spent</div>
          </div>
          <div className="p-3 glassmorphic-surface rounded-lg">
            <div className="text-lg font-semibold text-foreground">{progress.streak}</div>
            <div className="text-sm text-muted-foreground">Day Streak</div>
          </div>
          <div className="p-3 glassmorphic-surface rounded-lg">
            <div className="text-lg font-semibold text-foreground">{progress.averageScore}%</div>
            <div className="text-sm text-muted-foreground">Avg Score</div>
          </div>
        </div>
      </div>

      {/* Skills Progress */}
      <div className="glassmorphic-card p-6">
        <h3 className="text-xl font-semibold text-foreground mb-6 flex items-center">
          <Icon name="Zap" size={24} className="text-primary mr-2" />
          Skill Development
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {skills.map((skill, index) => (
            <SkillRing key={index} skill={skill} />
          ))}
        </div>
      </div>

      {/* Achievements & Badges */}
      <div className="glassmorphic-card p-6">
        <h3 className="text-xl font-semibold text-foreground mb-6 flex items-center">
          <Icon name="Award" size={24} className="text-warning mr-2" />
          Achievements
        </h3>
        
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {badges.map((badge, index) => (
            <BadgeItem 
              key={index} 
              badge={badge} 
              isUnlocked={badge.unlocked} 
            />
          ))}
        </div>
      </div>

      {/* Learning Stats */}
      <div className="glassmorphic-card p-6">
        <h3 className="text-xl font-semibold text-foreground mb-6 flex items-center">
          <Icon name="BarChart3" size={24} className="text-accent mr-2" />
          Learning Analytics
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Weekly Goal</span>
            <div className="flex items-center space-x-2">
              <div className="w-32 h-2 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-success transition-all duration-500"
                  style={{ width: `${(progress.weeklyProgress / progress.weeklyGoal) * 100}%` }}
                ></div>
              </div>
              <span className="text-sm text-foreground font-medium">
                {progress.weeklyProgress}/{progress.weeklyGoal}h
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Quiz Performance</span>
            <div className="flex items-center space-x-2">
              <div className="w-32 h-2 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${progress.quizPerformance}%` }}
                ></div>
              </div>
              <span className="text-sm text-foreground font-medium">
                {progress.quizPerformance}%
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Assignment Completion</span>
            <div className="flex items-center space-x-2">
              <div className="w-32 h-2 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-accent transition-all duration-500"
                  style={{ width: `${progress.assignmentCompletion}%` }}
                ></div>
              </div>
              <span className="text-sm text-foreground font-medium">
                {progress.assignmentCompletion}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressTracker;
