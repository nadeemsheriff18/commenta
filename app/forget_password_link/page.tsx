"use client";

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

function ForgetPasswordHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      // Redirect to the login page with the correct parameter name 'reset_token'
      router.replace(`/login?reset_token=${token}`);
    } else {
      // If no token is found, just redirect to the login page
      router.replace('/login');
    }
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <Loader2 className="h-12 w-12 animate-spin text-green-700" />
      <p className="mt-4 text-muted-foreground">Redirecting...</p>
    </div>
  );
}

// You must wrap the component in Suspense for useSearchParams to work
export default function ForgetPasswordLinkPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ForgetPasswordHandler />
        </Suspense>
    );
}