import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    ManyToOne,
    JoinColumn,
    ManyToMany,
    JoinTable,
} from 'typeorm';
import { Batch } from './batch.entity';
import { Brand } from './brand.entity';
import { Category } from './category.entity';
import { Tag } from './tag.entity';
import { ProductAttribute } from './product-attribute.entity';
import { ProductVariation } from './product-variation.entity';
import { FrequentlyBoughtTogether } from './frequently-bought-together.entity';
import { Review } from './review.entity';

export interface ProductDimensions {
    length: number;
    width: number;
    height: number;
    unit: 'cm' | 'inch' | 'mm';
}

@Entity('products')
export class Product {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    sku: string;

    @Column()
    title: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ nullable: true })
    category: string;

    @Column('decimal', { precision: 10, scale: 2 })
    price: number;

    @Column('decimal', { precision: 10, scale: 2, nullable: true })
    mrp: number;

    @Column('decimal', { precision: 5, scale: 2, default: 0 })
    tax_rate: number;

    @Column({ default: false })
    prescription_required: boolean;

    @Column('jsonb', { default: {} })
    attributes: any;

    @Column('jsonb', { default: [] })
    images: string[];

    @Column('jsonb', { default: {} })
    seo: any;

    @Column({ default: true })
    is_active: boolean;

    @CreateDateColumn({ type: 'timestamptz' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updated_at: Date;

    // New fields
    @Column({ nullable: true })
    barcode: string;

    @Column('decimal', { precision: 10, scale: 3, nullable: true })
    weight: number;

    @Column('jsonb', { nullable: true })
    dimensions: ProductDimensions;

    @Column({ default: false })
    isPrescriptionRequired: boolean;

    @Column({ nullable: true })
    metaTitle: string;

    @Column({ type: 'text', nullable: true })
    metaDescription: string;

    // Brand relation
    @Column({ nullable: true })
    brandId: number;

    @ManyToOne(() => Brand, (brand) => brand.products, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'brandId' })
    brand: Brand;

    // Categories (many-to-many)
    @ManyToMany(() => Category, (category) => category.products)
    @JoinTable({
        name: 'product_categories',
        joinColumn: { name: 'productId', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'categoryId', referencedColumnName: 'id' },
    })
    categories: Category[];

    // Tags (many-to-many)
    @ManyToMany(() => Tag, (tag) => tag.products)
    @JoinTable({
        name: 'product_tags',
        joinColumn: { name: 'productId', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'tagId', referencedColumnName: 'id' },
    })
    tags: Tag[];

    // Attributes
    @OneToMany(() => ProductAttribute, (productAttribute) => productAttribute.product)
    productAttributes: ProductAttribute[];

    // Variations
    @OneToMany(() => ProductVariation, (variation) => variation.parentProduct)
    variationsAsParent: ProductVariation[];

    @OneToMany(() => ProductVariation, (variation) => variation.variationProduct)
    variationsAsChild: ProductVariation[];

    // Frequently Bought Together
    @OneToMany(() => FrequentlyBoughtTogether, (fbt) => fbt.primaryProduct)
    fbtAsPrimary: FrequentlyBoughtTogether[];

    @OneToMany(() => FrequentlyBoughtTogether, (fbt) => fbt.relatedProduct)
    fbtAsRelated: FrequentlyBoughtTogether[];

    // Reviews
    @OneToMany(() => Review, (review) => review.product)
    reviews: Review[];

    // Existing Batch relation
    @OneToMany(() => Batch, (batch) => batch.product)
    batches: Batch[];
}
