import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    Req,
    UseGuards,
    HttpCode,
    HttpStatus,
    ValidationPipe,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { OrdersService } from './orders.service';
import { CheckoutService } from './checkout.service';
import { CheckoutDto, QuoteDto } from './dto/checkout.dto';

interface AuthenticatedRequest {
    user: { sub: number; role: string };
}

import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderFiltersDto } from './dto/order-filters.dto';
import { Order, OrderStatus, PaymentStatus } from './entities/order.entity';
import { JwtAuthGuard, AdminGuard } from '../auth/jwt-auth.guard';

/**
 * Orders Controller
 *
 * Provides CRUD operations for order management:
 * - List orders with filtering and search
 * - Create new orders
 * - Update order details
 * - Delete orders
 * - Update order status and payment status
 * - Bulk import orders
 *
 * Admin endpoints require JWT authentication and admin privileges.
 */
@Controller('v1/orders')
export class OrdersController {
    constructor(
        private readonly ordersService: OrdersService,
        private readonly checkoutService: CheckoutService,
    ) { }

    /**
     * Price a cart.
     *
     * Authenticated customers only - coupon eligibility is per user. The
     * response is the only pricing the storefront should display; it must not
     * recompute totals locally.
     */
    @Post('quote')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async quote(
        @Req() req: AuthenticatedRequest,
        @Body(new ValidationPipe({ transform: true, whitelist: true })) dto: QuoteDto,
    ) {
        return this.checkoutService.quote(req.user.sub, dto);
    }

    /**
     * Place an order.
     *
     * This is the customer-facing counterpart to the admin-only `POST /`
     * below. Until it existed, the storefront had no endpoint capable of
     * creating an order at all, which is why checkout ended in a setTimeout.
     */
    @Post('checkout')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.CREATED)
    @Throttle({ default: { limit: 10, ttl: 60000 } })
    async checkout(
        @Req() req: AuthenticatedRequest,
        @Body(new ValidationPipe({ transform: true, whitelist: true })) dto: CheckoutDto,
    ): Promise<Order> {
        return this.checkoutService.checkout(req.user.sub, dto);
    }

    /** Orders belonging to the signed-in customer. */
    @Get('mine')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async findMine(@Req() req: AuthenticatedRequest): Promise<Order[]> {
        return this.ordersService.findByUser(req.user.sub);
    }

    /**
     * Get all orders
     * Supports filtering by status, payment status, date range, and search
     *
     * Query params:
     * - search: Search by order ID or customer name
     * - status: Filter by order status
     * - paymentStatus: Filter by payment status
     * - startDate: Start date for range filter (YYYY-MM-DD)
     * - endDate: End date for range filter (YYYY-MM-DD)
     * - page: Page number for pagination
     * - limit: Items per page
     * - sortBy: Field to sort by
     * - sortOrder: ASC or DESC
     */
    @Get()
    @UseGuards(JwtAuthGuard, AdminGuard)
    @HttpCode(HttpStatus.OK)
    async findAll(
        @Query(new ValidationPipe({ transform: true, whitelist: true })) filters: OrderFiltersDto,
    ): Promise<Order[]> {
        return this.ordersService.findAll(filters);
    }

    /**
     * Get order statistics
     * Returns aggregated order data for dashboard
     */
    @Get('stats')
    @UseGuards(JwtAuthGuard, AdminGuard)
    @HttpCode(HttpStatus.OK)
    async getStats(): Promise<{
        total: number;
        byStatus: Record<string, number>;
        totalRevenue: number;
        todayOrders: number;
    }> {
        return this.ordersService.getOrderStats();
    }

    /**
     * Import orders in bulk
     * Used for CSV/Excel import functionality
     */
    @Post('import')
    @UseGuards(JwtAuthGuard, AdminGuard)
    @HttpCode(HttpStatus.CREATED)
    async importOrders(
        @Body() body: { orders: CreateOrderDto[] },
    ): Promise<{ imported: number; errors: string[] }> {
        return this.ordersService.importOrders(body.orders);
    }

    /**
     * Get a single order by ID
     */
    @Get(':id')
    @UseGuards(JwtAuthGuard, AdminGuard)
    @HttpCode(HttpStatus.OK)
    async findOne(@Param('id') id: string): Promise<Order> {
        return this.ordersService.findOne(id);
    }

    /**
     * Create a new order
     */
    @Post()
    @UseGuards(JwtAuthGuard, AdminGuard)
    @HttpCode(HttpStatus.CREATED)
    async create(@Body(new ValidationPipe({ transform: true })) createOrderDto: CreateOrderDto): Promise<Order> {
        return this.ordersService.create(createOrderDto);
    }

    /**
     * Update an order
     */
    @Patch(':id')
    @UseGuards(JwtAuthGuard, AdminGuard)
    @HttpCode(HttpStatus.OK)
    async update(
        @Param('id') id: string,
        @Body(new ValidationPipe({ transform: true, skipMissingProperties: true })) updateOrderDto: UpdateOrderDto,
    ): Promise<Order> {
        return this.ordersService.update(id, updateOrderDto);
    }

    /**
     * Update order status
     * Special endpoint for quick status updates
     */
    @Patch(':id/status')
    @UseGuards(JwtAuthGuard, AdminGuard)
    @HttpCode(HttpStatus.OK)
    async updateStatus(
        @Param('id') id: string,
        @Body('status') status: OrderStatus,
    ): Promise<Order> {
        return this.ordersService.updateStatus(id, status);
    }

    /**
     * Update payment status
     * Special endpoint for payment status updates
     */
    @Patch(':id/payment-status')
    @UseGuards(JwtAuthGuard, AdminGuard)
    @HttpCode(HttpStatus.OK)
    async updatePaymentStatus(
        @Param('id') id: string,
        @Body('paymentStatus') paymentStatus: PaymentStatus,
    ): Promise<Order> {
        return this.ordersService.updatePaymentStatus(id, paymentStatus);
    }

    /**
     * Delete an order
     */
    @Delete(':id')
    @UseGuards(JwtAuthGuard, AdminGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id') id: string): Promise<void> {
        await this.ordersService.remove(id);
    }
}
