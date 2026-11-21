"use client";

import { MotionConfig } from "framer-motion";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { TooltipProvider } from "@/components/ui/tooltip";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <TooltipProvider delayDuration={200}><PageViewTracker />
        {children}
      </TooltipProvider>
    </MotionConfig>
  );
}
