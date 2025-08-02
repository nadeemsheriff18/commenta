"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  TrendingUp,
  MessageSquare,
  Shield,
  Loader2,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { apiService, AccountDetails, SubscriptionPlan } from "@/lib/api";

// Query keys for React Query
const QUERY_KEYS = {
  accountDetails: ["account", "details"] as const,
  availablePlans: ["plans", "available"] as const,
};

export default function Accounts() {
  const queryClient = useQueryClient();
  const [isUpgrading, setIsUpgrading] = useState(false);

  // Fetch account details with React Query
  const {
    data: accountData,
    isLoading: isLoadingAccount,
    error: accountError,
    refetch: refetchAccount,
    isFetching: isRefreshingAccount,
  } = useQuery({
    queryKey: QUERY_KEYS.accountDetails,
    queryFn: async () => {
      const response = await apiService.getAccountDetails();
      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch account data");
      }
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Fetch available plans with React Query
  const {
    data: availablePlans = [],
    isLoading: isLoadingPlans,
    error: plansError,
  } = useQuery({
    queryKey: QUERY_KEYS.availablePlans,
    queryFn: async () => {
      const response = await apiService.getAvailablePlans();
      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch available plans");
      }
      return response.data;
    },
    staleTime: 20 * 60 * 1000, // 20 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
  });

  // Handle refresh
  const handleRefresh = async () => {
    try {
      await refetchAccount();
      toast.success("Account data refreshed successfully");
    } catch (error) {
      toast.error("Failed to refresh account data");
    }
  };

  // Invalidate and refetch all account-related data
  const handleFullRefresh = async () => {
    try {
      await queryClient.invalidateQueries({
        queryKey: ["account"],
      });
      toast.success("All account data refreshed successfully");
    } catch (error) {
      toast.error("Failed to refresh data");
    }
  };

  // Format date helper
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  // Handle errors
  if (accountError) {
    toast.error(accountError.message || "Failed to load account data");
  }

  if (plansError) {
    console.error("Failed to fetch available plans:", plansError);
  }

  // Loading state
  if (isLoadingAccount && !accountData) {
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
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshingAccount}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${
                isRefreshingAccount ? "animate-spin" : ""
              }`}
            />
            {isRefreshingAccount ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </div>

      {/* Account Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5" />
            Account Overview
            {isRefreshingAccount && (
              <Loader2 className="ml-2 h-4 w-4 animate-spin text-blue-600" />
            )}
          </CardTitle>
          <CardDescription>
            Your current account status and plan information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium">Name:</span> {accountData?.name}
              </p>
              <p>
                <span className="font-medium">Email:</span> {accountData?.email}
              </p>
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
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Status:</span>
                <Badge
                  variant={accountData?.is_expired ? "destructive" : "default"}
                  className="ml-2"
                >
                  {accountData?.is_expired ? "Expired" : "Active"}
                </Badge>
              </div>
              <p>
                <span className="font-medium">Expires on:</span>{" "}
                {accountData?.expires_on
                  ? formatDate(accountData.expires_on)
                  : "N/A"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <UsageCard
          title="Subreddits"
          icon={<TrendingUp className="h-5 w-5 text-green-600" />}
          used={accountData?.active_subreds || 0}
          max={accountData?.max_subreds || 0}
        />
        <UsageCard
          title="Comments used today"
          icon={<MessageSquare className="h-5 w-5 text-purple-600" />}
          used={accountData?.comments_count || 0}
          max={accountData?.max_comments || 0}
        />
        <UsageCard
          title="Knowledge Base"
          icon={<Shield className="h-5 w-5 text-blue-600" />}
          used={accountData?.kb_size || 0}
          max={accountData?.max_kb_size || 0}
          unit="KB"
        />
      </div>

      {/* Plans Loading State */}
      {isLoadingPlans && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600 mr-2" />
              <span className="text-gray-600">Loading available plans...</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Subcomponent for usage stats
function UsageCard({
  title,
  icon,
  used,
  max,
  unit = "",
}: {
  title: string;
  icon: React.ReactNode;
  used: number;
  max: number;
  unit?: string;
}) {
  const percentage = max > 0 ? Math.round((used / max) * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          {icon}
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
        <CardDescription>{title} usage details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm font-medium">
          {used} of {max} {unit} used
        </p>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="h-2 rounded-full bg-green-700"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 mt-1">{percentage}% used</p>
      </CardContent>
    </Card>
  );
}
