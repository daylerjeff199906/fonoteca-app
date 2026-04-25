"use client"

import React from "react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar";

interface FormFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function FormFooter({ children, className, style, ...props }: FormFooterProps) {
  const { state, isMobile } = useSidebar();

  const leftMargin = isMobile
    ? "0px"
    : state === "collapsed"
      ? "var(--sidebar-width-icon)"
      : "var(--sidebar-width)";

  return (
    <>
      <div
        className={cn(
          "fixed bottom-0 right-0 z-[9] flex items-center justify-end gap-2 border-t bg-background/80 px-4 py-4 backdrop-blur-md sm:px-8 transition-[left] duration-200 ease-linear",
          className
        )}
        style={{ left: leftMargin, ...style }}
        {...props}
      >
        <div className="flex justify-end w-full container mx-auto px-4 gap-4">
          {children}
        </div>
      </div>
    </>
  );
}
