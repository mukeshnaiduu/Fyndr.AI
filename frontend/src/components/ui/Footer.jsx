import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../AppIcon';

const Footer = () => {
  // Current year for copyright
  const currentYear = new Date().getFullYear();

  // Footer links organization
  const footerLinks = {
    product: [
      { label: 'Features', href: '/about-contact-page#features' },
      { label: 'Pricing', href: '/about-contact-page#pricing' },
      { label: 'For Job Seekers', href: '/job-seeker-onboarding-wizard' },
      { label: 'For Recruiters', href: '/recruiter-onboarding-wizard' },
      { label: 'For Companies', href: '/company-onboarding-wizard' },
    ],
    resources: [
      { label: 'Resource Library', href: '/resource-library' },
      { label: 'Career Coach AI', href: '/ai-career-coach-chat-interface' },
      { label: 'Learning Center', href: '/course-detail-learning-interface' },
      { label: 'Blog', href: '/resource-library/blog' },
    ],
    company: [
      { label: 'About Us', href: '/about-contact-page#about' },
      { label: 'Careers', href: '/about-contact-page#careers' },
      { label: 'Contact', href: '/about-contact-page#contact' },
      { label: 'Partners', href: '/about-contact-page#partners' },
    ],
    legal: [
      { label: 'Privacy Policy', href: '/about-contact-page/privacy' },
      { label: 'Terms of Service', href: '/about-contact-page/terms' },
      { label: 'Cookie Policy', href: '/about-contact-page/cookies' },
      { label: 'Accessibility', href: '/about-contact-page/accessibility' },
    ],
  };

  // Social media links
  const socialLinks = [
    { label: 'Twitter', href: 'https://twitter.com/fyndrai', icon: 'Twitter' },
    { label: 'LinkedIn', href: 'https://linkedin.com/company/fyndrai', icon: 'Linkedin' },
    { label: 'GitHub', href: 'https://github.com/fyndrai', icon: 'Github' },
    { label: 'Instagram', href: 'https://instagram.com/fyndrai', icon: 'Instagram' },
  ];

  return (
    <footer className="bg-background border-t border-border mt-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Footer top section with logo and links */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-8">
          {/* Logo and description */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <Icon name="Zap" size={20} color="white" />
              </div>
              <span className="font-bold text-lg text-foreground">
                Fyndr<span className="text-primary">AI</span>
              </span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground max-w-xs">
              The AI-powered hiring platform connecting talent with opportunity through intelligent matching and bias-free recruitment tools.
            </p>

            {/* Social links */}
            <div className="mt-6 flex space-x-4">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <span className="sr-only">{link.label}</span>
                  <Icon name={link.icon} size={20} />
                </a>
              ))}
            </div>
          </div>

          {/* Link sections */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="col-span-1">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </h3>
              <ul className="mt-4 space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer bottom section with copyright and policies */}
        <div className="pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center">
          <p className="text-xs text-muted-foreground">
            &copy; {currentYear} FyndrAI. All rights reserved.
          </p>

          <div className="mt-4 sm:mt-0 flex flex-wrap justify-center space-x-4">
            <Link
              to="/about-contact-page/privacy"
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              to="/about-contact-page/terms"
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              to="/about-contact-page/cookies"
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
