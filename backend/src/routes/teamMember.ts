import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { buildGameState } from '../services/gameEngine';

const router = Router();
const prisma = new PrismaClient();

// POST /api/team-member/move — assign/unassign a team member to/from a story
router.post('/move', requireAuth, async (req: AuthRequest, res: Response) => {
  const { TeamMemberId, StoryId, GameId } = req.body as { TeamMemberId: number; StoryId: number | null; GameId: number };

  const game = await prisma.game.findUnique({ where: { id: GameId } });
  if (!game || game.userId !== req.userId) {
    res.status(404).json({ error: 'Game not found' });
    return;
  }

  await prisma.teamMember.update({
    where: { id: TeamMemberId },
    data: { assignedStoryId: StoryId || null },
  });

  const state = await buildGameState(GameId);
  res.json(state);
});

export default router;
