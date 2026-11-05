// Run with the dev server: playwright-cli run-code --filename=tests/final.browser.js
// eslint-disable-next-line @typescript-eslint/no-unused-expressions -- The CLI evaluates this function expression.
async (page) => {
  await page.addInitScript(() => {
    const observer = new MutationObserver(() => {
      const title = document.querySelector('#hero-title');
      const suite = document.querySelector('[data-suite] > div');
      if (!title || !suite) return;
      globalThis.__initialReveal = { title: getComputedStyle(title).opacity, suite: getComputedStyle(suite).opacity };
      observer.disconnect();
    });
    observer.observe(document, { childList: true, subtree: true });
  });
  await page.emulateMedia({ reducedMotion: 'no-preference', colorScheme: 'dark' });
  await page.goto('http://localhost:3000');
  await page.evaluate(() => localStorage.removeItem('theme'));
  await page.reload();
  await page.waitForTimeout(400);
  const initial = await page.evaluate(() => globalThis.__initialReveal);
  if (!initial || initial.title !== '0' || initial.suite !== '0') throw new Error(`Initial reveal must be hidden: ${JSON.stringify(initial)}`);
  const state = () => page.evaluate(() => ({ mode: document.documentElement.dataset.colorMode, theme: document.documentElement.dataset.theme }));
  let current = await state();
  if (current.mode !== 'system' || current.theme !== 'dark') throw new Error('Fresh visits must follow system dark');
  await page.emulateMedia({ colorScheme: 'light' });
  await page.waitForTimeout(400);
  if ((await state()).theme !== 'light') throw new Error('System mode did not follow OS change');
  await page.getByRole('button', { name: 'Dark color mode', exact: true }).click();
  await page.reload();
  await page.waitForTimeout(400);
  current = await state();
  if (current.mode !== 'dark' || current.theme !== 'dark') throw new Error('Explicit dark preference was not remembered');
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.getByRole('button', { name: 'Light color mode', exact: true }).click();
  await page.emulateMedia({ colorScheme: 'light' });
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.waitForTimeout(400);
  if ((await state()).theme !== 'light') throw new Error('OS change overrode explicit light preference');
  await page.getByRole('button', { name: 'System color mode', exact: true }).click();
  await page.reload();
  await page.waitForTimeout(400);
  if ((await state()).mode !== 'system' || (await state()).theme !== 'dark') throw new Error('System selection was not remembered');
  if (await page.getByRole('button', { name: 'System color mode' }).getAttribute('aria-pressed') !== 'true') throw new Error('Selected mode is not exposed');

  for (const width of [320, 390, 768, 1024, 1100, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('http://localhost:3000');
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(1900);
    const result = await page.evaluate(() => {
      const heading = document.querySelector('#hero-title');
      const title = heading.getBoundingClientRect();
      const main = document.querySelector('[data-suite] > div > [class*="main"]');
      const rect = main.getBoundingClientRect();
      const rule = Math.max(12, (innerWidth - 1440) / 2);
      const cursors = [...document.querySelectorAll('[data-cursor]')];
      return {
        titleFits: title.left >= 0 && title.right <= innerWidth && heading.scrollWidth <= heading.clientWidth + 1,
        buttonsFit: [...document.querySelectorAll('button, .btn')].filter((el) => el.getBoundingClientRect().width).every((el) => el.getBoundingClientRect().height <= 36.1),
        navMatches: getComputedStyle(document.querySelector('header')).backgroundColor === getComputedStyle(document.querySelector('#hero-title').closest('section')) .backgroundColor,
        desktopSpace: innerWidth < 1024 || (Math.abs(rect.left - rule - 12) < 1 && Math.abs(innerWidth - rule - rect.right - 12) < 1),
        sidebarFits: innerWidth < 768 || main.querySelector('[class*="sidebar"]').lastElementChild.getBoundingClientRect().bottom <= rect.bottom,
        cursorsLabeled: cursors.every((el) => el.querySelector('span').textContent.endsWith(' agent')),
        cursorSize: cursors.every((el) => el.querySelector('svg').getAttribute('width') === '22'),
        footerHidden: getComputedStyle(document.querySelector('footer nav[hidden]')).display === 'none',
        selectorRight: Math.abs(document.querySelector('footer [role="group"]').getBoundingClientRect().right - document.querySelector('footer [role="group"]').parentElement.getBoundingClientRect().right) < 1,
        navLinks: document.querySelectorAll('header nav a').length === 1 && document.querySelector('header nav a').getAttribute('href') === '/',
      };
    });
    if (Object.values(result).some((ok) => !ok)) throw new Error(`${width}px: ${JSON.stringify(result)}`);
    if (width >= 1024) {
      await page.evaluate(() => {
        const section = document.querySelector('#top');
        window.scrollTo(0, (section.offsetHeight - innerHeight) * 0.145);
      });
      await page.waitForTimeout(1200);
      const visible = await page.locator('[data-suite]').evaluate((el) => {
        const main = el.querySelector('[class*="main"]');
        const sidebar = main.querySelector('[class*="sidebar"]');
        const profile = sidebar.lastElementChild.getBoundingClientRect();
        const hit = document.elementFromPoint(profile.left + 20, profile.top + 10);
        const panels = [...el.querySelectorAll('[data-sat]')].map((panel) => panel.getBoundingClientRect());
        return profile.top > 68 && profile.bottom < innerHeight && sidebar.contains(hit)
          && panels.every((panel) => panel.left >= 0 && panel.right <= innerWidth);
      });
      if (!visible) throw new Error(`${width}px: sidebar is clipped/covered or a floating panel escapes the viewport`);
    }
  }
  const footerBrand = page.locator('footer').getByRole('link', { name: 'Auctervia home', exact: true });
  await footerBrand.focus();
  const focusMatches = await footerBrand.evaluate((el) => {
    const color = getComputedStyle(el).outlineColor;
    const footer = el.closest('footer');
    return color === getComputedStyle(footer).color;
  });
  if (!focusMatches) throw new Error('Footer focus ring does not match its inverted theme');
  await page.getByRole('button', { name: 'Book a pilot', exact: true }).first().click();
  await page.getByRole('dialog').waitFor();
  const tall = await page.getByRole('dialog').locator('button').evaluateAll((els) => els.filter((el) => el.getBoundingClientRect().height > 36.1).map((el) => el.textContent));
  if (tall.length) throw new Error(`Booking buttons over 36px: ${JSON.stringify(tall)}`);
  await page.keyboard.press('Escape');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  if (await page.locator('#hero-title').evaluate((el) => getComputedStyle(el).opacity !== '1')) throw new Error('Reduced motion must keep headline visible');
  const privateContext = await page.context().browser().newContext({ colorScheme: 'dark', reducedMotion: 'reduce' });
  try {
    await privateContext.addInitScript(() => {
      Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('Storage blocked', 'SecurityError'); } });
    });
    const privatePage = await privateContext.newPage();
    await privatePage.goto('http://localhost:3000');
    if (await privatePage.evaluate(() => document.documentElement.dataset.theme) !== 'dark') throw new Error('Blocked storage lost system fallback');
    await privatePage.getByRole('button', { name: 'Light color mode', exact: true }).click();
    if (await privatePage.evaluate(() => document.documentElement.dataset.theme) !== 'light') throw new Error('Blocked storage prevented theme selection');
  } finally {
    await privateContext.close();
  }
  await page.goto('http://localhost:3000/missing-button-check');
  if (await page.locator('h1').textContent() !== '404') throw new Error('404 headline does not match');
  if (await page.locator('main .lede').textContent() !== 'That page doesn’t exist, or it has moved.') throw new Error('404 description does not match');
  const home = page.getByRole('link', { name: 'Go home', exact: true });
  if (await home.getAttribute('href') !== '/' || Math.abs((await home.boundingBox()).height - 36) > 0.1) throw new Error('404 recovery link must be 36px and lead home');
  return 'Themes, 7 viewport widths, 36px buttons, hero layout, agent labels and updated 404 copy passed';
}
