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

// 安装Vue Router插件，让Vue支持路由功能
Vue.use(Router);

// ==================== 路由配置表 ====================
// 这里定义了URL路径和页面组件的对应关系
const routes = [
  // 登录页路由：访问/login时显示Login.vue组件
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: Dashboard
      },
      // ========== 系统管理 ==========
      {
        path: 'user-manage',
        name: 'UserManage',
        component: UserManage
      },
      {
        path: 'role-manage',
        name: 'RoleManage',
        component: RoleManage
      },
      {
        path: 'class-grade-manage',
        name: 'ClassGradeManage',
        component: ClassGradeManage
      },
      {
        path: 'system-audit',
        name: 'SystemAudit',
        component: SystemAudit
      },
      {
        path: 'system-config',
        name: 'SystemConfig',
        component: SystemConfig
      },
      // ========== 健康档案中心 ==========
      {
        path: 'allergy-history',
        name: 'AllergyHistory',
        component: AllergyHistory
      },
      {
        path: 'physical-test-manage',
        name: 'PhysicalTestManage',
        component: PhysicalTestManage
      },
      {
        path: 'vision-posture',
        name: 'VisionPosture',
        component: VisionPosture
      },
      {
        path: 'oral-health',
        name: 'OralHealth',
        component: OralHealth
      },
      {
        path: 'vaccine-manage',
        name: 'VaccineManage',
        component: VaccineManage
      },
      // ========== 校园健康管控 ==========
      {
        path: 'class-health-board',
        name: 'ClassHealthBoard',
        component: ClassHealthBoard
      },
      {
        path: 'absence-track',
        name: 'AbsenceTrack',
        component: AbsenceTrack
      },
      {
        path: 'disease-warning',
        name: 'DiseaseWarning',
        component: DiseaseWarning
      },
      {
        path: 'accident-report',
        name: 'AccidentReport',
        component: AccidentReport
      },
      {
        path: 'medical-supplies',
        name: 'MedicalSupplies',
        component: MedicalSupplies
      },
      // ========== 膳食营养管理 ==========
      {
        path: 'recipe-manage',
        name: 'RecipeManage',
        component: RecipeManage
      },
      {
        path: 'dining-record',
        name: 'DiningRecord',
        component: DiningRecord
      },
      {
        path: 'nutrition-analysis',
        name: 'NutritionAnalysis',
        component: NutritionAnalysis
      },
      // ========== 体育活动管理 ==========
      {
        path: 'sports-activity',
        name: 'SportsActivity',
        component: SportsActivity
      },
      {
        path: 'sports-ranking',
        name: 'SportsRanking',
        component: SportsRanking
      },
      {
        path: 'exercise-knowledge-manage',
        name: 'ExerciseKnowledgeManage',
        component: ExerciseKnowledgeManage
      },
      {
        path: 'exercise-detail-manage',
        name: 'ExerciseDetailManage',
        component: ExerciseDetailManage
      },
      // ========== 健康教育资源 ==========
      {
        path: 'class-courseware',
        name: 'ClassCourseware',
        component: ClassCourseware
      },
      {
        path: 'seasonal-science',
        name: 'SeasonalScience',
        component: SeasonalScience
      },
      {
        path: 'safety-education',
        name: 'SafetyEducation',
        component: SafetyEducation
      },
      {
        path: 'mental-health',
        name: 'MentalHealth',
        component: MentalHealth
      },
      // ========== 数据统计报表 ==========
      {
        path: 'health-data-dashboard',
        name: 'HealthDataDashboard',
        component: HealthDataDashboard
      },
      {
        path: 'health-report',
        name: 'HealthReport',
        component: HealthReport
      },
      {
        path: 'archive-export',
        name: 'ArchiveExport',
        component: ArchiveExport
      },
      // ========== 消息中心 ==========
      {
        path: 'announcement-manage',
        name: 'AnnouncementManage',
        component: AnnouncementManage
      },
      {
        path: 'push-message',
        name: 'PushMessage',
        component: PushMessage
      },
      {
        path: 'consultation-manage',
        name: 'ConsultationManage',
        component: ConsultationManage
      },
      // ========== 学生端 ==========
      {
        path: 'daily-check',
        name: 'DailyCheck',
        component: DailyCheck
      },
      {
        path: 'health-task',
        name: 'HealthTask',
        component: HealthTask
      },
      {
        path: 'physical-profile',
        name: 'PhysicalProfile',
        component: PhysicalProfile
      },
      {
        path: 'points-ranking',
        name: 'PointsRanking',
        component: PointsRanking
      },
      {
        path: 'activity-signup',
        name: 'ActivitySignup',
        component: ActivitySignup
      },
      // ========== 家长端 ==========
      {
        path: 'child-health',
        name: 'ChildHealth',
        component: ChildHealth
      },
      {
        path: 'medical-history',
        name: 'MedicalHistory',
        component: MedicalHistory
      },
      {
        path: 'leave-request',
        name: 'LeaveRequest',
        component: LeaveRequest
      },
      {
        path: 'notification-center',
        name: 'NotificationCenter',
        component: NotificationCenter
      },
      {
        path: 'recipe-feedback',
        name: 'RecipeFeedback',
        component: RecipeFeedback
      },
      {
        path: 'accompany-check',
        name: 'AccompanyCheck',
        component: AccompanyCheck
      },
      {
        path: 'parent-communication',
        name: 'ParentCommunication',
        component: ParentCommunication
      },
      // ========== 教师端 ==========
      {
        path: 'absence-register',
        name: 'AbsenceRegister',
        component: AbsenceRegister
      },
      {
        path: 'incident-report',
        name: 'IncidentReport',
        component: IncidentReport
      },
      {
        path: 'task-publish',
        name: 'TaskPublish',
        component: TaskPublish
      },
      {
        path: 'class-activity',
        name: 'ClassActivity',
        component: ClassActivity
      },
      {
        path: 'task-completion',
        name: 'TaskCompletion',
        component: TaskCompletion
      },
      {
        path: 'health-homework',
        name: 'HealthHomework',
        component: HealthHomework
      },
      {
        path: 'homework-correct',
        name: 'HomeworkCorrect',
        component: HomeworkCorrect
      },
      // ========== 校医端 ==========
      {
        path: 'abnormal-handle',
        name: 'AbnormalHandle',
        component: AbnormalHandle
      },
      {
        path: 'isolation-manage',
        name: 'IsolationManage',
        component: IsolationManage
      },
      {
        path: 'health-guidance',
        name: 'HealthGuidance',
        component: HealthGuidance
      },
      {
        path: 'batch-entry',
        name: 'BatchEntry',
        component: BatchEntry
      },
      // ========== 个人健康管理（原有） ==========
      {
        path: 'user-health-manage',
        name: 'UserHealthManage',
        component: UserHealthManage
      },
      {
        path: 'health-upload',
        name: 'HealthUpload',
        component: HealthUpload
      },
      {
        path: 'health-assessment',
        name: 'HealthAssessment',
        component: HealthAssessment
      },
      {
        path: 'exercise-knowledge',
        name: 'ExerciseKnowledge',
        component: ExerciseKnowledge
      },
      {
        path: 'health-log',
        name: 'HealthLog',
        component: HealthLog
      }
    ]
  }
];

// 创建路由实例
const router = new Router({
  mode: 'hash', // 路由模式：hash模式（URL中有#号，兼容性好）
  routes // 上面定义的路由配置表
});

// ==================== 路由守卫（安全检查） ====================
// beforeEach：在每次页面跳转前执行，用于检查用户是否登录
router.beforeEach((to, from, next) => {
  // 从localStorage中获取token（登录后后端会返回token，前端保存下来）
  const token = localStorage.getItem('token');
  
  // 如果用户要去的不是登录页，并且没有token（没登录），就强制跳转到登录页
  if (to.path !== '/login' && !token) {
    next('/login'); // 跳转到登录页
  } else {
    next(); // 否则正常放行，允许访问该页面
  }
});

// 导出路由实例，供main.js使用
export default router;