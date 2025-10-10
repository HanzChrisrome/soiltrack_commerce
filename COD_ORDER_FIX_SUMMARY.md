# COD Order Fix - Platform Fee & Shipping Status

## Problem

When customers selected COD (Cash on Delivery) as the payment method, the following fields were NOT being saved in the database:

- `platform_fee` - showing as 0 or NULL
- `shipping_fee` - showing as 0 or NULL
- `shipping_status` - showing as NULL instead of "To Ship"
- `payment_method` - potentially not set correctly

## Root Cause

In `src/controllers/checkoutController.ts`, the COD payment flow was **creating the order immediately** when the checkout link was requested, instead of going through the same finalization process as online payments.

### Old Flow (BROKEN ❌)

```
COD Payment Selected
  ↓
createCheckoutLink endpoint creates order immediately
  ↓
Order inserted with ONLY: order_ref, user_id, total_amount, order_status
  ❌ Missing: platform_fee, shipping_fee, shipping_status, payment_method
  ↓
Order items inserted
  ↓
Cart cleared
  ↓
Navigate to success page
```

### New Flow (FIXED ✅)

```
COD Payment Selected
  ↓
createCheckoutLink endpoint returns order_ref only (no DB insert)
  ↓
Navigate to success page with order_ref
  ↓
CheckoutSuccess.tsx calls finalizeOrder endpoint
  ↓
Order inserted with ALL fields including:
  ✅ platform_fee
  ✅ shipping_fee
  ✅ shipping_status: "To Ship"
  ✅ payment_method: "COD"
  ✅ All metadata
```

## Changes Made

### File: `src/controllers/checkoutController.ts`

**Before:**

```typescript
// COD Payment
const { data: codOrder, error: codError } = await supabase
  .from("orders")
  .insert({
    order_ref: orderRef,
    user_id,
    total_amount: total * 100,
    order_status: "pending",
    payment_provider_link: null,
    created_at: new Date().toISOString(),
  })
  .select()
  .single();
// ... more code to insert items, clear cart, etc.
```

**After:**

```typescript
// COD Payment - Don't create order yet, just return order_ref
// Order will be created in finalizeOrder endpoint (same as ONLINE flow)
// This ensures both payment methods go through the same finalization process
// and all fees (shipping, platform) are properly calculated and stored

return res.json({ order_ref: orderRef });
```

## Why This Fix Works

Both payment methods (COD and ONLINE) now follow the **same order creation flow**:

1. **Cart.tsx** - User selects payment method and clicks checkout

   - Calculates: subtotal, shippingFee, platformFee, total
   - Saves to localStorage as `checkout_summary`
   - Calls `createCheckoutLink` endpoint

2. **checkoutController.ts** - Returns order reference

   - ONLINE: Redirects to PayMongo payment page
   - COD: Returns order_ref immediately

3. **CheckoutSuccess.tsx** - Finalizes the order
   - Retrieves `checkout_summary` from localStorage
   - Calls `finalizeOrder` endpoint with all fee data
4. **orderController.ts** - Creates order in database
   - Inserts order with ALL required fields:
     - `platform_fee` ✅
     - `shipping_fee` ✅
     - `shipping_status: "To Ship"` ✅
     - `payment_method` ✅
     - `total_amount` ✅
     - Full metadata with all fees ✅

## Benefits

1. **Consistency** - Both payment methods use the same order creation logic
2. **Data Integrity** - All fee fields are properly saved
3. **Tracking** - Shipping status is correctly initialized to "To Ship"
4. **Audit Trail** - All fees are stored in both dedicated columns and metadata
5. **No Duplicate Orders** - Prevents creating orphaned orders if checkout is cancelled

## Testing Checklist

- [ ] Create COD order and verify `platform_fee` is saved in database
- [ ] Create COD order and verify `shipping_fee` is saved in database
- [ ] Create COD order and verify `shipping_status` = "To Ship"
- [ ] Create COD order and verify `payment_method` = "COD"
- [ ] Create ONLINE order and verify all fees still work
- [ ] Verify order totals match expected values in both payment methods
- [ ] Check that cart is properly cleared after successful COD order
- [ ] Verify order appears correctly in Orders page with all details

## Database Fields Now Properly Set

For COD orders, these fields are now correctly populated:

| Field             | Old Value     | New Value                  |
| ----------------- | ------------- | -------------------------- |
| `platform_fee`    | 0 or NULL     | Calculated fee in centavos |
| `shipping_fee`    | 0 or NULL     | 100 PHP (10000 centavos)   |
| `shipping_status` | NULL          | "To Ship"                  |
| `payment_method`  | NULL or empty | "COD"                      |
| `order_status`    | "pending"     | "pending" ✅ (correct)     |
| `total_amount`    | Correct       | Correct ✅ (includes fees) |

## Related Files

- `src/controllers/checkoutController.ts` - Removed premature order creation
- `src/controllers/orderController.ts` - Handles order finalization (unchanged)
- `src/pages/shop/CheckoutSuccess.tsx` - Sends fee data to backend (already working)
- `src/pages/shop/Cart.tsx` - Calculates and stores fees (already working)
