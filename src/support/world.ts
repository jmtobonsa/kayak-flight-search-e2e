import { World, IWorldOptions } from "@cucumber/cucumber";
import { Browser, BrowserContext, Page, chromium } from "playwright";
import { SearchFormPage } from "../pages/search-form.page";
import { ResultsListPage } from "../pages/results-list.page";
import { BookingDetailsPage } from "../pages/booking-details.page";

export interface ICustomWorldParameters {
  baseUrl: string;
  defaultTimeout: number;
}

export class CustomWorld extends World<ICustomWorldParameters> {
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;

  searchForm!: SearchFormPage;
  resultsList!: ResultsListPage;
  bookingDetails!: BookingDetailsPage;

  constructor(options: IWorldOptions<ICustomWorldParameters>) {
    super(options);
  }

  async openBrowser(): Promise<void> {
    const headed = process.env.HEADED === "true";
    this.browser = await chromium.launch({
      headless: !headed,
      slowMo: headed ? 50 : 0,
      args: ["--disable-blink-features=AutomationControlled"],
    });
    this.context = await this.browser.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    });
    this.page = await this.context.newPage();
    this.page.setDefaultTimeout(this.parameters.defaultTimeout);

    this.searchForm = new SearchFormPage(this.page);
    this.resultsList = new ResultsListPage(this.page);
    this.bookingDetails = new BookingDetailsPage(this.page);
  }

  async closeBrowser(): Promise<void> {
    if (this.page) await this.page.close();
    if (this.context) await this.context.close();
    if (this.browser) await this.browser.close();
  }

  async takeScreenshot(name: string): Promise<Buffer> {
    return await this.page.screenshot({
      path: `reports/screenshots/${name}.png`,
      fullPage: true,
    });
  }
}
