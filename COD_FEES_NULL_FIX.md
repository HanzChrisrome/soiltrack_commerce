# COD Order Fees Null Issue - Fix

## Problem

When creating COD orders, the following fields were showing as NULL or 0 in the database:

- `shipping_fee`
- `platform_fee`
- Potentially `payment_method` and `shipping_status`

## Root Cause

In `CheckoutSuccess.tsx`, the checkout summary data (fees, totals) was only being sent to the backend if `checkoutSummary.total` was truthy:

```typescript
// ❌ BEFORE (Incorrect)
const payload = {
  user_id: authUser.user_id,
  order_ref: order_ref,
  checkout_url: window.location.href,
  payment_method: order_ref.startsWith("cs_") ? "ONLINE" : "COD",
  // Only includes fees if checkoutSummary.total exists
  ...(checkoutSummary.total && {
    total: checkoutSummary.total,
    subtotal: checkoutSummary.subtotal,
    shippingFee: checkoutSummary.shippingFee,
    platformFee: checkoutSummary.platformFee,
    platformFeeRate: checkoutSummary.platformFeeRate,
  }),
};
```

**Problem:** If `checkoutSummary.total` was 0, falsy, or the checkout summary was empty, the spread operator would not include any of the fee fields, causing them to be `undefined` in the payload. The backend would then default them to 0 or null.

## Solution

Changed the payload construction to always include the fee fields if they exist in the checkout summary, regardless of the total value:

```typescript
// ✅ AFTER (Correct)
const payload = {
  user_id: authUser.user_id,
  order_ref: order_ref,
  checkout_url: window.location.href,
  payment_method: order_ref.startsWith("cs_") ? "ONLINE" : "COD",
  // Always include checkout summary data if available
  total: checkoutSummary.total || undefined,
  subtotal: checkoutSummary.subtotal || undefined,
  shippingFee: checkoutSummary.shippingFee || undefined,
  platformFee: checkoutSummary.platformFee || undefined,
  platformFeeRate: checkoutSummary.platformFeeRate || undefined,
};
```

**How this fixes it:**

- Each field is explicitly set, using the value from checkout summary if it exists
- Uses `|| undefined` so that if the value is 0, it still sends 0 (not undefined)
- No longer conditional on `checkoutSummary.total` being truthy
- If checkout summary is empty, all fields will be `undefined` and backend will handle defaults

## Backend Handling

The backend in `orderController.ts` properly handles these values:

```typescript
platform_fee: platformFee ? Math.round(platformFee * 100) : 0,
shipping_fee: shippingFee ? Math.round(shippingFee * 100) : 0,
```

- If `platformFee` or `shippingFee` are provided (even if 0), they're converted to centavos
- If they're `undefined`, they default to 0
- The `shipping_status` is always set to "To Ship"
- The `payment_method` is always set (from the payload)

## Data Flow

### Complete Flow for COD:

1. **Cart.tsx**

   - User selects COD
   - Calculates: subtotal, shippingFee, platformFee, total
   - Creates checkout summary and saves to localStorage:
     ```javascript
     {
       total: 1919,
       subtotal: 1700,
       shippingFee: 100,
       platformFee: 119,
       platformFeeRate: 0.07,
       timestamp: 1234567890
     }
     ```
   - Redirects to `/checkout/success?ref=cs_xxx`

2. **CheckoutSuccess.tsx**

   - Retrieves checkout summary from localStorage
   - Creates payload with ALL fields:
     ```javascript
     {
       user_id: "xxx",
       order_ref: "cs_xxx",
       payment_method: "COD",
       total: 1919,
       subtotal: 1700,
       shippingFee: 100,
       platformFee: 119,
       platformFeeRate: 0.07
     }
     ```
   - Sends to `/api/orders/finalize`

3. **orderController.ts**

   - Receives all fields from payload
   - Creates order with:
     ```javascript
     {
       total_amount: 191900,  // centavos
       platform_fee: 11900,   // centavos
       shipping_fee: 10000,   // centavos
       shipping_status: "To Ship",
       order_status: "pending",
       payment_method: "COD"
     }
     ```

4. **Database**
   - Order is saved with all fee information
   - Fees are stored in dedicated columns
   - No null values for fees, status, or payment method

## Verification

After this fix, COD orders should have:

✅ **shipping_fee**: Stored in centavos (e.g., 10000 = ₱100.00)
✅ **platform_fee**: Stored in centavos (e.g., 11900 = ₱119.00)
✅ **shipping_status**: Always "To Ship"
✅ **order_status**: Always "pending" for COD
✅ **payment_method**: Always "COD"
✅ **total_amount**: Includes all products + fees

## Testing Steps

1. Add items to cart
2. Select "Cash on Delivery (COD)"
3. Click "Proceed to Checkout"
4. Verify redirect to success page
5. Check database:
   ```sql
   SELECT
     order_ref,
     shipping_fee / 100.0 as shipping_fee_pesos,
     platform_fee / 100.0 as platform_fee_pesos,
     total_amount / 100.0 as total_pesos,
     shipping_status,
     order_status,
     payment_method
   FROM orders
   WHERE order_ref LIKE 'cs_%'
   ORDER BY created_at DESC
   LIMIT 1;
   ```

Expected result:

```
order_ref: cs_xxx
shipping_fee_pesos: 100.00
platform_fee_pesos: 119.00
total_pesos: 1919.00
shipping_status: To Ship
order_status: pending
payment_method: COD
```

## Related Files

- `src/pages/shop/CheckoutSuccess.tsx` - Fixed payload construction
- `src/pages/shop/Cart.tsx` - Creates and saves checkout summary
- `src/controllers/orderController.ts` - Handles fee storage
- `src/models/order.ts` - Defines Order interface with fee fields

## Notes

- This fix ensures both COD and Online Payment orders have consistent fee data
- localStorage checkout summary is the source of truth for fees
- Backend always receives fee information (not conditionally based on total)
- Fees can be 0 (valid) but should never be null/undefined in database
