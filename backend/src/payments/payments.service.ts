import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, LessThanOrEqual, MoreThanOrEqual, IsNull, And } from 'typeorm';
import { PaymentMethod, PaymentMethodCode, PaymentMethodConfig } from './entities/payment-method.entity';
import { PaymentGatewayDiscount, DiscountType } from './entities/payment-gateway-discount.entity';
import { PaymentTransaction, PaymentStatus, PaymentMetadata, GatewayResponse } from './entities/payment-transaction.entity';
import { CreatePaymentMethodDto, UpdatePaymentMethodDto } from './dto/create-payment-method.dto';
import { CreateGatewayDiscountDto, UpdateGatewayDiscountDto, DiscountCalculationResult } from './dto/create-gateway-discount.dto';
import { ProcessPaymentDto, VerifyPaymentDto, RefundPaymentDto, PaymentIntent, RefundResult, PaymentVerificationResult, TransactionFiltersDto } from './dto/process-payment.dto';
import { PaymentGatewayFactory, MockPaymentGateway } from './interfaces/payment-gateway.interface';
import type { PaymentGateway } from './interfaces/payment-gateway.interface';

export interface ActivePaymentMethodResponse {
    code: PaymentMethodCode;
    name: string;
    description?: string | null;
    iconUrl?: string | null;
    supportedCurrencies: string[];
    minAmount?: number | null;
    maxAmount?: number | null;
    processingFee: number;
    processingFeePercent: number;
    sortOrder: number;
    applicableDiscount?: {
        name: string;
        description?: string | null;
        discountType: DiscountType;
        discountValue: number;
        maxDiscountAmount?: number | null;
    };
}

export interface PaymentHistoryResponse {
    id: string;
    orderId: string;
    paymentMethodCode: PaymentMethodCode;
    amount: number;
    currency: string;
    status: PaymentStatus;
    gatewayTransactionId: string | null;
    processedAt: Date | null;
    createdAt: Date;
}

@Injectable()
export class PaymentsService {
    private readonly logger = new Logger(PaymentsService.name);
    private gatewayInstances = new Map<PaymentMethodCode, PaymentGateway>();

    constructor(
        @InjectRepository(PaymentMethod)
        private paymentMethodRepository: Repository<PaymentMethod>,
        @InjectRepository(PaymentGatewayDiscount)
        private gatewayDiscountRepository: Repository<PaymentGatewayDiscount>,
        @InjectRepository(PaymentTransaction)
        private paymentTransactionRepository: Repository<PaymentTransaction>,
        private dataSource: DataSource,
    ) { }

    // ==================== Payment Methods CRUD ====================

    async createPaymentMethod(createDto: CreatePaymentMethodDto): Promise<PaymentMethod> {
        const existing = await this.paymentMethodRepository.findOne({
            where: { code: createDto.code },
        });

        if (existing) {
            throw new BadRequestException(`Payment method with code '${createDto.code}' already exists`);
        }

        const paymentMethod = this.paymentMethodRepository.create({
            code: createDto.code,
            name: createDto.name,
            description: createDto.description,
            iconUrl: createDto.iconUrl,
            isActive: createDto.isActive,
            isTestMode: createDto.isTestMode,
            config: createDto.config as PaymentMethodConfig,
            supportedCurrencies: createDto.supportedCurrencies,
            minAmount: createDto.minAmount,
            maxAmount: createDto.maxAmount,
            processingFee: createDto.processingFee,
            processingFeePercent: createDto.processingFeePercent,
            sortOrder: createDto.sortOrder,
        });

        return this.paymentMethodRepository.save(paymentMethod);
    }

    async findAllPaymentMethods(): Promise<PaymentMethod[]> {
        return this.paymentMethodRepository.find({
            order: { sortOrder: 'ASC', name: 'ASC' },
        });
    }

    async findPaymentMethodById(id: string): Promise<PaymentMethod> {
        const method = await this.paymentMethodRepository.findOne({ where: { id } });
        if (!method) {
            throw new NotFoundException(`Payment method with id '${id}' not found`);
        }
        return method;
    }

