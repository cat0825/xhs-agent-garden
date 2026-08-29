// Prefer deploy-time URL (Cloudflare Pages). Local default stays on :3460.
const siteOrigin = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.SITE_URL ||
  'https://takina.xyz'
).replace(/\/$/, '');

const config = {
  pathPrefix: '/',
  keywords: [
    'AI Agent',
    'Agent 求职',
    '面经',
    '算法岗',
    '大模型',
    'LLM',
    '小红书笔记',
    '学习路线',
    '岗位要求',
    '实习',
    '校招',
  ],
  title: 'AI Agent 求职花园 · 千羽鹤',
  titleAlt: 'AI Agent 求职花园',
  description:
    'AI Agent 求职笔记花园：面经复盘、学习路线、岗位要求拆解。来自小红书的一手记录与批注。',
  url: siteOrigin, // Site domain without trailing slash
  siteUrl: `${siteOrigin}/`, // url + pathPrefix
  siteLanguage: 'zh-CN', // Language Tag on <html> element
  logo: 'src/static/logo/logo.png',
  image: `${siteOrigin}/static/og/main-og-image.png`,
  favicon: 'static/favicon.png', // Manifest favicon generation
  shortName: 'AgentGarden', // Shortname for manifest, must be shorter than 12 characters
  author: '千羽鹤', // Author for schemaORGJSONLD
  themeColor: '#000000',
  backgroundColor: '#ffffff',
  twitter: '@qianyuhe',
  twitterDesc: '千羽鹤 — AI Agent 求职笔记花园：面经、学习路线、岗位要求。',
};

export default config;
