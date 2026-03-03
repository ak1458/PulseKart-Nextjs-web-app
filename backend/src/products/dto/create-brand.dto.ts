import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const createBrandSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  logoUrl: z.string().optional(),
  websiteUrl: z.string().optional(),
  isActive: z.boolean().optional().default(true),
});

export class CreateBrandDto extends createZodDto(createBrandSchema) {}

export const updateBrandSchema = createBrandSchema.partial();

export class UpdateBrandDto extends createZodDto(updateBrandSchema) {}
