<template>
  <div class="notification-center">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="title">
        <i class="el-icon-bell"></i>
        通知中心
      </h1>
      <p class="subtitle">及时了解学校动态，不错过任何重要信息</p>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-row">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon all-icon">
              <i class="el-icon-message"></i>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ totalCount }}</span>
              <span class="stat-label">全部通知</span>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon unread-icon">
              <i class="el-icon-message-solid"></i>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ unreadCount }}</span>
              <span class="stat-label">未读通知</span>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon class-icon">
              <i class="el-icon-school"></i>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ classCount }}</span>
              <span class="stat-label">班级通知</span>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon school-icon">
              <i class="el-icon-office-building"></i>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ schoolCount }}</span>
              <span class="stat-label">全校通知</span>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 筛选和操作栏 -->
    <div class="filter-bar">
      <div class="filter-group">
        <el-radio-group v-model="filterType" size="medium">
          <el-radio-button label="all">全部</el-radio-button>
          <el-radio-button label="unread">未读</el-radio-button>
          <el-radio-button label="read">已读</el-radio-button>
        </el-radio-group>
        <el-radio-group v-model="filterScope" size="medium" style="margin-left: 15px;">
          <el-radio-button label="all">全部范围</el-radio-button>
          <el-radio-button label="class">班级通知</el-radio-button>
          <el-radio-button label="school">全校通知</el-radio-button>
        </el-radio-group>
      </div>
      <div class="action-group">
        <el-button type="primary" plain size="medium" icon="el-icon-check" @click="markAllRead">
          全部已读
        </el-button>
        <el-button type="danger" plain size="medium" icon="el-icon-delete" @click="clearAll">
          清空已读
        </el-button>
      </div>
    </div>

    <!-- 通知列表 -->
    <div class="notification-list">
      <div 
        v-for="notification in filteredNotifications" 
        :key="notification.id" 
        class="notification-item"
        :class="{ unread: !notification.read, read: notification.read }"
        @click="viewNotification(notification)">
        <div class="notification-status">
          <div class="status-dot" :class="{ unread: !notification.read }"></div>
        </div>
        <div class="notification-icon" :class="typeBgClass(notification.type)">
          <i :class="typeIcon(notification.type)"></i>
        </div>
        <div class="notification-content">
          <div class="notification-header">
            <span class="notification-title">{{ notification.title }}</span>
            <div class="notification-tags">
              <el-tag size="mini" :type="scopeTagType(notification)">
                {{ scopeText(notification) }}
              </el-tag>
              <el-tag size="mini" :type="priorityTagType(notification)">
                {{ priorityText(notification) }}
              </el-tag>
            </div>
          </div>
          <p class="notification-summary">{{ notification.content }}</p>
          <div class="notification-meta">
            <span class="notification-time">
              <i class="el-icon-time"></i> {{ notification.timestamp }}
            </span>
            <span class="notification-sender">
              <i class="el-icon-user"></i> {{ senderText(notification) }}
            </span>
          </div>
        </div>
        <div class="notification-actions" @click.stop>
          <el-button 
            v-if="!notification.read" 
            type="text" 
            @click="markAsRead(notification.id)">
            标记已读
          </el-button>
          <el-button type="text" @click="deleteNotification(notification.id)">
            删除
          </el-button>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="filteredNotifications.length === 0" class="empty-state">
        <i class="el-icon-bell"></i>
        <p>暂无通知</p>
        <span class="empty-tip">当有新通知时，会显示在这里</span>
      </div>
    </div>

    <!-- 分页 -->
    <el-pagination
      v-if="filteredNotifications.length > 0"
      background
      layout="prev, pager, next, jumper"
      :total="filteredNotifications.length"
      :page-size="10"
      class="pagination">
    </el-pagination>

    <!-- 通知详情弹窗 -->
    <el-dialog
      :title="currentNotification?.title"
      :visible.sync="detailDialogVisible"
      width="600px"
      class="notification-dialog">
      <div v-if="currentNotification" class="notification-detail">
        <div class="detail-header">
          <div class="detail-tags">
            <el-tag :type="scopeTagType(currentNotification)">
              {{ scopeText(currentNotification) }}
            </el-tag>
            <el-tag :type="priorityTagType(currentNotification)">
              {{ priorityText(currentNotification) }}
            </el-tag>
          </div>
          <div class="detail-meta">
            <span><i class="el-icon-time"></i> {{ currentNotification.timestamp }}</span>
            <span><i class="el-icon-user"></i> {{ senderText(currentNotification) }}</span>
          </div>
        </div>
        <div class="detail-content">
          <p>{{ currentNotification.content }}</p>
        </div>
        <div v-if="currentNotification.link" class="detail-link">
          <el-button type="primary" size="small" @click="goToLink(currentNotification.link)">
            前往查看
          </el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { NotificationStore } from '@/permission';

