"use client";

import { useAuth } from "@/hooks/use-auth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";

// The ProfileSettings component is now defined inside the page
function ProfileSettingsContent() {
  const { user, isLoading } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  
  // Set initial form data when user object is loaded
  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // In a real app, you would call an apiService function here
    // For now, we'll simulate it.
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success("Profile updated successfully!");
    setIsSaving(false);
  };

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-slate-50/50 min-h-full">
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Profile Settings</h1>
            <p className="mt-1 text-gray-600">Manage your personal information and preferences.</p>

            <form onSubmit={handleSaveChanges}>
                <Card className="mt-8 shadow-sm">
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>Update your personal details here.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="timezone">Timezone</Label>
                            <Input id="timezone" value={Intl.DateTimeFormat().resolvedOptions().timeZone} readOnly disabled />
                             <p className="text-xs text-muted-foreground">Your timezone is detected automatically.</p>
                        </div>
                    </CardContent>
                </Card>
                <div className="mt-6 flex justify-end">
                    <Button type="submit" disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-700">
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4" />}
                        Save Changes
                    </Button>
                </div>
            </form>
        </div>
    </div>
  );
}


// The final export now wraps the page content correctly
export default function ProfileSettingsPage() {
    return (
        <ProtectedRoute>
            <Layout>
                <ProfileSettingsContent />
            </Layout>
        </ProtectedRoute>
    )
}