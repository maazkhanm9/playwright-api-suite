import { APIRequestContext, APIResponse, test } from '@playwright/test';
import { Headers } from '../helpers/authHeaders';

// The optional extras a request can have.
interface RequestOptions {
  data?: unknown; // JSON body
  params?: Record<string, string>; // query string, e.g. ?firstname=Jim
  headers?: Headers; // e.g. login headers
}

// Parent class for AuthClient and BookingClient.
// Every request goes through send(), which also saves the request and the
// response into the HTML report. So when a test fails, the report shows
// exactly what was sent and what came back.
export class BaseClient {
  protected request: APIRequestContext;

  constructor(request: APIRequestContext) {
    this.request = request;
  }

  protected async send(method: string, url: string, options: RequestOptions = {}): Promise<APIResponse> {
    // 1. Send the HTTP request.
    const response = await this.request.fetch(url, {
      method: method,
      data: options.data,
      params: options.params,
      headers: options.headers,
    });

    // 2. Write the request and response as readable text.
    const details = [
      `REQUEST:  ${method} ${response.url()}`,
      `Headers:  ${JSON.stringify(options.headers ?? {})}`,
      `Body:     ${JSON.stringify(options.data ?? null, null, 2)}`,
      '',
      `RESPONSE: ${response.status()} ${response.statusText()}`,
      `Body:     ${await response.text()}`,
    ].join('\n');

    // 3. Attach that text to the current test in the HTML report.
    await test.info().attach(`${method} ${url} → ${response.status()}`, {
      body: details,
      contentType: 'text/plain',
    });

    // 4. Give the response back to the test so it can check it.
    return response;
  }
}
