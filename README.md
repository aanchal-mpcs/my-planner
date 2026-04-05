# Mission Control Planner

A gamified personal planner with a dark pink "mission control" aesthetic. Built with Next.js 16, React 19, TypeScript, Tailwind CSS v4, and Zustand. Features XP progression, streaks, focus timer, confetti celebrations, and staggered page animations — all with pure CSS.

## Live Links

- **Vercel**: [https://my-planner-chi.vercel.app](https://my-planner-chi.vercel.app)
- **GitHub**: [https://github.com/aanchal-mpcs/my-planner](https://github.com/aanchal-mpcs/my-planner)

## Reflection Questions

### 1. What's in your CLAUDE.md? How did your plan shape what Claude built — and how did it evolve as you worked?

My CLAUDE.md serves as a comprehensive blueprint of the entire application — it documents the tech stack (Next.js 16, Zustand, Tailwind v4), every route and its corresponding file, the shared layout architecture (AppShell, Sidebar, StatsBar), the full data model (Task, Category, Invitee, FocusSession, UserStats), gamification rules (XP amounts, leveling formula, rank thresholds, streak logic), a component responsibility map, and the color palette.

This file shaped Claude's output significantly. When I asked for a pink theme, Claude knew exactly which files contained hardcoded color values because CLAUDE.md listed every component and its purpose. When planning animations, Claude could identify which user interactions lacked feedback (task completion, level-ups, page transitions) because the gamification rules and component roles were already documented. The CLAUDE.md evolved as we worked — it initially described a blue/cyan palette, and after the theme change the colors section became outdated relative to the actual code, but the structural documentation (routes, components, data model) remained accurate and continued to guide Claude's decisions throughout.

### 2. Exercise your mental model: Pick one page in your app. Trace the path.

**The Calendar page (`/calendar`)**

- **Route**: `/calendar` maps to `src/app/calendar/page.tsx`
- **Rendering**: The page component renders two main sections side-by-side — the `Calendar` grid component and the `TaskPanel` sidebar
- **Layout wrapper**: It's wrapped by the shared `AppShell` (`src/components/AppShell.tsx`), which provides the `Sidebar` navigation on the left, the `StatsBar` across the top, and now a `cascade-enter` div keyed to `pathname` for staggered entrance animations
- **Calendar component** (`src/components/Calendar.tsx`): Manages month navigation state, generates a grid of dates, and renders a `DayCell` for each day
- **DayCell** (`src/components/DayCell.tsx`): Displays the day number, colored category dots for tasks on that day, and a completion checkmark. Clicking a cell calls `setSelectedDate` in the Zustand store
- **TaskPanel** (`src/components/TaskPanel.tsx`): Reads `selectedDate` and `tasks` from the Zustand store (`src/lib/store.ts`), filters tasks for that date, and renders a `CompletionRing` SVG, a list of `TaskItem` components, and the `TaskForm` at the bottom
- **TaskItem** (`src/components/TaskItem.tsx`): Each task row with checkbox, category dot, metadata. On completion it triggers confetti and check-pop animations via React state toggling CSS classes
- **TaskForm** (`src/components/TaskForm.tsx`): Expandable inline form that calls `addTask` on the Zustand store
- **Data**: All data lives in the Zustand store (`src/lib/store.ts`) — in-memory only, no persistence. The store holds `tasks`, `categories`, `stats`, and `selectedDate`. Actions like `addTask`, `toggleTask`, and `deleteTask` mutate this state, and all subscribed components re-render automatically

### 3. Describe one thing that happened when Claude tested your app with Playwright MCP.

When Claude used Playwright MCP to add a task and complete it on the calendar page, the build-verify loop caught something important: after completing the task, the screenshot showed the XP bar had jumped to 60 XP (not just 10), confirming that both the +10 XP for task completion AND the +50 XP bonus for clearing all daily tasks fired correctly. The stats bar showed "1 day streak" and "1 missions complete," and the completion ring turned green showing 1/1. This visual verification through Playwright meant we could confirm the entire chain — Zustand state update, XP calculation, streak detection, UI re-render, and animation triggers — all worked end-to-end without manually opening a browser.

The build-verify loop fundamentally changed the workflow: instead of writing code and hoping it works, each change was immediately tested visually. When we switched the color theme from blue to pink, Playwright took a screenshot that confirmed the new palette rendered correctly across all components. When we added animations, Playwright navigated between pages to verify the cascade entrance worked and added/completed tasks to verify confetti and stat animations fired. This tight feedback loop — code, screenshot, verify, adjust — made it possible to confidently ship changes that would otherwise require tedious manual testing across multiple pages and interaction flows.
