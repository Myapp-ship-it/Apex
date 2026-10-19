import React from 'react';

/**
 * Ensures any image URL stored in Supabase or entered by admin is properly formatted
 * (e.g. includes https://, handles protocol-relative URLs, and maps dev-only assets in production)
 */
export const formatSafeImageUrl = (rawUrl?: string | null): string => {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  const trimmed = rawUrl.trim();
  if (!trimmed) return '';

  // 1. Protocol-relative URL like '//images.unsplash.com/...'
  if (trimmed.startsWith('//')) {
    return `https:${trimmed}`;
  }

  // 2. Already full valid URL with http/https or data URI or blob URI
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }

  // 3. Domain without https:// protocol (e.g. 'images.unsplash.com/...', 'm.media-amazon.com/...', 'xyz.supabase.co/...')
  if (/^[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+(\/|$)/.test(trimmed) && !trimmed.startsWith('/')) {
    return `https://${trimmed}`;
  }

  // 4. Production fallback for local dev paths like '/src/assets/images/...'
  // In a deployed production build, /src/... is not served by Vite, so provide dependable high-res photography:
  if (trimmed.startsWith('/src/assets/images/') || trimmed.includes('/assets/images/')) {
    const lower = trimmed.toLowerCase();
    if (lower.includes('headphone')) {
      return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80';
    }
    if (lower.includes('keyboard')) {
      return 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1200&q=80';
    }
    if (lower.includes('chair') || lower.includes('ergonomic')) {
      return 'https://images.unsplash.com/photo-1580481077195-c328a37db729?auto=format&fit=crop&w=1200&q=80';
    }
    if (lower.includes('espresso') || lower.includes('coffee')) {
      return 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=1200&q=80';
    }
    if (lower.includes('camera')) {
      return 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80';
    }
    if (lower.includes('backpack') || lower.includes('travel')) {
      return 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=80';
    }
    return 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1200&q=80';
  }

  // 5. Normal relative path like '/images/...'
  if (trimmed.startsWith('/')) {
    return trimmed;
  }

  // 6. Generic domain fallback
  return `https://${trimmed}`;
};

/**
 * Fallback error handler for broken img elements
 */
export const handleImageError = (
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  fallbackSrc: string = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80'
) => {
  const target = e.currentTarget;
  if (!target || target.src === fallbackSrc) return;

  const originalSrc = target.getAttribute('src') || '';

  // If protocol was missing in src, try prepending https:// before falling back
  if (originalSrc && !originalSrc.startsWith('http://') && !originalSrc.startsWith('https://') && !originalSrc.startsWith('data:')) {
    const fixed = `https://${originalSrc.replace(/^\/+/, '')}`;
    if (target.src !== fixed) {
      target.src = fixed;
      return;
    }
  }

  target.src = fallbackSrc;
};
