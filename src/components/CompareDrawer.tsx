import React from 'react';
import { X, Scale, Star, ShoppingBag, ArrowRight, Trash2 } from 'lucide-react';
import { Product } from '../data/products';

interface CompareDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  comparedProducts: Product[];
  onRemoveCompare: (productId: string) => void;
  onClearCompare: () => void;
  onBuyNow: (product: Product) => void;
}

export const CompareDrawer: React.FC<CompareDrawerProps> = ({
  isOpen,
  onClose,
  comparedProducts,
  onRemoveCompare,
  onClearCompare,
  onBuyNow
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-neutral-950/70 backdrop-blur-xs">
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-neutral-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:px-6 border-b border-neutral-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-neutral-900" />
            <h3 className="font-bold text-neutral-900 text-base">
              Product Comparison ({comparedProducts.length}/3)
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {comparedProducts.length > 0 && (
              <button
                onClick={onClearCompare}
                className="text-xs text-neutral-500 hover:text-neutral-900 flex items-center gap-1 cursor-pointer mr-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-900 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-x-auto overflow-y-auto max-h-[75vh]">
          {comparedProducts.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <Scale className="w-10 h-10 text-neutral-300 mx-auto" />
              <h4 className="font-bold text-neutral-800 text-sm">No products selected for comparison</h4>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                Click the 'Compare' icon on any product card in the catalog to evaluate specifications and pricing side by side.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-neutral-200">
              {comparedProducts.map((p) => {
                const discount = Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100);
                return (
                  <div key={p.id} className="pt-4 md:pt-0 md:px-3 space-y-4 flex flex-col justify-between">
                    <div className="space-y-3">
                      {/* Image & Remove */}
                      <div className="relative rounded-xl overflow-hidden bg-neutral-100 aspect-4/3 border border-neutral-200">
                        <img
                          src={p.image}
                          alt={p.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => onRemoveCompare(p.id)}
                          className="absolute top-2 right-2 p-1 bg-white/90 hover:bg-white text-neutral-700 hover:text-neutral-900 rounded-md shadow-xs cursor-pointer"
                          title="Remove item"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Title & Brand */}
                      <div>
                        <span className="text-xs text-neutral-500">{p.brand}</span>
                        <h4 className="font-bold text-neutral-900 text-sm line-clamp-2 mt-0.5">
                          {p.title}
                        </h4>
                      </div>

                      {/* Price & Rating */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-lg font-bold font-mono-data text-neutral-900">
                            ${p.price.toFixed(2)}
                          </span>
                          {discount > 0 && (
                            <span className="text-xs font-semibold text-emerald-700 font-mono-data">
                              -{discount}%
                            </span>
                          )}
                        </div>
                        <div className="flex items-center text-xs text-amber-500">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span className="font-mono-data font-bold text-neutral-900 ml-1">{p.rating.toFixed(1)}</span>
                        </div>
                      </div>

                      {/* Key Specs */}
                      <div className="space-y-1.5 pt-2 border-t border-neutral-100 text-xs">
                        <div className="font-semibold text-neutral-700 text-[11px] uppercase tracking-wider">
                          Key Specifications
                        </div>
                        {p.specs.slice(0, 4).map((s, idx) => (
                          <div key={idx} className="flex justify-between py-1 border-b border-neutral-50">
                            <span className="text-neutral-500">{s.label}:</span>
                            <span className="text-neutral-800 font-medium text-right">{s.value}</span>
                          </div>
                        ))}
                      </div>

                      {/* Top Pro */}
                      <div className="space-y-1 pt-1 text-xs">
                        <div className="font-semibold text-emerald-800 text-[11px] uppercase tracking-wider">
                          Top Advantage
                        </div>
                        <p className="text-neutral-600 leading-snug">
                          {p.pros[0]}
                        </p>
                      </div>
                    </div>

                    {/* Direct Buy Button */}
                    <div className="pt-3">
                      <button
                        onClick={() => {
                          onClose();
                          onBuyNow(p);
                        }}
                        className="w-full py-2.5 px-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-98"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Buy Deal (${p.price.toFixed(0)})</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
