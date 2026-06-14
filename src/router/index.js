// ==================== 路由配置文件 ====================
// 这个文件定义了应用中所有的页面路由，以及页面之间的跳转关系

// 引入Vue和Vue Router
import Vue from 'vue';
import Router from 'vue-router';

// 引入各个页面组件（@符号表示src目录，是webpack配置的别名）
import Login from '@/views/Login.vue'; // 登录页面
import Layout from '@/views/Layout.vue'; // 主布局组件（包含侧边栏、顶部栏等）
import Dashboard from '@/views/Dashboard.vue'; // 首页/仪表盘

// ========== 系统管理（原有） ==========
import UserManage from '@/views/UserManage.vue';
import RoleManage from '@/views/RoleManage.vue';
import ExerciseKnowledgeManage from '@/views/ExerciseKnowledgeManage.vue';
import ExerciseDetailManage from '@/views/ExerciseDetailManage.vue';
import UserHealthManage from '@/views/UserHealthManage.vue';

// ========== 管理员端新增 ==========
import ClassGradeManage from '@/views/ClassGradeManage.vue';
import SystemAudit from '@/views/SystemAudit.vue';
import AllergyHistory from '@/views/AllergyHistory.vue';
import PhysicalTestManage from '@/views/PhysicalTestManage.vue';
import OralHealth from '@/views/OralHealth.vue';
import AbsenceTrack from '@/views/AbsenceTrack.vue';
import AccidentReport from '@/views/AccidentReport.vue';
import MedicalSupplies from '@/views/MedicalSupplies.vue';
import DiningRecord from '@/views/DiningRecord.vue';
import NutritionAnalysis from '@/views/NutritionAnalysis.vue';
import SportsActivity from '@/views/SportsActivity.vue';
import SportsRanking from '@/views/SportsRanking.vue';
import ClassCourseware from '@/views/ClassCourseware.vue';
import SeasonalScience from '@/views/SeasonalScience.vue';
import HealthDataDashboard from '@/views/HealthDataDashboard.vue';
import HealthReport from '@/views/HealthReport.vue';
import ArchiveExport from '@/views/ArchiveExport.vue';
import AnnouncementManage from '@/views/AnnouncementManage.vue';
import PushMessage from '@/views/PushMessage.vue';
import ConsultationManage from '@/views/ConsultationManage.vue';
import SystemConfig from '@/views/SystemConfig.vue';
import BatchEntry from '@/views/BatchEntry.vue';

// ========== 学生端 ==========
import DailyCheck from '@/views/DailyCheck.vue';
import HealthTask from '@/views/HealthTask.vue';
import PhysicalProfile from '@/views/PhysicalProfile.vue';
import PointsRanking from '@/views/PointsRanking.vue';
import ActivitySignup from '@/views/ActivitySignup.vue';

// ========== 家长端 ==========
import ChildHealth from '@/views/ChildHealth.vue';
import VaccineManage from '@/views/VaccineManage.vue';
import ParentCommunication from '@/views/ParentCommunication.vue';
import MedicalHistory from '@/views/MedicalHistory.vue';
import LeaveRequest from '@/views/LeaveRequest.vue';
import NotificationCenter from '@/views/NotificationCenter.vue';
import RecipeFeedback from '@/views/RecipeFeedback.vue';
import AccompanyCheck from '@/views/AccompanyCheck.vue';

// ========== 教师端 ==========
import ClassHealthBoard from '@/views/ClassHealthBoard.vue';
import DiseaseWarning from '@/views/DiseaseWarning.vue';
import RecipeManage from '@/views/RecipeManage.vue';
import VisionPosture from '@/views/VisionPosture.vue';
import MentalHealth from '@/views/MentalHealth.vue';
import SafetyEducation from '@/views/SafetyEducation.vue';
import AbsenceRegister from '@/views/AbsenceRegister.vue';
import IncidentReport from '@/views/IncidentReport.vue';
import TaskPublish from '@/views/TaskPublish.vue';
import ClassActivity from '@/views/ClassActivity.vue';
import TaskCompletion from '@/views/TaskCompletion.vue';
import HealthHomework from '@/views/HealthHomework.vue';
import HomeworkCorrect from '@/views/HomeworkCorrect.vue';

