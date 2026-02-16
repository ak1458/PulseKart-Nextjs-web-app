import { IsOptional, IsString, IsDateString, IsEnum, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export enum GroupBy {
    DAY = 'day',
    WEEK = 'week',
    MONTH = 'month',
}

export enum ReportFormat {
    JSON = 'json',
    CSV = 'csv',
    EXCEL = 'excel',
}

export class AdditionalFilters {
    @IsOptional()
    @IsString()
    category?: string;

    @IsOptional()
    @IsString()
    productId?: string;

    @IsOptional()
    @IsString()
    customerId?: string;

    @IsOptional()
    @IsString()
    paymentMethod?: string;

    @IsOptional()
    @IsString()
    status?: string;
}

export class ReportFiltersDto {
    @IsOptional()
    @IsDateString()
    startDate?: string;

    @IsOptional()
    @IsDateString()
    endDate?: string;

    @IsOptional()
    @IsEnum(GroupBy)
    groupBy?: GroupBy;

    @IsOptional()
    @IsEnum(ReportFormat)
    format?: ReportFormat;

    @IsOptional()
    @ValidateNested()
    @Type(() => AdditionalFilters)
    filters?: AdditionalFilters;
}

export class ExportReportDto {
    @IsString()
    reportType: 'sales' | 'products' | 'customers' | 'inventory' | 'financial';

    @IsOptional()
    @IsDateString()
    startDate?: string;

    @IsOptional()
    @IsDateString()
    endDate?: string;

    @IsOptional()
    @IsEnum(GroupBy)
    groupBy?: GroupBy;

    @IsEnum(ReportFormat)
    format: ReportFormat;

    @IsOptional()
    @ValidateNested()
    @Type(() => AdditionalFilters)
    filters?: AdditionalFilters;
}
