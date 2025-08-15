import React from 'react';
import { motion } from 'framer-motion';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';

const FilterChips = ({ activeFilters, onFilterChange, onClearAll }) => {
  const filterOptions = [
    {
      key: 'location',
      label: 'Location',
      icon: 'MapPin',
      options: ['Remote', 'San Francisco', 'New York', 'Austin', 'Seattle']
    },
    {
      key: 'salary',
      label: 'Salary',
      icon: 'IndianRupee',
      options: ['₹5L-₹10L', '₹10L-₹15L', '₹15L-₹25L', '₹25L+']
    },
    {
      key: 'experience',
      label: 'Experience',
      icon: 'Award',
      options: ['Entry Level', '1-3 years', '3-5 years', '5+ years']
    },
    {
      key: 'jobType',
      label: 'Job Type',
      icon: 'Briefcase',
      options: ['Full-time', 'Part-time', 'Contract', 'Internship']
    }
  ];

  const handleFilterToggle = (filterKey, value) => {
    const currentValues = activeFilters[filterKey] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];

    onFilterChange(filterKey, newValues);
  };

  const getActiveCount = () => {
    return Object.values(activeFilters).reduce((count, values) => {
      return count + (Array.isArray(values) ? values.length : 0);
    }, 0);
  };

  const activeCount = getActiveCount();

  return (
    <div className="sticky top-32 z-20 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="px-4 lg:px-6 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Icon name="Filter" size={16} className="text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Filters</span>
            {activeCount > 0 && (
              <span className="px-2 py-1 bg-primary text-primary-foreground text-xs rounded-full">
                {activeCount}
              </span>
            )}
          </div>
          {activeCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearAll}
              className="text-muted-foreground hover:text-foreground"
            >
              Clear all
            </Button>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {filterOptions.map((filter) => (
            <div key={filter.key} className="flex-shrink-0">
              <div className="flex items-center space-x-1">
                {filter.options.map((option) => {
                  const isActive = activeFilters[filter.key]?.includes(option);

                  return (
                    <motion.button
                      key={option}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleFilterToggle(filter.key, option)}
                      className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${isActive
                          ? 'bg-primary text-primary-foreground shadow-elevation-1'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                        }`}
                    >
                      <Icon name={filter.icon} size={12} />
                      <span>{option}</span>
                      {isActive && (
                        <Icon name="X" size={12} className="ml-1" />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterChips;
