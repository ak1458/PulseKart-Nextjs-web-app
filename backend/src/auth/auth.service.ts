import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) { }

    async login(loginDto: LoginDto) {
        const { email, password } = loginDto;
        console.log(`[AuthService] Login attempt for: ${email}`);

        // Find user by email with password
        const user = await this.usersService.findByEmailWithPassword(email);

        if (!user) {
            console.log(`[AuthService] User not found: ${email}`);
            throw new UnauthorizedException('Invalid email or password');
        }

        console.log(`[AuthService] User found: ${user.email}, role: ${user.role}, active: ${user.isActive}`);

        if (!user.isActive) {
            console.log(`[AuthService] User is disabled: ${email}`);
            throw new UnauthorizedException('Account is disabled');
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        console.log(`[AuthService] Password valid: ${isPasswordValid}`);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid email or password');
        }

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
}
