# Pricing Rules System

A dynamic pricing system for NestJS that supports various pricing strategies including discounts, BOGO offers, bulk pricing, and tiered pricing.

## Features

### Rule Types

1. **Percentage Discount** (`percentage_discount`)
   - Apply a percentage off the regular price
   - Example: 10% off for VIP customers

2. **Fixed Discount** (`fixed_discount`)
   - Apply a fixed amount off per unit
   - Example: ₹50 off each item

3. **Buy X Get Y** (`buy_x_get_y`)
   - Classic BOGO (Buy One Get One) or variations
   - Example: Buy 2 Get 1 Free

4. **Bulk Price** (`bulk_price`)
   - Fixed price per unit when buying in bulk
   - Example: Buy 5+ at ₹50 each instead of ₹75

5. **Tiered Pricing** (`tiered_pricing`)
   - Different prices based on quantity tiers
   - Example: 1-4 at ₹100, 5-9 at ₹90, 10+ at ₹80

### Rule Conditions

Rules can be conditional based on:

- **Quantity**: min/max purchase quantity
- **Order Value**: min/max cart total
- **Products**: specific product IDs
- **Categories**: specific category IDs
- **User Tags**: user segments (vip, new, loyal, etc.)
- **Time**: time of day (e.g., happy hour 14:00-16:00)
- **Day of Week**: specific days (0=Sunday, 6=Saturday)
- **Date Range**: start and end dates for seasonal promotions

### Rule Priority & Stacking

- **Priority**: Higher priority rules are evaluated first
- **Stackable**: Rules can be marked as stackable (combinable with other rules)
- **Non-stackable**: Only the highest priority non-stackable rule applies

## API Endpoints

### Admin Endpoints (Protected)

#### Create Pricing Rule
```http
POST /v1/pricing-rules
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "name": "Summer Sale 2026",
  "description": "20% off all vitamins during summer",
  "type": "percentage_discount",
  "priority": 10,
  "isActive": true,
  "startDate": "2026-06-01T00:00:00Z",
  "endDate": "2026-08-31T23:59:59Z",
  "conditions": {
    "categoryIds": ["vitamins"],
    "minQuantity": 2
  },
  "actions": {
    "discountPercent": 20
  },
  "stackable": false
}
```

#### List Pricing Rules
```http
GET /v1/pricing-rules?isActive=true&type=percentage_discount&limit=50&offset=0
Authorization: Bearer {jwt_token}
```

#### Get Single Rule
```http
GET /v1/pricing-rules/1
Authorization: Bearer {jwt_token}
```

#### Update Pricing Rule
```http
PUT /v1/pricing-rules/1
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "isActive": false
}
```

#### Delete Pricing Rule
```http
DELETE /v1/pricing-rules/1
Authorization: Bearer {jwt_token}
```

### Public Endpoints

#### Calculate Price for Product
```http
POST /v1/pricing/calculate
Content-Type: application/json

{
  "productId": 1,
  "quantity": 5,
  "price": 100,
  "userId": 123,
  "cartTotal": 500,
  "userTags": ["vip"]
}
```

Response:
```json
{
  "success": true,
  "data": {
    "originalPrice": 500,
    "finalPrice": 450,
    "discountAmount": 50,
    "discountPercent": 10,
    "appliedRules": [
      {
        "ruleId": 1,
        "ruleName": "VIP Discount",
        "type": "percentage_discount",
        "discountAmount": 50,
        "description": "10% discount applied"
      }
    ],
    "breakdown": [
      {
        "description": "VIP Discount (10% off)",
        "quantity": 5,
        "unitPrice": 90,
        "total": 450
      }
    ]
  }
}
```

#### Calculate Cart Prices
```http
POST /v1/pricing/calculate-cart
Content-Type: application/json

{
  "items": [
    { "productId": 1, "quantity": 5, "price": 100, "categoryId": "vitamins" },
    { "productId": 2, "quantity": 2, "price": 200, "categoryId": "supplements" }
  ],
  "userId": 123,
  "userTags": ["vip"]
}
```

