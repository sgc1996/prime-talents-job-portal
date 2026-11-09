"use client";

import * as React from "react";
import { useState } from "react";
import { Bookmark } from "lucide-react";
import { toggleSaveJobAction } from "@/server/actions/job.actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SaveJobButtonProps {
  jobId: string;
  initialSaved?: boolean;
  className?: string;
}

export function SaveJobButton({
  jobId,
  initialSaved = false,
  className,
}: SaveJobButtonProps) {
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isLoading) return;
    setIsLoading(true);

    // Optimistic toggle
    const nextSavedState = !isSaved;
    setIsSaved(nextSavedState);

    const result = await toggleSaveJobAction(jobId);
    setIsLoading(false);

    if (!result.success) {
      // Revert on error
      setIsSaved(!nextSavedState);
      toast.error(result.error || "Failed to save job");
      return;
    }

    if (result.saved) {
      toast.success("Job bookmarked to saved list");
    } else {
      toast.info("Job removed from saved list");
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isLoading}
      aria-label={isSaved ? "Remove from saved jobs" : "Save this job"}
      className={cn(
        "rounded-full p-2 transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary",
        isSaved ? "text-primary" : "text-muted-foreground hover:text-foreground",
        className,
      )}
    >
      <Bookmark
        className={cn("h-5 w-5", isSaved && "fill-current")}
      />
    </button>
  );
}
