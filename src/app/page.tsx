"use client";

import Link from "next/link";
import { usePlannerStore } from "@/lib/store";
import { formatDate, formatDisplayDate, getLevel, getRankTitle, getXpProgress } from "@/lib/utils";
import TaskItem from "@/components/TaskItem";

export default function Dashboard() {
  const tasks = usePlannerStore((s) => s.tasks);
  const stats = usePlannerStore((s) => s.stats);

  const todayStr = formatDate(new Date());
  const todayTasks = tasks
    .filter((t) => t.dueDate === todayStr)
    .sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

  const completedToday = todayTasks.filter((t) => t.completed).length;
  const totalToday = todayTasks.length;

  // Upcoming tasks (next 7 days, excluding today, incomplete only)
  const upcoming: { date: string; tasks: typeof tasks }[] = [];
  for (let i = 1; i <= 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dateStr = formatDate(d);
    const dayTasks = tasks.filter((t) => t.dueDate === dateStr && !t.completed);
    if (dayTasks.length > 0) {
      upcoming.push({ date: dateStr, tasks: dayTasks });
    }
  }

  // Overdue tasks
  const overdue = tasks.filter((t) => t.dueDate < todayStr && !t.completed);

  const level = getLevel(stats.xp);
  const rank = getRankTitle(stats.xp);
  const xpProgress = getXpProgress(stats.xp);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Hero header */}
      <div>
        <h2 className="text-2xl font-semibold text-glow text-accent font-mono">
          {formatDisplayDate(todayStr)}
        </h2>
        <p className="text-text-secondary text-sm mt-1">
          {totalToday === 0
            ? "No missions today. Enjoy the downtime."
            : `${totalToday} mission${totalToday === 1 ? "" : "s"} today \u2014 ${completedToday} complete`}
        </p>
      </div>

      <div className="flex gap-6">
        {/* Left: Today's missions */}
        <div className="flex-1 min-w-0">
          {/* Overdue alert */}
          {overdue.length > 0 && (
            <div className="mb-4 px-4 py-3 rounded-lg border border-danger/30 bg-danger/5">
              <p className="text-xs font-mono text-danger font-medium mb-2">
                &#9888; {overdue.length} OVERDUE MISSION{overdue.length > 1 ? "S" : ""}
              </p>
              {overdue.slice(0, 3).map((task) => (
                <div key={task.id} className="flex items-center gap-2 text-xs text-text-secondary py-0.5">
                  <span className="text-danger/60">{task.dueDate}</span>
                  <Link href={`/mission/${task.id}`} className="hover:text-text-primary transition-colors truncate">
                    {task.title}
                  </Link>
                </div>
              ))}
              {overdue.length > 3 && (
                <p className="text-[10px] text-text-dim mt-1">+{overdue.length - 3} more</p>
              )}
            </div>
          )}

          {/* Today's task list */}
          <div className="bg-bg-secondary rounded-xl border border-border">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-semibold text-text-primary">Today&apos;s Missions</h3>
              <Link
                href="/calendar"
                className="text-xs font-mono text-accent/70 hover:text-accent transition-colors"
              >
                OPEN CALENDAR &rarr;
              </Link>
            </div>
            {todayTasks.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-text-dim">
                <span className="text-3xl mb-2 opacity-30">&#128752;</span>
                <p className="text-sm font-mono">All clear, Commander</p>
                <Link href="/calendar" className="text-xs text-accent/60 hover:text-accent mt-2 transition-colors">
                  Schedule a mission &rarr;
                </Link>
              </div>
            ) : (
              <div className="py-1">
                {todayTasks.map((task) => (
                  <TaskItem key={task.id} task={task} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Stats + Upcoming */}
        <div className="w-72 flex-shrink-0 space-y-4">
          {/* XP / Level card */}
          <div className="bg-bg-secondary rounded-xl border border-border p-5">
            <div className="flex items-center gap-3 mb-3">
              <span className="px-2.5 py-1 text-sm font-mono font-bold text-accent bg-accent/10 rounded-md border border-accent/25 glow-sm">
                LVL {level}
              </span>
              <div>
                <p className="text-sm text-text-primary font-medium">{rank}</p>
                <p className="text-[10px] text-text-dim font-mono">{stats.xp} XP total</p>
              </div>
            </div>
            <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden">
              <div
                className="h-full bg-accent rounded-full transition-all duration-500"
                style={{ width: `${xpProgress}%`, boxShadow: "0 0 6px rgba(244, 114, 182, 0.3)" }}
              />
            </div>
            <p className="text-[10px] text-text-dim font-mono mt-1.5 text-right">{xpProgress}/100 to next level</p>
          </div>

          {/* Streak card */}
          <div className="bg-bg-secondary rounded-xl border border-border p-5 flex items-center gap-4">
            <span className={`text-2xl ${stats.currentStreak > 0 ? "text-glow-amber" : "opacity-30"}`}>&#128293;</span>
            <div>
              <p className={`text-lg font-mono font-bold ${stats.currentStreak > 0 ? "text-warning" : "text-text-dim"}`}>
                {stats.currentStreak} day{stats.currentStreak === 1 ? "" : "s"}
              </p>
              <p className="text-[10px] text-text-dim font-mono">
                Best: {stats.longestStreak} | Done: {stats.totalCompleted}
              </p>
            </div>
          </div>

          {/* Upcoming */}
          {upcoming.length > 0 && (
            <div className="bg-bg-secondary rounded-xl border border-border">
              <div className="px-5 py-3 border-b border-border">
                <h3 className="text-sm font-semibold text-text-primary">Upcoming</h3>
              </div>
              <div className="px-5 py-3 space-y-3">
                {upcoming.slice(0, 4).map(({ date, tasks: dayTasks }) => (
                  <div key={date}>
                    <p className="text-[10px] font-mono text-text-dim uppercase tracking-wider mb-1">
                      {formatDisplayDate(date)}
                    </p>
                    {dayTasks.slice(0, 2).map((t) => (
                      <Link
                        key={t.id}
                        href={`/mission/${t.id}`}
                        className="block text-xs text-text-secondary hover:text-text-primary truncate py-0.5 transition-colors"
                      >
                        {t.title}
                      </Link>
                    ))}
                    {dayTasks.length > 2 && (
                      <p className="text-[10px] text-text-dim">+{dayTasks.length - 2} more</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick links */}
          <div className="flex gap-2">
            <Link
              href="/focus"
              className="flex-1 text-center py-2.5 text-xs font-mono text-accent/70 bg-bg-secondary rounded-lg border border-border hover:border-accent/30 hover:text-accent transition-all"
            >
              &#25CE; FOCUS
            </Link>
            <Link
              href="/analytics"
              className="flex-1 text-center py-2.5 text-xs font-mono text-accent/70 bg-bg-secondary rounded-lg border border-border hover:border-accent/30 hover:text-accent transition-all"
            >
              &#9651; ANALYTICS
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
