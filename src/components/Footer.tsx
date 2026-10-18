import React from 'react';
import { ShieldCheck, Mail } from 'lucide-react';
import { CATEGORIES } from '../data/products';

interface FooterProps {
  onSelectCategory: (cat: string) => void;
  onScrollToCatalog: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectCategory, onScrollToCatalog }) => {
  return (
    <footer className="bg-white border-t border-neutral-200 text-neutral-600 text-xs py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand & Charter */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-1.5 text-base font-bold text-neutral-900 tracking-tight">
              <span className="w-2.5 h-2.5 bg-neutral-900 rounded-xs inline-block"></span>
              <span>ApexWire</span>
            </div>
            <p className="leading-relaxed text-neutral-500">
              The premier independent affiliate review guide. Rigorous hands-on benchmarking, honest verdicts, and vetted merchant discount codes.
            </p>
          </div>

          {/* Col 2: Categories */}
          <div className="space-y-2">
            <div className="font-semibold text-neutral-900 uppercase tracking-wider text-[11px]">
              Categories
            </div>
            <ul className="space-y-1.5">
              {CATEGORIES.slice(1).map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() => {
                      onSelectCategory(cat);
                      onScrollToCatalog();
                    }}
                    className="hover:text-neutral-900 transition-colors cursor-pointer text-left"
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Testing & Ethics */}
          <div className="space-y-2">
            <div className="font-semibold text-neutral-900 uppercase tracking-wider text-[11px]">
              Editorial Policy
            </div>
            <ul className="space-y-1.5 text-neutral-500">
              <li>Methodology & Testing Lab</li>
              <li>Affiliate Commission Disclosure</li>
              <li>No Sponsored Placements Policy</li>
              <li>Corrections & Price Tracking</li>
            </ul>
          </div>

          {/* Col 4: Newsletter / Deal Alerts */}
          <div className="space-y-3">
            <div className="font-semibold text-neutral-900 uppercase tracking-wider text-[11px]">
              Weekly Deal Digest
            </div>
            <p className="text-neutral-500 leading-relaxed">
              Get vetted drops, price drops, and editor’s picks delivered to your inbox every Thursday.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert('Thank you for subscribing to ApexWire Deal Digest!');
              }}
              className="flex gap-1.5"
            >
              <input
                type="email"
                required
                placeholder="you@domain.com"
                className="px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs text-neutral-900 focus:outline-none focus:border-neutral-900 w-full"
              />
              <button
                type="submit"
                className="px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold cursor-pointer shrink-0 transition-colors"
              >
                Join
              </button>
            </form>
          </div>
        </div>

        {/* FTC Statement & Copyright */}
        <div className="pt-8 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-400">
          <p>
            © {new Date().getFullYear()} ApexWire Reviews. All rights reserved. When you purchase through our links, we may earn an affiliate commission.
          </p>
          <div className="flex items-center gap-4">
            <span className="hover:text-neutral-600 cursor-pointer">Privacy Policy</span>
            <span>·</span>
            <span className="hover:text-neutral-600 cursor-pointer">Terms of Service</span>
            <span>·</span>
            <span className="hover:text-neutral-600 cursor-pointer">Affiliate Transparency</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
