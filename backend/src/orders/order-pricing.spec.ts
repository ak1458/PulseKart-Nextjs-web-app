import { buildQuote, round2, PRICING, QuoteLine } from './order-pricing';

const line = (overrides: Partial<QuoteLine> = {}): QuoteLine => ({
    productId: 1,
    name: 'Paracetamol 650mg',
    unitPrice: 100,
    quantity: 1,
    lineTotal: 100,
    taxRate: 0,
    taxAmount: 0,
    requiresPrescription: false,
    image: null,
    ...overrides,
});

describe('round2', () => {
    it('keeps money at 2dp', () => {
        // 19.99 * 3 === 59.970000000000006
        expect(round2(19.99 * 3)).toBe(59.97);
        expect(round2(0.1 + 0.2)).toBe(0.3);
    });

    it('coerces the strings node-postgres returns for decimal columns', () => {
        expect(round2('5.00' as unknown as number)).toBe(5);
    });

    it('degrades to 0 rather than propagating NaN through a total', () => {
        expect(round2(NaN)).toBe(0);
        expect(round2(undefined as unknown as number)).toBe(0);
    });
});

describe('buildQuote', () => {
    it('charges delivery below the free threshold', () => {
        const quote = buildQuote([line({ unitPrice: 100, lineTotal: 100 })], 'CARD', 0, null, null);

        expect(quote.subtotal).toBe(100);
        expect(quote.deliveryFee).toBe(PRICING.DELIVERY_FEE);
        expect(quote.total).toBe(140);
    });

    it('waives delivery at the threshold exactly', () => {
        const quote = buildQuote(
            [line({ unitPrice: 500, lineTotal: 500 })],
            'CARD',
            0,
            null,
            null,
        );

        expect(quote.deliveryFee).toBe(0);
        expect(quote.total).toBe(500);
    });

    it('adds the COD handling fee only for cash on delivery', () => {
        const cod = buildQuote([line({ lineTotal: 600, unitPrice: 600 })], 'COD', 0, null, null);
        const card = buildQuote([line({ lineTotal: 600, unitPrice: 600 })], 'CARD', 0, null, null);

        expect(cod.codFee).toBe(PRICING.COD_FEE);
        expect(card.codFee).toBe(0);
        expect(cod.total - card.total).toBe(PRICING.COD_FEE);
    });

    it('applies the UPI discount', () => {
        const quote = buildQuote([line({ unitPrice: 1000, lineTotal: 1000 })], 'UPI', 0, null, null);

        expect(quote.discount).toBe(50); // 5% of 1000
        expect(quote.total).toBe(950);
    });

    it('takes the better of the coupon and the UPI discount rather than stacking', () => {
        // Coupon worth 200 beats the 50 UPI discount.
        const couponWins = buildQuote(
            [line({ unitPrice: 1000, lineTotal: 1000 })],
            'UPI',
            200,
            'SAVE200',
            null,
        );
        expect(couponWins.discount).toBe(200);
        expect(couponWins.couponCode).toBe('SAVE200');

        // A weaker coupon must not lose the customer the larger UPI discount,
        // which is what the previous frontend logic did.
        const upiWins = buildQuote(
            [line({ unitPrice: 1000, lineTotal: 1000 })],
            'UPI',
            10,
            'WEAK10',
            null,
        );
        expect(upiWins.discount).toBe(50);
        expect(upiWins.couponCode).toBeNull();
    });

    it('never discounts below zero', () => {
        const quote = buildQuote(
            [line({ unitPrice: 100, lineTotal: 100 })],
            'CARD',
            100_000,
            'HUGE',
            null,
        );

        expect(quote.discount).toBe(100);
        expect(quote.total).toBeGreaterThanOrEqual(0);
    });

    it('sums tax across lines', () => {
        const quote = buildQuote(
            [
                line({ lineTotal: 100, taxRate: 5, taxAmount: 5 }),
                line({ productId: 2, lineTotal: 200, taxRate: 12, taxAmount: 24 }),
            ],
            'CARD',
            0,
            null,
            null,
        );

        expect(quote.subtotal).toBe(300);
        expect(quote.tax).toBe(29);
        expect(quote.total).toBe(369); // 300 + 29 + 40 delivery
    });

    it('flags the order when any line is prescription-only', () => {
        const quote = buildQuote(
            [line(), line({ productId: 2, requiresPrescription: true })],
            'CARD',
            0,
            null,
            null,
        );

        expect(quote.requiresPrescription).toBe(true);
    });

    it('counts total units rather than distinct lines', () => {
        const quote = buildQuote(
            [
                line({ quantity: 3, lineTotal: 300 }),
                line({ productId: 2, quantity: 2, lineTotal: 200 }),
            ],
            'CARD',
            0,
            null,
            null,
        );

        expect(quote.itemsCount).toBe(5);
    });
});
