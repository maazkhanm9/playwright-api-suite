import { test, expect } from '../src/fixtures/fixtures';
import { invalidBookings } from '../src/data/invalidBookings';

// These tests expect what a CORRECT API should do (400 for bad input).
// Restful-booker is buggy, so they fail on purpose. [BUG-00X] points to BUGS.md.

test.describe('Create booking: bad input @validation', () => {
  // One test for each row in invalidBookings.ts.
  for (const { name, payload, bug, priority } of invalidBookings) {
    test(`rejects ${name} with 400 [${bug}] ${priority}`, async ({ createBooking }) => {
      const response = await createBooking(payload);

      expect(response.status()).toBe(400);
    });
  }
});
