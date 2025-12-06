import { test, expect } from '@playwright/test';

// Note: Simple smoke test for admin route protection
test('unauthenticated user cannot access dashboard', async ({ page }) => {
    await page.goto('/store/dashboard');

    // Should redirect to login or show unauthorized
    // Kinde usually redirects to /api/auth/login or similar
    await expect(page.url()).toContain('api/auth/login');
});

test('can view health endpoint', async ({ page }) => {
    const response = await page.goto('/api/health');
    expect(response?.ok()).toBeTruthy();
    const json = await response?.json();
    expect(json).toHaveProperty('status', 'ok');
});
