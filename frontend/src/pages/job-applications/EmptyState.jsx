import React from "react";
import { Link } from "react-router-dom";

const EmptyState = ({ hasApplications, filters, onClearFilters }) => {
  // If there are applications but filters are hiding them
  if (hasApplications) {
    return (
      <div className="glass-card p-8 rounded-xl text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          No applications match your filters
        </h3>
        <p className="text-muted-foreground mb-6">
          Try adjusting your filters or clearing them to see all applications
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onClearFilters}
            className="btn-primary"
          >
            <span className="mr-2">🔄</span>
            Clear All Filters
          </button>
          <Link to="/job-search-application-hub" className="btn-secondary">
            <span className="mr-2">🔍</span>
            Find More Jobs
          </Link>
        </div>
      </div>
    );
  }

  // If there are no applications at all
  return (
    <div className="glass-card p-8 rounded-xl text-center">
      <div className="text-6xl mb-4">📝</div>
      <h3 className="text-xl font-semibold text-foreground mb-2">
        No applications yet
      </h3>
      <p className="text-muted-foreground mb-6">
        Start your job search journey by exploring available positions and applying to jobs that match your skills and interests.
      </p>
      
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
        <Link to="/job-search-application-hub" className="btn-primary">
          <span className="mr-2">🔍</span>
          Browse Jobs
        </Link>
        <Link to="/ai-powered-job-feed-dashboard" className="btn-secondary">
          <span className="mr-2">🤖</span>
          AI Job Feed
        </Link>
        <Link to="/ai-resume-builder" className="btn-secondary">
          <span className="mr-2">📄</span>
          Build Resume
        </Link>
      </div>

      {/* Tips Section */}
      <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6 text-left">
        <h4 className="font-semibold text-foreground mb-4 text-center">
          💡 Tips to get started
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-primary text-xs">1</span>
              </div>
              <div>
                <h5 className="font-medium text-foreground text-sm">Complete your profile</h5>
                <p className="text-muted-foreground text-xs">Add your skills, experience, and preferences</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-primary text-xs">2</span>
              </div>
              <div>
                <h5 className="font-medium text-foreground text-sm">Upload your resume</h5>
                <p className="text-muted-foreground text-xs">Use our AI-powered resume builder for best results</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-primary text-xs">3</span>
              </div>
              <div>
                <h5 className="font-medium text-foreground text-sm">Set up job alerts</h5>
                <p className="text-muted-foreground text-xs">Get notified when new jobs match your criteria</p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-primary text-xs">4</span>
              </div>
              <div>
                <h5 className="font-medium text-foreground text-sm">Start applying</h5>
                <p className="text-muted-foreground text-xs">Apply to 5-10 jobs per week for best results</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-primary text-xs">5</span>
              </div>
              <div>
                <h5 className="font-medium text-foreground text-sm">Track your progress</h5>
                <p className="text-muted-foreground text-xs">Monitor your applications and follow up</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-primary text-xs">6</span>
              </div>
              <div>
                <h5 className="font-medium text-foreground text-sm">Prepare for interviews</h5>
                <p className="text-muted-foreground text-xs">Use our interview practice tool</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="mt-6 pt-6 border-t border-border">
        <p className="text-sm text-muted-foreground mb-3">
          Quick access to helpful resources:
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          <Link 
            to="/ai-career-coach-chat-interface" 
            className="text-xs bg-white/60 hover:bg-white/80 px-3 py-1 rounded-full transition-colors"
          >
            💬 Career Coach
          </Link>
          <Link 
            to="/interview-practice-video-sessions" 
            className="text-xs bg-white/60 hover:bg-white/80 px-3 py-1 rounded-full transition-colors"
          >
            🎥 Practice Interviews
          </Link>
          <Link 
            to="/course-detail-learning-interface" 
            className="text-xs bg-white/60 hover:bg-white/80 px-3 py-1 rounded-full transition-colors"
          >
            📚 Skill Courses
          </Link>
          <Link 
            to="/mentorship-platform" 
            className="text-xs bg-white/60 hover:bg-white/80 px-3 py-1 rounded-full transition-colors"
          >
            👥 Find Mentors
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EmptyState;
