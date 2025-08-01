"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  Loader2,
  Hash,
  MessageSquare,
  Database,
} from "lucide-react";
import { toast } from "sonner";
import Cookies from 'js-cookie'; // --- 1. Import Cookies ---
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
// --- Type Definition ---
interface AccountDetails {
  name: string;
  email: string;
  plan_name: string;
  is_expired: boolean;
  expires_on: string;
  active_subreds: number;
  max_subreds: number;
  comments_count: number;
  max_comments: number;
  kb_size: number;
  max_kb_size: number;
}

// --- Helper Component for Usage Cards ---
const UsageCard = ({ title, icon, used, max, unit }: { title: string, icon: React.ReactNode, used: number, max: number, unit: string }) => {
    const percentage = (max > 0) ? Math.round((used / max) * 100) : 0;
    return (
        <Card className="shadow-sm">
            <CardHeader>
                <div className="flex items-center space-x-3">
                    {icon}
                    <CardTitle className="text-lg">{title}</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="space-y-2">
                <p className="text-2xl font-bold">{used} <span className="text-base font-normal text-muted-foreground">/ {max} {unit}</span></p>
                <Progress value={percentage} />
                <p className="text-xs text-muted-foreground">{percentage}% of your limit used</p>
            </CardContent>
        </Card>
    );
};

export default function AccountsPage() {
  const [accountData, setAccountData] = useState<AccountDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // --- 2. Get the token from cookies ---
      const token = Cookies.get('auth_token');
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }

      // --- 3. Add the Authorization header to the fetch call ---
      const response = await fetch('http://127.0.0.1:8000/account', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch account data');
      }
      const data: AccountDetails = await response.json();
      setAccountData(data);
    } catch (error: any) {
      toast.error(error.message);
      // Optional: redirect to login if unauthorized
      if (error.message.includes('Unauthorized')) {
        // router.push('/login');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!accountData) {
    return (
        <div className="p-8 text-center">
            <h2 className="text-xl font-semibold">Could not load account data.</h2>
            <p className="text-gray-600 mt-2">Please try refreshing the page or log in again.</p>
        </div>
    )
  }

  return (
    <ProtectedRoute>
      <Layout>
    <div className="p-4 sm:p-6 lg:p-8 bg-slate-50/50 min-h-full space-y-8">
        <div className="max-w-7xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Account Management</h1>
                <p className="mt-1 text-gray-600">Manage your subscription, billing, and account settings.</p>
            </div>

            <Card className="mt-8 shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center text-xl"><Users className="mr-3 h-5 w-5 text-indigo-600" /> Account Overview</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                        <div>
                            <p className="font-medium text-gray-500">Name</p>
                            <p className="font-semibold text-gray-900">{accountData.name}</p>
                        </div>
                        <div>
                            <p className="font-medium text-gray-500">Email</p>
                            <p className="font-semibold text-gray-900">{accountData.email}</p>
                        </div>
                        <div>
                            <p className="font-medium text-gray-500">Current Plan</p>
                            <p className="font-semibold text-gray-900 capitalize">{accountData.plan_name}</p>
                        </div>
                        <div>
                            <p className="font-medium text-gray-500">Status</p>
                            <Badge variant={accountData.is_expired ? "destructive" : "default"} className="bg-green-100 text-green-800 border-green-200">{accountData.is_expired ? "Expired" : "Active"}</Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                <UsageCard 
                    title="Subreddits"
                    icon={<Hash className="h-5 w-5 text-indigo-600" />}
                    used={accountData.active_subreds}
                    max={accountData.max_subreds}
                    unit="tracked"
                />
                <UsageCard 
                    title="Comments"
                    icon={<MessageSquare className="h-5 w-5 text-indigo-600" />}
                    used={accountData.comments_count}
                    max={accountData.max_comments}
                    unit="per day"
                />
                <UsageCard 
                    title="Knowledge Base"
                    icon={<Database className="h-5 w-5 text-indigo-600" />}
                    used={accountData.kb_size}
                    max={accountData.max_kb_size}
                    unit="MB"
                />
            </div>
        </div>
    </div>
    </Layout>
    </ProtectedRoute>
  )
};