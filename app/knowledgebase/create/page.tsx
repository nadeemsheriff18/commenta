"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { apiService, AddKnowledgeBaseData, FounderTemplate } from "@/lib/api";

export default function CreateKnowledgeBaseEntryPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ title: "", content: "" });
  const [isAdding, setIsAdding] = useState(false);
  const [founderTemplates, setFounderTemplates] = useState<FounderTemplate[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);

  const fetchFounderTemplates = useCallback(async () => {
    setIsLoadingTemplates(true);
    try {
      const response = await apiService.getFounderTemplates();
      if (response.success && Array.isArray(response.data)) {
        setFounderTemplates(response.data);
      } else {
        setFounderTemplates([]);
      }
    } catch (error) {
      setFounderTemplates([]);
    } finally {
      setIsLoadingTemplates(false);
    }
  }, []);

  useEffect(() => {
    fetchFounderTemplates();
  }, [fetchFounderTemplates]);

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
        router.push("/knowledgebase");
      } else {
        toast.error(response.message || "Failed to add entry");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to add entry");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="p-4 sm:p-6 lg:p-8 bg-slate-50/50 min-h-full">
          <div className="max-w-6xl mx-auto">
            <div className="mb-4">
              <Button variant="ghost" onClick={() => router.push('/knowledgebase')} className="flex items-center text-sm text-gray-600 -ml-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Knowledge Base
              </Button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              <div className="lg:col-span-3">
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-2xl">Add New Knowledge Base Entry</CardTitle>
                    <CardDescription>This information will be used by the AI to generate comments in your voice.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title (Optional)</Label>
                      <Input id="title" placeholder="e.g., My Founder Story" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} disabled={isAdding} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="content">Content *</Label>
                      <Textarea id="content" placeholder="Share your story, mindset, what drives you..." value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} rows={12} className="resize-none" disabled={isAdding} />
                    </div>
                    <div className="flex justify-end pt-4">
                      <Button onClick={handleAddEntry} disabled={isAdding || !formData.content.trim()} className="bg-indigo-600 hover:bg-indigo-700">
                        {isAdding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Entry
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Need inspiration?</h3>
                {isLoadingTemplates ? (
                  <div className="text-center py-8"><Loader2 className="mx-auto h-8 w-8 animate-spin" /></div>
                ) : (
                  <div className="space-y-4 max-h-[60vh] overflow-y-auto p-1">
                    {founderTemplates.map((founder) => (
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
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}