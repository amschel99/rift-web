import { cn } from "@/lib/utils";
import { cva, VariantProps } from "class-variance-authority";
import React, { ReactNode } from "react";
import RiftLoader from "@/components/ui/rift-loader";

const actionButtonVariants = cva(
  "flex flex-row items-center justify-center gap-2 h-12 px-5 rounded-2xl cursor-pointer font-sans font-semibold text-[15px] tracking-[-0.01em] text-white transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/40 focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-accent-primary shadow-sm hover:bg-accent-primary/92 hover:shadow-md active:bg-accent-primary/88",
        secondary:
          "bg-accent-secondary shadow-sm hover:bg-accent-secondary/92",
        danger: "bg-danger shadow-sm hover:bg-danger/92",
        success: "bg-success shadow-sm hover:bg-success/92",
        disabled: "bg-text-subtle/20 !text-text-subtle/80 shadow-none",
        ghost:
          "bg-transparent border border-accent-primary/30 !text-accent-primary hover:bg-accent-primary/5",
      },
      size: {
        default: "w-full",
        small: "px-3 h-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface Props {
  loading?: boolean;
  className?: string;
  children?: ReactNode;
}

export default function ActionButton({
  variant,
  className,
  children,
  loading,
  disabled,
  ...props
}: Props &
  React.ComponentProps<"button"> &
  VariantProps<typeof actionButtonVariants>) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        actionButtonVariants({
          variant: disabled && variant !== "danger" ? "disabled" : variant,
          className,
        }),
        loading && "opacity-95"
      )}
      {...props}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <RiftLoader size="sm" message="" />
          <span className="opacity-70">{children}</span>
        </div>
      ) : (
        <>
          <div />
          {children}
        </>
      )}
    </button>
  );
}
