"use client";

import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  RefreshCw,
  Loader2,
  MessageSquare,
  Hash,
  CheckCircle2,
  Percent,
} from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { apiService, Mention, MentionParams, ProjectStats } from "@/lib/api";
import { MentionCard } from "./MentionCard";
import { cn } from "@/lib/utils";

interface Project {
  id: string;
  name: string;
}

interface ProjectDashboardProps {
  project: Project | null;
}

type TabName = "active" | "pinned" | "completed" | "noise" | "ignored";

interface TabState {
  currentPage: number;
  expandedMentions: Set<string>;
  generatingComments: Set<number>;
  generatedComments: Map<number, string>;
}

const initialTabState: TabState = {
  currentPage: 1,
  expandedMentions: new Set(),
  generatingComments: new Set(),
  generatedComments: new Map(),
};

export default function ProjectDashboard({ project }: ProjectDashboardProps) {
  const queryClient = useQueryClient();

  // Global state
  const [activeTab, setActiveTab] = useState<TabName>("active");
  const [pageSize, setPageSize] = useState(10);
  const [timeFilter, setTimeFilter] = useState<number>(24);

  // Separate state for each tab
  const [tabStates, setTabStates] = useState<Record<TabName, TabState>>({
    active: { ...initialTabState },
    pinned: { ...initialTabState },
    completed: { ...initialTabState },
    noise: { ...initialTabState },
    ignored: { ...initialTabState },
  });

  const currentTabState = tabStates[activeTab];

  // Invalidate cache when project ID changes
  useEffect(() => {
    if (project?.id) {
      // Invalidate all queries related to the previous project
      queryClient.invalidateQueries({
        queryKey: ["mentions"],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ["projectStats"],
        exact: false,
      });

      // Reset all tab states to initial state
      setTabStates({
        active: { ...initialTabState },
        pinned: { ...initialTabState },
        completed: { ...initialTabState },
        noise: { ...initialTabState },
        ignored: { ...initialTabState },
      });

      // Reset to active tab
      setActiveTab("active");
    }
  }, [project?.id, queryClient]);

  // Query keys
  const mentionsQueryKey = [
    "mentions",
    project?.id,
    activeTab,
    currentTabState.currentPage,
    pageSize,
    timeFilter,
  ];

  const statsQueryKey = ["projectStats", project?.id];

  // Fetch mentions query
  const {
    data: mentionsData,
    isLoading: isLoadingMentions,
    error: mentionsError,
  } = useQuery({
    queryKey: mentionsQueryKey,
    queryFn: async () => {
      if (!project?.id) throw new Error("No project selected");

      const params: MentionParams = {
        proj_id: project.id,
        hours: timeFilter,
        page: currentTabState.currentPage,
        limit: pageSize,
      };

      let response;
      switch (activeTab) {
        case "active":
          response = await apiService.getPendingMentions(params);
          break;
        case "pinned":
          response = await apiService.getPinnedMentions(params);
          break;
        default:
          response = await apiService.getActedMentions({
            ...params,
            ment_type: activeTab,
          });
          break;
      }

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch mentions");
      }

      return {
        mentions: response.data.ments || [],
        total: response.data.total || 0,
        totalPages: Math.ceil((response.data.total || 0) / pageSize),
      };
    },
    enabled: !!project?.id,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });

  // Fetch stats query
  const {
    data: stats,
    isLoading: isLoadingStats,
    error: statsError,
  } = useQuery({
    queryKey: statsQueryKey,
    queryFn: async () => {
      if (!project?.id) throw new Error("No project selected");

      const response = await apiService.getProjectStats(project.id);

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch project stats");
      }

      return response.data;
    },
    enabled: !!project?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });

  // Handle errors
  useEffect(() => {
    if (mentionsError) {
      toast.error(mentionsError.message || "Failed to fetch mentions");
    }
  }, [mentionsError]);

  useEffect(() => {
    if (statsError) {
      toast.error(statsError.message || "Failed to fetch project stats");
    }
  }, [statsError]);

  // Reset generated comments when tab or page changes
  useEffect(() => {
    setTabStates((prev) => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        generatedComments: new Map(),
      },
    }));
  }, [activeTab, currentTabState.currentPage]);

  const updateTabState = (updates: Partial<TabState>) => {
    setTabStates((prev) => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        ...updates,
      },
    }));
  };

  const handleReload = () => {
    toast.info("Refreshing mentions...");
    queryClient.invalidateQueries({ queryKey: mentionsQueryKey });
    queryClient.invalidateQueries({ queryKey: statsQueryKey });
  };

  const handleGenerateComment = async (
    mentionId: number,
    isRelevant: boolean
  ) => {
    updateTabState({
      generatingComments: new Set(currentTabState.generatingComments).add(
        mentionId
      ),
    });

    try {
      const response = await apiService.generateComment({
        ment_id: mentionId,
        is_relvent: isRelevant,
      });

      if (response.success && response.data) {
        updateTabState({
          generatedComments: new Map(currentTabState.generatedComments).set(
            mentionId,
            response.data.comment
          ),
          generatingComments: (() => {
            const newSet = new Set(currentTabState.generatingComments);
            newSet.delete(mentionId);
            return newSet;
          })(),
        });
        toast.success("Comment generated successfully!");
      } else {
        toast.error(response.message || "Failed to generate comment");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to generate comment");
    } finally {
      updateTabState({
        generatingComments: (() => {
          const newSet = new Set(currentTabState.generatingComments);
          newSet.delete(mentionId);
          return newSet;
        })(),
      });
    }
  };

  const handleActOnMention = async (
    mentionId: number,
    type: "completed" | "ignored" | "pinned" | "noise" | "active",
    comment: string = ""
  ) => {
    const response = await apiService.actOnMention({
      ment_id: mentionId,
      type,
      comment,
    });

    if (response.success) {
      toast.success(`Mention moved to ${type}`);

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: mentionsQueryKey });
      queryClient.invalidateQueries({ queryKey: statsQueryKey });

      // Also invalidate other tabs that might be affected
      queryClient.invalidateQueries({
        queryKey: ["mentions", project?.id],
        exact: false,
      });
    } else {
      toast.error(response.message || "Failed to update mention");
    }
  };

  const handleCopyAndComplete = async (mentionId: number, comment: string) => {
    try {
      await navigator.clipboard.writeText(comment);
      await handleActOnMention(mentionId, "completed", comment);
    } catch (error) {
      toast.error("Failed to copy comment to clipboard");
    }
  };

  const handleGeneratedCommentChange = (
    mentionId: number,
    newComment: string
  ) => {
    updateTabState({
      generatedComments: new Map(currentTabState.generatedComments).set(
        mentionId,
        newComment
      ),
    });
  };

  const toggleExpanded = (mentionId: string) => {
    const newExpandedMentions = new Set(currentTabState.expandedMentions);
    if (newExpandedMentions.has(mentionId)) {
      newExpandedMentions.delete(mentionId);
    } else {
      newExpandedMentions.add(mentionId);
    }
    updateTabState({ expandedMentions: newExpandedMentions });
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= (mentionsData?.totalPages || 1)) {
      updateTabState({ currentPage: page });
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as TabName);
  };

  if (!project) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold">No Project Selected</h2>
        <p className="text-gray-600">
          Create or select a project to view the dashboard.
        </p>
      </div>
    );
  }

  const mentions = mentionsData?.mentions || [];
  const totalPages = mentionsData?.totalPages || 1;

  return (
    <TooltipProvider>
      <div className="p-4 sm:p-6 lg:p-8 bg-slate-50/50 min-h-full">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                {project.name}
              </h1>
              <p className="mt-1 text-gray-600">
                Monitor and respond to relevant mentions.
              </p>
            </div>
            <div className="flex items-center gap-2 mt-4 md:mt-0">
              <Select
                value={timeFilter.toString()}
                onValueChange={(val) => setTimeFilter(Number(val))}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24">Last 24 hours</SelectItem>
                  <SelectItem value="168">Last 7 days</SelectItem>
                  <SelectItem value="720">Last 30 days</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReload}
                disabled={isLoadingMentions}
              >
                {isLoadingMentions ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Reload
              </Button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Tooltip>
              <TooltipTrigger asChild>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Mentions
                    </CardTitle>
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {isLoadingStats ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                      ) : (
                        stats?.total_mentions
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent>
                <p>The total number of mentions found for this project.</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Subreddits
                    </CardTitle>
                    <Hash className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {isLoadingStats ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                      ) : (
                        stats?.total_subreddits
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent>
                <p>The total number of subreddits being monitored.</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Completed Mentions
                    </CardTitle>
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {isLoadingStats ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                      ) : (
                        stats?.completed_mentions
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent>
                <p>The number of mentions you have marked as 'Completed'.</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Avg. Relevance
                    </CardTitle>
                    <Percent className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {isLoadingStats ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                      ) : (
                        `${stats?.avg_relevance?.toFixed(1) || 0}%`
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent>
                <p>The average relevance score of mentions found.</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="pinned">Pinned</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="noise">Noise</TabsTrigger>
              <TabsTrigger value="ignored">Ignored</TabsTrigger>
            </TabsList>

            <div className="mt-6">
              {isLoadingMentions ? (
                <div className="text-center py-16">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-600" />
                </div>
              ) : mentions.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed rounded-lg">
                  <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium">
                    No mentions in '{activeTab}'
                  </h3>
                </div>
              ) : (
                <div className="space-y-4">
                  {mentions.map((mention) => (
                    <MentionCard
                      key={mention.id}
                      mention={mention}
                      displayComment={
                        currentTabState.generatedComments.get(mention.id) ||
                        mention.comment
                      }
                      isGenerating={currentTabState.generatingComments.has(
                        mention.id
                      )}
                      isExpanded={currentTabState.expandedMentions.has(
                        mention.id.toString()
                      )}
                      activeTab={activeTab}
                      onToggleExpand={toggleExpanded}
                      onGenerateComment={handleGenerateComment}
                      onActOnMention={handleActOnMention}
                      onCopyAndComplete={handleCopyAndComplete}
                      onCommentChange={handleGeneratedCommentChange}
                    />
                  ))}
                </div>
              )}
            </div>
          </Tabs>

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      className={cn(
                        "cursor-pointer",
                        currentTabState.currentPage <= 1 &&
                          "pointer-events-none opacity-50"
                      )}
                      onClick={() =>
                        handlePageChange(currentTabState.currentPage - 1)
                      }
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink>
                      {currentTabState.currentPage}
                    </PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext
                      className={cn(
                        "cursor-pointer",
                        currentTabState.currentPage >= totalPages &&
                          "pointer-events-none opacity-50"
                      )}
                      onClick={() =>
                        handlePageChange(currentTabState.currentPage + 1)
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
