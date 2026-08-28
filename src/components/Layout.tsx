import React, { useState } from 'react';
import {
  Menu,
  Plus,
  Layers,
  Settings,
  HardDrive,
  Laptop,
  CheckCircle2,
  ListTodo,
  TrendingUp,
  FileJson,
  Sparkles,
} from 'lucide-react';
import { Board as BoardType, Note, Column as ColumnType, PriorityLevel, UserSession, DeviceRecord, ChecklistItem } from '../types';
import { Sidebar } from './Sidebar';
import { Board } from './Board';
import { NoteModal } from './NoteModal';
import { NewBoardModal } from './NewBoardModal';
import { DeviceModal } from './DeviceModal';
import { ExportImportModal } from './ExportImportModal';
import { BOARD_THEMES } from '../lib/storage';

interface LayoutProps {
  session: UserSession;
  devices: DeviceRecord[];
  currentDeviceName: string;
  onLogout: () => void;
  boardsHook: {
    boards: BoardType[];
    activeBoard: BoardType | null;
    activeBoardId: string | null;
    columns: ColumnType[];
    notes: Note[];
    allNotesCount: number;
    availableTags: string[];
    boardStats: { total: number; completed: number; percentage: number };
    searchQuery: string;
    setSearchQuery: (q: string) => void;
    selectedTag: string | null;
    setSelectedTag: (t: string | null) => void;
    selectedPriority: PriorityLevel | null;
    setSelectedPriority: (p: PriorityLevel | null) => void;
    selectedColor: string | null;
    setSelectedColor: (c: string | null) => void;
    selectBoard: (id: string) => void;
    createBoard: (name: string, description?: string, color?: string, template?: string) => BoardType | null;
    updateBoard: (id: string, updates: Partial<Omit<BoardType, 'id' | 'createdAt'>>) => void;
    deleteBoard: (id: string) => void;
    addColumn: (title: string) => void;
    updateColumn: (id: string, updates: Partial<Omit<ColumnType, 'id' | 'boardId'>>) => void;
    deleteColumn: (id: string) => void;
    reorderColumns: (cols: ColumnType[]) => void;
    createNote: (data: any) => Note | null;
    updateNote: (id: string, updates: any) => void;
    deleteNote: (id: string) => void;
    duplicateNote: (id: string) => void;
    toggleNoteComplete: (id: string) => void;
    moveNote: (id: string, targetColId: string, idx?: number) => void;
    resetData: () => void;
    exportData: () => string;
    importData: (json: string) => boolean;
  };
}

