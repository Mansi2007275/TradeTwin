"use client";

import { AppShell } from "@/components/layout/AppShell";
import { MotionItem, MotionStagger } from "@/components/motion/MotionStagger";

interface PageContainerProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  /** When false, renders without sidebar (e.g. landing). */
  shell?: boolean;
}

export function PageContainer({
  children,
  title,
  description,
  shell = true,
}: PageContainerProps) {
  if (!shell) {
    return (
      <main className="flex-1">
        <MotionStagger>{children}</MotionStagger>
      </main>
    );
  }

  return (
    <AppShell title={title} description={description}>
      {children}
    </AppShell>
  );
}

export { MotionItem };
