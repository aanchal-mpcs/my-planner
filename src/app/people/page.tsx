"use client";

import { useState } from "react";
import Link from "next/link";
import { usePlannerStore } from "@/lib/store";
import { formatDisplayDate } from "@/lib/utils";
import { Invitee } from "@/lib/types";

interface PersonEntry {
  name: string;
  contact: string;
  type: "phone" | "email";
  missions: { id: string; title: string; dueDate: string }[];
  lastInvited: string;
}

export default function PeoplePage() {
  const tasks = usePlannerStore((s) => s.tasks);
  const [search, setSearch] = useState("");

  // Aggregate all invitees across all tasks
  const peopleMap = new Map<string, PersonEntry>();

  tasks.forEach((task) => {
    if (!task.invitees) return;
    task.invitees.forEach((inv: Invitee) => {
      const key = inv.contact.toLowerCase();
      const existing = peopleMap.get(key);
      const mission = { id: task.id, title: task.title, dueDate: task.dueDate };

      if (existing) {
        existing.missions.push(mission);
        if (task.createdAt > existing.lastInvited) {
          existing.lastInvited = task.createdAt;
          existing.name = inv.name; // Use latest name
        }
      } else {
        peopleMap.set(key, {
          name: inv.name,
          contact: inv.contact,
          type: inv.type,
          missions: [mission],
          lastInvited: task.createdAt,
        });
      }
    });
  });

  let people = Array.from(peopleMap.values()).sort(
    (a, b) => b.missions.length - a.missions.length
  );

  if (search.trim()) {
    const q = search.toLowerCase();
    people = people.filter(
      (p) => p.name.toLowerCase().includes(q) || p.contact.toLowerCase().includes(q)
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold font-mono text-glow text-accent">People</h2>
          <p className="text-xs text-text-dim font-mono mt-0.5">
            {people.length} contact{people.length === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search contacts..."
          className="w-full bg-bg-secondary text-text-primary placeholder:text-text-dim text-sm px-4 py-3 rounded-lg border border-border focus:border-accent/40 focus:outline-none transition-colors"
        />
      </div>

      {/* People list */}
      {people.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-text-dim">
          <span className="text-4xl mb-3 opacity-30">&#128101;</span>
          <p className="text-sm font-mono">No contacts yet</p>
          <p className="text-xs mt-1">Invite people to missions and they&apos;ll appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {people.map((person) => (
            <PersonCard key={person.contact} person={person} />
          ))}
        </div>
      )}
    </div>
  );
}

function PersonCard({ person }: { person: PersonEntry }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-bg-secondary rounded-xl border border-border overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-bg-hover transition-colors text-left"
      >
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-bg-tertiary flex items-center justify-center text-sm font-mono text-accent border border-accent/20">
          {person.name.charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text-primary">{person.name}</p>
          <p className="text-xs text-text-dim flex items-center gap-1.5">
            <span className="text-[10px]">{person.type === "phone" ? "\u260E" : "\u2709"}</span>
            {person.contact}
          </p>
        </div>

        <div className="text-right flex-shrink-0">
          <p className="text-xs font-mono text-accent">{person.missions.length} mission{person.missions.length === 1 ? "" : "s"}</p>
          <p className="text-[10px] text-text-dim">
            {expanded ? "\u25B2" : "\u25BC"}
          </p>
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-4 border-t border-border pt-3">
          <p className="text-[10px] font-mono text-text-dim uppercase tracking-wider mb-2">
            Shared Missions
          </p>
          <div className="space-y-1.5">
            {person.missions
              .sort((a, b) => b.dueDate.localeCompare(a.dueDate))
              .map((m) => (
                <Link
                  key={m.id}
                  href={`/mission/${m.id}`}
                  className="flex items-center justify-between px-3 py-2 rounded-md bg-bg-tertiary hover:bg-bg-hover transition-colors"
                >
                  <span className="text-xs text-text-primary truncate">{m.title}</span>
                  <span className="text-[10px] text-text-dim font-mono flex-shrink-0 ml-2">
                    {formatDisplayDate(m.dueDate)}
                  </span>
                </Link>
              ))}
          </div>

          {/* Quick re-invite */}
          <div className="mt-3">
            <a
              href={
                person.type === "phone"
                  ? `sms:${person.contact}`
                  : `mailto:${person.contact}`
              }
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium text-accent bg-accent/10 rounded-lg border border-accent/25 hover:bg-accent/20 transition-colors"
            >
              {person.type === "phone" ? "SEND SMS" : "SEND EMAIL"}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
