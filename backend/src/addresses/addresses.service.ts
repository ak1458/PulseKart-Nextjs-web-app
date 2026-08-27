import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';
import { Address } from './entities/address.entity';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';

@Injectable()
export class AddressesService {
    constructor(
        @InjectRepository(Address)
        private readonly addressRepository: Repository<Address>,
        private readonly dataSource: DataSource,
    ) { }

    /** Default first, then newest. */
    async findAllForUser(userId: number): Promise<Address[]> {
        return this.addressRepository.find({
            where: { userId },
            order: { isDefault: 'DESC', createdAt: 'DESC' },
        });
    }

    /**
     * Fetch one address belonging to this user.
     *
     * Ownership is part of the where clause rather than a check afterwards, so
     * an id belonging to another customer is simply not found.
     */
    async findOneForUser(id: string, userId: number): Promise<Address> {
        const address = await this.addressRepository.findOne({
            where: { id, userId },
        });
        if (!address) {
            throw new NotFoundException('Address not found');
        }
        return address;
    }

    async create(userId: number, dto: CreateAddressDto): Promise<Address> {
        return this.dataSource.transaction(async (manager) => {
            const existingCount = await manager.count(Address, { where: { userId } });

            // The first address a customer saves becomes their default, so
            // checkout always has something preselected.
            const shouldBeDefault = dto.isDefault === true || existingCount === 0;

            if (shouldBeDefault) {
                await this.clearDefault(manager, userId);
            }

            const address = manager.create(Address, {
                ...dto,
                userId,
                isDefault: shouldBeDefault,
            });
            return manager.save(address);
        });
    }

    async update(id: string, userId: number, dto: UpdateAddressDto): Promise<Address> {
        return this.dataSource.transaction(async (manager) => {
            const address = await manager.findOne(Address, { where: { id, userId } });
            if (!address) {
                throw new NotFoundException('Address not found');
            }

            if (dto.isDefault === true && !address.isDefault) {
                await this.clearDefault(manager, userId);
            }

            Object.assign(address, dto);
            return manager.save(address);
        });
    }

    /**
     * Delete, promoting another address to default if this one held it.
     *
     * Without the promotion a customer can end up with several addresses and no
     * default, which leaves checkout with nothing preselected.
     */
    async remove(id: string, userId: number): Promise<void> {
        await this.dataSource.transaction(async (manager) => {
            const address = await manager.findOne(Address, { where: { id, userId } });
            if (!address) {
                throw new NotFoundException('Address not found');
            }

            await manager.delete(Address, { id, userId });

            if (address.isDefault) {
                const next = await manager.findOne(Address, {
                    where: { userId },
                    order: { createdAt: 'DESC' },
                });
                if (next) {
                    next.isDefault = true;
                    await manager.save(next);
                }
            }
        });
    }

    async setDefault(id: string, userId: number): Promise<Address> {
        return this.update(id, userId, { isDefault: true });
    }

    /**
     * Clear the current default.
     *
     * Must run before setting a new one: the partial unique index permits only
     * one default row per user and would otherwise reject the write.
     */
    private async clearDefault(
        manager: EntityManager,
        userId: number,
    ): Promise<void> {
        await manager.update(Address, { userId, isDefault: true }, { isDefault: false });
    }
}
