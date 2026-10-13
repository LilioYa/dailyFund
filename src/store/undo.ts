import { create } from 'zustand';

import type { Transaction } from '@/domain/budget';

/** The last deleted transaction, offered for undo for a few seconds. Not saved. */
interface UndoState {
  deleted: Transaction | null;
  offer(tx: Transaction): void;
  clear(): void;
}

export const useUndo = create<UndoState>()((set) => ({
  deleted: null,
  offer: (tx) => set({ deleted: tx }),
  clear: () => set({ deleted: null }),
}));
