import React, { useState } from 'react';
import { Search, X, CheckCircle2, Sparkles, Star, Award, ShieldCheck } from 'lucide-react';
import { handleImageError } from '../lib/imageUtils';

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
  const suggestions = [
    'Noise-Cancelling',
    'Mechanical Keyboard',
    'Ergonomic Chair',
    'Espresso Machine',
    'Rangefinder Camera',
    'EDC Backpack'
  ];

  // High-resolution aesthetic tech studio image from Unsplash
  const HERO_IMAGE_URL =
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=85';
  const FALLBACK_IMAGE_URL =
    'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=1200&q=85';

  return (
    <section className="relative bg-gradient-to-b from-neutral-100/90 via-neutral-50/50 to-white border-b border-neutral-200/80 overflow-hidden">
      {/* Subtle ambient light gradient glows in background */}
      <div
        className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-10 left-1/3 w-80 h-80 bg-neutral-900/5 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Editorial Headline, Search & Filters */}
          <div className="lg:col-span-7 space-y-7">
            {/* Top pill badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-neutral-200 rounded-full shadow-2xs text-xs font-semibold text-neutral-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="uppercase tracking-wider text-[11px] font-bold text-neutral-900">
                ApexWire Tech Lab
              </span>
              <span className="text-neutral-300">·</span>
              <span>2026 Verified Guide</span>
            </div>

            {/* Main Headline */}
            <h1
              className="text-3xl sm:text-5xl lg:text-[3.25rem] font-extrabold text-neutral-950 tracking-tight leading-[1.12]"
              style={{ textWrap: 'balance' }}
            >
              Meticulously tested gear. Honest verdicts. Best verified deals.
            </h1>

            {/* Subtitle */}
            <p className="text-neutral-600 text-base sm:text-lg max-w-2xl leading-relaxed font-normal">
              We spend hundreds of hours benchmarking workspace equipment, high-fidelity audio, and everyday carry gear in real-world studio conditions so you buy with total confidence.
            </p>

            {/* Enhanced Wide Search Bar & Modern Clickable Pills */}
            <div className="space-y-4 pt-1">
              <div className="relative max-w-2xl group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-neutral-900 transition-colors">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Search gear by keyword, brand, or specs (e.g. 'ANC', 'aluminum', 'espresso')..."
                  className="w-full pl-12 pr-12 py-4 bg-white border border-neutral-300 focus:border-neutral-950 focus:ring-4 focus:ring-neutral-900/5 rounded-2xl text-sm sm:text-base text-neutral-900 placeholder-neutral-400 transition-all outline-none shadow-sm hover:border-neutral-400 hover:shadow-md"
                  aria-label="Search review catalog"
                />
                {searchQuery && (
                  <button
                    onClick={() => onSearchChange('')}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-neutral-400 hover:text-neutral-900 transition-colors cursor-pointer"
                    aria-label="Clear search query"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Trending Pill Tags */}
              <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
                <span className="font-semibold text-neutral-500 mr-1 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Trending:</span>
                </span>
                {suggestions.map((term) => {
                  const isActive = searchQuery.toLowerCase() === term.toLowerCase();
                  return (
                    <button
                      key={term}
                      onClick={() => onSelectSuggestion(term)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 cursor-pointer shadow-2xs border ${
                        isActive
                          ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm'
                          : 'bg-white hover:bg-neutral-900 text-neutral-700 hover:text-white border-neutral-200/90 hover:border-neutral-900'
                      }`}
                    >
                      {term}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Testing Rigor Proof Strip */}
            <div className="pt-6 border-t border-neutral-200/70 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-neutral-600">
              <div className="flex items-center gap-1.5 font-semibold text-neutral-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>1,320+ Lab Hours</span>
              </div>
              <div className="flex items-center gap-1.5 font-semibold text-neutral-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Zero Paid Placements</span>
              </div>
              <div className="flex items-center gap-1.5 font-semibold text-neutral-800">
                <Award className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Verified Retailer Discounts</span>
              </div>
            </div>
          </div>

          {/* Right Column: Premium Glassmorphism Image Showcase Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative p-2.5 sm:p-3 bg-white/90 backdrop-blur-md rounded-3xl border border-neutral-200/90 shadow-xl hover:shadow-2xl transition-all duration-300 group">
              {/* Image Container with rounded corners & aspect ratio */}
              <div className="relative rounded-2xl overflow-hidden aspect-4/3 sm:aspect-16/10 lg:aspect-4/3 bg-neutral-900">
                <img
                  src={HERO_IMAGE_URL}
                  alt="Aesthetic audiophile studio testing setup with wireless headphones and acoustic gear"
                  referrerPolicy="no-referrer"
                  onError={(e) => handleImageError(e, FALLBACK_IMAGE_URL)}
                  className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-700 ease-out"
                  loading="eager"
                />

                {/* Top Badge: Lab Verified */}
                <div className="absolute top-3 left-3 bg-neutral-950/80 backdrop-blur-md border border-white/10 text-white text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Lab Tested & Verified</span>
                </div>

                {/* Floating Bottom Glassmorphic Card */}
                <div className="absolute bottom-3 left-3 right-3 p-3.5 bg-neutral-950/85 backdrop-blur-md rounded-xl border border-white/15 text-white shadow-xl flex items-center justify-between gap-3">
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>4.9 / 5.0 Rating</span>
                    </div>
                    <h3 className="font-bold text-sm text-white truncate">
                      Aurae H1 Over-Ear Headphones
                    </h3>
                    <p className="text-[11px] text-neutral-300 truncate">
                      Editor's Pick for Active Noise Isolation
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="block text-xs font-mono font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-500/30 px-2 py-0.5 rounded">
                      $349.99
                    </span>
                    <span className="text-[10px] text-neutral-400 line-through">
                      $399.99
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
