import { Board, Column, Note, UserSession, DeviceRecord, NoteColorOption, BoardColorOption } from '../types';

// Storage Key Generators & Constants
export const STORAGE_PREFIX = 'violeads';
export const SESSION_KEY = `${STORAGE_PREFIX}:session`;
export const USERS_INDEX_KEY = `${STORAGE_PREFIX}:all_users`;

export const getStorageKey = {
  userPrefix: (email: string) => `${STORAGE_PREFIX}:user:${encodeURIComponent(email.trim().toLowerCase())}`,
  boards: (email: string) => `${getStorageKey.userPrefix(email)}:boards`,
  columns: (email: string) => `${getStorageKey.userPrefix(email)}:columns`,
  notes: (email: string) => `${getStorageKey.userPrefix(email)}:notes`,
  devices: (email: string) => `${getStorageKey.userPrefix(email)}:devices`,
  activeBoard: (email: string) => `${getStorageKey.userPrefix(email)}:active_board`,
};

// Preset Sticky Note Colors
export const NOTE_COLOR_PRESETS: NoteColorOption[] = [
  {
    id: 'violet',
    name: 'Royal Violet',
    bgClass: 'bg-violet-950/70 hover:bg-violet-950/90',
    borderClass: 'border-violet-500/40 hover:border-violet-400',
    textClass: 'text-violet-100',
    badgeClass: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
    glowColor: 'rgba(139, 92, 246, 0.3)',
    hex: '#8b5cf6',
  },
  {
    id: 'lavender',
    name: 'Soft Lavender',
    bgClass: 'bg-purple-950/60 hover:bg-purple-950/80',
    borderClass: 'border-purple-400/40 hover:border-purple-300',
    textClass: 'text-purple-100',
    badgeClass: 'bg-purple-500/20 text-purple-200 border-purple-400/30',
    glowColor: 'rgba(192, 132, 252, 0.3)',
    hex: '#c084fc',
  },
  {
    id: 'indigo',
    name: 'Cosmic Indigo',
    bgClass: 'bg-indigo-950/70 hover:bg-indigo-950/90',
    borderClass: 'border-indigo-500/40 hover:border-indigo-400',
    textClass: 'text-indigo-100',
    badgeClass: 'bg-indigo-500/20 text-indigo-200 border-indigo-500/30',
    glowColor: 'rgba(99, 102, 241, 0.3)',
    hex: '#6366f1',
  },
  {
    id: 'fuchsia',
    name: 'Neon Fuchsia',
    bgClass: 'bg-fuchsia-950/65 hover:bg-fuchsia-950/85',
    borderClass: 'border-fuchsia-500/40 hover:border-fuchsia-400',
    textClass: 'text-fuchsia-100',
    badgeClass: 'bg-fuchsia-500/20 text-fuchsia-200 border-fuchsia-500/30',
    glowColor: 'rgba(217, 70, 239, 0.3)',
    hex: '#d946ef',
  },
  {
    id: 'amber',
    name: 'Sunset Amber',
    bgClass: 'bg-amber-950/65 hover:bg-amber-950/85',
    borderClass: 'border-amber-500/40 hover:border-amber-400',
    textClass: 'text-amber-100',
    badgeClass: 'bg-amber-500/20 text-amber-200 border-amber-500/30',
    glowColor: 'rgba(245, 158, 11, 0.3)',
    hex: '#f59e0b',
  },
  {
    id: 'emerald',
    name: 'Mint Emerald',
    bgClass: 'bg-emerald-950/65 hover:bg-emerald-950/85',
    borderClass: 'border-emerald-500/40 hover:border-emerald-400',
    textClass: 'text-emerald-100',
    badgeClass: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30',
    glowColor: 'rgba(16, 185, 129, 0.3)',
    hex: '#10b981',
  },
  {
    id: 'sky',
    name: 'Azure Cyan',
    bgClass: 'bg-sky-950/65 hover:bg-sky-950/85',
    borderClass: 'border-sky-500/40 hover:border-sky-400',
    textClass: 'text-sky-100',
    badgeClass: 'bg-sky-500/20 text-sky-200 border-sky-500/30',
    glowColor: 'rgba(14, 165, 233, 0.3)',
    hex: '#0ea5e9',
  },
  {
    id: 'rose',
    name: 'Coral Rose',
    bgClass: 'bg-rose-950/65 hover:bg-rose-950/85',
    borderClass: 'border-rose-500/40 hover:border-rose-400',
    textClass: 'text-rose-100',
    badgeClass: 'bg-rose-500/20 text-rose-200 border-rose-500/30',
    glowColor: 'rgba(244, 63, 94, 0.3)',
    hex: '#f43f5e',
  },
];

