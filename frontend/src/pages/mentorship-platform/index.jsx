import React, { useState, useEffect } from 'react';
import MainLayout from 'components/layout/MainLayout';
import SidebarLayout from 'components/layout/SidebarLayout';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';
import Input from 'components/ui/Input';
import Select from 'components/ui/Select';
import MentorCard from './components/MentorCard';
import FilterPanel from './components/FilterPanel';
import MentorProfileModal from './components/MentorProfileModal';
import BookingModal from './components/BookingModal';
import ChatModal from './components/ChatModal';
import BookingDashboard from './components/BookingDashboard';

import { useNavigate } from 'react-router-dom';

const MentorshipPlatform = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (!isAuthenticated) {
      navigate('/authentication-login-register');
    }
  }, [navigate]);
  const [mentors, setMentors] = useState([]);
  const [filteredMentors, setFilteredMentors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [isBookingDashboardOpen, setIsBookingDashboardOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [filters, setFilters] = useState({
    industries: [],
    experience: [],
    availability: [],
    priceRange: [0, 200],
    minRating: 0,
    search: ''
  });

  // Mock mentor data
  const mockMentors = [
    {
      id: 1,
      name: 'Sarah Johnson',
      title: 'Senior Software Engineer at Google',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b9a1e2b4?w=150&h=150&fit=crop&crop=face',
      expertise: ['React', 'Node.js', 'System Design', 'Career Growth', 'Technical Leadership'],
      experience: 8,
      rating: 4.9,
      reviewCount: 127,
      hourlyRate: 120,
      availability: 'available',
      totalSessions: 340,
      responseTime: '2 hours',
      successRate: 96,
      bio: `I'm a Senior Software Engineer at Google with 8+ years of experience in full-stack development. I specialize in React, Node.js, and system design. I've mentored over 100 developers and helped them advance their careers in tech.\n\nMy approach focuses on practical skills, real-world problem-solving, and career strategy. Whether you're preparing for interviews, looking to advance your career, or need guidance on technical decisions, I'm here to help.`,
      industries: ['Technology'],
      sessionTypes: ['consultation', 'mentorship', 'group']
    },
    {
      id: 2,
      name: 'Michael Chen',
      title: 'Product Manager at Meta',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      expertise: ['Product Strategy', 'Data Analysis', 'User Research', 'Agile', 'Leadership'],
      experience: 6,
      rating: 4.8,
      reviewCount: 89,
      hourlyRate: 100,
      availability: 'busy',
      totalSessions: 245,
      responseTime: '1 hour',
      successRate: 94,
      bio: `Product Manager at Meta with 6 years of experience building consumer products used by millions. I've led cross-functional teams and launched several successful features.\n\nI help aspiring PMs understand the role, develop product sense, and navigate the interview process. My sessions cover product strategy, data-driven decision making, and stakeholder management.`,
      industries: ['Technology'],
      sessionTypes: ['consultation', 'mentorship']
    },
    {
      id: 3,
      name: 'Emily Rodriguez',title: 'UX Design Lead at Airbnb',avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      expertise: ['UX Design', 'Design Systems', 'User Research', 'Prototyping', 'Design Leadership'],
      experience: 7,
      rating: 4.9,
      reviewCount: 156,
      hourlyRate: 110,
      availability: 'available',totalSessions: 298,responseTime: '3 hours',
      successRate: 98,
      bio: `UX Design Lead at Airbnb with 7 years of experience creating user-centered designs for global products. I've built and led design teams and established design systems.\n\nI mentor designers at all levels, from career switchers to senior designers looking to move into leadership. My sessions cover design process, portfolio reviews, and career advancement strategies.`,
      industries: ['Technology', 'Design'],
      sessionTypes: ['consultation', 'mentorship', 'group']
    },
    {
      id: 4,
      name: 'David Kim',
      title: 'Data Scientist at Netflix',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      expertise: ['Machine Learning', 'Python', 'Statistics', 'Data Visualization', 'AI'],
      experience: 5,
      rating: 4.7,
      reviewCount: 73,
      hourlyRate: 95,
      availability: 'available',
      totalSessions: 187,
      responseTime: '4 hours',
      successRate: 92,
      bio: `Data Scientist at Netflix working on recommendation systems and content optimization. I have 5 years of experience in machine learning and data science.\n\nI help aspiring data scientists break into the field and current practitioners advance their skills. My sessions cover ML fundamentals, Python programming, and real-world project guidance.`,
      industries: ['Technology'],
      sessionTypes: ['consultation', 'mentorship']
    },
    {
      id: 5,
      name: 'Lisa Wang',
      title: 'Marketing Director at Spotify',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
      expertise: ['Digital Marketing', 'Growth Strategy', 'Brand Management', 'Analytics', 'Team Leadership'],
      experience: 9,
      rating: 4.8,
      reviewCount: 112,
      hourlyRate: 105,
      availability: 'offline',
      totalSessions: 267,
      responseTime: '2 hours',
      successRate: 95,
      bio: `Marketing Director at Spotify with 9 years of experience in digital marketing and growth strategy. I've led campaigns that reached millions of users globally.\n\nI mentor marketing professionals looking to advance their careers and entrepreneurs seeking marketing guidance. My sessions cover growth strategy, brand building, and marketing analytics.`,
      industries: ['Marketing', 'Technology'],
      sessionTypes: ['consultation', 'mentorship', 'group']
    },
    {
      id: 6,
      name: 'James Thompson',title: 'VP of Sales at Salesforce',avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face',
      expertise: ['Sales Strategy', 'Team Management', 'B2B Sales', 'Negotiation', 'Leadership'],
      experience: 12,
      rating: 4.9,
      reviewCount: 203,
      hourlyRate: 150,
      availability: 'available',totalSessions: 456,responseTime: '1 hour',
      successRate: 97,
      bio: `VP of Sales at Salesforce with 12 years of experience in B2B sales and team leadership. I've built and scaled sales teams from startup to enterprise level.\n\nI help sales professionals at all levels improve their skills and advance their careers. My sessions cover sales strategy, negotiation techniques, and leadership development.`,
      industries: ['Sales', 'Technology'],
      sessionTypes: ['consultation', 'mentorship', 'group']
    }
  ];

  const sortOptions = [
    { value: 'rating', label: 'Highest Rated' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'experience', label: 'Most Experienced' },
    { value: 'sessions', label: 'Most Sessions' }
  ];

  useEffect(() => {
    // Check for saved language preference
    const savedLanguage = localStorage.getItem('language') || 'en';
    setCurrentLanguage(savedLanguage);
    
    // Initialize mentors
    setMentors(mockMentors);
    setFilteredMentors(mockMentors);
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [mentors, filters, sortBy, searchQuery]);

  const applyFiltersAndSort = () => {
    let filtered = [...mentors];

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(mentor =>
        mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mentor.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mentor.expertise.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply filters
    if (filters.industries.length > 0) {
      filtered = filtered.filter(mentor =>
        mentor.industries.some(industry => filters.industries.includes(industry))
      );
    }

    if (filters.experience.length > 0) {
      filtered = filtered.filter(mentor => {
        return filters.experience.some(range => {
          const [min, max] = range.split('-').map(v => v === '+' ? Infinity : parseInt(v));
          return mentor.experience >= min && (max === Infinity || mentor.experience <= max);
        });
      });
    }

    if (filters.availability.length > 0) {
      filtered = filtered.filter(mentor => {
        if (filters.availability.includes('available')) {
          return mentor.availability === 'available';
        }
        return true; // For other availability filters, show all for now
      });
    }

    if (filters.priceRange) {
      filtered = filtered.filter(mentor =>
        mentor.hourlyRate >= filters.priceRange[0] && mentor.hourlyRate <= filters.priceRange[1]
      );
    }

    if (filters.minRating > 0) {
      filtered = filtered.filter(mentor => mentor.rating >= filters.minRating);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'price-low':
          return a.hourlyRate - b.hourlyRate;
        case 'price-high':
          return b.hourlyRate - a.hourlyRate;
        case 'experience':
          return b.experience - a.experience;
        case 'sessions':
          return b.totalSessions - a.totalSessions;
        default:
          return 0;
      }
    });

    setFilteredMentors(filtered);
  };

  const handleViewProfile = (mentor) => {
    setSelectedMentor(mentor);
    setIsProfileModalOpen(true);
  };

  const handleStartChat = (mentor) => {
    setSelectedMentor(mentor);
    setIsChatModalOpen(true);
  };

  const handleBookSession = (mentor) => {
    setSelectedMentor(mentor);
    setIsBookingModalOpen(true);
  };

  const handleConfirmBooking = (bookingData) => {
    console.log('Booking confirmed:', bookingData);
    // Here you would typically send the booking data to your backend
    // For now, we'll just show a success message alert('Session booked successfully!');
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      industries: [],
      experience: [],
      availability: [],
      priceRange: [0, 200],
      minRating: 0,
      search: ''
    };
    setFilters(clearedFilters);
  };

  return (
    <MainLayout
      title="Mentorship Platform"
      description="Connect with industry professionals for career guidance through our comprehensive mentorship platform"
      fullWidth
      noPadding
    >
      <div className="min-h-screen bg-background dark:bg-background">
        {/* Header */}
        <div className="glassmorphic border-b border-white/20 sticky top-16 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">Find Your Mentor</h1>
                <p className="text-muted-foreground">
                  Connect with industry professionals for personalized career guidance
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  iconName="Calendar"
                  iconPosition="left"
                  onClick={() => setIsBookingDashboardOpen(true)}
                >
                  My Bookings
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  onClick={() => setIsFilterOpen(true)}
                >
                  <Icon name="Filter" size={20} />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters - Desktop */}
            <div className="hidden lg:block w-80 flex-shrink-0">
              <div className="sticky top-32">
                <FilterPanel
                  isOpen={true}
                  onClose={() => {}}
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  onClearFilters={handleClearFilters}
                  mentors={mentors}
                />
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {/* Search and Sort */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <Input
                    type="search"
                    placeholder="Search mentors, skills, or companies..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Select
                  options={sortOptions}
                  value={sortBy}
                  onChange={setSortBy}
                  className="w-full sm:w-48"
                />
              </div>

              {/* Results Count */}
              <div className="flex items-center justify-between mb-6">
                <p className="text-muted-foreground">
                  {filteredMentors.length} mentor{filteredMentors.length !== 1 ? 's' : ''} found
                </p>
                <div className="flex items-center space-x-2">
                  <Icon name="Users" size={16} className="text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {filteredMentors.filter(m => m.availability === 'available').length} available now
                  </span>
                </div>
              </div>

              {/* Mentor Grid */}
              {filteredMentors.length === 0 ? (
                <div className="text-center py-12">
                  <Icon name="Search" size={48} className="text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No mentors found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your search criteria or filters
                  </p>
                  <Button variant="outline" onClick={handleClearFilters}>
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredMentors.map((mentor) => (
                    <MentorCard
                      key={mentor.id}
                      mentor={mentor}
                      onViewProfile={handleViewProfile}
                      onStartChat={handleStartChat}
                      onBookSession={handleBookSession}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Filter Panel (only render on mobile and when open) */}
        {isFilterOpen && (
          <div className="lg:hidden">
            <FilterPanel
              isOpen={isFilterOpen}
              onClose={() => setIsFilterOpen(false)}
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onClearFilters={handleClearFilters}
              mentors={mentors}
            />
          </div>
        )}

        {/* Modals */}
        <MentorProfileModal
          mentor={selectedMentor}
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          onBookSession={handleBookSession}
          onStartChat={handleStartChat}
        />

        <BookingModal
          mentor={selectedMentor}
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          onConfirmBooking={handleConfirmBooking}
        />

        <ChatModal
          mentor={selectedMentor}
          isOpen={isChatModalOpen}
          onClose={() => setIsChatModalOpen(false)}
          onBookSession={handleBookSession}
        />

        <BookingDashboard
          isOpen={isBookingDashboardOpen}
          onClose={() => setIsBookingDashboardOpen(false)}
        />
      </div>
    </MainLayout>
  );
};

export default MentorshipPlatform;

