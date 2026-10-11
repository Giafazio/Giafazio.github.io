import { test, expect } from './fixtures';
import responses from '../../src/lib/oracolo/responses.json' with { type: 'json' };

test('Oracolo selects each pool and resets the consultation', async ({ page }) => {
  await page.goto('/experiments/oracolo/');
  await expect(page.getByRole('heading', { name: "L'oracolo", exact: true })).toHaveCSS('text-align', 'center');
  await expect(page.getByRole('heading', { name: "L'oracolo", exact: true })).toHaveCSS('font-family', 'Basteleur, serif');
  await expect(page.getByText('Ottieni il supremo responso', { exact: true })).toHaveCSS('text-align', 'center');
  const headingBox = await page.getByRole('heading', { name: "L'oracolo", exact: true }).boundingBox();
  const summaryBox = await page.getByText('Ottieni il supremo responso', { exact: true }).boundingBox();
  expect(Math.abs(headingBox!.x + headingBox!.width / 2 - summaryBox!.x - summaryBox!.width / 2)).toBeLessThan(1);
  const input = page.getByLabel("Poni una domanda in italiano con risposta sì/no e l'Oracolo ti risponderà.");
  const button = page.getByRole('button', { name: 'Sentenzia', exact: true });
  await expect(button).toBeDisabled();
  for (const [question, label] of [['Realizzerò i miei sogni?', 'si_no'], ['Quale treno mi piace?', 'aperta'], ['Where?', 'incerta']] as const) {
    await input.fill(question);
    await input.press('Enter');
    await expect(input).toHaveAttribute('readonly', '');
    await expect(input).toBeHidden();
    await expect(page.locator('.oracolo-question')).toHaveText(question);
    await expect(page.getByRole('button', { name: 'Interpella nuovamente' })).toBeFocused();
    const text = await page.locator('.oracolo-answer p').textContent();
    expect(responses[label].some(r => text === `«${r.text}»`)).toBe(true);
    const selected = responses[label].find(r => text === `«${r.text}»`)!;
    await expect(page.locator('.oracolo-answer small')).toHaveText(`${selected.character}, da ${selected.work} di ${selected.author} · Wikisource`);
    await expect(page.locator('.oracolo-answer em').first()).toHaveCSS('font-style', 'italic');
    await expect(page.locator('.oracolo-answer em').last()).toHaveCSS('font-style', 'italic');
    await expect(page.locator('.oracolo-answer small')).toHaveCSS('font-style', 'normal');
    await expect(page.locator('.question-hint').first()).toHaveCSS('font-weight', label === 'aperta' ? '700' : '400');
    const href = await page.locator('.oracolo-answer a').getAttribute('href');
    expect(new URL(href!).hostname).toBe('it.wikisource.org');
    await page.getByRole('button', { name: 'Interpella nuovamente' }).click();
    await expect(input).toHaveValue('');
    await expect(page.locator('.question-hint').first()).toHaveCSS('font-weight', '400');
    await expect(input).not.toHaveAttribute('readonly', '');
    await expect(page.locator('.oracolo-question')).toBeHidden();
    await expect(input).toBeFocused();
    await expect(page.locator('.oracolo-answer')).toBeEmpty();
    await expect(button).toBeDisabled();
  }
  await input.fill('È già il 2026?🙂Ж');
  await expect(input).toHaveValue('È già il 2026?');
  await input.evaluate((el: HTMLInputElement) => {
    el.setSelectionRange(el.value.length, el.value.length);
    const clipboardData = new DataTransfer();
    clipboardData.setData('text/plain', ' sì🙂Ж!');
    el.dispatchEvent(new ClipboardEvent('paste', { clipboardData, bubbles: true, cancelable: true }));
  });
  await expect(input).toHaveValue('È già il 2026? sì!');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Sentenzia', exact: true }).click();
  await page.screenshot({ path: `test-results/oracolo-${test.info().project.name}.png`, fullPage: true });
  await page.reload();
  await expect(input).toHaveValue('');
  await input.fill('Vieni?');
  await button.click();
  await expect(page.locator('.oracolo-answer p')).toBeVisible();
  await page.goto('/experiments/');
  await page.goBack();
  await expect(input).toBeVisible();
  // Back navigation may restore the document or recreate it; either state must work.
  const reset = page.getByRole('button', { name: 'Interpella nuovamente' });
  if (await reset.isVisible()) await reset.click();
  await input.fill('Vieni?');
  await button.click();
  await expect(page.locator('.oracolo-answer p')).toBeVisible();
});

test('Long questions wrap completely and keyboard reset restores the field', async ({ page }) => {
  await page.goto('/experiments/oracolo/');
  const input = page.locator('#oracolo-question');
  const question = 'Realizzerò i miei sogni, ' + 'continuando a impegnarmi ogni giorno con pazienza e determinazione, '.repeat(12) + 'senza arrendermi?';
  await input.fill(question);
  await input.press('Enter');
  const visible = page.locator('.oracolo-question');
  await expect(visible).toHaveText(question);
  expect(await visible.evaluate(e => e.scrollWidth <= e.clientWidth)).toBe(true);
  expect(await visible.evaluate(e => e.getBoundingClientRect().height > parseFloat(getComputedStyle(e).lineHeight) * 2)).toBe(true);
  await expect(page.getByRole('button', { name: 'Interpella nuovamente' })).toBeFocused();
  await page.keyboard.press('Space');
  await expect(input).toBeVisible();
  await expect(input).toBeFocused();
  await expect(input).toHaveValue('');
  await expect(visible).toBeEmpty();
});
