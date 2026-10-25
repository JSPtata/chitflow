import { test, expect } from '@playwright/test';

test('an invalid or expired session returns to sign in and clears its token', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('token', 'invalid-test-session'));
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByLabel('Email address', { exact: true })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('token'))).toBeNull();
});
