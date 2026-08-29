"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dna", label: "Trading DNA" },
  { href: "/twin", label: "Twin" },
  { href: "/simulation", label: "Simulation" },
  { href: "/results", label: "Results" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="app-sidebar fixed inset-y-0 left-0 z-40 flex w-[240px] flex-col border-r border-[var(--border-subtle)] bg-white">
      <div className="border-b border-[var(--border-subtle)] px-5 py-5">
        <Link href="/dashboard">
          <Logo size="sm" />
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <span
                className={cn(
                  "block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-[var(--surface-muted)] text-[var(--text-display)]"
                    : "text-[var(--text-muted)] hover:bg-[var(--surface-inset)] hover:text-[var(--text-heading)]",
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[var(--border-subtle)] px-5 py-4">
        <p className="type-eyebrow">Network</p>
        <p className="font-data mt-1 text-xs text-[var(--text-muted)]">Monad · 10143</p>
      </div>
    </aside>
  );
}
