import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';

const SortDropdown = ({ currentSort, onSortChange, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const sortOptions = [
    {
      value: 'relevance',
      label: 'Most Relevant',
      icon: 'Target',
      description: 'Based on your profile and preferences'
    },
    {
      value: 'match',
      label: 'Best Match',
      icon: 'Zap',
      description: 'Highest AI match percentage first'
    },
    {
      value: 'date',
      label: 'Recently Posted',
      icon: 'Clock',
      description: 'Newest job postings first'
    },
    {
      value: 'salary-high',
      label: 'Salary: High to Low',
      icon: 'TrendingUp',
      description: 'Highest paying jobs first'
    },
    {
      value: 'salary-low',
      label: 'Salary: Low to High',
      icon: 'TrendingDown',
      description: 'Lowest paying jobs first'
    }
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

  const handleSortSelect = (sortValue) => {
    onSortChange(sortValue);
    setIsOpen(false);
  };

  const currentSortOption = sortOptions.find(option => option.value === currentSort) || sortOptions[0];

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 min-w-[180px] justify-between"
      >
        <div className="flex items-center space-x-2">
          <Icon name={currentSortOption.icon} size={16} />
          <span className="text-sm">{currentSortOption.label}</span>
        </div>
        <Icon 
          name="ChevronDown" 
          size={16} 
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-0 mt-2 w-72 glass-card border border-glass-border rounded-card shadow-glass z-50"
          >
            <div className="p-2">
              <div className="px-3 py-2 border-b border-glass-border mb-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Sort Jobs By
                </p>
              </div>

              {sortOptions.map((option) => {
                const isActive = option.value === currentSort;

                return (
                  <motion.button
                    key={option.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSortSelect(option.value)}
                    className={`w-full flex items-start space-x-3 px-3 py-3 rounded-card text-left transition-all duration-200 ${
                      isActive 
                        ? 'bg-primary text-primary-foreground shadow-elevation-1' 
                        : 'hover:bg-muted'
                    }`}
                  >
                    <Icon 
                      name={option.icon} 
                      size={16} 
                      className={`mt-0.5 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`}
                    />
                    
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${
                        isActive ? 'text-primary-foreground' : 'text-foreground'
                      }`}>
                        {option.label}
                      </p>
                      <p className={`text-xs mt-1 ${
                        isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'
                      }`}>
                        {option.description}
                      </p>
                    </div>

                    {isActive && (
                      <Icon name="Check" size={16} className="text-primary-foreground mt-0.5" />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default SortDropdown;
