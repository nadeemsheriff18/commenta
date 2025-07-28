"use client";

import { useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Calendar,
  ExternalLink,
  Pin,
  Trash2,
  MessageSquare,
  Copy,
  RefreshCw,
  Loader2,
  Eye,
  EyeOff,
  TrendingUp,
  Percent,
} from "lucide-react";
import { Mention } from "@/lib/api";
import { cn } from "@/lib/utils";

const useAutosizeTextArea = (
  textAreaRef: React.RefObject<HTMLTextAreaElement>,
  value: string
) => {
  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "0px";
      const scrollHeight = textAreaRef.current.scrollHeight;
      textAreaRef.current.style.height = scrollHeight + "px";
    }
  }, [textAreaRef, value]);
};

interface MentionCardProps {
  mention: Mention;
  displayComment: string | null | undefined;
  isGenerating: boolean;
  isExpanded: boolean;
  activeTab: "active" | "pinned" | "completed" | "noise" | "ignored";
  onToggleExpand: (id: string) => void;
  onGenerateComment: (id: number, isRelevant: boolean) => void;
  onActOnMention: (id: number, type: "pinned" | "ignored" | "completed", comment?: string) => void;
  onCopyAndComplete: (id: number, comment: string) => void;
  onCommentChange: (id: number, newComment: string) => void;
}

export function MentionCard({
  mention,
  displayComment,
  isGenerating,
  isExpanded,
  activeTab,
  onToggleExpand,
  onGenerateComment,
  onActOnMention,
  onCopyAndComplete,
  onCommentChange,
}: MentionCardProps) {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  useAutosizeTextArea(textAreaRef, displayComment || "");

  const priorityStyles = {
    high: "bg-red-100 text-red-800 border-red-200",
    medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
    low: "bg-gray-100 text-gray-800 border-gray-200",
  };

  return (
    <Card className={cn(
      "transition-all",
      mention.is_new && "border-green-500 border-2 bg-green-50/50"
    )}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1 pr-4">
            <div className="flex items-center justify-between mb-2">
              <CardTitle className="text-lg font-bold">{mention.title}</CardTitle>
              <div className="flex items-center space-x-2">
                <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="mr-1 h-3 w-3" />
                    {new Date(mention.time).toLocaleString()}
                </div>
                <Button variant="outline" size="sm" onClick={() => window.open(mention.link, "_blank")} className="flex-shrink-0">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex items-center flex-wrap gap-x-4 gap-y-2 mb-2">
              <Badge variant="outline" className="text-xs">{mention.subreddit}</Badge>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <TrendingUp className="h-3 w-3" />
                <span>{mention.score} upvotes</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <MessageSquare className="h-3 w-3" />
                <span>{mention.comment_cnt} comments</span>
              </div>
              {mention.prio && (
                <Badge className={cn("capitalize", priorityStyles[mention.prio])}>
                    {mention.prio} Priority
                </Badge>
              )}
              {activeTab !== 'active' && mention.similarity != null && (
                <div className="flex items-center space-x-1 text-xs text-blue-600 font-medium">
                  <Percent className="h-3 w-3" />
                  <span>{mention.similarity.toFixed(0)}% Relevance</span>
                </div>
              )}
            </div>
            <div className="text-sm text-gray-600">
              {isExpanded ? (
                <div>
                  <p className="whitespace-pre-wrap">{mention.text}</p>
                  <Button variant="link" size="sm" onClick={() => onToggleExpand(mention.id.toString())} className="p-0 h-auto text-blue-600 mt-2">
                    <EyeOff className="mr-1 h-3 w-3" /> Show less
                  </Button>
                </div>
              ) : (
                <div>
                  <p className="line-clamp-3">{mention.text}</p>
                  {mention.text && mention.text.length > 200 && (
                    <Button variant="link" size="sm" onClick={() => onToggleExpand(mention.id.toString())} className="p-0 h-auto text-blue-600 mt-2">
                      <Eye className="mr-1 h-3 w-3" /> See more
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {displayComment && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">Comment:</Label>
            <Textarea
              ref={textAreaRef}
              value={displayComment}
              onChange={(e) => onCommentChange(mention.id, e.target.value)}
              rows={1}
              className="resize-none overflow-hidden"
            />
          </div>
        )}
        
        <div className="flex flex-wrap items-center justify-between gap-2">
          {isGenerating ? (
            <Button disabled className="bg-blue-600">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
            </Button>
          ) : displayComment ? (
            <>
              {/* --- CORRECTED: Left Aligned Buttons --- */}
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => onCopyAndComplete(mention.id, displayComment)} className="bg-green-600 hover:bg-green-700">
                  <Copy className="mr-2 h-4 w-4" /> Copy & Mark as Completed
                </Button>
                <Button variant="outline" onClick={() => onActOnMention(mention.id, "pinned")}>
                  <Pin className="mr-2 h-4 w-4" /> Pin
                </Button>
                 <Button variant="outline" onClick={() => onActOnMention(mention.id, "ignored")}>
                  <Trash2 className="mr-2 h-4 w-4" /> Ignore
                </Button>
              </div>
              {/* Right Aligned Buttons */}
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => onGenerateComment(mention.id, false)}>Rephrase (Irrelevant)</Button>
                <Button variant="outline" onClick={() => onGenerateComment(mention.id, true)}><RefreshCw className="mr-2 h-4 w-4" /> Rephrase (Relevant)</Button>
              </div>
            </>
          ) : (
            <>
              {/* Left Aligned Buttons */}
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => onActOnMention(mention.id, "pinned")}><Pin className="mr-2 h-4 w-4" /> Pin</Button>
                <Button variant="outline" onClick={() => onActOnMention(mention.id, "ignored")}><Trash2 className="mr-2 h-4 w-4" /> Ignore</Button>
              </div>
              {/* Right Aligned Buttons */}
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => onGenerateComment(mention.id, false)}>Generate Irrelevant</Button>
                <Button onClick={() => onGenerateComment(mention.id, true)} className="bg-blue-600 hover:bg-blue-700"><MessageSquare className="mr-2 h-4 w-4" /> Generate Relevant</Button>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}