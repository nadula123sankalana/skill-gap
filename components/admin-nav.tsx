"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Layers,
  Target,
  Lightbulb,
  SlidersHorizontal,
  Briefcase,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { springSnappy } from "@/lib/motion";

const links: {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/dashboard", label: "Cohort", icon: Users },
  { href: "/admin/skills", label: "Skills", icon: Layers },
  { href: "/admin/roles", label: "Internship roles", icon: Briefcase },
  { href: "/admin/benchmarks", label: "Benchmarks", icon: Target },
  { href: "/admin/rules", label: "Rules", icon: Lightbulb },
  {
    href: "/admin/settings",
    label: "Severity settings",
    icon: SlidersHorizontal,
  },
];

export function AdminNav() {
  const pathname = usePathname();
  const reduced = useReducedMotion();

  return (
    <nav className="mt-4 flex flex-row gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
      {links.map((link) => {
        const active = link.exact
          ? pathname === link.href
          : pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "relative flex items-center gap-2.5 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm transition-colors",
              active
                ? "font-semibold text-primary"
                : "text-muted hover:bg-accent hover:text-foreground"
            )}
            aria-current={active ? "page" : undefined}
          >
            {active && (
              <motion.span
                layoutId={reduced ? undefined : "admin-nav-active"}
                className="absolute inset-0 -z-10 rounded-xl bg-accent ring-1 ring-primary/15"
                transition={springSnappy}
              />
            )}
            <link.icon className="h-4 w-4 shrink-0" aria-hidden />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
