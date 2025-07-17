import React, { useState } from 'react';
import Icon from 'components/AppIcon';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const DEIMetrics = () => {
  const [selectedMetric, setSelectedMetric] = useState('diversity');

  const diversityData = [
    { name: 'Asian', value: 35, color: '#a78bfa' },
    { name: 'White', value: 40, color: '#4ade80' },
    { name: 'Hispanic', value: 15, color: '#f59e0b' },
    { name: 'Black', value: 8, color: '#ef4444' },
    { name: 'Other', value: 2, color: '#6b7280' }
  ];

  const genderData = [
    { name: 'Female', value: 45, color: '#fbcfe8' },
    { name: 'Male', value: 52, color: '#a78bfa' },
    { name: 'Non-binary', value: 3, color: '#4ade80' }
  ];

  const hiringTrendsData = [
    { month: 'Jan', diverse: 65, total: 100 },
    { month: 'Feb', diverse: 72, total: 110 },
    { month: 'Mar', diverse: 68, total: 95 },
    { month: 'Apr', diverse: 75, total: 120 },
    { month: 'May', diverse: 80, total: 130 },
    { month: 'Jun', diverse: 78, total: 125 }
  ];

  const inclusionMetrics = [
    {
      title: 'Diverse Candidates',
      value: '68%',
      change: '+5%',
      changeType: 'increase',
      icon: 'Users',
      description: 'Of total applicants'
    },
    {
      title: 'Inclusive Hiring',
      value: '72%',
      change: '+8%',
      changeType: 'increase',
      icon: 'Heart',
      description: 'Diverse hires this quarter'
    },
    {
      title: 'Pay Equity',
      value: '94%',
      change: '+2%',
      changeType: 'increase',
      icon: 'DollarSign',
      description: 'Salary parity score'
    },
    {
      title: 'Retention Rate',
      value: '89%',
      change: '-1%',
      changeType: 'decrease',
      icon: 'TrendingUp',
      description: 'Diverse employee retention'
    }
  ];

  const getChangeColor = (type) => {
    return type === 'increase' ? 'text-success' : 'text-error';
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glassmorphic p-3 border border-white/20 rounded-lg">
          <p className="text-foreground font-medium">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.dataKey}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glassmorphic-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">DEI Metrics</h2>
        <div className="flex items-center space-x-2">
          <select 
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="glassmorphic border border-white/20 rounded-lg px-3 py-2 text-sm text-foreground bg-transparent"
          >
            <option value="diversity">Diversity</option>
            <option value="gender">Gender</option>
            <option value="trends">Hiring Trends</option>
          </select>
          <button className="glassmorphic border border-white/20 rounded-lg p-2 hover:bg-white/10 transition-all duration-200">
            <Icon name="Download" size={16} />
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {inclusionMetrics.map((metric, index) => (
          <div key={index} className="glassmorphic-surface p-4 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon name={metric.icon} size={20} className="text-primary" />
              </div>
              <div className={`flex items-center space-x-1 ${getChangeColor(metric.changeType)}`}>
                <Icon 
                  name={metric.changeType === 'increase' ? 'TrendingUp' : 'TrendingDown'} 
                  size={14} 
                />
                <span className="text-sm font-medium">{metric.change}</span>
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-1">{metric.value}</h3>
              <p className="text-sm text-muted-foreground mb-1">{metric.title}</p>
              <p className="text-xs text-muted-foreground">{metric.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Diversity/Gender Pie Chart */}
        <div className="glassmorphic-surface p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            {selectedMetric === 'gender' ? 'Gender Distribution' : 'Diversity Breakdown'}
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={selectedMetric === 'gender' ? genderData : diversityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(selectedMetric === 'gender' ? genderData : diversityData).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {(selectedMetric === 'gender' ? genderData : diversityData).map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-sm text-foreground">{item.name}</span>
                <span className="text-sm text-muted-foreground">({item.value}%)</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hiring Trends Bar Chart */}
        <div className="glassmorphic-surface p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-foreground mb-4">Hiring Trends</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hiringTrendsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="diverse" fill="#a78bfa" radius={[4, 4, 0, 0]} />
                <Bar dataKey="total" fill="#4ade80" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center space-x-4 mt-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-primary"></div>
              <span className="text-sm text-foreground">Diverse Hires</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-accent"></div>
              <span className="text-sm text-foreground">Total Hires</span>
            </div>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="mt-6 glassmorphic-surface p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-foreground mb-3">Key Insights</h3>
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <Icon name="TrendingUp" size={16} className="text-success mt-1" />
            <div>
              <p className="text-sm text-foreground font-medium">Diversity hiring increased by 8% this quarter</p>
              <p className="text-xs text-muted-foreground">Strong progress towards 75% diversity target</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <Icon name="AlertTriangle" size={16} className="text-warning mt-1" />
            <div>
              <p className="text-sm text-foreground font-medium">Gender representation needs improvement</p>
              <p className="text-xs text-muted-foreground">Consider targeted outreach for underrepresented groups</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <Icon name="CheckCircle" size={16} className="text-success mt-1" />
            <div>
              <p className="text-sm text-foreground font-medium">Pay equity score above industry average</p>
              <p className="text-xs text-muted-foreground">Maintaining competitive and fair compensation</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DEIMetrics;
