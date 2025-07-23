'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Mail, RefreshCw } from 'lucide-react';
import { authService } from '@/lib/auth';
import { toast } from 'sonner';

interface VerificationPromptProps {
  email: string;
  onBackToLogin: () => void;
}

export default function VerificationPrompt({ email, onBackToLogin }: VerificationPromptProps) {
  const [isResending, setIsResending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleResendEmail = async () => {
    setIsResending(true);
    
    try {
      const result = await authService.resendVerificationEmail(email);
      
      if (result.success) {
        setEmailSent(true);
        toast.success('Verification email sent! Check your inbox.');
      } else {
        toast.error(result.message || 'Failed to send verification email');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Mail className="h-6 w-6 text-blue-600" />
        </div>
        <CardTitle className="text-2xl font-bold">Verify Your Email</CardTitle>
        <CardDescription>
          We've sent a verification link to {email}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600 text-center">
          Click the link in the email to verify your account. If you don't see it, check your spam folder.
        </p>
        
        <div className="space-y-2">
          <Button 
            onClick={handleResendEmail} 
            variant="outline" 
            className="w-full"
            disabled={isResending || emailSent}
          >
            {isResending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : emailSent ? (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Email Sent!
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Resend Verification Email
              </>
            )}
          </Button>
          
          <Button onClick={onBackToLogin} variant="ghost" className="w-full">
            Back to Login
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}