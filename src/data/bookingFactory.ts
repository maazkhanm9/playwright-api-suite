import { Booking } from '../types/booking';

// A booking id that will never exist. Used to test 404 responses.
export const NON_EXISTENT_ID = 999999999;

// Makes a name like "QA1730650000123456" that no other test will have.
// Date.now() = current time in milliseconds, plus a random number in case
// two tests run in the same millisecond.
function uniqueName(): string {
  return 'QA' + Date.now() + Math.floor(Math.random() * 1000);
}

// Returns a valid booking. A test can change any field it wants:
//   buildBooking()                       -> normal valid booking
//   buildBooking({ totalprice: -100 })   -> same booking, negative price
export function buildBooking(changes: Partial<Booking> = {}): Booking {
  const booking: Booking = {
    firstname: uniqueName(),
    lastname: 'Tester',
    totalprice: 150,
    depositpaid: true,
    bookingdates: {
      checkin: '2030-01-10',
      checkout: '2030-01-15',
    },
    additionalneeds: 'Breakfast',
  };

  // Copy the test's changes on top of the default booking.
  return { ...booking, ...changes };
}

// Returns a valid booking with one field removed, for "missing field" tests:
//   buildBookingWithout('firstname')   -> booking with no firstname
export function buildBookingWithout(field: keyof Booking): Partial<Booking> {
  const booking: Partial<Booking> = buildBooking();
  delete booking[field];
  return booking;
}
