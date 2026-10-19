import React, { useState } from 'react';
import { X, Plus, FileText, AlertCircle, DollarSign, Tag, Loader2, Sparkles } from 'lucide-react';
import { getSupabaseClient } from '../../lib/supabaseClient';
import { ImageUploader } from './ImageUploader';

interface NewPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: (post: any) => void;
  authToken: string | null;
}

export const POST_CATEGORIES = [
  'Electronics',
  'Mobile',
  'Mobile Accessories',
  'Headphones',
  'Audio Acoustics',
  'Desk Ergonomics',
  'Mechanical Keyboards',
  'Coffee Craft',
  'Travel & EDC Gear'
] as const;

export const NewPostModal: React.FC<NewPostModalProps> = ({
  isOpen,
  onClose,
  onPostCreated,
  authToken
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<string>('Electronics');
  const [price, setPrice] = useState('');
  const [affiliateLink, setAffiliateLink] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('/src/assets/images/hero_curated_workspace_1792241538519.jpg');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const presetImages = [
    { label: 'Workspace & Studio', url: '/src/assets/images/hero_curated_workspace_1792241538519.jpg' },
    { label: 'Audio Acoustics', url: '/src/assets/images/product_headphones_pro_1792241538646.jpg' },
    { label: 'Desk Ergonomics', url: '/src/assets/images/product_ergonomic_chair_1792241540323.jpg' },
    { label: 'Mechanical Keyboards', url: '/src/assets/images/product_keyboard_studio_1792241539698.jpg' },
    { label: 'Coffee Craft', url: '/src/assets/images/product_espresso_machine_1792241540159.jpg' },
    { label: 'Travel & EDC Gear', url: '/src/assets/images/product_travel_backpack_1792241539966.jpg' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const cleanTitle = title.trim();
    const cleanImage = imageUrl.trim();
    const cleanContent = content.trim();
    const cleanCategory = category.trim();
    const cleanPrice = price.trim();
    const cleanLink = affiliateLink.trim();

    if (!cleanTitle) {
      setError('Post Title is required.');
      setSaving(false);
      return;
    }

    if (!cleanImage) {
      setError('Please upload an image or select a preset.');
      setSaving(false);
      return;
    }

    const newPostPayload: any = {
      title: cleanTitle,
      category: cleanCategory,
      price: cleanPrice,
      affiliate_link: cleanLink,
      buy_now_link: cleanLink,
      content: cleanContent,
      image_url: cleanImage,
      author_email: 'Editorial Team',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    try {
      let createdPost = null;
      let serverError: string | null = null;

      try {
        const response = await fetch('/api/admin/posts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken || 'demo-admin-token'}`
          },
          body: JSON.stringify(newPostPayload)
        });

        if (response.ok) {
          const data = await response.json();
          createdPost = data.post;
        } else {
          const errData = await response.json().catch(() => ({}));
          serverError = errData.error || null;
        }
      } catch {
        // Server unreachable (e.g. static Cloudflare Pages hosting)
      }

      // If server wasn't available or returned error, try direct Supabase client (using authenticated RLS)
      if (!createdPost) {
        const sb = getSupabaseClient();
        if (sb) {
          let insertData = { ...newPostPayload };
          let { data, error: sbError } = await sb
            .from('posts')
            .insert([insertData])
            .select()
            .single();

          // Resilient fallback: if the database hasn't added affiliate_link yet or only has buy_now_link
          if (sbError && sbError.message && (sbError.message.includes('affiliate_link') || sbError.message.includes('buy_now_link'))) {
            if (sbError.message.includes('affiliate_link')) {
              delete insertData.affiliate_link;
            } else {
              delete insertData.buy_now_link;
            }
            const retry = await sb.from('posts').insert([insertData]).select().single();
            data = retry.data;
            sbError = retry.error;
          }

          if (!sbError && data) {
            createdPost = data;
          } else if (sbError && !serverError) {
            throw new Error(sbError.message);
          }
        }
      }

      if (!createdPost) {
        if (serverError) throw new Error(serverError);
        // Fallback for preview mode
        createdPost = {
          id: `post-${Date.now()}`,
          ...newPostPayload
        };
      }

      onPostCreated(createdPost);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error inserting post.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-neutral-950/80 backdrop-blur-xs overflow-y-auto">
      <div
        className="bg-white rounded-3xl max-w-4xl lg:max-w-5xl w-full shadow-2xl border border-neutral-200 overflow-hidden my-auto transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 sm:px-8 sm:py-6 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/60">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-emerald-600 text-white text-[11px] font-bold rounded uppercase tracking-wider">
                Create Post
              </span>
              <h3 className="font-extrabold text-neutral-900 text-lg sm:text-xl tracking-tight">
                Add New Review & Editorial Guide
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-neutral-500">
              Publish directly to the Supabase posts table with dynamic affiliate link and image upload.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-colors cursor-pointer"
            title="Close editor"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-sm text-rose-800 animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block">Submission Error:</strong>
                <span>{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Row 1: Title and Category */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Title (Span 8) */}
              <div className="lg:col-span-8 space-y-2">
                <label className="text-xs sm:text-sm font-bold text-neutral-900 block">
                  Post Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Best Noise Cancelling Headphones of 2026: Lab Tested"
                  className="w-full px-4 py-3 bg-neutral-50 focus:bg-white border border-neutral-300 focus:border-neutral-900 rounded-xl text-sm sm:text-base font-semibold text-neutral-900 outline-none transition-all shadow-2xs"
                />
              </div>

              {/* Category Dropdown (Span 4) */}
              <div className="lg:col-span-4 space-y-2">
                <label className="text-xs sm:text-sm font-bold text-neutral-900 flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-neutral-600" />
                  <span>Category *</span>
                </label>
                <select
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-50 focus:bg-white border border-neutral-300 focus:border-neutral-900 rounded-xl text-sm sm:text-base text-neutral-900 font-semibold outline-none transition-all cursor-pointer shadow-2xs"
                >
                  {POST_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 2: Price and Affiliate / Buy Now Link */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Price (Span 4) */}
              <div className="lg:col-span-4 space-y-2">
                <label className="text-xs sm:text-sm font-bold text-neutral-900 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-neutral-600" />
                  <span>Price (USD or PKR) *</span>
                </label>
                <input
                  type="text"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g. $349.99 or PKR 85,000"
                  className="w-full px-4 py-3 bg-neutral-50 focus:bg-white border border-neutral-300 focus:border-neutral-900 rounded-xl text-sm sm:text-base font-mono text-neutral-900 outline-none transition-all shadow-2xs"
                />
              </div>

              {/* Affiliate / Buy Now Link (Span 8) */}
              <div className="lg:col-span-8 space-y-2 bg-amber-50/80 border border-amber-200/90 p-4 rounded-2xl">
                <label className="text-xs sm:text-sm font-bold text-neutral-900 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-amber-700" />
                    <span>Affiliate / Buy Now Link *</span>
                  </span>
                  <span className="text-[11px] text-amber-800 font-medium">Saved to Supabase affiliate_link</span>
                </label>
                <input
                  type="url"
                  required
                  value={affiliateLink}
                  onChange={(e) => setAffiliateLink(e.target.value)}
                  placeholder="Paste your Daraz, Amazon, or store link (e.g., https://www.daraz.pk/... or https://www.amazon.com/dp/...)"
                  className="w-full px-4 py-2.5 bg-white border border-neutral-300 focus:border-neutral-900 rounded-xl text-xs sm:text-sm font-mono text-neutral-900 outline-none transition-all shadow-2xs"
                />
                <p className="text-[11px] sm:text-xs text-neutral-600">
                  Paste your dynamic affiliate link here. Readers clicking <strong>Buy Now</strong> on the review will be directed to this link.
                </p>
              </div>
            </div>

            {/* Row 3: Image Upload using Supabase Storage */}
            <div className="space-y-2 bg-neutral-50/70 border border-neutral-200 p-5 rounded-2xl">
              <ImageUploader
                value={imageUrl}
                onChange={setImageUrl}
                authToken={authToken}
                label="Featured Image (Upload from Computer to Supabase Storage)"
                required
              />
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-neutral-200/60 mt-3">
                <span className="text-xs text-neutral-500 font-medium">Or quick studio presets:</span>
                {presetImages.map((img) => (
                  <button
                    key={img.label}
                    type="button"
                    onClick={() => setImageUrl(img.url)}
                    className="text-xs px-2.5 py-1 bg-white hover:bg-neutral-200 text-neutral-700 border border-neutral-200 rounded-lg cursor-pointer transition-colors"
                  >
                    {img.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Row 4: Article / Review Content */}
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-bold text-neutral-900 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-neutral-600" />
                <span>Article / Review Content *</span>
              </label>
              <textarea
                required
                rows={8}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your editorial review, buyer guide breakdown, or lab notes..."
                className="w-full px-4 py-3 bg-neutral-50 focus:bg-white border border-neutral-300 focus:border-neutral-900 rounded-2xl text-sm sm:text-base text-neutral-900 leading-relaxed outline-none transition-all shadow-2xs font-normal"
              />
              <div className="flex items-center justify-between text-xs text-neutral-400 px-1">
                <span>Markdown formatting supported.</span>
                <span>{content.length} characters</span>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-4 flex items-center justify-end gap-3 border-t border-neutral-100">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-semibold text-neutral-700 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-7 py-3 text-sm font-bold text-white bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-400 rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-98"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Publishing to Supabase...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Publish Post</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
