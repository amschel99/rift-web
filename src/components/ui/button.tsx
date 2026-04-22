import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer rounded-xl text-sm font-semibold tracking-[-0.01em] transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-primary/40 aria-invalid:ring-destructive/20 aria-invalid:border-destructive active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-accent-primary text-white shadow-sm hover:bg-accent-primary/92 hover:shadow-md active:bg-accent-primary/88",
        destructive:
          "bg-destructive text-white shadow-sm hover:bg-destructive/92 focus-visible:ring-destructive/30",
        outline:
          "border border-surface bg-white text-text-default shadow-sm hover:bg-surface-subtle hover:border-accent-primary/30",
        secondary:
          "bg-surface text-text-default hover:bg-surface-subtle hover:text-text-default",
        ghost:
          "text-text-default hover:bg-accent-primary/8 hover:text-accent-primary",
        link: "text-accent-primary underline-offset-4 hover:underline",
        soft:
          "bg-accent-primary/10 text-accent-primary hover:bg-accent-primary/15",
      },
      size: {
        default: "h-11 px-5 py-2.5 has-[>svg]:px-4",
        sm: "h-9 rounded-lg gap-1.5 px-3.5 text-[13px] has-[>svg]:px-3",
        xs: "h-7 rounded-md gap-1 px-2.5 text-xs has-[>svg]:px-2",
        lg: "h-12 rounded-xl px-6 text-[15px] has-[>svg]:px-5",
        xl: "h-14 rounded-2xl px-7 text-base has-[>svg]:px-6",
        icon: "size-10 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
