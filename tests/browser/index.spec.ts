import { test, expect } from './fixtures';

test('filters respect primary types and inherited secondary tags', async ({ page }) => {
  await page.goto('/atlas/?primary=experiment&secondary=nursery-rhyme');
  await expect(page.getByRole('link', { name: 'ho visto un gatto', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Corrispondenze', exact: true })).toBeHidden();
  await page.locator('[data-group=primary][data-value=artifact]').click();
  await expect(page).not.toHaveURL(/secondary=/);
  await expect(page.locator('[data-group=secondary][data-value=""]')).toHaveAttribute('aria-pressed', 'true');
  await page.locator('[data-group=secondary][data-value=game]').click();
  await expect(page.getByRole('link', { name: 'MiniCruci 1', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Corrispondenze', exact: true })).toBeHidden();
  await expect(page.getByRole('link', { name: 'ho visto un gatto', exact: true })).toBeHidden();
  await page.locator('[data-group=secondary][data-value=poem]').click();
  await expect(page.getByRole('link', { name: 'Corrispondenze', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'MiniCruci 1', exact: true })).toBeHidden();
  await page.locator('[data-filter-group=cross] summary').click();
  await page.locator('[data-group=cross][data-value=finance]').click();
  await expect(page.locator('[data-group=secondary][data-value=poem]')).toHaveAttribute('aria-pressed', 'true');
  // The approved content currently contains no poems tagged finance.
  await expect(page.locator('[data-index-item]:visible')).toHaveCount(0);
  await expect(page.locator('[data-empty]')).toBeVisible();
  await page.locator('[data-group=primary][data-value=project]').click();
  await expect(page.locator('[data-filter-group=secondary]')).toBeHidden();
  await expect(page).not.toHaveURL(/secondary=/);
  await expect(page.locator('[data-index-item]:visible')).toHaveAttribute('data-content-id', 'esperimenti-di-portafoglio');
});

test('All resets only its own level; Clear restores the full set', async ({ page }) => {
  await page.goto('/atlas/');
  const ids = () => page.locator('[data-index-item]:visible').evaluateAll(rows => rows.map(row => row.getAttribute('data-content-id')).sort());
  const all = await ids();
  await page.locator('[data-group=primary][data-value=artifact]').click();
  const artifacts = await ids();
  expect(artifacts.length).toBeGreaterThan(0);
  expect(artifacts.length).toBeLessThan(all.length);
  await page.locator('[data-group=secondary][data-value=poem]').click();
  expect(await ids()).not.toEqual(artifacts);
  await page.locator('[data-group=secondary][data-value=""]').click();
  await expect.poll(ids).toEqual(artifacts);
  await expect(page.locator('[data-group=primary][data-value=artifact]')).toHaveAttribute('aria-pressed', 'true');
  await page.locator('[data-clear]').click();
  await expect.poll(ids).toEqual(all);
  await expect(page.locator('[data-empty]')).toBeHidden();
  await expect(page).not.toHaveURL(/primary=|secondary=|cross=/);
});

test('opening a subtype closes its sibling without moving that sibling horizontally', async ({ page }) => {
  await page.goto('/atlas/?primary=artifact');
  const game = page.getByRole('button', { name: 'Sottotipi di game', exact: true });
  const graphics = page.getByRole('button', { name: 'Sottotipi di graphics', exact: true });
  const x = await graphics.evaluate(e => e.getBoundingClientRect().x);
  await game.click();
  await expect(page.locator('[data-group=secondary][data-value=crossword]')).toBeVisible();
  expect(await graphics.evaluate(e => e.getBoundingClientRect().x)).toBeCloseTo(x, 0);
  await graphics.click();
  await expect(game).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('[data-group=secondary][data-value=crossword]')).toBeHidden();
  await expect(page.locator('[data-group=secondary][data-value=comic]')).toBeVisible();
});

test('Index controls initialize on arrival and stay usable after back and forward', async ({ page }) => {
  await page.goto('/projects/');
  await page.locator('[data-nav-button][data-section=atlas]').click();
  await expect(page).toHaveURL(/\/atlas\/$/);
  const artifacts = page.locator('[data-group=primary][data-value=artifact]');
  const game = page.locator('[data-group=secondary][data-value=game]');

  for (let visit = 0; visit < 2; visit++) {
    await page.locator('[data-clear]').click();
    // One keyboard action must produce one change, also after re-entering the page.
    await artifacts.focus();
    await artifacts.press('Enter');
    await expect(artifacts).toHaveAttribute('aria-pressed', 'true');
    await game.click();
    await page.locator('[data-display=cards]').click();
    const crossword = page.getByRole('link', { name: 'MiniCruci 1', exact: true });
    await crossword.click();
    await expect(page).toHaveURL(/\/mini-cruci-1\/$/);

    await page.goBack();
    await expect(artifacts).toHaveAttribute('aria-pressed', 'true');
    await expect(game).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('[data-display=cards]')).toHaveAttribute('aria-pressed', 'true');
    await page.goForward();
    await expect(page).toHaveURL(/\/mini-cruci-1\/$/);
    await page.goBack();
    await expect(crossword).toBeVisible();
  }
  await artifacts.click();
  await expect(artifacts).toHaveAttribute('aria-pressed', 'false');
});

for (const display of ['list', 'titles', 'cards', 'wall']) {
  test(`Index ${display}: entries, links and layout survive reload`, async ({ page }) => {
    await page.goto('/atlas/');
    const entries = page.locator('[data-index-item]:visible');
    const identities = () => entries.evaluateAll(rows => rows.map(row => ({
      id: row.getAttribute('data-content-id'),
      href: row.querySelector('.atlas-title')?.getAttribute('href'),
    })).sort((a, b) => a.id!.localeCompare(b.id!)));
    const original = await identities();
    expect(original.length).toBeGreaterThan(0);
    expect(new Set(original.map(row => row.id)).size).toBe(original.length);
    await page.locator(`[data-display=${display}]`).click();
    await expect(page.locator('[data-results-display]')).toHaveAttribute('data-results-display', display);
    await expect.poll(identities).toEqual(original);
    await page.reload();
    await expect(page.locator(`[data-display=${display}]`)).toHaveAttribute('aria-pressed', 'true');
    await expect.poll(identities).toEqual(original);
    await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.getByRole('link', { name: /Corrispondenze/ })).toBeVisible();
  });
}
