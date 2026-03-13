import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

async function getGame(gameId: number, userId: number) {
  const game = await prisma.game.findUnique({ where: { id: gameId } });
  if (!game || game.userId !== userId) return null;
  return game;
}

// POST /api/chart/cfd
router.post('/cfd', requireAuth, async (req: AuthRequest, res: Response) => {
  const { GameId } = req.body as { GameId: number };
  if (!await getGame(GameId, req.userId!)) { res.status(404).json({ error: 'Not found' }); return; }

  const days = await prisma.chartDay.findMany({ where: { gameId: GameId }, orderBy: { day: 'asc' } });

  res.json({
    ready:       days.map((d) => d.ready),
    analysis:    days.map((d) => d.analysis),
    development: days.map((d) => d.development),
    test:        days.map((d) => d.test),
    deployed:    days.map((d) => d.deployed),
  });
});

// POST /api/chart/revenue
router.post('/revenue', requireAuth, async (req: AuthRequest, res: Response) => {
  const { GameId } = req.body as { GameId: number };
  if (!await getGame(GameId, req.userId!)) { res.status(404).json({ error: 'Not found' }); return; }

  const days = await prisma.chartDay.findMany({ where: { gameId: GameId }, orderBy: { day: 'asc' } });
  res.json(days.map((d) => ({ day: d.day, revenue: d.revenue })));
});

// POST /api/chart/cycle-time
router.post('/cycle-time', requireAuth, async (req: AuthRequest, res: Response) => {
  const { GameId } = req.body as { GameId: number };
  if (!await getGame(GameId, req.userId!)) { res.status(404).json({ error: 'Not found' }); return; }

  const deployed = await prisma.story.findMany({
    where: { gameId: GameId, stage: 'deployed', dayDeployed: { gt: 0 }, dayReady: { gt: 0 } },
    select: { name: true, dayReady: true, dayDeployed: true, value: true },
  });

  res.json(
    deployed.map((s) => ({
      name: s.name,
      cycleTime: s.dayDeployed - s.dayReady,
      dayDeployed: s.dayDeployed,
      value: s.value,
    }))
  );
});

export default router;
