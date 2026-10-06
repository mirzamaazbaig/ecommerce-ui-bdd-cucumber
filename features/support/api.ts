/** API and SQL helpers used only to arrange test data (never to assert what the UI shows). */
import { request, APIRequestContext } from '@playwright/test';
import { Client } from 'pg';
import { config } from './config';

export const uniqueEmail = (prefix = 'bdd') =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}@example.com`;

export async function newApi(): Promise<APIRequestContext> {
  return request.newContext({ baseURL: `${config.apiUrl}/` });
}

export async function registerUser(api: APIRequestContext, email = uniqueEmail()) {
  const res = await api.post('auth/register', { data: { email, password: config.password } });
  if (res.status() !== 201) throw new Error(`setup: register failed ${res.status()} ${await res.text()}`);
  return { email, password: config.password, id: (await res.json()).user.id as number };
}

async function sql(query: string, params: unknown[] = []) {
  const db = new Client({ connectionString: config.databaseUrl });
  await db.connect();
  try { return await db.query(query, params); } finally { await db.end(); }
}

/** A throw-away administrator, used to create products with known price and stock. */
export async function adminApi() {
  const api = await newApi();
  const user = await registerUser(api, uniqueEmail('admin'));
  await sql("UPDATE users SET role = 'admin' WHERE id = $1", [user.id]);
  const login = await api.post('auth/login', { data: { email: user.email, password: user.password } });
  if (login.status() !== 200) throw new Error('setup: admin login failed');
  return api;
}

export async function createProduct(admin: APIRequestContext, overrides: Record<string, unknown> = {}) {
  const res = await admin.post('products', {
    data: {
      name: `BDD Product ${Math.random().toString(36).slice(2, 8)}`,
      description: 'Created by the BDD suite', price: 25, stock: 10, imageUrl: null, categoryId: 1, ...overrides,
    },
  });
  if (res.status() !== 201) throw new Error(`setup: product creation failed ${res.status()}`);
  return (await res.json()) as { id: number; name: string; price: string };
}

export async function removeProduct(admin: APIRequestContext, id: number) {
  await sql('DELETE FROM order_items WHERE product_id = $1', [id]);
  await admin.delete(`products/${id}`);
}
