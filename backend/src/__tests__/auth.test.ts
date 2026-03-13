/**
 * Integration tests for /api/auth routes.
 * Uses a real test DB — set TEST_DATABASE_URL in env or uses DATABASE_URL.
 */

import request from 'supertest';
import express from 'express';
import authRoutes from '../routes/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

const TEST_USER = {
  username: `test_auth_${Date.now()}`,
  email: `test_auth_${Date.now()}@example.com`,
  password: 'SecurePass123',
};

let authToken: string;

afterAll(async () => {
  // Cleanup test user
  await prisma.user.deleteMany({ where: { username: { startsWith: 'test_auth_' } } });
  await prisma.$disconnect();
});

describe('POST /api/auth/register', () => {
  it('registers a new user and returns JWT token', async () => {
    const res = await request(app).post('/api/auth/register').send(TEST_USER);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('username', TEST_USER.username);
    authToken = res.body.token;
  });

  it('returns 400 when required fields are missing', async () => {
    const res = await request(app).post('/api/auth/register').send({ username: 'onlyname' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 409 when username already taken', async () => {
    const res = await request(app).post('/api/auth/register').send(TEST_USER);
    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/taken/i);
  });

  it('returns 409 when email already taken', async () => {
    const res = await request(app).post('/api/auth/register').send({
      username: 'different_user',
      email: TEST_USER.email,
      password: 'Pass123',
    });
    expect(res.status).toBe(409);
  });
});

describe('POST /api/auth/login', () => {
  it('logs in with correct credentials and returns token', async () => {
    const res = await request(app).post('/api/auth/login').send({
      username: TEST_USER.username,
      password: TEST_USER.password,
    });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.username).toBe(TEST_USER.username);
  });

  it('returns 401 with wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      username: TEST_USER.username,
      password: 'wrongpassword',
    });
    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/invalid/i);
  });

  it('returns 401 with non-existent username', async () => {
    const res = await request(app).post('/api/auth/login').send({
      username: 'ghost_user_xyz',
      password: 'any',
    });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/auth/me', () => {
  it('returns user profile with valid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('username', TEST_USER.username);
    expect(res.body).toHaveProperty('email', TEST_USER.email);
    expect(res.body).not.toHaveProperty('password');
  });

  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('returns 401 with malformed token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer not_a_real_token');
    expect(res.status).toBe(401);
  });

  it('returns 401 with expired/invalid JWT', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjk5OX0.fake_signature');
    expect(res.status).toBe(401);
  });
});
