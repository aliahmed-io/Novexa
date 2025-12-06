import { test, expect } from '@playwright/test';

test('visitor can browse and view product', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Novexa/);

    // Navigate to store
    await page.getByRole('link', { name: 'Shop Now' }).first().click();
    await expect(page.url()).toContain('/store');

    // Click first product (assuming standard Novexa cards)
    // We look for a link that goes to /store/product/...
    const firstProduct = page.locator('a[href^="/store/product/"]').first();
    await firstProduct.click();

    // Expect product page
    await expect(page.url()).toContain('/store/product/');
    await expect(page.getByRole('button', { name: 'Add to Bag' })).toBeVisible();
});
