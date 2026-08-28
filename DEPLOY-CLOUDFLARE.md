# Deploy Craft Garden to Cloudflare Pages

目标：个人博客 **静态托管**（不买服务器、免备案）。  
AI 搜索 / Supabase / Vercel KV 在本路径下 **不部署**（`pages/api` 构建时会暂存移出）。

## 架构

```text
GitHub push → Cloudflare Pages build → out/ 静态资源 → *.pages.dev CDN
```

本地验证：

```bash
cd /Users/qianyuhe/Documents/GitHub/craft-garden-src
export PATH="$HOME/.local/bin:$PATH"
# 可选：正式域名或 pages 预览域名
export SITE_URL="https://your-project.pages.dev"
pnpm build:static
# 产物：./out
npx --yes serve out -l 4173
# 打开 http://127.0.0.1:4173
```

## 一、准备 GitHub 仓库

本目录目前是本地拷贝（基于 Maxime MIT shell），**没有 origin remote**。

### 推荐：推到你自己的私有/公开仓

```bash
cd /Users/qianyuhe/Documents/GitHub/craft-garden-src

# 若还没有 commit 个人改动，先提交（自行审查 diff）
git status
# git add -A && git commit -m "feat: personal craft garden + cloudflare static export"

# 创建远程（示例：私有仓）
gh repo create cat0825/craft-garden --private --source=. --remote=origin --push
# 或公开：去掉 --private
```

注意内容许可：原 Maxime 文章是 **CC BY-NC**；你自己的 eriri 迁移文可按你的许可。上线前建议最终决定是否保留 Maxime 原文。

## 二、Cloudflare Pages 控制台（推荐，零 CLI）

1. 打开 [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
2. 授权 GitHub，选择 `cat0825/craft-garden`（或你的仓名）
3. 构建设置：

| 字段                   | 值                                              |
| ---------------------- | ----------------------------------------------- |
| Framework preset       | **None**（或 Next.js 也行，但我们用自定义命令） |
| Build command          | `pnpm build:static`                             |
| Build output directory | `out`                                           |
| Root directory         | `/`（默认）                                     |
| Node version           | **20** 或 **22**（环境变量 `NODE_VERSION=20`）  |

1. Environment variables（Production + Preview 都建议加）：

| Name                        | Value                         | 说明                                 |
| --------------------------- | ----------------------------- | ------------------------------------ |
| `NODE_VERSION`              | `20`                          | Pages 构建镜像 Node                  |
| `SITE_URL`                  | `https://<project>.pages.dev` | 首次可先填预览域名，绑自定义域后再改 |
| `NEXT_PUBLIC_SITE_URL`      | 同 `SITE_URL`                 | 前端/SEO                             |
| `STATIC_EXPORT`             | `1`                           | 保险（脚本也会设）                   |
| `NEXT_PUBLIC_STATIC_EXPORT` | `1`                           | 图片 unoptimized                     |

1. **Save and Deploy** → 等构建日志出现 `OK → out/` 和部署成功。
2. 访问 `https://<project>.pages.dev/`，检查：
   - `/`
   - `/posts/pi-agent-harness-guide/`
   - `/concepts/agent-harness/`
   - `/glossary/`

### 绑定自己的域名（可选，仍免备案）

Pages → 项目 → **Custom domains** → 添加域名 → 按提示把 DNS 指到 Cloudflare（域名最好也放在 CF 下，一键验证）。

改域名后把 `SITE_URL` / `NEXT_PUBLIC_SITE_URL` 改成 `https://你的域名` 并重新部署。

## 三、用 Wrangler 直传（可选，不绑 Git）

适合本地先发一版：

```bash
# 浏览器登录（需交互）
npx wrangler login

export SITE_URL="https://craft-garden.pages.dev"   # 或你的项目名
pnpm build:static

# 项目名首次会提示创建
npx wrangler pages deploy out --project-name=craft-garden
```

之后每次：

```bash
export SITE_URL="https://craft-garden.pages.dev"
pnpm build:static
npx wrangler pages deploy out --project-name=craft-garden
```

## 四、构建脚本在做什么

`pnpm build:static` → `scripts/build-static.mjs`：

1. **暂存** `pages/api`（避免 `output: 'export'` 报错）
2. 设 `STATIC_EXPORT=1`、`SITE_URL=...`
3. 生成 RSS / sitemap
4. `next build`（`next.config.ts` 里 `output: 'export'`）
5. 把 `public/_headers` 拷到 `out/`
6. **恢复** `pages/api`（本地开发 AI 搜索代码仍在）

本地 `pnpm dev` **不受影响**（不设 `STATIC_EXPORT` 时仍是常规 Next server）。

## 五、已知限制（静态路径）

| 功能                           | 静态部署后                                  |
| ------------------------------ | ------------------------------------------- |
| 文章 / 概念 / 主题 / 术语表    | ✅ 可用                                     |
| 日夜主题 / 中英切换            | ✅ 纯前端                                   |
| Dock 命令菜单（Cmd）           | ✅ 仅导航 / 外链（无 AI / 无 API 搜索）     |
| AI 语义搜索 / Ask / `/api/*`   | ❌ **已从 UI 移除**（代码可本地保留）       |
| Buy-me-a-coffee / supporters   | ❌ **已从 UI 移除**                         |
| `search-index.json`            | ❌ 不打包（>25MB 且 CF 拒绝）               |
| 原 Maxime CDN 图（无本地副本） | ⚠️ 依赖 `assets.maximeheckel.com`，可能裂图 |
| Next Image 优化                | ❌ 已 `unoptimized`                         |

若以后要 AI 搜索：挂 Cloudflare Workers / 独立 API，与静态站解耦，再单独加回入口。

## 六、推荐操作顺序（今天）

1. 本地 `pnpm build:static` 确认 `out/index.html` 存在
2. `gh repo create` 推送
3. Cloudflare Pages 接 Git，按上表填构建
4. 浏览器验收关键路径
5. （可选）绑域名 + 改 `SITE_URL`

## 七、故障排查

- **Build failed: export incompatible with API routes**  
  确认走的是 `pnpm build:static`，不是裸 `pnpm build`。
- **fallback / dynamic path error**  
  `pages/posts/[slug].tsx` 必须 `fallback: false`（已改）。
- **图片 400 / optimizer**  
  确认 env 有 `NEXT_PUBLIC_STATIC_EXPORT=1` 或走了 `build:static`。
- **RSS/sitemap 还是 localhost**  
  Pages 环境变量没设 `SITE_URL`。
- **pnpm not found on Pages**  
  仓库有 `packageManager` 字段时 CF 一般会用 corepack；否则在 Build command 前加  
  `corepack enable && corepack prepare pnpm@9.12.3 --activate && pnpm build:static`。

## 八、费用

Cloudflare Pages 免费档对个人博客通常足够（构建次数与带宽有限额，正常更新远用不完）。  
**不需要买服务器，不需要 ICP 备案**（解析到 CF 海外边缘即可）。
