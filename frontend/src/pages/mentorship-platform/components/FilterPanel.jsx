import React, { useState, useEffect } from 'react';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';
import Input from 'components/ui/Input';
import { Checkbox } from 'components/ui/Checkbox';

const FilterPanel = ({ isOpen, onClose, filters, onFiltersChange, onClearFilters, mentors }) => {
  const toINR = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  const [localFilters, setLocalFilters] = useState(filters);

  // Calculate dynamic max price from mentors
  const maxMentorPrice = React.useMemo(() => {
    if (!mentors || mentors.length === 0) return 200;
    return Math.max(...mentors.map(m => m.hourlyRate || 0), 200);
  }, [mentors]);

  // Keep localFilters in sync with parent filters (for mobile panel re-open)
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const industries = [
    'Technology', 'Finance', 'Healthcare', 'Marketing', 'Design',
    'Sales', 'Operations', 'Consulting', 'Education', 'Legal'
  ];

  const experienceLevels = [
    { value: '1-3', label: '1-3 years' },
    { value: '4-7', label: '4-7 years' },
    { value: '8-12', label: '8-12 years' },
    { value: '13+', label: '13+ years' }
  ];

  const availabilityOptions = [
    { value: 'available', label: 'Available Now' },
    { value: 'today', label: 'Available Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' }
  ];

  const handleFilterChange = (category, value, checked) => {
    const newFilters = { ...localFilters };
    if (category === 'priceRange') {
      newFilters.priceRange = value;
    } else if (category === 'minRating') {
      newFilters.minRating = value;
    } else if (category === 'search') {
      newFilters.search = value;
    } else {
      if (!newFilters[category]) {
        newFilters[category] = [];
      }
      if (checked) {
        newFilters[category] = [...newFilters[category], value];
      } else {
        newFilters[category] = newFilters[category].filter(item => item !== value);
      }
    }
    setLocalFilters(newFilters);

    // If desktop (lg+), apply immediately
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      onFiltersChange(newFilters);
    }
  };

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    onClose();
  };

  const handleClearAll = () => {
    const clearedFilters = {
      industries: [],
      experience: [],
      availability: [],
      priceRange: [0, 200],
      minRating: 0
    };
    setLocalFilters(clearedFilters);
    onClearFilters();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden" onClick={onClose} />
      )}

      {/* Filter Panel */}
      <div className={`
        fixed lg:relative top-0 right-0 h-full w-80 lg:w-full
        glassmorphic border-l lg:border-l-0 border-white/20
        transform transition-transform duration-300 z-50 lg:z-0
        ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        overflow-y-auto
      `}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">Filters</h3>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="text-muted-foreground hover:text-foreground"
              >
                Clear All
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="lg:hidden"
              >
                <Icon name="X" size={20} />
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="mb-6">
            <Input
              type="search"
              placeholder="Search mentors..."
              value={localFilters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full"
            />
          </div>

          {/* Industry Filter */}
          <div className="mb-6">
            <h4 className="font-medium text-foreground mb-3">Industry</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {industries.map((industry) => (
                <Checkbox
                  key={industry}
                  label={industry}
                  checked={localFilters.industries?.includes(industry) || false}
                  onChange={(e) => handleFilterChange('industries', industry, e.target.checked)}
                />
              ))}
            </div>
          </div>

          {/* Experience Level */}
          <div className="mb-6">
            <h4 className="font-medium text-foreground mb-3">Experience Level</h4>
            <div className="space-y-2">
              {experienceLevels.map((level) => (
                <Checkbox
                  key={level.value}
                  label={level.label}
                  checked={localFilters.experience?.includes(level.value) || false}
                  onChange={(e) => handleFilterChange('experience', level.value, e.target.checked)}
                />
              ))}
            </div>
          </div>

          {/* Availability */}
          <div className="mb-6">
            <h4 className="font-medium text-foreground mb-3">Availability</h4>
            <div className="space-y-2">
              {availabilityOptions.map((option) => (
                <Checkbox
                  key={option.value}
                  label={option.label}
                  checked={localFilters.availability?.includes(option.value) || false}
                  onChange={(e) => handleFilterChange('availability', option.value, e.target.checked)}
                />
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="mb-6">
            <h4 className="font-medium text-foreground mb-3">Price Range</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  placeholder="Min"
                  min={0}
                  max={maxMentorPrice}
                  value={localFilters.priceRange?.[0] ?? 0}
                  onChange={(e) => {
                    let min = parseInt(e.target.value);
                    let max = localFilters.priceRange?.[1] ?? maxMentorPrice;
                    if (isNaN(min)) min = 0;
                    if (min < 0) min = 0;
                    if (min > maxMentorPrice) min = maxMentorPrice;
                    handleFilterChange('priceRange', [min, max]);
                  }}
                  className="flex-1"
                />
                <span className="text-muted-foreground">-</span>
                <Input
                  type="number"
                  placeholder="Max"
                  min={0}
                  max={maxMentorPrice}
                  value={localFilters.priceRange?.[1] ?? maxMentorPrice}
                  onChange={(e) => {
                    let max = parseInt(e.target.value);
                    let min = localFilters.priceRange?.[0] ?? 0;
                    if (isNaN(max)) max = 0;
                    if (max > maxMentorPrice) max = maxMentorPrice;
                    if (max < 0) max = 0;
                    handleFilterChange('priceRange', [min, max]);
                  }}
                  className="flex-1"
                />
              </div>
              <div className="text-xs text-muted-foreground">
                {toINR(localFilters.priceRange?.[0] ?? 0)} - {toINR(localFilters.priceRange?.[1] ?? maxMentorPrice)} per hour
              </div>
            </div>
          </div>

          {/* Rating Filter */}
          <div className="mb-6">
            <h4 className="font-medium text-foreground mb-3">Minimum Rating</h4>
            <div className="space-y-2">
              {[4.5, 4.0, 3.5, 3.0].map((rating) => (
                <label key={rating} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="rating"
                    value={rating}
                    checked={localFilters.minRating === rating}
                    onChange={() => handleFilterChange('minRating', rating)}
                    className="w-4 h-4 text-primary"
                  />
                  <div className="flex items-center space-x-1">
                    <Icon name="Star" size={14} className="text-yellow-500 fill-current" />
                    <span className="text-sm text-foreground">{rating}+</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Apply Button */}
          <Button
            variant="default"
            fullWidth
            onClick={handleApplyFilters}
            className="lg:hidden"
          >
            Apply Filters
          </Button>
        </div>
      </div>
    </>
  );
};

export default FilterPanel;
