import { PipeTransform, ArgumentMetadata, BadRequestException, Injectable } from '@nestjs/common';
import { ZodSchema, ZodError } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
    constructor(private schema: any) { } // Changed to any to check specific type issue

    transform(value: unknown, metadata: ArgumentMetadata) {
        if (metadata.type !== 'body') return value;

        try {
            return this.schema.parse(value);
        } catch (error) {
            if (error instanceof ZodError) {
                throw new BadRequestException({
                    message: 'Validation failed',
                    errors: (error as any).errors,
                });
            }
            throw new BadRequestException('Validation failed');
        }
    }
}
