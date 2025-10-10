# Refund & Order Status Fixes

## Issues Fixed

### 1. ✅ Points Not Being Refunded on Cancellation/Refund Approval

**Problem:** When admin approves a refund/cancellation request, the points used were not being refunded to the user.

**Root Cause:** The `approveRefund` function in `useRefundsStore.ts` was only updating the refund status and order shipping status, but never checked if points were used or refunded them.

**Solution:** Updated `approveRefund` function to:

1. Fetch order details including `points_used`
2. Check if points were used (`points_used > 0`)
3. Fetch user's current points balance
4. Add the points back to the user's account
5. Log the refund for debugging

**Files Modified:**

- `src/store/useRefundsStore.ts` - Added points refund logic in `approveRefund` function

**Code Changes:**

```typescript
// Now checks points_used and refunds them
const { data: orderData, error: orderError } = await supabase
  .from("orders")
  .select("user_id, points_used")
  .eq("order_id", refund.order_id)
  .single();

const pointsUsed = orderData.points_used || 0;

// After updating order status, refund points
if (pointsUsed > 0) {
  // Fetch current points, add back the used points
  const currentPoints = userData?.points ?? 0;
  const newPoints = currentPoints + pointsUsed;

  await supabase
    .from("users")
    .update({ points: newPoints })
    .eq("user_id", orderData.user_id);
}
```

---

### 2. ✅ Admin Panel Not Showing Updated Order Status After User Marks as Received

**Problem:** When a user clicks "Order Received" (which changes status from "To Receive" → "Delivered"), the admin panel still showed "To Ship".

**Root Cause:** The API route mismatch between the store and the route definition:

- Store was calling: `/api/admin/orders/update-status`
- Route was defined as: `/api/admin/orders/:orderId`

This meant the admin's status updates were failing silently, and the page wasn't refreshing properly.

**Solution:** Fixed the route definition to match the store's expected endpoint.

**Files Modified:**

- `src/routes/adminOrderRoutes.ts` - Changed route from `/:orderId` to `/update-status`

**Code Changes:**

```typescript
// Before:
router.put("/:orderId", updateOrderStatus);

// After:
router.put("/update-status", updateOrderStatus);
```

**Note:** The existing logic in `markOrderAsReceived` already correctly updates the status to "Delivered", and the admin panel already calls `fetchAllOrders()` after status changes. The route fix ensures the admin's manual status updates work correctly.

---

### 3. ✅ Refunded/Cancelled Orders Not Showing in Orders Page Filter

**Problem:** When users clicked on "Returns / Refunds" tab, only orders with status "For Cancellation" or "For Refund" were shown. Completed cancellations ("Cancelled") and refunds ("Refunded") were missing.

**Root Cause:** The filter logic in `Orders.tsx` only checked for pending statuses, not final statuses.

**Solution:** Updated the filter to include all related statuses:

- "For Cancellation" (pending)
- "For Refund" (pending)
- "Cancelled" (approved cancellation)
- "Refunded" (approved refund)

**Files Modified:**

- `src/pages/shop/Orders.tsx` - Updated filter logic in `filteredOrders`

**Code Changes:**

```typescript
// Before:
if (activeTab === "returns") {
  filtered = filtered.filter(
    (o) =>
      o.shipping_status === "For Cancellation" ||
      o.shipping_status === "For Refund"
  );
}

// After:
if (activeTab === "returns") {
  filtered = filtered.filter(
    (o) =>
      o.shipping_status === "For Cancellation" ||
      o.shipping_status === "For Refund" ||
      o.shipping_status === "Cancelled" ||
      o.shipping_status === "Refunded"
  );
}
```

---

## Testing Checklist

### Test 1: Points Refund on Approval

1. ✅ User creates an order using points (e.g., 100 points)
2. ✅ User requests cancellation/refund
3. ✅ Admin approves the request
4. ✅ Verify user's points increased by 100
5. ✅ Check console logs for refund confirmation

### Test 2: Order Status Sync

1. ✅ User places an order (status: "To Ship")
2. ✅ Admin changes status to "To Receive"
3. ✅ User clicks "Order Received"
4. ✅ Verify admin panel shows "Delivered" status
5. ✅ Verify user receives points for the order

### Test 3: Refunded Orders Display

1. ✅ User requests refund/cancellation
2. ✅ Admin approves (status becomes "Refunded" or "Cancelled")
3. ✅ User navigates to Orders page
4. ✅ Click "Returns / Refunds" tab
5. ✅ Verify approved refunds/cancellations are visible

---

## Additional Notes

### Points Refund Flow

- Points are refunded automatically when:
  1. Admin approves a refund request (via ManageRefunds page)
  2. Admin manually changes order status to "Cancelled" or "Refunded" (via ManageOrders page)
- Both flows now properly restore points to the user's account

### Order Status Lifecycle

```
To Ship → To Receive → Delivered (User clicks "Received")
         ↓
    For Cancellation → Cancelled (Admin approves)
                      ↓
                  Points Refunded ✅

Delivered → For Refund → Refunded (Admin approves)
                        ↓
                    Points Refunded ✅
```

### Backend Consistency

Both cancellation/refund flows now use the same points refund logic:

- `useRefundsStore.ts` → `approveRefund()` - Refunds points
- `adminOrderController.ts` → `updateOrderStatus()` - Refunds points

---

## Files Modified Summary

1. `src/store/useRefundsStore.ts`
   - Added points refund logic to `approveRefund()`
2. `src/routes/adminOrderRoutes.ts`
   - Fixed route from `/:orderId` to `/update-status`
3. `src/pages/shop/Orders.tsx`
   - Updated filter to include "Cancelled" and "Refunded" statuses

---

## Date

January 11, 2025
