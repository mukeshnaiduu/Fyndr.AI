import React, { useState, useEffect } from 'react';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';
import Button from 'components/ui/Button';

const LiveLeaderboard = ({ hackathonId }) => {
  const [teams, setTeams] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('overall');
  const [isLive, setIsLive] = useState(true);

  const categories = [
    { id: 'overall', label: 'Overall', icon: 'Trophy' },
    { id: 'innovation', label: 'Innovation', icon: 'Lightbulb' },
    { id: 'technical', label: 'Technical', icon: 'Code' },
    { id: 'design', label: 'Design', icon: 'Palette' },
    { id: 'presentation', label: 'Presentation', icon: 'Presentation' }
  ];

  useEffect(() => {
    const mockTeams = [
      {
        id: 1,
        name: "AI Innovators",
        project: "HealthAI Assistant",
        members: [
          { name: "Sarah Chen", avatar: "https://images.unsplash.com/photo-1494790108755-2616b9c5e8b8?w=150" },
          { name: "Mike Johnson", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150" },
          { name: "Lisa Wang", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150" }
        ],
        score: 2850,
        previousRank: 2,
        currentRank: 1,
        badges: ["Innovation Leader", "Technical Excellence"],
        progress: 95,
        lastUpdate: "2 min ago",
        trend: "up"
      },
      {
        id: 2,
        name: "Blockchain Builders",
        project: "DeFi Micro-Investment Platform",
        members: [
          { name: "Alex Rodriguez", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150" },
          { name: "Emma Davis", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150" }
        ],
        score: 2720,
        previousRank: 1,
        currentRank: 2,
        badges: ["Blockchain Expert"],
        progress: 88,
        lastUpdate: "5 min ago",
        trend: "down"
      },
      {
        id: 3,
        name: "EcoTech Solutions",
        project: "Smart Environmental Monitor",
        members: [
          { name: "Maya Patel", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150" },
          { name: "David Kim", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150" },
          { name: "Anna Foster", avatar: "https://images.unsplash.com/photo-1494790108755-2616b9c5e8b8?w=150" },
          { name: "Tom Wilson", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150" }
        ],
        score: 2650,
        previousRank: 3,
        currentRank: 3,
        badges: ["Sustainability Champion"],
        progress: 82,
        lastUpdate: "1 min ago",
        trend: "stable"
      },
      {
        id: 4,
        name: "Code Crusaders",
        project: "Social Impact Web App",
        members: [
          { name: "John Doe", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150" },
          { name: "Emma Wilson", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150" }
        ],
        score: 2480,
        previousRank: 5,
        currentRank: 4,
        badges: ["Rising Star"],
        progress: 75,
        lastUpdate: "3 min ago",
        trend: "up"
      },
      {
        id: 5,
        name: "Data Dynamos",
        project: "ML-Powered Analytics Dashboard",
        members: [
          { name: "Rachel Green", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150" },
          { name: "Chris Brown", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150" },
          { name: "Sophie Turner", avatar: "https://images.unsplash.com/photo-1494790108755-2616b9c5e8b8?w=150" }
        ],
        score: 2350,
        previousRank: 4,
        currentRank: 5,
        badges: ["Data Science Pro"],
        progress: 70,
        lastUpdate: "7 min ago",
        trend: "down"
      }
    ];

    setTeams(mockTeams);
  }, [selectedCategory]);

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return { icon: 'Crown', color: 'text-warning' };
      case 2: return { icon: 'Medal', color: 'text-muted-foreground' };
      case 3: return { icon: 'Award', color: 'text-warning' };
      default: return { icon: 'Hash', color: 'text-muted-foreground' };
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return { icon: 'TrendingUp', color: 'text-success' };
      case 'down': return { icon: 'TrendingDown', color: 'text-error' };
      default: return { icon: 'Minus', color: 'text-muted-foreground' };
    }
  };

  const getRankChange = (current, previous) => {
    const change = previous - current;
    if (change > 0) return `+${change}`;
    if (change < 0) return change.toString();
    return '0';
  };

  return (
    <div className="glassmorphic rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Icon name="Trophy" size={24} className="text-warning" />
            <h2 className="text-xl font-semibold text-foreground">Live Leaderboard</h2>
          </div>
          {isLive && (
            <div className="flex items-center space-x-2 px-3 py-1 bg-success/10 text-success rounded-full border border-success/20">
              <div className="w-2 h-2 bg-success rounded-full pulse-glow"></div>
              <span className="text-sm font-medium">Live</span>
            </div>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsLive(!isLive)}
        >
          <Icon name={isLive ? "Pause" : "Play"} size={16} className="mr-2" />
          {isLive ? 'Pause' : 'Resume'}
        </Button>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center space-x-1 bg-white/5 rounded-lg p-1 mb-6 overflow-x-auto">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-spring whitespace-nowrap ${
              selectedCategory === category.id
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
            }`}
          >
            <Icon name={category.icon} size={16} />
            <span>{category.label}</span>
          </button>
        ))}
      </div>

      {/* Leaderboard */}
      <div className="space-y-3">
        {teams.map((team, index) => {
          const rankIcon = getRankIcon(team.currentRank);
          const trendIcon = getTrendIcon(team.trend);
          const rankChange = getRankChange(team.currentRank, team.previousRank);

          return (
            <div
              key={team.id}
              className={`bg-white/5 rounded-lg p-4 border transition-spring hover:shadow-elevation-1 ${
                team.currentRank <= 3 ? 'border-warning/20 bg-warning/5' : 'border-white/10'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-4">
                  {/* Rank */}
                  <div className="flex items-center space-x-2">
                    <Icon name={rankIcon.icon} size={20} className={rankIcon.color} />
                    <span className="text-lg font-bold text-foreground">#{team.currentRank}</span>
                    {team.trend !== 'stable' && (
                      <div className="flex items-center space-x-1">
                        <Icon name={trendIcon.icon} size={14} className={trendIcon.color} />
                        <span className={`text-xs font-medium ${trendIcon.color}`}>
                          {rankChange}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Team Info */}
                  <div>
                    <h3 className="font-semibold text-foreground">{team.name}</h3>
                    <p className="text-sm text-muted-foreground">{team.project}</p>
                  </div>
                </div>

                {/* Score */}
                <div className="text-right">
                  <p className="text-2xl font-bold text-foreground">{team.score.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">points</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">Project Progress</span>
                  <span className="text-xs text-foreground font-medium">{team.progress}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-spring"
                    style={{ width: `${team.progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Team Members and Badges */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {/* Team Members */}
                  <div className="flex items-center -space-x-2">
                    {team.members.slice(0, 4).map((member, memberIndex) => (
                      <Image
                        key={memberIndex}
                        src={member.avatar}
                        alt={member.name}
                        className="w-6 h-6 rounded-full border-2 border-card"
                      />
                    ))}
                    {team.members.length > 4 && (
                      <div className="w-6 h-6 rounded-full bg-white/10 border-2 border-card flex items-center justify-center">
                        <span className="text-xs font-medium text-foreground">+{team.members.length - 4}</span>
                      </div>
                    )}
                  </div>

                  {/* Badges */}
                  <div className="flex items-center space-x-2">
                    {team.badges.slice(0, 2).map((badge, badgeIndex) => (
                      <span
                        key={badgeIndex}
                        className="px-2 py-1 bg-accent/10 text-accent text-xs rounded-full border border-accent/20"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Last Update */}
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Updated {team.lastUpdate}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* View All Button */}
      <div className="mt-6 text-center">
        <Button variant="outline" size="sm">
          View Full Leaderboard
          <Icon name="ExternalLink" size={16} className="ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default LiveLeaderboard;
