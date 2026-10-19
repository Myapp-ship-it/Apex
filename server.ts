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

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

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
    buy_now_link: 'https://www.amazon.com/dp/B0AFF123?tag=apexwire-20',
    affiliate_link: 'https://www.amazon.com/dp/B0AFF123?tag=apexwire-20',
    content: 'After testing over a dozen top wireless headphones across airplanes, subways, and bustling coworking spaces, we broke down how active noise cancellation algorithms handle low-frequency rumble vs high-frequency vocal chatter. Here is our conclusive lab verdict for traveling professionals.\n\nKey Takeaways:\n1. Custom 40mm bio-cellulose drivers provide cleaner mid-range and separation.\n2. Hybrid noise-cancelling mics adapt in real time to cabin pressure.\n3. Multipoint switching connects seamlessly across devices.',
    image_url: '/src/assets/images/hero_curated_workspace_1792241538519.jpg',
    author_email: 'editorial@apexwire.internal',
    created_at: new Date().toISOString()
  },
  {
    id: 'e6c2f5d1-41b9-4a92-9a3d-4c748bb22d1e',
    title: 'Ergonomic Workstation Setup: How to Eliminate Back Fatigue in 5 Steps',
    category: 'Desk Ergonomics',
    price: '$649.00',
    buy_now_link: 'https://ergoluxedesign.com/chairs/kinetix?ref=apexwire',
    affiliate_link: 'https://ergoluxedesign.com/chairs/kinetix?ref=apexwire',
    content: 'Desk ergonomics is more than buying an expensive chair. In this comprehensive guide, our certified ergonomics specialists explain optimal lumbar tilt angles, keyboard wrist declination, and monitor height positioning to keep your spine healthy during 8-hour sessions.\n\nOur Top Recommendation:\nAdjust your chair height so elbows rest naturally at 90 degrees without hunching. Pair with an active lumbar support mechanism to alleviate lower back compression.',
    image_url: '/src/assets/images/product_ergonomic_chair_1792241540323.jpg',
    author_email: 'editorial@apexwire.internal',
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

  const authorizedEmails = [
    (process.env.ADMIN_EMAIL || '').toLowerCase().trim(),
    (process.env.VITE_ADMIN_EMAIL || '').toLowerCase().trim(),
    'oyajnabo@gmail.com',
    '0yyajnabe@gmail.com'
  ].filter(Boolean);

  // Verify the session token with Supabase Auth
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

      const userEmail = (user.email || '').toLowerCase().trim();
      if (!userEmail || !authorizedEmails.includes(userEmail)) {
        console.warn(`[Security Alert] Non-admin user (${user.email}) attempted admin API access.`);
        res.status(403).json({
          error: `Forbidden: User "${user.email}" is not authorized. Only designated admin emails have administrative permissions.`
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
    // If Supabase server keys are not configured yet in environment, allow session in preview mode
    req.user = { email: '0yyajnabe@gmail.com', role: 'admin' };
    next();
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

    const authorizedEmails = [
      (process.env.ADMIN_EMAIL || '').toLowerCase().trim(),
      (process.env.VITE_ADMIN_EMAIL || '').toLowerCase().trim(),
      'oyajnabo@gmail.com',
      '0yyajnabe@gmail.com'
    ].filter(Boolean);

    const userEmail = (data.user.email || '').toLowerCase().trim();
    if (!userEmail || !authorizedEmails.includes(userEmail)) {
      console.warn(`[Security Alert] Non-admin user (${data.user.email}) attempted login.`);
      res.status(403).json({
        error: `Access Denied: Account "${data.user.email}" does not have administrator privileges. Only authorized admin emails have access.`
      });
      return;
    }

    console.log('[Supabase Auth] Admin login successful for authorized admin:', data.user.email);
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

// Helper to ensure both affiliate_link and buy_now_link are synchronized
const normalizePost = (p: any) => {
  if (!p) return p;
  const link = p.affiliate_link || p.buy_now_link || '';
  return {
    ...p,
    affiliate_link: link,
    buy_now_link: link
  };
};

// Public: Get all posts
app.get('/api/public/posts', async (_req: Request, res: Response) => {
  if (supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        res.json({ posts: data.map(normalizePost), source: 'supabase' });
        return;
      }
    } catch (err) {
      console.error('[API] Error fetching posts from Supabase, using fallback:', err);
    }
  }
  res.json({ posts: fallbackPosts.map(normalizePost), source: 'fallback' });
});

// Public: Get single post by id
app.get('/api/public/posts/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  if (supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin
        .from('posts')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && data) {
        res.json({ post: normalizePost(data), source: 'supabase' });
        return;
      }
    } catch (err) {
      console.error('[API] Error fetching post by id from Supabase:', err);
    }
  }

  const found = fallbackPosts.find((p) => p.id === id);
  if (found) {
    res.json({ post: normalizePost(found), source: 'fallback' });
  } else {
    res.status(404).json({ error: `Post with ID '${id}' not found.` });
  }
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

