export const config = {
  baseUrl: process.env.BASE_URL ?? 'http://localhost:5173',
  apiUrl: process.env.API_URL ?? 'http://localhost:5000/api',
  databaseUrl: process.env.DATABASE_URL ?? 'postgresql://postgres:password@localhost:5432/ecom_db',
  headless: process.env.HEADED !== '1',
  chromiumPath: process.env.PW_CHROMIUM_PATH, // optional: use an installed Chromium instead of Playwright's own
  password: 'TestPass123!',
};
