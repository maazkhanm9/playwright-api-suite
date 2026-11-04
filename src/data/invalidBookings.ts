import { buildBooking, buildBookingWithout } from './bookingFactory';

// Every payload here is invalid, so a correct API must answer 400 Bad Request.
// booking-validation.spec.ts loops over this list and makes one test per row.
// One row for each kind of bad input the assignment lists.
//   name     = goes into the test name
//   payload  = what we send
//   bug      = matching entry in BUGS.md
//   priority = report tag
export const invalidBookings = [
  // Negative or zero prices (the production incident).
  { name: 'negative total price', payload: buildBooking({ totalprice: -100 }), bug: 'BUG-001', priority: '@critical' },
  { name: 'zero total price', payload: buildBooking({ totalprice: 0 }), bug: 'BUG-001', priority: '@high' },

  // Check-out before check-in (the production incident).
  {
    name: 'check-out before check-in',
    payload: buildBooking({ bookingdates: { checkin: '2030-01-15', checkout: '2030-01-10' } }),
    bug: 'BUG-002',
    priority: '@critical',
  },

  // Malformed dates.
  {
    name: 'malformed check-in date',
    payload: buildBooking({ bookingdates: { checkin: 'not-a-date', checkout: '2030-01-15' } }),
    bug: 'BUG-003',
    priority: '@high',
  },

  // Wrong data types.
  { name: 'total price as text', payload: { ...buildBooking(), totalprice: 'abc' }, bug: 'BUG-004', priority: '@high' },

  // Missing required fields.
  { name: 'missing first name', payload: buildBookingWithout('firstname'), bug: 'BUG-005', priority: '@medium' },

  // Empty payload.
  { name: 'empty payload', payload: {}, bug: 'BUG-005', priority: '@medium' },
];
