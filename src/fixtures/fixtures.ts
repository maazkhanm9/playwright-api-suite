import { APIResponse, test as base, expect } from '@playwright/test';
import { AuthClient } from '../api/AuthClient';
import { BookingClient } from '../api/BookingClient';
import { env } from '../config/env';
import { buildBooking } from '../data/bookingFactory';
import { basicAuthHeader, Headers, tokenHeader } from '../helpers/authHeaders';
import { Booking } from '../types/booking';

// A fixture is something a test asks for by name:
//   test('...', async ({ bookingClient, seededBooking }) => { ... })
// Playwright creates it before the test and runs its cleanup after the test.
//
// Every fixture below has the same shape:
//   1. setup code
//   2. await use(value)   <- the test runs here and receives `value`
//   3. cleanup code       <- runs after the test, even if it failed

// The name and type of each fixture.
interface Fixtures {
  authClient: AuthClient;
  bookingClient: BookingClient;
  tokenAuth: Headers;
  basicAuth: Headers;
  createBooking: (payload: unknown) => Promise<APIResponse>;
  seededBooking: { id: number; booking: Booking };
}

// Take Playwright's normal `test` and add our fixtures to it.
export const test = base.extend<Fixtures>({
  // `request` is Playwright's built-in HTTP client.
  authClient: async ({ request }, use) => {
    await use(new AuthClient(request));
  },

  bookingClient: async ({ request }, use) => {
    await use(new BookingClient(request));
  },

  // Logs in with POST /auth and gives the test a token header.
  tokenAuth: async ({ authClient }, use) => {
    const response = await authClient.createToken({ username: env.username, password: env.password });
    const body = await response.json();
    expect(body.token, 'setup failed: could not get an auth token').toBeTruthy();
    await use(tokenHeader(body.token));
  },

  // Basic-auth header with the admin username and password.
  // `{}` = this fixture doesn't need any other fixture.
  basicAuth: async ({}, use) => {
    await use(basicAuthHeader(env.username, env.password));
  },

  // Gives the test a create function that remembers every booking it made,
  // then deletes all of them after the test.
  // Negative tests use it too, because this buggy API saves some invalid bookings.
  createBooking: async ({ bookingClient, basicAuth }, use) => {
    const createdIds: number[] = [];

    async function create(payload: unknown): Promise<APIResponse> {
      const response = await bookingClient.create(payload);
      if (response.status() === 200) {
        const body = await response.json();
        createdIds.push(body.bookingid);
      }
      return response;
    }

    await use(create);

    // Cleanup. A test may have deleted its booking already, so we don't check the result.
    for (const id of createdIds) {
      await bookingClient.delete(id, basicAuth);
    }
  },

  // A fresh booking made just for this test, so no test depends on another.
  // It uses createBooking, so it is deleted automatically after the test.
  seededBooking: async ({ createBooking }, use) => {
    const booking = buildBooking();
    const response = await createBooking(booking);
    expect(response.status(), 'setup failed: could not create a booking').toBe(200);
    const body = await response.json();

    await use({ id: body.bookingid, booking: booking });
  },
});

export { expect };
