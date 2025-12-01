import { query } from '../config/database';

export interface User {
    id: number;
    name: string;
    email: string;
    password_hash: string;
    phone?: string;
    role: 'customer' | 'admin' | 'pharmacist' | 'delivery';
    is_active: boolean;
    created_at: Date;
}

export class UserModel {
    static async create(user: Partial<User>): Promise<User> {
        const { name, email, password_hash, phone, role = 'customer' } = user;
        const text = `
            INSERT INTO users (name, email, password_hash, phone, role)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        const values = [name, email, password_hash, phone, role];
        const result = await query(text, values);
        return result.rows[0];
    }

    static async findByEmail(email: string): Promise<User | null> {
        const text = 'SELECT * FROM users WHERE email = $1';
        const result = await query(text, [email]);
        return result.rows[0] || null;
    }

    static async findById(id: number): Promise<User | null> {
        const text = 'SELECT * FROM users WHERE id = $1';
        const result = await query(text, [id]);
        return result.rows[0] || null;
    }
}
