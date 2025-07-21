import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../utils/api';

const NavbarUserInfo = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUser = () => {
      const token = localStorage.getItem('accessToken');
      const userString = localStorage.getItem('user');
      if (token && userString) {
        try {
          setUser(JSON.parse(userString));
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };
    getUser();
    // Listen for localStorage changes (logout in other tabs or signOut)
    const handleStorage = (e) => {
      if ((e.key === 'user' || e.key === 'accessToken') && !e.newValue) {
        setUser(null);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  if (!user) return null;
  return (
    <div className="flex flex-col items-end">
      <span className="text-sm font-medium text-gray-700">{user.name}</span>
      <span className="text-xs text-gray-500">{user.email}</span>
    </div>
  );
};

export default NavbarUserInfo;
