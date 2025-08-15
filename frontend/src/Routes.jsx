import React from "react";
import { Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import ProtectedRoute from "components/ProtectedRoute";

// Import pages from Project A
import Homepage from "pages/homepage";
import AuthenticationLoginRegister from "pages/authentication-login-register";
import AboutContactPage from "pages/about-contact-page";
import NotificationsCenter from "pages/notifications-center";
import ProfileManagement from "pages/profile-management";
import CompanyProfileManagement from "pages/company-profile-management";
import RecruiterProfileManagement from "pages/recruiter-profile-management";
import EmployerProfileManagement from "pages/employer-profile-management";
import AdminProfileManagement from "pages/admin-profile-management";
import VideoInterviewInterface from "pages/video-interview-interface";

// Import pages from Project B
import JobSeekerOnboardingWizard from "pages/job-seeker-onboarding-wizard";
import JobDetailView from "pages/job-detail-view";
import AiPoweredJobFeedDashboard from "pages/ai-powered-job-feed-dashboard";
import TeamManagementDashboard from "pages/team-management-dashboard";
import AiResumeBuilder from "pages/ai-resume-builder";
import RecruiterOnboardingWizard from "pages/recruiter-onboarding-wizard";
import CompanyOnboardingWizard from "pages/company-onboarding-wizard";

// Import pages from Project C
import CourseDetailLearningInterface from "pages/course-detail-learning-interface";
import AiCareerCoachChatInterface from "pages/ai-career-coach-chat-interface";
import CompanyDashboardPipelineManagement from "pages/company-dashboard-pipeline-management";
import CandidateProfileEvaluationInterface from "pages/candidate-profile-evaluation-interface";
import JobSearchApplicationHub from "pages/job-search-application-hub";
import JobApplications from "pages/job-applications";
import AdminDashboardSystemManagement from "pages/admin-dashboard-system-management";

// Import pages from Project D
import InterviewPracticeVideoSessions from "pages/interview-practice-video-sessions";
import MentorshipPlatform from "pages/mentorship-platform";
import ResourceLibrary from "pages/resource-library";
import AlumniNetworkReferrals from "pages/alumni-network-referrals";
import VirtualCareerFair from "pages/virtual-career-fair";
import HackathonsCompetitions from "pages/hackathons-competitions";

// Import Real-Time Dashboard
import RealTimeDashboard from "components/dashboard/RealTimeDashboard";

// Import Not Found page
import NotFound from "pages/NotFound";
import GoogleCallback from "pages/oauth/GoogleCallback";

const Routes = () => {
  return (
    <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        {/* Main Homepage Route (public) */}
        <Route path="/" element={<Homepage />} />
        <Route path="/homepage" element={<Homepage />} />
        <Route path="/authentication-login-register" element={<AuthenticationLoginRegister />} />
        <Route path="/oauth/google/callback" element={<ProtectedRoute><GoogleCallback /></ProtectedRoute>} />
        <Route path="/about-contact-page" element={<ProtectedRoute requireOnboarding={true}><AboutContactPage /></ProtectedRoute>} />
        <Route path="/notifications-center" element={<ProtectedRoute requireOnboarding={true}><NotificationsCenter /></ProtectedRoute>} />
        <Route path="/profile-management" element={<ProtectedRoute requireOnboarding={true}><ProfileManagement /></ProtectedRoute>} />
        <Route path="/company-profile-management" element={<ProtectedRoute requireOnboarding={true}><CompanyProfileManagement /></ProtectedRoute>} />
        {/* Recruiter profile management routes */}
        <Route path="/recruiter-profile-management" element={<ProtectedRoute><RecruiterProfileManagement /></ProtectedRoute>} />
        {/* Allow trailing paths and common typo to avoid 404s */}
        <Route path="/recruiter-profile-management/*" element={<ProtectedRoute><RecruiterProfileManagement /></ProtectedRoute>} />
        <Route path="/recruite-profile-management" element={<ProtectedRoute><RecruiterProfileManagement /></ProtectedRoute>} />
        {/* Additional aliases */}
        <Route path="/recruiter/profile-management" element={<ProtectedRoute><RecruiterProfileManagement /></ProtectedRoute>} />
        <Route path="/recruiter/profile" element={<ProtectedRoute><RecruiterProfileManagement /></ProtectedRoute>} />
        <Route path="/employer-profile-management" element={<ProtectedRoute requireOnboarding={true}><EmployerProfileManagement /></ProtectedRoute>} />
        <Route path="/admin-profile-management" element={<ProtectedRoute requireOnboarding={true}><AdminProfileManagement /></ProtectedRoute>} />
        <Route path="/video-interview-interface" element={<ProtectedRoute requireOnboarding={true}><VideoInterviewInterface /></ProtectedRoute>} />

        {/* Routes from Project B */}
        <Route path="/job-seeker-onboarding-wizard" element={<ProtectedRoute><JobSeekerOnboardingWizard /></ProtectedRoute>} />
        <Route path="/job-detail-view" element={<ProtectedRoute requireOnboarding={true}><JobDetailView /></ProtectedRoute>} />
        <Route path="/ai-powered-job-feed-dashboard" element={<ProtectedRoute requireOnboarding={true}><AiPoweredJobFeedDashboard /></ProtectedRoute>} />
        <Route path="/team-management-dashboard" element={<ProtectedRoute requireOnboarding={true}><TeamManagementDashboard /></ProtectedRoute>} />
        <Route path="/ai-resume-builder" element={<ProtectedRoute requireOnboarding={true}><AiResumeBuilder /></ProtectedRoute>} />
        <Route path="/recruiter-onboarding-wizard" element={<ProtectedRoute><RecruiterOnboardingWizard /></ProtectedRoute>} />
        <Route path="/company-onboarding-wizard" element={<ProtectedRoute><CompanyOnboardingWizard /></ProtectedRoute>} />
        {/* Keep the old route for backward compatibility */}
        <Route path="/recruiter-employer-onboarding-wizard" element={<ProtectedRoute><CompanyOnboardingWizard /></ProtectedRoute>} />

        {/* Routes from Project C */}
        <Route path="/course-detail-learning-interface" element={<ProtectedRoute requireOnboarding={true}><CourseDetailLearningInterface /></ProtectedRoute>} />
        <Route path="/ai-career-coach-chat-interface" element={<ProtectedRoute requireOnboarding={true}><AiCareerCoachChatInterface /></ProtectedRoute>} />
        <Route path="/company-dashboard-pipeline-management" element={<ProtectedRoute requireOnboarding={true}><CompanyDashboardPipelineManagement /></ProtectedRoute>} />
        {/* Keep the old route for backward compatibility */}
        <Route path="/recruiter-dashboard-pipeline-management" element={<ProtectedRoute requireOnboarding={true}><CompanyDashboardPipelineManagement /></ProtectedRoute>} />
        <Route path="/candidate-profile-evaluation-interface" element={<ProtectedRoute requireOnboarding={true}><CandidateProfileEvaluationInterface /></ProtectedRoute>} />
        <Route path="/job-search-application-hub" element={<ProtectedRoute requireOnboarding={true}><JobSearchApplicationHub /></ProtectedRoute>} />
        <Route path="/job-applications" element={<ProtectedRoute requireOnboarding={true}><JobApplications /></ProtectedRoute>} />
        <Route path="/admin-dashboard-system-management" element={<ProtectedRoute><AdminDashboardSystemManagement /></ProtectedRoute>} />

        {/* Routes from Project D */}
        <Route path="/interview-practice-video-sessions" element={<ProtectedRoute requireOnboarding={true}><InterviewPracticeVideoSessions /></ProtectedRoute>} />
        <Route path="/mentorship-platform" element={<ProtectedRoute requireOnboarding={true}><MentorshipPlatform /></ProtectedRoute>} />
        <Route path="/resource-library" element={<ProtectedRoute requireOnboarding={true}><ResourceLibrary /></ProtectedRoute>} />
        <Route path="/alumni-network-referrals" element={<ProtectedRoute requireOnboarding={true}><AlumniNetworkReferrals /></ProtectedRoute>} />
        <Route path="/virtual-career-fair" element={<ProtectedRoute requireOnboarding={true}><VirtualCareerFair /></ProtectedRoute>} />
        <Route path="/hackathons-competitions" element={<ProtectedRoute requireOnboarding={true}><HackathonsCompetitions /></ProtectedRoute>} />

        {/* Real-Time Dashboard */}
        <Route path="/real-time-dashboard" element={<ProtectedRoute requireOnboarding={true}><RealTimeDashboard /></ProtectedRoute>} />

        {/* 404 Not Found Route */}
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
    </ErrorBoundary>
  );
};

export default Routes;

