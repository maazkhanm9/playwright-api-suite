import { test, expect } from '../src/fixtures/fixtures';

// Checks the server is up. The docs say GET /ping returns 201 Created.
test('ping says the API is up @health @smoke', async ({ bookingClient }) => {
  const response = await bookingClient.ping();

  expect(response.status()).toBe(201);
});
