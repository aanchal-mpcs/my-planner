"use client";

import { useState } from "react";
import { usePlannerStore } from "@/lib/store";
import { getLevel, getXpProgress, getRankTitle } from "@/lib/utils";
import CategoryManager from "./CategoryManager";

export default function StatsBar() {
  const [showCategories, setShowCategories] = useState(false);
  const stats = usePlannerStore((s) => s.stats);

  const level = getLevel(stats.xp);
  const xpProgress = getXpProgress(stats.xp);
  const rank = getRankTitle(stats.xp);

  return (
    <>
      <div className="flex items-center gap-6 px-6 py-3 bg-bg-secondary border-b border-border-glow">
        {/* Level badge */}
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 text-xs font-mono font-bold text-accent bg-accent/10 rounded-md border border-accent/25 glow-sm">
            LVL {level}
          </span>
          <span className="text-xs text-text-dim font-mono">{rank}</span>
        </div>

        {/* XP progress bar */}
        <div className="flex items-center gap-2 flex-1 max-w-xs">
          <span className="text-xs text-text-dim font-mono whitespace-nowrap">
            {stats.xp} XP
          </span>
          <div className="flex-1 h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-500"
              style={{
                width: `${xpProgress}%`,
                boxShadow: "0 0 6px rgba(244, 114, 182, 0.3)",
              }}
            />
          </div>
          <span className="text-[10px] text-text-dim font-mono">
            {xpProgress}/100
          </span>
        </div>

        {/* Streak */}
        <div className="flex items-center gap-1.5">
          <span className={`text-sm ${stats.currentStreak > 0 ? "text-glow-amber" : ""}`}>
            &#128293;
          </span>
          <span
            className={`text-xs font-mono ${
              stats.currentStreak > 0 ? "text-warning" : "text-text-dim"
            }`}
          >
            {stats.currentStreak} day streak
          </span>
        </div>

        {/* Total completed */}
        <span className="text-xs text-text-dim font-mono">
          {stats.totalCompleted} missions complete
        </span>

        {/* Category manager button */}
        <button
          onClick={() => setShowCategories(true)}
          className="ml-auto p-2 text-text-dim hover:text-text-secondary rounded-md hover:bg-bg-hover transition-colors"
          title="Manage categories"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="4" cy="4" r="2" fill="currentColor" />
            <circle cx="12" cy="4" r="2" fill="currentColor" />
            <circle cx="4" cy="12" r="2" fill="currentColor" />
            <circle cx="12" cy="12" r="2" fill="currentColor" />
          </svg>
        </button>
      </div>

      {showCategories && <CategoryManager onClose={() => setShowCategories(false)} />}
    </>
  );
}
