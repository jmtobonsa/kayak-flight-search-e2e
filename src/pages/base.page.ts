import { Page, Locator } from "playwright";

export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  protected async safeClick(locator: Locator): Promise<void> {
    await locator.waitFor({ state: "visible", timeout: 10_000 });
    await locator.click();
  }
}
