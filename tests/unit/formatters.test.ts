import { describe, it, expect } from 'vitest'
import { formatCurrency } from '@/lib/formatters'

describe('formatCurrency', () => {
    it('formats USD correctly', () => {
        expect(formatCurrency(100)).toBe('$100.00')
        expect(formatCurrency(100.50)).toBe('$100.50')
    })

    it('handles zero', () => {
        expect(formatCurrency(0)).toBe('$0.00')
    })
})
