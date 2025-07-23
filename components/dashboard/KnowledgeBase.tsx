"use client";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Book,
  Plus,
  Trash2,
  Edit,
  Search,
  Calendar,
  Loader2,
  FileText,
  AlertCircle,
  Save,
  Check,
  User,
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
  apiService,
  KnowledgeBaseEntry,
  AddKnowledgeBaseData,
  FounderTemplate,
  PaginationParams,
} from "@/lib/api";
import { useDebounce } from "@/hooks/use-debounce";
import { toast } from "sonner";

export default function KnowledgeBase() {
  const [entries, setEntries] = useState<KnowledgeBaseEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteEntryId, setDeleteEntryId] = useState<number | null>(null);
  const [expandedEntries, setExpandedEntries] = useState<Set<number>>(
    new Set()
  );

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalEntries, setTotalEntries] = useState(0);

  // Search state
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "",
    tags: "",
  });

  // Founder template state
  const [founderTemplates, setFounderTemplates] = useState<FounderTemplate[]>(
    []
  );
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [characterCount, setCharacterCount] = useState(0);

  const MAX_CHARACTERS = 1200;

  // Fetch founder templates
  const fetchFounderTemplates = useCallback(async () => {
    setIsLoadingTemplates(true);
    try {
      const response = await apiService.getFounderTemplates();

      if (response.success && response.data) {
        const apiResponse = response.data;
        setFounderTemplates(apiResponse.data);
      } else {
        setFounderTemplates([]);
        toast.error(response.message || "Failed to fetch founder templates");
      }
    } catch (error) {
      setFounderTemplates([]);
      toast.error("Failed to fetch founder templates");
    } finally {
      setIsLoadingTemplates(false);
    }
  }, []);

  // Fetch knowledge base entries
  const fetchEntries = useCallback(
    async (page: number = 1) => {
      setIsLoading(true);
      try {
        const params: PaginationParams = {
          page,
          limit: pageSize,
        };

        const response = await apiService.getKnowledgeBase(params);
        console.log("Knowledge Base Response:", response.data);
        if (response.success && response.data) {
          // Ensure response.data is an array
          const entriesData = response.data;
          setEntries(entriesData.data);

          if (response.pagination) {
            setTotalPages(response.pagination.totalPages);
            setTotalEntries(response.pagination.total);
            setCurrentPage(response.pagination.page);
          } else {
            // If no pagination info, set defaults
            setTotalPages(1);
            setTotalEntries(entriesData.length);
            setCurrentPage(1);
          }
        } else {
          setEntries([]);
          toast.error(
            response.message || "Failed to fetch knowledge base entries"
          );
        }
      } catch (error) {
        setEntries([]);
        toast.error("Failed to fetch knowledge base entries");
      } finally {
        setIsLoading(false);
      }
    },
    [pageSize]
  );

  // Initial data fetch
  useEffect(() => {
    fetchEntries(1);
    fetchFounderTemplates();
  }, [fetchEntries, fetchFounderTemplates]);

  // Auto-refresh every 60 seconds
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     fetchEntries(currentPage);
  //   }, 60000);

  //   return () => clearInterval(interval);
  // }, [currentPage, fetchEntries]);

  // Handle character count for form content
  const handleContentChange = (value: string) => {
    if (value.length <= MAX_CHARACTERS) {
      setFormData((prev) => ({ ...prev, content: value }));
      setCharacterCount(value.length);
    } else {
      toast.error(`Maximum ${MAX_CHARACTERS} characters allowed`);
    }
  };

  // Handle founder template selection
  const handleFounderSelect = (founder: FounderTemplate) => {
    if (founder.profileText.length <= MAX_CHARACTERS) {
      setFormData((prev) => ({
        ...prev,
        content: founder.profileText,
        title: `${founder.name} - ${founder.company} Style`,
      }));
      setCharacterCount(founder.profileText.length);
    } else {
      toast.error("Founder template exceeds character limit");
    }
  };

  const handleAddEntry = async () => {
    if (!formData.content.trim()) {
      toast.error("Content is required");
      return;
    }

    try {
      const personalInfo: Record<string, any> = {
        content: formData.content.trim(),
      };

      if (formData.title.trim()) {
        personalInfo.title = formData.title.trim();
      }

      if (formData.category.trim()) {
        personalInfo.category = formData.category.trim();
      }

      if (formData.tags.trim()) {
        personalInfo.tags = formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean);
      }

      const addData: AddKnowledgeBaseData = {
        personal_info: personalInfo,
      };

      const response = await apiService.addKnowledgeBase(addData);

      if (response.success) {
        toast.success("Knowledge base entry added successfully");
        setFormData({ title: "", content: "", category: "", tags: "" });
        setCharacterCount(0);
        setIsAddDialogOpen(false);
        fetchEntries(1); // Refresh to first page
      } else {
        if (response.message?.includes("limit reached")) {
          toast.error("Knowledge base storage limit reached");
        } else if (response.message?.includes("should be a json")) {
          toast.error("Invalid data format");
        } else {
          toast.error(response.message || "Failed to add knowledge base entry");
        }
      }
    } catch (error) {
      toast.error("Failed to add knowledge base entry");
    }
  };

  const handleDeleteEntry = async (entryId: number) => {
    setIsDeleting(true);
    try {
      const response = await apiService.deleteKnowledgeBase({ kb_id: entryId });

      if (response.success) {
        setEntries((prev) => prev.filter((entry) => entry.id !== entryId));
        setTotalEntries((prev) => prev - 1);

        // If current page becomes empty and it's not the first page, go to previous page
        if (entries.length === 1 && currentPage > 1) {
          setCurrentPage((prev) => prev - 1);
          fetchEntries(currentPage - 1);
        } else {
          fetchEntries(currentPage);
        }

        toast.success("Knowledge base entry deleted successfully");
      } else {
        toast.error(
          response.message || "Failed to delete knowledge base entry"
        );
      }
    } catch (error) {
      toast.error("Failed to delete knowledge base entry");
    } finally {
      setIsDeleting(false);
      setDeleteEntryId(null);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchEntries(page);
  };

  const handlePageSizeChange = (newPageSize: string) => {
    setPageSize(parseInt(newPageSize));
    setCurrentPage(1);
  };

  const toggleExpanded = (entryId: number) => {
    setExpandedEntries((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(entryId)) {
        newSet.delete(entryId);
      } else {
        newSet.add(entryId);
      }
      return newSet;
    });
  };

  // Filter entries based on search term
  const filteredEntries = Array.isArray(entries)
    ? entries.filter(
        (entry) =>
          entry.content
            .toLowerCase()
            .includes(debouncedSearchTerm.toLowerCase()) ||
          (entry.title &&
            entry.title
              .toLowerCase()
              .includes(debouncedSearchTerm.toLowerCase()))
      )
    : [];

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

  return (
    <div className="p-6 space-y-6 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl flex font-bold text-gray-900 mb-2">
            Knowledge Base
            <Label className="flex ml-2 mt-1 items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-4 h-4 cursor-pointer text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent
                    side="right"
                    align="start"
                    className="max-w-xs"
                  >
                    <p>
                      This defines your AI assistant's speaking and Comment
                      generation style (e.g. formal, casual).
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
          </h1>
          <p className="text-gray-600">
            Tell us about yourself and manage your knowledge base entries
            <Label className="flex mt-2 items-center gap-1">
              Why
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-4 h-4 cursor-pointer text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent
                    side="right"
                    align="start"
                    className="max-w-xs"
                  >
                    <p>
                      We will use this data to personalize generated comments
                      and enhance team-specific recommendations.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center">
              <Plus className="mr-2 h-4 w-4" />
              Add Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto ">
            <DialogHeader>
              <DialogTitle>Add Knowledge Base Entry</DialogTitle>
              <DialogDescription>
                Create a new knowledge base entry with your information and
                insights.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
              {/* Main Form Area */}
              <div className="lg:col-span-3 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title (Optional)</Label>
                  <Input
                    id="title"
                    placeholder="Enter a title for this entry"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Content *</Label>
                  <Textarea
                    id="content"
                    placeholder="Share your story, mindset, what drives you, or enter any knowledge base content..."
                    value={formData.content}
                    onChange={(e) => handleContentChange(e.target.value)}
                    rows={8}
                    className="resize-none"
                  />

                  {/* Character Count */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-sm ${
                          characterCount > MAX_CHARACTERS * 0.9
                            ? "text-red-600"
                            : "text-gray-500"
                        }`}
                      >
                        {characterCount}/{MAX_CHARACTERS} characters
                      </span>
                      {characterCount > MAX_CHARACTERS * 0.9 && (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>

                    {characterCount === MAX_CHARACTERS && (
                      <Badge variant="destructive" className="text-xs">
                        Character limit reached
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category (Optional)</Label>
                    <Input
                      id="category"
                      placeholder="e.g., Personal Profile, Tutorial, FAQ, Guide"
                      value={formData.category}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          category: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags (Optional)</Label>
                    <Input
                      id="tags"
                      placeholder="tag1, tag2, tag3"
                      value={formData.tags}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          tags: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Founder Templates - Only show if no entries exist yet */}
              {/* {totalEntries === 0 && !isLoading && ( */}
              <div className="space-y-4 col-span-2">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Need inspiration?
                  </h3>

                  <p className="text-sm text-gray-600 mb-4">
                    Choose a founder template to get started, then customize it
                    to match your voice.
                  </p>
                </div>

                {isLoadingTemplates ? (
                  <div className="text-center py-4">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-blue-600 mb-2" />
                    <p className="text-sm text-gray-600">
                      Loading templates...
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
                    {founderTemplates.map((founder) => (
                      <Card
                        key={founder.id}
                        className="hover:shadow-md transition-shadow"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-3">
                            <img
                              src={founder.photo}
                              alt={founder.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 text-sm">
                                {founder.name}
                              </h4>
                              <p className="text-xs text-gray-600 mb-1">
                                CEO of {founder.company}
                              </p>
                              <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                                {founder.description}
                              </p>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleFounderSelect(founder)}
                                className="w-full text-xs"
                              >
                                Use this template
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
              {/*)} */}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddDialogOpen(false);
                  setFormData({
                    title: "",
                    content: "",
                    category: "",
                    tags: "",
                  });
                  setCharacterCount(0);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddEntry}
                disabled={!formData.content.trim()}
              >
                Add Entry
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      {entries.length <= 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* first time entry */}
          {/* Main Form Area */}
          <div className="lg:col-span-2 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title (Optional)</Label>
              <Input
                id="title"
                placeholder="Enter a title for this entry"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                placeholder="Share your story, mindset, what drives you, or enter any knowledge base content..."
                value={formData.content}
                onChange={(e) => handleContentChange(e.target.value)}
                rows={8}
                className="resize-none"
              />

              {/* Character Count */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span
                    className={`text-sm ${
                      characterCount > MAX_CHARACTERS * 0.9
                        ? "text-red-600"
                        : "text-gray-500"
                    }`}
                  >
                    {characterCount}/{MAX_CHARACTERS} characters
                  </span>
                  {characterCount > MAX_CHARACTERS * 0.9 && (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>

                {characterCount === MAX_CHARACTERS && (
                  <Badge variant="destructive" className="text-xs">
                    Character limit reached
                  </Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category (Optional)</Label>
                <Input
                  id="category"
                  placeholder="e.g., Personal Profile, Tutorial, FAQ, Guide"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (Optional)</Label>
                <Input
                  id="tags"
                  placeholder="tag1, tag2, tag3"
                  value={formData.tags}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      tags: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </div>

          {/* Founder Templates - Only show if no entries exist yet */}
          {/* {totalEntries === 0 && !isLoading && ( */}
          <div className="space-y-4 col-span-2">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Need inspiration?
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Choose a founder template to get started, then customize it to
                match your voice.
              </p>
            </div>

            {/* {isLoadingTemplates ? (
              <div className="text-center py-4">
                <Loader2 className="mx-auto h-6 w-6 animate-spin text-blue-600 mb-2" />
                <p className="text-sm text-gray-600">Loading templates...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
                {founderTemplates.map((founder) => (
                  <Card
                    key={founder.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <img
                          src={founder.photo}
                          alt={founder.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 text-sm">
                            {founder.name}
                          </h4>
                          <p className="text-xs text-gray-600 mb-1">
                            CEO of {founder.company}
                          </p>
                          <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                            {founder.description}
                          </p>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleFounderSelect(founder)}
                            className="w-full text-xs"
                          >
                            Use this template
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )} */}
            {isLoadingTemplates ? (
              <div className="text-center py-4">
                <Loader2 className="mx-auto h-6 w-6 animate-spin text-blue-600 mb-2" />
                <p className="text-sm text-gray-600">Loading templates...</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {founderTemplates.map((founder) => (
                  <Card
                    key={founder.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <img
                          src={founder.photo}
                          alt={founder.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 text-sm">
                            {founder.name}
                          </h4>
                          <p className="text-xs text-gray-600 mb-1">
                            CEO of {founder.company}
                          </p>
                          <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                            {founder.description}
                          </p>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleFounderSelect(founder)}
                            className="w-full text-xs"
                          >
                            Use this template
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
          {/*)} */}
        </div>
      )}

      {/* Search and Filters */}
      {/* {entries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Search Knowledge Base</CardTitle>
            <CardDescription>Find entries by content or title</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 flex-1">
                <Search className="h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search knowledge base entries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
              </div>
              <Select
                value={pageSize.toString()}
                onValueChange={handlePageSizeChange}
              >
                <SelectTrigger className="w-[140px]">
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
          </CardContent>
        </Card>
      )} */}
      {entries.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Analytics Cards */}
          {/* <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Entries
              </CardTitle>
              <Book className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEntries}</div>
              <p className="text-xs text-muted-foreground">
                Knowledge base entries
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Current Page
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredEntries.length}</div>
              <p className="text-xs text-muted-foreground">Entries shown</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Search Results
              </CardTitle>
              <Search className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {debouncedSearchTerm ? filteredEntries.length : totalEntries}
              </div>
              <p className="text-xs text-muted-foreground">
                {debouncedSearchTerm ? "Matching entries" : "All entries"}
              </p>
            </CardContent>
          </Card> */}
        </div>
      )}
      {entries.length > 0 && (
        <Card>
          {/* Knowledge Base Entries */}
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <CardTitle>Knowledge Base Entries</CardTitle>
                <CardDescription>
                  {debouncedSearchTerm
                    ? `Search results for "${debouncedSearchTerm}" (${filteredEntries.length} found)`
                    : `Showing ${entries.length} of ${totalEntries} entries`}
                </CardDescription>
              </div>
              {isLoading && (
                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isLoading && entries.length === 0 ? (
              <div className="text-center py-8">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600 mb-4" />
                <p className="text-gray-600">
                  Loading knowledge base entries...
                </p>
              </div>
            ) : filteredEntries.length === 0 ? (
              <div className="text-center py-8">
                {debouncedSearchTerm ? (
                  <>
                    <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No entries found
                    </h3>
                    <p className="text-gray-600">
                      No entries match your search for "{debouncedSearchTerm}".
                      Try a different search term.
                    </p>
                  </>
                ) : (
                  <>
                    <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Tell us about yourself
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Share your story, mindset, and what drives you to make
                      your comments feel more natural and authentic.
                    </p>
                    <Button
                      onClick={() => setIsAddDialogOpen(true)}
                      className="mt-4"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Your First Entry
                    </Button>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredEntries.map((entry) => (
                  <Card key={entry.id} className="border-l-4 border-l-blue-500">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">
                            {entry.title || `Entry #${entry.id}`}
                          </CardTitle>
                          <div className="flex items-center space-x-2 mt-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              Created:{" "}
                              {new Date(entry.created_on).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleExpanded(entry.id)}
                          >
                            {expandedEntries.has(entry.id)
                              ? "Show Less"
                              : "Show More"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteEntryId(entry.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-gray-700">
                        {expandedEntries.has(entry.id) ? (
                          <p className="whitespace-pre-wrap">{entry.content}</p>
                        ) : (
                          <p className="line-clamp-3">
                            {entry.content.length > 200
                              ? `${entry.content.substring(0, 200)}...`
                              : entry.content}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-6 flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Showing {(currentPage - 1) * pageSize + 1} to{" "}
                      {Math.min(currentPage * pageSize, totalEntries)} of{" "}
                      {totalEntries} entries
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
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteEntryId}
        onOpenChange={() => setDeleteEntryId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this entry?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              knowledge base entry.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteEntryId && handleDeleteEntry(deleteEntryId)}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Entry"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
