
export interface CourierAdapter {
    name: string;
    createOrder(order: any): Promise<string>; // Returns tracking ID
    cancelOrder(trackingId: string): Promise<boolean>;
    getTrackingStatus(trackingId: string): Promise<string>;
    estimateCost(pickup: string, drop: string, weight: number): Promise<number>;
}

export interface CourierConfig {
    apiKey: string;
    apiSecret?: string;
    baseUrl: string;
}