#### Get Active Rules for Product
```http
GET /v1/pricing/rules-for-product/1
```

## Example Rules

### 1. Buy 2 Get 1 Free on Vitamins
```json
{
  "name": "Vitamin BOGO",
  "type": "buy_x_get_y",
  "conditions": {
    "categoryIds": ["vitamins"],
    "minQuantity": 2
  },
  "actions": {
    "buyQuantity": 2,
    "getQuantity": 1
  }
}
```

### 2. 10% Off for Orders Over ₹1000
```json
{
  "name": "Big Order Discount",
  "type": "percentage_discount",
  "conditions": {
    "minOrderValue": 1000
  },
  "actions": {
    "discountPercent": 10
  }
}
```

### 3. Happy Hour: 20% Off 2PM-4PM
```json
{
  "name": "Happy Hour",
  "type": "percentage_discount",
  "conditions": {
    "timeOfDay": "14:00-16:00"
  },
  "actions": {
    "discountPercent": 20
  }
}
```

### 4. VIP Customers Get 15% Off
```json
{
  "name": "VIP Discount",
  "type": "percentage_discount",
  "priority": 20,
  "conditions": {
    "userTags": ["vip"]
  },
  "actions": {
    "discountPercent": 15
  },
  "stackable": true
}
```

### 5. Bulk: Buy 5+ at ₹50 Each
```json
{
  "name": "Bulk Vitamin Deal",
  "type": "bulk_price",
  "conditions": {
    "productIds": [1, 2, 3],
    "minQuantity": 5
  },
  "actions": {
    "bulkPrice": 50
  }
}
```

### 6. Tiered Pricing
```json
{
  "name": "Volume Discount",
  "type": "tiered_pricing",
  "conditions": {},
  "actions": {
    "tiers": [
      { "minQty": 1, "price": 100 },
      { "minQty": 5, "price": 90 },
      { "minQty": 10, "price": 80 },
      { "minQty": 50, "price": 70 }
    ]
  }
}
```

### 7. Weekend Special
```json
{
  "name": "Weekend Special",
  "type": "percentage_discount",
  "conditions": {
    "dayOfWeek": [0, 6]
  },
  "actions": {
    "discountPercent": 15
  }
}
```

## Database Schema

The pricing rules are stored in PostgreSQL with the following structure:

```sql
CREATE TABLE pricing_rules (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    description TEXT,
    type VARCHAR NOT NULL,
    priority INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    conditions JSONB DEFAULT '{}',
    actions JSONB DEFAULT '{}',
    stackable BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pricing_rules_active_dates ON pricing_rules(is_active, start_date, end_date);
CREATE INDEX idx_pricing_rules_priority ON pricing_rules(priority);
```

## Integration with Products

To fully integrate the pricing system with products, update the `calculate` endpoint to fetch product prices from the ProductsService:

```typescript
// In pricing.controller.ts
@Post('pricing/calculate')
async calculatePrice(
  @Body() calculateDto: CalculatePriceDto,
  @Query('includePrice', ParseBoolPipe) includePrice: boolean = false
) {
  // Fetch product if price not provided
  let basePrice = calculateDto['price'] as number;
  
  if (!basePrice) {
    const product = await this.productsService.findOne(calculateDto.productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    basePrice = product.price;
  }
  
  const result = await this.pricingService.calculatePrice(basePrice, {
    productId: calculateDto.productId,
    quantity: calculateDto.quantity,
    userId: calculateDto.userId,
    cartTotal: calculateDto.cartTotal,
    userTags: calculateDto.userTags,
    categoryId: product?.category,
  });

  return { success: true, data: result };
}
```

## Testing

Run the tests with:
```bash
npm test -- pricing
```

## Migration

To create the database table, run the migration:
```bash
npm run migration:generate -- -n CreatePricingRulesTable
npm run migration:run
```

Or if using synchronize (development only):
```typescript
// In app.module.ts
TypeOrmModule.forRoot({
  // ...
  synchronize: process.env.NODE_ENV === 'development',
})
```
