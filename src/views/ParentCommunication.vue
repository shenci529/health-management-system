<template>
  <div class="parent-communication">
    <!-- 班级健康公告 -->
    <el-card class="section-card">
      <div slot="header" class="section-header">
        <span class="section-title">
          <i class="el-icon-bell"></i> 班级健康公告
        </span>
        <el-badge :value="unreadAnnouncements" class="badge-item" type="danger"></el-badge>
      </div>
      
      <div class="announcement-list">
        <el-empty v-if="announcements.length === 0" description="暂无班级公告" :image-size="80"></el-empty>
        <div v-for="(item, index) in announcements" :key="index" class="announcement-item">
          <div class="announcement-icon">
            <i class="el-icon-message-solid"></i>
          </div>
          <div class="announcement-content">
            <div class="announcement-title">
              {{ item.title }}
              <el-tag size="small" :type="item.isRead ? 'info' : 'danger'">{{ item.isRead ? '已读' : '未读' }}</el-tag>
            </div>
            <div class="announcement-info">
              <span class="announcement-author">{{ item.author }}</span>
              <span class="announcement-date">{{ item.date }}</span>
            </div>
            <div class="announcement-desc">{{ item.content }}</div>
          </div>
          <el-button type="text" size="small" @click="handleAnnouncementDetail(item)">查看详情</el-button>
        </div>
      </div>
    </el-card>

    <!-- 健康问题私信咨询 -->
    <el-card class="section-card chat-card">
      <div slot="header" class="section-header">
        <span class="section-title">
          <i class="el-icon-chat-dot-round"></i> 健康问题私信咨询
        </span>
        <el-select v-model="selectedTeacher" placeholder="选择咨询对象" size="small" style="width: 150px;">
          <el-option label="班主任 - 李老师" value="teacher1"></el-option>
          <el-option label="校医 - 王医生" value="doctor"></el-option>
          <el-option label="保健老师 - 张老师" value="health_teacher"></el-option>
        </el-select>
      </div>
      
      <div class="chat-container">
        <!-- 聊天消息列表 -->
        <div class="chat-messages" ref="chatMessages">
          <el-empty v-if="messages.length === 0" description="暂无消息记录" :image-size="60"></el-empty>
          <div v-for="(msg, index) in messages" :key="index" class="message-item" :class="msg.sender === 'parent' ? 'parent-message' : 'teacher-message'">
            <div class="message-avatar">
              <el-avatar :size="36" :icon="msg.sender === 'parent' ? 'el-icon-user' : 'el-icon-s-custom'"></el-avatar>
            </div>
            <div class="message-content">
              <div class="message-header">
                <span class="message-sender">{{ msg.sender === 'parent' ? '我' : msg.senderName }}</span>
                <span class="message-time">{{ msg.time }}</span>
              </div>
              <div class="message-text">{{ msg.content }}</div>
            </div>
          </div>
        </div>
        
        <!-- 发送消息表单 -->
        <div class="chat-input">
          <el-input
            v-model="newMessage"
            placeholder="输入消息内容..."
            @keyup.enter.native="sendMessage"
            class="message-input">
          </el-input>
          <el-button type="primary" @click="sendMessage" :disabled="!newMessage.trim()">
            <i class="el-icon-s-promotion"></i> 发送
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 发送新消息表单 -->
    <el-card class="section-card">
      <div slot="header" class="section-header">
        <span class="section-title">
          <i class="el-icon-edit"></i> 发送新消息
        </span>
      </div>
      
      <el-form :model="messageForm" :rules="messageRules" ref="messageForm" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="接收对象" prop="receiver">
              <el-select v-model="messageForm.receiver" placeholder="请选择接收对象" style="width: 100%;">
                <el-option label="班主任 - 李老师" value="teacher1"></el-option>
                <el-option label="校医 - 王医生" value="doctor"></el-option>
                <el-option label="保健老师 - 张老师" value="health_teacher"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="消息主题" prop="subject">
              <el-select v-model="messageForm.subject" placeholder="请选择主题" style="width: 100%;">
                <el-option label="健康咨询" value="health"></el-option>
                <el-option label="请假申请" value="leave"></el-option>
                <el-option label="疫苗接种" value="vaccine"></el-option>
                <el-option label="体检相关" value="exam"></el-option>
                <el-option label="其他问题" value="other"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="紧急程度" prop="urgency">
              <el-select v-model="messageForm.urgency" placeholder="请选择紧急程度" style="width: 100%;">
                <el-option label="普通" value="normal"></el-option>
                <el-option label="紧急" value="urgent"></el-option>
                <el-option label="非常紧急" value="very_urgent"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="消息内容" prop="content">
          <el-input
            type="textarea"
            v-model="messageForm.content"
            placeholder="请输入消息内容"
            :rows="4">
          </el-input>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="submitMessageForm">
            <i class="el-icon-check"></i> 发送消息
          </el-button>
          <el-button @click="resetMessageForm">
            <i class="el-icon-refresh"></i> 重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 消息历史记录 -->
    <el-card class="section-card">
      <div slot="header" class="section-header">
        <span class="section-title">
          <i class="el-icon-time"></i> 消息历史记录
        </span>
        <el-input
          v-model="searchKeyword"
          placeholder="搜索消息"
          prefix-icon="el-icon-search"
          size="small"
          style="width: 200px;"
          @input="handleSearch">
        </el-input>
      </div>
      
      <el-tabs v-model="activeHistoryTab" @tab-click="handleHistoryTabChange">
        <el-tab-pane label="全部消息" name="all">
          <el-table :data="filteredHistory" stripe style="width: 100%">
            <el-table-column prop="receiverName" label="接收对象" width="150"></el-table-column>
            <el-table-column prop="subject" label="主题" width="120">
              <template slot-scope="scope">
                {{ getSubjectName(scope.row.subject) }}
              </template>
            </el-table-column>
            <el-table-column prop="content" label="内容" show-overflow-tooltip></el-table-column>
            <el-table-column prop="time" label="发送时间" width="160"></el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template slot-scope="scope">
                <el-tag :type="getStatusType(scope.row.status)" size="small">
                  {{ getStatusName(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120">
              <template slot-scope="scope">
                <el-button type="text" size="small" @click="handleViewHistory(scope.row)">查看</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        
        <el-tab-pane label="已回复" name="replied">
          <el-table :data="repliedHistory" stripe style="width: 100%">
            <el-table-column prop="receiverName" label="接收对象" width="150"></el-table-column>
            <el-table-column prop="subject" label="主题" width="120">
              <template slot-scope="scope">
                {{ getSubjectName(scope.row.subject) }}
              </template>
            </el-table-column>
            <el-table-column prop="content" label="内容" show-overflow-tooltip></el-table-column>
            <el-table-column prop="time" label="发送时间" width="160"></el-table-column>
            <el-table-column label="操作" width="120">
              <template slot-scope="scope">
                <el-button type="text" size="small" @click="handleViewHistory(scope.row)">查看</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        
        <el-tab-pane label="待回复" name="pending">
          <el-table :data="pendingHistory" stripe style="width: 100%">
            <el-table-column prop="receiverName" label="接收对象" width="150"></el-table-column>
            <el-table-column prop="subject" label="主题" width="120">
              <template slot-scope="scope">
                {{ getSubjectName(scope.row.subject) }}
              </template>
            </el-table-column>
            <el-table-column prop="content" label="内容" show-overflow-tooltip></el-table-column>
            <el-table-column prop="time" label="发送时间" width="160"></el-table-column>
            <el-table-column label="操作" width="150">
              <template slot-scope="scope">
                <el-button type="text" size="small" @click="handleViewHistory(scope.row)">查看</el-button>
                <el-button type="text" size="small" @click="handleFollowUp(scope.row)">追问</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 公告详情对话框 -->
    <el-dialog title="公告详情" :visible.sync="announcementDialogVisible" width="600px">
      <div v-if="currentAnnouncement" class="announcement-detail">
        <div class="detail-item">
          <span class="detail-label">公告标题：</span>
          <span>{{ currentAnnouncement.title }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">发布者：</span>
          <span>{{ currentAnnouncement.author }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">发布时间：</span>
          <span>{{ currentAnnouncement.date }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">公告内容：</span>
          <p>{{ currentAnnouncement.content }}</p>
        </div>
        <div class="detail-item" v-if="currentAnnouncement.attachments">
          <span class="detail-label">相关附件：</span>
          <div class="attachment-list">
            <el-link v-for="(file, idx) in currentAnnouncement.attachments" :key="idx" type="primary" @click="handleDownloadAttachment(file)">
              <i class="el-icon-document"></i> {{ file }}
            </el-link>
          </div>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="announcementDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="handleConfirmAnnouncement">确认已读</el-button>
      </span>
    </el-dialog>

    <!-- 消息详情对话框 -->
    <el-dialog title="消息详情" :visible.sync="historyDialogVisible" width="600px">
      <div v-if="currentHistory" class="history-detail">
        <div class="detail-item">
          <span class="detail-label">接收对象：</span>
          <span>{{ currentHistory.receiverName }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">消息主题：</span>
          <span>{{ getSubjectName(currentHistory.subject) }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">紧急程度：</span>
          <el-tag :type="getUrgencyType(currentHistory.urgency)" size="small">
            {{ getUrgencyName(currentHistory.urgency) }}
          </el-tag>
        </div>
        <div class="detail-item">
          <span class="detail-label">发送时间：</span>
          <span>{{ currentHistory.time }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">消息内容：</span>
          <p>{{ currentHistory.content }}</p>
        </div>
        <div class="detail-item" v-if="currentHistory.reply">
          <span class="detail-label">回复内容：</span>
          <p class="reply-content">{{ currentHistory.reply }}</p>
          <span class="reply-time">回复时间：{{ currentHistory.replyTime }}</span>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="historyDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="handleReplyFromHistory" v-if="currentHistory && currentHistory.status === 'pending'">继续咨询</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'ParentCommunication',
  data() {
    return {
      // 班级公告
      announcements: [
        {
          title: '关于春季流感预防的通知',
          author: '班主任 李老师',
          date: '2024-04-22',
          content: '近期流感高发，请家长注意孩子日常防护，勤洗手、戴口罩，如有发热症状请及时就医并告知学校。',
          attachments: ['流感预防指南.pdf'],
          isRead: false
        },
        {
          title: '本周健康体检安排',
          author: '保健老师 张老师',
          date: '2024-04-20',
          content: '本周三将进行全校健康体检，请家长确保孩子体检当天空腹，携带体检表。',
          attachments: [],
          isRead: true
        },
        {
          title: '疫苗接种提醒',
          author: '校医 王医生',
          date: '2024-04-18',
          content: '部分学生疫苗接种即将到期，请家长查看疫苗管理页面，及时安排接种。',
          attachments: ['疫苗接种时间表.pdf'],
          isRead: false
        }
      ],
      announcementDialogVisible: false,
      currentAnnouncement: null,
      // 聊天相关
      selectedTeacher: 'doctor',
      newMessage: '',
      messages: [
        { sender: 'parent', content: '您好，孩子最近有些咳嗽，请问需要注意什么？', time: '2024-04-22 10:30', senderName: '我' },
        { sender: 'teacher', content: '您好，咳嗽可能是春季过敏或感冒引起的。建议多喝水，保持室内通风。如果症状持续超过3天，建议就医检查。', time: '2024-04-22 10:35', senderName: '王医生' },
        { sender: 'parent', content: '好的，谢谢医生。孩子今天体温37.2度，需要请假吗？', time: '2024-04-22 10:40', senderName: '我' },
        { sender: 'teacher', content: '体温37.2度属于正常范围偏高，建议观察。如果体温超过37.5度或有其他不适症状，可以申请请假休息。', time: '2024-04-22 10:45', senderName: '王医生' }
      ],
      // 发送消息表单
      messageForm: {
        receiver: '',
        subject: '',
        urgency: 'normal',
        content: ''
      },
      messageRules: {
        receiver: [{ required: true, message: '请选择接收对象', trigger: 'change' }],
        subject: [{ required: true, message: '请选择消息主题', trigger: 'change' }],
        content: [{ required: true, message: '请输入消息内容', trigger: 'blur' }]
      },
      // 消息历史
      messageHistory: [
        { receiver: 'doctor', receiverName: '校医 王医生', subject: 'health', content: '孩子最近有些咳嗽，请问需要注意什么？', time: '2024-04-22 10:30', status: 'replied', urgency: 'normal', reply: '建议多喝水，保持室内通风。如果症状持续超过3天，建议就医检查。', replyTime: '2024-04-22 10:35' },
        { receiver: 'teacher1', receiverName: '班主任 李老师', subject: 'leave', content: '孩子明天需要请假一天，去医院复查。', time: '2024-04-21 09:00', status: 'replied', urgency: 'normal', reply: '已批准请假，请按时就医，返校时携带医院证明。', replyTime: '2024-04-21 09:15' },
        { receiver: 'health_teacher', receiverName: '保健老师 张老师', subject: 'exam', content: '请问体检报告在哪里查看？', time: '2024-04-20 14:00', status: 'pending', urgency: 'normal' },
        { receiver: 'doctor', receiverName: '校医 王医生', subject: 'vaccine', content: '孩子乙肝疫苗第三针即将到期，请问学校是否可以接种？', time: '2024-04-19 11:00', status: 'replied', urgency: 'normal', reply: '学校医务室可以接种乙肝疫苗，请携带疫苗接种证到医务室登记。', replyTime: '2024-04-19 11:30' }
      ],
      searchKeyword: '',
      activeHistoryTab: 'all',
      historyDialogVisible: false,
      currentHistory: null
    };
  },
  computed: {
    unreadAnnouncements() {
      return this.announcements.filter(a => !a.isRead).length;
    },
    filteredHistory() {
      if (!this.searchKeyword) return this.messageHistory;
      return this.messageHistory.filter(h =>
        h.content.includes(this.searchKeyword) ||
        h.receiverName.includes(this.searchKeyword) ||
        this.getSubjectName(h.subject).includes(this.searchKeyword)
      );
    },
    repliedHistory() {
      return this.filteredHistory.filter(h => h.status === 'replied');
    },
    pendingHistory() {
      return this.filteredHistory.filter(h => h.status === 'pending');
    }
  },
  methods: {
    // 查看公告详情
    handleAnnouncementDetail(item) {
      this.currentAnnouncement = item;
      this.announcementDialogVisible = true;
    },
    // 确认公告已读
    handleConfirmAnnouncement() {
      if (this.currentAnnouncement) {
        this.currentAnnouncement.isRead = true;
        this.$message.success('已确认已读');
        this.announcementDialogVisible = false;
      }
    },
    // 下载附件
    handleDownloadAttachment(file) {
      this.$message.success('正在下载：' + file);
    },
    // 发送聊天消息
    sendMessage() {
      if (!this.newMessage.trim()) return;
      
      const newMsg = {
        sender: 'parent',
        content: this.newMessage,
        time: new Date().toLocaleString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        senderName: '我'
      };
      this.messages.push(newMsg);
      this.newMessage = '';
      
      // 模拟老师回复
      setTimeout(() => {
        const replyMsg = {
          sender: 'teacher',
          content: '收到您的消息，我会尽快回复您。如有紧急情况，请拨打学校医务室电话。',
          time: new Date().toLocaleString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
          senderName: this.getTeacherName(this.selectedTeacher)
        };
        this.messages.push(replyMsg);
        this.scrollToBottom();
      }, 1000);
      
      this.scrollToBottom();
    },
    // 滚动到底部
    scrollToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.chatMessages;
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      });
    },
    // 获取老师名称
    getTeacherName(type) {
      const names = {
        teacher1: '李老师',
        doctor: '王医生',
        health_teacher: '张老师'
      };
      return names[type] || '老师';
    },
    // 提交消息表单
    submitMessageForm() {
      this.$refs.messageForm.validate((valid) => {
        if (valid) {
          const newHistory = {
            receiver: this.messageForm.receiver,
            receiverName: this.getReceiverName(this.messageForm.receiver),
            subject: this.messageForm.subject,
            content: this.messageForm.content,
            time: new Date().toLocaleString('zh-CN'),
            status: 'pending',
            urgency: this.messageForm.urgency
          };
          this.messageHistory.unshift(newHistory);
          this.$message.success('消息发送成功');
          this.resetMessageForm();
        }
      });
    },
    // 重置消息表单
    resetMessageForm() {
      this.$refs.messageForm.resetFields();
    },
    // 获取接收者名称
    getReceiverName(type) {
      const names = {
        teacher1: '班主任 李老师',
        doctor: '校医 王医生',
        health_teacher: '保健老师 张老师'
      };
      return names[type] || '';
    },
    // 获取主题名称
    getSubjectName(type) {
      const names = {
        health: '健康咨询',
        leave: '请假申请',
        vaccine: '疫苗接种',
        exam: '体检相关',
        other: '其他问题'
      };
      return names[type] || '';
    },
    // 获取状态类型
    getStatusType(status) {
      const types = {
        replied: 'success',
        pending: 'warning'
      };
      return types[status] || '';
    },
    // 获取状态名称
    getStatusName(status) {
      const names = {
        replied: '已回复',
        pending: '待回复'
      };
      return names[status] || '';
    },
    // 获取紧急程度类型
    getUrgencyType(urgency) {
      const types = {
        normal: 'info',
        urgent: 'warning',
        very_urgent: 'danger'
      };
      return types[urgency] || '';
    },
    // 获取紧急程度名称
    getUrgencyName(urgency) {
      const names = {
        normal: '普通',
        urgent: '紧急',
        very_urgent: '非常紧急'
      };
      return names[urgency] || '';
    },
    // 搜索消息
    handleSearch() {
      // 搜索逻辑已在computed中实现
    },
    // 切换历史标签
    handleHistoryTabChange(tab) {
      // 标签切换逻辑已在computed中实现
    },
    // 查看历史详情
    handleViewHistory(row) {
      this.currentHistory = row;
      this.historyDialogVisible = true;
    },
    // 追问
    handleFollowUp(row) {
      this.selectedTeacher = row.receiver;
      this.messageForm = {
        receiver: row.receiver,
        subject: row.subject,
        urgency: 'normal',
        content: ''
      };
      this.$message.info('已加载咨询对象，请输入追问内容');
    },
    // 从历史继续咨询
    handleReplyFromHistory() {
      if (this.currentHistory) {
        this.selectedTeacher = this.currentHistory.receiver;
        this.historyDialogVisible = false;
        this.$message.info('请在聊天框中继续咨询');
      }
    }
  }
};
</script>

<style scoped>
.parent-communication {
  padding: 20px;
}

.section-card {
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.section-title i {
  margin-right: 8px;
  color: #409EFF;
}

/* 公告列表样式 */
.announcement-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.announcement-item {
  display: flex;
  align-items: center;
  padding: 15px;
  background: #fafafa;
  border-radius: 8px;
  border-left: 4px solid #409EFF;
}

.announcement-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #ecf5ff;
  color: #409EFF;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
}

.announcement-icon i {
  font-size: 24px;
}

.announcement-content {
  flex: 1;
}

.announcement-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.announcement-info {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 5px;
}

.announcement-author {
  font-size: 13px;
  color: #409EFF;
}

.announcement-date {
  font-size: 12px;
  color: #909399;
}

.announcement-desc {
  font-size: 13px;
  color: #606266;
  line-height: 1.5;
}

/* 聊天容器样式 */
.chat-card {
  min-height: 400px;
}

.chat-container {
  display: flex;
  flex-direction: column;
  height: 350px;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 8px;
  margin-bottom: 15px;
}

.message-item {
  display: flex;
  margin-bottom: 15px;
}

.parent-message {
  flex-direction: row-reverse;
}

.message-avatar {
  margin: 0 10px;
}

.message-content {
  max-width: 70%;
  padding: 10px 15px;
  border-radius: 8px;
  background: #fff;
}

.parent-message .message-content {
  background: #409EFF;
  color: #fff;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
  font-size: 12px;
}

.parent-message .message-header {
  color: rgba(255, 255, 255, 0.8);
}

.message-sender {
  font-weight: bold;
}

.message-time {
  color: #909399;
}

.parent-message .message-time {
  color: rgba(255, 255, 255, 0.8);
}

.message-text {
  font-size: 14px;
  line-height: 1.5;
}

.chat-input {
  display: flex;
  gap: 10px;
}

.message-input {
  flex: 1;
}

/* 详情样式 */
.announcement-detail, .history-detail {
  padding: 10px;
}

.detail-item {
  margin-bottom: 15px;
}

.detail-label {
  font-weight: bold;
  color: #606266;
  display: block;
  margin-bottom: 5px;
}

.detail-item p {
  margin: 5px 0 0 0;
  color: #303133;
  line-height: 1.6;
  background: #f5f7fa;
  padding: 10px;
  border-radius: 4px;
}

.reply-content {
  background: #ecf5ff;
  border-left: 3px solid #409EFF;
}

.reply-time {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.attachment-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.attachment-list .el-link {
  display: flex;
  align-items: center;
  gap: 5px;
}
</style>