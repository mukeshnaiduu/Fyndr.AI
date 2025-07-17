import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';
import Select from 'components/ui/Select';

const AnalyticsSection = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('users');

  const timeRangeOptions = [
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' }
  ];

  const metricOptions = [
    { value: 'users', label: 'User Activity' },
    { value: 'content', label: 'Content Engagement' },
    { value: 'jobs', label: 'Job Applications' },
    { value: 'courses', label: 'Course Completions' }
  ];

  const userActivityData = [
    { name: 'Mon', active: 1200, new: 45, returning: 1155 },
    { name: 'Tue', active: 1350, new: 52, returning: 1298 },
    { name: 'Wed', active: 1180, new: 38, returning: 1142 },
    { name: 'Thu', active: 1420, new: 61, returning: 1359 },
    { name: 'Fri', active: 1650, new: 73, returning: 1577 },
    { name: 'Sat', active: 980, new: 29, returning: 951 },
    { name: 'Sun', active: 1100, new: 34, returning: 1066 }
  ];

  const contentEngagementData = [
    { name: 'Courses', value: 45, color: '#a78bfa' },
    { name: 'Job Listings', value: 30, color: '#4ade80' },
    { name: 'Forum Posts', value: 15, color: '#fbcfe8' },
    { name: 'AI Coach', value: 10, color: '#f59e0b' }
  ];

  const platformMetrics = [
    {
      title: 'Total Users',
      value: '12,847',
      change: '+8.2%',
      trend: 'up',
      icon: 'Users',
      color: 'text-primary'
    },
    {
      title: 'Active Sessions',
      value: '3,421',
      change: '+12.5%',
      trend: 'up',
      icon: 'Activity',
      color: 'text-success'
    },
    {
      title: 'Course Completions',
      value: '1,256',
      change: '+5.8%',
      trend: 'up',
      icon: 'BookOpen',
      color: 'text-accent'
    },
    {
      title: 'Job Applications',
      value: '2,834',
      change: '-2.1%',
      trend: 'down',
      icon: 'Briefcase',
      color: 'text-warning'
    }
  ];

  const topContent = [
    {
      title: 'React Advanced Patterns',
      type: 'Course',
      views: 2847,
      engagement: 89,
      rating: 4.8
    },
    {
      title: 'Senior Frontend Developer',
      type: 'Job',
      views: 1923,
      engagement: 76,
      rating: 4.6
    },
    {
      title: 'JavaScript Best Practices',
      type: 'Course',
      views: 1654,
      engagement: 82,
      rating: 4.7
    },
    {
      title: 'Full Stack Engineer',
      type: 'Job',
      views: 1432,
      engagement: 71,
      rating: 4.5
    }
  ];

  const handleExportReport = () => {
    console.log('Exporting analytics report...');
  };

  const getTrendIcon = (trend) => {
    return trend === 'up' ? 'TrendingUp' : 'TrendingDown';
  };

  const getTrendColor = (trend) => {
    return trend === 'up' ? 'text-success' : 'text-error';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Platform Analytics</h3>
          <p className="text-sm text-muted-foreground">
            Comprehensive insights and performance metrics
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Select
            options={timeRangeOptions}
            value={timeRange}
            onChange={setTimeRange}
            className="w-40"
          />
          <Button
            iconName="Download"
            iconPosition="left"
            onClick={handleExportReport}
          >
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {platformMetrics.map((metric, index) => (
          <div key={index} className="glassmorphic-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center`}>
                <Icon name={metric.icon} size={20} className={metric.color} />
              </div>
              <div className={`flex items-center space-x-1 text-sm ${getTrendColor(metric.trend)}`}>
                <Icon name={getTrendIcon(metric.trend)} size={14} />
                <span>{metric.change}</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">{metric.value}</div>
            <div className="text-sm text-muted-foreground">{metric.title}</div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Activity Chart */}
        <div className="glassmorphic-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-semibold text-foreground">User Activity</h4>
            <Select
              options={metricOptions}
              value={selectedMetric}
              onChange={setSelectedMetric}
              className="w-40"
            />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={userActivityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="name" 
                  stroke="rgba(255,255,255,0.6)"
                  fontSize={12}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.6)"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    backdropFilter: 'blur(10px)'
                  }}
                />
                <Bar dataKey="active" fill="#a78bfa" radius={[4, 4, 0, 0]} />
                <Bar dataKey="new" fill="#4ade80" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Content Engagement Chart */}
        <div className="glassmorphic-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-semibold text-foreground">Content Engagement</h4>
            <Button variant="ghost" size="sm" iconName="MoreHorizontal" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={contentEngagementData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {contentEngagementData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    backdropFilter: 'blur(10px)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {contentEngagementData.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-sm text-muted-foreground">{item.name}</span>
                <span className="text-sm font-medium text-foreground">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Content */}
      <div className="glassmorphic-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-lg font-semibold text-foreground">Top Performing Content</h4>
          <Button variant="ghost" size="sm" iconName="ExternalLink">
            View All
          </Button>
        </div>
        
        <div className="space-y-4">
          {topContent.map((content, index) => (
            <div key={index} className="flex items-center justify-between p-4 glassmorphic-surface rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Icon 
                    name={content.type === 'Course' ? 'BookOpen' : 'Briefcase'} 
                    size={20} 
                    className="text-primary" 
                  />
                </div>
                <div>
                  <h5 className="font-medium text-foreground">{content.title}</h5>
                  <p className="text-sm text-muted-foreground">{content.type}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-6 text-sm">
                <div className="text-center">
                  <div className="font-medium text-foreground">{content.views.toLocaleString()}</div>
                  <div className="text-muted-foreground">Views</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-foreground">{content.engagement}%</div>
                  <div className="text-muted-foreground">Engagement</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-foreground">{content.rating}</div>
                  <div className="text-muted-foreground">Rating</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Real-time Activity */}
      <div className="glassmorphic-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-lg font-semibold text-foreground">Real-time Activity</h4>
          <div className="flex items-center space-x-2 text-sm text-success">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
            <span>Live</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glassmorphic-surface p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Active Users</span>
              <Icon name="Users" size={16} className="text-primary" />
            </div>
            <div className="text-xl font-bold text-foreground">1,247</div>
            <div className="text-xs text-success">+23 in last 5 min</div>
          </div>
          
          <div className="glassmorphic-surface p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Page Views</span>
              <Icon name="Eye" size={16} className="text-accent" />
            </div>
            <div className="text-xl font-bold text-foreground">8,934</div>
            <div className="text-xs text-success">+156 in last 5 min</div>
          </div>
          
          <div className="glassmorphic-surface p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">API Calls</span>
              <Icon name="Zap" size={16} className="text-warning" />
            </div>
            <div className="text-xl font-bold text-foreground">45,672</div>
            <div className="text-xs text-success">+1,234 in last 5 min</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsSection;
