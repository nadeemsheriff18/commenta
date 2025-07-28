"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
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
import { Loader2, Chrome, MailCheck } from "lucide-react";
import { toast } from "sonner";
import { authService } from "@/lib/auth";

type AuthView = "login" | "verifyEmail" | "forgotPassword" | "resetPassword";

function LoginPageContent() {
  const [view, setView] = useState<AuthView>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const { user, isLoading, login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/projects";

  useEffect(() => {
    const emailToken = searchParams.get("token");
    const resetToken = searchParams.get("reset_token");
    const googleCode = searchParams.get("code");

    if (emailToken) {
      handleVerifyEmail(emailToken);
    } else if (resetToken) {
      setView("resetPassword");
    } else if (googleCode) {
        handleGoogleCallback(googleCode);
    }
  }, [searchParams]);

  useEffect(() => {
    if (user && !isLoading) {
      router.push(from);
    }
  }, [user, isLoading, router, from]);
  
  const handleGoogleCallback = async (code: string) => {
    setIsGoogleLoading(true);
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const result = await authService.handleGoogleCallback(code, timezone);
    if (result.success) {
        toast.success("Google login successful!");
        window.location.href = from;
    } else {
        toast.error(result.message || "Google authentication failed");
        setIsGoogleLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const result = await login(email, password, timezone);
    
    if (result.success) {
      router.push(from);
    } else if (result.requiresVerification) {
      setView("verifyEmail");
    }
    setIsSubmitting(false);
  };
  
  const handleVerifyEmail = async (token: string) => {
    setIsSubmitting(true);
    toast.loading("Verifying your email...");
    const result = await authService.verifyEmail(token);
    if (result.success) {
      toast.success("Email verified successfully! Logging you in...");
      window.location.href = from;
    } else {
      toast.error(result.message || "Email verification failed.");
      router.push("/login");
    }
    setIsSubmitting(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const result = await authService.forgotPassword(email);
    if(result.success){
        toast.success("Password reset email sent! Please check your inbox.");
        setView("login");
    } else {
        toast.error(result.message);
    }
    setIsSubmitting(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = searchParams.get("reset_token");
    if (!token) {
        toast.error("Invalid or missing reset token.");
        return;
    }
    setIsSubmitting(true);
    const result = await authService.resetPassword(token, newPassword);
    if (result.success) {
        toast.success("Password reset successfully! Logging you in...");
        window.location.href = from;
    } else {
        toast.error(result.message);
    }
    setIsSubmitting(false);
  };
  
  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
        const result = await authService.initiateGoogleAuth();
        if (result.success && result.url) {
            window.location.href = result.url;
        } else {
            toast.error(result.message || "Failed to initiate Google login");
            setIsGoogleLoading(false);
        }
    } catch (error) {
        toast.error("Failed to initiate Google login");
        setIsGoogleLoading(false);
    }
  };

  if (isLoading || isGoogleLoading || (user && !isLoading)) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="h-16 w-16 animate-spin text-green-700" /></div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        {view === "login" && (
          <>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
              <CardDescription>Sign in to your Commentta account</CardDescription>
            </CardHeader>
            <CardContent>
              {/* --- CORRECTED: onSubmit now correctly references handleLogin --- */}
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
                <div className="space-y-2"><Label htmlFor="password">Password</Label><Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
                <div className="text-right text-sm"><Button type="button" variant="link" className="p-0 h-auto text-green-700" onClick={() => setView("forgotPassword")}>Forgot Password?</Button></div>
                <Button type="submit" className="w-full bg-green-700 hover:bg-green-800" disabled={isSubmitting}>{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Sign In</Button>
                <div className="relative"><div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-muted-foreground">Or</span></div></div>
                <Button type="button" variant="outline" className="w-full" onClick={handleGoogleLogin} disabled={isSubmitting}><Chrome className="mr-2 h-4 w-4" /> Continue with Google</Button>
              </form>
            </CardContent>
          </>
        )}
        {view === "verifyEmail" && (
            <CardContent className="text-center p-8">
                <MailCheck className="mx-auto h-12 w-12 text-green-600 mb-4"/>
                <h2 className="text-xl font-semibold">Check Your Email</h2>
                <p className="text-muted-foreground mt-2">We've sent a verification link to **{email}**. Please click the link to complete your sign-in.</p>
            </CardContent>
        )}
        {view === "forgotPassword" && (
            <>
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
                    <CardDescription>Enter your email to receive a password reset link.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleForgotPassword} className="space-y-4">
                        <div className="space-y-2"><Label htmlFor="email-forgot">Email</Label><Input id="email-forgot" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
                        <Button type="submit" className="w-full bg-green-700 hover:bg-green-800" disabled={isSubmitting}>{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Send Reset Link</Button>
                        <Button type="button" variant="link" className="w-full text-green-700" onClick={() => setView("login")}>Back to Sign In</Button>
                    </form>
                </CardContent>
            </>
        )}
        {view === "resetPassword" && (
             <>
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">Create New Password</CardTitle>
                    <CardDescription>Enter your new password below.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <div className="space-y-2"><Label htmlFor="new-password">New Password</Label><Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required /></div>
                        <Button type="submit" className="w-full bg-green-700 hover:bg-green-800" disabled={isSubmitting}>{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Set New Password</Button>
                    </form>
                </CardContent>
            </>
        )}
      </Card>
    </div>
  );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="h-16 w-16 animate-spin text-green-700" /></div>}>
            <LoginPageContent />
        </Suspense>
    )
}