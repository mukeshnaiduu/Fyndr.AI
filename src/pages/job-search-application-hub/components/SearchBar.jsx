import React, { useState, useRef, useEffect } from 'react';
import Icon from 'components/AppIcon';
import Input from 'components/ui/Input';
import Button from 'components/ui/Button';

const SearchBar = ({ onSearch, onLocationChange, searchQuery, location }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const searchRef = useRef(null);

  const jobSuggestions = [
    "Frontend Developer",
    "React Developer", 
    "JavaScript Engineer",
    "Full Stack Developer",
    "UI/UX Designer",
    "Product Manager",
    "Data Scientist",
    "DevOps Engineer",
    "Backend Developer",
    "Mobile Developer"
  ];

  const locationOptions = [
    "Remote",
    "New York, NY",
    "San Francisco, CA", 
    "Los Angeles, CA",
    "Chicago, IL",
    "Austin, TX",
    "Seattle, WA",
    "Boston, MA",
    "Denver, CO",
    "Miami, FL"
  ];

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
    if (searchQuery.length > 0) {
      const filtered = jobSuggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  }, [searchQuery]);

  useEffect(() => {
    if (location.length > 0) {
      const filtered = locationOptions.filter(option =>
        option.toLowerCase().includes(location.toLowerCase())
      );
      setLocationSuggestions(filtered.slice(0, 5));
    } else {
      setLocationSuggestions([]);
    }
  }, [location]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      onSearch(searchQuery);
      setIsExpanded(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    onSearch(suggestion);
    setIsExpanded(false);
  };

  const handleLocationSuggestionClick = (locationSuggestion) => {
    onLocationChange(locationSuggestion);
    setIsExpanded(false);
  };

  return (
    <div className="relative w-full" ref={searchRef}>
      <div className="glassmorphic-card p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Job Search Input */}
          <div className="flex-1 relative">
            <Input
              type="search"
              placeholder="Search jobs, companies, or keywords..."
              value={searchQuery}
              onChange={(e) => onSearch(e.target.value)}
              onFocus={() => setIsExpanded(true)}
              onKeyDown={handleKeyPress}
              className="pl-10"
            />
            <Icon 
              name="Search" 
              size={18} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
            />
          </div>

          {/* Location Input */}
          <div className="flex-1 lg:flex-none lg:w-64 relative">
            <Input
              type="text"
              placeholder="Location"
              value={location}
              onChange={(e) => onLocationChange(e.target.value)}
              onFocus={() => setIsExpanded(true)}
              className="pl-10"
            />
            <Icon 
              name="MapPin" 
              size={18} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
            />
          </div>

          {/* Search Button */}
          <Button
            variant="default"
            onClick={handleSearch}
            iconName="Search"
            iconPosition="left"
            className="lg:w-auto"
          >
            Search Jobs
          </Button>
        </div>
      </div>

      {/* Search Suggestions Dropdown */}
      {isExpanded && (suggestions.length > 0 || locationSuggestions.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 glassmorphic border border-white/20 rounded-lg shadow-glassmorphic-lg z-50 max-h-80 overflow-y-auto">
          {suggestions.length > 0 && (
            <div className="p-2 border-b border-white/10">
              <div className="text-xs font-medium text-muted-foreground mb-2 px-2">Job Suggestions</div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-white/10 transition-all duration-200"
                >
                  <Icon name="Briefcase" size={16} className="text-muted-foreground" />
                  <span className="flex-1 text-left">{suggestion}</span>
                </button>
              ))}
            </div>
          )}

          {locationSuggestions.length > 0 && (
            <div className="p-2">
              <div className="text-xs font-medium text-muted-foreground mb-2 px-2">Location Suggestions</div>
              {locationSuggestions.map((locationSuggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleLocationSuggestionClick(locationSuggestion)}
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-white/10 transition-all duration-200"
                >
                  <Icon name="MapPin" size={16} className="text-muted-foreground" />
                  <span className="flex-1 text-left">{locationSuggestion}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
