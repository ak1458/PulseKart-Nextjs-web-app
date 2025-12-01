import { query } from '../config/database';

export class EmployeeService {

    static async getEmployees(search = '', department = '', status = '') {
        let sql = `SELECT * FROM employees WHERE 1=1`;
        const params: any[] = [];
        let paramIndex = 1;

        if (search) {
            sql += ` AND (name ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR role ILIKE $${paramIndex})`;
            params.push(`%${search}%`);
            paramIndex++;
        }

        if (department && department !== 'all') {
            sql += ` AND department = $${paramIndex}`;
            params.push(department);
            paramIndex++;
        }

        if (status && status !== 'all') {
            sql += ` AND status = $${paramIndex}`;
            params.push(status);
            paramIndex++;
        }

        sql += ` ORDER BY created_at DESC`;
        const res = await query(sql, params);
        return res.rows;
    }

    static async createEmployee(data: any) {
        const { name, email, phone, role, department, status, avatar } = data;
        const sql = `
            INSERT INTO employees (name, email, phone, role, department, status, avatar)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;
        const res = await query(sql, [name, email, phone, role, department, status || 'Active', avatar]);
        return res.rows[0];
    }

    static async updateEmployee(id: string, data: any) {
        const { name, email, phone, role, department, status } = data;
        const sql = `
            UPDATE employees 
            SET name = $1, email = $2, phone = $3, role = $4, department = $5, status = $6
            WHERE id = $7
            RETURNING *
        `;
        const res = await query(sql, [name, email, phone, role, department, status, id]);
        return res.rows[0];
    }

    static async deleteEmployee(id: string) {
        await query('DELETE FROM employees WHERE id = $1', [id]);
        return { success: true };
    }
}
