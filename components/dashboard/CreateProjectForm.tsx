"use client";

import { useState, useEffect, useCallback } from "react";
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
import { Loader2, ArrowLeft, MessageSquare } from "lucide-react";
import { apiService, CreateProjectData } from "@/lib/api";
import { toast } from "sonner";

interface CreateProjectFormProps {
  onCreateProject: () => void;
  onBack?: () => void;
}

// --- MODIFIED: Create a local type for the form's flat state ---
interface FormState {
  name: string;
  product_link: string;
  audience: string;
  problem: string;
  solution: string;
}

export default function CreateProjectForm({
  onCreateProject,
  onBack,
}: CreateProjectFormProps) {
  // --- MODIFIED: Use the local FormState for the formData ---
  const [formData, setFormData] = useState<FormState>({
    name: "",
    product_link: "",
    audience: "",
    problem: "",
    solution: "",
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<FormState>>({});

  const handleGenerateExplain = async () => {
    if (!formData.product_link) {
      toast.error("Please enter a product URL first.");
      setErrors((prev) => ({ ...prev, product_link: "Product link is required to auto-generate." }));
      return;
    }

    setIsGenerating(true);
    try {
      const response = await apiService.generateExplain(formData.product_link);
      if (response.success && response.data) {
        setFormData((prev) => ({
          ...prev,
          audience: response.data.audience || "",
          solution: response.data.solution || "",
          problem: response.data.problem || "",
        }));
        toast.success("Project details generated successfully!");
      } else {
        toast.error(response.message || "Failed to auto-generate details.");
      }
    } catch (error) {
      toast.error("Failed to auto-generate details.");
    } finally {
      setIsGenerating(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormState> = {};
    if (!formData.name.trim()) newErrors.name = "Project name is required";
    if (!formData.product_link.trim()) newErrors.product_link = "Product link is required";
    if (!formData.audience.trim()) newErrors.audience = "Audience description is required";
    if (!formData.problem.trim()) newErrors.problem = "Problem description is required";
    if (!formData.solution.trim()) newErrors.solution = "Solution description is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setIsSubmitting(true);
    try {
      // --- MODIFIED: Construct the nested payload for the API ---
      const createPayload: CreateProjectData = {
        name: formData.name,
        product_link: formData.product_link,
        product_explanation: {
          audience: formData.audience,
          problem: formData.problem,
          solution: formData.solution,
        },
      };
      const response = await apiService.createProject(createPayload);
      if (response.success) {
        toast.success("Project created successfully!");
        onCreateProject();
      } else {
        toast.error(response.message || "Failed to create project");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create project");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof FormState, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-slate-50/50 min-h-full">
        <div className="max-w-3xl mx-auto">
            {onBack && (
                <div className="mb-4">
                <Button variant="ghost" onClick={onBack} className="flex items-center text-sm text-gray-600 -ml-4">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Projects
                </Button>
                </div>
            )}

            <Card className="shadow-lg">
                <CardHeader>
                <CardTitle className="text-2xl">Create New Project</CardTitle>
                <CardDescription>
                    Fill in the details below. This information helps the AI understand your project.
                </CardDescription>
                </CardHeader>
                <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="product_link">Product Link *</Label>
                        <Input
                            id="product_link" type="url" placeholder="https://yourproduct.com"
                            value={formData.product_link}
                            onChange={(e) => handleInputChange("product_link", e.target.value)}
                            disabled={isSubmitting}
                            className={errors.product_link ? "border-red-500" : ""}
                        />
                        {errors.product_link && <p className="text-sm text-red-600">{errors.product_link}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="name">Project Name *</Label>
                        <Input
                            id="name" type="text" placeholder="Enter your project name"
                            value={formData.name}
                            onChange={(e) => handleInputChange("name", e.target.value)}
                            disabled={isSubmitting}
                            className={errors.name ? "border-red-500" : ""}
                        />
                        {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                    </div>
                    
                    <div className="pt-4 border-t">
                        <Button type="button" onClick={handleGenerateExplain} disabled={isGenerating || !formData.product_link} className="bg-indigo-600 hover:bg-indigo-700">
                            {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <MessageSquare className="mr-2 h-4 w-4" />}
                            Auto-generate descriptions
                        </Button>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="problem">Problem *</Label>
                        <Textarea
                            id="problem" rows={4} placeholder="What problem does your product solve?"
                            value={formData.problem}
                            onChange={(e) => handleInputChange("problem", e.target.value)}
                            disabled={isSubmitting}
                            className={errors.problem ? "border-red-500" : ""}
                        />
                         {errors.problem && <p className="text-sm text-red-600">{errors.problem}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="audience">Audience *</Label>
                        <Textarea
                            id="audience" placeholder="Who is your target audience?"
                            value={formData.audience}
                            onChange={(e) => handleInputChange("audience", e.target.value)}
                            disabled={isSubmitting}
                            rows={4}
                            className={errors.audience ? "border-red-500" : ""}
                        />
                        {errors.audience && <p className="text-sm text-red-600">{errors.audience}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="solution">Solution *</Label>
                        <Textarea
                            id="solution" placeholder="How does your product solve the problem?"
                            value={formData.solution}
                            onChange={(e) => handleInputChange("solution", e.target.value)}
                            disabled={isSubmitting}
                            rows={4}
                            className={errors.solution ? "border-red-500" : ""}
                        />
                        {errors.solution && <p className="text-sm text-red-600">{errors.solution}</p>}
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button type="submit" className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Project...</>
                            ) : ( "Create Project" )}
                        </Button>
                    </div>
                </form>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}