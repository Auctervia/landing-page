// Run with the dev server: playwright-cli run-code --filename=tests/brand-menu.browser.js
// eslint-disable-next-line @typescript-eslint/no-unused-expressions -- The CLI evaluates this function expression.
async (page) => {
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('http://localhost:3000');
  const brand = page.locator('header').getByRole('link', { name: 'Auctervia home', exact: true });
  const menu = page.getByRole('menu', { name: 'Copy Auctervia brand assets' });
  await brand.focus();
  await page.keyboard.press('Shift+F10');
  await menu.waitFor();
  if (await menu.getByRole('menuitem').count() !== 4) throw new Error('Expected four logo export commands');
  if (await menu.locator('button svg').count() !== 4) throw new Error('Every export command needs an icon');
  await page.keyboard.press('End');
  if (!await menu.getByRole('menuitem', { name: 'Copy logomark as PNG', exact: true }).evaluate((el) => el === document.activeElement)) throw new Error('Menu End key failed');
  await page.keyboard.press('Home');
  await page.keyboard.press('ArrowDown');
  if (!await menu.getByRole('menuitem', { name: 'Copy logomark as SVG', exact: true }).evaluate((el) => el === document.activeElement)) throw new Error('Menu arrow navigation failed');
  await page.keyboard.press('Escape');
  await menu.waitFor({ state: 'detached' });
  if (!await brand.evaluate((el) => el === document.activeElement)) throw new Error('Context menu did not return focus');
  await page.keyboard.press('Shift+F10');
  await page.keyboard.press('Tab');
  await menu.waitFor({ state: 'detached' });

  for (const theme of ['Light', 'Dark']) {
    await page.getByRole('button', { name: `${theme} color mode`, exact: true }).click();
    await page.waitForTimeout(800);
    for (const format of ['SVG', 'PNG']) {
      for (const variant of ['logo', 'logomark']) {
        await brand.click({ button: 'right' });
        await menu.getByRole('menuitem', { name: `Copy ${variant} as ${format}`, exact: true }).click();
        await menu.waitFor({ state: 'detached' });
        const result = await page.evaluate(async ({ format }) => {
          if (format === 'SVG') {
            const text = await navigator.clipboard.readText();
            const svg = new DOMParser().parseFromString(text, 'image/svg+xml');
            return { paths: svg.querySelectorAll('path').length, text: svg.querySelectorAll('text').length, error: !!svg.querySelector('parsererror'), colorMatches: svg.documentElement.getAttribute('fill') === getComputedStyle(document.querySelector('header a')).color };
          }
          const items = await navigator.clipboard.read();
          const blob = await items[0].getType('image/png');
          const image = await createImageBitmap(blob);
          const canvas = document.createElement('canvas');
          canvas.width = image.width;
          canvas.height = image.height;
          const context = canvas.getContext('2d');
          context.drawImage(image, 0, 0);
          const pixels = context.getImageData(0, 0, image.width, image.height).data;
          return { width: image.width, height: image.height, transparent: pixels[3] === 0, content: pixels.some((value, index) => index % 4 === 3 && value > 0) };
        }, { format });
        if (format === 'SVG') {
          if (result.error || result.text || !result.colorMatches || result.paths !== (variant === 'logo' ? 3 : 2)) throw new Error(`Invalid ${theme} ${variant} SVG: ${JSON.stringify(result)}`);
        } else if (!result.transparent || !result.content || result.width !== (variant === 'logo' ? 567 : 144) || result.height !== 144) {
          throw new Error(`Invalid ${variant} PNG dimensions: ${JSON.stringify(result)}`);
        }
      }
    }
  }
  await brand.click({ button: 'right' });
  await page.locator('#hero-title').click();
  await menu.waitFor({ state: 'detached' });
  await page.setViewportSize({ width: 320, height: 600 });
  await brand.evaluate((el) => el.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, button: 2, clientX: innerWidth - 1, clientY: innerHeight - 1 })));
  const bounds = await menu.boundingBox();
  if (bounds.x < 0 || bounds.y < 0 || bounds.x + bounds.width > 320 || bounds.y + bounds.height > 600) throw new Error('Context menu escapes viewport');
  await page.evaluate(() => window.scrollBy(0, 100));
  await menu.waitFor({ state: 'detached' });
  await page.evaluate(() => Object.defineProperty(navigator.clipboard, 'write', { configurable: true, value: () => Promise.reject(new DOMException('Denied', 'NotAllowedError')) }));
  await brand.click({ button: 'right' });
  await menu.getByRole('menuitem', { name: 'Copy logomark as SVG', exact: true }).click();
  await menu.getByRole('alert').waitFor();
  await page.keyboard.press('Escape');

  await page.goto('http://localhost:3000/missing-brand-check');
  await page.locator('header').getByRole('link', { name: 'Auctervia home', exact: true }).click();
  await page.waitForURL('http://localhost:3000/');
  return 'Logo navigation, keyboard/outside dismissal, icons, SVG/PNG exports in both themes, outlined wordmark and clipboard-denied feedback passed';
}
