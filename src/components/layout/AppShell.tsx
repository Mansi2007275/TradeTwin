"use client";

import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { MotionStagger } from "@/components/motion/MotionStagger";

interface AppShellProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

export function AppShell({ children, title, description }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[var(--shell-bg)]">
      <Sidebar />
      <div className="pl-[240px]">
        <TopBar title={title} description={description} />
        <main className="p-6">
          <MotionStagger>{children}</MotionStagger>
        </main>
      </div>
    </div>
  );
}
