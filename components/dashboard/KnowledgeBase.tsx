"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Edit } from "lucide-react";
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
import { Plus, Trash2, Calendar, Loader2, User, BookOpenCheck, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import {
  apiService,
  KnowledgeBaseEntry,
  UpdateKnowledgeBaseData,
  AddKnowledgeBaseData,
  FounderTemplate,
} from "@/lib/api";
import { cn } from "@/lib/utils";

// --- Form Component ---
const AddEntryForm = ({
  entries,
  formData,
  setFormData,
  handleAddEntry,
  isAdding,
  setIsAddingEntry,
  founderTemplates,
  isLoadingTemplates,
  handleFounderSelect,
  showTemplates,
  setShowTemplates
}: any) => {

  const FounderTemplateList = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Need inspiration?</h3>
      {isLoadingTemplates ? (
        <div className="text-center py-4"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 gap-4 max-h-[500px] overflow-y-auto p-1">
          {founderTemplates.map((founder: FounderTemplate) => (
            <Card key={founder.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  <img src={founder.photo} alt={founder.name} className="w-12 h-12 rounded-full object-cover" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 text-sm">{founder.name}</h4>
                    <p className="text-xs text-gray-600 mb-2">CEO of {founder.company}</p>
                    <p className="text-xs text-gray-500 mb-3 line-clamp-2">{founder.description}</p>
                    <Button size="sm" variant="outline" onClick={() => handleFounderSelect(founder)} className="w-full text-xs">Use this template</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      {/* Left side: The Form */}
      <div className="space-y-4">
        {entries.length > 0 && (
          <Button variant="ghost" onClick={() => setIsAddingEntry(false)} className="mb-2 -ml-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to list
          </Button>
        )}
        <div className="space-y-2">
          <Label htmlFor="title"></Label>
          <Input id="title" placeholder="e.g., My Founder Story" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="content">Content *</Label>
          <Textarea id="content" placeholder="Share your story, mindset, what drives you..." value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} rows={10} className="resize-none" />
          <p className="text-xs text-muted-foreground">{formData.content.length}/1200 characters</p>
        </div>
        <Button onClick={handleAddEntry} disabled={isAdding || !formData.content.trim()} className="bg-green-700 hover:bg-green-800">
          {isAdding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Entry
        </Button>
      </div>

      {/* --- MODIFIED: Right side logic --- */}
      <div>
        {entries.length === 0 || showTemplates ? (
          <FounderTemplateList />
        ) : (
          <div className="bg-gray-50 p-6 rounded-lg border space-y-4">
            <h3 className="font-semibold text-gray-800">Add Your Personal Info or Content Snippets</h3>
            <p className="text-sm text-gray-600">Paste anything here that helps Commentta understand your voice and style better.</p>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 pl-2">
              <li>Drop in text from your LinkedIn posts, blogs, or tweets</li>
              <li>Convert your podcast or video content into text and paste it here</li>
              <li>Share a short bio or writing samples</li>
              <li>Use this prompt on any AI model to generate your personal voice profile, then copy and paste the result here: <br />
                <span className="italic text-gray-500">
                  "Based on our previous conversations, write a single, well-crafted paragraph (maximum 200 words) that captures who I am professionally. Use the first-person 'I' voice. The tone should be sharp, confident, and clear, suitable for a personal brand bio, professional summary, or website introduction."
                </span>
              </li>
            </ul>
            <p className="text-center text-sm text-gray-500 pt-2">or just grab a template!</p>
            <p className="text-center text-sm text-gray-600">Don't have anything ready? No problem. Just select our ready-made voice template to get started instantly.</p>
            <Button
              variant="outline"
              className="w-full bg-white"
              onClick={() => setShowTemplates(true)}
            >
              Select Template
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Main Component ---
export default function KnowledgeBase() {
  const [entries, setEntries] = useState<KnowledgeBaseEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteEntryId, setDeleteEntryId] = useState<number | null>(null);
  const [expandedEntries, setExpandedEntries] = useState<Set<number>>(new Set());
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [entryToEdit, setEntryToEdit] = useState<KnowledgeBaseEntry | null>(null);
  const [editFormData, setEditFormData] = useState({ id: 0, title: "", content: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({ title: "", content: "" });
  const [founderTemplates, setFounderTemplates] = useState<FounderTemplate[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false); // --- ADDED STATE ---
  const router = useRouter();

  const fetchFounderTemplates = useCallback(async () => {
    setIsLoadingTemplates(true);
    try {
      const response = await apiService.getFounderTemplates();
      if (response.success && Array.isArray(response.data)) {
        setFounderTemplates(response.data);
      } else { setFounderTemplates([]); }
    } catch (error) { setFounderTemplates([]);
    } finally { setIsLoadingTemplates(false); }
  }, []);

  const fetchEntries = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiService.getKnowledgeBase();
      if (response.success && Array.isArray(response.data)) {
        setEntries(response.data);
        if (response.data.length === 0) {
          setIsAddingEntry(true);
        } else {
            setIsAddingEntry(false);
        }
      } else {
        setEntries([]);
        setIsAddingEntry(true);
      }
    } catch (error) {
      setEntries([]);
      setIsAddingEntry(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
    fetchFounderTemplates();
  }, [fetchEntries, fetchFounderTemplates]);

  useEffect(() => {
    if (entryToEdit) {
      setEditFormData({
        id: entryToEdit.id,
        title: entryToEdit.title || "",
        content: entryToEdit.content,
      });
    }
  }, [entryToEdit]);

  // --- ADDED: Reset showTemplates when switching views ---
  useEffect(() => {
    if (!isAddingEntry) {
      setShowTemplates(false);
    }
  }, [isAddingEntry]);

  const handleFounderSelect = (founder: FounderTemplate) => {
    setFormData({
      content: founder.profileText,
      title: `${founder.name} - ${founder.company} Style`,
    });
  };

  const handleAddEntry = async () => {
    if (!formData.content.trim()) {
      toast.error("Content is required");
      return;
    }
    setIsAdding(true);
    try {
      const addData: AddKnowledgeBaseData = {
        title: formData.title.trim(),
        personal_info: formData.content.trim(),
      };
      const response = await apiService.addKnowledgeBase(addData);
      if (response.success) {
        toast.success("Entry added successfully");
        setFormData({ title: "", content: "" });
        setIsAddingEntry(false);
        fetchEntries();
      } else {
        toast.error(response.message || "Failed to add entry");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to add entry");
    } finally {
      setIsAdding(false);
    }
  };

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
    <div className="p-4 sm:p-6 lg:p-8 bg-white min-h-full">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Knowledge Base</h1>
            <p className="mt-1 text-gray-600">This defines your AI assistant's speaking and comment generation style.</p>
          </div>
          {!isAddingEntry && entries.length > 0 && (
            <Button onClick={() => setIsAddingEntry(true)} className="bg-green-700 hover:bg-green-800">
              <Plus className="mr-2 h-4 w-4" />
              Add New Entry
            </Button>
          )}
        </div>

        {isAddingEntry ? (
          <AddEntryForm
            entries={entries}
            formData={formData}
            setFormData={setFormData}
            handleAddEntry={handleAddEntry}
            isAdding={isAdding}
            setIsAddingEntry={setIsAddingEntry}
            founderTemplates={founderTemplates}
            isLoadingTemplates={isLoadingTemplates}
            handleFounderSelect={handleFounderSelect}
            showTemplates={showTemplates}
            setShowTemplates={setShowTemplates}
          />
        ) : (
          entries.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed rounded-lg">
                <BookOpenCheck className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Your Knowledge Base is Empty</h3>
                <p className="text-gray-600 mb-4">Add your first entry to start training the AI.</p>
                <Button onClick={() => setIsAddingEntry(true)} className="bg-green-600 hover:bg-green-700">
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
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEntryToEdit(entry)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeleteEntryId(entry.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className={cn("text-sm text-gray-600", !expandedEntries.has(entry.id) && "line-clamp-2")}>
                      {entry.content}
                    </p>
                    <Button variant="link" size="sm" onClick={() => toggleExpanded(entry.id)} className="p-0 h-auto text-green-600 mt-2">
                      {expandedEntries.has(entry.id) ? "Show Less" : "Show More..."}
                    </Button>
                  </CardContent>
                  <CardFooter className="text-xs text-gray-500 pt-3 mt-3 border-t">
                      <div className="flex items-center"><Calendar className="mr-2 h-3 w-3" />Created on {new Date(entry.created_on).toLocaleDateString()}</div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )
        )}
      </div>
      
      {/* --- Edit Dialog --- */}
      <Dialog open={!!entryToEdit} onOpenChange={(isOpen) => !isOpen && setEntryToEdit(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Knowledge Base Entry</DialogTitle>
            <DialogDescription>Make changes to your entry here. Click save when you're done.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title"></Label>
              <Input id="edit-title" value={editFormData.title} onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })} disabled={isSaving} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-content">Content</Label>
              <Textarea id="edit-content" value={editFormData.content} onChange={(e) => setEditFormData({ ...editFormData, content: e.target.value })} rows={10} className="resize-none" disabled={isSaving} />
            </div>
          </div>
          <DialogFooter>
            
            <Button onClick={handleUpdateEntry} disabled={isSaving} className="bg-green-600 hover:bg-green-700">
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* --- Delete Dialog --- */}
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