    async findPaymentMethodByCode(code: PaymentMethodCode): Promise<PaymentMethod> {
        const method = await this.paymentMethodRepository.findOne({ where: { code } });
        if (!method) {
            throw new NotFoundException(`Payment method with code '${code}' not found`);
        }
        return method;
    }

    async updatePaymentMethod(id: string, updateDto: UpdatePaymentMethodDto): Promise<PaymentMethod> {
        const paymentMethod = await this.findPaymentMethodById(id);

        Object.assign(paymentMethod, {
            name: updateDto.name ?? paymentMethod.name,
            description: updateDto.description ?? paymentMethod.description,
            iconUrl: updateDto.iconUrl ?? paymentMethod.iconUrl,
            isActive: updateDto.isActive ?? paymentMethod.isActive,
            isTestMode: updateDto.isTestMode ?? paymentMethod.isTestMode,
            config: updateDto.config ? { ...paymentMethod.config, ...updateDto.config } : paymentMethod.config,
            supportedCurrencies: updateDto.supportedCurrencies ?? paymentMethod.supportedCurrencies,
            minAmount: updateDto.minAmount ?? paymentMethod.minAmount,
            maxAmount: updateDto.maxAmount ?? paymentMethod.maxAmount,
            processingFee: updateDto.processingFee ?? paymentMethod.processingFee,
            processingFeePercent: updateDto.processingFeePercent ?? paymentMethod.processingFeePercent,
            sortOrder: updateDto.sortOrder ?? paymentMethod.sortOrder,
        });

        return this.paymentMethodRepository.save(paymentMethod);
    }

    // ==================== Gateway Discounts CRUD ====================

    async createGatewayDiscount(createDto: CreateGatewayDiscountDto): Promise<PaymentGatewayDiscount> {
        const discount = this.gatewayDiscountRepository.create({
            name: createDto.name,
            description: createDto.description,
            paymentMethodCode: createDto.paymentMethodCode,
            discountType: createDto.discountType,
            discountValue: createDto.discountValue,
            maxDiscountAmount: createDto.maxDiscountAmount,
            minOrderAmount: createDto.minOrderAmount,
            isActive: createDto.isActive,
            startDate: createDto.startDate ? new Date(createDto.startDate) : null,
            endDate: createDto.endDate ? new Date(createDto.endDate) : null,
            usageLimit: createDto.usageLimit,
            usageCount: 0,
        });

        return this.gatewayDiscountRepository.save(discount);
    }

    async findAllGatewayDiscounts(): Promise<PaymentGatewayDiscount[]> {
        return this.gatewayDiscountRepository.find({
            order: { createdAt: 'DESC' },
        });
    }

    async findGatewayDiscountById(id: string): Promise<PaymentGatewayDiscount> {
        const discount = await this.gatewayDiscountRepository.findOne({ where: { id } });
        if (!discount) {
            throw new NotFoundException(`Gateway discount with id '${id}' not found`);
        }
        return discount;
    }

    async findDiscountsByPaymentMethod(code: PaymentMethodCode): Promise<PaymentGatewayDiscount[]> {
        return this.gatewayDiscountRepository.find({
            where: { paymentMethodCode: code },
            order: { createdAt: 'DESC' },
        });
    }

    async updateGatewayDiscount(id: string, updateDto: UpdateGatewayDiscountDto): Promise<PaymentGatewayDiscount> {
        const discount = await this.findGatewayDiscountById(id);

        Object.assign(discount, {
            name: updateDto.name ?? discount.name,
            description: updateDto.description ?? discount.description,
            discountType: updateDto.discountType ?? discount.discountType,
            discountValue: updateDto.discountValue ?? discount.discountValue,
            maxDiscountAmount: updateDto.maxDiscountAmount ?? discount.maxDiscountAmount,
            minOrderAmount: updateDto.minOrderAmount ?? discount.minOrderAmount,
            isActive: updateDto.isActive ?? discount.isActive,
            startDate: updateDto.startDate ? new Date(updateDto.startDate) : discount.startDate,
            endDate: updateDto.endDate ? new Date(updateDto.endDate) : discount.endDate,
            usageLimit: updateDto.usageLimit ?? discount.usageLimit,
        });

        return this.gatewayDiscountRepository.save(discount);
    }

