import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/* eslint-disable no-console */
import chalk from 'chalk';
import matter from 'gray-matter';
import RSS from 'rss';

import siteConfig from '../config/site.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
  console.info(chalk.cyan('info'), ` - Generating RSS feed`);

  const root = process.cwd();

  function getPosts() {
    const files = fs
      .readdirSync(path.join(root, 'content'))
      .filter((name) => name.endsWith('.mdx'));

    const posts = files.reduce((allPosts, postSlug) => {
      const source = fs.readFileSync(
        path.join(root, 'content', postSlug),
        'utf8'
      );
      const { data } = matter(source);

      return [
        {
          ...data,
          slug: postSlug.replace('.mdx', ''),
        },
        ...allPosts,
      ];
    }, []);

    return posts;
  }

  try {
    // Prefer SITE_URL for Cloudflare/production; fall back to local dev.
    const siteUrl = (
      process.env.SITE_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      'http://127.0.0.1:3460'
    ).replace(/\/$/, '');

    const feed = new RSS({
      title: siteConfig.title,
      description: siteConfig.description,
      site_url: siteUrl,
      feed_url: `${siteUrl}/rss.xml`,
      image_url: `${siteUrl}/static/og/main-og-image.png`,
      language: siteConfig.siteLanguage,
    });

    const content = [...getPosts()].sort((post1, post2) =>
      post1.date > post2.date ? -1 : 1
    );

    content.forEach((post) => {
      const url = `${siteUrl}/posts/${post.slug}`;

      feed.item({
        title: post.title,
        description: post.subtitle,
        date: new Date(post.date),
        author: siteConfig.author,
        url,
        guid: url,
      });
    });

    const rss = feed.xml({ indent: true });
    fs.writeFileSync(path.join(__dirname, '../public/rss.xml'), rss);
  } catch (error) {
    console.error(
      chalk.red('error'),
      ` - An error occurred while generating the RSS feed`
    );
    console.error(error);
    process.exit(1);
  }
})();
