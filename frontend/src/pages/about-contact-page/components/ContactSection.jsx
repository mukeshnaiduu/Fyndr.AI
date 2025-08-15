import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';
import Input from 'components/ui/Input';
import Select from 'components/ui/Select';

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    role: '',
    subject: '',
    message: '',
    priority: 'medium'
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [copiedItem, setCopiedItem] = useState(null);

  const roleOptions = [
    { value: 'job-seeker', label: 'Job Seeker' },
    { value: 'recruiter', label: 'Recruiter' },
    { value: 'employer', label: 'Employer' },
    { value: 'partner', label: 'Partner' },
    { value: 'media', label: 'Media' },
    { value: 'other', label: 'Other' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'high', label: 'High Priority' },
    { value: 'urgent', label: 'Urgent' }
  ];

  const contactInfo = [
    {
      type: 'email',
      label: 'Email Us',
      value: 'hello@fyndrai.com',
      icon: 'Mail',
      description: 'General inquiries and support'
    },
    {
      type: 'phone',
      label: 'Call Us',
      value: '+1 (555) 123-4567',
      icon: 'Phone',
      description: 'Mon-Fri, 9AM-6PM PST'
    },
    {
      type: 'address',
      label: 'Visit Us',
      value: '123 Innovation Drive, Bengaluru, Karnataka 560001',
      icon: 'MapPin',
      description: 'Our headquarters'
    }
  ];

  const socialLinks = [
    { name: 'LinkedIn', icon: 'Linkedin', url: 'https://linkedin.com/company/fyndrai', color: '#0077B5' },
    { name: 'Twitter', icon: 'Twitter', url: 'https://twitter.com/fyndrai', color: '#1DA1F2' },
    { name: 'GitHub', icon: 'Github', url: 'https://github.com/fyndrai', color: '#333' },
    { name: 'YouTube', icon: 'Youtube', url: 'https://youtube.com/fyndrai', color: '#FF0000' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    if (formData.message.trim().length < 10) newErrors.message = 'Message must be at least 10 characters';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsSubmitting(false);
    setIsSubmitted(true);

    // Reset form after success
    setTimeout(() => {
      setFormData({
        name: '',
        email: '',
        company: '',
        role: '',
        subject: '',
        message: '',
        priority: 'medium'
      });
      setIsSubmitted(false);
    }, 3000);
  };

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(type);
      setTimeout(() => setCopiedItem(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleSocialClick = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <section className="py-20 bg-gradient-to-b from-background to-card/50 dark:from-neutral-950 dark:to-neutral-900/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center space-x-2 glassmorphic px-4 py-2 rounded-squircle mb-6">
            <Icon name="MessageCircle" size={20} className="text-primary" />
            <span className="text-sm font-caption text-muted-foreground uppercase tracking-wide">
              Contact Us
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl font-heading font-heading-bold text-foreground mb-6">
            Get in{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Touch
            </span>
          </h2>

          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Have questions about Fyndr.AI? Need support? Want to explore partnership opportunities? We'd love to hear from you.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glassmorphic p-8 rounded-squircle"
          >
            <div className="mb-8">
              <h3 className="text-2xl font-heading font-heading-semibold text-foreground mb-2">
                Send us a Message
              </h3>
              <p className="text-muted-foreground">
                Fill out the form below and we'll get back to you within 24 hours.
              </p>
            </div>

            {isSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <div className="w-16 h-16 bg-success/10 rounded-squircle flex items-center justify-center mx-auto mb-4">
                  <Icon name="CheckCircle" size={32} className="text-success" />
                </div>
                <h4 className="text-xl font-heading font-heading-semibold text-foreground mb-2">
                  Message Sent Successfully!
                </h4>
                <p className="text-muted-foreground">
                  Thank you for contacting us. We'll respond within 24 hours.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Full Name"
                    name="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleInputChange}
                    error={errors.name}
                    required
                  />

                  <Input
                    label="Email Address"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    error={errors.email}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Company"
                    name="company"
                    type="text"
                    placeholder="Your company name"
                    value={formData.company}
                    onChange={handleInputChange}
                  />

                  <Select
                    label="Your Role"
                    options={roleOptions}
                    value={formData.role}
                    onChange={(value) => handleSelectChange('role', value)}
                    placeholder="Select your role"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Subject"
                    name="subject"
                    type="text"
                    placeholder="Brief subject line"
                    value={formData.subject}
                    onChange={handleInputChange}
                    error={errors.subject}
                    required
                  />

                  <Select
                    label="Priority"
                    options={priorityOptions}
                    value={formData.priority}
                    onChange={(value) => handleSelectChange('priority', value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-body font-body-medium text-foreground mb-2">
                    Message <span className="text-error">*</span>
                  </label>
                  <textarea
                    name="message"
                    rows={6}
                    placeholder="Tell us how we can help you..."
                    value={formData.message}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-input border rounded-squircle text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent spring-transition resize-none ${errors.message ? 'border-error' : 'border-border'
                      }`}
                  />
                  {errors.message && (
                    <p className="mt-1 text-sm text-error">{errors.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="default"
                  size="lg"
                  fullWidth
                  loading={isSubmitting}
                  iconName="Send"
                  iconPosition="right"
                  className="glow-primary"
                >
                  {isSubmitting ? 'Sending Message...' : 'Send Message'}
                </Button>
              </form>
            )}
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Contact Methods */}
            <div className="space-y-6">
              {contactInfo.map((info, index) => (
                <div
                  key={info.type}
                  className={`glassmorphic p-6 rounded-squircle hover:glow-primary spring-transition group stagger-${index + 1}`}
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-squircle flex items-center justify-center flex-shrink-0 group-hover:scale-110 spring-transition">
                      <Icon name={info.icon} size={24} className="text-primary" />
                    </div>

                    <div className="flex-1">
                      <h4 className="text-lg font-heading font-heading-semibold text-foreground mb-1">
                        {info.label}
                      </h4>
                      <p className="text-muted-foreground text-sm mb-2">
                        {info.description}
                      </p>

                      <div className="flex items-center space-x-2">
                        <span className="text-foreground font-body font-body-medium">
                          {info.value}
                        </span>

                        {(info.type === 'email' || info.type === 'phone') && (
                          <button
                            onClick={() => copyToClipboard(info.value, info.type)}
                            className="p-1 text-muted-foreground hover:text-primary spring-transition"
                            title="Copy to clipboard"
                          >
                            <Icon
                              name={copiedItem === info.type ? "Check" : "Copy"}
                              size={16}
                              className={copiedItem === info.type ? "text-success" : ""}
                            />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Map */}
            <div className="glassmorphic p-6 rounded-squircle">
              <h4 className="text-lg font-heading font-heading-semibold text-foreground mb-4">
                Our Location
              </h4>
              <div className="w-full h-64 rounded-squircle overflow-hidden">
                <iframe
                  width="100%"
                  height="100%"
                  loading="lazy"
                  title="Fyndr.AI Office Location"
                  referrerPolicy="no-referrer-when-downgrade"
                  src="https://www.google.com/maps?q=37.7749,-122.4194&z=14&output=embed"
                  className="border-0"
                />
              </div>
            </div>

            {/* Social Media */}
            <div className="glassmorphic p-6 rounded-squircle">
              <h4 className="text-lg font-heading font-heading-semibold text-foreground mb-4">
                Follow Us
              </h4>
              <p className="text-muted-foreground text-sm mb-6">
                Stay updated with the latest news and insights from Fyndr.AI.
              </p>

              <div className="flex items-center space-x-4">
                {socialLinks.map((social, index) => (
                  <button
                    key={social.name}
                    onClick={() => handleSocialClick(social.url)}
                    className={`w-12 h-12 rounded-squircle flex items-center justify-center hover:scale-110 spring-transition elevation-2 stagger-${index + 1}`}
                    style={{ backgroundColor: social.color }}
                    title={`Follow us on ${social.name}`}
                  >
                    <Icon name={social.icon} size={20} color="white" />
                  </button>
                ))}
              </div>
            </div>

            {/* Business Hours */}
            <div className="glassmorphic p-6 rounded-squircle">
              <h4 className="text-lg font-heading font-heading-semibold text-foreground mb-4">
                Business Hours
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monday - Friday</span>
                  <span className="text-foreground font-body-medium">9:00 AM - 6:00 PM PST</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Saturday</span>
                  <span className="text-foreground font-body-medium">10:00 AM - 4:00 PM PST</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sunday</span>
                  <span className="text-foreground font-body-medium">Closed</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
