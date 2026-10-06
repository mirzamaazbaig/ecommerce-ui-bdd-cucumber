import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { AppWorld } from '../support/world';
import { createProduct } from '../support/api';
import { home, nav } from '../support/pages';

const price = (text: string) => parseFloat(text.replace('$', ''));

async function ensureProduct(w: AppWorld, name: string, price = 25, stock = 10) {
  const stored = `${name} ${Math.random().toString(36).slice(2, 7)}`;
  const product = await createProduct(await w.getAdmin(), { name: stored, price, stock });
  w.products.push(product);
  w.registerAlias(name, stored);
  w.currentProduct = name;
}

Given('a product named {string} exists', async function (this: AppWorld, name: string) {
  await ensureProduct(this, name);
});

Given('a product named {string} priced at {float} exists', async function (this: AppWorld, name: string, p: number) {
  await ensureProduct(this, name, p);
});

Given('a product named {string} priced at {float} with {int} in stock exists',
  async function (this: AppWorld, name: string, p: number, stock: number) {
    await ensureProduct(this, name, p, stock);
  });

When('I open the home page', async function (this: AppWorld) {
  await home(this.page).open();
});

When('I search for {string}', async function (this: AppWorld, term: string) {
  await this.page.goto('/');
  await nav(this.page).searchInput.fill(term);
  await nav(this.page).searchButton.click();
});

When('I sort the products by {string}', async function (this: AppWorld, label: string) {
  await home(this.page).sort.selectOption({ label });
});

When('I open the details of {string}', async function (this: AppWorld, alias: string) {
  const name = this.full(alias);
  await this.page.goto('/');
  await nav(this.page).searchInput.fill(name);
  await nav(this.page).searchButton.click();
  await home(this.page).card(name).getByRole('link', { name: 'View Details' }).click();
  await expect(this.page).toHaveURL(/\/products\/\d+/);
});

Then('I see at least {int} product(s)', async function (this: AppWorld, n: number) {
  expect(await home(this.page).cards.count()).toBeGreaterThanOrEqual(n);
});

Then('every product shows a price', async function (this: AppWorld) {
  const cards = home(this.page);
  await expect(cards.prices).toHaveCount(await cards.cards.count());
  for (const t of await cards.prices.allInnerTexts()) expect(t).toMatch(/^\$\d+(\.\d{2})?$/);
});

Then('the results include {string}', async function (this: AppWorld, alias: string) {
  await expect(home(this.page).card(this.full(alias))).toHaveCount(1);
});

Then('every result contains {string} in its name', async function (this: AppWorld, text: string) {
  await expect.poll(async () => {
    const names = await home(this.page).titles.allInnerTexts();
    return names.length > 0 && names.every(n => n.toLowerCase().includes(text.toLowerCase()));
  }).toBe(true);
});

Then('I see the message {string}', async function (this: AppWorld, message: string) {
  await expect(this.page.getByText(message)).toBeVisible();
});

Then('the prices are in {word} order', async function (this: AppWorld, direction: string) {
  await expect.poll(async () => {
    const values = (await home(this.page).prices.allInnerTexts()).map(price);
    const sorted = [...values].sort((a, b) => (direction === 'ascending' ? a - b : b - a));
    return values.length > 1 && values.every((v, i) => v === sorted[i]);
  }).toBe(true);
});

Then('the product page shows the name {string} and the price {float}',
  async function (this: AppWorld, alias: string, p: number) {
    await expect(this.page.locator('h2').first()).toHaveText(this.full(alias));
    expect(price(await this.page.locator('h4.text-muted').innerText())).toBe(p);
  });
