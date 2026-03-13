import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { buildGameState } from '../services/gameEngine';

const router = Router();
const prisma = new PrismaClient();

// POST /api/story/move — move a story to a different stage
router.post('/move', requireAuth, async (req: AuthRequest, res: Response) => {
  const { StoryId, Stage, GameId } = req.body as { StoryId: number; Stage: string; GameId: number };

  const game = await prisma.game.findUnique({ where: { id: GameId } });
  if (!game || game.userId !== req.userId) {
    res.status(404).json({ error: 'Game not found' });
    return;
  }

  const story = await prisma.story.findFirst({ where: { id: StoryId, gameId: GameId } });
  if (!story) {
    res.status(404).json({ error: 'Story not found' });
    return;
  }

  const updateData: Record<string, unknown> = { stage: Stage };

  // Track when story enters ready
  if (Stage === 'ready' && story.dayReady === 0) {
    updateData.dayReady = game.currentDay;
  }

  await prisma.story.update({ where: { id: StoryId }, data: updateData });

  const state = await buildGameState(GameId);
  res.json(state);
});

export default router;
