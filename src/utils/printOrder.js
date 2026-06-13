// Opens a print-friendly invoice for an order/guest order in a new window
// and triggers the browser print dialog.
export function printOrder(order, { guest = false } = {}) {
  const win = window.open('', '_blank', 'width=800,height=900');
  if (!win) return;

  const itemsHtml = (order.items || []).map(it => `
    <tr>
      <td>${it.name}</td>
      <td style="text-align:center;">${it.quantity}</td>
      <td style="text-align:right;">${Number(it.price).toFixed(3)} KD</td>
      <td style="text-align:right;">${Number(it.total).toFixed(3)} KD</td>
    </tr>
  `).join('');

  const customerName = guest ? order.name : (order.user?.name || '-');
  const date = order.createdAt ? new Date(order.createdAt).toLocaleString() : '-';
  const discount = Number(order.discount || 0);

  win.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Order ${order.order_number}</title>
        <meta charset="utf-8" />
        <style>
          body { font-family: Arial, Helvetica, sans-serif; padding: 32px; color: #333; }
          h1 { font-size: 20px; color: #FF383C; margin: 0 0 4px; }
          .meta { margin-bottom: 16px; font-size: 13px; color: #555; }
          .meta div { margin-bottom: 2px; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 13px; }
          th, td { padding: 8px; border-bottom: 1px solid #eee; text-align: left; }
          th { border-bottom: 2px solid #FF383C; text-align: left; }
          .totals { width: 280px; margin-left: auto; margin-top: 16px; }
          .totals td { padding: 4px 8px; border-bottom: none; }
          .totals .label { text-align: right; color: #555; }
          .totals .value { text-align: right; }
          .totals .grand td { font-weight: 700; font-size: 15px; border-top: 2px solid #FF383C; padding-top: 8px; }
        </style>
      </head>
      <body>
        <h1>Shiry Kids</h1>
        <div class="meta">
          <div><strong>Order #</strong> ${order.order_number}</div>
          <div><strong>Customer:</strong> ${customerName}</div>
          ${guest ? `<div><strong>Phone:</strong> ${order.phone || '-'}</div><div><strong>Address:</strong> ${order.address || '-'}</div>` : ''}
          <div><strong>Date:</strong> ${date}</div>
          <div><strong>Payment:</strong> ${(order.payment_method || '').toUpperCase()} (${order.payment_status})</div>
          <div><strong>Order Status:</strong> ${order.order_status}</div>
        </div>
        <table>
          <thead>
            <tr><th>Item</th><th style="text-align:center;">Qty</th><th style="text-align:right;">Price</th><th style="text-align:right;">Total</th></tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        <table class="totals">
          <tr><td class="label">Subtotal</td><td class="value">${Number(order.subtotal).toFixed(3)} KD</td></tr>
          ${discount > 0 ? `<tr><td class="label">Discount</td><td class="value">-${discount.toFixed(3)} KD</td></tr>` : ''}
          <tr><td class="label">Delivery</td><td class="value">${Number(order.delivery_fees || 0).toFixed(3)} KD</td></tr>
          <tr class="grand"><td class="label">Total</td><td class="value">${Number(order.total).toFixed(3)} KD</td></tr>
        </table>
      </body>
    </html>
  `);
  win.document.close();
  win.focus();
  win.print();
}
