// ==================== 路由配置文件（懒加载版）====================
// 使用动态 import() 实现路由懒加载：只有访问某个页面时才下载对应的 JS

import Vue from 'vue';
import Router from 'vue-router';

// 从独立模块导入权限表
import { ROLE_PERMISSIONS, getAllowedRoles } from '@/permission';

Vue.use(Router);

// ========================================
// 懒加载工厂函数：统一生成异步组件
// webpackChunkName 可以把多个页面合并到同一个 chunk，按功能分组
// ========================================
const lazyLoad = (chunkName, filePath) => () => import(/* webpackChunkName: "[request]" */ `@/views/${filePath}.vue`);

// ========================================
// 登录页（首屏，提前加载）
// ========================================
const Login = () => import(/* webpackChunkName: "login" */ '@/views/Login.vue');
const Layout = () => import(/* webpackChunkName: "layout" */ '@/views/Layout.vue');
const Dashboard = () => import(/* webpackChunkName: "dashboard" */ '@/views/Dashboard.vue');
const LicenseActivate = () => import(/* webpackChunkName: "license" */ '@/views/LicenseActivate.vue');

// ========================================
// 路由配置表（全部使用懒加载）
// ========================================
const routes = [
  {
    path: '/activate',
    name: 'LicenseActivate',
    component: LicenseActivate,
    meta: { requiresLicense: false }  // 不需要授权就能访问
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { roles: ['admin', 'teacher', 'parent', 'student', 'doctor'], requiresLicense: true }
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      { path: 'dashboard', name: 'Dashboard', component: Dashboard, meta: { roles: getAllowedRoles('dashboard') } },

      // ========== 系统管理 ==========
      { path: 'user-manage', name: 'UserManage', component: () => import('@/views/UserManage.vue'), meta: { roles: getAllowedRoles('user-manage') } },
      { path: 'role-manage', name: 'RoleManage', component: () => import('@/views/RoleManage.vue'), meta: { roles: getAllowedRoles('role-manage') } },
      { path: 'class-grade-manage', name: 'ClassGradeManage', component: () => import('@/views/ClassGradeManage.vue'), meta: { roles: getAllowedRoles('class-grade-manage') } },
      { path: 'system-audit', name: 'SystemAudit', component: () => import('@/views/SystemAudit.vue'), meta: { roles: getAllowedRoles('system-audit') } },
      { path: 'system-config', name: 'SystemConfig', component: () => import('@/views/SystemConfig.vue'), meta: { roles: getAllowedRoles('system-config') } },
      { path: 'license-manage', name: 'LicenseManage', component: () => import('@/views/LicenseManage.vue'), meta: { roles: getAllowedRoles('license-manage') } },

      // ========== 健康档案中心 ==========
      { path: 'allergy-history', name: 'AllergyHistory', component: () => import('@/views/AllergyHistory.vue'), meta: { roles: getAllowedRoles('allergy-history') } },
      { path: 'physical-test-manage', name: 'PhysicalTestManage', component: () => import('@/views/PhysicalTestManage.vue'), meta: { roles: getAllowedRoles('physical-test-manage') } },
      { path: 'vision-posture', name: 'VisionPosture', component: () => import('@/views/VisionPosture.vue'), meta: { roles: getAllowedRoles('vision-posture') } },
      { path: 'oral-health', name: 'OralHealth', component: () => import('@/views/OralHealth.vue'), meta: { roles: getAllowedRoles('oral-health') } },
      { path: 'vaccine-manage', name: 'VaccineManage', component: () => import('@/views/VaccineManage.vue'), meta: { roles: getAllowedRoles('vaccine-manage') } },

      // ========== 校园健康管控 ==========
      { path: 'class-health-board', name: 'ClassHealthBoard', component: () => import('@/views/ClassHealthBoard.vue'), meta: { roles: getAllowedRoles('class-health-board') } },
      { path: 'absence-track', name: 'AbsenceTrack', component: () => import('@/views/AbsenceTrack.vue'), meta: { roles: getAllowedRoles('absence-track') } },
      { path: 'disease-warning', name: 'DiseaseWarning', component: () => import('@/views/DiseaseWarning.vue'), meta: { roles: getAllowedRoles('disease-warning') } },
      { path: 'accident-report', name: 'AccidentReport', component: () => import('@/views/AccidentReport.vue'), meta: { roles: getAllowedRoles('accident-report') } },
      { path: 'medical-supplies', name: 'MedicalSupplies', component: () => import('@/views/MedicalSupplies.vue'), meta: { roles: getAllowedRoles('medical-supplies') } },

      // ========== 膳食营养管理 ==========
      { path: 'recipe-manage', name: 'RecipeManage', component: () => import('@/views/RecipeManage.vue'), meta: { roles: getAllowedRoles('recipe-manage') } },
      { path: 'dining-record', name: 'DiningRecord', component: () => import('@/views/DiningRecord.vue'), meta: { roles: getAllowedRoles('dining-record') } },
      { path: 'nutrition-analysis', name: 'NutritionAnalysis', component: () => import('@/views/NutritionAnalysis.vue'), meta: { roles: getAllowedRoles('nutrition-analysis') } },

      // ========== 体育活动管理 ==========
      { path: 'sports-activity', name: 'SportsActivity', component: () => import('@/views/SportsActivity.vue'), meta: { roles: getAllowedRoles('sports-activity') } },
      { path: 'sports-ranking', name: 'SportsRanking', component: () => import('@/views/SportsRanking.vue'), meta: { roles: getAllowedRoles('sports-ranking') } },
      { path: 'exercise-knowledge-manage', name: 'ExerciseKnowledgeManage', component: () => import('@/views/ExerciseKnowledgeManage.vue'), meta: { roles: getAllowedRoles('exercise-knowledge-manage') } },
      { path: 'exercise-detail-manage', name: 'ExerciseDetailManage', component: () => import('@/views/ExerciseDetailManage.vue'), meta: { roles: getAllowedRoles('exercise-detail-manage') } },

      // ========== 健康教育资源 ==========
      { path: 'class-courseware', name: 'ClassCourseware', component: () => import('@/views/ClassCourseware.vue'), meta: { roles: getAllowedRoles('class-courseware') } },
      { path: 'seasonal-science', name: 'SeasonalScience', component: () => import('@/views/SeasonalScience.vue'), meta: { roles: getAllowedRoles('seasonal-science') } },
      { path: 'safety-education', name: 'SafetyEducation', component: () => import('@/views/SafetyEducation.vue'), meta: { roles: getAllowedRoles('safety-education') } },
      { path: 'mental-health', name: 'MentalHealth', component: () => import('@/views/MentalHealth.vue'), meta: { roles: getAllowedRoles('mental-health') } },

      // ========== 数据统计报表 ==========
      { path: 'health-data-dashboard', name: 'HealthDataDashboard', component: () => import('@/views/HealthDataDashboard.vue'), meta: { roles: getAllowedRoles('health-data-dashboard') } },
      { path: 'health-report', name: 'HealthReport', component: () => import('@/views/HealthReport.vue'), meta: { roles: getAllowedRoles('health-report') } },
      { path: 'archive-export', name: 'ArchiveExport', component: () => import('@/views/ArchiveExport.vue'), meta: { roles: getAllowedRoles('archive-export') } },

      // ========== 消息中心 ==========
      { path: 'announcement-manage', name: 'AnnouncementManage', component: () => import('@/views/AnnouncementManage.vue'), meta: { roles: getAllowedRoles('announcement-manage') } },
      { path: 'push-message', name: 'PushMessage', component: () => import('@/views/PushMessage.vue'), meta: { roles: getAllowedRoles('push-message') } },
      { path: 'consultation-manage', name: 'ConsultationManage', component: () => import('@/views/ConsultationManage.vue'), meta: { roles: getAllowedRoles('consultation-manage') } },

      // ========== 学生端 ==========
      { path: 'daily-check', name: 'DailyCheck', component: () => import('@/views/DailyCheck.vue'), meta: { roles: getAllowedRoles('daily-check') } },
      { path: 'health-task', name: 'HealthTask', component: () => import('@/views/HealthTask.vue'), meta: { roles: getAllowedRoles('health-task') } },
      { path: 'physical-profile', name: 'PhysicalProfile', component: () => import('@/views/PhysicalProfile.vue'), meta: { roles: getAllowedRoles('physical-profile') } },
      { path: 'points-ranking', name: 'PointsRanking', component: () => import('@/views/PointsRanking.vue'), meta: { roles: getAllowedRoles('points-ranking') } },
      { path: 'activity-signup', name: 'ActivitySignup', component: () => import('@/views/ActivitySignup.vue'), meta: { roles: getAllowedRoles('activity-signup') } },

      // ========== 家长端 ==========
      { path: 'child-health', name: 'ChildHealth', component: () => import('@/views/ChildHealth.vue'), meta: { roles: getAllowedRoles('child-health') } },
      { path: 'medical-history', name: 'MedicalHistory', component: () => import('@/views/MedicalHistory.vue'), meta: { roles: getAllowedRoles('medical-history') } },
      { path: 'leave-request', name: 'LeaveRequest', component: () => import('@/views/LeaveRequest.vue'), meta: { roles: getAllowedRoles('leave-request') } },
      { path: 'notification-center', name: 'NotificationCenter', component: () => import('@/views/NotificationCenter.vue'), meta: { roles: getAllowedRoles('notification-center') } },
      { path: 'recipe-feedback', name: 'RecipeFeedback', component: () => import('@/views/RecipeFeedback.vue'), meta: { roles: getAllowedRoles('recipe-feedback') } },
      { path: 'accompany-check', name: 'AccompanyCheck', component: () => import('@/views/AccompanyCheck.vue'), meta: { roles: getAllowedRoles('accompany-check') } },
      { path: 'parent-communication', name: 'ParentCommunication', component: () => import('@/views/ParentCommunication.vue'), meta: { roles: getAllowedRoles('parent-communication') } },

      // ========== 教师端 ==========
      { path: 'absence-register', name: 'AbsenceRegister', component: () => import('@/views/AbsenceRegister.vue'), meta: { roles: getAllowedRoles('absence-register') } },
      { path: 'incident-report', name: 'IncidentReport', component: () => import('@/views/IncidentReport.vue'), meta: { roles: getAllowedRoles('incident-report') } },
      { path: 'task-publish', name: 'TaskPublish', component: () => import('@/views/TaskPublish.vue'), meta: { roles: getAllowedRoles('task-publish') } },
      { path: 'class-activity', name: 'ClassActivity', component: () => import('@/views/ClassActivity.vue'), meta: { roles: getAllowedRoles('class-activity') } },
      { path: 'task-completion', name: 'TaskCompletion', component: () => import('@/views/TaskCompletion.vue'), meta: { roles: getAllowedRoles('task-completion') } },
      { path: 'health-homework', name: 'HealthHomework', component: () => import('@/views/HealthHomework.vue'), meta: { roles: getAllowedRoles('health-homework') } },
      { path: 'homework-correct', name: 'HomeworkCorrect', component: () => import('@/views/HomeworkCorrect.vue'), meta: { roles: getAllowedRoles('homework-correct') } },

      // ========== 校医端 ==========
      { path: 'abnormal-handle', name: 'AbnormalHandle', component: () => import('@/views/AbnormalHandle.vue'), meta: { roles: getAllowedRoles('abnormal-handle') } },
      { path: 'isolation-manage', name: 'IsolationManage', component: () => import('@/views/IsolationManage.vue'), meta: { roles: getAllowedRoles('isolation-manage') } },
      { path: 'health-guidance', name: 'HealthGuidance', component: () => import('@/views/HealthGuidance.vue'), meta: { roles: getAllowedRoles('health-guidance') } },
      { path: 'batch-entry', name: 'BatchEntry', component: () => import('@/views/BatchEntry.vue'), meta: { roles: getAllowedRoles('batch-entry') } },

      // ========== 个人健康管理（原有）==========
      { path: 'user-health-manage', name: 'UserHealthManage', component: () => import('@/views/UserHealthManage.vue'), meta: { roles: getAllowedRoles('user-health-manage') } },
      { path: 'health-upload', name: 'HealthUpload', component: () => import('@/views/HealthUpload.vue'), meta: { roles: getAllowedRoles('health-upload') } },
      { path: 'health-assessment', name: 'HealthAssessment', component: () => import('@/views/HealthAssessment.vue'), meta: { roles: getAllowedRoles('health-assessment') } },
      { path: 'exercise-knowledge', name: 'ExerciseKnowledge', component: () => import('@/views/ExerciseKnowledge.vue'), meta: { roles: getAllowedRoles('exercise-knowledge') } },
      { path: 'health-log', name: 'HealthLog', component: () => import('@/views/HealthLog.vue'), meta: { roles: getAllowedRoles('health-log') } }
    ]
  }
];

