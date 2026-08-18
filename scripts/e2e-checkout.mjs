#!/usr/bin/env node
/**
 * Guest cart → checkout → pay → confirmation.
 * API coverage: server-priced PaymentIntent + out-of-stock reservation.
 * Browser coverage: add-to-cart through confirmation (demo or Stripe test card).
 *
 *   BASE_URL=http://127.0.0.1:8080 npm run test:e2e
 */
import { createRequire } from 'node:module';
import { setTimeout as sleep } from 'node:timers/promises';

const BASE = (process.env.BASE_URL || 'http://127.0.0.1:8080').replace(/\/$/, '');
const VARIANT = '33333333-3333-4333-8333-333333333301';

function fail(message) {
  console.error(`FAIL ${message}`);
  process.exitCode = 1;
}

function pass(message) {
  console.log(`ok  ${message}`);
}

async function json(method, path, body, cookie) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Origin: BASE,
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: body == null ? undefined : JSON.stringify(body),
  });
  const setCookie = res.headers.getSetCookie?.() ?? [];
  const jar = new Map(
    (cookie ? cookie.split('; ').filter(Boolean) : []).map((part) => {
      const [k, ...rest] = part.split('=');
      return [k, rest.join('=')];
    }),
  );
  for (const raw of setCookie) {
    const pair = raw.split(';')[0];
    const [k, ...rest] = pair.split('=');
    jar.set(k, rest.join('='));
  }
  const nextCookie = [...jar.entries()].map(([k, v]) => `${k}=${v}`).join('; ');
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }
  return { status: res.status, data, cookie: nextCookie };
}

function trpcError(payload) {
  return payload?.error?.message || payload?.error?.data?.message || JSON.stringify(payload);
}

async function apiSuite() {
  const session = await json('GET', '/api/trpc/checkout.config');
  const cookie = session.cookie;
  const mode = session.data?.result?.data?.mode;
  pass(`checkout.config mode=${mode}`);

  const added = await json('POST', '/api/trpc/cart.addItem', { variantId: VARIANT, quantity: 1 }, cookie);
  if (!added.data?.result?.data?.items?.length) {
    fail(`cart.addItem ${trpcError(added.data)}`);
    return { cookie, mode };
  }
  pass('cart.addItem');

  const intent = await json(
    'POST',
    '/api/trpc/checkout.createPaymentIntent',
    {
      email: 'e2e@lumina.test',
      shipping: {
        firstName: 'E2E',
        lastName: 'Guest',
        addressLine1: '450 Sutter Street',
        city: 'San Francisco',
        state: 'CA',
        postalCode: '94108',
        country: 'US',
      },
    },
    cookie,
  );
  const created = intent.data?.result?.data;
  if (!created?.orderId) {
    fail(`createPaymentIntent ${trpcError(intent.data)}`);
    return { cookie, mode };
  }
  if (mode === 'test' && !String(created.paymentIntentId).startsWith('pi_')) {
    fail(`expected Stripe PI, got ${created.paymentIntentId}`);
  } else {
    pass(`createPaymentIntent ${created.orderNumber} ${created.mode}`);
  }

  if (created.mode === 'demo') {
    const confirm = await json(
      'POST',
      '/api/trpc/checkout.confirmOrder',
      { orderId: created.orderId, paymentIntentId: created.paymentIntentId },
      cookie,
    );
    if (!confirm.data?.result?.data?.success) fail(`confirmOrder ${trpcError(confirm.data)}`);
    else pass(`confirmOrder ${confirm.data.result.data.orderNumber}`);
  }

  let staff = await json('POST', '/api/auth/sign-in/email', {
    email: 'hodge@agentmail.to',
    password: 'LuminaFounder1!',
  });
  if (staff.status !== 200) {
    await json('POST', '/api/auth/sign-up/email', {
      email: 'hodge@agentmail.to',
      password: 'LuminaFounder1!',
      name: 'Samuel Hodge',
    });
    staff = await json('POST', '/api/auth/sign-in/email', {
      email: 'hodge@agentmail.to',
      password: 'LuminaFounder1!',
    });
  }
  if (staff.status !== 200) {
    fail(`staff sign-in ${staff.status} ${JSON.stringify(staff.data).slice(0, 180)}`);
    return { cookie, mode };
  }
  const staffCookie = staff.cookie;
  const listed = await json('GET', '/api/trpc/admin.inventory.list', undefined, staffCookie);
  const rows = listed.data?.result?.data ?? [];
  const current = Array.isArray(rows) ? rows.find((r) => r.id === VARIANT || r.variantId === VARIANT) : null;
  const beforeStock = current?.stock ?? current?.stockQuantity ?? 40;

  const zero = await json(
    'POST',
    '/api/trpc/admin.inventory.adjust',
    { variantId: VARIANT, delta: -Math.max(beforeStock, 1) - 50, reason: 'e2e out-of-stock' },
    staffCookie,
  );
  if (zero.data?.error) fail(`inventory.adjust ${trpcError(zero.data)}`);
  else pass('inventory zeroed via admin.adjust');

  const guest = await json('GET', '/api/trpc/checkout.config');
  await json('POST', '/api/trpc/cart.addItem', { variantId: VARIANT, quantity: 1 }, guest.cookie);
  const blocked = await json(
    'POST',
    '/api/trpc/checkout.createPaymentIntent',
    {
      email: `oos-${Date.now()}@lumina.test`,
      shipping: {
        firstName: 'Out',
        lastName: 'Stock',
        addressLine1: '1 Market St',
        city: 'San Francisco',
        state: 'CA',
        postalCode: '94105',
        country: 'US',
      },
    },
    guest.cookie,
  );
  const blockedMsg = trpcError(blocked.data);
  if (blocked.data?.result?.data?.orderId) fail(`out-of-stock reservation should fail (${blocked.data.result.data.orderNumber})`);
  else if (/stock|empty|no longer/i.test(blockedMsg) || blocked.data?.error) pass(`out-of-stock blocked: ${blockedMsg.slice(0, 80)}`);
  else fail(`unexpected oos response ${JSON.stringify(blocked.data).slice(0, 200)}`);

  await json(
    'POST',
    '/api/trpc/admin.inventory.adjust',
    { variantId: VARIANT, delta: Math.max(beforeStock, 40), reason: 'e2e restore' },
    staffCookie,
  );
  pass('variant stock restored');
  return { cookie, mode };
}

