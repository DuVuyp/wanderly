import { test, expect } from '@playwright/test';

const API_BASE = 'http://127.0.0.1:4000/api';
const ADMIN_EMAIL = 'minhnhat@wanderly.com';
const ADMIN_PASSWORD = 'Wanderly@123';

// Helper: login and return token
async function loginAs(request: any, email: string, password: string): Promise<string> {
  const res = await request.post(`${API_BASE}/auth/login`, {
    data: { email, password }
  });
  const body = await res.json();
  return body.data?.tokens?.access?.token || '';
}

// Helper: register a user and return their id + token
async function registerAndLogin(request: any, suffix: string, role = 'traveler') {
  const email = `admin_test_${suffix}_${Date.now()}@wanderly.com`;
  const password = 'Test@1234';
  await request.post(`${API_BASE}/auth/register`, {
    data: { full_name: `Test ${suffix}`, email, password, role }
  });
  const loginRes = await request.post(`${API_BASE}/auth/login`, {
    data: { email, password }
  });
  const body = await loginRes.json();
  const token = body.data?.tokens?.access?.token || '';
  const userId = body.data?.user?.id;
  return { email, password, token, userId };
}

test.describe.serial('ADMIN API - Get Users (ADM-001 to ADM-011)', () => {
  let adminToken = '';

  test.beforeAll(async ({ request }) => {
    adminToken = await loginAs(request, ADMIN_EMAIL, ADMIN_PASSWORD);
    expect(adminToken).toBeTruthy();
  });

  // ADM-001: Get Users - Default (TD1, TD2, TD3 all use admin bearer)
  test('ADM-001: Get Users - Default', async ({ request }) => {
    for (let i = 0; i < 3; i++) {
      const res = await request.get(`${API_BASE}/users`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data).toHaveProperty('users');
      expect(body.data).toHaveProperty('pagination');
      // Ensure no password_hash leaked
      for (const user of body.data.users) {
        expect(user).not.toHaveProperty('password_hash');
      }
    }
  });

  // ADM-002: Get Users - Pagination
  test('ADM-002: Get Users - Pagination', async ({ request }) => {
    const testData = [
      { page: 1, limit: 2 },
      { page: 2, limit: 5 },
      { page: 10, limit: 10 }
    ];
    for (const td of testData) {
      const res = await request.get(`${API_BASE}/users?page=${td.page}&limit=${td.limit}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.data.users.length).toBeLessThanOrEqual(td.limit);
      expect(body.data.pagination.page).toBe(td.page);
      expect(body.data.pagination.limit).toBe(td.limit);
    }
  });

  // ADM-003: Get Users - Filter role traveler
  test('ADM-003: Get Users - Filter role traveler', async ({ request }) => {
    const roles = ['traveler', 'TRAVELER', 'Traveler'];
    for (const role of roles) {
      const res = await request.get(`${API_BASE}/users?role=${role}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      // If API is case-sensitive, some may return empty - just check status 200
      if (body.data.users.length > 0) {
        for (const u of body.data.users) {
          expect(u.role.toLowerCase()).toBe('traveler');
        }
      }
    }
  });

  // ADM-004: Get Users - Filter role provider
  test('ADM-004: Get Users - Filter role provider', async ({ request }) => {
    const roles = ['provider', 'PROVIDER', 'Provider'];
    for (const role of roles) {
      const res = await request.get(`${API_BASE}/users?role=${role}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      if (body.data.users.length > 0) {
        for (const u of body.data.users) {
          expect(u.role.toLowerCase()).toBe('provider');
        }
      }
    }
  });

  // ADM-005: Get Users - Filter role admin
  test('ADM-005: Get Users - Filter role admin', async ({ request }) => {
    const roles = ['admin', 'ADMIN', 'Admin'];
    for (const role of roles) {
      const res = await request.get(`${API_BASE}/users?role=${role}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      if (body.data.users.length > 0) {
        for (const u of body.data.users) {
          expect(u.role.toLowerCase()).toBe('admin');
        }
      }
    }
  });

  // ADM-006: Get Users - Search by email
  test('ADM-006: Get Users - Search by email', async ({ request }) => {
    const searches = ['existing', 'prov', 'admin@'];
    for (const search of searches) {
      const res = await request.get(`${API_BASE}/users?search=${encodeURIComponent(search)}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      expect(res.status()).toBe(200);
    }
  });

  // ADM-007: Get Users - Search by name
  test('ADM-007: Get Users - Search by name', async ({ request }) => {
    const searches = ['Nguyen', 'User', 'Provider'];
    for (const search of searches) {
      const res = await request.get(`${API_BASE}/users?search=${encodeURIComponent(search)}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      expect(res.status()).toBe(200);
    }
  });

  // ADM-008: Get Users - Exclude soft-deleted
  test('ADM-008: Get Users - Exclude soft-deleted', async ({ request }) => {
    for (let i = 0; i < 3; i++) {
      const res = await request.get(`${API_BASE}/users`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      for (const u of body.data.users) {
        expect(u.is_deleted).not.toBe(true);
      }
    }
  });

  // ADM-009: Get Users - Traveler access (should be forbidden)
  test('ADM-009: Get Users - Traveler access', async ({ request }) => {
    const traveler = await registerAndLogin(request, 'trav_access');
    for (let i = 0; i < 3; i++) {
      const res = await request.get(`${API_BASE}/users`, {
        headers: { Authorization: `Bearer ${traveler.token}` }
      });
      expect(res.status()).toBe(403);
    }
  });

  // ADM-010: Get Users - Provider access (should be forbidden)
  test('ADM-010: Get Users - Provider access', async ({ request }) => {
    const provider = await registerAndLogin(request, 'prov_access', 'provider');
    for (let i = 0; i < 3; i++) {
      const res = await request.get(`${API_BASE}/users`, {
        headers: { Authorization: `Bearer ${provider.token}` }
      });
      expect(res.status()).toBe(403);
    }
  });

  // ADM-011: Get Users - No token
  test('ADM-011: Get Users - No token', async ({ request }) => {
    // TD1: No header
    const res1 = await request.get(`${API_BASE}/users`);
    expect(res1.status()).toBe(401);

    // TD2: Empty header
    const res2 = await request.get(`${API_BASE}/users`, {
      headers: { Authorization: '' }
    });
    expect(res2.status()).toBe(401);

    // TD3: Expired/invalid token
    const res3 = await request.get(`${API_BASE}/users`, {
      headers: { Authorization: 'Bearer expiredtoken123' }
    });
    expect(res3.status()).toBe(401);
  });
});

test.describe.serial('ADMIN API - Get User by ID (ADM-012 to ADM-014)', () => {
  let adminToken = '';

  test.beforeAll(async ({ request }) => {
    adminToken = await loginAs(request, ADMIN_EMAIL, ADMIN_PASSWORD);
  });

  // ADM-012: Get User by ID - Valid
  test('ADM-012: Get User by ID - Valid', async ({ request }) => {
    // First get list of users to find real IDs
    const listRes = await request.get(`${API_BASE}/users?limit=5`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const listBody = await listRes.json();
    const users = listBody.data.users;

    for (let i = 0; i < Math.min(3, users.length); i++) {
      const res = await request.get(`${API_BASE}/users/${users[i].id}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.data).not.toHaveProperty('password_hash');
      expect(body.data.id).toBe(users[i].id);
    }
  });

  // ADM-013: Get User by ID - Not found
  test('ADM-013: Get User by ID - Not found', async ({ request }) => {
    const ids = [99999, -1, 0];
    for (const id of ids) {
      const res = await request.get(`${API_BASE}/users/${id}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      expect(res.status()).toBe(404);
      const body = await res.json();
      expect(body.message).toBe('User not found');
    }
  });

  // ADM-014: Get User by ID - Soft deleted
  test('ADM-014: Get User by ID - Soft deleted', async ({ request }) => {
    // Create 3 users and soft-delete them, then try to GET
    for (let i = 0; i < 3; i++) {
      const user = await registerAndLogin(request, `soft_del_get_${i}`);
      // Delete user
      await request.delete(`${API_BASE}/users/${user.userId}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      // Try to get
      const res = await request.get(`${API_BASE}/users/${user.userId}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      expect(res.status()).toBe(404);
      const body = await res.json();
      expect(body.message).toBe('User not found');
    }
  });
});

test.describe.serial('ADMIN API - Update Role (ADM-015 to ADM-021)', () => {
  let adminToken = '';

  test.beforeAll(async ({ request }) => {
    adminToken = await loginAs(request, ADMIN_EMAIL, ADMIN_PASSWORD);
  });

  // ADM-015: Update Role - To provider
  test('ADM-015: Update Role - To provider', async ({ request }) => {
    for (let i = 0; i < 3; i++) {
      const user = await registerAndLogin(request, `to_prov_${i}`);
      const res = await request.put(`${API_BASE}/users/${user.userId}/role`, {
        headers: { Authorization: `Bearer ${adminToken}` },
        data: { role: 'provider' }
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.message).toBe('User role updated successfully');
      expect(body.data.role).toBe('provider');
    }
  });

  // ADM-016: Update Role - To admin
  test('ADM-016: Update Role - To admin', async ({ request }) => {
    for (let i = 0; i < 3; i++) {
      const user = await registerAndLogin(request, `to_admin_${i}`);
      const res = await request.put(`${API_BASE}/users/${user.userId}/role`, {
        headers: { Authorization: `Bearer ${adminToken}` },
        data: { role: 'admin' }
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.data.role).toBe('admin');
    }
  });

  // ADM-017: Update Role - To traveler
  test('ADM-017: Update Role - To traveler', async ({ request }) => {
    for (let i = 0; i < 3; i++) {
      const user = await registerAndLogin(request, `to_trav_${i}`, 'provider');
      const res = await request.put(`${API_BASE}/users/${user.userId}/role`, {
        headers: { Authorization: `Bearer ${adminToken}` },
        data: { role: 'traveler' }
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.data.role).toBe('traveler');
    }
  });

  // ADM-018: Update Role - Invalid role
  test('ADM-018: Update Role - Invalid role', async ({ request }) => {
    const user = await registerAndLogin(request, 'inv_role');
    const invalidRoles = ['superadmin', 'manager', ''];
    for (const role of invalidRoles) {
      const res = await request.put(`${API_BASE}/users/${user.userId}/role`, {
        headers: { Authorization: `Bearer ${adminToken}` },
        data: { role }
      });
      expect(res.status()).toBe(400);
    }
  });

  // ADM-019: Update Role - Missing role
  test('ADM-019: Update Role - Missing role', async ({ request }) => {
    const user = await registerAndLogin(request, 'miss_role');
    // TD1: empty body
    const res1 = await request.put(`${API_BASE}/users/${user.userId}/role`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: {}
    });
    expect(res1.status()).toBe(400);

    // TD2: role=null
    const res2 = await request.put(`${API_BASE}/users/${user.userId}/role`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: { role: null }
    });
    expect(res2.status()).toBe(400);

    // TD3: wrong key case
    const res3 = await request.put(`${API_BASE}/users/${user.userId}/role`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: { Role: 'admin' }
    });
    expect(res3.status()).toBe(400);
  });

  // ADM-020: Update Role - Soft-deleted user
  test('ADM-020: Update Role - Soft-deleted user', async ({ request }) => {
    for (let i = 0; i < 3; i++) {
      const user = await registerAndLogin(request, `del_role_${i}`);
      await request.delete(`${API_BASE}/users/${user.userId}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const res = await request.put(`${API_BASE}/users/${user.userId}/role`, {
        headers: { Authorization: `Bearer ${adminToken}` },
        data: { role: 'provider' }
      });
      expect(res.status()).toBe(404);
      const body = await res.json();
      expect(body.message).toBe('User not found');
    }
  });

  // ADM-021: Update Role - Non-admin access
  test('ADM-021: Update Role - Non-admin access', async ({ request }) => {
    const target = await registerAndLogin(request, 'target_role');

    // TD1: Traveler token
    const traveler = await registerAndLogin(request, 'trav_role');
    const res1 = await request.put(`${API_BASE}/users/${target.userId}/role`, {
      headers: { Authorization: `Bearer ${traveler.token}` },
      data: { role: 'admin' }
    });
    expect(res1.status()).toBe(403);

    // TD2: Provider token
    const provider = await registerAndLogin(request, 'prov_role', 'provider');
    const res2 = await request.put(`${API_BASE}/users/${target.userId}/role`, {
      headers: { Authorization: `Bearer ${provider.token}` },
      data: { role: 'admin' }
    });
    expect(res2.status()).toBe(403);

    // TD3: No token
    const res3 = await request.put(`${API_BASE}/users/${target.userId}/role`, {
      data: { role: 'admin' }
    });
    expect(res3.status()).toBe(401);
  });
});

test.describe.serial('ADMIN API - Delete User (ADM-022 to ADM-025)', () => {
  let adminToken = '';

  test.beforeAll(async ({ request }) => {
    adminToken = await loginAs(request, ADMIN_EMAIL, ADMIN_PASSWORD);
  });

  // ADM-022: Delete User - Soft delete
  test('ADM-022: Delete User - Soft delete', async ({ request }) => {
    const roles: Array<'traveler' | 'provider'> = ['traveler', 'provider', 'traveler'];
    for (let i = 0; i < 3; i++) {
      const user = await registerAndLogin(request, `del_${i}`, roles[i]);
      const res = await request.delete(`${API_BASE}/users/${user.userId}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.message).toBe('User deleted successfully');

      // Verify user is not found anymore
      const getRes = await request.get(`${API_BASE}/users/${user.userId}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      expect(getRes.status()).toBe(404);
    }
  });

  // ADM-023: Delete User - Not found
  test('ADM-023: Delete User - Not found', async ({ request }) => {
    const ids = [99999, -1, 0];
    for (const id of ids) {
      const res = await request.delete(`${API_BASE}/users/${id}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      expect(res.status()).toBe(404);
      const body = await res.json();
      expect(body.message).toBe('User not found');
    }
  });

  // ADM-024: Delete User - Already deleted
  test('ADM-024: Delete User - Already deleted', async ({ request }) => {
    for (let i = 0; i < 3; i++) {
      const user = await registerAndLogin(request, `already_del_${i}`);
      // Delete once
      await request.delete(`${API_BASE}/users/${user.userId}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      // Try to delete again
      const res = await request.delete(`${API_BASE}/users/${user.userId}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      expect(res.status()).toBe(404);
      const body = await res.json();
      expect(body.message).toBe('User not found');
    }
  });

  // ADM-025: Delete User - Non-admin access
  test('ADM-025: Delete User - Non-admin access', async ({ request }) => {
    const target = await registerAndLogin(request, 'target_del');

    // TD1: Traveler
    const traveler = await registerAndLogin(request, 'trav_del');
    const res1 = await request.delete(`${API_BASE}/users/${target.userId}`, {
      headers: { Authorization: `Bearer ${traveler.token}` }
    });
    expect(res1.status()).toBe(403);

    // TD2: Provider
    const provider = await registerAndLogin(request, 'prov_del', 'provider');
    const res2 = await request.delete(`${API_BASE}/users/${target.userId}`, {
      headers: { Authorization: `Bearer ${provider.token}` }
    });
    expect(res2.status()).toBe(403);

    // TD3: No token
    const res3 = await request.delete(`${API_BASE}/users/${target.userId}`);
    expect(res3.status()).toBe(401);
  });
});

test.describe.serial('ADMIN API - Reset Password (ADM-031)', () => {
  let adminToken = '';

  test.beforeAll(async ({ request }) => {
    adminToken = await loginAs(request, ADMIN_EMAIL, ADMIN_PASSWORD);
  });

  // ADM-031: Admin force reset password
  test('ADM-031 TD1: Reset password for traveler', async ({ request }) => {
    const user = await registerAndLogin(request, 'reset_trav');
    const res = await request.post(`${API_BASE}/users/${user.userId}/reset-password`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.message).toBe('Password reset successfully');
    expect(body.data.temporaryPassword).toBeTruthy();
    expect(body.data.temporaryPassword.length).toBeGreaterThanOrEqual(12);

    // Verify login with new password works
    const loginRes = await request.post(`${API_BASE}/auth/login`, {
      data: { email: user.email, password: body.data.temporaryPassword }
    });
    expect(loginRes.status()).toBe(200);
  });

  test('ADM-031 TD2: Reset password for provider', async ({ request }) => {
    const user = await registerAndLogin(request, 'reset_prov', 'provider');
    const res = await request.post(`${API_BASE}/users/${user.userId}/reset-password`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.data.temporaryPassword).toBeTruthy();

    // Verify old password no longer works
    const oldLoginRes = await request.post(`${API_BASE}/auth/login`, {
      data: { email: user.email, password: 'Test@1234' }
    });
    expect(oldLoginRes.status()).toBe(401);

    // Verify new password works
    const newLoginRes = await request.post(`${API_BASE}/auth/login`, {
      data: { email: user.email, password: body.data.temporaryPassword }
    });
    expect(newLoginRes.status()).toBe(200);
  });

  test('ADM-031 TD3: Reset password for soft-deleted user (should fail)', async ({ request }) => {
    const user = await registerAndLogin(request, 'reset_del');
    await request.delete(`${API_BASE}/users/${user.userId}`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const res = await request.post(`${API_BASE}/users/${user.userId}/reset-password`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    expect(res.status()).toBe(404);
  });
});
