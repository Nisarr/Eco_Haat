-- ============================================
-- Eco Haat Database Schema for Supabase
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. PROFILES TABLE (extends auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    role TEXT CHECK (role IN ('admin', 'seller', 'buyer')) DEFAULT 'buyer',
    phone TEXT,
    address TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin (prevents recursion)
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

-- Policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Admin can view all profiles (using secure function)
CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT USING (is_admin());

-- ============================================
-- 2. CATEGORIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Everyone can read categories
CREATE POLICY "Anyone can view categories" ON categories
    FOR SELECT USING (true);

-- Only admins can modify categories
CREATE POLICY "Admins can manage categories" ON categories
    FOR ALL USING (is_admin());

-- Insert default eco-friendly categories
INSERT INTO categories (name, description, icon) VALUES
    ('Paper Products', 'Items made from recycled or sustainable paper', '📄'),
    ('Bamboo Products', 'Eco-friendly bamboo alternatives', '🎋'),
    ('Clay & Pottery', 'Traditional clay and earthenware products', '🏺'),
    ('Jute & Natural Fiber', 'Biodegradable jute and fiber products', '🧵'),
    ('Organic Textiles', 'Organic cotton and natural fabric items', '👕'),
    ('Wooden Crafts', 'Sustainable wooden products and crafts', '🪵'),
    ('Biodegradable Packaging', 'Eco-friendly packaging solutions', '📦'),
    ('Natural Cosmetics', 'Organic and plastic-free beauty products', '🌸'),
    ('Recycled Products', 'Upcycled and recycled materials', '♻️'),
    ('Plant-Based Items', 'Products made from plant materials', '🌱')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 3. PRODUCTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price > 0),
    stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity > 0),
    material TEXT NOT NULL,
    images TEXT[] DEFAULT '{}',
    status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    eco_rating INTEGER CHECK (eco_rating >= 0 AND eco_rating <= 100),
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Anyone can view approved products
CREATE POLICY "Anyone can view approved products" ON products
    FOR SELECT USING (status = 'approved');

-- Sellers can view their own products
CREATE POLICY "Sellers can view own products" ON products
    FOR SELECT USING (seller_id = auth.uid());

-- Sellers can insert products
CREATE POLICY "Sellers can add products" ON products
    FOR INSERT WITH CHECK (
        seller_id = auth.uid() AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'seller')
    );

-- Sellers can update own products
CREATE POLICY "Sellers can update own products" ON products
    FOR UPDATE USING (seller_id = auth.uid());

-- Sellers can delete own products
CREATE POLICY "Sellers can delete own products" ON products
    FOR DELETE USING (seller_id = auth.uid());

-- Admins can do everything
CREATE POLICY "Admins can manage all products" ON products
    FOR ALL USING (is_admin());

-- ============================================
-- 4. CART ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS cart_items (
    id SERIAL PRIMARY KEY,
    buyer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(buyer_id, product_id)
);

-- Enable RLS
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Buyers can manage their own cart
CREATE POLICY "Buyers can manage own cart" ON cart_items
    FOR ALL USING (buyer_id = auth.uid());

-- ============================================
-- 5. ORDERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    buyer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    shipping_address TEXT NOT NULL,
    status TEXT CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Buyers can view own orders
CREATE POLICY "Buyers can view own orders" ON orders
    FOR SELECT USING (buyer_id = auth.uid());

-- Buyers can create orders
CREATE POLICY "Buyers can create orders" ON orders
    FOR INSERT WITH CHECK (buyer_id = auth.uid());

-- Admins can manage all orders
CREATE POLICY "Admins can manage orders" ON orders
    FOR ALL USING (is_admin());

-- ============================================
-- 6. ORDER ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price_at_purchase DECIMAL(10,2) NOT NULL
);

-- Enable RLS
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Same access as orders
CREATE POLICY "Access order items with order access" ON order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND (orders.buyer_id = auth.uid() OR 
                 is_admin())
        )
    );

CREATE POLICY "Insert order items with order" ON order_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND orders.buyer_id = auth.uid()
        )
    );

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to products
CREATE TRIGGER products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Apply to orders
CREATE TRIGGER orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Apply to profiles
CREATE TRIGGER profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- ============================================
-- Create initial admin user (update with your email)
-- Run this AFTER creating an account via the UI
-- ============================================
-- UPDATE profiles SET role = 'admin' WHERE email = 'your-admin@email.com';
