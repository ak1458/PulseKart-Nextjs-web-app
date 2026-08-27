import {
    Injectable,
    BadRequestException,
    ConflictException,
    Logger,
} from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { Batch } from '../products/entities/batch.entity';
import { Order, OrderStatus, PaymentStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CouponsService } from '../coupons/coupons.service';
import {
    PrescriptionsService,
} from '../prescriptions/prescriptions.service';
import { PrescriptionStatus } from '../prescriptions/entities/prescription.entity';
import { CheckoutDto, QuoteDto } from './dto/checkout.dto';
import { buildQuote, round2, OrderQuote, QuoteLine } from './order-pricing';

/**
 * Customer-facing checkout.
 *
 * Everything the customer's browser sends is treated as a request, not as fact:
 * prices, stock, prescription status and coupon eligibility are all resolved
 * server-side. The browser sends product ids and quantities; nothing else about
 * the money is trusted.
 */
@Injectable()
export class CheckoutService {
    private readonly logger = new Logger(CheckoutService.name);

    constructor(
        private readonly dataSource: DataSource,
        private readonly couponsService: CouponsService,
        private readonly prescriptionsService: PrescriptionsService,
    ) { }

    /**
     * Resolve requested items against the catalogue.
     *
     * Products are loaded in one query and matched back to the request, so a
     * cart of 40 items costs one round trip rather than 40.
     */
    private async priceLines(
        manager: EntityManager,
        items: { productId: number; quantity: number }[],
    ): Promise<QuoteLine[]> {
        // Collapse duplicate ids so the same product sent twice becomes one
        // line rather than two competing stock allocations.
        const quantities = new Map<number, number>();
        for (const item of items) {
            quantities.set(
                item.productId,
                (quantities.get(item.productId) ?? 0) + item.quantity,
            );
        }

        const ids = [...quantities.keys()];
        const products = await manager.find(Product, {
            where: ids.map((id) => ({ id })),
        });

        const found = new Map(products.map((p) => [p.id, p]));

        const missing = ids.filter((id) => !found.has(id));
        if (missing.length > 0) {
            throw new BadRequestException(
                `These products are no longer available: ${missing.join(', ')}`,
            );
        }

        const inactive = products.filter((p) => p.is_active === false);
        if (inactive.length > 0) {
            throw new BadRequestException(
                `These products are no longer available: ${inactive
                    .map((p) => p.title)
                    .join(', ')}`,
            );
        }

        return ids.map((id) => {
            const product = found.get(id)!;
            const quantity = quantities.get(id)!;
            const unitPrice = round2(product.price);
            const lineTotal = round2(unitPrice * quantity);
            const taxRate = Number(product.tax_rate ?? 0);

            return {
                productId: product.id,
                name: product.title,
                unitPrice,
                quantity,
                lineTotal,
                taxRate,
                taxAmount: round2(lineTotal * (taxRate / 100)),
                requiresPrescription: product.prescription_required === true,
                image: product.images?.[0] ?? null,
            };
        });
    }

    /** Validate a coupon, returning zero discount rather than throwing. */
    private async resolveCoupon(
        code: string | undefined,
        subtotal: number,
        productIds: number[],
        userId: number,
    ): Promise<{ discount: number; code: string | null; message: string | null }> {
        if (!code?.trim()) {
            return { discount: 0, code: null, message: null };
        }

        const result = await this.couponsService.validateAndCalculate(
            code.trim(),
            subtotal,
            productIds.map(String),
            userId,
        );

        return {
            discount: result.is_valid ? round2(result.discount_amount) : 0,
            code: result.is_valid ? code.trim() : null,
            message: result.message ?? null,
        };
    }

    /** Price a cart without reserving stock or persisting anything. */
    async quote(userId: number, dto: QuoteDto): Promise<OrderQuote> {
        const lines = await this.priceLines(this.dataSource.manager, dto.items);
        const subtotal = round2(lines.reduce((sum, l) => sum + l.lineTotal, 0));

        const coupon = await this.resolveCoupon(
            dto.couponCode,
            subtotal,
            lines.map((l) => l.productId),
            userId,
        );

        return buildQuote(
            lines,
            dto.paymentMethod,
            coupon.discount,
            coupon.code,
            coupon.message,
        );
    }

