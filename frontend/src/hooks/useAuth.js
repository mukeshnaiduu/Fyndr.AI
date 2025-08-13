import { useState, useEffect } from 'react';

// Simple mock auth hook - replace with actual auth implementation
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate auth check - replace with actual auth logic
    const mockUser = {
      id: '1',
      email: 'user@example.com',
      name: 'John Doe',
      userType: 'jobseeker'
    };
    
    setUser(mockUser);
    setIsLoading(false);
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user
  };
};
