"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

import {
  Plus,
  ChevronDown,
  ChevronRight,
  Book,
  Users,
  FolderOpen,
  Loader2,
  Trash2,
  MessageSquare,
  Home,
  RefreshCw,
} from "lucide-react";
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
import { cn } from "@/lib/utils";
import { Project, apiService } from "@/lib/api";
import { toast } from "sonner";
import { FeedbackDialog } from "./Feedback";

// Query keys for React Query
const QUERY_KEYS = {
  projects: ["projects"] as const,
};

export default function Sidebar() {
  const pathname = usePathname();
  const params = useParams();
  const queryClient = useQueryClient();
  // console.log("Sidebar pathname:", pathname, "params:", params);
  const [projectsExpanded, setProjectsExpanded] = useState(true);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  const router = useRouter();

  const currentProjectId = params.projectId as string;

  // Fetch projects with React Query
  const {
    data: projects = [],
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: QUERY_KEYS.projects,
    queryFn: async () => {
      const response = await apiService.getProjects();
      if (
        !response.success ||
        !response.data ||
        !Array.isArray(response.data.projects)
      ) {
        throw new Error(response.message || "Failed to fetch projects");
      }
      return response.data.projects;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Delete project mutation
  const deleteProjectMutation = useMutation({
    mutationFn: async (projectId: number) => {
      const response = await apiService.deleteProject({ proj_id: projectId });
      if (!response.success) {
        throw new Error(response.message || "Failed to delete project");
      }
      return response.data;
    },
    onSuccess: (data, projectId) => {
      const deletedProject = projects.find(
        (p) => p.id === projectId.toString()
      );
      toast.success(`Project "${deletedProject?.name}" deleted.`);

      // Invalidate and refetch projects list
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.projects,
      });

      // Navigate away if current project was deleted
      if (currentProjectId === projectId.toString()) {
        router.push("/projects");
      }

      // Reset expanded state if deleted project was expanded
      if (expandedProject === projectId.toString()) {
        setExpandedProject(null);
      }
    },
    onError: (error: Error, projectId) => {
      const deletedProject = projects.find(
        (p) => p.id === projectId.toString()
      );
      toast.error(
        `Failed to delete project "${deletedProject?.name}": ${error.message}`
      );
    },
    onSettled: () => {
      setIsAlertOpen(false);
      setProjectToDelete(null);
    },
  });

  // Effect to handle expanding project based on current route
  useEffect(() => {
    const projectId = params?.projectId as string;
    // console.log(
    //   "Sidebar projectId from params:",
    //   projectId,
    //   "pathname:",
    //   pathname
    // );

    if (projectId) {
      // Always expand the current project from the URL
      setExpandedProject(projectId);
      // console.log("Setting expanded project to:", projectId);
    } else {
      // Only collapse if we're specifically on the projects list page
      if (pathname === "/projects") {
        setExpandedProject(null);
        // console.log("Collapsing all projects - on projects list page");
      }
      // For any other page without projectId, keep the current expanded state
    }
  }, [params?.projectId]); // Remove pathname dependency to prevent re-runs on subsection navigation

  // Handle errors
  if (error) {
    console.error("🔥 Error fetching projects:", error);
  }

  const handleDeleteClick = (project: Project, event: React.MouseEvent) => {
    // Prevent event bubbling to avoid triggering parent button clicks
    event.stopPropagation();
    setProjectToDelete(project);
    setIsAlertOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;

    const toastId = toast.loading(
      `Deleting project "${projectToDelete.name}"...`
    );

    try {
      await deleteProjectMutation.mutateAsync(Number(projectToDelete.id));
      toast.dismiss(toastId);
    } catch (error) {
      toast.dismiss(toastId);
      // Error is already handled in the mutation
    }
  };

  const handleProjectToggle = (projectId: string, event: React.MouseEvent) => {
    // Prevent event bubbling and navigation
    event.preventDefault();
    event.stopPropagation();

    // console.log(
    //   "Toggling project:",
    //   projectId,
    //   "current expanded:",
    //   expandedProject
    // );

    setExpandedProject((current) => (current === projectId ? null : projectId));
  };

  const handleProjectsToggle = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    // console.log("sidebar Toggling projects expanded state");
    setProjectsExpanded((current) => !current);
  };

  const handleRefresh = async () => {
    try {
      await refetch();
      toast.success("Projects refreshed successfully");
    } catch (error) {
      toast.error("Failed to refresh projects");
    }
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  const isProjectActive = (projectId: string, subPath?: string) => {
    const targetPath = subPath
      ? `/projects/${projectId}/${subPath}`
      : `/projects/${projectId}`;
    return pathname === targetPath;
  };

  const ProjectSubsections = ({ project }: { project: Project }) => (
    <div className="ml-7 space-y-1">
      <Link
        href={`/projects/${project.id}`}
        className={cn(
          "block w-full text-left pl-3 pr-2 py-1.5 text-sm rounded-md transition-colors",
          isProjectActive(project.id)
            ? "bg-green-100 text-green-700"
            : "text-gray-600 hover:bg-gray-100"
        )}
      >
        - Dashboard
      </Link>
      <Link
        href={`/projects/${project.id}/keywords`}
        className={cn(
          "block w-full text-left pl-3 pr-2 py-1.5 text-sm rounded-md transition-colors",
          isProjectActive(project.id, "keywords")
            ? "bg-green-100 text-green-700"
            : "text-gray-600 hover:bg-gray-100"
        )}
      >
        - Keywords
      </Link>
      <Link
        href={`/projects/${project.id}/subreddits`}
        className={cn(
          "block w-full text-left pl-3 pr-2 py-1.5 text-sm rounded-md transition-colors",
          isProjectActive(project.id, "subreddits")
            ? "bg-green-100 text-green-700"
            : "text-gray-600 hover:bg-gray-100"
        )}
      >
        - Subreddits
      </Link>
      <Link
        href={`/projects/${project.id}/settings`}
        className={cn(
          "block w-full text-left pl-3 pr-2 py-1.5 text-sm rounded-md transition-colors",
          isProjectActive(project.id, "settings")
            ? "bg-green-100 text-green-700"
            : "text-gray-600 hover:bg-gray-100"
        )}
      >
        - Settings
      </Link>
    </div>
  );

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen">
      <div className="p-4">
        <Link href="/" className="flex items-center space-x-3">
          <Image
            src="/logo.jpg/"
            alt="Commentta Logo"
            width={32}
            height={32}
            className="rounded-lg"
          />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Commentta
              {isFetching && (
                <Loader2 className="inline-block ml-2 h-4 w-4 animate-spin text-green-700" />
              )}
            </h2>
          </div>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col">
        <div className="space-y-2">
          <Link
            href="/projects"
            className={cn(
              "w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors font-medium",
              isActive("/projects")
                ? "bg-green-100 text-green-700"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            <Home className="mr-2 h-4 w-4" />
            Home
          </Link>

          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              className="flex items-center px-3 py-2 text-sm rounded-md transition-colors flex-1 justify-start font-medium text-gray-600 hover:bg-gray-100"
              onClick={handleProjectsToggle}
            >
              {projectsExpanded ? (
                <ChevronDown className="mr-2 h-4 w-4" />
              ) : (
                <ChevronRight className="mr-2 h-4 w-4" />
              )}
              <FolderOpen className="mr-2 h-4 w-4" />
              Projects ({projects.length})
            </Button>
            <div className="flex gap-1">
              <Button
                onClick={handleRefresh}
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
                title="Refresh projects"
                disabled={isFetching}
              >
                <RefreshCw
                  className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
                />
              </Button>
              <Button
                onClick={() => router.push("/projects/create")}
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
                title="Create new project"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {projectsExpanded && (
            <div className="ml-4 space-y-1">
              {isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="text-center">
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400 mx-auto mb-1" />
                    <p className="text-xs text-gray-500">Loading projects...</p>
                  </div>
                </div>
              ) : projects.length > 0 ? (
                projects.map((project) => (
                  <div key={project.id}>
                    <div className="flex items-center group">
                      <button
                        onClick={(e) => handleProjectToggle(project.id, e)}
                        className={cn(
                          "flex items-center flex-1 px-3 py-1.5 text-sm rounded-md hover:bg-gray-100 transition-colors text-left font-bold",
                          currentProjectId === project.id
                            ? "text-green-600"
                            : "text-gray-700"
                        )}
                        title={`Expand ${project.name}`}
                      >
                        {expandedProject === project.id ? (
                          <ChevronDown className="mr-2 h-4 w-4 flex-shrink-0" />
                        ) : (
                          <ChevronRight className="mr-2 h-4 w-4 flex-shrink-0" />
                        )}
                        <span className="truncate" title={project.name}>
                          {project.name}
                        </span>
                      </button>
                      <Button
                        onClick={(e) => handleDeleteClick(project, e)}
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 ml-auto opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                        title={`Delete ${project.name}`}
                        disabled={deleteProjectMutation.isPending}
                      >
                        {deleteProjectMutation.isPending &&
                        projectToDelete?.id === project.id ? (
                          <Loader2 className="h-4 w-4 animate-spin text-red-500" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-red-500" />
                        )}
                      </Button>
                    </div>
                    {expandedProject === project.id && (
                      <ProjectSubsections project={project} />
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-4 px-2">
                  <p className="text-xs text-gray-500 mb-2">No projects yet</p>
                  <Button
                    onClick={() => router.push("/projects/create")}
                    size="sm"
                    variant="outline"
                    className="text-xs h-8"
                  >
                    Create First Project
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-2 pt-4 border-t border-gray-200">
          <Link
            href="/knowledgebase"
            className={cn(
              "w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors",
              isActive("/knowledgebase")
                ? "bg-green-100 text-green-700"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            <Book className="mr-2 h-4 w-4" />
            My Life Story
          </Link>
          <Link
            href="/accounts"
            className={cn(
              "w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors",
              isActive("/accounts")
                ? "bg-green-100 text-green-700"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            <Users className="mr-2 h-4 w-4" />
            Accounts
          </Link>
          <FeedbackDialog>
            <Button
              variant="ghost"
              className="w-full flex items-center justify-start px-3 py-2 text-sm rounded-md text-gray-600 hover:bg-gray-100"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Feedback
            </Button>
          </FeedbackDialog>
        </div>
      </div>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the{" "}
              <span className="font-semibold">{projectToDelete?.name}</span>{" "}
              project and all of its associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteProjectMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleteProjectMutation.isPending}
            >
              {deleteProjectMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Continue"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
