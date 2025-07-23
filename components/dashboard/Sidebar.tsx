"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Plus,
  ChevronDown,
  ChevronRight,
  Book,
  Users,
  FolderOpen,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Project, apiService } from "@/lib/api";
import { toast } from "sonner";

export default function Sidebar() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [projectsExpanded, setProjectsExpanded] = useState(true);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);

  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  const currentProjectId = params.projectId as string;

  // Fetch projects on component mount
  useEffect(() => {
    fetchProjects();
  }, []);

  // Auto-expand current project
  useEffect(() => {
    if (currentProjectId && projects.length > 0) {
      setExpandedProject(currentProjectId);
    }
  }, [currentProjectId, projects]);

  // Auto-refresh projects every 30 seconds
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     fetchProjects();
  //   }, 30000);

  //   return () => clearInterval(interval);
  // }, []);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      console.log("🔄 Fetching projects from sidebar...");
      const response = await apiService.getProjects();

      console.log("📊 Projects response:", response.data);

      if (response.success && response.data) {
        console.log(
          "✅ Projects loaded successfully:",
          response.data.data?.length || 0,
          "projects"
        );
        setProjects(response.data || []);
        console.log(projects);
      } else {
        console.error("❌ Failed to fetch projects:", response.message);
        setProjects([]);
        // Don't show error toast for empty projects list
        if (response.message && !response.message.includes("No projects")) {
          toast.error(response.message || "Failed to fetch projects");
        }
      }
    } catch (error) {
      console.error("🔥 Error fetching projects:", error);
      setProjects([]);
      toast.error("Failed to fetch projects");
    } finally {
      setIsLoading(false);
    }
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  const isProjectActive = (projectId: string, subPath?: string) => {
    if (subPath) {
      return pathname === `/projects/${projectId}/${subPath}`;
    }
    return pathname === `/projects/${projectId}`;
  };

  const ProjectSubsections = ({ project }: { project: Project }) => (
    <div className="ml-6 space-y-1">
      <Link
        href={`/projects/${project.id}`}
        className={cn(
          "block w-full text-left px-3 py-2 text-sm rounded-md transition-colors",
          isProjectActive(project.id)
            ? "bg-blue-100 text-blue-700"
            : "text-gray-600 hover:bg-gray-100"
        )}
      >
        - Dashboard
      </Link>
      <Link
        href={`/projects/${project.id}/keywords`}
        className={cn(
          "block w-full text-left px-3 py-2 text-sm rounded-md transition-colors",
          isProjectActive(project.id, "keywords")
            ? "bg-blue-100 text-blue-700"
            : "text-gray-600 hover:bg-gray-100"
        )}
      >
        - Keywords
      </Link>
      <Link
        href={`/projects/${project.id}/subreddits`}
        className={cn(
          "block w-full text-left px-3 py-2 text-sm rounded-md transition-colors",
          isProjectActive(project.id, "subreddits")
            ? "bg-blue-100 text-blue-700"
            : "text-gray-600 hover:bg-gray-100"
        )}
      >
        - Subreddits
      </Link>
      <Link
        href={`/projects/${project.id}/settings`}
        className={cn(
          "block w-full text-left px-3 py-2 text-sm rounded-md transition-colors",
          isProjectActive(project.id, "settings")
            ? "bg-blue-100 text-blue-700"
            : "text-gray-600 hover:bg-gray-100"
        )}
      >
        - Settings
      </Link>
    </div>
  );

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Header Section with Logo Space */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">PM</span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">ProjectTool</h2>
            <p className="text-xs text-gray-500">Management Suite</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-2">
        {/* Projects Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Link
              href="/projects"
              className={cn(
                "flex items-center px-3 py-2 text-sm rounded-md transition-colors flex-1",
                isActive("/projects")
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:bg-gray-100"
              )}
              onClick={() => setProjectsExpanded(!projectsExpanded)}
            >
              {projectsExpanded ? (
                <ChevronDown className="mr-2 h-4 w-4" />
              ) : (
                <ChevronRight className="mr-2 h-4 w-4" />
              )}
              <FolderOpen className="mr-2 h-4 w-4" />
              Projects ({projects.length})
            </Link>
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
            <div className="ml-6 space-y-1">
              {isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                  <span className="ml-2 text-sm text-gray-500">Loading...</span>
                </div>
              ) : projects.length > 0 ? (
                projects.map((project) => (
                  <div key={project.id} className="space-y-1">
                    <div className="flex items-center group">
                      <button
                        onClick={() => {
                          setExpandedProject(
                            expandedProject === project.id ? null : project.id
                          );
                        }}
                        className="flex items-center flex-1 px-3 py-2 text-sm rounded-md hover:bg-gray-100 transition-colors"
                        title={`Expand ${project.name}`}
                      >
                        {expandedProject === project.id ? (
                          <ChevronDown className="mr-2 h-4 w-4" />
                        ) : (
                          <ChevronRight className="mr-2 h-4 w-4" />
                        )}
                        <span className="truncate" title={project.name}>
                          {project.name}
                        </span>
                      </button>
                    </div>

                    {expandedProject === project.id && (
                      <ProjectSubsections project={project} />
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500 mb-2">No projects yet</p>
                  <Button
                    onClick={() => router.push("/projects/create")}
                    size="sm"
                    variant="outline"
                    className="text-xs"
                  >
                    Create First Project
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Always Visible Sections at Bottom */}
        <div className="space-y-2 pt-4 border-t border-gray-200 mt-auto">
          <Link
            href="/knowledgebase"
            className={cn(
              "w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors",
              isActive("/knowledgebase")
                ? "bg-blue-100 text-blue-700"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            <Book className="mr-2 h-4 w-4" />
            Knowledge Base
          </Link>
          <Link
            href="/accounts"
            className={cn(
              "w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors",
              isActive("/accounts")
                ? "bg-blue-100 text-blue-700"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            <Users className="mr-2 h-4 w-4" />
            Accounts
          </Link>
        </div>
      </div>
    </div>
  );
}
