import { test, expect } from './fixtures';
import { motionSpans, samplePositions } from './measurements';

test('Deriva moves multiple cards and pauses offscreen before resuming', async ({ page }) => {
  // A short viewport allows the entire gallery to leave the screen.
  await page.setViewportSize({ width: page.viewportSize()!.width, height: 400 });
  await page.goto('/experiments/');
  await page.evaluate(() => document.fonts.ready);
  const gallery = page.locator('[data-experiment-drift]');
  const cards = gallery.locator('.entry-gallery__item:nth-child(-n+3) .entry-gallery__card');
  await expect(cards).toHaveCount(3);
  const show = () => gallery.evaluate(e => e.scrollIntoView({ block: 'start', behavior: 'instant' }));
  const spans = async () => motionSpans(await samplePositions(cards));
  await show();
  await expect.poll(async () => (await spans()).every(span => span > 0.5)).toBe(true);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await expect.poll(() => gallery.evaluate(e => e.getBoundingClientRect().top > innerHeight + 64)).toBe(true);
  // Observe rest instead of assuming the observer is ready after a fixed delay.
  await expect.poll(async () => (await spans()).every(span => span < 0.1)).toBe(true);
  expect(motionSpans(await samplePositions(cards, 800)).every(span => span < 0.1)).toBe(true);
  await show();
  await expect.poll(async () => (await spans()).every(span => span > 0.5)).toBe(true);
});

test('grid switch works with keyboard; reduced motion stops and resumes the cards', async ({ page }) => {
  await page.goto('/experiments/');
  const gallery = page.locator('[data-experiment-drift]');
  const cards = gallery.locator('.entry-gallery__item:nth-child(-n+3) .entry-gallery__card');
  await expect(cards).toHaveCount(3);
  const toggle = page.locator('[data-view-switch]');
  await toggle.click();
  await expect(page.locator('[data-moving-view]')).toBeHidden();
  await expect(page.locator('[data-static-view]')).toBeVisible();
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  await toggle.focus();
  const restingY = await toggle.evaluate(e => e.getBoundingClientRect().y);
  await page.keyboard.down('Space');
  await expect.poll(() => toggle.evaluate(e => e.getBoundingClientRect().y)).toBeGreaterThan(restingY);
  await page.keyboard.up('Space');
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await expect(gallery).toBeVisible();
  await expect(page.locator('[data-static-view]')).toBeHidden();
  await gallery.evaluate(e => e.scrollIntoView({ block: 'start', behavior: 'instant' }));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect.poll(async () => motionSpans(await samplePositions(cards)).every(span => span < 0.1)).toBe(true);
  expect(motionSpans(await samplePositions(cards, 800)).every(span => span < 0.1)).toBe(true);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect.poll(async () => motionSpans(await samplePositions(cards)).every(span => span > 0.5)).toBe(true);
});
