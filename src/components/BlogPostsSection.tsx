import React from 'react';
import { Newspaper, Calendar, ArrowRight, Tag, DollarSign } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  category?: string;
  price?: string;
  content: string;
  image_url?: string;
  author_email?: string;
  created_at: string;
}

interface BlogPostsSectionProps {
  posts: BlogPost[];
  onOpenAdmin: () => void;
}

export const BlogPostsSection: React.FC<BlogPostsSectionProps> = ({ posts, onOpenAdmin }) => {
  if (posts.length === 0) return null;

  return (
    <section id="editorial-posts" className="py-12 border-t border-neutral-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">
              <Newspaper className="w-3.5 h-3.5 text-neutral-900" />
              <span>Lab Chronicles & Buying Advice</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
              In-Depth Editorial Guides
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map((post) => (
            <article
              key={post.id}
              className="bg-neutral-50 border border-neutral-200/80 rounded-2xl p-5 hover:border-neutral-300 transition-all flex flex-col justify-between group shadow-2xs hover:shadow-sm"
            >
              <div className="space-y-4">
                {post.image_url && (
                  <div className="aspect-16/9 rounded-xl overflow-hidden bg-neutral-200 border border-neutral-200 relative">
                    <img
                      src={post.image_url}
                      alt={post.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                      loading="lazy"
                    />
                    {post.category && (
                      <div className="absolute top-3 left-3 bg-neutral-900/90 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded">
                        {post.category}
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    {/* Unboxed Metadata */}
                    <div className="flex items-center gap-2 text-xs text-neutral-500">
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
                    </div>

                    {/* Price Tag if provided */}
                    {post.price && (
                      <div className="font-mono-data text-xs font-bold text-neutral-900 bg-white px-2.5 py-1 rounded-lg border border-neutral-200 shadow-2xs">
                        {post.price}
                      </div>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-neutral-900 leading-snug group-hover:text-neutral-700 transition-colors">
                    {post.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed line-clamp-4">
                    {post.content}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-2 border-t border-neutral-200/60 flex items-center justify-between text-xs font-semibold text-neutral-900">
                <span className="text-neutral-500 font-normal">
                  {post.author_email || 'ApexWire Editorial'}
                </span>
                <span className="flex items-center gap-1 group-hover:underline cursor-pointer">
                  <span>Read Guide</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
