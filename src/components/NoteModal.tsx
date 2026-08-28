import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Calendar,
  Sparkles,
  Check,
  CheckSquare,
  Square,
  Trash2,
  Clock,
  AlertCircle,
  ListTodo,
} from 'lucide-react';
import { Column, Note, PriorityLevel, ChecklistItem } from '../types';
import { NOTE_COLOR_PRESETS } from '../lib/storage';
import { getTrelloDateInfo, getDatePresets } from '../lib/dates';

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
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
  }) => void;
  initialNote?: Note | null;
  defaultColumnId?: string;
  columns: Column[];
  existingTags: string[];
}

export const NoteModal: React.FC<NoteModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialNote,
  defaultColumnId,
  columns,
  existingTags,
}) => {
  const [title, setTitle] = useState('');
  const [columnId, setColumnId] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('violet');
  const [priority, setPriority] = useState<PriorityLevel>('medium');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // Trello-style Date fields
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [dueComplete, setDueComplete] = useState(false);

  // Trello-style Checklist fields
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [newChecklistText, setNewChecklistText] = useState('');

  useEffect(() => {
    if (initialNote) {
      setTitle(initialNote.title || '');
      setColumnId(initialNote.columnId || (columns[0]?.id ?? ''));
      setDescription(initialNote.description || '');
      setColor(initialNote.color || 'violet');
      setPriority(initialNote.priority || 'medium');
      setTags(initialNote.tags || []);
      setStartDate(initialNote.startDate || '');
      setDueDate(initialNote.dueDate || '');
      setDueTime(initialNote.dueTime || '');
      setDueComplete(Boolean(initialNote.dueComplete));
      setChecklist(initialNote.checklist ? [...initialNote.checklist] : []);
    } else {
      setTitle('');
      setColumnId(defaultColumnId || (columns[0]?.id ?? ''));
      setDescription('');
      setColor('violet');
      setPriority('medium');
      setTags([]);
      setStartDate('');
      setDueDate('');
      setDueTime('');
      setDueComplete(false);
      setChecklist([]);
    }
    setNewChecklistText('');
  }, [initialNote, defaultColumnId, columns, isOpen]);

  if (!isOpen) return null;

  // Tag helpers
  const handleAddTag = (tagToAdd: string) => {
    const clean = tagToAdd.trim().replace(/^#/, '');
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // Checklist helpers
  const handleAddChecklistItem = () => {
    if (!newChecklistText.trim()) return;
    const newItem: ChecklistItem = {
      id: 'chk_' + Math.random().toString(36).substring(2, 9),
      text: newChecklistText.trim(),
      completed: false,
    };
    setChecklist([...checklist, newItem]);
    setNewChecklistText('');
  };

  const handleToggleChecklistItem = (id: string) => {
    setChecklist(
      checklist.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const handleDeleteChecklistItem = (id: string) => {
    setChecklist(checklist.filter((item) => item.id !== id));
  };

  const handleClearCompletedChecklist = () => {
    setChecklist(checklist.filter((item) => !item.completed));
  };

  // Preset Date helpers
  const datePresets = getDatePresets();

  const handleSetPresetDate = (dateVal: string) => {
    setDueDate(dateVal);
  };

  const handleClearDates = () => {
    setStartDate('');
    setDueDate('');
    setDueTime('');
    setDueComplete(false);
  };

  // Live preview of Trello date badge
  const previewDateInfo = getTrelloDateInfo(
    startDate,
    dueDate,
    dueTime,
    dueComplete,
    false
  );

  const checklistTotal = checklist.length;
  const checklistCompleted = checklist.filter((item) => item.completed).length;
  const checklistPercent =
    checklistTotal > 0 ? Math.round((checklistCompleted / checklistTotal) * 100) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      columnId: columnId || (columns[0]?.id ?? ''),
      description: description.trim() || undefined,
      color,
      tags,
      priority,
      startDate: startDate || undefined,
      dueDate: dueDate || undefined,
      dueTime: dueTime || undefined,
      dueComplete,
      checklist,
    });
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  const selectedPreset =
    NOTE_COLOR_PRESETS.find((c) => c.id === color) || NOTE_COLOR_PRESETS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="glass-panel w-full max-w-2xl rounded-2xl border border-purple-500/30 bg-[#120d24] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]"
        onKeyDown={handleKeyDown}
      >
        {/* Modal Header */}
        <div
          className="p-4 border-b border-purple-500/20 flex items-center justify-between shrink-0 transition-colors"
          style={{ borderTop: `4px solid ${selectedPreset.hex}` }}
        >
          <div className="flex items-center gap-2.5">
            <span
              className="w-3.5 h-3.5 rounded-full shadow-sm ring-2 ring-white/20"
              style={{ backgroundColor: selectedPreset.hex }}
            />
            <h3 className="text-base font-bold text-white tracking-tight">
              {initialNote ? 'Edit Card' : 'New Card'}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-purple-400/60 hover:text-white hover:bg-purple-500/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5 overflow-y-auto flex-1">
          {/* Card Title */}
          <div>
            <label className="block text-xs font-semibold text-purple-200 mb-1.5">
              Card Title <span className="text-purple-400">*</span>
            </label>
            <input
              type="text"
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Design user onboarding flow"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-purple-950/50 border border-purple-500/25 text-white placeholder-purple-400/40 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400"
            />
          </div>

          {/* Column Selector & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-purple-200 mb-1.5">
                Column Stage
              </label>
              <select
                value={columnId}
                onChange={(e) => setColumnId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-purple-950/50 border border-purple-500/25 text-xs text-white focus:outline-none cursor-pointer"
              >
                {columns.map((col) => (
                  <option key={col.id} value={col.id}>
                    {col.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-purple-200 mb-1.5">
                Priority Level
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                className="w-full px-3 py-2 rounded-xl bg-purple-950/50 border border-purple-500/25 text-xs text-white focus:outline-none cursor-pointer"
              >
                <option value="low">🌱 Low Priority</option>
                <option value="medium">📌 Medium Priority</option>
                <option value="high">⚡ High Priority</option>
                <option value="urgent">🔥 Urgent Priority</option>
              </select>
            </div>
          </div>

          {/* Sticky Note Color Palette */}
          <div>
            <label className="block text-xs font-semibold text-purple-200 mb-2">
              Card Color Theme
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {NOTE_COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setColor(preset.id)}
                  className={`h-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                    color === preset.id
                      ? 'ring-2 ring-white scale-105 shadow-lg'
                      : 'opacity-70 hover:opacity-100 hover:scale-105'
                  }`}
                  style={{
                    backgroundColor: preset.hex,
                    borderColor: 'rgba(255,255,255,0.3)',
                  }}
                  title={preset.name}
                >
                  {color === preset.id && <Check className="w-4 h-4 text-white drop-shadow" />}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-purple-200 mb-1.5">
              Description & Notes
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add key context, specifications, or background notes..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-purple-950/50 border border-purple-500/25 text-xs text-white placeholder-purple-400/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 leading-relaxed"
            />
          </div>

          {/* ========================================================================= */}
          {/* TRELLO-STYLE CHECKLIST SECTION */}
          {/* ========================================================================= */}
          <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/25 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ListTodo className="w-4 h-4 text-violet-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Checklist
                </h4>
                {checklistTotal > 0 && (
                  <span className="text-[11px] font-mono text-purple-300/80">
                    ({checklistCompleted}/{checklistTotal})
                  </span>
                )}
              </div>

              {checklistCompleted > 0 && (
                <button
                  type="button"
                  onClick={handleClearCompletedChecklist}
                  className="text-[11px] text-purple-400 hover:text-purple-200 underline cursor-pointer"
                >
                  Clear completed
                </button>
              )}
            </div>

            {/* Progress Bar */}
            {checklistTotal > 0 && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-mono text-purple-300/80">
                  <span>Progress</span>
                  <span className="font-bold">{checklistPercent}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-purple-900/60 overflow-hidden border border-purple-500/20">
                  <div
                    className={`h-full transition-all duration-300 rounded-full ${
                      checklistPercent === 100
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                        : 'bg-gradient-to-r from-violet-500 to-indigo-500'
                    }`}
                    style={{ width: `${checklistPercent}%` }}
                  />
                </div>
              </div>
            )}

            {/* Checklist Items List */}
            {checklist.length > 0 && (
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {checklist.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-2 p-2 rounded-xl bg-purple-950/60 border border-purple-500/20 group hover:border-purple-400/40 transition-colors"
                  >
                    <div
                      className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer"
                      onClick={() => handleToggleChecklistItem(item.id)}
                    >
                      <button
                        type="button"
                        className="shrink-0 text-purple-400 hover:text-purple-300 cursor-pointer"
                      >
                        {item.completed ? (
                          <CheckSquare className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Square className="w-4 h-4 text-purple-400/60" />
                        )}
                      </button>
                      <span
                        className={`text-xs text-purple-100 select-none truncate ${
                          item.completed ? 'line-through text-purple-300/50' : ''
                        }`}
                      >
                        {item.text}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteChecklistItem(item.id)}
                      className="p-1 rounded-lg text-purple-400/40 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Delete checklist item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Checklist Item Input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newChecklistText}
                onChange={(e) => setNewChecklistText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddChecklistItem();
                  }
                }}
                placeholder="Add an item to checklist..."
                className="flex-1 px-3 py-1.5 rounded-xl bg-purple-950/60 border border-purple-500/25 text-xs text-white placeholder-purple-400/40 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
              />
              <button
                type="button"
                onClick={handleAddChecklistItem}
                disabled={!newChecklistText.trim()}
                className="px-3 py-1.5 rounded-xl bg-purple-800/60 hover:bg-purple-700/80 disabled:opacity-40 text-white text-xs font-semibold border border-purple-500/30 flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* TRELLO-STYLE DATES SECTION */}
          {/* ========================================================================= */}
          <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/25 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-violet-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Dates & Deadlines (Trello-Style)
                </h4>
              </div>

              {(startDate || dueDate) && (
                <button
                  type="button"
                  onClick={handleClearDates}
                  className="text-[11px] text-purple-400 hover:text-purple-200 underline cursor-pointer"
                >
                  Clear dates
                </button>
              )}
            </div>

            {/* Quick date presets */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-purple-400/70 mr-1">Quick Presets:</span>
              {datePresets.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => handleSetPresetDate(preset.date)}
                  className={`px-2 py-0.5 rounded-lg text-[11px] border transition-colors cursor-pointer ${
                    dueDate === preset.date
                      ? 'bg-purple-600/40 border-purple-400 text-white'
                      : 'bg-purple-950/60 border-purple-500/20 text-purple-300 hover:bg-purple-900/50'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Date Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Start Date */}
              <div>
                <label className="block text-[11px] font-medium text-purple-300/80 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-purple-950/60 border border-purple-500/25 text-xs text-white focus:outline-none [color-scheme:dark]"
                />
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-[11px] font-medium text-purple-300/80 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-purple-950/60 border border-purple-500/25 text-xs text-white focus:outline-none [color-scheme:dark]"
                />
              </div>

              {/* Due Time */}
              <div>
                <label className="block text-[11px] font-medium text-purple-300/80 mb-1">
                  Due Time <span className="opacity-60">(Optional)</span>
                </label>
                <input
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-purple-950/60 border border-purple-500/25 text-xs text-white focus:outline-none [color-scheme:dark]"
                />
              </div>
            </div>

            {/* Mark Due Date Complete Checkbox */}
            {dueDate && (
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={dueComplete}
                    onChange={(e) => setDueComplete(e.target.checked)}
                    className="w-4 h-4 rounded text-purple-600 bg-purple-950 border-purple-500/40 focus:ring-0 cursor-pointer"
                  />
                  <span className="text-xs text-purple-200">
                    Mark due date as completed
                  </span>
                </label>

                {/* Badge Preview */}
                {previewDateInfo && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-purple-400/60 font-mono">Preview:</span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border font-mono ${previewDateInfo.colorClass}`}
                    >
                      {previewDateInfo.iconType === 'alert' ? (
                        <AlertCircle className="w-3 h-3" />
                      ) : previewDateInfo.iconType === 'check' ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <Clock className="w-3 h-3" />
                      )}
                      <span>{previewDateInfo.displayText}</span>
                      {previewDateInfo.badgeLabel && (
                        <span className="text-[9px] uppercase px-1 rounded bg-black/20 font-bold">
                          {previewDateInfo.badgeLabel}
                        </span>
                      )}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Tags & Labels */}
          <div>
            <label className="block text-xs font-semibold text-purple-200 mb-1.5">
              Tags & Labels
            </label>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    handleAddTag(tagInput);
                  }
                }}
                placeholder="Type tag & press Enter (e.g. Design, Frontend)"
                className="flex-1 px-3 py-1.5 rounded-xl bg-purple-950/50 border border-purple-500/25 text-xs text-white placeholder-purple-400/40 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
              />
              <button
                type="button"
                onClick={() => handleAddTag(tagInput)}
                className="px-3 py-1.5 rounded-xl bg-purple-800/50 hover:bg-purple-700/60 text-purple-200 text-xs font-medium border border-purple-500/30 cursor-pointer"
              >
                Add
              </button>
            </div>

            {/* Current Active Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-purple-900/60 border border-purple-400/30 text-xs text-purple-200"
                  >
                    #{t}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="hover:text-white cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Existing Tag Suggestions */}
            {existingTags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1 text-[11px] text-purple-400/70">
                <span className="mr-1">Suggestions:</span>
                {existingTags.slice(0, 6).map((suggested) => (
                  <button
                    key={suggested}
                    type="button"
                    onClick={() => handleAddTag(suggested)}
                    className="px-2 py-0.5 rounded-md bg-purple-950/60 hover:bg-purple-900/60 text-purple-300 border border-purple-500/20 transition-colors cursor-pointer"
                  >
                    +{suggested}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Actions Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-purple-500/20">
            <span className="text-[11px] text-purple-400/60">
              Press <kbd className="px-1 py-0.5 rounded bg-purple-900/50 border border-purple-500/30 font-mono text-[10px]">Ctrl+Enter</kbd> to save
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-purple-950/40 hover:bg-purple-900/40 text-purple-300 text-xs font-medium border border-purple-500/20 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-purple-900/50 transition-all cursor-pointer"
              >
                {initialNote ? 'Save Changes' : 'Create Card'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
