import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.post('/register', async (req: Request, res: Response) => {
  const { username, email, password } = req.body as { username: string; email: string; password: string };
  if (!username || !email || !password) {
    res.status(400).json({ error: 'All fields required' });
    return;
  }
  const existing = await prisma.user.findFirst({ where: { OR: [{ username }, { email }] } });
  if (existing) {
    res.status(409).json({ error: 'Username or email already taken' });
    return;
  }
  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { username, email, password: hash } });
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '7d' });
  res.status(201).json({ token, username: user.username });
});

router.post('/login', async (req: Request, res: Response) => {
  const { username, password } = req.body as { username: string; password: string };
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '7d' });
  res.json({ token, username: user.username });
});

router.get('/me', requireAuth, async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId }, select: { id: true, username: true, email: true } });
  res.json(user);
});

export default router;
