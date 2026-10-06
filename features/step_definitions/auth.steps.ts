import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { AppWorld } from '../support/world';
import { newApi, registerUser, uniqueEmail } from '../support/api';
import { nav } from '../support/pages';
import { config } from '../support/config';

const fill = (w: AppWorld, email: string, password: string, confirm?: string) =>
  (async () => {
    await w.page.locator('#email').fill(email);
    await w.page.locator('#password').fill(password);
    if (confirm !== undefined) await w.page.locator('#confirmPassword').fill(confirm);
  })();

Given('a customer account exists', async function (this: AppWorld) {
  const api = await newApi();
  this.user = await registerUser(api);
  await api.dispose();
});

Given('I am on the registration page', async function (this: AppWorld) {
  await this.page.goto('/register');
  await expect(this.page.getByRole('heading', { name: 'Register' })).toBeVisible();
});

Given('I am on the login page', async function (this: AppWorld) {
  await this.page.goto('/login');
  await expect(this.page.getByRole('heading', { name: 'Login' })).toBeVisible();
});

Given('I am signed in as a customer', async function (this: AppWorld) {
  const api = await newApi();
  this.user = await registerUser(api);
  await this.context.addCookies((await api.storageState()).cookies);
  await api.dispose();
  await this.page.goto('/');
  await expect(nav(this.page).accountMenu).toBeVisible();
});

When('I register with a new email and a valid password', async function (this: AppWorld) {
  await fill(this, uniqueEmail(), config.password, config.password);
  await this.page.getByRole('button', { name: 'Register', exact: true }).click();
});

When('I register with a new email but confirm a different password', async function (this: AppWorld) {
  await fill(this, uniqueEmail(), config.password, 'Different123!');
  await this.page.getByRole('button', { name: 'Register', exact: true }).click();
});

When('I register with that same email', async function (this: AppWorld) {
  await fill(this, this.user!.email, config.password, config.password);
  await this.page.getByRole('button', { name: 'Register', exact: true }).click();
});

When('I sign in with that account', async function (this: AppWorld) {
  await fill(this, this.user!.email, this.user!.password);
  await this.page.getByRole('button', { name: 'Login', exact: true }).click();
});

When('I sign in with that email and the password {string}', async function (this: AppWorld, password: string) {
  await fill(this, this.user!.email, password);
  await this.page.getByRole('button', { name: 'Login', exact: true }).click();
});

When('I sign out', async function (this: AppWorld) {
  await nav(this.page).accountMenu.click();
  await this.page.getByRole('button', { name: 'Logout' }).click();
});

Then('I am signed in', async function (this: AppWorld) {
  await expect(nav(this.page).accountMenu).toBeVisible();
});

Then('I am not signed in', async function (this: AppWorld) {
  await expect(nav(this.page).signInLink).toBeVisible();
  await expect(nav(this.page).accountMenu).toHaveCount(0);
});

Then('I am on the home page', async function (this: AppWorld) {
  await expect(this.page).toHaveURL(/\/$/);
});

Then('I see the error {string}', async function (this: AppWorld, message: string) {
  await expect(this.page.locator('.alert-danger')).toHaveText(message);
});
