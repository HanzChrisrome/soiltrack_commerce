# Points Reward System Documentation

## Overview

Users earn loyalty points when they complete purchases. These points can be used to redeem eligible products in the shop.

---

## How It Works

### 💰 Earning Points

**Rule: 1 Point = ₱1 spent on products**

- Points are awarded when a user **marks an order as "Delivered"** (received)
- Points are calculated based on the **product subtotal only** (excludes shipping & platform fees)
- Points are automatically added to the user's account

**Formula:**

```
Points Awarded = floor(Product Subtotal in ₱)
```

**Example:**

```
Order Total: ₱1,919.00
  - Product Subtotal: ₱1,700.00
  - Shipping Fee: ₱100.00
  - Platform Fee: ₱119.00

Points Awarded = ₱1,700 → 1,700 points ✅
```

### 🎁 Redeeming Points

Users can redeem points for eligible products:

**Redeemable Products:**

- AQUADIN (33 points)
- ALIKA (44 points)
- CLINCHER (78 points)
- EXALT PLUS (68 points)
- BROFEYA (148 points)
- PYZERO (85 points)
- PERFECTHION (73 points)
- TOPSHOT (73 points)
- FUNGINIL (43 points)
- BASTA (45 points)
- UREA (80 points)
- 14-14-14 (83 points)
- YARA WINNER (135 points)
- CALCIUM (84 points)
- POTASSIUM (85 points)

Users can redeem these products in the Cart page before checkout.

---

## Implementation Details

### Backend: `orderController.ts`

The `markOrderAsReceived` endpoint now:

1. ✅ Updates order status from "To Receive" → "Delivered"
2. ✅ Calculates points based on product subtotal (excluding fees)
3. ✅ Awards points to user's account
4. ✅ Returns points awarded in response

```typescript
// Calculate points to award
const productSubtotalCentavos =
  totalAmountCentavos - shippingFeeCentavos - platformFeeCentavos;
const pointsToAward = Math.floor(productSubtotalCentavos / 100);

// Award points
const newPoints = currentPoints + pointsToAward;
await supabase
  .from("users")
  .update({ points: newPoints })
  .eq("user_id", user_id);
```

### Response Format

```json
{
  "message": "✅ Order marked as received",
  "pointsAwarded": 1700
}
```

---

## User Flow

1. **Place Order**

   - User completes checkout
   - Order is created with status "pending" (COD) or "paid" (ONLINE)
   - Shipping status is set to "To Ship"

2. **Shipping Process**

   - Admin updates shipping status: "To Ship" → "To Receive"
   - User receives notification

3. **Mark as Received**

   - User clicks "Mark as Received" button in Orders page
   - System updates order to "Delivered"
   - **🎁 Points are automatically awarded**
   - User sees points credited to their account

4. **Use Points**
   - User can view points in Profile page
   - User can redeem points in Cart page for eligible products
   - Points are deducted when order is finalized

---

## Database Schema

### `users` table

```sql
- points (INT) -- Total loyalty points available
```

### `orders` table

```sql
- total_amount (INT) -- Total order amount in centavos
- shipping_fee (INT) -- Shipping fee in centavos
- platform_fee (INT) -- Platform fee in centavos
- shipping_status (TEXT) -- "To Ship" | "To Receive" | "Delivered"
```

---

## Benefits

✅ **Encourages Repeat Purchases** - Users earn rewards for buying
✅ **Customer Loyalty** - Points create incentive to return
✅ **Fair System** - 1:1 ratio (₱1 = 1 point) is easy to understand
✅ **Excludes Fees** - Users only earn points on product value
✅ **Automatic** - No manual intervention needed

---

## Testing Checklist

- [ ] Place a COD order for ₱1,700 worth of products
- [ ] Admin marks order as "To Ship" → "To Receive"
- [ ] User marks order as "Delivered"
- [ ] Verify 1,700 points are added to user's account
- [ ] User can see updated points in Profile page
- [ ] User can redeem points for eligible products in Cart
- [ ] Points are deducted when redeemed order is completed

---

## Future Enhancements

Potential improvements:

- 📧 Email notification when points are awarded
- 🏆 Bonus points for first purchase
- 🎯 Double points promotions
- 📊 Points history/transaction log
- ⏰ Points expiration policy
- 🎁 Special rewards for high-value customers
