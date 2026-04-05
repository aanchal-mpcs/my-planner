"use client";

import { usePlannerStore } from "@/lib/store";
import { formatDate, getLevel, getRankTitle, getXpProgress } from "@/lib/utils";

export default function AnalyticsPage() {
  const tasks = usePlannerStore((s) => s.tasks);
  const stats = usePlannerStore((s) => s.stats);
  const categories = usePlannerStore((s) => s.categories);

  const level = getLevel(stats.xp);
  const rank = getRankTitle(stats.xp);
  const xpProgress = getXpProgress(stats.xp);
  const focusSessions = stats.focusSessions || [];

  // Completion rate
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Category breakdown
  const categoryStats = categories.map((cat) => {
    const catTasks = tasks.filter((t) => t.categoryId === cat.id);
    const catCompleted = catTasks.filter((t) => t.completed).length;
    return {
      ...cat,
      total: catTasks.length,
      completed: catCompleted,
      rate: catTasks.length > 0 ? Math.round((catCompleted / catTasks.length) * 100) : 0,
    };
  }).filter((c) => c.total > 0);

  // Last 14 days activity
  const today = new Date();
  const dailyActivity = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (13 - i));
    const dateStr = formatDate(d);
    const dayTasks = tasks.filter((t) => t.dueDate === dateStr);
    const dayCompleted = dayTasks.filter((t) => t.completed).length;
    return {
      date: dateStr,
      label: d.getDate().toString(),
      total: dayTasks.length,
      completed: dayCompleted,
    };
  });

  const maxDailyTasks = Math.max(...dailyActivity.map((d) => d.total), 1);

  // Busiest day of week
  const dayOfWeekCounts = [0, 0, 0, 0, 0, 0, 0];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  tasks.forEach((t) => {
    const d = new Date(t.dueDate + "T00:00:00");
    dayOfWeekCounts[d.getDay()]++;
  });
  const maxDayCount = Math.max(...dayOfWeekCounts, 1);

  // Overdue count
  const todayStr = formatDate(today);
  const overdue = tasks.filter((t) => t.dueDate < todayStr && !t.completed).length;

  // Focus stats
  const totalFocusMinutes = focusSessions.reduce((sum, s) => sum + s.duration, 0);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <h2 className="text-2xl font-semibold font-mono text-glow text-accent">
        Analytics
      </h2>

      {/* Top stats row */}
      <div className="grid grid-cols-5 gap-4">
        {[
          { label: "Level", value: `${level}`, sub: rank, accent: true },
          { label: "Total XP", value: `${stats.xp}`, sub: `${xpProgress}/100 to next` },
          { label: "Completion", value: `${completionRate}%`, sub: `${completedTasks}/${totalTasks} missions` },
          { label: "Streak", value: `${stats.currentStreak}d`, sub: `Best: ${stats.longestStreak}d` },
          { label: "Focus Time", value: `${totalFocusMinutes}m`, sub: `${focusSessions.length} sessions` },
        ].map((stat) => (
          <div key={stat.label} className="bg-bg-secondary rounded-xl border border-border p-4">
            <p className="text-[10px] font-mono text-text-dim uppercase tracking-wider">{stat.label}</p>
            <p className={`text-2xl font-mono font-bold mt-1 ${stat.accent ? "text-accent text-glow" : "text-text-primary"}`}>
              {stat.value}
            </p>
            <p className="text-[10px] font-mono text-text-dim mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* 14-day activity chart */}
        <div className="bg-bg-secondary rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-4">14-Day Activity</h3>
          <div className="flex items-end gap-1.5 h-32">
            {dailyActivity.map((day) => (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex flex-col justify-end" style={{ height: "100px" }}>
                  {/* Total bar (background) */}
                  <div
                    className="w-full rounded-t-sm bg-bg-tertiary relative"
                    style={{ height: `${(day.total / maxDailyTasks) * 100}%`, minHeight: day.total > 0 ? "4px" : "0" }}
                  >
                    {/* Completed overlay */}
                    {day.completed > 0 && (
                      <div
                        className="absolute bottom-0 w-full rounded-t-sm"
                        style={{
                          height: `${(day.completed / day.total) * 100}%`,
                          backgroundColor: day.completed === day.total ? "#76ff03" : "#00e5ff",
                          boxShadow:
                            day.completed === day.total
                              ? "0 0 4px rgba(118,255,3,0.3)"
                              : "0 0 4px rgba(0,229,255,0.2)",
                        }}
                      />
                    )}
                  </div>
                </div>
                <span className="text-[9px] font-mono text-text-dim">{day.label}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-3 text-[10px] font-mono text-text-dim">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-sm bg-accent inline-block" /> Completed
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-sm bg-bg-tertiary inline-block" /> Scheduled
            </span>
          </div>
        </div>

        {/* Category breakdown */}
        <div className="bg-bg-secondary rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-4">By Category</h3>
          {categoryStats.length === 0 ? (
            <p className="text-sm text-text-dim font-mono py-8 text-center">No data yet</p>
          ) : (
            <div className="space-y-3">
              {categoryStats.map((cat) => (
                <div key={cat.id}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="text-xs text-text-primary">{cat.name}</span>
                    </div>
                    <span className="text-xs font-mono text-text-dim">
                      {cat.completed}/{cat.total} ({cat.rate}%)
                    </span>
                  </div>
                  <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${cat.rate}%`,
                        backgroundColor: cat.color,
                        boxShadow: `0 0 4px ${cat.color}40`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Day of week distribution */}
        <div className="bg-bg-secondary rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-4">Busiest Days</h3>
          <div className="flex items-end gap-3 h-28">
            {dayOfWeekCounts.map((count, i) => (
              <div key={dayNames[i]} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex justify-end flex-col" style={{ height: "80px" }}>
                  <div
                    className="w-full rounded-t-md bg-accent/60"
                    style={{
                      height: `${(count / maxDayCount) * 100}%`,
                      minHeight: count > 0 ? "4px" : "0",
                      boxShadow: "0 0 4px rgba(0,229,255,0.15)",
                    }}
                  />
                </div>
                <span className="text-[10px] font-mono text-text-dim">{dayNames[i]}</span>
                <span className="text-[9px] font-mono text-text-dim">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* XP progression card */}
        <div className="bg-bg-secondary rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-4">Rank Progression</h3>
          <div className="space-y-3">
            {[
              { rank: "Cadet", minLevel: 1, minXp: 0 },
              { rank: "Officer", minLevel: 3, minXp: 200 },
              { rank: "Commander", minLevel: 6, minXp: 500 },
              { rank: "Admiral", minLevel: 10, minXp: 900 },
            ].map((r) => {
              const achieved = level >= r.minLevel;
              const isCurrent = rank === r.rank;
              return (
                <div
                  key={r.rank}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${
                    isCurrent ? "bg-accent/10 border border-accent/20" : achieved ? "bg-bg-tertiary" : "opacity-40"
                  }`}
                >
                  <span className={`text-lg ${achieved ? "" : "grayscale"}`}>
                    {r.rank === "Cadet" ? "\u2606" : r.rank === "Officer" ? "\u2605" : r.rank === "Commander" ? "\u269D" : "\u2726"}
                  </span>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${isCurrent ? "text-accent" : "text-text-primary"}`}>
                      {r.rank}
                    </p>
                    <p className="text-[10px] font-mono text-text-dim">Level {r.minLevel}+ ({r.minXp} XP)</p>
                  </div>
                  {achieved && (
                    <span className="text-xs text-success font-mono">&#10003;</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Overdue warning */}
      {overdue > 0 && (
        <div className="px-5 py-3 rounded-lg border border-danger/30 bg-danger/5">
          <p className="text-xs font-mono text-danger">
            &#9888; {overdue} overdue mission{overdue > 1 ? "s" : ""} need attention
          </p>
        </div>
      )}
    </div>
  );
}
