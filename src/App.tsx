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
import { Footer } from './components/Footer';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { AdminPanel } from './components/admin/AdminPanel';
import { Search, RotateCcw, Scale, Bookmark } from 'lucide-react';
import { getSupabaseClient, setupAuthStateListener } from './lib/supabaseClient';

const STORAGE_SAVED_KEY = 'apexwire_saved_product_ids_v1';

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
  const [livePosts, setLivePosts] = useState<any[]>([]);

  // Admin Auth State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState(false);

  // Check initial Supabase / demo auth session and setup onAuthStateChange listener
  useEffect(() => {
    const checkAuth = async () => {
      const client = getSupabaseClient();
      if (client) {
        const { data: { session } } = await client.auth.getSession();
        if (session && session.user) {
          setIsAdminLoggedIn(true);
          setAdminEmail(session.user.email || 'admin@apexwire.internal');
          setAuthToken(session.access_token);
          return;
        }
      }
      // Check stored token
      const savedToken = localStorage.getItem('apexwire_admin_token');
      const savedEmail = localStorage.getItem('apexwire_admin_email');
      if (savedToken && savedEmail) {
        setIsAdminLoggedIn(true);
        setAdminEmail(savedEmail);
        setAuthToken(savedToken);
      }
    };
    checkAuth();

    // Subscribe to Supabase auth state changes for automatic redirection
    const unsubscribe = setupAuthStateListener((event, session) => {
      if (session && session.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
        setIsAdminLoggedIn(true);
        setAdminEmail(session.user.email || 'admin@apexwire.internal');
        setAuthToken(session.access_token);
        setCurrentView('admin');
      } else if (event === 'SIGNED_OUT') {
        setIsAdminLoggedIn(false);
        setAdminEmail('');
        setAuthToken(null);
        setCurrentView('store');
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

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

      // If backend API returned 404 (e.g. running as static SPA on Cloudflare Pages)
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
    setIsAdminLoggedIn(true);
    setAdminEmail(email);
    setAuthToken(token);
    setCurrentView('admin');
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
  };

  const handleOpenAdminView = () => {
    if (isAdminLoggedIn) {
      setCurrentView('admin');
    } else {
      setIsAdminLoginModalOpen(true);
    }
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

  // Protected Admin View Render
  if (currentView === 'admin' && isAdminLoggedIn) {
    return (
      <AdminPanel
        adminEmail={adminEmail}
        authToken={authToken}
        onLogout={handleLogout}
        onBackToStore={() => {
          setCurrentView('store');
          fetchPublicData();
        }}
        onProductUpdatedInApp={fetchPublicData}
      />
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
      />
    </div>
  );
}
