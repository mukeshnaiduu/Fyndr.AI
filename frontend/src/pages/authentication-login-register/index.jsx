import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from 'components/layout/MainLayout';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';
import AuthToggle from './components/AuthToggle';
import AuthForm from './components/AuthForm';
import SocialAuthButtons from './components/SocialAuthButtons';
import LoadingOverlay from './components/LoadingOverlay';
import { apiRequest, getApiUrl } from 'utils/api';
import tokenManager from 'utils/tokenManager';

const AuthenticationPage = () => {
  const [authMode, setAuthMode] = useState('login');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [typingText, setTypingText] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const navigate = useNavigate();

  const welcomeTexts = {
    login: "Welcome back to Fyndr.AI",
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
    setFormErrors({});
  };

  const handleFormSubmit = async (formData) => {
    setFormErrors({});
    setIsLoading(true);
    setLoadingMessage(authMode === 'login' ? 'Signing you in...' : 'Creating your account...');
    try {
      let endpoint = authMode === 'login' ? '/auth/login/' : '/auth/register/';
      let payload = { ...formData };
      if (authMode === 'register') {
        // Client-side required validation before hitting the API
        const localErrors = {};
        if (!formData.firstName || !formData.firstName.trim()) {
          localErrors.firstName = 'First name is required.';
        }
        if (!formData.lastName || !formData.lastName.trim()) {
          localErrors.lastName = 'Last name is required.';
        }
        if (!formData.role) {
          localErrors.role = 'Please select your role.';
        }
        if (!formData.agreeToTerms) {
          localErrors.agreeToTerms = 'You must agree to the Terms to continue.';
        }

        // Client-side password validation before hitting the API
        const pw = formData.password || '';
        const cpw = formData.confirmPassword || '';
        const unmet = [];
        if (pw.length < 8) unmet.push('at least 8 characters');
        if (!/[A-Z]/.test(pw)) unmet.push('an uppercase letter');
        if (!/[a-z]/.test(pw)) unmet.push('a lowercase letter');
        if (!/[0-9]/.test(pw)) unmet.push('a number');
        if (!/[^A-Za-z0-9]/.test(pw)) unmet.push('a special character');
        const hasSpaces = /\s/.test(pw);

        if (unmet.length > 0 || hasSpaces) {
          const req = unmet.length > 0 ? `Password must include ${unmet.join(', ')}.` : '';
          const noSpaces = hasSpaces ? ' No spaces allowed.' : '';
          localErrors.password = `${req}${noSpaces}`.trim();
        }
        if (pw !== cpw) {
          localErrors.confirmPassword = 'Passwords do not match.';
        }
        if (Object.keys(localErrors).length > 0) {
          setFormErrors(localErrors);
          setIsLoading(false);
          setLoadingMessage('');
          return;
        }
        // Prepare registration payload
        payload.username = formData.email; // Django requires username
        payload.confirm_password = formData.confirmPassword;
        payload.first_name = formData.firstName;
        payload.last_name = formData.lastName;
        payload.role = formData.role;
        // Attempt registration; apiRequest will throw on validation errors
        await apiRequest(endpoint, 'POST', payload);
        // On success, show confirmation and switch to login
        setShowSuccess(true);
        setLoadingMessage('');
        setTimeout(() => {
          setShowSuccess(false);
          setAuthMode('login');
        }, 2000);
        return;
      }
      // LOGIN FLOW
      // Include rememberMe in payload so backend can adjust token lifetimes
      const result = await apiRequest(endpoint, 'POST', { ...payload, rememberMe: formData.rememberMe });
      if (result && result.access) {
        // Store JWT tokens using token manager
        tokenManager.setTokens(result.access, result.refresh);
        // Persist rememberMe preference for client-side decisions (e.g., storage, warnings)
        localStorage.setItem('rememberMe', formData.rememberMe ? 'true' : 'false');

        setLoadingMessage('Successfully authenticated! Checking onboarding status...');
        // Fetch onboarding status from backend
        const token = result.access;
        const profileRes = await fetch(getApiUrl('/auth/profile/'), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          // Merge profile data with onboarding data for complete user info
          const mergedProfile = {
            ...profileData,
            ...(profileData.onboarding || {}),
            id: profileData.id,
            username: profileData.username,
            email: profileData.email,
            first_name: profileData.first_name,
            last_name: profileData.last_name,
            role: profileData.role,
            onboarding_complete: profileData.onboarding_complete
          };
          localStorage.setItem('user', JSON.stringify(mergedProfile));
          localStorage.setItem('userRole', profileData.role); // Set userRole for ProtectedRoute

          // Force Navbar to update by dispatching a storage event
          window.dispatchEvent(new StorageEvent('storage', { key: 'user', newValue: JSON.stringify(mergedProfile) }));
          window.dispatchEvent(new StorageEvent('storage', { key: 'isAuthenticated', newValue: 'true' }));

          // Check onboarding completion based on backend response
          const isOnboardingComplete = profileData.onboarding_complete || false;

          // Set onboarding complete flags based on role and backend data
          if (profileData.role === 'job_seeker') {
            localStorage.setItem('jobSeekerOnboardingComplete', isOnboardingComplete ? 'true' : 'false');
          }
          if (profileData.role === 'recruiter') {
            localStorage.setItem('recruiterOnboardingComplete', isOnboardingComplete ? 'true' : 'false');
          }
          if (profileData.role === 'company') {
            localStorage.setItem('companyOnboardingComplete', isOnboardingComplete ? 'true' : 'false');
          }
          if (profileData.role === 'administrator') {
            localStorage.setItem('adminOnboardingComplete', 'true');
          }

          setTimeout(() => {
            if (profileData.role === 'administrator') {
              navigate('/admin-dashboard-system-management');
            } else if (profileData.role === 'recruiter') {
              if (isOnboardingComplete) {
                navigate('/recruiter-dashboard-pipeline-management');
              } else {
                navigate('/recruiter-onboarding-wizard');
              }
            } else if (profileData.role === 'company') {
              if (isOnboardingComplete) {
                navigate('/company-dashboard-pipeline-management');
              } else {
                navigate('/company-onboarding-wizard');
              }
            } else if (profileData.role === 'job_seeker') {
              if (isOnboardingComplete) {
                navigate('/job-search-application-hub');
              } else {
                navigate('/job-seeker-onboarding-wizard');
              }
            } else {
              navigate('/homepage');
            }
          }, 1500);
        } else {
          // Profile fetch failed
          throw { detail: 'Could not fetch user profile.' };
        }
      } else {
        // Treat missing tokens as invalid credentials
        throw { detail: 'Invalid credentials' };
      }
    } catch (error) {
      // Log the error for debugging
      console.error('Authentication error:', error);

      // Map backend validation errors to form field keys
      const mappedErrors = {};

      const resp = (error && typeof error === 'object' && error.response && typeof error.response === 'object')
        ? error.response
        : null;

      if (resp) {
        // DRF usually returns { field: [messages], detail: '...' }
        Object.entries(resp).forEach(([key, value]) => {
          if (key === 'detail' || key === 'non_field_errors') {
            const arr = Array.isArray(value) ? value : [String(value)];
            mappedErrors.non_field_errors = arr;
            return;
          }
          const messages = Array.isArray(value)
            ? value.map(v => (typeof v === 'string' ? v : JSON.stringify(v)))
            : [typeof value === 'string' ? value : JSON.stringify(value)];
          const camelKey = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
          mappedErrors[camelKey] = messages.join(' ');
        });
      } else if (error && typeof error.message === 'string' && error.message.includes(':')) {
        // Parse patterns like "email: Enter a valid email address." or "password: Incorrect password."
        const pairs = [...error.message.matchAll(/([a-zA-Z_]+)\s*:\s*([^|\n]+)/g)];
        if (pairs.length > 0) {
          pairs.forEach((m) => {
            const field = m[1];
            const msg = m[2].trim();
            const camelKey = field.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
            if (field === 'detail' || field === 'non_field_errors') {
              mappedErrors.non_field_errors = [msg];
            } else {
              mappedErrors[camelKey] = msg;
            }
          });
        } else {
          mappedErrors.non_field_errors = [error.message];
        }
      } else {
        mappedErrors.non_field_errors = ['Authentication failed.'];
      }

      // Uniqueness collision: collapse username/email messages into a single inline email field error (register flow)
      if (authMode === 'register') {
        const emailErrText = (mappedErrors.email || '').toString().toLowerCase();
        const usernameErrText = (mappedErrors.username || '').toString().toLowerCase();
        const emailTaken = emailErrText.includes('exists') || emailErrText.includes('already') || emailErrText.includes('unique');
        const usernameTaken = usernameErrText.includes('exists') || usernameErrText.includes('already') || usernameErrText.includes('unique');
        if (emailTaken || usernameTaken) {
          mappedErrors.email = 'An account with this email already exists. Please sign in or use “Forgot password”.';
          delete mappedErrors.username;
          delete mappedErrors.non_field_errors; // keep errors inside the specific field box
        }
      }

      setFormErrors(mappedErrors);
      setLoadingMessage('');
    } finally {
      setIsLoading(false);
      // Don't clear loadingMessage immediately if registration was successful
      if (authMode === 'login') setLoadingMessage('');
    }
  };

  const handleSocialAuth = async (provider) => {
    setIsLoading(true);
    setLoadingMessage(`Connecting with ${provider}...`);

    try {
      // Simulate OAuth flow
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Set authentication status using token manager (for demo)
      // In real implementation, you'd get actual tokens from OAuth response
      const demoTokens = {
        access: 'demo_access_token',
        refresh: 'demo_refresh_token'
      };

      tokenManager.setTokens(demoTokens.access, demoTokens.refresh);

      // Note: Social auth currently defaults to job_seeker role
      // In a real implementation, this should be determined by the OAuth response
      // or prompt the user to select their role after social login
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
      title="Authentication - Fyndr.AI"
      description="Sign in or create an account to access Fyndr.AI's intelligent hiring platform."
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
            {/* Branding and Back to Home removed as requested */}
          </div>
        </header>

        {/* Main Content */}
        <main className="relative z-10 flex items-center justify-center min-h-[calc(100vh-120px)] p-6">
          <div className="w-full max-w-2xl">
            {/* Auth Card */}
            <div className="rounded-xl p-10 elevation-2 border border-border/50 bg-white/90 dark:bg-neutral-900/85 shadow-xl backdrop-blur">
              {/* Welcome Section */}
              <div className="text-center mb-8">
                <div className="mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center mx-auto glow-primary blob-animate">
                    <Icon name="Users" size={32} color="white" />
                  </div>
                </div>

                <h2 className="text-2xl font-heading font-heading-bold text-foreground mb-2 min-h-[2rem]">
                  {typingText}
                  <span className="animate-pulse">|</span>
                </h2>

                <p className="text-sm text-foreground font-body leading-relaxed">
                  {subtitleTexts[authMode]}
                </p>
              </div>

              {/* Auth Toggle */}
              <AuthToggle
                activeMode={authMode}
                onModeChange={handleModeChange}
              />

              {/* Auth Form */}
              {/* Errors render inline near fields; top-level summaries removed to avoid duplication */}
              <div className="mt-6">
                <AuthForm
                  mode={authMode}
                  onSubmit={handleFormSubmit}
                  isLoading={isLoading}
                  errors={formErrors}
                />
              </div>

              {/* Social Auth */}
              <div className="mt-8">
                <SocialAuthButtons
                  onSocialAuth={handleSocialAuth}
                  isLoading={isLoading}
                />
              </div>

              {/* Footer Links */}
              <div className="mt-10 text-center space-y-2">
                <p className="text-xs text-foreground">
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
                  <button className="text-foreground hover:text-primary spring-transition">
                    Help Center
                  </button>
                  <span className="text-border">•</span>
                  <button className="text-foreground hover:text-primary spring-transition">
                    Contact Support
                  </button>
                </div>
              </div>

              {/* Ambient Particles */}
              <div className="hidden md:block absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
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
        {isLoading && <LoadingOverlay message={loadingMessage} />}
        {showSuccess && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full text-center border border-success">
              <Icon name="CheckCircle" size={48} className="text-success mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-success">User created successfully!</h3>
              <p className="text-sm text-muted-foreground mb-4">Your account has been created. Redirecting to sign in...</p>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default AuthenticationPage;

