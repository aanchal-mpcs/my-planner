"use client";

import Calendar from "@/components/Calendar";
import TaskPanel from "@/components/TaskPanel";

export default function CalendarPage() {
  return (
    <div className="flex h-full overflow-hidden">
      <div className="w-[60%] border-r border-border p-6 overflow-auto">
        <Calendar />
      </div>
      <div className="w-[40%] overflow-auto">
        <TaskPanel />
      </div>
    </div>
  );
}
