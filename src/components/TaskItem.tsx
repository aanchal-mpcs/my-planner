"use client";

import { Task } from "@/lib/types";
import { usePlannerStore } from "@/lib/store";

interface TaskItemProps {
  task: Task;
}

export default function TaskItem({ task }: TaskItemProps) {
  const toggleTask = usePlannerStore((s) => s.toggleTask);
  const deleteTask = usePlannerStore((s) => s.deleteTask);
  const categories = usePlannerStore((s) => s.categories);

  const category = categories.find((c) => c.id === task.categoryId);
  const color = category?.color || "#475569";

  return (
    <div className="group flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-bg-hover transition-colors">
      {/* Checkbox */}
      <button
        onClick={() => toggleTask(task.id)}
        className="flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
        style={{
          borderColor: color,
          backgroundColor: task.completed ? color : "transparent",
        }}
      >
        {task.completed && (
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
            <path d="M2 6L5 9L10 3" stroke="#0a0e17" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {/* Task content */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${task.completed ? "task-done" : "text-text-primary"}`}>
          {task.title}
        </p>
        {category && (
          <div className="flex items-center gap-1.5 mt-0.5">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="text-xs text-text-dim">{category.name}</span>
          </div>
        )}
      </div>

      {/* Delete button */}
      <button
        onClick={() => deleteTask(task.id)}
        className="flex-shrink-0 opacity-0 group-hover:opacity-100 text-text-dim hover:text-danger transition-all p-1"
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
