import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';

const FooterSection = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { label: 'Features', path: '/homepage' },
      { label: 'Video Interviews', path: '/video-interview-interface' },
      { label: 'AI Screening', path: '/homepage' },
      { label: 'Analytics', path: '/homepage' }
    ],
    company: [
      { label: 'About Us', path: '/about-contact-page' },
      { label: 'Careers', path: '/about-contact-page' },
      { label: 'Contact', path: '/about-contact-page' },
      { label: 'Blog', path: '/homepage' }
    ],
    resources: [
      { label: 'Help Center', path: '/about-contact-page' },
      { label: 'Documentation', path: '/homepage' },
      { label: 'API Reference', path: '/homepage' },
      { label: 'Status', path: '/homepage' }
    ],
    legal: [
      { label: 'Privacy Policy', path: '/homepage' },
      { label: 'Terms of Service', path: '/homepage' },
      { label: 'Cookie Policy', path: '/homepage' },
      { label: 'GDPR', path: '/homepage' }
    ]
  };

  const socialLinks = [
    { name: 'Twitter', icon: 'Twitter', url: 'https://twitter.com/hirehubai', color: 'hover:text-blue-400' },
    { name: 'LinkedIn', icon: 'Linkedin', url: 'https://linkedin.com/company/hirehubai', color: 'hover:text-blue-600' },
    { name: 'GitHub', icon: 'Github', url: 'https://github.com/hirehubai', color: 'hover:text-gray-400' },
    { name: 'YouTube', icon: 'Youtube', url: 'https://youtube.com/hirehubai', color: 'hover:text-red-500' }
  ];

  const handleLinkClick = (path) => {
    navigate(path);
  };

  const handleSocialClick = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    // Mock newsletter subscription
    alert('Thank you for subscribing to our newsletter!');
  };

  return (
    <footer className="bg-gradient-to-b from-background to-card/50 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Brand Section */}
            <div className="lg:col-span-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                {/* Logo */}
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-[1.25rem] flex items-center justify-center glow-primary">
                    <Icon name="Zap" size={20} color="white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-heading font-heading-bold text-foreground tracking-wide">
                      HireHub AI
                    </h3>
                    <p className="text-xs text-muted-foreground font-caption">
                      Intelligent Hiring Platform
                    </p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground font-body leading-relaxed mb-6">
                  Revolutionizing the hiring process through AI-powered solutions that eliminate bias, enhance efficiency, and create equal opportunities for everyone.
                </p>

                {/* Social Links */}
                <div className="flex items-center space-x-4">
                  {socialLinks.map((social) => (
                    <motion.button
                      key={social.name}
                      onClick={() => handleSocialClick(social.url)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className={`w-10 h-10 glassmorphic rounded-[1.25rem] flex items-center justify-center text-muted-foreground ${social.color} spring-transition ripple`}
                    >
                      <Icon name={social.icon} size={18} />
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Links Sections */}
            <div className="lg:col-span-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {/* Product Links */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  <h4 className="text-sm font-heading font-heading-semibold text-foreground mb-4 tracking-wide">
                    Product
                  </h4>
                  <ul className="space-y-3">
                    {footerLinks.product.map((link, index) => (
                      <li key={index}>
                        <button
                          onClick={() => handleLinkClick(link.path)}
                          className="text-sm text-muted-foreground hover:text-foreground spring-transition"
                        >
                          {link.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </motion.div>

                {/* Company Links */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <h4 className="text-sm font-heading font-heading-semibold text-foreground mb-4 tracking-wide">
                    Company
                  </h4>
                  <ul className="space-y-3">
                    {footerLinks.company.map((link, index) => (
                      <li key={index}>
                        <button
                          onClick={() => handleLinkClick(link.path)}
                          className="text-sm text-muted-foreground hover:text-foreground spring-transition"
                        >
                          {link.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </motion.div>

                {/* Resources Links */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <h4 className="text-sm font-heading font-heading-semibold text-foreground mb-4 tracking-wide">
                    Resources
                  </h4>
                  <ul className="space-y-3">
                    {footerLinks.resources.map((link, index) => (
                      <li key={index}>
                        <button
                          onClick={() => handleLinkClick(link.path)}
                          className="text-sm text-muted-foreground hover:text-foreground spring-transition"
                        >
                          {link.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </motion.div>

                {/* Legal Links */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <h4 className="text-sm font-heading font-heading-semibold text-foreground mb-4 tracking-wide">
                    Legal
                  </h4>
                  <ul className="space-y-3">
                    {footerLinks.legal.map((link, index) => (
                      <li key={index}>
                        <button
                          onClick={() => handleLinkClick(link.path)}
                          className="text-sm text-muted-foreground hover:text-foreground spring-transition"
                        >
                          {link.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </div>
            </div>

            {/* Newsletter Section */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <h4 className="text-sm font-heading font-heading-semibold text-foreground mb-4 tracking-wide">
                  Stay Updated
                </h4>
                <p className="text-xs text-muted-foreground font-body leading-relaxed mb-4">
                  Get the latest updates on AI hiring trends and platform features.
                </p>
                <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    required
                    className="w-full px-3 py-2 bg-input border border-border rounded-[1.25rem] text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 spring-transition"
                  />
                  <Button
                    type="submit"
                    variant="default"
                    size="sm"
                    fullWidth
                    iconName="Send"
                    iconPosition="right"
                    iconSize={14}
                  >
                    Subscribe
                  </Button>
                </form>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-border">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex items-center space-x-4 text-xs text-muted-foreground"
            >
              <span>© {currentYear} HireHub AI. All rights reserved.</span>
              <div className="flex items-center space-x-2">
                <Icon name="Shield" size={14} className="text-success" />
                <span>SOC 2 Compliant</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex items-center space-x-4 text-xs text-muted-foreground"
            >
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                <span>All systems operational</span>
              </div>
              <span>•</span>
              <span>Made with ❤️ for better hiring</span>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Background Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/6 w-1 h-1 bg-primary/10 rounded-full particle-float"></div>
        <div className="absolute top-2/3 right-1/4 w-1.5 h-1.5 bg-accent/20 rounded-full particle-float" style={{ animationDelay: '4s' }}></div>
        <div className="absolute bottom-1/4 left-1/2 w-1 h-1 bg-success/15 rounded-full particle-float" style={{ animationDelay: '6s' }}></div>
      </div>
    </footer>
  );
};

export default FooterSection;
