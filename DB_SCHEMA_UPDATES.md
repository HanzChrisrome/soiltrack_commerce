# Database Schema Updates - Points & Voucher Tracking

## Required Changes to `orders` Table

Add a new column to track points used in the order:

```sql
-- Add points_used column to orders table
ALTER TABLE orders
ADD COLUMN points_used INT DEFAULT 0;

-- Add comment to document the field
COMMENT ON COLUMN orders.points_used IS 'Total points redeemed/used as voucher for this order';
```

## Updated Schema

### orders (TABLE)

- order_id (PK, INT)
- order_ref (TEXT)
- user_id (TEXT)
- total_amount (INT) - Total in centavos
- order_status (TEXT)
- metadata (JSON)
- payment_provider_data (TEXT)
- created_at (TIMESTAMP)
- shipping_status (TEXT)
- payment_method (TEXT) - "COD" | "ONLINE"
- shipping_fee (INT) - in centavos
- platform_fee (INT) - in centavos
- **points_used (INT) - NEW: Points redeemed as voucher**

## Benefits

1. **Track Voucher Payments**: Know exactly how many points were used
2. **Show in Orders**: Display "Paid with Points" badge
3. **PDF Receipts**: Include points discount in receipt
4. **Points Refund**: Accurately restore points on refund
5. **Analytics**: Track points redemption trends

## Migration Notes

- Default value is 0 for existing orders (no points used)
- Existing orders in database won't be affected
- New orders will properly track points usage
