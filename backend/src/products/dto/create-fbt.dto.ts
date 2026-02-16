import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const createFbtSchema = z.object({
    primaryProductId: z.number(),
    relatedProductId: z.number(),
    sortOrder: z.number().optional().default(0),
    isActive: z.boolean().optional().default(true),
});

export class CreateFbtDto extends createZodDto(createFbtSchema) { }

export const updateFbtSchema = z.object({
    sortOrder: z.number().optional(),
    isActive: z.boolean().optional(),
});

export class UpdateFbtDto extends createZodDto(updateFbtSchema) { }
