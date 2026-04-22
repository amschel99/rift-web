import { useState, useEffect } from "react";

const DESKTOP_BREAKPOINT = 1024;

/**
 * Detect desktop via viewport width. A width-based signal is much more reliable
 * across devices than user-agent sniffing (touchscreen laptops, hybrids, etc.)
 * and matches how Tailwind's `lg:` breakpoint reasons about layout.
 */
export function useDesktopDetection() {
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth >= DESKTOP_BREAKPOINT;
  });

  useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${DESKTOP_BREAKPOINT}px)`);
    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsDesktop(e.matches);
    };

    handler(mql);

    if (typeof mql.addEventListener === "function") {
      mql.addEventListener("change", handler as (e: MediaQueryListEvent) => void);
      return () => mql.removeEventListener("change", handler as (e: MediaQueryListEvent) => void);
    }

    // Legacy Safari
    mql.addListener(handler as (e: MediaQueryListEvent) => void);
    return () => mql.removeListener(handler as (e: MediaQueryListEvent) => void);
  }, []);

  return isDesktop;
}

export default useDesktopDetection;
