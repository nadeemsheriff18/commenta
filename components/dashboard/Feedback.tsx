"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label"; // <-- Added
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"; // <-- Added
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { apiService } from "@/lib/api";

export function FeedbackDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [category, setCategory] = useState("feedback"); // <-- Added state for category
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!feedback.trim()) {
      toast.error("Please enter your feedback before submitting.");
      return;
    }

    setIsSubmitting(true);
    // --- MODIFIED: Pass category in the payload ---
    const promise = apiService.submitFeedback({
      content: feedback,
      type: category,
    });

    toast.promise(promise, {
      loading: "Submitting feedback...",
      success: () => {
        setFeedback(""); // Clear the textarea
        setCategory("feedback"); // Reset category
        setIsSubmitting(false);
        setOpen(false); // Close the dialog
        return "Thank you for your feedback!";
      },
      error: (err: any) => {
        setIsSubmitting(false);
        return err.message || "Failed to submit feedback.";
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Submit Feedback</DialogTitle>
          <DialogDescription>
            We'd love to hear your thoughts! What can we improve?
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          {/* --- ADDED: Radio group for categories --- */}
          <div className="space-y-2">
            <Label>Category</Label>
            <RadioGroup
              value={category}
              onValueChange={setCategory}
              className="flex space-x-1 sm:space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="feedback" id="r1" />
                <Label htmlFor="r1" className="cursor-pointer">Feedback</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="problem" id="r2" />
                <Label htmlFor="r2" className="cursor-pointer">Report a Problem</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="feature" id="r3" />
                <Label htmlFor="r3" className="cursor-pointer">Feature Request</Label>
              </div>
            </RadioGroup>
          </div>

          <Textarea
            placeholder="Type your message here..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={5}
          />
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}