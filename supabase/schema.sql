-- =========================================
-- FLAMING DIVA - SUPABASE DATABASE SCHEMA
-- =========================================
-- Run this in Supabase SQL Editor to set up your database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================
-- PROFILES TABLE (extends auth.users)
-- =========================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    -- Shipping address
    address_line1 TEXT,
    address_line2 TEXT,
    city TEXT,
    state TEXT,
    postal_code TEXT,
    country TEXT DEFAULT 'US',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, first_name, last_name)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'first_name',
        NEW.raw_user_meta_data->>'last_name'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================
-- PRODUCTS TABLE
-- =========================================
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price INTEGER NOT NULL, -- Price in cents (e.g., 129500 = $1,295.00)
    compare_at_price INTEGER, -- Original price for sale items
    category TEXT NOT NULL, -- leather, bomber, varsity, denim, etc.
    collection TEXT, -- inferno, phoenix, ember, essentials
    images TEXT[] DEFAULT '{}', -- Array of image URLs
    sizes TEXT[] DEFAULT ARRAY['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    sizes_out_of_stock TEXT[] DEFAULT '{}', -- Sizes not available
    materials TEXT,
    care_instructions TEXT,
    is_new BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    stock_quantity INTEGER DEFAULT 100,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_collection ON products(collection);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);

-- =========================================
-- CART ITEMS TABLE
-- =========================================
CREATE TABLE IF NOT EXISTS cart_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    size TEXT NOT NULL,
    quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, product_id, size)
);

CREATE INDEX IF NOT EXISTS idx_cart_user ON cart_items(user_id);

-- =========================================
-- WISHLIST TABLE
-- =========================================
CREATE TABLE IF NOT EXISTS wishlist (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_wishlist_user ON wishlist(user_id);

-- =========================================
-- ORDERS TABLE
-- =========================================
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    order_number TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, paid, processing, shipped, delivered, cancelled
    subtotal INTEGER NOT NULL, -- In cents
    tax INTEGER DEFAULT 0,
    shipping INTEGER DEFAULT 0,
    total INTEGER NOT NULL,
    currency TEXT DEFAULT 'USD',
    -- Shipping info (snapshot at time of order)
    shipping_name TEXT,
    shipping_email TEXT,
    shipping_phone TEXT,
    shipping_address_line1 TEXT,
    shipping_address_line2 TEXT,
    shipping_city TEXT,
    shipping_state TEXT,
    shipping_postal_code TEXT,
    shipping_country TEXT,
    -- Stripe
    stripe_payment_intent_id TEXT,
    stripe_checkout_session_id TEXT,
    -- Tracking
    tracking_number TEXT,
    tracking_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_stripe ON orders(stripe_checkout_session_id);

-- =========================================
-- ORDER ITEMS TABLE
-- =========================================
CREATE TABLE IF NOT EXISTS order_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    -- Snapshot of product at time of order
    product_name TEXT NOT NULL,
    product_image TEXT,
    price INTEGER NOT NULL, -- Unit price in cents
    size TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- =========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- PROFILES: Users can only read/update their own profile
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- PRODUCTS: Anyone can read active products
CREATE POLICY "Anyone can view active products" ON products
    FOR SELECT USING (is_active = true);

-- CART: Users can manage their own cart
CREATE POLICY "Users can view own cart" ON cart_items
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert to own cart" ON cart_items
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart" ON cart_items
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete from own cart" ON cart_items
    FOR DELETE USING (auth.uid() = user_id);

-- WISHLIST: Users can manage their own wishlist
CREATE POLICY "Users can view own wishlist" ON wishlist
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert to own wishlist" ON wishlist
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete from own wishlist" ON wishlist
    FOR DELETE USING (auth.uid() = user_id);

-- ORDERS: Users can view their own orders
CREATE POLICY "Users can view own orders" ON orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own order items" ON order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_id = auth.uid()
        )
    );

-- =========================================
-- SEED DATA - PRODUCTS
-- =========================================
INSERT INTO products (slug, name, description, price, category, collection, images, materials, care_instructions, is_new, is_featured, sizes_out_of_stock) VALUES
-- Inferno Collection (Premium Leather)
('third-eye-patched-leather', 'Third Eye Patched Leather', 'Crafted from premium Italian leather, the Third Eye Patched Leather Jacket features hand-stitched mystical eye patches inspired by ancient symbolism. Each jacket is individually numbered as part of our limited Inferno Collection.', 129500, 'leather', 'inferno', ARRAY['images/product-1.jpg', 'images/product-1-hover.jpg'], '100% Italian Lambskin Leather, Quilted satin lining, YKK zippers', 'Professional leather clean only. Store on a padded hanger in a cool, dry place.', true, true, ARRAY['XXL']),

