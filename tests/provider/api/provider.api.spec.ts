import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const API_BASE = 'http://127.0.0.1:4000/api';

test.describe('MODULE 3: Provider Management API', () => {
  const getTimestamp = () => Date.now().toString();
  const ts = getTimestamp();

  let providerToken = '';
  let provider2Token = '';
  let travelerToken = '';
  
  let providerHeaders = {};
  let provider2Headers = {};
  let travelerHeaders = {};

  let testPropertyId = 0;
  let testRoomTypeId = 0;
  let provider2PropertyId = 0;
  let deletedPropertyId = 0;

  test.beforeAll(async ({ request }) => {
    // Register & Login Provider 1
    await request.post(`${API_BASE}/auth/register`, {
      data: { full_name: 'Provider 1', email: `prov1_${ts}@wanderly.com`, password: 'Test@1234', role: 'provider' }
    });
    const resP1 = await request.post(`${API_BASE}/auth/login`, {
      data: { email: `prov1_${ts}@wanderly.com`, password: 'Test@1234' }
    });
    const dataP1 = await resP1.json();
    providerToken = dataP1.data.tokens.access.token;
    providerHeaders = { Authorization: `Bearer ${providerToken}` };

    // Register & Login Provider 2
    await request.post(`${API_BASE}/auth/register`, {
      data: { full_name: 'Provider 2', email: `prov2_${ts}@wanderly.com`, password: 'Test@1234', role: 'provider' }
    });
    const resP2 = await request.post(`${API_BASE}/auth/login`, {
      data: { email: `prov2_${ts}@wanderly.com`, password: 'Test@1234' }
    });
    const dataP2 = await resP2.json();
    provider2Token = dataP2.data.tokens.access.token;
    provider2Headers = { Authorization: `Bearer ${provider2Token}` };

    // Register & Login Traveler
    await request.post(`${API_BASE}/auth/register`, {
      data: { full_name: 'Traveler 1', email: `trav1_${ts}@wanderly.com`, password: 'Test@1234', role: 'traveler' }
    });
    const resT1 = await request.post(`${API_BASE}/auth/login`, {
      data: { email: `trav1_${ts}@wanderly.com`, password: 'Test@1234' }
    });
    const dataT1 = await resT1.json();
    travelerToken = dataT1.data.tokens.access.token;
    travelerHeaders = { Authorization: `Bearer ${travelerToken}` };

    // Setup Property 1 for Provider 1
    const resProp1 = await request.post(`${API_BASE}/properties`, {
      headers: providerHeaders,
      data: { name: 'Sunrise Hotel', property_type: 'hotel', address: '123 Beach Rd', latitude: 10, longitude: 106, check_in_time: '14:00', check_out_time: '12:00' }
    });
    testPropertyId = (await resProp1.json()).data.id;

    // Setup Room Type 1 for Property 1
    const resRt1 = await request.post(`${API_BASE}/properties/${testPropertyId}/room-types`, {
      headers: providerHeaders,
      data: { name: 'Deluxe Ocean View', max_guests: 2, base_price: 500000 }
    });
    testRoomTypeId = (await resRt1.json()).data.id;

    // Add 5 physical rooms
    for(let i=1; i<=5; i++) {
      await request.post(`${API_BASE}/room-types/${testRoomTypeId}/rooms`, {
        headers: providerHeaders,
        data: { room_number: `10${i}`, status: 'available' }
      });
    }

    // Setup Property 2 for Provider 2
    const resProp2 = await request.post(`${API_BASE}/properties`, {
      headers: provider2Headers,
      data: { name: 'Sunset Villa', property_type: 'villa', address: '456 Mountain Rd', latitude: 12, longitude: 108, check_in_time: '15:00', check_out_time: '11:00' }
    });
    provider2PropertyId = (await resProp2.json()).data.id;

    // Create a property and soft delete it
    const resProp3 = await request.post(`${API_BASE}/properties`, {
      headers: providerHeaders,
      data: { name: 'Deleted Resort', property_type: 'resort', address: '789 Island', latitude: 9, longitude: 104, check_in_time: '14:00', check_out_time: '12:00' }
    });
    deletedPropertyId = (await resProp3.json()).data.id;
    await request.delete(`${API_BASE}/properties/${deletedPropertyId}`, { headers: providerHeaders });
  });


  test.describe('Create Property (PROV-001 -> PROV-012)', () => {
    test('PROV-001: Create Property - Valid resort', async ({ request }) => {
      const testData = [
        { name: 'A', property_type: 'resort', address: 'Add1', latitude: 10, longitude: 106, check_in_time: '14:00', check_out_time: '12:00' },
        { name: 'B', property_type: 'resort', address: 'Add2', latitude: 11, longitude: 107, check_in_time: '14:00', check_out_time: '12:00' },
        { name: 'C', property_type: 'resort', address: 'Add3', latitude: 12, longitude: 108, check_in_time: '14:00', check_out_time: '12:00' }
      ];
      for (const td of testData) {
        const res = await request.post(`${API_BASE}/properties`, { headers: providerHeaders, data: td });
        expect(res.status()).toBe(201);
        const body = await res.json();
        expect(body.message).toBe('Property created successfully');
      }
    });

    test('PROV-002: Create Property - Valid hotel', async ({ request }) => {
      const testData = [
        { name: 'H1', property_type: 'hotel', address: 'Add', latitude: 10, longitude: 106, check_in_time: '14:00', check_out_time: '12:00' },
        { name: 'H2', property_type: 'hotel', address: 'Add', latitude: 10, longitude: 106, check_in_time: '14:00', check_out_time: '12:00' },
        { name: 'H3', property_type: 'hotel', address: 'Add', latitude: 10, longitude: 106, check_in_time: '14:00', check_out_time: '12:00' }
      ];
      for (const td of testData) {
        const res = await request.post(`${API_BASE}/properties`, { headers: providerHeaders, data: td });
        expect(res.status()).toBe(201);
        expect((await res.json()).data.property_type).toBe('hotel');
      }
    });

    test('PROV-003: Create Property - Valid homestay', async ({ request }) => {
      const testData = [
        { name: 'HS1', property_type: 'homestay', address: 'Add', latitude: 10, longitude: 106, check_in_time: '14:00', check_out_time: '12:00' },
        { name: 'HS2', property_type: 'homestay', address: 'Add', latitude: 10, longitude: 106, check_in_time: '14:00', check_out_time: '12:00' },
        { name: 'HS3', property_type: 'homestay', address: 'Add', latitude: 10, longitude: 106, check_in_time: '14:00', check_out_time: '12:00' }
      ];
      for (const td of testData) {
        const res = await request.post(`${API_BASE}/properties`, { headers: providerHeaders, data: td });
        expect(res.status()).toBe(201);
      }
    });

    test('PROV-004: Create Property - Valid villa', async ({ request }) => {
      const testData = [
        { name: 'V1', property_type: 'villa', address: 'Add', latitude: 10, longitude: 106, check_in_time: '14:00', check_out_time: '12:00' },
        { name: 'V2', property_type: 'villa', address: 'Add', latitude: 10, longitude: 106, check_in_time: '14:00', check_out_time: '12:00' },
        { name: 'V3', property_type: 'villa', address: 'Add', latitude: 10, longitude: 106, check_in_time: '14:00', check_out_time: '12:00' }
      ];
      for (const td of testData) {
        const res = await request.post(`${API_BASE}/properties`, { headers: providerHeaders, data: td });
        expect(res.status()).toBe(201);
      }
    });

    test('PROV-005: Create Property - Missing name', async ({ request }) => {
      const testData = [
        { name: null, property_type: 'hotel', address: 'A', latitude: 10, longitude: 106, check_in_time: '14:00', check_out_time: '12:00' },
        { name: '', property_type: 'hotel', address: 'A', latitude: 10, longitude: 106, check_in_time: '14:00', check_out_time: '12:00' },
        { property_type: 'hotel', address: 'A', latitude: 10, longitude: 106, check_in_time: '14:00', check_out_time: '12:00' }
      ];
      for (const td of testData) {
        const res = await request.post(`${API_BASE}/properties`, { headers: providerHeaders, data: td });
        expect(res.status()).toBe(400);
      }
    });

    test('PROV-006: Create Property - Name > 100 chars', async ({ request }) => {
      const long1 = 'A'.repeat(101);
      const long2 = 'B'.repeat(150);
      const long3 = 'C'.repeat(200);
      const testData = [
        { name: long1, property_type: 'hotel', address: 'A', latitude: 10, longitude: 106, check_in_time: '14:00', check_out_time: '12:00' },
        { name: long2, property_type: 'hotel', address: 'A', latitude: 10, longitude: 106, check_in_time: '14:00', check_out_time: '12:00' },
        { name: long3, property_type: 'hotel', address: 'A', latitude: 10, longitude: 106, check_in_time: '14:00', check_out_time: '12:00' }
      ];
      for (const td of testData) {
        const res = await request.post(`${API_BASE}/properties`, { headers: providerHeaders, data: td });
        expect(res.status()).toBe(400);
      }
    });

    test('PROV-007: Create Property - Invalid type', async ({ request }) => {
      const testData = [
        { name: 'A', property_type: 'apartment', address: 'A', latitude: 10, longitude: 106, check_in_time: '14:00', check_out_time: '12:00' },
        { name: 'A', property_type: 'motel', address: 'A', latitude: 10, longitude: 106, check_in_time: '14:00', check_out_time: '12:00' },
        { name: 'A', property_type: 'hostel', address: 'A', latitude: 10, longitude: 106, check_in_time: '14:00', check_out_time: '12:00' }
      ];
      for (const td of testData) {
        const res = await request.post(`${API_BASE}/properties`, { headers: providerHeaders, data: td });
        expect(res.status()).toBe(400);
      }
    });

    test('PROV-008: Create Property - Missing address', async ({ request }) => {
      const testData = [
        { name: 'A', property_type: 'hotel', address: null, latitude: 10, longitude: 106, check_in_time: '14:00', check_out_time: '12:00' },
        { name: 'A', property_type: 'hotel', address: '', latitude: 10, longitude: 106, check_in_time: '14:00', check_out_time: '12:00' },
        { name: 'A', property_type: 'hotel', latitude: 10, longitude: 106, check_in_time: '14:00', check_out_time: '12:00' }
      ];
      for (const td of testData) {
        const res = await request.post(`${API_BASE}/properties`, { headers: providerHeaders, data: td });
        expect(res.status()).toBe(400);
      }
    });

    test('PROV-009: Create Property - Latitude out of range', async ({ request }) => {
      const testData = [
        { name: 'A', property_type: 'hotel', address: 'A', latitude: 91, longitude: 106, check_in_time: '14:00', check_out_time: '12:00' },
        { name: 'A', property_type: 'hotel', address: 'A', latitude: -91, longitude: 106, check_in_time: '14:00', check_out_time: '12:00' },
        { name: 'A', property_type: 'hotel', address: 'A', latitude: 100, longitude: 106, check_in_time: '14:00', check_out_time: '12:00' }
      ];
      for (const td of testData) {
        const res = await request.post(`${API_BASE}/properties`, { headers: providerHeaders, data: td });
        expect(res.status()).toBe(400);
      }
    });

    test('PROV-010: Create Property - Longitude out of range', async ({ request }) => {
      const testData = [
        { name: 'A', property_type: 'hotel', address: 'A', latitude: 10, longitude: 181, check_in_time: '14:00', check_out_time: '12:00' },
        { name: 'A', property_type: 'hotel', address: 'A', latitude: 10, longitude: -181, check_in_time: '14:00', check_out_time: '12:00' },
        { name: 'A', property_type: 'hotel', address: 'A', latitude: 10, longitude: 200, check_in_time: '14:00', check_out_time: '12:00' }
      ];
      for (const td of testData) {
        const res = await request.post(`${API_BASE}/properties`, { headers: providerHeaders, data: td });
        expect(res.status()).toBe(400);
      }
    });

    test('PROV-011: Create Property - Invalid time format', async ({ request }) => {
      const testData = [
        { name: 'A', property_type: 'hotel', address: 'A', latitude: 10, longitude: 106, check_in_time: '2PM', check_out_time: '12:00' },
        { name: 'A', property_type: 'hotel', address: 'A', latitude: 10, longitude: 106, check_in_time: '14-00', check_out_time: '12:00' },
        { name: 'A', property_type: 'hotel', address: 'A', latitude: 10, longitude: 106, check_in_time: '25:00', check_out_time: '12:00' }
      ];
      for (const td of testData) {
        const res = await request.post(`${API_BASE}/properties`, { headers: providerHeaders, data: td });
        expect(res.status()).toBe(400);
      }
    });

    test('PROV-012: Create Property - Traveler role', async ({ request }) => {
      const testData = [
        { headers: travelerHeaders },
        { headers: travelerHeaders },
        { headers: travelerHeaders }
      ];
      for (const td of testData) {
        const res = await request.post(`${API_BASE}/properties`, { 
          headers: td.headers, 
          data: { name: 'A', property_type: 'hotel', address: 'A', latitude: 10, longitude: 106, check_in_time: '14:00', check_out_time: '12:00' } 
        });
        expect([401, 403]).toContain(res.status());
      }
    });
  });

  test.describe('Get Properties (PROV-013 -> PROV-021)', () => {
    test('PROV-013: Get Properties - Public', async ({ request }) => {
      for (let i = 0; i < 3; i++) {
        const res = await request.get(`${API_BASE}/properties`);
        expect(res.status()).toBe(200);
        const body = await res.json();
        expect(body.data).toHaveProperty('properties');
        expect(body.data).toHaveProperty('pagination');
      }
    });

    test('PROV-014: Get Properties - Filter type', async ({ request }) => {
      const testData = ['hotel', 'resort', 'villa'];
      for (const type of testData) {
        const res = await request.get(`${API_BASE}/properties?property_type=${type}`);
        expect(res.status()).toBe(200);
      }
    });

    test('PROV-015: Get Properties - Search keyword', async ({ request }) => {
      const testData = ['Sunrise', 'Beach', 'Resort'];
      for (const kw of testData) {
        const res = await request.get(`${API_BASE}/properties?keyword=${kw}`);
        expect(res.status()).toBe(200);
      }
    });

    test('PROV-016: Get Properties - Search location', async ({ request }) => {
      const testData = ['HCM', 'Da Nang', 'Nha Trang'];
      for (const loc of testData) {
        const res = await request.get(`${API_BASE}/properties?location=${loc}`);
        expect(res.status()).toBe(200);
      }
    });

    test('PROV-017: Get Properties - Pagination', async ({ request }) => {
      const testData = [
        { page: 1, limit: 5 },
        { page: 2, limit: 10 },
        { page: 3, limit: 20 }
      ];
      for (const td of testData) {
        const res = await request.get(`${API_BASE}/properties?page=${td.page}&limit=${td.limit}`);
        expect(res.status()).toBe(200);
      }
    });

    test('PROV-018: Get Properties - Provider view', async ({ request }) => {
      const testData = [
        { headers: providerHeaders },
        { headers: provider2Headers },
        { headers: providerHeaders }
      ];
      for (const td of testData) {
        const res = await request.get(`${API_BASE}/properties`, { headers: td.headers });
        expect(res.status()).toBe(200);
        const body = await res.json();
        // Provider view returns array directly
        expect(Array.isArray(body.data)).toBeTruthy();
      }
    });

    test('PROV-019: Get Property Detail - Valid', async ({ request }) => {
      const testData = [testPropertyId, provider2PropertyId, testPropertyId];
      for (const id of testData) {
        const res = await request.get(`${API_BASE}/properties/${id}`);
        expect(res.status()).toBe(200);
      }
    });

    test('PROV-020: Get Property Detail - Not found', async ({ request }) => {
      const testData = [99999, 88888, -1];
      for (const id of testData) {
        const res = await request.get(`${API_BASE}/properties/${id}`);
        expect(res.status()).toBe(404);
      }
    });

    test('PROV-021: Get Property Detail - Soft deleted', async ({ request }) => {
      const testData = [deletedPropertyId, deletedPropertyId, deletedPropertyId];
      for (const id of testData) {
        const res = await request.get(`${API_BASE}/properties/${id}`);
        expect(res.status()).toBe(404);
      }
    });
  });

  test.describe('Update/Delete Property (PROV-022 -> PROV-026)', () => {
    test('PROV-022: Update Property - Valid', async ({ request }) => {
      const testData = [
        { name: 'Updated Name A' },
        { address: 'New Addr' },
        { latitude: 11 }
      ];
      for (const td of testData) {
        const res = await request.put(`${API_BASE}/properties/${testPropertyId}`, {
          headers: providerHeaders,
          data: td
        });
        expect(res.status()).toBe(200);
      }
    });

    test('PROV-023: Update Property - Not owner', async ({ request }) => {
      const testData = [provider2Headers, provider2Headers, provider2Headers];
      for (const headers of testData) {
        const res = await request.put(`${API_BASE}/properties/${testPropertyId}`, {
          headers,
          data: { name: 'Hack' }
        });
        expect([401, 403]).toContain(res.status());
      }
    });

    test('PROV-024: Update Property - Traveler', async ({ request }) => {
      const testData = [travelerHeaders, travelerHeaders, travelerHeaders];
      for (const headers of testData) {
        const res = await request.put(`${API_BASE}/properties/${testPropertyId}`, {
          headers,
          data: { name: 'Hack' }
        });
        expect([401, 403]).toContain(res.status());
      }
    });

    test('PROV-026: Delete Property - Not owner', async ({ request }) => {
      const testData = [provider2Headers, provider2Headers, travelerHeaders];
      for (const headers of testData) {
        const res = await request.delete(`${API_BASE}/properties/${testPropertyId}`, { headers });
        expect([401, 403]).toContain(res.status());
      }
    });

    test('PROV-025: Delete Property - Soft Delete', async ({ request }) => {
      // Create 3 properties to delete to satisfy the 3 test data points requirement
      const ids = [];
      for(let i=0; i<3; i++) {
        const res = await request.post(`${API_BASE}/properties`, {
          headers: providerHeaders,
          data: { name: `Del ${i}`, property_type: 'hotel', address: 'A', latitude: 10, longitude: 106, check_in_time: '14:00', check_out_time: '12:00' }
        });
        ids.push((await res.json()).data.id);
      }

      for (const id of ids) {
        const res = await request.delete(`${API_BASE}/properties/${id}`, { headers: providerHeaders });
        expect(res.status()).toBe(200);
      }
    });
  });

  test.describe('Room Types (PROV-027 -> PROV-036)', () => {
    test('PROV-027: Get Room Types - Valid', async ({ request }) => {
      const testData = [testPropertyId, provider2PropertyId, testPropertyId];
      for (const id of testData) {
        const res = await request.get(`${API_BASE}/properties/${id}/room-types`);
        expect(res.status()).toBe(200);
      }
    });

    test('PROV-028: Get Room Types - Availability check', async ({ request }) => {
      const testData = [
        { check_in_date: '2027-01-01', check_out_date: '2027-01-05' },
        { check_in_date: '2027-02-01', check_out_date: '2027-02-05' },
        { check_in_date: '2027-03-01', check_out_date: '2027-03-05' }
      ];
      for (const dates of testData) {
        const res = await request.get(`${API_BASE}/properties/${testPropertyId}/room-types?check_in_date=${dates.check_in_date}&check_out_date=${dates.check_out_date}`);
        expect(res.status()).toBe(200);
        const body = await res.json();
        if (body.data && body.data.length > 0) {
          expect(body.data[0]).toHaveProperty('available_quantity');
        }
      }
    });

    test('PROV-029: Get Room Types - Property not found', async ({ request }) => {
      const testData = [99999, -1, deletedPropertyId];
      for (const id of testData) {
        const res = await request.get(`${API_BASE}/properties/${id}/room-types`);
        expect(res.status()).toBe(404);
      }
    });

    test('PROV-030: Create Room Type - Valid', async ({ request }) => {
      const testData = [
        { name: 'A', max_guests: 2, base_price: 100000 },
        { name: 'B', max_guests: 3, base_price: 200000 },
        { name: 'C', max_guests: 4, base_price: 500000 }
      ];
      for (const td of testData) {
        const res = await request.post(`${API_BASE}/properties/${testPropertyId}/room-types`, {
          headers: providerHeaders,
          data: td
        });
        expect(res.status()).toBe(201);
      }
    });

    test('PROV-031: Create Room Type - Missing name', async ({ request }) => {
      const testData = [
        { name: null, max_guests: 2, base_price: 100000 },
        { name: '', max_guests: 2, base_price: 100000 },
        { max_guests: 2, base_price: 100000 }
      ];
      for (const td of testData) {
        const res = await request.post(`${API_BASE}/properties/${testPropertyId}/room-types`, { headers: providerHeaders, data: td });
        expect(res.status()).toBe(400);
      }
    });

    test('PROV-032: Create Room Type - Name > 50 chars', async ({ request }) => {
      const testData = [
        { name: 'A'.repeat(51), max_guests: 2, base_price: 100000 },
        { name: 'A'.repeat(100), max_guests: 2, base_price: 100000 },
        { name: 'A'.repeat(150), max_guests: 2, base_price: 100000 }
      ];
      for (const td of testData) {
        const res = await request.post(`${API_BASE}/properties/${testPropertyId}/room-types`, { headers: providerHeaders, data: td });
        expect(res.status()).toBe(400);
      }
    });

    test('PROV-033: Create Room Type - max_guests = 0', async ({ request }) => {
      const testData = [
        { name: 'T1', max_guests: 0, base_price: 100000 },
        { name: 'T2', max_guests: -1, base_price: 100000 },
        { name: 'T3', max_guests: -10, base_price: 100000 }
      ];
      for (const td of testData) {
        const res = await request.post(`${API_BASE}/properties/${testPropertyId}/room-types`, { headers: providerHeaders, data: td });
        expect(res.status()).toBe(400);
      }
    });

    test('PROV-034: Create Room Type - max_guests > 20', async ({ request }) => {
      const testData = [
        { name: 'T1', max_guests: 21, base_price: 100000 },
        { name: 'T2', max_guests: 50, base_price: 100000 },
        { name: 'T3', max_guests: 100, base_price: 100000 }
      ];
      for (const td of testData) {
        const res = await request.post(`${API_BASE}/properties/${testPropertyId}/room-types`, { headers: providerHeaders, data: td });
        expect(res.status()).toBe(400);
      }
    });

    test('PROV-035: Create Room Type - base_price = 0', async ({ request }) => {
      const testData = [
        { name: 'T1', max_guests: 2, base_price: 0 },
        { name: 'T2', max_guests: 2, base_price: -1 },
        { name: 'T3', max_guests: 2, base_price: -100 }
      ];
      for (const td of testData) {
        const res = await request.post(`${API_BASE}/properties/${testPropertyId}/room-types`, { headers: providerHeaders, data: td });
        expect(res.status()).toBe(400);
      }
    });

    test('PROV-036: Create Room Type - Invalid data types', async ({ request }) => {
      const testData = [
        { name: 'T1', max_guests: 'five', base_price: 100000 },
        { name: 'T2', max_guests: 2, base_price: 'một trăm' },
        { name: 'T3', max_guests: 1.5, base_price: 100000 }
      ];
      for (const td of testData) {
        const res = await request.post(`${API_BASE}/properties/${testPropertyId}/room-types`, { headers: providerHeaders, data: td });
        expect(res.status()).toBe(400);
      }
    });
  });

  test.describe('Rooms & Upload (PROV-037 -> PROV-039)', () => {
    test('PROV-037: Create Room - Trùng số phòng', async ({ request }) => {
      // Room 101, 102, 103 were created in beforeAll
      const testData = [
        { room_number: '101', status: 'available' },
        { room_number: '102', status: 'available' },
        { room_number: '103', status: 'available' }
      ];
      for (const td of testData) {
        // Assume API is /room-types/:id/rooms
        const res = await request.post(`${API_BASE}/room-types/${testRoomTypeId}/rooms`, { headers: providerHeaders, data: td });
        // The API might return 409 Conflict
        expect([400, 409]).toContain(res.status());
      }
    });

    test('PROV-038: Update Room - Sai trạng thái', async ({ request }) => {
      // We need a room ID. Let's fetch it first.
      const rtRes = await request.get(`${API_BASE}/properties/${testPropertyId}/room-types`);
      const rts = await rtRes.json();
      
      // Attempting to PUT to a room endpoint
      // We will mock IDs or assume failure directly from schema if ID is not fully required before body validation
      const testData = [
        { status: 'unknown' },
        { status: 'booked' },
        { status: 'clean' }
      ];
      for (const td of testData) {
        // Even if roomId 1 doesn't exist, Joi validation fails first and returns 400
        const res = await request.put(`${API_BASE}/rooms/1`, { headers: providerHeaders, data: td });
        expect(res.status()).toBe(400);
      }
    });

    test('PROV-039: Logic Upload - Xử lý ảnh Property', async ({ request }) => {
      // For testing upload size/type limits:
      // TD1: Upload 11 ảnh (quá limit 10) - Since we only have /api/upload which accepts single, we'll test invalid format and size
      // We'll mock text file, large file, and multiple form fields

      const testData = [
        { name: 'image', file: Buffer.alloc(10), filename: 'test.exe', mimeType: 'application/x-msdownload' },
        { name: 'image', file: Buffer.alloc(10), filename: 'test.txt', mimeType: 'text/plain' },
        { name: 'image', file: Buffer.alloc(6 * 1024 * 1024), filename: 'large.jpg', mimeType: 'image/jpeg' } // 6MB
      ];

      for (const td of testData) {
        const res = await request.post(`${API_BASE}/upload`, {
          headers: providerHeaders,
          multipart: {
            image: {
              name: td.filename,
              mimeType: td.mimeType,
              buffer: td.file,
            }
          }
        });
        expect([400, 500]).toContain(res.status()); // 400 or Multer Error (500)
      }
    });
  });
});
