import React, { useState } from 'react';
import {
  GripVertical,
  Calendar,
  CheckCircle2,
  Circle,
  Copy,
  Trash2,
  Edit3,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Clock,
  CheckSquare,
  Square,
  AlignLeft,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Note, PriorityLevel } from '../types';
import { NOTE_COLOR_PRESETS } from '../lib/storage';
import { getTrelloDateInfo } from '../lib/dates';

interface StickyNoteProps {
  note: Note;
  index: number;
  onEdit: (note: Note) => void;
  onDelete: (noteId: string) => void;
  onDuplicate: (noteId: string) => void;
  onToggleComplete: (noteId: string) => void;
  onToggleDueComplete?: (noteId: string) => void;
  onToggleChecklistItem?: (noteId: string, itemId: string) => void;
  onChangeColor: (noteId: string, color: string) => void;
  onMoveToColumn?: (noteId: string, direction: 'next' | 'prev') => void;
  canMovePrev?: boolean;
  canMoveNext?: boolean;
  onDragStart: (e: React.DragEvent, noteId: string, sourceColId: string) => void;
  onDragEnd: (e: React.DragEvent) => void;
}

export const StickyNote: React.FC<StickyNoteProps> = ({
  note,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleComplete,
  onToggleDueComplete,
  onToggleChecklistItem,
  onChangeColor,
  onMoveToColumn,
  canMovePrev,
  canMoveNext,
  onDragStart,
  onDragEnd,
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isChecklistExpanded, setIsChecklistExpanded] = useState(false);

  const colorPreset =
    NOTE_COLOR_PRESETS.find((c) => c.id === note.color) || NOTE_COLOR_PRESETS[0];

  const getPriorityBadge = (priority?: PriorityLevel) => {
    switch (priority) {
      case 'urgent':
        return { label: 'Urgent', bg: 'bg-rose-500/20 text-rose-300 border-rose-500/30', dot: 'bg-rose-400' };
      case 'high':
        return { label: 'High', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/30', dot: 'bg-amber-400' };
      case 'medium':
        return { label: 'Med', bg: 'bg-purple-500/20 text-purple-300 border-purple-500/30', dot: 'bg-purple-400' };
      case 'low':
        return { label: 'Low', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', dot: 'bg-emerald-400' };
      default:
        return null;
    }
  };

  const priorityBadge = getPriorityBadge(note.priority);

  // Trello-style Date evaluation
  const dateInfo = getTrelloDateInfo(
    note.startDate,
    note.dueDate,
    note.dueTime,
    note.dueComplete,
    note.completed
  );

  // Checklist calculations
  const totalChecklist = note.checklist?.length || 0;
  const completedChecklist = note.checklist?.filter((item) => item.completed).length || 0;
  const checklistRatio = totalChecklist > 0 ? (completedChecklist / totalChecklist) * 100 : 0;
  const isAllChecklistDone = totalChecklist > 0 && completedChecklist === totalChecklist;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, note.id, note.columnId)}
      onDragEnd={onDragEnd}
      className={`group relative rounded-xl p-3.5 border transition-all duration-200 shadow-md hover:shadow-xl select-none ${
        colorPreset.bgClass
      } ${colorPreset.borderClass} ${
        note.completed ? 'opacity-70' : 'opacity-100'
      }`}
      style={{
        boxShadow: `0 4px 20px -2px ${colorPreset.glowColor}`,
      }}
    >
      {/* Sticky Note Top Tape / Pin Accent */}
      <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-10 h-2.5 rounded-sm bg-white/10 backdrop-blur-sm border-t border-white/20 shadow-sm opacity-70 group-hover:opacity-100 transition-opacity" />

      {/* Header Row: Checkbox + Title + Drag Handle */}
      <div className="flex items-start gap-2 mb-1.5">
        <button
          type="button"
          onClick={() => onToggleComplete(note.id)}
          className="mt-0.5 text-purple-300/70 hover:text-purple-200 transition-colors shrink-0 cursor-pointer"
          title={note.completed ? 'Mark note uncompleted' : 'Mark note completed'}
        >
          {note.completed ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <Circle className="w-4 h-4 text-purple-400/50 hover:text-purple-300" />
          )}
        </button>

        <div
          className="flex-1 cursor-pointer min-w-0"
          onClick={() => onEdit(note)}
        >
          <h4
            className={`text-sm font-semibold leading-snug tracking-tight text-white ${
              note.completed ? 'line-through text-white/50' : ''
            }`}
          >
            {note.title}
          </h4>
        </div>

        {/* Drag handle */}
        <div
          className="cursor-grab active:cursor-grabbing text-purple-400/40 hover:text-purple-200 p-0.5 shrink-0"
          title="Drag to reorder or move"
        >
          <GripVertical className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Checklist Mini Progress Bar (if checklist exists) */}
      {totalChecklist > 0 && (
        <div className="mb-2">
          <div className="w-full h-1.5 rounded-full bg-purple-950/80 border border-purple-500/20 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                isAllChecklistDone
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  : 'bg-gradient-to-r from-violet-500 to-purple-400'
              }`}
              style={{ width: `${checklistRatio}%` }}
            />
          </div>
        </div>
      )}

      {/* Description Snippet */}
      {note.description && (
        <p
          onClick={() => onEdit(note)}
          className={`text-xs text-purple-200/80 mb-2.5 line-clamp-2 leading-relaxed whitespace-pre-wrap cursor-pointer ${
            note.completed ? 'line-through text-purple-300/40' : ''
          }`}
        >
          {note.description}
        </p>
      )}

      {/* Trello Badges Row: Dates, Checklist, Description, Priority, Tags */}
      <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
        {/* Trello Date Badge */}
        {dateInfo && (
          <div
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-medium border transition-all ${
              dateInfo.colorClass
            }`}
            title={`Due Date: ${dateInfo.displayText}${dateInfo.badgeLabel ? ` (${dateInfo.badgeLabel})` : ''}`}
          >
            {/* Quick check/uncheck date completion */}
            {onToggleDueComplete && note.dueDate ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleDueComplete(note.id);
                }}
                className="hover:scale-110 transition-transform cursor-pointer"
                title={note.dueComplete ? 'Mark due date incomplete' : 'Mark due date completed'}
              >
                {note.dueComplete || note.completed ? (
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Square className="w-3.5 h-3.5 text-purple-300/70 hover:text-white" />
                )}
              </button>
            ) : dateInfo.iconType === 'alert' ? (
              <AlertCircle className="w-3 h-3 text-rose-400" />
            ) : dateInfo.iconType === 'check' ? (
              <Check className="w-3 h-3 text-emerald-400" />
            ) : (
              <Clock className="w-3 h-3 text-purple-300/80" />
            )}

            <span className={`font-mono text-[10px] ${note.dueComplete ? 'line-through opacity-80' : ''}`}>
              {dateInfo.displayText}
            </span>

            {dateInfo.badgeLabel && !note.dueComplete && (
              <span className="text-[9px] uppercase tracking-wider px-1 py-0.2 rounded bg-black/20 font-bold ml-0.5">
                {dateInfo.badgeLabel}
              </span>
            )}
          </div>
        )}

        {/* Trello Checklist Badge */}
        {totalChecklist > 0 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsChecklistExpanded(!isChecklistExpanded);
            }}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-medium border transition-all cursor-pointer ${
              isAllChecklistDone
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/35 hover:bg-emerald-500/30'
                : 'bg-purple-950/70 text-purple-200 border-purple-500/25 hover:bg-purple-900/60'
            }`}
            title="Click to view and check subtasks on card"
          >
            <CheckSquare
              className={`w-3 h-3 ${isAllChecklistDone ? 'text-emerald-400' : 'text-purple-400'}`}
            />
            <span className="font-mono text-[10px]">
              {completedChecklist}/{totalChecklist}
            </span>
            {isChecklistExpanded ? (
              <ChevronUp className="w-3 h-3 opacity-60 ml-0.5" />
            ) : (
              <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
            )}
          </button>
        )}

        {/* Card has description indicator (like Trello) */}
        {note.description && (
          <span
            className="inline-flex items-center p-1 rounded-md text-purple-300/60 hover:text-purple-200 transition-colors"
            title="Card has detailed description"
          >
            <AlignLeft className="w-3 h-3" />
          </span>
        )}

        {/* Priority Badge */}
        {priorityBadge && (
          <span
            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium border ${priorityBadge.bg}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${priorityBadge.dot}`} />
            {priorityBadge.label}
          </span>
        )}

        {/* Tags */}
        {note.tags.map((tag) => (
          <span
            key={tag}
            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium border ${colorPreset.badgeClass}`}
          >
            #{tag}
          </span>
        ))}
      </div>

      {/* Inline Expanded Checklist */}
      {isChecklistExpanded && note.checklist && note.checklist.length > 0 && (
        <div className="mb-3 p-2.5 rounded-xl bg-[#0e0a1f]/80 border border-purple-500/25 space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="flex items-center justify-between text-[10px] font-semibold text-purple-300/80 uppercase tracking-wider pb-1 border-b border-purple-500/15">
            <span>Checklist ({completedChecklist}/{totalChecklist})</span>
            <button
              type="button"
              onClick={() => onEdit(note)}
              className="text-purple-400 hover:text-white normal-case font-normal text-[10px] underline"
            >
              Edit in modal
            </button>
          </div>

          <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
            {note.checklist.map((item) => (
              <div
                key={item.id}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onToggleChecklistItem) {
                    onToggleChecklistItem(note.id, item.id);
                  }
                }}
                className="flex items-start gap-2 p-1 rounded-lg hover:bg-purple-900/30 cursor-pointer transition-colors group/item"
              >
                <button
                  type="button"
                  className="mt-0.5 shrink-0 text-purple-400 hover:text-purple-300"
                >
                  {item.completed ? (
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Square className="w-3.5 h-3.5 text-purple-400/60" />
                  )}
                </button>
                <span
                  className={`text-xs leading-tight select-none ${
                    item.completed ? 'line-through text-purple-300/50' : 'text-purple-100'
                  }`}
                >
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Action Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[11px] text-purple-300/60">
        <span className="text-[10px] opacity-60 font-mono">
          {new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>

        {/* Action icons */}
        <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
          {/* Move left */}
          {canMovePrev && onMoveToColumn && (
            <button
              type="button"
              onClick={() => onMoveToColumn(note.id, 'prev')}
              className="p-1 rounded hover:bg-white/10 text-purple-300 hover:text-white transition-colors cursor-pointer"
              title="Move to previous column"
            >
              <ArrowLeft className="w-3 h-3" />
            </button>
          )}

          {/* Move right */}
          {canMoveNext && onMoveToColumn && (
            <button
              type="button"
              onClick={() => onMoveToColumn(note.id, 'next')}
              className="p-1 rounded hover:bg-white/10 text-purple-300 hover:text-white transition-colors cursor-pointer"
              title="Move to next column"
            >
              <ArrowRight className="w-3 h-3" />
            </button>
          )}

          {/* Color palette toggle */}
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowColorPicker(!showColorPicker);
              }}
              className="p-1 rounded hover:bg-white/10 text-purple-300 hover:text-white transition-colors cursor-pointer"
              title="Change sticky note color"
            >
              <span
                className="block w-2.5 h-2.5 rounded-full border border-white/40"
                style={{ backgroundColor: colorPreset.hex }}
              />
            </button>

            {showColorPicker && (
              <div
                className="absolute right-0 bottom-6 z-30 p-1.5 rounded-xl glass-dropdown flex gap-1 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
                onClick={(e) => e.stopPropagation()}
              >
                {NOTE_COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      onChangeColor(note.id, preset.id);
                      setShowColorPicker(false);
                    }}
                    className={`w-4 h-4 rounded-full border transition-transform hover:scale-125 cursor-pointer ${
                      preset.id === note.color ? 'ring-2 ring-white scale-110' : 'border-white/20'
                    }`}
                    style={{ backgroundColor: preset.hex }}
                    title={preset.name}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Edit */}
          <button
            type="button"
            onClick={() => onEdit(note)}
            className="p-1 rounded hover:bg-white/10 text-purple-300 hover:text-white transition-colors cursor-pointer"
            title="Edit note details"
          >
            <Edit3 className="w-3 h-3" />
          </button>

          {/* Duplicate */}
          <button
            type="button"
            onClick={() => onDuplicate(note.id)}
            className="p-1 rounded hover:bg-white/10 text-purple-300 hover:text-white transition-colors cursor-pointer"
            title="Duplicate note"
          >
            <Copy className="w-3 h-3" />
          </button>

          {/* Delete */}
          <button
            type="button"
            onClick={() => onDelete(note.id)}
            className="p-1 rounded hover:bg-rose-500/20 text-purple-300 hover:text-rose-300 transition-colors cursor-pointer"
            title="Delete note"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
