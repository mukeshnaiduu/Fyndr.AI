import React, { useState, useEffect, useRef } from 'react';
import Icon from 'components/AppIcon';
import Input from 'components/ui/Input';
import Button from 'components/ui/Button';

const SearchBar = ({ onSearch, onSuggestionSelect }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState([]);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Mock suggestions data
  const mockSuggestions = [
    { id: 1, text: 'Binary Search Trees', type: 'topic', icon: 'Search' },
    { id: 2, text: 'System Design Fundamentals', type: 'topic', icon: 'Search' },
    { id: 3, text: 'Dynamic Programming', type: 'topic', icon: 'Search' },
    { id: 4, text: 'React Hooks Tutorial', type: 'resource', icon: 'Play' },
    { id: 5, text: 'Two Pointers Technique', type: 'topic', icon: 'Search' },
    { id: 6, text: 'Database Design Patterns', type: 'topic', icon: 'Search' },
    { id: 7, text: 'Behavioral Interview Questions', type: 'resource', icon: 'FileText' },
    { id: 8, text: 'Graph Algorithms', type: 'topic', icon: 'Search' },
    { id: 9, text: 'Microservices Architecture', type: 'resource', icon: 'Play' },
    { id: 10, text: 'Coding Interview Patterns', type: 'topic', icon: 'Search' }
  ];

  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (query.length > 0) {
      const filtered = mockSuggestions.filter(suggestion =>
        suggestion.text.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 8));
      setShowSuggestions(true);
      setSelectedIndex(-1);
    } else {
      setSuggestions(recentSearches.slice(0, 5));
      setShowSuggestions(query.length === 0 && recentSearches.length > 0);
    }
  }, [query, recentSearches]);

  const handleSearch = (searchQuery = query) => {
    if (searchQuery.trim()) {
      // Add to recent searches
      const newRecentSearches = [
        { id: Date.now(), text: searchQuery, type: 'recent', icon: 'Clock' },
        ...recentSearches.filter(item => item.text !== searchQuery)
      ].slice(0, 10);
      
      setRecentSearches(newRecentSearches);
      localStorage.setItem('recentSearches', JSON.stringify(newRecentSearches));
      
      onSearch(searchQuery);
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion.text);
    handleSearch(suggestion.text);
    onSuggestionSelect(suggestion);
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSuggestionClick(suggestions[selectedIndex]);
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
    setShowSuggestions(false);
  };

  const removeRecentSearch = (searchToRemove) => {
    const updated = recentSearches.filter(item => item.text !== searchToRemove.text);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const getIconForType = (type) => {
    switch (type) {
      case 'topic': return 'Search';
      case 'resource': return 'BookOpen';
      case 'recent': return 'Clock';
      default: return 'Search';
    }
  };

  return (
    <div className="relative w-full max-w-2xl">
      {/* Search Input */}
      <div className="relative">
        <Input
          ref={inputRef}
          type="search"
          placeholder="Search resources, topics, or content..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          className="w-full pl-12 pr-12 py-3 text-base glassmorphic border-white/20 focus:border-primary/50"
        />
        
        {/* Search Icon */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          <Icon name="Search" size={20} className="text-muted-foreground" />
        </div>

        {/* Clear Button */}
        {query && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setQuery('');
              setShowSuggestions(false);
              inputRef.current?.focus();
            }}
            className="absolute right-12 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <Icon name="X" size={16} />
          </Button>
        )}

        {/* Search Button */}
        <Button
          onClick={() => handleSearch()}
          variant="ghost"
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-primary"
        >
          <Icon name="Search" size={16} />
        </Button>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div 
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-2 glassmorphic rounded-xl border border-white/20 shadow-elevation-3 z-50 max-h-80 overflow-y-auto"
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-white/10">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-foreground">
                {query ? 'Suggestions' : 'Recent Searches'}
              </h4>
              {!query && recentSearches.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearRecentSearches}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear All
                </Button>
              )}
            </div>
          </div>

          {/* Suggestions List */}
          <div className="py-2">
            {suggestions.length > 0 ? (
              suggestions.map((suggestion, index) => (
                <button
                  key={suggestion.id}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`w-full px-4 py-3 text-left hover:bg-white/5 transition-spring flex items-center justify-between group ${
                    index === selectedIndex ? 'bg-primary/10' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon 
                      name={getIconForType(suggestion.type)} 
                      size={16} 
                      className="text-muted-foreground group-hover:text-primary" 
                    />
                    <span className="text-foreground group-hover:text-primary">
                      {suggestion.text}
                    </span>
                    {suggestion.type === 'topic' && (
                      <span className="text-xs text-muted-foreground bg-secondary/30 px-2 py-1 rounded-full">
                        Topic
                      </span>
                    )}
                  </div>
                  
                  {suggestion.type === 'recent' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeRecentSearch(suggestion);
                      }}
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground"
                    >
                      <Icon name="X" size={12} />
                    </Button>
                  )}
                </button>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-muted-foreground">
                <Icon name="Search" size={24} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No suggestions found</p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          {query && (
            <div className="border-t border-white/10 p-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSearch()}
                className="w-full justify-start text-primary hover:text-primary hover:bg-primary/10"
                iconName="Search"
                iconPosition="left"
              >
                Search for "{query}"
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Backdrop */}
      {showSuggestions && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowSuggestions(false)}
        />
      )}
    </div>
  );
};

export default SearchBar;
