"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Overview", exact: true },
  { href: "/admin/dashboard", label: "Cohort" },
  { href: "/admin/skills", label: "Skills" },
  { href: "/admin/benchmarks", label: "Benchmarks" },
  { href: "/admin/rules", label: "Rules" },
  { href: "/admin/settings", label: "Severity settings" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="mt-4 flex flex-row gap-1 overflow-x-auto lg:flex-col">
      {links.map((link) => {
        const active = link.exact
          ? pathname === link.href
          : pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "whitespace-nowrap rounded-md px-3 py-2 text-sm transition-colors",
              active
                ? "bg-primary/10 font-medium text-primary"
                : "text-muted hover:bg-accent hover:text-foreground"
            )}
            aria-current={active ? "page" : undefined}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