// Board Color Themes
export const BOARD_THEMES: BoardColorOption[] = [
  {
    id: 'purple',
    name: 'Violet Nebula',
    gradient: 'from-purple-600 to-indigo-600',
    accent: '#9333ea',
    border: 'border-purple-500/30',
    bg: 'bg-purple-950/30',
  },
  {
    id: 'indigo',
    name: 'Deep Cosmos',
    gradient: 'from-indigo-600 to-blue-600',
    accent: '#4f46e5',
    border: 'border-indigo-500/30',
    bg: 'bg-indigo-950/30',
  },
  {
    id: 'fuchsia',
    name: 'Cyber Pink',
    gradient: 'from-fuchsia-600 to-purple-600',
    accent: '#c026d3',
    border: 'border-fuchsia-500/30',
    bg: 'bg-fuchsia-950/30',
  },
  {
    id: 'emerald',
    name: 'Emerald Aurora',
    gradient: 'from-emerald-600 to-teal-600',
    accent: '#059669',
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-950/30',
  },
  {
    id: 'amber',
    name: 'Sunset Glow',
    gradient: 'from-amber-600 to-rose-600',
    accent: '#d97706',
    border: 'border-amber-500/30',
    bg: 'bg-amber-950/30',
  },
];

// Helper: safe JSON parsing
function getStoredJson<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error(`Error reading key "${key}" from localStorage:`, err);
    return defaultValue;
  }
}

