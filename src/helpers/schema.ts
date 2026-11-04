import Ajv from 'ajv';
import { expect } from '@playwright/test';

// ajv is a library that checks JSON against a JSON Schema.
// allErrors: true = report every problem, not just the first one.
const ajv = new Ajv({ allErrors: true });

// Checks that `data` has exactly the shape described by `schema`.
// If not, the test fails and the message lists every problem found.
export function expectToMatchSchema(data: unknown, schema: object, name: string): void {
  const validate = ajv.compile(schema);
  const isValid = validate(data);

  expect(isValid, `${name} does not match the schema: ${ajv.errorsText(validate.errors)}`).toBe(true);
}
