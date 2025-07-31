"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
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
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Plus, Trash2, Calendar, Loader2, User, BookOpenCheck } from "lucide-react";
import { toast } from "sonner";
import {
  apiService,
  KnowledgeBaseEntry,
  UpdateKnowledgeBaseData,
} from "@/lib/api";
import { cn } from "@/lib/utils";

export default function KnowledgeBase() {
  const [entries, setEntries] = useState<KnowledgeBaseEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteEntryId, setDeleteEntryId] = useState<number | null>(null);
  const [expandedEntries, setExpandedEntries] = useState<Set<number>>(new Set());
  const [entryToEdit, setEntryToEdit] = useState<KnowledgeBaseEntry | null>(null);
  const [editFormData, setEditFormData] = useState({ id: 0, title: "", content: "" });
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const fetchEntries = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiService.getKnowledgeBase();
      if (response.success && Array.isArray(response.data)) {
        setEntries(response.data);
      } else {
        setEntries([]);
        if(response.data?.length === 0) return;
        toast.error(response.message || "Failed to fetch entries");
      }
    } catch (error: any) {
      setEntries([]);
      toast.error(error.message || "Failed to fetch entries");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  useEffect(() => {
    if (entryToEdit) {
      setEditFormData({
        id: entryToEdit.id,
        title: entryToEdit.title || "",
        content: entryToEdit.content,
      });
    }
  }, [entryToEdit]);

  const handleUpdateEntry = async () => {
    if (!entryToEdit || !editFormData.content.trim()) {
      toast.error("Content cannot be empty.");
      return;
    }
    setIsSaving(true);
    try {
      const updateData: UpdateKnowledgeBaseData = {
        kb_id: entryToEdit.id,
        title: editFormData.title,
        content: editFormData.content,
      };
      const response = await apiService.updateKnowledgeBase(updateData);
      if (response.success) {
        toast.success("Entry updated successfully!");
        setEntryToEdit(null);
        fetchEntries();
      } else {
        toast.error(response.message || "Failed to update entry.");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update entry.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteEntry = async (entryId: number) => {
    setIsDeleting(true);
    try {
      const response = await apiService.deleteKnowledgeBase({ kb_id: entryId });
      if (response.success) {
        toast.success("Entry deleted successfully");
        fetchEntries();
      } else {
        toast.error(response.message || "Failed to delete entry");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to delete entry");
    } finally {
      setIsDeleting(false);
      setDeleteEntryId(null);
    }
  };

  const toggleExpanded = (entryId: number) => {
    setExpandedEntries((prev) => {
      const newSet = new Set(prev);
      newSet.has(entryId) ? newSet.delete(entryId) : newSet.add(entryId);
      return newSet;
    });
  };

  if (isLoading) {
    return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin"/></div>;
  }
  
  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-slate-50/50 min-h-full">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Knowledge Base</h1>
            <p className="mt-1 text-gray-600">This defines your AI assistant's speaking and comment generation style.</p>
          </div>
          <Button onClick={() => router.push('/knowledgebase/create')} className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="mr-2 h-4 w-4" />
            Add New Entry
          </Button>
        </div>

        {entries.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed rounded-lg">
                <BookOpenCheck className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Your Knowledge Base is Empty</h3>
                <p className="text-gray-600 mb-4">Add your first entry to start training the AI.</p>
                <Button onClick={() => router.push('/knowledgebase/create')} className="bg-indigo-600 hover:bg-indigo-700">
                    <Plus className="mr-2 h-4 w-4" />Add First Entry
                </Button>
            </div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => (
              <Card key={entry.id} className="shadow-sm">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg font-medium">{entry.title || `Entry #${entry.id}`}</CardTitle>
                    <div className="flex items-center space-x-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.push(`/knowledgebase/edit/${entry.id}`)}><User className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeleteEntryId(entry.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className={cn("text-sm text-gray-600", !expandedEntries.has(entry.id) && "line-clamp-2")}>
                    {entry.content}
                  </p>
                  <Button variant="link" size="sm" onClick={() => toggleExpanded(entry.id)} className="p-0 h-auto text-indigo-600 mt-2">
                    {expandedEntries.has(entry.id) ? "Show Less" : "Show More..."}
                  </Button>
                </CardContent>
                <CardFooter className="text-xs text-gray-500 pt-3 mt-3 border-t">
                    <div className="flex items-center"><Calendar className="mr-2 h-3 w-3" />Created on {new Date(entry.created_on).toLocaleDateString()}</div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      <AlertDialog open={!!deleteEntryId} onOpenChange={() => setDeleteEntryId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteEntryId && handleDeleteEntry(deleteEntryId)} disabled={isDeleting} className="bg-red-600 hover:bg-red-700">
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}