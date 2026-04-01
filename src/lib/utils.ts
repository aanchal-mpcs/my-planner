import { Category, Task } from "./types";

export const DEFAULT_CATEGORIES: Category[] = [
  { id: "cat-work", name: "Work", color: "#00e5ff" },
  { id: "cat-personal", name: "Personal", color: "#76ff03" },
  { id: "cat-health", name: "Health", color: "#ff6e40" },
  { id: "cat-learning", name: "Learning", color: "#e040fb" },
  { id: "cat-errands", name: "Errands", color: "#ffd740" },
];

export function generateId(): string {
  return crypto.randomUUID();
}

export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseDate(str: string): Date {
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export function isToday(dateStr: string): boolean {
  return dateStr === formatDate(new Date());
}

export function getLevel(xp: number): number {
  return Math.floor(xp / 100) + 1;
}

export function getXpProgress(xp: number): number {
  return xp % 100;
}

export function getRankTitle(xp: number): string {
  const level = getLevel(xp);
  if (level >= 10) return "Admiral";
  if (level >= 6) return "Commander";
  if (level >= 3) return "Officer";
  return "Cadet";
}

export function calculateStreak(tasks: Task[]): {
  current: number;
  longest: number;
} {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Group tasks by date
  const byDate = new Map<string, { total: number; completed: number }>();
  for (const task of tasks) {
    const entry = byDate.get(task.dueDate) || { total: 0, completed: 0 };
    entry.total++;
    if (task.completed) entry.completed++;
    byDate.set(task.dueDate, entry);
  }

  // Walk backwards from yesterday counting consecutive completed days
  let current = 0;
  const check = new Date(today);
  check.setDate(check.getDate() - 1); // start from yesterday

  while (true) {
    const dateStr = formatDate(check);
    const day = byDate.get(dateStr);
    if (!day || day.total === 0) break;
    if (day.completed < day.total) break;
    current++;
    check.setDate(check.getDate() - 1);
  }

  // Also check today — if all today's tasks are done, include it
  const todayStr = formatDate(today);
  const todayData = byDate.get(todayStr);
  if (todayData && todayData.total > 0 && todayData.completed === todayData.total) {
    current++;
  }

  // Calculate longest streak across all dates
  const sortedDates = [...byDate.keys()].sort();
  let longest = 0;
  let streak = 0;
  let prevDate: Date | null = null;

  for (const dateStr of sortedDates) {
    const day = byDate.get(dateStr)!;
    const date = parseDate(dateStr);

    if (day.total > 0 && day.completed === day.total) {
      if (
        prevDate &&
        date.getTime() - prevDate.getTime() === 24 * 60 * 60 * 1000
      ) {
        streak++;
      } else {
        streak = 1;
      }
      longest = Math.max(longest, streak);
      prevDate = date;
    } else {
      streak = 0;
      prevDate = null;
    }
  }

  return { current, longest: Math.max(longest, current) };
}

export function formatDisplayDate(dateStr: string): string {
  const date = parseDate(dateStr);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
