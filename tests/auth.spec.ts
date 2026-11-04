import { test, expect } from '../src/fixtures/fixtures';
import { env } from '../src/config/env';
import { buildBooking } from '../src/data/bookingFactory';
import { basicAuthHeader, noAuth, tokenHeader } from '../src/helpers/authHeaders';
import { expectToMatchSchema } from '../src/helpers/schema';
import { tokenSchema } from '../src/schemas/schemas';

test.describe('Auth @auth', () => {
  test('valid login returns a token @critical', async ({ authClient }) => {
    const response = await authClient.createToken({ username: env.username, password: env.password });

    expect(response.status()).toBe(200);
    expectToMatchSchema(await response.json(), tokenSchema, 'token');
  });

  test('wrong password is rejected with 401 [BUG-006] @medium', async ({ authClient }) => {
    const response = await authClient.createToken({ username: env.username, password: 'wrong-password' });

    expect(response.status()).toBe(401);
    expect(await response.json()).not.toHaveProperty('token');
  });

  // Each write method is tried with a different kind of bad login,
  // so 3 tests cover all 3 methods and all 3 bad logins.
  // The docs don't say 401 or 403, so either counts as "refused".

  test('PUT without login is refused and the booking is unchanged @critical', async ({ bookingClient, seededBooking }) => {
    const response = await bookingClient.update(seededBooking.id, buildBooking(), noAuth);

    expect([401, 403]).toContain(response.status());
    const current = await bookingClient.get(seededBooking.id);
    expect(await current.json()).toEqual(seededBooking.booking);
  });

  test('PATCH with a fake token is refused and the booking is unchanged @critical', async ({ bookingClient, seededBooking }) => {
    const response = await bookingClient.patch(seededBooking.id, { firstname: 'Hacker' }, tokenHeader('fake-token'));

    expect([401, 403]).toContain(response.status());
    const current = await bookingClient.get(seededBooking.id);
    expect(await current.json()).toEqual(seededBooking.booking);
  });

  test('DELETE with a wrong password is refused and the booking still exists @critical', async ({ bookingClient, seededBooking }) => {
    const response = await bookingClient.delete(seededBooking.id, basicAuthHeader('admin', 'wrong-password'));

    expect([401, 403]).toContain(response.status());
    const current = await bookingClient.get(seededBooking.id);
    expect(current.status()).toBe(200);
  });
});
