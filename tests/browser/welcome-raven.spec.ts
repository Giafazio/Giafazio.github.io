import type { Page } from '@playwright/test';
import { test, expect } from './fixtures';

const englishSrc = '**/corvo-lessgo.gif';
const italianSrc = '**/corvo-daje-tutta-cartiglio-5.gif';
const imageSelector = '.welcome-raven-flight img';

function gate() {
  let release!: () => void;
  const promise = new Promise<void>(resolve => { release = resolve; });
  return { promise, release };
}

// Read every rendered frame through the end of the flight. No app state or
// animation timing is altered. A premature disappearance is a failed trajectory.
function observeFlight(page: Page) {
  return page.evaluate(selector => new Promise<{
    frames: { x: number; src: string; ready: boolean }[]; ended: boolean; viewport: number;
  }>(resolve => {
    const frames: { x: number; src: string; ready: boolean }[] = [];
    const started = performance.now();
    function sample() {
      const image = document.querySelector<HTMLImageElement>(selector);
      if (!image || performance.now() - started > 8000) {
        resolve({ frames, ended: !image, viewport: innerWidth });
        return;
      }
      const box = image.getBoundingClientRect();
      frames.push({ x: box.x, src: image.getAttribute('src')!, ready:
        image.complete && image.naturalWidth > 0 && box.width > 0 && box.height > 0 &&
        image.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true }) });
      requestAnimationFrame(sample);
    }
    requestAnimationFrame(sample);
  }), imageSelector);
}

function expectContinuousFlight(observation: Awaited<ReturnType<typeof observeFlight>>) {
  const { frames, ended, viewport } = observation;
  expect(ended, 'The flight must finish').toBe(true);
  expect(frames.length).toBeGreaterThan(20);
  expect(frames.every(frame => frame.ready), 'Each observed frame must contain a loaded, visible image').toBe(true);
  expect(frames[0].x, 'Start outside the left edge').toBeLessThan(0);
  expect(frames.at(-1)!.x, 'Disappear only after crossing the screen').toBeGreaterThan(viewport * 0.85);
  expect(frames.every((frame, i) => i === 0 || frame.x >= frames[i - 1].x - 0.5),
    'Language changes must not jump back along the trajectory').toBe(true);
}

async function expectNoFlightDuring(page: Page, durationMs: number) {
  // A measurement window catches a brief late appearance, unlike one final count.
  const appeared = await page.evaluate(({ selector, duration }) => new Promise<boolean>(resolve => {
    const start = performance.now();
    function sample() {
      if (document.querySelector(selector)) resolve(true);
      else if (performance.now() - start >= duration) resolve(false);
      else requestAnimationFrame(sample);
    }
    sample();
  }), { selector: imageSelector, duration: durationMs });
  expect(appeared).toBe(false);
}

for (const mode of ['delayed translation', 'rapid language changes', 'unavailable translation'] as const) {
  test(`raven stays loaded and continuous with ${mode}`, async ({ page }, testInfo) => {
    const english = gate();
    const italian = gate();
    await page.route(englishSrc, async route => { await english.promise; await route.continue(); });
    await page.route(italianSrc, async route => {
      await italian.promise;
      if (mode === 'unavailable translation') await route.abort();
      else await route.continue();
    });
    try {
      await page.goto('/');
      const request = page.waitForRequest(englishSrc);
      await page.locator('[data-welcome-enthusiasm]').press('End');
      await request;
      // Only the first case needs to exceed the existing 3.5s scenic delay.
      if (mode === 'delayed translation') await expectNoFlightDuring(page, 3700);
      english.release();
      const image = page.locator(imageSelector);
      await expect(image).toBeAttached();
      const observation = observeFlight(page);
      const requestIt = page.waitForRequest(italianSrc);
      await page.getByText('ita', { exact: true }).click();
      await requestIt;
      await expect(image).toHaveAttribute('src', /corvo-lessgo\.gif$/);
      if (mode === 'rapid language changes') {
        await page.getByText('eng', { exact: true }).click();
        await page.getByText('ita', { exact: true }).click();
      }
      italian.release();
      await expect(image).toHaveAttribute('src', mode === 'unavailable translation'
        ? /corvo-lessgo\.gif$/ : /corvo-daje-tutta-cartiglio-5\.gif$/);
      const observed = await observation;
      await testInfo.attach('raven-frames', { body: JSON.stringify(observed), contentType: 'application/json' });
      expectContinuousFlight(observed);
      if (mode === 'unavailable translation') expect(observed.frames.every(f => f.src.includes('lessgo'))).toBe(true);
      else expect(observed.frames.at(-1)!.src).toContain('daje-tutta');
    } finally {
      english.release();
      italian.release();
      await page.unrouteAll({ behavior: 'wait' });
    }
  });
}

test('unavailable initial GIF never creates an invisible flight', async ({ page }) => {
  await page.route(englishSrc, route => route.abort());
  await page.goto('/');
  const request = page.waitForRequest(englishSrc);
  await page.locator('[data-welcome-enthusiasm]').press('End');
  await request;
  await expectNoFlightDuring(page, 4000);
});

for (const cancel of ['lower enthusiasm', 'leave Home'] as const) {
  test(`pending image cannot resurrect a flight after ${cancel}`, async ({ page }) => {
    const pending = gate();
    await page.route(englishSrc, async route => { await pending.promise; await route.continue(); });
    try {
      await page.goto('/');
      const request = page.waitForRequest(englishSrc);
      const range = page.locator('[data-welcome-enthusiasm]');
      await range.press('End');
      await request;
      if (cancel === 'leave Home') {
        await page.getByRole('link', { name: 'FieldNotes', exact: true }).click();
        await expect(page).toHaveURL(/\/field-notes\/$/);
      } else await range.press('ArrowLeft');
      const response = page.waitForResponse(englishSrc);
      pending.release();
      await (await response).finished();
      await expectNoFlightDuring(page, 4000);
      if (cancel === 'leave Home') {
        await page.goBack();
        await expect(range).toBeVisible();
        await expectNoFlightDuring(page, 500);
      }
    } finally {
      pending.release();
      await page.unrouteAll({ behavior: 'wait' });
    }
  });
}
