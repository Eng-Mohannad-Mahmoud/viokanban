import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Check,
  Layout,
  Layers,
  Palette,
} from 'lucide-react';
import { Board } from '../types';
import { BOARD_THEMES } from '../lib/storage';

interface NewBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, description?: string, color?: string, template?: string) => void;
  onUpdate?: (boardId: string, name: string, description?: string, color?: string) => void;
  initialBoard?: Board | null;
}

export const NewBoardModal: React.FC<NewBoardModalProps> = ({
  isOpen,
  onClose,
  onCreate,
  onUpdate,
  initialBoard,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('purple');
  const [template, setTemplate] = useState('standard');

  useEffect(() => {
    if (initialBoard) {
      setName(initialBoard.name || '');
      setDescription(initialBoard.description || '');
      setColor(initialBoard.color || 'purple');
    } else {
      setName('');
      setDescription('');
      setColor('purple');
      setTemplate('standard');
    }
  }, [initialBoard, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (initialBoard && onUpdate) {
      onUpdate(initialBoard.id, name.trim(), description.trim() || undefined, color);
    } else {
      onCreate(name.trim(), description.trim() || undefined, color, template);
    }
    onClose();
  };

  const templates = [
    {
      id: 'standard',
      name: 'Standard Kanban',
      desc: 'Backlog, To Do, In Progress, Done',
      icon: '🚀',
    },
    {
      id: 'minimal',
      name: 'Minimal TODO',
      desc: 'To Do, Done',
      icon: '⚡',
    },
    {
      id: 'matrix',
      name: 'Priority Matrix',
      desc: 'Urgent & Important, Important, Urgent, Later',
      icon: '🎯',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-md rounded-2xl border border-purple-500/30 bg-[#120d24] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-purple-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-600/30 border border-purple-400/30 flex items-center justify-center text-purple-300">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white">
              {initialBoard ? 'Edit Board Settings' : 'Create New Board'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-purple-400/60 hover:text-white hover:bg-purple-500/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Board Name */}
          <div>
            <label className="block text-xs font-semibold text-purple-200 mb-1.5">
              Board Name <span className="text-purple-400">*</span>
            </label>
            <input
              type="text"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Q4 Marketing Campaign"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-purple-950/50 border border-purple-500/25 text-white placeholder-purple-400/40 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-purple-200 mb-1.5">
              Description <span className="text-purple-400/60">(Optional)</span>
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary or objective for this board..."
              className="w-full px-3.5 py-2 rounded-xl bg-purple-950/50 border border-purple-500/25 text-xs text-white placeholder-purple-400/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </div>

          {/* Board Color Theme */}
          <div>
            <label className="block text-xs font-semibold text-purple-200 mb-2">
              Board Theme Accent
            </label>
            <div className="grid grid-cols-5 gap-2">
              {BOARD_THEMES.map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => setColor(theme.id)}
                  className={`h-10 rounded-xl border flex items-center justify-center transition-all ${
                    color === theme.id
                      ? 'ring-2 ring-white scale-105 shadow-md'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: theme.accent,
                    borderColor: 'rgba(255,255,255,0.25)',
                  }}
                  title={theme.name}
                >
                  {color === theme.id && <Check className="w-4 h-4 text-white drop-shadow" />}
                </button>
              ))}
            </div>
          </div>

          {/* Template Selection (Only for New Boards) */}
          {!initialBoard && (
            <div>
              <label className="block text-xs font-semibold text-purple-200 mb-2">
                Starter Template
              </label>
              <div className="grid grid-cols-1 gap-2">
                {templates.map((tpl) => (
                  <div
                    key={tpl.id}
                    onClick={() => setTemplate(tpl.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                      template === tpl.id
                        ? 'bg-purple-900/40 border-purple-400/60 ring-1 ring-purple-400/40 text-white'
                        : 'bg-purple-950/30 border-purple-500/15 hover:border-purple-500/30 text-purple-200/80'
                    }`}
                  >
                    <span className="text-xl shrink-0">{tpl.icon}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold">{tpl.name}</p>
                        {template === tpl.id && (
                          <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                        )}
                      </div>
                      <p className="text-[11px] text-purple-300/60 mt-0.5">{tpl.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-purple-500/20">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-purple-950/40 hover:bg-purple-900/40 text-purple-300 text-xs font-medium border border-purple-500/20 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-purple-900/50 transition-all cursor-pointer"
            >
              {initialBoard ? 'Save Board' : 'Create Board'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
