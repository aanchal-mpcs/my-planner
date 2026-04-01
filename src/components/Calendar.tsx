"use client";

import { usePlannerStore, getCurrentMonthYear } from "@/lib/store";
import { getDaysInMonth, getFirstDayOfWeek, formatDate, MONTH_NAMES } from "@/lib/utils";
import DayCell from "./DayCell";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function Calendar() {
  const currentMonth = usePlannerStore((s) => s.currentMonth);
  const navigateMonth = usePlannerStore((s) => s.navigateMonth);
  const setSelectedDate = usePlannerStore((s) => s.setSelectedDate);
  const tasks = usePlannerStore((s) => s.tasks);

  const { year, month } = getCurrentMonthYear(currentMonth);
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);

  // Previous month days for padding
  const prevMonthDays = getDaysInMonth(year, month === 0 ? 11 : month - 1);
  const prevYear = month === 0 ? year - 1 : year;
  const prevMonth = month === 0 ? 11 : month - 1;

  // Next month
  const nextYear = month === 11 ? year + 1 : year;
  const nextMonth = month === 11 ? 0 : month + 1;

  const getTasksForDate = (dateStr: string) =>
    tasks.filter((t) => t.dueDate === dateStr);

  const handleToday = () => {
    const now = new Date();
    const todayStr = formatDate(now);
    usePlannerStore.getState().setCurrentMonth(now.getFullYear(), now.getMonth());
    setSelectedDate(todayStr);
  };

  // Build the grid cells
  const cells: { date: string; dayNumber: number; isCurrentMonth: boolean }[] = [];

  // Previous month padding
  for (let i = firstDay - 1; i >= 0; i--) {
    const day = prevMonthDays - i;
    cells.push({
      date: formatDate(new Date(prevYear, prevMonth, day)),
      dayNumber: day,
      isCurrentMonth: false,
    });
  }

  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({
      date: formatDate(new Date(year, month, d)),
      dayNumber: d,
      isCurrentMonth: true,
    });
  }

  // Next month padding to fill 6 rows
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    cells.push({
      date: formatDate(new Date(nextYear, nextMonth, d)),
      dayNumber: d,
      isCurrentMonth: false,
    });
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-semibold font-mono text-glow text-accent">
            {MONTH_NAMES[month]} {year}
          </h2>
          <button
            onClick={handleToday}
            className="px-3 py-1 text-xs font-mono text-accent border border-accent/30 rounded-md hover:bg-accent/10 transition-colors"
          >
            TODAY
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigateMonth(-1)}
            className="w-8 h-8 flex items-center justify-center rounded-md border border-border hover:bg-bg-hover text-text-secondary hover:text-text-primary transition-colors"
          >
            &#8249;
          </button>
          <button
            onClick={() => navigateMonth(1)}
            className="w-8 h-8 flex items-center justify-center rounded-md border border-border hover:bg-bg-hover text-text-secondary hover:text-text-primary transition-colors"
          >
            &#8250;
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-mono uppercase tracking-widest text-text-dim py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 flex-1">
        {cells.map((cell) => (
          <DayCell
            key={cell.date}
            date={cell.date}
            dayNumber={cell.dayNumber}
            isCurrentMonth={cell.isCurrentMonth}
            tasks={getTasksForDate(cell.date)}
          />
        ))}
      </div>
    </div>
  );
}
