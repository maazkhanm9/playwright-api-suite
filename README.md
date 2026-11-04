# Reservation Hub: Bookings API Test Suite

Automated regression suite for the Restful-booker Bookings API, built with **Playwright Test + TypeScript**.

**Latest run: 22 tests, 13 passed, 9 failed.** All 9 failures are real API defects, documented in [BUGS.md](BUGS.md). That includes the production incident: the API accepts a negative price and a check-out date before check-in.

## Run it

Requires Node.js 18+.

```bash
npm install
npx playwright test                         # whole suite
npx playwright test --grep @critical        # critical-risk tests only
npx playwright show-report reports/html     # open the report
```

Settings live in `src/config/env.ts` and can be overridden with environment variables (`BASE_URL`, `API_USERNAME`, `API_PASSWORD`).

## Report

The HTML report from the latest run is committed at [`reports/html/index.html`](reports/html/index.html). Open it in a browser, no install needed. It shows:

- **Overall and per-test results.**
- **The full request and response for every API call**, attached to each test. A failure can be diagnosed without re-running anything.
- **Tags to filter by feature** (`@auth`, `@create`, `@read`, `@update`, `@delete`, `@validation`) **or by risk** (`@critical`, `@high`, `@medium`, `@low`).
- **The bug ID in the test name** (for example `[BUG-001]`) on every test that fails because of a known defect.

## Project layout

```
src/config/      base URL and credentials
src/api/         one client per resource; BaseClient sends requests and attaches them to the report
src/data/        test data: a booking factory plus lists of invalid inputs
src/schemas/     JSON Schemas for the response contract (validated with ajv)
src/fixtures/    Playwright fixtures: clients, auth headers, self-cleaning test bookings
src/setup/       global warm-up for cold starts
tests/           test cases only, no request or data logic
```

## Test strategy

The scope follows Part A of the assignment: one focused test for each item it lists, prioritised by risk. The incident in the brief came from missing input validation, so those cases are tagged `@critical`.

| Area (from the assignment) | Tests |
|---|---|
| **Core journey** (create → read → update → cancel) | 1 end-to-end test, ending with a check that the booking is gone. |
| **Happy-path CRUD** | Create, read by id, filter by name, PUT, PATCH, DELETE (6). Checks full response bodies and schemas, not just the status. After PUT and PATCH, the booking is **read back** to prove the change was saved. |
| **Health** | `GET /ping` (1). |
| **Authentication** | Token retrieval, wrong password, and write calls with missing or invalid auth (5). PUT, PATCH and DELETE each get a different bad login (none, a fake token, a wrong password). Each must be refused **and the booking must be unchanged**. |
| **Negative & boundary** | One case for each kind of bad input the assignment lists (7), data-driven from `src/data/invalidBookings.ts`: negative price, zero price, check-out before check-in, malformed date, wrong data type, missing required field, empty payload. Plus non-existent ids on GET and DELETE (2). |
| **Response contract** | JSON Schema checks on the token, booking, created-booking and id-list responses, including a strict `YYYY-MM-DD` date pattern. |

Tests assert what a **correct** API should do (for example 400 for bad input), as the brief asks. That's why the defect tests fail.

**Deliberately left out:**
- **More variations of the same input error** (e.g. every missing field, every wrong type): one case per kind proves the validation gap; more would add volume, not information. New cases are one row in `invalidBookings.ts`.
- **Invalid input on PUT/PATCH:** the brief's incident was on create; update validation is the next thing I'd add.
- **XML and URL-encoded payloads:** partners integrate with JSON.
- **Date-range filters on `GET /booking`:** lower risk than create and update; the name filter is covered.
- **Load testing:** out of scope for a regression suite.
- **Rate limiting and security scanning:** these need tools and permissions beyond a shared sandbox.

## Shared environment and flakiness

- **Every test creates its own data.** The instance resets every ~10 minutes and is shared, so no test reads seed data or relies on another test. Tests run fully in parallel and in any order.
- **Automatic cleanup.** Bookings are created through a fixture that deletes them after the test, even if it fails. Negative tests use it too, because this API wrongly saves some invalid bookings.
- **Unique names** (`QA<timestamp><random>`) let the filter test expect exactly one result on a shared instance.
- **Cold start.** `src/setup/global-setup.ts` pings `/ping` up to 10 times before the run. If the API never wakes up, the run stops with one clear error instead of a timeout in every test.
- **Retries: 1** absorbs network blips. A test that only passes on retry is marked *flaky* in the report rather than hidden.

## Known limitations

- **The 9 defect tests fail on every run until the API is fixed.** I kept them red so the defects are visible in the report. In a real CI pipeline I'd mark them with `test.fail()` so the build stays green and goes red when a bug is fixed. The retry also runs these deterministic failures twice.
- **Refused writes accept either 401 or 403**, because the docs don't specify which. The stronger check is that the data didn't change.
- **The suite depends on a free shared instance.** Warm-up and retries reduce flakiness but can't remove it, and someone else could in theory change a test's booking mid-test.
- **Not covered: the `checkin`/`checkout` query filters and concurrency.** These are the next tests I'd add.
