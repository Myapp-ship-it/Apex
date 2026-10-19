import React from 'react';
import { ArrowLeft, Calendar, ShoppingBag, ExternalLink, ShieldCheck, Share2, Check } from 'lucide-react';
import { formatSafeImageUrl, handleImageError } from '../lib/imageUtils';

export interface BlogPost {
  id: string;
  title: string;
  category?: string;
  price?: string;
  buy_now_link?: string;
  affiliate_link?: string;
  content: string;
  image_url?: string;
  author_email?: string;
  created_at: string;
}

interface SinglePostPageProps {
  post: BlogPost;
  onBack: () => void;
  onBuyNow?: (link: string, title: string) => void;
}

export const SinglePostPage: React.FC<SinglePostPageProps> = ({ post, onBack, onBuyNow }) => {
  const [copiedLink, setCopiedLink] = React.useState(false);

  // Dynamic affiliate link prioritizing affiliate_link column from database, with buy_now_link fallback
  const resolvedLink = (post.affiliate_link || post.buy_now_link || '').trim();
  const affiliateUrl = resolvedLink.length > 0
    ? resolvedLink
    : 'https://www.amazon.com/dp/B0AFF123?tag=apexwire-20';

  const handleBuyClick = (e: React.MouseEvent) => {
    if (onBuyNow) {
      onBuyNow(affiliateUrl, post.title);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Split content into readable paragraphs if linebreaks exist
  const paragraphs = post.content ? post.content.split('\n\n') : [];

  return (
    <article className="min-h-screen bg-neutral-50 pb-20">
      {/* Top Breadcrumb & Navigation Bar */}
      <div className="bg-white border-b border-neutral-200 sticky top-16 z-30 shadow-2xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-semibold text-neutral-700 hover:text-neutral-950 transition-colors cursor-pointer group py-2"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to All Guides & Reviews</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="px-3 py-1.5 text-neutral-600 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer text-xs flex items-center gap-1.5 border border-neutral-200"
              title="Copy Article Link"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600 font-semibold">Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Share Article</span>
                </>
              )}
            </button>

            <a
              href={affiliateUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleBuyClick}
              className="px-4 py-1.5 text-xs font-bold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg shadow-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-98"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
              <span>Buy Now</span>
              <ExternalLink className="w-3 h-3 text-neutral-400" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Article Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 space-y-8">
        {/* Header Metadata */}
        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
            {post.category && (
              <>
                <span className="font-bold text-neutral-900 uppercase tracking-wider text-[11px] bg-neutral-200/80 px-2 py-0.5 rounded">
                  {post.category}
                </span>
                <span>·</span>
              </>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-neutral-400" />
              {new Date(post.created_at).toLocaleDateString(undefined, {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
            <span>·</span>
            {/* Generic editorial team attribution */}
            <span className="font-semibold text-neutral-800">By Editorial Team</span>
          </div>

          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-neutral-900 tracking-tight leading-[1.18]"
            style={{ textWrap: 'balance' }}
          >
            {post.title}
          </h1>

          {/* Prominent Affiliate Deal / Buy Now Callout Bar */}
          <div className="p-5 sm:p-6 bg-white border border-neutral-200/90 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="space-y-1.5">
              <div className="text-xs uppercase tracking-wider text-neutral-500 font-semibold">
                Featured Verified Affiliate Deal
              </div>
              <div className="flex items-baseline gap-2.5">
                {post.price ? (
                  <span className="text-2xl sm:text-3xl font-extrabold font-mono-data text-neutral-900">
                    {post.price}
                  </span>
                ) : (
                  <span className="text-xl font-bold text-neutral-800">Verified Partner Pricing</span>
                )}
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  Best Price Found
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-neutral-500 pt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Independently evaluated. Direct secure checkout with retailer.</span>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-3">
              <a
                href={affiliateUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleBuyClick}
                className="w-full sm:w-auto px-6 py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <ShoppingBag className="w-4 h-4 text-amber-400" />
                <span>Buy Now</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        {(post.image_url || (post as any).image) && (
          <div className="rounded-2xl overflow-hidden border border-neutral-200/80 bg-neutral-100 aspect-16/9 shadow-sm">
            <img
              src={formatSafeImageUrl(post.image_url || (post as any).image || (post as any).imageUrl)}
              alt={post.title}
              referrerPolicy="no-referrer"
              onError={(e) => {
                handleImageError(e, 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1200&q=80');
              }}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Article Body Content */}
        <section className="bg-white border border-neutral-200/80 rounded-2xl p-6 sm:p-10 space-y-6 shadow-2xs">
          <div className="prose max-w-none text-neutral-800 text-base sm:text-lg leading-relaxed space-y-5">
            {paragraphs.length > 0 ? (
              paragraphs.map((p, idx) => (
                <p key={idx} className="leading-relaxed whitespace-pre-line text-neutral-700">
                  {p}
                </p>
              ))
            ) : (
              <p className="whitespace-pre-line text-neutral-700">{post.content}</p>
            )}
          </div>

          {/* In-article secondary CTA block */}
          <div className="mt-8 pt-8 border-t border-neutral-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-neutral-50 rounded-xl border border-neutral-200">
              <div>
                <h4 className="font-bold text-neutral-900 text-sm">Ready to purchase?</h4>
                <p className="text-xs text-neutral-600 mt-0.5">
                  Secure verified pricing through our direct affiliate link.
                </p>
              </div>

              <a
                href={affiliateUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleBuyClick}
                className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-semibold text-xs transition-all shadow flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                <span>Buy Now {post.price ? `(${post.price})` : ''}</span>
                <ExternalLink className="w-3 h-3 text-neutral-400" />
              </a>
            </div>

            {/* FTC Disclosure */}
            <div className="flex items-start gap-2 text-xs text-neutral-500 pt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed text-[11px]">
                <strong>Affiliate Transparency:</strong> ApexWire is reader-supported. When you buy through links in our reviews and guides, we may earn an affiliate commission at no extra cost to you.
              </p>
            </div>
          </div>
        </section>

        {/* Back navigation footer */}
        <div className="pt-4 flex justify-between items-center text-xs">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 font-semibold text-neutral-700 hover:text-neutral-900 cursor-pointer py-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to All Guides</span>
          </button>
          <span className="text-neutral-400 font-medium">ApexWire Editorial Standards</span>
        </div>
      </div>

      {/* Sticky Bottom Bar on Mobile */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-neutral-200 p-3 z-40 flex items-center justify-between gap-3 shadow-lg">
        <div className="min-w-0">
          <div className="text-[10px] text-neutral-500 uppercase font-semibold">Affiliate Price</div>
          <div className="font-mono-data text-base font-bold text-neutral-900 truncate">
            {post.price || 'Verified Deal'}
          </div>
        </div>
        <a
          href={affiliateUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleBuyClick}
          className="px-5 py-2.5 bg-neutral-900 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow cursor-pointer active:scale-98"
        >
          <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
          <span>Buy Now</span>
          <ExternalLink className="w-3 h-3 text-neutral-400" />
        </a>
      </div>
    </article>
  );
};
