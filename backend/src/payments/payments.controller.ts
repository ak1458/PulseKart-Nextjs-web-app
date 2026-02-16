import {
    Controller,
    Get,
    Post,
    Put,
    Body,
    Param,
    Query,
    UseGuards,
    Request,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PaymentsService } from './payments.service';
import { CreatePaymentMethodDto, UpdatePaymentMethodDto } from './dto/create-payment-method.dto';
import type { CreateGatewayDiscountDto, UpdateGatewayDiscountDto } from './dto/create-gateway-discount.dto';
import type { ProcessPaymentDto, VerifyPaymentDto, RefundPaymentDto, TransactionFiltersDto } from './dto/process-payment.dto';
import type { PaymentMethodCode } from './entities/payment-method.entity';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
    createPaymentMethodSchema,
    updatePaymentMethodSchema,
} from './dto/create-payment-method.dto';
import {
    createGatewayDiscountSchema,
    updateGatewayDiscountSchema,
} from './dto/create-gateway-discount.dto';
import {
    processPaymentSchema,
    verifyPaymentSchema,
    refundPaymentSchema,
    transactionFiltersSchema,
} from './dto/process-payment.dto';

// Extend Request type to include user
declare module 'express' {
    interface Request {
        user?: {
            sub: number;
            email: string;
            role: string;
        };
    }
}

/**
 * Customer-facing Payment Controller
 */
@Controller('v1/payments')
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) {}

    /**
     * Get active payment methods for checkout
     * GET /v1/payments/methods
     */
    @Get('methods')
    @UseGuards(JwtAuthGuard)
    async getActivePaymentMethods(
        @Query('currency') currency?: string,
    ) {
        const methods = await this.paymentsService.getActivePaymentMethods(currency || 'INR');
        return {
            success: true,
            data: methods,
            count: methods.length,
        };
    }

    /**
     * Check discount for a specific payment method
     * GET /v1/payments/methods/:code/discount
     */
    @Get('methods/:code/discount')
    @UseGuards(JwtAuthGuard)
    async checkDiscount(
        @Param('code') code: PaymentMethodCode,
        @Query('amount') amount: string,
    ) {
        const orderAmount = parseFloat(amount) || 0;
        const discount = await this.paymentsService.calculatePaymentDiscount(code, orderAmount);
        return {
            success: true,
            data: discount,
        };
    }

    /**
     * Initiate a payment
     * POST /v1/payments/process
     */
    @Post('process')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async processPayment(
        @Body(new ZodValidationPipe(processPaymentSchema)) processDto: ProcessPaymentDto,
        @Request() req: { user: { sub: number } },
    ) {
        const paymentIntent = await this.paymentsService.processPayment(
            processDto,
            req.user.sub,
        );
        return {
            success: true,
            data: paymentIntent,
        };
    }

    /**
     * Verify a payment (callback/webhook handler)
     * POST /v1/payments/verify
     */
    @Post('verify')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async verifyPayment(
        @Body(new ZodValidationPipe(verifyPaymentSchema)) verifyDto: VerifyPaymentDto,
    ) {
        const result = await this.paymentsService.verifyPayment(verifyDto);
        return {
            success: result.success,
            data: result,
        };
    }

    /**
     * Get user's payment history
     * GET /v1/payments/history
     */
    @Get('history')
    @UseGuards(JwtAuthGuard)
    async getPaymentHistory(
        @Request() req: { user: { sub: number } },
        @Query('limit') limit?: string,
        @Query('offset') offset?: string,
    ) {
        const history = await this.paymentsService.getPaymentHistory(
            req.user.sub,
            parseInt(limit || '50', 10),
            parseInt(offset || '0', 10),
        );
        return {
            success: true,
            data: history,
            count: history.length,
        };
    }
}

/**
 * Admin Payment Controller
 */
@Controller('v1/admin/payments')
export class AdminPaymentsController {
    constructor(private readonly paymentsService: PaymentsService) {}

    // ==================== Payment Methods Management ====================

