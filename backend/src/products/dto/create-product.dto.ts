import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const createProductSchema = z.object({
    sku: z.string().min(2),
    title: z.string().min(2).optional(),
    name: z.string().optional(),
    category: z.string(),
    description: z.string().optional(),
    price: z.number().positive(),
    mrp: z.number().positive(),
    stock: z.number().int().nonnegative(),
    tax_rate: z.number().optional().default(0),
    prescription_required: z.boolean().optional().default(false),
    attributes: z.any().optional(),
    images: z.array(z.string()).optional(),
    seo: z.any().optional()
});

export class CreateProductDto extends createZodDto(createProductSchema) { }
