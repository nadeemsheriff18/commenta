"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Plus,
  Trash,
  Hash,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  apiService,
  AddKeywordsData,
  DeleteKeywordsData,
  Project,
} from "@/lib/api";

interface KeywordsPageProps {
  project: Project | null;
}

export default function KeywordsPage({ project }: KeywordsPageProps) {
  const [keywords, setKeywords] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [keywordToDelete, setKeywordToDelete] = useState<string | null>(null);
  const [newKeywords, setNewKeywords] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const fetchKeywords = useCallback(async () => {
    if (!project?.id) {
      setIsLoading(false);
      setKeywords([]);
      return;
    }
    setIsLoading(true);
    try {
      const response = await apiService.getKeywords(project.id);
      if (response.success && response.data?.keyword) {
        setKeywords(response.data.keyword || []);
      } else {
        setKeywords([]);
        toast.error(response.message || "Failed to fetch keywords");
      }
    } catch (error: any) {
      setKeywords([]);
      toast.error(error.message || "Failed to fetch keywords");
    } finally {
      setIsLoading(false);
    }
  }, [project?.id]);

  useEffect(() => {
    fetchKeywords();
  }, [fetchKeywords]);

  // --- ADDED: This useEffect resets the input field when the dialog closes ---
  useEffect(() => {
    if (!isAddDialogOpen) {
      setNewKeywords("");
    }
  }, [isAddDialogOpen]);

  const handleAddKeywords = async () => {
    if (!project?.id || !newKeywords.trim()) {
      toast.error("Please enter keywords to add");
      return;
    }
    const keywordList = newKeywords.split(",").map((k) => k.trim()).filter(Boolean);
    if (keywordList.length === 0) {
      toast.error("Please enter valid keywords");
      return;
    }
    setIsAdding(true);
    try {
      const response = await apiService.addKeywords({ proj_id: project.id, keywords: keywordList });
      if (response.success) {
        toast.success(`Added ${keywordList.length} keyword(s) successfully`);
        setIsAddDialogOpen(false); // This will trigger the useEffect above to clear the state
        fetchKeywords();
      } else {
        toast.error(response.message || "Failed to add keywords");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to add keywords");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteKeyword = async () => {
    if (!project?.id || !keywordToDelete) return;
    setIsDeleting(true);
    try {
      const response = await apiService.deleteKeywords({
        proj_id: project.id,
        del_keywords: [keywordToDelete],
      });
      if (response.success) {
        toast.success(`Keyword "${keywordToDelete}" deleted successfully`);
        setKeywordToDelete(null);
        fetchKeywords();
      } else {
        toast.error(response.message || "Failed to delete keyword");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to delete keyword");
    } finally {
      setIsDeleting(false);
    }
  };
  
  if (!project) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Project Not Loaded
        </h2>
        <p className="text-gray-600">Please go back and select a project.</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-white min-h-full">
      <div className="w-full text-left">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Keywords</h1>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center bg-green-700 hover:bg-green-800"><Plus className="mr-2 h-4 w-4" />Add Keywords</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Keywords</DialogTitle>
                <DialogDescription>Separate multiple keywords with commas.</DialogDescription>
              </DialogHeader>
              <div className="space-y-2 py-4">
                <Label htmlFor="keywords">Keywords</Label>
                <Input
                  id="keywords"
                  placeholder="keyword1, keyword2, keyword3"
                  value={newKeywords}
                  onChange={(e) => setNewKeywords(e.target.value)}
                />
              </div>
              <DialogFooter className="justify-center">
                <Button onClick={handleAddKeywords} disabled={isAdding || !newKeywords.trim()} className="justify-self-center bg-green-700">
                  {isAdding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add Keywords
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">All Keywords ({keywords.length})</h2>
          {isLoading ? (
            <div className="py-8">
              <Loader2 className="h-8 w-8 animate-spin text-green-700" />
            </div>
          ) : keywords.length === 0 ? (
            <div className="py-8 border-2 border-dashed rounded-lg p-6 text-left">
              <Hash className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No keywords yet</h3>
              <p className="text-gray-600 mb-4">Add keywords to start tracking mentions for your project.</p>
              <Button onClick={() => setIsAddDialogOpen(true)} className="bg-green-700 hover:bg-green-800">
                <Plus className="mr-2 h-4 w-4" /> Add Your First Keywords
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {keywords.map((keyword) => (
                <div key={keyword} className="p-4 bg-white rounded-lg shadow-sm border-2 border-l-4 border-l-green-700">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">{keyword}</h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setKeywordToDelete(keyword)}
                    >
                      <Trash className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={!!keywordToDelete} onOpenChange={() => setKeywordToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the keyword "{keywordToDelete}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteKeyword}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}