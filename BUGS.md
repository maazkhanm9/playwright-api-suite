# Bug Report: Restful-booker Bookings API

Found while building the automated suite. Each bug has a runnable `curl`, the expected vs actual behaviour, and the test that catches it. In the HTML report, each failing test has its bug ID in its name (for example `[BUG-001]`).

**Environment:** `https://restful-booker.herokuapp.com`, verified 4 Nov 2026.

| ID | Title | Severity |
|---|---|---|
| [BUG-001](#bug-001) | Bookings accepted with a negative or zero total price | Critical |
| [BUG-002](#bug-002) | Bookings accepted with check-out before check-in | Critical |
| [BUG-003](#bug-003) | Malformed dates are saved as `0NaN-aN-aN` | High |
| [BUG-004](#bug-004) | Wrong data type for price is saved as `null` | High |
| [BUG-005](#bug-005) | Missing fields or empty body return 500 instead of 400 | Medium |
| [BUG-006](#bug-006) | Failed login returns 200 OK | Medium |
| [BUG-007](#bug-007) | DELETE on a non-existent booking returns 405 instead of 404 | Low |

**Severity scale:** *Critical*: impossible bookings or wrong money reach customers. *High*: booking data is silently corrupted. *Medium*: partners get a misleading response and can't tell what went wrong. *Low*: wrong status code, no data impact.

---

## BUG-001

### Bookings accepted with a negative or zero total price

**Severity: Critical.** This is the production incident: a partner can create a booking that pays out money or costs nothing.

**Steps to reproduce**

```bash
curl -i -X POST https://restful-booker.herokuapp.com/booking \
  -H 'Content-Type: application/json' -H 'Accept: application/json' \
  -d '{"firstname":"Jim","lastname":"Brown","totalprice":-100,"depositpaid":true,
       "bookingdates":{"checkin":"2030-01-10","checkout":"2030-01-15"}}'
```

The same happens with `"totalprice": 0`.

**Expected:** `400 Bad Request`; no booking is created.
**Actual:** `200 OK`; the booking is saved with `"totalprice": -100` (or `0`).

**Caught by:** `booking-validation.spec.ts`: *rejects negative total price*, *rejects zero total price*.

---

## BUG-002

### Bookings accepted with check-out before check-in

**Severity: Critical.** This is the other half of the production incident: a stay that cannot exist is confirmed to the guest and the property.

**Steps to reproduce**

```bash
curl -i -X POST https://restful-booker.herokuapp.com/booking \
  -H 'Content-Type: application/json' -H 'Accept: application/json' \
  -d '{"firstname":"Jim","lastname":"Brown","totalprice":100,"depositpaid":true,
       "bookingdates":{"checkin":"2030-01-15","checkout":"2030-01-10"}}'
```

**Expected:** `400 Bad Request`.
**Actual:** `200 OK`; the booking is saved with check-out 5 days before check-in.

**Caught by:** `booking-validation.spec.ts`: *rejects check-out before check-in*.

---

## BUG-003

### Malformed dates are saved as `0NaN-aN-aN`

**Severity: High.** The partner gets a success response, but the stored dates are unusable, so the property has no idea when the guest arrives.

**Steps to reproduce**

```bash
curl -i -X POST https://restful-booker.herokuapp.com/booking \
  -H 'Content-Type: application/json' -H 'Accept: application/json' \
  -d '{"firstname":"Jim","lastname":"Brown","totalprice":100,"depositpaid":true,
       "bookingdates":{"checkin":"not-a-date","checkout":"2030-01-15"}}'
```

**Expected:** `400 Bad Request`.
**Actual:** `200 OK`; the booking is saved with `"checkin": "0NaN-aN-aN"`.

**Caught by:** `booking-validation.spec.ts`: *rejects malformed check-in date*.

---

## BUG-004

### Wrong data type for price is saved as `null`

**Severity: High.** A client bug on the partner side silently becomes a booking with no price, instead of an error they can fix.

**Steps to reproduce**

```bash
curl -i -X POST https://restful-booker.herokuapp.com/booking \
  -H 'Content-Type: application/json' -H 'Accept: application/json' \
  -d '{"firstname":"Jim","lastname":"Brown","totalprice":"abc","depositpaid":true,
       "bookingdates":{"checkin":"2030-01-10","checkout":"2030-01-15"}}'
```

**Expected:** `400 Bad Request`.
**Actual:** `200 OK`; the booking is saved with `"totalprice": null`.

**Caught by:** `booking-validation.spec.ts`: *rejects total price as text*.

---

## BUG-005

### Missing fields or empty body return 500 instead of 400

**Severity: Medium.** No bad data is saved, but a 500 tells the partner that *our* server broke, not that their request was wrong. It also gives no hint which field to fix, so it creates support tickets.

**Steps to reproduce**

```bash
# Missing firstname
curl -i -X POST https://restful-booker.herokuapp.com/booking \
  -H 'Content-Type: application/json' -H 'Accept: application/json' \
  -d '{"lastname":"Brown","totalprice":100,"depositpaid":true,
       "bookingdates":{"checkin":"2030-01-10","checkout":"2030-01-15"}}'

# Empty body
curl -i -X POST https://restful-booker.herokuapp.com/booking \
  -H 'Content-Type: application/json' -H 'Accept: application/json' -d '{}'
```

**Expected:** `400 Bad Request` with a message naming the missing field.
**Actual:** `500 Internal Server Error` with body `Internal Server Error`.

**Caught by:** `booking-validation.spec.ts`: *rejects missing first name*, *rejects empty payload*.

---

## BUG-006

### Failed login returns 200 OK

**Severity: Medium.** Clients that check the status code will treat a failed login as a success and then fail later on the write call, which is harder to debug. No access is granted, so this is not a security hole.

**Steps to reproduce**

```bash
curl -i -X POST https://restful-booker.herokuapp.com/auth \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"wrong-password"}'
```

**Expected:** `401 Unauthorized`.
**Actual:** `200 OK` with body `{"reason":"Bad credentials"}`.

**Caught by:** `auth.spec.ts`: *wrong password is rejected with 401*.

---

## BUG-007

### DELETE on a non-existent booking returns 405 instead of 404

**Severity: Low.** No data impact, but `405 Method Not Allowed` tells the partner the endpoint doesn't support DELETE, when the real problem is that the booking doesn't exist (for example, it was already cancelled).

**Steps to reproduce**

```bash
curl -i -X DELETE https://restful-booker.herokuapp.com/booking/999999999 -u admin:password123
```

**Expected:** `404 Not Found`, consistent with `GET /booking/999999999`, which correctly returns 404.
**Actual:** `405 Method Not Allowed`.

**Caught by:** `booking-crud.spec.ts`: *DELETE on an unknown id returns 404*.
