import React, { useState, useEffect } from 'react';
import { X, Check, FileText, AlertCircle, DollarSign, Tag, ExternalLink, Sparkles, Save, Loader2 } from 'lucide-react';
import { getSupabaseClient } from '../../lib/supabaseClient';
import { POST_CATEGORIES } from './NewPostModal';
import { ImageUploader } from './ImageUploader';

interface EditPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: any | null;
  onPostSaved: (updatedPost: any) => void;
  authToken: string | null;
}

export const EditPostModal: React.FC<EditPostModalProps> = ({
  isOpen,
  onClose,
  post,
  onPostSaved,
  authToken
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<string>('Electronics');
  const [price, setPrice] = useState('');
  const [affiliateLink, setAffiliateLink] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (post) {
      setTitle(post.title || '');
      setCategory(post.category || 'Electronics');
      setPrice(post.price || '');
      setAffiliateLink(post.affiliate_link || post.buy_now_link || '');
      setContent(post.content || '');
      setImageUrl(post.image_url || '');
      setError(null);
    }
  }, [post]);

  if (!isOpen || !post) return null;

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
      setError('Please upload an image or provide an image URL.');
      setSaving(false);
      return;
    }

    const updatedData: any = {
      id: post.id,
      title: cleanTitle,
      image_url: cleanImage,
      category: cleanCategory,
      price: cleanPrice,
      affiliate_link: cleanLink,
      buy_now_link: cleanLink,
      content: cleanContent,
      author_email: post.author_email || 'Editorial Team',
      updated_at: new Date().toISOString()
    };

    try {
      let saved = false;
      let errorMessage: string | null = null;

      // 1. Try server API route first (uses Supabase service-role admin key)
      try {
        const response = await fetch(`/api/admin/posts/${post.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken || 'demo-admin-token'}`
          },
          body: JSON.stringify({
            title: cleanTitle,
            image_url: cleanImage,
            category: cleanCategory,
            price: cleanPrice,
            affiliate_link: cleanLink,
            buy_now_link: cleanLink,
            content: cleanContent
          })
        });

        if (response.ok) {
          const resData = await response.json();
          if (resData.post) {
            updatedData.title = resData.post.title || updatedData.title;
            updatedData.image_url = resData.post.image_url || updatedData.image_url;
            updatedData.category = resData.post.category || updatedData.category;
            updatedData.price = resData.post.price || updatedData.price;
            updatedData.affiliate_link = resData.post.affiliate_link || updatedData.affiliate_link;
            updatedData.buy_now_link = resData.post.buy_now_link || updatedData.buy_now_link;
            updatedData.content = resData.post.content || updatedData.content;
          }
          saved = true;
        } else {
          const errData = await response.json().catch(() => ({}));
          errorMessage = errData.error || null;
        }
      } catch (netErr) {
        // Server unreachable or static hosting
      }

      // 2. Direct Supabase update using client (ensures title and image_url are updated in database)
      const sb = getSupabaseClient();
      if (sb) {
        try {
          let updatePayload: any = {
            title: cleanTitle,
            image_url: cleanImage,
            content: cleanContent,
            category: cleanCategory,
            price: cleanPrice,
            affiliate_link: cleanLink,
            buy_now_link: cleanLink,
            updated_at: new Date().toISOString()
          };

          let { data, error: sbError } = await sb
            .from('posts')
            .update(updatePayload)
            .eq('id', post.id)
            .select();

          // Resilient fallback if table does not yet have affiliate_link column
          if (sbError && sbError.message && (sbError.message.includes('affiliate_link') || sbError.message.includes('buy_now_link'))) {
            if (sbError.message.includes('affiliate_link')) {
              delete updatePayload.affiliate_link;
            } else {
              delete updatePayload.buy_now_link;
            }
            const retry = await sb
              .from('posts')
              .update(updatePayload)
              .eq('id', post.id)
              .select();
            data = retry.data;
            sbError = retry.error;
          }

          if (!sbError && data && data.length > 0) {
            saved = true;
            const savedRow = data[0];
            updatedData.title = savedRow.title || updatedData.title;
            updatedData.image_url = savedRow.image_url || updatedData.image_url;
          } else if (sbError) {
            console.warn('[Supabase Client Update Warning]', sbError);
            if (!saved) {
              errorMessage = sbError.message;
            }
          }
        } catch (sbEx: any) {
          console.warn('[Supabase Exception]', sbEx);
        }
      }

      if (!saved && errorMessage) {
        throw new Error(errorMessage);
      }

      onPostSaved(updatedData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update post in Supabase.');
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
              <span className="px-2.5 py-0.5 bg-neutral-900 text-white text-[11px] font-bold rounded uppercase tracking-wider">
                Full Edit Form
              </span>
              <h3 className="font-extrabold text-neutral-900 text-lg sm:text-xl tracking-tight">
                Edit Post & Article Details
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-neutral-500">
              Update Title, Category, Price, Affiliate Link, Supabase Storage Image, and Review Content.
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
                <strong className="font-semibold block">Update Error:</strong>
                <span>{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Row 1: Title and Category */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Post Title (Span 8) */}
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
                  {category && !(POST_CATEGORIES as readonly string[]).includes(category) && (
                    <option value={category}>{category}</option>
                  )}
                </select>
              </div>
            </div>

            {/* Row 2: Price and Affiliate / Buy Now Link */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Price (Span 4) */}
              <div className="lg:col-span-4 space-y-2">
                <label className="text-xs sm:text-sm font-bold text-neutral-900 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-neutral-600" />
                  <span>Price (USD / PKR) *</span>
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
                  placeholder="Paste your Daraz, Amazon, or retailer link (e.g., https://www.daraz.pk/... or https://www.amazon.com/dp/...)"
                  className="w-full px-4 py-2.5 bg-white border border-neutral-300 focus:border-neutral-900 rounded-xl text-xs sm:text-sm font-mono text-neutral-900 outline-none transition-all shadow-2xs"
                />
                <p className="text-[11px] sm:text-xs text-neutral-600">
                  When readers click <strong>"Buy Now"</strong> on the review page, they are directed to this dynamic affiliate link.
                </p>
              </div>
            </div>

            {/* Row 3: Featured Image Upload using Supabase Storage */}
            <div className="space-y-2 bg-neutral-50/70 border border-neutral-200 p-5 rounded-2xl">
              <ImageUploader
                value={imageUrl}
                onChange={setImageUrl}
                authToken={authToken}
                label="Featured Image (Upload from Computer to Supabase Storage)"
                required
              />
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
                placeholder="Write your in-depth review, lab testing notes, pros/cons breakdown, and verdict..."
                className="w-full px-4 py-3 bg-neutral-50 focus:bg-white border border-neutral-300 focus:border-neutral-900 rounded-2xl text-sm sm:text-base text-neutral-900 leading-relaxed outline-none transition-all shadow-2xs font-normal"
              />
              <div className="flex items-center justify-between text-xs text-neutral-400 px-1">
                <span>Markdown formatting and paragraphs supported.</span>
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
                    <span>Saving to Supabase...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Changes in Supabase</span>
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
