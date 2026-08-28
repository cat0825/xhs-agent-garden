import fs from 'fs';

import chalk from 'chalk';
import { globby } from 'globby';

/* eslint-disable no-console */
(async () => {
  console.info(chalk.cyan('info'), ` - Generating sitemap`);

  const siteUrl = (
    process.env.SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    'http://127.0.0.1:3460'
  ).replace(/\/$/, '');

  const pages = await globby([
    'pages/*.js',
    'pages/*.tsx',
    'content/**/*.mdx',
    '!pages/_*.js',
    '!pages/_*.tsx',
    '!pages/api',
    '!pages/404.tsx',
    '!pages/og.tsx',
    '!content/_migration/**',
    '!content/i18n/**',
  ]);

  // Concept pages are dynamic routes; list them from glossary.json when present.
  let conceptPaths = [];
  try {
    const glossary = JSON.parse(
      fs.readFileSync('content/glossary.json', 'utf8')
    );
    conceptPaths = glossary
      .map((item) => {
        if (item.slug) return item.slug;
        const term = String(item.term || '')
          .toLowerCase()
          .normalize('NFKD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');
        return term;
      })
      .filter(Boolean)
      .map((slug) => `/concepts/${slug}`);
  } catch {
    conceptPaths = [];
  }

  const routes = [
    ...pages.map((page) => {
      const path = page
        .replace('pages', '')
        .replace('content', '/posts')
        .replace('.js', '')
        .replace('.tsx', '')
        .replace('.ts', '')
        .replace('.mdx', '');
      return path === '/index' ? '' : path;
    }),
    ...conceptPaths,
  ];

  const uniqueRoutes = [...new Set(routes)];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
      ${uniqueRoutes
        .map((route) => {
          return `<url>
  <loc>${`${siteUrl}${route}/`}</loc>
  <changefreq>daily</changefreq>
  <priority>0.7</priority>
</url>`;
        })
        .join('')}
        </urlset>
    `;

  fs.writeFileSync('public/sitemap.xml', sitemap);
})();
