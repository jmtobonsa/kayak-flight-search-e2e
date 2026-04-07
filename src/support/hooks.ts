import {
  Before,
  After,
  setWorldConstructor,
  setDefaultTimeout,
  Status,
} from "@cucumber/cucumber";
import { CustomWorld } from "./world";

setWorldConstructor(CustomWorld);
setDefaultTimeout(90_000);

Before(async function (this: CustomWorld) {
  await this.openBrowser();
});

After(async function (this: CustomWorld, scenario) {
  if (scenario.result?.status === Status.FAILED) {
    const timestamp = Date.now();
    const name = scenario.pickle.name.replace(/\s+/g, "-").toLowerCase();
    await this.takeScreenshot(`FAILED-${name}-${timestamp}`);
  }
  await this.closeBrowser();
});
