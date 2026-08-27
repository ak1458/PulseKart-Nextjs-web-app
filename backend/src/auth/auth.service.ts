import { Injectable, UnauthorizedException, ConflictException, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        @InjectRepository(PasswordResetToken)
        private readonly resetTokenRepository: Repository<PasswordResetToken>,
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly emailService: EmailService,
    ) { }

    async login(loginDto: LoginDto) {
        const { email, password } = loginDto;
        this.logger.debug(`Login attempt for: ${email}`);

        // Find user by email with password
        const user = await this.usersService.findByEmailWithPassword(email);

        if (!user) {
            this.logger.warn(`Login failed - User not found: ${email}`);
            throw new UnauthorizedException('Invalid email or password');
        }

        if (!user.isActive) {
            this.logger.warn(`Login failed - User is disabled: ${email}`);
            throw new UnauthorizedException('Account is disabled');
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            this.logger.warn(`Login failed - Invalid password for: ${email}`);
            throw new UnauthorizedException('Invalid email or password');
        }

        this.logger.log(`User logged in successfully: ${email}`);

        // Generate JWT token
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
        };

        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        };
    }

    async register(email: string, password: string, name: string) {
        // Create user using UsersService
        const user = await this.usersService.create({
            email,
            password,
            name,
            role: 'customer',
        });

        // Generate JWT token
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
        };

        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        };
    }

    async validateUser(userId: number) {
        return this.usersService.validateUser(userId);
    }

    /**
     * Initiate password reset process
     * Sends a reset link to the user's email
     */
    async forgotPassword(email: string): Promise<{ message: string }> {
        if (!email || !email.includes('@')) {
            throw new BadRequestException('Valid email is required');
        }

        // Find user by email
        const user = await this.usersService.findByEmail(email);

        // Always return success to prevent email enumeration attacks
        if (!user) {
            this.logger.warn(`Password reset requested for non-existent email: ${email}`);
            return { message: 'If an account exists with this email, a reset link has been sent' };
        }

        // Generate secure random token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

        // Store token with expiration (1 hour). Persisted rather than held in
        // memory so the link survives a restart and works behind more than one
        // instance.
        await this.resetTokenRepository.save(
            this.resetTokenRepository.create({
                tokenHash,
                userId: user.id,
                expiresAt: new Date(Date.now() + 60 * 60 * 1000),
            }),
        );

        // Opportunistically evict expired rows so the table does not grow
        // without bound, which the in-memory map also never did.
        await this.resetTokenRepository.delete({ expiresAt: LessThan(new Date()) });

        // Send reset email
        const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
        const emailResult = await this.emailService.sendPasswordResetEmail(
            user.email,
            user.name,
            resetToken,
            frontendUrl,
        );

        if (!emailResult.success) {
            this.logger.warn(`Email not sent: ${emailResult.error}`);
            this.logger.warn(`Reset URL for ${email}: ${emailResult.previewUrl}`);
        }

        return { message: 'If an account exists with this email, a reset link has been sent' };
    }

    /**
     * Reset password using the token
     */
    async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
        if (!token || !newPassword) {
            throw new BadRequestException('Token and password are required');
        }

        // Validate password strength
        if (newPassword.length < 8) {
            throw new BadRequestException('Password must be at least 8 characters long');
        }

        // Hash the provided token to match stored hash
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
        const resetData = await this.resetTokenRepository.findOne({
            where: { tokenHash },
        });

        if (!resetData || resetData.usedAt !== null) {
            throw new UnauthorizedException('Invalid or expired reset token');
        }

        // Check if token is expired
        if (new Date() > resetData.expiresAt) {
            await this.resetTokenRepository.delete({ id: resetData.id });
            throw new UnauthorizedException('Reset token has expired');
        }

        // Update user password
        await this.usersService.updatePassword(resetData.userId, newPassword);

        // Burn the token so it cannot be replayed.
        resetData.usedAt = new Date();
        await this.resetTokenRepository.save(resetData);

        this.logger.log(`Password reset successful for user ID: ${resetData.userId}`);
        return { message: 'Password has been reset successfully' };
    }
}
