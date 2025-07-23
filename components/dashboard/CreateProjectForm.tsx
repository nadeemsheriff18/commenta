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
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, AlertCircle, MessageSquare } from "lucide-react";
import { apiService, CreateProjectData } from "@/lib/api";
import { toast } from "sonner";
const loadingMessages = [
  "Auto generating for you...",
  "Adding the recipes...",
  "Finalizing...",
];
interface CreateProjectFormProps {
  onCreateProject: () => void;
  onBack?: () => void;
}

export default function CreateProjectForm({
  onCreateProject,
  onBack,
}: CreateProjectFormProps) {
  const handleGenerateExplain = async (link: string, tag: string) => {
    // setGeneratingComments((prev) => new Set(prev).add(mentionId));
    console.log("lnk:", link);
    if (!link) {
      const newErrors: Partial<CreateProjectData> = {};
      toast.success("Need the url to generate");
      newErrors.product_link = "Product link is required";
      setErrors(newErrors);
      return;
    }
    try {
      startLoading("gen");
      const requestParams = link;
      const response = await apiService.generateExplain(requestParams);
      console.log("Explain response:", response);
      console.log("Explain response---:", response.data);
      console.log("------- EXPLAIN response:", response.data!.audience);
      stopLoading("gen");
      const audiance = response.data!.audience;
      const solution = response.data!.solution;
      const problem = response.data!.problem;
      if (response.success && response.data) {
        setFormData((prev) => ({
          ...prev,
          audiance,
          solution,
          problem,
        }));
        toast.success("Comment generated successfully!");
      } else {
        toast.error(response.message || "Failed to generate comment");
      }
    } catch (error) {
      toast.error("Failed to generate comment");
    } finally {
      // setGeneratingComments((prev) => {
      //   const newSet = new Set(prev);
      //   newSet.delete(mentionId);
      //   return newSet;
      // });
    }
  };
  const [formData, setFormData] = useState<CreateProjectData>({
    name: "",
    product_link: "",
    audiance: "",
    problem: "",
    solution: "",
    // person_story: "",
  });
  const [wordCounts, setWordCounts] = useState({
    problem: 0,
    audiance: 0,
    solution: 0,
  });
  const startLoading = (tag: string) => {
    setLoadingStates((prev) => ({ ...prev, [tag]: true }));
  };

  // Stop loading for a specific tag
  const stopLoading = (tag: string) => {
    setLoadingStates((prev) => ({ ...prev, [tag]: false }));
  };
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    {}
  );
  const isAnyLoading = Object.values(loadingStates).some((state) => state);
  const [messageIndex, setMessageIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<CreateProjectData>>({});
  useEffect(() => {
    if (!isAnyLoading) return;

    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 1500);

    return () => clearInterval(interval);
  }, [isAnyLoading]);
  const MAX_WORDS = 400;
  const validateForm = (): boolean => {
    const newErrors: Partial<CreateProjectData> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Project name is required";
    }

    if (!formData.product_link.trim()) {
      newErrors.product_link = "Product link is required";
    } else {
      try {
        new URL(formData.product_link);
      } catch {
        newErrors.product_link = "Please enter a valid URL";
      }
    }

    if (!formData.audiance.trim()) {
      newErrors.audiance = "Audiance is required";
    }

    if (!formData.name.trim()) {
      newErrors.name = "Product name is required";
    }

    if (!formData.problem.trim()) {
      newErrors.problem = "Problem is required";
    }

    if (!formData.solution.trim()) {
      newErrors.solution = "Solution is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("FORMDATA :: ", formData);
      const createForm = {
        name: formData.name,
        product_link: formData.product_link,
        product_explanation: {
          audience: formData.audiance,
          problem: formData.problem,
          solution: formData.solution,
        },
      };
      const response = await apiService.createProject(createForm);
      console.log("projectid ", response.data);
      if (response.success) {
        toast.success("Project created successfully");
        // Clear the API cache to ensure fresh data
        apiService.clearCache();
        // Router.replace("/projects/");
        // onCreateProject(); // This should redirect to project list
      } else {
        // Handle specific error messages from backend
        if (response.message?.includes("Subreddit limit reached")) {
          toast.error("Subreddit limit reached");
        } else if (
          response.message?.includes("Failed to generate subreddits") ||
          response.message?.includes("Failed to generate keywords")
        ) {
          toast.error("Failed to generate subreddits/keywords");
        } else {
          toast.error(response.message || "Failed to create project");
        }
      }
    } catch (error) {
      toast.error("Failed to create project. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof CreateProjectData, value: string) => {
    const wordsArr = value.trim().split(/\s+/);
    const wordCount = value.trim() === "" ? 0 : wordsArr.length;
    if (field === "product_link") {
      try {
        const urlObj = new URL(value);
        const hostname = urlObj.hostname.replace("www.", "");
        const projectName = hostname.split(".")[0];

        setFormData((prev) => ({
          ...prev,
          product_link: value,
          name: prev.name || projectName, // auto-fill only if name is empty
        }));
      } catch {
        setFormData((prev) => ({ ...prev, product_link: value }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }

    if (wordCount <= MAX_WORDS) {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (["problem", "audiance", "solution"].includes(field)) {
        setWordCounts((prev) => ({ ...prev, [field]: wordCount }));
      }
    } else {
      toast.error(`Maximum ${MAX_WORDS} words allowed in ${field}`);
    }

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {onBack && (
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={onBack}
            className="flex items-center"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Button>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Create New Project</CardTitle>
          <CardDescription>
            Fill in the details below to create your new project
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="product_link">Product Link *</Label>
              <Input
                id="product_link"
                type="url"
                placeholder="https://yourproduct.com"
                value={formData.product_link}
                onChange={(e) =>
                  handleInputChange("product_link", e.target.value)
                }
                disabled={isSubmitting}
                className={errors.product_link ? "border-red-500" : ""}
              />
              {errors.product_link && (
                <p className="text-sm text-red-600">{errors.product_link}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Project Name *</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your project name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                disabled={isSubmitting}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name}</p>
              )}
            </div>
            <div>
              <Button
                type="button"
                onClick={() =>
                  handleGenerateExplain(formData.product_link, "gen")
                }
                disabled={loadingStates["gen"]}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Auto Generate
              </Button>
              {loadingStates["gen"] && (
                <p className="text-sm text-muted-foreground mt-2">
                  {loadingMessages[messageIndex]}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="person_problem">Problem *</Label>
              <Textarea
                id="person_problem"
                rows={4}
                placeholder="Describe your product problem"
                value={formData.problem}
                onChange={(e) => handleInputChange("problem", e.target.value)}
                disabled={isSubmitting}
                className={errors.problem ? "border-red-500" : ""}
              />
              <div className="flex items-center space-x-2">
                <span
                  className={`text-sm ${
                    wordCounts.problem > MAX_WORDS * 0.9
                      ? "text-red-600"
                      : "text-gray-500"
                  }`}
                >
                  {wordCounts.problem}/{MAX_WORDS} words
                </span>
                {wordCounts.problem > MAX_WORDS * 0.9 && (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
              </div>

              {wordCounts.problem === MAX_WORDS && (
                <Badge variant="destructive" className="text-xs">
                  Character limit reached
                </Badge>
              )}
              {errors.problem && (
                <p className="text-sm text-red-600">{errors.problem}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="product_audiance">Audiance *</Label>
              <Textarea
                id="product_audiance"
                placeholder="Describe your product audiance"
                value={formData.audiance}
                onChange={(e) => handleInputChange("audiance", e.target.value)}
                disabled={isSubmitting}
                rows={4}
                className={errors.audiance ? "border-red-500" : ""}
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span
                    className={`text-sm ${
                      wordCounts.audiance > MAX_WORDS * 0.9
                        ? "text-red-600"
                        : "text-gray-500"
                    }`}
                  >
                    {wordCounts.audiance}/{MAX_WORDS} words
                  </span>
                  {wordCounts.audiance > MAX_WORDS * 0.9 && (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>

                {wordCounts.audiance === MAX_WORDS && (
                  <Badge variant="destructive" className="text-xs">
                    Character limit reached
                  </Badge>
                )}
              </div>
              {errors.audiance && (
                <p className="text-sm text-red-600">{errors.audiance}</p>
              )}
            </div>

            {/* <div className="space-y-2">
              <Label htmlFor="person_name">Person Name *</Label>
              <Input
                id="person_name"
                type="text"
                placeholder="Enter your name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                disabled={isSubmitting}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name}</p>
              )}
            </div> */}

            <div className="space-y-2">
              <Label htmlFor="person_solution">Solution *</Label>
              <Textarea
                id="person_solution"
                placeholder="Describe your product solution"
                value={formData.solution}
                onChange={(e) => handleInputChange("solution", e.target.value)}
                disabled={isSubmitting}
                rows={4}
                className={errors.solution ? "border-red-500" : ""}
              />
              <div className="flex items-center space-x-2">
                <span
                  className={`text-sm ${
                    wordCounts.solution > MAX_WORDS * 0.9
                      ? "text-red-600"
                      : "text-gray-500"
                  }`}
                >
                  {wordCounts.solution}/{MAX_WORDS} words
                </span>
                {wordCounts.solution > MAX_WORDS * 0.9 && (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
              </div>

              {wordCounts.solution === MAX_WORDS && (
                <Badge variant="destructive" className="text-xs">
                  Character limit reached
                </Badge>
              )}
              {errors.solution && (
                <p className="text-sm text-red-600">{errors.solution}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Project...
                </>
              ) : (
                "Create Project"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
