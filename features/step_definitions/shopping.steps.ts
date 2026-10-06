import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { AppWorld } from '../support/world';
import { home, nav, cart } from '../support/pages';
import { newApi } from '../support/api';

async function findOnHome(w: AppWorld, alias: string) {
  const name = w.full(alias);
  await w.page.goto('/');
  await nav(w.page).searchInput.fill(name);
  await nav(w.page).searchButton.click();
  await expect(home(w.page).card(name)).toHaveCount(1);
}

When('I add {string} to the cart from the home page', async function (this: AppWorld, alias: string) {
  await findOnHome(this, alias);
  await home(this.page).card(this.full(alias)).getByRole('button', { name: 'Add to Cart' }).click();
});

When('I add {int} of {string} to the cart from its details page', async function (this: AppWorld, qty: number, alias: string) {
  await findOnHome(this, alias);
  await home(this.page).card(this.full(alias)).getByRole('link', { name: 'View Details' }).click();
  await this.page.getByLabel('Quantity').fill(String(qty));
  await this.page.getByRole('button', { name: 'Add to Cart' }).click();
  await expect(nav(this.page).cartBadge).toHaveText(String(qty));
});

Given('I have {string} in my cart', async function (this: AppWorld, alias: string) {
  await findOnHome(this, alias);
  await home(this.page).card(this.full(alias)).getByRole('button', { name: 'Add to Cart' }).click();
  await expect(nav(this.page).cartBadge).toHaveText('1'); // the badge confirms the cart was stored
});

When('I open the cart', async function (this: AppWorld) {
  await cart(this.page).open();
});

When('I remove {string} from the cart', async function (this: AppWorld, alias: string) {
  await cart(this.page).open();
  await cart(this.page).item(this.full(alias)).getByRole('button', { name: 'Remove' }).click();
});

When('I check out', async function (this: AppWorld) {
  await cart(this.page).open();
  await this.page.getByRole('button', { name: 'Checkout' }).click();
  await expect(this.page).toHaveURL('/my-orders');
});

Then('the cart badge shows {int}', async function (this: AppWorld, n: number) {
  await expect(nav(this.page).cartBadge).toHaveText(String(n));
});

Then('the cart lists {string}', async function (this: AppWorld, alias: string) {
  await cart(this.page).open();
  await expect(cart(this.page).item(this.full(alias))).toHaveCount(1);
});

Then('the cart total is {float}', async function (this: AppWorld, total: number) {
  await expect(cart(this.page).totalText()).toHaveText(`$${total.toFixed(2)}`);
});

Then('I see the empty cart message', async function (this: AppWorld) {
  await expect(cart(this.page).empty).toBeVisible();
});

Then('my orders page shows an order containing {string}', async function (this: AppWorld, alias: string) {
  await expect(this.page.locator('.accordion-collapse.show .accordion-body')).toContainText(this.full(alias));
});

Then('{string} has {int} left in stock', async function (this: AppWorld, alias: string, left: number) {
  const api = await newApi();
  const id = this.products.find(p => p.name === this.full(alias))!.id;
  await expect.poll(async () => (await (await api.get(`products/${id}`)).json()).stock).toBe(left);
  await api.dispose();
});
