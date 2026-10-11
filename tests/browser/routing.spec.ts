import { test, expect } from './fixtures';

test('artifact links in home, project lists, Atlas and Log reach the same page', async ({ page }) => {
  const path = '/projects/games-and-riddles/mini-cruci-1/';
  for (const source of ['/', '/projects/', '/projects/games-and-riddles/', '/atlas/?primary=artifact', '/#log-title']) {
    await page.goto(source);
    const scope = source === "/#log-title" ? page.locator(".home-log-panel") : page;
    const link = scope.locator(`a[href="${path}"]`).first();
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(new RegExp(`${path}$`));
    await expect(page.locator('h1')).toContainText('MiniCruci 1');
  }
});

test('standalone alias redirects to its project and sequence links reach their destination', async ({ page }) => {
  await page.goto('/artifacts/boa/');
  await expect(page).toHaveURL(/\/projects\/fumettonzi\/boa\/$/);
  const next = page.locator('.artifact-sequence-navigation a').last();
  await expect(next).toBeVisible();
  const href = await next.getAttribute('href');
  expect(href).toMatch(/^\/projects\/fumettonzi\/.+\/#artifact-image$/);
  await next.click();
  await expect(page).toHaveURL(new URL(href!, page.url()).href);
  await expect(page.locator('#artifact-image')).toBeVisible();
});
