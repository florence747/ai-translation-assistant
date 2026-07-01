# AI 译文质检与译后编辑助手

一个可部署为静态网页的 AI 译文规则质检与译后编辑工具。基础版不直接翻译，不调用 AI API，不做联网术语检索，不做登录和后端服务。

## 功能范围

- 输入原文与 AI 译文，并统计段落、词数、中文字符和总字符数
- 维护术语表：原文术语、指定译名、禁用译名、备注
- 一键加载示例数据，便于演示和验收
- 执行术语一致性、数字/百分比/版本号、专名/缩写、英文残留、段落数量检查
- 按高/中/低风险显示问题，并支持按风险和类型筛选
- 生成双语译后编辑表，修改后译文默认填入 AI 译文
- 导出最终译文 TXT、检查报告 Markdown、修改记录 CSV、术语表 CSV
- 使用 localStorage 保存当前项目，刷新页面后保留数据，并提供清空本地数据按钮

## 使用步骤

1. 输入或粘贴原文、AI 译文，并维护术语表。
2. 点击“开始检查”，查看问题统计、问题列表和风格审校清单。
3. 生成双语编辑表，修改译文并填写说明，最后导出结果。

## 本地运行

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
npm run preview
```

构建产物会生成在 `dist/` 目录，可部署到 Vercel、Netlify、Cloudflare Pages 或 GitHub Pages。

## 静态部署建议

- Vercel / Netlify：导入项目后，构建命令填写 `npm run build`，输出目录填写 `dist`。
- GitHub Pages：构建后发布 `dist` 目录；如果部署在子路径，可按 Vite 文档配置 `base`。
- Cloudflare Pages：构建命令 `npm run build`，输出目录 `dist`。

## 当前不支持

- 不直接生成翻译
- 不调用 AI API
- 不联网检索术语
- 不上传或导出 Word 文档
- 不做账号、权限和多人协作

## 直接预览

当前仓库额外提供 `standalone.html`，用于在没有安装依赖时直接预览核心流程。正式部署请优先使用 React + TypeScript + Vite 构建产物。
