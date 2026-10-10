// Run with a local static server, e.g. python3 -m http.server 8766.
// Set PUPPETEER_MODULE to an existing Puppeteer install if it is not in node_modules.
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const modulePath = process.env.PUPPETEER_MODULE;
const driver = await import(modulePath ? pathToFileURL(modulePath).href : 'puppeteer');
const puppeteer = driver.puppeteer || driver.default;
const chrome = process.env.PORTFOLIO_CHROME || (existsSync('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome') ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' : undefined);
const base = process.env.SITE_URL || 'http://127.0.0.1:8766';
const screenshots = process.env.SCREENSHOT_DIR || '/private/tmp/portfolio-final';
mkdirSync(screenshots, { recursive: true });
const routes = ['/', '/about/', '/experience/', '/skills/', '/projects/', '/projects/docviz-ai/', '/projects/project-her/', '/projects/rca-tool/', '/projects/doc-portal-reviewer/', '/playground/', '/contact/'];
const widths = [1440, 768, 390, 360];
const browserProfile = mkdtempSync(path.join(tmpdir(), 'portfolio-smoke-'));
const browser = await puppeteer.launch({ executablePath: chrome, headless: true, userDataDir: browserProfile });
let checked = 0;
try {
  for (const width of widths) {
    for (const route of routes) {
      const page = await browser.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.setViewport({ width, height: width >= 768 ? 1000 : 844 });
      const response = await page.goto(base + route, { waitUntil: 'domcontentloaded', timeout: 30000 });
      assert.ok([200, 304].includes(response.status()), `${route} HTTP ${response.status()}`);
      await new Promise(resolve => setTimeout(resolve, 400));
      const state = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        main: !!document.querySelector('main'),
        resumeLinks: [...document.querySelectorAll('a[href*="Bill_Klinten_Guduru_Resume.pdf"]')].map(a => a.href),
      }));
      assert.equal(errors.length, 0, `${route} at ${width}px: ${errors.join('; ')}`);
      assert.ok(state.scrollWidth <= width + 2, `${route} overflows at ${width}px: ${state.scrollWidth}`);
      assert.ok(state.main, `${route} has no main landmark`);
      assert.ok(state.resumeLinks.length > 0 && state.resumeLinks.every(link => new URL(link).pathname === '/assets/Bill_Klinten_Guduru_Resume.pdf'), `${route} resume link`);
      if (width === 390 && (route === '/' || route === '/contact/')) {
        if (route === '/') {
          await page.focus('#hamburger');
          await page.keyboard.press('Enter');
        } else {
          await page.click('#hamburger');
        }
        assert.ok(await page.$eval('#navLinks', e => e.classList.contains('active')), `${route} mobile menu did not open`);
        assert.equal(await page.$eval('#hamburger', e => e.getAttribute('aria-expanded')), 'true');
        await page.keyboard.press('Escape');
        assert.ok(!(await page.$eval('#navLinks', e => e.classList.contains('active'))), `${route} Escape did not close menu`);
        assert.equal(await page.evaluate(() => document.activeElement?.id), 'hamburger', `${route} menu did not restore keyboard focus`);
        if (route === '/') {
          await page.screenshot({ path: path.join(screenshots, 'home-mobile.png'), fullPage: true });
          await page.click('#themeToggle');
          assert.equal(await page.evaluate(() => document.documentElement.getAttribute('data-theme')), 'light');
          await new Promise(resolve => setTimeout(resolve, 550));
          const lightColors = await page.evaluate(() => ({ background: getComputedStyle(document.body).backgroundColor, heading: getComputedStyle(document.getElementById('work-title')).color }));
          assert.equal(lightColors.background, 'rgb(250, 249, 247)', 'Light theme background');
          assert.equal(lightColors.heading, 'rgb(26, 26, 26)', 'Light theme heading contrast');
          await page.screenshot({ path: path.join(screenshots, 'home-mobile-light.png'), fullPage: true });
        }
      }
      if (width === 1440 && route === '/') {
        await page.screenshot({ path: path.join(screenshots, 'home-desktop.png'), fullPage: true });
        await page.evaluate(() => { window.scrollTo({ top: document.getElementById('work').offsetTop + 100, behavior: 'instant' }); window.dispatchEvent(new Event('scroll')); });
        await new Promise(resolve => setTimeout(resolve, 100));
        assert.ok(await page.$eval('a[href="#work"].nav-link', e => e.classList.contains('active')), 'Work navigation is not active at its section');
      }
      if (width === 768 && route === '/playground/') {
        assert.ok(await page.$eval('#labAvailability', e => !e.hidden), 'Missing public AI availability notice');
        assert.ok(await page.$eval('#analyzeBtn', e => e.disabled), 'Unconfigured AI analyzer accepts input');
        assert.ok(await page.$eval('.her-studio-wrapper', e => e.hidden), 'Unverified HER generator is shown');
        assert.ok(await page.$eval('#herBtnGenerate', e => e.disabled), 'Unverified HER generator is enabled');
        await page.focus('[data-tab="fit"]');
        await page.keyboard.press('Enter');
        assert.ok(await page.$eval('#tab-fit', e => e.classList.contains('active')), 'AI tab switch failed');
      }
      if (width === 1440 && route === '/projects/') {
        await page.click('[data-filter="rag"]');
        assert.ok(await page.$eval('[data-category="rag,ai-agents,video"]', e => !e.classList.contains('hidden')), 'Multi-category filter failed');
      }
      if (width === 1440 && route === '/contact/') {
        assert.ok(await page.$('a[href="mailto:klintenguduru@gmail.com"]'), 'Direct email action missing');
        assert.ok(await page.$('#copyEmail'), 'Copy email action missing');
        await page.click('#copyEmail');
        await page.waitForFunction(() => document.getElementById('copyEmail').textContent !== 'Copy email address');
      }
      if (width === 360 && route === '/projects/docviz-ai/') await page.screenshot({ path: path.join(screenshots, 'case-mobile.png'), fullPage: true });
      checked++;
      await page.close();
    }
  }
  const noJs = await browser.newPage();
  await noJs.setViewport({ width: 390, height: 844 });
  await noJs.setJavaScriptEnabled(false);
  await noJs.goto(base + '/', { waitUntil: 'domcontentloaded' });
  assert.ok(await noJs.$eval('#navLinks', e => getComputedStyle(e).opacity === '1'), 'Navigation hidden without JavaScript');
  assert.ok(await noJs.$eval('#work', e => e.innerText.includes('Project HER')), 'Projects hidden without JavaScript');
  await noJs.goto(base + '/projects/docviz-ai/', { waitUntil: 'domcontentloaded' });
  assert.ok(await noJs.$eval('main', e => e.innerText.includes('Architecture')), 'Case-study content hidden without JavaScript');
  await noJs.close();
  const reduced = await browser.newPage();
  await reduced.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await reduced.goto(base + '/', { waitUntil: 'domcontentloaded' });
  assert.ok(await reduced.$eval('#work', e => !!e.offsetHeight), 'Content hidden with reduced motion');
  await reduced.close();
  const resume = await fetch(base + '/assets/Bill_Klinten_Guduru_Resume.pdf', { method: 'HEAD' });
  assert.equal(resume.status, 200, 'Resume PDF unavailable');
  console.log(`PASS: ${checked} route/width checks, mobile menu, keyboard, tabs, filter, AI disabled state, contact, no-JS, reduced motion, resume. Screenshots: ${screenshots}`);
} finally {
  await browser.close();
  rmSync(browserProfile, { recursive: true, force: true });
}
