import React, { useState } from 'react';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';
import Button from 'components/ui/Button';
import Input from 'components/ui/Input';
import Select from 'components/ui/Select';

const RecordingGallery = ({ onPlayRecording }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  const recordings = [
    {
      id: 1,
      title: 'TechCorp AI Innovation Presentation',
      company: 'TechCorp',
      presenter: 'Sarah Johnson, CTO',
      type: 'presentation',
      duration: '45:32',
      views: 1234,
      date: '2025-07-08',
      thumbnail: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400',
      description: 'Comprehensive overview of AI solutions and career opportunities in machine learning.',
      tags: ['AI', 'Machine Learning', 'Career'],
      isBookmarked: true,
      rating: 4.8
    },
    {
      id: 2,
      title: 'Frontend Development Best Practices Panel',
      company: 'Multiple Companies',
      presenter: 'Industry Experts',
      type: 'panel',
      duration: '1:12:45',
      views: 892,
      date: '2025-07-08',
      thumbnail: 'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=400',
      description: 'Panel discussion covering React, Vue, Angular, and modern development workflows.',
      tags: ['Frontend', 'React', 'Vue', 'Angular'],
      isBookmarked: false,
      rating: 4.6
    },
    {
      id: 3,
      title: 'Cloud Architecture Deep Dive Workshop',
      company: 'CloudTech Solutions',
      presenter: 'Alex Rodriguez, Solutions Architect',
      type: 'workshop',
      duration: '1:28:15',
      views: 567,
      date: '2025-07-07',
      thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400',
      description: 'Hands-on workshop covering AWS, Azure, and GCP architecture patterns.',
      tags: ['Cloud', 'AWS', 'Azure', 'Architecture'],
      isBookmarked: true,
      rating: 4.9
    },
    {
      id: 4,
      title: 'Data Science Career Paths',
      company: 'DataFlow Inc',
      presenter: 'Dr. Emily Chen, Head of Data Science',
      type: 'presentation',
      duration: '38:20',
      views: 743,
      date: '2025-07-07',
      thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400',
      description: 'Exploring various career paths in data science and required skills.',
      tags: ['Data Science', 'Career', 'Analytics'],
      isBookmarked: false,
      rating: 4.7
    },
    {
      id: 5,
      title: 'Mobile Development Trends 2025',
      company: 'MobileTech Corp',
      presenter: 'James Wilson, Mobile Lead',
      type: 'presentation',
      duration: '42:18',
      views: 456,
      date: '2025-07-06',
      thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400',
      description: 'Latest trends in mobile development including React Native and Flutter.',
      tags: ['Mobile', 'React Native', 'Flutter'],
      isBookmarked: true,
      rating: 4.5
    },
    {
      id: 6,
      title: 'Cybersecurity in Modern Applications',
      company: 'SecureNet Solutions',
      presenter: 'Maria Garcia, Security Engineer',
      type: 'workshop',
      duration: '1:05:30',
      views: 321,
      date: '2025-07-06',
      thumbnail: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400',
      description: 'Security best practices for web and mobile applications.',
      tags: ['Security', 'Web Security', 'Best Practices'],
      isBookmarked: false,
      rating: 4.8
    }
  ];

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'presentation', label: 'Presentations' },
    { value: 'panel', label: 'Panel Discussions' },
    { value: 'workshop', label: 'Workshops' }
  ];

  const sortOptions = [
    { value: 'recent', label: 'Most Recent' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'duration', label: 'Duration' }
  ];

  const filteredRecordings = recordings
    .filter(recording => {
      const matchesSearch = recording.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          recording.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          recording.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesType = filterType === 'all' || recording.type === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.views - a.views;
        case 'rating':
          return b.rating - a.rating;
        case 'duration':
          return b.duration.localeCompare(a.duration);
        default:
          return new Date(b.date) - new Date(a.date);
      }
    });

  const handleBookmark = (recordingId) => {
    // Handle bookmark toggle
    console.log('Toggle bookmark for recording:', recordingId);
  };

  const handleShare = (recordingId) => {
    // Handle sharing
    console.log('Share recording:', recordingId);
  };

  const getTypeIcon = (type) => {
    const icons = {
      presentation: 'Presentation',
      panel: 'Users',
      workshop: 'BookOpen'
    };
    return icons[type] || 'Video';
  };

  const getTypeColor = (type) => {
    const colors = {
      presentation: 'text-primary bg-primary/10',
      panel: 'text-accent bg-accent/10',
      workshop: 'text-success bg-success/10'
    };
    return colors[type] || 'text-muted-foreground bg-muted/10';
  };

  return (
    <div className="bg-card rounded-xl shadow-elevation-2 border border-border">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Recording Gallery</h3>
            <p className="text-sm text-muted-foreground">{recordings.length} recorded sessions available</p>
          </div>
          <Button variant="outline" size="sm" iconName="Bookmark" iconPosition="left">
            My Bookmarks ({recordings.filter(r => r.isBookmarked).length})
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="search"
              placeholder="Search recordings, companies, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex space-x-2">
            <Select
              options={typeOptions}
              value={filterType}
              onChange={setFilterType}
              placeholder="Filter by type"
              className="w-40"
            />
            <Select
              options={sortOptions}
              value={sortBy}
              onChange={setSortBy}
              placeholder="Sort by"
              className="w-40"
            />
          </div>
        </div>
      </div>

      {/* Recordings Grid */}
      <div className="p-4">
        {filteredRecordings.length === 0 ? (
          <div className="text-center py-12">
            <Icon name="Video" size={48} className="text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No recordings found matching your criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecordings.map((recording) => (
              <div
                key={recording.id}
                className="bg-muted/30 rounded-lg overflow-hidden hover:shadow-elevation-2 transition-spring group"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video overflow-hidden">
                  <Image
                    src={recording.thumbnail}
                    alt={recording.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-spring"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-spring flex items-center justify-center">
                    <Button
                      variant="default"
                      size="lg"
                      onClick={() => onPlayRecording(recording.id)}
                      iconName="Play"
                      className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
                    >
                      Play
                    </Button>
                  </div>
                  
                  {/* Duration Badge */}
                  <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-xs font-medium">
                    {recording.duration}
                  </div>
                  
                  {/* Type Badge */}
                  <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(recording.type)}`}>
                    <Icon name={getTypeIcon(recording.type)} size={12} className="inline mr-1" />
                    {recording.type}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-foreground line-clamp-2 flex-1">
                      {recording.title}
                    </h4>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleBookmark(recording.id)}
                      className={`ml-2 ${recording.isBookmarked ? 'text-warning' : 'text-muted-foreground'}`}
                    >
                      <Icon name={recording.isBookmarked ? "Bookmark" : "BookmarkPlus"} size={16} />
                    </Button>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2">{recording.company} • {recording.presenter}</p>
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{recording.description}</p>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {recording.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  {/* Stats */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1">
                        <Icon name="Eye" size={12} />
                        <span>{recording.views}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Icon name="Star" size={12} />
                        <span>{recording.rating}</span>
                      </div>
                    </div>
                    <span>{new Date(recording.date).toLocaleDateString()}</span>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex space-x-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => onPlayRecording(recording.id)}
                      className="flex-1"
                      iconName="Play"
                      iconPosition="left"
                    >
                      Watch
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleShare(recording.id)}
                      iconName="Share"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecordingGallery;
