import React, { useState } from 'react';
import {
  Plus,
  Search,
  Tag,
  Sparkles,
  SlidersHorizontal,
  CheckCircle2,
  ListTodo,
  Calendar,
  X,
  Layers,
  LayoutGrid,
} from 'lucide-react';
import { Board as BoardType, Column as ColumnType, Note, PriorityLevel } from '../types';
import { Column } from './Column';
import { NOTE_COLOR_PRESETS } from '../lib/storage';

interface BoardProps {
  board: BoardType | null;
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
  onAddColumn: (title: string) => void;
  onUpdateColumn: (columnId: string, updates: Partial<Omit<ColumnType, 'id' | 'boardId'>>) => void;
  onDeleteColumn: (columnId: string) => void;
  onClearCompletedNotes: (columnId: string) => void;
  onAddNote: (columnId?: string) => void;
  onEditNote: (note: Note) => void;
  onDeleteNote: (noteId: string) => void;
  onDuplicateNote: (noteId: string) => void;
  onToggleCompleteNote: (noteId: string) => void;
  onToggleDueComplete?: (noteId: string) => void;
  onToggleChecklistItem?: (noteId: string, itemId: string) => void;
  onChangeNoteColor: (noteId: string, color: string) => void;
  onMoveNoteToColumn: (noteId: string, direction: 'next' | 'prev') => void;
  onMoveNote: (noteId: string, targetColumnId: string, targetIndex?: number) => void;
  onCreateBoardClick: () => void;
}

