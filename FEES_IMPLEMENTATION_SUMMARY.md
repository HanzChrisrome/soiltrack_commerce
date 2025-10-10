# Platform Fee and Shipping Fee Implementation Summary

## Overview

Added support for storing and displaying `platform_fee` and `shipping_fee` in the orders table, with full integration in PDFs, receipts, and order details.

## Changes Made

### 1. **Database Schema (`Order` Model)**

**File:** `src/models/order.ts`

Added two new fields to the `Order` interface:

```typescript
export interface Order {
  // ...existing fields
  platform_fee?: number | null; // Platform fee in centavos
  shipping_fee?: number | null; // Shipping fee in centavos
  // ...other fields
}
```

### 2. **Backend Order Controller**

**File:** `src/controllers/orderController.ts`

Updated the order creation logic to save fees:

```typescript
const { data: newOrder, error: orderError } = await supabase
  .from("orders")
  .insert([
    {
      // ...existing fields
      platform_fee: platformFee ? Math.round(platformFee * 100) : 0, // Store in centavos
      shipping_fee: shippingFee ? Math.round(shippingFee * 100) : 0, // Store in centavos
      // ...other fields
    },
  ]);
```

**Key Points:**

- Fees are stored in **centavos** (multiply by 100) for precision
- Falls back to 0 if fees are not provided
- Both COD and Online payments save these fees

### 3. **Orders Page (Consumer View)**

**File:** `src/pages/shop/Orders.tsx`

#### PDF Receipt Updates:

- Added fee breakdown before total:
  - Subtotal (calculated as: total - shipping_fee - platform_fee)
  - Shipping Fee
  - Platform Fee
  - Total Amount

#### Order Details View:

- Added expandable fee breakdown when viewing order items
- Shows:
  - Items Subtotal
  - Shipping Fee
  - Platform Fee
  - Total
- Displayed in a gray box with professional styling

### 4. **Admin Orders Page**

**File:** `src/pages/Admin/ManageOrders.tsx`

#### PDF Receipt Updates:

- Added the same fee breakdown structure as consumer receipts
- Shows subtotal, shipping fee, platform fee, and total
- Maintains professional invoice format

## Fee Display Format

### PDF Receipts (Both Consumer & Admin):

```
Subtotal:        ₱1,700.00
Shipping Fee:    ₱100.00
Platform Fee:    ₱119.00
──────────────────────────
TOTAL AMOUNT:    ₱1,919.00
```

### Order Details (Consumer View):

When order is expanded, shows a breakdown box:

```
Items Subtotal:  ₱1,700.00
Shipping Fee:    ₱100.00
Platform Fee:    ₱119.00
────────────────────────
Total:           ₱1,919.00
```

## Data Flow

1. **Cart Page** → Calculates fees and total
2. **Checkout** → Saves summary to localStorage
3. **CheckoutSuccess** → Sends fees to backend
4. **Order Controller** → Saves fees to database (in centavos)
5. **Orders/Admin Pages** → Retrieves fees and displays (converts back to pesos)

## Database Values

All monetary values in the database are stored in **centavos**:

- `total_amount`: Total in centavos (e.g., 191900 = ₱1,919.00)
- `platform_fee`: Platform fee in centavos (e.g., 11900 = ₱119.00)
- `shipping_fee`: Shipping fee in centavos (e.g., 10000 = ₱100.00)

## Display Conversion

When displaying fees, divide by 100 to convert back to pesos:

```typescript
(order.shipping_fee || 0) / 100; // Converts 10000 to 100.00
```

## Benefits

✅ **Transparency**: Customers can see exactly what they're paying for
✅ **Accounting**: Clear breakdown of revenue streams (items, shipping, platform fees)
✅ **Professional**: Invoices look complete and professional
✅ **Accurate**: Fees are stored with the order, not recalculated
✅ **Auditable**: All fees are preserved for reporting and analysis

## Testing Checklist

- [ ] Create a COD order and verify fees are saved in database
- [ ] Create an Online Payment order and verify fees are saved
- [ ] Check PDF receipt shows fee breakdown correctly
- [ ] Verify order details page shows fee breakdown when expanded
- [ ] Confirm admin PDF receipts show fees
- [ ] Verify calculations: subtotal + shipping + platform = total

## Future Enhancements

- Add fee analytics dashboard for admin
- Track fee revenue separately in reports
- Allow admin to adjust fees per order if needed
- Add fee history tracking