export default {
  name: 'NotificationCenter',
  data() {
    return {
      filterType: 'all',
      filterScope: 'all',
      detailDialogVisible: false,
      currentNotification: null
    };
  },
  computed: {
    // 从 NotificationStore 读取当前角色通知
    allNotifications() {
      const userInfo = this.getCurrentUser();
      const role = userInfo ? userInfo.role : '';
      return NotificationStore.getForRole(role);
    },
    totalCount() {
      return this.allNotifications.length;
    },
    unreadCount() {
      return this.allNotifications.filter(n => !n.read).length;
    },
    classCount() {
      return this.allNotifications.filter(n => n.toRoles.includes('teacher') || n.toRoles.includes('parent')).length;
    },
    schoolCount() {
      return this.allNotifications.filter(n => n.toRoles.includes('all') || n.toRoles.includes('admin')).length;
    },
    filteredNotifications() {
      let result = this.allNotifications;
      if (this.filterType === 'unread') {
        result = result.filter(n => !n.read);
      } else if (this.filterType === 'read') {
        result = result.filter(n => n.read);
      }
      if (this.filterScope !== 'all') {
        if (this.filterScope === 'class') {
          result = result.filter(n => !n.toRoles.includes('all'));
        } else if (this.filterScope === 'school') {
          result = result.filter(n => n.toRoles.includes('all'));
        }
      }
      return result;
    }
  },
  mounted() {
    // 进入页面自动刷新通知
  },
  activated() {
    // 从其他页面返回时刷新
  },
  methods: {
    getCurrentUser() {
      try {
        const raw = localStorage.getItem('userInfo');
        return raw ? JSON.parse(raw) : null;
      } catch { return null; }
    },
    viewNotification(notification) {
      this.currentNotification = notification;
      this.detailDialogVisible = true;
      if (!notification.read) {
        NotificationStore.markRead(notification.id);
      }
    },
    markAsRead(id) {
      NotificationStore.markRead(id);
      this.$forceUpdate();
    },
    markAllRead() {
      const userInfo = this.getCurrentUser();
      const role = userInfo ? userInfo.role : '';
      NotificationStore.markAllRead(role);
      this.$forceUpdate();
      this.$message.success('已全部标记为已读');
    },
    deleteNotification(id) {
      this.$confirm('确定要删除该通知吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const list = NotificationStore.getAll();
        const filtered = list.filter(n => n.id !== id);
        localStorage.setItem('hms_notifications', JSON.stringify(filtered));
        this.$message.success('删除成功');
      }).catch(() => {});
    },
    clearAll() {
      const readCount = this.allNotifications.filter(n => n.read).length;
      if (readCount === 0) {
        this.$message.info('没有已读通知需要清空');
        return;
      }
      const userInfo = this.getCurrentUser();
      const role = userInfo ? userInfo.role : '';
      this.$confirm(`确定要清空 ${readCount} 条已读通知吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        NotificationStore.clearAll(role);
        this.$message.success('已清空已读通知');
      }).catch(() => {});
    },
    // 类型图标
    typeIcon(type) {
      const map = {
        disease_warning: 'el-icon-warning',
        leave_pending: 'el-icon-s-order',
        leave_approved: 'el-icon-circle-check',
        leave_rejected: 'el-icon-circle-close',
        leave_cancelled: 'el-icon-s-release',
        homework_assigned: 'el-icon-document',
        homework_correct: 'el-icon-edit',
        task_published: 'el-icon-medal',
        task_completed: 'el-icon-success',
        announcement: 'el-icon-megaphone',
        push_message: 'el-icon-bell',
        health_upload: 'el-icon-upload',
        accident_report: 'el-icon-warning-outline',
        medical_warning: 'el-icon-first-aid-kit',
        consultation: 'el-icon-service',
        parent_comm: 'el-icon-chat-line-round',
        meeting: 'el-icon-s-custom',
        holiday: 'el-icon-date',
        health: 'el-icon-first-aid-kit',
        achievement: 'el-icon-trophy',
        emergency: 'el-icon-warning',
        activity: 'el-icon-basketball'
      };
      return map[type] || 'el-icon-message';
    },
    // 通知图标背景色
    typeBgClass(type) {
      const map = {
        disease_warning: 'bg-danger',
        leave_pending: 'bg-warning',
        leave_approved: 'bg-success',
        leave_rejected: 'bg-danger',
        leave_cancelled: 'bg-info',
        homework_assigned: 'bg-primary',
        homework_correct: 'bg-success',
        task_published: 'bg-primary',
        task_completed: 'bg-success',
        announcement: 'bg-success',
        push_message: 'bg-primary',
        health_upload: 'bg-info',
        accident_report: 'bg-danger',
        medical_warning: 'bg-danger',
        consultation: 'bg-info',
        parent_comm: 'bg-primary',
        meeting: 'bg-primary',
        holiday: 'bg-purple',
        health: 'bg-success',
        achievement: 'bg-warning',
        emergency: 'bg-danger',
        activity: 'bg-teal'
      };
      return map[type] || 'bg-info';
    },
    // 范围文本（从 toRoles 推断）
    scopeText(notification) {
      const roles = notification.toRoles || [];
      if (roles.includes('all')) return '全校';
      if (roles.includes('parent') && roles.includes('teacher')) return '家校';
      if (roles.includes('parent')) return '家长';
      if (roles.includes('teacher')) return '教师';
      if (roles.includes('student')) return '学生';
      return '其他';
    },
    // 范围标签类型
    scopeTagType(notification) {
      const text = this.scopeText(notification);
      if (text === '全校') return 'success';
      if (text === '家校') return 'warning';
      return 'primary';
    },
    // 优先级文本
    priorityText(notification) {
      const type = notification.type || '';
      if (type.includes('emergency') || type.includes('accident') || type.includes('medical_warning') || type.includes('disease_warning')) return '紧急';
      if (type.includes('leave_pending') || type.includes('homework') || type.includes('task')) return '重要';
      return '普通';
    },
    // 优先级标签类型
    priorityTagType(notification) {
      const text = this.priorityText(notification);
      if (text === '紧急') return 'danger';
      if (text === '重要') return 'warning';
      return 'info';
    },
    // 发送者文本
    senderText(notification) {
      return notification.fromUser || notification.fromRole || '系统';
    },
    // 跳转链接
    goToLink(link) {
      if (link) {
        this.detailDialogVisible = false;
        this.$router.push('/' + link);
      }
    }
  }
};
</script>

<style scoped>
.notification-center {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

/* 页面标题 */
.page-header {
  text-align: center;
  margin-bottom: 30px;
}

.title {
  font-size: 28px;
  color: #409EFF;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin: 0;
}

.title i {
  color: #E6A23C;
  font-size: 32px;
}

.subtitle {
  color: #888;
  font-size: 16px;
  margin-top: 8px;
}

/* 统计卡片 */
.stats-row {
  margin-bottom: 25px;
}

.stat-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.all-icon {
  background: #E3F2FD;
  color: #2196F3;
}

.unread-icon {
  background: #FFEBEE;
  color: #F44336;
}

.class-icon {
  background: #E8F5E9;
  color: #4CAF50;
}

.school-icon {
  background: #FFF3E0;
  color: #FF9800;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #333;
}

.stat-label {
  font-size: 14px;
  color: #999;
}

/* 筛选栏 */
.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.filter-group {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.action-group {
  display: flex;
  gap: 10px;
}

/* 通知列表 */
.notification-list {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  padding: 20px;
  border-bottom: 1px solid #EBEEF5;
  cursor: pointer;
  transition: all 0.3s ease;
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-item:hover {
  background: #f5f7fa;
}

.notification-item.unread {
  background: #f0f9ff;
}

.notification-status {
  padding: 5px 10px;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #ddd;
}

.status-dot.unread {
  background: #F44336;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.notification-icon {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  margin-right: 15px;
  flex-shrink: 0;
}

.notification-icon.bg-danger { background: #FFEBEE; color: #F44336; }
.notification-icon.bg-success { background: #E8F5E9; color: #4CAF50; }
.notification-icon.bg-primary { background: #E3F2FD; color: #2196F3; }
.notification-icon.bg-warning { background: #FFF8E1; color: #FFC107; }
.notification-icon.bg-info { background: #E0F7FA; color: #00BCD4; }
.notification-icon.bg-purple { background: #F3E5F5; color: #9C27B0; }
.notification-icon.bg-teal { background: #E0F2F1; color: #009688; }
.notification-icon.bg-default { background: #F5F5F5; color: #9E9E9E; }

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.notification-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.notification-item.unread .notification-title {
  color: #409EFF;
}

.notification-tags {
  display: flex;
  gap: 8px;
}

.notification-summary {
  color: #666;
  font-size: 14px;
  line-height: 1.5;
  margin: 0 0 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.notification-meta {
  display: flex;
  gap: 20px;
  color: #999;
  font-size: 13px;
}

.notification-meta i {
  margin-right: 5px;
}

.notification-actions {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding-left: 15px;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: #999;
}

.empty-state i {
  font-size: 60px;
  color: #ddd;
  margin-bottom: 15px;
}

.empty-tip {
  font-size: 14px;
  color: #bbb;
}

/* 分页 */
.pagination {
  margin-top: 20px;
  text-align: center;
}

/* 详情弹窗 */
.notification-dialog >>> .el-dialog__header {
  border-bottom: 1px solid #EBEEF5;
  padding: 20px;
}

.notification-detail {
  padding: 10px;
}

.detail-header {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #EBEEF5;
}

.detail-tags {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.detail-meta {
  display: flex;
  gap: 20px;
  color: #999;
  font-size: 14px;
}

.detail-content {
  line-height: 1.8;
  color: #333;
  white-space: pre-line;
}

.detail-attachments {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #EBEEF5;
}

.detail-attachments h4 {
  margin: 0 0 15px;
  color: #666;
}

.attachment-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.attachment-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: #f5f7fa;
  border-radius: 4px;
}

.attachment-item i {
  color: #409EFF;
}

.attachment-item span {
  flex: 1;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .notification-center {
    padding: 15px;
  }

  .title {
    font-size: 22px;
  }

  .stat-card {
    padding: 15px;
  }

  .stat-icon {
    width: 40px;
    height: 40px;
    font-size: 20px;
  }

  .stat-value {
    font-size: 22px;
  }

  .filter-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-group, .action-group {
    justify-content: center;
  }

  .notification-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .notification-actions {
    flex-direction: row;
  }
}
</style>
