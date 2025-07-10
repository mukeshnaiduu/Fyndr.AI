import React, { useState } from 'react';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';

const ProgressDashboard = ({ userProgress, achievements, onViewDetails }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  const periodOptions = [
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' },
    { value: 'all', label: 'All Time' }
  ];

  const stats = {
    week: {
      resourcesCompleted: 12,
      hoursLearned: 8.5,
      streakDays: 5,
      pointsEarned: 340
    },
    month: {
      resourcesCompleted: 45,
      hoursLearned: 32.5,
      streakDays: 15,
      pointsEarned: 1250
    },
    year: {
      resourcesCompleted: 180,
      hoursLearned: 125.5,
      streakDays: 45,
      pointsEarned: 5680
    },
    all: {
      resourcesCompleted: 245,
      hoursLearned: 168.5,
      streakDays: 45,
      pointsEarned: 7890
    }
  };

  const currentStats = stats[selectedPeriod];

  const skillProgress = [
    { skill: 'Data Structures', progress: 85, level: 'Advanced', color: 'bg-blue-500' },
    { skill: 'Algorithms', progress: 72, level: 'Intermediate', color: 'bg-green-500' },
    { skill: 'System Design', progress: 45, level: 'Beginner', color: 'bg-yellow-500' },
    { skill: 'Behavioral', progress: 90, level: 'Expert', color: 'bg-purple-500' },
    { skill: 'Database Design', progress: 60, level: 'Intermediate', color: 'bg-pink-500' }
  ];

  const recentAchievements = [
    {
      id: 1,
      title: 'Problem Solver',
      description: 'Completed 50 practice problems',
      icon: 'Trophy',
      color: 'text-yellow-500',
      date: '2 days ago',
      points: 100
    },
    {
      id: 2,
      title: 'Consistent Learner',
      description: '7-day learning streak',
      icon: 'Flame',
      color: 'text-orange-500',
      date: '1 week ago',
      points: 150
    },
    {
      id: 3,
      title: 'Video Master',
      description: 'Watched 25 video tutorials',
      icon: 'Play',
      color: 'text-blue-500',
      date: '2 weeks ago',
      points: 75
    }
  ];

  const weeklyActivity = [
    { day: 'Mon', hours: 2.5, completed: 3 },
    { day: 'Tue', hours: 1.8, completed: 2 },
    { day: 'Wed', hours: 3.2, completed: 4 },
    { day: 'Thu', hours: 0.5, completed: 1 },
    { day: 'Fri', hours: 2.1, completed: 3 },
    { day: 'Sat', hours: 1.2, completed: 2 },
    { day: 'Sun', hours: 0.8, completed: 1 }
  ];

  const maxHours = Math.max(...weeklyActivity.map(day => day.hours));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Learning Progress</h2>
          <p className="text-muted-foreground">Track your learning journey and achievements</p>
        </div>
        
        {/* Period Selector */}
        <div className="flex items-center space-x-2 glassmorphic rounded-lg p-1">
          {periodOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedPeriod(option.value)}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-spring ${
                selectedPeriod === option.value
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glassmorphic rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <Icon name="BookOpen" size={24} className="text-primary" />
            <span className="text-2xl font-bold text-foreground">{currentStats.resourcesCompleted}</span>
          </div>
          <p className="text-sm text-muted-foreground">Resources Completed</p>
          <div className="mt-2 flex items-center text-xs text-green-600">
            <Icon name="TrendingUp" size={12} className="mr-1" />
            +12% from last period
          </div>
        </div>

        <div className="glassmorphic rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <Icon name="Clock" size={24} className="text-blue-500" />
            <span className="text-2xl font-bold text-foreground">{currentStats.hoursLearned}h</span>
          </div>
          <p className="text-sm text-muted-foreground">Hours Learned</p>
          <div className="mt-2 flex items-center text-xs text-green-600">
            <Icon name="TrendingUp" size={12} className="mr-1" />
            +8% from last period
          </div>
        </div>

        <div className="glassmorphic rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <Icon name="Flame" size={24} className="text-orange-500" />
            <span className="text-2xl font-bold text-foreground">{currentStats.streakDays}</span>
          </div>
          <p className="text-sm text-muted-foreground">Day Streak</p>
          <div className="mt-2 flex items-center text-xs text-green-600">
            <Icon name="TrendingUp" size={12} className="mr-1" />
            Personal best!
          </div>
        </div>

        <div className="glassmorphic rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <Icon name="Star" size={24} className="text-yellow-500" />
            <span className="text-2xl font-bold text-foreground">{currentStats.pointsEarned}</span>
          </div>
          <p className="text-sm text-muted-foreground">Points Earned</p>
          <div className="mt-2 flex items-center text-xs text-green-600">
            <Icon name="TrendingUp" size={12} className="mr-1" />
            +15% from last period
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Skill Progress */}
        <div className="glassmorphic rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">Skill Progress</h3>
            <Button variant="ghost" size="sm" onClick={onViewDetails}>
              View All
            </Button>
          </div>
          
          <div className="space-y-4">
            {skillProgress.map((skill, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{skill.skill}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-muted-foreground">{skill.level}</span>
                    <span className="text-sm font-medium text-foreground">{skill.progress}%</span>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-spring ${skill.color}`}
                    style={{ width: `${skill.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Activity */}
        <div className="glassmorphic rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">Weekly Activity</h3>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Icon name="Clock" size={14} />
              <span>Hours per day</span>
            </div>
          </div>
          
          <div className="space-y-4">
            {weeklyActivity.map((day, index) => (
              <div key={index} className="flex items-center space-x-3">
                <span className="text-sm font-medium text-foreground w-8">{day.day}</span>
                <div className="flex-1 bg-muted rounded-full h-2">
                  <div
                    className="h-2 bg-primary rounded-full transition-spring"
                    style={{ width: `${(day.hours / maxHours) * 100}%` }}
                  />
                </div>
                <span className="text-sm text-muted-foreground w-12 text-right">{day.hours}h</span>
                <span className="text-xs text-muted-foreground w-8 text-right">{day.completed}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Achievements */}
      <div className="glassmorphic rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">Recent Achievements</h3>
          <Button variant="ghost" size="sm" onClick={onViewDetails}>
            View All
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recentAchievements.map((achievement) => (
            <div key={achievement.id} className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-spring">
              <div className="flex items-start space-x-3">
                <div className={`w-10 h-10 rounded-full bg-white/10 flex items-center justify-center ${achievement.color}`}>
                  <Icon name={achievement.icon} size={20} />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-foreground mb-1">{achievement.title}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{achievement.date}</span>
                    <span className="text-xs font-medium text-primary">+{achievement.points} pts</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProgressDashboard;
