import React, { useState } from 'react';
import {
  Layers,
  Plus,
  LogOut,
  Laptop,
  MoreVertical,
  Edit2,
  Trash2,
  X,
  Search,
  FolderKanban,
  HardDrive,
  Shield,
} from 'lucide-react';
import { Board, UserSession } from '../types';
import { BOARD_THEMES } from '../lib/storage';

interface SidebarProps {
  boards: Board[];
  activeBoardId: string | null;
  session: UserSession | null;
  onSelectBoard: (boardId: string) => void;
  onCreateBoardClick: () => void;
  onEditBoardClick: (board: Board) => void;
  onDeleteBoard: (boardId: string) => void;
  onOpenDevicesModal: () => void;
  onLogout: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  boards,
  activeBoardId,
  session,
  onSelectBoard,
  onCreateBoardClick,
  onEditBoardClick,
  onDeleteBoard,
  onOpenDevicesModal,
  onLogout,
  isOpenMobile,
  onCloseMobile,
}) => {
  const [boardSearch, setBoardSearch] = useState('');
  const [menuOpenBoardId, setMenuOpenBoardId] = useState<string | null>(null);

  const filteredBoards = boards.filter((b) =>
    b.name.toLowerCase().includes(boardSearch.toLowerCase())
  );

  const getBoardTheme = (colorId: string) => {
    return BOARD_THEMES.find((t) => t.id === colorId) || BOARD_THEMES[0];
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#0e0a1c] border-r border-purple-500/20 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header Branding */}
        <div className="p-4 border-b border-purple-500/15 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-purple-900/50 border border-purple-400/30">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                VioKanban
              </h1>
              <span className="text-[10px] font-mono text-purple-400/70 uppercase">
                Isolated Workspace
              </span>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-purple-300/70 hover:text-white hover:bg-purple-500/10 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Board Search & Actions */}
        <div className="p-3 border-b border-purple-500/10 space-y-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-purple-400/50" />
            <input
              type="text"
              value={boardSearch}
              onChange={(e) => setBoardSearch(e.target.value)}
              placeholder="Filter boards..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-purple-950/40 border border-purple-500/20 text-xs text-purple-100 placeholder-purple-400/40 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
            />
          </div>

          <button
            type="button"
            onClick={() => {
              onCreateBoardClick();
              onCloseMobile();
            }}
            className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-purple-900/40 flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Board</span>
          </button>
        </div>

        {/* Boards List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <div className="px-2 py-1 flex items-center justify-between text-[11px] font-semibold text-purple-400/60 uppercase tracking-wider">
            <span>Your Boards ({boards.length})</span>
          </div>

          {filteredBoards.length === 0 ? (
            <div className="p-4 text-center text-xs text-purple-300/50">
              No boards found
            </div>
          ) : (
            filteredBoards.map((board) => {
              const theme = getBoardTheme(board.color);
              const isActive = board.id === activeBoardId;

              return (
                <div
                  key={board.id}
                  className={`group relative rounded-xl transition-all duration-150 flex items-center justify-between p-2.5 cursor-pointer ${
                    isActive
                      ? 'bg-purple-900/40 border border-purple-500/40 text-white shadow-sm shadow-purple-900/50'
                      : 'hover:bg-purple-950/40 border border-transparent text-purple-200/80 hover:text-white'
                  }`}
                  onClick={() => {
                    onSelectBoard(board.id);
                    onCloseMobile();
                  }}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: theme.accent }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium truncate">{board.name}</p>
                      {board.description && (
                        <p className="text-[10px] text-purple-300/50 truncate">
                          {board.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Board Menu trigger */}
                  <div className="relative shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpenBoardId(menuOpenBoardId === board.id ? null : board.id);
                      }}
                      className="p-1 rounded-md text-purple-400/40 hover:text-purple-200 hover:bg-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>

                    {menuOpenBoardId === board.id && (
                      <div
                        className="absolute right-0 top-6 z-50 w-36 rounded-xl glass-dropdown p-1 shadow-2xl text-xs"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            onEditBoardClick(board);
                            setMenuOpenBoardId(null);
                          }}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-purple-600/30 text-purple-200 text-left transition-colors"
                        >
                          <Edit2 className="w-3 h-3 text-purple-400" />
                          <span>Edit Board</span>
                        </button>
                        {boards.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Delete board "${board.name}" and all its tasks?`)) {
                                onDeleteBoard(board.id);
                              }
                              setMenuOpenBoardId(null);
                            }}
                            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-rose-500/20 text-rose-300 text-left transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Account & Device Footer */}
        <div className="p-3 border-t border-purple-500/15 bg-[#0a0715]/80 space-y-2">
          {session && (
            <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/20">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white uppercase shrink-0">
                    {session.email[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate">
                      {session.name || session.email.split('@')[0]}
                    </p>
                    <p className="text-[10px] text-purple-300/60 truncate font-mono">
                      {session.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Active Device Info & Modal trigger */}
              <button
                type="button"
                onClick={onOpenDevicesModal}
                className="w-full mt-1 px-2 py-1 rounded-lg bg-purple-900/30 hover:bg-purple-800/40 text-[11px] text-purple-300 flex items-center justify-between transition-colors text-left group"
                title="View logged in devices for this email"
              >
                <div className="flex items-center gap-1.5 truncate">
                  <Laptop className="w-3 h-3 text-purple-400 shrink-0" />
                  <span className="truncate">{session.device}</span>
                </div>
                <span className="text-[10px] font-mono text-purple-400 group-hover:underline shrink-0 ml-1">
                  Devices ↗
                </span>
              </button>
            </div>
          )}

          {/* Logout Button */}
          <button
            type="button"
            onClick={onLogout}
            className="w-full py-2 px-3 rounded-xl bg-purple-950/30 hover:bg-rose-950/40 text-purple-300 hover:text-rose-300 text-xs font-medium border border-purple-500/15 hover:border-rose-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Session</span>
          </button>
        </div>
      </aside>
    </>
  );
};
