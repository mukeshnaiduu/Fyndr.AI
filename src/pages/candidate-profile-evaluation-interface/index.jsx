import React, { useState } from 'react';
import MainLayout from 'components/layout/MainLayout'
import CandidateHeader from './components/CandidateHeader';
import CandidateProfile from './components/CandidateProfile';
import EvaluationPanel from './components/EvaluationPanel';
import CommunicationHistory from './components/CommunicationHistory';
import CandidateJourney from './components/CandidateJourney';
import Icon from 'components/AppIcon';


const CandidateProfileEvaluationInterface = () => {
  const [activeView, setActiveView] = useState('profile');

  // Mock candidate data
  const candidate = {
    id: 'cand_001',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b9c5e8b3?w=400&h=400&fit=crop&crop=face',
    status: 'interviewing',
    yearsOfExperience: 5,
    expectedSalary: '$95,000 - $110,000',
    matchScore: 87,
    rating: 4.2,
    reviewCount: 12,
    isOnline: true,
    appliedDate: '2025-01-07',
    position: 'Senior Frontend Developer',
    
    experience: [
      {
        position: 'Senior Frontend Developer',
        company: 'TechCorp Solutions',
        duration: '2022 - Present',
        description: 'Led development of responsive web applications using React, TypeScript, and modern CSS frameworks. Collaborated with cross-functional teams to deliver high-quality user experiences.',
        technologies: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'GraphQL']
      },
      {
        position: 'Frontend Developer',
        company: 'Digital Innovations Inc',
        duration: '2020 - 2022',
        description: 'Developed and maintained multiple client-facing applications. Implemented responsive designs and optimized performance for better user experience.',
        technologies: ['React', 'JavaScript', 'SCSS', 'Redux', 'REST APIs']
      },
      {
        position: 'Junior Web Developer',
        company: 'StartupXYZ',
        duration: '2019 - 2020',
        description: 'Built interactive web components and collaborated with designers to implement pixel-perfect UI designs. Gained experience in modern development workflows.',
        technologies: ['HTML5', 'CSS3', 'JavaScript', 'jQuery', 'Bootstrap']
      }
    ],
    
    education: [
      {
        degree: 'Bachelor of Science in Computer Science',
        institution: 'University of California, Berkeley',
        year: '2019',
        gpa: '3.8',
        description: 'Focused on software engineering and web technologies. Completed capstone project on real-time collaborative applications.'
      },
      {
        degree: 'Frontend Development Bootcamp',
        institution: 'General Assembly',
        year: '2018',
        description: 'Intensive 12-week program covering modern frontend technologies and best practices.'
      }
    ],
    
    skillCategories: [
      {
        name: 'Frontend Technologies',
        skills: [
          { name: 'React', level: 90 },
          { name: 'TypeScript', level: 85 },
          { name: 'Next.js', level: 80 },
          { name: 'Vue.js', level: 70 }
        ]
      },
      {
        name: 'Styling & Design',
        skills: [
          { name: 'CSS3', level: 95 },
          { name: 'Tailwind CSS', level: 88 },
          { name: 'SCSS', level: 85 },
          { name: 'Figma', level: 75 }
        ]
      },
      {
        name: 'Tools & Workflow',
        skills: [
          { name: 'Git', level: 90 },
          { name: 'Webpack', level: 80 },
          { name: 'Jest', level: 75 },
          { name: 'Docker', level: 65 }
        ]
      }
    ],
    
    portfolio: [
      {
        title: 'E-commerce Dashboard',
        description: 'Modern admin dashboard for e-commerce platform with real-time analytics and inventory management.',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop',
        technologies: ['React', 'TypeScript', 'Chart.js', 'Tailwind CSS'],
        liveUrl: 'https://dashboard-demo.example.com',
        githubUrl: 'https://github.com/sarah/ecommerce-dashboard'
      },
      {
        title: 'Task Management App',
        description: 'Collaborative task management application with real-time updates and team collaboration features.',
        image: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=600&h=400&fit=crop',
        technologies: ['Next.js', 'Socket.io', 'MongoDB', 'Material-UI'],
        liveUrl: 'https://taskapp-demo.example.com',
        githubUrl: 'https://github.com/sarah/task-management'
      },
      {
        title: 'Weather Forecast App',
        description: 'Beautiful weather application with location-based forecasts and interactive maps.',
        image: 'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=600&h=400&fit=crop',
        technologies: ['React', 'OpenWeather API', 'Mapbox', 'CSS3'],
        liveUrl: 'https://weather-app-demo.example.com',
        githubUrl: 'https://github.com/sarah/weather-app'
      }
    ],
    
    achievements: [
      {
        title: 'React Advanced Certification',
        issuer: 'Meta',
        date: '2024',
        description: 'Advanced certification in React development covering hooks, context, and performance optimization.',
        credentialUrl: 'https://coursera.org/verify/certificate123'
      },
      {
        title: 'Frontend Developer of the Month',
        issuer: 'TechCorp Solutions',
        date: '2023',
        description: 'Recognized for outstanding contribution to the company\'s main product redesign project.'
      },
      {
        title: 'Open Source Contributor',
        issuer: 'GitHub',
        date: '2023',
        description: 'Active contributor to popular React libraries with over 500 commits and 50+ merged PRs.'
      }
    ],
    
    interviewHistory: [
      {
        title: 'Phone Screening',
        type: 'phone',
        date: '2025-01-09',
        status: 'completed',
        interviewer: 'Jane Doe',
        feedback: 'Positive initial impression, good communication skills'
      },
      {
        title: 'Technical Interview',
        type: 'technical',
        date: '2025-01-10',
        status: 'scheduled',
        interviewer: 'Mike Johnson',
        feedback: null
      }
    ]
  };

  const handleAction = (action) => {
    console.log('Action:', action);
    // Handle different actions like message, schedule, shortlist
  };

  const handleEvaluationUpdate = (evaluation) => {
    console.log('Evaluation updated:', evaluation);
    // Handle evaluation submission
  };

  const viewOptions = [
    { id: 'profile', label: 'Profile', icon: 'User' },
    { id: 'evaluation', label: 'Evaluation', icon: 'Star' },
    { id: 'communication', label: 'Communication', icon: 'MessageCircle' },
    { id: 'journey', label: 'Journey', icon: 'MapPin' }
  ];

  const renderMainContent = () => {
    switch (activeView) {
      case 'profile':
        return <CandidateProfile candidate={candidate} />;
      case 'evaluation':
        return <EvaluationPanel candidate={candidate} onEvaluationUpdate={handleEvaluationUpdate} />;
      case 'communication':
        return <CommunicationHistory candidate={candidate} />;
      case 'journey':
        return <CandidateJourney candidate={candidate} />;
      default:
        return <CandidateProfile candidate={candidate} />;
    }
  };

  return (
    <MainLayout title={candidate.name + ' - Candidate Profile'} description="Evaluate and review candidate details">
      <div className="flex flex-1">
        <main className="flex-1">
          <div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {/* Candidate Header */}
              <CandidateHeader candidate={candidate} onAction={handleAction} />
              
              {/* Main Content Area */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Left Sidebar - Navigation */}
                <div className="lg:col-span-1">
                  <div className="glassmorphic-card p-4 sticky top-24">
                    <h3 className="font-semibold text-foreground mb-4">View Options</h3>
                    <nav className="space-y-2">
                      {viewOptions.map((option) => (
                        <button
                          key={option.id}
                          onClick={() => setActiveView(option.id)}
                          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            activeView === option.id
                              ? 'bg-primary text-primary-foreground shadow-sm'
                              : 'text-muted-foreground hover:text-foreground hover:bg-white/10'
                          }`}
                        >
                          <Icon name={option.icon} size={16} />
                          <span>{option.label}</span>
                        </button>
                      ))}
                    </nav>

                    {/* Quick Stats */}
                    <div className="mt-6 pt-4 border-t border-white/10">
                      <h4 className="font-medium text-foreground mb-3">Quick Stats</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Applied:</span>
                          <span className="text-foreground font-medium">{candidate.appliedDate}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Position:</span>
                          <span className="text-foreground font-medium">{candidate.position}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Experience:</span>
                          <span className="text-foreground font-medium">{candidate.yearsOfExperience} years</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Match Score:</span>
                          <span className="text-success font-medium">{candidate.matchScore}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Main Content */}
                <div className="lg:col-span-3">
                  {renderMainContent()}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </MainLayout>
  );
};

export default CandidateProfileEvaluationInterface;

