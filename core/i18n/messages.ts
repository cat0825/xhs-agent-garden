export type Locale = 'en' | 'zh';

export const DEFAULT_LOCALE: Locale = 'zh';
export const LOCALE_STORAGE_KEY = 'craft-garden-locale';

type Messages = {
  about: string;
  articles: string;
  cmd: string;
  concept: string;
  concepts: string;
  essays: string;
  exploreByTheme: string;
  exploreByThemeHint: string;
  functionKind: string;
  glossary: string;
  glossaryDesc: string;
  home: string;
  index: string;
  language: string;
  nearbyConcepts: string;
  noRelatedPosts: string;
  openGlossary: string;
  relatedEssays: string;
  stayWithCluster: string;
  themeDark: string;
  themeLight: string;
  themeToggle: string;
  translatedFallback: string;
  alsoKnownAs: string;
  introHeadline: string;
  introLeadBefore: string;
  introLeadName: string;
  introLeadAfter: string;
  introLeadTopics: string;
  introLeadEnd: string;
  introSide: string;
  introSideEmphasis: string;
  introSideEnd: string;
};

export const messages: Record<Locale, Messages> = {
  en: {
    about: 'About',
    articles: 'Articles',
    cmd: 'Cmd',
    concept: 'Concept',
    concepts: 'Concepts',
    essays: 'essays',
    exploreByTheme: 'Explore by theme',
    exploreByThemeHint:
      'Keyword paths into the essays — concept clusters for deeper reading.',
    functionKind: 'function',
    glossary: 'Glossary',
    glossaryDesc:
      'A glossary of technical terms mentioned across my blog posts.',
    home: 'Home',
    index: 'Index',
    language: 'Language',
    nearbyConcepts: 'Nearby concepts',
    noRelatedPosts: 'No essay origins recorded for this concept yet.',
    openGlossary: 'Open full glossary',
    relatedEssays: 'Related essays',
    stayWithCluster: 'Stay with this cluster',
    themeDark: 'Activate dark mode',
    themeLight: 'Activate light mode',
    themeToggle: 'Theme toggle',
    translatedFallback:
      'Chinese body not available yet — showing the original English essay.',
    alsoKnownAs: 'Also known as',
    introHeadline:
      'Field notes on landing an AI Agent job: interviews, roadmaps, and role requirements.',
    introLeadBefore: "Hi, I'm",
    introLeadName: '千羽鹤',
    introLeadAfter:
      ' (qianyuhe), and this is the AI Agent job-hunting garden. I collect',
    introLeadTopics:
      'interview debriefs, study roadmaps, and job-requirement breakdowns',
    introLeadEnd: '.',
    introSide:
      'Every note keeps the original 小红书 record intact — the body, the images, the comment excerpts — plus',
    introSideEmphasis: 'my own annotations',
    introSideEnd:
      '. The goal is a searchable, re-readable trail instead of screenshots lost in a camera roll.',
  },
  zh: {
    about: '关于',
    articles: '文章',
    cmd: '命令',
    concept: '概念',
    concepts: '概念',
    essays: '篇',
    exploreByTheme: '按主题探索',
    exploreByThemeHint: '从关键词走进长文——概念簇带你往深处读。',
    functionKind: '函数',
    glossary: '术语表',
    glossaryDesc: '博客文章中出现的技术术语汇总，可点进概念页继续深潜。',
    home: '首页',
    index: '首页',
    language: '语言',
    nearbyConcepts: '相近概念',
    noRelatedPosts: '这个概念还没有关联到文章。',
    openGlossary: '打开完整术语表',
    relatedEssays: '相关文章',
    stayWithCluster: '留在这个主题簇',
    themeDark: '切换到夜间模式',
    themeLight: '切换到日间模式',
    themeToggle: '主题切换',
    translatedFallback: '中文正文尚未就绪，当前显示英文原文。',
    alsoKnownAs: '亦称',
    introHeadline: 'AI Agent 求职笔记：面经、学习路线、岗位要求的一手记录。',
    introLeadBefore: '你好，我是',
    introLeadName: '千羽鹤',
    introLeadAfter: '（qianyuhe），这里是 AI Agent 求职花园。我在这里收集：',
    introLeadTopics: '面经复盘、学习路线与岗位要求拆解',
    introLeadEnd: '。',
    introSide: '每篇笔记都保留小红书原始记录——正文、配图、评论摘录，以及',
    introSideEmphasis: '我自己的批注',
    introSideEnd:
      '。目的是让这些内容可搜索、可回读，而不是烂在相册里的一堆截图。',
  },
};

export const themeTitlesZh: Record<string, string> = {
  'shaders-and-graphics': 'Shader 与图形',
  'motion-and-interfaces': '动效与界面',
  'systems-and-craft': '系统与手艺',
};

export const themeDescriptionsZh: Record<string, string> = {
  'shaders-and-graphics': 'Raymarching、抖动、大气散射与绘画感 shader craft。',
  'motion-and-interfaces': '布局动画、弹簧物理与有意图的交互模式。',
  'systems-and-craft': '设计系统、语义搜索与精致长文背后的工具栈。',
};

/** Chinese overlays for selected concept definitions (original English remains in glossary.json). */
export const conceptDefinitionsZh: Record<string, string> = {
  'volumetric-raymarching':
    '通过在体积中沿射线采样、累积颜色与密度来渲染云、雾等体积效果的技术。',
  'signed-distance-fields-sdf':
    '用到形状表面的有符号距离来表示几何体的方法，常用于 raymarching。',
  halftone: '用大小/密度变化的网点模拟连续色调的图像技术。',
  'post-processing-effect': '在场景渲染完成后，对最终画面再做一遍处理的效果。',
  'atmospheric-scattering':
    '模拟光线在大气中散射的渲染技术，用于天空、日落与远景雾效。',
  'layout-animation': '在元素布局变化时，平滑插值位置与尺寸的动画模式。',
  'easing-functions': '控制动画速度曲线的函数，决定加速、减速与节奏。',
  'shared-layout-animation':
    '让共享布局的元素在不同状态之间做连续过渡的动画技术。',
  'linear-easing': '匀速插值的缓动：全程速度恒定。',
  mdx: '可在 Markdown 中嵌入 JSX/组件的内容格式，常用于组件化博客。',
  'uv-coordinates': '把纹理映射到三维表面的归一化二维坐标。',
  antialiasing: '通过混合边缘像素来减轻锯齿的图形技术。',
  'post-processing-pass': '后处理管线中的一次完整屏幕空间渲染通道。',
};
