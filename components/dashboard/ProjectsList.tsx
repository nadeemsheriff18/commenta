"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
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
import {
  Plus,
  Edit,
  Trash,
  ExternalLink,
  Calendar,
  Target,
  Hash,
  MessageSquare,
  Loader2,
  Search,
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
import { apiService, Project, PaginationParams } from "@/lib/api";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/use-debounce";
import LoginPage from "../auth/LoginPage";

interface ProjectsListProps {
  onCreateProject: () => void;
  onEditProject: (project: Project) => void;
  onUserNotFound?: () => void;
}

export default function ProjectsList({
  onCreateProject,
  onEditProject,
  onUserNotFound,
}: ProjectsListProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProjects, setTotalProjects] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  // Search and sorting state
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Debounce search term to avoid too many API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const router = useRouter();
  useEffect(() => {
    if (!loading && projects.length === 0) {
      router.push("/projects/create");
    }
  }, [loading, projects]);

  // Fetch projects with pagination
  const fetchProjects = useCallback(
    async (params?: Partial<PaginationParams>) => {
      setIsLoading(true);
      try {
        const requestParams: PaginationParams = {
          page: currentPage,
          limit: pageSize,
          search: debouncedSearchTerm || undefined,
          sortBy,
          sortOrder,
          ...params,
        };

        const response = await apiService.getProjects(requestParams);

        console.log("API Response:", response); // Debug log
        console.log("PROJJJJJJJ", response.data);
        const apiResponse = response?.data;
        console.log("PROJ>DATA ", apiResponse);
        // if (apiResponse && "data" in apiResponse) {
        //   console.log("API Response Data:", apiResponse.data); // Debug log
        // } else {
        //   console.log(
        //     "API Response Data is not available or not in expected format."
        //   ); // Debug log
        // }
        // const projectsArray = apiResponse.data;
        const temp = response.data;
        console.log("TEMPP", temp.length);
        if (response.success && temp.length) {
          console.log("HEHEHHEHE");
          // Ensure response.data is an array and apiResponse is defined
          const projectsData =
            apiResponse && Array.isArray(apiResponse.data) ? apiResponse : [];
          setProjects(apiResponse);
          // console.log("Projects fetched:", projectsData); // Debug log

          // Update pagination info from response
          if (response.pagination) {
            setTotalPages(response.pagination.totalPages);
            setTotalProjects(response.pagination.total);
            setCurrentPage(response.pagination.page);
            // console.log("Pagination info:", response.pagination); // Debug log
          } else {
            // Fallback pagination
            setTotalPages(1);
            setTotalProjects(projectsData.length);
            setCurrentPage(1);
          }
        } else {
          console.error("Failed to fetch projects:", response.message);
          if (response.message?.includes("not authorized")) {
            toast.error("You're not authorized to view these projects");
          } else if (response.message?.includes("User not found")) {
            toast.error("User not found. Please log in again.");
            if (onUserNotFound) {
              onUserNotFound();
            }
            return;
          } else {
            // console.error("Error fetching projects:", response.message);
          }

          // toast.error(response.message || "Failed to fetch projects");
          setProjects([]);
        }
      } catch (error) {
        // console.error("Error fetching projects:", error);
        toast.error("Failed to fetch projects");
        setProjects([]);
      } finally {
        setIsLoading(false);
        setLoading(false);
      }
    },
    [currentPage, pageSize, debouncedSearchTerm, sortBy, sortOrder]
  );

  // Fetch projects when dependencies change
  // useEffect(() => {
  //   fetchProjects();
  // }, [fetchProjects]);

  // Reset to first page when search term changes
  useEffect(() => {
    if (debouncedSearchTerm !== searchTerm) return; // Only reset when debounced value changes
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      fetchProjects({ page: 1 });
    }
  }, [debouncedSearchTerm]);

  const handleDeleteProject = async (projectId: string) => {
    setIsDeleting(true);
    try {
      const response = await apiService.deleteProject(projectId);

      if (response.success) {
        // Remove project from list
        setProjects((prev) => prev.filter((p) => p.id !== projectId));
        setTotalProjects((prev) => prev - 1);

        // If current page becomes empty and it's not the first page, go to previous page
        if (projects.length === 1 && currentPage > 1) {
          setCurrentPage((prev) => prev - 1);
        } else {
          // Refresh current page
          fetchProjects();
        }

        toast.success("Project deleted successfully");
      } else {
        if (response.message?.includes("not authorized")) {
          toast.error("You're not authorized to delete this project");
        } else {
          toast.error(response.message || "Failed to delete project");
        }
      }
    } catch (error) {
      toast.error("Failed to delete project");
    } finally {
      setIsDeleting(false);
      setDeleteProjectId(null);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize: string) => {
    setPageSize(parseInt(newPageSize));
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const handleSortChange = (newSortBy: string) => {
    if (newSortBy === sortBy) {
      // Toggle sort order if same field
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(newSortBy);
      setSortOrder("desc"); // Default to desc for new field
    }
    setCurrentPage(1); // Reset to first page when changing sort
  };

  // Generate pagination items
  const generatePaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
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

  // Loading state
  if (isLoading && projects.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
            <p className="text-gray-600 mt-1">
              Manage all your projects and their analytics
            </p>
          </div>
          <Button onClick={onCreateProject} className="flex items-center">
            <Plus className="mr-2 h-4 w-4" />
            Create Project
          </Button>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardContent className="text-center py-8">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600 mb-4" />
            <p className="text-gray-600">Loading your projects...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Empty state
  if (!isLoading && projects.length === 0 && !debouncedSearchTerm) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
            <p className="text-gray-600 mt-1">
              Manage all your projects and their analytics
            </p>
          </div>
          <Button onClick={onCreateProject} className="flex items-center">
            <Plus className="mr-2 h-4 w-4" />
            Create Project
          </Button>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Plus className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle>No projects found</CardTitle>
            <CardDescription>
              Create your first project to start tracking keywords, monitoring
              subreddits, and analyzing mentions.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={onCreateProject} size="lg">
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Project
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate totals for analytics cards (from current page data)
  const totalKeywords = projects.reduce(
    (total, project) => total + (project.total_subreddits || 0),
    0
  );
  const totalMentions = projects.reduce(
    (total, project) => total + (project.total_mentions || 0),
    0
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600 mt-1">
            Manage all your projects and their analytics
          </p>
        </div>
        <Button onClick={onCreateProject} className="flex items-center">
          <Plus className="mr-2 h-4 w-4" />
          Create Project
        </Button>
      </div>

      {/* Analytics Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Projects
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProjects}</div>
            <p className="text-xs text-muted-foreground">All projects</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Page</CardTitle>
            <Hash className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.length}</div>
            <p className="text-xs text-muted-foreground">Projects shown</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Page Subreddits
            </CardTitle>
            <Hash className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalKeywords}</div>
            <p className="text-xs text-muted-foreground">Current page</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Page Mentions</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMentions}</div>
            <p className="text-xs text-muted-foreground">Current page</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      {/* <Card>
        <CardHeader>
          <CardTitle>Search and Filter Projects</CardTitle>
          <CardDescription>Find and sort your projects</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center space-x-2 flex-1">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search projects by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">Created Date</SelectItem>
                  <SelectItem value="name">Project Name</SelectItem>
                  <SelectItem value="total_mentions">Total Mentions</SelectItem>
                  <SelectItem value="total_subreddits">
                    Total Subreddits
                  </SelectItem>
                </SelectContent>
              </Select>
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
        </CardContent>
      </Card> */}

      {/* Projects Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <CardTitle>All Projects</CardTitle>
              <CardDescription>
                {debouncedSearchTerm
                  ? `Search results for "${debouncedSearchTerm}" (${totalProjects} found)`
                  : `Showing ${projects.length} of ${totalProjects} projects`}
              </CardDescription>
            </div>
            {isLoading && (
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            )}
          </div>
        </CardHeader>
        <CardContent>
          {projects.length === 0 && debouncedSearchTerm ? (
            <div className="text-center py-8">
              <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No projects found
              </h3>
              <p className="text-gray-600">
                No projects match your search for "{debouncedSearchTerm}". Try a
                different search term.
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSortChange("name")}
                    >
                      Project Name{" "}
                      {sortBy === "name" && (sortOrder === "asc" ? "↑" : "↓")}
                    </TableHead>
                    <TableHead>Product Link</TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSortChange("total_subreddits")}
                    >
                      Total Subreddits{" "}
                      {sortBy === "total_subreddits" &&
                        (sortOrder === "asc" ? "↑" : "↓")}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSortChange("total_mentions")}
                    >
                      Total Mentions{" "}
                      {sortBy === "total_mentions" &&
                        (sortOrder === "asc" ? "↑" : "↓")}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSortChange("created_at")}
                    >
                      Created{" "}
                      {sortBy === "created_at" &&
                        (sortOrder === "asc" ? "↑" : "↓")}
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <span>{project.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {project.name || "Member"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <a
                          href={project.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center"
                        >
                          <span className="truncate max-w-[150px]">
                            {project.link}
                          </span>
                          <ExternalLink className="ml-1 h-3 w-3" />
                        </a>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {project.total_subreddits || 0}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {project.total_mentions || 0}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="mr-1 h-3 w-3" />
                          {new Date(project.created_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => onEditProject(project)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              View Project
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setDeleteProjectId(project.id)}
                              className="text-red-600"
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Delete Project
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Showing {(currentPage - 1) * pageSize + 1} to{" "}
                    {Math.min(currentPage * pageSize, totalProjects)} of{" "}
                    {totalProjects} projects
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
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteProjectId}
        onOpenChange={() => setDeleteProjectId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this project?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              project and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deleteProjectId && handleDeleteProject(deleteProjectId)
              }
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Project"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
