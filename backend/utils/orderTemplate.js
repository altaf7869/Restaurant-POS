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

  const rows = items
    .map((item, i) => {
      const price = Number(item.Price) || 0;
      const qty = Number(item.qty) || 0;
      const total = price * qty;

      return `
      <tr>
        <td style="padding:1px; text-align:center;">${i + 1}</td>
        <td style="padding:1px; text-align:left;">${item.Name || ''}</td>
        <td style="padding:1px; text-align:center;">${qty}</td>
        <td style="padding:1px; text-align:right;">${Math.round(price)}</td>
        <td style="padding:1px; text-align:right;">${Math.round(total)}</td>
      </tr>
    `;
    })
    .join('');

  const subtotal = Math.round(items.reduce((sum, i) => sum + (Number(i.Price) || 0) * (Number(i.qty) || 0), 0));
  const discountPercent = Number(order.DiscountPercent) || 0;
  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const gstPercent = Number(order.GST) || 0;
  const gstAmount = Math.round((subtotal - discountAmount) * (gstPercent / 100));
  const grandTotal = subtotal - discountAmount + gstAmount;

  const logoUrl = 'http://192.168.1.201:3000/assets/ss_logo.png';
  const formattedDate = new Date(order.CreatedAt || Date.now()).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour12: true,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Order #${order.Id || ''}</title>
    <style>
      body { font-family: monospace; margin:0; padding:0; font-size:9px; }
      .container { width: 55mm; margin:0 auto; text-align:center; } /* narrower for 58mm printer */
      .logo img { max-width:40px; margin:2px auto; display:block; }
      .restaurant-name { margin:2px 0; font-size:12px; font-weight:bold; text-transform:uppercase; }
      .address { font-size:8px; line-height:1.2; margin-bottom:2px; }
      .order-meta { margin:2px 0; font-size:9px; }
      table { width:100%; border-collapse: collapse; margin-top:2px; }
      th, td { border-bottom: 1px dashed #aaa; font-size:9px; padding:1px; }
      th { font-weight:bold; }
      tfoot td { font-weight:bold; border-top:1px solid #000; padding-top:2px; }
      .total-row td { font-size:10px; }
      .footer { margin-top:2px; font-size:8px; text-align:center; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="logo">
        <img src="${logoUrl}" alt="Logo">
      </div>

      <h2 class="restaurant-name">S S KITCHEN</h2>
      <div class="address">
        30, Saptagiri Complex, Opp. Hotel Taj Vivanta,<br>
        Akota Garden Main Road, Akota, Vadodara
      </div>

      <div class="order-meta">
        <div><b>Order #:</b> ${order.Id || ''}</div>
        <div><b>Table:</b> ${order.TableId || ''} | <b>Waiter:</b> ${order.WaiterId || ''}</div>
        <div><b>Date:</b> ${formattedDate}</div>
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
            <td style="text-align:right;">${subtotal}</td>
          </tr>

          ${discountPercent > 0 ? `
            <tr class="total-row">
              <td colspan="4" style="text-align:right;">Discount (${discountPercent}%)</td>
              <td style="text-align:right;">-${discountAmount}</td>
            </tr>
          ` : ''}

          <tr class="total-row">
            <td colspan="4" style="text-align:right;">GST (${gstPercent}%)</td>
            <td style="text-align:right;">${gstAmount}</td>
          </tr>
          <tr class="total-row">
            <td colspan="4" style="text-align:right;">Grand Total</td>
            <td style="text-align:right;">${grandTotal}</td>
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