    /**
     * Reserve stock for one line, oldest expiry first.
     *
     * FEFO (first-expired-first-out) rather than FIFO: for medicines, shipping
     * the longest-dated stock first strands the near-dated stock until it
     * expires and has to be written off.
     *
     * The SELECT takes a row-level write lock so two concurrent checkouts cannot
     * both read the same `qty_available` and each decide there is enough.
     */
    private async allocateStock(
        manager: EntityManager,
        productId: number,
        quantity: number,
        productName: string,
    ): Promise<void> {
        const batches = await manager
            .createQueryBuilder(Batch, 'b')
            .setLock('pessimistic_write')
            .where('b.sku_id = :productId', { productId })
            .andWhere('b.qty_available > 0')
            .andWhere('b.expiry_date > NOW()')
            .orderBy('b.expiry_date', 'ASC')
            .getMany();

        const available = batches.reduce((sum, b) => sum + b.qty_available, 0);
        if (available < quantity) {
            throw new ConflictException(
                `Not enough stock for ${productName}. ${available} available, ${quantity} requested.`,
            );
        }

        let remaining = quantity;
        for (const batch of batches) {
            if (remaining === 0) break;
            const take = Math.min(batch.qty_available, remaining);
            batch.qty_available -= take;
            remaining -= take;
            await manager.save(Batch, batch);
        }
    }

    /**
     * Place an order.
     *
     * Pricing, stock allocation and order creation share one transaction, so a
     * failure at any point leaves no partially-decremented stock behind.
     */
    async checkout(userId: number, dto: CheckoutDto): Promise<Order> {
        return this.dataSource.transaction(async (manager) => {
            const lines = await this.priceLines(manager, dto.items);
            const subtotal = round2(lines.reduce((sum, l) => sum + l.lineTotal, 0));

            const coupon = await this.resolveCoupon(
                dto.couponCode,
                subtotal,
                lines.map((l) => l.productId),
                userId,
            );

            // A coupon the customer believed was applied must not silently
            // vanish into a higher total.
            if (dto.couponCode?.trim() && !coupon.code) {
                throw new BadRequestException(
                    coupon.message ?? 'This coupon is not valid for your order',
                );
            }

            const quote = buildQuote(
                lines,
                dto.paymentMethod,
                coupon.discount,
                coupon.code,
                coupon.message,
            );

            // Prescription enforcement. The frontend has its own check, but that
            // one runs on a cart held in localStorage and is trivially edited.
            if (quote.requiresPrescription) {
                if (!dto.prescriptionId) {
                    throw new BadRequestException(
                        'This order contains prescription-only medicines and requires a prescription.',
                    );
                }

                const prescription = await this.prescriptionsService.findOwnedBy(
                    dto.prescriptionId,
                    userId,
                );

                if (prescription.status === PrescriptionStatus.REJECTED) {
                    throw new BadRequestException(
                        'The prescription supplied was rejected during review.',
                    );
                }
            }

            for (const line of lines) {
                await this.allocateStock(
                    manager,
                    line.productId,
                    line.quantity,
                    line.name,
                );
            }

            const order = manager.create(Order, {
                userId,
                status: OrderStatus.CREATED,
                // Nothing here has taken a payment. Marking an order PAID is the
                // payment gateway's job, via its webhook - not checkout's.
                paymentStatus: PaymentStatus.PENDING,
                subtotalAmount: quote.subtotal,
                taxAmount: quote.tax,
                shippingAmount: round2(quote.deliveryFee + quote.codFee),
                discountAmount: quote.discount,
                totalAmount: quote.total,
                couponCode: quote.couponCode,
                paymentMethod: dto.paymentMethod,
                prescriptionId: dto.prescriptionId ?? null,
                shippingAddress: dto.shippingAddress ?? null,
                notes: dto.notes ?? null,
                itemsCount: quote.itemsCount,
            } as Partial<Order>);

            const savedOrder = await manager.save(order);

            await manager.save(
                lines.map((line) =>
                    manager.create(OrderItem, {
                        orderId: savedOrder.id,
                        productId: line.productId,
                        name: line.name,
                        price: line.unitPrice,
                        quantity: line.quantity,
                        totalPrice: line.lineTotal,
                        image: line.image,
                    } as unknown as Partial<OrderItem>),
                ),
            );

            if (quote.couponCode) {
                await this.couponsService.recordUsage(
                    quote.couponCode,
                    userId,
                    savedOrder.id,
                    quote.discount,
                );
                await this.couponsService.incrementUsage(quote.couponCode);
            }

            this.logger.log(
                `Order ${savedOrder.id} created for user ${userId}: ${quote.itemsCount} items, total ${quote.total}`,
            );

            return (await manager.findOne(Order, {
                where: { id: savedOrder.id },
                relations: ['items'],
            }))!;
        });
    }
}
