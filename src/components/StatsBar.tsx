"use client";

import { useState, useRef, useEffect } from "react";
import { usePlannerStore } from "@/lib/store";
import { getLevel, getXpProgress, getRankTitle } from "@/lib/utils";
import CategoryManager from "./CategoryManager";

function ConfettiBurst() {
  return (
    <div className="confetti-burst">
      <span /><span /><span /><span /><span /><span />
    </div>
  );
}

export default function StatsBar() {
  const [showCategories, setShowCategories] = useState(false);
  const stats = usePlannerStore((s) => s.stats);

  const level = getLevel(stats.xp);
  const xpProgress = getXpProgress(stats.xp);
  const rank = getRankTitle(stats.xp);

  // Track previous values for animation triggers
  const prevXp = useRef(stats.xp);
  const prevLevel = useRef(level);
  const prevStreak = useRef(stats.currentStreak);

  const [xpBump, setXpBump] = useState(false);
  const [xpShimmer, setXpShimmer] = useState(false);
  const [fireBounce, setFireBounce] = useState(false);
  const [levelUp, setLevelUp] = useState(false);
  const [levelUpExiting, setLevelUpExiting] = useState(false);

  useEffect(() => {
    // XP changed
    if (stats.xp !== prevXp.current) {
      setXpBump(true);
      setXpShimmer(true);
      setTimeout(() => setXpBump(false), 300);
      setTimeout(() => setXpShimmer(false), 800);
    }
    // Level up
    if (level > prevLevel.current && prevLevel.current > 0) {
      setLevelUp(true);
      setTimeout(() => {
        setLevelUpExiting(true);
        setTimeout(() => {
          setLevelUp(false);
          setLevelUpExiting(false);
        }, 400);
      }, 2000);
    }
    // Streak changed
    if (stats.currentStreak > prevStreak.current) {
      setFireBounce(true);
      setTimeout(() => setFireBounce(false), 400);
    }

    prevXp.current = stats.xp;
    prevLevel.current = level;
    prevStreak.current = stats.currentStreak;
  }, [stats.xp, stats.currentStreak, level]);

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
          <span className={`text-xs text-text-dim font-mono whitespace-nowrap ${xpBump ? "animate-stat-bump" : ""}`}>
            {stats.xp} XP
          </span>
          <div className="flex-1 h-1.5 bg-bg-tertiary rounded-full overflow-hidden relative">
            <div
              className="h-full bg-accent rounded-full transition-all duration-500"
              style={{
                width: `${xpProgress}%`,
                boxShadow: "0 0 6px rgba(244, 114, 182, 0.3)",
              }}
            />
            {xpShimmer && (
              <div className="absolute inset-0 rounded-full animate-xp-shimmer" />
            )}
          </div>
          <span className="text-[10px] text-text-dim font-mono">
            {xpProgress}/100
          </span>
        </div>

        {/* Streak */}
        <div className="flex items-center gap-1.5">
          <span className={`text-sm ${stats.currentStreak > 0 ? "text-glow-amber" : ""} ${fireBounce ? "animate-fire-flicker" : ""}`}>
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
          className="ml-auto p-2 text-text-dim hover:text-text-secondary rounded-md hover:bg-bg-hover transition-colors btn-squish"
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

      {/* Level Up Overlay */}
      {levelUp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="animate-backdrop-in absolute inset-0 bg-black/40" />
          <div className={`relative flex flex-col items-center ${levelUpExiting ? "animate-level-up-exit" : "animate-level-up"}`}>
            {/* Expanding ring */}
            <div className="absolute w-32 h-32 rounded-full border-2 border-accent/50 animate-ring-expand" />
            <div className="text-center">
              <p className="text-accent text-sm font-mono uppercase tracking-widest mb-2">Level Up!</p>
              <p className="text-5xl font-bold text-text-primary text-glow">{level}</p>
              <p className="text-accent/70 text-xs font-mono mt-2">{rank}</p>
            </div>
            <ConfettiBurst />
          </div>
        </div>
      )}
    </>
  );
}