// ========== 校医端 ==========
import AbnormalHandle from '@/views/AbnormalHandle.vue';
import IsolationManage from '@/views/IsolationManage.vue';
import HealthGuidance from '@/views/HealthGuidance.vue';

// ========== 个人健康管理（原有） ==========
import HealthUpload from '@/views/HealthUpload.vue';
import HealthAssessment from '@/views/HealthAssessment.vue';
import ExerciseKnowledge from '@/views/ExerciseKnowledge.vue';
import HealthLog from '@/views/HealthLog.vue';

// 从独立模块导入权限表（唯一事实来源，无循环依赖）
// ⚠️ 路由守卫和 Layout.vue 的菜单过滤都共享此表，保证"能看到 = 能访问"
import { ROLE_PERMISSIONS, getAllowedRoles } from '@/permission';

// 安装Vue Router插件，让Vue支持路由功能
Vue.use(Router);

// ==================== 路由配置表 ====================
const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { roles: ['admin', 'teacher', 'parent', 'student', 'doctor'] }
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      { path: 'dashboard', name: 'Dashboard', component: Dashboard, meta: { roles: getAllowedRoles('dashboard') } },

      // ========== 系统管理 ==========
      { path: 'user-manage', name: 'UserManage', component: UserManage, meta: { roles: getAllowedRoles('user-manage') } },
      { path: 'role-manage', name: 'RoleManage', component: RoleManage, meta: { roles: getAllowedRoles('role-manage') } },
      { path: 'class-grade-manage', name: 'ClassGradeManage', component: ClassGradeManage, meta: { roles: getAllowedRoles('class-grade-manage') } },
      { path: 'system-audit', name: 'SystemAudit', component: SystemAudit, meta: { roles: getAllowedRoles('system-audit') } },
      { path: 'system-config', name: 'SystemConfig', component: SystemConfig, meta: { roles: getAllowedRoles('system-config') } },

      // ========== 健康档案中心 ==========
      { path: 'allergy-history', name: 'AllergyHistory', component: AllergyHistory, meta: { roles: getAllowedRoles('allergy-history') } },
      { path: 'physical-test-manage', name: 'PhysicalTestManage', component: PhysicalTestManage, meta: { roles: getAllowedRoles('physical-test-manage') } },
      { path: 'vision-posture', name: 'VisionPosture', component: VisionPosture, meta: { roles: getAllowedRoles('vision-posture') } },
      { path: 'oral-health', name: 'OralHealth', component: OralHealth, meta: { roles: getAllowedRoles('oral-health') } },
      { path: 'vaccine-manage', name: 'VaccineManage', component: VaccineManage, meta: { roles: getAllowedRoles('vaccine-manage') } },

      // ========== 校园健康管控 ==========
      { path: 'class-health-board', name: 'ClassHealthBoard', component: ClassHealthBoard, meta: { roles: getAllowedRoles('class-health-board') } },
      { path: 'absence-track', name: 'AbsenceTrack', component: AbsenceTrack, meta: { roles: getAllowedRoles('absence-track') } },
      { path: 'disease-warning', name: 'DiseaseWarning', component: DiseaseWarning, meta: { roles: getAllowedRoles('disease-warning') } },
      { path: 'accident-report', name: 'AccidentReport', component: AccidentReport, meta: { roles: getAllowedRoles('accident-report') } },
      { path: 'medical-supplies', name: 'MedicalSupplies', component: MedicalSupplies, meta: { roles: getAllowedRoles('medical-supplies') } },

      // ========== 膳食营养管理 ==========
      { path: 'recipe-manage', name: 'RecipeManage', component: RecipeManage, meta: { roles: getAllowedRoles('recipe-manage') } },
      { path: 'dining-record', name: 'DiningRecord', component: DiningRecord, meta: { roles: getAllowedRoles('dining-record') } },
      { path: 'nutrition-analysis', name: 'NutritionAnalysis', component: NutritionAnalysis, meta: { roles: getAllowedRoles('nutrition-analysis') } },

      // ========== 体育活动管理 ==========
      { path: 'sports-activity', name: 'SportsActivity', component: SportsActivity, meta: { roles: getAllowedRoles('sports-activity') } },
      { path: 'sports-ranking', name: 'SportsRanking', component: SportsRanking, meta: { roles: getAllowedRoles('sports-ranking') } },
      { path: 'exercise-knowledge-manage', name: 'ExerciseKnowledgeManage', component: ExerciseKnowledgeManage, meta: { roles: getAllowedRoles('exercise-knowledge-manage') } },
      { path: 'exercise-detail-manage', name: 'ExerciseDetailManage', component: ExerciseDetailManage, meta: { roles: getAllowedRoles('exercise-detail-manage') } },

      // ========== 健康教育资源 ==========
      { path: 'class-courseware', name: 'ClassCourseware', component: ClassCourseware, meta: { roles: getAllowedRoles('class-courseware') } },
      { path: 'seasonal-science', name: 'SeasonalScience', component: SeasonalScience, meta: { roles: getAllowedRoles('seasonal-science') } },
      { path: 'safety-education', name: 'SafetyEducation', component: SafetyEducation, meta: { roles: getAllowedRoles('safety-education') } },
      { path: 'mental-health', name: 'MentalHealth', component: MentalHealth, meta: { roles: getAllowedRoles('mental-health') } },

      // ========== 数据统计报表 ==========
      { path: 'health-data-dashboard', name: 'HealthDataDashboard', component: HealthDataDashboard, meta: { roles: getAllowedRoles('health-data-dashboard') } },
      { path: 'health-report', name: 'HealthReport', component: HealthReport, meta: { roles: getAllowedRoles('health-report') } },
      { path: 'archive-export', name: 'ArchiveExport', component: ArchiveExport, meta: { roles: getAllowedRoles('archive-export') } },

      // ========== 消息中心 ==========
      { path: 'announcement-manage', name: 'AnnouncementManage', component: AnnouncementManage, meta: { roles: getAllowedRoles('announcement-manage') } },
      { path: 'push-message', name: 'PushMessage', component: PushMessage, meta: { roles: getAllowedRoles('push-message') } },
      { path: 'consultation-manage', name: 'ConsultationManage', component: ConsultationManage, meta: { roles: getAllowedRoles('consultation-manage') } },

      // ========== 学生端 ==========
      { path: 'daily-check', name: 'DailyCheck', component: DailyCheck, meta: { roles: getAllowedRoles('daily-check') } },
      { path: 'health-task', name: 'HealthTask', component: HealthTask, meta: { roles: getAllowedRoles('health-task') } },
      { path: 'physical-profile', name: 'PhysicalProfile', component: PhysicalProfile, meta: { roles: getAllowedRoles('physical-profile') } },
      { path: 'points-ranking', name: 'PointsRanking', component: PointsRanking, meta: { roles: getAllowedRoles('points-ranking') } },
      { path: 'activity-signup', name: 'ActivitySignup', component: ActivitySignup, meta: { roles: getAllowedRoles('activity-signup') } },

      // ========== 家长端 ==========
      { path: 'child-health', name: 'ChildHealth', component: ChildHealth, meta: { roles: getAllowedRoles('child-health') } },
      { path: 'medical-history', name: 'MedicalHistory', component: MedicalHistory, meta: { roles: getAllowedRoles('medical-history') } },
      { path: 'leave-request', name: 'LeaveRequest', component: LeaveRequest, meta: { roles: getAllowedRoles('leave-request') } },
      { path: 'notification-center', name: 'NotificationCenter', component: NotificationCenter, meta: { roles: getAllowedRoles('notification-center') } },
      { path: 'recipe-feedback', name: 'RecipeFeedback', component: RecipeFeedback, meta: { roles: getAllowedRoles('recipe-feedback') } },
      { path: 'accompany-check', name: 'AccompanyCheck', component: AccompanyCheck, meta: { roles: getAllowedRoles('accompany-check') } },
      { path: 'parent-communication', name: 'ParentCommunication', component: ParentCommunication, meta: { roles: getAllowedRoles('parent-communication') } },

      // ========== 教师端 ==========
      { path: 'absence-register', name: 'AbsenceRegister', component: AbsenceRegister, meta: { roles: getAllowedRoles('absence-register') } },
      { path: 'incident-report', name: 'IncidentReport', component: IncidentReport, meta: { roles: getAllowedRoles('incident-report') } },
      { path: 'task-publish', name: 'TaskPublish', component: TaskPublish, meta: { roles: getAllowedRoles('task-publish') } },
      { path: 'class-activity', name: 'ClassActivity', component: ClassActivity, meta: { roles: getAllowedRoles('class-activity') } },
      { path: 'task-completion', name: 'TaskCompletion', component: TaskCompletion, meta: { roles: getAllowedRoles('task-completion') } },
      { path: 'health-homework', name: 'HealthHomework', component: HealthHomework, meta: { roles: getAllowedRoles('health-homework') } },
      { path: 'homework-correct', name: 'HomeworkCorrect', component: HomeworkCorrect, meta: { roles: getAllowedRoles('homework-correct') } },

      // ========== 校医端 ==========
      { path: 'abnormal-handle', name: 'AbnormalHandle', component: AbnormalHandle, meta: { roles: getAllowedRoles('abnormal-handle') } },
      { path: 'isolation-manage', name: 'IsolationManage', component: IsolationManage, meta: { roles: getAllowedRoles('isolation-manage') } },
      { path: 'health-guidance', name: 'HealthGuidance', component: HealthGuidance, meta: { roles: getAllowedRoles('health-guidance') } },
      { path: 'batch-entry', name: 'BatchEntry', component: BatchEntry, meta: { roles: getAllowedRoles('batch-entry') } },

      // ========== 个人健康管理（原有） ==========
      { path: 'user-health-manage', name: 'UserHealthManage', component: UserHealthManage, meta: { roles: getAllowedRoles('user-health-manage') } },
      { path: 'health-upload', name: 'HealthUpload', component: HealthUpload, meta: { roles: getAllowedRoles('health-upload') } },
      { path: 'health-assessment', name: 'HealthAssessment', component: HealthAssessment, meta: { roles: getAllowedRoles('health-assessment') } },
      { path: 'exercise-knowledge', name: 'ExerciseKnowledge', component: ExerciseKnowledge, meta: { roles: getAllowedRoles('exercise-knowledge') } },
      { path: 'health-log', name: 'HealthLog', component: HealthLog, meta: { roles: getAllowedRoles('health-log') } }
    ]
  }
];

