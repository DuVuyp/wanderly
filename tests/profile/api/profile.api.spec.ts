import { test, expect } from '@playwright/test';

const API_BASE = 'http://127.0.0.1:4000/api';

test.describe.serial('PROFILE API - Get & Update', () => {
  let travelerToken = '';
  let providerToken = '';
  const testEmail = `profile_test_${Date.now()}@wanderly.com`;
  const testPassword = 'Test@1234';

  test.beforeAll(async ({ request }) => {
    // Register traveler
    await request.post(`${API_BASE}/auth/register`, {
      data: { full_name: 'Test Profile', email: testEmail, password: testPassword, role: 'traveler' }
    });
    // Register provider
    await request.post(`${API_BASE}/auth/register`, {
      data: { full_name: 'Provider Profile', email: 'provider_profile@wanderly.com', password: testPassword, role: 'provider' }
    });
    // Login traveler
    const res1 = await request.post(`${API_BASE}/auth/login`, {
      data: { email: testEmail, password: testPassword }
    });
    const body1 = await res1.json();
    travelerToken = body1.data.tokens.access.token;

    // Login provider
    const res2 = await request.post(`${API_BASE}/auth/login`, {
      data: { email: 'provider_profile@wanderly.com', password: testPassword }
    });
    const body2 = await res2.json();
    providerToken = body2.data.tokens.access.token;
  });

  test('PROF-001: Get Profile - Valid', async ({ request }) => {
    const res = await request.get(`${API_BASE}/profile`, {
      headers: { Authorization: `Bearer ${travelerToken}` }
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data).toHaveProperty('full_name', 'Test Profile');
    expect(body.data).not.toHaveProperty('password_hash');
  });

  test('PROF-002: Get Profile - No token', async ({ request }) => {
    const res = await request.get(`${API_BASE}/profile`);
    expect(res.status()).toBe(401);
  });

  test('PROF-003: Get Profile - Invalid token', async ({ request }) => {
    const res = await request.get(`${API_BASE}/profile`, {
      headers: { Authorization: `Bearer invalidtoken123` }
    });
    expect(res.status()).toBe(401);
  });

  test('PROF-004: Update Profile - full_name', async ({ request }) => {
    const res = await request.put(`${API_BASE}/profile`, {
      headers: { Authorization: `Bearer ${travelerToken}` },
      data: { full_name: 'Nguyen Van B' }
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.data.full_name).toBe('Nguyen Van B');
  });

  test('PROF-005: Update Profile - phone_number', async ({ request }) => {
    const res = await request.put(`${API_BASE}/profile`, {
      headers: { Authorization: `Bearer ${travelerToken}` },
      data: { phone_number: `091${Date.now().toString().slice(-7)}` }
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.data.phone_number).toMatch(/^091/);
  });

  test('PROF-006: Update Profile - avatar URL', async ({ request }) => {
    const res = await request.put(`${API_BASE}/profile`, {
      headers: { Authorization: `Bearer ${travelerToken}` },
      data: { avatar: 'https://example.com/avatar.jpg' }
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.data.avatar).toBe('https://example.com/avatar.jpg');
  });

  test('PROF-023: Update Profile - full_name min length', async ({ request }) => {
    const res = await request.put(`${API_BASE}/profile`, {
      headers: { Authorization: `Bearer ${travelerToken}` },
      data: { full_name: 'A' }
    });
    expect(res.status()).toBe(400);
  });

  test('PROF-007: Update Profile - full_name > 255 chars', async ({ request }) => {
    const res = await request.put(`${API_BASE}/profile`, {
      headers: { Authorization: `Bearer ${travelerToken}` },
      data: { full_name: 'A'.repeat(256) }
    });
    expect(res.status()).toBe(400);
  });

  test('PROF-008: Update Profile - phone > 20 chars', async ({ request }) => {
    const res = await request.put(`${API_BASE}/profile`, {
      headers: { Authorization: `Bearer ${travelerToken}` },
      data: { phone_number: '123456789012345678901' }
    });
    expect(res.status()).toBe(400);
  });

  test('PROF-009: Update Profile - avatar not URI', async ({ request }) => {
    const res = await request.put(`${API_BASE}/profile`, {
      headers: { Authorization: `Bearer ${travelerToken}` },
      data: { avatar: 'not-a-url' }
    });
    expect(res.status()).toBe(400);
  });

  test('PROF-010: Update Profile - Clear phone', async ({ request }) => {
    const res = await request.put(`${API_BASE}/profile`, {
      headers: { Authorization: `Bearer ${travelerToken}` },
      data: { phone_number: null }
    });
    expect(res.status()).toBe(200);
  });

  test('PROF-012: Update Profile - Multiple fields', async ({ request }) => {
    const res = await request.put(`${API_BASE}/profile`, {
      headers: { Authorization: `Bearer ${travelerToken}` },
      data: { full_name: 'New Name', phone_number: `012${Date.now().toString().slice(-7)}`, avatar: 'https://img.com/a.png' }
    });
    expect(res.status()).toBe(200);
  });

  test('PROF-024: Update Profile - Duplicate phone', async ({ request }) => {
    const duplicatePhone = `098${Date.now().toString().slice(-7)}`;
    // Set provider phone
    await request.put(`${API_BASE}/profile`, {
      headers: { Authorization: `Bearer ${providerToken}` },
      data: { phone_number: duplicatePhone }
    });
    
    // Try to set traveler phone to same
    const res = await request.put(`${API_BASE}/profile`, {
      headers: { Authorization: `Bearer ${travelerToken}` },
      data: { phone_number: duplicatePhone }
    });
    expect(res.status()).toBe(409);
    const body = await res.json();
    expect(body.message).toBe('Phone number already in use');
  });
});

test.describe.serial('PROFILE API - Change Password', () => {
  let travelerToken = '';
  const testEmail = `profile_pass_${Date.now()}@wanderly.com`;
  const testPassword = 'Test@1234';

  test.beforeAll(async ({ request }) => {
    await request.post(`${API_BASE}/auth/register`, {
      data: { full_name: 'Test Profile Pass', email: testEmail, password: testPassword, role: 'traveler' }
    });
    const res1 = await request.post(`${API_BASE}/auth/login`, {
      data: { email: testEmail, password: testPassword }
    });
    const body1 = await res1.json();
    travelerToken = body1.data.tokens.access.token;
  });

  test('PROF-016: Change Password - Wrong old', async ({ request }) => {
    const res = await request.put(`${API_BASE}/profile/change-password`, {
      headers: { Authorization: `Bearer ${travelerToken}` },
      data: { oldPassword: 'WrongOld@1', newPassword: 'NewPass@5678' }
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.message).toBe('Incorrect old password');
  });

  test('PROF-017: Change Password - Missing old', async ({ request }) => {
    const res = await request.put(`${API_BASE}/profile/change-password`, {
      headers: { Authorization: `Bearer ${travelerToken}` },
      data: { newPassword: 'NewPass@5678' }
    });
    expect(res.status()).toBe(400);
  });

  test('PROF-019: Change Password - New too short', async ({ request }) => {
    const res = await request.put(`${API_BASE}/profile/change-password`, {
      headers: { Authorization: `Bearer ${travelerToken}` },
      data: { oldPassword: testPassword, newPassword: 'Ab1@' }
    });
    expect(res.status()).toBe(400);
  });

  test('PROF-020: Change Password - New weak', async ({ request }) => {
    const res = await request.put(`${API_BASE}/profile/change-password`, {
      headers: { Authorization: `Bearer ${travelerToken}` },
      data: { oldPassword: testPassword, newPassword: 'password123' }
    });
    expect(res.status()).toBe(400);
  });

  test('PROF-022: Change Password - Same as old', async ({ request }) => {
    const res = await request.put(`${API_BASE}/profile/change-password`, {
      headers: { Authorization: `Bearer ${travelerToken}` },
      data: { oldPassword: testPassword, newPassword: testPassword }
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.message).toBe('New password cannot be the same as the old password');
  });

  test('PROF-015: Change Password - Valid', async ({ request }) => {
    const res = await request.put(`${API_BASE}/profile/change-password`, {
      headers: { Authorization: `Bearer ${travelerToken}` },
      data: { oldPassword: testPassword, newPassword: 'NewPass@5678' }
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.message).toBe('Password changed successfully');
    
    // Verify login with new password
    const loginRes = await request.post(`${API_BASE}/auth/login`, {
      data: { email: testEmail, password: 'NewPass@5678' }
    });
    expect(loginRes.status()).toBe(200);
  });
});
