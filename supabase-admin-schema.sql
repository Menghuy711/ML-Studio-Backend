-- ============================================================
-- ML Studio - Admin Dashboard Schema
-- Run this in your Supabase SQL Editor AFTER supabase-schema.sql
-- ============================================================

-- 1. Profiles table (stores username + admin role)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Anyone can read profiles (needed for username display)
DROP POLICY IF EXISTS "Public profiles are viewable" ON public.profiles;
CREATE POLICY "Public profiles are viewable" ON public.profiles
  FOR SELECT USING (true);

-- Users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile (on register)
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================================
-- 2. Auto-create profile row when a new user signs up
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, is_admin)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    FALSE
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if already exists, then create
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 3. Products table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  category TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL DEFAULT '',
  colors JSONB NOT NULL DEFAULT '[]',
  features JSONB NOT NULL DEFAULT '[]',
  badge TEXT NOT NULL DEFAULT '',
  badge_class TEXT NOT NULL DEFAULT 'bg-secondary',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Anyone can read products (public catalogue)
DROP POLICY IF EXISTS "Products are publicly readable" ON public.products;
CREATE POLICY "Products are publicly readable" ON public.products
  FOR SELECT USING (true);

-- Only admins can insert products
DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
CREATE POLICY "Admins can insert products" ON public.products
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
    )
  );

-- Only admins can update products
DROP POLICY IF EXISTS "Admins can update products" ON public.products;
CREATE POLICY "Admins can update products" ON public.products
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
    )
  );

-- Only admins can delete products
DROP POLICY IF EXISTS "Admins can delete products" ON public.products;
CREATE POLICY "Admins can delete products" ON public.products
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
    )
  );

-- ============================================================
-- 4. Update orders RLS: admins can see ALL orders
-- ============================================================
-- Drop the old user-only select policy and add admin policy
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
CREATE POLICY "Admins can view all orders" ON public.orders
  FOR SELECT USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
    )
  );

-- Admins can update order status
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
CREATE POLICY "Admins can update orders" ON public.orders
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
    )
  );

-- Admins can delete orders
DROP POLICY IF EXISTS "Admins can delete orders" ON public.orders;
CREATE POLICY "Admins can delete orders" ON public.orders
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
    )
  );

-- ============================================================
-- 5. Update contact_messages RLS: admins can delete messages
-- ============================================================
DROP POLICY IF EXISTS "Admins can delete contact messages" ON public.contact_messages;
CREATE POLICY "Admins can delete contact messages" ON public.contact_messages
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
    )
  );

