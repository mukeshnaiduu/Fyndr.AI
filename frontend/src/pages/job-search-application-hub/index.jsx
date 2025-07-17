import React, { useState, useEffect } from 'react';

import MainLayout from 'components/layout/MainLayout'
import SidebarLayout from 'components/layout/SidebarLayout';
import SearchBar from './components/SearchBar';
import FilterChips from './components/FilterChips';
import JobCard from './components/JobCard';
// import FilterSidebar from './components/FilterSidebar';
import SortDropdown from './components/SortDropdown';
import JobDetailModal from './components/JobDetailModal';
import SavedJobsSection from './components/SavedJobsSection';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';

const JobSearchApplicationHub = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState('relevance');
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isJobDetailOpen, setIsJobDetailOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentView, setCurrentView] = useState('search'); // 'search' or 'saved'

  // Mock job data
  const [jobs, setJobs] = useState([
    {
      id: 1,
      title: "Senior Frontend Developer",
      company: {
        name: "TechCorp Solutions",
        logo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop&crop=center",
        size: "500-1000 employees",
        headquarters: "San Francisco, CA",
        founded: "2015",
        industry: "Technology",
        description: "TechCorp Solutions is a leading technology company focused on innovation and excellence in software development."
      },
      location: "San Francisco, CA",
      type: "Full-time",
      remote: true,
      salary: { min: 120, max: 180 },
      matchPercentage: 95,
      description: "We are looking for a Senior Frontend Developer to join our dynamic team. You will be responsible for building user-facing features using modern JavaScript frameworks and ensuring optimal user experience across all devices.",
      skills: ["React", "TypeScript", "JavaScript", "CSS", "Node.js", "GraphQL"],
      applicationStatus: "not-applied",
      postedDate: "2025-01-07T10:00:00Z",
      isSaved: false,
      teamSize: "8-12 people",
      requirements: {
        minimum: [
          "Bachelor\'s degree in Computer Science or related field",
          "5+ years of experience with React and JavaScript",
          "Strong understanding of web development fundamentals",
          "Experience with version control systems (Git)"
        ],
        preferred: [
          "Experience with TypeScript and modern build tools",
          "Knowledge of testing frameworks (Jest, React Testing Library)",
          "Familiarity with cloud platforms (AWS, Azure, GCP)",
          "Previous experience in agile development environments"
        ]
      },
      benefits: [
        "Health, Dental & Vision Insurance",
        "401(k) with Company Match",
        "Unlimited PTO",
        "Remote Work Options",
        "Professional Development Budget",
        "Stock Options"
      ]
    },
    {
      id: 2,
      title: "Full Stack Engineer",
      company: {
        name: "InnovateLab",
        logo: "https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100&h=100&fit=crop&crop=center",
        size: "50-200 employees",
        headquarters: "Austin, TX",
        founded: "2018",
        industry: "Software",
        description: "InnovateLab is a fast-growing startup building the next generation of productivity tools."
      },
      location: "Austin, TX",
      type: "Full-time",
      remote: false,
      salary: { min: 100, max: 140 },
      matchPercentage: 88,
      description: "Join our team as a Full Stack Engineer and help build scalable web applications that serve millions of users. You\'ll work with cutting-edge technologies and collaborate with a talented team of engineers.",
      skills: ["React", "Node.js", "Python", "PostgreSQL", "AWS", "Docker"],
      applicationStatus: "applied",
      postedDate: "2025-01-06T14:30:00Z",
      isSaved: true,
      teamSize: "5-8 people",
      benefits: [
        "Health Insurance",
        "Flexible Hours",
        "Catered Meals",
        "Gym Membership",
        "Learning Budget"
      ]
    },
    {
      id: 3,
      title: "React Developer",
      company: {
        name: "StartupXYZ",
        logo: "https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=100&h=100&fit=crop&crop=center",
        size: "10-50 employees",
        headquarters: "New York, NY",
        founded: "2020",
        industry: "Fintech",
        description: "StartupXYZ is revolutionizing the financial technology space with innovative solutions."
      },
      location: "New York, NY",
      type: "Contract",
      remote: true,
      salary: { min: 80, max: 120 },
      matchPercentage: 82,
      description: "We\'re seeking a talented React Developer to join our growing team. You\'ll be working on exciting projects that directly impact our users\' financial well-being.",
      skills: ["React", "JavaScript", "Redux", "Material-UI", "Jest"],
      applicationStatus: "not-applied",
      postedDate: "2025-01-05T09:15:00Z",
      isSaved: false,
      teamSize: "3-5 people",
      benefits: [
        "Health Insurance",
        "Remote Work",
        "Flexible Schedule",
        "Professional Development"
      ]
    },
    {
      id: 4,
      title: "UI/UX Developer",
      company: {
        name: "DesignStudio Pro",
        logo: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=100&h=100&fit=crop&crop=center",
        size: "200-500 employees",
        headquarters: "Los Angeles, CA",
        founded: "2012",
        industry: "Design",
        description: "DesignStudio Pro creates beautiful and functional digital experiences for leading brands."
      },
      location: "Los Angeles, CA",
      type: "Full-time",
      remote: true,
      salary: { min: 90, max: 130 },
      matchPercentage: 75,
      description: "Looking for a UI/UX Developer who can bridge the gap between design and development. You'll work closely with our design team to bring mockups to life.",
      skills: ["React", "CSS", "Figma", "JavaScript", "SASS", "Responsive Design"],
      applicationStatus: "reviewing",
      postedDate: "2025-01-04T16:45:00Z",
      isSaved: true,
      teamSize: "6-10 people",
      benefits: [
        "Health & Dental Insurance",
        "Creative Freedom",
        "Design Tools Budget",
        "Flexible Hours"
      ]
    },
    {
      id: 5,
      title: "JavaScript Engineer",
      company: {
        name: "CodeCraft Inc",
        logo: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&h=100&fit=crop&crop=center",
        size: "100-300 employees",
        headquarters: "Seattle, WA",
        founded: "2016",
        industry: "Software Development",
        description: "CodeCraft Inc specializes in building custom software solutions for enterprise clients."
      },
      location: "Seattle, WA",
      type: "Full-time",
      remote: false,
      salary: { min: 110, max: 150 },
      matchPercentage: 70,
      description: "We\'re looking for a JavaScript Engineer to join our development team. You\'ll work on various client projects and help maintain our internal tools and frameworks.",
      skills: ["JavaScript", "Vue.js", "Node.js", "MongoDB", "Express", "Git"],
      applicationStatus: "not-applied",
      postedDate: "2025-01-03T11:20:00Z",
      isSaved: false,
      teamSize: "10-15 people",
      benefits: [
        "Comprehensive Health Coverage",
        "401(k) Matching",
        "Paid Time Off",
        "Professional Training"
      ]
    },
    {
      id: 6,
      title: "Frontend Architect",
      company: {
        name: "MegaCorp Enterprise",
        logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop&crop=center",
        size: "1000+ employees",
        headquarters: "Chicago, IL",
        founded: "2005",
        industry: "Enterprise Software",
        description: "MegaCorp Enterprise provides comprehensive business solutions to Fortune 500 companies."
      },
      location: "Chicago, IL",
      type: "Full-time",
      remote: true,
      salary: { min: 150, max: 200 },
      matchPercentage: 92,
      description: "Lead our frontend architecture initiatives and mentor junior developers. You\'ll be responsible for making key technical decisions and ensuring code quality across all projects.",
      skills: ["React", "TypeScript", "Architecture", "Mentoring", "GraphQL", "Microservices"],
      applicationStatus: "interview",
      postedDate: "2025-01-02T08:30:00Z",
      isSaved: true,
      teamSize: "20+ people",
      benefits: [
        "Premium Health Insurance",
        "Stock Options",
        "Unlimited PTO",
        "Executive Training",
        "Relocation Assistance"
      ]
    }
  ]);

  const [savedJobs, setSavedJobs] = useState([]);

  useEffect(() => {
    // Filter saved jobs
    setSavedJobs(jobs.filter(job => job.isSaved));
  }, [jobs]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const handleLocationChange = (newLocation) => {
    setLocation(newLocation);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    setIsFilterSidebarOpen(false);
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  const handleRemoveFilter = (filterKey) => {
    const newFilters = { ...filters };
    delete newFilters[filterKey];
    setFilters(newFilters);
  };

  const handleClearAllFilters = () => {
    setFilters({});
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
  };

  const handleJobSave = (jobId, saved) => {
    setJobs(prevJobs =>
      prevJobs.map(job =>
        job.id === jobId ? { ...job, isSaved: saved } : job
      )
    );
  };

  const handleJobApply = async (jobId) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setJobs(prevJobs =>
      prevJobs.map(job =>
        job.id === jobId ? { ...job, applicationStatus: 'applied' } : job
      )
    );
  };

  const handleViewJobDetails = (jobId) => {
    const job = jobs.find(j => j.id === jobId);
    setSelectedJob(job);
    setIsJobDetailOpen(true);
  };

  const handleCloseJobDetail = () => {
    setIsJobDetailOpen(false);
    setSelectedJob(null);
  };

  const handleRemoveFromSaved = (jobId) => {
    handleJobSave(jobId, false);
  };

  const filteredJobs = jobs.filter(job => {
    // Apply search filter
    if (searchQuery && !job.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !job.company.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !job.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))) {
      return false;
    }

    // Apply location filter
    if (location && !job.location.toLowerCase().includes(location.toLowerCase()) && 
        !(location.toLowerCase() === 'remote' && job.remote)) {
      return false;
    }

    // Apply other filters
    if (filters.salaryMin && job.salary.min < parseInt(filters.salaryMin)) return false;
    if (filters.salaryMax && job.salary.max > parseInt(filters.salaryMax)) return false;
    if (filters.jobType && job.type.toLowerCase() !== filters.jobType.toLowerCase()) return false;
    if (filters.remote && !job.remote) return false;
    if (filters.skills && !job.skills.some(skill => 
      skill.toLowerCase().includes(filters.skills.toLowerCase())
    )) return false;

    return true;
  });

  const sortedJobs = [...filteredJobs].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.postedDate) - new Date(a.postedDate);
      case 'salary-high':
        return (b.salary.max || 0) - (a.salary.max || 0);
      case 'salary-low':
        return (a.salary.min || 0) - (b.salary.min || 0);
      case 'match':
        return b.matchPercentage - a.matchPercentage;
      case 'company':
        return a.company.name.localeCompare(b.company.name);
      default: // relevance
        return b.matchPercentage - a.matchPercentage;
    }
  });

  return (
    <MainLayout
      title="Job Search & Application Hub"
      description="Discover and apply for jobs with AI-powered matching and comprehensive search capabilities"
      noPadding
    >
      <SidebarLayout className="!border-l-0">
        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 bg-background min-h-screen">
          <div className="grid grid-cols-1 gap-6">
          {/* Search Section */}
          <div className="mb-6">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-foreground mb-4">
                Find Your Dream Job
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Discover opportunities that match your skills with AI-powered job recommendations
              </p>
            </div>

            <SearchBar
              onSearch={handleSearch}
              onLocationChange={handleLocationChange}
              searchQuery={searchQuery}
              location={location}
              filters={filters}
              onFilterChange={handleFilterChange}
            />
          </div>

          {/* View Toggle */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-1 glassmorphic-surface rounded-lg p-1">
              <button
                onClick={() => setCurrentView('search')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  currentView === 'search' ?'bg-primary/20 text-primary border border-primary/30' :'text-muted-foreground hover:bg-white/10'
                }`}
              >
                <Icon name="Search" size={16} />
                <span>Search Jobs</span>
              </button>
              <button
                onClick={() => setCurrentView('saved')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  currentView === 'saved' ?'bg-primary/20 text-primary border border-primary/30' :'text-muted-foreground hover:bg-white/10'
                }`}
              >
                <Icon name="Heart" size={16} />
                <span>Saved Jobs</span>
                {savedJobs.length > 0 && (
                  <span className="bg-error text-error-foreground text-xs rounded-full px-2 py-0.5">
                    {savedJobs.length}
                  </span>
                )}
              </button>
            </div>

            {currentView === 'search' && (
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setIsFilterSidebarOpen(true)}
                  iconName="Filter"
                  iconPosition="left"
                  className="lg:hidden"
                >
                  Filters
                </Button>
                
                <SortDropdown
                  currentSort={sortBy}
                  onSortChange={handleSortChange}
                />
              </div>
            )}
          </div>

          {/* Active Filters */}
          {currentView === 'search' && Object.keys(filters).length > 0 && (
            <div className="mb-6">
              <FilterChips
                activeFilters={filters}
                onRemoveFilter={handleRemoveFilter}
                onClearAll={handleClearAllFilters}
              />
            </div>
          )}

          {/* Content */}
          {currentView === 'search' ? (
            <div className="bg-card rounded-xl shadow p-6">
              {/* Results Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl font-semibold text-foreground">
                    {sortedJobs.length} Job{sortedJobs.length !== 1 ? 's' : ''} Found
                  </h2>
                  {searchQuery && (
                    <span className="text-muted-foreground">
                      for "{searchQuery}"
                    </span>
                  )}
                </div>
              </div>

              {/* Job Grid */}
              {loading ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, index) => (
                    <div key={index} className="bg-muted p-6 rounded-xl shadow animate-pulse">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 bg-card rounded-lg"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-card rounded mb-2"></div>
                          <div className="h-3 bg-card rounded w-2/3"></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 bg-card rounded"></div>
                        <div className="h-3 bg-card rounded w-3/4"></div>
                        <div className="h-3 bg-card rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : sortedJobs.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {sortedJobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      onSave={handleJobSave}
                      onApply={handleJobApply}
                      onViewDetails={handleViewJobDetails}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-muted p-12 rounded-xl shadow text-center">
                  <Icon name="Search" size={64} className="text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">No Jobs Found</h3>
                  <p className="text-muted-foreground mb-6">
                    Try adjusting your search criteria or filters to find more opportunities
                  </p>
                  <Button
                    variant="outline"
                    onClick={handleClearFilters}
                    iconName="RotateCcw"
                    iconPosition="left"
                  >
                    Clear Filters
                  </Button>
                </div>
              )}

              {/* Load More */}
              {sortedJobs.length > 0 && hasMore && !loading && (
                <div className="text-center mt-8">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setLoading(true);
                      setTimeout(() => {
                        setLoading(false);
                        setHasMore(false);
                      }, 1000);
                    }}
                    iconName="ChevronDown"
                    iconPosition="right"
                  >
                    Load More Jobs
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-card rounded-xl shadow p-6">
              <SavedJobsSection
                savedJobs={savedJobs}
                onRemoveFromSaved={handleRemoveFromSaved}
                onApply={handleJobApply}
                onViewDetails={handleViewJobDetails}
              />
            </div>
          )}
          </div>
        </div>

        {/* Job Detail Modal */}
        <JobDetailModal
          job={selectedJob}
          isOpen={isJobDetailOpen}
          onClose={handleCloseJobDetail}
          onApply={handleJobApply}
          onSave={handleJobSave}
        />
      </SidebarLayout>
    </MainLayout>
  );
};

export default JobSearchApplicationHub;

