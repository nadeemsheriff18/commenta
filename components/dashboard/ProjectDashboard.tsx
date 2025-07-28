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

interface Project {
  id: string;
  name: string;
}

interface ProjectDashboardProps {
  project: Project | null;
}

export default function ProjectDashboard({ project }: ProjectDashboardProps) {
  const [mentions, setMentions] = useState<Mention[]>([]);
  const [activeTab, setActiveTab] = useState<"active" | "pinned" | "completed" | "noise" | "ignored">("active");
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [expandedMentions, setExpandedMentions] = useState<Set<string>>(new Set());
  const [generatingComments, setGeneratingComments] = useState<Set<number>>(new Set());
  const [generatedComments, setGeneratedComments] = useState<Map<number, string>>(new Map());
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalMentions, setTotalMentions] = useState(0);
  const [timeFilter, setTimeFilter] = useState<number>(24);
  const [tabCounts, setTabCounts] = useState({ active: 0, pinned: 0, completed: 0, noise: 0, ignored: 0 });

  // Find this function in your ProjectDashboard.tsx file and replace it

const fetchMentions = useCallback(
  async (page: number = 1) => {
    if (!project?.id) return;
    setIsLoading(true);
    try {
      const params: MentionParams = { proj_id: project.id, hours: timeFilter, page, limit: pageSize };
      let response;
      switch (activeTab) {
        case "active": response = await apiService.getPendingMentions(params); break;
        case "pinned": response = await apiService.getPinnedMentions(params); break;
        default: response = await apiService.getActedMentions({ ...params, ment_type: activeTab }); break;
      }

      // --- CORRECTED: The mentions list is directly in response.data ---
      if (response.success && Array.isArray(response.data)) {
        setMentions(response.data); 
        
        if (response.pagination) {
          setTotalPages(response.pagination.totalPages);
          setTotalMentions(response.pagination.total);
          setCurrentPage(response.pagination.page);
        }
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
  
  const fetchTabCounts = useCallback(async () => {
    if (!project?.id) return;
    try {
      const [activeRes, pinnedRes, completedRes, noiseRes, ignoredRes] =
        await Promise.all([
          apiService.getPendingMentions({ proj_id: project.id, hours: timeFilter, limit: 1, page: 1 }),
          apiService.getPinnedMentions({ proj_id: project.id, hours: timeFilter, limit: 1, page: 1 }),
          apiService.getActedMentions({ proj_id: project.id, hours: timeFilter, ment_type: "completed", limit: 1, page: 1 }),
          apiService.getActedMentions({ proj_id: project.id, hours: timeFilter, ment_type: "noise", limit: 1, page: 1 }),
          apiService.getActedMentions({ proj_id: project.id, hours: timeFilter, ment_type: "ignored", limit: 1, page: 1 }),
        ]);
      setTabCounts({
        active: activeRes.pagination?.total || 0,
        pinned: pinnedRes.pagination?.total || 0,
        completed: completedRes.pagination?.total || 0,
        noise: noiseRes.pagination?.total || 0,
        ignored: ignoredRes.pagination?.total || 0,
      });
    } catch (error) { console.error("Failed to fetch tab counts:", error); }
  }, [project?.id, timeFilter]);

  const fetchStats = useCallback(async () => {
    if (!project?.id) return;
    setIsLoadingStats(true);
    try {
        const response = await apiService.getProjectStats(project.id);
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

  useEffect(() => {
    if (project?.id) {
      fetchMentions(1);
      fetchTabCounts();
      fetchStats();
    }
  }, [project?.id, activeTab, pageSize, timeFilter, fetchMentions, fetchTabCounts, fetchStats]);
  
  useEffect(() => { setGeneratedComments(new Map()); }, [activeTab, currentPage]);
  
  const clearAllMentionCaches = () => { if (!project?.id) return; apiService.invalidateAllMentionCaches(project.id); };
  const handleReloadWithCacheClearing = async () => { if (!project?.id) return; clearAllMentionCaches(); await Promise.all([fetchMentions(currentPage), fetchTabCounts(), fetchStats()]); toast.success("Data refreshed successfully!"); };
  
  const handleGenerateComment = async (mentionId: number, isRelevant: boolean) => {
    setGeneratingComments((prev) => new Set(prev).add(mentionId));
    try {
      const response = await apiService.generateComment({ ment_id: mentionId, is_relvent: isRelevant });
      if (response.success && response.data) {
        setGeneratedComments((prev) => new Map(prev).set(mentionId, response.data!.comment));
        toast.success("Comment generated successfully!");
      } else {
        toast.error(response.message || "Failed to generate comment");
      }
    } catch (error: any) { 
      toast.error(error.message || "Failed to generate comment"); 
    }
    finally { 
      setGeneratingComments((prev) => { 
        const newSet = new Set(prev); 
        newSet.delete(mentionId); 
        return newSet; 
      }); 
    }
  };

  const handleActOnMention = async (mentionId: number, type: "completed" | "ignored" | "pinned" | "noise" | "active", comment?: string) => {
    try {
      const response = await apiService.actOnMention({ ment_id: mentionId, type, comment });
      if (response.success) {
        setMentions((prev) => prev.filter((m) => m.id !== mentionId));
        setGeneratedComments((prev) => { const newMap = new Map(prev); newMap.delete(mentionId); return newMap; });
        await fetchTabCounts();
        await fetchStats();
        if (mentions.length === 1 && currentPage > 1) { await fetchMentions(currentPage - 1); } else { await fetchMentions(currentPage); }
        const statusMessages = { completed: "Mention marked as completed!", ignored: "Mention moved to ignored", pinned: "Mention pinned successfully!", noise: "Mention marked as noise", active: "Mention moved to active" };
        toast.success(statusMessages[type]);
      } else {
        toast.error(response.message || "Failed to update mention");
      }
    } catch (error: any) { toast.error(error.message || "Failed to update mention"); }
  };
  const handleCopyAndComplete = async (mentionId: number, comment: string) => {
    try { await navigator.clipboard.writeText(comment); await handleActOnMention(mentionId, "completed", comment); }
    catch (error) { toast.error("Failed to copy comment to clipboard"); }
  };
  const handleGeneratedCommentChange = (mentionId: number, newComment: string) => { setGeneratedComments((prev) => new Map(prev).set(mentionId, newComment)); };
  const toggleExpanded = (mentionId: string) => { setExpandedMentions((prev) => { const newSet = new Set(prev); if (newSet.has(mentionId)) { newSet.delete(mentionId); } else { newSet.add(mentionId); } return newSet; }); };
  const handlePageChange = (page: number) => { setCurrentPage(page); fetchMentions(page); };
  const generatePaginationItems = () => {
    const items = []; const maxVisiblePages = 5; if (totalPages <= 1) return null;
    if (totalPages <= maxVisiblePages) { for (let i = 1; i <= totalPages; i++) { items.push(<PaginationItem key={i}><PaginationLink onClick={() => handlePageChange(i)} isActive={currentPage === i} className="cursor-pointer">{i}</PaginationLink></PaginationItem>); }
    } else {
      items.push(<PaginationItem key={1}><PaginationLink onClick={() => handlePageChange(1)} isActive={currentPage === 1} className="cursor-pointer">1</PaginationLink></PaginationItem>);
      if (currentPage > 3) { items.push(<PaginationItem key="ellipsis1"><PaginationEllipsis /></PaginationItem>); }
      const start = Math.max(2, currentPage - 1); const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) { items.push(<PaginationItem key={i}><PaginationLink onClick={() => handlePageChange(i)} isActive={currentPage === i} className="cursor-pointer">{i}</PaginationLink></PaginationItem>); }
      if (currentPage < totalPages - 2) { items.push(<PaginationItem key="ellipsis2"><PaginationEllipsis /></PaginationItem>); }
      items.push(<PaginationItem key={totalPages}><PaginationLink onClick={() => handlePageChange(totalPages)} isActive={currentPage === totalPages} className="cursor-pointer">{totalPages}</PaginationLink></PaginationItem>);
    }
    return items;
  };

  if (!project) {
    return <div className="p-6 text-center"><h2 className="text-2xl font-bold">No Project Selected</h2><p className="text-gray-600">Create or select a project to view the dashboard.</p></div>;
  }

  return (
    // --- UI FIX: Main container is now a flex column to fill height ---
    <div className="p-6 space-y-6 flex flex-col h-full">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Mentions</CardTitle><MessageSquare className="h-4 w-4 text-muted-foreground" /></CardHeader>
          <CardContent><div className="text-2xl font-bold">{isLoadingStats ? <Loader2 className="h-6 w-6 animate-spin" /> : stats?.total_mentions}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Subreddits</CardTitle><Hash className="h-4 w-4 text-muted-foreground" /></CardHeader>
          <CardContent><div className="text-2xl font-bold">{isLoadingStats ? <Loader2 className="h-6 w-6 animate-spin" /> : stats?.total_subreddits}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Completed Mentions</CardTitle><CheckCircle2 className="h-4 w-4 text-muted-foreground" /></CardHeader>
          <CardContent><div className="text-2xl font-bold">{isLoadingStats ? <Loader2 className="h-6 w-6 animate-spin" /> : stats?.completed_mentions}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Avg. Relevance</CardTitle><Percent className="h-4 w-4 text-muted-foreground" /></CardHeader>
          <CardContent><div className="text-2xl font-bold">{isLoadingStats ? <Loader2 className="h-6 w-6 animate-spin" /> : `${stats?.avg_relevance.toFixed(1)}%`}</div></CardContent>
        </Card>
      </div>

      {/* --- UI FIX: This Tabs component will grow to fill available space --- */}
      <Tabs value={activeTab} onValueChange={(value) => { setActiveTab(value as any); setCurrentPage(1); }} className="flex flex-col flex-1">
        <div className="flex justify-between items-center mb-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="active">Active {tabCounts.active > 0 && `(${tabCounts.active})`}</TabsTrigger>
            <TabsTrigger value="pinned">Pinned {tabCounts.pinned > 0 && `(${tabCounts.pinned})`}</TabsTrigger>
            <TabsTrigger value="completed">Completed {tabCounts.completed > 0 && `(${tabCounts.completed})`}</TabsTrigger>
            <TabsTrigger value="noise">Noise {tabCounts.noise > 0 && `(${tabCounts.noise})`}</TabsTrigger>
            <TabsTrigger value="ignored">Ignored {tabCounts.ignored > 0 && `(${tabCounts.ignored})`}</TabsTrigger>
          </TabsList>
          <div className="ml-4 flex-shrink-0">
            <Select value={timeFilter.toString()} onValueChange={(val) => setTimeFilter(Number(val))}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filter by time" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="24">Last 24 hours</SelectItem>
                <SelectItem value="48">Last 2 days</SelectItem>
                <SelectItem value="168">Last 7 days</SelectItem>
                <SelectItem value="720">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {["active", "pinned", "completed", "noise", "ignored"].map((tab) => (
          <TabsContent key={tab} value={tab} className="space-y-4 flex flex-col flex-1">
            <div className="flex items-center justify-end">
              <Button variant="outline" size="sm" onClick={handleReloadWithCacheClearing} disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                Reload
              </Button>
            </div>
            
            {/* --- UI FIX: This div now handles scrolling and grows to fill space --- */}
            <div className="flex-grow overflow-y-auto space-y-4">
              {isLoading ? (
                <Card><CardContent className="text-center py-8"><Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" /></CardContent></Card>
              ) : mentions.length === 0 ? (
                <Card><CardContent className="text-center py-8"><MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" /><h3 className="text-lg font-medium">No mentions in {tab}</h3></CardContent></Card>
              ) : (
                <>
                  {mentions.map((mention) => (
                    <MentionCard
                      key={mention.id}
                      mention={mention}
                      displayComment={generatedComments.get(mention.id) || mention.comment}
                      isGenerating={generatingComments.has(mention.id)}
                      isExpanded={expandedMentions.has(mention.id.toString())}
                      activeTab={activeTab}
                      onToggleExpand={toggleExpanded}
                      onGenerateComment={handleGenerateComment}
                      onActOnMention={(id, type, comment) => handleActOnMention(id, type as any, comment)}
                      onCopyAndComplete={handleCopyAndComplete}
                      onCommentChange={handleGeneratedCommentChange}
                    />
                  ))}
                </>
              )}
            </div>

            {totalPages > 1 && (
              <div className="mt-auto pt-4 flex items-center justify-center">
                <Pagination>
                  <PaginationContent>
                      <PaginationItem>
                          <PaginationPrevious onClick={() => handlePageChange(currentPage - 1)} className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}/>
                      </PaginationItem>
                      {generatePaginationItems()}
                      <PaginationItem>
                          <PaginationNext onClick={() => handlePageChange(currentPage + 1)} className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}/>
                      </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}