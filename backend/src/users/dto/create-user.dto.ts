import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const createUserSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
    name: z.string().min(2, 'Name must be at least 2 characters long'),
    role: z.enum(['admin', 'customer']).default('customer'),
    phone: z.string().regex(/^\+?[\d\s-()]+$/, 'Invalid phone number format').optional().nullable(),
});

export class CreateUserDto extends createZodDto(createUserSchema) {}
