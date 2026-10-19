import React from 'react';
import { Newspaper, Calendar, ArrowRight, ShoppingBag, ExternalLink, ShieldCheck } from 'lucide-react';
import { BlogPost } from './SinglePostPage';
import { formatSafeImageUrl, handleImageError } from '../lib/imageUtils';

interface BlogPostsSectionProps {
  posts: BlogPost[];
  onOpenAdmin: () => void;
  onOpenPost: (post: BlogPost) => void;
  onBuyNowPost?: (link: string, title: string) => void;
}

export const BlogPostsSection: React.FC<BlogPostsSectionProps> = ({
  posts,
  onOpenAdmin,
  onOpenPost,
  onBuyNowPost
}) => {
  if (posts.length === 0) return null;

  return (
    <section id="editorial-posts" className="py-14 border-t border-neutral-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">
              <Newspaper className="w-3.5 h-3.5 text-neutral-900" />
              <span>Lab Chronicles & Buying Advice</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
              In-Depth Editorial Guides & Articles
            </h2>
          </div>
          <button
            onClick={onOpenAdmin}
            className="text-xs font-semibold text-neutral-600 hover:text-neutral-900 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>Manage Posts in Admin Panel</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Post Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {posts.map((post) => {
            const rawLink = (post.affiliate_link || post.buy_now_link || '').trim();
            const affiliateLink = rawLink.length > 0
              ? rawLink
              : 'https://www.amazon.com/dp/B0AFF123?tag=apexwire-20';

            const postImageUrl = formatSafeImageUrl(
              post.image_url ||
              (post as any).image ||
              (post as any).imageUrl ||
              'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1200&q=80'
            );

            const handleCardClick = () => {
              if (typeof onOpenPost === 'function') {
                onOpenPost(post);
              }
            };

            const handleBuyNow = (e: React.MouseEvent) => {
              e.stopPropagation();
              if (typeof onBuyNowPost === 'function') {
                onBuyNowPost(affiliateLink, post.title);
              }
            };

            return (
              <article
                key={post.id}
                onClick={handleCardClick}
                className="bg-neutral-50 border border-neutral-200/90 rounded-2xl p-5 hover:border-neutral-400 hover:bg-white transition-all flex flex-col justify-between group shadow-2xs hover:shadow-lg cursor-pointer"
              >
                <div className="space-y-4">
                  {/* Thumbnail (Clickable) */}
                  <div className="aspect-16/9 rounded-xl overflow-hidden bg-neutral-200 border border-neutral-200 relative">
                    <img
                      src={postImageUrl}
                      alt={post.title}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        handleImageError(e, 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1200&q=80');
                      }}
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500 ease-out"
                      loading="lazy"
                    />
                    {post.category && (
                      <div className="absolute top-3 left-3 bg-neutral-900/90 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded shadow-xs">
                        {post.category}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2.5">
                    {/* Unboxed Metadata & Price Header */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                        {post.category && (
                          <>
                            <span className="font-semibold text-neutral-800">{post.category}</span>
                            <span>·</span>
                          </>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(post.created_at).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                        <span>·</span>
                        {/* Always display generic Editorial Team - never show admin email */}
                        <span className="font-medium text-neutral-600">Editorial Team</span>
                      </div>

                      {/* Price Tag */}
                      {post.price && (
                        <div className="font-mono-data text-xs font-bold text-neutral-900 bg-white px-2.5 py-1 rounded-lg border border-neutral-200 shadow-2xs">
                          {post.price}
                        </div>
                      )}
                    </div>

                    {/* Title */}
                    <h3
                      className="text-lg sm:text-xl font-bold text-neutral-900 leading-snug group-hover:text-neutral-700 transition-colors"
                      style={{ textWrap: 'balance' }}
                    >
                      {post.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed line-clamp-3">
                      {post.content}
                    </p>
                  </div>
                </div>

                {/* Card Footer: Prominent Actions (Read Guide + Buy Now Affiliate Button) */}
                <div className="pt-4 mt-4 border-t border-neutral-200/80 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-1 text-[11px] text-neutral-500">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Tested Guide · By Editorial Team</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCardClick();
                      }}
                      className="px-3.5 py-2 text-xs font-semibold text-neutral-700 hover:text-neutral-900 bg-white hover:bg-neutral-100 border border-neutral-300 rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                    >
                      <span>Read Guide</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <a
                      href={affiliateLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={handleBuyNow}
                      className="px-4 py-2 text-xs font-bold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-all shadow-xs hover:shadow flex items-center gap-1.5 cursor-pointer active:scale-98"
                      title="Direct Buy via Affiliate Link"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                      <span>Buy Now {post.price ? `(${post.price})` : ''}</span>
                      <ExternalLink className="w-3 h-3 text-neutral-400" />
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};
