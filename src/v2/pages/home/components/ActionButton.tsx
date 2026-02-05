import { cn } from "@/lib/utils";
import { forwardRef } from "react";
import type { ReactNode } from "react";

interface ActionButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  title: string;
  className?: string;
}

const ActionButton = forwardRef<HTMLButtonElement, ActionButtonProps>(
  ({ icon, title, className = "", onClick, ...rest }, ref) => (
    <button
      ref={ref}
      onClick={onClick}
      className={cn(
        // Mobile: minimal icon + label, no border/container
        "flex flex-col items-center justify-center px-1.5 py-1.5 text-[11px] sm:text-xs text-text-default",
        // Desktop / larger: card-style button
        "md:bg-white md:border md:border-gray-200 md:px-3 md:py-3 md:rounded-2xl md:shadow-sm md:hover:border-accent-primary md:hover:bg-accent-primary/5 md:transition-all",
        className
      )}
      {...rest}
    >
      <span className="mb-0.5 flex items-center justify-center text-accent-primary">
        {icon}
      </span>
      <p className="font-medium text-text-default">{title}</p>
    </button>
  )
);

ActionButton.displayName = "ActionButton";

export default ActionButton;
