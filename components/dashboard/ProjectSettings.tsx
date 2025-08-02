"use client";

import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, ArrowLeft } from "lucide-react";
import {
  apiService,
  ProjectSettings as ProjectSettingsType,
  Project,
} from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ProjectSettingsProps {
  project: Project | null;
}

const defaultProject: Project = {
  id: "preview-id",
  name: "FameWall (Preview)",
  link: "https://example.com",
  total_subreddits: 5,
  total_mentions: 42,
  created_at: new Date().toISOString(),
};

const dummySettings: ProjectSettingsType = {
  name: "FameWall (Preview)",
  prod_url: "https://example.com/my-awesome-product",
  prod_info: {
    problem:
      "Users need a simple and effective way to track online brand mentions without dealing with complex and expensive enterprise tools.",
    audience:
      "Designed for indie hackers, startups, and small marketing teams who need to stay on top of their online presence.",
    solution:
      "Our tool provides a clean, intuitive dashboard to monitor keywords and subreddits for relevant conversations, with AI-powered comment generation to save time.",
  },
};

export default function ProjectSettings({
  project: projectProp,
}: ProjectSettingsProps) {
  const project = projectProp || defaultProject;
  const router = useRouter();

  // React Query for fetching project settings
  const {
    data: formData,
    isLoading,
    error,
    refetch,
  } = useQuery<ProjectSettingsType>({
    queryKey: ["projectSettings", project.id],
    queryFn: async (): Promise<ProjectSettingsType> => {
      // If it's a preview/dummy project, return dummy data
      if (!projectProp?.id) {
        return dummySettings;
      }

      const response = await apiService.getProjectSettings(projectProp.id);

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || "Failed to fetch project settings");
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
  });

  // Handle loading state
  if (isLoading) {
    return (
      <div className="p-6 max-w-3xl mx-auto text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-600">Loading project settings...</p>
      </div>
    );
  }

  // Handle error state
  if (error) {
    // Show toast error when error occurs
    if (error instanceof Error) {
      toast.error(error.message || "Failed to fetch project settings");
    }

    return (
      <div className="p-6 max-w-3xl mx-auto text-center">
        <div className="text-red-600 mb-4">
          <p className="font-semibold">Error loading project settings</p>
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

  // Handle case where no data is available
  if (!formData) {
    return (
      <div className="p-6 max-w-3xl mx-auto text-center">
        <p className="text-gray-600 mb-4">No project settings found</p>
        <Button onClick={() => refetch()} variant="outline">
          Reload
        </Button>
      </div>
    );
  }

  // At this point, formData is guaranteed to be of type ProjectSettingsType

  return (
    <div className="p-6 w-full bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4">
          <Button
            variant="ghost"
            onClick={() => router.push(`/projects/${project?.id || ""}`)}
            className="flex items-center p-0 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        <Card className="max-w-4xl mx-auto shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-2xl">{project.name} Settings</CardTitle>
            <CardDescription>
              This information is used by the AI to generate relevant comments.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 border-t pt-6">
                <div className="md:col-span-1">
                  <h3 className="font-semibold text-gray-900">Project Name</h3>
                </div>
                <div className="md:col-span-3">
                  <p className="text-gray-800">{formData.name}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 border-t pt-6">
                <div className="md:col-span-1">
                  <h3 className="font-semibold text-gray-900">Product URL</h3>
                </div>
                <div className="md:col-span-3">
                  <a
                    href={formData.prod_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline break-all"
                  >
                    {formData.prod_url}
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 border-t pt-6">
                <div className="md:col-span-1">
                  <h3 className="font-semibold text-gray-900">Problem</h3>
                </div>
                <div className="md:col-span-3">
                  <p className="text-gray-800 whitespace-pre-wrap">
                    {formData.prod_info.problem}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 border-t pt-6">
                <div className="md:col-span-1">
                  <h3 className="font-semibold text-gray-900">Audience</h3>
                </div>
                <div className="md:col-span-3">
                  <p className="text-gray-800 whitespace-pre-wrap">
                    {formData.prod_info.audience}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 border-t pt-6">
                <div className="md:col-span-1">
                  <h3 className="font-semibold text-gray-900">Solution</h3>
                </div>
                <div className="md:col-span-3">
                  <p className="text-gray-800 whitespace-pre-wrap">
                    {formData.prod_info.solution}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
