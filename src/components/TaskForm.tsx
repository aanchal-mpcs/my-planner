"use client";

import { useState, useRef } from "react";
import { usePlannerStore } from "@/lib/store";
import { Invitee } from "@/lib/types";
import InviteeManager from "./InviteeManager";

export default function TaskForm() {
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [location, setLocation] = useState("");
  const [time, setTime] = useState("");
  const [invitees, setInvitees] = useState<Invitee[]>([]);
  const [expanded, setExpanded] = useState(false);

  const categories = usePlannerStore((s) => s.categories);
  const addTask = usePlannerStore((s) => s.addTask);
  const formRef = useRef<HTMLFormElement>(null);

  const activeCategoryId = categoryId || categories[0]?.id || "";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !activeCategoryId) return;
    addTask(title.trim(), activeCategoryId, {
      location: location.trim() || undefined,
      time: time || undefined,
      invitees: invitees.length > 0 ? invitees : undefined,
    });
    setTitle("");
    setLocation("");
    setTime("");
    setInvitees([]);
    setExpanded(false);
  };

  const handleBlur = (e: React.FocusEvent) => {
    // Collapse if focus leaves the form entirely and title is empty
    if (!formRef.current?.contains(e.relatedTarget as Node) && !title.trim()) {
      setExpanded(false);
    }
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      onBlur={handleBlur}
      className="border-t border-border"
    >
      {/* Expandable extra fields */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          expanded ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 pt-3 space-y-2">
          {/* Location + Time row */}
          <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-1.5 bg-bg-tertiary rounded-lg border border-border focus-within:border-accent/40 transition-colors">
              <span className="pl-3 text-text-dim text-xs">&#128205;</span>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Location"
                className="flex-1 bg-transparent text-text-primary placeholder:text-text-dim text-sm px-1 py-2 focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-1.5 bg-bg-tertiary rounded-lg border border-border focus-within:border-accent/40 transition-colors">
              <span className="pl-3 text-text-dim text-xs">&#128339;</span>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="bg-transparent text-text-primary text-sm px-1 py-2 pr-3 focus:outline-none [color-scheme:dark]"
              />
            </div>
          </div>

          {/* Invitees */}
          <div>
            <p className="text-[10px] font-mono text-text-dim uppercase tracking-wider mb-1.5">
              Invite People
            </p>
            <InviteeManager invitees={invitees} onChange={setInvitees} />
          </div>
        </div>
      </div>

      {/* Main row: title + category + add */}
      <div className="flex gap-2 px-4 py-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onFocus={() => setExpanded(true)}
          placeholder="New mission..."
          className="flex-1 bg-bg-tertiary text-text-primary placeholder:text-text-dim text-sm px-3 py-2 rounded-lg border border-border focus:border-accent/40 focus:outline-none transition-colors"
        />
        <select
          value={activeCategoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="bg-bg-tertiary text-text-secondary text-xs px-2 py-2 rounded-lg border border-border focus:border-accent/40 focus:outline-none transition-colors"
        >
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={!title.trim()}
          className="px-3 py-2 text-xs font-mono font-medium bg-accent/15 text-accent rounded-lg border border-accent/30 hover:bg-accent/25 disabled:opacity-30 disabled:cursor-not-allowed transition-colors btn-squish"
        >
          ADD
        </button>
      </div>
    </form>
  );
}
