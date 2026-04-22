import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        data-slot="input"
        className={cn(
          "file:text-foreground placeholder:text-text-subtle/60 selection:bg-accent-primary/20 selection:text-text-default",
          "flex h-11 w-full min-w-0 rounded-xl border border-surface bg-white px-4 py-2.5 text-[15px] text-text-default shadow-sm transition-all outline-none",
          "file:inline-flex file:h-8 file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
          "hover:border-accent-primary/30",
          "focus-visible:border-accent-primary focus-visible:ring-2 focus-visible:ring-accent-primary/20",
          "aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
export { Input };
