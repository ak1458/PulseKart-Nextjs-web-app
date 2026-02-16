import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const sizeMeasurementSchema = z.object({
    label: z.string(),
    values: z.array(z.string()),
});

export const createSizeGuideSchema = z.object({
    name: z.string().min(1),
    categoryId: z.number().optional(),
    measurements: z.array(sizeMeasurementSchema),
});

export class CreateSizeGuideDto extends createZodDto(createSizeGuideSchema) { }

export const updateSizeGuideSchema = createSizeGuideSchema.partial();

export class UpdateSizeGuideDto extends createZodDto(updateSizeGuideSchema) { }
