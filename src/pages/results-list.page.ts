import { Page, Locator } from "playwright";
import { BasePage } from "./base.page";

export class ResultsListPage extends BasePage {
  get cheapestButton(): Locator {
    return this.page.getByRole("button", { name: "El más barato" });
  }

  get directFilter(): Locator {
    return this.page.getByText("Directo", { exact: true }).first();
  }

  get oneStopFilter(): Locator {
    return this.page.getByText("1 escala", { exact: true }).first();
  }

  get firstResult(): Locator {
    return this.page.getByRole("group", {
      name: "Elemento de resultado 1",
      exact: true,
    });
  }

  constructor(page: Page) {
    super(page);
  }

  async waitForResultsToLoad(): Promise<void> {
    await this.page.waitForURL(/kayak\.com.*flights/, { timeout: 30_000 });
    const primaryResult = this.firstResult;
    // Fallback: Kayak result cards use obfuscated class names (e.g., ".Fxw9")
    // that change across deployments. This exists because the accessible
    // aria-label locator is not always rendered by Kayak.
    const fallbackResult = this.page.locator(".Fxw9 > div").first();
    await Promise.race([
      primaryResult.waitFor({ state: "visible", timeout: 60_000 }),
      fallbackResult.waitFor({ state: "visible", timeout: 60_000 }),
    ]);
  }

  async filterByCheapest(): Promise<void> {
    await this.cheapestButton.click();
    await this.page.waitForLoadState("domcontentloaded");
  }

  async filterByDirectOrOneStop(): Promise<void> {
    const directEl = this.directFilter;
    const isDirectDisabled = await directEl
      .evaluate((el) => {
        const style = (el.ownerDocument.defaultView as Window).getComputedStyle(
          el
        );
        return (
          el.classList.contains("disabled") ||
          el.getAttribute("aria-disabled") === "true" ||
          style.opacity === "0.5" ||
          style.pointerEvents === "none"
        );
      })
      .catch(() => true);

    if (!isDirectDisabled) {
      await directEl.click();
    } else {
      await this.oneStopFilter.click();
    }
    await this.page.waitForLoadState("domcontentloaded");
  }

  async selectFirstResult(): Promise<void> {
    const primaryResult = this.firstResult;
    const fallbackResult = this.page.locator(".Fxw9 > div").first();
    const target = (await primaryResult.isVisible().catch(() => false))
      ? primaryResult
      : fallbackResult;
    await target.scrollIntoViewIfNeeded();

    const selectLink = target.getByRole("link", {
      name: /Seleccionar|Ver oferta/i,
    });
    if (await selectLink.isVisible().catch(() => false)) {
      await selectLink.click({ timeout: 15_000 });
    } else {
      await target.click();
      const expandedLink = this.page
        .getByRole("link", { name: /Seleccionar|Ver oferta/i })
        .first();
      await expandedLink.waitFor({ state: "visible", timeout: 10_000 });
      await expandedLink.click({ timeout: 15_000 });
    }
  }
}
