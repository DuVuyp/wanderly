import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';

const API_BASE = 'http://127.0.0.1:4000/api';
const AUTH_BASE = 'http://127.0.0.1:4000/api/auth';

test.describe.serial('BOOKING API', () => {
  let travelerToken = '';
  let traveler2Token = '';
  let providerToken = '';
  let provider3Token = '';
  
  // Data from seed_data.sql
  const propertyId = 1;
  const roomTypeId1 = 1;
  const roomTypeId2 = 2;
  const property2Id = 2;
  const prop2RoomTypeId = 3;
  
  const pendingBookingId = 1;
  const confirmedBookingId = 2;
  const completedBookingId = 3;
  const cancelledBookingId = 4;

  test.beforeAll(async ({ request }) => {
    // Reset database state using seed_data.sql
    try {
      console.log('Resetting database...');
      execSync('sqlcmd -S localhost,1433 -U sa -P 123 -i seed_data.sql');
    } catch (e) {
      console.log('Seed failed:', e.message);
    }

    // Login to get tokens
    let res = await request.post(`${AUTH_BASE}/login`, { data: { email: 'minhnhat@wanderly.com', password: 'Wanderly@123' }});
    travelerToken = (await res.json()).data.tokens.access.token;

    res = await request.post(`${AUTH_BASE}/login`, { data: { email: 'duyen.nguyen@gmail.com', password: 'Wanderly@123' }});
    traveler2Token = (await res.json()).data.tokens.access.token;

    // Provider 2 owns Property 1 and Booking 1
    res = await request.post(`${AUTH_BASE}/login`, { data: { email: 'giang.phan@gmail.com', password: 'Wanderly@123' }});
    providerToken = (await res.json()).data.tokens.access.token;

    // Provider 3 owns Booking 3 (completed)
    res = await request.post(`${AUTH_BASE}/login`, { data: { email: 'hung.nguyen@gmail.com', password: 'Wanderly@123' }});
    provider3Token = (await res.json()).data.tokens.access.token;
  });

  const generateFutureDate = (daysToAdd) => {
    const d = new Date();
    d.setDate(d.getDate() + daysToAdd);
    return d.toISOString().split('T')[0];
  };

  test('BOOK-001: Create Booking - Valid', async ({ request }) => {
    const testData = [
      { check_in_date: generateFutureDate(1), check_out_date: generateFutureDate(3), rooms: [{ room_type_id: roomTypeId1, quantity: 1 }] },
      { check_in_date: generateFutureDate(5), check_out_date: generateFutureDate(6), rooms: [{ room_type_id: roomTypeId1, quantity: 1 }] },
      { check_in_date: generateFutureDate(10), check_out_date: generateFutureDate(15), rooms: [{ room_type_id: roomTypeId1, quantity: 2 }] }
    ];

    for (const td of testData) {
      const res = await request.post(`${API_BASE}/bookings`, {
        headers: { Authorization: `Bearer ${travelerToken}` },
        data: { property_id: propertyId, ...td }
      });
      const body = await res.json();
      if (res.status() !== 201) console.log(body);
      expect(res.status()).toBe(201);
      expect(body.success).toBe(true);
      expect(body.data.status).toBe('pending');
    }
  });

  test('BOOK-002: Create Booking - Multiple room types', async ({ request }) => {
    const testData = [
      { check_in_date: generateFutureDate(20), check_out_date: generateFutureDate(22), rooms: [{ room_type_id: roomTypeId1, quantity: 1 }, { room_type_id: roomTypeId2, quantity: 1 }] },
      { check_in_date: generateFutureDate(25), check_out_date: generateFutureDate(26), rooms: [{ room_type_id: roomTypeId1, quantity: 1 }, { room_type_id: roomTypeId2, quantity: 1 }] },
      { check_in_date: generateFutureDate(30), check_out_date: generateFutureDate(35), rooms: [{ room_type_id: roomTypeId1, quantity: 1 }, { room_type_id: roomTypeId2, quantity: 2 }] }
    ];

    for (const td of testData) {
      const res = await request.post(`${API_BASE}/bookings`, {
        headers: { Authorization: `Bearer ${travelerToken}` },
        data: { property_id: propertyId, ...td }
      });
      expect(res.status()).toBe(201);
      const body = await res.json();
      expect(parseFloat(body.data.total_price)).toBeGreaterThan(0);
    }
  });

  test('BOOK-003: Create Booking - Missing property_id', async ({ request }) => {
    const tdBase = { check_in_date: generateFutureDate(1), check_out_date: generateFutureDate(3), rooms: [{ room_type_id: roomTypeId1, quantity: 1 }] };
    const testData = [
      { ...tdBase, property_id: null },
      { ...tdBase, property_id: "" },
      { ...tdBase }
    ];

    for (const td of testData) {
      const res = await request.post(`${API_BASE}/bookings`, {
        headers: { Authorization: `Bearer ${travelerToken}` },
        data: td
      });
      expect(res.status()).toBe(400);
    }
  });

  test('BOOK-004: Create Booking - Invalid property_id', async ({ request }) => {
    const tdBase = { check_in_date: generateFutureDate(1), check_out_date: generateFutureDate(3), rooms: [{ room_type_id: roomTypeId1, quantity: 1 }] };
    const testData = [
      { ...tdBase, property_id: 99999 },
      { ...tdBase, property_id: -1 },
      { ...tdBase, property_id: 0 }
    ];

    for (const td of testData) {
      const res = await request.post(`${API_BASE}/bookings`, {
        headers: { Authorization: `Bearer ${travelerToken}` },
        data: td
      });
      expect([400, 404]).toContain(res.status());
    }
  });

  test('BOOK-005: Create Booking - Missing dates', async ({ request }) => {
    const testData = [
      { property_id: propertyId, check_out_date: generateFutureDate(3), rooms: [{ room_type_id: roomTypeId1, quantity: 1 }] },
      { property_id: propertyId, check_in_date: generateFutureDate(1), rooms: [{ room_type_id: roomTypeId1, quantity: 1 }] },
      { property_id: propertyId, rooms: [{ room_type_id: roomTypeId1, quantity: 1 }] }
    ];

    for (const td of testData) {
      const res = await request.post(`${API_BASE}/bookings`, {
        headers: { Authorization: `Bearer ${travelerToken}` },
        data: td
      });
      expect(res.status()).toBe(400);
    }
  });

  test('BOOK-006: Create Booking - checkout <= checkin', async ({ request }) => {
    const testData = [
      { check_in_date: generateFutureDate(5), check_out_date: generateFutureDate(3), rooms: [{ room_type_id: roomTypeId1, quantity: 1 }] },
      { check_in_date: generateFutureDate(10), check_out_date: generateFutureDate(1), rooms: [{ room_type_id: roomTypeId1, quantity: 1 }] },
      { check_in_date: generateFutureDate(2), check_out_date: generateFutureDate(2), rooms: [{ room_type_id: roomTypeId1, quantity: 1 }] }
    ];

    for (const td of testData) {
      const res = await request.post(`${API_BASE}/bookings`, {
        headers: { Authorization: `Bearer ${travelerToken}` },
        data: { property_id: propertyId, ...td }
      });
      expect(res.status()).toBe(400);
    }
  });

  test('BOOK-007: Create Booking - Missing rooms', async ({ request }) => {
    const testData = [
      { check_in_date: generateFutureDate(1), check_out_date: generateFutureDate(3), rooms: null },
      { check_in_date: generateFutureDate(1), check_out_date: generateFutureDate(3), rooms: [] },
      { check_in_date: generateFutureDate(1), check_out_date: generateFutureDate(3) }
    ];

    for (const td of testData) {
      const res = await request.post(`${API_BASE}/bookings`, {
        headers: { Authorization: `Bearer ${travelerToken}` },
        data: { property_id: propertyId, ...td }
      });
      expect(res.status()).toBe(400);
    }
  });

  test('BOOK-008: Create Booking - Invalid room_type', async ({ request }) => {
    const testData = [
      { check_in_date: generateFutureDate(1), check_out_date: generateFutureDate(3), rooms: [{ room_type_id: 99999, quantity: 1 }] },
      { check_in_date: generateFutureDate(1), check_out_date: generateFutureDate(3), rooms: [{ room_type_id: -1, quantity: 1 }] },
      { check_in_date: generateFutureDate(1), check_out_date: generateFutureDate(3), rooms: [{ room_type_id: 0, quantity: 1 }] }
    ];

    for (const td of testData) {
      const res = await request.post(`${API_BASE}/bookings`, {
        headers: { Authorization: `Bearer ${travelerToken}` },
        data: { property_id: propertyId, ...td }
      });
      expect(res.status()).toBe(400);
    }
  });

  test('BOOK-009: Create Booking - Not enough rooms', async ({ request }) => {
    const testData = [
      { check_in_date: generateFutureDate(40), check_out_date: generateFutureDate(42), rooms: [{ room_type_id: roomTypeId1, quantity: 10 }] },
      { check_in_date: generateFutureDate(40), check_out_date: generateFutureDate(42), rooms: [{ room_type_id: roomTypeId1, quantity: 100 }] },
      { check_in_date: generateFutureDate(40), check_out_date: generateFutureDate(42), rooms: [{ room_type_id: roomTypeId1, quantity: 6 }] }
    ];

    for (const td of testData) {
      const res = await request.post(`${API_BASE}/bookings`, {
        headers: { Authorization: `Bearer ${travelerToken}` },
        data: { property_id: propertyId, ...td }
      });
      expect(res.status()).toBe(400);
    }
  });

  test('BOOK-010: Create Booking - quantity = 0', async ({ request }) => {
    const testData = [
      { check_in_date: generateFutureDate(1), check_out_date: generateFutureDate(3), rooms: [{ room_type_id: roomTypeId1, quantity: 0 }] },
      { check_in_date: generateFutureDate(1), check_out_date: generateFutureDate(3), rooms: [{ room_type_id: roomTypeId1, quantity: -1 }] },
      { check_in_date: generateFutureDate(1), check_out_date: generateFutureDate(3), rooms: [{ room_type_id: roomTypeId1, quantity: -10 }] }
    ];

    for (const td of testData) {
      const res = await request.post(`${API_BASE}/bookings`, {
        headers: { Authorization: `Bearer ${travelerToken}` },
        data: { property_id: propertyId, ...td }
      });
      expect(res.status()).toBe(400);
    }
  });

  test('BOOK-011: Create Booking - Provider role', async ({ request }) => {
    const testData = [
      { check_in_date: generateFutureDate(1), check_out_date: generateFutureDate(3), rooms: [{ room_type_id: roomTypeId1, quantity: 1 }] },
      { check_in_date: generateFutureDate(1), check_out_date: generateFutureDate(3), rooms: [{ room_type_id: roomTypeId1, quantity: 1 }] },
      { check_in_date: generateFutureDate(1), check_out_date: generateFutureDate(3), rooms: [{ room_type_id: roomTypeId1, quantity: 1 }] }
    ];

    for (const td of testData) {
      const res = await request.post(`${API_BASE}/bookings`, {
        headers: { Authorization: `Bearer ${providerToken}` },
        data: { property_id: propertyId, ...td }
      });
      expect(res.status()).toBe(403);
    }
  });

  test('BOOK-012: Get My Bookings - Default', async ({ request }) => {
    const testData = [
      { token: travelerToken },
      { token: travelerToken },
      { token: travelerToken }
    ];

    for (const td of testData) {
      const res = await request.get(`${API_BASE}/bookings/my-bookings`, {
        headers: { Authorization: `Bearer ${td.token}` }
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.data.bookings).toBeDefined();
    }
  });

  test('BOOK-013: Get My Bookings - Filter status', async ({ request }) => {
    const testData = [
      { status: 'pending' },
      { status: 'confirmed' },
      { status: 'cancelled' }
    ];

    for (const td of testData) {
      const res = await request.get(`${API_BASE}/bookings/my-bookings?status=${td.status}`, {
        headers: { Authorization: `Bearer ${travelerToken}` }
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      const bookings = body.data.bookings;
      if (bookings.length > 0) {
        expect(bookings[0].status).toBe(td.status);
      }
    }
  });

  test('BOOK-014: Get My Bookings - Pagination', async ({ request }) => {
    const testData = [
      { page: 1, limit: 5 },
      { page: 2, limit: 5 },
      { page: 1, limit: 10 }
    ];

    for (const td of testData) {
      const res = await request.get(`${API_BASE}/bookings/my-bookings?page=${td.page}&limit=${td.limit}`, {
        headers: { Authorization: `Bearer ${travelerToken}` }
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.data.pagination.limit).toBe(td.limit);
      expect(body.data.pagination.page).toBe(td.page);
    }
  });

  test('BOOK-015: Get Provider Bookings - Valid', async ({ request }) => {
    const testData = [
      { token: providerToken },
      { token: providerToken },
      { token: providerToken }
    ];

    for (const td of testData) {
      const res = await request.get(`${API_BASE}/bookings/provider-bookings`, {
        headers: { Authorization: `Bearer ${td.token}` }
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.data.stats).toBeDefined();
    }
  });

  test('BOOK-016: Get Provider Bookings - Filter', async ({ request }) => {
    const testData = [
      { status: 'pending' },
      { status: 'confirmed' },
      { status: 'completed' }
    ];

    for (const td of testData) {
      const res = await request.get(`${API_BASE}/bookings/provider-bookings?status=${td.status}`, {
        headers: { Authorization: `Bearer ${providerToken}` }
      });
      expect(res.status()).toBe(200);
    }
  });

  test('BOOK-017: Get Provider Bookings - Traveler access', async ({ request }) => {
    const testData = [
      { token: travelerToken },
      { token: traveler2Token },
      { token: travelerToken }
    ];

    for (const td of testData) {
      const res = await request.get(`${API_BASE}/bookings/provider-bookings`, {
        headers: { Authorization: `Bearer ${td.token}` }
      });
      expect(res.status()).toBe(403);
    }
  });

  test('BOOK-018: Get Booking Detail - Owner', async ({ request }) => {
    const testData = [
      { id: pendingBookingId },
      { id: confirmedBookingId },
      { id: cancelledBookingId }
    ];

    for (const td of testData) {
      const res = await request.get(`${API_BASE}/bookings/${td.id}`, {
        headers: { Authorization: `Bearer ${travelerToken}` }
      });
      expect(res.status()).toBe(200);
    }
  });

  test('BOOK-019: Get Booking Detail - Provider', async ({ request }) => {
    const testData = [
      { id: pendingBookingId },
      { id: pendingBookingId }, // property 1, provider 2
      { id: pendingBookingId }
    ];

    for (const td of testData) {
      const res = await request.get(`${API_BASE}/bookings/${td.id}`, {
        headers: { Authorization: `Bearer ${providerToken}` }
      });
      expect(res.status()).toBe(200);
    }
  });

  test('BOOK-020: Get Booking Detail - Unauthorized', async ({ request }) => {
    const testData = [
      { id: pendingBookingId, token: traveler2Token }, // not the owner
      { id: confirmedBookingId, token: traveler2Token },
      { id: cancelledBookingId, token: traveler2Token }
    ];

    for (const td of testData) {
      const res = await request.get(`${API_BASE}/bookings/${td.id}`, {
        headers: { Authorization: `Bearer ${td.token}` }
      });
      expect(res.status()).toBe(403);
    }
  });

  test('BOOK-021: Get Booking Detail - Not found', async ({ request }) => {
    const testData = [
      { id: 99999 },
      { id: -1 },
      { id: 0 }
    ];

    for (const td of testData) {
      const res = await request.get(`${API_BASE}/bookings/${td.id}`, {
        headers: { Authorization: `Bearer ${travelerToken}` }
      });
      expect([400, 404]).toContain(res.status());
    }
  });

  test('BOOK-022: Update Status - Confirm', async ({ request }) => {
    // Generate new pending bookings to confirm
    const testData = [];
    for (let i = 0; i < 3; i++) {
      const b = await request.post(`${API_BASE}/bookings`, {
        headers: { Authorization: `Bearer ${travelerToken}` },
        data: { property_id: propertyId, check_in_date: generateFutureDate(50), check_out_date: generateFutureDate(52), rooms: [{ room_type_id: roomTypeId1, quantity: 1 }] }
      });
      const data = await b.json();
      testData.push({ id: data.data.id });
    }

    for (const td of testData) {
      const res = await request.put(`${API_BASE}/bookings/${td.id}/status`, {
        headers: { Authorization: `Bearer ${providerToken}` },
        data: { status: 'confirmed' }
      });
      expect(res.status()).toBe(200);
    }
  });

  test('BOOK-023: Update Status - Cancel', async ({ request }) => {
    // Generate new pending bookings to cancel
    const testData = [];
    for (let i = 0; i < 3; i++) {
      const b = await request.post(`${API_BASE}/bookings`, {
        headers: { Authorization: `Bearer ${travelerToken}` },
        data: { property_id: propertyId, check_in_date: generateFutureDate(60), check_out_date: generateFutureDate(62), rooms: [{ room_type_id: roomTypeId1, quantity: 1 }] }
      });
      const data = await b.json();
      testData.push({ id: data.data.id });
    }

    for (const td of testData) {
      const res = await request.put(`${API_BASE}/bookings/${td.id}/status`, {
        headers: { Authorization: `Bearer ${providerToken}` },
        data: { status: 'cancelled' }
      });
      expect(res.status()).toBe(200);
    }
  });

  test('BOOK-024: Update Status - Invalid status', async ({ request }) => {
    const testData = [
      { status: 'unknown' },
      { status: 'completed' },
      { status: 'booked' }
    ];

    for (const td of testData) {
      const res = await request.put(`${API_BASE}/bookings/${pendingBookingId}/status`, {
        headers: { Authorization: `Bearer ${providerToken}` },
        data: { status: td.status }
      });
      expect(res.status()).toBe(400);
    }
  });

  test('BOOK-025: Update Status - Not owner', async ({ request }) => {
    // Provider 1 does not own Property 1
    const resLogin = await request.post(`${AUTH_BASE}/login`, { data: { email: 'kiet.luu@gmail.com', password: 'Wanderly@123' }});
    const otherProviderToken = (await resLogin.json()).data.tokens.access.token;

    const testData = [
      { token: otherProviderToken },
      { token: otherProviderToken },
      { token: otherProviderToken }
    ];

    for (const td of testData) {
      const res = await request.put(`${API_BASE}/bookings/${pendingBookingId}/status`, {
        headers: { Authorization: `Bearer ${td.token}` },
        data: { status: 'confirmed' }
      });
      expect(res.status()).toBe(403);
    }
  });

  test('BOOK-026: Update Status - Already cancelled', async ({ request }) => {
    const testData = [
      { id: cancelledBookingId },
      { id: cancelledBookingId },
      { id: cancelledBookingId }
    ];

    for (const td of testData) {
      const res = await request.put(`${API_BASE}/bookings/${td.id}/status`, {
        headers: { Authorization: `Bearer ${providerToken}` }, // providerToken for booking 4, wait, booking 4 is for property 4!
        // Property 4 belongs to Provider 2. So Provider 2 is the correct owner!
        data: { status: 'confirmed' }
      });
      expect(res.status()).toBe(400);
    }
  });

  test('BOOK-027: Update Status - Already completed', async ({ request }) => {
    const testData = [
      { id: completedBookingId },
      { id: completedBookingId },
      { id: completedBookingId }
    ];

    for (const td of testData) {
      const res = await request.put(`${API_BASE}/bookings/${td.id}/status`, {
        headers: { Authorization: `Bearer ${provider3Token}` },
        data: { status: 'confirmed' }
      });
      expect(res.status()).toBe(400);
    }
  });

  test('BOOK-028: Create Booking - Past check-in date', async ({ request }) => {
    const testData = [
      { check_in_date: '2023-01-01', check_out_date: generateFutureDate(3), rooms: [{ room_type_id: roomTypeId1, quantity: 1 }] },
      { check_in_date: generateFutureDate(-1), check_out_date: generateFutureDate(3), rooms: [{ room_type_id: roomTypeId1, quantity: 1 }] },
      { check_in_date: generateFutureDate(-30), check_out_date: generateFutureDate(3), rooms: [{ room_type_id: roomTypeId1, quantity: 1 }] }
    ];

    for (const td of testData) {
      const res = await request.post(`${API_BASE}/bookings`, {
        headers: { Authorization: `Bearer ${travelerToken}` },
        data: { property_id: propertyId, ...td }
      });
      expect(res.status()).toBe(400);
    }
  });

  test('BOOK-032: Logic - Race Condition', async ({ request }) => {
    // Room type 3 (Property 2) has 3 rooms total.
    // Provider 1 owns Property 2.
    // Let's create a booking that takes 2 rooms, leaving 1.
    const b = await request.post(`${API_BASE}/bookings`, {
        headers: { Authorization: `Bearer ${travelerToken}` },
        data: { property_id: property2Id, check_in_date: generateFutureDate(50), check_out_date: generateFutureDate(52), rooms: [{ room_type_id: prop2RoomTypeId, quantity: 2 }] }
    });
    expect(b.status()).toBe(201);

    // Now 3 requests try to book the last room simultaneously
    const payload = { property_id: property2Id, check_in_date: generateFutureDate(50), check_out_date: generateFutureDate(52), rooms: [{ room_type_id: prop2RoomTypeId, quantity: 1 }] };
    
    const reqs = [
      request.post(`${API_BASE}/bookings`, { headers: { Authorization: `Bearer ${travelerToken}` }, data: payload }),
      request.post(`${API_BASE}/bookings`, { headers: { Authorization: `Bearer ${traveler2Token}` }, data: payload }),
      request.post(`${API_BASE}/bookings`, { headers: { Authorization: `Bearer ${travelerToken}` }, data: payload })
    ];

    const responses = await Promise.all(reqs);
    const statuses = responses.map(r => r.status());
    
    const successCount = statuses.filter(s => s === 201).length;
    const failCount = statuses.filter(s => s === 400).length;

    expect(successCount).toBe(1);
    expect(failCount).toBe(2);
  });

});
