import React, { useState } from 'react';
import Button from 'components/ui/Button';
import { apiRequest } from 'utils/api';
import tokenManager from 'utils/tokenManager';


const SocialAuthButtons = ({ onSocialAuth, isLoading }) => {
  const [rippleButton, setRippleButton] = useState(null);

  const handleSocialClick = async (provider) => {
    setRippleButton(provider);
    setTimeout(() => setRippleButton(null), 300);
    if (provider === 'google') {
      // Real Google OAuth connect flow: requires authenticated user
      if (!tokenManager.isAuthenticated()) {
        // Defer to parent handler (may simulate or show login)
        return onSocialAuth && onSocialAuth(provider);
      }
      try {
        // Remember next path for post-connect
        try { localStorage.setItem('postGoogleConnectNext', window.location.pathname || '/job-applications'); } catch { }
        const res = await apiRequest('/auth/oauth/google/init/', 'GET');
        if (res && res.authorize_url) {
          window.location.href = res.authorize_url;
          return;
        }
      } catch (e) {
        console.error('Failed to start Google OAuth:', e);
      }
      return;
    }
    onSocialAuth && onSocialAuth(provider);
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-background dark:bg-neutral-900 text-muted-foreground dark:text-gray-300 font-caption">
            Or continue with
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Button
          variant="outline"
          size="default"
          fullWidth
          onClick={() => handleSocialClick('google')}
          disabled={isLoading}
          className={`relative overflow-hidden rounded-lg ${rippleButton === 'google' ? 'ripple' : ''
            }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <svg width="18" height="18" viewBox="0 0 24 24" className="flex-shrink-0">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="font-body font-body-medium">Google</span>
          </div>
        </Button>

        <Button
          variant="outline"
          size="default"
          fullWidth
          onClick={() => handleSocialClick('linkedin')}
          disabled={isLoading}
          className={`relative overflow-hidden rounded-lg ${rippleButton === 'linkedin' ? 'ripple' : ''
            }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <svg width="18" height="18" viewBox="0 0 24 24" className="flex-shrink-0">
              <path
                fill="#0077B5"
                d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
              />
            </svg>
            <span className="font-body font-body-medium">LinkedIn</span>
          </div>
        </Button>
      </div>
    </div>
  );
};

export default SocialAuthButtons;
