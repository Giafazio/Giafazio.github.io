import { test, expect } from './fixtures';

test('canonical follows Astro navigation and history while Atlas filters keep its official URL', async ({ page }) => {
  await page.goto('/atlas/?primary=artifact&secondary=game&display=cards');
  const canonical = page.locator('head link[rel="canonical"]');
  await expect(canonical).toHaveCount(1);
  const atlasUrl = await canonical.getAttribute('href');
  expect(atlasUrl).toMatch(/^https:\/\/[^/]+\/atlas\/$/);
  await page.getByRole('link', { name: 'MiniCruci 1', exact: true }).click();
  await expect(page).toHaveURL(/\/projects\/games-and-riddles\/mini-cruci-1\/$/);
  await expect(canonical).toHaveCount(1);
  const pieceUrl = new URL('/projects/games-and-riddles/mini-cruci-1/', atlasUrl!).href;
  await expect(canonical).toHaveAttribute('href', pieceUrl);
  await page.goBack();
  await expect(canonical).toHaveAttribute('href', atlasUrl!);
  await page.goForward();
  await expect(canonical).toHaveAttribute('href', pieceUrl);
  await page.reload();
  await expect(canonical).toHaveAttribute('href', pieceUrl);
});

test('artifact alias ends at the canonical page and 404 has no canonical', async ({ page }) => {
  await page.goto('/artifacts/boa/');
  await expect(page).toHaveURL(/\/projects\/fumettonzi\/boa\/$/);
  await expect(page.locator('head link[rel="canonical"]')).toHaveAttribute('href', /^https:\/\/[^/]+\/projects\/fumettonzi\/boa\/$/);
  await page.goto('/404.html');
  await expect(page.locator('head link[rel="canonical"]')).toHaveCount(0);
});
