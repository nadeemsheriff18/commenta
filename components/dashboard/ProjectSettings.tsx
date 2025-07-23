"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, ArrowLeft, Save } from "lucide-react";
import {
  apiService,
  ProjectSettings as ProjectSettingsType,
  Project,
} from "@/lib/api";
import { toast } from "sonner";
// import router from "next/router";
import Link from "next/link";
import { useRouter } from "next/navigation";
interface ProjectSettingsProps {
  project: Project | null;
  // onBack?: () => void;
}

export default function ProjectSettings({
  project,
}: // onBack,
ProjectSettingsProps) {
  const router = useRouter();
  const handleback = () => {
    console.log("🔙 Navigating back to projects list");
    // <Link href={`/projects/${projectId}/`}></Link>;
    router.push(`/projects/${project?.id || ""}`);
  };
  const [formData, setFormData] = useState<ProjectSettingsType>({
    name: "",
    // prod_exp: "",
    prod_url: "",
    solution: "",
    audiance: "",
    problem: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<ProjectSettingsType>>({});
  const [projectId, setProjectId] = useState<string | null>(null);
  // Fetch project settings on component mount
  useEffect(() => {
    if (project?.id) {
      fetchProjectSettings();
    }
  }, [project?.id]);

  useEffect(() => {
    // Remove auto-refresh for project settings
  }, [project?.id]);
  const fetchProjectSettings = async () => {
    if (!project?.id) return;

    setIsLoading(true);
    try {
      const response = await apiService.getProjectSettings(project.id);
      console.log("Fetched project settings response:", response.data.data);
      setProjectId(project.id);
      if (response.success && response.data) {
        setFormData(response.data.data);
      } else {
        if (
          response.message?.includes("not found") ||
          response.message?.includes("unauthorized")
        ) {
          toast.error("Project not found or you are not authorized to view it");
          // onBack();
        } else {
          toast.error(response.message || "Failed to fetch project settings");
        }
      }
    } catch (error) {
      toast.error("Failed to fetch project settings");
      // onBack();
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ProjectSettingsType> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Project name is required";
    }

    if (!formData.prod_url.trim()) {
      newErrors.prod_url = "Product URL is required";
    } else {
      try {
        new URL(formData.prod_url);
      } catch {
        newErrors.prod_url = "Please enter a valid URL";
      }
    }

    if (!formData.solution.trim()) {
      newErrors.audiance = "Product explanation is required";
    }

    if (!formData.problem.trim()) {
      newErrors.problem = "Person name is required";
    }

    if (!formData.audiance.trim()) {
      newErrors.solution = "Person role is required";
    }

    // if (!formData.pers_story.trim()) {
    //   newErrors.pers_story = "Person story is required";
    // }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();

  //   if (!project?.id) return;

  //   if (!validateForm()) {
  //     toast.error("Please fill in all required fields");
  //     return;
  //   }

  //   setIsSaving(true);

  //   try {
  //     const response = await apiService.updateProjectSettings(
  //       project.id,
  //       formData
  //     );

  //     if (response.success) {
  //       toast.success("Project settings updated successfully");
  //     } else {
  //       if (response.message?.includes("not authorized")) {
  //         toast.error("You're not authorized to update this project");
  //       } else {
  //         toast.error(response.message || "Failed to update project settings");
  //       }
  //     }
  //   } catch (error) {
  //     toast.error("Failed to update project settings");
  //   } finally {
  //     setIsSaving(false);
  //   }
  // };

  // const handleInputChange = (
  //   field: keyof ProjectSettingsType,
  //   value: string
  // ) => {
  //   setFormData((prev) => ({ ...prev, [field]: value }));
  //   // Clear error when user starts typing
  //   if (errors[field]) {
  //     setErrors((prev) => ({ ...prev, [field]: undefined }));
  //   }
  // };

  if (!project) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            No Project Selected
          </h2>
          <p className="text-gray-600">
            Select a project to view its settings.
          </p>
          <Button onClick={handleback} className="mt-4">
            Back to Projects
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={handleback}
            className="flex items-center"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        <Card>
          <CardContent className="text-center py-8">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600 mb-4" />
            <p className="text-gray-600">Loading project settings...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={handleback}
          className="flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Settings</CardTitle>
          <CardDescription>
            Update your project details and configuration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            // onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div className="space-y-2">
              <Label htmlFor="name">Project Name *</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your project name"
                value={formData.name}
                // onChange={(e) => handleInputChange("name", e.target.value)}
                disabled={isSaving}
                className={errors.name ? "border-red-500" : ""}
                readOnly
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="prod_url">Product URL *</Label>
              <Input
                id="prod_url"
                type="url"
                placeholder="https://yourproduct.com"
                value={formData.prod_url}
                // onChange={(e) => handleInputChange("prod_url", e.target.value)}
                disabled={isSaving}
                className={errors.prod_url ? "border-red-500" : ""}
                readOnly
              />
              {errors.prod_url && (
                <p className="text-sm text-red-600">{errors.prod_url}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="audiance">Product Explanation *</Label>
              <Textarea
                id="audiance"
                placeholder="Describe your product and what it does"
                value={formData.audiance}
                // onChange={(e) => handleInputChange("prod_exp", e.target.value)}
                disabled={isSaving}
                rows={4}
                className={errors.audiance ? "border-red-500" : ""}
                readOnly
              />
              {errors.audiance && (
                <p className="text-sm text-red-600">{errors.audiance}</p>
              )}
            </div>

            {/* <div className="space-y-2">
              <Label htmlFor="pers_name">Person Name *</Label>
              <Input
                id="pers_name"
                type="text"
                placeholder="Enter your name"
                value={formData.pers_name}
                // onChange={(e) => handleInputChange("pers_name", e.target.value)}
                disabled={isSaving}
                className={errors.pers_name ? "border-red-500" : ""}
                readOnly
              />
              {errors.pers_name && (
                <p className="text-sm text-red-600">{errors.pers_name}</p>
              )}
            </div> */}

            <div className="space-y-2">
              <Label htmlFor="problem">Problem *</Label>
              <Textarea
                id="problem"
                rows={4}
                placeholder="e.g., Founder, Product Manager, Developer"
                value={formData.problem}
                // onChange={(e) => handleInputChange("pers_role", e.target.value)}
                disabled={isSaving}
                className={errors.problem ? "border-red-500" : ""}
                readOnly
              />
              {errors.problem && (
                <p className="text-sm text-red-600">{errors.problem}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="solution">Solution *</Label>
              <Textarea
                id="solution"
                placeholder="Tell us about your background and experience with this project"
                value={formData.solution}
                // onChange={(e) =>
                //   handleInputChange("pers_story", e.target.value)
                // }
                disabled={isSaving}
                rows={4}
                className={errors.solution ? "border-red-500" : ""}
                readOnly
              />
              {errors.solution && (
                <p className="text-sm text-red-600">{errors.solution}</p>
              )}
            </div>
            {/* Save change button */}
            {/* <div className="flex gap-4">
              <Button type="submit" disabled={isSaving} className="flex-1">
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                disabled={isSaving}
              >
                Cancel
              </Button>
            </div> */}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
