import React, { useState, useEffect } from 'react';
import { X, Check, FileText, AlertCircle, DollarSign, Tag, ExternalLink } from 'lucide-react';
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
  const [category, setCategory] = useState<string>('Headphones');
  const [price, setPrice] = useState('');
  const [affiliateLink, setAffiliateLink] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (post) {
      setTitle(post.title || '');
      setCategory(post.category || 'Headphones');
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

    const cleanLink = affiliateLink.trim();
    const updatedData: any = {
      title: title.trim(),
      category: category.trim(),
      price: price.trim(),
      affiliate_link: cleanLink,
      buy_now_link: cleanLink,
      content: content.trim(),
      image_url: imageUrl.trim(),
      author_email: 'Editorial Team',
      updated_at: new Date().toISOString()
    };

    try {
      let saved = false;

      // 1. Try server API route
      try {
        const response = await fetch(`/api/admin/posts/${post.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken || 'demo-admin-token'}`
          },
          body: JSON.stringify(updatedData)
        });

        if (response.ok) {
          saved = true;
        }
      } catch {
        // Fallback to direct client
      }

      // 2. Direct Supabase update using client (RLS policy for authenticated)
      if (!saved) {
        const sb = getSupabaseClient();
        if (sb) {
          let updatePayload = { ...updatedData };
          let { error: sbError } = await sb
            .from('posts')
            .update(updatePayload)
            .eq('id', post.id);

          // Column fallback if table does not yet have affiliate_link column
          if (sbError && sbError.message && (sbError.message.includes('affiliate_link') || sbError.message.includes('buy_now_link'))) {
            if (sbError.message.includes('affiliate_link')) {
              delete updatePayload.affiliate_link;
            } else {
              delete updatePayload.buy_now_link;
            }
            const retry = await sb.from('posts').update(updatePayload).eq('id', post.id);
            sbError = retry.error;
          }

          if (!sbError) {
            saved = true;
          } else {
            console.warn('Supabase direct update error:', sbError);
          }
        }
      }

      onPostSaved({
        ...post,
        ...updatedData
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update post.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-neutral-950/75 backdrop-blur-xs">
      <div
        className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-neutral-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-neutral-900 text-sm">Edit Article & Affiliate Link</h3>
            <p className="text-[11px] text-neutral-500">Update fields in the Supabase posts table</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-900 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-800 block">
                Post Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2.5 bg-neutral-50 focus:bg-white border border-neutral-300 focus:border-neutral-900 rounded-xl text-xs font-semibold text-neutral-900 outline-none transition-all"
              />
            </div>

            {/* Category & Price */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-800 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Category *</span>
                </label>
                <select
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 bg-neutral-50 focus:bg-white border border-neutral-300 focus:border-neutral-900 rounded-xl text-xs text-neutral-900 font-medium outline-none transition-all cursor-pointer"
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

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-800 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Price (USD / PKR) *</span>
                </label>
                <input
                  type="text"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g. $349.99 or PKR 85,000"
                  className="w-full px-3 py-2.5 bg-neutral-50 focus:bg-white border border-neutral-300 focus:border-neutral-900 rounded-xl text-xs font-mono text-neutral-900 outline-none transition-all"
                />
              </div>
            </div>

            {/* Affiliate / Buy Now Link */}
            <div className="space-y-1.5 bg-amber-50/60 border border-amber-200/80 p-3.5 rounded-xl">
              <label className="text-xs font-bold text-neutral-900 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-amber-700" />
                  <span>Affiliate / Buy Now Link *</span>
                </span>
                <span className="text-[10px] text-amber-800 font-medium">Saved to affiliate_link column</span>
              </label>
              <input
                type="url"
                required
                value={affiliateLink}
                onChange={(e) => setAffiliateLink(e.target.value)}
                placeholder="Paste your Daraz, Amazon, or store link (e.g., https://www.daraz.pk/... or https://www.amazon.com/dp/...)"
                className="w-full px-3 py-2.5 bg-white border border-neutral-300 focus:border-neutral-900 rounded-lg text-xs font-mono text-neutral-900 outline-none"
              />
              <p className="text-[11px] text-neutral-600">
                When readers click "Buy Now" on the post card or full review page, they will be taken to this link.
              </p>
            </div>

            {/* Featured Image Upload with Supabase Storage */}
            <div className="space-y-1.5">
              <ImageUploader
                value={imageUrl}
                onChange={setImageUrl}
                authToken={authToken}
                label="Featured Image (Upload from Computer)"
                required
              />
            </div>

            {/* Content */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-800 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-neutral-500" />
                <span>Article / Review Content *</span>
              </label>
              <textarea
                required
                rows={6}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-3 py-2.5 bg-neutral-50 focus:bg-white border border-neutral-300 focus:border-neutral-900 rounded-xl text-xs text-neutral-900 leading-relaxed outline-none"
              />
            </div>

            {/* Actions */}
            <div className="pt-3 flex items-center justify-end gap-2 border-t border-neutral-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-neutral-700 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-400 rounded-xl transition-all shadow flex items-center gap-1.5 cursor-pointer active:scale-98"
              >
                {saving ? (
                  <span>Saving to Supabase...</span>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
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
