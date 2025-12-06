import { test, expect } from '@playwright/test';

test('customer can add to bag and proceed to checkout', async ({ page }) => {
    // 1. Visit Home
    await page.goto('/');

    // 2. Go to Store
    await page.getByRole('link', { name: 'Shop Now' }).first().click();
    await expect(page).toHaveURL(/.*\/store/);

    // 3. View a Product
    const firstProduct = page.locator('a[href^="/store/product/"]').first();
    await firstProduct.click();
    await expect(page.getByRole('button', { name: 'Add to Bag' })).toBeVisible();

    // 4. Add to Bag
    await page.getByRole('button', { name: 'Add to Bag' }).click();
    // Expect some feedback or cart update. 
    // Assuming the "Bag" icon updates or a toast appears.
    // For now, let's navigate to bag manually or via header
    await page.goto('/store/bag');

    // 5. Check Bag
    await expect(page.getByText('Summary')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Checkout' })).toBeVisible();

    // 6. Proceed to Checkout
    await page.getByRole('link', { name: 'Checkout' }).click();

    // 7. Expect Login (since we are not auth'd)
    // Kinde redirects to /api/auth/login...
    await expect(page.url()).toContain('api/auth/login');
});
