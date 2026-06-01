import { test, expect } from '@playwright/test';

const API_BASE = 'http://127.0.0.1:4000/api/auth';

test.describe('AUTH API - Login', () => {
  const getTimestamp = () => Date.now().toString();

  let travelerEmail = '';
  let providerEmail = '';
  let testEmail = '';

  test.beforeAll(async ({ request }) => {
    const ts = getTimestamp();
    travelerEmail = `traveler_${ts}@wanderly.com`;
    providerEmail = `provider_${ts}@wanderly.com`;
    testEmail = `testuser_${ts}@wanderly.com`;

    await request.post(`${API_BASE}/register`, {
      data: { full_name: 'Traveler', email: travelerEmail, password: 'Test@1234', role: 'traveler' }
    });
    await request.post(`${API_BASE}/register`, {
      data: { full_name: 'Provider', email: providerEmail, password: 'Test@1234', role: 'provider' }
    });
    await request.post(`${API_BASE}/register`, {
      data: { full_name: 'Test', email: testEmail, password: 'Test@1234' }
    });
  });

  test('AUTH-018: Login - Valid credentials', async ({ request }) => {
    const testData = [
      { email: travelerEmail, password: 'Test@1234' },
      { email: testEmail, password: 'Test@1234' },
      { email: providerEmail, password: 'Test@1234' }
    ];

    for (const td of testData) {
      const res = await request.post(`${API_BASE}/login`, { data: td });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.tokens.access.token).toBeDefined();
    }
  });

  test('AUTH-019: Login - Wrong password', async ({ request }) => {
    const testData = [
      { email: testEmail, password: 'WrongPass@1' },
      { email: testEmail, password: 'test@1234' },
      { email: testEmail, password: 'Test@12345' }
    ];

    for (const td of testData) {
      const res = await request.post(`${API_BASE}/login`, { data: td });
      expect(res.status()).toBe(401);
      const body = await res.json();
      expect(body.message).toBe('Invalid email or password');
    }
  });

  test('AUTH-020: Login - Non-existent email', async ({ request }) => {
    const testData = [
      { email: 'nonexist@w.com', password: 'Test@1234' },
      { email: 'fake@test.com', password: 'Test@1234' },
      { email: 'random@x.org', password: 'Test@1234' }
    ];

    for (const td of testData) {
      const res = await request.post(`${API_BASE}/login`, { data: td });
      expect(res.status()).toBe(401);
    }
  });

  test('AUTH-021: Login - Missing email', async ({ request }) => {
    const testData = [
      { password: 'Test@1234' },
      { email: '', password: 'Test@1234' },
      { email: null, password: 'Test@1234' }
    ];

    for (const td of testData) {
      const res = await request.post(`${API_BASE}/login`, { data: td });
      expect(res.status()).toBe(400);
    }
  });

  test('AUTH-022: Login - Missing password', async ({ request }) => {
    const testData = [
      { email: testEmail },
      { email: testEmail, password: '' },
      { email: testEmail, password: null }
    ];

    for (const td of testData) {
      const res = await request.post(`${API_BASE}/login`, { data: td });
      expect(res.status()).toBe(400);
    }
  });

  test('AUTH-023: Login - Invalid email format', async ({ request }) => {
    const testData = [
      { email: 'invalid', password: 'Test@1234' },
      { email: 'user@', password: 'Test@1234' },
      { email: '@domain', password: 'Test@1234' }
    ];

    for (const td of testData) {
      const res = await request.post(`${API_BASE}/login`, { data: td });
      expect(res.status()).toBe(400);
    }
  });

  test('AUTH-024: Login - Soft-deleted user', async ({ request }) => {
    // Assuming deleted@wanderly.com exists in DB from seed
    const testData = [
      { email: 'deleted@wanderly.com', password: 'Test@1234' },
      { email: 'deleted2@wanderly.com', password: 'Test@1234' },
      { email: 'deleted3@wanderly.com', password: 'Test@1234' }
    ];

    for (const td of testData) {
      // In tests without actual soft-deleted seed, this might return 401 directly as non-existent
      const res = await request.post(`${API_BASE}/login`, { data: td });
      expect(res.status()).toBe(401);
    }
  });

  test('AUTH-036: Login - SQL Injection / XSS', async ({ request }) => {
    const testData = [
      { email: "' OR 1=1 --", password: 'Test@1234' },
      { email: '<script>alert(1)</script>', password: 'Test@1234' },
      { email: 'test@wanderly.com', password: '"; DROP TABLE users;--' }
    ];

    for (const td of testData) {
      const res = await request.post(`${API_BASE}/login`, { data: td });
      // Depending on whether it's caught by Joi validation or sanitized, it might be 400 or 401
      expect([400, 401]).toContain(res.status());
    }
  });


  test.skip('AUTH-043: Rate limit brute force', async ({ request }) => {
    // Limit is 100 requests / 15 mins in development
    let status429Reached = false;
    for (let i = 0; i < 101; i++) {
      const res = await request.post(`${API_BASE}/login`, {
        data: { email: 'wrong@wanderly.com', password: 'WrongPassword123' }
      });
      if (res.status() === 429) {
        status429Reached = true;
        break;
      }
    }
    expect(status429Reached).toBe(true);
  });
});
