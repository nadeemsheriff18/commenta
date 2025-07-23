'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppHeader from '@/components/layout/AppHeader';
import { Loader2, CheckCircle, XCircle, Mail } from 'lucide-react';
import { authService } from '@/lib/auth';
import { toast } from 'sonner';

interface EmailVerificationPageProps {
  onVerificationSuccess: () => void;
  onBackToLogin: () => void;
}

export default function EmailVerificationPage({ onVerificationSuccess, onBackToLogin }: EmailVerificationPageProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [message, setMessage] = useState('');
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      handleVerifyEmail(token);
    }
  }, [searchParams]);

  const handleVerifyEmail = async (token: string) => {
    setIsVerifying(true);
    try {
      const result = await authService.verifyEmail(token);
      
      if (result.success) {
        setVerificationStatus('success');
        setMessage('Email verified successfully! You are now logged in.');
        toast.success('Email verified successfully!');
        setTimeout(() => {
          onVerificationSuccess();
        }, 2000);
      } else {
        setVerificationStatus('error');
        setMessage(result.message || 'Email verification failed. The link may be expired or invalid.');
        toast.error(result.message || 'Email verification failed');
      }
    } catch (error) {
      setVerificationStatus('error');
      setMessage('An error occurred during verification. Please try again.');
      toast.error('Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader showAuthButtons={true} onLoginClick={onBackToLogin} />
      <div className="flex items-center justify-center p-4 pt-20">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 mb-4 flex items-center justify-center rounded-full">
              {isVerifying && <Loader2 className="h-8 w-8 animate-spin text-blue-600" />}
              {verificationStatus === 'success' && <CheckCircle className="h-8 w-8 text-green-600" />}
              {verificationStatus === 'error' && <XCircle className="h-8 w-8 text-red-600" />}
              {verificationStatus === 'pending' && !isVerifying && <Mail className="h-8 w-8 text-blue-600" />}
            </div>
            <CardTitle className="text-2xl font-bold">
              {isVerifying && 'Verifying Email...'}
              {verificationStatus === 'success' && 'Email Verified!'}
              {verificationStatus === 'error' && 'Verification Failed'}
              {verificationStatus === 'pending' && !isVerifying && 'Email Verification'}
            </CardTitle>
            <CardDescription>
              {message || 'Please wait while we verify your email address.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            {verificationStatus === 'error' && (
              <Button onClick={onBackToLogin} className="w-full">
                Back to Login
              </Button>
            )}
            {verificationStatus === 'success' && (
              <p className="text-sm text-green-600">
                Redirecting to dashboard...
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}