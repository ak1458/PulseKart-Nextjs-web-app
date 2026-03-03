import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { Batch } from '../products/entities/batch.entity';
import { GroupBy, ReportFiltersDto } from './dto/report-filters.dto';
import {
    SalesReport,
    ProductReport,
    CustomerReport,
    InventoryReport,
    FinancialReport,
    DashboardMetrics,
} from './interfaces/report.interfaces';

@Injectable()
export class ReportsService {
    private readonly logger = new Logger(ReportsService.name);

    constructor(
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
        @InjectRepository(Batch)
        private readonly batchRepository: Repository<Batch>,
    ) {}

    // ==================== SALES REPORTS ====================

    async getSalesReport(
        startDate?: string,
        endDate?: string,
        groupBy: GroupBy = GroupBy.DAY,
    ): Promise<SalesReport> {
        this.logger.log(
            `Generating sales report from ${startDate} to ${endDate} grouped by ${groupBy}`,
        );

        // Calculate date range
        const end = endDate ? new Date(endDate) : new Date();
        const start = startDate
            ? new Date(startDate)
            : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

        // Calculate previous period for comparison
        const periodDuration = end.getTime() - start.getTime();

        // Mock data - In production, these would be actual database queries
        const summary = {
            totalRevenue: 1250000.5,
            totalOrders: 450,
            averageOrderValue: 2777.78,
            previousPeriodComparison: 15.5, // 15.5% increase
        };

        // Generate daily/weekly/monthly data based on groupBy
        const dailyData = this.generateTimeSeriesData(start, end, groupBy);

        const byPaymentMethod = [
            { method: 'Credit Card', amount: 625000.25, count: 225 },
            { method: 'Debit Card', amount: 375000.15, count: 135 },
            { method: 'UPI', amount: 187500.08, count: 67 },
            { method: 'COD', amount: 62500.02, count: 23 },
        ];

        const byCategory = [
            { category: 'Prescription Medicines', revenue: 450000, percentage: 36 },
            { category: 'OTC Products', revenue: 312500, percentage: 25 },
            { category: 'Health Supplements', revenue: 250000, percentage: 20 },
            { category: 'Personal Care', revenue: 150000, percentage: 12 },
            { category: 'Medical Devices', revenue: 87500.5, percentage: 7 },
        ];

        return {
            summary,
            dailyData,
            byPaymentMethod,
            byCategory,
        };
    }

    // ==================== PRODUCT REPORTS ====================

    async getProductPerformanceReport(
        startDate?: string,
        endDate?: string,
    ): Promise<ProductReport> {
        this.logger.log(
            `Generating product performance report from ${startDate} to ${endDate}`,
        );

        // Get real product data for low stock
        const products = await this.productRepository.find({
            relations: ['batches'],
        });

        // Mock top selling products
        const topSelling = [
            { productId: '1', name: 'Paracetamol 500mg', quantitySold: 1200, revenue: 12000 },
            { productId: '2', name: 'Vitamin D3 60K', quantitySold: 850, revenue: 21250 },
            { productId: '3', name: 'Omeprazole 20mg', quantitySold: 720, revenue: 14400 },
            { productId: '4', name: 'Cetirizine 10mg', quantitySold: 680, revenue: 6800 },
            { productId: '5', name: 'Aspirin 75mg', quantitySold: 550, revenue: 5500 },
        ];

        // Real low stock products from database
        const lowStock: Array<{
            productId: string;
            name: string;
            currentStock: number;
            reorderLevel: number;
        }> = [];

        for (const product of products) {
            const totalStock = product.batches?.reduce(
                (sum, batch) => sum + (batch.qty_available || 0),
                0,
            ) || 0;

            if (totalStock < 50) {
                lowStock.push({
                    productId: product.id.toString(),
                    name: product.title,
                    currentStock: totalStock,
                    reorderLevel: 50,
                });
            }
        }

        // Add mock data if no low stock found
        if (lowStock.length === 0) {
            lowStock.push(
                { productId: '101', name: 'Amoxicillin 500mg', currentStock: 15, reorderLevel: 50 },
                { productId: '102', name: 'Ibuprofen 400mg', currentStock: 25, reorderLevel: 50 },
                { productId: '103', name: 'Metformin 500mg', currentStock: 30, reorderLevel: 50 },
            );
        }

        // Get expiring products from database
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        const expiringBatches = await this.batchRepository.find({
            where: {
                expiry_date: Between(new Date(), thirtyDaysFromNow),
            },
            relations: ['product'],
            take: 10,
        });

        const expiringSoon = expiringBatches.map((batch) => ({
            productId: batch.product?.id?.toString() || batch.sku_id.toString(),
            name: batch.product?.title || 'Unknown Product',
            expiryDate: batch.expiry_date,
            batchNumber: batch.batch_no,
        }));

        // Mock return rates
        const returnRates = [
            { productId: '1', name: 'Paracetamol 500mg', totalSold: 1200, totalReturned: 12, returnRate: 1.0 },
            { productId: '2', name: 'Vitamin D3 60K', totalSold: 850, totalReturned: 8, returnRate: 0.94 },
            { productId: '3', name: 'Omeprazole 20mg', totalSold: 720, totalReturned: 5, returnRate: 0.69 },
            { productId: '4', name: 'Cetirizine 10mg', totalSold: 680, totalReturned: 15, returnRate: 2.21 },
            { productId: '5', name: 'Aspirin 75mg', totalSold: 550, totalReturned: 3, returnRate: 0.55 },
        ];

        return {
            topSelling,
            lowStock,
            expiringSoon,
            returnRates,
        };
    }

