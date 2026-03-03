import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from './product.entity';
import { Attribute } from './attribute.entity';

@Entity('product_attributes')
export class ProductAttribute {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  productId: number;

  @ManyToOne(() => Product, (product) => product.productAttributes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column()
  attributeId: number;

  @ManyToOne(() => Attribute, (attribute) => attribute.productAttributes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'attributeId' })
  attribute: Attribute;

  @Column('jsonb')
  value: string | string[] | number | boolean;
}
