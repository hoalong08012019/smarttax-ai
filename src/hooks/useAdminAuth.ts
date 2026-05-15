import { useState } from 'react';

export const useAdminAuth = () => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const raw = sessionStorage.getItem('smarttax_admin_auth');
      if (!raw) return false;
      try {
        const data = JSON.parse(raw);
        if (data.authenticated && data.expiresAt > Date.now()) {
          return true;
        }
        // Session expired or invalid
        sessionStorage.removeItem('smarttax_admin_auth');
      } catch (e) {
        return false;
      }
    }
    return false;
  });
  const [adminPasscodeInput, setAdminPasscodeInput] = useState<string>('');
  const [adminAuthError, setAdminAuthError] = useState<string | null>(null);

  const logout = () => {
    sessionStorage.removeItem('smarttax_admin_auth');
    setIsAdminAuthenticated(false);
  };

  return {
    isAdminAuthenticated,
    setIsAdminAuthenticated,
    adminPasscodeInput,
    setAdminPasscodeInput,
    adminAuthError,
    setAdminAuthError,
    logout
  };
};
