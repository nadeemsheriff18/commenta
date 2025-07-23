"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import AppHeader from "@/components/layout/AppHeader";
import { Loader2, Chrome } from "lucide-react";
import VerificationPrompt from "./VerificationPrompt";
import { authService } from "@/lib/auth";
import { toast } from "sonner";

interface LoginPageProps {
  onLogin: (
    email: string,
    password: string,
    timeZone: string
  ) => Promise<boolean>;
  // onSwitchToRegister: () => void;
  onForgotPassword: () => void;
  isLoading?: boolean;
  showVerificationPrompt?: boolean;
  verificationEmail?: string;
}

export default function LoginPage({
  onLogin,
  // onSwitchToRegister,
  onForgotPassword,
  isLoading = false,
  showVerificationPrompt = false,
  verificationEmail = "",
}: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password && timeZone) {
      setIsSubmitting(true);
      const res = await onLogin(email, password, timeZone);
      console.log("Login response:", res);
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      const result = await authService.initiateGoogleAuth();

      if (result.success && result.url) {
        // Redirect to Google OAuth
        window.location.href = result.url;
      } else {
        toast.error(result.message || "Failed to initiate Google login");
      }
    } catch (error) {
      toast.error("Failed to initiate Google login");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  if (showVerificationPrompt && verificationEmail) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader
          showAuthButtons={true}
          // onRegisterClick={onSwitchToRegister}
        />
        <div className="flex items-center justify-center p-4 pt-20">
          <VerificationPrompt
            email={verificationEmail}
            onBackToLogin={() => window.location.reload()}
          />
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader
        showAuthButtons={true}
        // onRegisterClick={onSwitchToRegister}
      />
      <div className="flex items-center justify-center p-4 pt-20">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-center">
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting || isLoading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting || isLoading}
                  required
                />
              </div>
              <div className="text-right">
                <button
                  type="button"
                  onClick={onForgotPassword}
                  className="text-sm text-primary hover:underline"
                  disabled={isSubmitting || isLoading}
                >
                  Forgot password?
                </button>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || isLoading}
              >
                {isSubmitting || isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogleLogin}
                disabled={isSubmitting || isLoading || isGoogleLoading}
              >
                {isGoogleLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting to Google...
                  </>
                ) : (
                  <>
                    <Chrome className="mr-2 h-4 w-4" />
                    Continue with Google
                  </>
                )}
              </Button>
            </form>
            {/* <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <button
                  onClick={onSwitchToRegister}
                  className="text-primary hover:underline font-medium"
                  disabled={isSubmitting || isLoading}
                >
                  Sign up
                </button>
              </p>
            </div> */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
