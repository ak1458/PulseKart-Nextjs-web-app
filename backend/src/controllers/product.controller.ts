import { Request, Response } from 'express';
import { ProductModel } from '../models/product.model';
import { z } from 'zod';

const productSchema = z.object({
    sku: z.string().min(2),
    title: z.string().min(2), // Frontend sends 'name' but maps to 'title'
    category: z.string(),
    description: z.string().optional(),
    price: z.number().positive(),
    mrp: z.number().positive(),
    stock: z.number().int().nonnegative(),
    tax_rate: z.number().optional(),
    prescription_required: z.boolean().optional(),
    attributes: z.any().optional(),
    images: z.array(z.string()).optional(),
    seo: z.any().optional()
});

export class ProductController {
    static async create(req: Request, res: Response) {
        try {
            // Map frontend 'name' to 'title' if needed, or ensure frontend sends 'title'
            const rawData = {
                ...req.body,
                title: req.body.name || req.body.title, // Handle both
                price: Number(req.body.price),
                mrp: Number(req.body.mrp),
                stock: Number(req.body.stock),
                tax_rate: Number(req.body.taxRate || req.body.tax_rate || 0)
            };

            const validatedData = productSchema.parse(rawData);

            // 1. Create Product
            const product = await ProductModel.create({
                sku: validatedData.sku,
                title: validatedData.title,
                category: validatedData.category,
                description: validatedData.description,
                price: validatedData.price,
                mrp: validatedData.mrp,
                tax_rate: validatedData.tax_rate,
                prescription_required: validatedData.prescription_required,
                attributes: validatedData.attributes,
                images: validatedData.images,
                seo: validatedData.seo
            });

            // 2. Add Initial Stock (Batch)
            if (validatedData.stock > 0 && product.id) {
                // Fetch default warehouse ID
                const warehouseId = await ProductModel.getWarehouseIdByCode('WH-001') || 1;

                await ProductModel.addStock(
                    product.id,
                    warehouseId,
                    validatedData.stock,
                    `BATCH-${validatedData.sku}-INIT`,
                    '2026-12-31' // Default expiry for initial stock
                );
            }

            res.status(201).json(product);
        } catch (error) {
            console.error('Product Create Error:', error);
            if (error instanceof z.ZodError) {
                return res.status(400).json({ message: 'Validation error', errors: error.errors });
            }
            res.status(500).json({ message: error instanceof Error ? error.message : 'Internal server error' });
        }
    }

    static async list(req: Request, res: Response) {
        try {
            const limit = parseInt(req.query.limit as string) || 50;
            const offset = parseInt(req.query.offset as string) || 0;
            const products = await ProductModel.findAll(limit, offset);
            res.json(products);
        } catch (error) {
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    static async getOne(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);
            const product = await ProductModel.findById(id);
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }
            res.json(product);
        } catch (error) {
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}
