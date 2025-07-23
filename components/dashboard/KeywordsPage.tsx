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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Trash,
  Edit,
  Hash,
  Loader2,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  apiService,
  KeywordsResponse,
  AddKeywordsData,
  DeleteKeywordsData,
} from "@/lib/api";

interface Project {
  id: string;
  name: string;
}

interface KeywordsPageProps {
  project: Project | null;
}

export default function KeywordsPage({ project }: KeywordsPageProps) {
  const [keywords, setKeywords] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteKeywords, setDeleteKeywords] = useState<string[]>([]);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"alphabetical" | "length">(
    "alphabetical"
  );

  // Form state
  const [newKeywords, setNewKeywords] = useState("");

  // Fetch keywords
  const fetchKeywords = useCallback(async () => {
    if (!project?.id) return;

    setIsLoading(true);
    try {
      const response = await apiService.getKeywords(project.id);
      console.log("Fetched keywords response:", response);
      console.log("Fetched keywords response:", response.data?.data.keywords);
      if (response.success && response.data) {
        setKeywords(response.data.data.keywords || []);
      } else {
        setKeywords([]);
        toast.error(response.message || "Failed to fetch keywords");
      }
    } catch (error) {
      setKeywords([]);
      toast.error("Failed to fetch keywords");
    } finally {
      setIsLoading(false);
    }
  }, [project?.id]);

  // Initial data fetch
  useEffect(() => {
    if (project?.id) {
      fetchKeywords();
    }
  }, [project?.id, fetchKeywords]);

  // Auto-refresh every 60 seconds
  // useEffect(() => {
  //   if (!project?.id) return;

  //   const interval = setInterval(() => {
  //     fetchKeywords();
  //   }, 60000);

  //   return () => clearInterval(interval);
  // }, [project?.id, fetchKeywords]);

  const handleAddKeywords = async () => {
    if (!project?.id || !newKeywords.trim()) {
      toast.error("Please enter keywords to add");
      return;
    }

    try {
      const keywordList = newKeywords
        .split(",")
        .map((keyword) => keyword.trim())
        .filter((keyword) => keyword.length > 0);

      if (keywordList.length === 0) {
        toast.error("Please enter valid keywords");
        return;
      }

      const addData: AddKeywordsData = {
        proj_id: project.id,
        keywords: keywordList,
      };

      const response = await apiService.addKeywords(addData);

      if (response.success) {
        toast.success(`Added ${keywordList.length} keyword(s) successfully`);
        setNewKeywords("");
        setIsAddDialogOpen(false);
        fetchKeywords(); // Refresh keywords list
      } else {
        toast.error(response.message || "Failed to add keywords");
      }
    } catch (error) {
      toast.error("Failed to add keywords");
    }
  };

  const handleDeleteKeywords = async () => {
    console.log("Delete keywords:", deleteKeywords);
    if (!project?.id || deleteKeywords.length === 0) {
      toast.error("Please select keywords to delete");
      return;
    }

    setIsDeleting(true);
    try {
      const deleteData: DeleteKeywordsData = {
        proj_id: project.id,
        del_keywords: deleteKeywords,
      };

      const response = await apiService.deleteKeywords(deleteData);

      if (response.success) {
        toast.success(
          `Deleted ${deleteKeywords.length} keyword(s) successfully`
        );
        setKeywords((prev) =>
          prev.filter((keyword) => !deleteKeywords.includes(keyword))
        );
        setDeleteKeywords([]);
      } else {
        toast.error(response.message || "Failed to delete keywords");
      }
    } catch (error) {
      toast.error("Failed to delete keywords");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleKeywordSelect = (keyword: string, checked: boolean) => {
    if (checked) {
      setSelectedKeywords((prev) => [...prev, keyword]);
    } else {
      setSelectedKeywords((prev) => prev.filter((k) => k !== keyword));
    }
  };

  const handleDeleteSelect = (keyword: string, checked: boolean) => {
    if (checked) {
      setDeleteKeywords((prev) => [...prev, keyword]);
    } else {
      setDeleteKeywords((prev) => prev.filter((k) => k !== keyword));
    }
  };

  // Filter and sort keywords
  const filteredKeywords = keywords
    .filter((keyword) =>
      keyword.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "alphabetical") {
        return a.localeCompare(b);
      } else {
        return a.length - b.length;
      }
    });

  if (!project) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            No Project Selected
          </h2>
          <p className="text-gray-600">Select a project to manage keywords.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Keywords</h1>
          <p className="text-gray-600 mt-1">
            Manage keywords for {project.name}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center">
                <Plus className="mr-2 h-4 w-4" />
                Add Keywords
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Keywords</DialogTitle>
                <DialogDescription>
                  Add new keywords to track for your project. Separate multiple
                  keywords with commas.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="keywords">Keywords</Label>
                  <Input
                    id="keywords"
                    placeholder="keyword1, keyword2, keyword3"
                    value={newKeywords}
                    onChange={(e) => setNewKeywords(e.target.value)}
                  />
                  <p className="text-sm text-gray-500">
                    Tip: Use quotes for exact phrases (e.g., "social listening")
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddKeywords}
                  disabled={!newKeywords.trim()}
                >
                  Add Keywords
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {keywords.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="flex items-center">
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-w-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Keywords</AlertDialogTitle>
                  <AlertDialogDescription>
                    Select keywords to delete from your project. This action
                    cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {keywords.map((keyword) => (
                    <div
                      key={keyword}
                      className="flex items-center space-x-3 p-2 border rounded"
                    >
                      <Checkbox
                        checked={deleteKeywords.includes(keyword)}
                        onCheckedChange={(checked) =>
                          handleDeleteSelect(keyword, checked as boolean)
                        }
                      />
                      <div className="flex-1">
                        <span className="font-medium">{keyword}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isDeleting}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteKeywords}
                    disabled={isDeleting || deleteKeywords.length === 0}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      `Delete ${deleteKeywords.length} Keyword(s)`
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      {/* <Card>
        <CardHeader>
          <CardTitle>Search Keywords</CardTitle>
          <CardDescription>
            Find and filter your tracked keywords
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 flex-1">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>
            <Select
              value={sortBy}
              onValueChange={(value) =>
                setSortBy(value as "alphabetical" | "length")
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="alphabetical">Alphabetical</SelectItem>
                <SelectItem value="length">By Length</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card> */}

      {/* Keywords List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Keywords ({filteredKeywords.length})</CardTitle>
              <CardDescription>
                {searchTerm
                  ? `Search results for "${searchTerm}"`
                  : "Track and manage your keyword performance"}
              </CardDescription>
            </div>
            {isLoading && (
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && keywords.length === 0 ? (
            <div className="text-center py-8">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600 mb-4" />
              <p className="text-gray-600">Loading keywords...</p>
            </div>
          ) : filteredKeywords.length === 0 ? (
            <div className="text-center py-8">
              {searchTerm ? (
                <>
                  <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No keywords found
                  </h3>
                  <p className="text-gray-600">
                    No keywords match your search for "{searchTerm}". Try a
                    different search term.
                  </p>
                </>
              ) : (
                <>
                  <Hash className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No keywords yet
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Add keywords to start tracking mentions for your project.
                  </p>
                  <Button onClick={() => setIsAddDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Keywords
                  </Button>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredKeywords.map((keyword, index) => (
                <Card key={keyword} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {keyword}
                        </h3>
                        {/* <p className="text-sm text-gray-500">
                          {keyword.length} characters
                        </p> */}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {/* <Badge variant="outline" className="text-xs">
                        Active
                      </Badge> */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {/* <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Mentions
                          </DropdownMenuItem> */}
                          {/* <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Keyword
                          </DropdownMenuItem> */}
                          <DropdownMenuItem
                            onClick={() => {
                              setDeleteKeywords([keyword]);
                              handleDeleteKeywords();
                            }}
                            className="text-red-600"
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
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
              Total Keywords
            </CardTitle>
            <Hash className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{keywords.length}</div>
            <p className="text-xs text-muted-foreground">Active tracking</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Length
            </CardTitle>
            <Hash className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {keywords.length > 0
                ? Math.round(
                    keywords.reduce((sum, keyword) => sum + keyword.length, 0) /
                      keywords.length
                  )
                : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Characters per keyword
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Longest Keyword
            </CardTitle>
            <Hash className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {keywords.length > 0
                ? Math.max(...keywords.map((k) => k.length))
                : 0}
            </div>
            <p className="text-xs text-muted-foreground">Characters</p>
          </CardContent>
        </Card>
      </div> */}
    </div>
  );
}