    // ==================== Customer-facing Methods ====================

    async getActivePaymentMethods(currency: string = 'INR'): Promise<ActivePaymentMethodResponse[]> {
        const methods = await this.paymentMethodRepository.find({
            where: { isActive: true },
            order: { sortOrder: 'ASC', name: 'ASC' },
        });

        const results: ActivePaymentMethodResponse[] = [];

        for (const method of methods) {
            // Check if method supports the requested currency
            if (!method.supportedCurrencies.includes(currency)) {
                continue;
            }

            const response: ActivePaymentMethodResponse = {
                code: method.code,
                name: method.name,
                description: method.description,
                iconUrl: method.iconUrl,
                supportedCurrencies: method.supportedCurrencies,
                minAmount: method.minAmount,
                maxAmount: method.maxAmount,
                processingFee: method.processingFee,
                processingFeePercent: method.processingFeePercent,
                sortOrder: method.sortOrder,
            };

            // Check for active discount
            const discount = await this.getApplicableDiscount(method.code, 0);
            if (discount) {
                response.applicableDiscount = {
                    name: discount.name,
                    description: discount.description,
                    discountType: discount.discountType,
                    discountValue: discount.discountValue,
                    maxDiscountAmount: discount.maxDiscountAmount,
                };
            }

            results.push(response);
        }

        return results;
    }

    async getApplicableDiscount(
        paymentMethodCode: PaymentMethodCode,
        orderAmount: number,
    ): Promise<PaymentGatewayDiscount | null> {
        const now = new Date();

        const discounts = await this.gatewayDiscountRepository.find({
            where: {
                paymentMethodCode,
                isActive: true,
            },
            order: { discountValue: 'DESC' }, // Get the highest discount first
        });

        for (const discount of discounts) {
            // Check date validity
            if (!discount.isValidDate()) {
                continue;
            }

            // Check usage limit
            if (!discount.hasRemainingUsage()) {
                continue;
            }

            // Check minimum order amount
            if (!discount.isApplicableForAmount(orderAmount)) {
                continue;
            }

            return discount;
        }

        return null;
    }

    async calculatePaymentDiscount(
        paymentMethodCode: PaymentMethodCode,
        orderAmount: number,
    ): Promise<DiscountCalculationResult> {
        const discount = await this.getApplicableDiscount(paymentMethodCode, orderAmount);

        if (!discount) {
            return {
                applicable: false,
                discountAmount: 0,
                originalAmount: orderAmount,
                finalAmount: orderAmount,
                message: 'No discount applicable for this payment method',
            };
        }

        const discountAmount = discount.calculateDiscount(orderAmount);

        return {
            applicable: true,
            discountAmount,
            originalAmount: orderAmount,
            finalAmount: Math.round((orderAmount - discountAmount) * 100) / 100,
            discountName: discount.name,
            discountDescription: discount.description || undefined,
            message: `${discount.name}: ${discount.discountType === 'percentage' ? discount.discountValue + '%' : '₹' + discount.discountValue} off`,
        };
    }

    // ==================== Payment Processing ====================

