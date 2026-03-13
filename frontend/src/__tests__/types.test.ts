/**
 * Type-level and pure logic tests for frontend types and utilities.
 * These are pure JS/TS logic tests — no DOM/React needed.
 */

import { describe, it, expect } from 'vitest';
import type { Story, TeamMember, GameState, Stage } from '../types';

describe('types — Stage enum values', () => {
  const validStages: Stage[] = [
    'deck', 'ready', 'analysis', 'analysis-done',
    'development', 'development-done', 'test', 'deployed',
  ];

  it('has 8 valid stages', () => {
    expect(validStages).toHaveLength(8);
  });

  it('deck is the initial stage', () => {
    expect(validStages[0]).toBe('deck');
  });

  it('deployed is the final stage', () => {
    expect(validStages[validStages.length - 1]).toBe('deployed');
  });
});

describe('types — Story shape validation', () => {
  const mockStory: Story = {
    StoryId: 1,
    Name: 'S1',
    Value: 110,
    stage: 'ready',
    StoryOrder: 1,
    Analysis: 10,
    AnalysisDone: 3,
    Development: 8,
    DevelopmentDone: 0,
    Test: 5,
    TestDone: 0,
    Blocked: 0,
    BlockedDone: 0,
    BlockedLabel: null,
    DayReady: 1,
    DayDeployed: 0,
    DueDay: 0,
    Expedited: false,
    IsBlocked: false,
    Label: null,
  };

  it('has all required fields', () => {
    expect(mockStory.StoryId).toBeDefined();
    expect(mockStory.Name).toBeDefined();
    expect(mockStory.stage).toBeDefined();
    expect(mockStory.Analysis).toBeDefined();
    expect(mockStory.Development).toBeDefined();
    expect(mockStory.Test).toBeDefined();
  });

  it('progress percentage calculation is correct', () => {
    const pct = mockStory.AnalysisDone / mockStory.Analysis;
    expect(pct).toBeCloseTo(0.3);
  });

  it('development is not started', () => {
    expect(mockStory.DevelopmentDone).toBe(0);
  });
});

describe('types — TeamMember roles', () => {
  const members: TeamMember[] = [
    { TeamMemberId: 1, Role: 'analyst',   Active: true,  StoryId: null },
    { TeamMemberId: 2, Role: 'developer', Active: true,  StoryId: 5    },
    { TeamMemberId: 3, Role: 'tester',    Active: false, StoryId: null },
  ];

  it('correctly identifies active members', () => {
    const active = members.filter((m) => m.Active);
    expect(active).toHaveLength(2);
  });

  it('correctly identifies assigned members', () => {
    const assigned = members.filter((m) => m.StoryId !== null);
    expect(assigned).toHaveLength(1);
    expect(assigned[0].TeamMemberId).toBe(2);
  });

  it('supports all three roles', () => {
    const roles = members.map((m) => m.Role);
    expect(roles).toContain('analyst');
    expect(roles).toContain('developer');
    expect(roles).toContain('tester');
  });
});

describe('types — GameState WIP array', () => {
  const mockGameState: GameState = {
    Day: 5,
    GameType: 'Standard',
    GameOver: false,
    TotalRevenue: 550,
    Wip: [3, 2, 4, 1],
    DisplayType: 1,
    EventCard: '',
    Stories: [],
    TeamMembers: [],
  };

  it('WIP has 4 elements [ready, analysis, dev, test]', () => {
    expect(mockGameState.Wip).toHaveLength(4);
  });

  it('WIP[0] is ready WIP limit', () => {
    expect(mockGameState.Wip[0]).toBe(3);
  });

  it('WIP[3] is test WIP limit', () => {
    expect(mockGameState.Wip[3]).toBe(1);
  });

  it('GameOver is false initially', () => {
    expect(mockGameState.GameOver).toBe(false);
  });
});

describe('pure logic — revenue formatting', () => {
  it('formats revenue with toLocaleString', () => {
    const revenue = 38660;
    expect(revenue.toLocaleString()).toBe('38,660');
  });

  it('formats zero revenue', () => {
    expect((0).toLocaleString()).toBe('0');
  });
});
