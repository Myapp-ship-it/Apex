-- ==============================================================================
-- ApexWire Supabase Database Schema
-- Run this in your Supabase Project -> SQL Editor
-- ==============================================================================

-- 1. Enable UUID Extension if not already active
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create products table
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  brand TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  original_price NUMERIC(10, 2) NOT NULL,
  rating NUMERIC(2, 1) DEFAULT 4.8,
  reviews_count INTEGER DEFAULT 100,
  award_label TEXT,
  image_url TEXT NOT NULL,
  short_verdict TEXT NOT NULL,
  full_review TEXT,
  buy_now_link TEXT NOT NULL,
  retailer TEXT DEFAULT 'Amazon',
  coupon_code TEXT,
  tested_hours INTEGER DEFAULT 100,
  pros TEXT[] DEFAULT '{}',
  cons TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create posts table (for reviews, buyer guides, and blog articles)
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT DEFAULT 'Headphones',
  price TEXT,
  content TEXT NOT NULL,
  image_url TEXT,
  author_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quick migration if table already exists:
ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS price TEXT,
ADD COLUMN IF NOT EXISTS category TEXT;

-- 4. Enable Row Level Security (RLS) on both tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- 5. Drop any existing policies to avoid duplicate conflicts
DROP POLICY IF EXISTS "Allow public read access on products" ON public.products;
DROP POLICY IF EXISTS "Allow authenticated admin insert products" ON public.products;
DROP POLICY IF EXISTS "Allow authenticated admin update products" ON public.products;
DROP POLICY IF EXISTS "Allow authenticated admin delete products" ON public.products;

DROP POLICY IF EXISTS "Allow public read access on posts" ON public.posts;
DROP POLICY IF EXISTS "Allow authenticated admin insert posts" ON public.posts;
DROP POLICY IF EXISTS "Allow authenticated admin update posts" ON public.posts;
DROP POLICY IF EXISTS "Allow authenticated admin delete posts" ON public.posts;

-- 6. Products RLS Policies: Public read-only, Authenticated Admin full management
CREATE POLICY "Allow public read access on products"
  ON public.products
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated admin insert products"
  ON public.products
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated admin update products"
  ON public.products
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated admin delete products"
  ON public.products
  FOR DELETE
  TO authenticated
  USING (true);

-- 7. Posts RLS Policies: Public read-only, Authenticated Admin full management
CREATE POLICY "Allow public read access on posts"
  ON public.posts
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated admin insert posts"
  ON public.posts
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated admin update posts"
  ON public.posts
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated admin delete posts"
  ON public.posts
  FOR DELETE
  TO authenticated
  USING (true);