    // ==================== CUSTOMER REPORTS ====================

    async getCustomerReport(
        startDate?: string,
        endDate?: string,
    ): Promise<CustomerReport> {
        this.logger.log(
            `Generating customer report from ${startDate} to ${endDate}`,
        );

        const customerDistribution = {
            newCustomers: 125,
            returningCustomers: 325,
            newCustomerPercentage: 27.8,
            returningCustomerPercentage: 72.2,
        };

        const lifetimeValues = [
            {
                customerId: 'C001',
                name: 'John Doe',
                email: 'john.doe@example.com',
                totalOrders: 15,
                totalRevenue: 25000,
                averageOrderValue: 1666.67,
                firstOrderDate: new Date('2023-01-15'),
                lastOrderDate: new Date('2024-02-01'),
            },
            {
                customerId: 'C002',
                name: 'Jane Smith',
                email: 'jane.smith@example.com',
                totalOrders: 23,
                totalRevenue: 42000,
                averageOrderValue: 1826.09,
                firstOrderDate: new Date('2022-11-20'),
                lastOrderDate: new Date('2024-02-10'),
            },
            {
                customerId: 'C003',
                name: 'Robert Johnson',
                email: 'robert.j@example.com',
                totalOrders: 8,
                totalRevenue: 12500,
                averageOrderValue: 1562.5,
                firstOrderDate: new Date('2023-06-10'),
                lastOrderDate: new Date('2024-01-28'),
            },
        ];

        const topCustomers = [
            { customerId: 'C002', name: 'Jane Smith', email: 'jane.smith@example.com', totalRevenue: 42000, totalOrders: 23, rank: 1 },
            { customerId: 'C001', name: 'John Doe', email: 'john.doe@example.com', totalRevenue: 25000, totalOrders: 15, rank: 2 },
            { customerId: 'C005', name: 'Emily Davis', email: 'emily.d@example.com', totalRevenue: 18500, totalOrders: 12, rank: 3 },
            { customerId: 'C003', name: 'Robert Johnson', email: 'robert.j@example.com', totalRevenue: 12500, totalOrders: 8, rank: 4 },
            { customerId: 'C004', name: 'Michael Wilson', email: 'mike.w@example.com', totalRevenue: 11000, totalOrders: 10, rank: 5 },
        ];

        return {
            customerDistribution,
            lifetimeValues,
            topCustomers,
            totalCustomers: 450,
            activeCustomers: 325,
        };
    }

    // ==================== INVENTORY REPORTS ====================

