"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  CreditCard,
  Loader2,
  ExternalLink,
  Hash,
  MessageSquare,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import { apiService, AccountDetails, SubscriptionPlan } from "@/lib/api";

export default function Accounts() {
  const [accountData, setAccountData] = useState<AccountDetails | null>(null);
  const [availablePlans, setAvailablePlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpgrading, setIsUpgrading] = useState<number | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch both account details and available plans in parallel
      const [detailsResponse, plansResponse] = await Promise.all([
        apiService.getAccountDetails(),
        apiService.getAvailablePlans(),
      ]);

      // --- CORRECTED: Access data directly from response.data ---
      if (detailsResponse.success && detailsResponse.data) {
        setAccountData(detailsResponse.data);
      } else {
        toast.error(detailsResponse.message || "Failed to fetch account data");
      }

      if (plansResponse.success && Array.isArray(plansResponse.data)) {
        setAvailablePlans(plansResponse.data);
      } else {
        toast.error(plansResponse.message || "Failed to fetch available plans");
      }
    } catch (error) {
      toast.error("An error occurred while loading account information.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpgradePlan = async (planId: number) => {
    setIsUpgrading(planId);
    try {
      const response = await apiService.getPaymentUrl(planId);
      if (response.success && response.data?.url) {
        window.open(response.data.url, "_blank");
        toast.success("Redirecting to payment gateway...");
      } else {
        toast.error(response.message || "Failed to get payment URL");
      }
    } catch (error) {
      toast.error("Failed to initiate payment");
    } finally {
      setIsUpgrading(null);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric",
    });
  };

  const getUsagePercentage = (used: number, max: number) => {
    if (!used || !max || max === 0) return 0;
    return Math.round((used / max) * 100);
  };

  const UsageCard = ({ title, icon, used, max, unit }: { title: string, icon: React.ReactNode, used: number, max: number, unit: string }) => {
    const percentage = getUsagePercentage(used, max);
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


  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-slate-50/50 min-h-full space-y-8">
        <div className="max-w-7xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Account Management</h1>
                <p className="mt-1 text-gray-600">Manage your subscription, billing, and account settings.</p>
            </div>

            <Card className="mt-8 shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center text-xl"><Users className="mr-3 h-5 w-5" /> Account Overview</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                        <div>
                            <p className="font-medium text-gray-500">Name</p>
                            <p className="font-semibold text-gray-900">{accountData?.name}</p>
                        </div>
                        <div>
                            <p className="font-medium text-gray-500">Email</p>
                            <p className="font-semibold text-gray-900">{accountData?.email}</p>
                        </div>
                        <div>
                            <p className="font-medium text-gray-500">Current Plan</p>
                            <p className="font-semibold text-gray-900 capitalize">{accountData?.plan_name}</p>
                        </div>
                        <div>
                            <p className="font-medium text-gray-500">Status</p>
                            <Badge variant={accountData?.is_expired ? "destructive" : "default"} className="bg-green-100 text-green-800">{accountData?.is_expired ? "Expired" : "Active"}</Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                <UsageCard 
                    title="Subreddits"
                    icon={<Hash className="h-5 w-5 text-indigo-600" />}
                    used={accountData?.active_subreds || 0}
                    max={accountData?.max_subreds || 0}
                    unit="tracked"
                />
                <UsageCard 
                    title="Comments"
                    icon={<MessageSquare className="h-5 w-5 text-indigo-600" />}
                    used={accountData?.comments_count || 0}
                    max={accountData?.max_comments || 0}
                    unit="per day"
                />
            </div>
            
            <div className="mt-12">
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">Available Plans</h2>
                <p className="mt-1 text-gray-600">Upgrade your plan to unlock more features and increase your limits.</p>
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
                    {availablePlans.map((plan) => (
                        <Card key={plan.id} className="flex flex-col shadow-sm hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle className="text-xl capitalize">{plan.name}</CardTitle>
                                    <Badge variant="outline" className="text-base">₹{plan.cost}</Badge>
                                </div>
                                <CardDescription>{plan.descrip}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow space-y-4">
                                <ul className="space-y-2 text-sm text-gray-600">
                                    <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-green-600"/>{plan.subreddit_count} Subreddits</li>
                                    <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-green-600"/>{plan.comments_per_day} Comments/day</li>
                                    <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-green-600"/>{plan.kb_max_size}MB Knowledge Base</li>
                                </ul>
                            </CardContent>
                            <CardContent>
                                <Button className="w-full bg-indigo-600 hover:bg-indigo-700" onClick={() => handleUpgradePlan(plan.id)} disabled={isUpgrading === plan.id}>
                                    {isUpgrading === plan.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ExternalLink className="mr-2 h-4 w-4" />}
                                    Upgrade to {plan.name}
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    </div>
  );
}