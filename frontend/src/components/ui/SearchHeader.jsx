import React, { useState, useRef, useEffect } from 'react';
import Icon from '../AppIcon';
import Button from './Button';

const SearchHeader = ({ 
  onSearch = () => {}, 
  onFilterChange = () => {},
  placeholder = "Search jobs, companies, skills...",
  showFilters = true,
  className = ''
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    location: '',
    jobType: '',
    experience: '',
    salary: ''
  });

  const searchRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Mock suggestions data
  const mockSuggestions = [
    { type: 'job', text: 'Frontend Developer', icon: 'Code' },
    { type: 'company', text: 'Google', icon: 'Building' },
    { type: 'skill', text: 'React.js', icon: 'Zap' },
    { type: 'location', text: 'San Francisco', icon: 'MapPin' },
    { type: 'job', text: 'Product Manager', icon: 'Briefcase' },
    { type: 'company', text: 'Microsoft', icon: 'Building' },
    { type: 'skill', text: 'Python', icon: 'Zap' },
    { type: 'location', text: 'New York', icon: 'MapPin' }
  ];

  const filterOptions = {
    jobType: ['Full-time', 'Part-time', 'Contract', 'Remote'],
    experience: ['Entry Level', '1-3 years', '3-5 years', '5+ years'],
    salary: ['$50k-$75k', '$75k-$100k', '$100k-$150k', '$150k+']
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current && 
        !searchRef.current.contains(event.target) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (value.length > 0) {
      const filtered = mockSuggestions.filter(item =>
        item.text.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 6));
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch(searchQuery);
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion.text);
    onSearch(suggestion.text);
    setShowSuggestions(false);
  };

  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...activeFilters, [filterType]: value };
    setActiveFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilter = (filterType) => {
    handleFilterChange(filterType, '');
  };

  const clearAllFilters = () => {
    const clearedFilters = Object.keys(activeFilters).reduce((acc, key) => {
      acc[key] = '';
      return acc;
    }, {});
    setActiveFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const activeFilterCount = Object.values(activeFilters).filter(Boolean).length;

  return (
    <div className={`sticky top-16 z-30 glass-card border-b border-glass-border ${className}`}>
      <div className="px-4 lg:px-6 py-4">
        {/* Search Bar */}
        <div className="relative" ref={searchRef}>
          <form onSubmit={handleSearchSubmit} className="relative">
            <Icon 
              name="Search" 
              size={20} 
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" 
            />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => searchQuery.length > 0 && setShowSuggestions(true)}
              placeholder={placeholder}
              className="w-full pl-12 pr-20 py-3 bg-background border border-border rounded-card text-base focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-300"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
              {showFilters && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="relative"
                >
                  <Icon name="Filter" size={16} />
                  {activeFilterCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </Button>
              )}
              <Button type="submit" size="sm">
                Search
              </Button>
            </div>
          </form>

          {/* Search Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div 
              ref={suggestionsRef}
              className="absolute top-full left-0 right-0 mt-2 glass-card border border-glass-border rounded-card shadow-glass max-h-64 overflow-y-auto z-50"
            >
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-muted transition-colors duration-200 first:rounded-t-card last:rounded-b-card"
                >
                  <Icon name={suggestion.icon} size={16} className="text-muted-foreground" />
                  <div>
                    <span className="text-sm font-medium">{suggestion.text}</span>
                    <span className="text-xs text-muted-foreground ml-2 capitalize">
                      {suggestion.type}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Active Filters Display */}
        {activeFilterCount > 0 && (
          <div className="flex items-center space-x-2 mt-3 flex-wrap">
            <span className="text-sm text-muted-foreground">Filters:</span>
            {Object.entries(activeFilters).map(([key, value]) => 
              value && (
                <div
                  key={key}
                  className="flex items-center space-x-1 bg-primary/10 text-primary px-2 py-1 rounded-card text-sm"
                >
                  <span className="capitalize">{key}: {value}</span>
                  <button
                    onClick={() => clearFilter(key)}
                    className="hover:bg-primary/20 rounded p-0.5 transition-colors"
                  >
                    <Icon name="X" size={12} />
                  </button>
                </div>
              )
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-xs"
            >
              Clear all
            </Button>
          </div>
        )}

        {/* Filter Panel */}
        {isFilterOpen && showFilters && (
          <div className="mt-4 p-4 bg-muted rounded-card border border-border">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Location Filter */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={activeFilters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  placeholder="Enter location"
                  className="w-full px-3 py-2 bg-background border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              {/* Job Type Filter */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Job Type
                </label>
                <select
                  value={activeFilters.jobType}
                  onChange={(e) => handleFilterChange('jobType', e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">All Types</option>
                  {filterOptions.jobType.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              {/* Experience Filter */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Experience
                </label>
                <select
                  value={activeFilters.experience}
                  onChange={(e) => handleFilterChange('experience', e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">All Levels</option>
                  {filterOptions.experience.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              {/* Salary Filter */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Salary Range
                </label>
                <select
                  value={activeFilters.salary}
                  onChange={(e) => handleFilterChange('salary', e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">All Ranges</option>
                  {filterOptions.salary.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchHeader;
