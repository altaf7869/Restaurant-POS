const puppeteer = require("puppeteer");
const { generateOrderHtml } = require("./orderTemplate");

async function generateOrderPdf(order) {
  const html = generateOrderHtml(order);
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });

  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: { top: "20px", right: "20px", bottom: "20px", left: "20px" }
  });

  await browser.close();
  return pdfBuffer;
}

module.exports = { generateOrderPdf };
