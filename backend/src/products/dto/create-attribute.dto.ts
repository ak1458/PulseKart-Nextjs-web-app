import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const createAttributeSchema = z.object({
    name: z.string().min(1),
    code: z.string().min(1),
    type: z.enum(['select', 'multiselect', 'text', 'number', 'boolean']).optional().default('text'),
    options: z.array(z.object({ label: z.string(), value: z.string() })).optional().default([]),
    isFilterable: z.boolean().optional().default(false),
    isVisibleOnProduct: z.boolean().optional().default(true),
});

export class CreateAttributeDto extends createZodDto(createAttributeSchema) { }

export const updateAttributeSchema = createAttributeSchema.partial();

export class UpdateAttributeDto extends createZodDto(updateAttributeSchema) { }
