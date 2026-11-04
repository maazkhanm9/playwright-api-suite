// JSON Schemas describe the full shape a response must have:
//   required             = these fields must be present
//   type                 = string / number / boolean / object / array
//   additionalProperties = false means no unknown extra fields allowed

// A date must look like 2030-01-15 (4 digits - 2 digits - 2 digits).
// So a broken date like "0NaN-aN-aN" fails the check.
const isoDate = { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' };

// GET /booking/{id}, PUT and PATCH return this.
export const bookingSchema = {
  type: 'object',
  required: ['firstname', 'lastname', 'totalprice', 'depositpaid', 'bookingdates'],
  additionalProperties: false,
  properties: {
    firstname: { type: 'string', minLength: 1 },
    lastname: { type: 'string', minLength: 1 },
    totalprice: { type: 'number' },
    depositpaid: { type: 'boolean' },
    bookingdates: {
      type: 'object',
      required: ['checkin', 'checkout'],
      additionalProperties: false,
      properties: { checkin: isoDate, checkout: isoDate },
    },
    additionalneeds: { type: 'string' },
  },
};

// POST /booking returns { bookingid, booking }.
export const createdBookingSchema = {
  type: 'object',
  required: ['bookingid', 'booking'],
  additionalProperties: false,
  properties: {
    bookingid: { type: 'integer', minimum: 1 },
    booking: bookingSchema,
  },
};

// GET /booking returns a list like [{ bookingid: 1 }, { bookingid: 2 }].
export const bookingIdListSchema = {
  type: 'array',
  items: {
    type: 'object',
    required: ['bookingid'],
    additionalProperties: false,
    properties: { bookingid: { type: 'integer', minimum: 1 } },
  },
};

// POST /auth returns { token: "abc123" }.
export const tokenSchema = {
  type: 'object',
  required: ['token'],
  additionalProperties: false,
  properties: { token: { type: 'string', minLength: 1 } },
};
