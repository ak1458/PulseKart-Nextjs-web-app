import { Request, Response } from 'express';
import { query } from '../config/database';
import { z } from 'zod';

const addressSchema = z.object({
    tag: z.string().optional(),
    street_address: z.string().min(5),
    city: z.string().min(2),
    state: z.string().min(2),
    pincode: z.string().min(6),
    is_default: z.boolean().optional(),
});

export class AddressController {
    static async create(req: any, res: Response) {
        try {
            const validatedData = addressSchema.parse(req.body);
            const userId = req.user.id;

            // If setting as default, unset other defaults
            if (validatedData.is_default) {
                await query('UPDATE addresses SET is_default = FALSE WHERE user_id = $1', [userId]);
            }

            const text = `
                INSERT INTO addresses (user_id, tag, street_address, city, state, pincode, is_default)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING *
            `;
            const values = [
                userId,
                validatedData.tag || 'Home',
                validatedData.street_address,
                validatedData.city,
                validatedData.state,
                validatedData.pincode,
                validatedData.is_default || false
            ];

            const result = await query(text, values);
            res.status(201).json(result.rows[0]);
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ message: 'Validation error', errors: error.errors });
            }
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    static async list(req: any, res: Response) {
        try {
            const userId = req.user.id;
            const result = await query('SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC', [userId]);
            res.json(result.rows);
        } catch (error) {
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    static async delete(req: any, res: Response) {
        try {
            const userId = req.user.id;
            const addressId = req.params.id;

            const result = await query('DELETE FROM addresses WHERE id = $1 AND user_id = $2 RETURNING id', [addressId, userId]);

            if (result.rowCount === 0) {
                return res.status(404).json({ message: 'Address not found' });
            }

            res.json({ message: 'Address deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}
