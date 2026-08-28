export interface UserSession {
  email: string;
  name?: string;
  device: string;
  lastLogin: string;
}

export interface DeviceRecord {
  device: string;
  lastLogin: string;
  browser?: string;
  os?: string;
  isCurrent?: boolean;
}

export interface Board {
  id: string;
  name: string;
  description?: string;
  color: string;
  createdAt: string;
  updatedAt?: string;
  icon?: string;
}

export interface Column {
  id: string;
  boardId: string;
  title: string;
  order: number;
  color?: string;
}

export type PriorityLevel = 'low' | 'medium' | 'high' | 'urgent';

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Note {
  id: string;
  columnId: string;
  boardId?: string;
  title: string;
  description?: string;
  color: string;
  tags: string[];
  order: number;
  createdAt: string;
  updatedAt?: string;
  priority?: PriorityLevel;
  startDate?: string;
  dueDate?: string;
  dueTime?: string;
  dueComplete?: boolean;
  checklist?: ChecklistItem[];
  completed?: boolean;
}

export interface NoteColorOption {
  id: string;
  name: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
  badgeClass: string;
  glowColor: string;
  hex: string;
}

export interface BoardColorOption {
  id: string;
  name: string;
  gradient: string;
  accent: string;
  border: string;
  bg: string;
}
