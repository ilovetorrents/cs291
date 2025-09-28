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
  console.log('\n--- Running demo ---');
  console.log(`${demoPath}`);

  const page = await browser.newPage();
  const errors = [];
  const warnings = [];

  page.on('console', (message) => {
    const type = message.type();
    const text = message.text();
    if (type === 'error') {
      console.log(`[console:${type}] ${text}`);
      errors.push(text);
    } else if (type === 'warn') {
      console.log(`[console:${type}] ${text}`);
      warnings.push(text);
    }
  });

  page.on('pageerror', (error) => {
    console.log(`[pageerror] ${error.message}`);
    errors.push(error.message);
  });

  const url = `${indexHtml}?load=${demoPath}`;

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  } catch (error) {
    const navigationMessage = `Navigation failed: ${error.message}`;
    console.log(`[navigation-error] ${navigationMessage}`);
    errors.push(navigationMessage);
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
  const warned = results.filter(({ warnings }) => warnings.length > 0);

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

  if (warned.length > 0) {
    console.log('Demos with runtime warnings:');
    for (const { demoPath, warnings } of warned) {
      console.log(`- ${demoPath}`);
      for (const warning of warnings) {
        console.log(`    ${warning}`);
      }
    }
  }
})();
