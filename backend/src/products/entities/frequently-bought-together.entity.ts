import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Product } from './product.entity';

@Entity('frequently_bought_together')
export class FrequentlyBoughtTogether {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    primaryProductId: number;

    @ManyToOne(() => Product, (product) => product.fbtAsPrimary, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'primaryProductId' })
    primaryProduct: Product;

    @Column()
    relatedProductId: number;

    @ManyToOne(() => Product, (product) => product.fbtAsRelated, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'relatedProductId' })
    relatedProduct: Product;

    @Column({ default: 0 })
    sortOrder: number;

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;
}
