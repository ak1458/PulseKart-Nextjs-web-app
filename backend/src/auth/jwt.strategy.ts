import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

interface JwtPayload {
    sub: number;
    email: string;
    role: string;
    name: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(configService: ConfigService) {
        const jwtSecret = configService.get<string>('JWT_SECRET') || process.env.JWT_SECRET || 'fallback-secret-for-dev-only';
        if (!jwtSecret) {
            throw new Error('JWT_SECRET environment variable is required');
        }
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: jwtSecret,
        });
    }

    async validate(payload: JwtPayload) {
        if (!payload.sub || !payload.email) {
            throw new UnauthorizedException('Invalid token');
        }
        return {
            sub: payload.sub,
            email: payload.email,
            role: payload.role,
            name: payload.name || 'User',
        };
    }
}
