import React from "react";
import { Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";

// Import pages from Project A
import Homepage from "pages/homepage";
import AuthenticationLoginRegister from "pages/authentication-login-register";
import AboutContactPage from "pages/about-contact-page";
import NotificationsCenter from "pages/notifications-center";
import ProfileManagement from "pages/profile-management";
import VideoInterviewInterface from "pages/video-interview-interface";

// Import pages from Project B
import JobSeekerOnboardingWizard from "pages/job-seeker-onboarding-wizard";
import JobDetailView from "pages/job-detail-view";
import AiPoweredJobFeedDashboard from "pages/ai-powered-job-feed-dashboard";
import TeamManagementDashboard from "pages/team-management-dashboard";
import AiResumeBuilder from "pages/ai-resume-builder";
import RecruiterEmployerOnboardingWizard from "pages/recruiter-employer-onboarding-wizard";

// Import pages from Project C
import CourseDetailLearningInterface from "pages/course-detail-learning-interface";
import AiCareerCoachChatInterface from "pages/ai-career-coach-chat-interface";
import RecruiterDashboardPipelineManagement from "pages/recruiter-dashboard-pipeline-management";
import CandidateProfileEvaluationInterface from "pages/candidate-profile-evaluation-interface";
import JobSearchApplicationHub from "pages/job-search-application-hub";
import AdminDashboardSystemManagement from "pages/admin-dashboard-system-management";

// Import pages from Project D
import InterviewPracticeVideoSessions from "pages/interview-practice-video-sessions";
import MentorshipPlatform from "pages/mentorship-platform";
import ResourceLibrary from "pages/resource-library";
import AlumniNetworkReferrals from "pages/alumni-network-referrals";
import VirtualCareerFair from "pages/virtual-career-fair";
import HackathonsCompetitions from "pages/hackathons-competitions";

// Import Not Found page
import NotFound from "pages/NotFound";

const Routes = () => {
  return (
      <ErrorBoundary>
        <ScrollToTop />
        <RouterRoutes>
        {/* Main Homepage Route */}
        <Route path="/" element={<Homepage />} />
        
        {/* Routes from Project A */}
        <Route path="/homepage" element={<Homepage />} />
        <Route path="/authentication-login-register" element={<AuthenticationLoginRegister />} />
        <Route path="/about-contact-page" element={<AboutContactPage />} />
        <Route path="/notifications-center" element={<NotificationsCenter />} />
        <Route path="/profile-management" element={<ProfileManagement />} />
        <Route path="/video-interview-interface" element={<VideoInterviewInterface />} />
        
        {/* Routes from Project B */}
        <Route path="/job-seeker-onboarding-wizard" element={<JobSeekerOnboardingWizard />} />
        <Route path="/job-detail-view" element={<JobDetailView />} />
        <Route path="/ai-powered-job-feed-dashboard" element={<AiPoweredJobFeedDashboard />} />
        <Route path="/team-management-dashboard" element={<TeamManagementDashboard />} />
        <Route path="/ai-resume-builder" element={<AiResumeBuilder />} />
        <Route path="/recruiter-employer-onboarding-wizard" element={<RecruiterEmployerOnboardingWizard />} />
        
        {/* Routes from Project C */}
        <Route path="/course-detail-learning-interface" element={<CourseDetailLearningInterface />} />
        <Route path="/ai-career-coach-chat-interface" element={<AiCareerCoachChatInterface />} />
        <Route path="/recruiter-dashboard-pipeline-management" element={<RecruiterDashboardPipelineManagement />} />
        <Route path="/candidate-profile-evaluation-interface" element={<CandidateProfileEvaluationInterface />} />
        <Route path="/job-search-application-hub" element={<JobSearchApplicationHub />} />
        <Route path="/admin-dashboard-system-management" element={<AdminDashboardSystemManagement />} />
        
        {/* Routes from Project D */}
        <Route path="/interview-practice-video-sessions" element={<InterviewPracticeVideoSessions />} />
        <Route path="/mentorship-platform" element={<MentorshipPlatform />} />
        <Route path="/resource-library" element={<ResourceLibrary />} />
        <Route path="/alumni-network-referrals" element={<AlumniNetworkReferrals />} />
        <Route path="/virtual-career-fair" element={<VirtualCareerFair />} />
        <Route path="/hackathons-competitions" element={<HackathonsCompetitions />} />
        
        {/* 404 Not Found Route */}
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      </ErrorBoundary>
  );
};

export default Routes;

