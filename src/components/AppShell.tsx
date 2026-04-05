"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { usePlannerStore } from "@/lib/store";
import Sidebar from "./Sidebar";
import StatsBar from "./StatsBar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const recalculateStreak = usePlannerStore((s) => s.recalculateStreak);
  const pathname = usePathname();

  useEffect(() => {
    recalculateStreak();
  }, [recalculateStreak]);

  return (
    <div className="flex h-screen overflow-hidden bg-bg-primary">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <StatsBar />
        <main className="flex-1 overflow-auto">
          <div className="cascade-enter" key={pathname}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
