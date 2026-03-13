import { create } from 'zustand';
import { GameState } from '../types';

interface GameStore {
  gameId: number | null;
  state: GameState | null;
  loading: boolean;
  setGameId: (id: number) => void;
  setState: (s: GameState) => void;
  setLoading: (v: boolean) => void;
  reset: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  gameId: null,
  state: null,
  loading: false,
  setGameId: (gameId) => set({ gameId }),
  setState: (state) => set({ state }),
  setLoading: (loading) => set({ loading }),
  reset: () => set({ gameId: null, state: null, loading: false }),
}));
