import React, { useState } from 'react';
import { Star, Bookmark, Scale, ExternalLink, ArrowRight, Check, ShoppingBag, ShieldCheck } from 'lucide-react';
import { Product } from '../data/products';

interface ProductCardProps {
  product: Product;
  isSaved: boolean;
  isCompared: boolean;
  onToggleSave: (productId: string) => void;
  onToggleCompare: (product: Product) => void;
  onOpenDetail: (product: Product) => void;
  onBuyNow: (product: Product) => void;
  viewMode?: 'grid' | 'list';
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isSaved,
  isCompared,
  onToggleSave,
  onToggleCompare,
  onOpenDetail,
  onBuyNow,
  viewMode = 'grid'
}) => {
  const [imageError, setImageError] = useState(false);
  const discountPercent = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  const lowestAffiliate = product.affiliateLinks.find(l => l.isLowestPrice) || product.affiliateLinks[0];

  if (viewMode === 'list') {
    return (
      <article className="bg-white border border-neutral-200/90 rounded-2xl p-5 hover:border-neutral-300 transition-all shadow-xs hover:shadow-md flex flex-col md:flex-row gap-6 items-stretch">
        {/* Thumbnail */}
        <div
          onClick={() => onOpenDetail(product)}
          className="relative w-full md:w-56 h-48 md:h-auto shrink-0 bg-neutral-100 rounded-xl overflow-hidden cursor-pointer group"
        >
          {!imageError ? (
            <img
              src={product.image}
              alt={product.title}
              referrerPolicy="no-referrer"
              onError={() => setImageError(true)}
              className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-neutral-100 text-neutral-400">
              <ShoppingBag className="w-8 h-8 mb-2" />
              <span className="text-xs font-medium text-neutral-500">{product.brand}</span>
            </div>
          )}

          {product.awardLabel && (
            <div className="absolute top-2.5 left-2.5 bg-neutral-900/90 backdrop-blur-xs text-white text-[11px] font-semibold px-2 py-0.5 rounded">
              {product.awardLabel}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between gap-2">
              {/* Clean unboxed metadata */}
              <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                <span className="font-semibold text-neutral-800">{product.brand}</span>
                <span aria-hidden="true">·</span>
                <span>{product.category}</span>
                <span aria-hidden="true">·</span>
                <span>Tested {product.testedHours}h</span>
              </div>

              {/* Utility actions: Bookmark & Compare */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onToggleCompare(product)}
                  className={`p-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                    isCompared
                      ? 'bg-neutral-900 text-white'
                      : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100'
                  }`}
                  title="Compare with other products"
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{isCompared ? 'Compared' : 'Compare'}</span>
                </button>
                <button
                  onClick={() => onToggleSave(product.id)}
                  className="p-1.5 rounded-md text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
                  title={isSaved ? 'Remove from Saved' : 'Save for later'}
                  aria-label="Bookmark product"
                >
                  <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-neutral-900 text-neutral-900' : ''}`} />
                </button>
              </div>
            </div>

            <h3
              onClick={() => onOpenDetail(product)}
              className="text-lg font-bold text-neutral-900 hover:text-neutral-700 transition-colors cursor-pointer mt-1"
            >
              {product.title}
            </h3>

            {/* Rating */}
            <div className="flex items-center gap-2 mt-1.5 text-xs">
              <div className="flex items-center text-amber-500">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="font-mono-data font-bold text-neutral-900 ml-1">{product.rating.toFixed(1)}</span>
              </div>
              <span className="text-neutral-400">·</span>
              <span className="text-neutral-500">({product.reviewsCount.toLocaleString()} user ratings)</span>
            </div>

            <p className="text-sm text-neutral-600 mt-2 line-clamp-2 leading-relaxed">
              {product.shortVerdict}
            </p>
          </div>

          {/* Pricing & Buy Button row */}
          <div className="pt-3 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-0.5">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono-data text-neutral-900">
                  ${product.price.toFixed(2)}
                </span>
                {product.originalPrice > product.price && (
                  <span className="text-xs line-through text-neutral-400 font-mono-data">
                    ${product.originalPrice.toFixed(2)}
                  </span>
                )}
                {discountPercent > 0 && (
                  <span className="text-xs font-semibold text-emerald-700">
                    Save {discountPercent}%
                  </span>
                )}
              </div>
              <div className="text-[11px] text-neutral-500 flex items-center gap-1">
                <span>Best price at {lowestAffiliate.retailer}</span>
                {lowestAffiliate.couponCode && (
                  <span className="font-mono-data font-medium text-emerald-600">
                    (Code: {lowestAffiliate.couponCode})
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => onOpenDetail(product)}
                className="px-4 py-2 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors cursor-pointer"
              >
                Read Review
              </button>
              <button
                onClick={() => onBuyNow(product)}
                className="px-5 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-all shadow-xs hover:shadow flex items-center gap-2 cursor-pointer active:scale-98"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Buy Now</span>
              </button>
            </div>
          </div>
        </div>
      </article>
    );
  }

  // Grid Mode (Standard Homepage Grid)
  return (
    <article className="bg-white border border-neutral-200/90 rounded-2xl overflow-hidden hover:border-neutral-300 transition-all duration-200 hover:shadow-lg flex flex-col justify-between group">
      <div>
        {/* Product Image Lead (65%-75% of upper card) */}
        <div
          onClick={() => onOpenDetail(product)}
          className="relative aspect-4/3 w-full bg-neutral-100 overflow-hidden cursor-pointer"
        >
          {!imageError ? (
            <img
              src={product.image}
              alt={product.title}
              referrerPolicy="no-referrer"
              onError={() => setImageError(true)}
              className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500 ease-out"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-neutral-100 text-neutral-400">
              <ShoppingBag className="w-10 h-10 mb-2 stroke-1" />
              <span className="text-xs font-medium text-neutral-600">{product.brand}</span>
            </div>
          )}

          {/* Award Tag */}
          {product.awardLabel && (
            <div className="absolute top-3 left-3 bg-neutral-900/90 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded shadow-xs">
              {product.awardLabel}
            </div>
          )}

          {/* Quick utility controls on top-right */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleCompare(product);
              }}
              className={`p-2 rounded-lg text-xs backdrop-blur-md transition-colors cursor-pointer shadow-xs ${
                isCompared
                  ? 'bg-neutral-900 text-white'
                  : 'bg-white/90 text-neutral-700 hover:bg-white hover:text-neutral-900'
              }`}
              title={isCompared ? 'Remove from comparison' : 'Add to comparison'}
              aria-label="Compare product"
            >
              <Scale className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleSave(product.id);
              }}
              className={`p-2 rounded-lg text-xs backdrop-blur-md transition-colors cursor-pointer shadow-xs ${
                isSaved
                  ? 'bg-white text-neutral-900'
                  : 'bg-white/90 text-neutral-700 hover:bg-white hover:text-neutral-900'
              }`}
              title={isSaved ? 'Remove from Saved' : 'Save for later'}
              aria-label="Bookmark product"
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-neutral-900 text-neutral-900' : ''}`} />
            </button>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 space-y-3">
          {/* Clean Unboxed Metadata */}
          <div className="flex items-center gap-1.5 text-xs text-neutral-500">
            <span className="font-semibold text-neutral-900">{product.brand}</span>
            <span aria-hidden="true">·</span>
            <span>{product.category}</span>
            <span aria-hidden="true">·</span>
            <span>Tested {product.testedHours}h</span>
          </div>

          {/* Title */}
          <h3
            onClick={() => onOpenDetail(product)}
            className="text-base font-bold text-neutral-900 hover:text-neutral-700 transition-colors cursor-pointer leading-snug line-clamp-2 min-h-11"
            style={{ textWrap: 'balance' }}
          >
            {product.title}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center text-amber-500">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="font-mono-data font-bold text-neutral-900 ml-1">{product.rating.toFixed(1)}</span>
            </div>
            <span className="text-neutral-300">·</span>
            <span className="text-neutral-500 font-mono-data">{product.reviewsCount.toLocaleString()} ratings</span>
          </div>

          {/* Verdict Snippet */}
          <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed min-h-9">
            {product.shortVerdict}
          </p>
        </div>
      </div>

      {/* Card Footer: Pricing & Buy Now Action */}
      <div className="p-5 pt-3 border-t border-neutral-100 bg-neutral-50/50 space-y-3">
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono-data text-neutral-900">
              ${product.price.toFixed(2)}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-xs line-through text-neutral-400 font-mono-data">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>
          {discountPercent > 0 && (
            <span className="text-xs font-semibold text-emerald-700">
              Save {discountPercent}%
            </span>
          )}
        </div>

        <div className="text-[11px] text-neutral-500 truncate">
          Best deal at <strong className="text-neutral-700">{lowestAffiliate.retailer}</strong>
          {lowestAffiliate.couponCode && (
            <span className="text-emerald-700 font-mono-data font-medium ml-1">
              (Promo: {lowestAffiliate.couponCode})
            </span>
          )}
        </div>

        {/* Action Buttons: Read Review & Buy Now */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={() => onOpenDetail(product)}
            className="w-full py-2.5 px-3 text-xs font-semibold text-neutral-700 hover:text-neutral-900 bg-white hover:bg-neutral-100 border border-neutral-200 rounded-lg transition-colors cursor-pointer text-center"
          >
            Review & Specs
          </button>
          <button
            onClick={() => onBuyNow(product)}
            className="w-full py-2.5 px-3 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
          >
            <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
            <span className="whitespace-nowrap">Buy Now</span>
          </button>
        </div>
      </div>
    </article>
  );
};
