import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Server-side Supabase configuration
// Using NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
// Highly privileged secret key (NEVER exposed to frontend)
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

let supabaseAdmin: SupabaseClient | null = null;

if (supabaseUrl && supabaseServiceRoleKey) {
  try {
    supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    console.log('[Supabase Server] Initialized with Service Role Key successfully.');
  } catch (err) {
    console.error('[Supabase Server] Failed to initialize client:', err);
  }
} else {
  console.warn('[Supabase Server] NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set.');
}

// In-memory fallback cache when Supabase is not yet configured or table not yet migrated
let fallbackProducts = [
  {
    id: 'aurae-h1-headphones',
    title: 'Aurae H1 Over-Ear Wireless ANC Headphones',
    brand: 'Aurae Acoustics',
    category: 'Audio & Sound',
    price: 349.99,
    original_price: 399.99,
    rating: 4.9,
    reviews_count: 1840,
    award_label: "Editor's Choice",
    image_url: '/src/assets/images/product_headphones_pro_1792241538646.jpg',
    short_verdict: 'Unrivaled noise isolation paired with natural, airy soundstage and all-day ear cup comfort.',
    full_review: 'After 180 hours of rigorous acoustic testing, the Aurae H1 proved to be the most balanced wireless over-ear headphone this year.',
    buy_now_link: 'https://www.amazon.com/dp/B0AFF123?tag=apexwire-20',
    retailer: 'Amazon',
    coupon_code: 'APEXAURAE15',
    tested_hours: 180,
    pros: ['Industry-leading active noise cancellation', '45-hour continuous battery life', 'Plush memory foam ear cushions'],
    cons: ['Travel case is slightly bulky', 'Companion app requires account']
  },
  {
    id: 'apex-pro-75-keyboard',
    title: 'Apex Pro 75 Anodized Aluminum Mechanical Keyboard',
    brand: 'Apex Foundry',
    category: 'Desk & Ergonomics',
    price: 189.00,
    original_price: 229.00,
    rating: 4.8,
    reviews_count: 960,
    award_label: 'Best Typist Pick',
    image_url: '/src/assets/images/product_keyboard_studio_1792241539698.jpg',
    short_verdict: 'Gasket-mounted acoustic dampening, CNC milled solid chassis, and ultra-smooth pre-lubed switches.',
    full_review: 'A ready-to-type masterpiece with silicone dampeners and open-source QMK/VIA programmability.',
    buy_now_link: 'https://mechanicalkeyboards.com/shop/apex-pro-75?aff=apexwire',
    retailer: 'MechanicalKeyboards.com',
    coupon_code: 'CLACK10',
    tested_hours: 240,
    pros: ['Acoustically tuned with silicone dampening', 'Solid 1.8kg CNC aluminum casing', 'Hot-swappable MX switches'],
    cons: ['Heavy weight makes it strictly desk fixture', 'No shine-through keycaps']
  },
  {
    id: 'ergoluxe-kinetix-chair',
    title: 'ErgoLuxe Kinetix Synchronous Mesh Task Chair',
    brand: 'ErgoLuxe Design',
    category: 'Desk & Ergonomics',
    price: 649.00,
    original_price: 799.00,
    rating: 4.9,
    reviews_count: 712,
    award_label: 'Top Spine Health',
    image_url: '/src/assets/images/product_ergonomic_chair_1792241540323.jpg',
    short_verdict: 'Adaptive lumbar tracking that eliminates lower back fatigue during marathon desk work.',
    full_review: 'Dynamic lumbar wing system that automatically conforms to sacrum and lower back micromovements.',
    buy_now_link: 'https://ergoluxedesign.com/chairs/kinetix?ref=apexwire',
    retailer: 'ErgoLuxe Direct',
    coupon_code: 'SPINECRAFT50',
    tested_hours: 320,
    pros: ['Active dynamic lumbar support', 'Breathable proprietary mesh', 'Polished aluminum wheelbase'],
    cons: ['Assembly requires 25 minutes', 'Mesh requires brief adjustment period']
  },
  {
    id: 'artisan-barista-pro-espresso',
    title: 'Artisan Barista Pro E61 Italian Espresso Machine',
    brand: 'Officina Craft',
    category: 'Home & Coffee',
    price: 1195.00,
    original_price: 1350.00,
    rating: 4.8,
    reviews_count: 428,
    award_label: 'Barista Gold Award',
    image_url: '/src/assets/images/product_espresso_machine_1792241540159.jpg',
    short_verdict: 'Commercial 58mm grouphead with walnut wood accents and lightning-fast dual thermoblock heating.',
    full_review: 'Reaches extraction temperature in just 4 minutes with twin PID regulators and 9-bar pre-infusion.',
    buy_now_link: 'https://www.wholelattelove.com/products/artisan-barista-pro?ref=apexwire',
    retailer: 'Whole Latte Love',
    coupon_code: 'BARISTA100',
    tested_hours: 195,
    pros: ['Dual PID temperature control', 'Commercial 58mm brass portafilter', 'Instant steam power for microfoam'],
    cons: ['Requires 14 inches cabinet clearance', 'Demands a quality burr grinder']
  },
  {
    id: 'lumina-x30-camera',
    title: 'Lumina X-30 II Street Rangefinder Mirrorless Camera',
    brand: 'Lumina Optical',
    category: 'Photo & Video',
    price: 999.00,
    original_price: 1149.00,
    rating: 4.9,
    reviews_count: 885,
    award_label: 'Best Street Camera',
    image_url: '/src/assets/images/product_mirrorless_camera_1792241540345.jpg',
    short_verdict: 'Pocketable analog tactile dials, 26MP APS-C sensor, and film emulation modes that spark instant joy.',
    full_review: 'Fast hybrid autofocus and mechanical dials make street photography a tactile, artistic delight.',
    buy_now_link: 'https://www.bhphotovideo.com/c/product/lumina-x30-ii?ref=apexwire',
    retailer: 'B&H Photo Video',
    coupon_code: 'SHUTTER50',
    tested_hours: 210,
    pros: ['Gorgeous film simulation JPEG recipes', 'Compact form factor', 'Fast eye and face tracking AF'],
    cons: ['No in-body stabilization', 'Single SD card slot']
  },
  {
    id: 'nomad-horizon-28l-backpack',
    title: 'Nomad Horizon 28L Weatherproof Travel Daypack',
    brand: 'Nomad Provisions',
    category: 'Travel & Bags',
    price: 185.00,
    original_price: 220.00,
    rating: 4.8,
    reviews_count: 1290,
    award_label: 'Best Everyday Carry',
    image_url: '/src/assets/images/product_travel_backpack_1792241539966.jpg',
    short_verdict: 'Clamshell suitcase opening, bombproof recycled Cordura, and a suspended tech compartment.',
    full_review: '840D recycled ballistic nylon with TPU water-repellent coating and false-bottom 16-inch laptop protection.',
    buy_now_link: 'https://nomadgear.com/products/horizon-28l?ref=apexwire',
    retailer: 'Nomad Gear Direct',
    coupon_code: 'NOMADHORIZON15',
    tested_hours: 175,
    pros: ['Suspended 16-inch laptop compartment', 'Luggage trolley handle pass-through', 'YKK AquaGuard weather-sealed zippers'],
    cons: ['Water bottle pocket fits max 26oz', 'Few external lash points']
  }
];

