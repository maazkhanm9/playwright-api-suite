import { request } from '@playwright/test';
import { env } from '../config/env';

const MAX_ATTEMPTS = 10;
const WAIT_BETWEEN_ATTEMPTS_MS = 3000;

// Runs ONCE before all tests (set in playwright.config.ts).
// The free server goes to sleep when nobody uses it, and the first request
// can be very slow ("cold start"). So we keep calling /ping until it answers.
export default async function globalSetup(): Promise<void> {
  const api = await request.newContext({ baseURL: env.baseUrl });

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const response = await api.get('/ping', { timeout: 30000 });
      if (response.ok()) {
        console.log(`API is up (attempt ${attempt}/${MAX_ATTEMPTS})`);
        return;
      }
    } catch {
      // Server not reachable yet. Wait and try again.
    }

    console.log(`API not ready, retrying (attempt ${attempt}/${MAX_ATTEMPTS})...`);
    await new Promise((resolve) => setTimeout(resolve, WAIT_BETWEEN_ATTEMPTS_MS));
  }

  // Stop the whole run with one clear message instead of many confusing failures.
  throw new Error(`API at ${env.baseUrl} did not respond after ${MAX_ATTEMPTS} attempts`);
}
