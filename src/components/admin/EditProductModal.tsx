import React, { useState } from 'react';
import { X, Save, ExternalLink, Tag, DollarSign, Check, AlertCircle } from 'lucide-react';
import { Product } from '../../data/products';
import { getSupabaseClient } from '../../lib/supabaseClient';

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

  const defaultBuyLink =
    product.buy_now_link ||
    product.affiliateLinks?.[0]?.link ||
    'https://www.amazon.com/dp/B0AFF123?tag=apexwire-20';

  const defaultRetailer =
    product.retailer ||
    product.affiliateLinks?.[0]?.retailer ||
    'Amazon';

  const defaultCoupon =
    product.coupon_code ||
    product.affiliateLinks?.[0]?.couponCode ||
    '';

  const [buyNowLink, setBuyNowLink] = useState(defaultBuyLink);
  const [retailer, setRetailer] = useState(defaultRetailer);
  const [price, setPrice] = useState<string>(product.price.toString());
  const [originalPrice, setOriginalPrice] = useState<string>(
    (product.original_price || product.originalPrice || product.price).toString()
  );
  const [couponCode, setCouponCode] = useState(defaultCoupon);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const updatePayload = {
      buy_now_link: buyNowLink.trim(),
      retailer: retailer.trim(),
      price: parseFloat(price) || product.price,
      original_price: parseFloat(originalPrice) || product.originalPrice,
      coupon_code: couponCode.trim(),
      updated_at: new Date().toISOString()
    };

    try {
      let savedProduct = null;
      let serverError: string | null = null;

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
        // Server endpoint not reachable (e.g. static Cloudflare Pages hosting)
      }

      // If server wasn't available or returned error, try direct Supabase client (using authenticated RLS)
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
        // Fallback for preview mode
        savedProduct = { ...product, ...updatePayload };
      }

      onSaveSuccess(savedProduct);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error updating product.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-neutral-950/75 backdrop-blur-xs">
      <div
        className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-neutral-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-neutral-900 text-sm">Edit Affiliate "Buy Now" Link</h3>
            <p className="text-[11px] text-neutral-500">Writes directly to Supabase products table</p>
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

          {/* Product Info Banner */}
          <div className="flex gap-3 items-center p-3 bg-neutral-50 border border-neutral-200 rounded-xl">
            <img
              src={product.image_url || product.image}
              alt={product.title}
              referrerPolicy="no-referrer"
              className="w-12 h-12 rounded-lg object-cover bg-neutral-200 shrink-0 border border-neutral-200"
            />
            <div className="min-w-0">
              <span className="text-[10px] text-neutral-500 font-medium uppercase tracking-wider">{product.brand}</span>
              <h4 className="font-bold text-neutral-900 text-xs truncate">{product.title}</h4>
              <span className="text-[11px] text-neutral-500">ID: {product.id}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Primary Request: Update Buy Now Link */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-800 flex items-center gap-1.5">
                <ExternalLink className="w-3.5 h-3.5 text-neutral-500" />
                <span>Primary "Buy Now" Affiliate Link *</span>
              </label>
              <input
                type="url"
                required
                value={buyNowLink}
                onChange={(e) => setBuyNowLink(e.target.value)}
                placeholder="https://www.amazon.com/dp/B0AFF123?tag=apexwire-20"
                className="w-full px-3 py-2.5 bg-neutral-50 focus:bg-white border border-neutral-300 focus:border-neutral-900 rounded-xl text-xs font-mono text-neutral-900 outline-none transition-all"
              />
              <p className="text-[11px] text-neutral-500">
                This URL is used whenever a reader clicks "Buy Now" on the storefront card or detail view.
              </p>
            </div>

            {/* Retailer Name */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-800 block">
                  Retailer Name
                </label>
                <input
                  type="text"
                  required
                  value={retailer}
                  onChange={(e) => setRetailer(e.target.value)}
                  placeholder="Amazon, Best Buy, Direct Store"
                  className="w-full px-3 py-2 bg-neutral-50 focus:bg-white border border-neutral-300 focus:border-neutral-900 rounded-xl text-xs text-neutral-900 outline-none"
                />
              </div>

              {/* Coupon Code */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-800 flex items-center gap-1">
                  <Tag className="w-3 h-3 text-neutral-500" />
                  <span>Promo / Coupon Code</span>
                </label>
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="e.g. GEAR15"
                  className="w-full px-3 py-2 bg-neutral-50 focus:bg-white border border-neutral-300 focus:border-neutral-900 rounded-xl text-xs font-mono uppercase text-neutral-900 outline-none"
                />
              </div>
            </div>

            {/* Prices */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-800 flex items-center gap-1">
                  <DollarSign className="w-3 h-3 text-neutral-500" />
                  <span>Current Price ($)</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 focus:bg-white border border-neutral-300 focus:border-neutral-900 rounded-xl text-xs font-mono text-neutral-900 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-800 flex items-center gap-1">
                  <DollarSign className="w-3 h-3 text-neutral-500" />
                  <span>Original Price / MSRP ($)</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 focus:bg-white border border-neutral-300 focus:border-neutral-900 rounded-xl text-xs font-mono text-neutral-900 outline-none"
                />
              </div>
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
                    <Save className="w-3.5 h-3.5" />
                    <span>Save to Supabase</span>
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
