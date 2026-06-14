<template>
  <div class="health-homework">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="title">
        <i class="el-icon-notebook-2"></i>
        健康作业管理
      </h1>
      <p class="subtitle">布置健康班会课件作业，跟踪学生完成情况</p>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <div class="stats-card">
        <div class="stats-icon blue">
          <i class="el-icon-document"></i>
        </div>
        <div class="stats-info">
          <div class="stats-value">{{ totalHomework }}</div>
          <div class="stats-label">作业总数</div>
        </div>
      </div>
      <div class="stats-card">
        <div class="stats-icon orange">
          <i class="el-icon-time"></i>
        </div>
        <div class="stats-info">
          <div class="stats-value">{{ pendingHomework }}</div>
          <div class="stats-label">待提交</div>
        </div>
      </div>
      <div class="stats-card">
        <div class="stats-icon green">
          <i class="el-icon-check"></i>
        </div>
        <div class="stats-info">
          <div class="stats-value">{{ submittedHomework }}</div>
          <div class="stats-label">已提交</div>
        </div>
      </div>
    </div>

    <!-- 布置作业 -->
    <div class="assign-section">
      <div class="section-header">
        <h2>
          <i class="el-icon-plus"></i>
          布置新作业
        </h2>
      </div>

      <el-form :model="homeworkForm" :rules="rules" ref="homeworkForm" label-width="100px" class="homework-form">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="作业标题" prop="title">
              <el-input v-model="homeworkForm.title" placeholder="请输入作业标题"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="作业类型" prop="type">
              <el-select v-model="homeworkForm.type" placeholder="请选择作业类型" style="width: 100%">
                <el-option label="健康班会课件" value="courseware">
                  <i class="el-icon-video-play" style="color: #409EFF; margin-right: 5px;"></i>健康班会课件
                </el-option>
                <el-option label="健康知识问答" value="quiz">
                  <i class="el-icon-question" style="color: #67C23A; margin-right: 5px;"></i>健康知识问答
                </el-option>
                <el-option label="健康实践活动" value="practice">
                  <i class="el-icon-sunny" style="color: #E6A23C; margin-right: 5px;"></i>健康实践活动
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="选择课件" prop="coursewareId" v-if="homeworkForm.type === 'courseware'">
              <el-select v-model="homeworkForm.coursewareId" placeholder="请选择班会课件" style="width: 100%">
                <el-option
                  v-for="item in coursewareList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id">
                  <span style="float: left">{{ item.name }}</span>
                  <span style="float: right; color: #8492a6; font-size: 13px">{{ item.duration }}分钟</span>
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="截止日期" prop="deadline">
              <el-date-picker
                v-model="homeworkForm.deadline"
                type="datetime"
                placeholder="选择截止日期"
                style="width: 100%">
              </el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="作业内容" prop="content">
          <el-input
            type="textarea"
            :rows="4"
            v-model="homeworkForm.content"
            placeholder="请描述作业要求和内容">
          </el-input>
        </el-form-item>

        <el-form-item label="附件">
          <el-upload
            action="#"
            :auto-upload="false"
            :on-change="handleFileChange"
            :file-list="fileList">
            <el-button type="primary" icon="el-icon-upload">选择文件</el-button>
            <div slot="tip" class="el-upload__tip">支持上传课件、文档等附件</div>
          </el-upload>
        </el-form-item>

        <el-form-item label="提醒设置">
          <el-checkbox-group v-model="homeworkForm.reminders">
            <el-checkbox label="beforeDeadline">截止前提醒</el-checkbox>
            <el-checkbox label="overdue">逾期提醒</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" icon="el-icon-plus" @click="submitHomework">布置作业</el-button>
          <el-button icon="el-icon-refresh" @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 作业列表 -->
    <div class="homework-list-section">
      <div class="section-header">
        <h2>
          <i class="el-icon-document-copy"></i>
          作业列表
        </h2>
        <div class="section-actions">
          <el-radio-group v-model="homeworkFilter" size="small">
            <el-radio-button label="all">全部</el-radio-button>
            <el-radio-button label="ongoing">进行中</el-radio-button>
            <el-radio-button label="ended">已截止</el-radio-button>
          </el-radio-group>
        </div>
      </div>

      <div class="homework-grid">
        <div v-for="homework in filteredHomework" :key="homework.id" class="homework-card">
          <div class="homework-header">
            <el-tag :type="getTypeTag(homework.type)" size="small">{{ getTypeText(homework.type) }}</el-tag>
            <el-tag :type="getStatusTag(homework.status)" effect="dark" size="small">{{ getStatusText(homework.status) }}</el-tag>
          </div>
          <div class="homework-body">
            <h3 class="homework-title">{{ homework.title }}</h3>
            <p class="homework-content">{{ homework.content }}</p>
            <div class="homework-meta">
              <span><i class="el-icon-time"></i>截止: {{ formatDateTime(homework.deadline) }}</span>
              <span v-if="homework.coursewareName"><i class="el-icon-video-play"></i>{{ homework.coursewareName }}</span>
            </div>
            <div class="homework-stats">
              <div class="stat-item">
                <span class="stat-label">已提交</span>
                <span class="stat-value submitted">{{ homework.submittedCount }}/{{ homework.totalStudents }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">待批改</span>
                <span class="stat-value pending">{{ homework.pendingCorrection }}</span>
              </div>
            </div>
            <el-progress 
              :percentage="getSubmitRate(homework)" 
              :color="getProgressColor(homework.status)"
              :stroke-width="8">
            </el-progress>
          </div>
          <div class="homework-footer">
            <el-button type="primary" size="small" icon="el-icon-view" @click="viewSubmissions(homework)">查看提交</el-button>
            <el-button type="warning" size="small" icon="el-icon-bell" @click="remindStudents(homework)">提醒学生</el-button>
            <el-button type="danger" size="small" icon="el-icon-delete" @click="deleteHomework(homework)">删除</el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 查看提交对话框 -->
    <el-dialog title="作业提交情况" :visible.sync="submissionsDialogVisible" width="800px">
      <div class="submissions-header">
        <h3>{{ currentHomework.title }}</h3>
        <div class="submissions-stats">
          <span>已提交: {{ currentHomework.submittedCount || 0 }}人</span>
          <span>未提交: {{ (currentHomework.totalStudents || 0) - (currentHomework.submittedCount || 0) }}人</span>
          <span>待批改: {{ currentHomework.pendingCorrection || 0 }}人</span>
        </div>
      </div>
      <el-table :data="submissionsList" style="width: 100%" border>
        <el-table-column prop="studentName" label="学生姓名" width="120"></el-table-column>
        <el-table-column prop="submitTime" label="提交时间" width="150">
          <template slot-scope="scope">
            {{ scope.row.submitTime ? formatDateTime(scope.row.submitTime) : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="getSubmissionStatusTag(scope.row.status)" size="small">
              {{ getSubmissionStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="score" label="得分" width="100">
          <template slot-scope="scope">
            <span :class="{ 'score-pending': !scope.row.score }">
              {{ scope.row.score || '未批改' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template slot-scope="scope">
            <el-button 
              v-if="scope.row.status === 'submitted'" 
              type="primary" 
              size="mini" 
              icon="el-icon-edit"
              @click="correctHomework(scope.row)">批改</el-button>
            <el-button 
              v-else-if="scope.row.status === 'corrected'" 
              type="success" 
              size="mini" 
              icon="el-icon-view"
              @click="viewCorrection(scope.row)">查看</el-button>
            <el-button 
              v-if="scope.row.status === 'unsubmitted'" 
              type="warning" 
              size="mini" 
              icon="el-icon-bell"
              @click="remindSingleStudent(scope.row)">提醒</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
import { NotificationStore } from '@/permission';

export default {
  name: 'HealthHomework',
  data() {
    return {
      homeworkForm: {
        title: '',
        type: 'courseware',
        coursewareId: '',
        deadline: '',
        content: '',
        reminders: ['beforeDeadline']
      },
      rules: {
        title: [{ required: true, message: '请输入作业标题', trigger: 'blur' }],
        type: [{ required: true, message: '请选择作业类型', trigger: 'change' }],
        coursewareId: [{ required: true, message: '请选择课件', trigger: 'change' }],
        deadline: [{ required: true, message: '请选择截止日期', trigger: 'change' }],
        content: [{ required: true, message: '请填写作业内容', trigger: 'blur' }]
      },
      coursewareList: [
        { id: 1, name: '健康饮食好习惯', duration: 15 },
        { id: 2, name: '保护视力从我做起', duration: 12 },
        { id: 3, name: '运动让身体更健康', duration: 18 },
        { id: 4, name: '良好卫生习惯养成', duration: 10 }
      ],
      fileList: [],
      homeworkList: [
        {
          id: 1,
          title: '观看健康饮食好习惯课件',
          type: 'courseware',
          coursewareName: '健康饮食好习惯',
          content: '请认真观看课件，并完成课后练习题',
          deadline: '2024-01-20 23:59:59',
          status: 'ongoing',
          submittedCount: 28,
          totalStudents: 35,
          pendingCorrection: 5
        },
        {
          id: 2,
          title: '保护视力知识问答',
          type: 'quiz',
          content: '完成视力保护相关知识问答，共10道题',
          deadline: '2024-01-15 23:59:59',
          status: 'ended',
          submittedCount: 33,
          totalStudents: 35,
          pendingCorrection: 0
        },
        {
          id: 3,
          title: '周末运动打卡',
          type: 'practice',
          content: '完成至少30分钟户外运动，并拍照记录',
          deadline: '2024-01-18 23:59:59',
          status: 'ongoing',
          submittedCount: 20,
          totalStudents: 35,
          pendingCorrection: 8
        }
      ],
      homeworkFilter: 'all',
      submissionsDialogVisible: false,
      currentHomework: {},
      submissionsList: [
        { id: 1, studentId: 1, studentName: '张三', submitTime: '2024-01-19 20:30:00', status: 'submitted', score: null },
        { id: 2, studentId: 2, studentName: '李四', submitTime: '2024-01-19 18:00:00', status: 'corrected', score: 95 },
        { id: 3, studentId: 3, studentName: '王五', submitTime: null, status: 'unsubmitted', score: null },
        { id: 4, studentId: 4, studentName: '赵六', submitTime: '2024-01-19 21:00:00', status: 'submitted', score: null }
      ]
    };
  },
  computed: {
    totalHomework() {
      return this.homeworkList.length;
    },
    pendingHomework() {
      return this.homeworkList.filter(h => h.status === 'ongoing').length;
    },
    submittedHomework() {
      return this.homeworkList.filter(h => h.status === 'ended').length;
    },
    filteredHomework() {
      if (this.homeworkFilter === 'all') {
        return this.homeworkList;
      }
      return this.homeworkList.filter(h => h.status === this.homeworkFilter);
    }
  },
  methods: {
    getCurrentUser() {
      try {
        const raw = localStorage.getItem('userInfo');
        return raw ? JSON.parse(raw) : null;
      } catch { return null; }
    },
    submitHomework() {
      this.$refs.homeworkForm.validate(valid => {
        if (valid) {
          const courseware = this.coursewareList.find(c => c.id === this.homeworkForm.coursewareId);
          const newHomework = {
            id: Date.now(),
            title: this.homeworkForm.title,
            type: this.homeworkForm.type,
            coursewareName: courseware ? courseware.name : '',
            content: this.homeworkForm.content,
            deadline: this.homeworkForm.deadline.toISOString(),
            status: 'ongoing',
            submittedCount: 0,
            totalStudents: 35,
            pendingCorrection: 0
          };
          this.homeworkList.unshift(newHomework);

          // 通知学生和家长：新的健康作业
          const userInfo = this.getCurrentUser();
          const typeMap = { courseware: '健康班会课件', quiz: '健康知识问答', practice: '健康实践活动' };
          NotificationStore.send({
            type: 'homework_assigned',
            title: '📚 新的健康作业',
            content: `教师 ${userInfo ? userInfo.username : '老师'} 布置了新的${typeMap[this.homeworkForm.type] || '健康作业'}："${this.homeworkForm.title}"，请及时完成。`,
            fromRole: 'teacher',
            fromUser: userInfo ? userInfo.username : '老师',
            toRoles: ['student', 'parent'],
            link: '/health-homework'
          });

          this.$message.success('作业布置成功！');
          this.resetForm();
        }
      });
    },
    resetForm() {
      this.$refs.homeworkForm.resetFields();
      this.homeworkForm.reminders = ['beforeDeadline'];
      this.fileList = [];
    },
    handleFileChange(file, fileList) {
      this.fileList = fileList;
    },
    viewSubmissions(homework) {
      this.currentHomework = homework;
      this.submissionsDialogVisible = true;
    },
    remindStudents(homework) {
      this.$message.success(`已向未提交学生发送提醒: ${homework.title}`);
    },
    remindSingleStudent(submission) {
      this.$message.success(`已向 ${submission.studentName} 发送作业提醒`);
    },
    correctHomework(submission) {
      this.$message.info(`开始批改 ${submission.studentName} 的作业`);
    },
    viewCorrection(submission) {
      this.$message.info(`查看 ${submission.studentName} 的批改结果`);
    },
    deleteHomework(homework) {
      this.$confirm('确定删除该作业吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const index = this.homeworkList.findIndex(h => h.id === homework.id);
        if (index > -1) {
          this.homeworkList.splice(index, 1);
          this.$message.success('删除成功！');
        }
      });
    },
    formatDateTime(datetime) {
      if (!datetime) return '';
      const d = new Date(datetime);
      return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    },
    getTypeTag(type) {
      const typeMap = {
        courseware: 'primary',
        quiz: 'success',
        practice: 'warning'
      };
      return typeMap[type] || 'info';
    },
    getTypeText(type) {
      const typeMap = {
        courseware: '班会课件',
        quiz: '知识问答',
        practice: '实践活动'
      };
      return typeMap[type] || type;
    },
    getStatusTag(status) {
      const statusMap = {
        ongoing: 'primary',
        ended: 'info'
      };
      return statusMap[status] || 'info';
    },
    getStatusText(status) {
      const statusMap = {
        ongoing: '进行中',
        ended: '已截止'
      };
      return statusMap[status] || status;
    },
    getSubmitRate(homework) {
      if (!homework.totalStudents) return 0;
      return Math.round((homework.submittedCount / homework.totalStudents) * 100);
    },
    getProgressColor(status) {
      return status === 'ongoing' ? '#409EFF' : '#909399';
    },
    getSubmissionStatusTag(status) {
      const statusMap = {
        submitted: 'primary',
        corrected: 'success',
        unsubmitted: 'danger'
      };
      return statusMap[status] || 'info';
    },
    getSubmissionStatusText(status) {
      const statusMap = {
        submitted: '已提交',
        corrected: '已批改',
        unsubmitted: '未提交'
      };
      return statusMap[status] || status;
    }
  }
};
</script>

<style scoped>
.health-homework {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

/* 页面标题 */
.page-header {
  text-align: center;
  margin-bottom: 25px;
}

.title {
  font-size: 28px;
  color: #E6A23C;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.title i {
  font-size: 32px;
}

.subtitle {
  color: #888;
  font-size: 16px;
  margin-top: 8px;
}

/* 统计卡片 */
.stats-cards {
  display: flex;
  gap: 20px;
  margin-bottom: 25px;
}

.stats-card {
  flex: 1;
  background: #fff;
  border-radius: 15px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.stats-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: #fff;
}

.stats-icon.blue {
  background: linear-gradient(135deg, #409EFF 0%, #6BCBFF 100%);
}

.stats-icon.orange {
  background: linear-gradient(135deg, #E6A23C 0%, #F5C878 100%);
}

.stats-icon.green {
  background: linear-gradient(135deg, #67C23A 0%, #95D475 100%);
}

.stats-value {
  font-size: 28px;
  font-weight: bold;
  color: #333;
}

.stats-label {
  font-size: 14px;
  color: #888;
}

/* 区块标题 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 {
  font-size: 20px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-header h2 i {
  color: #E6A23C;
}

.section-actions {
  display: flex;
  align-items: center;
}

/* 区块样式 */
.assign-section,
.homework-list-section {
  background: #fff;
  border-radius: 15px;
  padding: 25px;
  margin-bottom: 25px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

.homework-form {
  margin-top: 20px;
}

/* 作业网格 */
.homework-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.homework-card {
  background: #f9f9f9;
  border-radius: 12px;
  padding: 20px;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.homework-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.homework-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
}

.homework-body {
  margin-bottom: 15px;
}

.homework-title {
  font-size: 18px;
  color: #333;
  margin: 0 0 10px;
}

.homework-content {
  font-size: 14px;
  color: #666;
  margin: 0 0 15px;
  line-height: 1.5;
}

.homework-meta {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: 15px;
  font-size: 13px;
  color: #888;
}

.homework-meta i {
  margin-right: 5px;
  color: #409EFF;
}

.homework-stats {
  display: flex;
  gap: 30px;
  margin-bottom: 15px;
}

.stat-item {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 12px;
  color: #888;
}

.stat-value {
  font-size: 16px;
  font-weight: bold;
}

.stat-value.submitted {
  color: #67C23A;
}

.stat-value.pending {
  color: #E6A23C;
}

.homework-footer {
  display: flex;
  gap: 10px;
}

/* 提交情况头部 */
.submissions-header {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.submissions-header h3 {
  font-size: 18px;
  color: #333;
  margin: 0 0 10px;
}

.submissions-stats {
  display: flex;
  gap: 30px;
  font-size: 14px;
  color: #666;
}

.score-pending {
  color: #E6A23C;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .health-homework {
    padding: 15px;
  }

  .title {
    font-size: 22px;
  }

  .stats-cards {
    flex-direction: column;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .homework-grid {
    grid-template-columns: 1fr;
  }

  .homework-footer {
    flex-wrap: wrap;
  }

  .submissions-stats {
    flex-direction: column;
    gap: 10px;
  }
}
</style>
