-- ============================================
-- FIX: Infinite Recursion in RLS Policies
-- Run this in Supabase SQL Editor to fix the registration error
-- ============================================

-- 1. Create a secure function to check admin status without triggering RLS
-- SECURITY DEFINER means this function runs with the privileges of the creator (system), bypassing RLS
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Drop the problematic recursive policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- 3. Re-create the policy using the secure function
CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT USING (is_admin());

-- 4. Also update other admin policies to use the helper function (optional but recommended for performance)

-- Categories
DROP POLICY IF EXISTS "Admins can manage categories" ON categories;
CREATE POLICY "Admins can manage categories" ON categories
    FOR ALL USING (is_admin());

-- Products
DROP POLICY IF EXISTS "Admins can manage all products" ON products;
CREATE POLICY "Admins can manage all products" ON products
    FOR ALL USING (is_admin());

-- Orders
DROP POLICY IF EXISTS "Admins can manage orders" ON orders;
CREATE POLICY "Admins can manage orders" ON orders
    FOR ALL USING (is_admin());
