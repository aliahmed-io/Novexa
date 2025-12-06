import { describe, it, expect } from 'vitest';
import { filterProducts } from '@/lib/filterProducts';
import { Product } from '@/lib/assistantTypes';

// Mock Product helper
const createProduct = (name: string, overrides: Partial<Product> = {}): Product => ({
    id: '1',
    name,
    price: 100,
    images: [],
    gender: 'Unisex',
    color: 'Black',
    category: 'General',
    url: 'example-url',
    description: 'A test product',
    features: [],
    tags: [],
    ...overrides
});

describe('filterProducts', () => {
    const products = [
        createProduct('Red Running Shoes', { color: 'Red', style: 'Running' }),
        createProduct('Blue Casual Sneakers', { color: 'Blue', style: 'Casual' }),
        createProduct('Green Hiking Boots', { color: 'Green', style: 'Hiking', tags: ['outdoor'] }),
    ];

    it('filters by name (exact word)', () => {
        const result = filterProducts(products, 'Red');
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe('Red Running Shoes');
    });

    it('filters by category/style', () => {
        const result = filterProducts(products, 'Running');
        expect(result).toHaveLength(1);
        expect(result[0].style).toBe('Running');
    });

    it('filters by arbitrary tag', () => {
        const result = filterProducts(products, 'outdoor');
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe('Green Hiking Boots');
    });

    it('returns top results for multi-word query', () => {
        const result = filterProducts(products, 'Red Sneakers');
        // Should likely return Red Shoes (Red match) and Blue Sneakers (Sneakers match)
        expect(result.length).toBeGreaterThan(0);
        expect(result.some(p => p.name.includes('Red'))).toBe(true);
    });

    it('returns empty array (or fallback) for no matches', () => {
        const result = filterProducts(products, 'Purple spaceship');
        // Based on implementation, it returns slice(0,20) fallback if score is 0
        // The implementation says: if (scored.length && scored[0].score === 0) return products.slice(0, 20);
        expect(result).toHaveLength(3);
    });
});
