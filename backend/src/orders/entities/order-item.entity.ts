import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { Product } from '../../products/entities/product.entity';
import { moneyTransformer } from '../../common/transformers/decimal.transformer';

@Entity('order_items')
export class OrderItem {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'order_id' })
    orderId: string;

    @ManyToOne(() => Order, (order) => order.id, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'order_id' })
    order: Order;

    // Integer, matching products.id (SERIAL). Previously typed as string
    // against a UUID column that could not reference products(id).
    @Column({ name: 'product_id', type: 'int' })
    productId: number;

    @ManyToOne(() => Product)
    @JoinColumn({ name: 'product_id' })
    product: Product;

    @Column({ type: 'varchar' })
    name: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, transformer: moneyTransformer })
    price: number;

    @Column({ type: 'int' })
    quantity: number;

    @Column({ name: 'total_price', type: 'decimal', precision: 10, scale: 2, transformer: moneyTransformer })
    totalPrice: number;

    @Column({ type: 'jsonb', nullable: true })
    attributes: Record<string, any> | null;

    @Column({ type: 'varchar', nullable: true })
    image: string | null;
}
