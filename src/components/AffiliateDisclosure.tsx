import React, { useState } from 'react';
import { ShieldCheck, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

export const AffiliateDisclosure: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-neutral-900 text-neutral-300 text-xs border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="text-neutral-300">
            <strong className="font-semibold text-white">Reader-Supported:</strong> We independently test every product. When you buy through our links, we may earn an affiliate commission at no extra cost to you.
          </span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-neutral-400 hover:text-white transition-colors underline flex items-center gap-1 cursor-pointer font-medium"
          aria-expanded={isOpen}
        >
          <span>How we test & affiliate ethics</span>
          {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {isOpen && (
        <div className="bg-neutral-950 text-neutral-300 px-4 sm:px-6 lg:px-8 py-4 border-t border-neutral-800 text-xs leading-relaxed transition-all">
          <div className="max-w-4xl mx-auto space-y-2">
            <h4 className="font-semibold text-white text-sm">Our Editorial Promise & Testing Standard</h4>
            <p>
              ApexWire accepts zero paid placement or sponsored rankings. Every single recommendation is chosen strictly based on real-world testing (battery duration, acoustic analyzers, pressure mapping, material durability). If you return an item because it failed your expectations, we earn nothing. We only succeed when you find gear you love.
            </p>
            <div className="flex items-center gap-4 pt-1 text-neutral-400">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span> 100% Unbiased Evaluations
              </span>
              <span>·</span>
              <span>FTC Compliant Disclosure</span>
              <span>·</span>
              <span>Real-Time Price & Coupon Verification</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
