import { test, expect } from '@playwright/test';

const API_BASE = 'http://127.0.0.1:4000/api/auth';

test.describe('AUTH API - Tokens & Profile', () => {
  const testEmail = `token_api_${Date.now()}@wanderly.com`;
  const testPassword = 'Test@1234';
  let accessToken = '';
  let refreshToken = '';

  test.beforeAll(async ({ request }) => {
    await request.post(`${API_BASE}/register`, {
      data: {
        full_name: 'Token API User',
        email: testEmail,
        password: testPassword
      }
    });

    const loginRes = await request.post(`${API_BASE}/login`, {
      data: { email: testEmail, password: testPassword }
    });
    const body = await loginRes.json();
    accessToken = body.data.tokens.access.token;
    refreshToken = body.data.tokens.refresh.token;
  });

  test('AUTH-025: Get Me hợp lệ', async ({ request }) => {
    const res = await request.get(`${API_BASE}/me`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.email).toBe(testEmail);
  });

  test('AUTH-026: Get Me không token', async ({ request }) => {
    const res = await request.get(`${API_BASE}/me`);
    expect(res.status()).toBe(401);
  });

  test('AUTH-027: Get Me token sai', async ({ request }) => {
    const res = await request.get(`${API_BASE}/me`, {
      headers: { Authorization: `Bearer invalid.token.123` }
    });
    expect(res.status()).toBe(401);
  });

  test('AUTH-049: Get Me dùng Refresh Token thay Access', async ({ request }) => {
    const res = await request.get(`${API_BASE}/me`, {
      headers: { Authorization: `Bearer ${refreshToken}` }
    });
    expect(res.status()).toBe(401);
  });

  test('AUTH-029: Refresh Token hợp lệ', async ({ request }) => {
    const res = await request.post(`${API_BASE}/refresh-token`, {
      data: { refreshToken }
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.data.access.token).toBeDefined();
    // Update tokens for next test
    accessToken = body.data.access.token;
    refreshToken = body.data.refresh.token;
  });

  test('AUTH-031: Refresh Token sai', async ({ request }) => {
    const res = await request.post(`${API_BASE}/refresh-token`, {
      data: { refreshToken: 'invalid.token' }
    });
    expect(res.status()).toBe(401);
  });

  test('AUTH-032: Logout hợp lệ', async ({ request }) => {
    const res = await request.post(`${API_BASE}/logout`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });
});
