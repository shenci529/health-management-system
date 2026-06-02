# GitHub Pages 部署指南

由于网络连接问题，你可以尝试以下方案：

## 方案一：本地运行（推荐）
直接在本地运行开发服务器，访问 http://localhost:3000/health-management-system/

## 方案二：手动部署到 GitHub Pages

### 步骤 1：确保网络连接正常
- 检查是否能正常访问 https://github.com
- 如果不能，请检查网络设置或使用代理

### 步骤 2：构建项目
```bash
npm run build
```

### 步骤 3：创建 gh-pages 分支
```bash
git checkout -b gh-pages
```

### 步骤 4：只保留 dist 目录内容
```bash
# 删除所有文件除了 dist
# 然后将 dist 目录内容移动到根目录
```

### 步骤 5：提交并推送
```bash
git add .
git commit -m "Deploy to GitHub Pages"
git push origin gh-pages
```

### 步骤 6：配置 GitHub Pages
- 进入仓库 Settings -> Pages
- Source 选择 gh-pages 分支
- 保存

## 方案三：使用其他部署平台

### Vercel 部署
1. 访问 https://vercel.com
2. 使用 GitHub 账号登录
3. 导入你的仓库
4. 一键部署

### Netlify 部署
1. 访问 https://netlify.com
2. 使用 GitHub 账号登录
3. 导入你的仓库
4. 一键部署

### Railway 部署
项目已包含 Railway 配置，直接在 https://railway.app 部署即可

## 重要提示

当前项目配置：
- base URL: /health-management-system/
- 路由模式: hash 模式
- 构建目录: dist

这些都已正确配置，只要网络正常，部署应该就会成功。
