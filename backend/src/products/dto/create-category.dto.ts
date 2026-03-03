import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  parentId: z.number().optional(),
  imageUrl: z.string().optional(),
  isActive: z.boolean().optional().default(true),
  sortOrder: z.number().optional().default(0),
});

export class CreateCategoryDto extends createZodDto(createCategorySchema) {}

export const updateCategorySchema = createCategorySchema.partial();

export class UpdateCategoryDto extends createZodDto(updateCategorySchema) {}
