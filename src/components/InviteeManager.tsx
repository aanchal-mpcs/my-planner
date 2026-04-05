"use client";

import { useState } from "react";
import { Invitee } from "@/lib/types";
import { generateId } from "@/lib/utils";

interface InviteeManagerProps {
  invitees: Invitee[];
  onChange: (invitees: Invitee[]) => void;
}

export default function InviteeManager({ invitees, onChange }: InviteeManagerProps) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [type, setType] = useState<"phone" | "email">("phone");

  const handleAdd = () => {
    if (!name.trim() || !contact.trim()) return;
    onChange([
      ...invitees,
      { id: generateId(), name: name.trim(), contact: contact.trim(), type },
    ]);
    setName("");
    setContact("");
  };

  const handleRemove = (id: string) => {
    onChange(invitees.filter((i) => i.id !== id));
  };

  return (
    <div className="space-y-2">
      {/* Add invitee row */}
      <div className="flex gap-1.5 items-center">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          className="w-24 bg-bg-tertiary text-text-primary placeholder:text-text-dim text-xs px-2 py-1.5 rounded-md border border-border focus:border-accent/40 focus:outline-none transition-colors"
        />
        <input
          type={type === "email" ? "email" : "tel"}
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAdd())}
          placeholder={type === "phone" ? "Phone" : "Email"}
          className="flex-1 bg-bg-tertiary text-text-primary placeholder:text-text-dim text-xs px-2 py-1.5 rounded-md border border-border focus:border-accent/40 focus:outline-none transition-colors"
        />
        <button
          type="button"
          onClick={() => setType(type === "phone" ? "email" : "phone")}
          className="px-2 py-1.5 text-[10px] font-mono text-text-secondary bg-bg-tertiary rounded-md border border-border hover:bg-bg-hover transition-colors"
          title={`Switch to ${type === "phone" ? "email" : "phone"}`}
        >
          {type === "phone" ? "TEL" : "EMAIL"}
        </button>
        <button
          type="button"
          onClick={handleAdd}
          disabled={!name.trim() || !contact.trim()}
          className="px-2 py-1.5 text-[10px] font-mono font-medium text-accent bg-accent/10 rounded-md border border-accent/25 hover:bg-accent/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          +
        </button>
      </div>

      {/* Invitee pills */}
      {invitees.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {invitees.map((inv) => (
            <span
              key={inv.id}
              className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-bg-tertiary border border-border text-text-secondary"
            >
              <span className="text-[10px]">{inv.type === "phone" ? "\u260E" : "\u2709"}</span>
              {inv.name}
              <button
                type="button"
                onClick={() => handleRemove(inv.id)}
                className="text-text-dim hover:text-danger ml-0.5 transition-colors"
              >
                &times;
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
