import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  Res,
  UseGuards,
  HttpStatus,
  HttpCode,
  ValidationPipe,
} from '@nestjs/common';
import type { Response } from 'express';
import { ReportsService } from './reports.service';
import {
  ReportFiltersDto,
  ExportReportDto,
  GroupBy,
} from './dto/report-filters.dto';
import { JwtAuthGuard, AdminGuard } from '../auth/jwt-auth.guard';
import {
  SalesReport,
  ProductReport,
  CustomerReport,
  InventoryReport,
  FinancialReport,
  DashboardMetrics,
} from './interfaces/report.interfaces';

/**
 * Reports Controller
 *
 * Provides comprehensive reporting endpoints for:
 * - Sales analytics
 * - Product performance
 * - Customer insights
 * - Inventory status
 * - Financial summaries
 *
 * All endpoints require JWT authentication and admin privileges.
 */
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('v1/reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  // ==================== SALES REPORTS ====================

  /**
   * Get sales report
   * Returns comprehensive sales analytics including revenue, orders, and payment method breakdowns
   *
   * Query params:
   * - startDate: Start date (YYYY-MM-DD)
   * - endDate: End date (YYYY-MM-DD)
   * - groupBy: Group data by 'day' | 'week' | 'month'
   */
  @Get('sales')
  @HttpCode(HttpStatus.OK)
  async getSalesReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('groupBy') groupBy?: GroupBy,
  ): Promise<SalesReport> {
    return this.reportsService.getSalesReport(startDate, endDate, groupBy);
  }

  // ==================== PRODUCT REPORTS ====================

  /**
   * Get product performance report
   * Returns top selling products, low stock alerts, and expiring items
   *
   * Query params:
   * - startDate: Start date (YYYY-MM-DD)
   * - endDate: End date (YYYY-MM-DD)
   */
  @Get('products')
  @HttpCode(HttpStatus.OK)
  async getProductReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<ProductReport> {
    return this.reportsService.getProductPerformanceReport(startDate, endDate);
  }

  // ==================== CUSTOMER REPORTS ====================

  /**
   * Get customer analytics report
   * Returns customer distribution, lifetime values, and top customers
   *
   * Query params:
   * - startDate: Start date (YYYY-MM-DD)
   * - endDate: End date (YYYY-MM-DD)
   */
  @Get('customers')
  @HttpCode(HttpStatus.OK)
  async getCustomerReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<CustomerReport> {
    return this.reportsService.getCustomerReport(startDate, endDate);
  }

  // ==================== INVENTORY REPORTS ====================

  /**
   * Get inventory report
   * Returns current stock levels, expiring items, and out of stock products
   */
  @Get('inventory')
  @HttpCode(HttpStatus.OK)
  async getInventoryReport(): Promise<InventoryReport> {
    return this.reportsService.getInventoryReport();
  }

  // ==================== FINANCIAL REPORTS ====================

  /**
   * Get financial report
   * Returns financial analytics including revenue, refunds, and payment gateway breakdowns
   *
   * Query params:
   * - startDate: Start date (YYYY-MM-DD)
   * - endDate: End date (YYYY-MM-DD)
   */
  @Get('financial')
  @HttpCode(HttpStatus.OK)
  async getFinancialReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<FinancialReport> {
    return this.reportsService.getFinancialReport(startDate, endDate);
  }

  // ==================== DASHBOARD ====================

  /**
   * Get admin dashboard summary
   * Returns aggregated metrics for the admin dashboard including today, weekly, and monthly stats
   */
  @Get('dashboard')
  @HttpCode(HttpStatus.OK)
  async getDashboardSummary(): Promise<DashboardMetrics> {
    return this.reportsService.getDashboardSummary();
  }

  // ==================== EXPORT ====================

  /**
   * Export any report
   * Export sales, products, customers, inventory, or financial reports to CSV, Excel, or JSON format
   *
   * Body:
   * - reportType: 'sales' | 'products' | 'customers' | 'inventory' | 'financial'
   * - format: 'json' | 'csv' | 'excel'
   * - startDate: Start date (YYYY-MM-DD) - optional
   * - endDate: End date (YYYY-MM-DD) - optional
   * - groupBy: Group by option - optional
   */
  @Post('export')
  @HttpCode(HttpStatus.OK)
  async exportReport(
    @Body(new ValidationPipe({ transform: true })) exportDto: ExportReportDto,
    @Res() res: Response,
  ): Promise<void> {
    const { data, contentType, filename } =
      await this.reportsService.exportReport(
        exportDto.reportType,
        exportDto.format,
        {
          startDate: exportDto.startDate,
          endDate: exportDto.endDate,
          groupBy: exportDto.groupBy,
          filters: exportDto.filters,
        },
      );

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    if (typeof data === 'string') {
      res.send(data);
    } else {
      res.json(data);
    }
  }
}
