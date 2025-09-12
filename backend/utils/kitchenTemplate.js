// utils/kitchenTemplate.js

function generateKitchenHtml(tableNumber, items) {
  const rows = items.map((item, i) => {
    const qty = Number(item.qty) || 0;
    return `
      <tr>
        <td style="padding: 4px; text-align: center;">${i + 1}</td>
        <td style="padding: 4px;">${item.Name || ''}</td>
        <td style="padding: 4px; text-align: center;">${qty}</td>
      </tr>
    `;
  }).join('');

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Kitchen Print - Table ${tableNumber}</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
        font-size: 14px;
      }
      .container {
        width: 80mm;
        margin: 0 auto;
        text-align: center;
      }
      h2 {
        margin: 5px 0;
        font-size: 18px;
        text-transform: uppercase;
        color: #d9534f;
      }
      .table-info {
        margin: 5px 0 10px;
        font-size: 14px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      th, td {
        border-bottom: 1px dashed #333;
        padding: 4px;
        text-align: left;
      }
      th {
        font-weight: bold;
      }
      .footer {
        margin-top: 10px;
        font-size: 12px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h2>Kitchen Slip</h2>
      <div class="table-info">
        <div><b>Table:</b> ${tableNumber}</div>
        <div><b>Time:</b> ${new Date().toLocaleTimeString()}</div>
      </div>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Item</th>
            <th>Qty</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
      <div class="footer">
        <p>Prepare promptly!</p>
      </div>
    </div>
  </body>
  </html>
  `;
}

module.exports = { generateKitchenHtml };
