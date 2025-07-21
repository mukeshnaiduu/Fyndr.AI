import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Icon from '../../../components/AppIcon';

export const AnalyticsReportsTab = ({ data, isEditing, onUpdate }) => {
  const [dateRange, setDateRange] = useState('30days');
  const [selectedMetrics, setSelectedMetrics] = useState(['applications', 'views', 'hires']);

  // Mock analytics data - in real app, this would come from API
  const analyticsData = {
    jobPostings: {
      total: data?.total_job_postings || 12,
      active: data?.active_job_postings || 8,
      filled: data?.filled_positions || 4,
    },
    applications: {
      total: data?.total_applications || 156,
      new: data?.new_applications || 23,
      reviewed: data?.reviewed_applications || 89,
    },
    performance: {
      viewsPerJob: data?.avg_views_per_job || 45,
      applicationRate: data?.application_rate || 12.5,
      hireRate: data?.hire_rate || 8.2,
    }
  };

  const metrics = [
    { id: 'applications', label: 'Applications', icon: 'FileText' },
    { id: 'views', label: 'Job Views', icon: 'Eye' },
    { id: 'hires', label: 'Successful Hires', icon: 'UserCheck' },
    { id: 'candidates', label: 'Candidate Quality', icon: 'Star' },
  ];

  const toggleMetric = (metricId) => {
    setSelectedMetrics(prev => 
      prev.includes(metricId) 
        ? prev.filter(id => id !== metricId)
        : [...prev, metricId]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Analytics & Reports</h3>
        <div className="flex items-center space-x-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="90days">Last 90 days</option>
            <option value="1year">Last year</option>
          </select>
          <Button variant="outline" size="sm">
            <Icon name="Download" size={16} className="mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-200">Total Job Postings</h4>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{analyticsData.jobPostings.total}</p>
            </div>
            <Icon name="Briefcase" size={32} className="text-blue-600" />
          </div>
          <div className="mt-4 text-sm text-blue-600 dark:text-blue-400">
            {analyticsData.jobPostings.active} active • {analyticsData.jobPostings.filled} filled
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-green-900 dark:text-green-200">Total Applications</h4>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">{analyticsData.applications.total}</p>
            </div>
            <Icon name="FileText" size={32} className="text-green-600" />
          </div>
          <div className="mt-4 text-sm text-green-600 dark:text-green-400">
            {analyticsData.applications.new} new • {analyticsData.applications.reviewed} reviewed
          </div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-purple-900 dark:text-purple-200">Hire Rate</h4>
              <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{analyticsData.performance.hireRate}%</p>
            </div>
            <Icon name="TrendingUp" size={32} className="text-purple-600" />
          </div>
          <div className="mt-4 text-sm text-purple-600 dark:text-purple-400">
            Above industry average
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-4">Performance Metrics</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Average Views per Job
            </label>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{analyticsData.performance.viewsPerJob}</div>
            <div className="text-sm text-green-600 dark:text-green-400">↗ 15% from last month</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Application Rate
            </label>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{analyticsData.performance.applicationRate}%</div>
            <div className="text-sm text-green-600 dark:text-green-400">↗ 8% from last month</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Quality Score
            </label>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">8.4/10</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Based on candidate feedback</div>
          </div>
        </div>
      </div>

      {/* Metrics Selector */}
      <div>
        <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-4">Track Metrics</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {metrics.map((metric) => (
            <div
              key={metric.id}
              onClick={() => toggleMetric(metric.id)}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedMetrics.includes(metric.id)
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon name={metric.icon} size={20} className={selectedMetrics.includes(metric.id) ? 'text-blue-600' : 'text-gray-400'} />
                <span className={`text-sm font-medium ${selectedMetrics.includes(metric.id) ? 'text-blue-900 dark:text-blue-200' : 'text-gray-700 dark:text-gray-300'}`}>
                  {metric.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-4">Recent Activity</h4>
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Icon name="User" size={16} className="text-green-600" />
                <span className="text-sm text-gray-900 dark:text-gray-100">New application for Senior Developer</span>
              </div>
              <span className="text-sm text-gray-500">2 hours ago</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Icon name="Eye" size={16} className="text-blue-600" />
                <span className="text-sm text-gray-900 dark:text-gray-100">Marketing Manager job viewed 15 times</span>
              </div>
              <span className="text-sm text-gray-500">5 hours ago</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Icon name="UserCheck" size={16} className="text-purple-600" />
                <span className="text-sm text-gray-900 dark:text-gray-100">Successful hire for UX Designer position</span>
              </div>
              <span className="text-sm text-gray-500">1 day ago</span>
            </div>
          </div>
        </div>
      </div>

      {/* Insights & Recommendations */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
        <h4 className="text-sm font-medium text-amber-900 dark:text-amber-200 mb-2 flex items-center">
          <Icon name="Lightbulb" size={16} className="mr-2" />
          Insights & Recommendations
        </h4>
        <ul className="text-sm text-amber-800 dark:text-amber-300 space-y-1">
          <li>• Your job postings get 20% more views when posted on Tuesdays</li>
          <li>• Consider adding salary ranges to increase application rates by 15%</li>
          <li>• Remote-friendly positions receive 3x more applications</li>
        </ul>
      </div>
    </div>
  );
};
