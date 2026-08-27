import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum PrescriptionStatus {
    PENDING_REVIEW = 'pending_review',
    APPROVED = 'approved',
    REJECTED = 'rejected',
}

@Entity('prescriptions')
export class Prescription {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'user_id' })
    userId: number;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({
        type: 'enum',
        enum: PrescriptionStatus,
        default: PrescriptionStatus.PENDING_REVIEW,
    })
    status: PrescriptionStatus;

    @Column({ name: 'file_name', type: 'varchar' })
    fileName: string;

    @Column({ name: 'mime_type', type: 'varchar' })
    mimeType: string;

    @Column({ name: 'size_bytes', type: 'int' })
    sizeBytes: number;

    /**
     * The uploaded file. `select: false` keeps the bytes out of every ordinary
     * query - listing prescriptions in the admin console should not stream
     * megabytes of scan data that nothing renders.
     */
    @Column({ type: 'bytea', select: false })
    content: Buffer;

    @Column({ name: 'reviewed_by', type: 'int', nullable: true })
    reviewedBy: number | null;

    @Column({ name: 'reviewed_at', type: 'timestamptz', nullable: true })
    reviewedAt: Date | null;

    @Column({ name: 'review_notes', type: 'text', nullable: true })
    reviewNotes: string | null;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt: Date;
}
