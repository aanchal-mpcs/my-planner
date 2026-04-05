"use client";

import { useState, useEffect, useRef } from "react";
import { Task } from "@/lib/types";
import { usePlannerStore } from "@/lib/store";
import { formatDisplayDate } from "@/lib/utils";

interface TaskItemProps {
  task: Task;
}

function ConfettiBurst() {
  return (
    <div className="confetti-burst">
      <span /><span /><span /><span /><span /><span />
    </div>
  );
}

function buildInviteMessage(task: Task): string {
  const lines = [`You're invited to: ${task.title}`];
  if (task.dueDate) lines.push(`Date: ${formatDisplayDate(task.dueDate)}`);
  if (task.time) lines.push(`Time: ${task.time}`);
  if (task.location) lines.push(`Location: ${task.location}`);
  return lines.join("\n");
}

export default function TaskItem({ task }: TaskItemProps) {
  const toggleTask = usePlannerStore((s) => s.toggleTask);
  const deleteTask = usePlannerStore((s) => s.deleteTask);
  const categories = usePlannerStore((s) => s.categories);
  const [showInvitees, setShowInvitees] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [checkPop, setCheckPop] = useState(false);
  const [slidingOut, setSlidingOut] = useState(false);
  const [isNew, setIsNew] = useState(true);
  const wasCompleted = useRef(task.completed);

  useEffect(() => {
    // Clear entrance animation flag after it plays
    const t = setTimeout(() => setIsNew(false), 450);
    return () => clearTimeout(t);
  }, []);

  const category = categories.find((c) => c.id === task.categoryId);
  const color = category?.color || "#475569";
  const hasDetails = task.location || task.time || (task.invitees && task.invitees.length > 0);

  const message = buildInviteMessage(task);

  const handleToggle = () => {
    // Only celebrate when completing, not uncompleting
    if (!task.completed) {
      setCheckPop(true);
      setShowConfetti(true);
      setTimeout(() => setCheckPop(false), 400);
      setTimeout(() => setShowConfetti(false), 700);
    }
    toggleTask(task.id);
  };

  const handleDelete = () => {
    setSlidingOut(true);
    setTimeout(() => deleteTask(task.id), 350);
  };

  return (
    <div
      className={`group px-4 py-3 rounded-lg hover:bg-bg-hover transition-colors ${
        isNew ? "animate-slide-in" : ""
      } ${slidingOut ? "animate-slide-out" : ""}`}
    >
      <div className="flex items-center gap-3">
        {/* Checkbox */}
        <div className="relative">
          <button
            onClick={handleToggle}
            className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
              checkPop ? "animate-check-pop" : ""
            }`}
            style={{
              borderColor: color,
              backgroundColor: task.completed ? color : "transparent",
            }}
          >
            {task.completed && (
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                <path d="M2 6L5 9L10 3" stroke="#150a12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
          {showConfetti && <ConfettiBurst />}
        </div>

        {/* Task content */}
        <div className="flex-1 min-w-0">
          <p className={`text-sm ${task.completed ? "task-done" : "text-text-primary"}`}>
            {task.title}
          </p>
          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
            {category && (
              <div className="flex items-center gap-1.5">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs text-text-dim">{category.name}</span>
              </div>
            )}
            {task.time && (
              <span className="text-xs text-text-dim flex items-center gap-1">
                <span className="text-[10px]">&#128339;</span>
                {task.time}
              </span>
            )}
            {task.location && (
              <span className="text-xs text-text-dim flex items-center gap-1 truncate max-w-[120px]">
                <span className="text-[10px]">&#128205;</span>
                {task.location}
              </span>
            )}
            {task.invitees && task.invitees.length > 0 && (
              <button
                type="button"
                onClick={() => setShowInvitees(!showInvitees)}
                className="text-xs text-accent/70 hover:text-accent flex items-center gap-1 transition-colors"
              >
                <span className="text-[10px]">&#128101;</span>
                {task.invitees.length} invited
              </button>
            )}
          </div>
        </div>

        {/* Delete button */}
        <button
          onClick={handleDelete}
          className="flex-shrink-0 opacity-0 group-hover:opacity-100 text-text-dim hover:text-danger transition-all p-1"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Expanded invitee list */}
      {showInvitees && task.invitees && task.invitees.length > 0 && (
        <div className="ml-8 mt-2 space-y-1.5">
          {task.invitees.map((inv) => {
            const href =
              inv.type === "phone"
                ? `sms:${inv.contact}&body=${encodeURIComponent(message)}`
                : `mailto:${inv.contact}?subject=${encodeURIComponent(`Invite: ${task.title}`)}&body=${encodeURIComponent(message)}`;

            return (
              <div
                key={inv.id}
                className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-md bg-bg-tertiary"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs">{inv.type === "phone" ? "\u260E" : "\u2709"}</span>
                  <span className="text-xs text-text-primary truncate">{inv.name}</span>
                  <span className="text-[10px] text-text-dim truncate">{inv.contact}</span>
                </div>
                <a
                  href={href}
                  className="flex-shrink-0 px-2 py-0.5 text-[10px] font-mono font-medium text-accent bg-accent/10 rounded border border-accent/25 hover:bg-accent/20 transition-colors"
                >
                  SEND INVITE
                </a>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
