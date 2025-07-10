import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from 'components/layout/MainLayout';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';
import AuthToggle from './components/AuthToggle';
import AuthForm from './components/AuthForm';
import SocialAuthButtons from './components/SocialAuthButtons';
import LoadingOverlay from './components/LoadingOverlay';

const AuthenticationPage = () => {
  const [authMode, setAuthMode] = useState('login');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [typingText, setTypingText] = useState('');
  const navigate = useNavigate();

  const welcomeTexts = {
    login: "Welcome back to HireHub AI",
    register: "Join the future of hiring"
  };

  const subtitleTexts = {
    login: "Sign in to access your personalized dashboard and continue your journey",
    register: "Create your account and unlock AI-powered hiring solutions"
  };

  // Typing animation effect
  useEffect(() => {
    const text = welcomeTexts[authMode];
    let index = 0;
    setTypingText('');

    const typeInterval = setInterval(() => {
      if (index < text.length) {
        setTypingText(text.slice(0, index + 1));
        index++;
      } else {
        clearInterval(typeInterval);
      }
    }, 50);

    return () => clearInterval(typeInterval);
  }, [authMode]);

  const handleModeChange = (mode) => {
    setAuthMode(mode);
  };

  const handleFormSubmit = async (formData) => {
    setIsLoading(true);
    setLoadingMessage(authMode === 'login' ? 'Signing you in...' : 'Creating your account...');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Set authentication status
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userRole', formData.role || 'job_seeker');
      localStorage.setItem('userEmail', formData.email);

      // Navigate to homepage/dashboard
      navigate('/homepage');
    } catch (error) {
      console.error('Authentication error:', error);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const handleSocialAuth = async (provider) => {
    setIsLoading(true);
    setLoadingMessage(`Connecting with ${provider}...`);

    try {
      // Simulate OAuth flow
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Set authentication status
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userRole', 'job_seeker');
      localStorage.setItem('userEmail', `user@${provider}.com`);

      // Navigate to homepage/dashboard
      navigate('/homepage');
    } catch (error) {
      console.error('Social auth error:', error);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const handleBackToHome = () => {
    navigate('/homepage');
  };

  return (
    <MainLayout
      title="Authentication - HireHub AI"
      description="Sign in or create an account to access HireHub AI's intelligent hiring platform."
      noPadding
      fullWidth
      hideFooter
    >
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute top-40 right-20 w-48 h-48 bg-accent/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-secondary/10 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-squircle flex items-center justify-center glow-primary">
                <Icon name="Zap" size={24} color="white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-xl font-heading font-heading-bold text-foreground tracking-wide">
                HireHub AI
              </h1>
              <p className="text-xs text-muted-foreground font-caption">
                Intelligent Hiring Platform
              </p>
            </div>
          </div>

          {/* Back Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToHome}
            iconName="ArrowLeft"
            iconPosition="left"
            iconSize={16}
          >
            Back to Home
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex items-center justify-center min-h-[calc(100vh-120px)] p-4">
        <div className="w-full max-w-md">
          {/* Auth Card */}
          <div className="glassmorphic rounded-squircle p-8 elevation-3 border">
            {/* Welcome Section */}
            <div className="text-center mb-8">
              <div className="mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-squircle flex items-center justify-center mx-auto glow-primary blob-animate">
                  <Icon name="Users" size={32} color="white" />
                </div>
              </div>
              
              <h2 className="text-2xl font-heading font-heading-bold text-foreground mb-2 min-h-[2rem]">
                {typingText}
                <span className="animate-pulse">|</span>
              </h2>
              
              <p className="text-sm text-muted-foreground font-body leading-relaxed">
                {subtitleTexts[authMode]}
              </p>
            </div>

            {/* Auth Toggle */}
            <AuthToggle 
              activeMode={authMode} 
              onModeChange={handleModeChange} 
            />

            {/* Auth Form */}
            <AuthForm 
              mode={authMode}
              onSubmit={handleFormSubmit}
              isLoading={isLoading}
            />

            {/* Social Auth */}
            <div className="mt-6">
              <SocialAuthButtons 
                onSocialAuth={handleSocialAuth}
                isLoading={isLoading}
              />
            </div>

            {/* Footer Links */}
            <div className="mt-8 text-center space-y-2">
              <p className="text-xs text-muted-foreground">
                By continuing, you agree to our{' '}
                <button className="text-primary hover:text-primary/80 spring-transition">
                  Terms of Service
                </button>{' '}
                and{' '}
                <button className="text-primary hover:text-primary/80 spring-transition">
                  Privacy Policy
                </button>
              </p>
              
              <div className="flex items-center justify-center space-x-4 text-xs">
                <button className="text-muted-foreground hover:text-foreground spring-transition">
                  Help Center
                </button>
                <span className="text-border">•</span>
                <button className="text-muted-foreground hover:text-foreground spring-transition">
                  Contact Support
                </button>
              </div>
            </div>

            {/* Ambient Particles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-squircle">
              <div className="absolute top-8 left-8 w-1 h-1 bg-primary/20 rounded-full particle-float"></div>
              <div className="absolute top-16 right-12 w-1.5 h-1.5 bg-accent/30 rounded-full particle-float" style={{ animationDelay: '2s' }}></div>
              <div className="absolute bottom-12 left-16 w-1 h-1 bg-secondary/25 rounded-full particle-float" style={{ animationDelay: '4s' }}></div>
              <div className="absolute bottom-20 right-8 w-2 h-2 bg-primary/15 rounded-full particle-float" style={{ animationDelay: '6s' }}></div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-6 text-center">
            <div className="flex items-center justify-center space-x-6 text-xs text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Icon name="Shield" size={14} />
                <span>SSL Secured</span>
              </div>
              <div className="flex items-center space-x-1">
                <Icon name="Lock" size={14} />
                <span>256-bit Encryption</span>
              </div>
              <div className="flex items-center space-x-1">
                <Icon name="CheckCircle" size={14} />
                <span>GDPR Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Loading Overlay */}
      <LoadingOverlay 
        isVisible={isLoading} 
        message={loadingMessage} 
      />

      {/* Floating Particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary/20 rounded-full particle-float"></div>
        <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-accent/30 rounded-full particle-float" style={{ animationDelay: '3s' }}></div>
        <div className="absolute bottom-1/4 left-1/2 w-1.5 h-1.5 bg-secondary/25 rounded-full particle-float" style={{ animationDelay: '5s' }}></div>
        <div className="absolute top-1/2 right-1/3 w-1 h-1 bg-primary/15 rounded-full particle-float" style={{ animationDelay: '7s' }}></div>
      </div>
    </div>
    </MainLayout>
  );
};

export default AuthenticationPage;

