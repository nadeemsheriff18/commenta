"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Trash,
  Users,
  Loader2,
  ExternalLink,
  Check,
  RefreshCw,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { apiService, SubredditInfo, Project } from "@/lib/api";
import { useDebounce } from "@/hooks/use-debounce";
import { Checkbox } from "@/components/ui/checkbox";
import Image from "next/image";

interface SubredditsPageProps {
  project: Project | null;
}

// Query keys for React Query
const QUERY_KEYS = {
  subreddits: (projectId: any) => ["subreddits", projectId] as const,
  searchSubreddits: (searchTerm: string) =>
    ["search", "subreddits", searchTerm] as const,
};

export default function SubredditsPage({ project }: SubredditsPageProps) {
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [deleteSubredditName, setDeleteSubredditName] = useState<string | null>(
    null
  );
  const [selectedSubreddits, setSelectedSubreddits] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<string>>(
    new Set()
  );

  // Fetch current subreddits with React Query
  const {
    data: currentSubreddits = [],
    isLoading: isLoadingCurrent,
    error: currentError,
    refetch: refetchCurrent,
    isFetching: isFetchingCurrent,
  } = useQuery({
    queryKey: QUERY_KEYS.subreddits(project?.id || 0),
    queryFn: async () => {
      if (!project?.id) {
        return [];
      }
      const response = await apiService.listSubreddits(project.id);
      if (!response.success || !Array.isArray(response.data)) {
        throw new Error(response.message || "Failed to fetch subreddits");
      }
      return response.data;
    },
    enabled: !!project?.id,
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Search subreddits with React Query
  const {
    data: searchResults = [],
    isLoading: isSearching,
    error: searchError,
  } = useQuery({
    queryKey: QUERY_KEYS.searchSubreddits(debouncedSearchTerm),
    queryFn: async () => {
      if (!debouncedSearchTerm.trim()) {
        return [];
      }
      const response = await apiService.searchSubreddits(debouncedSearchTerm, {
        limit: 10,
      });
      if (!response.success || !Array.isArray(response.data)) {
        throw new Error(response.message || "Failed to search subreddits");
      }
      // Remove duplicates
      const uniqueResults = Array.from(
        new Map(
          response.data.map((item: SubredditInfo) => [item.name, item])
        ).values()
      );
      return uniqueResults;
    },
    enabled: !!debouncedSearchTerm.trim(),
    staleTime: 10 * 60 * 1000, // 10 minutes for search results
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1, // Less retries for search
  });

  // Add subreddits mutation
  const addSubredditsMutation = useMutation({
    mutationFn: async (data: { projectId: any; subreddits: string[] }) => {
      const response = await apiService.addSubreddits({
        proj_id: data.projectId,
        subreddits: data.subreddits,
      });
      if (!response.success) {
        throw new Error(response.message || "Failed to add subreddits");
      }
      return response.data;
    },
    onSuccess: (data, variables) => {
      toast.success(`Added ${variables.subreddits.length} subreddit(s)`);
      setSelectedSubreddits([]);
      setIsAddDialogOpen(false);
      setSearchTerm("");
      // Invalidate and refetch current subreddits
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.subreddits(variables.projectId),
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add subreddits");
    },
  });

  // Remove subreddit mutation
  const removeSubredditMutation = useMutation({
    mutationFn: async (data: { projectId: any; subredditName: string }) => {
      const response = await apiService.deleteSubreddits({
        proj_id: data.projectId,
        subreddits: [data.subredditName],
      });
      if (!response.success) {
        throw new Error(response.message || "Failed to remove subreddit");
      }
      return response.data;
    },
    onSuccess: (data, variables) => {
      toast.success("Subreddit removed");
      setDeleteSubredditName(null);
      // Invalidate and refetch current subreddits
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.subreddits(variables.projectId),
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to remove subreddit");
    },
  });

  // Handle errors
  if (currentError) {
    toast.error(currentError.message || "Failed to fetch subreddits");
  }

  if (searchError) {
    toast.error(searchError.message || "Failed to search subreddits");
  }

  const toggleDescription = (subredditName: string) => {
    setExpandedDescriptions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(subredditName)) {
        newSet.delete(subredditName);
      } else {
        newSet.add(subredditName);
      }
      return newSet;
    });
  };

  const handleAddSubreddits = async () => {
    if (!project?.id || selectedSubreddits.length === 0) return;

    addSubredditsMutation.mutate({
      projectId: project.id,
      subreddits: selectedSubreddits,
    });
  };

  const handleRemoveSubreddit = async (subredditName: string) => {
    if (!project?.id) return;

    removeSubredditMutation.mutate({
      projectId: project.id,
      subredditName,
    });
  };

  const handleSubredditSelect = (subredditName: string, checked: boolean) => {
    setSelectedSubreddits((prev) =>
      checked
        ? [...prev, subredditName]
        : prev.filter((name) => name !== subredditName)
    );
  };

  const handleRefresh = async () => {
    try {
      await refetchCurrent();
      toast.success("Subreddits refreshed successfully");
    } catch (error) {
      toast.error("Failed to refresh subreddits");
    }
  };

  const formatMembers = (count: number): string => {
    if (!count) return "0";
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(0)}k`;
    return count.toString();
  };

  if (!project) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          No Project Selected
        </h2>
        <p className="text-gray-600">Select a project to manage subreddits.</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-white min-h-full flex flex-col">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Subreddits
              {isFetchingCurrent && (
                <Loader2 className="inline-block ml-2 h-5 w-5 animate-spin text-green-700" />
              )}
            </h1>
            <p className="text-gray-600 mt-1">
              Monitor subreddits for {project.name}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isFetchingCurrent}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${
                  isFetchingCurrent ? "animate-spin" : ""
                }`}
              />
              {isFetchingCurrent ? "Refreshing..." : "Refresh"}
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center bg-green-700 hover:bg-green-800 font-bold">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Subreddits
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add Subreddits</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Search for subreddits (e.g., SaaS, startups)"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  {isSearching && (
                    <div className="text-center py-4">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                      <p className="text-sm text-gray-600 mt-2">
                        Searching subreddits...
                      </p>
                    </div>
                  )}
                  {searchResults.length > 0 && (
                    <div className="space-y-2 max-h-96 overflow-y-auto p-1">
                      {searchResults.map((subreddit) => {
                        const isAlreadyAdded = currentSubreddits.some(
                          (cs) => cs.name === subreddit.name
                        );
                        const isExpanded = expandedDescriptions.has(
                          subreddit.name
                        );
                        const isLongDescription =
                          subreddit.description.length > 120;

                        return (
                          <Card
                            key={subreddit.name}
                            className="p-3 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-start space-x-4">
                              <Checkbox
                                id={`cb-${subreddit.name}`}
                                checked={
                                  selectedSubreddits.includes(subreddit.name) ||
                                  isAlreadyAdded
                                }
                                disabled={isAlreadyAdded}
                                onCheckedChange={(checked) =>
                                  handleSubredditSelect(
                                    subreddit.name,
                                    checked as boolean
                                  )
                                }
                                className="mt-1"
                              />
                              <Label
                                htmlFor={`cb-${subreddit.name}`}
                                className="flex-1 min-w-0 cursor-pointer flex items-start space-x-4"
                              >
                                <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0 overflow-hidden relative">
                                  <Image
                                    src={subreddit.image_url}
                                    alt={`Icon for r/${subreddit.name}`}
                                    fill
                                    sizes="40px"
                                    className="object-cover"
                                  />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-medium text-sm text-gray-900">
                                      r/{subreddit.name}
                                    </h4>
                                    {isAlreadyAdded ? (
                                      <Badge
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        <Check className="h-3 w-3 mr-1" /> Added
                                      </Badge>
                                    ) : (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          window.open(subreddit.url, "_blank");
                                        }}
                                        className="p-1"
                                        aria-label="Open in new tab"
                                      >
                                        <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-primary" />
                                      </button>
                                    )}
                                  </div>

                                  {/* Description with expand/collapse */}
                                  <div className="text-xs text-gray-600 mb-1 font-normal">
                                    <span>
                                      {isLongDescription && !isExpanded
                                        ? `${subreddit.description.substring(
                                            0,
                                            120
                                          )}... `
                                        : subreddit.description}
                                    </span>
                                    {isLongDescription && !isExpanded && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleDescription(subreddit.name);
                                        }}
                                        className="text-xs font-semibold text-green-700 hover:text-green-800"
                                      >
                                        See more
                                      </button>
                                    )}
                                  </div>
                                  {isLongDescription && isExpanded && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleDescription(subreddit.name);
                                      }}
                                      className="text-xs font-semibold text-green-600 hover:text-green-800 p-0"
                                    >
                                      See less
                                    </button>
                                  )}

                                  <div className="flex items-center space-x-2 text-xs text-gray-500 font-normal mt-2">
                                    <Users className="h-3 w-3" />
                                    <span>
                                      {formatMembers(subreddit.subscribers)}{" "}
                                      members
                                    </span>
                                    {subreddit.over18 && (
                                      <Badge
                                        variant="destructive"
                                        className="text-xs"
                                      >
                                        18+
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </Label>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    onClick={handleAddSubreddits}
                    disabled={
                      selectedSubreddits.length === 0 ||
                      addSubredditsMutation.isPending
                    }
                    className="bg-green-700 hover:bg-green-800"
                  >
                    {addSubredditsMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Add {selectedSubreddits.length} Subreddit(s)
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Current subreddits list */}
        <CardContent className="flex-1 flex flex-col p-0">
          {isLoadingCurrent ? (
            <div className="m-auto text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin mb-2" />
              <p className="text-gray-600">Loading subreddits...</p>
            </div>
          ) : currentSubreddits.length === 0 ? (
            <div className="m-auto text-center">
              <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No subreddits added
              </h3>
              <Button
                onClick={() => setIsAddDialogOpen(true)}
                className="mt-2 bg-green-700 hover:bg-green-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Subreddit
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {currentSubreddits.map((subreddit) => (
                <Card
                  key={subreddit.name}
                  className="border-l-4 border-l-green-700"
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                        <Image
                          src={subreddit.image_url}
                          alt={`Icon for r/${subreddit.name}`}
                          width={40}
                          height={40}
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          r/{subreddit.name}
                        </h3>
                        <p className="text-sm text-gray-500 line-clamp-1">
                          {subreddit.description}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatMembers(subreddit.subscribers)} members
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(subreddit.url, "_blank")}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteSubredditName(subreddit.name)}
                        disabled={removeSubredditMutation.isPending}
                      >
                        <Trash className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>

        {/* Delete Dialog */}
        <AlertDialog
          open={!!deleteSubredditName}
          onOpenChange={() => setDeleteSubredditName(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove Subreddit</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove r/{deleteSubredditName}?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={removeSubredditMutation.isPending}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() =>
                  deleteSubredditName &&
                  handleRemoveSubreddit(deleteSubredditName)
                }
                disabled={removeSubredditMutation.isPending}
                className="bg-red-600 hover:bg-red-700"
              >
                {removeSubredditMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Remove"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
