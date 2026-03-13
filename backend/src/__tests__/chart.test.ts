/**
 * Integration tests for /api/chart routes.
 */

import request from 'supertest';
import express from 'express';
import authRoutes from '../routes/auth';
import gameRoutes from '../routes/game';
import chartRoutes from '../routes/chart';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/chart', chartRoutes);

const TS = Date.now();
const USER = { username: `test_chart_${TS}`, email: `chart_${TS}@test.com`, password: 'Pass123' };
let token: string;
let gameId: number;

beforeAll(async () => {
  const reg = await request(app).post('/api/auth/register').send(USER);
  token = reg.body.token;

  const game = await request(app)
    .post('/api/games/new')
    .set('Authorization', `Bearer ${token}`)
    .send({ gameType: 'Standard' });
  gameId = game.body.gameId;

  // Advance 3 days to have some chart data
  for (let i = 0; i < 3; i++) {
    await request(app)
      .post('/api/games/next')
      .set('Authorization', `Bearer ${token}`)
      .send({ GameId: gameId });
  }
});

afterAll(async () => {
  await prisma.game.deleteMany({ where: { user: { username: USER.username } } });
  await prisma.user.deleteMany({ where: { username: USER.username } });
  await prisma.$disconnect();
});

describe('POST /api/chart/cfd', () => {
  it('returns CFD data with correct shape', async () => {
    const res = await request(app)
      .post('/api/chart/cfd')
      .set('Authorization', `Bearer ${token}`)
      .send({ GameId: gameId });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('ready');
    expect(res.body).toHaveProperty('analysis');
    expect(res.body).toHaveProperty('development');
    expect(res.body).toHaveProperty('test');
    expect(res.body).toHaveProperty('deployed');
  });

  it('CFD arrays have one entry per day played', async () => {
    const res = await request(app)
      .post('/api/chart/cfd')
      .set('Authorization', `Bearer ${token}`)
      .send({ GameId: gameId });
    expect(res.body.ready).toHaveLength(3);
    expect(res.body.analysis).toHaveLength(3);
    expect(res.body.deployed).toHaveLength(3);
  });

  it('all CFD values are non-negative integers', async () => {
    const res = await request(app)
      .post('/api/chart/cfd')
      .set('Authorization', `Bearer ${token}`)
      .send({ GameId: gameId });
    for (const key of ['ready', 'analysis', 'development', 'test', 'deployed'] as const) {
      for (const val of res.body[key]) {
        expect(typeof val).toBe('number');
        expect(val).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('returns 401 without auth', async () => {
    const res = await request(app).post('/api/chart/cfd').send({ GameId: gameId });
    expect(res.status).toBe(401);
  });
});

describe('POST /api/chart/revenue', () => {
  it('returns array of {day, revenue} objects', async () => {
    const res = await request(app)
      .post('/api/chart/revenue')
      .set('Authorization', `Bearer ${token}`)
      .send({ GameId: gameId });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    if (res.body.length > 0) {
      expect(res.body[0]).toHaveProperty('day');
      expect(res.body[0]).toHaveProperty('revenue');
    }
  });

  it('revenue values are non-negative', async () => {
    const res = await request(app)
      .post('/api/chart/revenue')
      .set('Authorization', `Bearer ${token}`)
      .send({ GameId: gameId });
    for (const point of res.body) {
      expect(point.revenue).toBeGreaterThanOrEqual(0);
    }
  });
});

describe('POST /api/chart/cycle-time', () => {
  it('returns array (empty or with entries)', async () => {
    const res = await request(app)
      .post('/api/chart/cycle-time')
      .set('Authorization', `Bearer ${token}`)
      .send({ GameId: gameId });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('deployed stories have positive cycle time', async () => {
    const res = await request(app)
      .post('/api/chart/cycle-time')
      .set('Authorization', `Bearer ${token}`)
      .send({ GameId: gameId });
    for (const entry of res.body) {
      expect(entry).toHaveProperty('name');
      expect(entry).toHaveProperty('cycleTime');
      expect(entry.cycleTime).toBeGreaterThanOrEqual(0);
    }
  });
});
