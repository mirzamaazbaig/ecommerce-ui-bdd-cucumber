# E-Commerce UI Acceptance Tests: Cucumber, Playwright, TypeScript

[![Acceptance tests](https://github.com/mirzamaazbaig/ecommerce-ui-bdd-cucumber/actions/workflows/acceptance-tests.yml/badge.svg)](https://github.com/mirzamaazbaig/ecommerce-ui-bdd-cucumber/actions/workflows/acceptance-tests.yml)

Behaviour-driven acceptance tests for the web UI of a React, Express and PostgreSQL online shop ([application under test](https://github.com/mirzamaazbaig/ecommerce-test-automation)). Requirements are written as Gherkin scenarios that a product owner can read; step definitions drive a real browser with Playwright.

16 scenarios, 97 steps, running in parallel.

## What it shows

- **Readable specifications:** `features/*.feature` covers accounts, browsing and the cart and checkout flow, using Background, Scenario Outline with example tables, and `@smoke` tags.
- **Thin steps, reusable helpers:** step definitions only translate Gherkin to actions; locators live in `features/support/pages.ts`; data setup lives in `features/support/api.ts`.
- **Test data through the API, not the UI:** customers and products are created with API and SQL calls, and each scenario creates its own products with a unique suffix, so scenarios run in parallel without clashing. Products are removed afterwards.
- **Web-first assertions, no sleeps:** Playwright's auto-waiting and `expect.poll` for values that settle asynchronously (sorted lists, stock after checkout).
- **Evidence on failure:** a full-page screenshot is attached to the HTML report for every failed scenario.
- **CI:** GitHub Actions starts PostgreSQL, the API and the web client, runs the suite and uploads the report.

## Run it

```bash
# start the application (API on :5000, web client on :5173); see the application's README
npm ci
npx playwright install chromium        # or set PW_CHROMIUM_PATH to an installed Chromium
npm test                               # all scenarios
npm run test:smoke                     # @smoke only
```

Settings (all optional): `BASE_URL`, `API_URL`, `DATABASE_URL` (used to promote the setup admin and remove test products), `HEADED=1`, `PW_CHROMIUM_PATH`. Reports: `reports/cucumber-report.html` and `reports/junit.xml`.

## Verification

- All 16 scenarios pass in three consecutive runs, each from a freshly seeded database.
- With the login error message changed in the application, exactly the two "wrong credentials" scenarios fail.
- First runs found a real test-design bug, not an application bug: two parallel scenarios created products with the same name, so a search matched both. Fixed with per-scenario unique names.

## Note

The shop's UI offers only "Low to High" price sorting, so the sorting scenario covers ascending order only.
