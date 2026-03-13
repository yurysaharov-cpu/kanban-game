/**
 * Integration tests for /api/games routes.
 */

import request from 'supertest';
import express from 'express';
import authRoutes from '../routes/auth';
import gameRoutes from '../routes/game';
import storyRoutes from '../routes/story';
import teamMemberRoutes from '../routes/teamMember';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/story', storyRoutes);
app.use('/api/team-member', teamMemberRoutes);

const TS = Date.now();
const TEST_USER = { username: `test_game_${TS}`, email: `tg_${TS}@test.com`, password: 'Pass123' };
let token: string;
let gameId: number;

beforeAll(async () => {
  const res = await request(app).post('/api/auth/register').send(TEST_USER);
  token = res.body.token;
});

afterAll(async () => {
  await prisma.game.deleteMany({ where: { user: { username: TEST_USER.username } } });
  await prisma.user.deleteMany({ where: { username: TEST_USER.username } });
  await prisma.$disconnect();
});

// ─── Create Game ────────────────────────────────────────────────────────────

describe('POST /api/games/new', () => {
  it('creates a Standard game and returns gameId', async () => {
    const res = await request(app)
      .post('/api/games/new')
      .set('Authorization', `Bearer ${token}`)
      .send({ gameType: 'Standard' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('gameId');
    gameId = res.body.gameId;
  });

  it('creates a V2 game', async () => {
    const res = await request(app)
      .post('/api/games/new')
      .set('Authorization', `Bearer ${token}`)
      .send({ gameType: 'V2' });
    expect(res.status).toBe(201);
  });

  it('returns 400 for invalid gameType', async () => {
    const res = await request(app)
      .post('/api/games/new')
      .set('Authorization', `Bearer ${token}`)
      .send({ gameType: 'Invalid' });
    expect(res.status).toBe(400);
  });

  it('returns 401 without auth', async () => {
    const res = await request(app).post('/api/games/new').send({ gameType: 'Standard' });
    expect(res.status).toBe(401);
  });
});

// ─── List Games ─────────────────────────────────────────────────────────────

describe('GET /api/games', () => {
  it('returns list of user games', async () => {
    const res = await request(app)
      .get('/api/games')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body[0]).toHaveProperty('id');
    expect(res.body[0]).toHaveProperty('gameType');
    expect(res.body[0]).toHaveProperty('isCompleted');
  });

  it('returns 401 without auth', async () => {
    const res = await request(app).get('/api/games');
    expect(res.status).toBe(401);
  });
});

// ─── Start Game ─────────────────────────────────────────────────────────────

describe('POST /api/games/start', () => {
  it('returns full game state with all fields', async () => {
    const res = await request(app)
      .post('/api/games/start')
      .set('Authorization', `Bearer ${token}`)
      .send({ GameId: gameId });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      Day: 0,
      GameType: 'Standard',
      GameOver: false,
      TotalRevenue: 0,
    });
    expect(Array.isArray(res.body.Wip)).toBe(true);
    expect(res.body.Wip).toHaveLength(4);
    expect(Array.isArray(res.body.Stories)).toBe(true);
    expect(res.body.Stories).toHaveLength(60);
    expect(Array.isArray(res.body.TeamMembers)).toBe(true);
    expect(res.body.TeamMembers).toHaveLength(9);
  });

  it('all stories start in deck stage', async () => {
    const res = await request(app)
      .post('/api/games/start')
      .set('Authorization', `Bearer ${token}`)
      .send({ GameId: gameId });
    const nonDeck = res.body.Stories.filter((s: { stage: string }) => s.stage !== 'deck');
    expect(nonDeck).toHaveLength(0);
  });

  it('returns 404 for non-existent game', async () => {
    const res = await request(app)
      .post('/api/games/start')
      .set('Authorization', `Bearer ${token}`)
      .send({ GameId: 999999 });
    expect(res.status).toBe(404);
  });
});

// ─── Next Day ────────────────────────────────────────────────────────────────

