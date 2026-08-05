import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
    Unique,
    Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Product } from '../../products/entities/product.entity';

/** A product a customer has saved for later. */
@Entity('saved_items')
@Unique(['userId', 'productId'])
export class SavedItem {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Index()
    @Column({ name: 'user_id', type: 'int' })
    userId: number;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ name: 'product_id', type: 'int' })
    productId: number;

    @ManyToOne(() => Product, { onDelete: 'CASCADE', eager: true })
    @JoinColumn({ name: 'product_id' })
    product: Product;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt: Date;
}
