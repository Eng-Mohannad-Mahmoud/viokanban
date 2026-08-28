import React from 'react';
import { useAuth } from './hooks/useAuth';
import { useBoards } from './hooks/useBoards';
import { Login } from './components/Login';
import { Layout } from './components/Layout';
import { Layers } from 'lucide-react';

export default function App() {
  const {
    session,
    isAuthenticated,
    loading,
    devices,
    currentDeviceName,
    knownUsers,
    login,
    logout,
  } = useAuth();

  const boardsHook = useBoards(session?.email);

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#090712] text-white">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-xl shadow-purple-900/50 animate-pulse mb-3 border border-purple-400/30">
          <Layers className="w-6 h-6 text-white" />
        </div>
        <p className="text-xs font-semibold tracking-wider text-purple-300 uppercase">
          Loading VioKanban...
        </p>
      </div>
    );
  }

  if (!isAuthenticated || !session) {
    return (
      <Login
        onLogin={login}
        knownUsers={knownUsers}
        currentDeviceName={currentDeviceName}
      />
    );
  }

  return (
    <Layout
      session={session}
      devices={devices}
      currentDeviceName={currentDeviceName}
      onLogout={logout}
      boardsHook={boardsHook}
    />
  );
}
