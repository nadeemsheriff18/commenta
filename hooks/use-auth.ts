'use client';

import { useState, useEffect, useCallback } from 'react';
import { authService, User, AuthResponse } from '@/lib/auth';
import { toast } from 'sonner';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showVerificationPrompt, setShowVerificationPrompt] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');

  const checkAuth = useCallback(async () => {
    setIsLoading(true);
    // First check if we have a stored user
    const storedUser = authService.getStoredUser();
    const token = authService.getToken();
    // Check if token is expired before proceeding
    console.log("TOKEN-----: ",token);
    console.log("ISEXPIRED---",authService.isTokenExpired());
    console.log('000000000000000000000000000')
    if (token && authService.isTokenExpired()) {
      // console.log("ENTERED SET UsER");
      // Token is expired, clear everything and don't verify with backend
      authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      setShowVerificationPrompt(false);
      setVerificationEmail('');
      setIsLoading(false);
      toast.error('Session expired. Please log in again.');
      return;
    }

    if (storedUser) {
      console.log("StoreD usER :;;;;;;;;;",storedUser);
      setUser(storedUser);
      setIsAuthenticated(true);
    }
    // Then verify with backend (only if token exists and is not expired)
    if (!token) {
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
      return;
    }

    const result = await authService.verifyToken();
    if (result) {
      console.log("Auth check successful:", result);
      setUser(storedUser);
      setIsAuthenticated(true);
      setShowVerificationPrompt(false);
      setVerificationEmail('');
    } else {
      setUser(null);
      setIsAuthenticated(false);
      if (storedUser) {
        // Only show error if we had a stored user but verification failed
        toast.error('Session expired. Please log in again.');
      }

    }

    

    setIsLoading(false);

  }, []);
  // Find your login function and replace it with this corrected version

const login = async (email: string, password: string, timezone: string): Promise<AuthResponse> => {
  if (!email || !password) {
    toast.error('Please fill in all fields');
    return { success: false, message: 'Please fill in all fields' };
  }
  if (!email.includes('@')) {
    toast.error('Please enter a valid email address');
    return { success: false, message: 'Please enter a valid email address' };
  }

  setIsLoading(true);
  const result = await authService.login(email, password, timezone);
  setIsLoading(false);

  if (result.success && result.user) {
    setUser(result.user);
    setIsAuthenticated(true);
    toast.success('Login successful! Welcome back.');
  } else if (result.requiresVerification) {
    setShowVerificationPrompt(true);
    setVerificationEmail(result.email || email);
    toast.error(result.message || 'Please verify your email before logging in');
  } else {
    toast.error(result.message || 'Login failed');
  }
  
  return result; // Return the full result object
};

  // const register = async (name: string, email: string, password: string): Promise<boolean> => {
  //   if (!name || !email || !password) {
  //     toast.error('Please fill in all fields');
  //     return false;
  //   }

  //   if (!email.includes('@')) {
  //     toast.error('Please enter a valid email address');
  //     return false;
  //   }

  //   if (password.length < 6) {
  //     toast.error('Password must be at least 6 characters long');
  //     return false;
  //   }

  //   setIsLoading(true);
  //   const result = await authService.register(name, email, password);
  //   console.log("Register response:", result);
  //   if (result.success && result.user) {
  //     setUser(result.user);
  //     setIsAuthenticated(true);
  //     setShowVerificationPrompt(false);
  //     setVerificationEmail('');
  //     toast.success('Account created successfully! Welcome aboard.');
  //     setIsLoading(false);
  //     return true;
  //   } else if (result.message === 'verification_email_sent') {
  //     setShowVerificationPrompt(true);
  //     setVerificationEmail(email);
  //     toast.success('Account created! Please check your email to verify your account.');
  //     setIsLoading(false);
  //     return false;
  //   } else {
  //     toast.error(result.message || 'Registration failed');
  //     setIsLoading(false);
  //     return false;
  //   }
  // };

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    setShowVerificationPrompt(false);
    setVerificationEmail('');
    toast.success('Logged out successfully');
  }, []);

  const clearVerificationPrompt = useCallback(() => {
    setShowVerificationPrompt(false);
    setVerificationEmail('');
  }, []);
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Periodic auth check every 5 minutes
  useEffect(() => {
    const interval = setInterval(checkAuth, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [checkAuth]);

  return {
    user,
    isLoading,
    isAuthenticated,
    showVerificationPrompt,
    verificationEmail,
    login,
    // register,
    logout,
    checkAuth,
    clearVerificationPrompt,
  };
}