<template>
  <div class="layout-container" :class="{ 'is-mobile': isMobile }">
    <el-container>
      <!-- 桌面端侧边栏 / 移动端抽屉式侧边栏 -->
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

          <!-- 角色切换器：仅校级管理员能看到 -->
          <div class="role-switcher" v-if="!isCollapsed && userInfo.role === 'admin'">
            <el-select v-model="currentRole" @change="handleRoleChange" placeholder="选择角色预览">
              <el-option label="校级管理员" value="admin"></el-option>
              <el-option label="班主任/任课教师" value="teacher"></el-option>
              <el-option label="家长" value="parent"></el-option>
              <el-option label="学生" value="student"></el-option>
              <el-option label="校园校医" value="doctor"></el-option>
            </el-select>
          </div>
          <!-- 非 admin 角色：展示当前登录身份 -->
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

      <!-- 移动端侧边栏（抽屉式） -->
      <el-drawer
        v-if="isMobile"
        :visible.sync="mobileDrawerVisible"
        direction="ltr"
        size="80%"
        :with-header="false"
        :modal-append-to-body="true"
        :append-to-body="true"
        :wrapperClosable="true"
        custom-class="mobile-drawer">
        <div class="sidebar mobile-sidebar">
          <div class="logo" @click="handleLogoClick; mobileDrawerVisible = false;">
            <i class="el-icon-s-platform"></i>
            <span>健康管理系统</span>
          </div>

          <!-- 移动端用户信息 -->
          <div class="mobile-user-info">
            <img :src="userAvatar" class="mobile-avatar" alt="avatar">
            <div class="mobile-user-detail">
              <div class="mobile-username">{{ userInfo.username || '用户' }}</div>
              <el-tag :type="roleTagType" size="mini">{{ roleDisplayName }}</el-tag>
            </div>
          </div>

          <!-- 角色切换器：仅校级管理员 -->
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
              <!-- 移动端菜单按钮 -->
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

              <!-- 移动端标题 -->
              <span v-if="isMobile" class="mobile-title">
                {{ currentPage || '健康管理系统' }}
              </span>
            </div>
            <div class="header-right">
              <!-- 通知铃铛 -->
              <el-badge :value="notificationCount" class="notification-badge" v-if="!isMobile">
                <i class="el-icon-bell" @click="goToNotification"></i>
              </el-badge>

              <!-- 桌面端用户信息下拉 -->
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
                    <i class="el-icon-user"></i>
                    个人中心
                  </el-dropdown-item>
                  <el-dropdown-item command="settings">
                    <i class="el-icon-setting"></i>
                    系统设置
                  </el-dropdown-item>
                  <el-dropdown-item divided command="logout">
                    <i class="el-icon-switch-button"></i>
                    退出登录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>

              <!-- 移动端用户头像（点击弹出菜单） -->
              <img
                v-if="isMobile"
                :src="userAvatar"
                class="avatar mobile-header-avatar"
                alt="avatar"
                @click="mobileUserMenuVisible = !mobileUserMenuVisible">
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
// 从独立的权限表模块导入（唯一事实来源，无循环依赖）
// Layout.vue 不依赖 router/index.js，避免「router → Layout → router」循环引用
import { ROLE_PERMISSIONS, getAllowedRoles } from '@/permission';

// 角色-显示名映射
const ROLE_DISPLAY_NAMES = {
  admin: '校级管理员',
  teacher: '班主任',
  parent: '家长',
  student: '学生',
  doctor: '校医'
};

