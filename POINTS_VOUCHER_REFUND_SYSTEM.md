# Points Voucher & Refund System Documentation

## Overview

This document explains the complete points voucher system and automatic points refund functionality.

---

## Features

### 1. ✅ Track Points Used in Orders

- `points_used` field added to `orders` table
- Tracks exactly how many points were redeemed as voucher for each order
- Displayed in order details, admin panel, and PDF receipts

### 2. ✅ Display Voucher Information

- **Orders Page**: Shows badge "X pts used" next to payment method
- **Admin Panel**: Shows points used under total amount
- **PDF Receipt**: Includes "Points Voucher: X points used" line item

### 3. ✅ Automatic Points Refund

- When admin cancels or refunds an order, points are automatically restored
- Only refunds points if `points_used > 0`
- Updates user's points balance immediately

---

## Database Changes

### Added Column to `orders` Table

```sql
ALTER TABLE orders
ADD COLUMN points_used INT DEFAULT 0;
```

**Field**: `points_used` (INT)

- Default: 0
- Stores total points redeemed/used as voucher for the order
- Used for display and refund calculations

---

## Implementation Details

### 1. Order Creation (`orderController.ts`)

When creating an order, the system now:

```typescript
{
  // ... other fields
  points_used: totalPointsUsed, // NEW: Track points redeemed
  metadata: {
    products: metadataProducts,
    pointsUsed: totalPointsUsed, // Also in metadata for reference
    // ...
  }
}
```

**Flow:**

1. Calculate `totalPointsUsed` from cart items
2. Deduct points from user
3. Store `points_used` in order record
4. Store in metadata for additional reference

### 2. Points Refund (`adminOrderController.ts`)

When admin updates order status to "Cancelled" or "Refunded":

```typescript
const shouldRefundPoints =
  (new_status === "Cancelled" || new_status === "Refunded") && pointsUsed > 0;

if (shouldRefundPoints) {
  // Fetch user's current points
  // Add points_used back to user's balance
  // Log the refund
}
```

**Response includes:**

```json
{
  "message": "✅ Order status updated successfully",
  "pointsRefunded": 150 // If points were refunded
}
```

### 3. Display in Orders (`Orders.tsx`)

**Badge Display:**

```tsx
{
  order.points_used && order.points_used > 0 && (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
      {order.points_used} pts used
    </span>
  );
}
```

**PDF Receipt:**

```typescript
if (order.points_used && order.points_used > 0) {
  pdf.setTextColor(184, 134, 11); // Gold color
  pdf.text("Points Voucher:", pageWidth / 2 + 10, yPosition);
  pdf.text(`${order.points_used} points used`, pageWidth - 20, yPosition, {
    align: "right",
  });
}
```

### 4. Admin Panel Display (`ManageOrders.tsx`)

**Table Column:**

```tsx
<td className="px-4 py-2.5">
  <div className="font-semibold">₱{total}</div>
  {order.points_used && order.points_used > 0 && (
    <div className="text-xs text-yellow-700">
      🎁 {order.points_used} pts used
    </div>
  )}
</td>
```

---

## User Flows

### Flow 1: Order with Points Redemption

1. **User adds items to cart**
   - Some items are redeemable products
2. **User redeems items with points**

   - Clicks "Redeem" button in cart
   - Points are marked for use (not deducted yet)

3. **User completes checkout**

   - `finalizeOrder` calculates `totalPointsUsed`
   - Points deducted from user account
   - Order created with `points_used` field

4. **Order displays voucher info**

   - Orders page shows "X pts used" badge
   - PDF receipt includes points voucher line

5. **Order completed**
   - User marks as received
   - Earns new points based on product subtotal

### Flow 2: Order Refund with Points

1. **User requests refund/cancellation**

   - For "To Ship" orders → Cancellation
   - For "Delivered" orders → Refund
   - Status changes to "For Cancellation" / "For Refund"

2. **Admin reviews request**

   - Checks order details
   - Sees points were used (if applicable)

3. **Admin approves refund**

   - Updates status to "Cancelled" or "Refunded"
   - **System automatically restores points**
   - User's points balance updated immediately

4. **User notified**
   - Points restored to account
   - Can use points for future purchases

---

## Example Scenarios

### Scenario 1: Order with Points Voucher

**Order Details:**

