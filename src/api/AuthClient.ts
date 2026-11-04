import { APIResponse } from '@playwright/test';
import { BaseClient } from './BaseClient';

// Client for the login endpoint: POST /auth.
// `extends BaseClient` = it gets send() from the parent class.
export class AuthClient extends BaseClient {
  async createToken(credentials: { username?: string; password?: string }): Promise<APIResponse> {
    return this.send('POST', '/auth', { data: credentials });
  }
}
