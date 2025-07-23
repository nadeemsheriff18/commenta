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

export default function SubredditsPage({ project }: SubredditsPageProps) {
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

  // Search state
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Fetch current subreddits for the project
  const fetchCurrentSubreddits = useCallback(async () => {
    if (!project?.id) return;

    setIsLoadingCurrent(true);
    try {
      // const mockCurrentSubreddits: CurrentSubreddit[] = [
      //   {
      //     name: "artificial",
      //     title: "Artificial Intelligence",
      //     description:
      //       "Discussion about artificial intelligence, machine learning, and AI applications. This community focuses on the latest developments in AI technology, research papers, and practical applications.",
      //     subscribers: 125000,
      //     url: "https://reddit.com/r/artificial",
      //     isSystemAdded: true,
      //   },
      //   {
      //     name: "MachineLearning",
      //     title: "Machine Learning",
      //     description:
      //       "A subreddit dedicated to learning and discussing machine learning algorithms, techniques, and applications.",
      //     subscribers: 2100000,
      //     url: "https://reddit.com/r/MachineLearning",
      //     isSystemAdded: true,
      //   },
      //   {
      //     name: "programming",
      //     title: "Programming",
      //     description:
      //       "Computer programming discussion, help, and news for developers of all skill levels.",
      //     subscribers: 4500000,
      //     url: "https://reddit.com/r/programming",
      //     isSystemAdded: false,
      //   },
      // ];
      const response = await apiService.listSubreddits(project.id);
      console.log("Fetched current subreddits response:", response.data.data);
      setCurrentSubreddits(response.data.data);
      // setCurrentSubreddits(mockCurrentSubreddits);
    } catch (error) {
      toast.error("Failed to fetch current subreddits");
    } finally {
      setIsLoadingCurrent(false);
    }
  }, [project?.id]);

  // Search subreddits
  const searchSubreddits = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const response = await apiService.searchSubreddits(searchQuery, {
          limit: 8,
        });
        console.log("Search subreddits response:", response);
        console.log("Search subreddits response:", response.data.data);

        if (response.success && response.data) {
          // Filter out subreddits that are already added
          const filteredResults = response.data.data.filter(
            (subreddit: SubredditInfo) =>
              !currentSubreddits.some(
                (current) => current.name === subreddit.name
              )
          );
          setSearchResults(filteredResults);
        } else {
          setSearchResults([]);
          if (response.message) {
            toast.error(response.message);
          }
        }
      } catch (error) {
        setSearchResults([]);
        toast.error("Failed to search subreddits");
      } finally {
        setIsSearching(false);
      }
    },
    [currentSubreddits]
  );

  // Initial data fetch
  useEffect(() => {
    if (project?.id) {
      fetchCurrentSubreddits();
    }
  }, [project?.id, fetchCurrentSubreddits]);

  // Search when debounced term changes
  useEffect(() => {
    if (debouncedSearchTerm) {
      searchSubreddits(debouncedSearchTerm);
    } else {
      setSearchResults([]);
    }
  }, [debouncedSearchTerm, searchSubreddits]);

  const handleAddSubreddits = async () => {
    if (!project?.id || selectedSubreddits.length === 0) {
      toast.error("Please select subreddits to add");
      return;
    }

    try {
      const addData: AddSubredditsData = {
        proj_id: project.id,
        subreddits: selectedSubreddits,
      };

      const response = await apiService.addSubreddits(addData);
      console.log("Add subreddits response:", response);
      if (response.success) {
        toast.success(
          `Added ${selectedSubreddits.length} subreddit(s) successfully`
        );

        // Add to current subreddits
        const newSubreddits = searchResults
          .filter((sr) => selectedSubreddits.includes(sr.name))
          .map((sr) => ({
            name: sr.name,
            title: sr.title,
            description: sr.description,
            subscribers: sr.subscribers,
            url: sr.url,
            isSystemAdded: false,
          }));

        setCurrentSubreddits((prev) => [...prev, ...newSubreddits]);
        setSelectedSubreddits([]);
        setIsAddDialogOpen(false);
        setSearchTerm("");
        setSearchResults([]);
      } else {
        if (response.message?.includes("limit")) {
          toast.error("Subreddit limit reached for your plan");
        } else {
          toast.error(response.message || "Failed to add subreddits");
        }
      }
    } catch (error) {
      toast.error("Failed to add subreddits");
    }
  };

  const handleRemoveSubreddit = async (subredditName: string) => {
    if (!project?.id) return;

    setIsRemoving(true);
    try {
      const removeData: DeleteSubredditsData = {
        proj_id: project.id,
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
    } catch (error) {
      toast.error("Failed to remove subreddit");
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
      if (newSet.has(subredditName)) {
        newSet.delete(subredditName);
      } else {
        newSet.add(subredditName);
      }
      return newSet;
    });
  };

  const formatMembers = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(0)}k`;
    }
    return count.toString();
  };

  if (!project) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            No Project Selected
          </h2>
          <p className="text-gray-600">
            Select a project to manage subreddits.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Subreddits</h1>
          <p className="text-gray-600 mt-1">
            Monitor subreddits for {project.name}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            System automatically fetched 10 subreddits based on your product
            details. Add more relevant subreddits below.
          </p>
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
              <DialogDescription>
                Search and select subreddits to add to your project monitoring.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search Subreddits</Label>
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search for subreddits (e.g., python, programming)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              {isSearching && (
                <div className="text-center py-4">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-blue-600 mb-2" />
                  <p className="text-sm text-gray-600">
                    Searching subreddits...
                  </p>
                </div>
              )}

              {searchResults.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      Found {searchResults.length} subreddit(s) for "
                      {debouncedSearchTerm}"
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedSubreddits.length} selected
                    </p>
                  </div>

                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {searchResults.map((subreddit) => (
                      <Card key={subreddit.name} className="p-3">
                        <div className="flex items-start space-x-3">
                          <input
                            type="checkbox"
                            checked={selectedSubreddits.includes(
                              subreddit.name
                            )}
                            onChange={(e) =>
                              handleSubredditSelect(
                                subreddit.name,
                                e.target.checked
                              )
                            }
                            className="mt-1"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-sm">
                                r/{subreddit.name}
                              </h4>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  window.open(subreddit.url, "_blank")
                                }
                                className="h-6 w-6 p-0"
                              >
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            </div>
                            <p className="text-xs text-gray-600 line-clamp-2 mb-1">
                              {subreddit.description}
                            </p>
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                              <Users className="h-3 w-3" />
                              <span>
                                {formatMembers(subreddit.subscribers)} members
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
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {debouncedSearchTerm &&
                !isSearching &&
                searchResults.length === 0 && (
                  <div className="text-center py-8">
                    <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No subreddits found
                    </h3>
                    <p className="text-gray-600">
                      No subreddits match your search for "{debouncedSearchTerm}
                      ". Try a different search term.
                    </p>
                  </div>
                )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
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

      {/* Current Subreddits */}
      <Card>
        <CardHeader>
          <CardTitle>Current Subreddits ({currentSubreddits.length})</CardTitle>
          <CardDescription>
            Subreddits currently being monitored for your project
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingCurrent ? (
            <div className="text-center py-8">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600 mb-4" />
              <p className="text-gray-600">Loading subreddits...</p>
            </div>
          ) : currentSubreddits.length === 0 ? (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No subreddits added
              </h3>
              <p className="text-gray-600 mb-4">
                Add subreddits to start monitoring mentions for your project.
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Subreddit
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {currentSubreddits.map((subreddit) => (
                <Card
                  key={subreddit.name}
                  className="border-l-4 border-l-blue-500"
                >
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
                                onClick={() =>
                                  toggleDescription(subreddit.name)
                                }
                                className="p-0 h-auto text-blue-600 mt-1"
                              >
                                <EyeOff className="mr-1 h-3 w-3" />
                                Show less
                              </Button>
                            </div>
                          ) : (
                            <div>
                              <p className="line-clamp-2">
                                {subreddit.description.length > 100
                                  ? `${subreddit.description.substring(
                                      0,
                                      100
                                    )}...`
                                  : subreddit.description}
                              </p>
                              {subreddit.description.length > 100 && (
                                <Button
                                  variant="link"
                                  size="sm"
                                  onClick={() =>
                                    toggleDescription(subreddit.name)
                                  }
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
        </CardContent>
      </Card>

      {/* Statistics */}
      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Subreddits
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentSubreddits.length}</div>
            <p className="text-xs text-muted-foreground">Being monitored</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatMembers(
                currentSubreddits.reduce(
                  (total, subreddit) => total + subreddit.subscribers,
                  0
                )
              )}
            </div>
            <p className="text-xs text-muted-foreground">Combined reach</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Added</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentSubreddits.filter((sr) => sr.isSystemAdded).length}
            </div>
            <p className="text-xs text-muted-foreground">Auto-generated</p>
          </CardContent>
        </Card>
      </div> */}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteSubredditName}
        onOpenChange={() => setDeleteSubredditName(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Subreddit</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove r/{deleteSubredditName} from your
              monitoring list? You will no longer receive mentions from this
              subreddit.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemoving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deleteSubredditName &&
                handleRemoveSubreddit(deleteSubredditName)
              }
              disabled={isRemoving}
              className="bg-red-600 hover:bg-red-700"
            >
              {isRemoving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removing...
                </>
              ) : (
                "Remove Subreddit"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
