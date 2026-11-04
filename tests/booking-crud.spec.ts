import { test, expect } from '../src/fixtures/fixtures';
import { buildBooking, NON_EXISTENT_ID } from '../src/data/bookingFactory';
import { expectToMatchSchema } from '../src/helpers/schema';
import { bookingIdListSchema, bookingSchema, createdBookingSchema } from '../src/schemas/schemas';

test.describe('Booking journey @journey', () => {
  test('create → read → update → cancel @critical @smoke', async ({ bookingClient, createBooking, tokenAuth }) => {
    const original = buildBooking();
    const updated = buildBooking({ lastname: 'Updated', totalprice: 320 });
    let id = 0;

    await test.step('create the booking', async () => {
      const response = await createBooking(original);
      expect(response.status()).toBe(200);
      id = (await response.json()).bookingid;
    });

    await test.step('read it back', async () => {
      const response = await bookingClient.get(id);
      expect(response.status()).toBe(200);
      expect(await response.json()).toEqual(original);
    });

    await test.step('update it', async () => {
      const response = await bookingClient.update(id, updated, tokenAuth);
      expect(response.status()).toBe(200);
      expect(await response.json()).toEqual(updated);
    });

    await test.step('cancel it', async () => {
      const response = await bookingClient.delete(id, tokenAuth);
      expect(response.status()).toBe(201);
    });

    await test.step('check it is gone', async () => {
      const response = await bookingClient.get(id);
      expect(response.status()).toBe(404);
    });
  });
});

test.describe('Create booking @create', () => {
  test('returns the new id and the booking @critical', async ({ createBooking }) => {
    const booking = buildBooking();

    const response = await createBooking(booking);

    expect(response.status()).toBe(200);
    const body = await response.json();
    expectToMatchSchema(body, createdBookingSchema, 'created booking');
    expect(body.booking).toEqual(booking);
  });
});

test.describe('Read booking @read', () => {
  test('returns the booking by id @critical', async ({ bookingClient, seededBooking }) => {
    const response = await bookingClient.get(seededBooking.id);

    expect(response.status()).toBe(200);
    const body = await response.json();
    expectToMatchSchema(body, bookingSchema, 'booking');
    expect(body).toEqual(seededBooking.booking);
  });

  test('filter by name finds the booking @high', async ({ bookingClient, seededBooking }) => {
    const { firstname, lastname } = seededBooking.booking;

    const response = await bookingClient.list({ firstname, lastname });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expectToMatchSchema(body, bookingIdListSchema, 'booking id list');
    // The first name is unique, so there should be exactly one match.
    expect(body).toEqual([{ bookingid: seededBooking.id }]);
  });

  test('unknown id returns 404 @medium', async ({ bookingClient }) => {
    const response = await bookingClient.get(NON_EXISTENT_ID);

    expect(response.status()).toBe(404);
  });
});

test.describe('Update booking @update', () => {
  test('PUT replaces the whole booking @critical', async ({ bookingClient, seededBooking, tokenAuth }) => {
    const newBooking = buildBooking({
      lastname: 'Replaced',
      totalprice: 480,
      depositpaid: false,
      bookingdates: { checkin: '2031-03-01', checkout: '2031-03-04' },
      additionalneeds: 'Late check-out',
    });

    const response = await bookingClient.update(seededBooking.id, newBooking, tokenAuth);

    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual(newBooking);
    // Read it again to prove the change was saved, not just echoed back.
    const saved = await bookingClient.get(seededBooking.id);
    expect(await saved.json()).toEqual(newBooking);
  });

  test('PATCH changes only the fields sent @high', async ({ bookingClient, seededBooking, basicAuth }) => {
    const changes = { firstname: 'Patched', totalprice: 275 };

    const response = await bookingClient.patch(seededBooking.id, changes, basicAuth);

    expect(response.status()).toBe(200);
    const expected = { ...seededBooking.booking, ...changes };
    expect(await response.json()).toEqual(expected);
    const saved = await bookingClient.get(seededBooking.id);
    expect(await saved.json()).toEqual(expected);
  });
});

test.describe('Cancel booking @delete', () => {
  test('DELETE removes the booking @critical', async ({ bookingClient, seededBooking, basicAuth }) => {
    const response = await bookingClient.delete(seededBooking.id, basicAuth);

    // The docs say DELETE returns 201 Created.
    expect(response.status()).toBe(201);
    const after = await bookingClient.get(seededBooking.id);
    expect(after.status()).toBe(404);
  });

  test('DELETE on an unknown id returns 404 [BUG-007] @low', async ({ bookingClient, tokenAuth }) => {
    const response = await bookingClient.delete(NON_EXISTENT_ID, tokenAuth);

    expect(response.status()).toBe(404);
  });
});
