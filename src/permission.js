// ============================================================
// 路由权限映射表（唯一事实来源）
// ------------------------------------------------------------
// ⚠️ 重要：
//   1. 菜单渲染（Layout.vue）与路由守卫（router.beforeEach）
//      共享这同一张表，保证"能看到 = 能访问"。
//   2. 此模块无任何外部依赖（不 import Layout / 不 import Router），
//      所以可以被任意地方安全导入，不存在循环依赖风险。
//   3. key 是去掉首斜杠后的路径（如 'parent-communication'）。
//   4. value 是允许访问的角色数组（'admin' / 'teacher' / 'parent' / 'student' / 'doctor'）。
// ============================================================

export const ROLE_PERMISSIONS = {
  // ===== 所有角色的首页 =====
  dashboard:             ['admin', 'teacher', 'parent', 'student', 'doctor'],

  // ===== 系统管理（仅 admin）=====
  'user-manage':         ['admin'],
  'role-manage':         ['admin'],
  'class-grade-manage':  ['admin'],
  'system-audit':        ['admin'],
  'system-config':       ['admin'],
  'license-manage':      ['admin'],
  'announcement-manage': ['admin'],
  'push-message':        ['admin'],
  'consultation-manage': ['admin'],
  'archive-export':      ['admin'],

  // ===== 健康档案中心 =====
  'user-health-manage':  ['admin', 'teacher', 'doctor'],
  'allergy-history':     ['admin', 'teacher', 'doctor'],
  'physical-profile':    ['admin', 'teacher', 'parent', 'student', 'doctor'],
  'vision-posture':      ['admin', 'teacher', 'parent', 'student', 'doctor'],
  'oral-health':         ['admin', 'teacher', 'doctor'],
  'vaccine-manage':      ['admin', 'parent', 'doctor'],
  'physical-test-manage': ['admin', 'teacher', 'doctor', 'student'],

  // ===== 校园健康管控 =====
  'daily-check':         ['admin', 'teacher', 'parent', 'student', 'doctor'],
  'class-health-board':  ['admin', 'teacher', 'doctor'],
  'absence-register':    ['admin', 'teacher'],
  'absence-track':       ['admin', 'teacher', 'doctor'],
  'disease-warning':     ['admin', 'teacher', 'doctor'],
  'isolation-manage':    ['admin', 'doctor'],
  'accident-report':     ['admin', 'teacher'],
  'incident-report':     ['admin', 'teacher'],
  'medical-supplies':    ['admin', 'doctor'],
  'abnormal-handle':     ['admin', 'doctor'],

  // ===== 膳食营养管理 =====
  'recipe-manage':       ['admin', 'teacher', 'parent'],
  'dining-record':       ['admin', 'teacher'],
  'nutrition-analysis':  ['admin', 'teacher'],
  'recipe-feedback':     ['admin', 'teacher', 'parent'],

  // ===== 体育/任务/活动 =====
  'sports-activity':     ['admin', 'teacher', 'student'],
  'sports-ranking':      ['admin', 'teacher', 'student'],
  'points-ranking':      ['admin', 'teacher', 'parent', 'student'],
  'class-activity':      ['admin', 'teacher'],
  'activity-signup':     ['admin', 'teacher', 'student'],
  'task-publish':        ['admin', 'teacher'],
  'task-completion':     ['admin', 'teacher'],
  'accompany-check':     ['admin', 'teacher', 'parent', 'student'],
  'health-task':         ['admin', 'teacher', 'parent', 'student'],

  // ===== 健康教育 =====
  'exercise-knowledge-manage': ['admin', 'teacher'],
  'exercise-detail-manage':    ['admin', 'teacher'],
  'class-courseware':    ['admin', 'teacher'],
  'seasonal-science':    ['admin', 'teacher', 'parent', 'student'],
  'safety-education':    ['admin', 'teacher', 'student'],
  'health-guidance':     ['admin', 'doctor'],
  'exercise-knowledge':  ['admin', 'teacher', 'parent', 'student'],

  // ===== 心理健康 =====
  'mental-health':       ['admin', 'teacher'],

  // ===== 数据统计 =====
  'health-data-dashboard': ['admin', 'teacher', 'doctor'],
  'health-report':       ['admin', 'teacher', 'parent', 'student', 'doctor'],
  'health-assessment':   ['admin', 'teacher', 'student', 'doctor'],

  // ===== 消息中心 =====
  'notification-center': ['admin', 'teacher', 'parent', 'student', 'doctor'],
  'parent-communication': ['admin', 'teacher', 'parent', 'doctor'],
  'leave-request':       ['admin', 'teacher', 'parent'],

  // ===== 健康日志/数据上传 =====
  'health-upload':       ['admin', 'teacher', 'parent', 'student', 'doctor'],
  'batch-entry':         ['admin', 'doctor'],
  'health-log':          ['admin', 'teacher', 'parent', 'student'],

  // ===== 家长专属 =====
  'child-health':        ['admin', 'parent'],
  'medical-history':     ['admin', 'parent'],

  // ===== 健康作业 =====
  'health-homework':     ['admin', 'teacher', 'student'],
  'homework-correct':    ['admin', 'teacher'],

  // ===== 班级动态（图片/视频上传与查看）=====
  'class-posts':         ['admin', 'teacher'],
  'child-updates':       ['admin', 'parent']
};

