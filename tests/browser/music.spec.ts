import { test, expect } from './fixtures';

test('audio is lazy; play, pause, seek and restart work across page navigation', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', request => { if (new URL(request.url()).pathname.endsWith('.mp3')) requests.push(request.url()); });
  await page.goto('/projects/');
  await expect(page.locator('#symphojingles [data-play]')).toBeVisible();
  expect(requests).toEqual([]);
  await page.locator('#symphojingles .project-title-button').click();
  await expect(page).toHaveURL(/\/projects\/symphojingles\/$/);
  await page.locator('.music-piece a').click();
  await expect(page).toHaveURL(/\/avventura-autunno\/$/);
  expect(requests).toEqual([]);
  const player = page.locator('[data-music-player]');
  const audio = player.locator('audio');
  const time = () => audio.evaluate((e: HTMLAudioElement) => e.currentTime);
  await player.getByRole('button', { name: 'Riproduci', exact: true }).click();
  await expect.poll(time).toBeGreaterThan(0);
  expect(requests.length).toBeGreaterThan(0);
  await player.getByRole('button', { name: 'Pausa', exact: true }).click();
  await expect.poll(() => audio.evaluate((e: HTMLAudioElement) => e.paused)).toBe(true);
  const paused = await time();
  // Observe several samples: a paused player must not just relabel its button.
  for (let sample = 0; sample < 3; sample++) {
    await page.waitForTimeout(100);
    expect(await time()).toBeCloseTo(paused, 2);
  }
  await player.getByRole('slider', { name: 'Posizione nel brano' }).fill('50');
  await expect.poll(() => audio.evaluate((e: HTMLAudioElement) => e.currentTime / e.duration)).toBeCloseTo(0.5, 2);
  await player.getByRole('button', { name: 'Torna all’inizio' }).click();
  await expect.poll(time).toBeLessThan(0.05);
  await player.getByRole('button', { name: 'Riproduci', exact: true }).click();
  await expect.poll(time).toBeGreaterThan(0.05);
  const departingAudio = await audio.elementHandle();
  await page.locator('.project-title-button').click();
  await expect(page).toHaveURL(/\/projects\/symphojingles\/$/);
  // Astro replaces the page without replacing the document: the old node is
  // still inspectable through its handle and must have been paused on departure.
  expect(await departingAudio!.evaluate((e: HTMLAudioElement) => e.paused)).toBe(true);
  await departingAudio!.dispose();
  await page.getByRole('button', { name: 'Riproduci', exact: true }).click();
  await expect.poll(() => page.locator('[data-music-player] audio').evaluate((e: HTMLAudioElement) => e.currentTime)).toBeGreaterThan(0);
});

test('failed audio displays an error instead of pretending to play', async ({ page }) => {
  await page.route('**/*.mp3', route => route.abort());
  await page.goto('/projects/symphojingles/');
  await page.getByRole('button', { name: 'Riproduci', exact: true }).click();
  await expect(page.locator('[data-music-player] [data-error]')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Riproduci', exact: true })).toBeVisible();
  expect(await page.locator('[data-music-player] audio').evaluate((e: HTMLAudioElement) => e.paused)).toBe(true);
});
