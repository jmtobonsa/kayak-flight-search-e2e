import { Page, Locator } from "playwright";
import { BasePage } from "./base.page";

export class SearchFormPage extends BasePage {
  get tripTypeCombobox(): Locator {
    return this.page
      .getByRole("combobox", { name: /Tipo de viaje/ })
      .first();
  }

  get originCombobox(): Locator {
    return this.page.getByRole("combobox", { name: "Ubicación de origen" });
  }

  get destinationCombobox(): Locator {
    return this.page.getByRole("combobox", {
      name: "Ubicación del destino",
    });
  }

  get originContainer(): Locator {
    return this.page.getByLabel("Origen", { exact: true });
  }

  get destinationContainer(): Locator {
    return this.page.getByLabel("Destino", { exact: true });
  }

  get removeOriginValueButton(): Locator {
    return this.page.getByRole("button", { name: "Eliminar valor" });
  }

  get departureDateButton(): Locator {
    return this.page.getByRole("button", { name: "Fecha de salida" });
  }

  get passengersButton(): Locator {
    return this.page.getByText("pasajero, Económica").first();
  }

  get searchButton(): Locator {
    return this.page.getByRole("button", { name: "Buscar" });
  }

  constructor(page: Page) {
    super(page);
  }

  async navigate(baseUrl: string): Promise<void> {
    await this.page.goto(baseUrl, { waitUntil: "domcontentloaded" });
    await this.dismissCookieBannerIfPresent();
  }

  async selectTripType(tripType: string): Promise<void> {
    const radio = this.page.getByRole("radio", { name: tripType });
    if (await radio.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await radio.click();
      return;
    }
    const combobox = this.tripTypeCombobox;
    await combobox.click();
    const radioAfterClick = this.page.getByRole("radio", { name: tripType });
    const optionAfterClick = this.page
      .getByRole("listbox")
      .getByRole("option", { name: new RegExp(tripType, "i") });
    await Promise.race([
      radioAfterClick
        .waitFor({ state: "visible", timeout: 5_000 })
        .then(() => radioAfterClick.click()),
      optionAfterClick
        .waitFor({ state: "visible", timeout: 5_000 })
        .then(() => optionAfterClick.click()),
    ]);
  }

  async setOrigin(city: string): Promise<void> {
    if (await this.removeOriginValueButton.isVisible()) {
      await this.removeOriginValueButton.click();
    }
    await this.originContainer.click();
    await this.originCombobox.pressSequentially(city, { delay: 100 });
    await this.page
      .getByRole("listbox")
      .getByRole("option")
      .filter({ hasText: city })
      .first()
      .click();
  }

  async setDestination(city: string): Promise<void> {
    await this.destinationContainer.click();
    await this.destinationCombobox.pressSequentially(city, { delay: 100 });
    await this.page
      .getByRole("listbox")
      .getByRole("option")
      .filter({ hasText: city })
      .first()
      .click();
  }

  async selectDepartureDate(dateLabel: string): Promise<void> {
    const calendarGrid = this.page.locator('[role="grid"]').first();
    if (!(await calendarGrid.isVisible().catch(() => false))) {
      await this.departureDateButton.click();
    }
    await calendarGrid.waitFor({ state: "visible", timeout: 5_000 });
    await this.navigateCalendarToDate(dateLabel);
    await this.clickCalendarDate(dateLabel);
  }

  async selectReturnDate(dateLabel: string): Promise<void> {
    await this.clickCalendarDate(dateLabel);
  }

  async verifyPassengersAndClass(
    expectedAdults: number,
    expectedClass: string
  ): Promise<void> {
    const buttonText = await this.passengersButton.textContent();
    const text = buttonText || "";
    const hasExpectedAdults = text.includes(`${expectedAdults} pasajero`);
    const hasExpectedClass = text
      .toLowerCase()
      .includes(expectedClass.toLowerCase());
    if (!hasExpectedAdults || !hasExpectedClass) {
      throw new Error(
        `Expected ${expectedAdults} passenger(s) in ${expectedClass}, but found: "${text}"`
      );
    }
  }

  async clickSearch(): Promise<void> {
    await this.page.route("**/s/clickthrough*", (route) => route.abort());
    await this.page.route("**/s/frontdoor*", (route) => route.abort());
    await this.safeClick(this.searchButton);
  }

  private async dismissCookieBannerIfPresent(): Promise<void> {
    try {
      const acceptButton = this.page.getByRole("button", {
        name: /accept|agree|got it|aceptar/i,
      });
      await acceptButton.click({ timeout: 3_000 });
    } catch {
      // No cookie banner present
    }
  }

  private async clickCalendarDate(dateLabel: string): Promise<void> {
    const dateButton = this.page.getByRole("button", {
      name: new RegExp(`^${dateLabel}`),
    });
    await dateButton.click({ timeout: 10_000 });
  }

  private async navigateCalendarToDate(dateLabel: string): Promise<void> {
    const monthNames: Record<string, number> = {
      enero: 0, febrero: 1, marzo: 2, abril: 3,
      mayo: 4, junio: 5, julio: 6, agosto: 7,
      septiembre: 8, octubre: 9, noviembre: 10, diciembre: 11,
    };
    const match = dateLabel.match(/de (\w+) de (\d{4})/);
    if (!match) return;
    const targetMonth = monthNames[match[1].toLowerCase()];
    const targetYear = parseInt(match[2], 10);

    const captionLocator = this.page.locator('[role="grid"] caption').first();
    const firstCaption = await captionLocator.textContent();
    if (!firstCaption) return;
    const captionMatch = firstCaption.match(/(\w+)\s+(\d{4})/);
    if (!captionMatch) return;
    const currentMonth = monthNames[captionMatch[1].toLowerCase()];
    const currentYear = parseInt(captionMatch[2], 10);

    const monthsAhead =
      (targetYear - currentYear) * 12 + (targetMonth - currentMonth);
    const clicks = Math.max(0, monthsAhead - 1);

    const nextMonthButton = this.page.getByLabel("Mes siguiente");
    for (let i = 0; i < clicks; i++) {
      const prevCaption = await captionLocator.textContent();
      await nextMonthButton.click();
      await this.page.waitForFunction(
        (prev: string | null) => {
          const cap = document.querySelector('[role="grid"] caption');
          return cap && cap.textContent !== prev;
        },
        prevCaption,
        { timeout: 5_000 }
      );
    }
  }
}
