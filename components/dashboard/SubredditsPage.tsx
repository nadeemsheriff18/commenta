"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Trash,
  Users,
  Loader2,
  ExternalLink,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import {
  apiService,
  SubredditInfo,
  AddSubredditsData,
  DeleteSubredditsData,
} from "@/lib/api";
import { useDebounce } from "@/hooks/use-debounce";

interface Project {
  id: string;
  name: string;
}

interface SubredditsPageProps {
  project: Project | null;
}

interface CurrentSubreddit {
  name: string;
  title: string;
  description: string;
  subscribers: number;
  url: string;
  isSystemAdded?: boolean;
}

const defaultProject: Project = {
  id: "preview-id",
  name: "My Awesome Project (Preview)",
};

const dummySubreddits: CurrentSubreddit[] = [
    {
        name: "reactjs",
        title: "React JS",
        description: "The official subreddit for React, a JavaScript library for building user interfaces. Ask questions, share projects, and discuss the latest developments.",
        subscribers: 450000,
        url: "https://www.reddit.com/r/reactjs/",
        isSystemAdded: true,
    },
    {
        name: "webdev",
        title: "Web Development",
        description: "A community dedicated to all things web development. From HTML/CSS to advanced frameworks and backend technologies. A great place for beginners and experts alike.",
        subscribers: 1200000,
        url: "https://www.reddit.com/r/webdev/",
        isSystemAdded: false,
    },
];


