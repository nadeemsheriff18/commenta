"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Loader2} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// --- Type Definitions ---
interface BlogSummary {
  id: number;
  title: string;
  summary: string;
  date: string;
  photo: string;
  url: string;
}

interface BlogPost extends BlogSummary {
  content: string;
}

// --- Main Blog Page Component ---
export default function BlogPage() {
  const [blogs, setBlogs] = useState<BlogSummary[]>([]);
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);
  const [view, setView] = useState<"list" | "post">("list");
  const [isLoading, setIsLoading] = useState(true);
  const [isPostLoading, setIsPostLoading] = useState(false);
////process.env.NEXT_PUBLIC_API_URL ||
  const API_BASE_URL='http://127.0.0.1:8000';

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const fetchBlogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const clientTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const response = await fetch(`${API_BASE_URL}/all_blogs?client_timezone=${encodeURIComponent(clientTimezone)}`);
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      setBlogs(data);
    } catch (error) {
      console.error("Failed to fetch blogs:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchSingleBlog = async (blogId: number) => {
    setIsPostLoading(true);
    setView("post");
    try {
      const clientTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const response = await fetch(`${API_BASE_URL}/blog?blog_id=${blogId}&client_timezone=${encodeURIComponent(clientTimezone)}`);
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      setSelectedBlog(data);
    } catch (error) {
      console.error("Failed to fetch blog post:", error);
    } finally {
      setIsPostLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  // --- Main Render Logic ---
  if (view === "post") {
    return (
      <div className="bg-slate-100 min-h-screen">
        {/* --- ADDED: Navbar for single post view --- */}
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b">
          <div className="container mx-auto px-6 py-3 flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-2">
                <img src="/logo.jpg/" className="w-10 h-10"/>
                <h1 className="text-xl font-bold text-gray-900">Commentta</h1>
            </Link>
          </div>
        </header>
        <div className="container mx-auto px-6 py-8 max-w-3xl">
          <Button variant="ghost" onClick={() => setView("list")} className="mb-8 -ml-4 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to all articles
          </Button>
          {isPostLoading ? (
            <div className="flex justify-center items-center h-96">
              <Loader2 className="h-8 w-8 animate-spin text-green-700" />
            </div>
          ) : selectedBlog ? (
            <article className="prose lg:prose-lg max-w-none">
              <p className="text-sm text-gray-500">{formatDate(selectedBlog.date)}</p>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900">{selectedBlog.title}</h1>
              <div className="relative my-8 h-96 w-full bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
                <p className="text-gray-400">[Blog Image Placeholder]</p>
              </div>
              <div dangerouslySetInnerHTML={{ __html: selectedBlog.content }} />
            </article>
          ) : (
            <p>Could not load blog post.</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* --- ADDED: Navbar for list view --- */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-6 py-3 flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-2">
                <img src="/logo.jpg/" className="w-10 h-10"/>
                <h1 className="text-xl font-bold text-gray-900">Commentta</h1>
            </Link>
        </div>
      </header>
      <div className="container mx-auto px-6 py-16">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">The Commentta Blog</h1>
          <p className="mt-4 text-lg text-gray-600">Insights on community-led growth, Reddit marketing, and building in public.</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-96">
            <Loader2 className="h-8 w-8 animate-spin text-green-700" />
          </div>
        ) : (
          // --- MODIFIED: Grid and Card sizes ---
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {blogs.map((post) => (
              <Card 
                key={post.id} 
                className="flex flex-col overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group"
                onClick={() => fetchSingleBlog(post.id)}
              >
                <div className="relative h-40 w-full bg-gray-200 flex items-center justify-center">
                    <p className="text-gray-400 text-sm">[Blog Image]</p>
                </div>
                <div className="flex flex-col p-4 flex-grow">
                  <p className="text-xs text-gray-500 mb-2">{formatDate(post.date)}</p>
                  <CardTitle className="text-md font-bold text-gray-900 group-hover:text-green-700 transition-colors">{post.title}</CardTitle>
                  <CardDescription className="mt-2 text-gray-600 flex-grow text-xs">{post.summary}</CardDescription>
                  <div className="mt-4 font-semibold text-green-700 text-xs">Read more &rarr;</div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}