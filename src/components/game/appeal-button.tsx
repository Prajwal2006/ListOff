"use client";

import { useState } from "react";
import { Check, Flag, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ApiError } from "@/lib/client/api";
import { appealAnswer } from "@/lib/client/appeals";
import { cn } from "@/lib/utils";

/** One-tap "I think this should count" report. The answer is queued for the admin to review. */
export function AppealButton({ topicId, text, className }: { topicId: number; text: string; className?: string }) {
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  if (state === "sent") {
    return (
      <span className={cn("inline-flex items-center gap-1 text-xs font-semibold text-volt", className)}>
        <Check className="size-3" /> Sent for review
      </span>
    );
  }
  return (
    <button
      type="button"
      disabled={state === "sending"}
      onClick={async () => {
        setState("sending");
        try {
          await appealAnswer(topicId, text);
          setState("sent");
          toast.success("Thanks! We'll review it and may add it to the topic.");
        } catch (e) {
          setState("idle");
          toast.error(e instanceof ApiError ? e.message : "Couldn't send your appeal.");
        }
      }}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-line-strong px-2 py-0.5 text-xs font-semibold text-muted-foreground hover:border-cyan hover:text-cyan disabled:opacity-60",
        className,
      )}
    >
      {state === "sending" ? <Loader2 className="size-3 animate-spin" /> : <Flag className="size-3" />}
      Appeal
    </button>
  );
}