// 创建路由实例
const router = new Router({
  mode: 'hash',
  routes
});

// ==================== 路由守卫 ====================
router.beforeEach(async (to, from, next) => {
  try {
    // 0. 检查是否需要授权（激活页面不需要）
    if (to.path === '/activate') {
      return next();
    }

    // 1. 访问 /login：所有人都能进；已有登录身份时清掉后放行
    if (to.path === '/login') {
      // 但先检查授权状态
      const licenseInfo = localStorage.getItem('license_info');
      if (!licenseInfo) {
        return next('/activate');
      }
      try {
        const info = JSON.parse(licenseInfo);
        if (info.valid_end && new Date(info.valid_end) < new Date()) {
          // 授权已过期
          return next('/activate');
        }
      } catch (e) {
        return next('/activate');
      }

      const t = localStorage.getItem('token');
      if (t) {
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
      }
      return next();
    }

    // 2. 检查系统授权状态（除了激活页面，其他都需要授权）
    if (to.meta.requiresLicense !== false) {
      const licenseInfo = localStorage.getItem('license_info');
      if (!licenseInfo) {
        return next('/activate');
      }
      try {
        const info = JSON.parse(licenseInfo);
        // 检查授权是否过期
        if (info.valid_end && new Date(info.valid_end) < new Date()) {
          localStorage.removeItem('license_info');
          return next('/activate');
        }
      } catch (e) {
        return next('/activate');
      }
    }

    // 3. 读取本地身份
    const token = localStorage.getItem('token');
    let userRole = null;
    try {
      const raw = localStorage.getItem('userInfo');
      if (raw) {
        const obj = JSON.parse(raw);
        if (obj && obj.role) userRole = obj.role;
      }
    } catch (e) {
      userRole = null;
    }

    // 4. 没有有效身份 → 跳登录页
    const VALID = ['admin', 'teacher', 'parent', 'student', 'doctor'];
    if (!token || !userRole || !VALID.includes(userRole)) {
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
      return next('/login');
    }

    // 5. 管理员 → 永远放行
    if (userRole === 'admin') return next();

    // 6. 其他角色 → 按权限表判定
    const pathKey = String(to.path).replace(/^\//, '');
    const allowed = ROLE_PERMISSIONS[pathKey];
    if (allowed && allowed.includes(userRole)) return next();

    // 7. 无权限 → 跳回首页，不清除身份
    if (to.path === '/dashboard') return next();
    return next('/dashboard');
  } catch (err) {
    // 任何异常 → 保持登录状态，跳首页
    if (to.path === '/dashboard') return next();
    return next('/dashboard');
  }
});

export default router;
