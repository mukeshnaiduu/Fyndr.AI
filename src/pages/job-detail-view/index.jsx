import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import MainLayout from 'components/layout/MainLayout'
import SidebarLayout from 'components/layout/SidebarLayout';
import JobHeader from './components/JobHeader';
import MatchPercentage from './components/MatchPercentage';
import JobDescription from './components/JobDescription';
import SkillsMatch from './components/SkillsMatch';
import CompanyProfile from './components/CompanyProfile';
import SalaryInsights from './components/SalaryInsights';
import RelatedJobs from './components/RelatedJobs';
import ApplyButton from './components/ApplyButton';

const JobDetailView = () => {
  const location = useLocation();
  const [isApplied, setIsApplied] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Mock job data
  const jobData = {
    id: 1,
    title: "Senior Frontend Developer",
    company: "TechCorp Solutions",
    location: "San Francisco, CA",
    type: "Full-time",
    salary: "$120k - $160k",
    postedTime: "2 days ago",
    applicationDeadline: "2025-08-15",
    matchPercentage: 87,
    description: `We are seeking a talented Senior Frontend Developer to join our dynamic team at TechCorp Solutions. In this role, you will be responsible for developing and maintaining high-quality web applications using modern JavaScript frameworks and technologies.

You will work closely with our design and backend teams to create seamless user experiences that delight our customers. The ideal candidate will have a strong background in React, TypeScript, and modern frontend development practices.

This is an excellent opportunity to work on cutting-edge projects in a collaborative environment where innovation and creativity are highly valued. You'll have the chance to mentor junior developers and contribute to architectural decisions that shape our products.

We offer competitive compensation, comprehensive benefits, and a flexible work environment that supports work-life balance. Join us in building the future of web applications!`,
    responsibilities: [
      "Develop and maintain responsive web applications using React and TypeScript",
      "Collaborate with UX/UI designers to implement pixel-perfect designs",
      "Write clean, maintainable, and well-documented code",
      "Participate in code reviews and provide constructive feedback",
      "Optimize applications for maximum speed and scalability",
      "Mentor junior developers and contribute to team knowledge sharing",
      "Stay up-to-date with the latest frontend technologies and best practices"
    ],
    requirements: [
      "5+ years of experience in frontend development",
      "Expert knowledge of React, JavaScript, and TypeScript",
      "Experience with modern CSS frameworks (Tailwind CSS preferred)",
      "Proficiency in version control systems (Git)",
      "Understanding of RESTful APIs and GraphQL",
      "Experience with testing frameworks (Jest, React Testing Library)",
      "Strong problem-solving skills and attention to detail",
      "Excellent communication and collaboration skills"
    ]
  };

  // Mock required skills
  const requiredSkills = [
    { name: "React", level: 5 },
    { name: "TypeScript", level: 4 },
    { name: "JavaScript", level: 5 },
    { name: "Tailwind CSS", level: 3 },
    { name: "Git", level: 4 },
    { name: "REST APIs", level: 4 },
    { name: "GraphQL", level: 3 },
    { name: "Jest", level: 3 },
    { name: "Node.js", level: 2 }
  ];

  // Mock user skills
  const userSkills = [
    { name: "React", level: 5 },
    { name: "JavaScript", level: 5 },
    { name: "TypeScript", level: 3 },
    { name: "Tailwind CSS", level: 4 },
    { name: "Git", level: 4 },
    { name: "REST APIs", level: 4 },
    { name: "Jest", level: 2 },
    { name: "Vue.js", level: 3 }
  ];

  // Mock company data
  const companyData = {
    name: "TechCorp Solutions",
    industry: "Software Development",
    size: "500-1000",
    location: "San Francisco, CA",
    founded: "2015",
    description: "TechCorp Solutions is a leading technology company specializing in innovative web applications and digital solutions. We're passionate about creating products that make a difference in people's lives and are committed to fostering a culture of innovation, collaboration, and continuous learning.",
    fundingStage: "Series C",
    revenue: "$50M+",
    growth: "+25%",
    rating: "4.2",
    workLifeBalance: 4.1,
    careerGrowth: 4.3,
    compensation: 4.5,
    culture: 4.2,
    website: "https://techcorp.com",
    linkedin: "https://linkedin.com/company/techcorp",
    careers: "https://techcorp.com/careers",
    totalEmployees: 750,
    teamPhotos: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1494790108755-2616b9e7e8b4?w=100&h=100&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face"
    ]
  };

  // Mock salary data
  const salaryData = {
    offered: 140000,
    market: 135000,
    top10: 180000
  };

  const marketData = [
    { experience: "0-2 years", min: 80000, avg: 95000, max: 110000 },
    { experience: "3-5 years", min: 110000, avg: 135000, max: 160000 },
    { experience: "5-8 years", min: 140000, avg: 165000, max: 190000 },
    { experience: "8+ years", min: 170000, avg: 200000, max: 250000 }
  ];

  const growthData = [
    { year: "2020", salary: 125000 },
    { year: "2021", salary: 130000 },
    { year: "2022", salary: 135000 },
    { year: "2023", salary: 142000 },
    { year: "2024", salary: 148000 },
    { year: "2025", salary: 155000 }
  ];

  // Mock related jobs
  const relatedJobs = [
    {
      id: 2,
      title: "React Developer",
      company: "StartupXYZ",
      location: "Remote",
      type: "Full-time",
      salaryMin: 100000,
      salaryMax: 130000,
      matchPercentage: 82,
      skills: ["React", "JavaScript", "CSS", "Node.js"],
      postedTime: "1 day ago",
      views: 45
    },
    {
      id: 3,
      title: "Frontend Engineer",
      company: "InnovateCorp",
      location: "New York, NY",
      type: "Full-time",
      salaryMin: 110000,
      salaryMax: 140000,
      matchPercentage: 75,
      skills: ["Vue.js", "TypeScript", "Sass", "Webpack"],
      postedTime: "3 days ago",
      views: 67
    },
    {
      id: 4,
      title: "UI Developer",
      company: "DesignTech",
      location: "Austin, TX",
      type: "Contract",
      salaryMin: 90000,
      salaryMax: 120000,
      matchPercentage: 68,
      skills: ["HTML", "CSS", "JavaScript", "Figma"],
      postedTime: "1 week ago",
      views: 23
    }
  ];

  const handleApply = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsApplied(true);
  };

  const handleBookmark = (bookmarked) => {
    setIsBookmarked(bookmarked);
  };

  const handleShare = () => {
    // Share functionality handled in JobHeader component
  };

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <JobHeader 
        jobData={jobData}
        onBookmark={handleBookmark}
        onShare={handleShare}
        onApply={handleApply}
      />

      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-8">
            <MatchPercentage 
              matchPercentage={jobData.matchPercentage}
              skillsMatched={6}
              totalSkills={9}
            />
            
            <JobDescription 
              description={jobData.description}
              responsibilities={jobData.responsibilities}
              requirements={jobData.requirements}
            />
            
            <SkillsMatch 
              requiredSkills={requiredSkills}
              userSkills={userSkills}
            />
            
            <SalaryInsights 
              salaryData={salaryData}
              marketData={marketData}
              growthData={growthData}
            />
            
            <RelatedJobs jobs={relatedJobs} />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4">
            <CompanyProfile company={companyData} />
          </div>
        </div>
      </div>

      {/* Bottom spacing for fixed apply button */}
      <div className="h-32 lg:h-0"></div>

      <ApplyButton 
        onApply={handleApply}
        isApplied={isApplied}
        applicationDeadline={jobData.applicationDeadline}
      />
    </div>
  );
};

export default JobDetailView;

