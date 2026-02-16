import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class AdminSeedService implements OnModuleInit {
    private readonly logger = new Logger(AdminSeedService.name);

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    async onModuleInit() {
        this.logger.log('🌱 Starting admin seeding process...');
        await this.seedAdminUser();
    }

    private async seedAdminUser() {
        try {
            // Get admin password from env or use default for dev
            const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
            const hashedPassword = await bcrypt.hash(adminPassword, 10);

            // Check if admin already exists
            const existingAdmin = await this.userRepository.findOne({
                where: { email: 'admin@pulse-kart.com' },
            });

            if (existingAdmin) {
                this.logger.log('Admin user already exists, updating credentials...');
                existingAdmin.password = hashedPassword;
                existingAdmin.role = 'admin';
                existingAdmin.isActive = true;
                await this.userRepository.save(existingAdmin);
                this.logger.log('✅ Admin credentials updated successfully');
                return;
            }

            // Create admin user
            const adminUser = this.userRepository.create({
                id: 1,
                email: 'admin@pulse-kart.com',
                password: hashedPassword,
                name: 'Admin User',
                role: 'admin',
                isActive: true,
            });

            await this.userRepository.save(adminUser);
            this.logger.log('✅ Admin user created successfully');
            this.logger.log('   Email: admin@pulse-kart.com');
            this.logger.log('   Password: [set in ADMIN_PASSWORD env variable]');
        } catch (error) {
            this.logger.error('Failed to seed admin user:', error.message);
        }
    }
}
