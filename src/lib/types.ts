export type CategoryId = string;
export type TaskId = string;

export interface Category {
  id: CategoryId;
  name: string;
  color: string;
}

export interface Invitee {
  id: string;
  name: string;
  contact: string;
  type: "phone" | "email";
}

export interface Task {
  id: TaskId;
  title: string;
  categoryId: CategoryId;
  dueDate: string; // "YYYY-MM-DD"
  completed: boolean;
  createdAt: string;
  completedAt?: string;
  location?: string;
  time?: string; // "HH:MM"
  invitees?: Invitee[];
}

export interface FocusSession {
  id: string;
  taskId: TaskId;
  duration: number; // minutes
  completedAt: string; // ISO datetime
}

export interface UserStats {
  xp: number;
  currentStreak: number;
  longestStreak: number;
  totalCompleted: number;
  focusSessions: FocusSession[];
}
