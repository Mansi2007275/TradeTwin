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
    <aside className="app-sidebar fixed inset-y-0 left-0 z-40 flex w-[240px] flex-col border-r">
      <div className="border-b border-[var(--sidebar-border)] px-5 py-5">
        <Link href="/dashboard">
          <Logo size="sm" variant="onDark" />
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <span
                className={cn(
                  "sidebar-nav-link",
                  active && "sidebar-nav-link--active",
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[var(--sidebar-border)] px-5 py-4">
        <p className="sidebar-eyebrow type-eyebrow">Network</p>
        <p className="sidebar-footer-text font-data mt-1 text-xs">Monad · 10143</p>
      </div>
    </aside>
  );
}