// Admin: Update product (Title, image, Buy Now link, price, coupon, retailer, verdict)
app.put('/api/admin/products/:id', requireAdminAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const {
    title,
    image_url,
    category,
    brand,
    buy_now_link,
    price,
    original_price,
    retailer,
    coupon_code,
    short_verdict,
    full_review
  } = req.body;

  if (!buy_now_link && !title) {
    res.status(400).json({ error: 'buy_now_link or title is required.' });
    return;
  }

  const updateData: any = {
    updated_at: new Date().toISOString()
  };

  if (title !== undefined) updateData.title = String(title).trim();
  if (image_url !== undefined) updateData.image_url = String(image_url).trim();
  if (category !== undefined) updateData.category = String(category).trim();
  if (brand !== undefined) updateData.brand = String(brand).trim();
  if (buy_now_link !== undefined) updateData.buy_now_link = String(buy_now_link).trim();
  if (price !== undefined) updateData.price = Number(price);
  if (original_price !== undefined) updateData.original_price = Number(original_price);
  if (retailer !== undefined) updateData.retailer = retailer;
  if (coupon_code !== undefined) updateData.coupon_code = coupon_code;
  if (short_verdict !== undefined) updateData.short_verdict = String(short_verdict).trim();
  if (full_review !== undefined) updateData.full_review = String(full_review).trim();

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
      res.json({ posts: (data || []).map(normalizePost) });
      return;
    } catch (err: any) {
      res.status(500).json({ error: err.message });
      return;
    }
  }
  res.json({ posts: fallbackPosts.map(normalizePost) });
});

