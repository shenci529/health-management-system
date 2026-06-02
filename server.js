import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';

async function createServer() {
  const app = express();
  const vite = await createViteServer({
    server: { middlewareMode: true },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@shared': path.resolve(__dirname, './shared'),
      },
    },
  });

  app.use(vite.middlewares);

  app.use('*', async (req, res, next) => {
    const url = req.originalUrl;
    try {
      let template = await vite.transformIndexHtml(url, '');
      if (!template || template === '') {
        template = `<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <title>幼儿中小学生健康管理系统</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;
      }
      res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });

  const port = 3000;
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

createServer();
