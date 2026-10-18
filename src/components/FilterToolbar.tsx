import React from 'react';
import { LayoutGrid, List, Sparkles, Tag, ArrowUpDown, RotateCcw } from 'lucide-react';
import { CATEGORIES } from '../data/products';

export type SortOption = 'rating' | 'price-asc' | 'price-desc' | 'discount' | 'tested';

interface FilterToolbarProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  categoryCounts: Record<string, number>;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  onlyEditorsPicks: boolean;
  onToggleEditorsPicks: () => void;
  onlyDeals: boolean;
  onToggleDeals: () => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
  totalResults: number;
}

export const FilterToolbar: React.FC<FilterToolbarProps> = ({
  selectedCategory,
  onSelectCategory,
  categoryCounts,
  sortBy,
  onSortChange,
  onlyEditorsPicks,
  onToggleEditorsPicks,
  onlyDeals,
  onToggleDeals,
  viewMode,
  onViewModeChange,
  onResetFilters,
  hasActiveFilters,
  totalResults
}) => {
  return (
    <div id="catalog-section" className="space-y-4 pt-4 pb-2">
      {/* Category Pills/Segmented Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
          {CATEGORIES.map((cat) => {
            const count = categoryCounts[cat] || 0;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-200'
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`font-mono-data text-[11px] px-1 rounded ${
                    isSelected ? 'bg-neutral-800 text-neutral-200' : 'text-neutral-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* View Mode Switcher */}
        <div className="hidden sm:flex items-center p-1 bg-neutral-100 rounded-lg border border-neutral-200 shrink-0">
          <button
            onClick={() => onViewModeChange('grid')}
            className={`p-1.5 rounded-md transition-colors cursor-pointer ${
              viewMode === 'grid' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-900'
            }`}
            title="Grid View"
            aria-label="Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={`p-1.5 rounded-md transition-colors cursor-pointer ${
              viewMode === 'list' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-900'
            }`}
            title="List View"
            aria-label="List View"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Secondary Controls Bar: Sort, Quick Toggles, Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-neutral-200 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Toggle: Editor's Picks */}
          <button
            onClick={onToggleEditorsPicks}
            className={`px-3 py-1.5 rounded-lg border font-medium flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-colors ${
              onlyEditorsPicks
                ? 'bg-neutral-900 text-white border-neutral-900'
                : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300 hover:text-neutral-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Editor's Picks Only</span>
          </button>

          {/* Quick Toggle: Best Discounts */}
          <button
            onClick={onToggleDeals}
            className={`px-3 py-1.5 rounded-lg border font-medium flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-colors ${
              onlyDeals
                ? 'bg-neutral-900 text-white border-neutral-900'
                : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300 hover:text-neutral-900'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Active Discount Deals</span>
          </button>

          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="px-2.5 py-1.5 text-neutral-500 hover:text-neutral-900 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {/* Sort Controls & Results Count */}
        <div className="flex items-center gap-3">
          <span className="text-neutral-500 whitespace-nowrap">
            Showing <strong className="font-mono-data text-neutral-900 font-semibold">{totalResults}</strong> reviews
          </span>

          <div className="flex items-center gap-1 bg-white border border-neutral-200 rounded-lg px-2.5 py-1">
            <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" />
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="bg-transparent text-neutral-800 text-xs font-medium focus:outline-none cursor-pointer pr-1"
              aria-label="Sort product reviews"
            >
              <option value="rating">Highest Rated</option>
              <option value="discount">Biggest Discount</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="tested">Most Tested Hours</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
