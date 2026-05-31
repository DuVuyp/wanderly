import { test, expect } from '@playwright/test';

const API_BASE = 'http://127.0.0.1:4000/api/auth';

test.describe.serial('AUTH API - Register', () => {
  const uniqueEmail = `api_register_${Date.now()}@wanderly.com`;
  
  test('AUTH-001/002: Đăng ký thành công (Traveler & Provider)', async ({ request }) => {
    // Traveler
    const res1 = await request.post(`${API_BASE}/register`, {
      data: {
        full_name: 'Traveler Test',
        email: uniqueEmail,
        password: 'Test@1234',
        role: 'traveler'
      }
    });
    expect(res1.status()).toBe(201);
    const body1 = await res1.json();
    expect(body1.success).toBe(true);
    expect(body1.data.role).toBe('traveler');
    expect(body1.data).not.toHaveProperty('password_hash');

    // Provider
    const res2 = await request.post(`${API_BASE}/register`, {
      data: {
        full_name: 'Provider Test',
        email: `prov_${uniqueEmail}`,
        password: 'Test@1234',
        role: 'provider'
      }
    });
    expect(res2.status()).toBe(201);
  });

  test('AUTH-003: Duplicate email', async ({ request }) => {
    const res = await request.post(`${API_BASE}/register`, {
      data: {
        full_name: 'Dup Test',
        email: uniqueEmail, // Already registered above
        password: 'Test@1234'
      }
    });
    expect(res.status()).toBe(409);
    const body = await res.json();
    expect(body.message).toBe('Email already exists');
  });

  test('AUTH-004 to AUTH-017: Validation Errors', async ({ request }) => {
    // Missing full_name
    const res1 = await request.post(`${API_BASE}/register`, {
      data: { email: `err1_${Date.now()}@test.com`, password: 'Test@1234' }
    });
    expect(res1.status()).toBe(400);

    // Short password
    const res2 = await request.post(`${API_BASE}/register`, {
      data: { full_name: 'Test', email: `err2_${Date.now()}@test.com`, password: '123' }
    });
    expect(res2.status()).toBe(400);

    // AUTH-035: Password with spaces
    const res3 = await request.post(`${API_BASE}/register`, {
      data: { full_name: 'Test', email: `err3_${Date.now()}@test.com`, password: 'Test @1234' }
    });
    expect(res3.status()).toBe(400);
    const body3 = await res3.json();
    expect(body3.message).toContain('Password must not contain spaces');
  });

  test('AUTH-044: Role admin bị chặn (Security)', async ({ request }) => {
    const res = await request.post(`${API_BASE}/register`, {
      data: {
        full_name: 'Hacker',
        email: `hack_${Date.now()}@wanderly.com`,
        password: 'Test@1234',
        role: 'admin'
      }
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.message).toContain('Role is invalid');
  });
});
