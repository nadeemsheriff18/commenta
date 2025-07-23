"use client";
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
import {
  Users,
  CreditCard,
  Settings,
  Shield,
  RefreshCw,
  Loader2,
  ExternalLink,
  Calendar,
  TrendingUp,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import { apiService, AccountDetails, SubscriptionPlan } from "@/lib/api";

export default function Accounts() {
  const [accountData, setAccountData] = useState<AccountDetails | null>(null);
  const [availablePlans, setAvailablePlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);

  // Fetch account data from API
  const fetchAccountData = async (showRefreshLoader = false) => {
    if (showRefreshLoader) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const response = await apiService.getAccountDetails();
      console.log("ACCOUNTS : ", response);
      console.log("ACCOUNTS --- : ", response.data.data);
      if (response.success && response.data.data) {
        setAccountData(response.data.data);
      } else {
        toast.error(response.message || "Failed to fetch account data");
      }
    } catch (error) {
      toast.error("Failed to fetch account data");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Fetch available plans
  const fetchAvailablePlans = async () => {
    try {
      const response = await apiService.getAvailablePlans();
      console.log("AVAILABLE PLANS ; ", response);
      console.log("AVAILABLE PLANS-------- ; ", response.data.data);
      if (response.success && response.data.data) {
        setAvailablePlans(response.data.data);
      } else {
        console.error("Failed to fetch available plans:", response.message);
      }
    } catch (error) {
      console.error("Failed to fetch available plans:", error);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchAccountData();
    fetchAvailablePlans();
  }, []);

  // Auto-refresh every 5 minutes
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     fetchAccountData();
  //   }, 5 * 60 * 1000);

  //   return () => clearInterval(interval);
  // }, []);

  const handleRefresh = () => {
    fetchAccountData(true);
  };

  const handleUpgradePlan = async (planId: number) => {
    setIsUpgrading(true);
    try {
      const response = await apiService.getPaymentUrl(planId);
      console.log("PAYMENT url :", response);
      console.log("PAYMENT url ---- :", response.data.data);
      if (response.success && response.data.data) {
        // Open payment URL in new tab
        window.open(response.data.data.url, "_blank");
        toast.success("Redirecting to payment gateway...");
      } else {
        toast.error(response.message || "Failed to get payment URL");
      }
    } catch (error) {
      toast.error("Failed to initiate payment");
    } finally {
      setIsUpgrading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getUsagePercentage = (used: number, max: number) => {
    return max > 0 ? Math.round((used / max) * 100) : 0;
  };

  if (isLoading && !accountData) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600 mb-4" />
            <p className="text-gray-600">Loading account information...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Account Management
          </h1>
          <p className="text-gray-600">
            Manage your subscription, billing, and account settings
          </p>
        </div>
        {/* <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
        </Button> */}
      </div>

      {/* Account Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5" />
            Account Overview
          </CardTitle>
          <CardDescription>
            Your current account status and plan information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">
                Account Details
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Name:</span> {accountData?.name}
                </div>
                <div>
                  <span className="font-medium">Email:</span>{" "}
                  {accountData?.email}
                </div>
                <div>
                  <span className="font-medium">Plan:</span>
                  <Badge
                    variant={
                      accountData?.is_expired ? "destructive" : "secondary"
                    }
                    className="ml-2"
                  >
                    {accountData?.plan_name}
                  </Badge>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Plan Status</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Status:</span>
                  <Badge
                    variant={
                      accountData?.is_expired ? "destructive" : "default"
                    }
                    className="ml-2"
                  >
                    {accountData?.is_expired ? "Expired" : "Active"}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium">Expires on:</span>{" "}
                  {accountData?.expires_on
                    ? formatDate(accountData.expires_on)
                    : "N/A"}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg">Current Plan</CardTitle>
              </div>
              <Badge
                variant={accountData?.is_expired ? "destructive" : "secondary"}
              >
                {accountData?.plan_name}
              </Badge>
            </div>
            <CardDescription>
              Your current subscription plan and billing information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium">Plan Status</p>
              <p className="text-sm text-gray-600">
                {accountData?.is_expired ? "Expired" : "Active"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Expires on</p>
              <p className="text-sm text-gray-600">
                {accountData?.expires_on
                  ? formatDate(accountData.expires_on)
                  : "N/A"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <CardTitle className="text-lg">Subreddits</CardTitle>
            </div>
            <CardDescription>Your subreddit monitoring usage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium">Active subreddits</p>
              <p className="text-sm text-gray-600">
                {accountData?.active_subreds} of {accountData?.max_subreds} used
              </p>
            </div>
            <div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{
                    width: `${
                      accountData
                        ? getUsagePercentage(
                            accountData.active_subreds,
                            accountData.max_subreds
                          )
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {accountData
                  ? getUsagePercentage(
                      accountData.active_subreds,
                      accountData.max_subreds
                    )
                  : 0}
                % used
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-purple-600" />
              <CardTitle className="text-lg">Comments</CardTitle>
            </div>
            <CardDescription>
              Your daily comment generation usage
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium">Comments generated</p>
              <p className="text-sm text-gray-600">
                {accountData?.comments_count} of {accountData?.max_comments}{" "}
                today
              </p>
            </div>
            <div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full"
                  style={{
                    width: `${
                      accountData
                        ? getUsagePercentage(
                            accountData.comments_count,
                            accountData.max_comments
                          )
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {accountData
                  ? getUsagePercentage(
                      accountData.comments_count,
                      accountData.max_comments
                    )
                  : 0}
                % used
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-2 h-5 w-5" />
            Knowledge Base Usage
          </CardTitle>
          <CardDescription>Your knowledge base storage usage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm">
                <span>
                  Storage used: {accountData?.kb_size} MB of{" "}
                  {accountData?.max_kb_size} MB
                </span>
                <span>
                  {accountData
                    ? getUsagePercentage(
                        accountData.kb_size,
                        accountData.max_kb_size
                      )
                    : 0}
                  %
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{
                    width: `${
                      accountData
                        ? getUsagePercentage(
                            accountData.kb_size,
                            accountData.max_kb_size
                          )
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Plans */}
      {availablePlans.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="mr-2 h-5 w-5" />
              Available Plans
            </CardTitle>
            <CardDescription>
              Upgrade your plan to get more features and higher limits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availablePlans.map((plan) => (
                <Card
                  key={plan.id}
                  className="border-2 hover:border-blue-500 transition-colors"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{plan.name}</CardTitle>
                      <Badge variant="outline">
                        {formatCurrency(plan.cost)}
                      </Badge>
                    </div>
                    <CardDescription>{plan.descrip}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Duration:</span>
                        <span>{plan.duration_in_days} days</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Subreddits:</span>
                        <span>{plan.subreddit_count}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Comments/day:</span>
                        <span>{plan.comments_per_day}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>KB Storage:</span>
                        <span>{plan.kb_max_size} MB</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Update frequency:</span>
                        <span>{plan.time_gap} min</span>
                      </div>
                    </div>
                    <Button
                      className="w-full"
                      onClick={() => handleUpgradePlan(plan.id)}
                      disabled={isUpgrading}
                    >
                      {isUpgrading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Upgrade to {plan.name}
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
