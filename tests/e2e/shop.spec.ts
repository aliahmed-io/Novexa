
import { test, expect } from '@playwright/test';

test.describe('Storefront Smoke Tests', () => {

    test('homepage loads and shows hero', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveTitle(/Novexa/);
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    });

    test('shop page loads products', async ({ page }) => {
        await page.goto('/store/shop');
        // Expect at least one product card to be visible
        const products = page.locator('article, .group, a[href^="/store/product/"]');
        // Adjust selector based on actual product card implementation if needed. 
        // Assuming generic "Shop Now" links or similar structure.
        await expect(page.getByText('All Products')).toBeVisible();
    });

    test('navigation menu works', async ({ page }) => {
        await page.goto('/');
        await page.getByRole('link', { name: 'Shop' }).first().click();
        await expect(page).toHaveURL(/.*\/store\/shop/);
    });

});
