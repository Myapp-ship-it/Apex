import React from 'react';
import { X, Bookmark, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { Product } from '../data/products';

interface SavedBookmarksDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedProducts: Product[];
  onRemoveSaved: (productId: string) => void;
  onClearAllSaved: () => void;
  onBuyNow: (product: Product) => void;
  onOpenDetail: (product: Product) => void;
}

export const SavedBookmarksDrawer: React.FC<SavedBookmarksDrawerProps> = ({
  isOpen,
  onClose,
  savedProducts,
  onRemoveSaved,
  onClearAllSaved,
  onBuyNow,
  onOpenDetail
}) => {
  if (!isOpen) return null;

  const totalValue = savedProducts.reduce((acc, p) => acc + p.price, 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-neutral-950/70 backdrop-blur-xs">
      <div
        className="bg-white max-w-md w-full h-full shadow-2xl flex flex-col border-l border-neutral-200 animate-slideLeft"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:px-6 border-b border-neutral-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-neutral-900 fill-neutral-900" />
            <h3 className="font-bold text-neutral-900 text-base">
              Saved Gear ({savedProducts.length})
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {savedProducts.length > 0 && (
              <button
                onClick={onClearAllSaved}
                className="text-xs text-neutral-500 hover:text-neutral-900 flex items-center gap-1 cursor-pointer mr-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
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

        {/* List of saved products */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {savedProducts.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <Bookmark className="w-10 h-10 text-neutral-300 mx-auto" />
              <h4 className="font-bold text-neutral-800 text-sm">No saved products yet</h4>
              <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                Bookmark items you're interested in by tapping the bookmark icon on any card to track prices and deals.
              </p>
            </div>
          ) : (
            savedProducts.map((p) => (
              <div
                key={p.id}
                className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl flex gap-3.5 items-center justify-between"
              >
                <div
                  onClick={() => {
                    onClose();
                    onOpenDetail(p);
                  }}
                  className="flex gap-3 items-center cursor-pointer flex-1 min-w-0"
                >
                  <img
                    src={p.image}
                    alt={p.title}
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 rounded-lg object-cover bg-neutral-200 shrink-0 border border-neutral-200"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-[11px] text-neutral-500">{p.brand}</span>
                    <h5 className="font-bold text-neutral-900 text-xs truncate">
                      {p.title}
                    </h5>
                    <div className="font-mono-data text-xs font-bold text-neutral-900 mt-0.5">
                      ${p.price.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => {
                      onClose();
                      onBuyNow(p);
                    }}
                    className="p-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg transition-colors cursor-pointer"
                    title="Buy now deal"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onRemoveSaved(p.id)}
                    className="p-2 text-neutral-400 hover:text-rose-600 rounded-lg hover:bg-neutral-200/50 transition-colors cursor-pointer"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {savedProducts.length > 0 && (
          <div className="p-4 sm:px-6 border-t border-neutral-200 bg-neutral-50 space-y-3">
            <div className="flex justify-between items-baseline text-xs">
              <span className="text-neutral-500">Total Wishlist Value:</span>
              <span className="font-mono-data text-base font-bold text-neutral-900">
                ${totalValue.toFixed(2)}
              </span>
            </div>
            <button
              onClick={onClose}
              className="w-full py-2.5 px-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors"
            >
              Continue Browsing
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
