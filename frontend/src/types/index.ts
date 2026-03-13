export type Stage =
  | 'deck'
  | 'ready'
  | 'analysis'
  | 'analysis-done'
  | 'development'
  | 'development-done'
  | 'test'
  | 'deployed';

export type StoryType = 'S' | 'E' | 'I' | 'F';
export type MemberRole = 'analyst' | 'developer' | 'tester';

export interface Story {
  StoryId: number;
  Name: string;
  Value: number;
  stage: Stage;
  StoryOrder: number;
  Analysis: number;
  AnalysisDone: number;
  Development: number;
  DevelopmentDone: number;
  Test: number;
  TestDone: number;
  Blocked: number;
  BlockedDone: number;
  BlockedLabel: string | null;
  DayReady: number;
  DayDeployed: number;
  DueDay: number;
  Expedited: boolean;
  IsBlocked: boolean;
  Label: string | null;
}

export interface TeamMember {
  TeamMemberId: number;
  Role: MemberRole;
  Active: boolean;
  StoryId: number | null;
}

export interface GameState {
  Day: number;
  GameType: string;
  GameOver: boolean;
  TotalRevenue: number;
  Wip: [number, number, number, number]; // [ready, analysis, dev, test]
  DisplayType: number;
  EventCard: string;
  Stories: Story[];
  TeamMembers: TeamMember[];
}

export interface GameSummary {
  id: number;
  gameType: string;
  currentDay: number;
  totalRevenue: number;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LeaderboardEntry {
  username: string;
  score: number;
}

export interface CfdData {
  ready: number[];
  analysis: number[];
  development: number[];
  test: number[];
  deployed: number[];
}

export interface RevenuePoint {
  day: number;
  revenue: number;
}

export interface CycleTimePoint {
  name: string;
  cycleTime: number;
  dayDeployed: number;
  value: number;
}
