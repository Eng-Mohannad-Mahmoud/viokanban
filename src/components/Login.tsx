import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  Laptop,
  Layers,
  ArrowRight,
  User,
  Mail,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { detectDevice } from '../lib/device';

interface LoginProps {
  onLogin: (email: string, name?: string) => boolean;
  knownUsers: string[];
  currentDeviceName: string;
}

export const Login: React.FC<LoginProps> = ({ onLogin, knownUsers, currentDeviceName }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const detected = detectDevice();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    const ok = onLogin(email.trim(), name.trim() || undefined);
    if (!ok) {
      setError('Could not sign in. Please try again.');
    }
  };

  const handleQuickLogin = (userEmail: string) => {
    onLogin(userEmail);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-[#090712] relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-pink-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 shadow-xl shadow-purple-900/40 border border-purple-400/30 mb-4 animate-in fade-in zoom-in duration-500">
            <Layers className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-purple-100 to-violet-300 bg-clip-text text-transparent">
            VioKanban
          </h1>
          <p className="text-sm text-purple-200/70 mt-2">
            Sticky notes Kanban with isolated per-user browser storage
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-panel rounded-2xl p-6 sm:p-8 shadow-2xl border border-purple-500/20 bg-[#120d24]/90 backdrop-blur-xl">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-purple-500/15">
            <div>
              <h2 className="text-lg font-semibold text-white">Sign In to Your Boards</h2>
              <p className="text-xs text-purple-300/60">Enter any email to load your private workspace</p>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-[11px] text-purple-300">
              <Lock className="w-3 h-3 text-purple-400" />
              <span>Isolated Storage</span>
            </div>
          </div>

          {/* Quick Continue for known users */}
          {knownUsers.length > 0 && (
            <div className="mb-6">
              <label className="block text-xs font-medium text-purple-300/80 mb-2">
                Continue with previous session:
              </label>
              <div className="flex flex-wrap gap-2">
                {knownUsers.slice(0, 3).map((userEmail) => (
                  <button
                    key={userEmail}
                    type="button"
                    onClick={() => handleQuickLogin(userEmail)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-900/30 hover:bg-purple-800/50 border border-purple-500/30 hover:border-purple-400 text-xs text-purple-200 transition-all group"
                  >
                    <span className="w-2 h-2 rounded-full bg-violet-400 group-hover:animate-ping" />
                    <span className="truncate max-w-[170px]">{userEmail}</span>
                    <ArrowRight className="w-3 h-3 text-purple-400 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs font-medium text-purple-200 mb-1.5">
                Email Address <span className="text-purple-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-purple-400/60">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  placeholder="alex@company.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-purple-950/40 border border-purple-500/25 text-white placeholder-purple-400/40 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400 transition-all"
                />
              </div>
              <p className="text-[11px] text-purple-300/50 mt-1">
                Data is isolated under <code className="text-purple-300/70">violeads:user:&lt;email&gt;</code>
              </p>
            </div>

            <div>
              <label htmlFor="name" className="block text-xs font-medium text-purple-200 mb-1.5">
                Your Name <span className="text-purple-400/60">(Optional)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-purple-400/60">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Rivers"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-purple-950/40 border border-purple-500/25 text-white placeholder-purple-400/40 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400 transition-all"
                />
              </div>
            </div>

            {/* Detected Device Info Card */}
            <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/20 text-xs">
              <div className="flex items-start gap-2.5 text-purple-200">
                <Laptop className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="text-[11px] font-medium text-purple-400/80 uppercase tracking-wider block">
                    Current Device Logged
                  </span>
                  <p className="text-purple-100 font-medium">{currentDeviceName || detected.friendlyName}</p>
                  <p className="text-[10px] text-purple-300/60">
                    Screen: {detected.screenResolution} • {detected.os}
                  </p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:via-purple-500 hover:to-indigo-500 text-white font-medium text-sm shadow-lg shadow-purple-900/50 hover:shadow-purple-700/60 transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Sign in to VioKanban</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Feature badges */}
        <div className="mt-8 grid grid-cols-3 gap-3 text-center">
          <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/10">
            <ShieldCheck className="w-4 h-4 text-violet-400 mx-auto mb-1.5" />
            <p className="text-[11px] font-semibold text-purple-200">100% Private</p>
            <p className="text-[10px] text-purple-300/60">Scoped to email</p>
          </div>
          <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/10">
            <Sparkles className="w-4 h-4 text-purple-400 mx-auto mb-1.5" />
            <p className="text-[11px] font-semibold text-purple-200">Sticky Notes</p>
            <p className="text-[10px] text-purple-300/60">8 Vibrant shades</p>
          </div>
          <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/10">
            <CheckCircle2 className="w-4 h-4 text-indigo-400 mx-auto mb-1.5" />
            <p className="text-[11px] font-semibold text-purple-200">Zero Backend</p>
            <p className="text-[10px] text-purple-300/60">Instant offline</p>
          </div>
        </div>
      </div>
    </div>
  );
};
