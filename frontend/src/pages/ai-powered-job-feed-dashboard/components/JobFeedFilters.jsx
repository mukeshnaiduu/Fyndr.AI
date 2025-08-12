import React from 'react';
import Button from 'components/ui/Button';

const JobFeedFilters = ({ activeFilters, onFilterChange }) => {
  const locationOptions = ['Remote', 'New York', 'San Francisco', 'London', 'Berlin'];
  const jobTypeOptions = ['Full-time', 'Part-time', 'Contract', 'Internship'];
  const experienceOptions = ['Entry', 'Mid', 'Senior', 'Lead'];

  const handleFilterToggle = (filterType, value) => {
    const currentValues = activeFilters[filterType] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    
    onFilterChange({
      ...activeFilters,
      [filterType]: newValues
    });
  };

  return (
    <div className="flex items-center space-x-4">
      {/* Location Filter */}
      <div className="relative">
        <select 
          className="bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          onChange={(e) => {
            if (e.target.value) {
              handleFilterToggle('location', e.target.value);
              e.target.value = '';
            }
          }}
          defaultValue=""
        >
          <option value="" disabled>Location</option>
          {locationOptions.map(location => (
            <option key={location} value={location}>{location}</option>
          ))}
        </select>
      </div>

      {/* Job Type Filter */}
      <div className="relative">
        <select 
          className="bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          onChange={(e) => {
            if (e.target.value) {
              handleFilterToggle('jobType', e.target.value);
              e.target.value = '';
            }
          }}
          defaultValue=""
        >
          <option value="" disabled>Job Type</option>
          {jobTypeOptions.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      {/* Experience Filter */}
      <div className="relative">
        <select 
          className="bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          onChange={(e) => {
            if (e.target.value) {
              handleFilterToggle('experience', e.target.value);
              e.target.value = '';
            }
          }}
          defaultValue=""
        >
          <option value="" disabled>Experience</option>
          {experienceOptions.map(exp => (
            <option key={exp} value={exp}>{exp}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default JobFeedFilters;
