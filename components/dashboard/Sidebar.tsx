"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname, useParams } from "next/navigation";
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
  Home, // Added Home icon
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

export default function Sidebar() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [projectsExpanded, setProjectsExpanded] = useState(true);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  const currentProjectId = params.projectId as string;

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiService.getProjects();
      if (response.success && response.data && Array.isArray(response.data.projects)) {
        setProjects(response.data.projects);
      } else {
        setProjects([]);
      }
    } catch (error) {
      console.error("🔥 Error fetching projects:", error);
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    if (currentProjectId) {
      setExpandedProject(currentProjectId);
    }
  }, [currentProjectId]);

  const handleDeleteClick = (project: Project) => {
    setProjectToDelete(project);
    setIsAlertOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;
    const toastId = toast.loading(`Deleting project "${projectToDelete.name}"...`);
    try {
      const response = await apiService.deleteProject({ proj_id: Number(projectToDelete.id) });
      if (response.success) {
        toast.success(`Project "${projectToDelete.name}" deleted.`, { id: toastId });
        fetchProjects();
        if (currentProjectId === projectToDelete.id) {
          router.push('/projects');
        }
      } else {
        toast.error(response.message || "Failed to delete project.", { id: toastId });
      }
    } catch (error) {
      console.error("🔥 Error deleting project:", error);
      toast.error("Failed to delete project.", { id: toastId });
    } finally {
      setIsAlertOpen(false);
      setProjectToDelete(null);
    }
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  const isProjectActive = (projectId: string, subPath?: string) => {
    const targetPath = subPath ? `/projects/${projectId}/${subPath}` : `/projects/${projectId}`;
    return pathname === targetPath;
  };

  const ProjectSubsections = ({ project }: { project: Project }) => (
    <div className="ml-7 space-y-1">
      <Link href={`/projects/${project.id}`} className={cn("block w-full text-left pl-3 pr-2 py-1.5 text-sm rounded-md transition-colors", isProjectActive(project.id) ? "bg-indigo-100 text-indigo-700" : "text-gray-600 hover:bg-gray-100")}>- Dashboard</Link>
      <Link href={`/projects/${project.id}/keywords`} className={cn("block w-full text-left pl-3 pr-2 py-1.5 text-sm rounded-md transition-colors", isProjectActive(project.id, "keywords") ? "bg-indigo-100 text-indigo-700" : "text-gray-600 hover:bg-gray-100")}>- Keywords</Link>
      <Link href={`/projects/${project.id}/subreddits`} className={cn("block w-full text-left pl-3 pr-2 py-1.5 text-sm rounded-md transition-colors", isProjectActive(project.id, "subreddits") ? "bg-indigo-100 text-indigo-700" : "text-gray-600 hover:bg-gray-100")}>- Subreddits</Link>
      <Link href={`/projects/${project.id}/settings`} className={cn("block w-full text-left pl-3 pr-2 py-1.5 text-sm rounded-md transition-colors", isProjectActive(project.id, "settings") ? "bg-indigo-100 text-indigo-700" : "text-gray-600 hover:bg-gray-100")}>- Settings</Link>
    </div>
  );

  return (
    <div className="w-64 bg-off-white border-r border-gray-200 flex flex-col h-screen">
      <div className="p-4">
        <Link href="/projects" className="flex items-center space-x-3">
          <Image src="/logo.jpg/" alt="Commentta Logo" width={32} height={32} className="rounded-lg"/>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Commentta</h2>
            <p className="text-xs text-gray-500">Management Suite</p>
          </div>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col">
        <div className="space-y-2">
          <Link href="/projects" className={cn("w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors font-medium", isActive("/projects") ? "bg-indigo-100 text-indigo-700" : "text-gray-600 hover:bg-gray-100")}>
            <Home className="mr-2 h-4 w-4" />
            Home
          </Link>
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              className="flex items-center px-3 py-2 text-sm rounded-md transition-colors flex-1 justify-start font-medium text-gray-600 hover:bg-gray-100"
              onClick={() => setProjectsExpanded(!projectsExpanded)}
            >
              {projectsExpanded ? <ChevronDown className="mr-2 h-4 w-4" /> : <ChevronRight className="mr-2 h-4 w-4" />}
              <FolderOpen className="mr-2 h-4 w-4" />
              Projects ({projects.length})
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
          {projectsExpanded && (
            <div className="ml-4 space-y-1">
              {isLoading ? (
                <div className="flex items-center justify-center py-4"><Loader2 className="h-4 w-4 animate-spin text-gray-400" /></div>
              ) : projects.length > 0 ? (
                projects.map((project) => (
                  <div key={project.id}>
                    <div className="flex items-center group">
                      <button
                        onClick={() => setExpandedProject(expandedProject === project.id ? null : project.id)}
                        className={cn("flex items-center flex-1 px-3 py-1.5 text-sm rounded-md hover:bg-gray-100 transition-colors text-left", currentProjectId === project.id ? "text-indigo-600" : "text-gray-700")}
                        title={`Expand ${project.name}`}
                      >
                        {expandedProject === project.id ? <ChevronDown className="mr-2 h-4 w-4 flex-shrink-0" /> : <ChevronRight className="mr-2 h-4 w-4 flex-shrink-0" />}
                        <span className="truncate" title={project.name}>{project.name}</span>
                      </button>
                      <Button
                        onClick={() => handleDeleteClick(project)}
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 ml-auto opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                        title={`Delete ${project.name}`}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                    {expandedProject === project.id && <ProjectSubsections project={project} />}
                  </div>
                ))
              ) : (
                <div className="text-center py-4 px-2">
                  <p className="text-xs text-gray-500 mb-2">No projects yet</p>
                  <Button onClick={() => router.push("/projects/create")} size="sm" variant="outline" className="text-xs h-8">
                    Create First Project
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="space-y-2 pt-4 border-t border-gray-200">
          <Link href="/knowledgebase" className={cn("w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors", isActive("/knowledgebase") ? "bg-indigo-100 text-indigo-700" : "text-gray-600 hover:bg-gray-100")}>
            <Book className="mr-2 h-4 w-4" />
            Knowledge Base
          </Link>
          <Link href="/accounts" className={cn("w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors", isActive("/accounts") ? "bg-indigo-100 text-indigo-700" : "text-gray-600 hover:bg-gray-100")}>
            <Users className="mr-2 h-4 w-4" />
            Accounts
          </Link>
          <FeedbackDialog>
            <Button variant="ghost" className="w-full flex items-center justify-start px-3 py-2 text-sm rounded-md text-gray-600 hover:bg-gray-100">
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
              This will permanently delete the <span className="font-semibold">{projectToDelete?.name}</span> project and all of its associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}