import { Request, Response } from 'express';
import { ReturnService } from '../services/return.service';

export class WebhookController {

    static async handleCourierEvent(req: Request, res: Response) {
        try {
            const event = req.body;

            // Validate Signature (Mocked)
            // if (!verifySignature(req)) return res.status(401).send();

            console.log('Received Courier Webhook:', JSON.stringify(event));

            // Normalize Event Data (Adapter Pattern)
            // Assuming payload structure: { order_id, status, reason, courier_id }
            const { order_id, status, reason, courier_id } = event;

            if (status === 'delivery_failed' || status === 'rto_initiated') {
                await ReturnService.logRTO(order_id, courier_id || 'unknown', reason || 'Delivery Failed');
                console.log(`RTO Logged for Order ${order_id}`);
            }

            res.status(200).json({ received: true });
        } catch (error: any) {
            console.error('Webhook Error:', error);
            res.status(500).json({ error: error.message });
        }
    }
}
