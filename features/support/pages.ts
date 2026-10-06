/** Locators and small page actions for the shop UI, kept out of the step definitions. */
import { Page, expect } from '@playwright/test';

export const home = (page: Page) => ({
  cards: page.locator('.card'),
  titles: page.locator('.card .card-title'),
  prices: page.locator('.card .card-text.fw-bold'),
  sort: page.getByLabel('Sort by'),
  card: (name: string) =>
    page.locator('.card').filter({ has: page.locator('.card-title', { hasText: name }) }),
  async open() {
    await page.goto('/');
    await expect(page.locator('.card').first()).toBeVisible();
  },
});

export const nav = (page: Page) => ({
  searchInput: page.getByPlaceholder('Search products...'),
  searchButton: page.locator('.search-btn'),
  accountMenu: page.locator('.nav-link.dropdown-toggle'),
  signInLink: page.locator('a[href="/login"]'),
  cartLink: page.locator('a[href="/cart"]'),
  cartBadge: page.locator('a[href="/cart"] .badge'),
});

export const cart = (page: Page) => ({
  heading: page.getByRole('heading', { name: 'Shopping Cart' }),
  empty: page.getByRole('heading', { name: 'Your Cart is Empty' }),
  items: page.locator('ul.list-group.mb-3 > li'),
  item: (name: string) =>
    page.locator('ul.list-group.mb-3 > li').filter({ has: page.locator('h6', { hasText: name }) }),
  totalText: () => page.locator('li', { hasText: 'Total (USD)' }).locator('strong'),
  async open() {
    await page.goto('/cart');
    await expect(page.getByRole('heading', { name: /Shopping Cart|Your Cart is Empty/ })).toBeVisible();
  },
});
