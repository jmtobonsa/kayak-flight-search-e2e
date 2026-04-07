import { Page, Locator } from "playwright";
import { BasePage } from "./base.page";

export class BookingDetailsPage extends BasePage {
  get body(): Locator {
    return this.page.locator("body");
  }

  get bookingLinks(): Locator {
    return this.page
      .getByRole("link")
      .filter({ hasText: /reservar|book|ver oferta/i });
  }

  constructor(page: Page) {
    super(page);
  }

  async waitForPageToLoad(): Promise<void> {
    await this.page.waitForLoadState("domcontentloaded");
  }
}
