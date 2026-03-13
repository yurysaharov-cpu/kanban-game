import { api } from './client';
import { GameState, GameSummary, LeaderboardEntry, CfdData, RevenuePoint, CycleTimePoint } from '../types';

export const gameApi = {
  list: () => api.get<GameSummary[]>('/games'),
  leaderboard: (gameType = 'Standard') => api.get<LeaderboardEntry[]>(`/games/leaderboard?gameType=${gameType}`),
  create: (gameType: string) => api.post<{ gameId: number }>('/games/new', { gameType }),
  delete: (id: number) => api.delete<{ ok: boolean }>(`/games/${id}`),
  start: (GameId: number) => api.post<GameState>('/games/start', { GameId }),
  next: (GameId: number) => api.post<GameState>('/games/next', { GameId }),
  moveStory: (GameId: number, StoryId: number, Stage: string) =>
    api.post<GameState>('/story/move', { GameId, StoryId, Stage }),
  moveTeamMember: (GameId: number, TeamMemberId: number, StoryId: number | null) =>
    api.post<GameState>('/team-member/move', { GameId, TeamMemberId, StoryId }),
  cfd: (GameId: number) => api.post<CfdData>('/chart/cfd', { GameId }),
  revenue: (GameId: number) => api.post<RevenuePoint[]>('/chart/revenue', { GameId }),
  cycleTime: (GameId: number) => api.post<CycleTimePoint[]>('/chart/cycle-time', { GameId }),
};
