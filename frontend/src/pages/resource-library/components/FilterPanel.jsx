import React, { useState } from 'react';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';
import Input from 'components/ui/Input';
import { Checkbox } from 'components/ui/Checkbox';

const FilterPanel = ({ isOpen, onClose, filters, onFiltersChange, isMobile }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const difficultyOptions = [
    { id: 'easy', label: 'Easy', count: 245 },
    { id: 'medium', label: 'Medium', count: 189 },
    { id: 'hard', label: 'Hard', count: 156 }
  ];

  const typeOptions = [
    { id: 'video', label: 'Video', icon: 'Play', count: 320 },
    { id: 'article', label: 'Article', icon: 'FileText', count: 180 },
    { id: 'practice', label: 'Practice Problem', icon: 'Code', count: 90 },
    { id: 'quiz', label: 'Quiz', icon: 'HelpCircle', count: 45 }
  ];

  const topicOptions = [
    { id: 'arrays', label: 'Arrays & Strings', count: 85 },
    { id: 'trees', label: 'Trees & Graphs', count: 72 },
    { id: 'dp', label: 'Dynamic Programming', count: 58 },
    { id: 'system-design', label: 'System Design', count: 45 },
    { id: 'behavioral', label: 'Behavioral', count: 38 },
    { id: 'databases', label: 'Databases', count: 32 },
    { id: 'networking', label: 'Networking', count: 28 },
    { id: 'security', label: 'Security', count: 25 }
  ];

  const statusOptions = [
    { id: 'not-started', label: 'Not Started', count: 420 },
    { id: 'in-progress', label: 'In Progress', count: 95 },
    { id: 'completed', label: 'Completed', count: 125 }
  ];

  const handleFilterChange = (category, value, checked) => {
    const newFilters = { ...localFilters };
    
    if (checked) {
      newFilters[category] = [...(newFilters[category] || []), value];
    } else {
      newFilters[category] = (newFilters[category] || []).filter(item => item !== value);
    }
    
    setLocalFilters(newFilters);
  };

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    if (isMobile) onClose();
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      difficulty: [],
      type: [],
      topics: [],
      status: [],
      duration: { min: 0, max: 120 }
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const getActiveFilterCount = () => {
    return Object.values(localFilters).reduce((count, filterArray) => {
      if (Array.isArray(filterArray)) {
        return count + filterArray.length;
      }
      return count;
    }, 0);
  };

  const FilterSection = ({ title, children }) => (
    <div className="space-y-3">
      <h4 className="font-medium text-foreground">{title}</h4>
      <div className="space-y-2">{children}</div>
    </div>
  );

  const content = (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h3 className="font-semibold text-foreground">Filters</h3>
          {getActiveFilterCount() > 0 && (
            <span className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded-full">
              {getActiveFilterCount()}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            Clear All
          </Button>
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <Icon name="X" size={20} />
            </Button>
          )}
        </div>
      </div>

      {/* Search within filters */}
      <div>
        <Input
          type="search"
          placeholder="Search topics..."
          className="w-full"
        />
      </div>

      {/* Difficulty */}
      <FilterSection title="Difficulty">
        {difficultyOptions.map((option) => (
          <div key={option.id} className="flex items-center justify-between">
            <Checkbox
              label={option.label}
              checked={(localFilters.difficulty || []).includes(option.id)}
              onChange={(e) => handleFilterChange('difficulty', option.id, e.target.checked)}
            />
            <span className="text-sm text-muted-foreground">{option.count}</span>
          </div>
        ))}
      </FilterSection>

      {/* Content Type */}
      <FilterSection title="Content Type">
        {typeOptions.map((option) => (
          <div key={option.id} className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={(localFilters.type || []).includes(option.id)}
                onChange={(e) => handleFilterChange('type', option.id, e.target.checked)}
              />
              <Icon name={option.icon} size={16} className="text-muted-foreground" />
              <span className="text-sm text-foreground">{option.label}</span>
            </div>
            <span className="text-sm text-muted-foreground">{option.count}</span>
          </div>
        ))}
      </FilterSection>

      {/* Topics */}
      <FilterSection title="Topics">
        <div className="max-h-48 overflow-y-auto space-y-2">
          {topicOptions.map((option) => (
            <div key={option.id} className="flex items-center justify-between">
              <Checkbox
                label={option.label}
                checked={(localFilters.topics || []).includes(option.id)}
                onChange={(e) => handleFilterChange('topics', option.id, e.target.checked)}
              />
              <span className="text-sm text-muted-foreground">{option.count}</span>
            </div>
          ))}
        </div>
      </FilterSection>

      {/* Status */}
      <FilterSection title="Progress Status">
        {statusOptions.map((option) => (
          <div key={option.id} className="flex items-center justify-between">
            <Checkbox
              label={option.label}
              checked={(localFilters.status || []).includes(option.id)}
              onChange={(e) => handleFilterChange('status', option.id, e.target.checked)}
            />
            <span className="text-sm text-muted-foreground">{option.count}</span>
          </div>
        ))}
      </FilterSection>

      {/* Duration Range */}
      <FilterSection title="Duration (minutes)">
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Input
              type="number"
              placeholder="Min"
              value={localFilters.duration?.min || 0}
              onChange={(e) => setLocalFilters({
                ...localFilters,
                duration: { ...localFilters.duration, min: parseInt(e.target.value) || 0 }
              })}
              className="w-20"
            />
            <span className="text-muted-foreground">to</span>
            <Input
              type="number"
              placeholder="Max"
              value={localFilters.duration?.max || 120}
              onChange={(e) => setLocalFilters({
                ...localFilters,
                duration: { ...localFilters.duration, max: parseInt(e.target.value) || 120 }
              })}
              className="w-20"
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>5 min</span>
            <span>120+ min</span>
          </div>
        </div>
      </FilterSection>

      {/* Apply Button for Mobile */}
      {isMobile && (
        <div className="pt-4 border-t border-white/10">
          <Button
            onClick={handleApplyFilters}
            className="w-full"
            iconName="Filter"
            iconPosition="left"
          >
            Apply Filters
          </Button>
        </div>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <>
        {/* Mobile Overlay */}
        {isOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="fixed top-0 right-0 bottom-0 w-80 max-w-[90vw] glassmorphic border-l border-white/20 overflow-y-auto">
              <div className="p-6">
                {content}
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Desktop Sidebar
  return (
    <div className="w-80 glassmorphic rounded-xl p-6 h-fit sticky top-20">
      {content}
    </div>
  );
};

export default FilterPanel;
