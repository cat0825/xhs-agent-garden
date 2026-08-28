import { ImageLoaderProps } from 'next/legacy/image';

/**
 * Image loader for Craft Garden.
 * - Absolute URLs (http/https/data) pass through.
 * - Local/static paths stay local so static export + Cloudflare Pages work
 *   without Maxime's assets CDN.
 * - Bare legacy Maxime image keys still resolve to his CDN as a fallback.
 */
export const cloudflareLoader = ({ src, width, quality }: ImageLoaderProps) => {
  const params = [`w=${width}`, `q=${quality || 75}`];

  if (
    src.startsWith('http://') ||
    src.startsWith('https://') ||
    src.startsWith('data:') ||
    src.startsWith('blob:')
  ) {
    return src;
  }

  if (src.startsWith('/') || src.startsWith('./') || src.startsWith('../')) {
    return src;
  }

  // Legacy Maxime content keys (no leading slash) used in original essays.
  return `https://assets.maximeheckel.com/images/${src}?${params.join('&')}`;
};
