import React, { useState } from 'react';
import {
  Plus,
  MoreVertical,
  Trash2,
  Edit2,
  CheckCircle,
  X,
  Palette,
  GripHorizontal,
} from 'lucide-react';
import { Column as ColumnType, Note } from '../types';
import { StickyNote } from './StickyNote';

interface ColumnProps {
  column: ColumnType;
  index: number;
  totalColumns: number;
  notes: Note[];
  onAddNote: (columnId: string) => void;
  onEditNote: (note: Note) => void;
  onDeleteNote: (noteId: string) => void;
  onDuplicateNote: (noteId: string) => void;
  onToggleCompleteNote: (noteId: string) => void;
  onToggleDueComplete?: (noteId: string) => void;
  onToggleChecklistItem?: (noteId: string, itemId: string) => void;
  onChangeNoteColor: (noteId: string, color: string) => void;
  onMoveNoteToColumn: (noteId: string, direction: 'next' | 'prev') => void;
  onUpdateColumn: (columnId: string, updates: Partial<Omit<ColumnType, 'id' | 'boardId'>>) => void;
  onDeleteColumn: (columnId: string) => void;
  onClearCompletedNotes: (columnId: string) => void;
  onDragStartNote: (e: React.DragEvent, noteId: string, sourceColId: string) => void;
  onDragEndNote: (e: React.DragEvent) => void;
  onDropNote: (e: React.DragEvent, targetColId: string, targetIndex?: number) => void;
}

