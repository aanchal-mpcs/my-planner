"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { usePlannerStore } from "@/lib/store";
import { formatDate } from "@/lib/utils";

const FOCUS_DURATION = 25 * 60; // 25 minutes in seconds
const BREAK_DURATION = 5 * 60; // 5 minutes

type TimerState = "idle" | "focus" | "break";

function ConfettiBurst() {
  return (
    <div className="confetti-burst">
      <span /><span /><span /><span /><span /><span />
    </div>
  );
}

export default function FocusPage() {
  const tasks = usePlannerStore((s) => s.tasks);
  const addFocusSession = usePlannerStore((s) => s.addFocusSession);
  const stats = usePlannerStore((s) => s.stats);
  const categories = usePlannerStore((s) => s.categories);

  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [timerState, setTimerState] = useState<TimerState>("idle");
  const [secondsLeft, setSecondsLeft] = useState(FOCUS_DURATION);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [showComplete, setShowComplete] = useState(false);
  const [showXpFloat, setShowXpFloat] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const todayStr = formatDate(new Date());
  const incompleteTasks = tasks.filter((t) => !t.completed && t.dueDate >= todayStr);

  const totalFocusSessions = stats.focusSessions?.length || 0;

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  useEffect(() => {
    if (secondsLeft <= 0 && timerState === "focus") {
      clearTimer();
      // Session complete — award XP
      if (selectedTaskId) {
        addFocusSession(selectedTaskId, 25);
      }
      setSessionsCompleted((s) => s + 1);
      // Trigger celebration animations
      setShowComplete(true);
      setShowXpFloat(true);
      setShowConfetti(true);
      setTimeout(() => setShowComplete(false), 1000);
      setTimeout(() => setShowXpFloat(false), 800);
      setTimeout(() => setShowConfetti(false), 700);
      setTimerState("break");
      setSecondsLeft(BREAK_DURATION);
    } else if (secondsLeft <= 0 && timerState === "break") {
      clearTimer();
      setTimerState("idle");
      setSecondsLeft(FOCUS_DURATION);
    }
  }, [secondsLeft, timerState, selectedTaskId, addFocusSession, clearTimer]);

  const startFocus = () => {
    setTimerState("focus");
    setSecondsLeft(FOCUS_DURATION);
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => s - 1);
    }, 1000);
  };

  const startBreak = () => {
    setTimerState("break");
    setSecondsLeft(BREAK_DURATION);
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => s - 1);
    }, 1000);
  };

  const reset = () => {
    clearTimer();
    setTimerState("idle");
    setSecondsLeft(FOCUS_DURATION);
  };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const progress =
    timerState === "focus"
      ? 1 - secondsLeft / FOCUS_DURATION
      : timerState === "break"
      ? 1 - secondsLeft / BREAK_DURATION
      : 0;

  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);

  const selectedTask = tasks.find((t) => t.id === selectedTaskId);
  const selectedCategory = selectedTask
    ? categories.find((c) => c.id === selectedTask.categoryId)
    : null;
  const ringColor =
    timerState === "break" ? "#86efac" : selectedCategory?.color || "#f472b6";

  return (
    <div className="flex flex-col items-center justify-center h-full p-6">
      {/* Timer ring */}
      <div className={`relative mb-8 ${showComplete ? "animate-focus-complete" : ""}`}>
        {showConfetti && <ConfettiBurst />}
        {showXpFloat && (
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10 animate-xp-float">
            <span className="text-sm font-mono font-bold text-success">+25 XP</span>
          </div>
        )}
        <svg width="280" height="280" className="-rotate-90">
          <circle
            cx="140"
            cy="140"
            r={radius}
            fill="none"
            stroke="currentColor"
            className="text-border"
            strokeWidth="4"
          />
          {timerState !== "idle" && (
            <circle
              cx="140"
              cy="140"
              r={radius}
              fill="none"
              stroke={ringColor}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-1000"
              style={{ filter: `drop-shadow(0 0 8px ${ringColor}40)` }}
            />
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-5xl font-mono font-bold text-text-primary tracking-wider">
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </p>
          <p className="text-xs font-mono text-text-dim mt-2 uppercase tracking-widest">
            {timerState === "idle"
              ? "Ready"
              : timerState === "focus"
              ? "Focusing"
              : "Break"}
          </p>
        </div>
      </div>

      {/* Task selector */}
      {timerState === "idle" && (
        <div className="mb-6 w-full max-w-sm">
          <p className="text-[10px] font-mono text-text-dim uppercase tracking-wider mb-2 text-center">
            Select Mission
          </p>
          <select
            value={selectedTaskId}
            onChange={(e) => setSelectedTaskId(e.target.value)}
            className="w-full bg-bg-secondary text-text-primary text-sm px-4 py-3 rounded-lg border border-border focus:border-accent/40 focus:outline-none transition-colors"
          >
            <option value="">Choose a mission...</option>
            {incompleteTasks.map((t) => {
              const cat = categories.find((c) => c.id === t.categoryId);
              return (
                <option key={t.id} value={t.id}>
                  {t.title} {cat ? `(${cat.name})` : ""}
                </option>
              );
            })}
          </select>
        </div>
      )}

      {/* Selected task display during focus */}
      {timerState !== "idle" && selectedTask && (
        <div className="mb-6 px-4 py-2 rounded-lg bg-bg-secondary border border-border">
          <p className="text-sm text-text-primary">{selectedTask.title}</p>
          {selectedCategory && (
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: selectedCategory.color }}
              />
              <span className="text-xs text-text-dim">{selectedCategory.name}</span>
            </div>
          )}
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-3">
        {timerState === "idle" && (
          <button
            onClick={startFocus}
            disabled={!selectedTaskId}
            className="px-8 py-3 text-sm font-mono font-bold text-bg-primary bg-accent rounded-lg hover:bg-accent/90 disabled:opacity-30 disabled:cursor-not-allowed transition-colors glow-md btn-squish"
          >
            START FOCUS
          </button>
        )}
        {timerState === "focus" && (
          <button
            onClick={reset}
            className="px-6 py-3 text-sm font-mono font-medium text-danger border border-danger/30 rounded-lg hover:bg-danger/10 transition-colors"
          >
            ABORT
          </button>
        )}
        {timerState === "break" && (
          <>
            <button
              onClick={startFocus}
              className="px-6 py-3 text-sm font-mono font-bold text-bg-primary bg-accent rounded-lg hover:bg-accent/90 transition-colors glow-md"
            >
              NEXT SESSION
            </button>
            <button
              onClick={reset}
              className="px-6 py-3 text-sm font-mono font-medium text-text-secondary border border-border rounded-lg hover:bg-bg-hover transition-colors"
            >
              DONE
            </button>
          </>
        )}
      </div>

      {/* Session stats */}
      <div className="flex gap-8 mt-10 text-center">
        <div>
          <p className="text-2xl font-mono font-bold text-accent">{sessionsCompleted}</p>
          <p className="text-[10px] font-mono text-text-dim uppercase tracking-wider">This Session</p>
        </div>
        <div>
          <p className="text-2xl font-mono font-bold text-text-primary">{totalFocusSessions}</p>
          <p className="text-[10px] font-mono text-text-dim uppercase tracking-wider">All Time</p>
        </div>
        <div>
          <p className="text-2xl font-mono font-bold text-warning">+{sessionsCompleted * 25}</p>
          <p className="text-[10px] font-mono text-text-dim uppercase tracking-wider">XP Earned</p>
        </div>
      </div>
    </div>
  );
}