describe('POST /api/games/next', () => {
  it('advances the game day by 1', async () => {
    const res = await request(app)
      .post('/api/games/next')
      .set('Authorization', `Bearer ${token}`)
      .send({ GameId: gameId });
    expect(res.status).toBe(200);
    expect(res.body.Day).toBe(1);
  });

  it('returns valid state shape after advancing', async () => {
    const res = await request(app)
      .post('/api/games/next')
      .set('Authorization', `Bearer ${token}`)
      .send({ GameId: gameId });
    expect(res.body).toHaveProperty('Stories');
    expect(res.body).toHaveProperty('TeamMembers');
    expect(res.body).toHaveProperty('Wip');
    expect(res.body).toHaveProperty('TotalRevenue');
  });

  it('TotalRevenue is non-negative', async () => {
    const res = await request(app)
      .post('/api/games/next')
      .set('Authorization', `Bearer ${token}`)
      .send({ GameId: gameId });
    expect(res.body.TotalRevenue).toBeGreaterThanOrEqual(0);
  });
});

// ─── Move Story ──────────────────────────────────────────────────────────────

describe('POST /api/story/move', () => {
  let storyId: number;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/games/start')
      .set('Authorization', `Bearer ${token}`)
      .send({ GameId: gameId });
    storyId = res.body.Stories[0].StoryId;
  });

  it('moves a story to ready stage', async () => {
    const res = await request(app)
      .post('/api/story/move')
      .set('Authorization', `Bearer ${token}`)
      .send({ GameId: gameId, StoryId: storyId, Stage: 'ready' });
    expect(res.status).toBe(200);
    const story = res.body.Stories.find((s: { StoryId: number }) => s.StoryId === storyId);
    expect(story.stage).toBe('ready');
  });

  it('story gets DayReady set when moved to ready', async () => {
    const res = await request(app)
      .post('/api/games/start')
      .set('Authorization', `Bearer ${token}`)
      .send({ GameId: gameId });
    const story = res.body.Stories.find((s: { StoryId: number }) => s.StoryId === storyId);
    expect(story.DayReady).toBeGreaterThan(0);
  });

  it('returns 404 for wrong game', async () => {
    const res = await request(app)
      .post('/api/story/move')
      .set('Authorization', `Bearer ${token}`)
      .send({ GameId: 999999, StoryId: storyId, Stage: 'analysis' });
    expect(res.status).toBe(404);
  });
});

// ─── Leaderboard ─────────────────────────────────────────────────────────────

describe('GET /api/games/leaderboard', () => {
  it('returns an array', async () => {
    const res = await request(app).get('/api/games/leaderboard?gameType=Standard');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('leaderboard entries have username and score', async () => {
    const res = await request(app).get('/api/games/leaderboard?gameType=Standard');
    if (res.body.length > 0) {
      expect(res.body[0]).toHaveProperty('username');
      expect(res.body[0]).toHaveProperty('score');
    }
  });

  it('leaderboard max 50 entries', async () => {
    const res = await request(app).get('/api/games/leaderboard?gameType=Standard');
    expect(res.body.length).toBeLessThanOrEqual(50);
  });
});

// ─── Delete Game ─────────────────────────────────────────────────────────────

describe('DELETE /api/games/:id', () => {
  let tempGameId: number;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/games/new')
      .set('Authorization', `Bearer ${token}`)
      .send({ gameType: 'Standard' });
    tempGameId = res.body.gameId;
  });

  it('deletes a game successfully', async () => {
    const res = await request(app)
      .delete(`/api/games/${tempGameId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it('returns 404 after deleting', async () => {
    const res = await request(app)
      .delete(`/api/games/${tempGameId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });

  it('cannot delete another user game', async () => {
    const TS2 = Date.now();
    const reg = await request(app).post('/api/auth/register').send({
      username: `test_other_${TS2}`,
      email: `other_${TS2}@test.com`,
      password: 'Pass123',
    });
    const otherToken = reg.body.token;
    const gameRes = await request(app)
      .post('/api/games/new')
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ gameType: 'V2' });
    const otherGameId = gameRes.body.gameId;

    const del = await request(app)
      .delete(`/api/games/${otherGameId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(del.status).toBe(404);

    // Cleanup
    await prisma.game.delete({ where: { id: otherGameId } });
    await prisma.user.deleteMany({ where: { username: { startsWith: 'test_other_' } } });
  });
});
