import React, { useEffect } from 'react';
import MainLayout from '../../components/layout/MainLayout';
import HeroSection from './components/HeroSection';
import RoleCards from './components/RoleCards';
import FeaturesSection from './components/FeaturesSection';
import TestimonialsCarousel from './components/TestimonialsCarousel';
import AboutSection from './components/AboutSection';
import FooterSection from './components/FooterSection';

import { useNavigate } from 'react-router-dom';

const Homepage = () => {
  const navigate = useNavigate();

  // The homepage should be accessible to everyone (no auth check needed)
  // Users can access it to learn about the platform before signing up

  useEffect(() => {
    // Scroll to top on component mount
    window.scrollTo(0, 0);
  }, []);

  return (
    <MainLayout
      title="Fyndr.AI - Intelligent Hiring Platform | AI-Powered Recruitment"
      description="Transform your hiring process with Fyndr.AI's intelligent recruitment platform. AI-powered screening, bias-free interviews, and smart candidate matching for job seekers, recruiters, and employers."
      ogTitle="Fyndr.AI - Intelligent Hiring Platform"
      ogDescription="Revolutionize your hiring process with AI-powered recruitment solutions"
      canonicalPath="/homepage"
      fullWidth
      noPadding
      hideFooter
    >
      {/* Main Content - Homepage has its own custom layout */}
      <div className="relative">
        {/* Hero Section */}
        <HeroSection />

        {/* Role Selection Cards */}
        <RoleCards />

        {/* Features Section */}
        <FeaturesSection />

        {/* Testimonials Carousel */}
        <TestimonialsCarousel />

        {/* About Section */}
        <AboutSection />

        {/* Footer */}
        <FooterSection />
      </div>
    </MainLayout>
  );
};

export default Homepage;
