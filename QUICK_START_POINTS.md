# Quick Start Guide - Points & Voucher System

## 🚀 Quick Setup (5 Minutes)

### Step 1: Run Database Migration

```bash
# Navigate to your project
cd c:\Soiltrack\soiltrack_commerce

# Apply migration (PostgreSQL)
psql -U postgres -d your_database_name -f migrations/add_points_used_to_orders.sql
```

**Or manually in your database:**

```sql
ALTER TABLE orders ADD COLUMN IF NOT EXISTS points_used INT DEFAULT 0;
```

### Step 2: Restart Server

```bash
# Stop current server (Ctrl+C)
# Start server
npm run dev
```

### Step 3: Test It!

That's it! The system is ready to use.

---

## 🧪 Quick Test

### Test 1: Create Order with Points

1. Add products to cart
2. Click "Redeem" on eligible products (e.g., UREA)
3. Checkout → Complete order
4. **Check:** Order shows "X pts used" badge ✅

### Test 2: Earn Points

1. Admin: Change order to "To Receive"
2. User: Click "Mark as Received"
3. **See:** Toast message "You earned X points! 🎁" ✅

### Test 3: Points Refund

1. User requests cancellation
2. Admin approves (status → "Cancelled")
3. **Check:** User's points increased by refund amount ✅

---

## 📍 Where to See Points

### User View:

- **Profile Page**: Current points balance
- **Orders Page**: "X pts used" badge
- **PDF Receipt**: "Points Voucher" line

### Admin View:

- **Manage Orders**: Points under total
- **PDF Receipt**: "Points Voucher" line

---

## 🎁 How It Works

### Points Earning:

```
Buy ₱1,700 products → Earn 1,700 points
(1 point = ₱1 spent on products, excluding fees)
```

### Points Usage:

```
Redeem UREA (80 pts) → Deduct 80 points
Order shows "80 pts used" badge
```

### Points Refund:

```
Cancel order with 80 pts → Refund 80 points
Automatic, no manual action needed
```

---

## 🔧 Common Tasks

### Change Points Rate

**File:** `src/controllers/orderController.ts`

```typescript
// Line ~245
const pointsToAward = Math.floor(productSubtotalCentavos / 100);

// Change to 2 points per ₱1:
const pointsToAward = Math.floor(productSubtotalCentavos / 50);
```

### Add Redeemable Product

**File:** `src/models/redeemableProducts.ts`

```typescript
export const redeemableProducts = [
  // Add new product here
  { name: "NEW_PRODUCT", points: 100 },
  // Existing products...
];
```

### View Database

```sql
-- Check recent orders with points
SELECT
  order_ref,
  total_amount / 100 AS total_pesos,
  points_used,
  shipping_status,
  created_at
FROM orders
WHERE points_used > 0
ORDER BY created_at DESC
LIMIT 10;
```

---

## ❗ Troubleshooting

### Issue: Points badge not showing

**Fix:**

1. Run migration script
2. Restart backend server
3. Refresh frontend

### Issue: Points not refunded

**Check:**

1. Order status changed to "Cancelled" or "Refunded"
2. `points_used > 0` in database
3. Check backend console for errors

### Issue: Can't redeem products

**Check:**

1. Product name matches exactly (case-insensitive)
2. User has enough points
3. Product is in `redeemableProducts` list

---

## 📚 Documentation

- **Complete Guide**: `POINTS_VOUCHER_REFUND_SYSTEM.md`
- **Implementation Details**: `POINTS_IMPLEMENTATION_SUMMARY.md`
- **Schema Updates**: `DB_SCHEMA_UPDATES.md`
- **Migration SQL**: `migrations/add_points_used_to_orders.sql`

---

## 🎯 Key Files

### Backend:

- `src/controllers/orderController.ts` - Points logic
- `src/controllers/adminOrderController.ts` - Refunds

### Frontend:

- `src/pages/shop/Orders.tsx` - User orders
- `src/pages/Admin/ManageOrders.tsx` - Admin panel

### Configuration:

- `src/models/redeemableProducts.ts` - Products list

---

## ✅ Verification Checklist

After setup, verify these work:

- [ ] Database has `points_used` column
- [ ] Orders show voucher badge when points used
- [ ] PDF receipts include points line
- [ ] Admin panel displays points
- [ ] Points awarded on order delivery
- [ ] Points refunded on cancellation
- [ ] User points balance updates correctly

---

## 🆘 Need Help?

1. Check documentation files (listed above)
2. Review console logs for errors
3. Verify database migration ran successfully
4. Check that all files were saved and server restarted

---

**You're all set! The points system is production-ready! 🎉**
