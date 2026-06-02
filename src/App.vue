<!-- ==================== 应用根组件 ==================== -->
<!-- 这是Vue应用最顶层的组件，所有页面都在这个组件内部显示 -->
<template>
  <!-- app是整个应用的根容器 -->
  <div id="app">
    <!-- router-view是路由占位符，当前路由匹配的页面组件会渲染在这里 -->
    <!-- 比如访问/dashboard时，Dashboard.vue的内容就会显示在这里 -->
    <router-view />
  </div>
</template>

<script>
// 导出一个Vue组件对象
export default {
  name: 'App' // 组件的名称，用于调试
};
</script>

<!-- 全局样式：会应用到整个应用的所有元素 -->
<style>
/* 重置所有元素的默认边距和内边距，并设置盒模型为border-box */
* {
  margin: 0; /* 外边距清零 */
  padding: 0; /* 内边距清零 */
  box-sizing: border-box; /* 盒模型：元素的宽度和高度包含内边距和边框 */
}

/* 设置html、body和app容器的高度都为100%，让应用占满整个浏览器窗口 */
html, body, #app {
  height: 100%; /* 高度占满父容器 */
  /* 设置字体：优先使用苹果的PingFang SC，其次是微软雅黑等 */
  font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", Arial, sans-serif;
}
</style>