async function loadPlaywright() {
  const require = createRequire(import.meta.url);
  const candidates = ['playwright', '/workspace/node_modules/playwright'];
  for (const id of candidates) {
    try {
      return require(id);
    } catch {
      /* try next */
    }
  }
  return null;
}

async function browserSuite() {
  const playwright = await loadPlaywright();
  if (!playwright?.chromium) {
    console.warn('skip browser e2e — install playwright (npm i -D playwright && npx playwright install chromium)');
    return;
  }
  const browser = await playwright.chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  try {
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle', timeout: 45000 });
    const added = await page.evaluate(async (variantId) => {
      const res = await fetch('/api/trpc/cart.addItem', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variantId, quantity: 1 }),
      });
      return res.json();
    }, VARIANT);
    if (!added?.result?.data?.items?.length) {
      throw new Error(`browser addItem failed ${JSON.stringify(added).slice(0, 200)}`);
    }
    await page.goto(`${BASE}/checkout`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.getByRole('button', { name: 'Prefill Demo Address' }).click();
    await page.waitForFunction(() => {
      const el = document.querySelector('input[type="email"]');
      return Boolean(el && 'value' in el && String(el.value).includes('@'));
    }, { timeout: 8000 });
    await page.getByRole('button', { name: 'Continue to Ritual Review' }).click();
    await page.getByRole('button', { name: 'Continue to Secure Payment' }).click();
    await page.getByText('Encrypted Payment').waitFor({ timeout: 25000 });

    const cardFrame = page.frameLocator('iframe[title="Secure payment input frame"]').first();
    const numberInput = cardFrame.locator('#payment-numberInput, input[name="number"]').first();
    const hasCard = await numberInput.waitFor({ timeout: 12000 }).then(() => true).catch(() => false);
    if (hasCard) {
      await cardFrame.locator('#card-tab').click().catch(() => {});
      await numberInput.fill('4242424242424242');
      await cardFrame.locator('#payment-expiryInput, input[name="expiry"]').first().fill('1234');
      await cardFrame.locator('#payment-cvcInput, input[name="cvc"]').first().fill('123');
      const country = cardFrame.locator('#payment-countryInput, select[name="country"]').first();
      if (await country.count()) await country.selectOption('US').catch(() => {});
      const zip = cardFrame.locator('#payment-postalCodeInput, input[name="postalCode"]').first();
      if (await zip.count()) await zip.fill('94108');
      pass('filled Stripe test card 4242 + US ZIP');
    } else {
      pass('no Stripe iframe — authorizing anyway (demo mode)');
    }

    await sleep(800);
    await page.getByRole('button', { name: /Authorize & Pay/ }).click();
    await page.waitForURL(/\/order-confirmed/, { timeout: 45000, waitUntil: 'domcontentloaded' });
    pass(`confirmation ${page.url()}`);
  } catch (err) {
    fail(`browser checkout at ${page.url()}: ${err instanceof Error ? err.message : err}`);
    const snippet = await page.locator('body').innerText().catch(() => '');
    console.error(snippet.slice(0, 1500));
    await page.screenshot({ path: '/workspace/screenshots/e2e-checkout-fail.png' }).catch(() => {});
  } finally {
    await browser.close();
  }
}

const started = Date.now();
for (let i = 0; i < 30; i++) {
  try {
    const res = await fetch(BASE, { signal: AbortSignal.timeout(2000) });
    if (res.ok) break;
  } catch {
    if (i === 29) {
      fail(`server not reachable at ${BASE}`);
      process.exit(1);
    }
    await sleep(500);
  }
}

if (process.env.E2E_API_ONLY !== '1') {
  await browserSuite();
}
await apiSuite();
console.log(`e2e done in ${Date.now() - started}ms`);
if (process.exitCode) process.exit(process.exitCode);
