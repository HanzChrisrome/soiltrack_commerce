# Payment Status Flow Documentation

## Overview

This document explains how the order status is automatically set based on the payment method selected by the user.

## Payment Flow

### 1. **Cart Page (Cart.tsx)**

- User selects payment method: `ONLINE` or `COD`
- When checkout is clicked:
  - Checkout summary (total, fees, items) is saved to `localStorage`
  - For **ONLINE**: Redirects to PayMongo payment page
  - For **COD**: Redirects to success page with order reference

### 2. **Checkout Controller (checkoutController.ts)**

- Receives payment method from frontend
- For **ONLINE**: Creates PayMongo session, does NOT create order yet
- For **COD**: Creates temporary order record (will be finalized in success page)

### 3. **Checkout Success Page (CheckoutSuccess.tsx)**

- Retrieves checkout summary from `localStorage`
- Determines payment method:
  ```typescript
  payment_method: order_ref.startsWith("cs_") ? "ONLINE" : "COD";
  ```
- Calls `/api/orders/finalize` with all order details and payment method

### 4. **Order Controller (orderController.ts)**

- Receives `payment_method` from the request
- Determines if payment is online:
  ```typescript
  const isOnlinePayment =
    payment_method &&
    payment_method.toLowerCase() !== "cod" &&
    payment_method.toLowerCase() !== "cash on delivery";
  ```
- Sets order status:
  ```typescript
  const order_status = isOnlinePayment ? "paid" : "pending";
  ```
- Creates order with:
  - `order_status`: "paid" for online, "pending" for COD
  - `payment_method`: Stored as "ONLINE" or "COD"
  - `payment_provider_link`: PayMongo URL for online, null for COD

## Order Status Values

| Payment Method                        | Order Status  | When Set                                                                 |
| ------------------------------------- | ------------- | ------------------------------------------------------------------------ |
| Online Payment (Card, GCash, PayMaya) | **"paid"**    | Automatically when order is finalized after successful payment           |
| Cash on Delivery (COD)                | **"pending"** | Set when order is created, will be "paid" when customer pays on delivery |

## Database Schema

The `orders` table stores:

```typescript
{
  order_id: string
  order_ref: string
  order_status: "paid" | "pending"  // Payment status
  shipping_status: "To Ship" | "To Receive" | "Delivered" | etc.
  payment_method: "ONLINE" | "COD"
  payment_provider_link: string | null
  total_amount: number (in centavos)
  metadata: {
    subtotal, shippingFee, platformFee, etc.
  }
}
```

## Key Features

✅ **Online payments are automatically marked as "paid"**

- Only orders with successful payment confirmation are created
- No orphaned orders from cancelled payments

✅ **COD orders are marked as "pending"**

- Will be updated to "paid" when customer pays on delivery
- Admin can update status manually

✅ **Payment method is stored and displayed**

- Shows in Orders page header
- Shows in PDF receipt
- Shows in admin panel

## UI Display

### Orders Page (Orders.tsx)

- Shows payment method next to Order Date
- Displays order status badge (Paid/Pending)
- PDF receipt includes both payment method and order status

### Admin Panel (ManageOrders.tsx)

- Can view order status and payment method
- Can update order status if needed
- PDF receipt shows complete payment information

## Testing

To test the flow:

1. **Online Payment**:

   - Add items to cart
   - Select "Online Payment"
   - Complete payment on PayMongo
   - Return to success page
   - ✅ Order should have `order_status: "paid"`

2. **COD**:
   - Add items to cart
   - Select "Cash on Delivery"
   - Click checkout
   - ✅ Order should have `order_status: "pending"`

## Notes

- Order creation happens in `CheckoutSuccess.tsx` after payment confirmation
- This prevents incomplete payments from creating database records
- Payment method is determined by order reference prefix and user selection
- All order details (fees, totals) are passed via localStorage for accuracy
