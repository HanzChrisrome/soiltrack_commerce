# Payment Status & Admin Order Management Enhancements

## Features Implemented

### 1. ✅ Payment Status Column in Admin Orders Table

**Added a new "Payment" column** that displays:

- **Payment Method** (e.g., "COD", "Online Payment", "GCash")
- **Payment Status** dropdown (Pending/Paid)

**Functionality:**

- **Online payments** are automatically marked as "paid" when the order is created (handled in backend)
- **COD orders** start as "pending" and can be changed to "paid" by the admin
- The payment status dropdown is **disabled for online payments** (already paid)
- The payment status dropdown is **enabled for COD** orders so admin can mark them as paid when cash is collected

---

### 2. ✅ Updated Shipping Status Dropdown

**Removed statuses** that shouldn't be editable by admin:

- ❌ "Received" (removed - system-managed)
- ❌ "Cancelled" (removed from editable, but still visible in filter)
- ❌ "Refunded" (removed from editable, but still visible in filter)

**Added "Delivered" status** to replace "Received":

- ✅ "To Ship"
- ✅ "To Receive"
- ✅ "Delivered" (new - replaces "Received")

**Why "Delivered"?**

- More accurate: Order is delivered, user hasn't necessarily confirmed receipt yet
- Prevents confusion with user action ("Order Received" button)
- Admin can mark as delivered when courier confirms delivery

---

### 3. ✅ Payment Info in PDF Receipts

**Added to PDF generation:**

- Payment Method (e.g., "COD", "Online Payment")
- Payment Status (e.g., "Paid", "Pending")

**Location in PDF:**

- After customer email
- Before the products table
- Shows as: `Payment Method: COD` and `Payment Status: Paid`

---

## Database Schema

The system uses existing database fields:

- `order_status` - Stores payment status ("paid" or "pending")
- `payment_method` - Stores payment method ("COD", "Online Payment", etc.)
- `shipping_status` - Stores shipping/delivery status

---

## Order Status Flow

### Online Payment Orders:

```
Order Created (payment_status: "paid", shipping_status: "To Ship")
    ↓
Admin changes to "To Receive"
    ↓
Admin changes to "Delivered"
    ↓
User clicks "Order Received" (awards points)
```

### COD Orders:

```
Order Created (payment_status: "pending", shipping_status: "To Ship")
    ↓
Admin ships order → "To Receive"
    ↓
Admin marks as "Delivered"
    ↓
Admin marks payment as "Paid" (when cash is collected)
    ↓
User clicks "Order Received" (awards points)
```

---

## API Endpoints

### Update Payment Status

**Endpoint:** `PUT /api/admin/orders/update-payment-status`

**Request Body:**

```json
{
  "order_id": "order_123",
  "payment_status": "paid" // or "pending"
}
```

**Response:**

```json
{
  "message": "✅ Payment status updated successfully"
}
```

---

### Update Shipping Status (existing, unchanged)

**Endpoint:** `PUT /api/admin/orders/update-status`

**Request Body:**

```json
{
  "order_id": "order_123",
  "new_status": "Delivered" // "To Ship", "To Receive", "Delivered"
}
```

---

## UI Components

### Admin Orders Table

**Columns:**

1. Order ID (with expand/collapse for items)
2. Customer Name & Email
3. Total Amount (with points indicator if used)
4. **Payment** (method + status dropdown) ← NEW
5. **Shipping Status** (editable dropdown) ← UPDATED
6. Created At (with sort)
7. Actions (Print PDF button)

### Payment Status Dropdown

- Shows current status ("Pending" or "Paid")
- **Green** background for "Paid"
- **Yellow** background for "Pending"
- **Disabled** for online payments (already paid)
- **Enabled** for COD (admin can mark as paid)

### Confirmation Modals

**Two separate modals:**

1. **Shipping Status Change Modal** - Confirms shipping status changes
2. **Payment Status Change Modal** - Confirms payment status changes (new)

Both modals show:

- Order details
- Customer info
- Current status → New status
- Confirmation buttons

---

## Files Modified

### Frontend

1. **src/pages/Admin/ManageOrders.tsx**

   - Added payment status column
   - Updated shipping status dropdown (removed Received/Cancelled/Refunded, added Delivered)
   - Added payment status change handlers
   - Added payment status confirmation modal
   - Updated PDF to include payment info
   - Updated table colspan for expanded rows

2. **src/store/useAdminOrderStore.ts**
   - Added `updatePaymentStatus` function

### Backend

3. **src/controllers/adminOrderController.ts**

   - Added `updatePaymentStatus` function

4. **src/routes/adminOrderRoutes.ts**
   - Added `/update-payment-status` route
   - Fixed existing route to use `/update-status`

---

## Testing Checklist

### Test 1: Online Payment Order

1. ✅ Create order with online payment (GCash/PayMongo)
2. ✅ Verify payment status shows "Paid" in admin table
3. ✅ Verify payment status dropdown is **disabled**
4. ✅ Generate PDF and verify payment method and status are shown
5. ✅ Update shipping status and verify it works

### Test 2: COD Order - Payment Status

1. ✅ Create COD order
2. ✅ Verify payment status shows "Pending" in admin table
3. ✅ Change payment status from "Pending" to "Paid"
4. ✅ Verify confirmation modal appears with correct info
5. ✅ Confirm change and verify table updates
6. ✅ Generate PDF and verify payment status shows "Paid"

### Test 3: Shipping Status - Delivered

1. ✅ Create order (any payment method)
2. ✅ Change shipping status: "To Ship" → "To Receive" → "Delivered"
3. ✅ Verify "Received", "Cancelled", "Refunded" are NOT in dropdown
4. ✅ Verify "Delivered" IS in dropdown
5. ✅ Generate PDF at each stage and verify shipping status

### Test 4: Status Filtering

1. ✅ Filter orders by "All Status"
2. ✅ Filter by "To Ship", "To Receive", "Delivered"
3. ✅ Filter by "For Cancellation", "For Refund", "Cancelled", "Refunded"
4. ✅ Verify "Delivered" orders show up correctly

---

## Key Design Decisions

### Why separate payment_status from shipping_status?

- **payment_status** (`order_status` field) tracks money: Has customer paid?
- **shipping_status** tracks logistics: Where is the order?
- These are independent: COD order can be delivered but not yet paid

### Why disable payment dropdown for online payments?

- Online payments are verified by payment provider (PayMongo)
- Already marked as "paid" at order creation
- No admin action needed
- Prevents accidental changes

### Why "Delivered" instead of "Received"?

- **"Delivered"** - Admin confirms courier delivered the order
- **"Received"** - User confirms they got the order (via "Order Received" button)
- Separates admin action from user action
- More accurate tracking

### Why remove "Cancelled"/"Refunded" from editable dropdown?

- These are final states that should go through approval process
- Admin shouldn't directly set to cancelled/refunded
- Should only happen via:
  1. Approving cancellation request (ManageRefunds)
  2. Approving refund request (ManageRefunds)
  3. Manual backend update for special cases

---

## Future Enhancements (Optional)

1. **Payment receipt upload** - Allow admin to upload proof of COD payment
2. **Partial payments** - Track partial payments for COD orders
3. **Payment history** - Log all payment status changes with timestamps
4. **Automatic reminders** - Notify admin of unpaid COD orders after X days
5. **Payment analytics** - Dashboard showing paid vs pending orders

---

## Date

January 11, 2025
