import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { CustomWorld } from "../support/world";
import {
  FLIGHT_SEARCH_DATA,
  formatSpanishDate,
  futureDate,
  shortMonthName,
} from "../support/test-data";

// ──────────────────────────────────────────────────
// Page 1: Search form
// ──────────────────────────────────────────────────

Given("I am on the Kayak home page", async function (this: CustomWorld) {
  await this.searchForm.navigate(this.parameters.baseUrl);
});

When(
  "I select {string} as the trip type",
  async function (this: CustomWorld, tripType: string) {
    await this.searchForm.selectTripType(tripType);
  }
);

When(
  "I set the origin to {string}",
  async function (this: CustomWorld, origin: string) {
    await this.searchForm.setOrigin(origin);
  }
);

When(
  "I set the destination to {string}",
  async function (this: CustomWorld, destination: string) {
    await this.searchForm.setDestination(destination);
  }
);

When("I select the departure date", async function (this: CustomWorld) {
  const departure = futureDate(FLIGHT_SEARCH_DATA.departureDaysFromNow);
  const dateLabel = formatSpanishDate(departure);
  await this.searchForm.selectDepartureDate(dateLabel);
});

When("I select the return date", async function (this: CustomWorld) {
  const returnDate = futureDate(FLIGHT_SEARCH_DATA.returnDaysFromNow);
  const dateLabel = formatSpanishDate(returnDate);
  await this.searchForm.selectReturnDate(dateLabel);
});

When(
  "I confirm passengers and cabin class are {int} adult in {string}",
  async function (this: CustomWorld, adults: number, cabinClass: string) {
    await this.searchForm.verifyPassengersAndClass(adults, cabinClass);
  }
);

When("I click the search button", async function (this: CustomWorld) {
  await this.searchForm.clickSearch();
});

Then(
  "I should be redirected to the search results page",
  async function (this: CustomWorld) {
    await this.resultsList.waitForResultsToLoad();
  }
);

// ──────────────────────────────────────────────────
// Page 2: Results list
// ──────────────────────────────────────────────────

When("I filter by the cheapest flights", async function (this: CustomWorld) {
  await this.resultsList.filterByCheapest();
});

When(
  "I filter by direct flights or 1 stop if unavailable",
  async function (this: CustomWorld) {
    await this.resultsList.filterByDirectOrOneStop();
  }
);

When("I select the first result", async function (this: CustomWorld) {
  await this.resultsList.selectFirstResult();
});

Then(
  "I should be redirected to the flight details page",
  async function (this: CustomWorld) {
    await this.bookingDetails.waitForPageToLoad();
  }
);

// ──────────────────────────────────────────────────
// Page 3: Booking details — Route & airports
// ──────────────────────────────────────────────────

Then(
  "the route header should show {string} to {string}",
  async function (this: CustomWorld, origin: string, destination: string) {
    // Kayak shows "De Medellín a Miami" as the route header
    await expect(this.bookingDetails.body).toContainText(
      new RegExp(`${origin}.*${destination}`, "i")
    );
  }
);

Then(
  "the airport codes {string} and {string} should be displayed",
  async function (this: CustomWorld, originCode: string, destCode: string) {
    await expect(this.bookingDetails.body).toContainText(originCode);
    await expect(this.bookingDetails.body).toContainText(destCode);
  }
);

// ──────────────────────────────────────────────────
// Page 3: Booking details — Dates & schedule
// ──────────────────────────────────────────────────

Then(
  "the departure date should be displayed",
  async function (this: CustomWorld) {
    const departure = futureDate(FLIGHT_SEARCH_DATA.departureDaysFromNow);
    const month = shortMonthName(departure);
    const day = departure.getDate();
    // Kayak shows dates like "1 jun" or "jun 1" — check both parts exist
    await expect(this.bookingDetails.body).toContainText(month);
    await expect(this.bookingDetails.body).toContainText(String(day));
  }
);

Then(
  "the return date should be displayed",
  async function (this: CustomWorld) {
    const returnDate = futureDate(FLIGHT_SEARCH_DATA.returnDaysFromNow);
    const month = shortMonthName(returnDate);
    const day = returnDate.getDate();
    await expect(this.bookingDetails.body).toContainText(month);
    await expect(this.bookingDetails.body).toContainText(String(day));
  }
);

// ──────────────────────────────────────────────────
// Page 3: Booking details — Price & tariff
// ──────────────────────────────────────────────────

Then(
  "the total price should be displayed in COP",
  async function (this: CustomWorld) {
    // Kayak Colombia shows prices in COP format: $1.234.567
    await expect(this.bookingDetails.body).toContainText(
      /\$[\d.,]+/
    );
  }
);

Then(
  "the tariff class should be displayed",
  async function (this: CustomWorld) {
    // Verify the cabin class shows on the details page (Economy/Económica/Basic)
    await expect(this.bookingDetails.body).toContainText(
      /econom|básic|economy|basic/i
    );
  }
);

Then(
  "the tariff inclusions should list luggage details",
  async function (this: CustomWorld) {
    // Kayak shows "revisa lo que incluye tu tarifa" with luggage/seat details
    await expect(this.bookingDetails.body).toContainText(
      /equipaje|maleta|asiento|cabina|carry.?on|checked|incluye/i
    );
  }
);

// ──────────────────────────────────────────────────
// Page 3: Booking details — Booking providers
// ──────────────────────────────────────────────────

Then(
  "at least one booking provider should be listed with a price",
  async function (this: CustomWorld) {
    // Verify booking links exist (Reservar / Ver oferta buttons)
    await expect(this.bookingDetails.bookingLinks.first()).toBeVisible();
    // Verify a price appears near the booking providers
    await expect(this.bookingDetails.body).toContainText(
      /\$[\d.,]+.*reservar|reservar.*\$[\d.,]+/is
    );
  }
);

// ──────────────────────────────────────────────────
// Search form validation scenario
// ──────────────────────────────────────────────────

Then(
  "the trip type selector should be visible",
  async function (this: CustomWorld) {
    await expect(this.searchForm.tripTypeCombobox).toBeVisible();
  }
);

Then("the origin field should be visible", async function (this: CustomWorld) {
  await expect(this.searchForm.originContainer).toBeVisible();
});

Then(
  "the destination field should be visible",
  async function (this: CustomWorld) {
    await expect(this.searchForm.destinationContainer).toBeVisible();
  }
);

Then(
  "the departure date selector should be visible",
  async function (this: CustomWorld) {
    await expect(this.searchForm.departureDateButton).toBeVisible();
  }
);

Then(
  "the search button should be visible",
  async function (this: CustomWorld) {
    await expect(this.searchForm.searchButton).toBeVisible();
  }
);

// ──────────────────────────────────────────────────
// Edge case: same origin and destination
// ──────────────────────────────────────────────────

Then(
  "the search button should not trigger a valid flight search",
  async function (this: CustomWorld) {
    // When origin equals destination, Kayak either disables search,
    // keeps the user on the same page, or shows a warning.
    const currentUrl = this.page.url();
    await this.searchForm.searchButton.click({ timeout: 5_000 }).catch(() => {
      // Button might be disabled — that's valid behavior
    });
    // Wait briefly and verify we did NOT navigate to results
    await this.page.waitForTimeout(2_000);
    const urlAfterClick = this.page.url();
    const stayedOnHomePage =
      !urlAfterClick.includes("/flights/") || urlAfterClick === currentUrl;
    expect(stayedOnHomePage).toBeTruthy();
  }
);
