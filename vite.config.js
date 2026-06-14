import { defineConfig } from 'vite'
import { createVuePlugin } from 'vite-plugin-vue2'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://localhost:3002',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    // 开启 CSS 代码分割
    cssCodeSplit: true,
    // 目标浏览器版本，使用现代语法减少体积
    target: 'es2015',
    // 开启压缩
    minify: 'esbuild',
    // 禁止生成 source map 减少体积
    sourcemap: false,
    // 配置 Rollup 代码分割
    rollupOptions: {
      output: {
        // 把大的依赖库拆分成独立的 chunk，便于浏览器并行下载和缓存
        manualChunks: {
          // Vue 核心库
          'vue-vendor': ['vue', 'vue-router'],
          // Element UI 组件库（较大，单独打包）
          'element-ui': ['element-ui'],
          // ECharts 图表库（较大，单独打包）
          'echarts': ['echarts'],
          // HTTP 请求库
          'axios': ['axios']
        },
        // JS 文件输出路径和命名
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        // CSS 文件输出路径和命名
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'assets/css/[name]-[hash].css'
          }
          return 'assets/[ext]/[name]-[hash].[ext]'
        }
      }
    },
    // 大于 500KB 的 chunk 给出警告（帮助发现意外大文件）
    chunkSizeWarningLimit: 500
  },
  base: './',
  define: {
    'process.env.VITE_API_BASE': JSON.stringify(process.env.VITE_API_BASE || '')
  },
  plugins: [createVuePlugin()],
  // 预构建优化：加速冷启动
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      'element-ui',
      'echarts',
      'axios'
    ]
  }
})
