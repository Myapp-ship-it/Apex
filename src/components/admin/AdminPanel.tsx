import React, { useState, useEffect } from 'react';
import {
  Package,
  FileText,
  Database,
  LogOut,
  ExternalLink,
  Edit2,
  Trash2,
  Plus,
  Check,
  Copy,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  Server,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { EditProductModal } from './EditProductModal';
import { NewPostModal } from './NewPostModal';
import { EditPostModal } from './EditPostModal';
import { getSupabaseClient } from '../../lib/supabaseClient';

interface AdminPanelProps {
  adminEmail: string;
  authToken: string | null;
  onLogout: () => void;
  onBackToStore: () => void;
  onProductUpdatedInApp?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  adminEmail,
  authToken,
  onLogout,
  onBackToStore,
  onProductUpdatedInApp
}) => {
  const [activeTab, setActiveTab] = useState<'products' | 'posts' | 'sql'>('products');

  // Products state
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  // Posts state
  const [posts, setPosts] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [isNewPostOpen, setIsNewPostOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any | null>(null);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);

  // Status & SQL state
  const [status, setStatus] = useState<any>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/admin/status', {
        headers: {
          Authorization: `Bearer ${authToken || ''}`
        }
      });
      const data = await res.json();
      setStatus(data);
    } catch (err) {
      console.error('Failed to fetch admin status:', err);
    }
  };

  const fetchProducts = async () => {
    setLoadingProducts(true);
    let loaded = false;

    try {
      const res = await fetch('/api/admin/products', {
        headers: {
          Authorization: `Bearer ${authToken || ''}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.products && data.products.length > 0) {
          setProducts(data.products);
          loaded = true;
        }
      }
    } catch {
      // Server unreachable (e.g. Cloudflare Pages static hosting)
    }

    if (!loaded) {
      try {
        const sb = getSupabaseClient();
        if (sb) {
          const { data, error } = await sb.from('products').select('*').order('title', { ascending: true });
          if (!error && data && data.length > 0) {
            setProducts(data);
            loaded = true;
          }
        }
      } catch (err: any) {
        console.warn('Direct Supabase fetch products fallback:', err);
      }
    }

    setLoadingProducts(false);
  };

  const fetchPosts = async () => {
    setLoadingPosts(true);
    let loaded = false;

    try {
      const res = await fetch('/api/admin/posts', {
        headers: {
          Authorization: `Bearer ${authToken || ''}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.posts) {
          setPosts(data.posts);
          loaded = true;
        }
      }
    } catch {
      // Server unreachable (e.g. Cloudflare Pages static hosting)
    }

    if (!loaded) {
      try {
        const sb = getSupabaseClient();
        if (sb) {
          const { data, error } = await sb.from('posts').select('*').order('created_at', { ascending: false });
          if (!error && data) {
            setPosts(data);
            loaded = true;
          }
        }
      } catch (err: any) {
        console.warn('Direct Supabase fetch posts fallback:', err);
      }
    }

    setLoadingPosts(false);
  };

  useEffect(() => {
    fetchStatus();
    fetchProducts();
    fetchPosts();
  }, []);

  const handleProductSaved = (updated: any) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p))
    );
    setMessage({ text: `Updated "${updated.title}" Buy Now link in Supabase!`, type: 'success' });
    setTimeout(() => setMessage(null), 4000);
    onProductUpdatedInApp?.();
  };

  const handlePostCreated = (newPost: any) => {
    setPosts((prev) => [newPost, ...prev]);
    setMessage({ text: `Successfully published new post "${newPost.title}" to Supabase!`, type: 'success' });
    setTimeout(() => setMessage(null), 4000);
  };

  const handlePostSaved = (updated: any) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p))
    );
    setMessage({ text: `Successfully updated post "${updated.title}" in Supabase!`, type: 'success' });
    setTimeout(() => setMessage(null), 4000);
    onProductUpdatedInApp?.();
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post from the Supabase database?')) {
      return;
    }
    setDeletingPostId(id);
    let deleted = false;
    let errorMsg: string | null = null;

    try {
      const res = await fetch(`/api/admin/posts/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${authToken || ''}`
        }
      });
      if (res.ok) {
        deleted = true;
      } else {
        const errData = await res.json().catch(() => ({}));
        errorMsg = errData.error || null;
      }
    } catch {
      // Server unreachable (e.g. static Cloudflare Pages hosting)
    }

    // Direct Supabase deletion fallback (using authenticated RLS policy)
    if (!deleted) {
      try {
        const sb = getSupabaseClient();
        if (sb) {
          const { error } = await sb.from('posts').delete().eq('id', id);
          if (!error) {
            deleted = true;
          } else {
            errorMsg = error.message;
          }
        }
      } catch (sbErr: any) {
        errorMsg = sbErr.message;
      }
    }

    if (deleted) {
      setPosts((prev) => prev.filter((p) => p.id !== id));
      setMessage({ text: 'Post deleted successfully from Supabase.', type: 'success' });
      setTimeout(() => setMessage(null), 3000);
    } else {
      setMessage({ text: errorMsg || 'Failed to delete post.', type: 'error' });
    }

    setDeletingPostId(null);
  };

  const sqlStatements = `-- ApexWire Supabase Database Schema
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Products Table
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

-- Posts Table (with Price, Category, and Affiliate Link)
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT DEFAULT 'Headphones',
  price TEXT,
  buy_now_link TEXT,
  affiliate_link TEXT,
  content TEXT NOT NULL,
  image_url TEXT,
  author_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- If posts table already exists, run this to add the affiliate_link column:
ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS price TEXT,
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS buy_now_link TEXT,
ADD COLUMN IF NOT EXISTS affiliate_link TEXT;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Products Policies
CREATE POLICY "Allow public read access on products"
  ON public.products FOR SELECT TO public USING (true);

CREATE POLICY "Allow authenticated admin insert products"
  ON public.products FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated admin update products"
  ON public.products FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated admin delete products"
  ON public.products FOR DELETE TO authenticated USING (true);

-- Posts Policies
CREATE POLICY "Allow public read access on posts"
  ON public.posts FOR SELECT TO public USING (true);

CREATE POLICY "Allow authenticated admin insert posts"
  ON public.posts FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated admin update posts"
  ON public.posts FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated admin delete posts"
  ON public.posts FOR DELETE TO authenticated USING (true);

-- =========================================================
-- Supabase Storage Bucket Setup: 'post-images'
-- =========================================================
-- 1. Create the public storage bucket for images
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-images', 'post-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Allow public read access to view uploaded images
CREATE POLICY "Public Read post-images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'post-images');

-- 3. Allow authenticated users (admin) to upload images
CREATE POLICY "Admin Insert post-images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'post-images');

-- 4. Allow authenticated users to update/replace images
CREATE POLICY "Admin Update post-images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'post-images');

-- 5. Allow authenticated users to delete images
CREATE POLICY "Admin Delete post-images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'post-images');`;

  const copySql = () => {
    navigator.clipboard.writeText(sqlStatements);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 flex flex-col font-sans">
      {/* Top Admin Header */}
      <header className="bg-neutral-950 border-b border-neutral-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToStore}
              className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-xs"
              title="Return to Public Storefront"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Storefront</span>
            </button>
            <div className="h-5 w-px bg-neutral-800"></div>
            <span className="font-bold text-white text-base tracking-tight flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-xs inline-block"></span>
              <span>ApexWire Admin</span>
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            {/* Supabase Status indicator */}
            <div className="hidden md:flex items-center gap-2 px-2.5 py-1 bg-neutral-800/80 border border-neutral-700 rounded-lg text-neutral-300">
              <Server className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                Supabase:{' '}
                <strong className={status?.supabaseConfigured ? 'text-emerald-400 font-medium' : 'text-amber-400 font-medium'}>
                  {status?.supabaseConfigured ? 'Connected (RLS Active)' : 'Preview Mode'}
                </strong>
              </span>
            </div>

            <div className="hidden sm:block text-neutral-400 truncate max-w-[180px]">
              {adminEmail}
            </div>

            <button
              onClick={onLogout}
              className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Sub-navigation tabs */}
      <div className="bg-neutral-950/60 border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 py-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'products'
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Products Management ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('posts')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'posts'
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Posts Management ({posts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('sql')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'sql'
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>SQL Schema & RLS Setup</span>
          </button>
        </div>
      </div>

      {/* Main Admin Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Flash Message Banner */}
        {message && (
          <div
            className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-xs ${
              message.type === 'success'
                ? 'bg-emerald-950/50 border-emerald-800 text-emerald-200'
                : 'bg-rose-950/50 border-rose-800 text-rose-200'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* ---------------- TAB 1: PRODUCTS MANAGEMENT ---------------- */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-white">Product Catalog & Affiliate Links</h2>
                <p className="text-xs text-neutral-400">
                  Update "Buy Now" links, prices, and coupon codes stored in Supabase table.
                </p>
              </div>
              <button
                onClick={fetchProducts}
                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs flex items-center gap-1.5 self-start cursor-pointer transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingProducts ? 'animate-spin' : ''}`} />
                <span>Refresh Products</span>
              </button>
            </div>

            <div className="bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-900 border-b border-neutral-800 text-neutral-400 uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Product</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Price</th>
                      <th className="py-3 px-4">Current "Buy Now" Affiliate Link</th>
                      <th className="py-3 px-4">Retailer / Coupon</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800 text-neutral-300">
                    {products.map((p) => {
                      const link = p.buy_now_link || p.affiliateLinks?.[0]?.link || '';
                      const retailer = p.retailer || p.affiliateLinks?.[0]?.retailer || 'Amazon';
                      const coupon = p.coupon_code || p.affiliateLinks?.[0]?.couponCode || '';

                      return (
                        <tr key={p.id} className="hover:bg-neutral-900/60 transition-colors">
                          {/* Title & Image */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={p.image_url || p.image}
                                alt={p.title}
                                referrerPolicy="no-referrer"
                                className="w-10 h-10 rounded-lg object-cover bg-neutral-800 border border-neutral-700 shrink-0"
                              />
                              <div>
                                <span className="text-[10px] text-neutral-500 font-semibold">{p.brand}</span>
                                <div className="font-bold text-white text-xs line-clamp-1 max-w-xs">{p.title}</div>
                              </div>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="py-3 px-4 text-neutral-400">{p.category}</td>

                          {/* Price */}
                          <td className="py-3 px-4 font-mono text-white font-semibold">
                            ${Number(p.price).toFixed(2)}
                          </td>

                          {/* Buy Now Link */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5 max-w-xs">
                              <span className="font-mono text-neutral-400 truncate text-[11px] bg-neutral-900 px-2 py-1 rounded border border-neutral-800">
                                {link}
                              </span>
                              <a
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-neutral-400 hover:text-white p-1"
                                title="Open link in new tab"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          </td>

                          {/* Retailer / Promo */}
                          <td className="py-3 px-4">
                            <div className="text-neutral-300 font-medium">{retailer}</div>
                            {coupon && (
                              <span className="font-mono text-[10px] text-emerald-400 font-semibold">
                                Code: {coupon}
                              </span>
                            )}
                          </td>

                          {/* Action: Edit */}
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => setEditingProduct(p)}
                              className="px-3 py-1.5 bg-white hover:bg-neutral-200 text-neutral-900 rounded-lg font-semibold text-xs transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>Edit Product</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ---------------- TAB 2: POSTS MANAGEMENT ---------------- */}
        {activeTab === 'posts' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-white">Editorial Posts & Buyer Guides</h2>
                <p className="text-xs text-neutral-400">
                  Manage posts stored in Supabase posts table with real-time deletion and publishing.
                </p>
              </div>
              <button
                onClick={() => setIsNewPostOpen(true)}
                className="px-4 py-2 bg-white hover:bg-neutral-200 text-neutral-900 rounded-xl font-semibold text-xs flex items-center gap-1.5 self-start cursor-pointer transition-colors shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Post</span>
              </button>
            </div>

            {posts.length === 0 ? (
              <div className="p-12 text-center bg-neutral-950 border border-neutral-800 rounded-2xl space-y-3">
                <FileText className="w-10 h-10 text-neutral-600 mx-auto" />
                <h3 className="font-bold text-white text-sm">No posts published yet</h3>
                <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                  Click "Add New Post" to publish an in-depth review, comparison guide, or lab update to the Supabase posts table.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="p-4 bg-neutral-950 border border-neutral-800 rounded-2xl flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-3">
                      <div className="relative rounded-xl overflow-hidden bg-neutral-900 aspect-16/9 border border-neutral-800">
                        <img
                          src={post.image_url}
                          alt={post.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="text-[11px] text-neutral-400 flex items-center gap-1.5">
                            {post.category && (
                              <>
                                <span className="font-semibold text-emerald-400">{post.category}</span>
                                <span>·</span>
                              </>
                            )}
                            <span>{new Date(post.created_at).toLocaleDateString()}</span>
                            <span>·</span>
                            <span className="text-neutral-400">Editorial Team</span>
                          </div>
                          {post.price && (
                            <span className="font-mono text-xs font-bold text-white bg-neutral-900 border border-neutral-700 px-2 py-0.5 rounded">
                              {post.price}
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-white text-base leading-snug">{post.title}</h4>
                        <p className="text-xs text-neutral-400 line-clamp-3 leading-relaxed">
                          {post.content}
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[11px] text-neutral-500 font-mono">ID: {post.id.slice(0, 8)}...</span>
                        {(post.affiliate_link || post.buy_now_link) && (
                          <a
                            href={post.affiliate_link || post.buy_now_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-amber-400 hover:text-amber-300 hover:underline flex items-center gap-0.5"
                            title="Open affiliate link in new tab"
                          >
                            <span>Link</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingPost(post)}
                          className="px-3.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Edit Post</span>
                        </button>
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          disabled={deletingPostId === post.id}
                          className="px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{deletingPostId === post.id ? 'Deleting...' : 'Delete'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ---------------- TAB 3: SQL SCHEMA & RLS SETUP ---------------- */}
        {activeTab === 'sql' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">Supabase SQL Schema & Row Level Security</h2>
              <p className="text-xs text-neutral-400 mt-1">
                Copy and run this SQL script directly in your Supabase Project &rarr; SQL Editor to initialize both tables with RLS policies.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Instructions Card */}
              <div className="p-5 bg-neutral-950 border border-neutral-800 rounded-2xl space-y-4">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Security & RLS Guarantee</span>
                </h3>
                <ul className="space-y-2.5 text-xs text-neutral-400 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0"></span>
                    <span>
                      <strong className="text-white">Public Read Access:</strong> Anyone can read products and posts without logging in.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0"></span>
                    <span>
                      <strong className="text-white">Protected Mutations:</strong> Only authenticated admin users can Insert, Update, or Delete data.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0"></span>
                    <span>
                      <strong className="text-white">Service Role Key Isolation:</strong> Highly privileged service key is kept exclusively on the server (`server.ts`).
                    </span>
                  </li>
                </ul>

                <div className="pt-2 border-t border-neutral-800 space-y-2 text-xs">
                  <div className="text-neutral-400 font-semibold">How to apply:</div>
                  <ol className="list-decimal pl-4 space-y-1 text-neutral-400 text-[11px]">
                    <li>Open your Supabase Dashboard</li>
                    <li>Click <strong>SQL Editor</strong> in the left sidebar</li>
                    <li>Click <strong>New Query</strong>, paste this script, and click <strong>Run</strong></li>
                  </ol>
                </div>
              </div>

              {/* SQL Code Box */}
              <div className="lg:col-span-2 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-300">schema.sql</span>
                  <button
                    onClick={copySql}
                    className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    {copiedSql ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied to Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Entire SQL</span>
                      </>
                    )}
                  </button>
                </div>

                <pre className="p-4 bg-neutral-950 border border-neutral-800 rounded-2xl text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-[500px] leading-relaxed">
                  {sqlStatements}
                </pre>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Edit Product Modal */}
      <EditProductModal
        product={editingProduct}
        onClose={() => setEditingProduct(null)}
        onSaveSuccess={handleProductSaved}
        authToken={authToken}
      />

      {/* Add New Post Modal */}
      <NewPostModal
        isOpen={isNewPostOpen}
        onClose={() => setIsNewPostOpen(false)}
        onPostCreated={handlePostCreated}
        authToken={authToken}
      />

      {/* Edit Post Modal */}
      <EditPostModal
        isOpen={Boolean(editingPost)}
        onClose={() => setEditingPost(null)}
        post={editingPost}
        onPostSaved={handlePostSaved}
        authToken={authToken}
      />
    </div>
  );
};
