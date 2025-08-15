import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import Icon from 'components/AppIcon';

const SalaryInsights = ({ salaryData, marketData, growthData }) => {
  const [activeChart, setActiveChart] = useState('market');

  const chartTabs = [
    { id: 'market', label: 'Market Range', icon: 'BarChart3' },
    { id: 'growth', label: 'Growth Trends', icon: 'TrendingUp' }
  ];

  const formatSalary = (value) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card p-3 border border-glass-border rounded-card shadow-glass">
          <p className="text-sm font-medium text-foreground">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatSalary(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading font-semibold text-lg text-foreground">
          Salary Insights
        </h3>
        <div className="flex items-center space-x-1">
          <Icon name="TrendingUp" size={16} className="text-accent" />
          <span className="text-sm text-accent font-medium">Market Data</span>
        </div>
      </div>

      {/* Salary Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 bg-muted rounded-card">
          <div className="text-2xl font-bold text-primary mb-1">
            {formatSalary(salaryData.offered)}
          </div>
          <div className="text-sm text-muted-foreground">Offered Salary</div>
        </div>
        <div className="text-center p-4 bg-muted rounded-card">
          <div className="text-2xl font-bold text-success mb-1">
            {formatSalary(salaryData.market)}
          </div>
          <div className="text-sm text-muted-foreground">Market Average</div>
        </div>
        <div className="text-center p-4 bg-muted rounded-card">
          <div className="text-2xl font-bold text-accent mb-1">
            {formatSalary(salaryData.top10)}
          </div>
          <div className="text-sm text-muted-foreground">Top 10%</div>
        </div>
      </div>

      {/* Salary Comparison */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-foreground">Salary Comparison</span>
          <span className="text-sm text-muted-foreground">vs Market Average</span>
        </div>
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">This Position</span>
              <span className="text-xs font-medium text-foreground">{formatSalary(salaryData.offered)}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-500"
                style={{ width: `${(salaryData.offered / salaryData.top10) * 100}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Market Average</span>
              <span className="text-xs font-medium text-foreground">{formatSalary(salaryData.market)}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-success h-2 rounded-full transition-all duration-500"
                style={{ width: `${(salaryData.market / salaryData.top10) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Chart Tabs */}
      <div className="flex space-x-1 mb-4 bg-muted rounded-card p-1">
        {chartTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveChart(tab.id)}
            className={`flex items-center space-x-2 px-3 py-2 rounded text-sm font-medium transition-all duration-200 flex-1 justify-center ${activeChart === tab.id
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            <Icon name={tab.icon} size={14} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Charts */}
      <div className="h-64">
        {activeChart === 'market' ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={marketData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis
                dataKey="experience"
                tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }}
              />
              <YAxis
                tickFormatter={formatSalary}
                tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="min" fill="var(--color-muted)" name="Min Salary" />
              <Bar dataKey="avg" fill="var(--color-primary)" name="Avg Salary" />
              <Bar dataKey="max" fill="var(--color-accent)" name="Max Salary" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={growthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis
                dataKey="year"
                tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }}
              />
              <YAxis
                tickFormatter={formatSalary}
                tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="salary"
                stroke="var(--color-primary)"
                strokeWidth={3}
                dot={{ fill: 'var(--color-primary)', strokeWidth: 2, r: 4 }}
                name="Average Salary"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Insights */}
      <div className="mt-6 p-4 bg-accent/5 border border-accent/20 rounded-card">
        <div className="flex items-start space-x-3">
          <Icon name="Lightbulb" size={16} className="text-accent mt-0.5" />
          <div>
            <h5 className="font-medium text-accent mb-1">Salary Insight</h5>
            <p className="text-sm text-muted-foreground">
              This position offers {((salaryData.offered / salaryData.market - 1) * 100).toFixed(1)}%
              {salaryData.offered > salaryData.market ? ' above' : ' below'} market average.
              The salary range has grown by 12% over the past year in this location.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalaryInsights;