    async getInventoryReport(): Promise<InventoryReport> {
        this.logger.log('Generating inventory report');

        // Get all products with batches
        const products = await this.productRepository.find({
            relations: ['batches'],
        });

        const stockLevels: Array<{
            productId: string;
            name: string;
            sku: string;
            currentStock: number;
            reservedStock: number;
            availableStock: number;
            reorderPoint: number;
            reorderLevel: 'low' | 'normal' | 'excess';
            warehouseLocation?: string;
        }> = [];

        let totalInventoryValue = 0;
        const categoryMap = new Map<string, { itemCount: number; totalValue: number }>();

        for (const product of products) {
            const totalStock = product.batches?.reduce(
                (sum, batch) => sum + (batch.qty_available || 0),
                0,
            ) || 0;

            const reservedStock = product.batches?.reduce(
                (sum, batch) => sum + (batch.qty_reserved || 0),
                0,
            ) || 0;

            const availableStock = totalStock - reservedStock;
            const reorderPoint = 50; // Default reorder point

            let reorderLevel: 'low' | 'normal' | 'excess' = 'normal';
            if (availableStock < reorderPoint) {
                reorderLevel = 'low';
            } else if (availableStock > reorderPoint * 5) {
                reorderLevel = 'excess';
            }

            const productValue = Number(product.price) * totalStock;
            totalInventoryValue += productValue;

            // Track category data
            const category = product.category || 'Uncategorized';
            const existing = categoryMap.get(category) || { itemCount: 0, totalValue: 0 };
            existing.itemCount++;
            existing.totalValue += productValue;
            categoryMap.set(category, existing);

            stockLevels.push({
                productId: product.id.toString(),
                name: product.title,
                sku: product.sku,
                currentStock: totalStock,
                reservedStock,
                availableStock,
                reorderPoint,
                reorderLevel,
                warehouseLocation: 'WH-01',
            });
        }

        // Get expiring products
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        const expiringBatches = await this.batchRepository.find({
            where: {
                expiry_date: Between(new Date(), thirtyDaysFromNow),
            },
            relations: ['product'],
        });

        const expiringSoon = expiringBatches.map((batch) => {
            const daysUntilExpiry = Math.ceil(
                (new Date(batch.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
            );

            return {
                productId: batch.product?.id?.toString() || batch.sku_id.toString(),
                name: batch.product?.title || 'Unknown Product',
                sku: batch.product?.sku || 'N/A',
                batchNumber: batch.batch_no,
                expiryDate: batch.expiry_date,
                daysUntilExpiry,
                quantity: batch.qty_available,
            };
        });

        // Get out of stock products
        const outOfStock = stockLevels
            .filter((item) => item.availableStock === 0)
            .map((item) => ({
                productId: item.productId,
                name: item.name,
                sku: item.sku,
                lastRestockDate: undefined as Date | undefined,
                averageDailyDemand: Math.floor(Math.random() * 10) + 1,
                daysOutOfStock: Math.floor(Math.random() * 30) + 1,
            }));

        const valuation = {
            totalItems: products.length,
            totalValue: totalInventoryValue,
            averageItemValue: totalInventoryValue / (products.length || 1),
            byCategory: Array.from(categoryMap.entries()).map(([category, data]) => ({
                category,
                itemCount: data.itemCount,
                totalValue: data.totalValue,
            })),
        };

        return {
            stockLevels,
            expiringSoon,
            outOfStock,
            valuation,
        };
    }

    // ==================== FINANCIAL REPORTS ====================

    async getFinancialReport(
        startDate?: string,
        endDate?: string,
    ): Promise<FinancialReport> {
        this.logger.log(
            `Generating financial report from ${startDate} to ${endDate}`,
        );

        const end = endDate ? new Date(endDate) : new Date();
        const start = startDate
            ? new Date(startDate)
            : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

        const summary = {
            grossRevenue: 1250000.5,
            totalRefunds: 25000,
            netRevenue: 1225000.5,
            totalOrders: 450,
            averageOrderValue: 2777.78,
            totalDiscounts: 50000,
            totalTaxCollected: 125000,
        };

        const dailyData = this.generateFinancialTimeSeries(start, end);

        const paymentGatewayBreakdown = [
            {
                gateway: 'Razorpay',
                revenue: 625000,
                transactionCount: 225,
                averageTransactionValue: 2777.78,
                fees: 12500,
                netRevenue: 612500,
            },
            {
                gateway: 'Stripe',
                revenue: 375000,
                transactionCount: 135,
                averageTransactionValue: 2777.78,
                fees: 7500,
                netRevenue: 367500,
            },
            {
                gateway: 'PayU',
                revenue: 187500,
                transactionCount: 67,
                averageTransactionValue: 2798.51,
                fees: 3750,
                netRevenue: 183750,
            },
            {
                gateway: 'COD',
                revenue: 62500,
                transactionCount: 23,
                averageTransactionValue: 2717.39,
                fees: 0,
                netRevenue: 62500,
            },
        ];

        const paymentMethodSplit = {
            cod: {
                orderCount: 23,
                revenue: 62500,
                percentage: 5.1,
            },
            prepaid: {
                orderCount: 427,
                revenue: 1187500.5,
                percentage: 94.9,
            },
        };

        return {
            summary,
            dailyData,
            paymentGatewayBreakdown,
            paymentMethodSplit,
        };
    }

    // ==================== DASHBOARD ====================

    async getDashboardSummary(): Promise<DashboardMetrics> {
        this.logger.log('Generating dashboard summary');

        const products = await this.productRepository.count();
        const lowStockProducts = await this.getLowStockCount();
        const expiringCount = await this.getExpiringSoonCount();
        const outOfStockCount = await this.getOutOfStockCount();

        return {
            today: {
                revenue: 45000,
                orders: 18,
                newCustomers: 5,
                lowStockAlerts: lowStockProducts,
            },
            thisWeek: {
                revenue: 285000,
                orders: 105,
                averageOrderValue: 2714.29,
                previousWeekComparison: 12.5,
            },
            thisMonth: {
                revenue: 1250000,
                orders: 450,
                newCustomers: 125,
                topProduct: {
                    name: 'Paracetamol 500mg',
                    revenue: 45000,
                },
            },
            inventory: {
                totalProducts: products,
                lowStockCount: lowStockProducts,
                outOfStockCount: outOfStockCount,
                expiringSoonCount: expiringCount,
            },
            recentOrders: [
                {
                    orderId: 'ORD-2024-001',
                    customerName: 'John Doe',
                    amount: 2500,
                    status: 'Delivered',
                    date: new Date('2024-02-14T10:30:00'),
                },
                {
                    orderId: 'ORD-2024-002',
                    customerName: 'Jane Smith',
                    amount: 4800,
                    status: 'Shipped',
                    date: new Date('2024-02-14T09:15:00'),
                },
                {
                    orderId: 'ORD-2024-003',
                    customerName: 'Robert Johnson',
                    amount: 1200,
                    status: 'Processing',
                    date: new Date('2024-02-14T08:45:00'),
                },
                {
                    orderId: 'ORD-2024-004',
                    customerName: 'Emily Davis',
                    amount: 3500,
                    status: 'Pending',
                    date: new Date('2024-02-14T08:00:00'),
                },
                {
                    orderId: 'ORD-2024-005',
                    customerName: 'Michael Wilson',
                    amount: 2100,
                    status: 'Delivered',
                    date: new Date('2024-02-13T16:30:00'),
                },
            ],
        };
    }

    // ==================== EXPORT ====================

    async exportReport(
        reportType: string,
        format: 'json' | 'csv' | 'excel',
        filters: ReportFiltersDto,
    ): Promise<{ data: unknown; contentType: string; filename: string }> {
        this.logger.log(`Exporting ${reportType} report in ${format} format`);

        let reportData: unknown;

        switch (reportType) {
            case 'sales':
                reportData = await this.getSalesReport(
                    filters.startDate,
                    filters.endDate,
                    filters.groupBy,
                );
                break;
            case 'products':
                reportData = await this.getProductPerformanceReport(
                    filters.startDate,
                    filters.endDate,
                );
                break;
            case 'customers':
                reportData = await this.getCustomerReport(
                    filters.startDate,
                    filters.endDate,
                );
                break;
            case 'inventory':
                reportData = await this.getInventoryReport();
                break;
            case 'financial':
                reportData = await this.getFinancialReport(
                    filters.startDate,
                    filters.endDate,
                );
                break;
            default:
                throw new Error(`Unknown report type: ${reportType}`);
        }

        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `${reportType}-report-${timestamp}`;

        if (format === 'json') {
            return {
                data: JSON.stringify(reportData, null, 2),
                contentType: 'application/json',
                filename: `${filename}.json`,
            };
        } else if (format === 'csv') {
            const csvData = this.convertToCSV(reportData, reportType);
            return {
                data: csvData,
                contentType: 'text/csv',
                filename: `${filename}.csv`,
            };
        } else {
            // For Excel, we'd return JSON that the frontend can convert
            // In production, you'd use a library like xlsx
            return {
                data: reportData,
                contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                filename: `${filename}.xlsx`,
            };
        }
    }

    // ==================== HELPER METHODS ====================

    private generateTimeSeriesData(
        start: Date,
        end: Date,
        groupBy: GroupBy,
    ): Array<{ date: string; revenue: number; orders: number; aov: number }> {
        const data: Array<{ date: string; revenue: number; orders: number; aov: number }> = [];
        const current = new Date(start);

        while (current <= end) {
            const revenue = Math.floor(Math.random() * 50000) + 20000;
            const orders = Math.floor(Math.random() * 20) + 5;
            const aov = revenue / orders;

            let dateLabel: string;

            if (groupBy === GroupBy.DAY) {
                dateLabel = current.toISOString().split('T')[0];
                current.setDate(current.getDate() + 1);
            } else if (groupBy === GroupBy.WEEK) {
                dateLabel = `Week ${this.getWeekNumber(current)}-${current.getFullYear()}`;
                current.setDate(current.getDate() + 7);
            } else {
                dateLabel = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
                current.setMonth(current.getMonth() + 1);
            }

            data.push({
                date: dateLabel,
                revenue,
                orders,
                aov: parseFloat(aov.toFixed(2)),
            });
        }

        return data;
    }

    private generateFinancialTimeSeries(
        start: Date,
        end: Date,
    ): Array<{ date: string; revenue: number; refunds: number; netRevenue: number; orders: number }> {
        const data: Array<{ date: string; revenue: number; refunds: number; netRevenue: number; orders: number }> = [];
        const current = new Date(start);

        while (current <= end) {
            const revenue = Math.floor(Math.random() * 50000) + 20000;
            const refunds = Math.floor(revenue * (Math.random() * 0.05));
            const netRevenue = revenue - refunds;
            const orders = Math.floor(Math.random() * 20) + 5;

            data.push({
                date: current.toISOString().split('T')[0],
                revenue,
                refunds,
                netRevenue,
                orders,
            });

            current.setDate(current.getDate() + 1);
        }

        return data;
    }

    private getWeekNumber(date: Date): number {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil(((+d - +yearStart) / 86400000 + 1) / 7);
    }

    private async getLowStockCount(): Promise<number> {
        const products = await this.productRepository.find({
            relations: ['batches'],
        });

        return products.filter((product) => {
            const totalStock = product.batches?.reduce(
                (sum, batch) => sum + (batch.qty_available || 0),
                0,
            ) || 0;
            return totalStock < 50;
        }).length;
    }

    private async getExpiringSoonCount(): Promise<number> {
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        const count = await this.batchRepository.count({
            where: {
                expiry_date: Between(new Date(), thirtyDaysFromNow),
            },
        });

        return count;
    }

    private async getOutOfStockCount(): Promise<number> {
        const products = await this.productRepository.find({
            relations: ['batches'],
        });

        return products.filter((product) => {
            const totalStock = product.batches?.reduce(
                (sum, batch) => sum + (batch.qty_available || 0),
                0,
            ) || 0;
            return totalStock === 0;
        }).length;
    }

    private convertToCSV(data: unknown, reportType: string): string {
        // Simple CSV conversion - in production, use a library like json2csv
        const rows: string[] = [];

        if (reportType === 'sales' && data && typeof data === 'object') {
            const salesData = data as SalesReport;
            if (salesData.summary) {
                rows.push('Metric,Value');
                rows.push(`Total Revenue,${salesData.summary.totalRevenue}`);
                rows.push(`Total Orders,${salesData.summary.totalOrders}`);
                rows.push(`Average Order Value,${salesData.summary.averageOrderValue}`);
                rows.push('');

                if (salesData.dailyData?.length) {
                    rows.push('Date,Revenue,Orders,AOV');
                    for (const day of salesData.dailyData) {
                        rows.push(`${day.date},${day.revenue},${day.orders},${day.aov}`);
                    }
                }
            }
        } else {
            // Generic JSON to CSV
            rows.push(JSON.stringify(data, null, 2));
        }

        return rows.join('\n');
    }
}
