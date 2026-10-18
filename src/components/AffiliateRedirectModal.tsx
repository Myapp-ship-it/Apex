import React, { useState } from 'react';
import { X, ExternalLink, Copy, Check, ShieldCheck, Tag, ShoppingBag } from 'lucide-react';
import { Product, AffiliateLink } from '../data/products';

interface AffiliateRedirectModalProps {
  product: Product | null;
  onClose: () => void;
}

export const AffiliateRedirectModal: React.FC<AffiliateRedirectModalProps> = ({
  product,
  onClose
}) => {
  const [selectedLinkIndex, setSelectedLinkIndex] = useState(0);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!product) return null;

  const currentLink: AffiliateLink = product.affiliateLinks[selectedLinkIndex] || product.affiliateLinks[0];

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2200);
  };

  const handleOpenRetailer = (link: string) => {
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-neutral-950/70 backdrop-blur-xs animate-fadeIn">
      <div
        className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-neutral-200 animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-neutral-900" />
            <h3 className="font-bold text-neutral-900 text-sm">Verified Partner Deal</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-900 rounded-lg transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product Preview */}
        <div className="p-6 space-y-5">
          <div className="flex gap-4 items-center">
            <img
              src={product.image}
              alt={product.title}
              referrerPolicy="no-referrer"
              className="w-20 h-20 rounded-xl object-cover border border-neutral-200 shrink-0 bg-neutral-100"
            />
            <div className="space-y-1">
              <span className="text-xs text-neutral-500 font-medium">{product.brand}</span>
              <h4 className="font-bold text-neutral-900 text-sm leading-snug line-clamp-2">
                {product.title}
              </h4>
              <div className="flex items-baseline gap-2">
                <span className="font-mono-data text-xl font-bold text-neutral-900">
                  ${currentLink.price.toFixed(2)}
                </span>
                {currentLink.originalPrice && currentLink.originalPrice > currentLink.price && (
                  <span className="text-xs line-through text-neutral-400 font-mono-data">
                    ${currentLink.originalPrice.toFixed(2)}
                  </span>
                )}
                {currentLink.isLowestPrice && (
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    Lowest Price Found
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Coupon Code Callout */}
          {currentLink.couponCode && (
            <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Tag className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <div className="text-[11px] text-neutral-500 uppercase tracking-wide font-semibold">
                    Exclusive Reader Discount
                  </div>
                  <div className="font-mono-data font-bold text-neutral-900 text-sm">
                    {currentLink.couponCode}
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleCopyCode(currentLink.couponCode!)}
                className="px-3 py-1.5 bg-white border border-neutral-300 hover:border-neutral-400 rounded-lg text-xs font-semibold text-neutral-800 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Retailer Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-700 block">
              Choose Verified Retailer:
            </label>
            <div className="space-y-1.5">
              {product.affiliateLinks.map((link, idx) => (
                <button
                  key={link.retailer}
                  onClick={() => setSelectedLinkIndex(idx)}
                  className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    selectedLinkIndex === idx
                      ? 'border-neutral-900 bg-neutral-50/80 ring-1 ring-neutral-900'
                      : 'border-neutral-200 hover:border-neutral-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                        selectedLinkIndex === idx ? 'border-neutral-900 bg-neutral-900' : 'border-neutral-300'
                      }`}
                    >
                      {selectedLinkIndex === idx && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                    </div>
                    <span className="text-xs font-medium text-neutral-800">{link.retailer}</span>
                    {link.isLowestPrice && (
                      <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded">
                        Best Price
                      </span>
                    )}
                  </div>
                  <span className="font-mono-data text-xs font-bold text-neutral-900">
                    ${link.price.toFixed(2)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="pt-2 space-y-3">
            <button
              onClick={() => handleOpenRetailer(currentLink.link)}
              className="w-full py-3 px-4 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-semibold text-sm transition-all shadow flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <span>Continue to {currentLink.retailer}</span>
              <ExternalLink className="w-4 h-4" />
            </button>

            {/* FTC Disclosure inside deal modal */}
            <div className="flex items-start gap-2 text-[11px] text-neutral-500 leading-tight">
              <ShieldCheck className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
              <span>
                ApexWire is reader-supported. We may earn an affiliate commission when you complete a purchase. Prices and coupon validity verified within the last 2 hours.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
