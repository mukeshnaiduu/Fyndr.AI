import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import MainLayout from 'components/layout/MainLayout'
import SidebarLayout from 'components/layout/SidebarLayout';
import SearchHeader from 'components/ui/SearchHeader';
import Header from 'components/ui/Header';

import FilterChips from './components/FilterChips';
import SortDropdown from './components/SortDropdown';
import JobGrid from './components/JobGrid';
import AdvancedFilterPanel from './components/AdvancedFilterPanel';

import Button from 'components/ui/Button';

const AIJobFeedDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [currentSort, setCurrentSort] = useState('relevance');
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const [activeFilters, setActiveFilters] = useState({
    location: [],
    salary: [],
    experience: [],
    jobType: []
  });

  const [advancedFilters, setAdvancedFilters] = useState({
    location: '',
    salaryRange: '',
    experienceLevel: '',
    jobTypes: [],
    workMode: '',
    companySize: '',
    skills: '',
    benefits: [],
    postedWithin: '',
    matchPercentage: 0
  });

  // Mock job data
  const mockJobs = [
    {
      id: 1,
      title: "Senior Frontend Developer",
      company: {
        name: "TechCorp Inc.",
        logo: "https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100&h=100&fit=crop&crop=center"
      },
      location: "San Francisco, CA",
      type: "Full-time",
      salary: { min: 120000, max: 180000 },
      skills: ["React", "TypeScript", "Node.js", "GraphQL", "AWS"],
      matchPercentage: 95,
      postedTime: "2 hours ago",
      isBookmarked: false,
      description: `We're looking for a Senior Frontend Developer to join our growing team. You'll be responsible for building scalable web applications using modern technologies.`
    },
    {
      id: 2,
      title: "Product Manager",
      company: {
        name: "InnovateLabs",
        logo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop&crop=center"
      },
      location: "New York, NY",
      type: "Full-time",
      salary: { min: 130000, max: 200000 },
      skills: ["Product Strategy", "Analytics", "Agile", "User Research"],
      matchPercentage: 88,
      postedTime: "4 hours ago",
      isBookmarked: true,
      description: `Join our product team to drive innovation and deliver exceptional user experiences. Lead cross-functional teams and shape product strategy.`
    },
    {
      id: 3,
      title: "DevOps Engineer",
      company: {
        name: "CloudScale",
        logo: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=100&h=100&fit=crop&crop=center"
      },
      location: "Austin, TX",
      type: "Full-time",
      salary: { min: 110000, max: 160000 },
      skills: ["Kubernetes", "Docker", "AWS", "Terraform", "CI/CD"],
      matchPercentage: 82,
      postedTime: "6 hours ago",
      isBookmarked: false,
      description: `We're seeking a DevOps Engineer to help scale our infrastructure and improve deployment processes. Experience with cloud platforms required.`
    },
    {
      id: 4,
      title: "UX Designer",
      company: {
        name: "DesignStudio",
        logo: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=100&h=100&fit=crop&crop=center"
      },
      location: "Seattle, WA",
      type: "Full-time",
      salary: { min: 90000, max: 130000 },
      skills: ["Figma", "User Research", "Prototyping", "Design Systems"],
      matchPercentage: 76,
      postedTime: "8 hours ago",
      isBookmarked: false,
      description: `Create intuitive and beautiful user experiences for our digital products. Collaborate with product and engineering teams.`
    },
    {
      id: 5,
      title: "Data Scientist",
      company: {
        name: "DataDriven Co.",
        logo: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&h=100&fit=crop&crop=center"
      },
      location: "Remote",
      type: "Full-time",
      salary: { min: 140000, max: 190000 },
      skills: ["Python", "Machine Learning", "SQL", "TensorFlow", "Statistics"],
      matchPercentage: 91,
      postedTime: "1 day ago",
      isBookmarked: true,
      description: `Join our data science team to build predictive models and extract insights from large datasets. Remote-first company culture.`
    },
    {
      id: 6,
      title: "Backend Engineer",
      company: {
        name: "ScaleTech",
        logo: "https://images.unsplash.com/photo-1560472355-536de3962603?w=100&h=100&fit=crop&crop=center"
      },
      location: "Boston, MA",
      type: "Full-time",
      salary: { min: 115000, max: 165000 },
      skills: ["Java", "Spring Boot", "PostgreSQL", "Redis", "Microservices"],
      matchPercentage: 79,
      postedTime: "1 day ago",
      isBookmarked: false,
      description: `Build robust backend systems that power our platform. Work with modern technologies and contribute to architectural decisions.`
    }
  ];

  // Initialize jobs
  useEffect(() => {
    const loadInitialJobs = async () => {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setJobs(mockJobs);
      setLoading(false);
    };

    loadInitialJobs();
  }, []);

  // Handle search
  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    setLoading(true);
    
    // Simulate search API call
    setTimeout(() => {
      const filteredJobs = mockJobs.filter(job =>
        job.title.toLowerCase().includes(query.toLowerCase()) ||
        job.company.name.toLowerCase().includes(query.toLowerCase()) ||
        job.skills.some(skill => skill.toLowerCase().includes(query.toLowerCase()))
      );
      setJobs(filteredJobs);
      setLoading(false);
    }, 500);
  }, []);

  // Handle filter changes
  const handleFilterChange = useCallback((filters) => {
    setActiveFilters(filters);
    // Apply filters logic here
  }, []);

  // Handle sort change
  const handleSortChange = useCallback((sortType) => {
    setCurrentSort(sortType);
    
    const sortedJobs = [...jobs].sort((a, b) => {
      switch (sortType) {
        case 'match':
          return b.matchPercentage - a.matchPercentage;
        case 'salary-high':
          return b.salary.max - a.salary.max;
        case 'salary-low':
          return a.salary.min - b.salary.min;
        case 'date':
          // Mock date sorting
          return Math.random() - 0.5;
        default:
          return 0;
      }
    });
    
    setJobs(sortedJobs);
  }, [jobs]);

  // Handle bookmark
  const handleBookmark = useCallback((jobId, isBookmarked) => {
    setJobs(prevJobs =>
      prevJobs.map(job =>
        job.id === jobId ? { ...job, isBookmarked } : job
      )
    );
  }, []);

  // Handle apply
  const handleApply = useCallback(async (jobId) => {
    // Simulate apply process
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`Applied to job ${jobId}`);
  }, []);

  // Handle load more
  const handleLoadMore = useCallback(async () => {
    // Simulate loading more jobs
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Add more mock jobs
    const moreJobs = mockJobs.map(job => ({
      ...job,
      id: job.id + jobs.length,
      postedTime: `${Math.floor(Math.random() * 5) + 1} days ago`
    }));
    
    setJobs(prevJobs => [...prevJobs, ...moreJobs]);
    
    // Simulate end of results after a few loads
    if (jobs.length > 20) {
      setHasMore(false);
    }
  }, [jobs.length]);

  // Handle pull to refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setJobs(mockJobs);
    setHasMore(true);
    setRefreshing(false);
  }, []);

  // Clear all filters
  const handleClearAllFilters = useCallback(() => {
    setActiveFilters({
      location: [],
      salary: [],
      experience: [],
      jobType: []
    });
    setAdvancedFilters({
      location: '',
      salaryRange: '',
      experienceLevel: '',
      jobTypes: [],
      workMode: '',
      companySize: '',
      skills: '',
      benefits: [],
      postedWithin: '',
      matchPercentage: 0
    });
  }, []);

  return (
    <MainLayout
      title="AI-Powered Job Feed"
      description="Find personalized job recommendations powered by AI"
      noPadding
      fullWidth
    >
      <SearchHeader
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        placeholder="Search jobs, companies, skills..."
        showFilters={true}
      />

      <main className="container mx-auto px-4 lg:px-6 py-6">
        {/* Dashboard Header */}
        <div className="mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div>
              <h1 className="text-2xl lg:text-3xl font-heading font-bold text-foreground mb-2">
                AI-Powered Job Feed
              </h1>
              <p className="text-muted-foreground">
                Discover personalized job opportunities with AI-driven matching
              </p>
            </div>

            <div className="flex items-center space-x-3">
              {/* Refresh Button */}
              <Button
                variant="outline"
                size="sm"
                loading={refreshing}
                onClick={handleRefresh}
                iconName="RefreshCw"
                iconPosition="left"
              >
                Refresh
              </Button>

              {/* Bookmarks Toggle */}
              <Button
                variant={showBookmarkedOnly ? "default" : "outline"}
                size="sm"
                onClick={() => setShowBookmarkedOnly(!showBookmarkedOnly)}
                iconName="Bookmark"
                iconPosition="left"
              >
                {showBookmarkedOnly ? 'All Jobs' : 'Bookmarked'}
              </Button>

              {/* Advanced Filters */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAdvancedFilterOpen(true)}
                iconName="SlidersHorizontal"
                iconPosition="left"
              >
                Filters
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Filter Chips */}
        <FilterChips
          activeFilters={activeFilters}
          onFilterChange={(key, values) => {
            setActiveFilters(prev => ({ ...prev, [key]: values }));
          }}
          onClearAll={handleClearAllFilters}
        />

        {/* Results Header */}
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-4">
            <p className="text-sm text-muted-foreground">
              {loading ? 'Loading...' : `${jobs.length} jobs found`}
              {searchQuery && (
                <span className="ml-1">for "{searchQuery}"</span>
              )}
            </p>
          </div>

          <SortDropdown
            currentSort={currentSort}
            onSortChange={handleSortChange}
          />
        </div>

        {/* Job Grid */}
        <JobGrid
          jobs={jobs}
          loading={loading}
          hasMore={hasMore}
          onLoadMore={handleLoadMore}
          onBookmark={handleBookmark}
          onApply={handleApply}
          showBookmarkedOnly={showBookmarkedOnly}
        />

        {/* Advanced Filter Panel */}
        <AdvancedFilterPanel
          isOpen={isAdvancedFilterOpen}
          onClose={() => setIsAdvancedFilterOpen(false)}
          filters={advancedFilters}
          onFiltersChange={setAdvancedFilters}
          onApplyFilters={() => {
            // Apply advanced filters logic
            console.log('Applying advanced filters:', advancedFilters);
          }}
          onClearFilters={() => {
            setAdvancedFilters({
              location: '',
              salaryRange: '',
              experienceLevel: '',
              jobTypes: [],
              workMode: '',
              companySize: '',
              skills: '',
              benefits: [],
              postedWithin: '',
              matchPercentage: 0
            });
          }}
        />
      </main>
    </MainLayout>
  );
};

export default AIJobFeedDashboard;

