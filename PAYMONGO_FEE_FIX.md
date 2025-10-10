# PayMongo Fee Inclusion Fix

## Problem

Platform fee and shipping fee were not being included in the PayMongo payment amount, causing the total charged to the customer to be less than expected (only product prices were included).

## Root Cause

In `Cart.tsx`, the `itemsPayload` array was modified to only include product items (no fee items). This array is sent to the backend `checkoutController.ts`, which uses it to create PayMongo's `line_items`. PayMongo calculates the total based on these line items, so without the fees, the payment amount was incorrect.

### Previous Code (Incorrect):

```typescript
const itemsPayload = [
  ...cart.map((ci) => ({
    product_id: ci.product_id,
    product_name: ci.product_name ?? "",
    product_price: ci.product_price ?? 0,
    quantity: ci.quantity,
    // ... other fields
  })),
  // ❌ No fee items included
];
```

## Solution

Add shipping and platform fees as line items to `itemsPayload` **only for ONLINE payments**. This ensures:

1. PayMongo receives the complete breakdown of charges
2. The customer is charged the correct total amount (products + fees)
3. COD orders don't have fee items in order_items (as requested)

### Fixed Code:

```typescript
const itemsPayload = [
  ...cart.map((ci) => ({
    product_id: ci.product_id,
    product_name: ci.product_name ?? "",
    product_price: ci.product_price ?? 0,
    quantity: ci.quantity,
    redeemedWithPoints: ci.redeemedWithPoints ?? false,
    pointsCost: ci.redeemedWithPoints
      ? getRedeemablePointCost(ci.product_name ?? "")
      : undefined,
  })),
  // ✅ Add fee items for ONLINE payment only
  ...(paymentMethod === "ONLINE"
    ? [
        {
          product_id: null,
          product_name: "Shipping Fee",
          product_price: shippingFee,
          quantity: 1,
        },
        {
          product_id: null,
          product_name: `Platform Fee (${Math.round(platformFeeRate * 100)}%)`,
          product_price: platformFee,
          quantity: 1,
        },
      ]
    : []),
];
```

## How It Works

### For ONLINE Payment:

1. **Cart.tsx**: Creates `itemsPayload` with products + fee items
2. **Checkout Service**: Sends all items to backend
3. **Checkout Controller**: Creates PayMongo session with all line items
4. **PayMongo**: Customer sees breakdown of products + fees and is charged the correct total
5. **CheckoutSuccess**: Order is created with fees saved in `platform_fee` and `shipping_fee` columns
6. **Order Items**: Only products are saved (fee items filtered out by `product_id !== null`)

### For COD Payment:

1. **Cart.tsx**: Creates `itemsPayload` with products only (no fee items)
2. **Checkout Service**: Sends only products to backend
3. **Checkout Controller**: Creates order reference
4. **CheckoutSuccess**: Order is created with fees saved in `platform_fee` and `shipping_fee` columns
5. **Order Items**: Only products are saved

## Key Points

✅ **PayMongo sees all charges**: Products, shipping, and platform fees are sent as line items
✅ **Correct payment amount**: Customer is charged the full total including fees
✅ **Clean order_items**: COD orders don't have null product_id entries (fees are in separate columns)
✅ **Fee transparency**: Fees are displayed as separate line items in PayMongo checkout
✅ **Database integrity**: Fees are stored in dedicated columns for both payment methods

## PayMongo Checkout Display

When the customer goes to PayMongo for payment, they will see:

```
Item Name                     Qty    Amount
─────────────────────────────────────────────
POTASSIUM                      1    ₱1,700.00
Shipping Fee                   1      ₱100.00
Platform Fee (7%)              1      ₱119.00
─────────────────────────────────────────────
Total                               ₱1,919.00
```

## Database Storage

After successful payment/order creation:

**orders table:**

```
order_id: xxx
total_amount: 191900  (centavos)
platform_fee: 11900   (centavos)
shipping_fee: 10000   (centavos)
```

**order_items table:**

```
Only products with valid product_id
(No null product_id entries for fees)
```

## Testing

To verify the fix works:

1. Add products to cart
2. Select "Online Payment"
3. Click "Proceed to Checkout"
4. **Check PayMongo page**: Should show products + shipping + platform fee
5. **Check total**: Should match the total shown in cart
6. Complete payment
7. **Check database**: `platform_fee` and `shipping_fee` should be populated
8. **Check order_items**: Should only contain products (no null product_id)

## Related Files Modified

- `src/pages/shop/Cart.tsx` - Added conditional fee items to itemsPayload
- `src/controllers/checkoutController.ts` - No changes needed (works with line items)
- `src/controllers/orderController.ts` - Saves fees to dedicated columns
- `src/models/order.ts` - Added platform_fee and shipping_fee fields

## Benefits of This Approach

1. **Transparency**: Customer sees exactly what they're paying for in PayMongo
2. **Accuracy**: PayMongo charges the correct total amount
3. **Clean Data**: order_items table only has products (no fee items)
4. **Trackable**: Fees are stored in dedicated columns for reporting
5. **Flexible**: Different handling for ONLINE vs COD as needed
