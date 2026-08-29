import { MDXRemoteSerializeResult } from 'next-mdx-remote';

export type ReadingTime = {
  text: string;
};

export type Post = {
  /** Note grouping shown on the index. First entry drives the section label. */
  categories?: string[];
  colorFeatured?: string;
  date: string;
  updated: string;
  featured?: boolean;
  fontFeatured?: string;
  keywords?: string[];
  slug: string;
  /** Content provenance. `eriri` marks personal/migrated notes shown on the main index. */
  source?: string;
  /** Original 小红书 hashtags, preserved verbatim from the note. */
  tags?: string[];
  subtitle: string;
  seoTitle?: string;
  title: string;
};

export type FrontMatterPost = {
  frontMatter: Post & {
    readingTime: ReadingTime;
  };
  tweetIDs: string[];
  mdxSource: MDXRemoteSerializeResult;
};