// 通过路由表查询某路径允许的角色数组（/xxx 会被转成 xxx 作为 path key）
// 注意：此函数作为 meta.roles 的兜底读取；优先使用 ROLE_PERMISSIONS
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
  methods: {
    checkIsMobile() {
      this.isMobile = window.innerWidth <= 768;
    },
    handleResize() {
      if (this.resizeTimer) {
        clearTimeout(this.resizeTimer);
      }
      this.resizeTimer = setTimeout(() => {
        const wasMobile = this.isMobile;
        this.checkIsMobile();
        if (this.isMobile !== wasMobile && this.isMobile) {
          this.mobileDrawerVisible = false;
          this.mobileUserMenuVisible = false;
        }
      }, 150);
    },
  computed: {
    activeMenu() {
      return this.$route.path;
    },
    currentPage() {
      return this.$route.meta.title || '';
    },
    userAvatar() {
      const avatars = {
        admin: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Ccircle cx=%2250%22 cy=%2250%22 r=%2250%22 fill=%22%23409EFF%22/%3E%3Ccircle cx=%2250%22 cy=%2240%22 r=%2215%22 fill=%22%23fff%22/%3E%3C/svg%3E',
        teacher: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Ccircle cx=%2250%22 cy=%2250%22 r=%2250%22 fill=%22%2367C23A%22/%3E%3Ccircle cx=%2250%22 cy=%2240%22 r=%2215%22 fill=%22%23fff%22/%3E%3C/svg%3E',
        parent: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Ccircle cx=%2250%22 cy=%2250%22 r=%2250%22 fill=%22%23E6A23C%22/%3E%3Ccircle cx=%2250%22 cy=%2240%22 r=%2215%22 fill=%22%23fff%22/%3E%3C/svg%3E',
        student: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Ccircle cx=%2250%22 cy=%2250%22 r=%2250%22 fill=%22%23F56C6C%22/%3E%3Ccircle cx=%2250%22 cy=%2240%22 r=%2215%22 fill=%22%23fff%22/%3E%3C/svg%3E',
        doctor: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Ccircle cx=%2250%22 cy=%2250%22 r=%2250%22 fill=%22%23909399%22/%3E%3Ccircle cx=%2250%22 cy=%2240%22 r=%2215%22 fill=%22%23fff%22/%3E%3C/svg%3E'
      };
      return avatars[this.currentRole] || avatars.student;
    },
    roleDisplayName() {
      return ROLE_DISPLAY_NAMES[this.currentRole] || '用户';
    },
    roleTagType() {
      const types = {
        admin: 'primary',
        teacher: 'success',
        parent: 'warning',
        student: 'danger',
        doctor: 'info'
      };
      return types[this.currentRole] || 'info';
    },
    // 核心：菜单渲染策略
    //   - admin：显示全部菜单（与守卫"admin 永远放行"保持一致）
    //   - 其他角色：只显示 ROLE_PERMISSIONS 中自己有权限的菜单项
    menuGroups() {
      const rawGroups = this.getMenuByRole(this.currentRole);
      const roleToCheck = this.currentRole;

      // admin：不过滤，直接显示全部（getMenuByRole('admin') 已包含全部模块）
      if (roleToCheck === 'admin') return rawGroups;

      // 其他角色：用权限表过滤
      const PERMS = ROLE_PERMISSIONS;
      return rawGroups
        .map((group) => ({
          name: group.name,
          items: (group.items || []).filter((item) => {
            const key = String(item.path).replace(/^\//, '');
            const allowed = PERMS[key];
            if (!allowed || !allowed.length) return false; // 未知路径：非 admin 不显示
            return allowed.includes(roleToCheck);
          })
        }))
        .filter((group) => group.items.length > 0);
    }
  },
  mounted() {
    this.syncLoginRole();
  },
  activated() {
    this.syncLoginRole();
  },
  methods: {
    // 同步当前登录身份到组件状态
    // ⚠️ key 原则：currentRole 与 userInfo.role 严格一致，绝不允许出现偏差
    //   - admin 登录：currentRole = 'admin'（显示全部菜单）
    //   - 其他角色：currentRole = userInfo.role（只显示自己的菜单）
    syncLoginRole() {
      const VALID = ['admin', 'teacher', 'parent', 'student', 'doctor'];
      const raw = localStorage.getItem('userInfo');

      if (!raw) {
        this.userInfo = { username: '管理员', role: 'admin' };
        this.currentRole = 'admin';
        return;
      }

      let parsed = null;
      try {
        parsed = JSON.parse(raw);
      } catch (e) {
        this.userInfo = { username: '管理员', role: 'admin' };
        this.currentRole = 'admin';
        return;
      }

      const role = VALID.includes(parsed.role) ? parsed.role : 'admin';
      this.userInfo = parsed;
      this.currentRole = role;
    },
    getMenuByRole(role) {
      const allMenus = {
        admin: [
          {
            name: '首页概览',
            items: [
              { path: '/dashboard', title: '数据概览', icon: 'el-icon-s-data' }
            ]
          },
          {
            name: '全域组织权限治理',
            items: [
              { path: '/user-manage', title: '用户管理', icon: 'el-icon-user' },
              { path: '/role-manage', title: '角色权限', icon: 'el-icon-s-custom' },
              { path: '/class-grade-manage', title: '年级班级管理', icon: 'el-icon-office-building' },
              { path: '/system-audit', title: '系统审计', icon: 'el-icon-document-checked' }
            ]
          },
          {
            name: '师生电子健康档案',
            items: [
              { path: '/user-health-manage', title: '健康档案管理', icon: 'el-icon-s-order' },
              { path: '/allergy-history', title: '过敏史管理', icon: 'el-icon-warning' },
              { path: '/physical-profile', title: '体质档案', icon: 'el-icon-s-cooperation' },
              { path: '/vision-posture', title: '视力体态档案', icon: 'el-icon-view' },
              { path: '/oral-health', title: '口腔健康档案', icon: 'el-icon-s-grid' },
              { path: '/vaccine-manage', title: '疫苗接种档案', icon: 'el-icon-suitcase' },
              { path: '/physical-test-manage', title: '体质测试管理', icon: 'el-icon-medal' }
            ]
          },
          {
            name: '校园公共卫生管控',
            items: [
              { path: '/daily-check', title: '晨间健康监测', icon: 'el-icon-s-check' },
              { path: '/class-health-board', title: '班级健康看板', icon: 'el-icon-monitor' },
              { path: '/absence-register', title: '缺勤登记', icon: 'el-icon-document' },
              { path: '/absence-track', title: '缺勤追踪', icon: 'el-icon-search' },
              { path: '/disease-warning', title: '传染病预警', icon: 'el-icon-warning-outline' },
              { path: '/isolation-manage', title: '隔离管控', icon: 'el-icon-lock' },
              { path: '/accident-report', title: '意外伤害上报', icon: 'el-icon-phone-outline' },
              { path: '/incident-report', title: '事件报告管理', icon: 'el-icon-document-copy' },
              { path: '/medical-supplies', title: '医疗物资管理', icon: 'el-icon-box' },
              { path: '/abnormal-handle', title: '异常处理', icon: 'el-icon-s-tools' }
            ]
          },
          {
            name: '校园膳食营养监管',
            items: [
              { path: '/recipe-manage', title: '食谱管理', icon: 'el-icon-food' },
              { path: '/dining-record', title: '就餐记录', icon: 'el-icon-s-order' },
              { path: '/nutrition-analysis', title: '营养分析', icon: 'el-icon-pie-chart' },
              { path: '/recipe-feedback', title: '食谱反馈', icon: 'el-icon-chat-line-round' }
            ]
          },
          {
            name: '体育美育活动管控',
            items: [
              { path: '/sports-activity', title: '体育活动管理', icon: 'el-icon-basketball' },
              { path: '/task-publish', title: '任务发布', icon: 'el-icon-s-promotion' },
              { path: '/task-completion', title: '任务完成情况', icon: 'el-icon-circle-check' },
              { path: '/sports-ranking', title: '运动排行', icon: 'el-icon-trophy' },
              { path: '/points-ranking', title: '积分排行', icon: 'el-icon-medal' },
              { path: '/class-activity', title: '班级活动', icon: 'el-icon-s-custom' },
              { path: '/activity-signup', title: '活动报名', icon: 'el-icon-edit-outline' }
            ]
          },
          {
            name: '健康教育资源中台',
            items: [
              { path: '/exercise-knowledge-manage', title: '运动知识管理', icon: 'el-icon-reading' },
              { path: '/exercise-detail-manage', title: '运动详情管理', icon: 'el-icon-document-copy' },
              { path: '/class-courseware', title: '健康班会课件', icon: 'el-icon-notebook-2' },
              { path: '/seasonal-science', title: '季节科普资源', icon: 'el-icon-sunny' },
              { path: '/safety-education', title: '安全教育资源', icon: 'el-icon-safety-certificate' },
              { path: '/health-guidance', title: '健康指导', icon: 'el-icon-s-help' }
            ]
          },
          {
            name: '大数据分析决策',
            items: [
              { path: '/health-data-dashboard', title: '健康数据大屏', icon: 'el-icon-data-line' },
              { path: '/health-report', title: '健康报告', icon: 'el-icon-document' },
              { path: '/health-assessment', title: '健康评估', icon: 'el-icon-s-check-circle' }
            ]
          },
          {
            name: '全域消息家校协同',
            items: [
              { path: '/notification-center', title: '通知中心', icon: 'el-icon-bell' },
              { path: '/parent-communication', title: '家校沟通', icon: 'el-icon-chat-dot-round' },
              { path: '/accompany-check', title: '陪同打卡', icon: 'el-icon-s-check' },
              { path: '/leave-request', title: '请假申请', icon: 'el-icon-document-add' }
            ]
          },
          {
            name: '系统基础运维中心',
            items: [
              { path: '/health-upload', title: '健康数据上传', icon: 'el-icon-upload2' },
              { path: '/batch-entry', title: '批量录入', icon: 'el-icon-document-checked' },
              { path: '/mental-health', title: '心理健康', icon: 'el-icon-heart' },
              { path: '/health-log', title: '健康日志', icon: 'el-icon-document' },
              { path: '/health-homework', title: '健康作业', icon: 'el-icon-notebook-1' },
              { path: '/homework-correct', title: '作业批改', icon: 'el-icon-edit' }
            ]
          }
        ],
        teacher: [
          {
            name: '首页概览',
            items: [
              { path: '/dashboard', title: '数据概览', icon: 'el-icon-s-data' }
            ]
          },
          {
            name: '班级健康学情监管',
            items: [
              { path: '/daily-check', title: '晨间健康监测', icon: 'el-icon-s-check' },
              { path: '/class-health-board', title: '班级健康看板', icon: 'el-icon-monitor' },
              { path: '/absence-register', title: '缺勤登记', icon: 'el-icon-document' },
              { path: '/disease-warning', title: '传染病预警', icon: 'el-icon-warning-outline' },
              { path: '/accident-report', title: '意外伤害上报', icon: 'el-icon-phone-outline' }
            ]
          },
          {
            name: '班级文体活动运维',
            items: [
              { path: '/task-publish', title: '发布健康任务', icon: 'el-icon-s-promotion' },
              { path: '/task-completion', title: '任务完成情况', icon: 'el-icon-circle-check' },
              { path: '/class-activity', title: '班级活动管理', icon: 'el-icon-s-custom' },
              { path: '/sports-ranking', title: '运动排行', icon: 'el-icon-trophy' }
            ]
          },
          {
            name: '健康教育教学运维',
            items: [
              { path: '/exercise-knowledge', title: '健康知识学习', icon: 'el-icon-reading' },
              { path: '/class-courseware', title: '健康班会课件', icon: 'el-icon-notebook-2' },
              { path: '/health-homework', title: '布置健康作业', icon: 'el-icon-notebook-1' },
              { path: '/homework-correct', title: '作业批改', icon: 'el-icon-edit' }
            ]
          },
          {
            name: '家校协同共育',
            items: [
              { path: '/notification-center', title: '通知中心', icon: 'el-icon-bell' },
              { path: '/parent-communication', title: '家校沟通', icon: 'el-icon-chat-dot-round' },
              { path: '/leave-request', title: '请假审批', icon: 'el-icon-document-add' }
            ]
          },
          {
            name: '学生健康档案',
            items: [
              { path: '/physical-profile', title: '学生体质档案', icon: 'el-icon-s-cooperation' },
              { path: '/vision-posture', title: '视力体态档案', icon: 'el-icon-view' },
              { path: '/health-report', title: '健康报告', icon: 'el-icon-document' }
            ]
          }
        ],
        parent: [
          {
            name: '首页概览',
            items: [
              { path: '/dashboard', title: '数据概览', icon: 'el-icon-s-data' }
            ]
          },
          {
            name: '子女健康全景视图',
            items: [
              { path: '/child-health', title: '子女健康数据', icon: 'el-icon-s-cooperation' },
              { path: '/physical-profile', title: '生长发育趋势', icon: 'el-icon-data-line' },
              { path: '/vision-posture', title: '视力体态数据', icon: 'el-icon-view' },
              { path: '/vaccine-manage', title: '疫苗接种记录', icon: 'el-icon-suitcase' },
              { path: '/health-report', title: '健康报告查看', icon: 'el-icon-document' }
            ]
          },
          {
            name: '居家健康数据上报',
            items: [
              { path: '/health-upload', title: '健康数据上报', icon: 'el-icon-upload2' },
              { path: '/medical-history', title: '病史过敏登记', icon: 'el-icon-warning' },
              { path: '/leave-request', title: '请假申请', icon: 'el-icon-document-add' }
            ]
          },
          {
            name: '家校健康协同服务',
            items: [
              { path: '/notification-center', title: '接收通知预警', icon: 'el-icon-bell' },
              { path: '/parent-communication', title: '家校健康咨询', icon: 'el-icon-chat-dot-round' },
              { path: '/recipe-manage', title: '校园膳食公示', icon: 'el-icon-food' },
              { path: '/recipe-feedback', title: '饮食诉求反馈', icon: 'el-icon-chat-line-round' }
            ]
          },
          {
            name: '家庭健康素养培育',
            items: [
              { path: '/accompany-check', title: '陪同打卡', icon: 'el-icon-s-check' },
              { path: '/health-task', title: '健康任务', icon: 'el-icon-medal' },
              { path: '/points-ranking', title: '积分排行', icon: 'el-icon-trophy' },
              { path: '/exercise-knowledge', title: '健康知识学习', icon: 'el-icon-reading' },
              { path: '/seasonal-science', title: '季节科普', icon: 'el-icon-sunny' }
            ]
          }
        ],
        student: [
          {
            name: '首页概览',
            items: [
              { path: '/dashboard', title: '数据概览', icon: 'el-icon-s-data' }
            ]
          },
          {
            name: '日常健康行为养成',
            items: [
              { path: '/daily-check', title: '晨间打卡', icon: 'el-icon-s-check' },
              { path: '/health-task', title: '健康任务', icon: 'el-icon-medal' },
              { path: '/accompany-check', title: '日常打卡', icon: 'el-icon-circle-check' },
              { path: '/health-log', title: '健康日志', icon: 'el-icon-document' }
            ]
          },
          {
            name: '健康素养知识研习',
            items: [
              { path: '/exercise-knowledge', title: '运动知识', icon: 'el-icon-reading' },
              { path: '/seasonal-science', title: '季节科普', icon: 'el-icon-sunny' },
              { path: '/safety-education', title: '安全知识', icon: 'el-icon-safety-certificate' },
              { path: '/health-homework', title: '健康作业', icon: 'el-icon-notebook-1' }
            ]
          },
          {
            name: '个人健康数据中心',
            items: [
              { path: '/physical-profile', title: '体质档案', icon: 'el-icon-s-cooperation' },
              { path: '/vision-posture', title: '视力体态', icon: 'el-icon-view' },
              { path: '/health-assessment', title: '健康评估', icon: 'el-icon-s-check-circle' },
              { path: '/health-report', title: '成长报告', icon: 'el-icon-document' }
            ]
          },
          {
            name: '校园文体活动参与',
            items: [
              { path: '/sports-activity', title: '体育活动', icon: 'el-icon-basketball' },
              { path: '/activity-signup', title: '活动报名', icon: 'el-icon-edit-outline' },
              { path: '/sports-ranking', title: '运动排行', icon: 'el-icon-trophy' },
              { path: '/points-ranking', title: '积分排行', icon: 'el-icon-medal' }
            ]
          }
        ],
        doctor: [
          {
            name: '首页概览',
            items: [
              { path: '/dashboard', title: '数据概览', icon: 'el-icon-s-data' }
            ]
          },
          {
            name: '全校健康异常处置',
            items: [
              { path: '/abnormal-handle', title: '异常数据处理', icon: 'el-icon-s-tools' },
              { path: '/class-health-board', title: '健康看板', icon: 'el-icon-monitor' },
              { path: '/daily-check', title: '晨检数据', icon: 'el-icon-s-check' }
            ]
          },
          {
            name: '传染病专项防控',
            items: [
              { path: '/disease-warning', title: '传染病预警', icon: 'el-icon-warning-outline' },
              { path: '/isolation-manage', title: '隔离管理', icon: 'el-icon-lock' },
              { path: '/absence-track', title: '缺勤追踪', icon: 'el-icon-search' }
            ]
          },
          {
            name: '医疗物资精细化管控',
            items: [
              { path: '/medical-supplies', title: '医疗物资管理', icon: 'el-icon-box' }
            ]
          },
          {
            name: '专业健康咨询诊疗',
            items: [
              { path: '/parent-communication', title: '健康咨询', icon: 'el-icon-chat-dot-round' },
              { path: '/health-guidance', title: '健康指导', icon: 'el-icon-s-help' }
            ]
          },
          {
            name: '全校健康普查专项',
            items: [
              { path: '/user-health-manage', title: '健康档案管理', icon: 'el-icon-s-order' },
              { path: '/batch-entry', title: '批量录入', icon: 'el-icon-document-checked' },
              { path: '/physical-test-manage', title: '体测数据管理', icon: 'el-icon-medal' },
              { path: '/allergy-history', title: '过敏史管理', icon: 'el-icon-warning' },
              { path: '/health-data-dashboard', title: '健康数据分析', icon: 'el-icon-data-line' }
            ]
          }
        ]
      };
      
      return allMenus[role] || allMenus.student;
    },
    
    handleSelect(path) {
      if (this.isMobile) {
        this.mobileDrawerVisible = false;
      }
      this.$router.push(path);
    },
    
    handleCommand(command) {
      if (command === 'logout') {
        this.handleLogout();
      } else if (command === 'profile') {
        this.$message.info('个人中心功能开发中');
      } else if (command === 'settings') {
        this.$message.info('系统设置功能开发中');
      }
    },
    
    handleLogout() {
      this.$confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        this.$router.push('/login');
      }).catch(() => {});
    },
    
    toggleCollapse() {
      this.isCollapsed = !this.isCollapsed;
    },
    
    handleRoleChange(role) {
      // 仅校级管理员能切换角色预览，用于查看不同角色的菜单
      if (this.userInfo.role !== 'admin') {
        this.$message.warning('当前身份无权限切换角色');
        return;
      }
      const VALID = ['admin', 'teacher', 'parent', 'student', 'doctor'];
      if (!VALID.includes(role)) return;
      // 只修改 currentRole（控制菜单渲染），不改 userInfo.role（真实登录身份）
      this.currentRole = role;
      // 切换后跳到首页刷新菜单视觉
      this.$router.push('/dashboard');
    },
    
    handleLogoClick() {
      this.$router.push('/dashboard');
    },
    
    goToNotification() {
      this.$router.push('/notification-center');
    },
    
    goBack() {
      if (window.history.length > 1) {
        this.$router.go(-1);
      } else {
        this.$router.push('/dashboard');
      }
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

  /* 调整头部高度 */
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

  /* 移动端菜单按钮 */
  .mobile-menu-btn {
    font-size: 22px;
    color: #303133;
  }

  /* 移动端标题 */
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

  /* 移动端头部头像 */
  .mobile-header-avatar {
    width: 32px !important;
    height: 32px !important;
  }

  /* 主要内容区域 */
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

/* 抽屉遮罩层样式 */
.mobile-drawer >>> .el-drawer__header {
  margin-bottom: 0;
}

.mobile-drawer >>> .el-drawer__body {
  padding: 0;
  overflow: hidden;
}
