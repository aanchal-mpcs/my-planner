"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePlannerStore } from "@/lib/store";
import { getLevel, getRankTitle } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: "\u25C9" },
  { href: "/calendar", label: "Calendar", icon: "\u25A6" },
  { href: "/week", label: "Week", icon: "\u2630" },
  { href: "/focus", label: "Focus", icon: "\u25CE" },
  { href: "/analytics", label: "Analytics", icon: "\u25B3" },
  { href: "/people", label: "People", icon: "\u25CB" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const stats = usePlannerStore((s) => s.stats);
  const level = getLevel(stats.xp);
  const rank = getRankTitle(stats.xp);

  return (
    <aside className="w-56 flex-shrink-0 bg-bg-secondary border-r border-border flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-border">
        <h1 className="text-sm font-mono font-bold text-accent text-glow tracking-wider">
          MISSION CONTROL
        </h1>
        <p className="text-[10px] font-mono text-text-dim mt-0.5">PLANNER v1.0</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-accent/10 text-accent border border-accent/20 glow-sm"
                  : "text-text-secondary hover:text-text-primary hover:bg-bg-hover border border-transparent"
              }`}
            >
              <span className={`text-base font-mono ${isActive ? "text-accent" : "text-text-dim"}`}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Level badge at bottom */}
      <div className="px-4 py-4 border-t border-border">
        <div className="flex items-center gap-3">
          <span className="px-2 py-1 text-xs font-mono font-bold text-accent bg-accent/10 rounded-md border border-accent/25 glow-sm">
            LVL {level}
          </span>
          <div>
            <p className="text-xs text-text-primary font-medium">{rank}</p>
            <p className="text-[10px] text-text-dim font-mono">{stats.xp} XP</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
