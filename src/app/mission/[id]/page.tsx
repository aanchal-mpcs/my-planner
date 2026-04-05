"use client";

import { use } from "react";
import Link from "next/link";
import { usePlannerStore } from "@/lib/store";
import { formatDisplayDate } from "@/lib/utils";

export default function MissionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const tasks = usePlannerStore((s) => s.tasks);
  const categories = usePlannerStore((s) => s.categories);
  const toggleTask = usePlannerStore((s) => s.toggleTask);
  const deleteTask = usePlannerStore((s) => s.deleteTask);

  const task = tasks.find((t) => t.id === id);

  if (!task) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-text-dim">
        <span className="text-4xl mb-3 opacity-30">&#128752;</span>
        <p className="text-lg font-mono mb-2">Mission not found</p>
        <Link href="/" className="text-xs text-accent hover:text-accent/80 font-mono transition-colors">
          &larr; BACK TO DASHBOARD
        </Link>
      </div>
    );
  }

  const category = categories.find((c) => c.id === task.categoryId);
  const color = category?.color || "#475569";

  const buildInviteMessage = () => {
    const lines = [`You're invited to: ${task.title}`];
    if (task.dueDate) lines.push(`Date: ${formatDisplayDate(task.dueDate)}`);
    if (task.time) lines.push(`Time: ${task.time}`);
    if (task.location) lines.push(`Location: ${task.location}`);
    return lines.join("\n");
  };

  const message = buildInviteMessage();

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-mono text-text-dim mb-6">
        <Link href="/" className="hover:text-text-secondary transition-colors">Dashboard</Link>
        <span>/</span>
        <span className="text-text-secondary">Mission</span>
      </div>

      {/* Main card */}
      <div className="bg-bg-secondary rounded-xl border border-border overflow-hidden">
        {/* Header with category accent */}
        <div className="h-1" style={{ backgroundColor: color }} />

        <div className="p-6">
          {/* Status + title */}
          <div className="flex items-start gap-4 mb-6">
            <button
              onClick={() => toggleTask(task.id)}
              className="flex-shrink-0 mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all"
              style={{
                borderColor: color,
                backgroundColor: task.completed ? color : "transparent",
              }}
            >
              {task.completed && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6L5 9L10 3" stroke="#150a12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
            <div className="flex-1">
              <h2 className={`text-xl font-semibold ${task.completed ? "line-through opacity-50" : "text-text-primary"}`}>
                {task.title}
              </h2>
              {category && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-sm text-text-secondary">{category.name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Metadata grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-bg-tertiary rounded-lg p-4">
              <p className="text-[10px] font-mono text-text-dim uppercase tracking-wider mb-1">Date</p>
              <p className="text-sm text-text-primary">{formatDisplayDate(task.dueDate)}</p>
            </div>
            <div className="bg-bg-tertiary rounded-lg p-4">
              <p className="text-[10px] font-mono text-text-dim uppercase tracking-wider mb-1">Time</p>
              <p className="text-sm text-text-primary">{task.time || "Not set"}</p>
            </div>
            <div className="col-span-2 bg-bg-tertiary rounded-lg p-4">
              <p className="text-[10px] font-mono text-text-dim uppercase tracking-wider mb-1">Location</p>
              <p className="text-sm text-text-primary">{task.location || "Not set"}</p>
            </div>
          </div>

          {/* Invitees */}
          {task.invitees && task.invitees.length > 0 && (
            <div className="mb-6">
              <p className="text-[10px] font-mono text-text-dim uppercase tracking-wider mb-3">
                Invitees ({task.invitees.length})
              </p>
              <div className="space-y-2">
                {task.invitees.map((inv) => {
                  const href =
                    inv.type === "phone"
                      ? `sms:${inv.contact}&body=${encodeURIComponent(message)}`
                      : `mailto:${inv.contact}?subject=${encodeURIComponent(`Invite: ${task.title}`)}&body=${encodeURIComponent(message)}`;

                  return (
                    <div
                      key={inv.id}
                      className="flex items-center justify-between px-4 py-3 rounded-lg bg-bg-tertiary"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-bg-hover flex items-center justify-center text-xs text-text-secondary font-mono">
                          {inv.name.charAt(0).toUpperCase()}
                        </span>
                        <div>
                          <p className="text-sm text-text-primary">{inv.name}</p>
                          <p className="text-xs text-text-dim">{inv.contact}</p>
                        </div>
                      </div>
                      <a
                        href={href}
                        className="px-3 py-1.5 text-xs font-mono font-medium text-accent bg-accent/10 rounded-lg border border-accent/25 hover:bg-accent/20 transition-colors"
                      >
                        {inv.type === "phone" ? "SMS" : "EMAIL"}
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-border">
            <button
              onClick={() => toggleTask(task.id)}
              className={`px-4 py-2 text-xs font-mono font-medium rounded-lg border transition-colors ${
                task.completed
                  ? "text-warning border-warning/30 hover:bg-warning/10"
                  : "text-success border-success/30 hover:bg-success/10"
              }`}
            >
              {task.completed ? "REOPEN" : "COMPLETE"}
            </button>
            <Link
              href="/focus"
              className="px-4 py-2 text-xs font-mono font-medium text-accent border border-accent/30 rounded-lg hover:bg-accent/10 transition-colors"
            >
              START FOCUS
            </Link>
            <button
              onClick={() => {
                deleteTask(task.id);
                window.history.back();
              }}
              className="ml-auto px-4 py-2 text-xs font-mono font-medium text-danger border border-danger/30 rounded-lg hover:bg-danger/10 transition-colors"
            >
              DELETE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
