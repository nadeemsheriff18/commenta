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
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import {
  Calendar,
  ExternalLink,
  Target,
  Pin,
  Trash2,
  MessageSquare,
  Copy,
  RefreshCw,
  Loader2,
  CheckCircle,
  Eye,
  EyeOff,
  Clock,
  TrendingUp,
  Link,
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
import { apiService, Mention, MentionParams } from "@/lib/api";

interface Project {
  id: string;
  name: string;
}

interface ProjectDashboardProps {
  project: Project | null;
}

export default function ProjectDashboard({ project }: ProjectDashboardProps) {
  const [mentions, setMentions] = useState<Mention[]>([]);
  const [activeTab, setActiveTab] = useState<
    "active" | "pinned" | "completed" | "noise" | "ignored"
  >("active");
  const [isLoading, setIsLoading] = useState(false);
  const [expandedMentions, setExpandedMentions] = useState<Set<string>>(
    new Set()
  );
  const [generatingComments, setGeneratingComments] = useState<Set<number>>(
    new Set()
  );

  const [generatedComments, setGeneratedComments] = useState<
    Map<number, string>
  >(new Map());
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalMentions, setTotalMentions] = useState(0);

  // Tab counts
  const [tabCounts, setTabCounts] = useState({
    active: 0,
    pinned: 0,
    completed: 0,
    noise: 0,
    ignored: 0,
  });

  // Fetch mentions based on active tab
  const fetchMentions = useCallback(
    async (page: number = 1) => {
      if (!project?.id) return;

      setIsLoading(true);
      try {
        const params: MentionParams = {
          proj_id: project.id,
          hours: 24,
          page,
          limit: pageSize,
        };

        let response;

        switch (activeTab) {
          case "active":
            response = await apiService.getPendingMentions(params);
            console.log("ACTIVE Mentions response--------------:", response);

            var mentions = response.data?.data?.ment;
            console.log("Mentions response:", mentions);
            console.log("First mention title:", mentions?.[0]?.title);

            break;
          case "pinned":
            response = await apiService.getPinnedMentions(params);
            console.log("PINNED Mentions response--------------:", response);
            var mentions = response.data?.data?.ment;
            console.log("Mentions response:", mentions);
            console.log("First mention title:", mentions?.[0]?.title);
            break;
          case "completed":
            response = await apiService.getActedMentions({
              ...params,
              ment_type: "completed",
            });
            console.log("COMPLETED Mentions response--------------:", response);
            break;
          case "noise":
            response = await apiService.getActedMentions({
              ...params,
              ment_type: "noise",
            });
            console.log("NOISE Mentions response--------------:", response);
            break;
          case "ignored":
            response = await apiService.getActedMentions({
              ...params,
              ment_type: "ignored",
            });
            console.log("IGNORED Mentions response--------------:", response);
            break;
          default:
            return;
        }
        console.log("Mentions response--------------:", response);

        if (response.success && response.data) {
          setMentions(response.data);

          if (response.pagination) {
            setTotalPages(response.pagination.totalPages);
            setTotalMentions(response.pagination.total);
            setCurrentPage(response.pagination.page);
          }
        } else {
          setMentions([]);
          // console.log("___________");
          toast.error(response.message || "Failed to fetch mentions");
        }
      } catch (error) {
        setMentions([]);
        toast.error("Failed to fetch mentions");
      } finally {
        setIsLoading(false);
      }
    },
    [project?.id, activeTab, pageSize]
  );

  // Fetch tab counts
  const fetchTabCounts = useCallback(async () => {
    if (!project?.id) return;

    try {
      const [activeRes, pinnedRes, completedRes, noiseRes, ignoredRes] =
        await Promise.all([
          apiService.getPendingMentions({
            proj_id: project.id,
            hours: 24,
            limit: 1,
          }),
          apiService.getPinnedMentions({
            proj_id: project.id,
            hours: 24,
            limit: 1,
          }),
          apiService.getActedMentions({
            proj_id: project.id,
            hours: 24,
            ment_type: "completed",
            limit: 1,
          }),
          apiService.getActedMentions({
            proj_id: project.id,
            hours: 24,
            ment_type: "noise",
            limit: 1,
          }),
          apiService.getActedMentions({
            proj_id: project.id,
            hours: 24,
            ment_type: "ignored",
            limit: 1,
          }),
        ]);
      console.log("ACTIVE RES : ", activeRes);
      setTabCounts({
        active: activeRes.pagination?.total || 0,
        pinned: pinnedRes.pagination?.total || 0,
        completed: completedRes.pagination?.total || 0,
        noise: noiseRes.pagination?.total || 0,
        ignored: ignoredRes.pagination?.total || 0,
      });
    } catch (error) {
      console.error("Failed to fetch tab counts:", error);
    }
  }, [project?.id]);

  // Initial data fetch
  useEffect(() => {
    if (project?.id) {
      fetchMentions(1);
      fetchTabCounts();
    }
  }, [project?.id, activeTab, pageSize]);

  // Auto-refresh every 30 seconds
  // useEffect(() => {
  //   if (!project?.id) return;

  //   // Check cache expiration every 10 seconds instead of auto-refreshing
  //   const interval = setInterval(() => {
  //     // Only refresh tab counts, mentions will auto-refresh based on exp
  //     fetchTabCounts();
  //   }, 10000);

  //   return () => clearInterval(interval);
  // }, [project?.id, fetchTabCounts]);
  // Clear generated comments when switching tabs or pages

  useEffect(() => {
    setGeneratedComments(new Map());
  }, [activeTab, currentPage]);
  // Function to clear cache and refetch data

  const clearAllMentionCaches = () => {
    if (!project?.id) return;

    // Clear all mention caches for this project
    apiService.invalidateAllMentionCaches(project.id);
  };

  const handleReloadWithCacheClearing = async () => {
    if (!project?.id) return;
    clearAllMentionCaches();
    // Clear mentions cache for this project
    // const queryParams = new URLSearchParams();
    // queryParams.append("proj_id", project?.id); //invalidating all cahce for different tabs
    // queryParams.append("hours", "24");
    // if (params.ment_type) queryParams.append("ment_type", ment_type);
    // if (params.page) queryParams.append("page", params.page.toString());
    // if (params.limit) queryParams.append("limit", params.limit.toString());

    // apiService.invalidateCache(`pending_mentions_${project.id}`);

    // apiService.invalidateCache(`pinned_mentions_${project.id}`);

    // apiService.invalidateCache(`acted_mentions_${project.id}`);

    // Refetch current tab data and counts

    await Promise.all([fetchMentions(currentPage), fetchTabCounts()]);

    toast.success("Data refreshed successfully!");
  };
  const handleGenerateComment = async (mentionId: number) => {
    setGeneratingComments((prev) => new Set(prev).add(mentionId));

    try {
      const response = await apiService.generateComment({
        ment_id: mentionId,
        is_relvent: true,
      });
      console.log("Generate comment response:", response);
      console.log("------- comment response:", response.data!.comment);
      if (response.success && response.data) {
        // Store generated comment in separate state, don't update mention yet

        setGeneratedComments((prev) => {
          const newMap = new Map(prev);

          newMap.set(mentionId, response.data!.comment);

          return newMap;
        });

        // setMentions((prev) =>
        //   prev.map((mention) =>
        //     mention.id === mentionId
        //       ? { ...mention, comment: response.data!.data.comment }
        //       : mention
        //   )
        // );
        toast.success("Comment generated successfully!");
      } else {
        toast.error(response.message || "Failed to generate comment");
      }
    } catch (error) {
      toast.error("Failed to generate comment");
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
    comment?: string
  ) => {
    try {
      const response = await apiService.actOnMention({
        ment_id: mentionId,
        type,
        comment,
      });
      console.log("Act on mention response:", response);

      if (response.success) {
        // Remove mention from current list
        setMentions((prev) => prev.filter((m) => m.id !== mentionId));
        // Clear generated comment for this mention

        setGeneratedComments((prev) => {
          const newMap = new Map(prev);

          newMap.delete(mentionId);

          return newMap;
        });

        // Update tab counts
        // Clear all mention caches to ensure fresh data

        clearAllMentionCaches();

        // Update tab counts and refresh current tab if needed

        await fetchTabCounts();

        // If the current tab becomes empty, refresh it

        if (mentions.length === 1) {
          await fetchMentions(currentPage);
        }

        const statusMessages = {
          completed: "Mention marked as completed!",
          ignored: "Mention moved to ignored",
          pinned: "Mention pinned successfully!",
          noise: "Mention marked as noise",
          active: "Mention moved to active",
        };

        toast.success(statusMessages[type]);
      } else {
        toast.error(response.message || "Failed to update mention");
      }
    } catch (error) {
      toast.error("Failed to update mention");
    }
  };

  const handleCopyAndComplete = async (mentionId: number, comment: string) => {
    try {
      await navigator.clipboard.writeText(comment);
      await handleActOnMention(mentionId, "completed", comment);
      // handleReloadWithCacheClearing();
      toast.success("Comment copied to clipboard and marked as completed!");
    } catch (error) {
      toast.error("Failed to copy comment to clipboard");
    }
  };

  const handleGeneratedCommentChange = (
    mentionId: number,

    newComment: string
  ) => {
    setGeneratedComments((prev) => {
      const newMap = new Map(prev);

      newMap.set(mentionId, newComment);

      return newMap;
    });
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
    fetchMentions(page);
  };

  const handlePageSizeChange = (newPageSize: string) => {
    setPageSize(parseInt(newPageSize));
    setCurrentPage(1);
  };

  // Generate pagination items
  const generatePaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              onClick={() => handlePageChange(i)}
              isActive={currentPage === i}
              className="cursor-pointer"
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    } else {
      // Show first page
      items.push(
        <PaginationItem key={1}>
          <PaginationLink
            onClick={() => handlePageChange(1)}
            isActive={currentPage === 1}
            className="cursor-pointer"
          >
            1
          </PaginationLink>
        </PaginationItem>
      );

      // Show ellipsis if needed
      if (currentPage > 3) {
        items.push(
          <PaginationItem key="ellipsis1">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              onClick={() => handlePageChange(i)}
              isActive={currentPage === i}
              className="cursor-pointer"
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }

      // Show ellipsis if needed
      if (currentPage < totalPages - 2) {
        items.push(
          <PaginationItem key="ellipsis2">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      // Show last page
      if (totalPages > 1) {
        items.push(
          <PaginationItem key={totalPages}>
            <PaginationLink
              onClick={() => handlePageChange(totalPages)}
              isActive={currentPage === totalPages}
              className="cursor-pointer"
            >
              {totalPages}
            </PaginationLink>
          </PaginationItem>
        );
      }
    }

    return items;
  };

  if (!project) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            No Project Selected
          </h2>
          <p className="text-gray-600">
            Create a new project or select an existing one to view the
            dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
          <p className="text-gray-600 mt-1">
            Project Dashboard - Monitor and respond to relevant mentions
          </p>
        </div>
        {/* <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="flex items-center">
            <CheckCircle className="mr-1 h-3 w-3" />
            Active
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchMentions(currentPage);
              fetchTabCounts();
            }}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span className="ml-2 text-xs">Manual Refresh</span>
          </Button>
        </div> */}
      </div>

      {/* Analytics Overview Cards */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Mentions
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.values(tabCounts).reduce((sum, count) => sum + count, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Mentions
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tabCounts.active}</div>
            <p className="text-xs text-muted-foreground">Needs attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tabCounts.completed}</div>
            <p className="text-xs text-muted-foreground">Responded to</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pinned</CardTitle>
            <Pin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tabCounts.pinned}</div>
            <p className="text-xs text-muted-foreground">Important</p>
          </CardContent>
        </Card>
      </div> */}

      {/* Mentions Management Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          setActiveTab(value as any);
          setCurrentPage(1);
        }}
      >
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="active" className="flex items-center space-x-2">
            <span>Active</span>
            {tabCounts.active > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {tabCounts.active}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="pinned" className="flex items-center space-x-2">
            <span>Pinned</span>
            {tabCounts.pinned > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {tabCounts.pinned}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="completed"
            className="flex items-center space-x-2"
          >
            <span>Completed</span>
            {tabCounts.completed > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {tabCounts.completed}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="noise" className="flex items-center space-x-2">
            <span>Noise</span>
            {tabCounts.noise > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {tabCounts.noise}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="ignored" className="flex items-center space-x-2">
            <span>Ignored</span>
            {tabCounts.ignored > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {tabCounts.ignored}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Page Size Control */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-600">
            Showing {mentions.length} of {totalMentions} mentions
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Show:</span>
            <Select
              value={pageSize.toString()}
              onValueChange={handlePageSizeChange}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 per page</SelectItem>
                <SelectItem value="10">10 per page</SelectItem>
                <SelectItem value="20">20 per page</SelectItem>
                <SelectItem value="50">50 per page</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tab Content */}
        {["active", "pinned", "completed", "noise", "ignored"].map((tab) => (
          <TabsContent key={tab} value={tab} className="space-y-4">
            {/* Reload Button for Tab Content */}

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {tab === "active" && "Active mentions requiring your attention"}

                {tab === "pinned" && "Important mentions you've pinned"}

                {tab === "completed" && "Mentions you've responded to"}

                {tab === "noise" && "Low-quality mentions filtered out"}

                {tab === "ignored" && "Mentions you've chosen to ignore"}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  handleReloadWithCacheClearing();
                  fetchMentions(currentPage);

                  fetchTabCounts();
                }}
                disabled={isLoading}
                className="flex items-center"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}

                <span className="ml-2">Reload</span>
              </Button>
            </div>

            {isLoading ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600 mb-4" />
                  <p className="text-gray-600">Loading mentions...</p>
                </CardContent>
              </Card>
            ) : mentions.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No mentions in {tab === "pinned" ? "Pinned" : tab}
                  </h3>
                  <p className="text-gray-600">
                    {tab === "active" &&
                      "No active mentions found. Check back later for new mentions."}
                    {tab === "pinned" &&
                      "No pinned mentions yet. Pin important mentions from the Active tab."}
                    {tab === "completed" &&
                      "No completed mentions yet. Mark mentions as completed after responding."}
                    {tab === "noise" &&
                      "No noise mentions detected. Low-quality mentions will appear here."}
                    {tab === "ignored" &&
                      "No ignored mentions. Mentions you ignore will appear here for reference."}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                {mentions.map((mention) => {
                  // Get the comment to display (generated comment or existing comment)
                  const displayComment =
                    generatedComments.get(mention.id) || mention.comment;
                  const hasGeneratedComment = generatedComments.has(mention.id);

                  return (
                    <Card key={mention.id} className="relative">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1 pr-4">
                            <div className="flex items-center justify-between mb-2">
                              <CardTitle className="text-lg font-bold">
                                {mention.title}
                              </CardTitle>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  window.open(mention.link, "_blank")
                                }
                                className="flex-shrink-0"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </div>

                            {/* Subreddit and Stats */}
                            <div className="flex items-center space-x-4 mb-2">
                              <Badge variant="outline" className="text-xs">
                                {mention.subreddit}
                              </Badge>
                              <div className="flex items-center space-x-2 text-xs text-gray-500">
                                <TrendingUp className="h-3 w-3" />
                                <span>{mention.score} upvotes</span>
                                <MessageSquare className="h-3 w-3" />
                                <span>{mention.comment_cnt} comments</span>
                              </div>
                              {mention.prio && (
                                <Badge variant="outline" className="text-xs">
                                  Priority: {mention.prio.toFixed(1)}
                                </Badge>
                              )}
                            </div>

                            {/* Post Description with Expand/Collapse */}
                            <div className="text-sm text-gray-600">
                              {expandedMentions.has(mention.id.toString()) ? (
                                <div>
                                  <p className="whitespace-pre-wrap">
                                    {mention.text}
                                  </p>
                                  <Button
                                    variant="link"
                                    size="sm"
                                    onClick={() =>
                                      toggleExpanded(mention.id.toString())
                                    }
                                    className="p-0 h-auto text-blue-600 mt-2"
                                  >
                                    <EyeOff className="mr-1 h-3 w-3" />
                                    Show less
                                  </Button>
                                </div>
                              ) : (
                                <div>
                                  <p className="line-clamp-3">
                                    {mention.text
                                      .split("\n")
                                      .slice(0, 3)
                                      .join("\n")}
                                    {mention.text.split("\n").length > 3 ||
                                    mention.text.length > 200
                                      ? "..."
                                      : ""}
                                  </p>
                                  {(mention.text.split("\n").length > 3 ||
                                    mention.text.length > 200) && (
                                    <Button
                                      variant="link"
                                      size="sm"
                                      onClick={() =>
                                        toggleExpanded(mention.id.toString())
                                      }
                                      className="p-0 h-auto text-blue-600 mt-2"
                                    >
                                      <Eye className="mr-1 h-3 w-3" />
                                      See more
                                    </Button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        {/* Generated Comment Section */}
                        {displayComment && (
                          <div className="space-y-3">
                            <Label className="text-sm font-medium">
                              {hasGeneratedComment
                                ? "Generated Comment:"
                                : "Existing Comment:"}
                            </Label>
                            <Textarea
                              value={displayComment}
                              onChange={(e) => {
                                handleGeneratedCommentChange(
                                  mention.id,
                                  e.target.value
                                );
                              }}
                              className="min-h-[100px] resize-none"
                              placeholder="Generated comment will appear here..."
                            />
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-2">
                          {/* Default State - No Comment Generated */}
                          {!displayComment &&
                            !generatingComments.has(mention.id) && (
                              <>
                                <Button
                                  onClick={() =>
                                    handleGenerateComment(mention.id)
                                  }
                                  className="bg-blue-600 hover:bg-blue-700"
                                >
                                  <MessageSquare className="mr-2 h-4 w-4" />
                                  Generate Comment
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() =>
                                    handleActOnMention(mention.id, "pinned")
                                  }
                                >
                                  <Pin className="mr-2 h-4 w-4" />
                                  Pin
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() =>
                                    handleActOnMention(mention.id, "ignored")
                                  }
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Ignore
                                </Button>
                              </>
                            )}

                          {/* Generating State */}
                          {generatingComments.has(mention.id) && (
                            <Button disabled className="bg-blue-600">
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Generating...
                            </Button>
                          )}

                          {/* Post-Generation State */}
                          {displayComment &&
                            !generatingComments.has(mention.id) && (
                              <>
                                <Button
                                  onClick={() =>
                                    handleCopyAndComplete(
                                      mention.id,
                                      displayComment
                                    )
                                  }
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <Copy className="mr-2 h-4 w-4" />
                                  Copy & Mark as Completed
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() =>
                                    handleGenerateComment(mention.id)
                                  }
                                >
                                  <RefreshCw className="mr-2 h-4 w-4" />
                                  Rephrase
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() =>
                                    handleActOnMention(mention.id, "pinned")
                                  }
                                >
                                  <Pin className="mr-2 h-4 w-4" />
                                  Pin
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() =>
                                    handleActOnMention(mention.id, "ignored")
                                  }
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Ignore
                                </Button>
                              </>
                            )}
                        </div>

                        {/* Timestamp and Status Info */}
                        <div className="text-xs text-gray-500 flex items-center justify-between">
                          <div className="flex items-center">
                            <Calendar className="mr-1 h-3 w-3" />
                            {new Date(mention.time).toLocaleString()}
                          </div>
                          {/* <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">
                              Similarity:{" "}
                              {(mention.similarity * 100).toFixed(0)}%
                            </Badge>
                          </div> */}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-6 flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Showing {(currentPage - 1) * pageSize + 1} to{" "}
                      {Math.min(currentPage * pageSize, totalMentions)} of{" "}
                      {totalMentions} mentions
                    </div>
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => handlePageChange(currentPage - 1)}
                            className={
                              currentPage === 1
                                ? "pointer-events-none opacity-50"
                                : "cursor-pointer"
                            }
                          />
                        </PaginationItem>

                        {generatePaginationItems()}

                        <PaginationItem>
                          <PaginationNext
                            onClick={() => handlePageChange(currentPage + 1)}
                            className={
                              currentPage === totalPages
                                ? "pointer-events-none opacity-50"
                                : "cursor-pointer"
                            }
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
