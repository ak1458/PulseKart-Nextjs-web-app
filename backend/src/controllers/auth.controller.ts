import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/user.model';
import { z } from 'zod';

const registerSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    phone: z.string().optional(),
    role: z.enum(['customer', 'admin', 'pharmacist', 'delivery']).optional(),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

export class AuthController {
    static async register(req: Request, res: Response) {
        try {
            const validatedData = registerSchema.parse(req.body);

            const existingUser = await UserModel.findByEmail(validatedData.email);
            if (existingUser) {
                return res.status(400).json({ message: 'User already exists' });
            }

            const hashedPassword = await bcrypt.hash(validatedData.password, 10);

            const user = await UserModel.create({
                ...validatedData,
                password_hash: hashedPassword,
            });

            const token = jwt.sign(
                { id: user.id, email: user.email, role: user.role },
                process.env.JWT_SECRET || 'default_secret',
                { expiresIn: '24h' }
            );

            res.status(201).json({
                message: 'User registered successfully',
                token,
                user: { id: user.id, name: user.name, email: user.email, role: user.role }
            });
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ message: 'Validation error', errors: error.errors });
            }
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    static async login(req: Request, res: Response) {
        try {
            const validatedData = loginSchema.parse(req.body);

            const user = await UserModel.findByEmail(validatedData.email);
            if (!user) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            const isPasswordValid = await bcrypt.compare(validatedData.password, user.password_hash);
            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            const token = jwt.sign(
                { id: user.id, email: user.email, role: user.role },
                process.env.JWT_SECRET || 'default_secret',
                { expiresIn: '24h' }
            );

            res.json({
                message: 'Login successful',
                token,
                user: { id: user.id, name: user.name, email: user.email, role: user.role }
            });
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ message: 'Validation error', errors: error.errors });
            }
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    static async getProfile(req: any, res: Response) {
        try {
            const user = await UserModel.findById(req.user.id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            const { password_hash, ...userProfile } = user;
            res.json(userProfile);
        } catch (error) {
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}
