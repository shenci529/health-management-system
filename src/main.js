// ==================== 前端项目入口文件 ====================
// 这里是Vue应用的启动入口，所有全局配置在这里完成

// 引入Vue核心库
import Vue from 'vue';

// 引入根组件App.vue（整个应用的最顶层组件）
import App from './App.vue';

// 引入路由配置文件（管理页面跳转）
import router from './router';

// 引入ElementUI组件库（提供现成的UI组件，比如按钮、表格、表单等）
import ElementUI from 'element-ui';

// 引入ElementUI的样式文件（让UI组件有美观的外观）
import 'element-ui/lib/theme-chalk/index.css';

// 引入ECharts图表库（用于绘制数据可视化图表，比如柱状图、折线图等）
import * as echarts from 'echarts';

// ==================== 全局配置 ====================

// 将ECharts挂载到Vue原型上，这样所有组件都可以通过 this.$echarts 来使用图表库
Vue.prototype.$echarts = echarts;

// 安装ElementUI插件，让ElementUI的所有组件在Vue项目中可用
Vue.use(ElementUI);

// 后端API基础地址
// 生产构建时由 GitHub Actions 的 VITE_API_BASE 变量注入（Railway后端地址）
// 本地开发时 vite.config.js 的 proxy 会将 /api 请求转发到 localhost:3002
const PUBLIC_API_BASE = process.env.VITE_API_BASE || '';
Vue.prototype.$API_BASE = PUBLIC_API_BASE;
Vue.prototype.$api = function(path) {
  // path 以 /api/... 开头时，拼接上公网基础地址；否则按原样返回
  if (typeof path === 'string' && path.startsWith('/')) {
    return PUBLIC_API_BASE + path;
  }
  return path;
};

// 关闭Vue的生产提示（开发环境下会有一些提示信息，正式上线后不需要）
Vue.config.productionTip = false;

// ==================== 创建并挂载Vue应用 ====================
// 创建Vue实例
new Vue({
  router, // 把路由对象传入Vue实例，让应用支持页面跳转
  render: h => h(App) // 渲染函数：把App根组件渲染到页面上
}).$mount('#app'); // 将Vue应用挂载到HTML页面中id为"app"的元素上
