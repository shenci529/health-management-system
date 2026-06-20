// ==================== 前端项目入口文件（性能优化版）====================
// 优化点：
//   1. ECharts 改为按需加载（不在首屏加载，约节省 500KB+）
//   2. Element UI 仅引入一次
//   3. 路由懒加载（已在 router/index.js 完成）

import Vue from 'vue';
import App from './App.vue';
import router from './router';

import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import './index.css';

// ==================== 全局配置 ====================
// 安装 Element UI
Vue.use(ElementUI);

// ECharts 改为懒加载：首次调用 this.$echarts 时才动态引入
// 这样首屏不会加载 ECharts 的大体积代码（约 500KB）
let echartsModule = null;
Object.defineProperty(Vue.prototype, '$echarts', {
  get() {
    return {
      init: async (dom, theme, opts) => {
        if (!echartsModule) {
          echartsModule = await import('echarts');
        }
        return echartsModule.init(dom, theme, opts);
      }
    };
  }
});

// 后端 API 基础地址（智能检测运行环境）
// 优先级：
//   1. 构建时注入的 VITE_API_BASE 环境变量（GitHub Pages 部署时使用）
//   2. 本地开发：localhost:3002
//   3. 生产环境（与前端同域）：相对路径（空字符串）
let PUBLIC_API_BASE = '';
const host = (typeof window !== 'undefined' && window.location) ? window.location.hostname : '';
const isLocalhost = host === 'localhost' || host === '127.0.0.1' || host === '';
const isGithubPages = (typeof window !== 'undefined' && window.location) && window.location.hostname.includes('github.io');

if (process.env.VITE_API_BASE) {
  PUBLIC_API_BASE = process.env.VITE_API_BASE;
} else if (isLocalhost) {
  PUBLIC_API_BASE = 'http://localhost:3002';
}
// 其他情况（同域部署如 Render/Vercel）使用相对路径 ''

Vue.prototype.$API_BASE = PUBLIC_API_BASE;
Vue.prototype.$api = function (path) {
  if (typeof path === 'string' && path.startsWith('/')) {
    return PUBLIC_API_BASE + path;
  }
  return path;
};

// 在控制台打印当前使用的 API 地址（方便调试）
if (typeof console !== 'undefined') {
  console.log('🌐 健康管理系统 - API 基础地址:', PUBLIC_API_BASE || '(相对路径 - 同域部署)');
}

Vue.config.productionTip = false;

// ==================== 创建并挂载 Vue 应用 ====================
new Vue({
  router,
  render: h => h(App)
}).$mount('#app');
