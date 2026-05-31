import { test, expect } from '@playwright/test';

const API_BASE = 'http://127.0.0.1:4000/api/auth';

test.describe('AUTH API - Login', () => {
  const testEmail = `login_api_${Date.now()}@wanderly.com`;
  const testPassword = 'Test@1234';

  test.beforeAll(async ({ request }) => {
    await request.post(`${API_BASE}/register`, {
      data: {
        full_name: 'Login API User',
        email: testEmail,
        password: testPassword
      }
    });
  });

  test('AUTH-018: Login thành công', async ({ request }) => {
    const res = await request.post(`${API_BASE}/login`, {
      data: { email: testEmail, password: testPassword }
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.tokens.access.token).toBeDefined();
    expect(body.data.tokens.refresh.token).toBeDefined();
  });

  test('AUTH-045: Login email case-insensitive', async ({ request }) => {
    const res = await request.post(`${API_BASE}/login`, {
      data: { email: testEmail.toUpperCase(), password: testPassword }
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });

  test('AUTH-019/020: Sai thông tin', async ({ request }) => {
    const res = await request.post(`${API_BASE}/login`, {
      data: { email: testEmail, password: 'WrongPassword@123' }
    });
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body.message).toBe('Invalid email or password');
  });

  test('AUTH-021/022: Thiếu data', async ({ request }) => {
    const res = await request.post(`${API_BASE}/login`, {
      data: { email: testEmail } // missing password
    });
    expect(res.status()).toBe(400);
  });

  test.skip('AUTH-043: Rate limit brute force', async ({ request }) => {
    // Limit is 100 requests / 15 mins in development
    let status429Reached = false;
    
    // We already made a few requests above, let's just make 100 more to hit the limit
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
