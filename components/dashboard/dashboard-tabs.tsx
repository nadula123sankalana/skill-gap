"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

export type DashboardTab = {
  value: string;
  label: string;
  count?: number;
  content: ReactNode;
};

/**
 * Dashboard sections as tabs. The active tab mirrors `location.hash`, so any
 * `<a href="#gaps">` on the page (stat tiles, "see all" links) switches tabs
 * and the view is shareable / survives a refresh.
 */
export function DashboardTabs({ tabs }: { tabs: DashboardTab[] }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(tabs[0]?.value ?? "");
  const values = tabs.map((t) => t.value).join(",");

  const fromHash = useCallback(
    (scroll: boolean) => {
      const hash = window.location.hash.replace("#", "");
      if (!hash || !values.split(",").includes(hash)) return;
      setActive(hash);
      if (scroll) {
        rootRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    },
    [values]
  );

  useEffect(() => {
    fromHash(false);
    const onHash = () => fromHash(true);
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [fromHash]);

  return (
    <TabsPrimitive.Root
      ref={rootRef}
      value={active}
      onValueChange={(value) => {
        setActive(value);
        window.history.replaceState(null, "", `#${value}`);
      }}
      className="scroll-mt-24"
    >
      <TabsPrimitive.List
        aria-label="Dashboard sections"
        className="no-print -mx-4 flex gap-1 overflow-x-auto border-b border-border px-4 sm:mx-0 sm:px-0"
      >
        {tabs.map((tab) => (
          <TabsPrimitive.Trigger
            key={tab.value}
            value={tab.value}
            className={cn(
              "relative inline-flex shrink-0 items-center gap-2 px-4 py-3 text-sm font-medium text-muted transition-colors",
              "hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-t-lg",
              "after:absolute after:inset-x-3 after:-bottom-px after:h-0.5 after:rounded-full after:bg-transparent after:transition-colors",
              "data-[state=active]:text-foreground data-[state=active]:after:bg-primary"
            )}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className="rounded-full bg-accent px-2 py-0.5 text-[0.7rem] font-semibold tabular-nums text-primary">
                {tab.count}
              </span>
            )}
          </TabsPrimitive.Trigger>
        ))}
      </TabsPrimitive.List>

      {tabs.map((tab) => (
        <TabsPrimitive.Content
          key={tab.value}
          value={tab.value}
          className="pt-6 focus-visible:outline-none"
        >
          {tab.content}
        </TabsPrimitive.Content>
      ))}
    </TabsPrimitive.Root>
  );
}
