import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  const outDir = path.join(__dirname, 'tmp-visual-check');
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  await page.goto(baseUrl, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1500);

  const canvas = page.locator('canvas.face-drop-canvas');
  await canvas.waitFor({ state: 'attached', timeout: 10000 });

  const before = await page.evaluate(() => {
    const canvasEl = document.querySelector('canvas.face-drop-canvas');
    if (!canvasEl) return { exists: false };

    return {
      exists: true,
      width: canvasEl.width,
      height: canvasEl.height,
      zIndex: getComputedStyle(canvasEl).zIndex,
      background: getComputedStyle(canvasEl).backgroundColor,
      mixBlendMode: getComputedStyle(canvasEl).mixBlendMode,
      pointerEvents: getComputedStyle(canvasEl).pointerEvents,
      parent: canvasEl.parentElement?.tagName ?? null,
    };
  });

  await page.screenshot({ path: path.join(outDir, '01-initial.png'), fullPage: false });

  await page.locator('a.cycle').click();
  await page.waitForTimeout(2500);

  const afterClick = await page.evaluate(() => {
    const canvasEl = document.querySelector('canvas.face-drop-canvas');
    if (!canvasEl || !canvasEl.getContext) return { visiblePixels: null, tainted: false };

    const ctx = canvasEl.getContext('2d');
    const { width, height } = canvasEl;

    try {
      const data = ctx.getImageData(0, 0, width, height).data;
      let visiblePixels = 0;

      for (let i = 3; i < data.length; i += 4) {
        if (data[i] > 10) visiblePixels += 1;
      }

      return { visiblePixels, width, height, tainted: false };
    } catch {
      return { visiblePixels: null, width, height, tainted: true };
    }
  });

  await page.screenshot({ path: path.join(outDir, '02-after-push-me.png'), fullPage: false });

  console.log(JSON.stringify({ baseUrl, before, afterClick }, null, 2));

  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
