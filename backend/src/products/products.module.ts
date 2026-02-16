import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from './entities/product.entity';
import { Batch } from './entities/batch.entity';
import { Brand } from './entities/brand.entity';
import { Category } from './entities/category.entity';
import { Tag } from './entities/tag.entity';
import { Attribute } from './entities/attribute.entity';
import { ProductAttribute } from './entities/product-attribute.entity';
import { ProductVariation } from './entities/product-variation.entity';
import { FrequentlyBoughtTogether } from './entities/frequently-bought-together.entity';
import { SizeGuide } from './entities/size-guide.entity';
import { Review } from './entities/review.entity';

import {
    BrandsService,
    CategoriesService,
    TagsService,
    AttributesService,
    ReviewsService,
    SizeGuidesService,
    FrequentlyBoughtTogetherService,
} from './services';

import {
    BrandsController,
    CategoriesController,
    TagsController,
    AttributesController,
    ReviewsController,
    SizeGuidesController,
    FrequentlyBoughtTogetherController,
} from './controllers';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Product,
            Batch,
            Brand,
            Category,
            Tag,
            Attribute,
            ProductAttribute,
            ProductVariation,
            FrequentlyBoughtTogether,
            SizeGuide,
            Review,
        ]),
    ],
    controllers: [
        ProductsController,
        BrandsController,
        CategoriesController,
        TagsController,
        AttributesController,
        ReviewsController,
        SizeGuidesController,
        FrequentlyBoughtTogetherController,
    ],
    providers: [
        ProductsService,
        BrandsService,
        CategoriesService,
        TagsService,
        AttributesService,
        ReviewsService,
        SizeGuidesService,
        FrequentlyBoughtTogetherService,
    ],
    exports: [
        ProductsService,
        BrandsService,
        CategoriesService,
        TagsService,
        AttributesService,
        ReviewsService,
        SizeGuidesService,
        FrequentlyBoughtTogetherService,
    ],
})
export class ProductsModule { }
