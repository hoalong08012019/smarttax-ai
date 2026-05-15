import { useState } from 'react';

export const useAdminAuth = () => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('smarttax_admin_auth') === 'true';
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
