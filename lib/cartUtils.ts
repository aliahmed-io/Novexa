import { CartItem } from "./interfaces";

export function calculateCartTotal(items: CartItem[], discountPercentage: number = 0): number {
    const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

    if (discountPercentage > 0) {
        return Math.round(total * (1 - discountPercentage / 100));
    }

    return total;
}
