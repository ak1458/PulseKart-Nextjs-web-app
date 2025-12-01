
import { CourierAdapter, CourierConfig } from './courier.adapter';

export class DunzoAdapter implements CourierAdapter {
    name = 'Dunzo';
    private config: CourierConfig;

    constructor(config: CourierConfig) {
        this.config = config;
    }

    async createOrder(order: any): Promise<string> {
        console.log(`[Dunzo] Creating order for ${order.id}`);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        return `DUNZO-${Math.floor(Math.random() * 100000)}`;
    }

    async cancelOrder(trackingId: string): Promise<boolean> {
        console.log(`[Dunzo] Cancelling order ${trackingId}`);
        return true;
    }

    async getTrackingStatus(trackingId: string): Promise<string> {
        return 'out_for_delivery';
    }

    async estimateCost(pickup: string, drop: string, weight: number): Promise<number> {
        return 45 + (weight * 10); // Mock calculation
    }
}
