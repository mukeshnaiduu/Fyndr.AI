import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getApiUrl } from 'utils/api';
import tokenManager from 'utils/tokenManager';

const GoogleCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [message, setMessage] = useState('Completing Google connection...');
  const [error, setError] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get('code');
    const state = params.get('state');

    const complete = async () => {
      if (!code) {
        setError('Missing authorization code');
        return;
      }
      if (!tokenManager.isAuthenticated()) {
        setError('You must be signed in to connect Google');
        return;
      }
      try {
        // Call backend callback to exchange code for tokens; cookies/session carry auth
        const url = new URL(getApiUrl('/auth/oauth/google/callback/'));
        url.searchParams.set('code', code);
        if (state) url.searchParams.set('state', state);

        const access = await tokenManager.getValidAccessToken().catch(() => tokenManager.getAccessToken());
        const res = await fetch(url.toString(), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': access ? `Bearer ${access}` : undefined,
          },
          credentials: 'include',
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.error || 'Failed to connect Google');
        }
        setMessage('Google connected. Redirecting...');
        // Optionally flag connection in localStorage for UI
        localStorage.setItem('googleConnected', 'true');
        setTimeout(() => {
          const next = localStorage.getItem('postGoogleConnectNext') || '/job-applications';
          navigate(next);
        }, 1200);
      } catch (e) {
        setError(e.message || 'Connection failed');
      }
    };

    complete();
  }, [location.search, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="p-6 rounded-lg border w-full max-w-md text-center">
        {!error ? (
          <>
            <div className="mb-3 text-lg">{message}</div>
            <div className="text-sm text-muted-foreground">You can close this window if it doesn't redirect.</div>
          </>
        ) : (
          <>
            <div className="mb-3 text-red-600">{error}</div>
            <button className="px-4 py-2 border rounded" onClick={() => navigate('/authentication-login-register')}>Back to sign in</button>
          </>
        )}
      </div>
    </div>
  );
};

export default GoogleCallback;
