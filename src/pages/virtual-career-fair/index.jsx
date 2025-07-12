import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';
import Input from 'components/ui/Input';
import Select from 'components/ui/Select';
import CompanyBooth from './components/CompanyBooth';
import LiveSessionTabs from './components/LiveSessionTabs';
import WebinarPlayer from './components/WebinarPlayer';
import NetworkingLounge from './components/NetworkingLounge';
import EventSchedule from './components/EventSchedule';
import RecordingGallery from './components/RecordingGallery';
import AttendeeProfile from './components/AttendeeProfile';

const VirtualCareerFair = () => {
  const [activeTab, setActiveTab] = useState('booths');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [selectedWebinar, setSelectedWebinar] = useState(null);
  const [selectedAttendee, setSelectedAttendee] = useState(null);
  const [userProgress, setUserProgress] = useState({
    boothsVisited: 3,
    sessionsAttended: 2,
    connectionsMode: 5,
    totalBadges: 2
  });

  // Mock data for company booths
  const companyBooths = [
    {
      id: 1,
      companyName: 'TechCorp',
      industry: 'Technology',
      description: 'Leading AI and machine learning solutions company with innovative products and a collaborative work environment.',
      logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100',
      bannerImage: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400',
      isLive: true,
      visitorCount: 234,
      openPositions: 12,
      recruitersOnline: 3,
      nextSession: '2:30 PM',
      featuredRoles: [
        { title: 'Senior Software Engineer', location: 'Remote' },
        { title: 'ML Engineer', location: 'San Francisco' },
        { title: 'Product Manager', location: 'New York' }
      ],
      upcomingSessions: [
        { title: 'Company Overview', time: '2:30 PM' },
        { title: 'Tech Talk: AI Innovation', time: '4:00 PM' }
      ]
    },
    {
      id: 2,
      companyName: 'DataFlow Inc',
      industry: 'Data Analytics',
      description: 'Transforming businesses through data-driven insights and advanced analytics solutions.',
      logo: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100',
      bannerImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400',
      isLive: false,
      visitorCount: 189,
      openPositions: 8,
      recruitersOnline: 2,
      nextSession: '3:00 PM',
      featuredRoles: [
        { title: 'Data Scientist', location: 'Boston' },
        { title: 'Analytics Engineer', location: 'Remote' },
        { title: 'Data Engineer', location: 'Chicago' }
      ],
      upcomingSessions: [
        { title: 'Data Science Careers', time: '3:00 PM' },
        { title: 'Q&A with Data Team', time: '5:00 PM' }
      ]
    },
    {
      id: 3,
      companyName: 'CloudTech Solutions',
      industry: 'Cloud Computing',
      description: 'Pioneering cloud infrastructure and DevOps solutions for modern enterprises.',
      logo: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=100',
      bannerImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400',
      isLive: true,
      visitorCount: 156,
      openPositions: 15,
      recruitersOnline: 4,
      nextSession: '1:45 PM',
      featuredRoles: [
        { title: 'DevOps Engineer', location: 'Seattle' },
        { title: 'Cloud Architect', location: 'Remote' },
        { title: 'Site Reliability Engineer', location: 'Austin' }
      ],
      upcomingSessions: [
        { title: 'Cloud Architecture Workshop', time: '1:45 PM' },
        { title: 'DevOps Best Practices', time: '3:30 PM' }
      ]
    },
    {
      id: 4,
      companyName: 'MobileTech Corp',
      industry: 'Mobile Development',
      description: 'Creating next-generation mobile applications and cross-platform solutions.',
      logo: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=100',
      bannerImage: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400',
      isLive: false,
      visitorCount: 98,
      openPositions: 6,
      recruitersOnline: 1,
      nextSession: '4:15 PM',
      featuredRoles: [
        { title: 'iOS Developer', location: 'San Francisco' },
        { title: 'Android Developer', location: 'Los Angeles' },
        { title: 'React Native Developer', location: 'Remote' }
      ],
      upcomingSessions: [
        { title: 'Mobile Development Trends', time: '4:15 PM' },
        { title: 'Cross-Platform Solutions', time: '6:00 PM' }
      ]
    },
    {
      id: 5,
      companyName: 'SecureNet Solutions',
      industry: 'Cybersecurity',
      description: 'Protecting digital assets with cutting-edge cybersecurity solutions and threat intelligence.',
      logo: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=100',
      bannerImage: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400',
      isLive: true,
      visitorCount: 167,
      openPositions: 9,
      recruitersOnline: 2,
      nextSession: '2:00 PM',
      featuredRoles: [
        { title: 'Security Engineer', location: 'Washington DC' },
        { title: 'Penetration Tester', location: 'Remote' },
        { title: 'Security Analyst', location: 'New York' }
      ],
      upcomingSessions: [
        { title: 'Cybersecurity Careers', time: '2:00 PM' },
        { title: 'Threat Intelligence Workshop', time: '4:30 PM' }
      ]
    },
    {
      id: 6,
      companyName: 'FinTech Innovations',
      industry: 'Financial Technology',
      description: 'Revolutionizing financial services through blockchain, AI, and innovative payment solutions.',
      logo: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=100',
      bannerImage: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400',
      isLive: false,
      visitorCount: 143,
      openPositions: 11,
      recruitersOnline: 3,
      nextSession: '3:45 PM',
      featuredRoles: [
        { title: 'Blockchain Developer', location: 'Miami' },
        { title: 'Quantitative Analyst', location: 'New York' },
        { title: 'FinTech Product Manager', location: 'Remote' }
      ],
      upcomingSessions: [
        { title: 'FinTech Innovation Panel', time: '3:45 PM' },
        { title: 'Blockchain Careers', time: '5:30 PM' }
      ]
    }
  ];

  // Mock data for live sessions
  const liveSessions = [
    {
      id: 1,
      title: 'TechCorp AI Innovation Presentation',
      company: 'TechCorp',
      type: 'presentations',
      time: '2:30 PM - 3:15 PM',
      description: 'Discover how AI is transforming our products and the exciting career opportunities in machine learning.',
      participants: 234,
      maxParticipants: 500,
      isLive: true
    },
    {
      id: 2,
      title: 'Frontend Development Panel Discussion',
      company: 'Multiple Companies',
      type: 'panels',
      time: '3:00 PM - 4:00 PM',
      description: 'Industry experts discuss the latest trends in React, Vue, Angular, and modern frontend development.',
      participants: 189,
      maxParticipants: 300,
      isLive: true
    },
    {
      id: 3,
      title: 'One-on-One with DataFlow Recruiter',
      company: 'DataFlow Inc',
      type: 'meetings',
      time: '2:00 PM - 2:30 PM',
      description: 'Personal interview session for senior data scientist position.',
      participants: 1,
      maxParticipants: 1,
      isLive: false
    },
    {
      id: 4,
      title: 'Cloud Architecture Workshop',
      company: 'CloudTech Solutions',
      type: 'workshops',
      time: '1:45 PM - 3:15 PM',
      description: 'Hands-on workshop covering AWS, Azure, and GCP architecture patterns and best practices.',
      participants: 67,
      maxParticipants: 100,
      isLive: true
    }
  ];

  // Mock webinar data
  const mockWebinar = {
    id: 1,
    title: 'AI Innovation in Modern Software Development',
    company: 'TechCorp',
    presenter: 'Sarah Johnson, CTO',
    viewers: 234,
    duration: '23:45',
    totalDuration: '45:00'
  };

  // Mock attendee data
  const mockAttendee = {
    id: 1,
    name: 'Alex Chen',
    role: 'Senior Frontend Developer',
    company: 'TechStart Inc',
    location: 'San Francisco, CA',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    isOnline: true,
    isVerified: true,
    isConnected: false,
    bio: 'Passionate frontend developer with 5+ years of experience in React, Vue, and modern web technologies. Love building user-centric applications.',
    skills: ['React', 'Vue.js', 'TypeScript', 'Node.js', 'GraphQL', 'AWS'],
    interests: ['Web Development', 'UI/UX Design', 'Open Source', 'Tech Mentoring'],
    experience: [
      { title: 'Senior Frontend Developer', company: 'TechStart Inc', duration: '2022 - Present' },
      { title: 'Frontend Developer', company: 'WebSolutions', duration: '2020 - 2022' }
    ],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/alexchen',
      github: 'https://github.com/alexchen',
      twitter: 'https://twitter.com/alexchen'
    },
    connections: 156,
    sessionsAttended: 8,
    boothsVisited: 12
  };

  const industryOptions = [
    { value: 'all', label: 'All Industries' },
    { value: 'Technology', label: 'Technology' },
    { value: 'Data Analytics', label: 'Data Analytics' },
    { value: 'Cloud Computing', label: 'Cloud Computing' },
    { value: 'Mobile Development', label: 'Mobile Development' },
    { value: 'Cybersecurity', label: 'Cybersecurity' },
    { value: 'Financial Technology', label: 'Financial Technology' }
  ];

  const tabItems = [
    { id: 'booths', label: 'Company Booths', icon: 'Building', count: companyBooths.length },
    { id: 'sessions', label: 'Live Sessions', icon: 'Video', count: liveSessions.filter(s => s.isLive).length },
    { id: 'networking', label: 'Networking Lounge', icon: 'Users', count: 0 },
    { id: 'schedule', label: 'Event Schedule', icon: 'Calendar', count: 0 },
    { id: 'recordings', label: 'Recordings', icon: 'PlayCircle', count: 0 }
  ];

  const filteredBooths = companyBooths.filter(booth => {
    const matchesSearch = booth.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         booth.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesIndustry = selectedIndustry === 'all' || booth.industry === selectedIndustry;
    return matchesSearch && matchesIndustry;
  });

  const handleJoinSession = (sessionId) => {
    setSelectedWebinar(mockWebinar);
  };

  const handleVisitBooth = (boothId) => {
    setUserProgress(prev => ({
      ...prev,
      boothsVisited: prev.boothsVisited + 1
    }));
  };

  const handleAddToAgenda = (sessionId) => {
    console.log('Added session to agenda:', sessionId);
  };

  const handlePlayRecording = (recordingId) => {
    console.log('Playing recording:', recordingId);
  };

  const handleConnectAttendee = (attendeeId, note) => {
    console.log('Connecting to attendee:', attendeeId, 'with note:', note);
    setUserProgress(prev => ({
      ...prev,
      connectionsMode: prev.connectionsMode + 1
    }));
  };

  const handleMessageAttendee = (attendeeId) => {
    console.log('Messaging attendee:', attendeeId);
  };

  useEffect(() => {
    document.title = 'Virtual Career Fair - Fyndr.AI';
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="gradient-bg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Virtual Career Fair 2025
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              Connect with top companies, attend live sessions, and advance your career
            </p>
            <div className="flex items-center justify-center space-x-8 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Icon name="Building" size={16} />
                <span>{companyBooths.length} Companies</span>
              </div>
              <div className="flex items-center space-x-2">
                <Icon name="Video" size={16} />
                <span>{liveSessions.filter(s => s.isLive).length} Live Sessions</span>
              </div>
              <div className="flex items-center space-x-2">
                <Icon name="Users" size={16} />
                <span>500+ Attendees</span>
              </div>
            </div>
          </div>

          {/* Progress Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-card/50 backdrop-blur-sm rounded-lg p-4 text-center border border-border">
              <div className="text-2xl font-bold text-primary">{userProgress.boothsVisited}</div>
              <div className="text-sm text-muted-foreground">Booths Visited</div>
            </div>
            <div className="bg-card/50 backdrop-blur-sm rounded-lg p-4 text-center border border-border">
              <div className="text-2xl font-bold text-accent">{userProgress.sessionsAttended}</div>
              <div className="text-sm text-muted-foreground">Sessions Attended</div>
            </div>
            <div className="bg-card/50 backdrop-blur-sm rounded-lg p-4 text-center border border-border">
              <div className="text-2xl font-bold text-success">{userProgress.connectionsMode}</div>
              <div className="text-sm text-muted-foreground">Connections Made</div>
            </div>
            <div className="bg-card/50 backdrop-blur-sm rounded-lg p-4 text-center border border-border">
              <div className="text-2xl font-bold text-warning">{userProgress.totalBadges}</div>
              <div className="text-sm text-muted-foreground">Badges Earned</div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                type="search"
                placeholder="Search companies, roles, or technologies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-card/50 backdrop-blur-sm border-border"
              />
            </div>
            <Select
              options={industryOptions}
              value={selectedIndustry}
              onChange={setSelectedIndustry}
              placeholder="Filter by industry"
              className="w-full sm:w-48 bg-card/50 backdrop-blur-sm"
            />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-card border-b border-border sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto scrollbar-hide">
            {tabItems.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium transition-spring whitespace-nowrap min-h-touch ${
                  activeTab === tab.id
                    ? 'text-primary border-b-2 border-primary bg-primary/5' :'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <Icon name={tab.icon} size={16} />
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className="bg-primary/20 text-primary px-2 py-0.5 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'booths' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-foreground">Company Booths</h2>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Icon name="Filter" size={16} />
                <span>{filteredBooths.length} of {companyBooths.length} companies</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBooths.map((booth) => (
                <CompanyBooth
                  key={booth.id}
                  booth={booth}
                  onJoinSession={handleJoinSession}
                  onVisitBooth={handleVisitBooth}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'sessions' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-foreground mb-2">Live Sessions</h2>
              <p className="text-muted-foreground">Join live presentations, panels, and workshops</p>
            </div>
            
            <LiveSessionTabs
              sessions={liveSessions}
              onJoinSession={handleJoinSession}
            />
          </div>
        )}

        {activeTab === 'networking' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-foreground mb-2">Networking Lounge</h2>
              <p className="text-muted-foreground">Connect with other attendees in topic-based chat rooms</p>
            </div>
            
            <NetworkingLounge />
            
            <div className="mt-8">
              <Button
                variant="outline"
                onClick={() => setSelectedAttendee(mockAttendee)}
                iconName="User"
                iconPosition="left"
              >
                View Sample Profile
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'schedule' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-foreground mb-2">Event Schedule</h2>
              <p className="text-muted-foreground">Plan your day and manage your personal agenda</p>
            </div>
            
            <EventSchedule
              onJoinSession={handleJoinSession}
              onAddToAgenda={handleAddToAgenda}
            />
          </div>
        )}

        {activeTab === 'recordings' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-foreground mb-2">Recording Gallery</h2>
              <p className="text-muted-foreground">Watch recorded sessions and presentations</p>
            </div>
            
            <RecordingGallery onPlayRecording={handlePlayRecording} />
          </div>
        )}
      </div>

      {/* Quick Navigation */}
      <div className="fixed bottom-6 right-6 z-40">
        <div className="flex flex-col space-y-2">
          <Button
            variant="default"
            size="icon"
            className="rounded-full shadow-elevation-3 w-12 h-12"
            onClick={() => setActiveTab('networking')}
          >
            <Icon name="MessageCircle" size={20} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full shadow-elevation-3 w-12 h-12 bg-card"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <Icon name="ArrowUp" size={20} />
          </Button>
        </div>
      </div>

      {/* Related Pages Navigation */}
      <div className="bg-muted/30 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h3 className="text-xl font-semibold text-foreground mb-6">Continue Your Journey</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link
              to="/interview-practice-video-sessions"
              className="group p-6 bg-card rounded-xl shadow-elevation-1 hover:shadow-elevation-2 transition-spring border border-border"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon name="Video" size={20} className="text-primary" />
                </div>
                <h4 className="font-medium text-foreground group-hover:text-primary transition-spring">
                  Interview Practice
                </h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Practice interviews with AI-powered feedback and real-time coaching
              </p>
            </Link>

            <Link
              to="/resource-library"
              className="group p-6 bg-card rounded-xl shadow-elevation-1 hover:shadow-elevation-2 transition-spring border border-border"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Icon name="BookOpen" size={20} className="text-accent" />
                </div>
                <h4 className="font-medium text-foreground group-hover:text-accent transition-spring">
                  Resource Library
                </h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Access comprehensive learning materials and practice problems
              </p>
            </Link>

            <Link
              to="/mentorship-platform"
              className="group p-6 bg-card rounded-xl shadow-elevation-1 hover:shadow-elevation-2 transition-spring border border-border"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                  <Icon name="Users" size={20} className="text-success" />
                </div>
                <h4 className="font-medium text-foreground group-hover:text-success transition-spring">
                  Find a Mentor
                </h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Connect with industry professionals for personalized guidance
              </p>
            </Link>
          </div>
        </div>
      </div>

      {/* Modals */}
      {selectedWebinar && (
        <WebinarPlayer
          webinar={selectedWebinar}
          onClose={() => setSelectedWebinar(null)}
        />
      )}

      {selectedAttendee && (
        <AttendeeProfile
          attendee={selectedAttendee}
          onClose={() => setSelectedAttendee(null)}
          onConnect={handleConnectAttendee}
          onMessage={handleMessageAttendee}
        />
      )}
    </div>
  );
};

export default VirtualCareerFair;
