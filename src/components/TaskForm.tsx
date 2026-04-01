"use client";

import { useState } from "react";
import { usePlannerStore } from "@/lib/store";

export default function TaskForm() {
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const categories = usePlannerStore((s) => s.categories);
  const addTask = usePlannerStore((s) => s.addTask);

  const activeCategoryId = categoryId || categories[0]?.id || "";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !activeCategoryId) return;
    addTask(title.trim(), activeCategoryId);
    setTitle("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 px-4 py-3 border-t border-border">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
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
        className="px-3 py-2 text-xs font-mono font-medium bg-accent/15 text-accent rounded-lg border border-accent/30 hover:bg-accent/25 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        ADD
      </button>
    </form>
  );
}