export default function SubredditsPage({ project: projectProp }: SubredditsPageProps) {
  const project = projectProp || defaultProject;

  const [searchResults, setSearchResults] = useState<SubredditInfo[]>([]);
  const [currentSubreddits, setCurrentSubreddits] = useState<
    CurrentSubreddit[]
  >([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingCurrent, setIsLoadingCurrent] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [deleteSubredditName, setDeleteSubredditName] = useState<string | null>(
    null
  );
  const [selectedSubreddits, setSelectedSubreddits] = useState<string[]>([]);
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<string>>(
    new Set()
  );

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const fetchCurrentSubreddits = useCallback(async () => {
    if (!projectProp?.id) {
        setIsLoadingCurrent(false);
        setCurrentSubreddits(dummySubreddits);
        return;
    }
    setIsLoadingCurrent(true);
    try {
      const response = await apiService.listSubreddits(projectProp.id);
      if (response.success && Array.isArray(response.data)) {
        setCurrentSubreddits(response.data);
      } else {
        setCurrentSubreddits([]);
        toast.error(response.message || "Failed to fetch current subreddits");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch current subreddits");
    } finally {
      setIsLoadingCurrent(false);
    }
  }, [projectProp?.id]);

  const searchSubreddits = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const response = await apiService.searchSubreddits(searchQuery, { limit: 8 });
        
        if (response.success && Array.isArray(response.data)) {
          // --- FIX: De-duplicate results from the backend ---
          const uniqueResults = Array.from(new Map(response.data.map((item: SubredditInfo) => [item.name, item])).values());
          
          const filteredResults = uniqueResults.filter(
            (subreddit: SubredditInfo) =>
              !currentSubreddits.some((current) => current.name === subreddit.name)
          );
          setSearchResults(filteredResults);
        } else {
          setSearchResults([]);
          if (response.message) {
            toast.error(response.message);
          }
        }
      } catch (error: any) {
        setSearchResults([]);
        toast.error(error.message || "Failed to search subreddits");
      } finally {
        setIsSearching(false);
      }
    },
    [currentSubreddits]
  );

  useEffect(() => {
    fetchCurrentSubreddits();
  }, [fetchCurrentSubreddits]);

  useEffect(() => {
    if (debouncedSearchTerm) {
      searchSubreddits(debouncedSearchTerm);
    } else {
      setSearchResults([]);
    }
  }, [debouncedSearchTerm, searchSubreddits]);

  const handleAddSubreddits = async () => {
    if (selectedSubreddits.length === 0) {
      toast.error("Please select subreddits to add");
      return;
    }
    
    if (projectProp?.id) {
        try {
          const addData: AddSubredditsData = {
            proj_id: projectProp.id,
            subreddits: selectedSubreddits,
          };
          const response = await apiService.addSubreddits(addData);
          if (response.success) {
            toast.success(`Added ${selectedSubreddits.length} subreddit(s)`);
            fetchCurrentSubreddits();
          } else {
            toast.error(response.message || "Failed to add subreddits");
          }
        } catch (error: any) {
          toast.error(error.message || "Failed to add subreddits");
        }
    } else {
        const newSubreddits = searchResults
            .filter((sr) => selectedSubreddits.includes(sr.name))
            .map((sr) => ({ ...sr, isSystemAdded: false }));
        setCurrentSubreddits((prev) => [...prev, ...newSubreddits]);
        toast.success(`Simulated adding ${selectedSubreddits.length} subreddit(s)`);
    }

    setSelectedSubreddits([]);
    setIsAddDialogOpen(false);
    setSearchTerm("");
    setSearchResults([]);
  };

  const handleRemoveSubreddit = async (subredditName: string) => {
    if (!projectProp?.id) {
        setCurrentSubreddits((prev) => prev.filter((sr) => sr.name !== subredditName));
        toast.success(`Simulated removing r/${subredditName}`);
        setDeleteSubredditName(null);
        return;
    }

    setIsRemoving(true);
    try {
      const removeData: DeleteSubredditsData = {
        proj_id: projectProp.id,
        subreddits: [subredditName],
      };
      const response = await apiService.deleteSubreddits(removeData);
      if (response.success) {
        toast.success("Subreddit removed successfully");
        setCurrentSubreddits((prev) =>
          prev.filter((sr) => sr.name !== subredditName)
        );
        setDeleteSubredditName(null);
      } else {
        toast.error(response.message || "Failed to remove subreddit");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to remove subreddit");
    } finally {
      setIsRemoving(false);
    }
  };

  const handleSubredditSelect = (subredditName: string, checked: boolean) => {
    if (checked) {
      setSelectedSubreddits((prev) => [...prev, subredditName]);
    } else {
      setSelectedSubreddits((prev) =>
        prev.filter((name) => name !== subredditName)
      );
    }
  };

  const toggleDescription = (subredditName: string) => {
    setExpandedDescriptions((prev) => {
      const newSet = new Set(prev);
      newSet.has(subredditName) ? newSet.delete(subredditName) : newSet.add(subredditName);
      return newSet;
    });
  };

  const formatMembers = (count: number) => {
    if (!count) return "0";
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(0)}k`;
    return count.toString();
  };
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Subreddits</h1>
          <p className="text-gray-600 mt-1">Monitor subreddits for {project.name}</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center">
              <Plus className="mr-2 h-4 w-4" />
              Add Subreddits
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Subreddits</DialogTitle>
              {/* --- REMOVED: DialogDescription --- */}
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search for subreddits (e.g., python, programming)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              {isSearching && (
                <div className="text-center py-4">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-blue-600 mb-2" />
                  <p className="text-sm text-gray-600">Searching subreddits...</p>
                </div>
              )}

              {searchResults.length > 0 && (
                <div className="space-y-3">
                  <div className="text-right text-sm text-gray-600">
                    {selectedSubreddits.length} selected
                  </div>
                  <div className="space-y-2 max-h-96 overflow-y-auto p-1">
                    {searchResults.map((subreddit) => (
                      <Card key={subreddit.name} className="p-3">
                        <div className="flex items-start space-x-3">
                          <input
                            type="checkbox"
                            id={`cb-${subreddit.name}`}
                            checked={selectedSubreddits.includes(subreddit.name)}
                            onChange={(e) =>
                              handleSubredditSelect(subreddit.name, e.target.checked)
                            }
                            className="mt-1 h-4 w-4"
                          />
                          <Label htmlFor={`cb-${subreddit.name}`} className="flex-1 min-w-0 cursor-pointer">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-sm">r/{subreddit.name}</h4>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(subreddit.url, "_blank");
                                }}
                                className="h-6 w-6 p-0"
                              >
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            </div>
                            <p className="text-xs text-gray-600 line-clamp-2 mb-1 font-normal">
                              {subreddit.description}
                            </p>
                            <div className="flex items-center space-x-2 text-xs text-gray-500 font-normal">
                              <Users className="h-3 w-3" />
                              <span>{formatMembers(subreddit.subscribers)} members</span>
                              {subreddit.over18 && (
                                <Badge variant="destructive" className="text-xs">18+</Badge>
                              )}
                            </div>
                          </Label>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {debouncedSearchTerm && !isSearching && searchResults.length === 0 && (
                <div className="text-center py-8">
                  <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No subreddits found
                  </h3>
                  <p className="text-gray-600">
                    No results for "{debouncedSearchTerm}".
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAddSubreddits}
                disabled={selectedSubreddits.length === 0}
              >
                Add {selectedSubreddits.length} Subreddit(s)
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div>
        {isLoadingCurrent ? (
          <div className="text-center py-8">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600 mb-4" />
            <p className="text-gray-600">Loading subreddits...</p>
          </div>
        ) : currentSubreddits.length === 0 ? (
          <div className="text-center py-8 border rounded-lg">
            <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No subreddits added
            </h3>
            <Button onClick={() => setIsAddDialogOpen(true)} className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Subreddit
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {currentSubreddits.map((subreddit) => (
              <Card key={subreddit.name} className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 pr-4">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600">
                          {subreddit.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-gray-900">
                              r/{subreddit.name}
                            </h3>
                            {subreddit.isSystemAdded && (
                              <Badge variant="secondary" className="text-xs">
                                System Added
                              </Badge>
                            )}
                          </div>
                          <p className="text-gray-500 text-sm">
                            {formatMembers(subreddit.subscribers)} members
                          </p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 mb-3">
                        {expandedDescriptions.has(subreddit.name) ? (
                          <div>
                            <p>{subreddit.description}</p>
                            <Button
                              variant="link"
                              size="sm"
                              onClick={() => toggleDescription(subreddit.name)}
                              className="p-0 h-auto text-blue-600 mt-1"
                            >
                              <EyeOff className="mr-1 h-3 w-3" />
                              Show less
                            </Button>
                          </div>
                        ) : (
                          <div>
                            <p className="line-clamp-2">
                              {subreddit.description}
                            </p>
                            {subreddit.description && subreddit.description.length > 100 && (
                              <Button
                                variant="link"
                                size="sm"
                                onClick={() => toggleDescription(subreddit.name)}
                                className="p-0 h-auto text-blue-600 mt-1"
                              >
                                <Eye className="mr-1 h-3 w-3" />
                                See more
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
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
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      
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
            <AlertDialogCancel disabled={isRemoving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deleteSubredditName && handleRemoveSubreddit(deleteSubredditName)
              }
              disabled={isRemoving}
              className="bg-red-600 hover:bg-red-700"
            >
              {isRemoving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Remove"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}