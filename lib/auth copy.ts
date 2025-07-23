import Cookies from 'js-cookie';
import { toast } from 'sonner';
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

class AuthService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL ||'http://192.168.43.144:8000' || 'http://localhost:4000' || 'https://fa5e7e8562a4.ngrok-free.app/summa';
  private tokenKey = 'auth_token';
  private userKey = 'user_data';

  // Cookie options for secure HTTPS
  private getCookieOptions() {
    return {
      secure: process.env.NODE_ENV === 'production', // Only use secure in production (HTTPS)
      sameSite: 'strict' as const,
      expires: 7, // 7 days
      path: '/'
    };
  }

  async login(email: string, password: string , timezone : string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/manual_auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password , timezone }),
        credentials: 'include', // Include cookies in requests
      });

      const data = await response.json();
      
      if (data.token) {
          // Store token in secure cookies
          Cookies.set(this.tokenKey, data.token, this.getCookieOptions());

          // Store user info in cookies
          Cookies.set(this.userKey, JSON.stringify({
            user_id: data.user_id,
            email: data.email,
            name: data.name,
            picture: data.picture,
          }), this.getCookieOptions());

          // Store token expiration (exp) in cookies
          Cookies.set("token_expiry", data.exp, this.getCookieOptions());
          console.log("All Cookies:", Cookies.get());
          return {
            success: true,
            message: 'Login successful',
            user: {
              user_id: data.user_id,
              name: data.name,
              email: data.email,
              picture: data.picture
            },
            token: data.token
          };
      } else if (data.message === "verification_email_sent") {
        return {
          success: false,
          message: "Please verify your email before logging in. Check your inbox for the verification link.",
          requiresVerification: true,
          email: email
        };
      } else {
        return {
          success: false,
          message: data.message || 'Login failed'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
  }
   async loginGoogle(data : any): Promise<AuthResponse> {
    try {
      // const response = await fetch(`${this.baseUrl}/auth/manual_auth`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ email, password , timezone }),
      //   credentials: 'include', // Include cookies in requests
      // });

      // const data = await response.json();
      console.log("Google",data);
      if (data.token) {
          // Store token in secure cookies
          Cookies.set(this.tokenKey, data.token, this.getCookieOptions());
          console.log("All Cookies:", Cookies.get());

          console.log("------------------------,",data.token );
          // Store user info in cookies 
          Cookies.set(this.userKey, JSON.stringify({
            user_id: data.user_id,
            email: data.email,
            name: data.name,
            picture: data.picture,
          }), this.getCookieOptions());

          // Store token expiration (exp) in cookies
          Cookies.set("token_expiry", data.exp, this.getCookieOptions());
          
          return {
            success: true,
            message: 'Login successful',
            user: {
              user_id: data.user_id,
              name: data.name,
              email: data.email,
              picture: data.picture
            },
            token: data.token
          };
      } else if (data.message === "verification_email_sent") {
        return {
          success: false,
          message: "Please verify your email before logging in. Check your inbox for the verification link.",
          requiresVerification: true,
          email: data.email
        };
      } else {
        return {
          success: false,
          message: data.message || 'Login failed'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
  }


  // async register(name: string, email: string, password: string): Promise<AuthResponse> {
  //   try {
  //     const response = await fetch(`${this.baseUrl}/auth/register`, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({ name, email, password }),
  //       credentials: 'include', // Include cookies in requests
  //     });

  //     const data = await response.json();

  //     if (data.success && data.token) {
  //       // Store token and user data in secure cookies
  //       Cookies.set(this.tokenKey, data.token, this.getCookieOptions());
  //       Cookies.set(this.userKey, JSON.stringify(data.user), this.getCookieOptions());
  //     }

  //     return data;
  //   } catch (error) {
  //     return {
  //       success: false,
  //       message: 'Network error. Please check your connection.',
  //     };
  //   }
  // }

  async verifyToken(): Promise<AuthResponse> {
    const token = this.getToken();
    
    if (!token) {
      return {
        success: false,
        message: 'No authentication token found',
      };
    }
    // return {
    //   success:true,
    //   message:"Token is valid"
    // }
    try {
      const response = await fetch(`${this.baseUrl}/auth/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies in requests
      });

      const data = await response.json();
      console.log("**********************************",data);
      if (!data.success) {
        this.logout();
      }

      return data;
    } catch (error) {
      this.logout();
      return {
        success: false,
        message: 'Failed to verify authentication',
      };
    }
  }

  logout(): void {
    // Remove cookies
    Cookies.remove(this.tokenKey, { path: '/' });
    Cookies.remove(this.userKey, { path: '/' });
    Cookies.remove("token_expiry", { path: '/' });
  }

  getStoredUser(): User | null {
    try {
      const userStr = Cookies.get(this.userKey);
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }

  getToken(): string | null {
  console.log("asdasds"  , this.tokenKey);
  return Cookies.get(this.tokenKey) || null;
}


   // Check if token is expired based on backend exp time
  isTokenExpired(): boolean {
    const expiry = Cookies.get("token_expiry");
    console.log("Token expiry time:", expiry);
    if (!expiry) {
      return true; // No expiry means token is invalid
    }
    try {
      const expiryTime = new Date(expiry).getTime();
      const currentTime = Date.now();
      return currentTime >= expiryTime;

    } catch (error) {
      return true; // Invalid expiry format means token is expired

    }

  }
  // Check if running in secure context (HTTPS)
  isSecureContext(): boolean {
    return typeof window !== 'undefined' && 
           (window.location.protocol === 'https:' || 
            window.location.hostname === 'localhost');
  }

  async verifyEmail(token: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/verify_email?token=${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const data = await response.json();

      if (data.token) {
        // Store token and user data in secure cookies
        Cookies.set(this.tokenKey, data.token, this.getCookieOptions());
        Cookies.set(this.userKey, JSON.stringify({
          user_id: data.user_id,
          email: data.email,
          name: data.name,
          picture: data.picture,
        }), this.getCookieOptions());
        Cookies.set("token_expiry", data.exp, this.getCookieOptions());

        return {
          success: true,
          message: 'Email verified successfully',
          user: {
           user_id: data.user_id,
            name: data.name,
            email: data.email,
            picture: data.picture
          },
          token: data.token
        };
      } else {
        return {
          success: false,
          message: data.message || 'Email verification failed'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
  }

  async resendVerificationEmail(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/resend_verification_email?email=${email}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const data = await response.json();
      
      return {
        success: data.message === 'verification_email_sent',
        message: data.message === 'verification_email_sent' ? 'Verification email sent successfully' : data.message
      };
    } catch (error) {
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
  }

  async initiateGoogleAuth(): Promise<{ success: boolean; url?: string; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const data = await response.json();
      console.log(data);
      
      if (response.ok && data.url) {
        return {
          success: true,
          url: data.url,
          message: 'OAuth URL retrieved successfully'
        };
      } else {
        return {
          success: false,
          message: data.message || 'Failed to get OAuth URL'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Network error. Please check your connection.'
      };
    }
  }

  async handleGoogleCallback(code: string, timezone: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/auth_callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, timezone }),
        credentials: 'include',
      });

      const data = await response.json();
      
      if (response.ok && data.token) {
        // Store token and user data in secure cookies
        Cookies.set(this.tokenKey, data.token, this.getCookieOptions());
        Cookies.set(this.userKey, JSON.stringify({
          user_id: data.user_id,
          email: data.email,
          name: data.name,
          picture: data.picture,
        }), this.getCookieOptions());
        Cookies.set("token_expiry", data.exp, this.getCookieOptions());

        return {
          success: true,
          message: 'Google authentication successful',
          user: {
            user_id: data.user_id,
            name: data.name,
            email: data.email,
            picture: data.picture
          },
          token: data.token
        };
      } else {
        return {
          success: false,
          message: data.message || 'Google authentication failed'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Network error. Please check your connection.'
      };
    }
  }

  // async initiateGoogleAuth(): Promise<{ success: boolean; url?: string; message: string }> {
  //   try {
  //     const response = await fetch(`${this.baseUrl}/auth`, {
  //       method: 'GET',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       credentials: 'include',
  //     });

  //     const data = await response.json();
      
  //     if (response.ok && data.url) {
  //       return {
  //         success: true,
  //         url: data.url,
  //         message: 'OAuth URL retrieved successfully'
  //       };
  //     } else {
  //       return {
  //         success: false,
  //         message: data.message || 'Failed to get OAuth URL'
  //       };
  //     }
  //   } catch (error) {
  //     return {
  //       success: false,
  //       message: 'Network error. Please check your connection.'
  //     };
  //   }
  // }

  // async handleGoogleCallback(code: string, timezone: string): Promise<AuthResponse> {
  //   try {
  //     const response = await fetch(`${this.baseUrl}/auth_callback`, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({ code, timezone }),
  //       credentials: 'include',
  //     });

  //     const data = await response.json();
      
  //     if (response.ok && data.token) {
  //       // Store token and user data in secure cookies
  //       Cookies.set(this.tokenKey, data.token, this.getCookieOptions());
  //       Cookies.set(this.userKey, JSON.stringify({
  //         id: data.user_id,
  //         name: data.name,
  //         email: data.email,
  //         picture: data.picture,
  //       }), this.getCookieOptions());
  //       Cookies.set("token_expiry", data.exp, this.getCookieOptions());

  //       return {
  //         success: true,
  //         message: 'Google authentication successful',
  //         user: {
  //           id: data.user_id,
  //           name: data.name,
  //           email: data.email,
  //           picture: data.picture
  //         },
  //         token: data.token
  //       };
  //     } else {
  //       return {
  //         success: false,
  //         message: data.message || 'Google authentication failed'
  //       };
  //     }
  //   } catch (error) {
  //     return {
  //       success: false,
  //       message: 'Network error. Please check your connection.'
  //     };
  //   }
  // }

  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/forgot_password_email?email=${email}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const data = await response.json();
      
      return {
        success: data.message === 'password_reset_email_sent',
        message: data.message === 'password_reset_email_sent' ? 'Password reset email sent successfully' : data.message
      };
    } catch (error) {
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/reset_password?token=${token}&new_password=${newPassword}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const data = await response.json();

      if (data.token) {
        // Store token and user data in secure cookies
        Cookies.set(this.tokenKey, data.token, this.getCookieOptions());
        Cookies.set(this.userKey, JSON.stringify({
          user_id: data.user_id,
          email: data.email,
          name: data.name,
          picture: data.picture,
        }), this.getCookieOptions());
        Cookies.set("token_expiry", data.exp, this.getCookieOptions());

        return {
          success: true,
          message: 'Password reset successful',
          user: {
            user_id: data.user_id,
            name: data.name,
            email: data.email,
            picture: data.picture
          },
          token: data.token
        };
      } else {
        return {
          success: false,
          message: data.message || 'Password reset failed'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
  }
}

export const authService = new AuthService();