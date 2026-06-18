<template>
  <div class="layout-container" :class="{ 'is-mobile': isMobile }">
    <el-container>
      <el-aside
        v-if="!isMobile"
        width="240px"
        :class="{ 'is-collapsed': isCollapsed }"
        class="desktop-aside">
        <div class="sidebar">
          <div class="logo" @click="handleLogoClick">
            <i class="el-icon-s-platform"></i>
            <span v-if="!isCollapsed">健康管理系统</span>
          </div>

          <div class="role-switcher" v-if="!isCollapsed && userInfo.role === 'admin'">
            <el-select v-model="currentRole" @change="handleRoleChange" placeholder="选择角色预览">
              <el-option label="校级管理员" value="admin"></el-option>
              <el-option label="班主任/任课教师" value="teacher"></el-option>
              <el-option label="家长" value="parent"></el-option>
              <el-option label="学生" value="student"></el-option>
              <el-option label="校园校医" value="doctor"></el-option>
            </el-select>
          </div>
          <div class="role-switcher" v-if="!isCollapsed && userInfo.role !== 'admin'">
            <div class="fixed-role-badge">
              <i class="el-icon-user-solid" style="margin-right:6px;"></i>
              当前身份：{{ roleDisplayName }}
            </div>
          </div>

          <el-menu
            :default-active="activeMenu"
            :collapse="isCollapsed"
            :unique-opened="true"
            class="el-menu-vertical"
            @select="handleSelect">
            <template v-for="group in menuGroups">
              <div v-if="group.items.length > 0" :key="group.name" class="menu-group-title">
                {{ group.name }}
              </div>
              <el-menu-item
                v-for="item in group.items"
                :key="item.path"
                :index="item.path">
                <i :class="item.icon"></i>
                <span slot="title">{{ item.title }}</span>
              </el-menu-item>
            </template>
          </el-menu>
        </div>
      </el-aside>

      <el-drawer
        v-if="isMobile"
        :visible.sync="mobileDrawerVisible"
        direction="ltr"
        size="80%"
        :with-header="false"
        :modal-append-to-body="true"
        :append-to-body="true"
        :wrapper-closable="true"
        custom-class="mobile-drawer">
        <div class="sidebar mobile-sidebar">
          <div class="logo" @click="handleLogoClick; mobileDrawerVisible = false;">
            <i class="el-icon-s-platform"></i>
            <span>健康管理系统</span>
          </div>

          <div class="mobile-user-info">
            <img :src="userAvatar" class="mobile-avatar" alt="avatar">
            <div class="mobile-user-detail">
              <div class="mobile-username">{{ userInfo.username || '用户' }}</div>
              <el-tag size="mini">{{ roleDisplayName }}</el-tag>
            </div>
          </div>

          <div class="role-switcher" v-if="userInfo.role === 'admin'">
            <el-select v-model="currentRole" @change="handleRoleChange" placeholder="选择角色预览">
              <el-option label="校级管理员" value="admin"></el-option>
              <el-option label="班主任/任课教师" value="teacher"></el-option>
              <el-option label="家长" value="parent"></el-option>
              <el-option label="学生" value="student"></el-option>
              <el-option label="校园校医" value="doctor"></el-option>
            </el-select>
          </div>
          <div class="role-switcher" v-else>
            <div class="fixed-role-badge">
              <i class="el-icon-user-solid" style="margin-right:6px;"></i>
              当前身份：{{ roleDisplayName }}
            </div>
          </div>

          <el-menu
            :default-active="activeMenu"
            :unique-opened="true"
            class="el-menu-vertical"
            @select="handleSelect">
            <template v-for="group in menuGroups">
              <div v-if="group.items.length > 0" :key="group.name" class="menu-group-title">
                {{ group.name }}
              </div>
              <el-menu-item
                v-for="item in group.items"
                :key="item.path"
                :index="item.path">
                <i :class="item.icon"></i>
                <span slot="title">{{ item.title }}</span>
              </el-menu-item>
            </template>
          </el-menu>
        </div>
      </el-drawer>

      <el-container>
        <el-header>
          <div class="header-content">
            <div class="header-left">
              <i v-if="isMobile" class="el-icon-menu fold-btn mobile-menu-btn" @click="mobileDrawerVisible = true"></i>
              <i v-else class="el-icon-s-fold fold-btn" @click="toggleCollapse"></i>

              <el-button
                v-if="!isMobile"
                type="text"
                icon="el-icon-back"
                @click="goBack"
                class="back-btn">返回</el-button>

              <el-breadcrumb v-if="!isMobile" separator="/">
                <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
                <el-breadcrumb-item v-if="currentPage">{{ currentPage }}</el-breadcrumb-item>
              </el-breadcrumb>

              <span v-if="isMobile" class="mobile-title">
                {{ currentPage || '健康管理系统' }}
              </span>
            </div>
            <div class="header-right">
              <el-badge :value="notificationCount" class="notification-badge" v-if="!isMobile">
                <i class="el-icon-bell" @click="goToNotification"></i>
              </el-badge>

              <el-dropdown v-if="!isMobile" @command="handleCommand" trigger="click">
                <span class="el-dropdown-link user-info">
                  <img :src="userAvatar" class="avatar" alt="avatar">
                  <span class="username">{{ userInfo.username || '用户' }}</span>
                  <el-tag :type="roleTagType" size="mini" class="role-tag">
                    {{ roleDisplayName }}
                  </el-tag>
                  <i class="el-icon-arrow-down el-icon--right"></i>
                </span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item command="profile">
                    <i class="el-icon-user"></i>个人中心
                  </el-dropdown-item>
                  <el-dropdown-item command="settings">
                    <i class="el-icon-setting"></i>系统设置
                  </el-dropdown-item>
                  <el-dropdown-item divided command="logout">
                    <i class="el-icon-switch-button"></i>退出登录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>

              <img
                v-if="isMobile"
                :src="userAvatar"
                class="avatar mobile-header-avatar"
                alt="avatar"
                @click="mobileUserMenuVisible = true">
              <el-dropdown
                v-if="isMobile"
                @command="handleCommand"
                trigger="manual"
                :visible.sync="mobileUserMenuVisible">
                <span slot="dropdown" style="display:none"></span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item command="profile">
                    <i class="el-icon-user"></i>个人中心
                  </el-dropdown-item>
                  <el-dropdown-item command="settings">
                    <i class="el-icon-setting"></i>系统设置
                  </el-dropdown-item>
                  <el-dropdown-item divided command="logout">
                    <i class="el-icon-switch-button"></i>退出登录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </div>
          </div>
        </el-header>

        <el-main>
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import { ROLE_PERMISSIONS, getAllowedRoles } from '@/permission';