// ============================================================
// 辅助函数：根据路径 key 获取允许的角色数组
//   pathKey 传入 'dashboard' / 'parent-communication' 等
//   未找到时，默认只有 admin 能访问（安全兜底）
// ============================================================
export function getAllowedRoles(pathKey) {
  if (!pathKey) return ['admin'];
  if (ROLE_PERMISSIONS[pathKey]) return ROLE_PERMISSIONS[pathKey];
  return ['admin'];
}

// ============================================================
// 请假数据共享管理（家长 <-> 教师 双向同步）
// ------------------------------------------------------------
// 作用：家长提交请假申请 → 写入 localStorage
//       教师端读取 → 审批 → 写回 localStorage
//       家长端再次打开 → 能看到审批结果
// ============================================================

const LEAVE_STORAGE_KEY = 'hms_leave_requests';

// 读取所有请假申请
function getLeaveRequests() {
  try {
    const raw = localStorage.getItem(LEAVE_STORAGE_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch (e) {
    return [];
  }
}

// 保存所有请假申请
function saveLeaveRequests(requests) {
  try {
    localStorage.setItem(LEAVE_STORAGE_KEY, JSON.stringify(requests));
    return true;
  } catch (e) {
    return false;
  }
}

// 家长提交新的请假申请
function submitLeaveRequest(request) {
  const list = getLeaveRequests();
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const h = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const timeStr = `${y}-${m}-${d} ${h}:${min}`;

  const newRequest = {
    id: 'LR' + Date.now(),
    studentName: request.studentName || '小明',
    parentName: request.parentName || '家长',
    type: request.type || 'sick',
    startDate: request.startDate,
    endDate: request.endDate,
    timeSlots: request.timeSlots || ['whole'],
    reason: request.reason || '',
    status: 'pending',
    applyTime: timeStr,
    approveTime: '',
    approveRemark: '',
    approver: '',
    source: '家长申请'  // 区分：家长申请 / 教师登记
  };

  list.unshift(newRequest);
  saveLeaveRequests(list);

  // 通知老师：有新的请假申请待审批
  sendNotif({
    type: 'leave_pending',
    title: '📋 新的请假申请',
    content: `学生 ${newRequest.studentName} 家长 ${newRequest.parentName} 提交了请假申请（${newRequest.type === 'sick' ? '病假' : '事假'}），请及时审批。`,
    fromRole: 'parent',
    fromUser: newRequest.parentName,
    toRoles: ['teacher', 'admin'],
    link: '/absence-register'
  });

  return newRequest;
}

// 教师审批（通过或拒绝）
function approveLeaveRequest(id, action, remark, approverName) {
  const list = getLeaveRequests();
  const idx = list.findIndex(r => r.id === id);
  if (idx < 0) return false;
  if (list[idx].status !== 'pending') return false;

  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const h = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const timeStr = `${y}-${m}-${d} ${h}:${min}`;

  const isApproved = action === 'approve';
  list[idx].status = isApproved ? 'approved' : 'rejected';
  list[idx].approveTime = timeStr;
  list[idx].approveRemark = remark || '';
  list[idx].approver = approverName || '教师';

  saveLeaveRequests(list);

  // 通知家长：审批结果
  sendNotif({
    type: isApproved ? 'leave_approved' : 'leave_rejected',
    title: isApproved ? '✅ 请假已批准' : '❌ 请假已拒绝',
    content: `您为学生 ${list[idx].studentName} 提交的${list[idx].type === 'sick' ? '病假' : '事假'}申请，教师 ${approverName || '教师'} 已${isApproved ? '批准' : '拒绝'}。${remark ? ('审批备注：' + remark) : ''}`,
    fromRole: 'teacher',
    fromUser: approverName || '教师',
    toRoles: ['parent'],
    link: '/leave-request'
  });

  return list[idx];
}

// 家长撤销请假
function cancelLeaveRequest(id) {
  const list = getLeaveRequests();
  const idx = list.findIndex(r => r.id === id);
  if (idx < 0) return false;

  const record = list[idx];
  list[idx].status = 'cancelled';
  saveLeaveRequests(list);

  // 通知老师：家长撤销了请假申请
  sendNotif({
    type: 'leave_cancelled',
    title: '📋 请假已撤销',
    content: `家长 ${record.parentName} 已撤销学生 ${record.studentName} 的${record.type === 'sick' ? '病假' : '事假'}申请。`,
    fromRole: 'parent',
    fromUser: record.parentName,
    toRoles: ['teacher', 'admin'],
    link: '/absence-register'
  });

  return true;
}

// 教师手动登记缺勤（同步到共享存储）
function registerAbsenceByTeacher(record) {
  const list = getLeaveRequests();
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const h = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const timeStr = `${y}-${m}-${d} ${h}:${min}`;

  const newRecord = {
    id: 'AB' + Date.now(),
    studentName: record.studentName || '',
    parentName: '—',
    type: record.type || record.absenceType || 'sick',
    startDate: record.absenceDate || record.startDate,
    endDate: record.absenceDate || record.endDate,
    timeSlots: ['whole'],
    reason: record.reason || record.healthStatus || '',
    status: 'registered',  // 教师直接登记，状态为"已登记"
    applyTime: timeStr,
    approveTime: timeStr,
    approveRemark: '',
    approver: record.approver || '教师',
    healthStatus: record.healthStatus || '',
    source: '教师登记'
  };

  list.unshift(newRecord);
  saveLeaveRequests(list);

  // 通知家长：教师登记了缺勤记录
  sendNotif({
    type: 'leave_registered',
    title: '📋 缺勤登记通知',
    content: `教师 ${newRecord.approver} 已为学生 ${newRecord.studentName} 登记缺勤记录，原因：${newRecord.reason || '未说明'}。`,
    fromRole: 'teacher',
    fromUser: newRecord.approver,
    toRoles: ['parent'],
    link: '/leave-request'
  });

  return newRecord;
}

export const LeaveStore = {
  getAll: getLeaveRequests,
  saveAll: saveLeaveRequests,
  submit: submitLeaveRequest,
  approve: approveLeaveRequest,
  cancel: cancelLeaveRequest,
  registerByTeacher: registerAbsenceByTeacher
};

// ============================================================
// 统一通知系统（家长 <-> 教师 <-> 校医 <-> 学生 实时同步）
// ------------------------------------------------------------
// 通知类型说明：
//   disease_warning   → 传染病预警（校医/管理员发布 → 家长+老师）
//   leave_pending     → 请假申请提交（家长提交 → 老师）
//   leave_approved    → 请假已批准（老师批准 → 家长）
//   leave_rejected    → 请假已拒绝（老师拒绝 → 家长）
//   leave_cancelled   → 请假已撤销（家长撤销 → 老师）
//   homework_assigned → 健康作业布置（老师布置 → 学生+家长）
//   homework_correct  → 作业已批改（老师批改 → 学生+家长）
//   task_published    → 健康任务发布（老师/管理员发布 → 家长+学生）
//   task_completed    → 任务已完成（家长/学生完成 → 老师）
//   announcement      → 系统公告（管理员发布 → 所有人）
//   push_message      → 推送消息（老师/管理员发布 → 指定角色）
//   health_upload     → 健康数据上传（家长上传 → 老师可见）
//   accident_report   → 意外事故上报（老师上报 → 校医+管理员+家长）
//   medical_warning   → 医疗风险预警（校医发布 → 家长+老师）
//   consultation      → 健康咨询回复（校医/老师回复 → 家长）
//   parent_comm       → 家校沟通消息（老师 ↔ 家长互发）
// ============================================================

const NOTIF_KEY = 'hms_notifications';

// 获取当前时间戳字符串
function nowStr() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
    `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

// 读取所有通知
function getAllNotifs() {
  try {
    const raw = localStorage.getItem(NOTIF_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch (e) {
    return [];
  }
}

// 保存所有通知
function saveAllNotifs(list) {
  try {
    localStorage.setItem(NOTIF_KEY, JSON.stringify(list));
  } catch (e) { /* ignore */ }
}

// 发送通知（toRoles: 目标角色数组；toUsers: 目标用户名数组）
function sendNotif({ type, title, content, fromRole, fromUser, toRoles, toUsers, link }) {
  const list = getAllNotifs();
  const notif = {
    id: 'NT' + Date.now(),
    type: type || 'info',
    title: title || '',
    content: content || '',
    fromRole: fromRole || '',
    fromUser: fromUser || '',
    toRoles: toRoles || [],
    toUsers: toUsers || [],
    link: link || '',
    timestamp: nowStr(),
    read: false,
    readTime: ''
  };
  list.unshift(notif);
  saveAllNotifs(list);
  return notif;
}

// 获取指定角色的通知（按时间倒序，未读的在前）
function getNotifsForRole(role) {
  const list = getAllNotifs();
  return list
    .filter(n => n.toRoles.includes(role) || n.toRoles.includes('all'))
    .sort((a, b) => {
      if (a.read !== b.read) return a.read ? 1 : -1;
      return b.timestamp.localeCompare(a.timestamp);
    });
}

// 标记某条通知已读
function markRead(notifId) {
  const list = getAllNotifs();
  const idx = list.findIndex(n => n.id === notifId);
  if (idx >= 0) {
    list[idx].read = true;
    list[idx].readTime = nowStr();
    saveAllNotifs(list);
  }
}

// 标记所有通知已读
function markAllRead(role) {
  const list = getAllNotifs();
  let changed = false;
  list.forEach(n => {
    if ((n.toRoles.includes(role) || n.toRoles.includes('all')) && !n.read) {
      n.read = true;
      n.readTime = nowStr();
      changed = true;
    }
  });
  if (changed) saveAllNotifs(list);
}

// 获取未读数
function getUnreadCount(role) {
  return getNotifsForRole(role).filter(n => !n.read).length;
}

// 清空某角色的通知
function clearAllForRole(role) {
  const list = getAllNotifs().filter(n => !n.toRoles.includes(role) && !n.toRoles.includes('all'));
  saveAllNotifs(list);
}

// 根据类型查询通知
function getNotifsByType(type) {
  return getAllNotifs().filter(n => n.type === type);
}

export const NotificationStore = {
  getAll: getAllNotifs,
  send: sendNotif,
  getForRole: getNotifsForRole,
  markRead,
  markAllRead,
  getUnreadCount,
  clearAll: clearAllForRole,
  getByType: getNotifsByType
};

// ============================================================
// 辅助函数：判断某角色能否访问某路径
//   未找到路径时只有 admin 能访问（安全兜底）
// ============================================================
export function canAccess(pathKey, role) {
  const allowed = getAllowedRoles(pathKey);
  return allowed.includes(role);
}