    async processPayment(processDto: ProcessPaymentDto, userId: number): Promise<PaymentIntent> {
        const { orderId, paymentMethodCode, amount, currency, metadata } = processDto;

        // Validate payment method
        const paymentMethod = await this.findPaymentMethodByCode(paymentMethodCode);

        if (!paymentMethod.isActive) {
            throw new BadRequestException(`Payment method '${paymentMethodCode}' is not active`);
        }

        // Check amount limits
        if (paymentMethod.minAmount && amount < paymentMethod.minAmount) {
            throw new BadRequestException(
                `Minimum amount for ${paymentMethod.name} is ${paymentMethod.minAmount}`,
            );
        }

        if (paymentMethod.maxAmount && amount > paymentMethod.maxAmount) {
            throw new BadRequestException(
                `Maximum amount for ${paymentMethod.name} is ${paymentMethod.maxAmount}`,
            );
        }

        // Check currency support
        if (!paymentMethod.supportedCurrencies.includes(currency)) {
            throw new BadRequestException(
                `Currency '${currency}' is not supported by ${paymentMethod.name}`,
            );
        }

        // Create transaction record
        const transaction = this.paymentTransactionRepository.create({
            orderId,
            userId,
            paymentMethodCode,
            amount,
            currency,
            status: 'pending',
            metadata: metadata as PaymentMetadata,
        });

        const savedTransaction = await this.paymentTransactionRepository.save(transaction);

        try {
            // Get or create gateway instance
            const gateway = this.getGatewayInstance(paymentMethodCode, paymentMethod.config);

            // Create payment intent
            const paymentIntent = await gateway.createPaymentIntent({
                amount,
                currency,
                orderId,
                userId,
                metadata,
                customerEmail: metadata?.customerEmail as string,
                customerPhone: metadata?.customerPhone as string,
                description: `Payment for order ${orderId}`,
            });

            // Update transaction with gateway transaction ID
            savedTransaction.gatewayTransactionId = paymentIntent.transactionId;
            savedTransaction.status = 'processing';
            await this.paymentTransactionRepository.save(savedTransaction);

            return paymentIntent;
        } catch (error) {
            // Update transaction status to failed
            savedTransaction.status = 'failed';
            savedTransaction.errorMessage = error instanceof Error ? error.message : 'Unknown error';
            await this.paymentTransactionRepository.save(savedTransaction);

            throw new BadRequestException(`Failed to create payment: ${savedTransaction.errorMessage}`);
        }
    }

    async verifyPayment(verifyDto: VerifyPaymentDto): Promise<PaymentVerificationResult> {
        const { transactionId, gatewayResponse, status } = verifyDto;

        const transaction = await this.paymentTransactionRepository.findOne({
            where: { id: transactionId },
        });

        if (!transaction) {
            throw new NotFoundException(`Transaction with id '${transactionId}' not found`);
        }

        if (transaction.status === 'completed') {
            return {
                success: true,
                transactionId,
                status: 'completed',
                amount: transaction.amount,
                message: 'Payment already verified',
            };
        }

        // Get payment method and gateway
        const paymentMethod = await this.findPaymentMethodByCode(transaction.paymentMethodCode);
        const gateway = this.getGatewayInstance(transaction.paymentMethodCode, paymentMethod.config);

        try {
            const result = await gateway.verifyPayment({
                transactionId: transaction.gatewayTransactionId || transactionId,
                gatewayResponse,
            });

            // Update transaction
            transaction.gatewayResponse = gatewayResponse as GatewayResponse;

            if (result.success) {
                transaction.status = 'completed';
                transaction.processedAt = new Date();

                // Increment discount usage count if applicable
                await this.incrementDiscountUsage(transaction.paymentMethodCode, transaction.amount);
            } else {
                transaction.status = status === 'failed' ? 'failed' : 'pending';
                transaction.errorMessage = result.message || 'Verification failed';
            }

            await this.paymentTransactionRepository.save(transaction);

            return result;
        } catch (error) {
            transaction.errorMessage = error instanceof Error ? error.message : 'Unknown error';
            await this.paymentTransactionRepository.save(transaction);

            throw new BadRequestException(`Payment verification failed: ${transaction.errorMessage}`);
        }
    }

