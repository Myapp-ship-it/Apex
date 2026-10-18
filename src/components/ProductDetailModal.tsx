import React, { useState } from 'react';
import { X, Star, Bookmark, Scale, Check, ShoppingBag, ExternalLink, ShieldCheck, Copy, Clock, Layers } from 'lucide-react';
import { Product } from '../data/products';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  isSaved: boolean;
  isCompared: boolean;
  onToggleSave: (productId: string) => void;
  onToggleCompare: (product: Product) => void;
  onBuyNow: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  isSaved,
  isCompared,
  onToggleSave,
  onToggleCompare,
  onBuyNow
}) => {
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);

  if (!product) return null;

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    setTimeout(() => setCopiedCoupon(null), 2000);
  };

  const discountPercent = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-neutral-950/70 backdrop-blur-xs overflow-y-auto">
      <div
        className="bg-white rounded-2xl max-w-4xl w-full my-auto overflow-hidden shadow-2xl border border-neutral-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky modal bar */}
        <div className="p-4 sm:px-6 border-b border-neutral-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-2 text-xs text-neutral-500 truncate">
            <span className="font-semibold text-neutral-900">{product.brand}</span>
            <span>·</span>
            <span>{product.category}</span>
            <span>·</span>
            <span className="flex items-center gap-1 text-emerald-700">
              <Clock className="w-3 h-3" /> Tested {product.testedHours} Hours
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleCompare(product)}
              className={`p-2 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                isCompared
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
              title="Compare with others"
            >
              <Scale className="w-4 h-4" />
              <span className="hidden sm:inline">{isCompared ? 'Compared' : 'Compare'}</span>
            </button>

            <button
              onClick={() => onToggleSave(product.id)}
              className="p-2 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
              title="Save for later"
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-neutral-900 text-neutral-900' : ''}`} />
            </button>

            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-neutral-900 rounded-lg transition-colors cursor-pointer ml-1"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scroll Content */}
        <div className="p-4 sm:p-8 space-y-8 max-h-[85vh] overflow-y-auto">
          {/* Hero Section */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Image */}
            <div className="md:col-span-5 relative rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200 aspect-4/3 md:aspect-square">
              <img
                src={product.image}
                alt={product.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              {product.awardLabel && (
                <div className="absolute top-3 left-3 bg-neutral-900/90 text-white text-xs font-semibold px-2.5 py-1 rounded shadow">
                  {product.awardLabel}
                </div>
              )}
            </div>

            {/* Title, rating, verdict, & quick buy */}
            <div className="md:col-span-7 space-y-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 leading-tight">
                  {product.title}
                </h2>
                <div className="flex items-center gap-3 mt-2 text-xs">
                  <div className="flex items-center text-amber-500">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="font-mono-data font-bold text-neutral-900 ml-1.5 text-sm">
                      {product.rating.toFixed(1)} / 5.0
                    </span>
                  </div>
                  <span className="text-neutral-300">·</span>
                  <span className="text-neutral-500 font-mono-data">
                    Based on {product.reviewsCount.toLocaleString()} verified customer reviews
                  </span>
                </div>
              </div>

              {/* Price Callout */}
              <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl space-y-2">
                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline gap-2.5">
                    <span className="text-3xl font-extrabold font-mono-data text-neutral-900">
                      ${product.price.toFixed(2)}
                    </span>
                    {product.originalPrice > product.price && (
                      <span className="text-sm line-through text-neutral-400 font-mono-data">
                        ${product.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                  {discountPercent > 0 && (
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded">
                      Save {discountPercent}% (${(product.originalPrice - product.price).toFixed(2)})
                    </span>
                  )}
                </div>

                <p className="text-xs text-neutral-600">
                  Includes full manufacturer warranty and verified 30-day money-back return policy.
                </p>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      onClose();
                      onBuyNow(product);
                    }}
                    className="w-full py-3 px-4 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-semibold text-sm transition-all shadow flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Get Best Affiliate Deal Now</span>
                  </button>
                </div>
              </div>

              <p className="text-sm text-neutral-700 leading-relaxed font-medium">
                {product.shortVerdict}
              </p>
            </div>
          </div>

          {/* Score Breakdown Radar/Bars */}
          <div className="border-t border-neutral-200 pt-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
              <Layers className="w-4 h-4" />
              <span>Lab Benchmark Performance Breakdown</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-neutral-700">Real-World Performance</span>
                  <span className="font-mono-data text-neutral-900 font-bold">{product.scoreBreakdown.performance} / 10</span>
                </div>
                <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-neutral-900 rounded-full"
                    style={{ width: `${(product.scoreBreakdown.performance / 10) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-neutral-700">Build Quality & Materials</span>
                  <span className="font-mono-data text-neutral-900 font-bold">{product.scoreBreakdown.buildQuality} / 10</span>
                </div>
                <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-neutral-900 rounded-full"
                    style={{ width: `${(product.scoreBreakdown.buildQuality / 10) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-neutral-700">Ergonomics & Daily Usability</span>
                  <span className="font-mono-data text-neutral-900 font-bold">{product.scoreBreakdown.ergonomics} / 10</span>
                </div>
                <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-neutral-900 rounded-full"
                    style={{ width: `${(product.scoreBreakdown.ergonomics / 10) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-neutral-700">Value for Price Point</span>
                  <span className="font-mono-data text-neutral-900 font-bold">{product.scoreBreakdown.valueForMoney} / 10</span>
                </div>
                <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-neutral-900 rounded-full"
                    style={{ width: `${(product.scoreBreakdown.valueForMoney / 10) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Pros & Cons */}
          <div className="border-t border-neutral-200 pt-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 mb-4">
              Tested Strengths & Considerations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-2">
                <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wide flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-700" />
                  <span>What We Loved</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-neutral-700">
                  {product.pros.map((pro, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold shrink-0">✓</span>
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-amber-50/40 border border-amber-200 rounded-xl space-y-2">
                <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wide flex items-center gap-1.5">
                  <X className="w-4 h-4 text-amber-700" />
                  <span>Trade-offs to Keep in Mind</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-neutral-700">
                  {product.cons.map((con, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-amber-600 font-bold shrink-0">✕</span>
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Full In-Depth Narrative */}
          <div className="border-t border-neutral-200 pt-6 space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
              The Comprehensive Lab Review
            </h3>
            <div className="prose text-neutral-700 text-sm leading-relaxed space-y-3">
              <p>{product.fullReview}</p>
            </div>
          </div>

          {/* Specs Table */}
          <div className="border-t border-neutral-200 pt-6 space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
              Technical Specifications
            </h3>
            <div className="border border-neutral-200 rounded-xl overflow-hidden divide-y divide-neutral-200 text-xs">
              {product.specs.map((spec, i) => (
                <div key={i} className={`flex py-2.5 px-4 ${i % 2 === 0 ? 'bg-neutral-50' : 'bg-white'}`}>
                  <span className="w-1/3 font-semibold text-neutral-600 shrink-0">{spec.label}</span>
                  <span className="w-2/3 text-neutral-900 font-medium">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Retailer Deal Price Comparison */}
          <div className="border-t border-neutral-200 pt-6 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
                Where to Buy: Current Retailer Comparison
              </h3>
              <span className="text-[11px] text-neutral-500">Updated today</span>
            </div>

            <div className="border border-neutral-200 rounded-xl overflow-hidden divide-y divide-neutral-200">
              {product.affiliateLinks.map((link, idx) => (
                <div key={idx} className="p-3 sm:px-4 flex flex-wrap items-center justify-between gap-3 bg-white hover:bg-neutral-50 transition-colors">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-neutral-900 text-sm">{link.retailer}</span>
                      {link.isLowestPrice && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded">
                          Lowest Price
                        </span>
                      )}
                    </div>
                    {link.couponCode && (
                      <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                        <span>Coupon: <strong className="font-mono-data text-neutral-800">{link.couponCode}</strong></span>
                        <button
                          onClick={() => handleCopyCode(link.couponCode!)}
                          className="text-[11px] text-neutral-600 hover:text-neutral-900 underline flex items-center gap-0.5 cursor-pointer"
                        >
                          {copiedCoupon === link.couponCode ? (
                            <span className="text-emerald-600 flex items-center gap-0.5">
                              <Check className="w-3 h-3" /> Copied
                            </span>
                          ) : (
                            <span className="flex items-center gap-0.5">
                              <Copy className="w-3 h-3" /> Copy
                            </span>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="font-mono-data font-bold text-neutral-900 text-base">
                      ${link.price.toFixed(2)}
                    </span>
                    <a
                      href={link.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-98"
                    >
                      <span>Buy at {link.retailer}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <span>Prices are accurate as of today and subject to retailer inventory changes. Affiliate link disclosure applies.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
