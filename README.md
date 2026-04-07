# Kayak Flight Search — E2E Test Suite

Automated end-to-end tests for [kayak.com.co](https://www.kayak.com.co) using **Playwright**, **Cucumber.js**, and **TypeScript**.

## Tech Stack

| Tool | Purpose |
|------|---------|
| [Playwright](https://playwright.dev) | Browser automation |
| [Cucumber.js](https://cucumber.io) | BDD test runner (Gherkin scenarios) |
| TypeScript | Type-safe step definitions and page objects |
| [tsx](https://github.com/privatenumber/tsx) | Zero-config TypeScript execution |

## Project Structure

```
src/
  features/              # Gherkin feature files
    flights-search.feature
  step-definitions/      # Cucumber step implementations
    flights-search.steps.ts
  pages/                 # Page Object Model
    base.page.ts           # Abstract base class
    search-form.page.ts    # Kayak home — search form interactions
    results-list.page.ts   # Search results — filters and selection
    booking-details.page.ts # Flight details — assertions
  support/
    world.ts             # Custom World with Playwright browser lifecycle
    hooks.ts             # Before/After hooks, screenshot on failure
    test-data.ts         # Centralized test data and date utilities
```

## Setup

```bash
# Install dependencies
npm install

# Install Chromium browser
npx playwright install chromium
```

## Running Tests

```bash
# Headless (default)
npm test

# Headed (visible browser)
npm run test:headed

# Debug mode (Playwright inspector)
npm run test:debug

# Dry run (verify step wiring without browser)
npm run test:dry
```

## Test Scenarios

### 1. Search, select and verify the best round-trip flight
Full E2E flow across 3 pages:
- **Page 1**: Fill search form (origin, destination, dates, passengers, cabin class)
- **Page 2**: Filter by cheapest, filter by stops, select first result
- **Page 3**: Assert route, airport codes, dates, price, tariff class, luggage inclusions, and booking providers

### 2. Verify search form elements are present
Smoke test that validates all critical form elements are visible on page load.

### 3. Search with same origin and destination (edge case)
Verifies that searching with identical origin and destination does not produce a valid flight search.

## Test Data

Test data is centralized in `src/support/test-data.ts`:
- **Dates are dynamic** — computed relative to today (56/70 days ahead), so tests never break due to past dates
- **Cities and airports** are defined in the Scenario Outline Examples table
- Add new rows to the Examples table to test additional routes

## Key Design Decisions

- **Route interception**: Kayak front-door ads redirect to airline sites — blocked via `page.route()` to keep tests on Kayak
- **Calendar navigation**: Calculates exact month clicks needed instead of blind scrolling
- **Trip type handling**: Kayak renders trip type as combobox or radio buttons depending on page state — both patterns handled
- **Date aria-labels**: Calendar dates include pricing text — matched via regex prefix
- **Fallback locators**: Result cards use obfuscated CSS classes — primary accessible locator with documented fallback

## CI/CD

GitHub Actions workflow included (`.github/workflows/e2e-tests.yml`):
- Runs on push/PR to main
- Uploads test reports and failure screenshots as artifacts

## Reports

After each run, reports are generated in `reports/`:
- `cucumber-report.html` — HTML report
- `cucumber-report.json` — JSON report (for CI integrations)
- `screenshots/` — Failure screenshots (captured automatically)
