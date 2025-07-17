import React, { useState, useEffect } from 'react';
import MainLayout from 'components/layout/MainLayout';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';
import ResourceCard from './components/ResourceCard';
import FilterPanel from './components/FilterPanel';
import FeaturedCarousel from './components/FeaturedCarousel';
import SearchBar from './components/SearchBar';
import ProgressDashboard from './components/ProgressDashboard';
import VideoPlayer from './components/VideoPlayer';

const ResourceLibrary = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    difficulty: [],
    type: [],
    topics: [],
    status: [],
    duration: { min: 0, max: 120 }
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedResource, setSelectedResource] = useState(null);
  const [showProgress, setShowProgress] = useState(false);
  const [bookmarkedResources, setBookmarkedResources] = useState(new Set());

  const tabs = [
    { id: 'all', label: 'All Resources', icon: 'BookOpen', count: 1250 },
    { id: 'dsa', label: 'DSA', icon: 'Code', count: 450 },
    { id: 'system-design', label: 'System Design', icon: 'Network', count: 180 },
    { id: 'interview-prep', label: 'Interview Prep', icon: 'MessageSquare', count: 320 },
    { id: 'career', label: 'Career Resources', icon: 'Briefcase', count: 300 }
  ];

  const sortOptions = [
    { value: 'relevance', label: 'Most Relevant' },
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'duration', label: 'Duration' },
    { value: 'difficulty', label: 'Difficulty' }
  ];

  const featuredResources = [
    {
      id: 'featured-1',
      title: 'Master System Design Interviews',
      description: 'Comprehensive guide to system design concepts with real-world examples and case studies from top tech companies.',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop',
      type: 'video',
      duration: '8 hours',
      rating: 4.9,
      enrollments: '12.5k',
      badge: 'trending'
    },
    {
      id: 'featured-2',
      title: 'Advanced Data Structures & Algorithms',
      description: 'Deep dive into complex algorithms and data structures with interactive coding challenges and visual explanations.',
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=400&fit=crop',
      type: 'practice',
      duration: '12 hours',
      rating: 4.8,
      enrollments: '8.3k',
      badge: 'popular'
    },
    {
      id: 'featured-3',
      title: 'Behavioral Interview Mastery',
      description: 'Learn to ace behavioral interviews with proven frameworks, real examples, and practice scenarios.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop',
      type: 'article',
      duration: '4 hours',
      rating: 4.7,
      enrollments: '15.2k',
      badge: 'new'
    }
  ];

  const mockResources = [
    {
      id: 1,
      title: 'Binary Search Tree Implementation',
      description: 'Learn to implement and manipulate binary search trees with comprehensive examples and practice problems.',
      thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&h=200&fit=crop',
      type: 'video',
      difficulty: 'Medium',
      duration: '45 min',
      rating: 4.8,
      tags: ['Trees', 'Data Structures', 'Algorithms'],
      progress: 65,
      isCompleted: false,
      isBookmarked: false,
      userRating: 0,
      category: 'dsa'
    },
    {
      id: 2,
      title: 'System Design: Chat Application',
      description: 'Design a scalable chat application covering WebSocket connections, message queuing, and database design.',
      thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=200&fit=crop',
      type: 'article',
      difficulty: 'Hard',
      duration: '2 hours',
      rating: 4.9,
      tags: ['System Design', 'WebSockets', 'Scalability'],
      progress: 0,
      isCompleted: false,
      isBookmarked: true,
      userRating: 5,
      category: 'system-design'
    },
    // Additional mock resources would go here
  ];

  const [resources, setResources] = useState([]);

  useEffect(() => {
    // In a real app, this would fetch from an API
    setResources(mockResources);
  }, []);

  // Filter resources based on active tab, search query and filters
  const filteredResources = resources
    .filter(resource => {
      // Filter by tab category
      if (activeTab !== 'all' && resource.category !== activeTab) {
        return false;
      }

      // Filter by search query
      if (searchQuery && !resource.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !resource.description.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Filter by resource type
      if (filters.type.length > 0 && !filters.type.includes(resource.type)) {
        return false;
      }

      // Filter by difficulty
      if (filters.difficulty.length > 0 && !filters.difficulty.includes(resource.difficulty)) {
        return false;
      }

      // Filter by status (completed/in-progress/not-started)
      if (filters.status.length > 0) {
        if (filters.status.includes('completed') && !resource.isCompleted) {
          return false;
        }
        if (filters.status.includes('in-progress') && !(resource.progress > 0 && resource.progress < 100)) {
          return false;
        }
        if (filters.status.includes('not-started') && resource.progress > 0) {
          return false;
        }
      }

      // Filter by duration
      const durationMinutes = parseInt(resource.duration);
      if (durationMinutes < filters.duration.min || durationMinutes > filters.duration.max) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return -1; // Mock sorting - in real app would use date
        case 'oldest':
          return 1; // Mock sorting - in real app would use date
        case 'rating':
          return b.rating - a.rating;
        case 'duration':
          return parseInt(a.duration) - parseInt(b.duration);
        case 'difficulty':
          const difficultyOrder = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };
          return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
        case 'relevance':
        default:
          return 0;
      }
    });

  const handleBookmark = (resourceId) => {
    // Update resources list
    setResources(prev =>
      prev.map(resource =>
        resource.id === resourceId
          ? { ...resource, isBookmarked: !resource.isBookmarked }
          : resource
      )
    );

    // Update bookmarked resources set
    setBookmarkedResources(prev => {
      const newSet = new Set(prev);
      if (newSet.has(resourceId)) {
        newSet.delete(resourceId);
      } else {
        newSet.add(resourceId);
      }
      return newSet;
    });
  };

  const handleRate = (resourceId, rating) => {
    setResources(prev =>
      prev.map(resource =>
        resource.id === resourceId
          ? { ...resource, userRating: rating }
          : resource
      )
    );
  };

  const handleShare = (resource) => {
    if (navigator.share) {
      navigator.share({
        title: resource.title,
        text: resource.description,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      // Show toast notification
    }
  };

  const handleResourceClick = (resource) => {
    if (resource.type === 'video') {
      setSelectedResource({
        ...resource,
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        instructor: 'Dr. Sarah Johnson'
      });
    }
  };

  const handleVideoProgress = (currentTime, duration) => {
    const progress = (currentTime / duration) * 100;
    setResources(prev =>
      prev.map(resource =>
        resource.id === selectedResource.id
          ? { ...resource, progress: Math.round(progress) }
          : resource
      )
    );
  };

  const handleVideoComplete = () => {
    setResources(prev =>
      prev.map(resource =>
        resource.id === selectedResource.id
          ? { ...resource, progress: 100, isCompleted: true }
          : resource
      )
    );
  };

  return (
    <MainLayout
      title="Resource Library"
      description="Comprehensive learning materials for interview preparation and career development"
    >
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Resource Library</h1>
              <p className="text-muted-foreground mt-2">
                Comprehensive learning materials for interview preparation and career development
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant={showProgress ? "default" : "outline"}
                onClick={() => setShowProgress(!showProgress)}
                iconName="BarChart3"
                iconPosition="left"
              >
                Progress
              </Button>
              <Button
                variant="outline"
                iconName="BookmarkPlus"
                iconPosition="left"
              >
                Bookmarks ({bookmarkedResources.size})
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <SearchBar
              onSearch={setSearchQuery}
              onSuggestionSelect={(suggestion) => {
                setSearchQuery(suggestion.text);
                if (suggestion.type === 'topic') {
                  setActiveTab('all');
                }
              }}
            />
          </div>

          {/* Featured Carousel */}
          <div className="mb-8">
            <FeaturedCarousel
              featuredResources={featuredResources}
              onResourceClick={handleResourceClick}
            />
          </div>
        </div>

        {/* Progress Dashboard */}
        {showProgress && (
          <div className="mb-8">
            <ProgressDashboard
              userProgress={{}}
              achievements={[]}
              onViewDetails={() => {}}
            />
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex items-center space-x-1 bg-white/5 rounded-lg p-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-spring whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                }`}
              >
                <Icon name={tab.icon} size={16} />
                <span>{tab.label}</span>
                <span className="text-xs opacity-75">({tab.count})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => setIsFilterOpen(true)}
              iconName="Filter"
              iconPosition="left"
              className="lg:hidden"
            >
              Filters
            </Button>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">
              {filteredResources.length} resources
            </span>
            
            <div className="flex items-center space-x-1 bg-white/5 rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('grid')}
                className="h-8 w-8"
              >
                <Icon name="Grid3X3" size={16} />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('list')}
                className="h-8 w-8"
              >
                <Icon name="List" size={16} />
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex gap-6">
          {/* Filter Panel - Desktop */}
          <div className="hidden lg:block">
            <FilterPanel
              isOpen={false}
              onClose={() => {}}
              filters={filters}
              onFiltersChange={setFilters}
              isMobile={false}
            />
          </div>

          {/* Resources Grid */}
          <div className="flex-1">
            {filteredResources.length > 0 ? (
              <div className={`grid gap-6 ${
                viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'
              }`}>
                {filteredResources.map((resource) => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    onBookmark={handleBookmark}
                    onRate={handleRate}
                    onShare={handleShare}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Icon name="Search" size={48} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No resources found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search or filters to find what you're looking for.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setFilters({
                      difficulty: [],
                      type: [],
                      topics: [],
                      status: [],
                      duration: { min: 0, max: 120 }
                    });
                  }}
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Load More */}
        {filteredResources.length > 0 && (
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Load More Resources
            </Button>
          </div>
        )}
      </main>

      {/* Mobile Filter Panel */}
      <FilterPanel
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        onFiltersChange={setFilters}
        isMobile={true}
      />

      {/* Video Player Modal */}
      {selectedResource && (
        <VideoPlayer
          videoData={selectedResource}
          onClose={() => setSelectedResource(null)}
          onProgress={handleVideoProgress}
          onComplete={handleVideoComplete}
        />
      )}
    </MainLayout>
  );
};

export default ResourceLibrary;