// 创建路由实例
const router = new Router({
  mode: 'hash',
  routes
});

// ==================== 路由守卫（极简，零异常，admin 永远放行）====================
// ⚠️ 原则：
//   1. 只有「完全没有 token 或 userInfo.role 不合法」时，才跳转到登录页。
//   2. 已登录的管理员（admin）→ 永远放行，所有路径都能访问。
//   3. 已登录的其他角色 → 按 ROLE_PERMISSIONS 判定；无权访问的路径跳回首页，**绝不清除身份**。
//   4. 用 try-catch 包裹全部逻辑，任何异常都不清身份。
router.beforeEach((to, from, next) => {
  try {
    // 1. 访问 /login：所有人都能进；已有登录身份时清掉后放行（允许切换账号）
    if (to.path === '/login') {
      const t = localStorage.getItem('token');
      if (t) {
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
      }
      return next();
    }

    // 2. 读取本地身份
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

    // 3. 没有有效身份 → 跳登录页（只在这里清身份）
    const VALID = ['admin', 'teacher', 'parent', 'student', 'doctor'];
    if (!token || !userRole || !VALID.includes(userRole)) {
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
      return next('/login');
    }

    // 4. 管理员 → 永远放行，所有路径都能访问
    if (userRole === 'admin') return next();

    // 5. 其他角色 → 用 ROLE_PERMISSIONS 判定
    const pathKey = String(to.path).replace(/^\//, '');
    const allowed = ROLE_PERMISSIONS[pathKey];
    if (allowed && allowed.includes(userRole)) return next();

    // 6. 无权限 → 跳回首页，绝不清除身份！
    if (to.path === '/dashboard') return next();
    return next('/dashboard');
  } catch (err) {
    // 任何异常 → 保持登录状态，跳首页，不清身份
    if (to.path === '/dashboard') return next();
    return next('/dashboard');
  }
});

export default router;