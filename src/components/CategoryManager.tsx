"use client";

import { useState } from "react";
import { usePlannerStore } from "@/lib/store";

const PRESET_COLORS = [
  "#f472b6", // pink
  "#86efac", // green
  "#fdba74", // orange
  "#c084fc", // purple
  "#fcd34d", // amber
  "#fb7185", // rose
  "#a78bfa", // violet
  "#f9a8d4", // light pink
];

interface CategoryManagerProps {
  onClose: () => void;
}

export default function CategoryManager({ onClose }: CategoryManagerProps) {
  const categories = usePlannerStore((s) => s.categories);
  const addCategory = usePlannerStore((s) => s.addCategory);
  const deleteCategory = usePlannerStore((s) => s.deleteCategory);

  const [newName, setNewName] = useState("");
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);

  const handleAdd = () => {
    if (!newName.trim()) return;
    addCategory(newName.trim(), selectedColor);
    setNewName("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-bg-secondary border border-border rounded-xl p-6 glow-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-text-primary">Categories</h3>
          <button
            onClick={onClose}
            className="text-text-dim hover:text-text-secondary transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Category list */}
        <div className="space-y-2 mb-5 max-h-60 overflow-auto">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center gap-3 px-3 py-2 rounded-lg bg-bg-tertiary"
            >
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: cat.color }}
              />
              <span className="flex-1 text-sm text-text-primary">{cat.name}</span>
              <button
                onClick={() => deleteCategory(cat.id)}
                className="text-text-dim hover:text-danger transition-colors p-1"
              >
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                  <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* Add new category */}
        <div className="border-t border-border pt-4">
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="Category name..."
              className="flex-1 bg-bg-tertiary text-text-primary placeholder:text-text-dim text-sm px-3 py-2 rounded-lg border border-border focus:border-accent/40 focus:outline-none transition-colors"
            />
            <button
              onClick={handleAdd}
              disabled={!newName.trim()}
              className="px-3 py-2 text-xs font-mono font-medium bg-accent/15 text-accent rounded-lg border border-accent/30 hover:bg-accent/25 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              ADD
            </button>
          </div>
          <div className="flex gap-2">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`w-6 h-6 rounded-full transition-transform ${
                  selectedColor === color ? "scale-125 ring-2 ring-white/30" : "hover:scale-110"
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
