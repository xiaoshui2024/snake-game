# 贪吃蛇游戏（HTML5 Canvas 版）

一个用于练习与演示的贪吃蛇游戏项目，包含模块化源码、渲染优化、以及可直接发布的打包版本（`dist/`）。本仓库已配置 GitHub Actions 自动部署到 GitHub Pages。

## 功能特性
- Canvas 渲染棋盘与蛇身
- 输入控制：键盘方向键/WASD，`P` 暂停，`R` 重开
- 增量渲染与缓冲合批：减少闪烁，提高绘制同步性
- 蛇头高亮与方向性光泽效果
- 简单过渡动画：蛇头方向亮条 2 帧插值
- 关卡：无障碍、固定关卡、随机障碍
- 分数与连吃加成；本地排行榜（Top5）

## 目录结构
```
├─ index.html            # 模块化源码入口（开发版）
├─ styles.css            # 样式（开发版）
├─ src/                  # 模块化源码（开发版）
│  ├─ utils.js
│  ├─ render.js
│  ├─ game.js
│  ├─ input.js
│  ├─ main.js
│  └─ main.legacy.js     # 旧版自包含入口（保留参考）
├─ dist/                 # 打包发布（发布版，无模块）
│  ├─ index.html
│  ├─ bundle.js
│  └─ styles.css
└─ .github/workflows/pages.yml  # GitHub Pages 自动部署工作流
```

## 开发与预览
- 开发版：直接打开 `index.html`（浏览器需支持 ES Modules），或用任意静态服务器
- 发布版预览：
  - 使用 `python -m http.server 8000`
  - 访问 `http://localhost:8000/dist/`

## 打包与资源优化
- JavaScript 打包：将 `src/` 模块合并至 `dist/bundle.js`，移除 `import/export`，以 IIFE 自执行作用域避免全局污染
- CSS 压缩：合并并最小化为 `dist/styles.css`
- HTML：`dist/index.html` 引用上述资源，并附带简易版本参数（如 `?v=20251111`）用于缓存失效

## GitHub Pages 自动发布
本仓库已包含 `.github/workflows/pages.yml` 工作流，推送到 `main` 分支即自动部署 `dist/` 到 GitHub Pages。

- 推送后约 1–2 分钟完成部署，可在仓库的 Actions 页面查看状态
- 访问地址（示例）：`https://xiaoshui2024.github.io/snake-game/`

如需手动设置：
- 仓库 Settings → Pages → Build and deployment：选择 Source: GitHub Actions

## 手动部署（备选）
- 使用其他静态托管（Netlify/Vercel/OSS 等），将 `dist/` 目录内容上传即可
- 如需进一步压缩（terser/cssnano 等），可在 CI 工具链中添加，但当前体量已满足轻量场景

## 使用说明
- 打开页面后，选择速度与关卡，可勾选“边界环绕”
- 键盘操作：方向键/WASD 控制移动；`P` 暂停；`R` 重开
- 游戏结束弹窗显示本局分数与历史 Top5

## 维护建议
- 修改 `src/` 源码后，请重新更新 `dist/`（本仓库当前为手工打包）
- 可后续引入自动打包脚本（例如 Rollup/Vite），并生成 Source Map 以便调试
- 简单版本号可用日期或内容哈希，用于缓存失效

## 许可
MIT（如需更改可在后续版本中更新）。