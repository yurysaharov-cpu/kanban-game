import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../store/authStore';
import { useGameStore } from '../store/gameStore';
import { GameState } from '../types';

// ─── authStore ───────────────────────────────────────────────────────────────

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.setState({ token: null, username: null });
    localStorage.clear();
  });

  it('starts with null token and username', () => {
    const { token, username } = useAuthStore.getState();
    expect(token).toBeNull();
    expect(username).toBeNull();
  });

  it('setAuth saves token and username to state and localStorage', () => {
    useAuthStore.getState().setAuth('jwt_token_123', 'alice');
    const { token, username } = useAuthStore.getState();
    expect(token).toBe('jwt_token_123');
    expect(username).toBe('alice');
    expect(localStorage.getItem('token')).toBe('jwt_token_123');
    expect(localStorage.getItem('username')).toBe('alice');
  });

  it('logout clears token, username, and localStorage', () => {
    useAuthStore.getState().setAuth('tok', 'bob');
    useAuthStore.getState().logout();
    const { token, username } = useAuthStore.getState();
    expect(token).toBeNull();
    expect(username).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('username')).toBeNull();
  });

  it('calling setAuth twice updates to latest value', () => {
    useAuthStore.getState().setAuth('tok1', 'user1');
    useAuthStore.getState().setAuth('tok2', 'user2');
    expect(useAuthStore.getState().token).toBe('tok2');
    expect(useAuthStore.getState().username).toBe('user2');
  });
});

// ─── gameStore ───────────────────────────────────────────────────────────────

const MOCK_STATE: GameState = {
  Day: 5,
  GameType: 'Standard',
  GameOver: false,
  TotalRevenue: 1200,
  Wip: [3, 2, 4, 2],
  DisplayType: 1,
  EventCard: '',
  Stories: [],
  TeamMembers: [],
};

describe('gameStore', () => {
  beforeEach(() => {
    useGameStore.getState().reset();
  });

  it('starts with null gameId and state', () => {
    const { gameId, state, loading } = useGameStore.getState();
    expect(gameId).toBeNull();
    expect(state).toBeNull();
    expect(loading).toBe(false);
  });

  it('setGameId updates gameId', () => {
    useGameStore.getState().setGameId(42);
    expect(useGameStore.getState().gameId).toBe(42);
  });

  it('setState updates game state', () => {
    useGameStore.getState().setState(MOCK_STATE);
    const { state } = useGameStore.getState();
    expect(state?.Day).toBe(5);
    expect(state?.TotalRevenue).toBe(1200);
    expect(state?.GameType).toBe('Standard');
  });

  it('setLoading toggles loading flag', () => {
    useGameStore.getState().setLoading(true);
    expect(useGameStore.getState().loading).toBe(true);
    useGameStore.getState().setLoading(false);
    expect(useGameStore.getState().loading).toBe(false);
  });

  it('reset clears all state', () => {
    useGameStore.getState().setGameId(10);
    useGameStore.getState().setState(MOCK_STATE);
    useGameStore.getState().setLoading(true);
    useGameStore.getState().reset();
    const { gameId, state, loading } = useGameStore.getState();
    expect(gameId).toBeNull();
    expect(state).toBeNull();
    expect(loading).toBe(false);
  });
});
