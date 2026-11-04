# Reservation Hub - Bookings API Test Suite

Regression tests for the Restful-booker Bookings API, written with Playwright Test and TypeScript. Covers booking CRUD, auth, invalid-input handling, and response contracts, and spits out an HTML report with request/response evidence attached to any failures.

## 1. Before you start

You'll need:

- Node.js 18+ (npm comes with it)
- Git, to pull the repo down
Check Node.js and nom availability 
node --version
npm --version


This suite only hits the API, so you don't need a browser installed - Playwright's API request context handles everything over HTTP. If UI tests get added down the line, run `npx playwright install` then.

## 2. Setup the playwright project
npm init playwright@latest
npm install
```

`npm install` pulls in Playwright Test, TypeScript, and AJV (used for JSON Schema validation on the responses) - whatever versions are pinned in package.json.

## 3. Pointing it at the API

By default this runs against the public Restful-booker sandbox:

- Base URL: `https://restful-booker.herokuapp.com`
- Docs: `https://restful-booker.herokuapp.com/apidoc/index.html`
- Sandbox login: `admin` / `password123`

These live in `src/config/env.ts`, but you can override them with env vars if you need to point somewhere else:

- `BASE_URL`
- `API_USERNAME`
- `API_PASSWORD`

## 4. Running things Set up the full project in the following setup 
src/
  config/       Base URL and credentials
  api/          Resource clients and shared request handling
  data/         Booking factory and invalid-input data
  schemas/      JSON Schemas used by AJV
  fixtures/     API clients, authentication, booking setup and cleanup
  setup/        Global API warm-up for cold starts

tests/          Test scenarios and assertions
reports/html/   Generated HTML test report
BUGS.md         Reproducible defects found during testing
README.md       This file                 




### 5. Test Scope and Strategy

The test suite consists of 22 test cases, covering the following areas:

\- Core Booking Journey: Create, retrieve, update, and cancel bookings. Verify that cancelled bookings are no longer accessible.

\- Happy-Path CRUD Operations: Validate booking creation, retrieval by ID, name-based filtering, full update (PUT), partial update (PATCH), and deletion. Verify data persistence after updates.

\- Health Check: Verify API availability and service response using `GET /ping`.

\- Authentication: Validate token generation, invalid credentials, and write operations with missing or invalid authentication. Ensure unauthorised requests do not modify existing booking data.

\- Negative and Boundary Testing: Validate negative and zero prices, checkout dates before check-in, malformed dates, incorrect data types, missing required fields, empty payloads, and non-existent booking IDs.

\- Response Contract Validation: Validate API responses against JSON Schemas for token, booking, created-booking, and booking-ID-list endpoints. Verify date formatting against the `YYYY-MM-DD` standard.

Full suite: Running 

npx playwright test
```

Just the critical stuff:
npx playwright test --grep "@critical"
```

By feature:

npx playwright test --grep "@auth"
npx playwright test --grep "@create"
npx playwright test --grep "@read"
npx playwright test --grep "@update"
npx playwright test --grep "@delete"
npx playwright test --grep "@validation"
```

Other commands that come in handy:

```bash
npx playwright test --list                 # see what would run, without running it
npx playwright test --workers=1             # single worker
npx playwright test --debug                  # step through a test
npx playwright show-report reports/html     # open the HTML report
```

Tests run in parallel with one retry by default. If you're chasing something that might be a concurrency issue on the shared sandbox, drop to `--workers=1` first.

## 6. What's actually covered

22 tests, aimed at the risk areas called out in the assignment:

|

## 7. Dealing with a flaky shared sandbox

Restful-booker is a free, shared instance - it's slow to wake up and resets roughly every 10 minutes. To keep tests from stepping on each other or on stale data:

- Every test creates its own booking data rather than relying on anything left over from another test.
- Booking names are unique so the name-filter test can reliably find its own record.
- Fixtures clean up whatever bookings they created, including in negative tests where the API wrongly saved something it shouldn't have.
- A global setup step pings `/ping` and retries up to 10 times before the suite actually starts, to ride out cold starts.
- Tests are safe to run in parallel or in any order, and one retry is configured to absorb the occasional network hiccup. If something only passes on the retry, it gets flagged as flaky in the report.

None of this fully eliminates flakiness from a free public service being used by other people too, but it cuts it down a lot.

## 7. Reports and known bugs

```bash
npx playwright show-report reports/html
```

opens the HTML report at `reports/html/index.html`, with pass/fail breakdowns, tags, and the request/response payloads attached to failures - enough to diagnose most issues without re-running anything.

Known defects show up right in the failing test names (e.g. `[BUG-001]`) and are written up in `BUGS.md` with repro steps and expected vs. actual behavior.

**Latest run:** 22 tests, 13 passed, 9 failed. All nine failures are logged defects in `BUGS.md` - among them, the API accepting a negative booking price and a checkout date before check-in. Numbers will shift if the shared API changes or the bugs get fixed upstream.


### 8. Endpoints Covered

- GET `/ping` – Verify API health and availability.
- GET `/booking` – Retrieve booking IDs with supported filters.
- GET `/booking/{id}` – Retrieve booking details using the booking ID.
- POST `/booking` – Create a new booking.
- PUT `/booking/{id}` – Perform a full booking update (authentication required).
- PATCH `/booking/{id}` – Perform a partial booking update (authentication required).
- DELETE `/booking/{id}` – Delete or cancel an existing booking (authentication required).
- POST `/auth` – Generate an authentication token for authorised operations.
