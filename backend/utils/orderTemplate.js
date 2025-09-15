// utils/orderTemplate.js
function generateOrderHtml(order) {
  const items = Array.isArray(order.Items)
    ? order.Items
    : (() => {
        try {
          return JSON.parse(order.Items || '[]');
        } catch (e) {
          console.error('Invalid order.Items JSON', e);
          return [];
        }
      })();

  // Build table rows
  const rows = items.map((item, i) => {
    const price = Number(item.Price) || 0;
    const qty = Number(item.qty) || 0;
    const total = price * qty;

    return `
      <tr>
        <td style="padding: 6px; text-align: center;">${i + 1}</td>
        <td style="padding: 6px;">${item.Name || ''}</td>
        <td style="padding: 6px; text-align: center;">${qty}</td>
        <td style="padding: 6px; text-align: right;">${price.toFixed(2)}</td>
        <td style="padding: 6px; text-align: right;">${total.toFixed(2)}</td>
      </tr>
    `;
  }).join('');

  // Subtotal
  const subtotal = items.reduce((sum, i) => sum + (Number(i.Price) || 0) * (Number(i.qty) || 0), 0);

  // Ensure discount is always a number
  const discountPercent = Number(order.DiscountPercent) || 0;
  const discountAmount = subtotal * discountPercent / 100;

  // GST
  const gstPercent = Number(order.GST) || 0;
  const gstAmount = (subtotal - discountAmount) * (gstPercent / 100);

  // Grand total
  const grandTotal = subtotal - discountAmount + gstAmount;

  const logoUrl = 'http://192.168.1.201:3000/assets/ss_logo.png';

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Order #${order.Id || ''}</title>
    <link href="https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap" rel="stylesheet">
    <style>
      body { font-family: Arial, sans-serif; margin: 0; padding: 0; font-size: 13px; }
      .container { width: 80mm; margin: 0 auto; text-align: center; }
      .logo img { max-width: 70px; margin: 8px auto; display: block; }
      .restaurant-name { margin: 5px 0 0; font-size: 20px; font-weight: bold; text-transform: uppercase; }
      .order-meta { margin: 6px 0; font-size: 13px; }
      table { width: 100%; border-collapse: collapse; margin-top: 10px; }
      th, td { border-bottom: 1px dashed #aaa; }
      th { font-weight: bold; padding: 6px; text-align: center; }
      td { font-size: 13px; }
      tfoot td { font-weight: bold; border-top: 1px solid #000; padding-top: 8px; }
      .total-row td { font-size: 14px; }
      .footer { margin-top: 10px; font-size: 12px; text-align: center; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="logo">
        <img src="${logoUrl}" alt="S S Kitchen Logo">
      </div>

      <h2 class="restaurant-name">S S KITCHEN <span class="tagline">Family Restaurant</span></h2>

      <div class="order-meta">
        <div><b>Order #:</b> ${order.Id || ''}</div>
        <div><b>Table:</b> ${order.TableId || ''} | <b>Waiter:</b> ${order.WaiterId || ''}</div>
        <div>${order.CreatedAt ? new Date(order.CreatedAt).toLocaleString() : ''}</div>
      </div>

      <table>
        <thead>
          <tr>
            <th>#</th>
            <th style="text-align:left;">Item</th>
            <th>Qty</th>
            <th>Rate</th>
            <th>Amt</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
       <tfoot>
          <tr class="total-row">
            <td colspan="4" style="text-align:right;">Subtotal</td>
            <td style="text-align:right;">${subtotal.toFixed(2)}</td>
          </tr>

          ${discountPercent > 0 ? `
            <tr class="total-row">
              <td colspan="4" style="text-align:right;">Discount (${discountPercent}%)</td>
              <td style="text-align:right;">-${discountAmount.toFixed(2)}</td>
            </tr>
          ` : ''}

          <tr class="total-row">
            <td colspan="4" style="text-align:right;">GST (${gstPercent}%)</td>
            <td style="text-align:right;">${gstAmount.toFixed(2)}</td>
          </tr>
          <tr class="total-row">
            <td colspan="4" style="text-align:right;">Grand Total</td>
            <td style="text-align:right;">${grandTotal.toFixed(2)}</td>
          </tr>
        </tfoot>

      </table>

      <div class="footer">
        <p>Thank you for dining with us!</p>
        <p>Visit Again ❤️</p>
      </div>
    </div>
  </body>
  </html>
  `;
}

module.exports = { generateOrderHtml };
