"use client";

import { useEffect } from "react";
import { usePlannerStore } from "@/lib/store";
import StatsBar from "@/components/StatsBar";
import Calendar from "@/components/Calendar";
import TaskPanel from "@/components/TaskPanel";

export default function Home() {
  const recalculateStreak = usePlannerStore((s) => s.recalculateStreak);

  useEffect(() => {
    recalculateStreak();
  }, [recalculateStreak]);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-bg-primary">
      <StatsBar />
      <div className="flex flex-1 overflow-hidden">
        <div className="w-[60%] border-r border-border p-6 overflow-auto">
          <Calendar />
        </div>
        <div className="w-[40%] overflow-auto">
          <TaskPanel />
        </div>
      </div>
    </div>
  );
}
