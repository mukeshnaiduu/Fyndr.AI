import React from 'react';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';

const FilterChips = ({ activeFilters, onRemoveFilter, onClearAll }) => {
  const getFilterLabel = (key, value) => {
    const labels = {
      salary: `$${value}K+`,
      experience: `${value} years`,
      jobType: value,
      remote: 'Remote',
      skills: value,
      company: value,
      industry: value
    };
    return labels[key] || value;
  };

  const getFilterIcon = (key) => {
    const icons = {
      salary: 'DollarSign',
      experience: 'Clock',
      jobType: 'Briefcase',
      remote: 'Home',
      skills: 'Code',
      company: 'Building',
      industry: 'TrendingUp'
    };
    return icons[key] || 'Filter';
  };

  const filterEntries = Object.entries(activeFilters).filter(([key, value]) => 
    value !== null && value !== undefined && value !== ''
  );

  if (filterEntries.length === 0) {
    return null;
  }

  return (
    <div className="glassmorphic-surface p-4 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Icon name="Filter" size={16} className="text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Active Filters</span>
          <span className="text-xs text-muted-foreground">({filterEntries.length})</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          iconName="X"
          iconPosition="left"
          className="text-xs hover:bg-white/10"
        >
          Clear All
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {filterEntries.map(([key, value]) => (
          <div
            key={`${key}-${value}`}
            className="flex items-center space-x-2 px-3 py-1.5 bg-primary/20 text-primary border border-primary/30 rounded-full text-sm"
          >
            <Icon name={getFilterIcon(key)} size={14} />
            <span>{getFilterLabel(key, value)}</span>
            <button
              onClick={() => onRemoveFilter(key)}
              className="hover:bg-primary/30 rounded-full p-0.5 transition-colors duration-200"
            >
              <Icon name="X" size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FilterChips;
