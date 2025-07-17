import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';
import Input from 'components/ui/Input';
import Select from 'components/ui/Select';

const NotificationFilters = ({ 
  filters, 
  onFiltersChange, 
  searchQuery, 
  onSearchChange,
  notificationCounts,
  onClearFilters 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'interview', label: 'Interview' },
    { value: 'application', label: 'Application' },
    { value: 'message', label: 'Message' },
    { value: 'system', label: 'System' },
    { value: 'reminder', label: 'Reminder' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'unread', label: 'Unread' },
    { value: 'read', label: 'Read' },
    { value: 'archived', label: 'Archived' }
  ];

  const priorityOptions = [
    { value: 'all', label: 'All Priority' },
    { value: 'high', label: 'High Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'low', label: 'Low Priority' }
  ];

  const dateRangeOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const handleFilterChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const hasActiveFilters = () => {
    return Object.values(filters).some(value => value !== 'all' && value !== '');
  };

  return (
    <div className="glassmorphic rounded-squircle p-4 border elevation-1">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Icon name="Filter" size={20} className="text-muted-foreground" />
          <h3 className="font-heading font-heading-semibold text-foreground">
            Filters
          </h3>
          {hasActiveFilters() && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary border border-primary/20">
              Active
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {hasActiveFilters() && (
            <Button
              variant="ghost"
              size="xs"
              onClick={onClearFilters}
              iconName="X"
              iconPosition="left"
              iconSize={12}
            >
              Clear
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            iconName={isExpanded ? "ChevronUp" : "ChevronDown"}
            iconSize={16}
          />
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <Input
          type="search"
          placeholder="Search notifications..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full"
        />
      </div>

      {/* Filter Controls */}
      <motion.div
        initial={false}
        animate={{ height: isExpanded ? 'auto' : 0, opacity: isExpanded ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <Select
            label="Type"
            options={typeOptions}
            value={filters.type}
            onChange={(value) => handleFilterChange('type', value)}
          />

          <Select
            label="Status"
            options={statusOptions}
            value={filters.status}
            onChange={(value) => handleFilterChange('status', value)}
          />

          <Select
            label="Priority"
            options={priorityOptions}
            value={filters.priority}
            onChange={(value) => handleFilterChange('priority', value)}
          />

          <Select
            label="Date Range"
            options={dateRangeOptions}
            value={filters.dateRange}
            onChange={(value) => handleFilterChange('dateRange', value)}
          />
        </div>

        {/* Custom Date Range */}
        {filters.dateRange === 'custom' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Input
              type="date"
              label="From Date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
            />
            <Input
              type="date"
              label="To Date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
            />
          </div>
        )}
      </motion.div>

      {/* Quick Filter Chips */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handleFilterChange('status', 'unread')}
          className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-caption spring-transition ${
            filters.status === 'unread' ?'bg-primary text-primary-foreground' :'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary'
          }`}
        >
          <Icon name="Mail" size={12} className="mr-1" />
          Unread ({notificationCounts.unread})
        </button>

        <button
          onClick={() => handleFilterChange('type', 'interview')}
          className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-caption spring-transition ${
            filters.type === 'interview' ?'bg-primary text-primary-foreground' :'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary'
          }`}
        >
          <Icon name="Calendar" size={12} className="mr-1" />
          Interviews ({notificationCounts.interview})
        </button>

        <button
          onClick={() => handleFilterChange('priority', 'high')}
          className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-caption spring-transition ${
            filters.priority === 'high' ?'bg-error text-error-foreground' :'bg-muted text-muted-foreground hover:bg-error/10 hover:text-error'
          }`}
        >
          <Icon name="AlertTriangle" size={12} className="mr-1" />
          High Priority ({notificationCounts.high})
        </button>

        <button
          onClick={() => handleFilterChange('dateRange', 'today')}
          className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-caption spring-transition ${
            filters.dateRange === 'today' ?'bg-accent text-accent-foreground' :'bg-muted text-muted-foreground hover:bg-accent/10 hover:text-accent'
          }`}
        >
          <Icon name="Clock" size={12} className="mr-1" />
          Today ({notificationCounts.today})
        </button>
      </div>

      {/* Ambient Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-squircle">
        <div className="absolute top-4 left-4 w-1 h-1 bg-primary/20 rounded-full particle-float"></div>
        <div className="absolute bottom-4 right-4 w-1.5 h-1.5 bg-accent/30 rounded-full particle-float" style={{ animationDelay: '3s' }}></div>
      </div>
    </div>
  );
};

export default NotificationFilters;
