import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    async create(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
        const { email, password, name, role, phone } = createUserDto;

        // Check if user already exists
        const existingUser = await this.findByEmail(email);
        if (existingUser) {
            throw new ConflictException('Email already registered');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = this.userRepository.create({
            email: email.toLowerCase(),
            password: hashedPassword,
            name,
            role: role || 'customer',
            phone: phone ?? null,
            isActive: true,
        });

        const savedUser = await this.userRepository.save(user);

        // Return user without password
        const { password: _, ...result } = savedUser;
        return result;
    }

    async findAll(): Promise<Omit<User, 'password'>[]> {
        const users = await this.userRepository.find({
            select: ['id', 'email', 'name', 'role', 'phone', 'isActive', 'createdAt', 'updatedAt'],
        });
        return users;
    }

    async findOne(id: number): Promise<Omit<User, 'password'>> {
        const user = await this.userRepository.findOne({
            where: { id },
            select: ['id', 'email', 'name', 'role', 'phone', 'isActive', 'createdAt', 'updatedAt'],
        });

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        return user;
    }

    async findByEmail(email: string): Promise<User | null> {
        const user = await this.userRepository.findOne({
            where: { email: email.toLowerCase() },
        });
        return user || null;
    }

    async findByEmailWithPassword(email: string): Promise<User | null> {
        const user = await this.userRepository
            .createQueryBuilder('user')
            .where('LOWER(user.email) = LOWER(:email)', { email })
            .addSelect('user.password')
            .getOne();
        return user || null;
    }

    async update(id: number, updateUserDto: UpdateUserDto): Promise<Omit<User, 'password'>> {
        const user = await this.userRepository.findOne({
            where: { id },
        });

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        // Check if email is being updated and if it's already taken
        if (updateUserDto.email && updateUserDto.email.toLowerCase() !== user.email.toLowerCase()) {
            const existingUser = await this.findByEmail(updateUserDto.email);
            if (existingUser) {
                throw new ConflictException('Email already registered');
            }
        }

        // Hash password if it's being updated
        const updateData: Partial<User> = { ...updateUserDto } as Partial<User>;
        if (updateUserDto.password) {
            updateData.password = await bcrypt.hash(updateUserDto.password, 10);
        }

        // Update user
        await this.userRepository.update(id, updateData);

        return this.findOne(id);
    }

    async remove(id: number): Promise<void> {
        const user = await this.userRepository.findOne({
            where: { id },
        });

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        await this.userRepository.delete(id);
    }

    async validateUser(userId: number): Promise<Omit<User, 'password'> | null> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            select: ['id', 'email', 'name', 'role', 'phone', 'isActive', 'createdAt', 'updatedAt'],
        });
        return user || null;
    }

    /**
     * Update user password directly (for password reset)
     */
    async updatePassword(userId: number, newPassword: string): Promise<void> {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await this.userRepository.update(userId, { password: hashedPassword });
    }
}
