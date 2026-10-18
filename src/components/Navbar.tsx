import React from 'react';
import { Bookmark, Scale, ArrowDown, Lock, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  savedCount: number;
  compareCount: number;
  onOpenSaved: () => void;
  onOpenCompare: () => void;
  onScrollToCatalog: () => void;
  onScrollToStandards: () => void;
  onOpenAdmin: () => void;
  isAdminLoggedIn: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  savedCount,
  compareCount,
  onOpenSaved,
  onOpenCompare,
  onScrollToCatalog,
  onScrollToStandards,
  onOpenAdmin,
  isAdminLoggedIn
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand wordmark */}
        <a
          href="/"
          className="text-xl font-bold tracking-tight text-neutral-900 whitespace-nowrap shrink-0 flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 rounded"
        >
          <span className="w-3 h-3 bg-neutral-900 rounded-sm inline-block"></span>
          <span>ApexWire</span>
        </a>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-600">
          <button
            onClick={onScrollToCatalog}
            className="hover:text-neutral-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Editor's Picks
          </button>
          <a
            href="#editorial-posts"
            className="hover:text-neutral-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Guides & Posts
          </a>
          <button
            onClick={onScrollToStandards}
            className="hover:text-neutral-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Testing Standards
          </button>
          <button
            onClick={onOpenCompare}
            className="hover:text-neutral-900 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <Scale className="w-4 h-4" />
            <span>Compare</span>
            {compareCount > 0 && (
              <span className="font-mono-data text-xs bg-neutral-900 text-white rounded-full px-1.5 py-0.2">
                {compareCount}
              </span>
            )}
          </button>
        </nav>

        {/* Zone 3: Actions + Admin Access */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Admin Portal Button */}
          <button
            onClick={onOpenAdmin}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
              isAdminLoggedIn
                ? 'bg-neutral-900 text-white'
                : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
            }`}
            title={isAdminLoggedIn ? 'Open Admin Control' : 'Admin Login'}
          >
            <Lock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isAdminLoggedIn ? 'Admin Panel' : 'Admin Login'}</span>
          </button>

          {/* Saved Bookmarks */}
          <button
            onClick={onOpenSaved}
            className="relative p-2 text-neutral-700 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer flex items-center gap-1.5 text-sm font-medium"
            aria-label="View saved items"
            title="Saved Bookmarks"
          >
            <Bookmark className={`w-4 h-4 ${savedCount > 0 ? 'fill-neutral-900 text-neutral-900' : ''}`} />
            <span className="hidden sm:inline">Saved</span>
            {savedCount > 0 && (
              <span className="font-mono-data text-xs bg-neutral-900 text-white rounded-full px-1.5 py-0.2">
                {savedCount}
              </span>
            )}
          </button>

          <button
            onClick={onScrollToCatalog}
            className="hidden sm:flex px-4 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors whitespace-nowrap shrink-0 items-center gap-1.5 cursor-pointer shadow-sm active:scale-98"
          >
            <span>Reviews</span>
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