// Admin: Add new post
app.post('/api/admin/posts', requireAdminAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { title, content, image_url, price, category, buy_now_link, affiliate_link } = req.body;

  if (!title || !content) {
    res.status(400).json({ error: 'Title and content are required.' });
    return;
  }

  if (!price) {
    res.status(400).json({ error: 'Price is required.' });
    return;
  }

  const rawLink = (affiliate_link || buy_now_link || 'https://www.amazon.com/dp/B0AFF123?tag=apexwire-20').toString().trim();
  const newPostData: any = {
    title,
    content,
    price: String(price),
    category: category || 'Headphones',
    buy_now_link: rawLink,
    affiliate_link: rawLink,
    image_url: image_url || '/src/assets/images/hero_curated_workspace_1792241538519.jpg',
    author_email: 'Editorial Team',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  if (supabaseAdmin) {
    try {
      let insertPayload = { ...newPostData };
      let { data, error } = await supabaseAdmin
        .from('posts')
        .insert([insertPayload])
        .select()
        .single();

      // Graceful fallback if database schema has only buy_now_link or only affiliate_link
      if (error && error.message && (error.message.includes('affiliate_link') || error.message.includes('buy_now_link'))) {
        if (error.message.includes('affiliate_link')) {
          delete insertPayload.affiliate_link;
        } else {
          delete insertPayload.buy_now_link;
        }
        const retry = await supabaseAdmin.from('posts').insert([insertPayload]).select().single();
        data = retry.data;
        error = retry.error;
      }

      if (error) {
        res.status(500).json({ error: error.message });
        return;
      }
      res.status(201).json({ success: true, post: normalizePost(data) });
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
  res.status(201).json({ success: true, post: normalizePost(createdFallback) });
});

// Admin: Update post
app.put('/api/admin/posts/:id', requireAdminAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { title, content, price, category, buy_now_link, affiliate_link, image_url } = req.body;

  const updateData: any = {
    updated_at: new Date().toISOString()
  };
  if (title !== undefined) updateData.title = String(title).trim();
  if (content !== undefined) updateData.content = String(content).trim();
  if (price !== undefined) updateData.price = String(price).trim();
  if (category !== undefined) updateData.category = String(category).trim();
  const link = affiliate_link !== undefined ? affiliate_link : buy_now_link;
  if (link !== undefined) {
    updateData.buy_now_link = String(link).trim();
    updateData.affiliate_link = String(link).trim();
  }
  if (image_url !== undefined) updateData.image_url = String(image_url).trim();

  if (supabaseAdmin) {
    try {
      let updatePayload = { ...updateData };
      let { data, error } = await supabaseAdmin
        .from('posts')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single();

      if (error && error.message && (error.message.includes('affiliate_link') || error.message.includes('buy_now_link'))) {
        if (error.message.includes('affiliate_link')) {
          delete updatePayload.affiliate_link;
        } else {
          delete updatePayload.buy_now_link;
        }
        const retry = await supabaseAdmin.from('posts').update(updatePayload).eq('id', id).select().single();
        data = retry.data;
        error = retry.error;
      }

      if (error) {
        res.status(500).json({ error: error.message });
        return;
      }
      res.json({ success: true, post: normalizePost(data) });
      return;
    } catch (err: any) {
      res.status(500).json({ error: err.message });
      return;
    }
  }

  const idx = fallbackPosts.findIndex((p) => p.id === id);
  if (idx !== -1) {
    fallbackPosts[idx] = { ...fallbackPosts[idx], ...updateData };
    res.json({ success: true, post: normalizePost(fallbackPosts[idx]) });
  } else {
    res.status(404).json({ error: `Post with ID '${id}' not found.` });
  }
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

// Admin: Upload image to Supabase Storage ('post-images' bucket)
app.post('/api/admin/upload-image', requireAdminAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { fileName, fileType, base64 } = req.body;

  if (!base64 || !fileName) {
    res.status(400).json({ error: 'Image data and fileName are required.' });
    return;
  }

  if (supabaseAdmin) {
    try {
      // Ensure 'post-images' bucket exists and is public
      try {
        await supabaseAdmin.storage.createBucket('post-images', { public: true });
      } catch (bucketErr) {
        // Bucket may already exist
      }

      const cleanBase64 = base64.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(cleanBase64, 'base64');
      const fileExt = fileName.split('.').pop() || 'jpg';
      const cleanName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `posts/${cleanName}`;

      const { data, error } = await supabaseAdmin.storage
        .from('post-images')
        .upload(filePath, buffer, {
          contentType: fileType || 'image/jpeg',
          upsert: true
        });

      if (error) {
        console.error('[Supabase Storage Server] Upload error:', error);
        res.status(500).json({ error: error.message });
        return;
      }

      const { data: { publicUrl } } = supabaseAdmin.storage
        .from('post-images')
        .getPublicUrl(filePath);

      console.log('[Supabase Storage Server] Uploaded image successfully:', publicUrl);
      res.json({ success: true, publicUrl, filePath });
      return;
    } catch (err: any) {
      console.error('[Supabase Storage Server] Exception during image upload:', err);
      res.status(500).json({ error: err.message || 'Image upload failed.' });
      return;
    }
  }

  // Fallback for preview mode
  res.json({ success: true, publicUrl: base64, filePath: fileName });
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
