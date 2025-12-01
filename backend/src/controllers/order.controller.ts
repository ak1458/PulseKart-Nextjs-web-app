import { Request, Response } from 'express';
import { OrderService } from '../services/order.service';

export class OrderController {

    static async getOrders(req: Request, res: Response) {
        try {
            const { limit, offset, search, status } = req.query;
            const orders = await OrderService.getAllOrders(
                Number(limit) || 50,
                Number(offset) || 0,
                String(search || ''),
                String(status || '')
            );
            res.json(orders);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    static async importOrders(req: Request, res: Response) {
        try {
            const { orders } = req.body; // Expects array of orders
            const results = [];
            for (const order of orders) {
                try {
                    const result = await OrderService.createOrder(order);
                    results.push({ id: order.id, status: 'success', data: result });
                } catch (e: any) {
                    results.push({ id: order.id, status: 'failed', error: e.message });
                }
            }
            res.json({ results });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    static async updateStatus(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const order = await OrderService.updateStatus(id, status);
            res.json(order);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    static async deleteOrder(req: Request, res: Response) {
        try {
            const { id } = req.params;
            await OrderService.deleteOrder(id);
            res.json({ message: 'Order deleted' });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}
