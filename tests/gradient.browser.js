// Run with the dev server: playwright-cli run-code --filename=tests/gradient.browser.js
// eslint-disable-next-line @typescript-eslint/no-unused-expressions -- The CLI evaluates this function expression.
async (page) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('http://localhost:3000');
    await page.evaluate(() => document.fonts.ready);
    for (const theme of ['light', 'dark']) {
      await page.evaluate((theme) => document.documentElement.dataset.theme = theme, theme);
      const scrollWhy = async (progress) => {
        await page.evaluate((progress) => {
          const section = document.querySelector('[data-statement]').closest('section');
          window.scrollTo(0, section.offsetTop + (section.offsetHeight - innerHeight) * progress);
        }, progress);
        await page.waitForTimeout(1300);
      };
      await scrollWhy(0.79);
      const active = await page.evaluate(() => {
        const gradient = document.querySelector('[data-chart-gradient]');
        const trail = document.querySelector('[data-chart-trail]');
        const word = getComputedStyle(document.querySelector('[data-word]'));
        const numbers = [...document.querySelectorAll('[data-stat] dt')];
        return Number(gradient.getAttribute('x2')) > 0 && Number(gradient.getAttribute('x2')) < 1440
          && Number(getComputedStyle(trail).opacity) > 0
          && word.backgroundImage.includes('255, 122, 122')
          && parseFloat(word.paddingBottom) >= parseFloat(word.fontSize) * 0.15
          && numbers.every((el) => getComputedStyle(el).backgroundImage.includes('255, 122, 122'));
      });
      if (!active) throw new Error(`${width}px / ${theme}: gradient reveals or moving trail missing`);
      await scrollWhy(0.99);
      if (await page.locator('[data-chart-trail]').evaluate((el) => Number(getComputedStyle(el).opacity) > 0.01)) {
        throw new Error('Chart trail must fade at the end');
      }
      for (const section of ['#gateway', '#pilot']) {
        const fills = await page.locator(`${section} [data-crate] .iso-top`).evaluateAll((els) => els.map((el) => getComputedStyle(el).fill));
        if (!fills.length || fills.some((fill) => !fill.includes('crate'))) throw new Error(`${section}: persistent crate gradient missing`);
      }
      const card = page.locator('#platform article').first();
      await card.scrollIntoViewIfNeeded();
      await page.waitForTimeout(1300);
      const before = await card.boundingBox();
      const panel = card.locator('[class*="panel"]').first();
      const panelBefore = await panel.boundingBox();
      await card.hover();
      await page.waitForTimeout(400);
      const after = await card.boundingBox();
      const panelAfter = await panel.boundingBox();
      if (Math.abs(before.x - after.x) > 0.5 || Math.abs(before.y - after.y) > 0.5) throw new Error('Bento card moves on hover');
      if (Math.abs(panelBefore.x - panelAfter.x) > 0.5 || Math.abs(panelBefore.y - panelAfter.y) > 0.5) throw new Error('Bento panel moves on hover');
      if (theme === 'dark') {
        const glow = await card.locator('[class*="stageArea"]').evaluate((el) => getComputedStyle(el, '::before').content);
        if (glow !== 'none') throw new Error('Dark-mode bento glow remains');
      }
    }
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  const reduced = await page.locator('[data-word]').first().evaluate((el) => getComputedStyle(el).animationName === 'none');
  if (!reduced) throw new Error('Word sweep must respect reduced motion');
  return 'Gradient reveals, fading chart trails, permanent crate fills, static bento cards and reduced motion passed';
}
