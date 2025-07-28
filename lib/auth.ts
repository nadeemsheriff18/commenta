"use client";

import Cookies from 'js-cookie';

// --- Type Definitions ---
export interface User {
  user_id: string;
  name: string;
  email: string;
  picture?: string; 
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
  requiresVerification?: boolean;
  email?: string;
}

// --- Self-Contained AuthService Class ---
class AuthService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
  private tokenKey = 'auth_token';
  private userKey = 'user_data';
  private expiryKey = 'token_expiry';

  private getCookieOptions() {
    return {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      expires: 7,
      path: '/'
    };
  }

  private handleSuccessfulAuth(data: any): User | null {
    if (data.token && data.user_id) {
      const user = { user_id: data.user_id, email: data.email, name: data.name, picture: data.picture };
      Cookies.set(this.tokenKey, data.token, this.getCookieOptions());
      Cookies.set(this.userKey, JSON.stringify(user), this.getCookieOptions());
      if (data.exp) Cookies.set(this.expiryKey, data.exp, this.getCookieOptions());
      return user;
    }
    return null;
  }
  
  async login(email: string, password: string, timezone: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/manual_auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, timezone }),
      });
      const data = await response.json();
      if (!response.ok) return { success: false, message: data.detail || 'Login failed.' };
      if (data.token) {
        const user = this.handleSuccessfulAuth(data);
        return { success: true, message: 'Login successful!', user: user || undefined };
      }
      if (data.message === 'verification_email_sent') {
        return { success: false, message: 'Verification email sent.', requiresVerification: true, email };
      }
      return { success: false, message: 'An unknown error occurred.' };
    } catch (error) {
      return { success: false, message: 'Network error. Please try again.' };
    }
  }
 isTokenExpired(): boolean {
    const expiry = Cookies.get(this.expiryKey);
    if (!expiry) return true;
    try {
      return Date.now() >= new Date(expiry).getTime();
    } catch {
      return true;
    }
  }

  async verifyToken(): Promise<boolean> {
    const token = this.getToken();
    if (!token || this.isTokenExpired()) {
      return false;
    }
    // For this mock setup, we assume if a non-expired token exists, it's valid.
    // A real production app would make an API call here to a `/verify-token` endpoint.
    return true;
  }

  getStoredUser(): User | null {
    const userStr = Cookies.get(this.userKey);
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }
  // Add these functions inside your AuthService class in auth.ts

// In your AuthService class within src/lib/auth.ts

async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${this.baseUrl}/forgot_password_email?email=${encodeURIComponent(email)}`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || "Request failed.");
    }
    return { success: true, message: "Password reset email sent!" };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

async resetPassword(token: string, new_password: string): Promise<AuthResponse> {
  try {
    const response = await fetch(`${this.baseUrl}/reset_password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, new_password }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || 'Password reset failed.');
    }
    const user = this.handleSuccessfulAuth(data);
    return { success: true, message: 'Password reset successful!', user: user || undefined };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
  async verifyEmail(token: string): Promise<AuthResponse> {
  try {
    const response = await fetch(`${this.baseUrl}/verify_email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'Verification failed.');
    }

    const user = this.handleSuccessfulAuth(data);
    return { success: true, message: 'Email verified!', user: user || undefined };
    
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
  async initiateGoogleAuth(): Promise<{ success: boolean; url?: string; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/auth`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Failed to get OAuth URL');
      return { success: true, url: data.url, message: 'OAuth URL retrieved successfully' };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  async handleGoogleCallback(code: string, timezone: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/auth_callback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, timezone }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Google auth failed.");
      const user = this.handleSuccessfulAuth(data);
      return { success: true, message: "Google login successful!", user: user || undefined };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }
  
  logout(): void {
    Cookies.remove(this.tokenKey, { path: '/' });
    Cookies.remove(this.userKey, { path: '/' });
    Cookies.remove(this.expiryKey, { path: '/' });
  }

  getToken(): string | null {
    return Cookies.get(this.tokenKey) || null;
  }

  getUser(): User | null {
    const userStr = Cookies.get(this.userKey);
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }
}

export const authService = new AuthService();