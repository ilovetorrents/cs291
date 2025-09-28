const path = require('path');
const puppeteer = require('puppeteer');

async function main() {
  const demo = process.argv[2];
  if (!demo) {
    console.error('Usage: node tools/run-single.js <demo-path>');
    process.exit(1);
  }
  const indexHtml = 'file:///' + path.resolve(__dirname, '..', 'index.html').replace(/\\/g, '/');
  const browser = await puppeteer.launch({ headless: 'new', args: ['--allow-file-access-from-files'] });
  const page = await browser.newPage();
  page.on('console', (msg) => {
    console.log('console:', msg.type(), msg.text());
  });
  page.on('pageerror', (err) => {
    console.log('pageerror:', err.message, err.stack);
  });
  const url = `${indexHtml}?load=${demo}`;
  console.log('Loading', url);
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise((resolve) => setTimeout(resolve, 5000));
  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