    /**
     * Get all payment methods (admin view)
     * GET /v1/admin/payments/methods
     */
    @Get('methods')
    @UseGuards(JwtAuthGuard)
    async getAllPaymentMethods() {
        const methods = await this.paymentsService.findAllPaymentMethods();
        return {
            success: true,
            data: methods,
            count: methods.length,
        };
    }

    /**
     * Create a new payment method
     * POST /v1/admin/payments/methods
     */
    @Post('methods')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.CREATED)
    async createPaymentMethod(
        @Body(new ZodValidationPipe(createPaymentMethodSchema)) createDto: CreatePaymentMethodDto,
    ) {
        const method = await this.paymentsService.createPaymentMethod(createDto);
        return {
            success: true,
            data: method,
            message: 'Payment method created successfully',
        };
    }

    /**
     * Update a payment method
     * PUT /v1/admin/payments/methods/:id
     */
    @Put('methods/:id')
    @UseGuards(JwtAuthGuard)
    async updatePaymentMethod(
        @Param('id') id: string,
        @Body(new ZodValidationPipe(updatePaymentMethodSchema)) updateDto: UpdatePaymentMethodDto,
    ) {
        const method = await this.paymentsService.updatePaymentMethod(id, updateDto);
        return {
            success: true,
            data: method,
            message: 'Payment method updated successfully',
        };
    }

    // ==================== Gateway Discounts Management ====================

    /**
     * Get all gateway discounts
     * GET /v1/admin/payments/gateway-discounts
     */
    @Get('gateway-discounts')
    @UseGuards(JwtAuthGuard)
    async getAllGatewayDiscounts() {
        const discounts = await this.paymentsService.findAllGatewayDiscounts();
        return {
            success: true,
            data: discounts,
            count: discounts.length,
        };
    }

    /**
     * Create a new gateway discount
     * POST /v1/admin/payments/gateway-discounts
     */
    @Post('gateway-discounts')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.CREATED)
    async createGatewayDiscount(
        @Body(new ZodValidationPipe(createGatewayDiscountSchema)) createDto: CreateGatewayDiscountDto,
    ) {
        const discount = await this.paymentsService.createGatewayDiscount(createDto);
        return {
            success: true,
            data: discount,
            message: 'Gateway discount created successfully',
        };
    }

    /**
     * Update a gateway discount
     * PUT /v1/admin/payments/gateway-discounts/:id
     */
    @Put('gateway-discounts/:id')
    @UseGuards(JwtAuthGuard)
    async updateGatewayDiscount(
        @Param('id') id: string,
        @Body(new ZodValidationPipe(updateGatewayDiscountSchema)) updateDto: UpdateGatewayDiscountDto,
    ) {
        const discount = await this.paymentsService.updateGatewayDiscount(id, updateDto);
        return {
            success: true,
            data: discount,
            message: 'Gateway discount updated successfully',
        };
    }

    // ==================== Transactions Management ====================

    /**
     * Get all transactions with filters
     * GET /v1/admin/payments/transactions
     */
    @Get('transactions')
    @UseGuards(JwtAuthGuard)
    async getTransactions(
        @Query(new ZodValidationPipe(transactionFiltersSchema)) filters: TransactionFiltersDto,
    ) {
        const result = await this.paymentsService.getTransactions(filters);
        return {
            success: true,
            data: result.transactions,
            total: result.total,
            count: result.transactions.length,
        };
    }

    /**
     * Get transaction by ID
     * GET /v1/admin/payments/transactions/:id
     */
    @Get('transactions/:id')
    @UseGuards(JwtAuthGuard)
    async getTransactionById(@Param('id') id: string) {
        const transaction = await this.paymentsService.getTransactionById(id);
        return {
            success: true,
            data: transaction,
        };
    }

    /**
     * Process a refund
     * POST /v1/admin/payments/refund
     */
    @Post('refund')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async refundPayment(
        @Body(new ZodValidationPipe(refundPaymentSchema)) refundDto: RefundPaymentDto,
    ) {
        const result = await this.paymentsService.refundPayment(refundDto);
        return {
            success: result.success,
            data: result,
            message: result.message || 'Refund processed',
        };
    }
}
