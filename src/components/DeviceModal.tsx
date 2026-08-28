import React from 'react';
import {
  X,
  Laptop,
  Smartphone,
  Tablet,
  ShieldCheck,
  Clock,
  HardDrive,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { DeviceRecord } from '../types';

interface DeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  devices: DeviceRecord[];
  email: string;
  currentDeviceName: string;
}

export const DeviceModal: React.FC<DeviceModalProps> = ({
  isOpen,
  onClose,
  devices,
  email,
  currentDeviceName,
}) => {
  if (!isOpen) return null;

  const getDeviceIcon = (deviceStr: string) => {
    const lower = deviceStr.toLowerCase();
    if (lower.includes('mobile') || lower.includes('iphone') || lower.includes('android')) {
      return <Smartphone className="w-4 h-4 text-purple-400" />;
    }
    if (lower.includes('tablet') || lower.includes('ipad')) {
      return <Tablet className="w-4 h-4 text-purple-400" />;
    }
    return <Laptop className="w-4 h-4 text-purple-400" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-lg rounded-2xl border border-purple-500/30 bg-[#120d24] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-4 border-b border-purple-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-600/30 border border-purple-400/30 flex items-center justify-center text-purple-300">
              <Laptop className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Logged In Devices</h3>
              <p className="text-[11px] text-purple-300/60 font-mono">{email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-purple-400/60 hover:text-white hover:bg-purple-500/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Explanation Banner */}
          <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/20 text-xs text-purple-200/90 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-violet-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-white">Browser-Isolated Security</p>
              <p className="text-[11px] text-purple-300/70 leading-relaxed">
                VioKanban records device signatures on each sign-in to help you audit active sessions.
                All board data is isolated strictly to your email in <code className="text-purple-300">localStorage</code>.
              </p>
            </div>
          </div>

          {/* Devices List */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-purple-300/80 uppercase tracking-wider">
              Recorded Devices ({devices.length})
            </h4>

            {devices.length === 0 ? (
              <div className="p-4 rounded-xl bg-purple-950/30 text-center text-xs text-purple-300/50">
                No recorded devices found
              </div>
            ) : (
              devices.map((rec, idx) => {
                const isCurrent = rec.device === currentDeviceName || idx === 0;

                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                      isCurrent
                        ? 'bg-purple-900/30 border-purple-400/40 ring-1 ring-purple-400/30'
                        : 'bg-purple-950/30 border-purple-500/15'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-lg bg-purple-950/80 border border-purple-500/20 shrink-0">
                        {getDeviceIcon(rec.device)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-semibold text-white truncate">
                            {rec.device}
                          </p>
                          {isCurrent && (
                            <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-medium shrink-0 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              This Device
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-purple-300/60 mt-0.5 font-mono">
                          <Clock className="w-3 h-3 text-purple-400/50" />
                          <span>Last login: {new Date(rec.lastLogin).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Storage Key Reference */}
          <div className="p-3 rounded-xl bg-[#090714] border border-purple-500/15 text-[11px] font-mono text-purple-300/60">
            <span className="text-purple-400 block font-semibold mb-1">Storage Key Scoping:</span>
            <code>violeads:user:{encodeURIComponent(email)}:devices</code>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-purple-500/20 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-purple-900/40 hover:bg-purple-800/50 text-purple-200 text-xs font-medium border border-purple-500/30 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
