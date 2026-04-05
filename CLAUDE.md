# Mission Control Planner

A gamified personal planner built with Next.js 16, React 19, TypeScript, and Tailwind CSS v4. Dark "mission control" aesthetic with muted neon accents.

## Tech Stack

- **Framework**: Next.js 16 (App Router, `src/app/`)
- **State**: Zustand (in-memory only, no persistence — resets on refresh)
- **Styling**: Tailwind CSS v4 with `@theme inline` in `globals.css` (no `tailwind.config.ts`)
- **Deployment**: Vercel (auto-deploys from `main`)

## Commands

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run lint` — run ESLint

## Pages / Routes

| Route | File | Description |
|-------|------|-------------|
| `/` | `src/app/page.tsx` | Dashboard — today's missions, overdue alerts, XP/streak cards, upcoming tasks |
| `/calendar` | `src/app/calendar/page.tsx` | Monthly calendar grid + task panel sidebar for selected day |
| `/week` | `src/app/week/page.tsx` | 7-day column view with completion bars per day |
| `/mission/[id]` | `src/app/mission/[id]/page.tsx` | Mission detail — metadata, invitees with SMS/email invite actions |
| `/focus` | `src/app/focus/page.tsx` | Pomodoro focus timer (25min), select a mission, +25 XP per session |
| `/analytics` | `src/app/analytics/page.tsx` | 14-day activity chart, category breakdown, day-of-week distribution, rank progression |
| `/people` | `src/app/people/page.tsx` | Contact directory aggregated from task invitees, shared mission history, re-invite |

## Layout

All pages share a common shell (`src/components/AppShell.tsx`):
- **Sidebar** (`src/components/Sidebar.tsx`) — nav links, level badge
- **StatsBar** (`src/components/StatsBar.tsx`) — XP bar, streak, total completed, category manager button

## Data Model

All types defined in `src/lib/types.ts`. State managed in `src/lib/store.ts`.

### Task
- `id`, `title`, `categoryId`, `dueDate` (YYYY-MM-DD), `completed`, `createdAt`, `completedAt?`
- `location?`, `time?` (HH:MM), `invitees?` (array of Invitee)

### Category
- `id`, `name`, `color` (hex)
- 5 defaults: Work (cyan), Personal (green), Health (orange), Learning (purple), Errands (amber)

### Invitee
- `id`, `name`, `contact` (phone or email string), `type` ("phone" | "email")

### FocusSession
- `id`, `taskId`, `duration` (minutes), `completedAt`

### UserStats
- `xp`, `currentStreak`, `longestStreak`, `totalCompleted`, `focusSessions[]`

## Gamification

- **+10 XP** per task completed, **+50 XP bonus** for clearing all tasks in a day
- **+25 XP** per completed focus session (25 min Pomodoro)
- **Level** = `floor(xp / 100) + 1`
- **Ranks**: Cadet (1-2), Officer (3-5), Commander (6-9), Admiral (10+)
- **Streaks**: consecutive days with all tasks completed (validated on app load)

## Key Components

| Component | Purpose |
|-----------|---------|
| `Calendar.tsx` | Monthly grid with navigation, task dot indicators per day |
| `DayCell.tsx` | Single calendar cell — colored dots, completion glow |
| `TaskPanel.tsx` | Selected day's task list with SVG completion ring |
| `TaskItem.tsx` | Task row — checkbox, category dot, time/location/invitee display |
| `TaskForm.tsx` | Expandable inline form — title, category, location, time, invitees |
| `InviteeManager.tsx` | Add/remove invitees with name, contact, phone/email toggle |
| `CategoryManager.tsx` | Modal to add/delete categories with preset color swatches |

## Color Palette

- **Backgrounds**: `#0a0e17` (primary), `#111827` (secondary), `#1a2235` (tertiary)
- **Text**: `#e2e8f0` (primary), `#94a3b8` (secondary), `#475569` (dim)
- **Accents**: cyan `#00e5ff`, green `#76ff03`, orange `#ff6e40`, purple `#e040fb`, amber `#ffd740`, red `#ff5252`, blue `#448aff`
