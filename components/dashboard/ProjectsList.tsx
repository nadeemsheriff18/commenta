"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter, usePathname } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Plus,
  Edit,
  Trash,
  ExternalLink,
  Calendar,
  Target,
  Eye,
  EyeOff,
  Hash,
  MessageSquare,
  Loader2,
  Search,
  CheckCircle2,
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
  apiService,
  OverallStats,
  Project,
  ProjectListingResponse,
} from "@/lib/api";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/use-debounce";

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
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  // Query for fetching projects
  const {
    data: projectsData,
    isLoading,
    error,
    refetch,
  } = useQuery<ProjectListingResponse>({
    queryKey: ["projects", debouncedSearchTerm],
    queryFn: async (): Promise<ProjectListingResponse> => {
      const response = await apiService.getProjects({
        search: debouncedSearchTerm || undefined,
      });

      if (response.success && response.data) {
        // Auto-redirect to create page if no projects and no search
        if (
          response.data.total_projects === 0 &&
          !debouncedSearchTerm &&
          pathname === "/projects"
        ) {
          router.push("/projects/create");
        }
        return response.data;
      } else {
        if (response.message?.includes("User not found")) {
          toast.error("User session invalid. Please log in again.");
          if (onUserNotFound) onUserNotFound();
        }
        throw new Error(response.message || "Failed to fetch projects");
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    refetchOnWindowFocus: false,
  });

  // Mutation for deleting projects
  const deleteProjectMutation = useMutation({
    mutationFn: async (projectId: string) => {
      const response = await apiService.deleteProject({
        proj_id: Number(projectId),
      });
      if (!response.success) {
        throw new Error(response.message || "Failed to delete project");
      }
      return response;
    },
    onSuccess: () => {
      toast.success("Project deleted successfully");
      // Invalidate and refetch projects
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setDeleteProjectId(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete project");
    },
  });

  const handleDeleteProject = (projectId: string) => {
    if (!projectId) return;
    deleteProjectMutation.mutate(projectId);
  };

  // Extract projects and stats from cached data
  const projects = projectsData?.projects || [];
  const stats: OverallStats = {
    total_projects: projectsData?.total_projects ?? 0,
    total_mentions: projectsData?.total_mentions ?? 0,
    total_subreddits: projectsData?.total_subreddits ?? 0,
    total_completed_mentions: projectsData?.total_completed_mentions ?? 0,
  };

  // Handle loading state
  if (isLoading && projects.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-off-white">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  // Handle error state
  if (error && projects.length === 0) {
    return (
      <div className="p-6 max-w-3xl mx-auto text-center">
        <div className="text-red-600 mb-4">
          <p className="font-semibold">Error loading projects</p>
          <p className="text-sm">
            {error instanceof Error ? error.message : "Unknown error"}
          </p>
        </div>
        <Button onClick={() => refetch()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="p-4 sm:p-6 lg:p-8 bg-white min-h-full">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                Projects
              </h1>
              <p className="mt-1 text-gray-600">
                Manage all your projects and their analytics.
              </p>
            </div>
            <Button
              onClick={onCreateProject}
              className="mt-4 md:mt-0 bg-green-700 hover:bg-green-800 shadow-sm text-white font-bold"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Project
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Tooltip>
              <TooltipTrigger asChild>
                <Card className="shadow-xl bg-white b-4 border-green-700">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Projects
                    </CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats.total_projects}
                    </div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent>
                <p>The total number of projects in your account.</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Card className="shadow-xl bg-white b-4 border-green-700">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Mentions
                    </CardTitle>
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats.total_mentions}
                    </div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent>
                <p>The total mentions found across all your projects.</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Card className="shadow-xl bg-white b-4 border-green-700">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Subreddits
                    </CardTitle>
                    <Hash className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats.total_subreddits}
                    </div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent>
                <p>The total subreddits being monitored across all projects.</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Card className="shadow-xl bg-white b-4 border-green-700">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Completed Mentions
                    </CardTitle>
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats.total_completed_mentions}
                    </div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  The total number of mentions you have marked as 'Completed'.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>

          <Card className="shadow-xl">
            <CardContent className="bg-white">
              <Table>
                <TableHeader>
                  <TableRow className="bg-white mt-auto">
                    <TableHead className="text-slate-700 font-bold">
                      Project Name
                    </TableHead>
                    <TableHead className="text-slate-700 font-bold">
                      Product Link
                    </TableHead>
                    <TableHead className="text-slate-700 font-bold">
                      Created
                    </TableHead>
                    <TableHead className="text-right text-slate-700">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium text-gray-800">
                        {project.name}
                      </TableCell>
                      <TableCell>
                        <a
                          href={project.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:underline flex items-center gap-1 text-sm"
                        >
                          <span className="truncate max-w-[150px]">
                            {project.link}
                          </span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {new Date(project.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditProject(project)}
                          title="View Project Dashboard"
                        >
                          <span className="sr-only">
                            View Project Dashboard
                          </span>
                          <Eye className="h-4 w-4 text-gray-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteProjectId(project.id)}
                          title="Delete Project"
                          disabled={deleteProjectMutation.isPending}
                        >
                          <span className="sr-only">Delete Project</span>
                          {deleteProjectMutation.isPending &&
                          deleteProjectId === project.id ? (
                            <Loader2 className="h-4 w-4 animate-spin text-red-500" />
                          ) : (
                            <Trash className="h-4 w-4 text-red-500" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

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
                This action cannot be undone and will permanently delete the
                project.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleteProjectMutation.isPending}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() =>
                  deleteProjectId && handleDeleteProject(deleteProjectId)
                }
                disabled={deleteProjectMutation.isPending}
                className="bg-red-600 hover:bg-red-700"
              >
                {deleteProjectMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Delete Project
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}