export const Column: React.FC<ColumnProps> = ({
  column,
  index,
  totalColumns,
  notes,
  onAddNote,
  onEditNote,
  onDeleteNote,
  onDuplicateNote,
  onToggleCompleteNote,
  onToggleDueComplete,
  onToggleChecklistItem,
  onChangeNoteColor,
  onMoveNoteToColumn,
  onUpdateColumn,
  onDeleteColumn,
  onClearCompletedNotes,
  onDragStartNote,
  onDragEndNote,
  onDropNote,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(column.title);
  const [showMenu, setShowMenu] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Quick inline add state
  const [isQuickAdding, setIsQuickAdding] = useState(false);
  const [quickTitle, setQuickTitle] = useState('');

  const columnNotes = notes
    .filter((n) => n.columnId === column.id)
    .sort((a, b) => a.order - b.order);

  const completedCount = columnNotes.filter((n) => n.completed).length;

  const handleTitleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (titleInput.trim()) {
      onUpdateColumn(column.id, { title: titleInput.trim() });
    } else {
      setTitleInput(column.title);
    }
    setIsEditingTitle(false);
  };

  // Drag over column
  const handleDragOverColumn = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeaveColumn = (e: React.DragEvent) => {
    // Only reset if left the column container completely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
      setDragOverIndex(null);
    }
  };

  const handleDropOnColumn = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    setDragOverIndex(null);
    onDropNote(e, column.id, dragOverIndex ?? undefined);
  };

  const handleQuickAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickTitle.trim()) {
      // Trigger modal or direct add
      onAddNote(column.id);
      setQuickTitle('');
      setIsQuickAdding(false);
    }
  };

  const COLUMN_ACCENT_COLORS = [
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#38bdf8', // sky
    '#34d399', // emerald
    '#fbbf24', // amber
    '#a855f7', // purple
    '#f43f5e', // rose
  ];

  return (
    <div
      onDragOver={handleDragOverColumn}
      onDragLeave={handleDragLeaveColumn}
      onDrop={handleDropOnColumn}
      className={`w-72 sm:w-80 shrink-0 flex flex-col rounded-2xl transition-all duration-200 glass-panel border bg-[#130f24]/80 ${
        isDragOver ? 'drag-over-column ring-2 ring-purple-500/50' : 'border-purple-500/20'
      }`}
      style={{
        maxHeight: 'calc(100vh - 180px)',
      }}
    >
      {/* Column Header */}
      <div className="p-3.5 border-b border-purple-500/15 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {/* Column accent dot */}
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
            style={{ backgroundColor: column.color || '#8b5cf6' }}
          />

          {/* Column Title or Edit Input */}
          {isEditingTitle ? (
            <form onSubmit={handleTitleSubmit} className="flex items-center gap-1 w-full">
              <input
                type="text"
                autoFocus
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                onBlur={handleTitleSubmit}
                className="w-full px-2 py-1 rounded bg-purple-950/80 border border-purple-400 text-xs font-semibold text-white focus:outline-none"
              />
            </form>
          ) : (
            <div
              className="group flex items-center gap-1.5 cursor-pointer min-w-0"
              onClick={() => setIsEditingTitle(true)}
              title="Click to rename column"
            >
              <h3 className="text-xs font-bold uppercase tracking-wider text-purple-100 truncate">
                {column.title}
              </h3>
              <Edit2 className="w-3 h-3 text-purple-400/40 group-hover:text-purple-300 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </div>
          )}

          {/* Note count badge */}
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-purple-900/40 border border-purple-500/20 text-purple-300">
            {columnNotes.length}
          </span>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onAddNote(column.id)}
            className="p-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 hover:text-white border border-purple-500/30 transition-colors"
            title="Add sticky note to this column"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>

          {/* Column menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 rounded-lg hover:bg-purple-500/10 text-purple-300/60 hover:text-purple-200 transition-colors"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>

            {showMenu && (
              <div
                className="absolute right-0 top-8 z-40 w-48 rounded-xl glass-dropdown p-1.5 shadow-2xl text-xs"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingTitle(true);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-purple-600/30 text-purple-200 text-left transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5 text-purple-400" />
                  <span>Rename Column</span>
                </button>

                {/* Color swatches */}
                <div className="px-2.5 py-2 border-t border-b border-purple-500/15 my-1">
                  <span className="text-[10px] text-purple-400/80 uppercase font-medium block mb-1.5">
                    Accent Color
                  </span>
                  <div className="flex gap-1.5">
                    {COLUMN_ACCENT_COLORS.map((hex) => (
                      <button
                        key={hex}
                        type="button"
                        onClick={() => {
                          onUpdateColumn(column.id, { color: hex });
                          setShowMenu(false);
                        }}
                        className={`w-4 h-4 rounded-full border transition-transform hover:scale-125 ${
                          column.color === hex ? 'ring-2 ring-white scale-110' : 'border-white/20'
                        }`}
                        style={{ backgroundColor: hex }}
                      />
                    ))}
                  </div>
                </div>

                {completedCount > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      onClearCompletedNotes(column.id);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-purple-600/30 text-purple-200 text-left transition-colors"
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Clear Completed ({completedCount})</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Delete column "${column.title}" and its ${columnNotes.length} notes?`)) {
                      onDeleteColumn(column.id);
                    }
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-rose-500/20 text-rose-300 text-left transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Column</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Notes Scroll Area */}
      <div className="flex-1 p-2.5 space-y-2.5 overflow-y-auto min-h-[140px]">
        {columnNotes.length === 0 ? (
          <div
            onClick={() => onAddNote(column.id)}
            className="h-28 rounded-xl border border-dashed border-purple-500/25 hover:border-purple-400/50 flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-colors group bg-purple-950/20"
          >
            <Plus className="w-5 h-5 text-purple-400/40 group-hover:text-purple-300 group-hover:scale-110 transition-all mb-1" />
            <p className="text-xs text-purple-300/60 group-hover:text-purple-200 font-medium">
              Add sticky note
            </p>
            <span className="text-[10px] text-purple-400/40">or drop task here</span>
          </div>
        ) : (
          columnNotes.map((note, noteIndex) => (
            <div
              key={note.id}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDragOverIndex(noteIndex);
              }}
              className="relative"
            >
              {/* Drop position indicator */}
              {isDragOver && dragOverIndex === noteIndex && (
                <div className="drag-indicator-line mb-2" />
              )}
              <StickyNote
                note={note}
                index={noteIndex}
                onEdit={onEditNote}
                onDelete={onDeleteNote}
                onDuplicate={onDuplicateNote}
                onToggleComplete={onToggleCompleteNote}
                onToggleDueComplete={onToggleDueComplete}
                onToggleChecklistItem={onToggleChecklistItem}
                onChangeColor={onChangeNoteColor}
                onMoveToColumn={onMoveNoteToColumn}
                canMovePrev={index > 0}
                canMoveNext={index < totalColumns - 1}
                onDragStart={onDragStartNote}
                onDragEnd={onDragEndNote}
              />
            </div>
          ))
        )}

        {/* Drop indicator at bottom */}
        {isDragOver && dragOverIndex === columnNotes.length && (
          <div className="drag-indicator-line mt-2" />
        )}
      </div>

      {/* Column Footer: Quick Add sticky note button */}
      <div className="p-2 border-t border-purple-500/10">
        <button
          type="button"
          onClick={() => onAddNote(column.id)}
          className="w-full py-2 px-3 rounded-xl bg-purple-900/20 hover:bg-purple-800/40 text-purple-300 hover:text-purple-100 text-xs font-medium border border-purple-500/20 hover:border-purple-400/40 transition-all flex items-center justify-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Sticky Note</span>
        </button>
      </div>
    </div>
  );
};
