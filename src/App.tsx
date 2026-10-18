import React, { useState, useEffect, useMemo } from 'react';
import { PRODUCTS, Product, CATEGORIES } from './data/products';
import { AffiliateDisclosure } from './components/AffiliateDisclosure';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { FilterToolbar, SortOption } from './components/FilterToolbar';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { AffiliateRedirectModal } from './components/AffiliateRedirectModal';
import { CompareDrawer } from './components/CompareDrawer';
import { SavedBookmarksDrawer } from './components/SavedBookmarksDrawer';
import { TestingStandardsSection } from './components/TestingStandardsSection';
import { BlogPostsSection } from './components/BlogPostsSection';
import { SinglePostPage, BlogPost } from './components/SinglePostPage';
import { Footer } from './components/Footer';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { AdminPanel } from './components/admin/AdminPanel';
import { Search, RotateCcw, Scale, Bookmark, Lock, Key, AlertCircle, ShieldCheck } from 'lucide-react';
import { getSupabaseClient, setupAuthStateListener, isAuthorizedAdmin } from './lib/supabaseClient';

const STORAGE_SAVED_KEY = 'apexwire_saved_product_ids_v1';

export function isAdminRouteFromLocation(): boolean {
  if (typeof window === 'undefined') return false;
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  return (
    path === '/admin' ||
    path.startsWith('/admin/') ||
    hash === '#admin' ||
    hash === '#/admin' ||
    hash.startsWith('#/admin/') ||
    hash.startsWith('#admin/')
  );
}