export const Board: React.FC<BoardProps> = ({
  board,
  columns,
  notes,
  allNotesCount,
  availableTags,
  boardStats,
  searchQuery,
  setSearchQuery,
  selectedTag,
  setSelectedTag,
  selectedPriority,
  setSelectedPriority,
  selectedColor,
  setSelectedColor,
  onAddColumn,
  onUpdateColumn,
  onDeleteColumn,
  onClearCompletedNotes,
  onAddNote,
  onEditNote,
  onDeleteNote,
  onDuplicateNote,
  onToggleCompleteNote,
  onToggleDueComplete,
  onToggleChecklistItem,
  onChangeNoteColor,
  onMoveNoteToColumn,
  onMoveNote,
  onCreateBoardClick,
}) => {
  const [newColTitle, setNewColTitle] = useState('');
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [draggedNoteInfo, setDraggedNoteInfo] = useState<{
    noteId: string;
    sourceColId: string;
  } | null>(null);

  // Drag and Drop handlers
  const handleDragStartNote = (e: React.DragEvent, noteId: string, sourceColId: string) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ noteId, sourceColId }));
    e.dataTransfer.effectAllowed = 'move';
    setDraggedNoteInfo({ noteId, sourceColId });
  };

  const handleDragEndNote = () => {
    setDraggedNoteInfo(null);
  };

  const handleDropNote = (e: React.DragEvent, targetColId: string, targetIndex?: number) => {
    e.preventDefault();
    try {
      const data = e.dataTransfer.getData('text/plain');
      let noteId = draggedNoteInfo?.noteId;
      if (!noteId && data) {
        const parsed = JSON.parse(data);
        noteId = parsed.noteId;
      }
      if (noteId) {
        onMoveNote(noteId, targetColId, targetIndex);
      }
    } catch (err) {
      if (draggedNoteInfo?.noteId) {
        onMoveNote(draggedNoteInfo.noteId, targetColId, targetIndex);
      }
    }
    setDraggedNoteInfo(null);
  };

  const handleColumnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newColTitle.trim()) {
      onAddColumn(newColTitle.trim());
      setNewColTitle('');
      setIsAddingColumn(false);
    }
  };

  if (!board) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4 shadow-xl">
          <Layers className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">No Active Board Selected</h2>
        <p className="text-sm text-purple-300/70 max-w-sm mb-6">
          Create your first Kanban board to organize tasks with colorful sticky notes.
        </p>
        <button
          type="button"
          onClick={onCreateBoardClick}
          className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium text-sm shadow-lg shadow-purple-900/50 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Board</span>
        </button>
      </div>
    );
  }

  const hasActiveFilters = searchQuery || selectedTag || selectedPriority || selectedColor;

  return (
    <div className="h-full flex flex-col min-w-0">
      {/* Board Top Filter / Search Bar */}
      <div className="p-4 border-b border-purple-500/15 bg-[#0f0c1e]/60 backdrop-blur-md shrink-0 flex flex-wrap items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-purple-400/50">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search sticky notes by title, tags or content..."
            className="w-full pl-9 pr-8 py-1.5 rounded-xl bg-purple-950/40 border border-purple-500/20 text-xs text-white placeholder-purple-400/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-purple-400/60 hover:text-purple-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters and Tags */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Priority filter */}
          <select
            value={selectedPriority || ''}
            onChange={(e) => setSelectedPriority((e.target.value as PriorityLevel) || null)}
            className="px-2.5 py-1.5 rounded-xl bg-purple-950/40 border border-purple-500/20 text-xs text-purple-200 focus:outline-none cursor-pointer"
          >
            <option value="">All Priorities</option>
            <option value="urgent">🔥 Urgent</option>
            <option value="high">⚡ High</option>
            <option value="medium">📌 Medium</option>
            <option value="low">🌱 Low</option>
          </select>

          {/* Color filter */}
          <select
            value={selectedColor || ''}
            onChange={(e) => setSelectedColor(e.target.value || null)}
            className="px-2.5 py-1.5 rounded-xl bg-purple-950/40 border border-purple-500/20 text-xs text-purple-200 focus:outline-none cursor-pointer"
          >
            <option value="">All Colors</option>
            {NOTE_COLOR_PRESETS.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.name}
              </option>
            ))}
          </select>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedTag(null);
                setSelectedPriority(null);
                setSelectedColor(null);
              }}
              className="px-2.5 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-xs text-purple-200 border border-purple-500/30 flex items-center gap-1 transition-colors"
            >
              <X className="w-3 h-3" />
              <span>Clear filters</span>
            </button>
          )}

          {/* "+ New Sticky Note" quick action */}
          <button
            type="button"
            onClick={() => onAddNote(columns[0]?.id)}
            className="py-1.5 px-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium text-xs shadow-md shadow-purple-900/40 flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Note</span>
          </button>
        </div>
      </div>

      {/* Available Tag Pills (if any exist) */}
      {availableTags.length > 0 && (
        <div className="px-4 py-2 border-b border-purple-500/10 bg-[#0d0a1a]/40 flex items-center gap-1.5 overflow-x-auto shrink-0 text-xs">
          <span className="text-[11px] text-purple-400/60 uppercase font-mono mr-1">Tags:</span>
          {availableTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium border transition-all ${
                selectedTag === tag
                  ? 'bg-purple-600 text-white border-purple-400 shadow-sm shadow-purple-600/40'
                  : 'bg-purple-950/40 hover:bg-purple-900/40 text-purple-300 border-purple-500/20'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* Kanban Board Columns Track */}
      <div className="flex-1 p-4 sm:p-6 overflow-x-auto overflow-y-hidden">
        <div className="flex items-start gap-4 h-full">
          {columns.map((column, index) => (
            <Column
              key={column.id}
              column={column}
              index={index}
              totalColumns={columns.length}
              notes={notes}
              onAddNote={onAddNote}
              onEditNote={onEditNote}
              onDeleteNote={onDeleteNote}
              onDuplicateNote={onDuplicateNote}
              onToggleCompleteNote={onToggleCompleteNote}
              onToggleDueComplete={onToggleDueComplete}
              onToggleChecklistItem={onToggleChecklistItem}
              onChangeNoteColor={onChangeNoteColor}
              onMoveNoteToColumn={onMoveNoteToColumn}
              onUpdateColumn={onUpdateColumn}
              onDeleteColumn={onDeleteColumn}
              onClearCompletedNotes={onClearCompletedNotes}
              onDragStartNote={handleDragStartNote}
              onDragEndNote={handleDragEndNote}
              onDropNote={handleDropNote}
            />
          ))}

          {/* Add Column Card */}
          <div className="w-72 sm:w-80 shrink-0">
            {isAddingColumn ? (
              <div className="glass-panel p-4 rounded-2xl border border-purple-500/30 bg-[#130f24]/90 animate-in fade-in zoom-in-95 duration-150">
                <h4 className="text-xs font-semibold text-purple-200 mb-2">Create New Column</h4>
                <form onSubmit={handleColumnSubmit} className="space-y-3">
                  <input
                    type="text"
                    autoFocus
                    value={newColTitle}
                    onChange={(e) => setNewColTitle(e.target.value)}
                    placeholder="e.g. Blocked, In Review, QA"
                    className="w-full px-3 py-2 rounded-xl bg-purple-950/60 border border-purple-500/30 text-xs text-white placeholder-purple-400/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      className="flex-1 py-1.5 px-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium transition-colors"
                    >
                      Add Column
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingColumn(false);
                        setNewColTitle('');
                      }}
                      className="py-1.5 px-3 rounded-lg bg-purple-950/40 hover:bg-purple-900/40 text-purple-300 text-xs transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAddingColumn(true)}
                className="w-full py-4 rounded-2xl border-2 border-dashed border-purple-500/25 hover:border-purple-400/50 bg-purple-950/20 hover:bg-purple-900/20 text-purple-300 hover:text-white flex items-center justify-center gap-2 text-xs font-semibold transition-all cursor-pointer group"
              >
                <Plus className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
                <span>Add Another Column</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
