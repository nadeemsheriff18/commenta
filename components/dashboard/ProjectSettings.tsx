"use client";

import { useState, useEffect, useCallback } from "react";
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

// --- MODIFIED: dummySettings now matches the nested ProjectSettingsType ---
const dummySettings: ProjectSettingsType = {
    name: "FameWall (Preview)",
    prod_url: "https://example.com/my-awesome-product",
    prod_info: {
        problem: "Users need a simple and effective way to track online brand mentions without dealing with complex and expensive enterprise tools.",
        audience: "Designed for indie hackers, startups, and small marketing teams who need to stay on top of their online presence.",
        solution: "Our tool provides a clean, intuitive dashboard to monitor keywords and subreddits for relevant conversations, with AI-powered comment generation to save time."
    }
};

export default function ProjectSettings({ project: projectProp }: ProjectSettingsProps) {
  const project = projectProp || defaultProject;
  const router = useRouter();

  // --- MODIFIED: Initial state now matches the nested ProjectSettingsType ---
  const [formData, setFormData] = useState<ProjectSettingsType>({
    name: "",
    prod_url: "",
    prod_info: {
      problem: "",
      audience: "",
      solution: "",
    },
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchProjectSettings = useCallback(async () => {
    if (!projectProp?.id) {
      setFormData(dummySettings);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiService.getProjectSettings(projectProp.id);

      // --- MODIFIED: No need to flatten the data ---
      if (response.success && response.data) {
        setFormData(response.data);
      } else {
        toast.error(response.message || "Failed to fetch project settings");
      }
    } catch (error) {
      toast.error("Failed to fetch project settings");
    } finally {
      setIsLoading(false);
    }
  }, [projectProp?.id]);

  useEffect(() => {
    fetchProjectSettings();
  }, [fetchProjectSettings]);

  if (isLoading) {
    return (
      <div className="p-6 max-w-3xl mx-auto text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-600">Loading project settings...</p>
      </div>
    );
  }

  return (
    <div className="p-6 w-full bg-off-white">
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
                  <a href={formData.prod_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                    {formData.prod_url}
                  </a>
                </div>
              </div>
              
              {/* --- MODIFIED: Accessing nested prod_info properties --- */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 border-t pt-6">
                <div className="md:col-span-1">
                  <h3 className="font-semibold text-gray-900">Problem</h3>
                </div>
                <div className="md:col-span-3">
                  <p className="text-gray-800 whitespace-pre-wrap">{formData.prod_info.problem}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 border-t pt-6">
                <div className="md:col-span-1">
                  <h3 className="font-semibold text-gray-900">Audience</h3>
                </div>
                <div className="md:col-span-3">
                  <p className="text-gray-800 whitespace-pre-wrap">{formData.prod_info.audience}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 border-t pt-6">
                <div className="md:col-span-1">
                  <h3 className="font-semibold text-gray-900">Solution</h3>
                </div>
                <div className="md:col-span-3">
                  <p className="text-gray-800 whitespace-pre-wrap">{formData.prod_info.solution}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}