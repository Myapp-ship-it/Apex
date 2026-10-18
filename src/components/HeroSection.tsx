import React from 'react';
import { Search, X, CheckCircle2, SlidersHorizontal } from 'lucide-react';

interface HeroSectionProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  totalProducts: number;
  filteredCount: number;
  onSelectSuggestion: (term: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  searchQuery,
  onSearchChange,
  totalProducts,
  filteredCount,
  onSelectSuggestion
}) => {
  const suggestions = ['Noise-Cancelling', 'Mechanical Keyboard', 'Ergonomic Chair', 'Espresso', 'Street Camera', 'Backpack'];

  return (
    <section className="relative bg-white border-b border-neutral-200 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Editorial intro + Search */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-2 text-xs font-medium text-neutral-500">
              <span className="uppercase tracking-wider text-neutral-800 font-semibold">ApexWire Field Guide</span>
              <span aria-hidden="true">·</span>
              <span>2026 Edition</span>
              <span aria-hidden="true">·</span>
              <span>Updated Weekly</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-neutral-900 tracking-tight leading-[1.15]" style={{ textWrap: 'balance' }}>
              Meticulously tested gear. Honest verdicts. The best verified deals.
            </h1>

            <p className="text-neutral-600 text-base sm:text-lg max-w-xl leading-relaxed">
              We spend hundreds of hours benchmarking workspace equipment, high-fidelity audio, and everyday carry gear so you buy with total confidence.
            </p>

            {/* Integrated Search Bar */}
            <div className="space-y-3 pt-2">
              <div className="relative max-w-xl">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Search products by brand, feature, or keyword (e.g., 'ANC', 'aluminum', 'espresso')..."
                  className="w-full pl-11 pr-10 py-3.5 bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10 rounded-xl text-sm text-neutral-900 placeholder-neutral-400 transition-all outline-none shadow-xs"
                  aria-label="Search review catalog"
                />
                {searchQuery && (
                  <button
                    onClick={() => onSearchChange('')}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-neutral-900 transition-colors cursor-pointer"
                    aria-label="Clear search query"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Suggestions */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-neutral-500 pt-1">
                <span className="font-medium text-neutral-700">Trending:</span>
                {suggestions.map((term) => (
                  <button
                    key={term}
                    onClick={() => onSelectSuggestion(term)}
                    className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 hover:text-neutral-900 rounded-md transition-colors cursor-pointer"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>

            {/* Testing Rigor Proof Strip */}
            <div className="pt-4 border-t border-neutral-100 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-neutral-600">
              <div className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>1,320+ Hands-on Lab Hours</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Zero Sponsored Placements</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Verified Retailer Discounts</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Asset */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border border-neutral-200/80 shadow-md bg-neutral-100 aspect-16/10 sm:aspect-16/10 lg:aspect-4/3">
              <img
                src="/src/assets/images/hero_curated_workspace_1792241538519.jpg"
                alt="Curated minimalist workspace with premium audio and mechanical keyboard setup"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent flex items-end p-5">
                <div className="text-white space-y-1">
                  <span className="text-xs uppercase tracking-wider text-emerald-300 font-semibold">Lab Showcase</span>
                  <p className="text-sm font-medium leading-snug">
                    Real ergonomics & acoustic benchmarks in daily studio use.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
