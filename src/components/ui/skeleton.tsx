import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "mt-2 w-full h-10 bg-accent animate-pulse rounded-md",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