const ROLE_DISPLAY_NAMES = {
  admin: '校级管理员',
  teacher: '班主任',
  parent: '家长',
  student: '学生',
  doctor: '校医'
};

function getRolesByPath(router, path) {
  if (!router || !router.options || !router.options.routes) return ['admin'];
  const root = router.options.routes.find((r) => r.children && r.children.length);
  if (!root) return ['admin'];
  const cleanPath = String(path).replace(/^\//, '');
  const child = root.children.find((c) => c.path === cleanPath);
  if (child && child.meta && child.meta.roles && child.meta.roles.length) {
    return child.meta.roles;
  }
  return ['admin'];
}

export default {
  name: 'Layout',
  data() {
    return {
      isCollapsed: false,
      isMobile: false,
      mobileDrawerVisible: false,
      mobileUserMenuVisible: false,
      currentRole: 'admin',
      userInfo: {
        username: '管理员',
        role: 'admin'
      },
      notificationCount: 5,
      resizeTimer: null
    };
  },
  mounted() {
    this.checkIsMobile();
    this.syncLoginRole();
    window.addEventListener('resize', this.handleResize);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
    if (this.resizeTimer) {
      clearTimeout(this.resizeTimer);
    }
  },
  computed: {
    activeMenu() {
      return this.$route.path;
    },
    currentPage() {
      return this.$route.meta.title || '';
    },
    userAvatar() {
      return 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png';
    },
    roleDisplayName() {
      if (this.userInfo.role === 'admin') {
        return ROLE_DISPLAY_NAMES[this.currentRole] || '管理员';
      }
      return ROLE_DISPLAY_NAMES[this.userInfo.role] || '用户';
    },
    roleTagType() {
      if (this.userInfo.role === 'admin') {
        return this.currentRole === 'admin' ? 'danger' : 'warning';
      }
      return this.userInfo.role === 'teacher' ? '' : 'success';
    },
    menuGroups() {
      const activeRole = this.userInfo.role === 'admin' ? this.currentRole : this.userInfo.role;
      const isAllowed = (p) => {
        if (activeRole === 'admin') return true;
        const key = String(p).replace(/^\//, '');
        const roles = ROLE_PERMISSIONS[key];
        if (roles && roles.length) return roles.includes(activeRole);
        const backup = getRolesByPath(this.$router, p);
        return backup.includes(activeRole);
      };
      return [
        {
          name: '系统概览',
          items: [
            { path: '/dashboard', title: '首页/仪表盘', icon: 'el-icon-s-home' }
          ].filter((x) => isAllowed(x.path))
        },
        {
          name: '健康档案',
          items: [
            { path: '/allergy-history', title: '过敏史管理', icon: 'el-icon-warning-outline' },
            { path: '/physical-test-manage', title: '体检记录', icon: 'el-icon-notebook-2' },
            { path: '/vision-posture', title: '视力与坐姿', icon: 'el-icon-view' },
            { path: '/oral-health', title: '口腔健康', icon: 'el-icon-magic-stick' },
            { path: '/vaccine-manage', title: '疫苗接种', icon: 'el-icon-s-claim' }
          ].filter((x) => isAllowed(x.path))
        },
        {
          name: '校园管控',
          items: [
            { path: '/class-health-board', title: '班级健康看板', icon: 'el-icon-data-board' },
            { path: '/absence-track', title: '缺勤跟踪', icon: 'el-icon-document-remove' },
            { path: '/disease-warning', title: '疾病预警', icon: 'el-icon-warning' },
            { path: '/accident-report', title: '事故上报', icon: 'el-icon-message-solid' },
            { path: '/medical-supplies', title: '医疗物资', icon: 'el-icon-first-aid-kit' }
          ].filter((x) => isAllowed(x.path))
        },
        {
          name: '营养与运动',
          items: [
            { path: '/recipe-manage', title: '食谱管理', icon: 'el-icon-dish' },
            { path: '/dining-record', title: '用餐记录', icon: 'el-icon-dish-1' },
            { path: '/nutrition-analysis', title: '营养分析', icon: 'el-icon-data-analysis' },
            { path: '/sports-activity', title: '体育活动', icon: 'el-icon-position' },
            { path: '/sports-ranking', title: '运动排行', icon: 'el-icon-trophy' },
            { path: '/exercise-knowledge-manage', title: '运动知识', icon: 'el-icon-reading' },
            { path: '/exercise-detail-manage', title: '运动详情', icon: 'el-icon-document' }
          ].filter((x) => isAllowed(x.path))
        },
        {
          name: '健康教育',
          items: [
            { path: '/class-courseware', title: '班级课件', icon: 'el-icon-collection' },
            { path: '/seasonal-science', title: '时令科普', icon: 'el-icon-sunny' },
            { path: '/safety-education', title: '安全教育', icon: 'el-icon-shield' },
            { path: '/mental-health', title: '心理健康', icon: 'el-icon-service' }
          ].filter((x) => isAllowed(x.path))
        },
        {
          name: '数据报表',
          items: [
            { path: '/health-data-dashboard', title: '健康数据看板', icon: 'el-icon-data-line' },
            { path: '/health-report', title: '健康报告', icon: 'el-icon-s-marketing' },
            { path: '/archive-export', title: '档案导出', icon: 'el-icon-s-platform' }
          ].filter((x) => isAllowed(x.path))
        },
        {
          name: '消息中心',
          items: [
            { path: '/announcement-manage', title: '公告管理', icon: 'el-icon-bell' },
            { path: '/push-message', title: '消息推送', icon: 'el-icon-message' },
            { path: '/consultation-manage', title: '咨询管理', icon: 'el-icon-chat-dot-round' }
          ].filter((x) => isAllowed(x.path))
        },
        {
          name: '学生端',
          items: [
            { path: '/daily-check', title: '每日健康打卡', icon: 'el-icon-edit' },
            { path: '/health-task', title: '健康任务', icon: 'el-icon-s-order' },
            { path: '/physical-profile', title: '我的档案', icon: 'el-icon-user' },
            { path: '/points-ranking', title: '积分排行', icon: 'el-icon-medal' },
            { path: '/activity-signup', title: '活动报名', icon: 'el-icon-s-promotion' }
          ].filter((x) => isAllowed(x.path))
        },
        {
          name: '家长端',
          items: [
            { path: '/child-health', title: '孩子健康', icon: 'el-icon-user-solid' },
            { path: '/medical-history', title: '既往病史', icon: 'el-icon-document' },
            { path: '/leave-request', title: '请假申请', icon: 'el-icon-tickets' },
            { path: '/notification-center', title: '通知中心', icon: 'el-icon-notebook-1' },
            { path: '/recipe-feedback', title: '食谱反馈', icon: 'el-icon-edit-outline' },
            { path: '/accompany-check', title: '陪检登记', icon: 'el-icon-check' },
            { path: '/parent-communication', title: '家校沟通', icon: 'el-icon-phone' }
          ].filter((x) => isAllowed(x.path))
        },
        {
          name: '教师端',
          items: [
            { path: '/absence-register', title: '缺勤登记', icon: 'el-icon-document-checked' },
            { path: '/incident-report', title: '事件上报', icon: 'el-icon-alarm-clock' },
            { path: '/task-publish', title: '任务发布', icon: 'el-icon-s-promotion' },
            { path: '/class-activity', title: '班级活动', icon: 'el-icon-flag' },
            { path: '/task-completion', title: '任务完成', icon: 'el-icon-circle-check' },
            { path: '/health-homework', title: '健康作业', icon: 'el-icon-edit' },
            { path: '/homework-correct', title: '作业批改', icon: 'el-icon-edit-outline' }
          ].filter((x) => isAllowed(x.path))
        },
        {
          name: '校医端',
          items: [
            { path: '/abnormal-handle', title: '异常处理', icon: 'el-icon-warning-outline' },
            { path: '/isolation-manage', title: '隔离管理', icon: 'el-icon-lock' },
            { path: '/health-guidance', title: '健康指导', icon: 'el-icon-guide' },
            { path: '/batch-entry', title: '批量录入', icon: 'el-icon-document-copy' }
          ].filter((x) => isAllowed(x.path))
        },
        {
          name: '个人健康',
          items: [
            { path: '/user-health-manage', title: '健康管理', icon: 'el-icon-user' },
            { path: '/health-upload', title: '健康上传', icon: 'el-icon-upload' },
            { path: '/health-assessment', title: '健康评估', icon: 'el-icon-data-line' },
            { path: '/exercise-knowledge', title: '运动知识', icon: 'el-icon-reading' },
            { path: '/health-log', title: '健康日志', icon: 'el-icon-notebook-1' }
          ].filter((x) => isAllowed(x.path))
        },
        {
          name: '系统管理',
          items: [
            { path: '/user-manage', title: '用户管理', icon: 'el-icon-user' },
            { path: '/role-manage', title: '角色管理', icon: 'el-icon-s-custom' },
            { path: '/class-grade-manage', title: '班级管理', icon: 'el-icon-school' },
            { path: '/system-audit', title: '系统审计', icon: 'el-icon-s-check' },
            { path: '/system-config', title: '系统设置', icon: 'el-icon-setting' },
            { path: '/license-manage', title: '授权管理', icon: 'el-icon-key' }
          ].filter((x) => isAllowed(x.path))
        }
      ];
    }
  },
  methods: {
    checkIsMobile() {
      this.isMobile = window.innerWidth <= 768;
    },
    handleResize() {
      if (this.resizeTimer) clearTimeout(this.resizeTimer);
      this.resizeTimer = setTimeout(() => {
        const wasMobile = this.isMobile;
        this.checkIsMobile();
        if (this.isMobile !== wasMobile && this.isMobile) {
          this.mobileDrawerVisible = false;
          this.mobileUserMenuVisible = false;
        }
      }, 150);
    },
    handleSelect(path) {
      if (this.isMobile) {
        this.mobileDrawerVisible = false;
      }
      this.$router.push(path);
    },
    toggleCollapse() {
      this.isCollapsed = !this.isCollapsed;
    },
    handleLogoClick() {
      this.$router.push('/dashboard');
    },
    goBack() {
      if (this.$route.path !== '/dashboard') {
        this.$router.push('/dashboard');
      }
    },
    syncLoginRole() {
      try {
        const raw = localStorage.getItem('userInfo');
        if (!raw) return;
        const obj = JSON.parse(raw);
        if (obj && obj.role) this.userInfo.role = obj.role;
        if (obj && obj.username) this.userInfo.username = obj.username;
      } catch (e) {}
    },
    handleRoleChange(role) {
      this.$message.info('已切换为' + (ROLE_DISPLAY_NAMES[role] || role));
    },
    handleCommand(cmd) {
      if (cmd === 'profile') {
        this.$message.info('个人中心功能开发中');
      } else if (cmd === 'settings') {
        this.$message.info('系统设置功能开发中');
      } else if (cmd === 'logout') {
        this.$confirm('确定要退出登录吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('userInfo');
          this.$router.push('/login');
        }).catch(() => {});
      }
    },
    goToNotification() {
      this.$message.info('通知中心功能开发中');
    }
  }
};
</script>

<style scoped>
.layout-container {
  height: 100%;
  min-height: 100vh;
  width: 100%;
}

.el-container {
  height: 100%;
}

.sidebar {
  background-color: #304156;
  height: 100%;
  color: #fff;
  overflow-y: auto;
  overflow-x: hidden;
  transition: width 0.3s;
}

.sidebar.is-collapsed {
  width: 64px;
}

.logo {
  height: 60px;
  line-height: 60px;
  padding: 0 20px;
  background: #263445;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
}

.logo i {
  font-size: 24px;
  color: #409EFF;
}

.role-switcher {
  padding: 12px 16px;
  background: #263445;
}

.role-switcher .el-select {
  width: 100%;
}

.fixed-role-badge {
  color: #a8c5e0;
  font-size: 13px;
  padding: 6px 10px;
  background: #1f2d3d;
  border-radius: 6px;
  text-align: center;
}

.el-menu-vertical {
  border-right: none;
  background-color: #263445;
  height: calc(100% - 132px);
}

.el-menu-vertical:not(.el-menu--collapse) {
  width: 240px;
}

.el-menu-vertical .el-menu-item {
  background-color: #263445;
  color: #bfcbd9;
  height: 46px;
  line-height: 46px;
  margin: 0 8px;
  border-radius: 4px;
}

.el-menu-vertical .el-menu-item:hover {
  background-color: #1f2d3d;
  color: #409EFF;
}

.el-menu-vertical .el-menu-item.is-active {
  background-color: #409EFF;
  color: #fff;
  border-right: none;
}

.el-menu-vertical .el-menu-item i {
  color: #909399;
  font-size: 16px;
  margin-right: 10px;
}

.el-menu-vertical .el-menu-item.is-active i {
  color: #fff;
}

.el-menu-vertical .el-menu-item:hover i {
  color: #409EFF;
}

.menu-group-title {
  padding: 14px 20px 8px;
  font-size: 12px;
  color: #6b7a8c;
  background: #1f2d3d;
  font-weight: 600;
  margin-top: 8px;
}

.menu-group-title:first-child {
  margin-top: 0;
}

.el-header {
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  padding: 0 20px;
  display: flex;
  align-items: center;
  height: 60px;
}

.header-content {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.fold-btn {
  font-size: 20px;
  cursor: pointer;
  color: #606266;
}

.fold-btn:hover {
  color: #409EFF;
}

.back-btn {
  color: #606266;
  font-size: 14px;
  padding: 8px 12px;
}

.back-btn:hover {
  color: #409EFF;
  background: #ecf5ff;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 24px;
}

.notification-badge {
  cursor: pointer;
  font-size: 20px;
  color: #606266;
}

.notification-badge:hover {
  color: #409EFF;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  color: #606266;
  font-size: 14px;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
}

.username {
  font-weight: 500;
}

.role-tag {
  margin-left: 4px;
}

.el-main {
  background-color: #f0f2f5;
  padding: 20px;
  overflow-y: auto;
}

/* ============ 移动端样式 ============ */
@media screen and (max-width: 768px) {
  .layout-container {
    min-height: 100vh;
  }

  .layout-container.is-mobile .el-container {
    flex-direction: column;
  }

  .layout-container.is-mobile .el-container > .el-container {
    flex-direction: column;
  }

  .el-header {
    height: 50px !important;
    padding: 0 12px !important;
  }

  .header-content {
    min-width: 0;
  }

  .header-left {
    gap: 10px;
    flex: 1;
    min-width: 0;
    overflow: hidden;
  }

  .mobile-menu-btn {
    font-size: 22px;
    color: #303133;
  }

  .mobile-title {
    font-size: 15px;
    font-weight: 500;
    color: #303133;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 160px;
  }

  .header-right {
    gap: 12px;
  }

  .mobile-header-avatar {
    width: 32px !important;
    height: 32px !important;
  }

  .el-main {
    padding: 12px !important;
    height: calc(100vh - 50px) !important;
  }
}

@media screen and (max-width: 480px) {
  .el-header {
    padding: 0 10px !important;
  }

  .mobile-title {
    font-size: 14px;
    max-width: 120px;
  }

  .el-main {
    padding: 10px !important;
  }
}

/* ============ 移动端抽屉式侧边栏样式 ============ */
.mobile-sidebar {
  background-color: #304156;
  min-height: 100vh;
  overflow-y: auto;
}

.mobile-sidebar .logo {
  padding: 0 20px;
  font-size: 18px;
}

.mobile-user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: #263445;
  border-bottom: 1px solid #1f2d3d;
}

.mobile-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
}

.mobile-user-detail {
  flex: 1;
  overflow: hidden;
}

.mobile-username {
  font-size: 15px;
  color: #fff;
  font-weight: 500;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mobile-sidebar .el-menu-vertical {
  height: auto;
  min-height: 300px;
}

.mobile-sidebar .el-menu-vertical .el-menu-item {
  height: 50px;
  line-height: 50px;
}

.mobile-sidebar .menu-group-title {
  padding: 16px 20px 8px;
  font-size: 11px;
  letter-spacing: 1px;
}

.mobile-drawer >>> .el-drawer__header {
  margin-bottom: 0;
}

.mobile-drawer >>> .el-drawer__body {
  padding: 0;
  overflow: hidden;
}
</style>