let fallbackPosts = [
  {
    id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
    title: 'The 2026 Noise-Cancelling Showdown: Which Headset Reigns Supreme?',
    category: 'Headphones',
    price: '$349.99',
    content: 'After testing over a dozen top wireless headphones across airplanes, subways, and bustling coworking spaces, we broke down how active noise cancellation algorithms handle low-frequency rumble vs high-frequency vocal chatter. Here is our conclusive lab verdict for traveling professionals.',
    image_url: '/src/assets/images/hero_curated_workspace_1792241538519.jpg',
    author_email: 'editor@apexwire.internal',
    created_at: new Date().toISOString()
  },
  {
    id: 'e6c2f5d1-41b9-4a92-9a3d-4c748bb22d1e',
    title: 'Ergonomic Workstation Setup: How to Eliminate Back Fatigue in 5 Steps',
    category: 'Desk Ergonomics',
    price: '$649.00',
    content: 'Desk ergonomics is more than buying an expensive chair. In this comprehensive guide, our certified ergonomics specialists explain optimal lumbar tilt angles, keyboard wrist declination, and monitor height positioning to keep your spine healthy during 8-hour sessions.',
    image_url: '/src/assets/images/product_ergonomic_chair_1792241540323.jpg',
    author_email: 'wellness@apexwire.internal',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString()
  }
];

// Security Middleware: Protect all Admin API routes
// Verifies user token via Supabase Auth or service role
interface AuthenticatedRequest extends Request {
  user?: any;
}

const requireAdminAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'Unauthorized: Missing or invalid Authorization Bearer header.'
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  // If Supabase is configured, verify the session token with Supabase Auth
  if (supabaseAdmin) {
    try {
      const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
      if (error || !user) {
        res.status(401).json({
          error: 'Unauthorized: Invalid or expired Supabase admin session.',
          details: error?.message
        });
        return;
      }
      req.user = user;
      next();
      return;
    } catch (err: any) {
      res.status(401).json({
        error: 'Unauthorized: Failed to verify Supabase token.',
        details: err.message
      });
      return;
    }
  } else {
    // If Supabase credentials are not yet saved in .env, accept mock demo admin token for sandbox preview testing
    if (token === 'demo-admin-token' || token.startsWith('demo-')) {
      req.user = { id: 'demo-admin', email: 'admin@apexwire.internal' };
      next();
      return;
    }
    res.status(401).json({
      error: 'Unauthorized: Supabase credentials not configured and token invalid.'
    });
    return;
  }
};

// -----------------------------------------------------------------------------
// PUBLIC API & AUTH ROUTES
// -----------------------------------------------------------------------------

// Public: Get Supabase client public config (safe, NO service role key exposed)
app.get('/api/public/config', (_req: Request, res: Response) => {
  res.json({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '',
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''
  });
});

// Auth: Direct Login endpoint via Supabase Auth
app.post('/api/auth/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Please enter both email and password.' });
    return;
  }

  if (!supabaseAdmin) {
    res.status(500).json({
      error: 'Supabase server client is not configured. Check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'
    });
    return;
  }

  try {
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email: email.trim(),
      password: password.trim()
    });

    if (error) {
      console.warn('[Supabase Auth] Login failed for', email, error.message);
      res.status(401).json({
        error: error.message,
        status: error.status,
        code: error.name
      });
      return;
    }

    if (!data.session) {
      res.status(401).json({
        error: 'Login succeeded in Supabase Auth, but no active session was returned. Please verify your email confirmation status.'
      });
      return;
    }

    console.log('[Supabase Auth] Admin login successful for', data.user.email);
    res.json({
      session: data.session,
      user: data.user
    });
  } catch (err: any) {
    console.error('[Supabase Auth] Exception during signInWithPassword:', err);
    res.status(500).json({
      error: err.message || 'An error occurred during Supabase authentication.'
    });
  }
});

// Public: Get all products
app.get('/api/public/products', async (_req: Request, res: Response) => {
  if (supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin
        .from('products')
        .select('*')
        .order('rating', { ascending: false });

      if (!error && data && data.length > 0) {
        res.json({ products: data, source: 'supabase' });
        return;
      }
    } catch (err) {
      console.error('[API] Error fetching products from Supabase, using fallback:', err);
    }
  }
  res.json({ products: fallbackProducts, source: 'fallback' });
});

// Public: Get all posts
app.get('/api/public/posts', async (_req: Request, res: Response) => {
  if (supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        res.json({ posts: data, source: 'supabase' });
        return;
      }
    } catch (err) {
      console.error('[API] Error fetching posts from Supabase, using fallback:', err);
    }
  }
  res.json({ posts: fallbackPosts, source: 'fallback' });
});

// -----------------------------------------------------------------------------
// PROTECTED ADMIN API ROUTES (Require valid Supabase Auth Token)
// -----------------------------------------------------------------------------

// Admin: Check configuration and connection status
app.get('/api/admin/status', async (req: AuthenticatedRequest, res: Response) => {
  const isConfigured = Boolean(supabaseUrl && supabaseServiceRoleKey);
  let dbReachable = false;
  let productsCount = 0;
  let postsCount = 0;
  let errorMessage: string | null = null;

  if (isConfigured && supabaseAdmin) {
    try {
      const { count, error } = await supabaseAdmin
        .from('products')
        .select('*', { count: 'exact', head: true });
      if (!error) {
        dbReachable = true;
        productsCount = count || 0;
      } else {
        errorMessage = error.message;
      }

      const { count: pCount } = await supabaseAdmin
        .from('posts')
        .select('*', { count: 'exact', head: true });
      if (pCount !== null) postsCount = pCount;
    } catch (err: any) {
      errorMessage = err.message;
    }
  }

  res.json({
    supabaseConfigured: isConfigured,
    supabaseUrl: supabaseUrl ? supabaseUrl.replace(/(https?:\/\/)(.{4}).+(.{4}\.supabase\.co)/, '$1$2***$3') : null,
    dbReachable,
    productsCount: dbReachable ? productsCount : fallbackProducts.length,
    postsCount: dbReachable ? postsCount : fallbackPosts.length,
    errorMessage,
    user: req.headers.authorization ? 'authenticated' : 'unauthenticated'
  });
});

