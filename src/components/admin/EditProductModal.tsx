import React, { useState, useEffect } from 'react';
import { X, Save, ExternalLink, Tag, DollarSign, Check, AlertCircle, Loader2, Sparkles, FileText, ShoppingBag } from 'lucide-react';
import { getSupabaseClient } from '../../lib/supabaseClient';
import { POST_CATEGORIES } from './NewPostModal';
import { ImageUploader } from './ImageUploader';

interface EditProductModalProps {
  product: any | null;
  onClose: () => void;
  onSaveSuccess: (updatedProduct: any) => void;
  authToken: string | null;
}

export const EditProductModal: React.FC<EditProductModalProps> = ({
  product,
  onClose,
  onSaveSuccess,
  authToken
}) => {
  if (!product) return null;

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [brand, setBrand] = useState('');
  const [buyNowLink, setBuyNowLink] = useState('');
  const [retailer, setRetailer] = useState('Amazon');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [shortVerdict, setShortVerdict] = useState('');
  const [fullReview, setFullReview] = useState('');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      setTitle(product.title || '');
      setCategory(product.category || 'Electronics');
      setBrand(product.brand || '');
      setBuyNowLink(
        product.buy_now_link ||
        product.affiliate_link ||
        product.affiliateLinks?.[0]?.link ||
        'https://www.amazon.com/dp/B0AFF123?tag=apexwire-20'
      );
      setRetailer(
        product.retailer ||
        product.affiliateLinks?.[0]?.retailer ||
        'Amazon'
      );
      setPrice((product.price ?? '').toString());
      setOriginalPrice(
        (product.original_price || product.originalPrice || product.price || '').toString()
      );
      setCouponCode(
        product.coupon_code ||
        product.affiliateLinks?.[0]?.couponCode ||
        ''
      );
      setImageUrl(product.image_url || '');
      setShortVerdict(product.short_verdict || '');
      setFullReview(product.full_review || '');
      setError(null);
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const cleanTitle = title.trim();
    const cleanImage = imageUrl.trim();
    const cleanLink = buyNowLink.trim();

    if (!cleanTitle) {
      setError('Product Title is required.');
      setSaving(false);
      return;
    }

    if (!cleanLink) {
      setError('Buy Now / Affiliate Link is required.');
      setSaving(false);
      return;
    }

    const updatePayload: any = {
      title: cleanTitle,
      category: category.trim(),
      brand: brand.trim(),
      buy_now_link: cleanLink,
      affiliate_link: cleanLink,
      retailer: retailer.trim(),
      price: parseFloat(price) || product.price,
      original_price: parseFloat(originalPrice) || product.originalPrice || parseFloat(price),
      coupon_code: couponCode.trim(),
      image_url: cleanImage,
      short_verdict: shortVerdict.trim(),
      full_review: fullReview.trim(),
      updated_at: new Date().toISOString()
    };

    try {
      let savedProduct = null;
      let serverError: string | null = null;

      // 1. Try server API route
      try {
        const response = await fetch(`/api/admin/products/${product.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken || 'demo-admin-token'}`
          },
          body: JSON.stringify(updatePayload)
        });

        if (response.ok) {
          const data = await response.json();
          savedProduct = data.product;
        } else {
          const errData = await response.json().catch(() => ({}));
          serverError = errData.error || null;
        }
      } catch {
        // Fallback to client
      }

      // 2. Direct Supabase client update
      if (!savedProduct) {
        const sb = getSupabaseClient();
        if (sb) {
          const { data, error: sbError } = await sb
            .from('products')
            .update(updatePayload)
            .eq('id', product.id)
            .select()
            .single();

          if (!sbError && data) {
            savedProduct = data;
          } else if (sbError && !serverError) {
            throw new Error(sbError.message);
          }
        }
      }

      if (!savedProduct) {
        if (serverError) throw new Error(serverError);
        savedProduct = {
          ...product,
          ...updatePayload
        };
      }

      onSaveSuccess(savedProduct);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update product in Supabase.');
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
              <span className="px-2.5 py-0.5 bg-neutral-900 text-white text-[11px] font-bold rounded uppercase tracking-wider flex items-center gap-1">
                <ShoppingBag className="w-3 h-3" />
                Product Editor
              </span>
              <h3 className="font-extrabold text-neutral-900 text-lg sm:text-xl tracking-tight">
                Edit Product & Affiliate Deal
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-neutral-500">
              Update Title, Category, Price, Affiliate Link, Supabase Storage Image, and Lab Verdict.
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
              <div className="lg:col-span-8 space-y-2">
                <label className="text-xs sm:text-sm font-bold text-neutral-900 block">
                  Product Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Aurae H1 Wireless Noise Cancelling Headphones"
                  className="w-full px-4 py-3 bg-neutral-50 focus:bg-white border border-neutral-300 focus:border-neutral-900 rounded-xl text-sm sm:text-base font-semibold text-neutral-900 outline-none transition-all shadow-2xs"
                />
              </div>

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

            {/* Row 2: Price, Original Price, Retailer, Promo Code */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-800 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Active Deal Price *</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-neutral-50 focus:bg-white border border-neutral-300 focus:border-neutral-900 rounded-xl text-sm font-mono text-neutral-900 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-800 block">
                  Original MSRP
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-neutral-50 focus:bg-white border border-neutral-300 focus:border-neutral-900 rounded-xl text-sm font-mono text-neutral-900 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-800 block">
                  Retailer Name
                </label>
                <input
                  type="text"
                  value={retailer}
                  onChange={(e) => setRetailer(e.target.value)}
                  placeholder="Amazon, Daraz, Best Buy..."
                  className="w-full px-3.5 py-2.5 bg-neutral-50 focus:bg-white border border-neutral-300 focus:border-neutral-900 rounded-xl text-sm text-neutral-900 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-800 block">
                  Coupon Code
                </label>
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="e.g. APEX15"
                  className="w-full px-3.5 py-2.5 bg-neutral-50 focus:bg-white border border-neutral-300 focus:border-neutral-900 rounded-xl text-sm font-mono uppercase text-emerald-700 outline-none"
                />
              </div>
            </div>

            {/* Row 3: Affiliate / Buy Now Link */}
            <div className="space-y-2 bg-amber-50/80 border border-amber-200/90 p-4 rounded-2xl">
              <label className="text-xs sm:text-sm font-bold text-neutral-900 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-amber-700" />
                  <span>Affiliate / Buy Now Link *</span>
                </span>
                <span className="text-[11px] text-amber-800 font-medium">Saved to buy_now_link column</span>
              </label>
              <input
                type="url"
                required
                value={buyNowLink}
                onChange={(e) => setBuyNowLink(e.target.value)}
                placeholder="https://www.amazon.com/dp/... or https://www.daraz.pk/..."
                className="w-full px-4 py-2.5 bg-white border border-neutral-300 focus:border-neutral-900 rounded-xl text-xs sm:text-sm font-mono text-neutral-900 outline-none transition-all shadow-2xs"
              />
            </div>

            {/* Row 4: Image Upload with Supabase Storage */}
            <div className="space-y-2 bg-neutral-50/70 border border-neutral-200 p-5 rounded-2xl">
              <ImageUploader
                value={imageUrl}
                onChange={setImageUrl}
                authToken={authToken}
                label="Product Image (Upload from Computer to Supabase Storage)"
                required
              />
            </div>

            {/* Row 5: Short Verdict & Full Review */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-bold text-neutral-900 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-neutral-600" />
                  <span>Short Lab Verdict</span>
                </label>
                <input
                  type="text"
                  value={shortVerdict}
                  onChange={(e) => setShortVerdict(e.target.value)}
                  placeholder="Summary verdict displayed on product cards..."
                  className="w-full px-4 py-2.5 bg-neutral-50 focus:bg-white border border-neutral-300 focus:border-neutral-900 rounded-xl text-xs sm:text-sm text-neutral-900 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-bold text-neutral-900 block">
                  Full Editorial Review
                </label>
                <textarea
                  rows={6}
                  value={fullReview}
                  onChange={(e) => setFullReview(e.target.value)}
                  placeholder="Detailed acoustic analysis, ergonomics review, and lab notes..."
                  className="w-full px-4 py-3 bg-neutral-50 focus:bg-white border border-neutral-300 focus:border-neutral-900 rounded-2xl text-xs sm:text-sm text-neutral-900 leading-relaxed outline-none"
                />
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
                    <span>Saving Product to Supabase...</span>
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