('hip-hop-legends-bomber', 'Hip-Hop Legends Bomber', 'A tribute to hip-hop culture, this premium bomber features iconic imagery and superior craftsmanship. Fully reversible with satin interior.', 89500, 'bomber', 'inferno', ARRAY['images/product-2.jpg', 'images/product-2-hover.jpg'], '100% Nylon outer, 100% Polyester satin lining', 'Machine wash cold, hang dry.', true, true, ARRAY[]::TEXT[]),

('rock-icons-varsity', 'Rock Icons Varsity', 'Channel rock royalty with this statement varsity jacket. Premium wool body with genuine leather sleeves, featuring embroidered rock legend patches.', 69500, 'varsity', 'inferno', ARRAY['images/product-3.jpg', 'images/product-3-hover.jpg'], 'Wool/polyester blend body, genuine leather sleeves', 'Dry clean only.', true, true, ARRAY[]::TEXT[]),

('cosmic-visions-trucker', 'Cosmic Visions Trucker', 'Explore the cosmos with this psychedelic trucker jacket. Hand-painted celestial designs on premium denim with sherpa lining.', 99500, 'denim', 'inferno', ARRAY['images/product-4.jpg', 'images/product-4-hover.jpg'], '100% Cotton denim, sherpa lining', 'Hand wash cold, lay flat to dry.', true, false, ARRAY[]::TEXT[]),

-- Essentials Collection
('snake-skull-denim', 'Snake & Skull Denim', 'Edgy and artistic, this denim jacket features intricate snake and skull embroidery. A statement piece for the bold.', 59500, 'denim', 'essentials', ARRAY['images/essential-1.jpg'], '100% Cotton denim', 'Machine wash cold, tumble dry low.', false, false, ARRAY[]::TEXT[]),

('grateful-spirit-canvas', 'Grateful Spirit Canvas', 'Inspired by the free-spirit movement, this canvas jacket features hand-painted designs and a relaxed fit.', 49500, 'canvas', 'essentials', ARRAY['images/essential-2.jpg'], '100% Cotton canvas', 'Machine wash warm, tumble dry medium.', false, false, ARRAY[]::TEXT[]),

('zen-master-coach', 'Zen Master Coach', 'Minimalist design meets Eastern philosophy in this clean coach jacket with subtle Zen-inspired details.', 39500, 'coach', 'essentials', ARRAY['images/essential-3.jpg'], '100% Nylon', 'Machine wash cold, hang dry.', false, false, ARRAY[]::TEXT[]),

('acid-trip-field-jacket', 'Acid Trip Field Jacket', 'A utilitarian field jacket reimagined with psychedelic accents and multiple pockets for the modern explorer.', 45000, 'field', 'essentials', ARRAY['images/essential-4.jpg'], '65% Polyester, 35% Cotton', 'Machine wash cold, hang dry.', false, false, ARRAY[]::TEXT[]),

-- Phoenix Collection
('mystic-eye-patched-leather', 'Mystic Eye Patched Leather', 'Sister to the Third Eye, this leather jacket features an expanded eye motif with gold threading.', 119500, 'leather', 'phoenix', ARRAY['images/look-1.jpg'], '100% Italian Lambskin Leather', 'Professional leather clean only.', false, true, ARRAY[]::TEXT[]),

('psychedelic-dreams-bomber', 'Psychedelic Dreams Bomber', 'Vibrant and bold, this bomber features an all-over psychedelic print with premium satin finish.', 94500, 'bomber', 'phoenix', ARRAY['images/look-2.jpg'], '100% Polyester satin', 'Dry clean only.', false, false, ARRAY[]::TEXT[]),

('rock-legend-varsity', 'Rock Legend Varsity', 'An elevated take on the classic varsity, featuring premium leather and custom chenille patches.', 79500, 'varsity', 'phoenix', ARRAY['images/look-3.jpg'], 'Wool body, leather sleeves', 'Dry clean only.', false, false, ARRAY[]::TEXT[]);

-- =========================================
-- HELPER FUNCTION: Generate Order Number
-- =========================================
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
    order_num TEXT;
BEGIN
    order_num := 'FD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    RETURN order_num;
END;
$$ LANGUAGE plpgsql;

-- =========================================
-- UPDATED_AT TRIGGER
-- =========================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON cart_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =========================================
-- DONE! Your database is ready.
-- =========================================