// Admin: List products
app.get('/api/admin/products', requireAdminAuth, async (_req: AuthenticatedRequest, res: Response) => {
  if (supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin
        .from('products')
        .select('*')
        .order('title', { ascending: true });

      if (error) {
        res.status(500).json({ error: error.message });
        return;
      }
      res.json({ products: data });
      return;
    } catch (err: any) {
      res.status(500).json({ error: err.message });
      return;
    }
  }
  res.json({ products: fallbackProducts });
});

// Admin: Update product (Specifically Buy Now link, price, coupon, retailer)
app.put('/api/admin/products/:id', requireAdminAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { buy_now_link, price, original_price, retailer, coupon_code } = req.body;

  if (!buy_now_link) {
    res.status(400).json({ error: 'buy_now_link is required.' });
    return;
  }

  const updateData: any = {
    buy_now_link,
    updated_at: new Date().toISOString()
  };

  if (price !== undefined) updateData.price = Number(price);
  if (original_price !== undefined) updateData.original_price = Number(original_price);
  if (retailer !== undefined) updateData.retailer = retailer;
  if (coupon_code !== undefined) updateData.coupon_code = coupon_code;

  if (supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin
        .from('products')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        res.status(500).json({ error: error.message });
        return;
      }
      res.json({ success: true, product: data });
      return;
    } catch (err: any) {
      res.status(500).json({ error: err.message });
      return;
    }
  }

  // Update in-memory fallback
  const index = fallbackProducts.findIndex((p) => p.id === id);
  if (index !== -1) {
    fallbackProducts[index] = { ...fallbackProducts[index], ...updateData };
    res.json({ success: true, product: fallbackProducts[index] });
  } else {
    res.status(404).json({ error: `Product with ID '${id}' not found.` });
  }
});

// Admin: List posts
app.get('/api/admin/posts', requireAdminAuth, async (_req: AuthenticatedRequest, res: Response) => {
  if (supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        res.status(500).json({ error: error.message });
        return;
      }
      res.json({ posts: data });
      return;
    } catch (err: any) {
      res.status(500).json({ error: err.message });
      return;
    }
  }
  res.json({ posts: fallbackPosts });
});

// Admin: Add new post
app.post('/api/admin/posts', requireAdminAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { title, content, image_url, price, category } = req.body;

  if (!title || !content) {
    res.status(400).json({ error: 'Title and content are required.' });
    return;
  }

  if (!price) {
    res.status(400).json({ error: 'Price is required.' });
    return;
  }

  const newPostData = {
    title,
    content,
    price: String(price),
    category: category || 'Headphones',
    image_url: image_url || '/src/assets/images/hero_curated_workspace_1792241538519.jpg',
    author_email: req.user?.email || 'admin@apexwire.internal',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  if (supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin
        .from('posts')
        .insert([newPostData])
        .select()
        .single();

      if (error) {
        res.status(500).json({ error: error.message });
        return;
      }
      res.status(201).json({ success: true, post: data });
      return;
    } catch (err: any) {
      res.status(500).json({ error: err.message });
      return;
    }
  }

  // Fallback post creation
  const createdFallback = {
    id: `post-${Date.now()}`,
    ...newPostData
  };
  fallbackPosts.unshift(createdFallback);
  res.status(201).json({ success: true, post: createdFallback });
});

// Admin: Delete post
app.delete('/api/admin/posts/:id', requireAdminAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  if (supabaseAdmin) {
    try {
      const { error } = await supabaseAdmin
        .from('posts')
        .delete()
        .eq('id', id);

      if (error) {
        res.status(500).json({ error: error.message });
        return;
      }
      res.json({ success: true, deletedId: id });
      return;
    } catch (err: any) {
      res.status(500).json({ error: err.message });
      return;
    }
  }

  fallbackPosts = fallbackPosts.filter((p) => p.id !== id);
  res.json({ success: true, deletedId: id });
});

// Mount Vite middleware for dev or serve dist in production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ApexWire FullStack] Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
});
