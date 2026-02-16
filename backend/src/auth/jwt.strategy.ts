import { Injectable, UnauthorizedException } from '@nestjs/common';
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
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
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
