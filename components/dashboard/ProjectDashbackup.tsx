"use client";

import { useState, useEffect, useCallback } from "react";
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

export default function ProjectDashboard({ project }: ProjectDashboardProps) {
  const [mentions, setMentions] = useState<Mention[]>([]);
  const [activeTab, setActiveTab] = useState<TabName>("active");
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [expandedMentions, setExpandedMentions] = useState<Set<string>>(
    new Set()
  );
  const [generatingComments, setGeneratingComments] = useState<Set<number>>(
    new Set()
  );
  const [generatedComments, setGeneratedComments] = useState<
    Map<number, string>
  >(new Map());
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [timeFilter, setTimeFilter] = useState<number>(24);
  // const [tabCounts, setTabCounts] = useState({
  //   active: 0,
  //   pinned: 0,
  //   completed: 0,
  //   noise: 0,
  //   ignored: 0,
  // });

  const fetchMentions = useCallback(
    async (page: number = 1) => {
      if (!project?.id) return;
      setIsLoading(true);
      try {
        const params: MentionParams = {
          proj_id: project.id,
          hours: timeFilter,
          page,
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
        console.log("Mentions response:", response);
        if (response.success && response.data) {
          setMentions(response.data.ments || []);
          const totalMentionsFromServer = response.data.total || 0;
          setTotalPages(Math.ceil(totalMentionsFromServer / pageSize));
          setCurrentPage(page);
        } else {
          setMentions([]);
          toast.error(response.message || "Failed to fetch mentions");
        }
      } catch (error: any) {
        setMentions([]);
        toast.error(error.message || "Failed to fetch mentions");
      } finally {
        setIsLoading(false);
      }
    },
    [project?.id, activeTab, pageSize, timeFilter]
  );

  // const fetchTabCounts = useCallback(async () => {
  //   if (!project?.id) return;
  //   try {
  //     const tabs: TabName[] = [
  //       "active",
  //       "pinned",
  //       "completed",
  //       "noise",
  //       "ignored",
  //     ];
  //     const promises = tabs.map((tab) => {
  //       const params: MentionParams = {
  //         proj_id: project.id,
  //         hours: timeFilter,
  //         limit: 1,
  //         page: 1,
  //       };
  //       if (tab === "active") return apiService.getPendingMentions(params);
  //       if (tab === "pinned") return apiService.getPinnedMentions(params);
  //       return apiService.getActedMentions({ ...params, ment_type: tab });
  //     });
  //     const responses = await Promise.all(promises);
  //     console.log("Tab counts responses:", responses);
  //     const newCounts = {
  //       active: 0,
  //       pinned: 0,
  //       completed: 0,
  //       noise: 0,
  //       ignored: 0,
  //     };
  //     responses.forEach((res, index) => {
  //       if (res.success && res.data) {
  //         (newCounts as any)[tabs[index]] = res.data.total || 0;
  //       }
  //     });
  //     console.log("New tab counts:", newCounts);
  //     setTabCounts(newCounts);
  //   } catch (error) {
  //     console.error("Failed to fetch tab counts:", error);
  //   }
  // }, [project?.id, timeFilter]);

  const fetchStats = useCallback(async () => {
    if (!project?.id) return;
    setIsLoadingStats(true);
    try {
      const response = await apiService.getProjectStats(project.id);
      console.log("Project stats response:", response);
      if (response.success && response.data) {
        setStats(response.data);
      } else {
        toast.error(response.message || "Failed to fetch project stats");
      }
    } catch (error) {
      toast.error("Failed to fetch project stats");
    } finally {
      setIsLoadingStats(false);
    }
  }, [project?.id]);
  // 🔹 Only fetch mentions for current tab and page

  useEffect(() => {
    if (project?.id) {
      fetchMentions(currentPage);
    }
  }, [
    project?.id,
    activeTab,
    pageSize,
    timeFilter,
    currentPage,
    fetchMentions,
  ]);

  // 🔹 Fetch tab counts only when time filter or project changes

  // useEffect(() => {
  //   if (project?.id) {
  //     fetchTabCounts();
  //   }
  // }, [project?.id, timeFilter, fetchTabCounts]);

  // 🔹 Fetch stats only once per project

  useEffect(() => {
    if (project?.id) {
      fetchStats();
    }
  }, [project?.id, fetchStats]);

  useEffect(() => {
    setGeneratedComments(new Map());
  }, [activeTab, currentPage]);
  // useEffect(() => {
  //   if (project?.id) {
  //     fetchMentions(currentPage);
  //     fetchTabCounts();
  //     fetchStats();
  //   }
  // }, [project?.id, activeTab, pageSize, timeFilter, currentPage, fetchMentions, fetchTabCounts, fetchStats]);

  useEffect(() => {
    setGeneratedComments(new Map());
  }, [activeTab, currentPage]);

  const handleReload = () => {
    toast.info("Refreshing mentions...");
    fetchMentions(currentPage);
    // fetchTabCounts();
    fetchStats();
  };

  const handleGenerateComment = async (
    mentionId: number,
    isRelevant: boolean
  ) => {
    setGeneratingComments((prev) => new Set(prev).add(mentionId));
    try {
      const response = await apiService.generateComment({
        ment_id: mentionId,
        is_relvent: isRelevant,
      });
      if (response.success && response.data) {
        setGeneratedComments((prev) =>
          new Map(prev).set(mentionId, response.data!.comment)
        );
        toast.success("Comment generated successfully!");
      } else {
        toast.error(response.message || "Failed to generate comment");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to generate comment");
    } finally {
      setGeneratingComments((prev) => {
        const newSet = new Set(prev);
        newSet.delete(mentionId);
        return newSet;
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
      // Optimistically remove from UI
      setMentions((prev) => prev.filter((m) => m.id !== mentionId));
      // Refetch counts to keep them updated
      // fetchTabCounts();
      fetchStats();
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
    setGeneratedComments((prev) => new Map(prev).set(mentionId, newComment));
  };
  const toggleExpanded = (mentionId: string) => {
    setExpandedMentions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(mentionId)) {
        newSet.delete(mentionId);
      } else {
        newSet.add(mentionId);
      }
      return newSet;
    });
  };
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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
                disabled={isLoading}
              >
                {isLoading ? (
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
                        `${stats?.avg_relevance.toFixed(1)}%`
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

          <Tabs
            value={activeTab}
            onValueChange={(value) => {
              setActiveTab(value as TabName);
              setCurrentPage(1);
            }}
          >
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="active">
                Active
                {/* ({tabCounts.active}) */}
              </TabsTrigger>
              <TabsTrigger value="pinned">
                Pinned
                {/* ({tabCounts.pinned}) */}
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed
                {/* ({tabCounts.completed}) */}
              </TabsTrigger>
              <TabsTrigger value="noise">
                Noise
                {/* ({tabCounts.noise}) */}
              </TabsTrigger>
              <TabsTrigger value="ignored">
                Ignored
                {/* ({tabCounts.ignored}) */}
              </TabsTrigger>
            </TabsList>
            <div className="mt-6">
              {isLoading ? (
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
                        generatedComments.get(mention.id) || mention.comment
                      }
                      isGenerating={generatingComments.has(mention.id)}
                      isExpanded={expandedMentions.has(mention.id.toString())}
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
            <div className="mt-6 flex items-center justify-center ">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      className="cursor-pointer"
                      onClick={() => handlePageChange(currentPage - 1)}
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink>{currentPage}</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext
                      className="cursor-pointer"
                      onClick={() => handlePageChange(currentPage + 1)}
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
