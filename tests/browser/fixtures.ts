import { test as base, expect } from '@playwright/test';

export const test = base.extend<{ pageErrors: void }>({
  pageErrors: [async ({ page }, use, testInfo) => {
    const errors: { message: string; stack?: string; url: string; time: string }[] = [];
    page.on('pageerror', error => errors.push({
      message: error.message, stack: error.stack, url: page.url(), time: new Date().toISOString(),
    }));
    try {
      await use();
    } finally {
      if (errors.length) await testInfo.attach('browser-errors', {
        body: JSON.stringify(errors, null, 2), contentType: 'application/json',
      });
      // Preserve the original assertion failure as well as any browser errors.
      expect.soft(errors, 'No uncaught errors during navigation or interaction').toEqual([]);
    }
  }, { auto: true }],
});
export { expect };
