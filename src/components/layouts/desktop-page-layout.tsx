import { ReactNode } from "react";

interface DesktopPageLayoutProps {
  children: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  className?: string;
  /**
   * When true, disable the default scroll container and let children manage
   * their own height/scroll. Use this when children render their own
   * `flex-1 overflow-y-auto` (e.g., pages with sticky headers).
   */
  noScroll?: boolean;
}

const maxWidthClasses = {
  sm: "max-w-2xl",
  md: "max-w-4xl",
  lg: "max-w-6xl",
  xl: "max-w-7xl",
  "2xl": "max-w-[90rem]",
  full: "max-w-full",
};

/**
 * Desktop page layout with a proper scroll container.
 *
 * Default behavior: the wrapper is a flex column that fills height, and
 * children are rendered inside a `flex-1 overflow-y-auto` region so they
 * scroll naturally. Pages that manage their own scroll internally (sticky
 * header + internal scroll area) should pass `noScroll`.
 */
export default function DesktopPageLayout({
  children,
  maxWidth = "lg",
  className = "",
  noScroll = false,
}: DesktopPageLayoutProps) {
  if (noScroll) {
    return (
      <div className={`w-full h-full flex flex-col min-h-0 ${className}`}>
        <div
          className={`w-full h-full flex flex-col min-h-0 mx-auto ${maxWidthClasses[maxWidth]}`}
        >
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full h-full flex flex-col min-h-0 ${className}`}>
      <div className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain">
        <div
          className={`mx-auto px-6 py-8 ${maxWidthClasses[maxWidth]}`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
