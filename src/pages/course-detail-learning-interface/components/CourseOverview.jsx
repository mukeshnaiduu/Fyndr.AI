import React from 'react';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';

const CourseOverview = ({ course }) => {
  const skills = [
    "React Hooks & Context",
    "State Management",
    "Component Architecture",
    "Performance Optimization",
    "Testing Strategies"
  ];

  const requirements = [
    "Basic JavaScript knowledge",
    "HTML & CSS fundamentals",
    "Node.js environment setup",
    "Git version control basics"
  ];

  return (
    <div className="space-y-8">
      {/* Course Description */}
      <div className="glassmorphic-card p-6">
        <h3 className="text-xl font-semibold text-foreground mb-4">About This Course</h3>
        <p className="text-muted-foreground leading-relaxed mb-6">
          {course.description}
        </p>
        
        {/* Course Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 glassmorphic-surface rounded-lg">
            <Icon name="Clock" size={24} className="text-primary mx-auto mb-2" />
            <div className="text-sm text-muted-foreground">Duration</div>
            <div className="font-semibold text-foreground">{course.duration}</div>
          </div>
          <div className="text-center p-4 glassmorphic-surface rounded-lg">
            <Icon name="Users" size={24} className="text-accent mx-auto mb-2" />
            <div className="text-sm text-muted-foreground">Students</div>
            <div className="font-semibold text-foreground">{course.studentsCount}</div>
          </div>
          <div className="text-center p-4 glassmorphic-surface rounded-lg">
            <Icon name="Star" size={24} className="text-warning mx-auto mb-2" />
            <div className="text-sm text-muted-foreground">Rating</div>
            <div className="font-semibold text-foreground">{course.rating}/5</div>
          </div>
          <div className="text-center p-4 glassmorphic-surface rounded-lg">
            <Icon name="Award" size={24} className="text-success mx-auto mb-2" />
            <div className="text-sm text-muted-foreground">Level</div>
            <div className="font-semibold text-foreground">{course.level}</div>
          </div>
        </div>
      </div>

      {/* Learning Objectives */}
      <div className="glassmorphic-card p-6">
        <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center">
          <Icon name="Target" size={24} className="text-primary mr-3" />
          What You'll Learn
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          {course.objectives.map((objective, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon name="Check" size={14} className="text-success" />
              </div>
              <span className="text-muted-foreground">{objective}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Skills You'll Gain */}
      <div className="glassmorphic-card p-6">
        <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center">
          <Icon name="Zap" size={24} className="text-accent mr-3" />
          Skills You'll Gain
        </h3>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-medium"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Requirements */}
      <div className="glassmorphic-card p-6">
        <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center">
          <Icon name="AlertCircle" size={24} className="text-warning mr-3" />
          Requirements
        </h3>
        <ul className="space-y-2">
          {requirements.map((requirement, index) => (
            <li key={index} className="flex items-center space-x-3">
              <Icon name="ChevronRight" size={16} className="text-muted-foreground" />
              <span className="text-muted-foreground">{requirement}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Instructor */}
      <div className="glassmorphic-card p-6">
        <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center">
          <Icon name="User" size={24} className="text-primary mr-3" />
          Your Instructor
        </h3>
        <div className="flex items-start space-x-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <span className="text-white font-semibold text-lg">
              {course.instructor.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-foreground">{course.instructor.name}</h4>
            <p className="text-sm text-primary mb-2">{course.instructor.title}</p>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {course.instructor.bio}
            </p>
            <div className="flex items-center space-x-4 mt-3">
              <div className="flex items-center space-x-1">
                <Icon name="Users" size={16} className="text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{course.instructor.students} students</span>
              </div>
              <div className="flex items-center space-x-1">
                <Icon name="BookOpen" size={16} className="text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{course.instructor.courses} courses</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Certificate */}
      <div className="glassmorphic-card p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-lg bg-success/20 flex items-center justify-center">
              <Icon name="Award" size={24} className="text-success" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Certificate of Completion</h4>
              <p className="text-sm text-muted-foreground">
                Earn a certificate upon successful completion of this course
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm">
            Preview Certificate
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CourseOverview;
