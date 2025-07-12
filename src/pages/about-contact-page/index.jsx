import React, { useEffect } from 'react';
import MainLayout from 'components/layout/MainLayout';
import HeroSection from './components/HeroSection';
import TeamShowcase from './components/TeamShowcase';
import FAQSection from './components/FAQSection';
import ContactSection from './components/ContactSection';

const AboutContactPage = () => {
  useEffect(() => {
    // Scroll to top on page load
    window.scrollTo(0, 0);
  }, []);

  return (
    <MainLayout 
      title="About Us & Contact - FyndrAI | Intelligent Hiring Platform"
      description="Learn about FyndrAI's mission to revolutionize hiring through AI. Meet our team, get answers to FAQs, and contact us for support or partnerships."
      ogTitle="About Us & Contact - FyndrAI"
      ogDescription="Discover FyndrAI's mission, meet our expert team, and get in touch for support or partnerships."
      canonicalPath="/about-contact-page"
    >
      <div className="min-h-screen bg-background">
        {/* Main Content */}
        <main>
          {/* Hero Section */}
          <HeroSection />
          
          {/* Team Showcase */}
          <TeamShowcase />
          
          {/* FAQ Section */}
          <FAQSection />
          
          {/* Contact Section */}
          <ContactSection />
        </main>

        {/* Footer */}
        <footer className="bg-gradient-to-r from-card to-secondary/20 border-t border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Company Info */}
              <div className="md:col-span-2">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-squircle flex items-center justify-center">
                    <span className="text-white font-heading font-heading-bold text-lg">H</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-heading font-heading-bold text-foreground">
                      FyndrAI
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Intelligent Hiring Platform
                    </p>
                  </div>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Revolutionizing the hiring process through AI-powered solutions that create meaningful connections between talent and opportunities.
                </p>
                <div className="flex items-center space-x-4">
                  <button className="w-8 h-8 bg-[#0077B5] rounded-squircle flex items-center justify-center hover:scale-110 spring-transition">
                    <span className="text-white text-sm font-bold">in</span>
                  </button>
                  <button className="w-8 h-8 bg-[#1DA1F2] rounded-squircle flex items-center justify-center hover:scale-110 spring-transition">
                    <span className="text-white text-sm font-bold">t</span>
                  </button>
                  <button className="w-8 h-8 bg-[#333] rounded-squircle flex items-center justify-center hover:scale-110 spring-transition">
                    <span className="text-white text-sm font-bold">gh</span>
                  </button>
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h4 className="text-lg font-heading font-heading-semibold text-foreground mb-4">
                  Quick Links
                </h4>
                <ul className="space-y-2">
                  <li>
                    <a href="/homepage" className="text-muted-foreground hover:text-primary spring-transition">
                      Home
                    </a>
                  </li>
                  <li>
                    <a href="/authentication-login-register" className="text-muted-foreground hover:text-primary spring-transition">
                      Sign In
                    </a>
                  </li>
                  <li>
                    <a href="/video-interview-interface" className="text-muted-foreground hover:text-primary spring-transition">
                      Interviews
                    </a>
                  </li>
                  <li>
                    <a href="/profile-management" className="text-muted-foreground hover:text-primary spring-transition">
                      Profile
                    </a>
                  </li>
                </ul>
              </div>

              {/* Support */}
              <div>
                <h4 className="text-lg font-heading font-heading-semibold text-foreground mb-4">
                  Support
                </h4>
                <ul className="space-y-2">
                  <li>
                    <a href="#faq" className="text-muted-foreground hover:text-primary spring-transition">
                      FAQ
                    </a>
                  </li>
                  <li>
                    <a href="#contact" className="text-muted-foreground hover:text-primary spring-transition">
                      Contact Us
                    </a>
                  </li>
                  <li>
                    <a href="/notifications-center" className="text-muted-foreground hover:text-primary spring-transition">
                      Help Center
                    </a>
                  </li>
                  <li>
                    <span className="text-muted-foreground">
                      hello@fyndrai.com
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row items-center justify-between">
              <p className="text-muted-foreground text-sm">
                © {new Date().getFullYear()} FyndrAI. All rights reserved.
              </p>
              <div className="flex items-center space-x-6 mt-4 md:mt-0">
                <a href="#" className="text-muted-foreground hover:text-primary text-sm spring-transition">
                  Privacy Policy
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary text-sm spring-transition">
                  Terms of Service
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary text-sm spring-transition">
                  Cookie Policy
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </MainLayout>
  );
};

export default AboutContactPage;