function setStoredJson<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving key "${key}" to localStorage:`, err);
  }
}

// ----------------------------------------------------
// 1. Session Management
// ----------------------------------------------------

export function getSession(): UserSession | null {
  return getStoredJson<UserSession | null>(SESSION_KEY, null);
}

export function saveSession(session: UserSession): void {
  setStoredJson(SESSION_KEY, session);
  // Add email to known users index for easy quick switching
  const users = getStoredJson<string[]>(USERS_INDEX_KEY, []);
  const normalized = session.email.trim().toLowerCase();
  if (!users.includes(normalized)) {
    users.push(normalized);
    setStoredJson(USERS_INDEX_KEY, users);
  }
}

export function clearSession(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SESSION_KEY);
  }
}

export function getKnownUsers(): string[] {
  return getStoredJson<string[]>(USERS_INDEX_KEY, []);
}

// ----------------------------------------------------
// 2. Device Tracking (Per Email)
// ----------------------------------------------------

export function getDevices(email: string): DeviceRecord[] {
  const key = getStorageKey.devices(email);
  return getStoredJson<DeviceRecord[]>(key, []);
}

export function recordDeviceLogin(email: string, deviceFriendlyName: string, browser?: string, os?: string): DeviceRecord[] {
  const key = getStorageKey.devices(email);
  const existing = getStoredJson<DeviceRecord[]>(key, []);
  const now = new Date().toISOString();

  // Find if this device already exists
  const existingIdx = existing.findIndex((d) => d.device === deviceFriendlyName);
  if (existingIdx >= 0) {
    existing[existingIdx].lastLogin = now;
    existing[existingIdx].browser = browser || existing[existingIdx].browser;
    existing[existingIdx].os = os || existing[existingIdx].os;
    // Move to front
    const [updated] = existing.splice(existingIdx, 1);
    existing.unshift(updated);
  } else {
    existing.unshift({
      device: deviceFriendlyName,
      lastLogin: now,
      browser,
      os,
    });
  }

  // Keep up to 20 recorded devices
  const trimmed = existing.slice(0, 20);
  setStoredJson(key, trimmed);
  return trimmed;
}

// ----------------------------------------------------
// 3. Boards Management (Per Email)
// ----------------------------------------------------

export function getBoards(email: string): Board[] {
  const key = getStorageKey.boards(email);
  return getStoredJson<Board[]>(key, []);
}

export function saveBoards(email: string, boards: Board[]): void {
  const key = getStorageKey.boards(email);
  setStoredJson(key, boards);
}

export function getActiveBoardId(email: string): string | null {
  const key = getStorageKey.activeBoard(email);
  return getStoredJson<string | null>(key, null);
}

export function setActiveBoardId(email: string, boardId: string): void {
  const key = getStorageKey.activeBoard(email);
  setStoredJson(key, boardId);
}

// ----------------------------------------------------
// 4. Columns Management (Per Email)
// ----------------------------------------------------

export function getColumns(email: string): Column[] {
  const key = getStorageKey.columns(email);
  return getStoredJson<Column[]>(key, []);
}

export function saveColumns(email: string, columns: Column[]): void {
  const key = getStorageKey.columns(email);
  setStoredJson(key, columns);
}

// ----------------------------------------------------
// 5. Notes Management (Per Email)
// ----------------------------------------------------

export function getNotes(email: string): Note[] {
  const key = getStorageKey.notes(email);
  return getStoredJson<Note[]>(key, []);
}

export function saveNotes(email: string, notes: Note[]): void {
  const key = getStorageKey.notes(email);
  setStoredJson(key, notes);
}

// ----------------------------------------------------
// 6. Data Seeding (First-time user onboarding)
// ----------------------------------------------------

export function seedInitialDataIfEmpty(email: string): { boards: Board[]; columns: Column[]; notes: Note[] } {
  let boards = getBoards(email);
  let columns = getColumns(email);
  let notes = getNotes(email);

  if (boards.length === 0) {
    const now = new Date().toISOString();
    const board1Id = 'board_' + Math.random().toString(36).substring(2, 9);
    const board2Id = 'board_' + Math.random().toString(36).substring(2, 9);

    const initialBoards: Board[] = [
      {
        id: board1Id,
        name: '🚀 Product Launch & Strategy',
        description: 'Sprint roadmap, sticky notes and milestones for VioKanban MVP.',
        color: 'purple',
        createdAt: now,
      },
      {
        id: board2Id,
        name: '🎯 Personal Growth & Habits',
        description: 'Daily priorities, books to read, and fitness goals.',
        color: 'fuchsia',
        createdAt: now,
      },
    ];

    // Columns for Board 1
    const col1_1 = 'col_' + Math.random().toString(36).substring(2, 9);
    const col1_2 = 'col_' + Math.random().toString(36).substring(2, 9);
    const col1_3 = 'col_' + Math.random().toString(36).substring(2, 9);
    const col1_4 = 'col_' + Math.random().toString(36).substring(2, 9);

    // Columns for Board 2
    const col2_1 = 'col_' + Math.random().toString(36).substring(2, 9);
    const col2_2 = 'col_' + Math.random().toString(36).substring(2, 9);
    const col2_3 = 'col_' + Math.random().toString(36).substring(2, 9);

    const initialColumns: Column[] = [
      // Board 1 columns
      { id: col1_1, boardId: board1Id, title: 'Ideas & Backlog', order: 0, color: '#8b5cf6' },
      { id: col1_2, boardId: board1Id, title: 'In Progress ⚡', order: 1, color: '#38bdf8' },
      { id: col1_3, boardId: board1Id, title: 'Review & QA 🔍', order: 2, color: '#fbbf24' },
      { id: col1_4, boardId: board1Id, title: 'Completed 🎉', order: 3, color: '#34d399' },

      // Board 2 columns
      { id: col2_1, boardId: board2Id, title: 'This Month Goals', order: 0, color: '#ec4899' },
      { id: col2_2, boardId: board2Id, title: 'Weekly Focus', order: 1, color: '#a855f7' },
      { id: col2_3, boardId: board2Id, title: 'Accomplished ✨', order: 2, color: '#10b981' },
    ];

    const initialNotes: Note[] = [
      // Board 1 - Backlog
      {
        id: 'note_' + Math.random().toString(36).substring(2, 9),
        columnId: col1_1,
        boardId: board1Id,
        title: 'Design Dark Violet Glassmorphism UI',
        description: 'Ensure contrast ratios, violet accents, smooth drag indicators, and responsive mobile layouts.',
        color: 'violet',
        tags: ['Design', 'UI/UX'],
        priority: 'high',
        order: 0,
        createdAt: now,
        startDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
        dueTime: '17:00',
        dueComplete: false,
        checklist: [
          { id: 'chk_1', text: 'Color palette definition & contrast checks', completed: true },
          { id: 'chk_2', text: 'Column responsive widths and flex track', completed: true },
          { id: 'chk_3', text: 'Trello-style date badges and checklist pill', completed: true },
          { id: 'chk_4', text: 'Fine-tune hover micro-interactions', completed: false },
        ],
      },
      {
        id: 'note_' + Math.random().toString(36).substring(2, 9),
        columnId: col1_1,
        boardId: board1Id,
        title: 'Add Keyboard Shortcuts & Quick Add',
        description: 'Support Ctrl+Enter to save notes, Escape to cancel, and fast checklist subtask input.',
        color: 'lavender',
        tags: ['Accessibility', 'Feature'],
        priority: 'medium',
        order: 1,
        createdAt: now,
        dueDate: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0],
        checklist: [
          { id: 'chk_k1', text: 'Modal keyboard listeners (Ctrl+Enter)', completed: true },
          { id: 'chk_k2', text: 'Checklist enter key for rapid subtask entry', completed: true },
        ],
      },
      {
        id: 'note_' + Math.random().toString(36).substring(2, 9),
        columnId: col1_1,
        boardId: board1Id,
        title: 'Sticky Note Color Presets & Theming',
        description: '8 rich pastel & vibrant sticky shades: Royal Violet, Amber, Emerald, Azure, Fuchsia, Coral.',
        color: 'amber',
        tags: ['Theming'],
        priority: 'low',
        order: 2,
        createdAt: now,
      },

      // Board 1 - In Progress
      {
        id: 'note_' + Math.random().toString(36).substring(2, 9),
        columnId: col1_2,
        boardId: board1Id,
        title: 'Implement Per-Email localStorage Isolation',
        description: 'Keys are scoped to violeads:user:<email>:* so multiple users on one device stay 100% private.',
        color: 'indigo',
        tags: ['Storage', 'Security'],
        priority: 'urgent',
        order: 0,
        createdAt: now,
        dueDate: new Date().toISOString().split('T')[0],
        dueTime: '18:30',
        dueComplete: false,
        checklist: [
          { id: 'chk_s1', text: 'Scoped namespacing for boards, columns, notes', completed: true },
          { id: 'chk_s2', text: 'Device audit logging and session persistence', completed: true },
          { id: 'chk_s3', text: 'Multi-account switcher without data leakage', completed: true },
        ],
      },
      {
        id: 'note_' + Math.random().toString(36).substring(2, 9),
        columnId: col1_2,
        boardId: board1Id,
        title: 'Smooth Drag and Drop Engine',
        description: 'Fluid card reordering, drag handles, drop zones, and touch-compatible reordering.',
        color: 'sky',
        tags: ['Kanban', 'Interaction'],
        priority: 'high',
        order: 1,
        createdAt: now,
        dueDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
        dueComplete: false,
      },

      // Board 1 - Review
      {
        id: 'note_' + Math.random().toString(36).substring(2, 9),
        columnId: col1_3,
        boardId: board1Id,
        title: 'Device & Session Tracking Verification',
        description: 'Records browser, OS, and device logins per email to display active session history.',
        color: 'fuchsia',
        tags: ['Session', 'Audit'],
        priority: 'medium',
        order: 0,
        createdAt: now,
        dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
        dueTime: '12:00',
      },

      // Board 1 - Completed
      {
        id: 'note_' + Math.random().toString(36).substring(2, 9),
        columnId: col1_4,
        boardId: board1Id,
        title: 'Setup VioKanban Architecture & Data Model',
        description: 'Modular React components, custom hooks, and Tailwind glassmorphism design system.',
        color: 'emerald',
        tags: ['Core', 'Completed'],
        priority: 'high',
        order: 0,
        completed: true,
        dueComplete: true,
        dueDate: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0],
        checklist: [
          { id: 'chk_c1', text: 'TypeScript interfaces and data contracts', completed: true },
          { id: 'chk_c2', text: 'Responsive sidebar with board switcher', completed: true },
          { id: 'chk_c3', text: 'Trello-style date calculation utility', completed: true },
        ],
        createdAt: now,
      },

      // Board 2 - Goals
      {
        id: 'note_' + Math.random().toString(36).substring(2, 9),
        columnId: col2_1,
        boardId: board2Id,
        title: 'Read "Atomic Habits"',
        description: 'Focus on 1% daily improvements and environment design.',
        color: 'rose',
        tags: ['Reading', 'Habits'],
        priority: 'medium',
        order: 0,
        createdAt: now,
      },
      {
        id: 'note_' + Math.random().toString(36).substring(2, 9),
        columnId: col2_2,
        boardId: board2Id,
        title: 'Morning 5km Run 3x weekly',
        description: 'Track cadence, pace, and stay hydrated!',
        color: 'amber',
        tags: ['Fitness'],
        priority: 'high',
        order: 0,
        createdAt: now,
      },
      {
        id: 'note_' + Math.random().toString(36).substring(2, 9),
        columnId: col2_3,
        boardId: board2Id,
        title: 'Drink 2.5L Water Daily',
        description: 'Maintained 14-day streak!',
        color: 'emerald',
        tags: ['Health'],
        priority: 'low',
        completed: true,
        order: 0,
        createdAt: now,
      },
    ];

    saveBoards(email, initialBoards);
    saveColumns(email, initialColumns);
    saveNotes(email, initialNotes);
    setActiveBoardId(email, board1Id);

    return { boards: initialBoards, columns: initialColumns, notes: initialNotes };
  }

  return { boards, columns, notes };
}

// ----------------------------------------------------
// 7. Backup, Export & Reset
// ----------------------------------------------------

export function exportUserData(email: string): string {
  const data = {
    email,
    exportedAt: new Date().toISOString(),
    boards: getBoards(email),
    columns: getColumns(email),
    notes: getNotes(email),
    devices: getDevices(email),
  };
  return JSON.stringify(data, null, 2);
}

export function importUserData(email: string, jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    if (!data || typeof data !== 'object') return false;
    if (Array.isArray(data.boards)) saveBoards(email, data.boards);
    if (Array.isArray(data.columns)) saveColumns(email, data.columns);
    if (Array.isArray(data.notes)) saveNotes(email, data.notes);
    return true;
  } catch (err) {
    console.error('Failed to import user data:', err);
    return false;
  }
}

export function resetUserData(email: string): { boards: Board[]; columns: Column[]; notes: Note[] } {
  const keyBoards = getStorageKey.boards(email);
  const keyCols = getStorageKey.columns(email);
  const keyNotes = getStorageKey.notes(email);
  const keyActive = getStorageKey.activeBoard(email);

  if (typeof window !== 'undefined') {
    localStorage.removeItem(keyBoards);
    localStorage.removeItem(keyCols);
    localStorage.removeItem(keyNotes);
    localStorage.removeItem(keyActive);
  }

  return seedInitialDataIfEmpty(email);
}
