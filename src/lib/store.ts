import { create } from "zustand";
import { Category, FocusSession, Invitee, Task, UserStats } from "./types";
import {
  DEFAULT_CATEGORIES,
  calculateStreak,
  formatDate,
  generateId,
  getLevel,
} from "./utils";

interface PlannerState {
  tasks: Task[];
  categories: Category[];
  stats: UserStats;
  selectedDate: string;
  currentMonth: string; // "YYYY-MM" to avoid Date serialization issues
}

interface PlannerActions {
  setSelectedDate: (date: string) => void;
  setCurrentMonth: (year: number, month: number) => void;
  navigateMonth: (delta: number) => void;
  addTask: (title: string, categoryId: string, opts?: { location?: string; time?: string; invitees?: Invitee[] }) => void;
  toggleTask: (taskId: string) => void;
  deleteTask: (taskId: string) => void;
  editTask: (taskId: string, updates: Partial<Pick<Task, "title" | "categoryId" | "dueDate" | "location" | "time" | "invitees">>) => void;
  addCategory: (name: string, color: string) => void;
  deleteCategory: (categoryId: string) => void;
  addFocusSession: (taskId: string, duration: number) => void;
  recalculateStreak: () => void;
}

type Store = PlannerState & PlannerActions;

const today = formatDate(new Date());
const now = new Date();
const initialMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

export const usePlannerStore = create<Store>()(
    (set, get) => ({
      tasks: [],
      categories: DEFAULT_CATEGORIES,
      stats: { xp: 0, currentStreak: 0, longestStreak: 0, totalCompleted: 0, focusSessions: [] },
      selectedDate: today,
      currentMonth: initialMonth,

      setSelectedDate: (date) => set({ selectedDate: date }),

      setCurrentMonth: (year, month) =>
        set({
          currentMonth: `${year}-${String(month + 1).padStart(2, "0")}`,
        }),

      navigateMonth: (delta) =>
        set((state) => {
          const [y, m] = state.currentMonth.split("-").map(Number);
          const d = new Date(y, m - 1 + delta, 1);
          return {
            currentMonth: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
          };
        }),

      addTask: (title, categoryId, opts) =>
        set((state) => ({
          tasks: [
            ...state.tasks,
            {
              id: generateId(),
              title,
              categoryId,
              dueDate: state.selectedDate,
              completed: false,
              createdAt: new Date().toISOString(),
              ...(opts?.location && { location: opts.location }),
              ...(opts?.time && { time: opts.time }),
              ...(opts?.invitees?.length && { invitees: opts.invitees }),
            },
          ],
        })),

      toggleTask: (taskId) =>
        set((state) => {
          const task = state.tasks.find((t) => t.id === taskId);
          if (!task) return state;

          const wasCompleted = task.completed;
          const updatedTasks = state.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  completed: !t.completed,
                  completedAt: !t.completed ? new Date().toISOString() : undefined,
                }
              : t
          );

          let xpDelta = wasCompleted ? -10 : 10;

          // Check if all tasks for this date are now complete
          const dateTasks = updatedTasks.filter((t) => t.dueDate === task.dueDate);
          const allComplete = dateTasks.every((t) => t.completed);
          const wasAllComplete = state.tasks
            .filter((t) => t.dueDate === task.dueDate)
            .every((t) => t.completed);

          if (allComplete && !wasAllComplete) xpDelta += 50;
          if (!allComplete && wasAllComplete) xpDelta -= 50;

          const newXp = Math.max(0, state.stats.xp + xpDelta);
          const newTotalCompleted = state.stats.totalCompleted + (wasCompleted ? -1 : 1);

          const { current, longest } = calculateStreak(updatedTasks);

          return {
            tasks: updatedTasks,
            stats: {
              ...state.stats,
              xp: newXp,
              currentStreak: current,
              longestStreak: Math.max(longest, state.stats.longestStreak),
              totalCompleted: Math.max(0, newTotalCompleted),
            },
          };
        }),

      deleteTask: (taskId) =>
        set((state) => {
          const task = state.tasks.find((t) => t.id === taskId);
          if (!task) return state;

          const updatedTasks = state.tasks.filter((t) => t.id !== taskId);
          let xpDelta = 0;
          let completedDelta = 0;

          if (task.completed) {
            xpDelta -= 10;
            completedDelta -= 1;

            // Check if removing this completed task breaks the "all complete" bonus
            // Actually, if all remaining tasks are still complete, the bonus stays
            const remainingDateTasks = updatedTasks.filter((t) => t.dueDate === task.dueDate);
            const wasAllComplete = state.tasks
              .filter((t) => t.dueDate === task.dueDate)
              .every((t) => t.completed);
            const stillAllComplete =
              remainingDateTasks.length === 0 ||
              remainingDateTasks.every((t) => t.completed);

            if (wasAllComplete && !stillAllComplete) xpDelta -= 50;
          }

          const newXp = Math.max(0, state.stats.xp + xpDelta);
          const { current, longest } = calculateStreak(updatedTasks);

          return {
            tasks: updatedTasks,
            stats: {
              ...state.stats,
              xp: newXp,
              currentStreak: current,
              longestStreak: Math.max(longest, state.stats.longestStreak),
              totalCompleted: Math.max(0, state.stats.totalCompleted + completedDelta),
            },
          };
        }),

      editTask: (taskId, updates) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId ? { ...t, ...updates } : t
          ),
        })),

      addCategory: (name, color) =>
        set((state) => ({
          categories: [
            ...state.categories,
            { id: generateId(), name, color },
          ],
        })),

      deleteCategory: (categoryId) =>
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== categoryId),
        })),

      addFocusSession: (taskId, duration) =>
        set((state) => {
          const session: FocusSession = {
            id: generateId(),
            taskId,
            duration,
            completedAt: new Date().toISOString(),
          };
          return {
            stats: {
              ...state.stats,
              xp: state.stats.xp + 25,
              focusSessions: [...(state.stats.focusSessions || []), session],
            },
          };
        }),

      recalculateStreak: () =>
        set((state) => {
          const { current, longest } = calculateStreak(state.tasks);
          return {
            stats: {
              ...state.stats,
              currentStreak: current,
              longestStreak: Math.max(longest, state.stats.longestStreak),
            },
          };
        }),
    })
);

// Helper selectors
export const useTasksForDate = (date: string) =>
  usePlannerStore((state) => state.tasks.filter((t) => t.dueDate === date));

export const useCategory = (categoryId: string) =>
  usePlannerStore((state) => state.categories.find((c) => c.id === categoryId));

export const getCurrentMonthYear = (monthStr: string) => {
  const [y, m] = monthStr.split("-").map(Number);
  return { year: y, month: m - 1 };
};
