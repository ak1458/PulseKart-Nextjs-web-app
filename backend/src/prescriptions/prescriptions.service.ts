import {
    Injectable,
    BadRequestException,
    NotFoundException,
    ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prescription, PrescriptionStatus } from './entities/prescription.entity';

/** Formats accepted for a prescription scan. */
export const ALLOWED_PRESCRIPTION_TYPES = [
    'image/jpeg',
    'image/png',
    'application/pdf',
];

export const MAX_PRESCRIPTION_BYTES = 5 * 1024 * 1024;

/** Magic-number prefixes, so the declared MIME type can be cross-checked. */
const MAGIC_NUMBERS: Record<string, number[][]> = {
    'image/jpeg': [[0xff, 0xd8, 0xff]],
    'image/png': [[0x89, 0x50, 0x4e, 0x47]],
    'application/pdf': [[0x25, 0x50, 0x44, 0x46]],
};

export interface PrescriptionSummary {
    id: string;
    status: PrescriptionStatus;
    fileName: string;
    mimeType: string;
    sizeBytes: number;
    createdAt: Date;
}

@Injectable()
export class PrescriptionsService {
    constructor(
        @InjectRepository(Prescription)
        private readonly prescriptionRepository: Repository<Prescription>,
    ) { }

    /**
     * Verify the bytes actually match the declared content type.
     *
     * A browser-supplied MIME type is just a string in the request; checking the
     * file signature stops an arbitrary payload being stored as "image/png".
     */
    private assertContentMatchesType(buffer: Buffer, mimeType: string): void {
        const signatures = MAGIC_NUMBERS[mimeType];
        if (!signatures) {
            throw new BadRequestException('Unsupported file type');
        }

        const matches = signatures.some((signature) =>
            signature.every((byte, i) => buffer[i] === byte),
        );

        if (!matches) {
            throw new BadRequestException(
                'File contents do not match the declared file type',
            );
        }
    }

    async upload(
        userId: number,
        file: { originalname: string; mimetype: string; size: number; buffer: Buffer },
    ): Promise<PrescriptionSummary> {
        if (!file?.buffer?.length) {
            throw new BadRequestException('No file was uploaded');
        }

        if (!ALLOWED_PRESCRIPTION_TYPES.includes(file.mimetype)) {
            throw new BadRequestException(
                `Unsupported file type. Allowed: ${ALLOWED_PRESCRIPTION_TYPES.join(', ')}`,
            );
        }

        if (file.size > MAX_PRESCRIPTION_BYTES) {
            throw new BadRequestException('File too large. Maximum size is 5MB');
        }

        this.assertContentMatchesType(file.buffer, file.mimetype);

        const prescription = this.prescriptionRepository.create({
            userId,
            status: PrescriptionStatus.PENDING_REVIEW,
            // Never trust the client-supplied filename as a path.
            fileName: file.originalname.replace(/[/\\]/g, '_').slice(0, 255),
            mimeType: file.mimetype,
            sizeBytes: file.size,
            content: file.buffer,
        });

        const saved = await this.prescriptionRepository.save(prescription);
        return this.toSummary(saved);
    }

    /**
     * Resolve a prescription that belongs to the given user.
     *
     * Ownership is part of the lookup rather than a separate check, so a
     * prescription id guessed or copied from another account cannot be attached
     * to this user's order.
     */
    async findOwnedBy(id: string, userId: number): Promise<Prescription> {
        const prescription = await this.prescriptionRepository.findOne({
            where: { id },
        });

        if (!prescription) {
            throw new NotFoundException('Prescription not found');
        }

        if (prescription.userId !== userId) {
            throw new ForbiddenException('This prescription belongs to another account');
        }

        return prescription;
    }

    async listForUser(userId: number): Promise<PrescriptionSummary[]> {
        const rows = await this.prescriptionRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
        });
        return rows.map((row) => this.toSummary(row));
    }

    /** Fetch the stored bytes. Explicit, because `content` is `select: false`. */
    async getFile(id: string, userId: number): Promise<Prescription> {
        await this.findOwnedBy(id, userId);

        const withContent = await this.prescriptionRepository
            .createQueryBuilder('p')
            .addSelect('p.content')
            .where('p.id = :id', { id })
            .getOne();

        if (!withContent) {
            throw new NotFoundException('Prescription not found');
        }

        return withContent;
    }

    private toSummary(p: Prescription): PrescriptionSummary {
        return {
            id: p.id,
            status: p.status,
            fileName: p.fileName,
            mimeType: p.mimeType,
            sizeBytes: p.sizeBytes,
            createdAt: p.createdAt,
        };
    }
}
