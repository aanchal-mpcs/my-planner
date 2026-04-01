"use client";

import { usePlannerStore } from "@/lib/store";
import { formatDisplayDate } from "@/lib/utils";
import TaskItem from "./TaskItem";
import TaskForm from "./TaskForm";

function CompletionRing({ completed, total }: { completed: number; total: number }) {
  const pct = total === 0 ? 0 : completed / total;
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct);
  const isComplete = pct === 1 && total > 0;

  return (
    <div className="relative flex items-center justify-center">
      <svg width="52" height="52" className="-rotate-90">
        {/* Background ring */}
        <circle
          cx="26"
          cy="26"
          r={radius}
          fill="none"
          stroke="currentColor"
          className="text-border"
          strokeWidth="3"
        />
        {/* Progress ring */}
        {total > 0 && (
          <circle
            cx="26"
            cy="26"
            r={radius}
            fill="none"
            stroke={isComplete ? "#76ff03" : "#00e5ff"}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={`transition-all duration-500 ${isComplete ? "animate-pulse-glow" : ""}`}
            style={isComplete ? { filter: "drop-shadow(0 0 4px rgba(118, 255, 3, 0.4))" } : {}}
          />
        )}
      </svg>
      <span className={`absolute text-xs font-mono ${isComplete ? "text-success" : "text-text-secondary"}`}>
        {total === 0 ? "--" : `${completed}/${total}`}
      </span>
    </div>
  );
}

export default function TaskPanel() {
  const selectedDate = usePlannerStore((s) => s.selectedDate);
  const tasks = usePlannerStore((s) => s.tasks);

  const dayTasks = tasks
    .filter((t) => t.dueDate === selectedDate)
    .sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

  const completed = dayTasks.filter((t) => t.completed).length;
  const total = dayTasks.length;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">
            {formatDisplayDate(selectedDate)}
          </h3>
          <p className="text-xs font-mono text-text-dim mt-0.5">
            {total === 0
              ? "No missions scheduled"
              : `${total} mission${total === 1 ? "" : "s"}`}
          </p>
        </div>
        <CompletionRing completed={completed} total={total} />
      </div>

      {/* Task list */}
      <div className="flex-1 overflow-auto py-2">
        {dayTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-text-dim">
            <span className="text-4xl mb-3 opacity-30">&#128752;</span>
            <p className="text-sm font-mono">No missions scheduled</p>
            <p className="text-xs mt-1">Add a task below to get started</p>
          </div>
        ) : (
          dayTasks.map((task) => <TaskItem key={task.id} task={task} />)
        )}
      </div>

      {/* Add task form */}
      <TaskForm />
    </div>
  );
}