    async refundPayment(refundDto: RefundPaymentDto): Promise<RefundResult> {
        const { transactionId, amount, reason } = refundDto;

        const transaction = await this.paymentTransactionRepository.findOne({
            where: { id: transactionId },
        });

        if (!transaction) {
            throw new NotFoundException(`Transaction with id '${transactionId}' not found`);
        }

        // Check if payment can be refunded
        if (!transaction.canBeRefunded()) {
            throw new BadRequestException('This payment cannot be refunded');
        }

        const refundAmount = amount || transaction.getRefundableAmount();

        if (refundAmount <= 0) {
            throw new BadRequestException('Refund amount must be positive');
        }

        if (refundAmount > transaction.getRefundableAmount()) {
            throw new BadRequestException(
                `Maximum refundable amount is ${transaction.getRefundableAmount()}`,
            );
        }

        // Get payment method and gateway
        const paymentMethod = await this.findPaymentMethodByCode(transaction.paymentMethodCode);
        const gateway = this.getGatewayInstance(transaction.paymentMethodCode, paymentMethod.config);

        try {
            const result = await gateway.refund({
                transactionId: transaction.id,
                gatewayTransactionId: transaction.gatewayTransactionId || transaction.id,
                amount: refundAmount,
                reason,
            });

            if (result.success) {
                // Update transaction refund info
                const currentRefundAmount = transaction.refundAmount || 0;
                transaction.refundAmount = currentRefundAmount + refundAmount;
                transaction.refundedAt = new Date();

                // If fully refunded, mark as refunded
                if (transaction.refundAmount >= transaction.amount) {
                    transaction.status = 'refunded';
                }

                await this.paymentTransactionRepository.save(transaction);
            }

            return result;
        } catch (error) {
            throw new BadRequestException(
                `Refund failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
        }
    }

    // ==================== Transaction History ====================

    async getPaymentHistory(userId: number, limit: number = 50, offset: number = 0): Promise<PaymentHistoryResponse[]> {
        const transactions = await this.paymentTransactionRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
            take: limit,
            skip: offset,
        });

        return transactions.map(t => ({
            id: t.id,
            orderId: t.orderId,
            paymentMethodCode: t.paymentMethodCode,
            amount: t.amount,
            currency: t.currency,
            status: t.status,
            gatewayTransactionId: t.gatewayTransactionId ?? null,
            processedAt: t.processedAt ?? null,
            createdAt: t.createdAt,
        }));
    }

    async getTransactions(filters: TransactionFiltersDto): Promise<{ transactions: PaymentTransaction[]; total: number }> {
        const queryBuilder = this.paymentTransactionRepository.createQueryBuilder('transaction');

        if (filters.userId) {
            queryBuilder.andWhere('transaction.userId = :userId', { userId: filters.userId });
        }

        if (filters.orderId) {
            queryBuilder.andWhere('transaction.orderId = :orderId', { orderId: filters.orderId });
        }

        if (filters.paymentMethodCode) {
            queryBuilder.andWhere('transaction.paymentMethodCode = :code', { code: filters.paymentMethodCode });
        }

        if (filters.status) {
            queryBuilder.andWhere('transaction.status = :status', { status: filters.status });
        }

        if (filters.startDate) {
            queryBuilder.andWhere('transaction.createdAt >= :startDate', { startDate: new Date(filters.startDate) });
        }

        if (filters.endDate) {
            queryBuilder.andWhere('transaction.createdAt <= :endDate', { endDate: new Date(filters.endDate) });
        }

        const total = await queryBuilder.getCount();

        const transactions = await queryBuilder
            .orderBy('transaction.createdAt', 'DESC')
            .take(filters.limit)
            .skip(filters.offset)
            .getMany();

        return { transactions, total };
    }

    async getTransactionById(id: string): Promise<PaymentTransaction> {
        const transaction = await this.paymentTransactionRepository.findOne({ where: { id } });
        if (!transaction) {
            throw new NotFoundException(`Transaction with id '${id}' not found`);
        }
        return transaction;
    }

    // ==================== Private Helper Methods ====================

    private getGatewayInstance(code: PaymentMethodCode, config: PaymentMethodConfig): PaymentGateway {
        // Return cached instance if available and initialized
        const cached = this.gatewayInstances.get(code);
        if (cached && cached.isReady()) {
            return cached;
        }

        // For now, use mock gateway. In production, this would instantiate
        // the appropriate gateway based on the payment method code
        const gateway = new MockPaymentGateway();

        gateway.initialize({
            apiKey: config.apiKey || 'mock_key',
            apiSecret: config.apiSecret,
            merchantId: config.merchantId,
            webhookSecret: config.webhookSecret,
            sandboxMode: config.sandboxMode ?? true,
            ...config.additionalConfig,
        });

        this.gatewayInstances.set(code, gateway);
        return gateway;
    }

    private async incrementDiscountUsage(
        paymentMethodCode: PaymentMethodCode,
        orderAmount: number,
    ): Promise<void> {
        const discount = await this.getApplicableDiscount(paymentMethodCode, orderAmount);

        if (discount) {
            discount.usageCount += 1;
            await this.gatewayDiscountRepository.save(discount);
        }
    }
}
