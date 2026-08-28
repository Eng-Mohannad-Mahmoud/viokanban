import { useState, useEffect, useCallback, useMemo } from 'react';
import { Board, Column, Note, PriorityLevel, ChecklistItem } from '../types';
import {
  getBoards,
  saveBoards,
  getActiveBoardId,
  setActiveBoardId,
  getColumns,
  saveColumns,
  getNotes,
  saveNotes,
  seedInitialDataIfEmpty,
  resetUserData,
  exportUserData,
  importUserData,
} from '../lib/storage';

export function useBoards(email: string | undefined) {
  const [boards, setBoards] = useState<Board[]>([]);
  const [activeBoardId, setActiveBoardIdState] = useState<string | null>(null);
  const [columns, setColumns] = useState<Column[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<PriorityLevel | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  // Load user data on email change
  const reloadData = useCallback(() => {
    if (!email) {
      setBoards([]);
      setColumns([]);
      setNotes([]);
      setActiveBoardIdState(null);
      return;
    }

    const { boards: seededBoards, columns: seededCols, notes: seededNotes } = seedInitialDataIfEmpty(email);
    const storedActiveId = getActiveBoardId(email);

    setBoards(seededBoards);
    setColumns(seededCols);
    setNotes(seededNotes);

    if (storedActiveId && seededBoards.some((b) => b.id === storedActiveId)) {
      setActiveBoardIdState(storedActiveId);
    } else if (seededBoards.length > 0) {
      setActiveBoardIdState(seededBoards[0].id);
      setActiveBoardId(email, seededBoards[0].id);
    } else {
      setActiveBoardIdState(null);
    }
  }, [email]);

  useEffect(() => {
    reloadData();
  }, [reloadData]);

  // Current active board
  const activeBoard = useMemo(() => {
    return boards.find((b) => b.id === activeBoardId) || boards[0] || null;
  }, [boards, activeBoardId]);

  // Columns for the active board, sorted by order
  const activeColumns = useMemo(() => {
    if (!activeBoard) return [];
    return columns
      .filter((c) => c.boardId === activeBoard.id)
      .sort((a, b) => a.order - b.order);
  }, [columns, activeBoard]);

  // Notes for the active board, filtered by search / tags / priority
  const filteredNotes = useMemo(() => {
    if (!activeBoard) return [];
    
    // Notes belonging to active board's columns
    const columnIds = new Set(activeColumns.map((c) => c.id));
    let boardNotes = notes.filter((n) => columnIds.has(n.columnId));

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      boardNotes = boardNotes.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          (n.description && n.description.toLowerCase().includes(q)) ||
          n.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (selectedTag) {
      boardNotes = boardNotes.filter((n) => n.tags.includes(selectedTag));
    }

    if (selectedPriority) {
      boardNotes = boardNotes.filter((n) => n.priority === selectedPriority);
    }

    if (selectedColor) {
      boardNotes = boardNotes.filter((n) => n.color === selectedColor);
    }

    return boardNotes;
  }, [notes, activeBoard, activeColumns, searchQuery, selectedTag, selectedPriority, selectedColor]);

  // Available tags in active board
  const availableTags = useMemo(() => {
    if (!activeBoard) return [];
    const columnIds = new Set(activeColumns.map((c) => c.id));
    const boardNotes = notes.filter((n) => columnIds.has(n.columnId));
    const tagSet = new Set<string>();
    boardNotes.forEach((n) => n.tags.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet);
  }, [notes, activeBoard, activeColumns]);

  // Board Stats
  const boardStats = useMemo(() => {
    if (!activeBoard) return { total: 0, completed: 0, percentage: 0 };
    const columnIds = new Set(activeColumns.map((c) => c.id));
    const boardNotes = notes.filter((n) => columnIds.has(n.columnId));
    const total = boardNotes.length;
    // Consider completed if note.completed === true OR in a column with 'done' or 'completed' in title
    const doneColIds = new Set(
      activeColumns
        .filter((c) => /done|completed|finished|accomplished/i.test(c.title))
        .map((c) => c.id)
    );
    const completed = boardNotes.filter((n) => n.completed || doneColIds.has(n.columnId)).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percentage };
  }, [notes, activeBoard, activeColumns]);

  // ----------------------------------------------------
  // Board Actions
  // ----------------------------------------------------

  const selectBoard = useCallback(
    (boardId: string) => {
      if (!email) return;
      setActiveBoardIdState(boardId);
      setActiveBoardId(email, boardId);
      // Reset active filters on board switch
      setSearchQuery('');
      setSelectedTag(null);
      setSelectedPriority(null);
      setSelectedColor(null);
    },
    [email]
  );

  const createBoard = useCallback(
    (name: string, description?: string, color: string = 'purple', template: string = 'standard') => {
      if (!email) return null;
      const now = new Date().toISOString();
      const newBoardId = 'board_' + Math.random().toString(36).substring(2, 9);

      const newBoard: Board = {
        id: newBoardId,
        name: name.trim() || 'Untitled Board',
        description: description?.trim(),
        color,
        createdAt: now,
      };

      // Create default columns based on chosen template
      let defaultColTitles: string[] = ['To Do', 'In Progress ⚡', 'Done 🎉'];
      if (template === 'standard') {
        defaultColTitles = ['Backlog 💡', 'To Do 📌', 'In Progress ⚡', 'Done 🎉'];
      } else if (template === 'minimal') {
        defaultColTitles = ['To Do', 'Done'];
      } else if (template === 'matrix') {
        defaultColTitles = ['🔥 Urgent & Important', '⭐ Important (Not Urgent)', '⚡ Urgent (Not Important)', '📦 Later'];
      }

      const newCols: Column[] = defaultColTitles.map((title, idx) => ({
        id: 'col_' + Math.random().toString(36).substring(2, 9),
        boardId: newBoardId,
        title,
        order: idx,
      }));

      // Add a starter welcome sticky note to the first column
      const starterNote: Note = {
        id: 'note_' + Math.random().toString(36).substring(2, 9),
        columnId: newCols[0].id,
        boardId: newBoardId,
        title: `Welcome to ${newBoard.name}!`,
        description: 'Click this sticky note to edit or customize it. Drag and drop between columns to move tasks.',
        color: 'violet',
        tags: ['Welcome'],
        priority: 'medium',
        order: 0,
        createdAt: now,
      };

      const updatedBoards = [...boards, newBoard];
      const updatedCols = [...columns, ...newCols];
      const updatedNotes = [...notes, starterNote];

      saveBoards(email, updatedBoards);
      saveColumns(email, updatedCols);
      saveNotes(email, updatedNotes);
      setActiveBoardId(email, newBoardId);

      setBoards(updatedBoards);
      setColumns(updatedCols);
      setNotes(updatedNotes);
      setActiveBoardIdState(newBoardId);

      return newBoard;
    },
    [email, boards, columns, notes]
  );

  const updateBoard = useCallback(
    (boardId: string, updates: Partial<Omit<Board, 'id' | 'createdAt'>>) => {
      if (!email) return;
      const updatedBoards = boards.map((b) => (b.id === boardId ? { ...b, ...updates, updatedAt: new Date().toISOString() } : b));
      saveBoards(email, updatedBoards);
      setBoards(updatedBoards);
    },
    [email, boards]
  );

  const deleteBoard = useCallback(
    (boardId: string) => {
      if (!email) return;
      const updatedBoards = boards.filter((b) => b.id !== boardId);
      const boardColIds = new Set(columns.filter((c) => c.boardId === boardId).map((c) => c.id));
      const updatedCols = columns.filter((c) => c.boardId !== boardId);
      const updatedNotes = notes.filter((n) => !boardColIds.has(n.columnId));

      saveBoards(email, updatedBoards);
      saveColumns(email, updatedCols);
      saveNotes(email, updatedNotes);

      setBoards(updatedBoards);
      setColumns(updatedCols);
      setNotes(updatedNotes);

      if (activeBoardId === boardId) {
        const nextActive = updatedBoards[0]?.id || null;
        setActiveBoardIdState(nextActive);
        if (nextActive) setActiveBoardId(email, nextActive);
      }
    },
    [email, boards, columns, notes, activeBoardId]
  );

  // ----------------------------------------------------
  // Column Actions
  // ----------------------------------------------------

  const addColumn = useCallback(
    (title: string, color?: string) => {
      if (!email || !activeBoard) return;
      const currentBoardCols = columns.filter((c) => c.boardId === activeBoard.id);
      const maxOrder = currentBoardCols.reduce((max, c) => Math.max(max, c.order), -1);

      const newCol: Column = {
        id: 'col_' + Math.random().toString(36).substring(2, 9),
        boardId: activeBoard.id,
        title: title.trim() || 'New Column',
        order: maxOrder + 1,
        color: color || '#8b5cf6',
      };

      const updated = [...columns, newCol];
      saveColumns(email, updated);
      setColumns(updated);
    },
    [email, activeBoard, columns]
  );

  const updateColumn = useCallback(
    (columnId: string, updates: Partial<Omit<Column, 'id' | 'boardId'>>) => {
      if (!email) return;
      const updated = columns.map((c) => (c.id === columnId ? { ...c, ...updates } : c));
      saveColumns(email, updated);
      setColumns(updated);
    },
    [email, columns]
  );

  const deleteColumn = useCallback(
    (columnId: string) => {
      if (!email) return;
      const updatedCols = columns.filter((c) => c.id !== columnId);
      const updatedNotes = notes.filter((n) => n.columnId !== columnId);

      saveColumns(email, updatedCols);
      saveNotes(email, updatedNotes);

      setColumns(updatedCols);
      setNotes(updatedNotes);
    },
    [email, columns, notes]
  );

  const reorderColumns = useCallback(
    (reorderedActiveCols: Column[]) => {
      if (!email || !activeBoard) return;
      const otherCols = columns.filter((c) => c.boardId !== activeBoard.id);
      const updatedActiveCols = reorderedActiveCols.map((col, index) => ({
        ...col,
        order: index,
      }));
      const allUpdated = [...otherCols, ...updatedActiveCols];
      saveColumns(email, allUpdated);
      setColumns(allUpdated);
    },
    [email, activeBoard, columns]
  );

  // ----------------------------------------------------
  // Note Actions
  // ----------------------------------------------------

  const createNote = useCallback(
    (noteData: {
      columnId: string;
      title: string;
      description?: string;
      color?: string;
      tags?: string[];
      priority?: PriorityLevel;
      startDate?: string;
      dueDate?: string;
      dueTime?: string;
      dueComplete?: boolean;
      checklist?: ChecklistItem[];
    }) => {
      if (!email || !activeBoard) return null;
      const now = new Date().toISOString();
      const colNotes = notes.filter((n) => n.columnId === noteData.columnId);
      const maxOrder = colNotes.reduce((max, n) => Math.max(max, n.order), -1);

      const newNote: Note = {
        id: 'note_' + Math.random().toString(36).substring(2, 9),
        columnId: noteData.columnId,
        boardId: activeBoard.id,
        title: noteData.title.trim() || 'Untitled Note',
        description: noteData.description?.trim(),
        color: noteData.color || 'violet',
        tags: noteData.tags || [],
        priority: noteData.priority || 'medium',
        startDate: noteData.startDate,
        dueDate: noteData.dueDate,
        dueTime: noteData.dueTime,
        dueComplete: noteData.dueComplete || false,
        checklist: noteData.checklist || [],
        order: maxOrder + 1,
        createdAt: now,
      };

      const updated = [...notes, newNote];
      saveNotes(email, updated);
      setNotes(updated);
      return newNote;
    },
    [email, activeBoard, notes]
  );

  const updateNote = useCallback(
    (noteId: string, updates: Partial<Omit<Note, 'id' | 'createdAt'>>) => {
      if (!email) return;
      const updated = notes.map((n) =>
        n.id === noteId ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n
      );
      saveNotes(email, updated);
      setNotes(updated);
    },
    [email, notes]
  );

  const deleteNote = useCallback(
    (noteId: string) => {
      if (!email) return;
      const updated = notes.filter((n) => n.id !== noteId);
      saveNotes(email, updated);
      setNotes(updated);
    },
    [email, notes]
  );

  const duplicateNote = useCallback(
    (noteId: string) => {
      if (!email) return;
      const original = notes.find((n) => n.id === noteId);
      if (!original) return;

      const now = new Date().toISOString();
      const colNotes = notes.filter((n) => n.columnId === original.columnId);
      const maxOrder = colNotes.reduce((max, n) => Math.max(max, n.order), -1);

      const duplicated: Note = {
        ...original,
        id: 'note_' + Math.random().toString(36).substring(2, 9),
        title: `${original.title} (Copy)`,
        order: maxOrder + 1,
        createdAt: now,
        updatedAt: now,
      };

      const updated = [...notes, duplicated];
      saveNotes(email, updated);
      setNotes(updated);
    },
    [email, notes]
  );

  const toggleNoteComplete = useCallback(
    (noteId: string) => {
      if (!email) return;
      const note = notes.find((n) => n.id === noteId);
      if (!note) return;
      updateNote(noteId, { completed: !note.completed });
    },
    [email, notes, updateNote]
  );

  const toggleDueComplete = useCallback(
    (noteId: string) => {
      if (!email) return;
      const note = notes.find((n) => n.id === noteId);
      if (!note) return;
      updateNote(noteId, { dueComplete: !note.dueComplete });
    },
    [email, notes, updateNote]
  );

  const toggleChecklistItem = useCallback(
    (noteId: string, itemId: string) => {
      if (!email) return;
      const note = notes.find((n) => n.id === noteId);
      if (!note || !note.checklist) return;
      const updatedList = note.checklist.map((item) =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      );
      updateNote(noteId, { checklist: updatedList });
    },
    [email, notes, updateNote]
  );

  const addChecklistItem = useCallback(
    (noteId: string, text: string) => {
      if (!email || !text.trim()) return;
      const note = notes.find((n) => n.id === noteId);
      if (!note) return;
      const newItem: ChecklistItem = {
        id: 'chk_' + Math.random().toString(36).substring(2, 9),
        text: text.trim(),
        completed: false,
      };
      const updatedList = [...(note.checklist || []), newItem];
      updateNote(noteId, { checklist: updatedList });
    },
    [email, notes, updateNote]
  );

  const deleteChecklistItem = useCallback(
    (noteId: string, itemId: string) => {
      if (!email) return;
      const note = notes.find((n) => n.id === noteId);
      if (!note || !note.checklist) return;
      const updatedList = note.checklist.filter((item) => item.id !== itemId);
      updateNote(noteId, { checklist: updatedList });
    },
    [email, notes, updateNote]
  );

  // Drag and Drop move note handler
  const moveNote = useCallback(
    (noteId: string, targetColumnId: string, targetIndex?: number) => {
      if (!email) return;

      const noteToMove = notes.find((n) => n.id === noteId);
      if (!noteToMove) return;

      const otherNotes = notes.filter((n) => n.id !== noteId);
      const targetColNotes = otherNotes
        .filter((n) => n.columnId === targetColumnId)
        .sort((a, b) => a.order - b.order);

      const updatedNote: Note = {
        ...noteToMove,
        columnId: targetColumnId,
        updatedAt: new Date().toISOString(),
      };

      // Check if target column is a "completed" column
      const targetCol = columns.find((c) => c.id === targetColumnId);
      if (targetCol && /done|completed|finished|accomplished/i.test(targetCol.title)) {
        updatedNote.completed = true;
      }

      let newTargetColNotes: Note[];
      if (typeof targetIndex === 'number' && targetIndex >= 0 && targetIndex <= targetColNotes.length) {
        newTargetColNotes = [
          ...targetColNotes.slice(0, targetIndex),
          updatedNote,
          ...targetColNotes.slice(targetIndex),
        ];
      } else {
        newTargetColNotes = [...targetColNotes, updatedNote];
      }

      // Re-assign order indices
      const indexedTargetColNotes = newTargetColNotes.map((n, idx) => ({
        ...n,
        order: idx,
      }));

      const finalNotes = [
        ...otherNotes.filter((n) => n.columnId !== targetColumnId),
        ...indexedTargetColNotes,
      ];

      saveNotes(email, finalNotes);
      setNotes(finalNotes);
    },
    [email, notes, columns]
  );

  // ----------------------------------------------------
  // Utility: Reset & Export
  // ----------------------------------------------------

  const resetData = useCallback(() => {
    if (!email) return;
    const { boards: b, columns: c, notes: n } = resetUserData(email);
    setBoards(b);
    setColumns(c);
    setNotes(n);
    if (b.length > 0) {
      setActiveBoardIdState(b[0].id);
      setActiveBoardId(email, b[0].id);
    }
  }, [email]);

  const exportData = useCallback(() => {
    if (!email) return '';
    return exportUserData(email);
  }, [email]);

  const importData = useCallback(
    (jsonString: string) => {
      if (!email) return false;
      const success = importUserData(email, jsonString);
      if (success) {
        reloadData();
      }
      return success;
    },
    [email, reloadData]
  );

  return {
    boards,
    activeBoard,
    activeBoardId,
    columns: activeColumns,
    notes: filteredNotes,
    allNotesCount: notes.length,
    availableTags,
    boardStats,

    // Filter controls
    searchQuery,
    setSearchQuery,
    selectedTag,
    setSelectedTag,
    selectedPriority,
    setSelectedPriority,
    selectedColor,
    setSelectedColor,

    // Actions
    selectBoard,
    createBoard,
    updateBoard,
    deleteBoard,
    addColumn,
    updateColumn,
    deleteColumn,
    reorderColumns,
    createNote,
    updateNote,
    deleteNote,
    duplicateNote,
    toggleNoteComplete,
    toggleDueComplete,
    toggleChecklistItem,
    addChecklistItem,
    deleteChecklistItem,
    moveNote,
    resetData,
    exportData,
    importData,
    reloadData,
  };
}
