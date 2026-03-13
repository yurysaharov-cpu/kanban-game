import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { STANDARD_STORIES, V2_STORIES, TEAM_MEMBERS } from '../services/storyData';
import { buildGameState, processNextDay } from '../services/gameEngine';

const router = Router();
const prisma = new PrismaClient();

// GET /api/games — list user's games
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const games = await prisma.game.findMany({
    where: { userId: req.userId },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      gameType: true,
      currentDay: true,
      totalRevenue: true,
      isCompleted: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  res.json(games);
});

// GET /api/games/leaderboard?gameType=Standard
router.get('/leaderboard', async (req, res) => {
  const gameType = (req.query.gameType as string) || 'Standard';
  const entries = await prisma.leaderboard.findMany({
    where: { gameType },
    orderBy: { score: 'desc' },
    take: 50,
    select: { username: true, score: true },
  });
  res.json(entries);
});

// POST /api/games/new — create new game
router.post('/new', requireAuth, async (req: AuthRequest, res: Response) => {
  const { gameType } = req.body as { gameType: string };
  if (!['Standard', 'V2'].includes(gameType)) {
    res.status(400).json({ error: 'Invalid gameType' });
    return;
  }

  const stories = gameType === 'Standard' ? STANDARD_STORIES : V2_STORIES;

  const game = await prisma.game.create({
    data: {
      userId: req.userId!,
      gameType,
      stories: {
        create: stories.map((s) => ({
          name: s.name,
          storyType: s.storyType,
          value: s.value,
          stage: 'deck',
          storyOrder: s.storyOrder,
          analysis: s.analysis,
          development: s.development,
          test: s.test,
          dueDay: s.dueDay,
          expedited: s.expedited,
        })),
      },
      teamMembers: {
        create: TEAM_MEMBERS.map((m) => ({ role: m.role, active: m.active })),
      },
    },
  });

  res.status(201).json({ gameId: game.id });
});

// POST /api/games/start — get current game state
router.post('/start', requireAuth, async (req: AuthRequest, res: Response) => {
  const { GameId } = req.body as { GameId: number };
  const game = await prisma.game.findUnique({ where: { id: GameId } });
  if (!game || game.userId !== req.userId) {
    res.status(404).json({ error: 'Game not found' });
    return;
  }
  const state = await buildGameState(GameId);
  res.json(state);
});

// POST /api/games/next — advance to next day
router.post('/next', requireAuth, async (req: AuthRequest, res: Response) => {
  const { GameId } = req.body as { GameId: number };
  const game = await prisma.game.findUnique({ where: { id: GameId } });
  if (!game || game.userId !== req.userId) {
    res.status(404).json({ error: 'Game not found' });
    return;
  }
  const state = await processNextDay(GameId);
  res.json(state);
});

// DELETE /api/games/:id
router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id);
  const game = await prisma.game.findUnique({ where: { id } });
  if (!game || game.userId !== req.userId) {
    res.status(404).json({ error: 'Game not found' });
    return;
  }
  await prisma.game.delete({ where: { id } });
  res.json({ ok: true });
});

export default router;
