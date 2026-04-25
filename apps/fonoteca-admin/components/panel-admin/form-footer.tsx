import React from "react";
import { cn } from "@/lib/utils";

interface FormFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function FormFooter({ children, className, ...props }: FormFooterProps) {
  return (
    <>
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-[9] flex items-center justify-end gap-2 border-t bg-background/80 px-4 py-4 backdrop-blur-md sm:px-8",
          className
        )}
        {...props}
      >
        <div className="flex justify-end w-full">
          {children}
        </div>
      </div>
    </>
  );
}
