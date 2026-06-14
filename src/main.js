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

// 后端 API 基础地址
const PUBLIC_API_BASE = process.env.VITE_API_BASE || '';
Vue.prototype.$API_BASE = PUBLIC_API_BASE;
Vue.prototype.$api = function (path) {
  if (typeof path === 'string' && path.startsWith('/')) {
    return PUBLIC_API_BASE + path;
  }
  return path;
};

Vue.config.productionTip = false;

// ==================== 创建并挂载 Vue 应用 ====================
new Vue({
  router,
  render: h => h(App)
}).$mount('#app');
