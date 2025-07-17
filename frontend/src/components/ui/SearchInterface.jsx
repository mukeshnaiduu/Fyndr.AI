import React, { useState, useRef, useEffect } from 'react';
import Icon from '../AppIcon';
import Input from './Input';
import Button from './Button';
import { useRole } from './RoleBasedNavigation';

const SearchInterface = ({ className = '', placeholder, onSearch, onFilterChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({});
  const [recentSearches, setRecentSearches] = useState([
    'React Developer',
    'Frontend Engineer',
    'JavaScript',
    'Remote Jobs'
  ]);
  const [suggestions, setSuggestions] = useState([]);
  
  const { currentRole } = useRole();
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // Simulate search suggestions based on role and query
    if (searchQuery.length > 0) {
      const mockSuggestions = getRoleSuggestions(currentRole, searchQuery);
      setSuggestions(mockSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [searchQuery, currentRole]);

  const getRoleSuggestions = (role, query) => {
    const suggestionsByRole = {
      jobseeker: [
        'React Developer Jobs',
        'Frontend Engineer Positions',
        'JavaScript Courses',
        'Career Development',
        'Resume Building',
        'Interview Preparation'
      ],
      recruiter: [
        'Senior Developers',
        'Frontend Candidates',
        'JavaScript Experts',
        'Remote Workers',
        'Full-time Positions',
        'Contract Roles'
      ],
      admin: [
        'User Management',
        'System Analytics',
        'Platform Health',
        'User Reports',
        'System Logs',
        'Performance Metrics'
      ]
    };

    return (suggestionsByRole[role] || [])
      .filter(suggestion => 
        suggestion.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 5);
  };

  const getPlaceholderText = () => {
    if (placeholder) return placeholder;
    
    const placeholders = {
      jobseeker: 'Search jobs, courses, or skills...',
      recruiter: 'Search candidates, positions...',
      admin: 'Search users, reports, analytics...'
    };
    
    return placeholders[currentRole] || 'Search...';
  };

  const handleSearch = (query = searchQuery) => {
    if (query.trim()) {
      // Add to recent searches
      setRecentSearches(prev => {
        const updated = [query, ...prev.filter(item => item !== query)];
        return updated.slice(0, 5);
      });
      
      // Call parent search handler
      if (onSearch) {
        onSearch(query, filters);
      }
      
      setIsExpanded(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      setIsExpanded(false);
      inputRef.current?.blur();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    handleSearch(suggestion);
  };

  const handleRecentSearchClick = (search) => {
    setSearchQuery(search);
    handleSearch(search);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSuggestions([]);
    inputRef.current?.focus();
  };

  const handleFilterToggle = (filterKey, value) => {
    const newFilters = {
      ...filters,
      [filterKey]: filters[filterKey] === value ? null : value
    };
    setFilters(newFilters);
    
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  const getQuickFilters = () => {
    const filtersByRole = {
      jobseeker: [
        { key: 'type', value: 'remote', label: 'Remote', icon: 'Home' },
        { key: 'type', value: 'fulltime', label: 'Full-time', icon: 'Clock' },
        { key: 'level', value: 'senior', label: 'Senior', icon: 'TrendingUp' },
        { key: 'category', value: 'tech', label: 'Tech', icon: 'Code' }
      ],
      recruiter: [
        { key: 'experience', value: 'senior', label: 'Senior', icon: 'Award' },
        { key: 'availability', value: 'immediate', label: 'Available', icon: 'CheckCircle' },
        { key: 'location', value: 'remote', label: 'Remote OK', icon: 'Globe' },
        { key: 'skills', value: 'react', label: 'React', icon: 'Code' }
      ],
      admin: [
        { key: 'status', value: 'active', label: 'Active', icon: 'Activity' },
        { key: 'role', value: 'recruiter', label: 'Recruiters', icon: 'Users' },
        { key: 'period', value: 'today', label: 'Today', icon: 'Calendar' },
        { key: 'type', value: 'alerts', label: 'Alerts', icon: 'AlertTriangle' }
      ]
    };

    return filtersByRole[currentRole] || [];
  };

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      {/* Search Input */}
      <div className="relative">
        <Input
          ref={inputRef}
          type="search"
          placeholder={getPlaceholderText()}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsExpanded(true)}
          onKeyDown={handleKeyPress}
          className="pl-10 pr-10"
        />
        
        <Icon 
          name="Search" 
          size={18} 
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
        />
        
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            onClick={clearSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 hover:bg-white/10"
          >
            <Icon name="X" size={14} />
          </Button>
        )}
      </div>

      {/* Search Dropdown */}
      {isExpanded && (
        <div className="absolute top-full left-0 right-0 mt-2 glassmorphic border border-white/20 rounded-lg shadow-glassmorphic-lg z-50 max-h-96 overflow-hidden">
          {/* Quick Filters */}
          <div className="p-3 border-b border-white/10">
            <div className="text-xs font-medium text-muted-foreground mb-2">Quick Filters</div>
            <div className="flex flex-wrap gap-2">
              {getQuickFilters().map((filter) => (
                <Button
                  key={`${filter.key}-${filter.value}`}
                  variant={filters[filter.key] === filter.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFilterToggle(filter.key, filter.value)}
                  iconName={filter.icon}
                  iconPosition="left"
                  className="text-xs"
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="p-2 border-b border-white/10">
              <div className="text-xs font-medium text-muted-foreground mb-2 px-2">Suggestions</div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-white/10 transition-all duration-200"
                >
                  <Icon name="Search" size={16} className="text-muted-foreground" />
                  <span className="flex-1 text-left">{suggestion}</span>
                </button>
              ))}
            </div>
          )}

          {/* Recent Searches */}
          {recentSearches.length > 0 && suggestions.length === 0 && (
            <div className="p-2">
              <div className="text-xs font-medium text-muted-foreground mb-2 px-2">Recent Searches</div>
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleRecentSearchClick(search)}
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-white/10 transition-all duration-200"
                >
                  <Icon name="Clock" size={16} className="text-muted-foreground" />
                  <span className="flex-1 text-left">{search}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      setRecentSearches(prev => prev.filter(item => item !== search));
                    }}
                    className="h-6 w-6 hover:bg-white/10"
                  >
                    <Icon name="X" size={12} />
                  </Button>
                </button>
              ))}
            </div>
          )}

          {/* Empty State */}
          {suggestions.length === 0 && recentSearches.length === 0 && (
            <div className="p-8 text-center">
              <Icon name="Search" size={48} className="text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Start typing to search</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchInterface;
