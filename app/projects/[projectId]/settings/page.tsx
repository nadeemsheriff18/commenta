"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import ProjectSettings from "@/components/dashboard/ProjectSettings";
import { apiService, Project } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function ProjectSettingsPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const response = await apiService.getProjects();
        const projectList = response.data?.projects || response.data;
        if (response.success && Array.isArray(projectList)) {
          const foundProject = projectList.find(
            (p: Project) => p.id.toString() === projectId
          );
          if (foundProject) {
            setProject(foundProject);
          } else {
            setProject(null);
            toast.error(`Project with ID ${projectId} not found.`);
          }
        } else {
          setProject(null);
          toast.error(response.message || "Failed to fetch project list.");
        }
      } catch (error) {
        setProject(null);
        toast.error("An error occurred while fetching the project.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProject();
  }, [projectId]);

  if (isLoading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="flex h-full w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <ProjectSettings project={project} />
      </Layout>
    </ProtectedRoute>
  );
}