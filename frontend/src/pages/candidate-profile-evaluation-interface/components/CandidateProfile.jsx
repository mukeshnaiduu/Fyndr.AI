import React, { useState } from 'react';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';

const CandidateProfile = ({ candidate }) => {
  const [activeTab, setActiveTab] = useState('experience');

  const tabs = [
    { id: 'experience', label: 'Experience', icon: 'Briefcase' },
    { id: 'education', label: 'Education', icon: 'GraduationCap' },
    { id: 'skills', label: 'Skills', icon: 'Code' },
    { id: 'portfolio', label: 'Portfolio', icon: 'FolderOpen' },
    { id: 'achievements', label: 'Achievements', icon: 'Award' }
  ];

  const renderExperience = () => (
    <div className="space-y-6">
      {candidate.experience.map((exp, index) => (
        <div key={index} className="relative pl-8 pb-6 border-l-2 border-primary/20 last:border-l-0">
          <div className="absolute -left-2 top-0 w-4 h-4 bg-primary rounded-full border-2 border-white"></div>
          <div className="glassmorphic-surface p-4 rounded-lg">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-foreground">{exp.position}</h3>
                <p className="text-primary font-medium">{exp.company}</p>
              </div>
              <span className="text-sm text-muted-foreground">{exp.duration}</span>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{exp.description}</p>
            <div className="flex flex-wrap gap-2">
              {exp.technologies.map((tech, techIndex) => (
                <span key={techIndex} className="px-2 py-1 bg-accent/20 text-accent text-xs rounded-full">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderEducation = () => (
    <div className="space-y-4">
      {candidate.education.map((edu, index) => (
        <div key={index} className="glassmorphic-surface p-4 rounded-lg">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-semibold text-foreground">{edu.degree}</h3>
              <p className="text-primary font-medium">{edu.institution}</p>
            </div>
            <div className="text-right">
              <span className="text-sm text-muted-foreground">{edu.year}</span>
              {edu.gpa && (
                <p className="text-sm font-medium text-success">GPA: {edu.gpa}</p>
              )}
            </div>
          </div>
          {edu.description && (
            <p className="text-sm text-muted-foreground">{edu.description}</p>
          )}
        </div>
      ))}
    </div>
  );

  const renderSkills = () => (
    <div className="space-y-6">
      {candidate.skillCategories.map((category, index) => (
        <div key={index} className="glassmorphic-surface p-4 rounded-lg">
          <h3 className="font-semibold text-foreground mb-4">{category.name}</h3>
          <div className="space-y-3">
            {category.skills.map((skill, skillIndex) => (
              <div key={skillIndex} className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{skill.name}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                      style={{ width: `${skill.level}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-muted-foreground w-8">{skill.level}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const renderPortfolio = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {candidate.portfolio.map((project, index) => (
        <div key={index} className="glassmorphic-surface p-4 rounded-lg">
          <div className="aspect-video bg-muted/20 rounded-lg mb-3 overflow-hidden">
            <Image
              src={project.image}
              alt={project.title}
              className="w-full h-full object-cover"
            />
          </div>
          <h3 className="font-semibold text-foreground mb-2">{project.title}</h3>
          <p className="text-sm text-muted-foreground mb-3">{project.description}</p>
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-1">
              {project.technologies.slice(0, 3).map((tech, techIndex) => (
                <span key={techIndex} className="px-2 py-1 bg-primary/20 text-primary text-xs rounded">
                  {tech}
                </span>
              ))}
              {project.technologies.length > 3 && (
                <span className="px-2 py-1 bg-muted/20 text-muted-foreground text-xs rounded">
                  +{project.technologies.length - 3}
                </span>
              )}
            </div>
            <div className="flex space-x-2">
              {project.liveUrl && (
                <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                  <Icon name="ExternalLink" size={16} className="text-primary hover:text-primary/80" />
                </a>
              )}
              {project.githubUrl && (
                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                  <Icon name="Github" size={16} className="text-muted-foreground hover:text-foreground" />
                </a>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderAchievements = () => (
    <div className="space-y-4">
      {candidate.achievements.map((achievement, index) => (
        <div key={index} className="glassmorphic-surface p-4 rounded-lg">
          <div className="flex items-start space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-warning to-accent rounded-lg flex items-center justify-center">
              <Icon name="Award" size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-foreground">{achievement.title}</h3>
                  <p className="text-sm text-primary">{achievement.issuer}</p>
                </div>
                <span className="text-sm text-muted-foreground">{achievement.date}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>
              {achievement.credentialUrl && (
                <a 
                  href={achievement.credentialUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 text-sm text-primary hover:text-primary/80"
                >
                  <Icon name="ExternalLink" size={14} />
                  <span>View Credential</span>
                </a>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'experience':
        return renderExperience();
      case 'education':
        return renderEducation();
      case 'skills':
        return renderSkills();
      case 'portfolio':
        return renderPortfolio();
      case 'achievements':
        return renderAchievements();
      default:
        return renderExperience();
    }
  };

  return (
    <div className="glassmorphic-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-foreground">Candidate Profile</h2>
        <div className="flex items-center space-x-2">
          <Icon name="Download" size={16} className="text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Download Resume</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-muted/10 p-1 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-white/10'
            }`}
          >
            <Icon name={tab.icon} size={16} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default CandidateProfile;
