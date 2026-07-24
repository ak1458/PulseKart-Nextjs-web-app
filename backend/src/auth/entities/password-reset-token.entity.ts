import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    Index,
} from 'typeorm';

/**
 * A pending password reset.
 *
 * These previously lived in a `new Map()` on the AuthService instance, which
 * meant every reset link was invalidated by a restart - and the deployment
 * target restarts whenever it goes idle. It also broke outright with more than
 * one instance, since the link would only work if the reset request happened to
 * land on the same process, and expired entries were never swept, so the map
 * grew for the lifetime of the process.
 *
 * Only the SHA-256 hash of the token is stored. A leaked database backup should
 * not hand out working reset links.
 */
@Entity('password_reset_tokens')
export class PasswordResetToken {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Index({ unique: true })
    @Column({ name: 'token_hash', type: 'varchar', length: 64 })
    tokenHash: string;

    @Index()
    @Column({ name: 'user_id', type: 'int' })
    userId: number;

    @Column({ name: 'expires_at', type: 'timestamptz' })
    expiresAt: Date;

    /** Set when redeemed, so a token cannot be replayed. */
    @Column({ name: 'used_at', type: 'timestamptz', nullable: true })
    usedAt: Date | null;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt: Date;
}
