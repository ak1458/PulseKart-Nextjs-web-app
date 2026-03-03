// Sales Report Interfaces
export interface DailySalesData {
  date: string;
  revenue: number;
  orders: number;
  aov: number;
}

export interface PaymentMethodData {
  method: string;
  amount: number;
  count: number;
}

export interface CategoryRevenueData {
  category: string;
  revenue: number;
  percentage: number;
}

export interface SalesSummary {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  previousPeriodComparison: number;
}

export interface SalesReport {
  summary: SalesSummary;
  dailyData: DailySalesData[];
  byPaymentMethod: PaymentMethodData[];
  byCategory: CategoryRevenueData[];
}

// Product Report Interfaces
export interface TopSellingProduct {
  productId: string;
  name: string;
  quantitySold: number;
  revenue: number;
}

export interface LowStockProduct {
  productId: string;
  name: string;
  currentStock: number;
  reorderLevel: number;
}

export interface ExpiringProduct {
  productId: string;
  name: string;
  expiryDate: Date;
  batchNumber: string;
}

export interface ProductReturnRate {
  productId: string;
  name: string;
  totalSold: number;
  totalReturned: number;
  returnRate: number;
}

export interface ProductReport {
  topSelling: TopSellingProduct[];
  lowStock: LowStockProduct[];
  expiringSoon: ExpiringProduct[];
  returnRates: ProductReturnRate[];
}

// Customer Report Interfaces
export interface CustomerTypeDistribution {
  newCustomers: number;
  returningCustomers: number;
  newCustomerPercentage: number;
  returningCustomerPercentage: number;
}

export interface CustomerLifetimeValue {
  customerId: string;
  name: string;
  email: string;
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  firstOrderDate: Date;
  lastOrderDate: Date;
}

export interface TopCustomer {
  customerId: string;
  name: string;
  email: string;
  totalRevenue: number;
  totalOrders: number;
  rank: number;
}

export interface CustomerReport {
  customerDistribution: CustomerTypeDistribution;
  lifetimeValues: CustomerLifetimeValue[];
  topCustomers: TopCustomer[];
  totalCustomers: number;
  activeCustomers: number;
}

// Inventory Report Interfaces
export interface StockLevel {
  productId: string;
  name: string;
  sku: string;
  currentStock: number;
  reservedStock: number;
  availableStock: number;
  reorderPoint: number;
  reorderLevel: 'low' | 'normal' | 'excess';
  warehouseLocation?: string;
}

export interface ExpiringInventoryItem {
  productId: string;
  name: string;
  sku: string;
  batchNumber: string;
  expiryDate: Date;
  daysUntilExpiry: number;
  quantity: number;
}

export interface OutOfStockItem {
  productId: string;
  name: string;
  sku: string;
  lastRestockDate?: Date;
  averageDailyDemand: number;
  daysOutOfStock: number;
}

export interface InventoryValuation {
  totalItems: number;
  totalValue: number;
  averageItemValue: number;
  byCategory: Array<{
    category: string;
    itemCount: number;
    totalValue: number;
  }>;
}

export interface InventoryReport {
  stockLevels: StockLevel[];
  expiringSoon: ExpiringInventoryItem[];
  outOfStock: OutOfStockItem[];
  valuation: InventoryValuation;
}

// Financial Report Interfaces
export interface FinancialSummary {
  grossRevenue: number;
  totalRefunds: number;
  netRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  totalDiscounts: number;
  totalTaxCollected: number;
}

export interface PaymentGatewayBreakdown {
  gateway: string;
  revenue: number;
  transactionCount: number;
  averageTransactionValue: number;
  fees: number;
  netRevenue: number;
}

export interface PaymentMethodSplit {
  cod: {
    orderCount: number;
    revenue: number;
    percentage: number;
  };
  prepaid: {
    orderCount: number;
    revenue: number;
    percentage: number;
  };
}

export interface DailyFinancialData {
  date: string;
  revenue: number;
  refunds: number;
  netRevenue: number;
  orders: number;
}

export interface FinancialReport {
  summary: FinancialSummary;
  dailyData: DailyFinancialData[];
  paymentGatewayBreakdown: PaymentGatewayBreakdown[];
  paymentMethodSplit: PaymentMethodSplit;
}

// Dashboard Summary Interface
export interface DashboardMetrics {
  today: {
    revenue: number;
    orders: number;
    newCustomers: number;
    lowStockAlerts: number;
  };
  thisWeek: {
    revenue: number;
    orders: number;
    averageOrderValue: number;
    previousWeekComparison: number;
  };
  thisMonth: {
    revenue: number;
    orders: number;
    newCustomers: number;
    topProduct: {
      name: string;
      revenue: number;
    };
  };
  inventory: {
    totalProducts: number;
    lowStockCount: number;
    outOfStockCount: number;
    expiringSoonCount: number;
  };
  recentOrders: Array<{
    orderId: string;
    customerName: string;
    amount: number;
    status: string;
    date: Date;
  }>;
}
