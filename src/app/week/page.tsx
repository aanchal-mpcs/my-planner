"use client";

import Link from "next/link";
import { usePlannerStore } from "@/lib/store";
import { formatDate } from "@/lib/utils";

const WEEKDAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function WeekPage() {
  const tasks = usePlannerStore((s) => s.tasks);
  const categories = usePlannerStore((s) => s.categories);

  const today = new Date();
  const todayStr = formatDate(today);
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return {
      date: formatDate(d),
      dayName: WEEKDAY_NAMES[d.getDay()],
      dayNum: d.getDate(),
      isToday: formatDate(d) === todayStr,
    };
  });

  const getCategoryColor = (categoryId: string) =>
    categories.find((c) => c.id === categoryId)?.color || "#475569";

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold font-mono text-glow text-accent">
          This Week
        </h2>
        <p className="text-xs font-mono text-text-dim">
          {days[0].date} &mdash; {days[6].date}
        </p>
      </div>

      <div className="grid grid-cols-7 gap-3 flex-1 min-h-0">
        {days.map((day) => {
          const dayTasks = tasks.filter((t) => t.dueDate === day.date);
          const completed = dayTasks.filter((t) => t.completed).length;
          const total = dayTasks.length;
          const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
          const allDone = total > 0 && completed === total;

          return (
            <div
              key={day.date}
              className={`flex flex-col rounded-xl border bg-bg-secondary overflow-hidden ${
                day.isToday ? "border-accent/40 glow-sm" : "border-border"
              }`}
            >
              {/* Day header */}
              <div className={`px-3 py-2.5 border-b border-border ${day.isToday ? "bg-accent/5" : ""}`}>
                <p className={`text-xs font-mono uppercase tracking-wider ${day.isToday ? "text-accent" : "text-text-dim"}`}>
                  {day.dayName}
                </p>
                <p className={`text-lg font-mono font-bold ${day.isToday ? "text-accent text-glow" : "text-text-primary"}`}>
                  {day.dayNum}
                </p>
              </div>

              {/* Completion bar */}
              {total > 0 && (
                <div className="px-3 pt-2">
                  <div className="h-1 bg-bg-tertiary rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: allDone ? "#86efac" : "#f472b6",
                        boxShadow: allDone
                          ? "0 0 6px rgba(134,239,172,0.3)"
                          : "0 0 4px rgba(244,114,182,0.2)",
                      }}
                    />
                  </div>
                  <p className="text-[10px] font-mono text-text-dim mt-0.5 text-right">
                    {completed}/{total}
                  </p>
                </div>
              )}

              {/* Task list */}
              <div className="flex-1 overflow-auto px-2 py-1.5 space-y-1">
                {dayTasks.length === 0 ? (
                  <p className="text-[10px] text-text-dim text-center py-4 font-mono">
                    No missions
                  </p>
                ) : (
                  dayTasks.map((task) => (
                    <Link
                      key={task.id}
                      href={`/mission/${task.id}`}
                      className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs hover:bg-bg-hover transition-colors ${
                        task.completed ? "opacity-40 line-through" : ""
                      }`}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: getCategoryColor(task.categoryId) }}
                      />
                      <span className="truncate text-text-secondary">{task.title}</span>
                      {task.time && (
                        <span className="text-[9px] text-text-dim ml-auto flex-shrink-0">{task.time}</span>
                      )}
                    </Link>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
