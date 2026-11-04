// All settings in one place.
// Each one can be changed with an environment variable, e.g.
//   BASE_URL=https://my-test-server.com npx playwright test
// If the variable is not set, the default after ?? is used.
export const env = {
  baseUrl: process.env.BASE_URL ?? 'https://restful-booker.herokuapp.com',
  username: process.env.API_USERNAME ?? 'admin',
  password: process.env.API_PASSWORD ?? 'password123',
};
