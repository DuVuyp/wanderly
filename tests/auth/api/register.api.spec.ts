import { test, expect } from '@playwright/test';

const API_BASE = 'http://127.0.0.1:4000/api/auth';

test.describe.serial('AUTH API - Register', () => {
  const getTimestamp = () => Date.now().toString();

  test('AUTH-001: Register - Valid (Traveler)', async ({ request }) => {
    const ts = getTimestamp();
    const testData = [
      { full_name: 'Nguyen Van A', email: `testuser_${ts}_1@wanderly.com`, password: 'Test@1234', role: 'traveler' },
      { full_name: 'Le Thi B', email: `user2_${ts}_2@wanderly.com`, password: 'Abcd@5678', role: 'traveler' },
      { full_name: 'Tran Van C', email: `user3_${ts}_3@wanderly.com`, password: 'Pass#9012', role: 'traveler' }
    ];

    for (const td of testData) {
      const res = await request.post(`${API_BASE}/register`, { data: td });
      expect(res.status()).toBe(201);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data).not.toHaveProperty('password_hash');
      expect(body.data.role).toBe('traveler');
    }
  });

  test('AUTH-003: Register - Duplicate email', async ({ request }) => {
    const ts = getTimestamp();
    const duplicateEmail = `existing_${ts}@wanderly.com`;
    // Create the existing user first
    await request.post(`${API_BASE}/register`, {
      data: { full_name: 'Existing', email: duplicateEmail, password: 'Test@1234' }
    });

    const testData = [
      { full_name: 'Dup', email: duplicateEmail, password: 'Test@1234' },
      { full_name: 'Dup2', email: duplicateEmail.toUpperCase(), password: 'Test@1234' },
      { full_name: 'Dup3', email: duplicateEmail.toLowerCase(), password: 'Test@1234' }
    ];

    for (const td of testData) {
      const res = await request.post(`${API_BASE}/register`, { data: td });
      expect(res.status()).toBe(409);
      const body = await res.json();
      expect(body.message).toBe('Email already exists');
    }
  });

  test('AUTH-004: Register - Missing full_name', async ({ request }) => {
    const ts = getTimestamp();
    const testData = [
      { email: `a_${ts}@w.com`, password: 'Test@1234' },
      { full_name: '', email: `b_${ts}@w.com`, password: 'Test@1234' },
      { full_name: null, email: `c_${ts}@w.com`, password: 'Test@1234' }
    ];

    for (const td of testData) {
      const res = await request.post(`${API_BASE}/register`, { data: td });
      expect(res.status()).toBe(400);
      const body = await res.json();
      expect(body.message).toMatch(/full name|full_name/i);
    }
  });

  test('AUTH-005: Register - full_name quá ngắn', async ({ request }) => {
    const ts = getTimestamp();
    const testData = [
      { full_name: 'A', email: `a_${ts}@w.com`, password: 'Test@1234' },
      { full_name: 'X', email: `b_${ts}@w.com`, password: 'Test@1234' },
      { full_name: '1', email: `c_${ts}@w.com`, password: 'Test@1234' }
    ];

    for (const td of testData) {
      const res = await request.post(`${API_BASE}/register`, { data: td });
      expect(res.status()).toBe(400);
    }
  });

  test('AUTH-006: Register - full_name quá dài', async ({ request }) => {
    const ts = getTimestamp();
    const longName1 = 'A'.repeat(101);
    const longName2 = 'A'.repeat(150);
    const longName3 = 'A'.repeat(200);

    const testData = [
      { full_name: longName1, email: `a_${ts}@w.com`, password: 'Test@1234' },
      { full_name: longName2, email: `b_${ts}@w.com`, password: 'Test@1234' },
      { full_name: longName3, email: `c_${ts}@w.com`, password: 'Test@1234' }
    ];

    for (const td of testData) {
      const res = await request.post(`${API_BASE}/register`, { data: td });
      expect(res.status()).toBe(400);
    }
  });

  test('AUTH-007: Register - Missing email', async ({ request }) => {
    const testData = [
      { full_name: 'Test', password: 'Test@1234' },
      { full_name: 'Test', email: '', password: 'Test@1234' },
      { full_name: 'Test', email: null, password: 'Test@1234' }
    ];

    for (const td of testData) {
      const res = await request.post(`${API_BASE}/register`, { data: td });
      expect(res.status()).toBe(400);
    }
  });

  test('AUTH-008: Register - Invalid email', async ({ request }) => {
    const testData = [
      { full_name: 'Test', email: 'not-an-email', password: 'Test@1234' },
      { full_name: 'Test', email: 'user@', password: 'Test@1234' },
      { full_name: 'Test', email: '@domain.com', password: 'Test@1234' }
    ];

    for (const td of testData) {
      const res = await request.post(`${API_BASE}/register`, { data: td });
      expect(res.status()).toBe(400);
    }
  });

  test('AUTH-009: Register - Missing password', async ({ request }) => {
    const ts = getTimestamp();
    const testData = [
      { full_name: 'Test', email: `a_${ts}@w.com` },
      { full_name: 'Test', email: `b_${ts}@w.com`, password: '' },
      { full_name: 'Test', email: `c_${ts}@w.com`, password: null }
    ];

    for (const td of testData) {
      const res = await request.post(`${API_BASE}/register`, { data: td });
      expect(res.status()).toBe(400);
    }
  });

  test('AUTH-010: Register - Password < 8 chars', async ({ request }) => {
    const ts = getTimestamp();
    const testData = [
      { full_name: 'Test', email: `a_${ts}@w.com`, password: 'Ab1@' },
      { full_name: 'Test', email: `b_${ts}@w.com`, password: 'A1@bcde' },
      { full_name: 'Test', email: `c_${ts}@w.com`, password: 'X9#' }
    ];

    for (const td of testData) {
      const res = await request.post(`${API_BASE}/register`, { data: td });
      expect(res.status()).toBe(400);
    }
  });

  test('AUTH-011: Register - Password no uppercase', async ({ request }) => {
    const ts = getTimestamp();
    const testData = [
      { full_name: 'Test', email: `a_${ts}@w.com`, password: 'test@1234' },
      { full_name: 'Test', email: `b_${ts}@w.com`, password: 'abcdef@1' },
      { full_name: 'Test', email: `c_${ts}@w.com`, password: 'hello#99' }
    ];

    for (const td of testData) {
      const res = await request.post(`${API_BASE}/register`, { data: td });
      expect(res.status()).toBe(400);
    }
  });

  test('AUTH-012: Register - Password no lowercase', async ({ request }) => {
    const ts = getTimestamp();
    const testData = [
      { full_name: 'Test', email: `a_${ts}@w.com`, password: 'TEST@1234' },
      { full_name: 'Test', email: `b_${ts}@w.com`, password: 'ABCDEF@1' },
      { full_name: 'Test', email: `c_${ts}@w.com`, password: 'HELLO#99' }
    ];

    for (const td of testData) {
      const res = await request.post(`${API_BASE}/register`, { data: td });
      expect(res.status()).toBe(400);
    }
  });

  test('AUTH-013: Register - Password no number', async ({ request }) => {
    const ts = getTimestamp();
    const testData = [
      { full_name: 'Test', email: `a_${ts}@w.com`, password: 'Test@abcd' },
      { full_name: 'Test', email: `b_${ts}@w.com`, password: 'Hello@World' },
      { full_name: 'Test', email: `c_${ts}@w.com`, password: 'Abcd#efgh' }
    ];

    for (const td of testData) {
      const res = await request.post(`${API_BASE}/register`, { data: td });
      expect(res.status()).toBe(400);
    }
  });

  test('AUTH-014: Register - Password no special char', async ({ request }) => {
    const ts = getTimestamp();
    const testData = [
      { full_name: 'Test', email: `a_${ts}@w.com`, password: 'Test1234a' },
      { full_name: 'Test', email: `b_${ts}@w.com`, password: 'Abcdef12A' },
      { full_name: 'Test', email: `c_${ts}@w.com`, password: 'Hello999W' }
    ];

    for (const td of testData) {
      const res = await request.post(`${API_BASE}/register`, { data: td });
      expect(res.status()).toBe(400);
    }
  });

  test('AUTH-015: Register - Invalid role', async ({ request }) => {
    const ts = getTimestamp();
    const testData = [
      { full_name: 'Test', email: `a_${ts}@w.com`, password: 'Test@1234', role: 'superadmin' },
      { full_name: 'Test', email: `b_${ts}@w.com`, password: 'Test@1234', role: 'manager' },
      { full_name: 'Test', email: `c_${ts}@w.com`, password: 'Test@1234', role: 'Admin' }
    ];

    for (const td of testData) {
      const res = await request.post(`${API_BASE}/register`, { data: td });
      expect(res.status()).toBe(400);
    }
  });

  test('AUTH-016: Register - Default role', async ({ request }) => {
    const ts = getTimestamp();
    const testData = [
      { full_name: 'AA', email: `d1_${ts}@w.com`, password: 'Test@1234' },
      { full_name: 'BB', email: `d2_${ts}@w.com`, password: 'Abcd@5678' },
      { full_name: 'CC', email: `d3_${ts}@w.com`, password: 'Pass#9012' }
    ];

    for (const td of testData) {
      const res = await request.post(`${API_BASE}/register`, { data: td });
      expect(res.status()).toBe(201);
      const body = await res.json();
      expect(body.data.role).toBe('traveler');
    }
  });

  test('AUTH-017: Register - Empty body', async ({ request }) => {
    const testData = [
      {},
      { unknown_field: 'ignored' },
      ''
    ];

    for (const td of testData) {
      const options = td === '' ? undefined : { data: td };
      const res = await request.post(`${API_BASE}/register`, options);
      expect(res.status()).toBe(400);
    }
  });

  test('AUTH-034: Register - Email case-insensitive', async ({ request }) => {
    const ts = getTimestamp();
    const baseEmail = `case_${ts}@wanderly.com`;
    await request.post(`${API_BASE}/register`, {
      data: { full_name: 'Test', email: baseEmail, password: 'Test@1234' }
    });

    const testData = [
      { full_name: 'Test', email: `CASE_${ts}@wanderly.com`, password: 'Test@1234' },
      { full_name: 'Test', email: `Case_${ts}@WANDERLY.COM`, password: 'Test@1234' },
      { full_name: 'Test', email: `cAsE_${ts}@WaNdErLy.cOm`, password: 'Test@1234' }
    ];

    for (const td of testData) {
      const res = await request.post(`${API_BASE}/register`, { data: td });
      expect(res.status()).toBe(409);
    }
  });

  test('AUTH-035: Register - Password with spaces', async ({ request }) => {
    const ts = getTimestamp();
    const testData = [
      { full_name: 'Test', email: `sp1_${ts}@w.com`, password: 'Test @1234 ' },
      { full_name: 'Test', email: `sp2_${ts}@w.com`, password: ' Test@1234' },
      { full_name: 'Test', email: `sp3_${ts}@w.com`, password: 'Test 1234@' }
    ];

    for (const td of testData) {
      const res = await request.post(`${API_BASE}/register`, { data: td });
      expect(res.status()).toBe(400);
    }
  });
});
