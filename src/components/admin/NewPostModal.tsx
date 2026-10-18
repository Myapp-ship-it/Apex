import React, { useState } from 'react';
import { X, Plus, Image as ImageIcon, FileText, AlertCircle, DollarSign, Tag } from 'lucide-react';
import { getSupabaseClient } from '../../lib/supabaseClient';

interface NewPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: (post: any) => void;
  authToken: string | null;
}

export const POST_CATEGORIES = [
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
  const [category, setCategory] = useState<string>('Headphones');
  const [price, setPrice] = useState('');
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

    const newPostPayload = {
      title: title.trim(),
      category: category.trim(),
      price: price.trim(),
      content: content.trim(),
      image_url: imageUrl.trim(),
      author_email: localStorage.getItem('apexwire_admin_email') || 'admin@apexwire.internal',
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
          const { data, error: sbError } = await sb
            .from('posts')
            .insert([newPostPayload])
            .select()
            .single();

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-neutral-950/75 backdrop-blur-xs">
      <div
        className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-neutral-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-neutral-900 text-sm">Add New Review / Article Post</h3>
            <p className="text-[11px] text-neutral-500">Inserts record into Supabase posts table</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-900 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
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
                placeholder="e.g. Best Noise Cancelling Headphones of 2026: Lab Tested"
                className="w-full px-3 py-2.5 bg-neutral-50 focus:bg-white border border-neutral-300 focus:border-neutral-900 rounded-xl text-xs font-semibold text-neutral-900 outline-none transition-all"
              />
            </div>

            {/* Category Dropdown & Price Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Category Dropdown */}
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
                </select>
              </div>

              {/* Price Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-800 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Price (USD or PKR) *</span>
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

            {/* Image URL with preset selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-800 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-neutral-500" />
                <span>Featured Image URL *</span>
              </label>
              <input
                type="text"
                required
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://... or /src/assets/images/..."
                className="w-full px-3 py-2 bg-neutral-50 focus:bg-white border border-neutral-300 focus:border-neutral-900 rounded-xl text-xs font-mono text-neutral-900 outline-none"
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[10px] text-neutral-500 self-center">Presets:</span>
                {presetImages.map((img) => (
                  <button
                    key={img.label}
                    type="button"
                    onClick={() => setImageUrl(img.url)}
                    className="text-[10px] px-2 py-0.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded cursor-pointer transition-colors"
                  >
                    {img.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-800 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-neutral-500" />
                <span>Article / Review Content *</span>
              </label>
              <textarea
                required
                rows={5}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your editorial review, buyer guide breakdown, or lab notes..."
                className="w-full px-3 py-2.5 bg-neutral-50 focus:bg-white border border-neutral-300 focus:border-neutral-900 rounded-xl text-xs text-neutral-900 leading-relaxed outline-none"
              ></textarea>
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
                  <span>Publishing to Supabase...</span>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
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