- Product Subtotal: ₱1,500
- Points Used: 150 (redeemed 3 items)
- Shipping Fee: ₱100
- Platform Fee: ₱105
- **Total: ₱1,705**

**Display:**

```
Payment: COD [150 pts used]
```

**PDF Receipt:**

```
Subtotal:        ₱1,500.00
Shipping Fee:      ₱100.00
Platform Fee:      ₱105.00
Points Voucher:    150 points used
─────────────────────────────
TOTAL AMOUNT:    ₱1,705.00
```

### Scenario 2: Refund with Points Restoration

**Before Cancellation:**

- User Points: 500
- Order Points Used: 150

**Admin Cancels Order:**

- System detects `points_used = 150`
- Automatically adds 150 points back to user

**After Cancellation:**

- User Points: 650 ✅
- Order Status: Cancelled
- Points Refunded: 150

---

## Benefits

### For Users:

✅ **Transparency** - See exactly how many points were used
✅ **Fair Refunds** - Get points back when order is cancelled
✅ **Trust** - Clear tracking of points transactions
✅ **Receipt Proof** - Points usage shown in PDF receipts

### For Admins:

✅ **Easy Tracking** - See points usage at a glance
✅ **Automatic Refunds** - No manual points restoration needed
✅ **Audit Trail** - Complete record of points transactions
✅ **Better Support** - Can verify points usage in disputes

### For Business:

✅ **Reduced Support Tickets** - Automatic refunds reduce inquiries
✅ **Customer Satisfaction** - Fair and transparent point system
✅ **Data Insights** - Track points redemption patterns
✅ **Compliance** - Clear records for accounting

---

## Testing Checklist

### Points Tracking:

- [ ] Create order with 0 points used → `points_used = 0`
- [ ] Create order with points redeemed → `points_used = X`
- [ ] Verify points displayed in Orders page
- [ ] Verify points shown in PDF receipt
- [ ] Verify points shown in admin panel

### Points Refund:

- [ ] Cancel order with 0 points → No refund
- [ ] Cancel order with 150 points → 150 points refunded
- [ ] Refund order with points → Points restored
- [ ] Verify user's points balance updated
- [ ] Check console logs for refund confirmation

### Display:

- [ ] Orders page shows "X pts used" badge
- [ ] Admin panel shows points under total
- [ ] PDF receipt includes points voucher line
- [ ] Badge only shows when points > 0

---

## Future Enhancements

Potential improvements:

1. **Points Transaction History**

   - Dedicated table for all points transactions
   - Track: earned, spent, refunded
   - Display in user profile

2. **Partial Refunds**

   - Proportional points refund for partial returns
   - More granular refund control

3. **Points Expiration**

   - Set expiration dates for earned points
   - Notifications before expiration

4. **Points Transfer**

   - Allow users to gift points
   - Referral bonus system

5. **Enhanced Reporting**
   - Points redemption analytics
   - Most redeemed products
   - Points liability tracking

---

## Troubleshooting

### Points Not Showing in Orders

**Check:**

1. Run migration to add `points_used` column
2. Verify `points_used` saved in order creation
3. Check frontend is fetching `points_used` field

### Points Not Refunded

**Check:**

1. Order status changed to "Cancelled" or "Refunded"
2. `points_used > 0` in order record
3. User exists and has valid `user_id`
4. Check backend logs for refund errors

### Badge Not Displaying

**Check:**

1. `order.points_used` is not null/undefined
2. `order.points_used > 0`
3. Component has access to order object
4. CSS classes loaded properly

---

## API Reference

### Update Order Status (with Points Refund)

**Endpoint:** `POST /api/admin/orders/update-status`

**Request:**

```json
{
  "order_id": "123",
  "new_status": "Cancelled"
}
```

**Response:**

```json
{
  "message": "✅ Order status updated successfully",
  "pointsRefunded": 150
}
```

**Behavior:**

- If `new_status` is "Cancelled" or "Refunded"
- AND `points_used > 0`
- THEN automatically refund points to user

---

## Summary

The points voucher and refund system provides:

1. ✅ Complete tracking of points usage in orders
2. ✅ Visual display of voucher information (badge, PDF)
3. ✅ Automatic points refund on cancellation/refund
4. ✅ Fair and transparent points transactions
5. ✅ Reduced manual work for admins
6. ✅ Better customer experience and trust

This creates a robust loyalty program that encourages repeat purchases while maintaining fairness and transparency! 🎁
