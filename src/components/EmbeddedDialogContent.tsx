"use client";

import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { DialogContent } from "@max-ai/components";
import { useViewportCenter } from "@/lib/hooks/use-visible-viewport";

/**
 * Drop-in replacement for DialogContent that positions the dialog at the center
 * of the user's visible viewport when running inside an iframe. Falls back to
 * default centering (top: 50%) when viewport tracking isn't available.
 */
export const EmbeddedDialogContent = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof DialogContent>
>(({ style, ...props }, ref) => {
  const centerY = useViewportCenter();

  return (
    <DialogContent
      ref={ref}
      style={centerY != null ? { ...style, top: `${centerY}px` } : style}
      {...props}
    />
  );
});

EmbeddedDialogContent.displayName = "EmbeddedDialogContent";
