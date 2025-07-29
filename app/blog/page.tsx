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
import { ArrowLeft, Loader2 } from "lucide-react";
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
//process.env.NEXT_PUBLIC_API_URL || 
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

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

  if (view === "post") {
    return (
      <div className="bg-white min-h-screen">
        <div className="container mx-auto px-6 py-8 max-w-4xl">
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
              <div className="relative my-8 h-96 w-full bg-gray-200 rounded-lg overflow-hidden">
                <Image src={selectedBlog.photo} alt={selectedBlog.title} layout="fill" objectFit="cover" />
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
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {blogs.map((post) => (
              <Card 
                key={post.id} 
                className="flex flex-col overflow-hidden rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer group"
                onClick={() => fetchSingleBlog(post.id)}
              >
                <div className="relative h-48 w-full">
                    <Image src={post.photo} alt={post.title} layout="fill" objectFit="cover" className="transition-transform duration-300 group-hover:scale-105"/>
                </div>
                <div className="flex flex-col p-6 flex-grow">
                  <p className="text-sm text-gray-500 mb-2">{formatDate(post.date)}</p>
                  <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-green-700 transition-colors">{post.title}</CardTitle>
                  <CardDescription className="mt-3 text-gray-600 flex-grow text-sm">{post.summary}</CardDescription>
                  <div className="mt-4 font-semibold text-green-700 text-sm">Read more &rarr;</div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}