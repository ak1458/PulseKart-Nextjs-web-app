import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FrequentlyBoughtTogether } from '../entities/frequently-bought-together.entity';
import { Product } from '../entities/product.entity';
import { CreateFbtDto, UpdateFbtDto } from '../dto/create-fbt.dto';

@Injectable()
export class FrequentlyBoughtTogetherService {
  constructor(
    @InjectRepository(FrequentlyBoughtTogether)
    private fbtRepository: Repository<FrequentlyBoughtTogether>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async create(createFbtDto: CreateFbtDto): Promise<FrequentlyBoughtTogether> {
    // Verify both products exist
    const [primaryProduct, relatedProduct] = await Promise.all([
      this.productRepository.findOne({
        where: { id: createFbtDto.primaryProductId },
      }),
      this.productRepository.findOne({
        where: { id: createFbtDto.relatedProductId },
      }),
    ]);

    if (!primaryProduct) {
      throw new NotFoundException('Primary product not found');
    }

    if (!relatedProduct) {
      throw new NotFoundException('Related product not found');
    }

    if (createFbtDto.primaryProductId === createFbtDto.relatedProductId) {
      throw new BadRequestException(
        'Primary and related products must be different',
      );
    }

    // Check if relation already exists
    const existing = await this.fbtRepository.findOne({
      where: {
        primaryProductId: createFbtDto.primaryProductId,
        relatedProductId: createFbtDto.relatedProductId,
      },
    });

    if (existing) {
      throw new BadRequestException('This product relation already exists');
    }

    const fbt = this.fbtRepository.create(createFbtDto);
    return this.fbtRepository.save(fbt);
  }

  async findAll(
    limit: number = 50,
    offset: number = 0,
  ): Promise<FrequentlyBoughtTogether[]> {
    return this.fbtRepository.find({
      relations: ['primaryProduct', 'relatedProduct'],
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  async findOne(id: number): Promise<FrequentlyBoughtTogether> {
    const fbt = await this.fbtRepository.findOne({
      where: { id },
      relations: ['primaryProduct', 'relatedProduct'],
    });
    if (!fbt) {
      throw new NotFoundException('Frequently bought together entry not found');
    }
    return fbt;
  }

  async update(
    id: number,
    updateFbtDto: UpdateFbtDto,
  ): Promise<FrequentlyBoughtTogether> {
    const fbt = await this.findOne(id);
    Object.assign(fbt, updateFbtDto);
    return this.fbtRepository.save(fbt);
  }

  async remove(id: number): Promise<void> {
    const fbt = await this.findOne(id);
    await this.fbtRepository.remove(fbt);
  }

  async findByProductId(productId: number): Promise<{
    primary: FrequentlyBoughtTogether[];
    related: FrequentlyBoughtTogether[];
  }> {
    const [primary, related] = await Promise.all([
      this.fbtRepository.find({
        where: { primaryProductId: productId, isActive: true },
        relations: ['relatedProduct'],
        order: { sortOrder: 'ASC' },
      }),
      this.fbtRepository.find({
        where: { relatedProductId: productId, isActive: true },
        relations: ['primaryProduct'],
        order: { sortOrder: 'ASC' },
      }),
    ]);

    return { primary, related };
  }

  async getRecommendationsForProduct(productId: number): Promise<Product[]> {
    const fbtEntries = await this.fbtRepository.find({
      where: { primaryProductId: productId, isActive: true },
      relations: ['relatedProduct'],
      order: { sortOrder: 'ASC' },
      take: 5,
    });

    return fbtEntries
      .map((entry) => entry.relatedProduct)
      .filter((product) => product.is_active);
  }

  async bulkCreate(
    createFbtDtos: CreateFbtDto[],
  ): Promise<FrequentlyBoughtTogether[]> {
    const results: FrequentlyBoughtTogether[] = [];
    for (const dto of createFbtDtos) {
      try {
        const fbt = await this.create(dto);
        results.push(fbt);
      } catch (error) {
        // Skip duplicates or errors, continue with next
        continue;
      }
    }
    return results;
  }
}
