import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity('batches')
export class Batch {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'sku_id' })
    sku_id: number;

    @ManyToOne(() => Product, (product) => product.batches)
    @JoinColumn({ name: 'sku_id' })
    product: Product;

    @Column({ name: 'warehouse_id' })
    warehouse_id: number;

    @Column()
    batch_no: string;

    @Column({ type: 'date' })
    expiry_date: Date;

    @Column({ default: 0 })
    qty_available: number;

    @Column({ default: 0 })
    qty_reserved: number;

    @CreateDateColumn({ type: 'timestamptz' })
    created_at: Date;
}
