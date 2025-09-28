const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer');

async function collectDemoScripts() {
  const demoDir = path.resolve(__dirname, '..', 'demo');
  const entries = await fs.promises.readdir(demoDir);
  return entries
    .filter((entry) => entry.endsWith('.js'))
    .sort()
    .map((entry) => path.posix.join('demo', entry));
}

async function runDemo(browser, indexHtml, demoPath) {
  const page = await browser.newPage();
  const errors = [];
  const warnings = [];

  page.on('console', (message) => {
    const type = message.type();
    if (type === 'error') {
      errors.push(message.text());
    } else if (type === 'warning') {
      warnings.push(message.text());
    }
  });

  page.on('pageerror', (error) => {
    errors.push(error.message);
  });

  const url = `${indexHtml}?load=${demoPath}`;

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  } catch (error) {
    errors.push(`Navigation failed: ${error.message}`);
  }

  await new Promise((resolve) => setTimeout(resolve, 3000));

  await page.close();
  return { demoPath, errors, warnings };
}

(async () => {
  const indexHtml = 'file:///' + path.resolve(__dirname, '..', 'index.html').replace(/\\/g, '/');
  const demos = await collectDemoScripts();

  const browser = await puppeteer.launch({ headless: 'new', args: ['--allow-file-access-from-files'] });

  const results = [];
  for (const demoPath of demos) {
    const outcome = await runDemo(browser, indexHtml, demoPath);
    results.push(outcome);
  }

  await browser.close();

  const failed = results.filter(({ errors }) => errors.length > 0);

  if (failed.length === 0) {
    console.log('All demos loaded without runtime errors.');
  } else {
    console.log('Demos with runtime errors:');
    for (const { demoPath, errors } of failed) {
      console.log(`- ${demoPath}`);
      for (const error of errors) {
        console.log(`    ${error}`);
      }
    }
  }
})();
