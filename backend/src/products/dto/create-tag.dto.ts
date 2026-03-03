import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const createTagSchema = z.object({
    name: z.string().min(1),
    slug: z.string().min(1),
    description: z.string().optional(),
});

export class CreateTagDto extends createZodDto(createTagSchema) { }

export const updateTagSchema = createTagSchema.partial();

export class UpdateTagDto extends createZodDto(updateTagSchema) { }
