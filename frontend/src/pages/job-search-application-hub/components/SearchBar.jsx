import React, { useState, useRef, useEffect } from 'react';
import Icon from 'components/AppIcon';
import Input from 'components/ui/Input';
import Button from 'components/ui/Button';
import { fetchLocations } from 'services/locationsService';

const jobTypeOptions = [
  { value: '', label: 'Any' },
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'internship', label: 'Internship' }
];

const SearchBar = ({
  onSearch,
  onLocationChange,
  searchQuery,
  location,
  filters,
  onFilterChange
}) => {
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

  const [locationOptions, setLocationOptions] = useState([
    "Remote",
    "Bengaluru, Karnataka",
    "Mumbai, Maharashtra",
    "Hyderabad, Telangana",
    "Delhi NCR",
  ]);

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
    let ignore = false;
    (async () => {
      try {
        if (location.length === 0) { setLocationSuggestions([]); return; }
        const results = await fetchLocations(location);
        if (!ignore) {
          const list = results.map(r => r.display_name);
          // Always include 'Remote'
          const withRemote = ['Remote', ...list];
          setLocationSuggestions(withRemote.slice(0, 8));
        }
      } catch (e) {
        // fallback to local filter if API fails
        const filtered = locationOptions.filter(option =>
          option.toLowerCase().includes(location.toLowerCase())
        );
        setLocationSuggestions(filtered.slice(0, 5));
      }
    })();
    return () => { ignore = true; };
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
              placeholder="Location (e.g., Bengaluru, Mumbai)"
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

        {/* Inline Filters */}
        <div className="flex flex-wrap gap-4 mt-4 items-center">
          {/* Salary Range */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Salary:</span>
            <Input
              type="number"
              placeholder="Min"
              value={filters.salaryMin || ''}
              onChange={e => onFilterChange({ ...filters, salaryMin: e.target.value })}
              className="w-24"
            />
            <span>-</span>
            <Input
              type="number"
              placeholder="Max"
              value={filters.salaryMax || ''}
              onChange={e => onFilterChange({ ...filters, salaryMax: e.target.value })}
              className="w-24"
            />
          </div>

          {/* Job Type */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Type:</span>
            <select
              value={filters.jobType || ''}
              onChange={e => onFilterChange({ ...filters, jobType: e.target.value })}
              className="border rounded px-3 py-1 text-sm bg-background text-foreground min-w-[120px]"
            >
              {jobTypeOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Remote */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Remote:</span>
            <input
              type="checkbox"
              checked={!!filters.remote}
              onChange={e => onFilterChange({ ...filters, remote: e.target.checked })}
              className="accent-primary"
            />
          </div>

          {/* Skills */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Skills:</span>
            <Input
              type="text"
              placeholder="e.g. React"
              value={filters.skills || ''}
              onChange={e => onFilterChange({ ...filters, skills: e.target.value })}
              className="w-32"
            />
          </div>
        </div>
      </div>

      {/* Search Suggestions Dropdown */}
      {isExpanded && (suggestions.length > 0 || locationSuggestions.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background backdrop-blur-sm border border-border rounded-lg shadow-lg ring-1 ring-black/5 z-50 max-h-80 overflow-y-auto">
          {suggestions.length > 0 && (
            <div className="p-2 border-b border-white/10">
              <div className="text-xs font-medium text-muted-foreground mb-2 px-2">Job Suggestions</div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-muted transition-all duration-200"
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
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-muted transition-all duration-200"
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