-- ============================================================
-- 6. Seed products from static data
-- ============================================================
INSERT INTO public.products (id, name, description, price, category, image_url, colors, features, badge, badge_class) VALUES
('lite-travel-pack-30l','Lite Travel Pack 30L','A lightweight carry-on backpack that''s comfortable and oh-so packable.',25,'Backpacks','/images/products/backpack-01.avif','[{"name":"Black","hex":"#1a1a1a","image":"/images/products/backpack-01.avif"},{"name":"Blue Steel","hex":"#5B7285","image":"/images/products/backpack-blue.avif"}]','["Folds out flat for easy packing","Quick-access top pocket for passport and essentials","Tuck-away shoulder straps","Lower exterior pocket fits an extra layer"]','New Arrival','bg-dark'),
('urban-daypack','Urban Daypack','A sleek everyday backpack with smart organization and a dedicated water bottle pocket.',89,'Backpacks','/images/products/backpack-blue.avif','[{"name":"Blue Steel","hex":"#5B7285","image":"/images/products/backpack-blue.avif"},{"name":"Black","hex":"#1a1a1a","image":"/images/products/backpack-01.avif"}]','["Padded laptop sleeve fits up to 16\"","Side water bottle pocket","Hidden back panel pocket for valuables","Water-resistant recycled fabric"]','New Arrival','bg-dark'),
('slim-transit-backpack','Slim Transit Backpack','A slim-profile backpack designed for the commuter who values clean lines and easy access.',110,'Backpacks','/images/products/backpack-rust-orange.avif','[{"name":"Rust Orange","hex":"#C45C26","image":"/images/products/backpack-rust-orange.avif"},{"name":"Black","hex":"#1a1a1a","image":"/images/products/backpack-01.avif"}]','["Streamlined silhouette for crowded commutes","Quick-access front zip pocket","Breathable mesh back panel","Luggage pass-through sleeve"]','Bestseller','bg-danger'),
('venture-flap-backpack','Venture Flap Backpack','A stylish flap-top backpack with buckle closures, perfect for campus or weekend adventures.',95,'Backpacks','/images/products/backpack-mint-flap.avif','[{"name":"Mint","hex":"#7ECFB2","image":"/images/products/backpack-mint-flap.avif"},{"name":"Black","hex":"#1a1a1a","image":"/images/products/backpack-01.avif"}]','["Magnetic buckle flap closure","Expandable side pocket for bottles","Internal padded laptop compartment","Comfortable padded shoulder straps"]','Trending','bg-success'),
('transit-work-backpack','Transit Work Backpack','The ultimate work-to-weekend backpack with premium finishes and all-day comfort.',125,'Backpacks','/images/products/backpack-tan-transit.avif','[{"name":"Tan","hex":"#C9A882","image":"/images/products/backpack-tan-transit.avif"},{"name":"Black","hex":"#1a1a1a","image":"/images/products/backpack-01.avif"}]','["Premium leather-look accents","Multiple internal organizer pockets","Padded 15\" laptop compartment","Structured base keeps bag upright"]','Classic','bg-secondary'),
('lite-carry-on','Lite Carry-On','A lightweight travel bag that''s engineered to glide.',168,'Luggage','/images/products/luggage-white.avif','[{"name":"White","hex":"#f5f5f5","image":"/images/products/luggage-white.avif"},{"name":"Forest Green","hex":"#3B6B4E","image":"/images/products/luggage-carryon-green.avif"}]','["Lightweight, compressible ripstop nylon shell","Exterior front pocket for valuables","Internal packing cells to stay organized","Self-replaceable wheels and handle"]','Bestseller','bg-danger'),
('explorer-carry-on','Explorer Carry-On','A durable hard-shell carry-on with smooth spinner wheels and a modern silhouette.',195,'Luggage','/images/products/luggage-carryon-green.avif','[{"name":"Forest Green","hex":"#3B6B4E","image":"/images/products/luggage-carryon-green.avif"},{"name":"White","hex":"#f5f5f5","image":"/images/products/luggage-white.avif"}]','["Impact-resistant polycarbonate shell","360° spinner wheels for effortless rolling","TSA-approved combination lock","Split interior with zippered divider"]','New Arrival','bg-dark'),
('road-trip-travel-set','Road Trip Travel Set','The ultimate road trip pair for throwing and going without compromising on function.',199,'Travel Bags','/images/products/travel-bag-black.avif','[{"name":"Black","hex":"#1a1a1a","image":"/images/products/travel-bag-black.avif"},{"name":"Green","hex":"#4A7C59","image":"/images/products/duffel-backpack-green.avif"}]','["Pack in a snap","Three carry modes","Organized inside","Angled for access"]','Value Set','bg-warning'),
('carryology-essentials-sling','Carryology Essentials Sling','Stylish and durable sling for daily use.',35,'Sling & Crossbody Bags','/images/products/Sling-01.avif','[{"name":"Black","hex":"#1a1a1a","image":"/images/products/Sling-01.avif"},{"name":"Mustard","hex":"#D4A843","image":"/images/products/sling-bag-mustard.avif"}]','["Special edition","Expandable storage","Two-way zipper","Water-resistant coated zippers"]','New Arrival','bg-warning'),
('city-crossbody-sling','City Crossbody Sling','A compact crossbody sling that keeps essentials secure and within reach.',55,'Sling & Crossbody Bags','/images/products/sling-bag-black.avif','[{"name":"Black","hex":"#1a1a1a","image":"/images/products/sling-bag-black.avif"},{"name":"Mustard","hex":"#D4A843","image":"/images/products/sling-bag-mustard.avif"}]','["Adjustable crossbody strap","Soft-lined interior phone pocket","Hidden rear zip pocket","Lightweight water-resistant fabric"]','Daily Use','bg-secondary'),
('compact-sling','Compact Sling','A minimalist sling in a bold mustard tone for those who travel light.',48,'Sling & Crossbody Bags','/images/products/sling-bag-mustard.avif','[{"name":"Mustard","hex":"#D4A843","image":"/images/products/sling-bag-mustard.avif"},{"name":"Black","hex":"#1a1a1a","image":"/images/products/sling-bag-black.avif"}]','["Slim profile for all-day comfort","Quick-access main compartment","Durable metal zipper pulls","Wear across chest or back"]','New Arrival','bg-warning'),
('weekender-duffel','Weekender Duffel','Perfect for quick getaways with a spacious interior and rugged exterior.',120,'Duffel Bags','/images/products/travel-bag-black.avif','[{"name":"Black","hex":"#1a1a1a","image":"/images/products/travel-bag-black.avif"},{"name":"Green","hex":"#4A7C59","image":"/images/products/duffel-backpack-green.avif"}]','["Spacious main compartment","Durable water-resistant fabric","Removable shoulder strap","Interior zippered pocket for valuables"]','Trending','bg-success'),
('gym-and-travel-duffel','Gym & Travel Duffel','Versatile and durable, designed for everyday carry and sports.',85,'Duffel Bags','/images/products/travel-bag-black.avif','[{"name":"Black","hex":"#1a1a1a","image":"/images/products/travel-bag-black.avif"},{"name":"Green","hex":"#4A7C59","image":"/images/products/duffel-backpack-green.avif"}]','["Spacious main compartment","Durable water-resistant fabric","Removable shoulder strap","Interior zippered pocket for valuables"]','Classic','bg-dark'),
('premium-leather-duffel','Premium Leather Duffel','Make a statement with this sophisticated genuine leather duffel bag.',250,'Duffel Bags','/images/products/travel-bag-black.avif','[{"name":"Black","hex":"#1a1a1a","image":"/images/products/travel-bag-black.avif"},{"name":"Green","hex":"#4A7C59","image":"/images/products/duffel-backpack-green.avif"}]','["Genuine leather construction","Brass hardware accents","Removable padded shoulder strap","Reinforced bottom panel"]','Almost Sold Out','bg-danger'),
('all-rounder-duffel','All-Rounder Duffel','A hybrid duffel-backpack that adapts to any journey with versatile carry options.',140,'Duffel Bags','/images/products/duffel-backpack-green.avif','[{"name":"Green","hex":"#4A7C59","image":"/images/products/duffel-backpack-green.avif"},{"name":"Black","hex":"#1a1a1a","image":"/images/products/duffel-bag-black.avif"}]','["Convertible backpack straps tuck away cleanly","Water-resistant recycled materials","Exterior zip pocket for quick access","Padded base protects contents"]','Trending','bg-success'),
('overnight-duffel','Overnight Duffel','A refined overnight duffel with comfortable handles and a detachable shoulder strap.',155,'Duffel Bags','/images/products/duffel-bag-black.avif','[{"name":"Black","hex":"#1a1a1a","image":"/images/products/duffel-bag-black.avif"},{"name":"Green","hex":"#4A7C59","image":"/images/products/duffel-backpack-green.avif"}]','["Padded grab handles for comfort","Detachable adjustable shoulder strap","Sleek minimalist design","Reinforced stress points for durability"]','Classic','bg-dark'),
('tokyo-tote-pack','Tokyo Tote Pack','A convertible tote that transforms into a backpack for flexible urban carrying.',115,'Tote Bags','/images/products/tote-backpack-khaki.avif','[{"name":"Khaki","hex":"#A89F7E","image":"/images/products/tote-backpack-khaki.avif"},{"name":"Olive","hex":"#6B7A45","image":"/images/products/tote-backpack-olive.avif"}]','["Converts from tote to backpack in seconds","Roll-top closure for expandable capacity","Padded laptop sleeve","Water-resistant fabric with leather accents"]','Bestseller','bg-danger'),
('metro-tote-backpack','Metro Tote Backpack','A versatile tote-backpack hybrid designed for the modern commuter.',105,'Tote Bags','/images/products/tote-backpack-olive.avif','[{"name":"Olive","hex":"#6B7A45","image":"/images/products/tote-backpack-olive.avif"},{"name":"Khaki","hex":"#A89F7E","image":"/images/products/tote-backpack-khaki.avif"}]','["Dual tote handles plus hidden backpack straps","Front slip pocket for quick-grab items","Internal organizer with key clip","Durable nylon construction"]','Trending','bg-success'),
('everyday-tote','Everyday Tote','A simple, elegant tote bag perfect for daily errands, market runs, or beach days.',65,'Tote Bags','/images/products/tote-bag-rust.avif','[{"name":"Rust","hex":"#A0522D","image":"/images/products/tote-bag-rust.avif"},{"name":"Khaki","hex":"#A89F7E","image":"/images/products/tote-backpack-khaki.avif"}]','["Spacious open-top main compartment","Reinforced double handles","Interior zip pocket for small essentials","Lightweight yet durable canvas"]','New Arrival','bg-dark'),
('tech-organizer-pouch','Tech Organizer Pouch','Keep your cables and chargers organized in this compact travel pouch.',45,'Accessories','/images/products/backpack-01.avif','[{"name":"Black","hex":"#1a1a1a","image":"/images/products/backpack-01.avif"},{"name":"Blue Steel","hex":"#5B7285","image":"/images/products/backpack-blue.avif"}]','["Multiple elastic loops for cables","Padded pocket for small devices","Water-resistant exterior","Compact and lightweight design"]','Must Have','bg-info text-dark'),
('minimalist-wallet','Minimalist Wallet','Slim profile wallet crafted from premium materials with RFID protection.',55,'Accessories','/images/products/luggage-white.avif','[{"name":"White","hex":"#f5f5f5","image":"/images/products/luggage-white.avif"},{"name":"Black","hex":"#1a1a1a","image":"/images/products/backpack-01.avif"}]','["RFID-blocking technology","Premium vegetable-tanned leather","Holds up to 8 cards + cash","Slim front-pocket profile"]','Daily Use','bg-secondary'),
('packing-cubes-set','Packing Cubes Set','Optimize your luggage space with this 3-piece compression packing cube set.',40,'Accessories','/images/products/luggage-white.avif','[{"name":"White","hex":"#f5f5f5","image":"/images/products/luggage-white.avif"},{"name":"Black","hex":"#1a1a1a","image":"/images/products/backpack-01.avif"}]','["3-piece set in varying sizes","Compression zipper saves up to 50% space","Mesh top for visibility","Durable ripstop nylon"]','New','bg-success')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 7. To make yourself admin, run this with your user UUID:
-- UPDATE public.profiles SET is_admin = true WHERE id = 'YOUR-USER-UUID-HERE';
-- ============================================================
