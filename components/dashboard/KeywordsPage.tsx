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
  AlertDialogTrigger,
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
  const [deleteKeywords, setDeleteKeywords] = useState<string[]>([]);
  const [newKeywords, setNewKeywords] = useState("");

  const fetchKeywords = useCallback(async () => {
    if (!project?.id) {
      setIsLoading(false);
      setKeywords([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiService.getKeywords(project.id);
      // Your backend returns { "keyword": [...] }
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

  const handleAddKeywords = async () => {
    if (!project?.id || !newKeywords.trim()) {
      toast.error("Please enter keywords to add");
      return;
    }

    const keywordList = newKeywords
      .split(",")
      .map((keyword) => keyword.trim())
      .filter(Boolean);

    if (keywordList.length === 0) {
      toast.error("Please enter valid keywords");
      return;
    }

    try {
      const addData: AddKeywordsData = {
        proj_id: project.id,
        keywords: keywordList,
      };
      const response = await apiService.addKeywords(addData);
      if (response.success) {
        toast.success(`Added ${keywordList.length} keyword(s) successfully`);
        setNewKeywords("");
        setIsAddDialogOpen(false);
        fetchKeywords(); // Refresh keywords list
      } else {
        toast.error(response.message || "Failed to add keywords");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to add keywords");
    }
  };

  const handleDeleteKeywords = async () => {
    if (!project?.id || deleteKeywords.length === 0) return;

    setIsDeleting(true);
    try {
      const deleteData: DeleteKeywordsData = {
        proj_id: project.id,
        del_keywords: deleteKeywords,
      };
      const response = await apiService.deleteKeywords(deleteData);
      if (response.success) {
        toast.success(`Deleted ${deleteKeywords.length} keyword(s) successfully`);
        setDeleteKeywords([]);
        fetchKeywords(); // Refresh keywords list
      } else {
        toast.error(response.message || "Failed to delete keywords");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to delete keywords");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteSelect = (keyword: string, checked: boolean) => {
    if (checked) {
      setDeleteKeywords((prev) => [...prev, keyword]);
    } else {
      setDeleteKeywords((prev) => prev.filter((k) => k !== keyword));
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
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Keywords</h1>
          <p className="text-gray-600 mt-1">Manage keywords for {project.name}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center"><Plus className="mr-2 h-4 w-4" />Add Keywords</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Keywords</DialogTitle>
                <DialogDescription>Separate multiple keywords with commas.</DialogDescription>
              </DialogHeader>
              <div className="space-y-2 py-4">
                <Label htmlFor="keywords">Keywords</Label>
                <Input id="keywords" placeholder="keyword1, keyword2, keyword3" value={newKeywords} onChange={(e) => setNewKeywords(e.target.value)} />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddKeywords} disabled={!newKeywords.trim()}>Add Keywords</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          {keywords.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="flex items-center"><Trash className="mr-2 h-4 w-4" />Delete</Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-w-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Keywords</AlertDialogTitle>
                  <AlertDialogDescription>Select keywords to delete. This action cannot be undone.</AlertDialogDescription>
                </AlertDialogHeader>
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {keywords.map((keyword) => (
                    <div key={keyword} className="flex items-center space-x-3 p-2 border rounded">
                      <Checkbox id={`del-${keyword}`} checked={deleteKeywords.includes(keyword)} onCheckedChange={(checked) => handleDeleteSelect(keyword, checked as boolean)} />
                      <Label htmlFor={`del-${keyword}`} className="font-medium flex-1 cursor-pointer">{keyword}</Label>
                    </div>
                  ))}
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteKeywords} disabled={isDeleting || deleteKeywords.length === 0} className="bg-red-600 hover:bg-red-700">
                    {isDeleting ? (<Loader2 className="mr-2 h-4 w-4 animate-spin" />) : (`Delete ${deleteKeywords.length} Keyword(s)`)}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>All Keywords ({keywords.length})</CardTitle>
          <CardDescription>Track and manage your keyword performance</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8"><Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" /></div>
          ) : keywords.length === 0 ? (
            <div className="text-center py-8">
              <Hash className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No keywords yet</h3>
              <p className="text-gray-600 mb-4">Add keywords to start tracking mentions for your project.</p>
              <Button onClick={() => setIsAddDialogOpen(true)}><Plus className="mr-2 h-4 w-4" />Add Your First Keywords</Button>
            </div>
          ) : (
            <div className="space-y-3">
              {keywords.map((keyword, index) => (
                <Card key={keyword} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600">
                        {index + 1}
                      </div>
                      <h3 className="font-semibold text-gray-900">{keyword}</h3>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}