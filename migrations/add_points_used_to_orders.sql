-- Migration: Add points_used column to orders table
-- Date: 2025-10-11
-- Purpose: Track points redeemed as voucher for each order

-- Add points_used column
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS points_used INT DEFAULT 0;

-- Add comment
COMMENT ON COLUMN orders.points_used IS 'Total loyalty points redeemed/used as voucher for this order';

-- Update existing orders to have 0 points_used (default)
UPDATE orders 
SET points_used = 0 
WHERE points_used IS NULL;

-- Optional: If you want to backfill from metadata
-- UPDATE orders 
-- SET points_used = COALESCE((metadata->>'pointsUsed')::INT, 0)
-- WHERE metadata->>'pointsUsed' IS NOT NULL;

-- Verify migration
SELECT 
    order_id,
    order_ref,
    total_amount,
    points_used,
    created_at
FROM orders
ORDER BY created_at DESC
LIMIT 5;
