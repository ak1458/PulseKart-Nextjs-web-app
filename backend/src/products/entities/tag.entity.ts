import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToMany,
} from 'typeorm';
import { Product } from './product.entity';

@Entity('tags')
export class Tag {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ unique: true })
    slug: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;

    @ManyToMany(() => Product, (product) => product.tags)
    products: Product[];
}
