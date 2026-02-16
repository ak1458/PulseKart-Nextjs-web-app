# Payments Module

A comprehensive payment processing module for the Pulse Kart backend, supporting multiple payment methods, gateway-based discounts, and transaction tracking.

## Features

- **Multiple Payment Methods**: COD, UPI, Credit/Debit Cards, NetBanking, Wallets
- **Gateway-based Discounts**: Offer discounts based on payment method (e.g., "5% off on UPI")
- **Transaction Tracking**: Complete payment lifecycle tracking
- **Extensible Gateway Interface**: Easy to add new payment providers (Razorpay, Stripe, etc.)
- **Refund Support**: Full and partial refund processing

## File Structure

```
payments/
├── entities/
│   ├── payment-method.entity.ts          # Payment method definitions
│   ├── payment-gateway-discount.entity.ts # Discount rules
│   └── payment-transaction.entity.ts     # Transaction records
├── dto/
│   ├── create-payment-method.dto.ts      # Payment method DTOs
│   ├── create-gateway-discount.dto.ts    # Discount DTOs
│   └── process-payment.dto.ts            # Payment processing DTOs
├── interfaces/
│   └── payment-gateway.interface.ts      # Gateway provider interface
├── payments.service.ts                   # Business logic
├── payments.controller.ts                # API endpoints
├── payments.module.ts                    # NestJS module
├── index.ts                              # Public exports
└── README.md                             # This file
```

## API Endpoints

### Customer Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/v1/payments/methods` | Get active payment methods for checkout |
| GET | `/v1/payments/methods/:code/discount` | Check discount for a payment method |
| POST | `/v1/payments/process` | Initiate a payment |
| POST | `/v1/payments/verify` | Verify payment (webhook/callback) |
| GET | `/v1/payments/history` | Get user's payment history |

### Admin Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/v1/admin/payments/methods` | List all payment methods |
| POST | `/v1/admin/payments/methods` | Create payment method |
| PUT | `/v1/admin/payments/methods/:id` | Update payment method |
| GET | `/v1/admin/payments/gateway-discounts` | List all discounts |
| POST | `/v1/admin/payments/gateway-discounts` | Create discount rule |
| PUT | `/v1/admin/payments/gateway-discounts/:id` | Update discount rule |
| GET | `/v1/admin/payments/transactions` | List transactions with filters |
| GET | `/v1/admin/payments/transactions/:id` | Get transaction details |
| POST | `/v1/admin/payments/refund` | Process refund |

## Sample Discount Rules

```typescript
// 5% off on UPI payments
{
    name: "UPI Special Discount",
    description: "Get 5% off when you pay with UPI",
    paymentMethodCode: "upi",
    discountType: "percentage",
    discountValue: 5,
    maxDiscountAmount: 100, // Cap at ₹100
    minOrderAmount: 500,
    isActive: true
}

// ₹50 off on Credit Card payments for orders above ₹1000
{
    name: "Card Discount",
    description: "₹50 off on Credit/Debit Card payments",
    paymentMethodCode: "card",
    discountType: "fixed",
    discountValue: 50,
    minOrderAmount: 1000,
    isActive: true
}

// No convenience fee on NetBanking
{
    name: "NetBanking Zero Fee",
    description: "No convenience fee on NetBanking payments",
    paymentMethodCode: "netbanking",
    discountType: "fixed",
    discountValue: 0, // Set processing fee to 0
    isActive: true
}
```

## Adding a New Payment Gateway

To add a real payment gateway (e.g., Razorpay, Stripe):

1. Install the provider's SDK:
```bash
npm install razorpay
```

2. Create a gateway implementation:
```typescript
import { BasePaymentGateway, CreatePaymentIntentParams, PaymentIntent } from '../interfaces/payment-gateway.interface';

export class RazorpayGateway extends BasePaymentGateway {
    readonly name = 'Razorpay';
    private razorpay: any;

    initialize(config: GatewayConfig): void {
        super.initialize(config);
        const Razorpay = require('razorpay');
        this.razorpay = new Razorpay({
            key_id: config.apiKey,
            key_secret: config.apiSecret,
        });
    }

    async createPaymentIntent(params: CreatePaymentIntentParams): Promise<PaymentIntent> {
        // Implementation here
    }

    // ... other methods
}
```

3. Register the gateway:
```typescript
PaymentGatewayFactory.register('razorpay', RazorpayGateway);
```

4. Update the `getGatewayInstance` method in `PaymentsService` to use the registered gateway.

## Database Schema

### payment_methods
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| code | ENUM | Payment method code (cod, upi, card, etc.) |
| name | VARCHAR | Display name |
| description | TEXT | Description |
| icon_url | VARCHAR | Icon URL |
| is_active | BOOLEAN | Active status |
| is_test_mode | BOOLEAN | Test mode flag |
| config | JSONB | Gateway-specific configuration |
| supported_currencies | JSONB | Array of supported currencies |
| min_amount | DECIMAL | Minimum order amount |
| max_amount | DECIMAL | Maximum order amount |
| processing_fee | DECIMAL | Fixed processing fee |
| processing_fee_percent | DECIMAL | Percentage processing fee |
| sort_order | INT | Display order |

### payment_gateway_discounts
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR | Discount name |
| description | TEXT | Description |
| payment_method_code | ENUM | Applicable payment method |
| discount_type | ENUM | percentage or fixed |
| discount_value | DECIMAL | Discount amount/percentage |
| max_discount_amount | DECIMAL | Max cap for percentage |
| min_order_amount | DECIMAL | Minimum order to qualify |
| is_active | BOOLEAN | Active status |
| start_date | TIMESTAMPTZ | Start date |
| end_date | TIMESTAMPTZ | End date |
| usage_limit | INT | Max usage count |
| usage_count | INT | Current usage count |

### payment_transactions
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| order_id | VARCHAR | Order reference |
| user_id | INT | User reference |
| payment_method_code | ENUM | Payment method used |
| amount | DECIMAL | Transaction amount |
| currency | VARCHAR | Currency code |
| status | ENUM | pending, processing, completed, failed, refunded, cancelled |
| gateway_transaction_id | VARCHAR | Gateway's transaction ID |
| gateway_response | JSONB | Raw gateway response |
| error_message | TEXT | Error details |
| processed_at | TIMESTAMPTZ | Completion timestamp |
| created_at | TIMESTAMPTZ | Creation timestamp |

## Testing

```bash
# Run all tests
npm test

# Run payments module tests
npm test -- payments
```
