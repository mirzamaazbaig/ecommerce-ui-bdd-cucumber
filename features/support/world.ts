import { setWorldConstructor, World, IWorldOptions, Before, After, BeforeAll, AfterAll, Status, setDefaultTimeout } from '@cucumber/cucumber';
import { chromium, Browser, BrowserContext, Page, APIRequestContext, expect } from '@playwright/test';
import { config } from './config';
import { adminApi, removeProduct } from './api';

setDefaultTimeout(30_000);
expect.configure({ timeout: 10_000 });

let browser: Browser;
BeforeAll(async () => {
  browser = await chromium.launch({ headless: config.headless, executablePath: config.chromiumPath });
});
AfterAll(async () => { await browser.close(); });

export class AppWorld extends World {
  context!: BrowserContext;
  page!: Page;
  dialogs: string[] = [];
  /** the signed-in customer, if any */
  user?: { email: string; password: string; id: number };
  admin?: APIRequestContext;
  /** products created for this scenario, removed afterwards */
  products: { id: number; name: string; price: string }[] = [];
  /** the name of the product the scenario is currently working with */
  currentProduct?: string;
  private aliases = new Map<string, string>();

  /** Scenarios refer to products by a readable name; the stored name gets a unique suffix so parallel scenarios never collide. */
  registerAlias(alias: string, stored: string) { this.aliases.set(alias, stored); }
  full(alias: string) { return this.aliases.get(alias) ?? alias; }

  constructor(options: IWorldOptions) { super(options); }

  async open() {
    this.context = await browser.newContext({ baseURL: config.baseUrl });
    this.page = await this.context.newPage();
    // The app confirms actions with native alert()/confirm() dialogs: accept them and keep the text
    this.page.on('dialog', d => { this.dialogs.push(d.message()); d.accept().catch(() => {}); });
  }

  async getAdmin() {
    this.admin ??= await adminApi();
    return this.admin;
  }
}
setWorldConstructor(AppWorld);

Before(async function (this: AppWorld) { await this.open(); });

After(async function (this: AppWorld, scenario) {
  if (scenario.result?.status === Status.FAILED) {
    const png = await this.page.screenshot({ fullPage: true });
    this.attach(png, 'image/png');
  }
  await this.context.close();
  for (const p of this.products) await removeProduct(await this.getAdmin(), p.id);
  await this.admin?.dispose();
});
