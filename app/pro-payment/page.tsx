// app/pro-payment/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function ProPaymentPage() {
  const router = useRouter();

  useEffect(() => {
    const checkAndProceed = async () => {
      const token = Cookies.get('auth_token'); // adjust cookie name as per your app

      if (!token) {
        // No token, redirect to login with return path
        router.push('/login?returnTo=/pro-payment');
        return;
      }

      try {
        const res = await fetch('http://127.0.0.1:8000/pay_url?plan_id=2', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error('Failed to fetch payment URL');
        }

        const data = await res.json();

        if (data.url) {
          window.location.href = data.url;
        } else {
          toast.error('Payment URL not received');
        }
      } catch (err) {
        console.error(err);
        toast.error('Something went wrong. Please try again.');
      }
    };

    checkAndProceed();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="h-12 w-12 animate-spin text-green-700" />
      <span className="ml-4 text-lg text-gray-700">Redirecting to payment...</span>
    </div>
  );
}
