
import { query } from '../config/database';

export type ExportJobStatus = 'pending' | 'processing' | 'complete' | 'failed' | 'cancelled';
export type ExportJobType = 'order_invoice' | 'order_summary' | 'payslip' | 'report';
export type ExportOutputFormat = 'pdf' | 'zip';

export interface ExportJob {
    id: string;
    requested_by: string; // user_id
    role_at_request: string;
    job_type: ExportJobType;
    filters: Record<string, any>;
    template: string;
    output_format: ExportOutputFormat;
    status: ExportJobStatus;
    total_items: number;
    output_url?: string;
    s3_key?: string;
    created_at: Date;
    started_at?: Date;
    finished_at?: Date;
    attempts: number;
    error_message?: string;
    audit_info: {
        ip: string;
        user_agent: string;
    };
}

export class ExportJobModel {
    // Mock in-memory storage for MVP
    private static jobs: ExportJob[] = [];

    static async create(job: Omit<ExportJob, 'id' | 'created_at' | 'status' | 'attempts'>): Promise<ExportJob> {
        const newJob: ExportJob = {
            ...job,
            id: `JOB-${Date.now()}`,
            status: 'pending',
            created_at: new Date(),
            attempts: 0
        };
        this.jobs.push(newJob);
        return newJob;
    }

    static async findById(id: string): Promise<ExportJob | null> {
        return this.jobs.find(j => j.id === id) || null;
    }

    static async updateStatus(id: string, status: ExportJobStatus, updates: Partial<ExportJob> = {}): Promise<ExportJob | null> {
        const index = this.jobs.findIndex(j => j.id === id);
        if (index === -1) return null;

        this.jobs[index] = {
            ...this.jobs[index],
            status,
            ...updates,
            updated_at: new Date() // In real DB this is auto
        } as any;

        return this.jobs[index];
    }

    static async findAll(limit = 20): Promise<ExportJob[]> {
        return this.jobs.sort((a, b) => b.created_at.getTime() - a.created_at.getTime()).slice(0, limit);
    }
}
