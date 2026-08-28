import React, { useState } from 'react';
import {
  X,
  Download,
  Upload,
  RotateCcw,
  Check,
  AlertTriangle,
  FileJson,
  Copy,
} from 'lucide-react';

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  onExport: () => string;
  onImport: (json: string) => boolean;
  onReset: () => void;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({
  isOpen,
  onClose,
  email,
  onExport,
  onImport,
  onReset,
}) => {
  const [importJsonText, setImportJsonText] = useState('');
  const [copied, setCopied] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');

  if (!isOpen) return null;

  const handleDownload = () => {
    const jsonStr = onExport();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `viokanban-backup-${email.split('@')[0]}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    const jsonStr = onExport();
    navigator.clipboard.writeText(jsonStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImportSubmit = () => {
    if (!importJsonText.trim()) return;
    const ok = onImport(importJsonText.trim());
    if (ok) {
      setImportStatus('success');
      setTimeout(() => {
        onClose();
        setImportStatus('idle');
      }, 1200);
    } else {
      setImportStatus('error');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setImportJsonText(content);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-lg rounded-2xl border border-purple-500/30 bg-[#120d24] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-4 border-b border-purple-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileJson className="w-5 h-5 text-purple-400" />
            <h3 className="text-base font-bold text-white">Data Management & Backup</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-purple-400/60 hover:text-white hover:bg-purple-500/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Export section */}
          <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple-200 flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5 text-purple-400" />
                <span>Export Workspace JSON</span>
              </h4>
              <button
                type="button"
                onClick={handleCopy}
                className="px-2 py-1 rounded-lg bg-purple-900/50 hover:bg-purple-800/50 text-[11px] text-purple-300 flex items-center gap-1 border border-purple-500/30"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied!' : 'Copy JSON'}</span>
              </button>
            </div>
            <p className="text-xs text-purple-300/70">
              Download a complete JSON snapshot of all boards, columns, sticky notes, and device records for{' '}
              <strong className="text-white font-mono">{email}</strong>.
            </p>
            <button
              type="button"
              onClick={handleDownload}
              className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-purple-900/40 flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Download Backup File (.json)</span>
            </button>
          </div>

          {/* Import section */}
          <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/20 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-200 flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5 text-purple-400" />
              <span>Import Workspace JSON</span>
            </h4>

            <div>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="block w-full text-xs text-purple-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-purple-800/60 file:text-purple-200 hover:file:bg-purple-700/60 cursor-pointer"
              />
            </div>

            <textarea
              rows={3}
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder="Or paste JSON backup here..."
              className="w-full px-3 py-2 rounded-xl bg-purple-950/60 border border-purple-500/25 text-xs text-white placeholder-purple-400/40 font-mono focus:outline-none focus:ring-1 focus:ring-purple-500/50"
            />

            {importStatus === 'success' && (
              <p className="text-xs text-emerald-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Workspace restored successfully!
              </p>
            )}
            {importStatus === 'error' && (
              <p className="text-xs text-rose-400 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Invalid JSON structure. Please check the file.
              </p>
            )}

            <button
              type="button"
              onClick={handleImportSubmit}
              disabled={!importJsonText.trim()}
              className="w-full py-2 px-3 rounded-xl bg-purple-800/60 hover:bg-purple-700/80 disabled:opacity-40 text-white text-xs font-semibold border border-purple-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Restore from JSON</span>
            </button>
          </div>

          {/* Reset Demo Data */}
          <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-300 flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                <span>Reset Sample Workspace</span>
              </h4>
            </div>
            <p className="text-xs text-rose-200/70">
              Restore default starter boards and sticky notes for this email address.
            </p>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Reset this workspace to default sample boards and sticky notes?')) {
                  onReset();
                  onClose();
                }
              }}
              className="py-1.5 px-3 rounded-xl bg-rose-900/30 hover:bg-rose-800/40 text-rose-300 text-xs font-medium border border-rose-500/30 transition-colors"
            >
              Reset to Sample Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
