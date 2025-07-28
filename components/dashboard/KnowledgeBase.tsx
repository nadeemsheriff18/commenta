"use client";

import { Info, Plus, Trash2, Calendar, Loader2, AlertCircle, User, ArrowLeft } from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  apiService,
  KnowledgeBaseEntry,
  AddKnowledgeBaseData,
  FounderTemplate,
} from "@/lib/api";
import { toast } from "sonner";

export default function KnowledgeBase() {
  const [entries, setEntries] = useState<KnowledgeBaseEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteEntryId, setDeleteEntryId] = useState<number | null>(null);
  const [expandedEntries, setExpandedEntries] = useState<Set<number>>(new Set());
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  // Add these lines inside your KnowledgeBase component
  const [entryToEdit, setEntryToEdit] = useState<KnowledgeBaseEntry | null>(null);
  const [editFormData, setEditFormData] = useState({ id: 0, title: "", content: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({ title: "", content: "" });
  const [founderTemplates, setFounderTemplates] = useState<FounderTemplate[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [characterCount, setCharacterCount] = useState(0);
  const MAX_CHARACTERS = 1200;

  // Add these functions inside your KnowledgeBase component

  const handleEditClick = (entry: KnowledgeBaseEntry) => {
    setEntryToEdit(entry);
  };

  // This effect populates the form when the edit modal opens
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
      const updateData = {
        kb_id: entryToEdit.id,
        title: editFormData.title,
        content: editFormData.content,
      };
      // This calls the update function in your apiService
      const response = await apiService.updateKnowledgeBase(updateData);

      if (response.success) {
        toast.success("Entry updated successfully!");
        setEntryToEdit(null); // Close the modal
        fetchEntries(); // Refresh the list of entries
      } else {
        toast.error(response.message || "Failed to update entry.");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update entry.");
    } finally {
      setIsSaving(false);
    }
  };

  const fetchFounderTemplates = useCallback(async () => {
    setIsLoadingTemplates(true);
    try {
      const response = await apiService.getFounderTemplates();
      if (response.success && Array.isArray(response.data)) {
        setFounderTemplates(response.data);
      } else {
        setFounderTemplates([]);
        toast.error(response.message || "Failed to fetch founder templates");
      }
    } catch (error: any) {
      setFounderTemplates([]);
      toast.error(error.message || "Failed to fetch founder templates");
    } finally {
      setIsLoadingTemplates(false);
    }
  }, []);

  const fetchEntries = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiService.getKnowledgeBase();
      if (response.success && Array.isArray(response.data)) {
        setEntries(response.data);
        if (response.data.length === 0) {
          setIsAddingEntry(true);
        }
      } else {
        setEntries([]);
        setIsAddingEntry(true);
        toast.error(response.message || "Failed to fetch entries");
      }
    } catch (error: any) {
      setEntries([]);
      setIsAddingEntry(true);
      toast.error(error.message || "Failed to fetch entries");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
    fetchFounderTemplates();
  }, [fetchEntries, fetchFounderTemplates]);

  const handleContentChange = (value: string) => {
    if (value.length <= MAX_CHARACTERS) {
      setFormData((prev) => ({ ...prev, content: value }));
      setCharacterCount(value.length);
    }
  };

  const handleFounderSelect = (founder: FounderTemplate) => {
    if (founder.profileText.length <= MAX_CHARACTERS) {
      setFormData({
        content: founder.profileText,
        title: `${founder.name} - ${founder.company} Style`,
      });
      setCharacterCount(founder.profileText.length);
    } else {
      toast.error("Founder template exceeds character limit");
    }
  };

  const handleAddEntry = async () => {
    if (!formData.content.trim()) {
      toast.error("Content is required");
      return;
    }
    try {
      const personalInfo: Record<string, any> = { content: formData.content.trim() };
      if (formData.title.trim()) {
        personalInfo.title = formData.title.trim();
      }
      const addData: AddKnowledgeBaseData = { personal_info: personalInfo };
      const response = await apiService.addKnowledgeBase(addData);
      if (response.success) {
        toast.success("Entry added successfully");
        setFormData({ title: "", content: "" });
        setCharacterCount(0);
        setIsAddingEntry(false);
        fetchEntries();
      } else {
        toast.error(response.message || "Failed to add entry");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to add entry");
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

  const AddEntryForm = () => (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      <div className="lg:col-span-3 space-y-4">
        {entries.length > 0 && (
          <Button variant="ghost" onClick={() => setIsAddingEntry(false)} className="mb-2 -ml-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to list
          </Button>
        )}
        <div className="space-y-2">
          <Label htmlFor="title">Title (Optional)</Label>
          <Input id="title" placeholder="e.g., My Founder Story, Product Features" value={formData.title} onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="content">Content *</Label>
          <Textarea id="content" placeholder="Share your story, mindset, what drives you..." value={formData.content} onChange={(e) => handleContentChange(e.target.value)} rows={10} className="resize-none" />
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className={`text-sm ${characterCount > MAX_CHARACTERS * 0.9 ? "text-red-600" : "text-gray-500"}`}>{characterCount}/{MAX_CHARACTERS} characters</span>
              {characterCount > MAX_CHARACTERS * 0.9 && <AlertCircle className="h-4 w-4 text-red-500" />}
            </div>
          </div>
        </div>
        <Button onClick={handleAddEntry} disabled={!formData.content.trim()}>Save Entry</Button>
      </div>
      <div className="space-y-4 lg:col-span-2">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Need inspiration?</h3>
          <p className="text-sm text-gray-600 mb-4">Choose a founder template to get started.</p>
        </div>
        {isLoadingTemplates ? (
          <div className="text-center py-4"><Loader2 className="mx-auto h-6 w-6 animate-spin text-blue-600 mb-2" /></div>
        ) : (
          <div className="grid grid-cols-1 gap-4 max-h-[500px] overflow-y-auto p-1">
            {founderTemplates.map((founder) => (
              <Card key={founder.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    <img src={founder.photo} alt={founder.name} className="w-12 h-12 rounded-full object-cover" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 text-sm">{founder.name}</h4>
                      <p className="text-xs text-gray-600 mb-2">CEO of {founder.company}</p>
                      <p className="text-xs text-gray-500 mb-3 line-clamp-2">{founder.description}</p>
                      <Button size="sm" variant="outline" onClick={() => handleFounderSelect(founder)} className="w-full text-xs">
                        Use this template
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl flex items-center font-bold text-gray-900 mb-2">Knowledge Base</h1>

        </div>
        {!isAddingEntry && entries.length > 0 && (
          <Button onClick={() => setIsAddingEntry(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add New Entry
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-8"><Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" /></div>
      ) : isAddingEntry ? (
        <AddEntryForm />
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            // --- MODIFIED: New layout for each knowledge base entry card ---
            <Card key={entry.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-5">
                  <div className="flex-1">
                    <p className="my-2 font-bold text-xl">{entry.title}</p>
                    <div className="text-gray-800">
                      {expandedEntries.has(entry.id) ? (
                        <p className="whitespace-pre-wrap text-sm font-bold">{entry.content}</p>
                      ) : (
                        <p className="line-clamp-1 text-sm font-bold">{entry.content}</p>
                      )}
                    </div>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => toggleExpanded(entry.id)}
                      className="p-0 h-auto text-blue-600 mt-1 text-xs"
                    >
                      {expandedEntries.has(entry.id) ? "Show Less" : "Show More..."}
                    </Button>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEditClick(entry)}
                      >
                        <User className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setDeleteEntryId(entry.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="mr-1.5 h-3 w-3" />
                      <span>{new Date(entry.created_on).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteEntryId} onOpenChange={() => setDeleteEntryId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this entry?</AlertDialogTitle>
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
      {/* --- ADD THIS DIALOG FOR EDITING --- */}
      <Dialog open={!!entryToEdit} onOpenChange={(isOpen) => !isOpen && setEntryToEdit(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Knowledge Base Entry</DialogTitle>
            <DialogDescription>
              Make changes to your entry here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title (Optional)</Label>
              <Input
                id="edit-title"
                value={editFormData.title}
                onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                disabled={isSaving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-content">Content</Label>
              <Textarea
                id="edit-content"
                value={editFormData.content}
                onChange={(e) => setEditFormData({ ...editFormData, content: e.target.value })}
                rows={10}
                className="resize-none"
                disabled={isSaving}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEntryToEdit(null)}>Cancel</Button>
            <Button onClick={handleUpdateEntry} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}