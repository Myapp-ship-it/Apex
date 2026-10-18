import React from 'react';
import { ShieldCheck, Award, Microscope, HeartHandshake } from 'lucide-react';

export const TestingStandardsSection: React.FC = () => {
  return (
    <section id="testing-standards" className="border-t border-neutral-200 bg-neutral-900 text-white py-14 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="max-w-2xl space-y-3">
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <span className="uppercase tracking-wider font-semibold text-emerald-400">Editorial Charter</span>
            <span aria-hidden="true">·</span>
            <span>Zero Sponsored Placements</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            How ApexWire Evaluates Every Product
          </h2>
          <p className="text-neutral-400 text-sm leading-relaxed">
            Our review laboratory operates on four core testing pillars. We purchase or independently audit all gear without commercial manufacturer interference.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 bg-neutral-800/60 border border-neutral-700/60 rounded-xl space-y-3">
            <Microscope className="w-6 h-6 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">01. Empirical Benchmarking</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              We test actual battery life under standardized decibel loads, switch actuation pressure curves, and thermal dissipation with calibrated sensors.
            </p>
          </div>

          <div className="p-6 bg-neutral-800/60 border border-neutral-700/60 rounded-xl space-y-3">
            <Award className="w-6 h-6 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">02. Uncompromising Scoring</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Only products that score 9.0 or higher across performance, build quality, and ergonomic health receive our coveted Editor's Choice badge.
            </p>
          </div>

          <div className="p-6 bg-neutral-800/60 border border-neutral-700/60 rounded-xl space-y-3">
            <HeartHandshake className="w-6 h-6 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">03. Transparent Affiliate Ethics</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              We may earn commissions from merchant partners, but editorial teams have zero revenue quotas. If a product fails testing, we clearly advise readers against buying it.
            </p>
          </div>

          <div className="p-6 bg-neutral-800/60 border border-neutral-700/60 rounded-xl space-y-3">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">04. Price & Coupon Auditing</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Our automated price scrapers crawl merchant catalogs hourly to guarantee our readers get valid promo codes and genuine historical lows.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