-- 8. Seed Initial Products Data (Upsert to prevent duplicate errors)
INSERT INTO public.products (
  id, title, brand, category, price, original_price, rating, reviews_count,
  award_label, image_url, short_verdict, full_review, buy_now_link, retailer, coupon_code, tested_hours, pros, cons
) VALUES
(
  'aurae-h1-headphones',
  'Aurae H1 Over-Ear Wireless ANC Headphones',
  'Aurae Acoustics',
  'Audio & Sound',
  349.99,
  399.99,
  4.9,
  1840,
  'Editor''s Choice',
  '/src/assets/images/product_headphones_pro_1792241538646.jpg',
  'Unrivaled noise isolation paired with natural, airy soundstage and all-day ear cup comfort.',
  'After 180 hours of rigorous acoustic testing, the Aurae H1 proved to be the most balanced wireless over-ear headphone this year.',
  'https://www.amazon.com/dp/B0AFF123?tag=apexwire-20',
  'Amazon',
  'APEXAURAE15',
  180,
  ARRAY['Industry-leading active noise cancellation', '45-hour continuous battery life', 'Plush memory foam ear cushions'],
  ARRAY['Travel case is slightly bulky', 'Companion app requires account']
),
(
  'apex-pro-75-keyboard',
  'Apex Pro 75 Anodized Aluminum Mechanical Keyboard',
  'Apex Foundry',
  'Desk & Ergonomics',
  189.00,
  229.00,
  4.8,
  960,
  'Best Typist Pick',
  '/src/assets/images/product_keyboard_studio_1792241539698.jpg',
  'Gasket-mounted acoustic dampening, CNC milled solid chassis, and ultra-smooth pre-lubed switches.',
  'A ready-to-type masterpiece with silicone dampeners and open-source QMK/VIA programmability.',
  'https://mechanicalkeyboards.com/shop/apex-pro-75?aff=apexwire',
  'MechanicalKeyboards.com',
  'CLACK10',
  240,
  ARRAY['Acoustically tuned with silicone dampening', 'Solid 1.8kg CNC aluminum casing', 'Hot-swappable MX switches'],
  ARRAY['Heavy weight makes it strictly desk fixture', 'No shine-through keycaps']
),
(
  'ergoluxe-kinetix-chair',
  'ErgoLuxe Kinetix Synchronous Mesh Task Chair',
  'ErgoLuxe Design',
  'Desk & Ergonomics',
  649.00,
  799.00,
  4.9,
  712,
  'Top Spine Health',
  '/src/assets/images/product_ergonomic_chair_1792241540323.jpg',
  'Adaptive lumbar tracking that eliminates lower back fatigue during marathon desk work.',
  'Dynamic lumbar wing system that automatically conforms to sacrum and lower back micromovements.',
  'https://ergoluxedesign.com/chairs/kinetix?ref=apexwire',
  'ErgoLuxe Direct',
  'SPINECRAFT50',
  320,
  ARRAY['Active dynamic lumbar support', 'Breathable proprietary mesh', 'Polished aluminum wheelbase'],
  ARRAY['Assembly requires 25 minutes', 'Mesh requires brief adjustment period']
),
(
  'artisan-barista-pro-espresso',
  'Artisan Barista Pro E61 Italian Espresso Machine',
  'Officina Craft',
  'Home & Coffee',
  1195.00,
  1350.00,
  4.8,
  428,
  'Barista Gold Award',
  '/src/assets/images/product_espresso_machine_1792241540159.jpg',
  'Commercial 58mm grouphead with walnut wood accents and lightning-fast dual thermoblock heating.',
  'Reaches extraction temperature in just 4 minutes with twin PID regulators and 9-bar pre-infusion.',
  'https://www.wholelattelove.com/products/artisan-barista-pro?ref=apexwire',
  'Whole Latte Love',
  'BARISTA100',
  195,
  ARRAY['Dual PID temperature control', 'Commercial 58mm brass portafilter', 'Instant steam power for microfoam'],
  ARRAY['Requires 14 inches cabinet clearance', 'Demands a quality burr grinder']
),
(
  'lumina-x30-camera',
  'Lumina X-30 II Street Rangefinder Mirrorless Camera',
  'Lumina Optical',
  'Photo & Video',
  999.00,
  1149.00,
  4.9,
  885,
  'Best Street Camera',
  '/src/assets/images/product_mirrorless_camera_1792241540345.jpg',
  'Pocketable analog tactile dials, 26MP APS-C sensor, and film emulation modes that spark instant joy.',
  'Fast hybrid autofocus and mechanical dials make street photography a tactile, artistic delight.',
  'https://www.bhphotovideo.com/c/product/lumina-x30-ii?ref=apexwire',
  'B&H Photo Video',
  'SHUTTER50',
  210,
  ARRAY['Gorgeous film simulation JPEG recipes', 'Compact form factor', 'Fast eye and face tracking AF'],
  ARRAY['No in-body stabilization', 'Single SD card slot']
),
(
  'nomad-horizon-28l-backpack',
  'Nomad Horizon 28L Weatherproof Travel Daypack',
  'Nomad Provisions',
  'Travel & Bags',
  185.00,
  220.00,
  4.8,
  1290,
  'Best Everyday Carry',
  '/src/assets/images/product_travel_backpack_1792241539966.jpg',
  'Clamshell suitcase opening, bombproof recycled Cordura, and a suspended tech compartment.',
  '840D recycled ballistic nylon with TPU water-repellent coating and false-bottom 16-inch laptop protection.',
  'https://nomadgear.com/products/horizon-28l?ref=apexwire',
  'Nomad Gear Direct',
  'NOMADHORIZON15',
  175,
  ARRAY['Suspended 16-inch laptop compartment', 'Luggage trolley handle pass-through', 'YKK AquaGuard weather-sealed zippers'],
  ARRAY['Water bottle pocket fits max 26oz', 'Few external lash points']
)
ON CONFLICT (id) DO UPDATE SET
  buy_now_link = EXCLUDED.buy_now_link,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  updated_at = NOW();

-- 9. Seed Initial Post Data
INSERT INTO public.posts (
  id, title, content, image_url, author_email
) VALUES
(
  '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
  'The 2026 Noise-Cancelling Showdown: Which Headset Reigns Supreme?',
  'After testing over a dozen top wireless headphones across airplanes, subways, and bustling coworking spaces, we broke down how active noise cancellation algorithms handle low-frequency rumble vs high-frequency vocal chatter. Here is our conclusive lab verdict for traveling professionals.',
  '/src/assets/images/hero_curated_workspace_1792241538519.jpg',
  'editor@apexwire.internal'
),
(
  'e6c2f5d1-41b9-4a92-9a3d-4c748bb22d1e',
  'Ergonomic Workstation Setup: How to Eliminate Back Fatigue in 5 Steps',
  'Desk ergonomics is more than buying an expensive chair. In this comprehensive guide, our certified ergonomics specialists explain optimal lumbar tilt angles, keyboard wrist declination, and monitor height positioning to keep your spine healthy during 8-hour sessions.',
  '/src/assets/images/product_ergonomic_chair_1792241540323.jpg',
  'wellness@apexwire.internal'
)
ON CONFLICT (id) DO NOTHING;
