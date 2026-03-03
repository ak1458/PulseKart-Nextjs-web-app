import { Controller, Post, Get, Body, UsePipes, HttpCode, HttpStatus, UseGuards, Request } from '@nestjs/common';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LoginDto, loginSchema } from './dto/login.dto';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

// Registration DTO Schema
export const registerSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
});

// Registration DTO Class
export class RegisterDto extends createZodDto(registerSchema) { }

@Controller('v1/auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ZodValidationPipe(loginSchema))
    @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 attempts per minute per IP
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    @UsePipes(new ZodValidationPipe(registerSchema))
    @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 attempts per minute per IP
    async register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto.email, registerDto.password, registerDto.name);
    }

    @Post('forgot-password')
    @HttpCode(HttpStatus.OK)
    @Throttle({ default: { limit: 3, ttl: 3600000 } }) // 3 attempts per hour per IP
    async forgotPassword(@Body('email') email: string) {
        return this.authService.forgotPassword(email);
    }

    @Post('reset-password')
    @HttpCode(HttpStatus.OK)
    @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 attempts per minute per IP
    async resetPassword(
        @Body('token') token: string,
        @Body('password') password: string,
    ) {
        return this.authService.resetPassword(token, password);
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    @SkipThrottle() // Skip rate limiting for authenticated users
    async getProfile(@Request() req: any) {
        // req.user is set by JwtStrategy
        return {
            id: req.user.sub,
            email: req.user.email,
            role: req.user.role,
            name: req.user.name,
            isActive: true,
        };
    }

    @Post('test-email')
    @HttpCode(HttpStatus.OK)
    @SkipThrottle() // Admin only endpoint
    async testEmail(@Body('email') email: string) {
        // Note: In production, add admin guard here
        return { message: 'Test email endpoint - configure in email.service.ts' };
    }
}
