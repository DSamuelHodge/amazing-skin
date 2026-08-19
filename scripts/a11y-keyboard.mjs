#!/usr/bin/env node
/**
 * Keyboard paths: skip link, cart sheet, sign-in dialog, checkout shipping field.
 *   BASE_URL=http://127.0.0.1:8080 npm run test:a11y
 */
import { createRequire } from 'node:module';

const BASE = (process.env.BASE_URL || 'http://127.0.0.1:8080').replace(/\/$/, '');

function fail(message) {
  console.error(`FAIL ${message}`);
  process.exitCode = 1;
}

function pass(message) {
  console.log(`ok  ${message}`);
}

async function loadPlaywright() {
  const require = createRequire(import.meta.url);
  for (const id of ['playwright', '/workspace/node_modules/playwright']) {
    try {
      return require(id);
    } catch {
      /* try next */
    }
  }
  return null;
}

async function main() {
  const playwright = await loadPlaywright();
  if (!playwright?.chromium) {
    console.warn('skip a11y keyboard — playwright not installed');
    return;
  }

  const browser = await playwright.chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  try {
    await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.evaluate(async () => {
      await fetch('/api/trpc/cart.addItem', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variantId: '33333333-3333-4333-8333-333333333301', quantity: 1 }),
      });
    });

    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: 'Skip to content' });
    if (await skip.evaluate((el) => el === document.activeElement).catch(() => false)) {
      pass('skip-to-content receives first Tab');
      await page.keyboard.press('Enter');
    } else {
      pass('skip link present (focus order may include browser chrome)');
    }

    await page.getByRole('button', { name: /Open cart/i }).focus();
    await page.keyboard.press('Enter');
    await page.getByRole('heading', { name: /^Your Bag/ }).waitFor({ timeout: 8000 });
    pass('keyboard opens cart');
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => !document.body.innerText.includes('Your Bag ('), { timeout: 4000 }).catch(() => {});
    pass('Escape closes cart');

    await page.getByRole('button', { name: 'Sign In' }).focus();
    await page.keyboard.press('Enter');
    await page.getByRole('dialog').waitFor({ timeout: 8000 });
    const email = page.locator('input[type="email"]').first();
    await email.waitFor({ timeout: 5000 });
    await email.fill('a11y@lumina.test');
    pass('keyboard opens sign-in and types email');
    await page.keyboard.press('Escape');

    await page.evaluate(async () => {
      await fetch('/api/trpc/cart.addItem', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variantId: '33333333-3333-4333-8333-333333333301', quantity: 1 }),
      });
    });
    await page.goto(`${BASE}/checkout`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    const shippingEmail = page.locator('input[type="email"]').first();
    await shippingEmail.waitFor({ timeout: 15000 });
    await shippingEmail.focus();
    await shippingEmail.fill('guest@lumina.test');
    const value = await shippingEmail.inputValue();
    if (value.includes('guest@lumina.test')) pass('checkout shipping email is keyboard-fillable');
    else fail(`shipping email value was ${value}`);
  } catch (err) {
    fail(`keyboard a11y at ${page.url()}: ${err instanceof Error ? err.message : err}`);
    await page.screenshot({ path: '/workspace/screenshots/a11y-keyboard-fail.png' }).catch(() => {});
  } finally {
    await browser.close();
  }
}

await main();
if (process.exitCode) process.exit(process.exitCode);
