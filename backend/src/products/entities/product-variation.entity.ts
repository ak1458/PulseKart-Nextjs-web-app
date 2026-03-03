import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Product } from './product.entity';

export type VariationType = 'related' | 'variation' | 'accessory';

@Entity('product_variations')
export class ProductVariation {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    parentProductId: number;

    @ManyToOne(() => Product, (product) => product.variationsAsParent, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'parentProductId' })
    parentProduct: Product;

    @Column()
    variationProductId: number;

    @ManyToOne(() => Product, (product) => product.variationsAsChild, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'variationProductId' })
    variationProduct: Product;

    @Column({
        type: 'enum',
        enum: ['related', 'variation', 'accessory'],
        default: 'related',
    })
    type: VariationType;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;
}
