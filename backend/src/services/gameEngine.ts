import { PrismaClient, Story, TeamMember } from '@prisma/client';
import { MAX_DAYS } from './storyData';

const prisma = new PrismaClient();

// Stages in order of flow
export const STAGES = ['deck', 'ready', 'analysis', 'analysis-done', 'development', 'development-done', 'test', 'deployed'] as const;
export type Stage = typeof STAGES[number];

// Which stage each role contributes to
const ROLE_STAGE: Record<string, Stage> = {
  analyst: 'analysis',
  developer: 'development',
  tester: 'test',
};

function rollDice(): number {
  return Math.floor(Math.random() * 6) + 1;
}

// Build the full game state response (matches original API shape)
export async function buildGameState(gameId: number) {
  const game = await prisma.game.findUniqueOrThrow({
    where: { id: gameId },
    include: { stories: true, teamMembers: true },
  });

  const stories = game.stories.map((s) => ({
    StoryId: s.id,
    Name: s.name,
    Value: s.value,
    stage: s.stage,
    StoryOrder: s.storyOrder,
    Analysis: s.analysis,
    AnalysisDone: s.analysisDone,
    Development: s.development,
    DevelopmentDone: s.developmentDone,
    Test: s.test,
    TestDone: s.testDone,
    Blocked: s.blocked,
    BlockedDone: s.blockedDone,
    BlockedLabel: s.blockedLabel,
    DayReady: s.dayReady,
    DayDeployed: s.dayDeployed,
    DueDay: s.dueDay,
    Expedited: s.expedited,
    IsBlocked: s.isBlocked,
    Label: s.label,
  }));

  const teamMembers = game.teamMembers.map((m) => ({
    TeamMemberId: m.id,
    Role: m.role,
    Active: m.active,
    StoryId: m.assignedStoryId,
  }));

  return {
    Day: game.currentDay,
    GameType: game.gameType,
    GameOver: game.isCompleted,
    TotalRevenue: game.totalRevenue,
    Wip: [game.wipReady, game.wipAnalysis, game.wipDev, game.wipTest],
    DisplayType: 1,
    EventCard: '',
    Stories: stories,
    TeamMembers: teamMembers,
  };
}

// Process next day: roll dice, apply work, advance stories
export async function processNextDay(gameId: number) {
  const game = await prisma.game.findUniqueOrThrow({
    where: { id: gameId },
    include: { stories: true, teamMembers: true },
  });

  if (game.isCompleted) return buildGameState(gameId);

  const nextDay = game.currentDay + 1;
  const maxDay = MAX_DAYS[game.gameType] || 35;

  // Group stories by stage for quick lookup
  const storiesById = new Map(game.stories.map((s) => [s.id, { ...s }]));
  const updates: Map<number, Partial<Story>> = new Map();

  // For each active team member, roll dice and apply work
  for (const member of game.teamMembers) {
    if (!member.active) continue;

    const targetStage = ROLE_STAGE[member.role];
    if (!targetStage) continue;

    const roll = rollDice();

    // Find the story this member is assigned to, or find any story in the right stage
    let targetStory: typeof game.stories[0] | undefined;

    if (member.assignedStoryId) {
      const s = storiesById.get(member.assignedStoryId);
      if (s && (s.stage === targetStage || s.stage === targetStage + '-done')) {
        targetStory = s;
      }
    }

    // If no assigned story, pick the first available in stage
    if (!targetStory) {
      targetStory = game.stories.find(
        (s) => s.stage === targetStage && !s.isBlocked
      );
    }

    if (!targetStory) continue;

    // Specialist bonus: double work in own specialization area
    const isSpecialist =
      (member.role === 'analyst' && targetStory.stage === 'analysis') ||
      (member.role === 'developer' && targetStory.stage === 'development') ||
      (member.role === 'tester' && targetStory.stage === 'test');

    const work = isSpecialist ? roll * 2 : roll;
    const current = updates.get(targetStory.id) || { ...targetStory };

    if (targetStory.stage === 'analysis') {
      const remaining = targetStory.analysis - (current.analysisDone ?? targetStory.analysisDone);
      const applied = Math.min(work, remaining);
      current.analysisDone = (current.analysisDone ?? targetStory.analysisDone) + applied;
    } else if (targetStory.stage === 'development') {
      const remaining = targetStory.development - (current.developmentDone ?? targetStory.developmentDone);
      const applied = Math.min(work, remaining);
      current.developmentDone = (current.developmentDone ?? targetStory.developmentDone) + applied;
    } else if (targetStory.stage === 'test') {
      const remaining = targetStory.test - (current.testDone ?? targetStory.testDone);
      const applied = Math.min(work, remaining);
      current.testDone = (current.testDone ?? targetStory.testDone) + applied;
    }

    updates.set(targetStory.id, current);
  }

  // Auto-advance completed stories
  let newRevenue = 0;
  for (const [id, update] of updates) {
    const original = storiesById.get(id)!;
    const merged = { ...original, ...update };

    if (merged.stage === 'analysis' && merged.analysisDone >= merged.analysis) {
      update.stage = 'analysis-done';
    } else if (merged.stage === 'development' && merged.developmentDone >= merged.development) {
      update.stage = 'development-done';
    } else if (merged.stage === 'test' && merged.testDone >= merged.test) {
      update.stage = 'deployed';
      update.dayDeployed = nextDay;
      newRevenue += original.value;
    }

    updates.set(id, update);
  }

  // Apply all updates to DB
  await Promise.all(
    Array.from(updates.entries()).map(([id, data]) =>
      prisma.story.update({ where: { id }, data })
    )
  );

  // Update game day and revenue
  const isCompleted = nextDay >= maxDay;
  await prisma.game.update({
    where: { id: gameId },
    data: {
      currentDay: nextDay,
      totalRevenue: game.totalRevenue + newRevenue,
      isCompleted,
    },
  });

  // Save chart snapshot for this day
  const allStories = await prisma.story.findMany({ where: { gameId } });
  const stageCounts = (stage: string) => allStories.filter((s) => s.stage === stage).length;

  await prisma.chartDay.create({
    data: {
      gameId,
      day: nextDay,
      ready: stageCounts('ready'),
      analysis: stageCounts('analysis') + stageCounts('analysis-done'),
      development: stageCounts('development') + stageCounts('development-done'),
      test: stageCounts('test'),
      deployed: stageCounts('deployed'),
      revenue: game.totalRevenue + newRevenue,
    },
  });

  // Update leaderboard if game over and type is Standard
  if (isCompleted) {
    await updateLeaderboard(game.userId, gameId, game.gameType, game.totalRevenue + newRevenue);
  }

  return buildGameState(gameId);
}

async function updateLeaderboard(userId: number, _gameId: number, gameType: string, score: number) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { username: true } });
  if (!user) return;
  // Keep best score per user per game type
  const existing = await prisma.leaderboard.findFirst({ where: { userId, gameType } });
  if (!existing) {
    await prisma.leaderboard.create({ data: { userId, username: user.username, gameType, score } });
  } else if (score > existing.score) {
    await prisma.leaderboard.update({ where: { id: existing.id }, data: { score, username: user.username } });
  }
}
