export type CategoryId = string;
export type TaskId = string;

export interface Category {
  id: CategoryId;
  name: string;
  color: string;
}

export interface Task {
  id: TaskId;
  title: string;
  categoryId: CategoryId;
  dueDate: string; // "YYYY-MM-DD"
  completed: boolean;
  createdAt: string;
  completedAt?: string;
}

export interface UserStats {
  xp: number;
  currentStreak: number;
  longestStreak: number;
  totalCompleted: number;
}
