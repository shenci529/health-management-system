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
        :class="{ unread: !notification.isRead, read: notification.isRead }"
        @click="viewNotification(notification)">
        <div class="notification-status">
          <div class="status-dot" :class="{ unread: !notification.isRead }"></div>
        </div>
        <div class="notification-icon" :class="notification.type">
          <i :class="typeIcon(notification.type)"></i>
        </div>
        <div class="notification-content">
          <div class="notification-header">
            <span class="notification-title">{{ notification.title }}</span>
            <div class="notification-tags">
              <el-tag size="mini" :type="scopeTagType(notification.scope)">
                {{ scopeText(notification.scope) }}
              </el-tag>
              <el-tag size="mini" :type="priorityTagType(notification.priority)">
                {{ priorityText(notification.priority) }}
              </el-tag>
            </div>
          </div>
          <p class="notification-summary">{{ notification.summary }}</p>
          <div class="notification-meta">
            <span class="notification-time">
              <i class="el-icon-time"></i> {{ notification.time }}
            </span>
            <span class="notification-sender">
              <i class="el-icon-user"></i> {{ notification.sender }}
            </span>
          </div>
        </div>
        <div class="notification-actions" @click.stop>
          <el-button 
            v-if="!notification.isRead" 
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
            <el-tag :type="scopeTagType(currentNotification.scope)">
              {{ scopeText(currentNotification.scope) }}
            </el-tag>
            <el-tag :type="priorityTagType(currentNotification.priority)">
              {{ priorityText(currentNotification.priority) }}
            </el-tag>
          </div>
          <div class="detail-meta">
            <span><i class="el-icon-time"></i> {{ currentNotification.time }}</span>
            <span><i class="el-icon-user"></i> {{ currentNotification.sender }}</span>
          </div>
        </div>
        <div class="detail-content">
          <p>{{ currentNotification.content }}</p>
        </div>
        <div v-if="currentNotification.attachments" class="detail-attachments">
          <h4><i class="el-icon-paperclip"></i> 附件</h4>
          <div class="attachment-list">
            <div v-for="(file, index) in currentNotification.attachments" :key="index" class="attachment-item">
              <i class="el-icon-document"></i>
              <span>{{ file.name }}</span>
              <el-button type="text" size="small">下载</el-button>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'NotificationCenter',
  data() {
    return {
      filterType: 'all',
      filterScope: 'all',
      detailDialogVisible: false,
      currentNotification: null,
      notifications: [
        {
          id: 1,
          title: '关于本周五家长会的通知',
          summary: '本周五下午3点召开家长会，请各位家长准时参加，地点在三年级二班教室...',
          content: '各位家长：\n\n本周五（6月7日）下午3点将召开家长会，主要内容包括：\n\n1. 本学期学习情况总结\n2. 暑假安排说明\n3. 下学期教学计划\n\n地点：三年级二班教室\n时间：下午3:00-5:00\n\n请各位家长准时参加，如有特殊情况请提前告知班主任。',
          type: 'meeting',
          scope: 'class',
          priority: 'high',
          sender: '王老师',
          time: '2024-06-05 09:30',
          isRead: false
        },
        {
          id: 2,
          title: '端午节放假安排',
          summary: '根据国家法定节假日安排，端午节放假时间为6月8日至6月10日，共3天...',
          content: '全校师生：\n\n根据国家法定节假日安排，2024年端午节放假安排如下：\n\n放假时间：6月8日（周六）至6月10日（周一），共3天\n返校时间：6月11日（周二）正常上课\n\n注意事项：\n1. 请家长做好孩子的假期安全监管\n2. 注意饮食卫生，预防疾病\n3. 合理安排作息时间\n\n祝大家端午节安康！',
          type: 'holiday',
          scope: 'school',
          priority: 'normal',
          sender: '教务处',
          time: '2024-06-04 14:00',
          isRead: false
        },
        {
          id: 3,
          title: '学生健康体检通知',
          summary: '学校将于下周二组织全体学生进行健康体检，请家长配合做好相关准备...',
          content: '各位家长：\n\n学校定于6月11日（周二）组织全体学生进行健康体检，具体安排如下：\n\n体检项目：\n- 身高体重测量\n- 视力检查\n- 口腔检查\n- 心肺听诊\n\n注意事项：\n1. 请确保孩子当天早餐正常进食\n2. 穿着宽松舒适的衣物\n3. 如有特殊情况请提前告知班主任\n\n谢谢配合！',
          type: 'health',
          scope: 'school',
          priority: 'high',
          sender: '校医室',
          time: '2024-06-03 10:00',
          isRead: true
        },
        {
          id: 4,
          title: '数学竞赛获奖喜报',
          summary: '恭喜李明同学在市级数学竞赛中获得一等奖！',
          content: '热烈祝贺！\n\n我校三年级二班李明同学在2024年市级小学生数学竞赛中表现优异，荣获一等奖！\n\n这是李明同学刻苦学习的结果，也是老师辛勤教导的成果。希望全体同学以李明为榜样，努力学习，争取更大进步！\n\n特此报喜！',
          type: 'achievement',
          scope: 'class',
          priority: 'normal',
          sender: '教务处',
          time: '2024-06-02 16:30',
          isRead: true
        },
        {
          id: 5,
          title: '紧急：暴雨天气安全提醒',
          summary: '根据气象部门预报，今晚将有暴雨，请家长注意接送孩子安全...',
          content: '紧急通知：\n\n根据市气象局预报，今晚至明天上午我市将有暴雨，局部大暴雨。\n\n请家长注意：\n1. 放学时请提前到校接孩子\n2. 注意交通安全，减速慢行\n3. 如遇特殊情况，学校将启动应急预案\n\n请大家务必注意安全！',
          type: 'emergency',
          scope: 'school',
          priority: 'urgent',
          sender: '校长办公室',
          time: '2024-06-01 15:00',
          isRead: true
        },
        {
          id: 6,
          title: '班级活动：亲子运动会报名',
          summary: '本周六将举行班级亲子运动会，欢迎家长和孩子一同参加...',
          content: '亲爱的家长：\n\n为了增进亲子关系，促进家校互动，我们将于本周六（6月8日）上午举行班级亲子运动会。\n\n活动时间：上午9:00-11:30\n活动地点：学校操场\n\n活动项目：\n1. 亲子接力赛\n2. 家庭拔河\n3. 趣味游戏\n\n请有意向参加的家庭在周四前报名，期待您的参与！',
          type: 'activity',
          scope: 'class',
          priority: 'normal',
          sender: '家委会',
          time: '2024-05-30 20:00',
          isRead: true
        }
      ]
    };
  },
  computed: {
    totalCount() {
      return this.notifications.length;
    },
    unreadCount() {
      return this.notifications.filter(n => !n.isRead).length;
    },
    classCount() {
      return this.notifications.filter(n => n.scope === 'class').length;
    },
    schoolCount() {
      return this.notifications.filter(n => n.scope === 'school').length;
    },
    filteredNotifications() {
      let result = this.notifications;
      
      // 按阅读状态筛选
      if (this.filterType === 'unread') {
        result = result.filter(n => !n.isRead);
      } else if (this.filterType === 'read') {
        result = result.filter(n => n.isRead);
      }
      
      // 按范围筛选
      if (this.filterScope !== 'all') {
        result = result.filter(n => n.scope === this.filterScope);
      }
      
      return result;
    }
  },
  methods: {
    // 查看通知详情
    viewNotification(notification) {
      this.currentNotification = notification;
      this.detailDialogVisible = true;
      if (!notification.isRead) {
        this.markAsRead(notification.id);
      }
    },
    // 标记已读
    markAsRead(id) {
      const notification = this.notifications.find(n => n.id === id);
      if (notification) {
        notification.isRead = true;
      }
    },
    // 全部标记已读
    markAllRead() {
      this.$confirm('确定要将所有通知标记为已读吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }).then(() => {
        this.notifications.forEach(n => n.isRead = true);
        this.$message.success('已全部标记为已读');
      }).catch(() => {});
    },
    // 删除通知
    deleteNotification(id) {
      this.$confirm('确定要删除该通知吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const index = this.notifications.findIndex(n => n.id === id);
        if (index > -1) {
          this.notifications.splice(index, 1);
          this.$message.success('删除成功');
        }
      }).catch(() => {});
    },
    // 清空已读
    clearAll() {
      const readCount = this.notifications.filter(n => n.isRead).length;
      if (readCount === 0) {
        this.$message.info('没有已读通知需要清空');
        return;
      }
      this.$confirm(`确定要清空 ${readCount} 条已读通知吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.notifications = this.notifications.filter(n => !n.isRead);
        this.$message.success('已清空已读通知');
      }).catch(() => {});
    },
    // 类型图标
    typeIcon(type) {
      const map = {
        meeting: 'el-icon-s-custom',
        holiday: 'el-icon-date',
        health: 'el-icon-first-aid-kit',
        achievement: 'el-icon-trophy',
        emergency: 'el-icon-warning',
        activity: 'el-icon-basketball'
      };
      return map[type] || 'el-icon-message';
    },
    // 范围文本
    scopeText(scope) {
      const map = {
        class: '班级',
        school: '全校'
      };
      return map[scope] || scope;
    },
    // 范围标签类型
    scopeTagType(scope) {
      return scope === 'school' ? 'success' : 'primary';
    },
    // 优先级文本
    priorityText(priority) {
      const map = {
        urgent: '紧急',
        high: '重要',
        normal: '普通'
      };
      return map[priority] || priority;
    },
    // 优先级标签类型
    priorityTagType(priority) {
      const map = {
        urgent: 'danger',
        high: 'warning',
        normal: 'info'
      };
      return map[priority] || 'info';
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

.notification-icon.meeting {
  background: #E3F2FD;
  color: #2196F3;
}

.notification-icon.holiday {
  background: #F3E5F5;
  color: #9C27B0;
}

.notification-icon.health {
  background: #E8F5E9;
  color: #4CAF50;
}

.notification-icon.achievement {
  background: #FFF8E1;
  color: #FFC107;
}

.notification-icon.emergency {
  background: #FFEBEE;
  color: #F44336;
}

.notification-icon.activity {
  background: #E0F2F1;
  color: #009688;
}

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
