"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import ProjectSettings from "@/components/dashboard/ProjectSettings";
import { apiService, Project } from "@/lib/api";

// Required for static export
// export async function generateStaticParams() {
//   // Return empty array for static export - pages will be generated on demand
//   return [];
// }

export default function ProjectSettingsPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) return;

      try {
        const response = await apiService.getProjects();
        if (response.success && response.data) {
          const foundProject = response.data.data.find(
            (p: Project) => p.id === projectId
          );
          setProject(foundProject || null);
        }
      } catch (error) {
        console.error("Failed to fetch project:", error);
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
          <div className="p-6 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
