import { APIResponse } from '@playwright/test';
import { BaseClient } from './BaseClient';
import { Headers, noAuth } from '../helpers/authHeaders';

// Client for the booking endpoints. One method per endpoint.
// Each method returns the raw response; the test decides what to check.
// Bodies are `unknown` so negative tests can send broken data on purpose.
export class BookingClient extends BaseClient {
  // GET /ping - health check
  async ping(): Promise<APIResponse> {
    return this.send('GET', '/ping');
  }

  // GET /booking?firstname=...&lastname=... - list booking ids
  async list(filters: Record<string, string> = {}): Promise<APIResponse> {
    return this.send('GET', '/booking', { params: filters });
  }

  // GET /booking/{id} - one booking
  async get(id: number): Promise<APIResponse> {
    return this.send('GET', `/booking/${id}`);
  }

  // POST /booking - create a booking (no login needed)
  async create(booking: unknown): Promise<APIResponse> {
    return this.send('POST', '/booking', { data: booking });
  }

  // PUT /booking/{id} - replace the whole booking (login needed)
  async update(id: number, booking: unknown, headers: Headers = noAuth): Promise<APIResponse> {
    return this.send('PUT', `/booking/${id}`, { data: booking, headers: headers });
  }

  // PATCH /booking/{id} - change some fields (login needed)
  async patch(id: number, changes: unknown, headers: Headers = noAuth): Promise<APIResponse> {
    return this.send('PATCH', `/booking/${id}`, { data: changes, headers: headers });
  }

  // DELETE /booking/{id} - cancel a booking (login needed)
  async delete(id: number, headers: Headers = noAuth): Promise<APIResponse> {
    return this.send('DELETE', `/booking/${id}`, { headers: headers });
  }
}
