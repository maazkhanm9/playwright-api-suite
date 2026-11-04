// The API has two ways to log in for PUT, PATCH and DELETE.
// Both are just HTTP headers, so these functions build those headers.

// A headers object, e.g. { Cookie: 'token=abc123' }
export type Headers = Record<string, string>;

// Way 1: a token from POST /auth, sent as a cookie.
export function tokenHeader(token: string): Headers {
  return { Cookie: `token=${token}` };
}

// Way 2: username and password, sent as HTTP Basic auth.
// Basic auth = "username:password" converted to base64.
export function basicAuthHeader(username: string, password: string): Headers {
  const encoded = Buffer.from(`${username}:${password}`).toString('base64');
  return { Authorization: `Basic ${encoded}` };
}

// No login at all. Used to prove that write calls are blocked.
export const noAuth: Headers = {};
