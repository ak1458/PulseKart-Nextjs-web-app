import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attribute } from '../entities/attribute.entity';
import { Product } from '../entities/product.entity';
import { ProductAttribute } from '../entities/product-attribute.entity';
import {
  CreateAttributeDto,
  UpdateAttributeDto,
} from '../dto/create-attribute.dto';

@Injectable()
export class AttributesService {
  constructor(
    @InjectRepository(Attribute)
    private attributeRepository: Repository<Attribute>,
    @InjectRepository(ProductAttribute)
    private productAttributeRepository: Repository<ProductAttribute>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async create(createAttributeDto: CreateAttributeDto): Promise<Attribute> {
    const attribute = this.attributeRepository.create(createAttributeDto);
    return this.attributeRepository.save(attribute);
  }

  async findAll(): Promise<Attribute[]> {
    return this.attributeRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Attribute> {
    const attribute = await this.attributeRepository.findOne({ where: { id } });
    if (!attribute) {
      throw new NotFoundException('Attribute not found');
    }
    return attribute;
  }

  async findByCode(code: string): Promise<Attribute> {
    const attribute = await this.attributeRepository.findOne({
      where: { code },
    });
    if (!attribute) {
      throw new NotFoundException('Attribute not found');
    }
    return attribute;
  }

  async update(
    id: number,
    updateAttributeDto: UpdateAttributeDto,
  ): Promise<Attribute> {
    const attribute = await this.findOne(id);
    Object.assign(attribute, updateAttributeDto);
    return this.attributeRepository.save(attribute);
  }

  async remove(id: number): Promise<void> {
    const attribute = await this.findOne(id);
    await this.attributeRepository.remove(attribute);
  }

  async findProductsByAttributeId(attributeId: number): Promise<Product[]> {
    const productAttributes = await this.productAttributeRepository.find({
      where: { attributeId },
      relations: ['product'],
    });
    return productAttributes.map((pa) => pa.product).filter((p) => p.is_active);
  }

  async getFilterableAttributes(): Promise<Attribute[]> {
    return this.attributeRepository.find({
      where: { isFilterable: true },
      order: { name: 'ASC' },
    });
  }
}
