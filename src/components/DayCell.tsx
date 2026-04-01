"use client";

import { Task } from "@/lib/types";
import { usePlannerStore } from "@/lib/store";
import { isToday } from "@/lib/utils";

interface DayCellProps {
  date: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  tasks: Task[];
}

export default function DayCell({ date, dayNumber, isCurrentMonth, tasks }: DayCellProps) {
  const selectedDate = usePlannerStore((s) => s.selectedDate);
  const setSelectedDate = usePlannerStore((s) => s.setSelectedDate);
  const categories = usePlannerStore((s) => s.categories);
  const isSelected = selectedDate === date;
  const today = isToday(date);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const allComplete = totalTasks > 0 && completedTasks === totalTasks;
  const hasInProgress = totalTasks > 0 && !allComplete;

  const getCategoryColor = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.color || "#475569";
  };

  const displayDots = tasks.slice(0, 4);
  const overflow = tasks.length - 4;

  return (
    <button
      onClick={() => setSelectedDate(date)}
      className={`
        relative flex flex-col items-start p-2 min-h-[5rem] rounded-lg border transition-all duration-150
        ${!isCurrentMonth ? "opacity-30" : ""}
        ${isSelected ? "bg-bg-active border-accent/40" : "border-transparent hover:bg-bg-hover"}
        ${today && !isSelected ? "border-accent/30" : ""}
        ${allComplete ? "bg-success/5 ring-1 ring-success/20" : ""}
        ${hasInProgress ? "ring-1 ring-warning/15" : ""}
      `}
    >
      <span
        className={`
          text-sm font-mono font-medium
          ${today ? "text-accent text-glow" : ""}
          ${isSelected && !today ? "text-text-primary" : ""}
          ${!today && !isSelected ? "text-text-secondary" : ""}
        `}
      >
        {dayNumber}
      </span>

      {totalTasks > 0 && (
        <div className="flex flex-wrap gap-1 mt-auto pt-1">
          {displayDots.map((task) => (
            <span
              key={task.id}
              className={`w-2 h-2 rounded-full ${task.completed ? "opacity-40" : ""}`}
              style={{ backgroundColor: getCategoryColor(task.categoryId) }}
            />
          ))}
          {overflow > 0 && (
            <span className="text-[10px] text-text-dim font-mono">+{overflow}</span>
          )}
        </div>
      )}

      {allComplete && (
        <span className="absolute top-1 right-1.5 text-[10px] text-success/60">&#10003;</span>
      )}
    </button>
  );
}