export const Layout: React.FC<LayoutProps> = ({
  session,
  devices,
  currentDeviceName,
  onLogout,
  boardsHook,
}) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Modals state
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [defaultColumnId, setDefaultColumnId] = useState<string | undefined>(undefined);

  const [isBoardModalOpen, setIsBoardModalOpen] = useState(false);
  const [editingBoard, setEditingBoard] = useState<BoardType | null>(null);

  const [isDevicesModalOpen, setIsDevicesModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const activeTheme =
    BOARD_THEMES.find((t) => t.id === boardsHook.activeBoard?.color) || BOARD_THEMES[0];

  // Open note creator
  const handleOpenAddNote = (columnId?: string) => {
    setEditingNote(null);
    setDefaultColumnId(columnId || boardsHook.columns[0]?.id);
    setIsNoteModalOpen(true);
  };

  // Open note editor
  const handleOpenEditNote = (note: Note) => {
    setEditingNote(note);
    setIsNoteModalOpen(true);
  };

  // Open board creator
  const handleOpenCreateBoard = () => {
    setEditingBoard(null);
    setIsBoardModalOpen(true);
  };

  // Open board editor
  const handleOpenEditBoard = (board: BoardType) => {
    setEditingBoard(board);
    setIsBoardModalOpen(true);
  };

  // Save note handler
  const handleSaveNote = (noteData: {
    title: string;
    columnId: string;
    description?: string;
    color: string;
    tags: string[];
    priority: PriorityLevel;
    startDate?: string;
    dueDate?: string;
    dueTime?: string;
    dueComplete?: boolean;
    checklist?: ChecklistItem[];
  }) => {
    if (editingNote) {
      boardsHook.updateNote(editingNote.id, noteData);
    } else {
      boardsHook.createNote(noteData);
    }
  };

  // Quick move note between columns
  const handleMoveNoteToColumn = (noteId: string, direction: 'next' | 'prev') => {
    const note = boardsHook.notes.find((n) => n.id === noteId);
    if (!note) return;
    const currentColIdx = boardsHook.columns.findIndex((c) => c.id === note.columnId);
    if (currentColIdx === -1) return;

    const targetIdx = direction === 'next' ? currentColIdx + 1 : currentColIdx - 1;
    if (targetIdx >= 0 && targetIdx < boardsHook.columns.length) {
      const targetCol = boardsHook.columns[targetIdx];
      boardsHook.moveNote(noteId, targetCol.id);
    }
  };

  // Clear completed notes in column
  const handleClearCompletedNotes = (columnId: string) => {
    const colNotes = boardsHook.notes.filter((n) => n.columnId === columnId && n.completed);
    colNotes.forEach((n) => boardsHook.deleteNote(n.id));
  };

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-[#0a0714] text-white">
      {/* Sidebar */}
      <Sidebar
        boards={boardsHook.boards}
        activeBoardId={boardsHook.activeBoardId}
        session={session}
        onSelectBoard={boardsHook.selectBoard}
        onCreateBoardClick={handleOpenCreateBoard}
        onEditBoardClick={handleOpenEditBoard}
        onDeleteBoard={boardsHook.deleteBoard}
        onOpenDevicesModal={() => setIsDevicesModalOpen(true)}
        onLogout={onLogout}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[#0d091a]">
        {/* Top Navbar */}
        <header className="h-16 border-b border-purple-500/15 bg-[#100c22]/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {/* Hamburger button on mobile */}
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-2 rounded-xl text-purple-300 hover:text-white bg-purple-950/60 border border-purple-500/20 lg:hidden shrink-0"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Active Board Title & Theme Pill */}
            {boardsHook.activeBoard && (
              <div className="min-w-0 flex items-center gap-2.5">
                <span
                  className="w-3 h-3 rounded-full shrink-0 shadow-sm ring-2 ring-white/20"
                  style={{ backgroundColor: activeTheme.accent }}
                />
                <div className="min-w-0">
                  <h2 className="text-sm sm:text-base font-bold text-white tracking-tight truncate flex items-center gap-2">
                    <span>{boardsHook.activeBoard.name}</span>
                  </h2>
                  {boardsHook.activeBoard.description && (
                    <p className="text-[11px] text-purple-300/60 truncate hidden sm:block">
                      {boardsHook.activeBoard.description}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Top Bar Right: Stats & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Progress Stats Pill */}
            {boardsHook.boardStats.total > 0 && (
              <div className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-purple-950/60 border border-purple-500/20 text-xs">
                <div className="flex items-center gap-1.5 text-purple-200 font-medium">
                  <ListTodo className="w-3.5 h-3.5 text-purple-400" />
                  <span>{boardsHook.boardStats.total} Tasks</span>
                </div>
                <div className="w-px h-3.5 bg-purple-500/30" />
                <div className="flex items-center gap-1.5 text-emerald-300 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{boardsHook.boardStats.completed} Done</span>
                </div>
                <div className="w-16 h-2 rounded-full bg-purple-900/60 overflow-hidden ml-1">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-emerald-400 rounded-full transition-all duration-300"
                    style={{ width: `${boardsHook.boardStats.percentage}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono text-purple-300 font-semibold">
                  {boardsHook.boardStats.percentage}%
                </span>
              </div>
            )}

            {/* Data & Backup button */}
            <button
              type="button"
              onClick={() => setIsExportModalOpen(true)}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-purple-950/50 hover:bg-purple-900/60 text-purple-300 hover:text-white border border-purple-500/20 text-xs font-medium transition-all flex items-center gap-1.5"
              title="Export, Import or Reset Workspace"
            >
              <FileJson className="w-4 h-4 text-purple-400" />
              <span className="hidden sm:inline">Backup & Data</span>
            </button>

            {/* Quick Add Sticky Note */}
            <button
              type="button"
              onClick={() => handleOpenAddNote()}
              className="py-1.5 px-3.5 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:via-purple-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-purple-900/40 flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden xs:inline">Add Note</span>
            </button>
          </div>
        </header>

        {/* Board Main Canvas */}
        <main className="flex-1 min-w-0 overflow-hidden relative">
          <Board
            board={boardsHook.activeBoard}
            columns={boardsHook.columns}
            notes={boardsHook.notes}
            allNotesCount={boardsHook.allNotesCount}
            availableTags={boardsHook.availableTags}
            boardStats={boardsHook.boardStats}
            searchQuery={boardsHook.searchQuery}
            setSearchQuery={boardsHook.setSearchQuery}
            selectedTag={boardsHook.selectedTag}
            setSelectedTag={boardsHook.setSelectedTag}
            selectedPriority={boardsHook.selectedPriority}
            setSelectedPriority={boardsHook.setSelectedPriority}
            selectedColor={boardsHook.selectedColor}
            setSelectedColor={boardsHook.setSelectedColor}
            onAddColumn={boardsHook.addColumn}
            onUpdateColumn={boardsHook.updateColumn}
            onDeleteColumn={boardsHook.deleteColumn}
            onClearCompletedNotes={handleClearCompletedNotes}
            onAddNote={handleOpenAddNote}
            onEditNote={handleOpenEditNote}
            onDeleteNote={boardsHook.deleteNote}
            onDuplicateNote={boardsHook.duplicateNote}
            onToggleCompleteNote={boardsHook.toggleNoteComplete}
            onToggleDueComplete={boardsHook.toggleDueComplete}
            onToggleChecklistItem={boardsHook.toggleChecklistItem}
            onChangeNoteColor={(noteId, color) => boardsHook.updateNote(noteId, { color })}
            onMoveNoteToColumn={handleMoveNoteToColumn}
            onMoveNote={boardsHook.moveNote}
            onCreateBoardClick={handleOpenCreateBoard}
          />
        </main>
      </div>

      {/* Note Modal (New & Edit) */}
      <NoteModal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        onSave={handleSaveNote}
        initialNote={editingNote}
        defaultColumnId={defaultColumnId}
        columns={boardsHook.columns}
        existingTags={boardsHook.availableTags}
      />

      {/* Board Modal (New & Edit) */}
      <NewBoardModal
        isOpen={isBoardModalOpen}
        onClose={() => setIsBoardModalOpen(false)}
        onCreate={(name, desc, col, tpl) => boardsHook.createBoard(name, desc, col, tpl)}
        onUpdate={(id, name, desc, col) => boardsHook.updateBoard(id, { name, description: desc, color: col })}
        initialBoard={editingBoard}
      />

      {/* Devices Modal */}
      <DeviceModal
        isOpen={isDevicesModalOpen}
        onClose={() => setIsDevicesModalOpen(false)}
        devices={devices}
        email={session.email}
        currentDeviceName={currentDeviceName}
      />

      {/* Export / Import / Reset Modal */}
      <ExportImportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        email={session.email}
        onExport={boardsHook.exportData}
        onImport={boardsHook.importData}
        onReset={boardsHook.resetData}
      />
    </div>
  );
};
