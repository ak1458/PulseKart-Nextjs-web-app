import { Controller, Get, Post, Body, Param, Query, UsePipes, NotFoundException, UseGuards } from '@nestjs/common';
import { ProductsService, ProductWithStock } from './products.service';
import { CreateProductDto, createProductSchema } from './dto/create-product.dto';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { JwtAuthGuard, AdminGuard } from '../auth/jwt-auth.guard';

@Controller('v1/products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Post()
    @UseGuards(JwtAuthGuard, AdminGuard)
    @UsePipes(new ZodValidationPipe(createProductSchema))
    create(@Body() createProductDto: CreateProductDto) {
        // Legacy compatibility mapping
        const productData = {
            ...createProductDto,
            title: createProductDto.title || (createProductDto as any).name || 'Untitled',
            tax_rate: createProductDto.tax_rate ?? 0,
            prescription_required: createProductDto.prescription_required ?? false
        };
        return this.productsService.create(productData);
    }

    @Get()
    async findAll(
        @Query('limit') limit: string,
        @Query('offset') offset: string,
        @Query('category') category?: string,
        @Query('search') search?: string,
        @Query('minPrice') minPrice?: string,
        @Query('maxPrice') maxPrice?: string,
    ): Promise<ProductWithStock[]> {
        const products = await this.productsService.findAll(
            limit ? parseInt(limit, 10) : 50,
            offset ? parseInt(offset, 10) : 0,
            {
                category,
                search,
                minPrice: minPrice ? parseFloat(minPrice) : undefined,
                maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
            }
        );
        return products;
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<ProductWithStock> {
        const product = await this.productsService.findOne(+id);
        if (!product) {
            throw new NotFoundException('Product not found');
        }
        return product;
    }
}
