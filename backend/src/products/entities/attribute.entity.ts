import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ProductAttribute } from './product-attribute.entity';

export type AttributeType =
  | 'select'
  | 'multiselect'
  | 'text'
  | 'number'
  | 'boolean';

@Entity('attributes')
export class Attribute {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  code: string;

  @Column({
    type: 'enum',
    enum: ['select', 'multiselect', 'text', 'number', 'boolean'],
    default: 'text',
  })
  type: AttributeType;

  @Column('jsonb', { default: [] })
  options: Array<{ label: string; value: string }>;

  @Column({ default: false })
  isFilterable: boolean;

  @Column({ default: true })
  isVisibleOnProduct: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(
    () => ProductAttribute,
    (productAttribute) => productAttribute.attribute,
  )
  productAttributes: ProductAttribute[];
}
