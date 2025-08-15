import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';
import Input from 'components/ui/Input';
import Select from 'components/ui/Select';
import HackathonCard from './components/HackathonCard';
import TeamFormationWidget from './components/TeamFormationWidget';
import LiveLeaderboard from './components/LiveLeaderboard';
import ProjectSubmissionPortal from './components/ProjectSubmissionPortal';
import PrizeShowcase from './components/PrizeShowcase';
import HackathonTimeline from './components/HackathonTimeline';

const HackathonsCompetitions = () => {
  const [activeTab, setActiveTab] = useState('discover');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [timelineFilter, setTimelineFilter] = useState('all');
  const [timelineView, setTimelineView] = useState('timeline');
  const [hackathons, setHackathons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const tabs = [
    { id: 'discover', label: 'Discover', icon: 'Search', description: 'Find hackathons and competitions' },
    { id: 'timeline', label: 'Timeline', icon: 'Calendar', description: 'View upcoming events' },
    { id: 'team', label: 'Team Formation', icon: 'Users', description: 'Create or join teams' },
    { id: 'leaderboard', label: 'Leaderboard', icon: 'Trophy', description: 'Live rankings and scores' },
    { id: 'submit', label: 'Submit Project', icon: 'Upload', description: 'Submit your project' },
    { id: 'prizes', label: 'Prizes', icon: 'Gift', description: 'View prizes and winners' }
  ];

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'ai-ml', label: 'AI & Machine Learning' },
    { value: 'blockchain', label: 'Blockchain & Web3' },
    { value: 'mobile', label: 'Mobile Development' },
    { value: 'web', label: 'Web Development' },
    { value: 'iot', label: 'IoT & Hardware' },
    { value: 'fintech', label: 'FinTech' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'sustainability', label: 'Sustainability' },
    { value: 'gaming', label: 'Gaming' }
  ];

  const difficultyOptions = [
    { value: 'all', label: 'All Levels' },
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'ongoing', label: 'Ongoing' },
    { value: 'registration-open', label: 'Registration Open' },
    { value: 'completed', label: 'Completed' }
  ];

  useEffect(() => {
    const mockHackathons = [
      {
        id: 1,
        title: "AI Innovation Challenge 2025",
        theme: "Healthcare AI Solutions",
        banner: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600",
        startDate: "July 15, 2025",
        endDate: "July 17, 2025",
        duration: "48 hours",
        status: "upcoming",
        difficulty: "Intermediate",
        category: "ai-ml",
        prizePool: "₹20,00,000",
        participants: 1250,
        teamsRegistered: 312,
        registrationDeadline: "2025-07-12T23:59:59Z",
        sponsors: ["TechCorp", "InnovateLab", "HealthTech", "AI Solutions"],
        featured: true,
        isRegistered: false,
        description: "Build innovative AI solutions that can revolutionize healthcare delivery and patient outcomes."
      },
      {
        id: 2,
        title: "Blockchain Revolution Hackathon",
        theme: "Decentralized Finance Solutions",
        banner: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=600",
        startDate: "July 20, 2025",
        endDate: "July 23, 2025",
        duration: "72 hours",
        status: "registration-open",
        difficulty: "Advanced",
        category: "blockchain",
        prizePool: "₹24,00,000",
        participants: 980,
        teamsRegistered: 245,
        registrationDeadline: "2025-07-18T23:59:59Z",
        sponsors: ["CryptoFund", "BlockchainLab", "DeFi Protocol"],
        featured: true,
        isRegistered: true,
        description: "Create decentralized financial solutions that promote financial inclusion and accessibility."
      },
      {
        id: 3,
        title: "Green Tech Challenge",
        theme: "Sustainable Technology Solutions",
        banner: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600",
        startDate: "July 25, 2025",
        endDate: "July 30, 2025",
        duration: "5 days",
        status: "upcoming",
        difficulty: "Beginner",
        category: "sustainability",
        prizePool: "₹12,00,000",
        participants: 1500,
        teamsRegistered: 375,
        registrationDeadline: "2025-07-22T23:59:59Z",
        sponsors: ["EcoTech", "GreenFund", "SustainableTech"],
        featured: false,
        isRegistered: false,
        description: "Develop technology solutions that address environmental challenges and promote sustainability."
      },
      {
        id: 4,
        title: "Mobile App Marathon",
        theme: "Cross-Platform Mobile Solutions",
        banner: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600",
        startDate: "August 1, 2025",
        endDate: "August 2, 2025",
        duration: "36 hours",
        status: "registration-open",
        difficulty: "Intermediate",
        category: "mobile",
        prizePool: "₹10,00,000",
        participants: 800,
        teamsRegistered: 200,
        registrationDeadline: "2025-07-30T23:59:59Z",
        sponsors: ["MobileTech", "AppStore", "DevTools"],
        featured: false,
        isRegistered: false,
        description: "Build innovative mobile applications that solve real-world problems across platforms."
      },
      {
        id: 5,
        title: "Web3 Developer Contest",
        theme: "Next-Generation Decentralized Apps",
        banner: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=600",
        startDate: "August 10, 2025",
        endDate: "August 17, 2025",
        duration: "7 days",
        status: "upcoming",
        difficulty: "Advanced",
        category: "web",
        prizePool: "₹32,00,000",
        participants: 1100,
        teamsRegistered: 275,
        registrationDeadline: "2025-08-07T23:59:59Z",
        sponsors: ["Web3Fund", "DecentralizedLab", "BlockchainVC"],
        featured: true,
        isRegistered: false,
        description: "Create the next generation of decentralized applications that will shape the future of the web."
      },
      {
        id: 6,
        title: "FinTech Innovation Sprint",
        theme: "Financial Technology Solutions",
        banner: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600",
        startDate: "August 15, 2025",
        endDate: "August 16, 2025",
        duration: "24 hours",
        status: "upcoming",
        difficulty: "Intermediate",
        category: "fintech",
        prizePool: "₹15,00,000",
        participants: 650,
        teamsRegistered: 162,
        registrationDeadline: "2025-08-12T23:59:59Z",
        sponsors: ["FinTechCorp", "BankingTech", "PaymentSolutions"],
        featured: false,
        isRegistered: false,
        description: "Develop innovative financial technology solutions that improve financial services and accessibility."
      }
    ];

    setHackathons(mockHackathons);
    setIsLoading(false);
  }, []);

  const filteredHackathons = hackathons.filter(hackathon => {
    const matchesSearch = hackathon.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hackathon.theme.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hackathon.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || hackathon.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || hackathon.difficulty.toLowerCase() === selectedDifficulty;
    const matchesStatus = selectedStatus === 'all' || hackathon.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesDifficulty && matchesStatus;
  });

  const handleRegister = (hackathonId) => {
    setHackathons(prev => prev.map(h =>
      h.id === hackathonId ? { ...h, isRegistered: true, teamsRegistered: h.teamsRegistered + 1 } : h
    ));
  };

  const handleViewDetails = (hackathonId) => {
    console.log('Viewing details for hackathon:', hackathonId);
  };

  const handleTeamAction = (action, data) => {
    console.log('Team action:', action, data);
  };

  const handleProjectSubmit = (submissionData) => {
    console.log('Project submitted:', submissionData);
  };

  const handleTimelineFilter = (filter) => {
    setTimelineFilter(filter);
  };

  const handleTimelineView = (view) => {
    setTimelineView(view);
  };

  const getTabContent = () => {
    switch (activeTab) {
      case 'discover':
        return (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="glassmorphic rounded-xl p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-4 space-y-4 lg:space-y-0">
                <div className="flex-1">
                  <Input
                    type="search"
                    placeholder="Search hackathons by title, theme, or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:w-auto lg:flex lg:space-x-4">
                  <Select
                    options={categoryOptions}
                    value={selectedCategory}
                    onChange={setSelectedCategory}
                    placeholder="Category"
                  />
                  <Select
                    options={difficultyOptions}
                    value={selectedDifficulty}
                    onChange={setSelectedDifficulty}
                    placeholder="Difficulty"
                  />
                  <Select
                    options={statusOptions}
                    value={selectedStatus}
                    onChange={setSelectedStatus}
                    placeholder="Status"
                  />
                </div>
              </div>
            </div>

            {/* Results */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-foreground">
                  {filteredHackathons.length} Hackathons Found
                </h2>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Icon name="Filter" size={16} className="mr-2" />
                    More Filters
                  </Button>
                  <Button variant="outline" size="sm">
                    <Icon name="ArrowUpDown" size={16} className="mr-2" />
                    Sort By
                  </Button>
                </div>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, index) => (
                    <div key={index} className="glassmorphic rounded-xl p-6 animate-pulse">
                      <div className="h-48 bg-white/10 rounded-lg mb-4"></div>
                      <div className="space-y-3">
                        <div className="h-4 bg-white/10 rounded w-3/4"></div>
                        <div className="h-3 bg-white/10 rounded w-1/2"></div>
                        <div className="h-3 bg-white/10 rounded w-2/3"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredHackathons.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredHackathons.map((hackathon) => (
                    <HackathonCard
                      key={hackathon.id}
                      hackathon={hackathon}
                      onRegister={handleRegister}
                      onViewDetails={handleViewDetails}
                    />
                  ))}
                </div>
              ) : (
                <div className="glassmorphic rounded-xl p-12 text-center">
                  <div className="w-16 h-16 bg-muted/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon name="Search" size={32} className="text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">No hackathons found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your search criteria or filters to find more results.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                      setSelectedDifficulty('all');
                      setSelectedStatus('all');
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        );

      case 'timeline':
        return (
          <HackathonTimeline
            onFilterChange={handleTimelineFilter}
            onViewChange={handleTimelineView}
          />
        );

      case 'team':
        return (
          <TeamFormationWidget
            hackathonId={2}
            onTeamAction={handleTeamAction}
          />
        );

      case 'leaderboard':
        return (
          <LiveLeaderboard hackathonId={2} />
        );

      case 'submit':
        return (
          <ProjectSubmissionPortal
            hackathonId={2}
            teamId={4}
            onSubmit={handleProjectSubmit}
          />
        );

      case 'prizes':
        return (
          <PrizeShowcase hackathonId={2} />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Hackathons & Competitions
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Discover exciting hackathons, form teams, compete with the best, and showcase your skills in our comprehensive competition platform.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="glassmorphic rounded-xl p-2 mb-8">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition-spring min-h-touch ${activeTab === tab.id
                    ? 'bg-primary text-primary-foreground shadow-elevation-1'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                  }`}
              >
                <Icon name={tab.icon} size={18} />
                <div className="text-left">
                  <div>{tab.label}</div>
                  <div className="text-xs opacity-80 hidden sm:block">{tab.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="mb-8">
          {getTabContent()}
        </div>

        {/* Quick Actions */}
        <div className="glassmorphic rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/mentorship-platform"
              className="flex items-center space-x-3 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-spring group"
            >
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-spring">
                <Icon name="Users" size={20} className="text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">Find Mentors</p>
                <p className="text-sm text-muted-foreground">Get guidance from experts</p>
              </div>
            </Link>

            <Link
              to="/resource-library"
              className="flex items-center space-x-3 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-spring group"
            >
              <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center group-hover:bg-accent/20 transition-spring">
                <Icon name="BookOpen" size={20} className="text-accent" />
              </div>
              <div>
                <p className="font-medium text-foreground">Study Resources</p>
                <p className="text-sm text-muted-foreground">Prepare with our library</p>
              </div>
            </Link>

            <Link
              to="/interview-practice-video-sessions"
              className="flex items-center space-x-3 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-spring group"
            >
              <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center group-hover:bg-success/20 transition-spring">
                <Icon name="Video" size={20} className="text-success" />
              </div>
              <div>
                <p className="font-medium text-foreground">Practice Interviews</p>
                <p className="text-sm text-muted-foreground">Mock interview sessions</p>
              </div>
            </Link>

            <Link
              to="/virtual-career-fair"
              className="flex items-center space-x-3 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-spring group"
            >
              <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center group-hover:bg-warning/20 transition-spring">
                <Icon name="Calendar" size={20} className="text-warning" />
              </div>
              <div>
                <p className="font-medium text-foreground">Career Fair</p>
                <p className="text-sm text-muted-foreground">Connect with recruiters</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HackathonsCompetitions;
