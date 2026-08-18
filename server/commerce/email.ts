import { eq } from 'drizzle-orm';
import { getDb } from '../../src/db/client';
import { orderAddresses, orderItems, orders } from '../../src/db/schema';
import { fromMoney } from './money';

const DEFAULT_FROM = 'Lumina Skin Rituals <orders@thenikkigcollection.com>';

function money(n: string | number) {
  return `$${fromMoney(n).toFixed(2)}`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function sendOrderConfirmation(orderId: string) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.info('[email] RESEND_API_KEY unset — skipping confirmation for', orderId);
    return { skipped: true as const };
  }

  const db = await getDb();
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
  if (!order) {
    console.warn('[email] order not found', orderId);
    return { skipped: true as const };
  }

  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  const addresses = await db.select().from(orderAddresses).where(eq(orderAddresses.orderId, orderId));
  const shipping = addresses.find((a) => a.type === 'shipping');

  const itemRows = items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px 0;border-bottom:1px solid #e7ded3">${escapeHtml(item.productName)} · ${escapeHtml(item.variantName)}${item.isFreeGift ? ' (gift)' : ''}</td>
          <td style="padding:8px 0;border-bottom:1px solid #e7ded3;text-align:right">${item.quantity} × ${money(item.unitPrice)}</td>
        </tr>`,
    )
    .join('');

  const shipBlock = shipping
    ? `${escapeHtml(shipping.firstName)} ${escapeHtml(shipping.lastName)}<br/>
       ${escapeHtml(shipping.addressLine1)}${shipping.addressLine2 ? `<br/>${escapeHtml(shipping.addressLine2)}` : ''}<br/>
       ${escapeHtml(shipping.city)}, ${escapeHtml(shipping.state)} ${escapeHtml(shipping.postalCode)}`
    : 'Shipping address on file';

  const html = `<!doctype html>
<html><body style="margin:0;background:#f5ede4;font-family:Georgia,serif;color:#1c1917">
  <div style="max-width:560px;margin:32px auto;background:#faf7f3;padding:32px;border:1px solid #e7ded3;border-radius:16px">
    <p style="letter-spacing:0.16em;text-transform:uppercase;font-size:11px;color:#15281e;margin:0 0 8px">Lumina Skin Rituals</p>
    <h1 style="font-size:28px;margin:0 0 12px">Order ${escapeHtml(order.orderNumber)} confirmed</h1>
    <p style="font-size:15px;line-height:1.6;color:#57534e">Your botanical order is being prepared. We’ll send tracking when it ships.</p>
    <table style="width:100%;border-collapse:collapse;margin:24px 0;font-size:14px">${itemRows}</table>
    <p style="text-align:right;font-size:16px;margin:0 0 24px"><strong>Total ${money(order.totalAmount)}</strong></p>
    <p style="font-size:13px;line-height:1.6;color:#57534e;margin:0"><strong>Ship to</strong><br/>${shipBlock}</p>
  </div>
</body></html>`;

  const from = process.env.EMAIL_FROM?.trim() || DEFAULT_FROM;
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [order.email],
      subject: `Lumina order ${order.orderNumber} confirmed`,
      html,
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Resend ${res.status}: ${detail.slice(0, 400)}`);
  }
  return { skipped: false as const };
}

/** Never throw into the payment path. */
export function queueOrderConfirmation(orderId: string) {
  void sendOrderConfirmation(orderId).catch((err) => {
    console.error('[email] confirmation failed (payment already captured)', orderId, err);
  });
}
