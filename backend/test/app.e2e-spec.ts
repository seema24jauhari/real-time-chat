import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../src/users/schemas/user.schema';

describe('Auth Flow (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let refreshCookie: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule], // real AppModule — real MongoDB, real Redis
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    // clean up test user before each run
    const userModel = app.get(getModelToken(User.name));
    await userModel.deleteOne({ email: 'integration@test.com' });
  });

  afterAll(async () => {
    await app.close();
  });

  // ─── Register ───────────────────────────────────────────
  it('POST /auth/register — should register a new user', async () => {
    const res = await request(app.getHttpServer()).post('/auth/register').send({
      name: 'Test User',
      email: 'integration@test.com',
      password: 'Test1234#',
      role: 'student',
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('email', 'integration@test.com');
  });

  it('POST /auth/register — should fail if email already exists', async () => {
    const res = await request(app.getHttpServer()).post('/auth/register').send({
      name: 'Test User',
      email: 'integration@test.com', // same email as above
      password: 'Test1234#',
    });

    expect(res.status).toBe(409); // ConflictException
  });

  // ─── Login ───────────────────────────────────────────────
  it('POST /auth/login — should login and return access_token', async () => {
    const res = await request(app.getHttpServer()).post('/auth/login').send({
      email: 'integration@test.com',
      password: 'Test1234#',
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('access_token');

    accessToken = res.body.access_token; // save for next tests
    refreshCookie = res.headers['set-cookie']?.[0]; // save refresh cookie
  });

  it('POST /auth/login — should fail with wrong password', async () => {
    const res = await request(app.getHttpServer()).post('/auth/login').send({
      email: 'integration@test.com',
      password: 'wrongpassword',
    });

    expect(res.status).toBe(401);
  });

  // ─── Protected route ─────────────────────────────────────
  it('GET /users/me — should return user if token is valid', async () => {
    const res = await request(app.getHttpServer())
      .get('/users/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('email', 'integration@test.com');
  });

  it('GET /users/me — should return 401 if no token', async () => {
    const res = await request(app.getHttpServer()).get('/users/me');

    expect(res.status).toBe(401);
  });

  // ─── Refresh ─────────────────────────────────────────────
  it('POST /auth/refresh — should return new access_token', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/refresh')
      .set('Cookie', refreshCookie); // send the saved refresh cookie

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('access_token');
  });

  // ─── Logout ──────────────────────────────────────────────
  it('DELETE /auth/logout — should logout and clear cookie', async () => {
    const res = await request(app.getHttpServer())
      .delete('/auth/logout')
      .set('Cookie', refreshCookie);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'Logged out');
  });

  it('POST /auth/refresh — should fail after logout (token blacklisted)', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/refresh')
      .set('Cookie', refreshCookie); // same cookie, now blacklisted

    expect(res.status).toBe(401); // token revoked
  });
});
