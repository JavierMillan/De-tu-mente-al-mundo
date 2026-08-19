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
  '.png': 'image/png'
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
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server)));
}

async function openMenuPage(browser, url, viewport) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await page.route('**/*', (route) => {
    if (route.request().url().startsWith(url.split('/ingles/')[0])) route.continue();
    else route.abort();
  });
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.locator('#cur').filter({ hasText: '06' }).waitFor();
  await page.waitForFunction(() => getComputedStyle(document.querySelector('.menu-panel')).filter.includes('brightness(1)'));
  return { context, page, pageErrors };
}

async function desktopMeasurements(page) {
  return page.evaluate(() => {
    const box = (selector) => {
      const rect = document.querySelector(selector).getBoundingClientRect();
      return { top: rect.top, right: rect.right, bottom: rect.bottom, left: rect.left, width: rect.width, height: rect.height };
    };
    return {
      height: innerHeight,
      width: innerWidth,
      rig: box('.menu-rig'),
      counter: box('.order-counter'),
      hud: box('#hud'),
      hint: box('#hint'),
      hudColor: getComputedStyle(document.querySelector('#hud')).color,
      panels: document.querySelectorAll('.menu-panel').length,
      rails: document.querySelectorAll('.ceiling-rail').length,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
    };
  });
}

(async () => {
  fs.mkdirSync(screenshotDir, { recursive: true });
  const server = await startServer();
  const address = server.address();
  const base = `http://127.0.0.1:${address.port}`;
  const url = base + '/ingles/sesion-5.html#6';
  const browser = await chromium.launch({ executablePath: edgePath, headless: true });

  try {
    for (const viewport of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }]) {
      const { context, page, pageErrors } = await openMenuPage(browser, url, viewport);
      const metrics = await desktopMeasurements(page);
      const floorTop = viewport.height * 0.89;
      assert.equal(metrics.panels, 3);
      assert.equal(metrics.rails, 0);
      assert.ok(metrics.rig.width >= viewport.width * 0.93, 'Menu board should use at least 93% of viewport width');
      assert.ok(metrics.counter.bottom <= floorTop + 1, 'Counter must end before the navigation-safe floor');
      assert.ok(metrics.hud.top >= floorTop, 'HUD must stay inside the navigation-safe floor');
      assert.ok(metrics.hint.top >= floorTop, 'Navigation hint must stay inside the navigation-safe floor');
      assert.ok(metrics.hud.top - metrics.counter.bottom <= viewport.height * 0.07,
        'The gap between the board and the navigation must stay compact');
      assert.match(metrics.hudColor, /34, 26, 18/);
      assert.ok(metrics.overflow <= 0, 'Desktop layout must not overflow horizontally');
      assert.deepEqual(pageErrors, []);
      await page.screenshot({
        path: path.join(screenshotDir, `session-5-menu-${viewport.width}x${viewport.height}.png`),
        fullPage: true
      });
      await context.close();
    }

    const { context, page, pageErrors } = await openMenuPage(browser, url, { width: 390, height: 844 });
    const mobile = await page.evaluate(() => ({
      panels: document.querySelectorAll('.menu-panel').length,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      columns: getComputedStyle(document.querySelector('.menu-rig')).gridTemplateColumns,
      hudColor: getComputedStyle(document.querySelector('#hud')).color
    }));
    assert.equal(mobile.panels, 3);
    assert.equal(mobile.overflow, 0);
    assert.ok(!mobile.columns.includes(' '), 'Mobile menu panels should use one grid column');
    assert.match(mobile.hudColor, /138, 134, 128/);
    assert.deepEqual(pageErrors, []);
    await page.screenshot({ path: path.join(screenshotDir, 'session-5-menu-390x844.png'), fullPage: true });
    await context.close();

    console.log('session-5 menu browser layout: PASS');
  } finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
