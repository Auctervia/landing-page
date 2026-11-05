// Run against the dev server: playwright-cli run-code --filename=tests/polish.browser.js
// eslint-disable-next-line @typescript-eslint/no-unused-expressions -- The CLI evaluates this function expression.
async (page) => {
  const checks = [];
  for (const reducedMotion of ['no-preference', 'reduce']) {
    await page.emulateMedia({ reducedMotion });
    for (const width of [390, 768, 1024, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('http://localhost:3000');
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(1200);
      if (reducedMotion === 'no-preference') {
        await page.evaluate(() => {
          const section = document.querySelector('[data-statement]').closest('section');
          window.scrollTo(0, section.offsetTop + (section.offsetHeight - innerHeight) * 0.45);
        });
        await page.waitForTimeout(1200);
        const centered = await page.locator('[data-statement]').evaluate((el) => {
          const rect = el.getBoundingClientRect();
          const nav = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'));
          return Math.abs(rect.left + rect.width / 2 - innerWidth / 2) < 2
            && Math.abs(rect.top + rect.height / 2 - (innerHeight + nav) / 2) < 2;
        });
        if (!centered) throw new Error(`${width}px: statement must remain centered before moving`);
      }
      for (const theme of ['light', 'dark']) {
        await page.evaluate((theme) => {
          document.documentElement.dataset.theme = theme;
          const section = document.querySelector('[data-statement]').closest('section');
          window.scrollTo(0, section.offsetTop + (section.offsetHeight - innerHeight) * 0.85);
        }, theme);
        await page.waitForTimeout(1200);
        const result = await page.evaluate(() => {
          const text = document.querySelector('[data-statement]').getBoundingClientRect();
          const stats = document.querySelector('[data-stats]').getBoundingClientRect();
          const buttons = [...document.querySelectorAll('button, .btn')].filter((el) => el.getBoundingClientRect().width);
          return {
            overlap: text.bottom > stats.top,
            aligned: Math.abs(text.left - stats.left) < 2,
            fits: stats.right <= innerWidth && text.left >= 0 && text.right <= innerWidth,
            overflow: document.documentElement.scrollWidth > innerWidth,
            buttons: buttons.every((el) => {
              const style = getComputedStyle(el);
              return style.borderRadius === '8px' && style.transitionDuration === '0s';
            }),
            backgroundRemoved: !document.querySelector('[data-light-edge], canvas'),
          };
        });
        if (result.overlap || !result.aligned || !result.fits || result.overflow || !result.buttons || !result.backgroundRemoved) {
          throw new Error(`${width}px / ${theme} / ${reducedMotion}: ${JSON.stringify(result)}`);
        }
        checks.push(`${width}px / ${theme} / ${reducedMotion}`);
      }
    }
  }
  return `${checks.length} responsive/theme/motion combinations passed`;
}
