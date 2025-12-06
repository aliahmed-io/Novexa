import { describe, it, expect } from 'vitest';
import { calculateCartTotal } from '@/lib/cartUtils';
import { CartItem } from '@/lib/interfaces';

describe('calculateCartTotal', () => {
    const items: CartItem[] = [
        { id: '1', name: 'Item 1', price: 100, quantity: 2, imageString: '' }, // 200
        { id: '2', name: 'Item 2', price: 50, quantity: 1, imageString: '' },  // 50
    ];

    it('calculates total without discount', () => {
        const total = calculateCartTotal(items);
        expect(total).toBe(250);
    });

    it('calculates total with 10% discount', () => {
        // 250 * 0.9 = 225
        const total = calculateCartTotal(items, 10);
        expect(total).toBe(225);
    });

    it('calculates total with 100% discount', () => {
        const total = calculateCartTotal(items, 100);
        expect(total).toBe(0);
    });

    it('handles empty cart', () => {
        const total = calculateCartTotal([], 0);
        expect(total).toBe(0);
    });
});