function getPostIdFromLocation(): string | null {
  if (typeof window === 'undefined') return null;
  // Match /post/:id or /posts/:id
  const pathMatch = window.location.pathname.match(/^\/(?:posts|post)\/([a-zA-Z0-9_-]+)/);
  if (pathMatch && pathMatch[1]) return decodeURIComponent(pathMatch[1]);
  // Match #/posts/:id or #/post/:id
  const hashMatch = window.location.hash.match(/^#\/?(?:posts|post)\/([a-zA-Z0-9_-]+)/);
  if (hashMatch && hashMatch[1]) return decodeURIComponent(hashMatch[1]);
  // Match ?post=:id or ?postId=:id
  const searchParams = new URLSearchParams(window.location.search);
  const param = searchParams.get('post') || searchParams.get('postId');
  if (param) return param;
  return null;
}

export default function App() {
  const [currentView, setCurrentView] = useState<'store' | 'admin'>('store');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Products');
  const [sortBy, setSortBy] = useState<SortOption>('rating');
  const [onlyEditorsPicks, setOnlyEditorsPicks] = useState(false);
  const [onlyDeals, setOnlyDeals] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Supabase Data State
  const [liveProducts, setLiveProducts] = useState<Product[]>(PRODUCTS);
  const [livePosts, setLivePosts] = useState<BlogPost[]>([]);

  // Routing State for Single Post Page
  const [selectedPostId, setSelectedPostId] = useState<string | null>(() => getPostIdFromLocation());
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isLoadingPost, setIsLoadingPost] = useState(false);

  // Admin Auth State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState(false);
  const [securityAlertMessage, setSecurityAlertMessage] = useState<string | null>(null);

  // Synchronize browser history and hash for single post routing and /admin route protection
  useEffect(() => {
    const syncLocation = async () => {
      const postId = getPostIdFromLocation();
      setSelectedPostId(postId);
      if (!postId) {
        setSelectedPost(null);
      }

      const isAdminRoute = isAdminRouteFromLocation();
      if (isAdminRoute) {
        // Strictly verify active Supabase session for /admin route
        const client = getSupabaseClient();
        if (client) {
          try {
            const { data: { session } } = await client.auth.getSession();
            if (session && session.user && session.access_token && isAuthorizedAdmin(session.user.email)) {
              setIsAdminLoggedIn(true);
              setAdminEmail(session.user.email || '');
              setAuthToken(session.access_token);
              setCurrentView('admin');
              return;
            }
          } catch (e) {
            console.warn('Session verification failed on location sync:', e);
          }
        }

        // If no active valid session, block admin panel, redirect to root URL, & open login modal
        setIsAdminLoggedIn(false);
        setAdminEmail('');
        setAuthToken(null);
        setCurrentView('store');
        try {
          window.history.replaceState({}, '', '/');
        } catch {
          window.location.hash = '';
        }
        setIsAdminLoginModalOpen(true);
      } else {
        if (currentView === 'admin' && !isAdminLoggedIn) {
          setCurrentView('store');
        }
      }
    };

    window.addEventListener('popstate', syncLocation);
    window.addEventListener('hashchange', syncLocation);
    return () => {
      window.removeEventListener('popstate', syncLocation);
      window.removeEventListener('hashchange', syncLocation);
    };
  }, [currentView, isAdminLoggedIn]);

  // Resolve single post data when selectedPostId or livePosts changes
  useEffect(() => {
    if (!selectedPostId) {
      setSelectedPost(null);
      return;
    }

    const found = livePosts.find((p) => String(p.id) === String(selectedPostId));
    if (found) {
      setSelectedPost(found);
      return;
    }

    let isMounted = true;
    setIsLoadingPost(true);

    const fetchSinglePost = async () => {
      try {
        const res = await fetch(`/api/public/posts/${selectedPostId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.post && isMounted) {
            setSelectedPost(data.post);
            setIsLoadingPost(false);
            return;
          }
        }
      } catch {
        // Fallback
      }

      try {
        const sb = getSupabaseClient();
        if (sb) {
          const { data, error } = await sb
            .from('posts')
            .select('*')
            .eq('id', selectedPostId)
            .single();
          if (!error && data && isMounted) {
            setSelectedPost(data);
            setIsLoadingPost(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Single post direct fetch error:', err);
      }

      if (isMounted) setIsLoadingPost(false);
    };

    fetchSinglePost();

    return () => {
      isMounted = false;
    };
  }, [selectedPostId, livePosts]);

  // Check initial Supabase auth session and setup onAuthStateChange listener
  // CRITICAL: Strictly verify session with Supabase and check if user email is authorized admin
  useEffect(() => {
    const checkAuth = async () => {
      const client = getSupabaseClient();
      let hasValidAdminSession = false;

      if (client) {
        try {
          const { data: { session }, error } = await client.auth.getSession();
          if (!error && session && session.user && session.access_token) {
            const userEmail = session.user.email;
            if (isAuthorizedAdmin(userEmail)) {
              setIsAdminLoggedIn(true);
              setAdminEmail(userEmail || '');
              setAuthToken(session.access_token);
              hasValidAdminSession = true;
              if (isAdminRouteFromLocation()) {
                setCurrentView('admin');
              }
            } else {
              // Non-admin session detected: sign out immediately and block
              console.warn('[Security] Unauthorized user session found, terminating:', userEmail);
              await client.auth.signOut();
              localStorage.removeItem('apexwire_admin_token');
              localStorage.removeItem('apexwire_admin_email');
              setSecurityAlertMessage(
                `Access Blocked: Account "${userEmail}" is not authorized. Access is strictly restricted to authorized administrators.`
              );
            }
          }
        } catch (err) {
          console.warn('[Auth Check] Exception:', err);
        }
      }

      // If no valid session was verified:
      if (!hasValidAdminSession) {
        setIsAdminLoggedIn(false);
        setAdminEmail('');
        setAuthToken(null);
        localStorage.removeItem('apexwire_admin_token');
        localStorage.removeItem('apexwire_admin_email');

        // Strictly protect /admin route on load/reload
        if (isAdminRouteFromLocation()) {
          setCurrentView('store');
          try {
            window.history.replaceState({}, '', '/');
          } catch {
            window.location.hash = '';
          }
          setIsAdminLoginModalOpen(true);
        }
      }
    };

    checkAuth();

    // Subscribe to Supabase auth state changes
    // CRITICAL: Never automatically log in unless a valid Supabase session exists AND matches admin email
    const unsubscribe = setupAuthStateListener(async (event, session) => {
      console.log('[Supabase onAuthStateChange in App]:', event, session?.user?.email);

      // Only respond to explicit SIGNED_IN or TOKEN_REFRESHED with a valid session
      if (session && session.user && session.access_token && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
        const userEmail = session.user.email;
        if (isAuthorizedAdmin(userEmail)) {
          setIsAdminLoggedIn(true);
          setAdminEmail(userEmail || '');
          setAuthToken(session.access_token);
          setSecurityAlertMessage(null);
          if (isAdminRouteFromLocation() || currentView === 'admin') {
            setCurrentView('admin');
          }
        } else {
          // Block access for non-admin user
          console.warn('[Security Alert] Unauthorized login blocked for:', userEmail);
          const sb = getSupabaseClient();
          if (sb) await sb.auth.signOut();
          localStorage.removeItem('apexwire_admin_token');
          localStorage.removeItem('apexwire_admin_email');
          setIsAdminLoggedIn(false);
          setAdminEmail('');
          setAuthToken(null);
          setCurrentView('store');
          try {
            window.history.replaceState({}, '', '/');
          } catch {
            window.location.hash = '';
          }
          setSecurityAlertMessage(
            `Access Blocked: Account "${userEmail}" is not authorized. Access is strictly restricted to authorized administrators.`
          );
          setIsAdminLoginModalOpen(true);
        }
      } else if (event === 'SIGNED_OUT') {
        setIsAdminLoggedIn(false);
        setAdminEmail('');
        setAuthToken(null);
        localStorage.removeItem('apexwire_admin_token');
        localStorage.removeItem('apexwire_admin_email');
        setCurrentView('store');
        if (isAdminRouteFromLocation()) {
          try {
            window.history.pushState({}, '', '/');
          } catch {
            window.location.hash = '';
          }
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [currentView]);

  // Fetch Public Products & Posts from server (Supabase or fallback)
  const fetchPublicData = async () => {
    try {
      const [resProd, resPosts] = await Promise.all([
        fetch('/api/public/products'),
        fetch('/api/public/posts')
      ]);

      let fetchedProducts = false;
      let fetchedPosts = false;

      if (resProd.ok) {
        const dataProd = await resProd.json();
        if (dataProd.products && dataProd.products.length > 0) {
          applyProductsData(dataProd.products);
          fetchedProducts = true;
        }
      }

      if (resPosts.ok) {
        const dataPosts = await resPosts.json();
        if (dataPosts.posts && dataPosts.posts.length > 0) {
          setLivePosts(dataPosts.posts);
          fetchedPosts = true;
        }
      }

      // If backend API returned 404 (e.g. running as static SPA on Cloudflare Pages or Vercel static)
      // query Supabase directly via the public client using RLS
      if (!fetchedProducts || !fetchedPosts) {
        const sb = getSupabaseClient();
        if (sb) {
          if (!fetchedProducts) {
            const { data: prods } = await sb.from('products').select('*').order('rating', { ascending: false });
            if (prods && prods.length > 0) applyProductsData(prods);
          }
          if (!fetchedPosts) {
            const { data: posts } = await sb.from('posts').select('*').order('created_at', { ascending: false });
            if (posts && posts.length > 0) setLivePosts(posts);
          }
        }
      }
    } catch (err) {
      // In static deployment, try direct Supabase client
      try {
        const sb = getSupabaseClient();
        if (sb) {
          const { data: prods } = await sb.from('products').select('*').order('rating', { ascending: false });
          if (prods && prods.length > 0) applyProductsData(prods);
          const { data: posts } = await sb.from('posts').select('*').order('created_at', { ascending: false });
          if (posts && posts.length > 0) setLivePosts(posts);
        }
      } catch (sbErr) {
        console.warn('Using client defaults for products and posts:', sbErr);
      }
    }
  };

  const applyProductsData = (rawProducts: any[]) => {
    const mapped = rawProducts.map((sp: any) => {
      const fallback = PRODUCTS.find((p) => p.id === sp.id);
      return {
        id: sp.id,
        title: sp.title || fallback?.title || '',
        brand: sp.brand || fallback?.brand || '',
        category: sp.category || fallback?.category || 'Audio & Sound',
        price: Number(sp.price),
        originalPrice: Number(sp.original_price || sp.originalPrice || fallback?.originalPrice || sp.price),
        rating: Number(sp.rating || fallback?.rating || 4.8),
        reviewsCount: Number(sp.reviews_count || sp.reviewsCount || fallback?.reviewsCount || 100),
        awardLabel: sp.award_label || sp.awardLabel || fallback?.awardLabel,
        image: sp.image_url || sp.image || fallback?.image,
        shortVerdict: sp.short_verdict || sp.shortVerdict || fallback?.shortVerdict || '',
        fullReview: sp.full_review || sp.fullReview || fallback?.fullReview || '',
        testedHours: Number(sp.tested_hours || sp.testedHours || fallback?.testedHours || 100),
        pros: sp.pros || fallback?.pros || [],
        cons: sp.cons || fallback?.cons || [],
        specs: fallback?.specs || [
          { label: 'Category', value: sp.category },
          { label: 'Retailer', value: sp.retailer || 'Amazon' }
        ],
        affiliateLinks: [
          {
            retailer: sp.retailer || fallback?.affiliateLinks[0]?.retailer || 'Amazon',
            price: Number(sp.price),
            originalPrice: Number(sp.original_price || sp.originalPrice || sp.price),
            couponCode: sp.coupon_code || fallback?.affiliateLinks[0]?.couponCode,
            link: sp.buy_now_link || fallback?.affiliateLinks[0]?.link || '#',
            inStock: true,
            isLowestPrice: true
          },
          ...(fallback?.affiliateLinks.slice(1) || [])
        ],
        scoreBreakdown: fallback?.scoreBreakdown || {
          performance: 9.5,
          buildQuality: 9.6,
          valueForMoney: 9.2,
          ergonomics: 9.4
        }
      };
    });
    setLiveProducts(mapped);
  };

  useEffect(() => {
    fetchPublicData();
  }, []);

  // Saved & Compared Product IDs
  const [savedIds, setSavedIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_SAVED_KEY);
      return stored ? JSON.parse(stored) : ['aurae-h1-headphones'];
    } catch {
      return ['aurae-h1-headphones'];
    }
  });

  const [comparedIds, setComparedIds] = useState<string[]>([]);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [buyNowProduct, setBuyNowProduct] = useState<Product | null>(null);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isSavedOpen, setIsSavedOpen] = useState(false);

  // Sync saved bookmarks with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SAVED_KEY, JSON.stringify(savedIds));
    } catch {
      // LocalStorage fallback
    }
  }, [savedIds]);

  const toggleSave = (productId: string) => {
    setSavedIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const toggleCompare = (product: Product) => {
    setComparedIds((prev) => {
      if (prev.includes(product.id)) {
        return prev.filter((id) => id !== product.id);
      }
      if (prev.length >= 3) {
        alert('You can compare a maximum of 3 products at a time.');
        return prev;
      }
      return [...prev, product.id];
    });
  };

  const removeCompare = (productId: string) => {
    setComparedIds((prev) => prev.filter((id) => id !== productId));
  };

  const clearAllCompare = () => {
    setComparedIds([]);
  };

  const clearAllSaved = () => {
    setSavedIds([]);
  };

  const handleLoginSuccess = (email: string, token: string) => {
    if (!isAuthorizedAdmin(email)) {
      setSecurityAlertMessage(
        `Access Blocked: Account "${email}" is not authorized. Access is strictly restricted to authorized administrators.`
      );
      setIsAdminLoginModalOpen(true);
      return;
    }
    setIsAdminLoggedIn(true);
    setAdminEmail(email);
    setAuthToken(token);
    setSecurityAlertMessage(null);
    setCurrentView('admin');
    try {
      window.history.pushState({ view: 'admin' }, '', '/admin');
    } catch {
      window.location.hash = '/admin';
    }
  };

  const handleLogout = async () => {
    const client = getSupabaseClient();
    if (client) {
      await client.auth.signOut();
    }
    localStorage.removeItem('apexwire_admin_token');
    localStorage.removeItem('apexwire_admin_email');
    setIsAdminLoggedIn(false);
    setAuthToken(null);
    setAdminEmail('');
    setCurrentView('store');
    try {
      window.history.pushState({}, '', '/');
    } catch {
      window.location.hash = '';
    }
  };

  const handleOpenAdminView = () => {
    if (isAdminLoggedIn && isAuthorizedAdmin(adminEmail)) {
      setCurrentView('admin');
      try {
        window.history.pushState({ view: 'admin' }, '', '/admin');
      } catch {
        window.location.hash = '/admin';
      }
    } else {
      setIsAdminLoginModalOpen(true);
    }
  };

  // Single post navigation handlers
  const handleOpenPost = (post: BlogPost) => {
    setSelectedPost(post);
    setSelectedPostId(post.id);
    try {
      window.history.pushState({ postId: post.id }, '', `/posts/${post.id}`);
    } catch {
      window.location.hash = `/posts/${post.id}`;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackFromPost = () => {
    setSelectedPost(null);
    setSelectedPostId(null);
    try {
      window.history.pushState({}, '', '/');
    } catch {
      window.location.hash = '';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePostBuyNow = (link: string, _title: string) => {
    const targetUrl = link && link.trim().length > 0 ? link.trim() : 'https://www.amazon.com/dp/B0AFF123?tag=apexwire-20';
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      'All Products': liveProducts.length
    };
    for (const cat of CATEGORIES) {
      if (cat !== 'All Products') {
        counts[cat] = liveProducts.filter((p) => p.category === cat).length;
      }
    }
    return counts;
  }, [liveProducts]);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return liveProducts.filter((product) => {
      // Category filter
      if (selectedCategory !== 'All Products' && product.category !== selectedCategory) {
        return false;
      }

      // Quick filter: Editor's Picks
      if (onlyEditorsPicks && !product.awardLabel) {
        return false;
      }

      // Quick filter: Deals
      if (onlyDeals && product.originalPrice <= product.price) {
        return false;
      }

      // Search Query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = product.title.toLowerCase().includes(query);
        const matchesBrand = product.brand.toLowerCase().includes(query);
        const matchesCategory = product.category.toLowerCase().includes(query);
        const matchesVerdict = product.shortVerdict.toLowerCase().includes(query);
        const matchesPros = product.pros.some((p) => p.toLowerCase().includes(query));
        const matchesSpecs = product.specs.some(
          (s) => s.label.toLowerCase().includes(query) || s.value.toLowerCase().includes(query)
        );

        if (!matchesTitle && !matchesBrand && !matchesCategory && !matchesVerdict && !matchesPros && !matchesSpecs) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'discount': {
          const discountA = (a.originalPrice - a.price) / a.originalPrice;
          const discountB = (b.originalPrice - b.price) / b.originalPrice;
          return discountB - discountA;
        }
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'tested':
          return b.testedHours - a.testedHours;
        default:
          return 0;
      }
    });
  }, [liveProducts, searchQuery, selectedCategory, sortBy, onlyEditorsPicks, onlyDeals]);

  const hasActiveFilters =
    Boolean(searchQuery) ||
    selectedCategory !== 'All Products' ||
    onlyEditorsPicks ||
    onlyDeals ||
    sortBy !== 'rating';

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All Products');
    setOnlyEditorsPicks(false);
    setOnlyDeals(false);
    setSortBy('rating');
  };

  const scrollToCatalog = () => {
    document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToStandards = () => {
    document.getElementById('testing-standards')?.scrollIntoView({ behavior: 'smooth' });
  };

  const comparedProducts = useMemo(() => {
    return liveProducts.filter((p) => comparedIds.includes(p.id));
  }, [liveProducts, comparedIds]);

  const savedProducts = useMemo(() => {
    return liveProducts.filter((p) => savedIds.includes(p.id));
  }, [liveProducts, savedIds]);

  // Protected Admin View Render - strictly protects /admin route and admin view
  if (currentView === 'admin' || (typeof window !== 'undefined' && isAdminRouteFromLocation())) {
    if (isAdminLoggedIn && isAuthorizedAdmin(adminEmail)) {
      return (
        <AdminPanel
          adminEmail={adminEmail}
          authToken={authToken}
          onLogout={handleLogout}
          onBackToStore={() => {
            setCurrentView('store');
            try {
              window.history.pushState({}, '', '/');
            } catch {
              window.location.hash = '';
            }
            fetchPublicData();
          }}
          onProductUpdatedInApp={fetchPublicData}
        />
      );
    }

    // Unauthenticated or unauthorized visitor attempting /admin route access: Strictly Block
    return (
      <div className="min-h-screen flex flex-col bg-neutral-950 text-white selection:bg-neutral-800 selection:text-white">
        <AffiliateDisclosure />
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
          <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl text-center">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mx-auto flex items-center justify-center">
              <Lock className="w-8 h-8 text-rose-400" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold tracking-tight text-white">
                Admin Authentication Required
              </h2>
              <p className="text-xs text-neutral-400 leading-relaxed">
                The <span className="font-mono text-neutral-300 font-semibold">/admin</span> portal is strictly restricted. Only the authorized administrator account can access this section.
              </p>
            </div>

            {securityAlertMessage && (
              <div className="p-3.5 bg-rose-950/70 border border-rose-800/80 rounded-2xl text-left text-xs text-rose-300 space-y-1">
                <div className="font-semibold flex items-center gap-1.5 text-rose-200">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>Access Denied</span>
                </div>
                <p className="text-[11px] text-rose-300/90 leading-normal pl-5.5">
                  {securityAlertMessage}
                </p>
              </div>
            )}

            <div className="space-y-3 pt-1">
              <button
                onClick={() => setIsAdminLoginModalOpen(true)}
                className="w-full py-3 px-4 bg-white hover:bg-neutral-100 text-neutral-900 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Key className="w-4 h-4" />
                <span>Log In with Admin Account</span>
              </button>

              <button
                onClick={() => {
                  setCurrentView('store');
                  try {
                    window.history.pushState({}, '', '/');
                  } catch {
                    window.location.hash = '';
                  }
                }}
                className="w-full py-2.5 px-4 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Return to Homepage</span>
              </button>
            </div>

            <div className="pt-3 border-t border-neutral-800 text-[11px] text-neutral-500 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Restricted to Authorized Administrators</span>
            </div>
          </div>
        </div>

        {/* Modal Overlay */}
        <AdminLoginModal
          isOpen={isAdminLoginModalOpen}
          onClose={() => setIsAdminLoginModalOpen(false)}
          onLoginSuccess={handleLoginSuccess}
          initialError={securityAlertMessage}
        />
      </div>
    );
  }

  // Single Post Page View Render (when /posts/:id or /post/:id is active)
  if (selectedPostId) {
    return (
      <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900 selection:bg-neutral-900 selection:text-white">
        <AffiliateDisclosure />
        <Navbar
          savedCount={savedIds.length}
          compareCount={comparedIds.length}
          onOpenSaved={() => setIsSavedOpen(true)}
          onOpenCompare={() => setIsCompareOpen(true)}
          onScrollToCatalog={() => {
            handleBackFromPost();
            setTimeout(scrollToCatalog, 100);
          }}
          onScrollToStandards={() => {
            handleBackFromPost();
            setTimeout(scrollToStandards, 100);
          }}
          onOpenAdmin={handleOpenAdminView}
          isAdminLoggedIn={isAdminLoggedIn}
        />

        <main className="flex-1">
          {selectedPost ? (
            <SinglePostPage
              post={selectedPost}
              onBack={handleBackFromPost}
              onBuyNow={handlePostBuyNow}
            />
          ) : (
            <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-4">
              {isLoadingPost ? (
                <div className="space-y-3">
                  <div className="w-8 h-8 border-3 border-neutral-900 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-sm font-semibold text-neutral-600">Loading guide...</p>
                </div>
              ) : (
                <div className="bg-white p-8 rounded-2xl border border-neutral-200 max-w-md mx-auto space-y-4 shadow-sm">
                  <h3 className="font-bold text-lg text-neutral-900">Guide Not Found</h3>
                  <p className="text-xs text-neutral-500">
                    The requested article could not be located. It may have been renamed or removed.
                  </p>
                  <button
                    onClick={handleBackFromPost}
                    className="px-5 py-2.5 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 transition-colors cursor-pointer shadow-sm"
                  >
                    Return to Homepage
                  </button>
                </div>
              )}
            </div>
          )}
        </main>

        <Footer
          onSelectCategory={(cat) => {
            handleBackFromPost();
            setSelectedCategory(cat);
          }}
          onScrollToCatalog={() => {
            handleBackFromPost();
            setTimeout(scrollToCatalog, 100);
          }}
        />
      </div>
    );
  }

  // Public Storefront View Render
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900 selection:bg-neutral-900 selection:text-white">
      {/* FTC Affiliate Disclosure Top Ribbon */}
      <AffiliateDisclosure />

      {/* 3-Zone Navigation */}
      <Navbar
        savedCount={savedIds.length}
        compareCount={comparedIds.length}
        onOpenSaved={() => setIsSavedOpen(true)}
        onOpenCompare={() => setIsCompareOpen(true)}
        onScrollToCatalog={scrollToCatalog}
        onScrollToStandards={scrollToStandards}
        onOpenAdmin={handleOpenAdminView}
        isAdminLoggedIn={isAdminLoggedIn}
      />

      {/* Hero Section with Search Bar */}
      <HeroSection
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        totalProducts={liveProducts.length}
        filteredCount={filteredProducts.length}
        onSelectSuggestion={(term) => setSearchQuery(term)}
      />

      {/* Main Catalog Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Category Filters, Search feedback, and Sorting Controls */}
        <FilterToolbar
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          categoryCounts={categoryCounts}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onlyEditorsPicks={onlyEditorsPicks}
          onToggleEditorsPicks={() => setOnlyEditorsPicks(!onlyEditorsPicks)}
          onlyDeals={onlyDeals}
          onToggleDeals={() => setOnlyDeals(!onlyDeals)}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onResetFilters={resetFilters}
          hasActiveFilters={hasActiveFilters}
          totalResults={filteredProducts.length}
        />

        {/* Product Grid or Empty State */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center space-y-4 shadow-xs">
            <Search className="w-10 h-10 text-neutral-300 mx-auto" />
            <h3 className="text-lg font-bold text-neutral-900">No matching reviews found</h3>
            <p className="text-sm text-neutral-500 max-w-md mx-auto">
              We couldn't find any products matching "{searchQuery}" under the current category and filters. Try adjusting your search query or reset your filters.
            </p>
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-lg inline-flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          </div>
        ) : (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8'
                : 'flex flex-col gap-4'
            }
          >
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isSaved={savedIds.includes(product.id)}
                isCompared={comparedIds.includes(product.id)}
                onToggleSave={toggleSave}
                onToggleCompare={toggleCompare}
                onOpenDetail={(p) => setDetailProduct(p)}
                onBuyNow={(p) => setBuyNowProduct(p)}
                viewMode={viewMode}
              />
            ))}
          </div>
        )}
      </main>

      {/* Editorial Posts Section (from Supabase posts table) */}
      <BlogPostsSection
        posts={livePosts}
        onOpenAdmin={handleOpenAdminView}
        onOpenPost={handleOpenPost}
        onBuyNowPost={handlePostBuyNow}
      />

      {/* Testing Standards & Rigor Section */}
      <TestingStandardsSection />

      {/* Footer with FTC Disclosures & Quick Links */}
      <Footer
        onSelectCategory={(cat) => setSelectedCategory(cat)}
        onScrollToCatalog={scrollToCatalog}
      />

      {/* Floating Bottom Bar for Mobile Comparison & Bookmarks */}
      {(comparedIds.length > 0 || savedIds.length > 0) && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 sm:hidden bg-neutral-900/95 backdrop-blur-md text-white px-4 py-2.5 rounded-full shadow-xl flex items-center gap-4 text-xs border border-neutral-700">
          {comparedIds.length > 0 && (
            <button
              onClick={() => setIsCompareOpen(true)}
              className="flex items-center gap-1.5 font-medium cursor-pointer"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Compare ({comparedIds.length})</span>
            </button>
          )}
          {comparedIds.length > 0 && savedIds.length > 0 && (
            <span className="text-neutral-600">|</span>
          )}
          {savedIds.length > 0 && (
            <button
              onClick={() => setIsSavedOpen(true)}
              className="flex items-center gap-1.5 font-medium cursor-pointer"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Saved ({savedIds.length})</span>
            </button>
          )}
        </div>
      )}

      {/* Detailed Review Modal */}
      <ProductDetailModal
        product={detailProduct}
        onClose={() => setDetailProduct(null)}
        isSaved={detailProduct ? savedIds.includes(detailProduct.id) : false}
        isCompared={detailProduct ? comparedIds.includes(detailProduct.id) : false}
        onToggleSave={toggleSave}
        onToggleCompare={toggleCompare}
        onBuyNow={(p) => setBuyNowProduct(p)}
      />

      {/* Verified Partner Buy Now Deal Modal */}
      <AffiliateRedirectModal
        product={buyNowProduct}
        onClose={() => setBuyNowProduct(null)}
      />

      {/* Side-by-Side Product Comparison Drawer */}
      <CompareDrawer
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        comparedProducts={comparedProducts}
        onRemoveCompare={removeCompare}
        onClearCompare={clearAllCompare}
        onBuyNow={(p) => setBuyNowProduct(p)}
      />

      {/* Saved Gear Wishlist Drawer */}
      <SavedBookmarksDrawer
        isOpen={isSavedOpen}
        onClose={() => setIsSavedOpen(false)}
        savedProducts={savedProducts}
        onRemoveSaved={toggleSave}
        onClearAllSaved={clearAllSaved}
        onBuyNow={(p) => setBuyNowProduct(p)}
        onOpenDetail={(p) => setDetailProduct(p)}
      />

      {/* Admin Login Modal (Supabase Auth) */}
      <AdminLoginModal
        isOpen={isAdminLoginModalOpen}
        onClose={() => setIsAdminLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        initialError={securityAlertMessage}
      />
    </div>
  );
}
