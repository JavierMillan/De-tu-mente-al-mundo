const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require('C:/Users/Usuario/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

const projectRoot = path.resolve(__dirname, '..');
const screenshotDir = process.argv[2] || path.join(projectRoot, 'test-results');
const edgePath = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const mime = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8'
};

function startServer() {
  const server = http.createServer((request, response) => {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const requested = path.resolve(projectRoot, '.' + pathname);
    if (!requested.startsWith(projectRoot + path.sep)) {
      response.writeHead(403).end('Forbidden');
      return;
    }
    fs.readFile(requested, (error, contents) => {
      if (error) {
        response.writeHead(404).end('Not found');
        return;
      }
      response.writeHead(200, { 'content-type': mime[path.extname(requested)] || 'application/octet-stream' });
      response.end(contents);
    });
  });
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

async function blockExternal(page, origin) {
  await page.route('**/*', (route) => {
    if (route.request().url().startsWith(origin)) route.continue();
    else route.abort();
  });
}

async function addTicketItems(page) {
  const ticketLines = await page.locator('.ticket-lines li').allTextContents();
  const catalog = await page.evaluate(() => window.GrammarGrillModel.CATALOG);
  const longestNamesFirst = [...catalog].sort((a, b) => b.name.length - a.name.length);

  for (const ticketLine of ticketLines) {
    const quantity = Number(ticketLine.match(/^\d+/)[0]);
    const item = longestNamesFirst.find((entry) =>
      ticketLine.endsWith(entry.name) || ticketLine.endsWith(entry.name + 's')
    );
    assert.ok(item, 'Ticket item should exist in the catalog: ' + ticketLine);
    const size = ['Small', 'Medium', 'Large'].find((candidate) => ticketLine.includes(candidate + ' '));
    await page.getByRole('button', { name: item.category.toUpperCase(), exact: true }).click();
    const addName = 'Add ' + (size ? size + ' ' : '') + item.name;
    for (let count = 0; count < quantity; count += 1) {
      await page.getByRole('button', { name: addName, exact: true }).click();
    }
  }
}

(async () => {
  fs.mkdirSync(screenshotDir, { recursive: true });
  const server = await startServer();
  const address = server.address();
  const origin = `http://127.0.0.1:${address.port}/`;
  const url = origin + 'ingles/recursos/grammar-grill.html';
  const browser = await chromium.launch({ executablePath: edgePath, headless: true });

  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    const pageErrors = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));
    await blockExternal(page, origin);
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    await page.getByRole('button', { name: /I'm ordering food/i }).click();
    await page.getByRole('button', { name: 'Add Big Mac', exact: true }).click();
    await page.getByRole('button', { name: 'SIDES', exact: true }).click();
    await page.getByRole('button', { name: 'Add Medium Fries', exact: true }).click();
    await page.getByRole('button', { name: 'DRINKS', exact: true }).click();
    await page.getByRole('button', { name: 'Add Small Soda', exact: true }).click();
    await page.getByRole('button', { name: 'Add Small Soda', exact: true }).click();
    assert.equal(await page.locator('.cart-total b').textContent(), '$165');
    await page.getByRole('button', { name: 'CREATE ORDER', exact: true }).click();
    await page.getByRole('heading', { name: 'ORDER CREATED!' }).waitFor();
    assert.equal(await page.locator('#confetti i').count(), 72);
    await page.screenshot({ path: path.join(screenshotDir, 'grammar-grill-customer-success.png'), fullPage: true });
    await page.getByRole('button', { name: 'CREATE ANOTHER ORDER', exact: true }).click();
    assert.equal(await page.locator('.empty').textContent(), 'Your order is empty.');

    await page.locator('#reset-app').click();
    await page.getByRole('button', { name: /I'm preparing an order/i }).click();
    await page.getByRole('button', { name: 'CHECK ORDER', exact: true }).click();
    await page.getByText('Your order is empty. Add at least one item.', { exact: true }).waitFor();
    await addTicketItems(page);
    await page.getByRole('button', { name: 'CHECK ORDER', exact: true }).click();
    await page.getByRole('heading', { name: 'ORDER READY!' }).waitFor();
    assert.equal(await page.locator('#confetti i').count(), 72);
    await page.screenshot({ path: path.join(screenshotDir, 'grammar-grill-delivery-success.png'), fullPage: true });
    await page.getByRole('button', { name: 'PREPARE ANOTHER ORDER', exact: true }).click();
    assert.equal(await page.locator('.empty').textContent(), 'Your order is empty.');
    assert.ok(await page.locator('.ticket-lines li').count() >= 1);
    assert.deepEqual(pageErrors, []);
    await context.close();

    const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const mobilePage = await mobileContext.newPage();
    await blockExternal(mobilePage, origin);
    await mobilePage.goto(url, { waitUntil: 'domcontentloaded' });
    await mobilePage.getByRole('button', { name: /I'm ordering food/i }).click();
    const overflow = await mobilePage.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    assert.ok(overflow <= 0, 'Mobile layout should not overflow horizontally; overflow=' + overflow);
    await mobilePage.screenshot({ path: path.join(screenshotDir, 'grammar-grill-mobile.png'), fullPage: true });
    await mobileContext.close();

    const reducedContext = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      reducedMotion: 'reduce'
    });
    const reducedPage = await reducedContext.newPage();
    await blockExternal(reducedPage, origin);
    await reducedPage.goto(url, { waitUntil: 'domcontentloaded' });
    await reducedPage.getByRole('button', { name: /I'm ordering food/i }).click();
    await reducedPage.getByRole('button', { name: 'Add Big Mac', exact: true }).click();
    await reducedPage.getByRole('button', { name: 'CREATE ORDER', exact: true }).click();
    await reducedPage.getByRole('heading', { name: 'ORDER CREATED!' }).waitFor();
    assert.equal(await reducedPage.locator('#confetti i').count(), 0);
    await reducedContext.close();

    console.log('grammar-grill browser flows: PASS');
  } finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
