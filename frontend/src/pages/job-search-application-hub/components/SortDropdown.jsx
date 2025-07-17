import React, { useState, useRef, useEffect } from 'react';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';

const SortDropdown = ({ currentSort, onSortChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const sortOptions = [
    { value: 'relevance', label: 'Most Relevant', icon: 'Target' },
    { value: 'date', label: 'Most Recent', icon: 'Calendar' },
    { value: 'salary-high', label: 'Salary: High to Low', icon: 'TrendingUp' },
    { value: 'salary-low', label: 'Salary: Low to High', icon: 'TrendingDown' },
    { value: 'match', label: 'Best Match', icon: 'Award' },
    { value: 'company', label: 'Company A-Z', icon: 'Building' }
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getCurrentSortLabel = () => {
    const current = sortOptions.find(option => option.value === currentSort);
    return current ? current.label : 'Sort by';
  };

  const handleSortSelect = (sortValue) => {
    onSortChange(sortValue);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        iconName={isOpen ? "ChevronUp" : "ChevronDown"}
        iconPosition="right"
        className="min-w-40 justify-between"
      >
        {getCurrentSortLabel()}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 glassmorphic border border-white/20 rounded-lg shadow-glassmorphic-lg z-50">
          <div className="p-2">
            <div className="text-xs font-medium text-muted-foreground mb-2 px-2">Sort Options</div>
            {sortOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSortSelect(option.value)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                  currentSort === option.value
                    ? 'bg-primary/20 text-primary border border-primary/30' :'text-foreground hover:bg-white/10'
                }`}
              >
                <Icon name={option.icon} size={16} />
                <span className="flex-1 text-left">{option.label}</span>
                {currentSort === option.value && (
                  <Icon name="Check" size={14} className="text-primary" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SortDropdown;
