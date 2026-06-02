<template>
  <div class="homework-correct">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="title">
        <i class="el-icon-edit"></i>
        作业批改
      </h1>
      <p class="subtitle">批改学生作业，给予评分和评语</p>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <div class="stats-card">
        <div class="stats-icon orange">
          <i class="el-icon-document"></i>
        </div>
        <div class="stats-info">
          <div class="stats-value">{{ pendingCorrectionCount }}</div>
          <div class="stats-label">待批改</div>
        </div>
      </div>
      <div class="stats-card">
        <div class="stats-icon blue">
          <i class="el-icon-check"></i>
        </div>
        <div class="stats-info">
          <div class="stats-value">{{ correctedCount }}</div>
          <div class="stats-label">已批改</div>
        </div>
      </div>
      <div class="stats-card">
        <div class="stats-icon green">
          <i class="el-icon-star-on"></i>
        </div>
        <div class="stats-info">
          <div class="stats-value">{{ avgScore }}</div>
          <div class="stats-label">平均分</div>
        </div>
      </div>
    </div>

    <!-- 筛选条件 -->
    <div class="filter-section">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-select v-model="filterHomework" placeholder="选择作业" clearable style="width: 100%">
            <el-option
              v-for="homework in homeworkList"
              :key="homework.id"
              :label="homework.title"
              :value="homework.id">
            </el-option>
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-select v-model="filterStatus" placeholder="批改状态" clearable style="width: 100%">
            <el-option label="待批改" value="pending"></el-option>
            <el-option label="已批改" value="corrected"></el-option>
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-input v-model="searchStudent" placeholder="搜索学生姓名" prefix-icon="el-icon-search"></el-input>
        </el-col>
        <el-col :span="6">
          <el-button type="primary" icon="el-icon-search" @click="filterData">查询</el-button>
          <el-button icon="el-icon-refresh" @click="resetFilter">重置</el-button>
        </el-col>
      </el-row>
    </div>

    <!-- 学生提交列表 -->
    <div class="submission-list-section">
      <div class="section-header">
        <h2>
          <i class="el-icon-s-order"></i>
          学生提交列表
        </h2>
        <div class="section-actions">
          <el-button type="primary" size="small" icon="el-icon-download" @click="exportRecords">导出记录</el-button>
        </div>
      </div>

      <el-table :data="filteredSubmissions" style="width: 100%" border v-loading="loading">
        <el-table-column type="index" label="序号" width="60" align="center"></el-table-column>
        <el-table-column prop="studentName" label="学生姓名" width="120">
          <template slot-scope="scope">
            <div class="student-info-cell">
              <div class="student-avatar-small">{{ scope.row.studentName.charAt(0) }}</div>
              <span class="student-name">{{ scope.row.studentName }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="className" label="班级" width="120"></el-table-column>
        <el-table-column prop="homeworkTitle" label="作业名称" min-width="200">
          <template slot-scope="scope">
            <span class="homework-title">{{ scope.row.homeworkTitle }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="submitTime" label="提交时间" width="150">
          <template slot-scope="scope">
            {{ formatDateTime(scope.row.submitTime) }}
          </template>
        </el-table-column>
        <el-table-column label="提交内容" width="120" align="center">
          <template slot-scope="scope">
            <el-button type="text" icon="el-icon-view" @click="viewSubmission(scope.row)">查看</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status === 'corrected' ? 'success' : 'warning'" effect="dark" size="small">
              {{ scope.row.status === 'corrected' ? '已批改' : '待批改' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="score" label="得分" width="100" align="center">
          <template slot-scope="scope">
            <span v-if="scope.row.score" :class="getScoreClass(scope.row.score)">{{ scope.row.score }}分</span>
            <span v-else class="score-pending">-</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template slot-scope="scope">
            <el-button 
              v-if="scope.row.status === 'pending'" 
              type="primary" 
              size="mini" 
              icon="el-icon-edit"
              @click="openCorrectDialog(scope.row)">批改</el-button>
            <el-button 
              v-else 
              type="success" 
              size="mini" 
              icon="el-icon-view"
              @click="viewCorrection(scope.row)">查看</el-button>
            <el-button type="info" size="mini" icon="el-icon-document" @click="viewHistory(scope.row)">记录</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalSubmissions">
        </el-pagination>
      </div>
    </div>

    <!-- 批改对话框 -->
    <el-dialog title="作业批改" :visible.sync="correctDialogVisible" width="700px" class="correct-dialog">
      <div class="correct-content" v-if="currentSubmission">
        <div class="student-header">
          <div class="student-avatar">{{ currentSubmission.studentName.charAt(0) }}</div>
          <div class="student-detail">
            <h3>{{ currentSubmission.studentName }}</h3>
            <p>{{ currentSubmission.className }} | 提交时间: {{ formatDateTime(currentSubmission.submitTime) }}</p>
          </div>
        </div>

        <div class="homework-info">
          <h4>作业信息</h4>
          <p><strong>作业名称:</strong> {{ currentSubmission.homeworkTitle }}</p>
          <p><strong>作业内容:</strong> {{ currentSubmission.homeworkContent }}</p>
        </div>

        <div class="submission-content">
          <h4>学生提交内容</h4>
          <div class="content-box">
            {{ currentSubmission.content || '学生未填写文字内容' }}
          </div>
          <div v-if="currentSubmission.attachments && currentSubmission.attachments.length > 0" class="attachments">
            <p><strong>附件:</strong></p>
            <div class="attachment-list">
              <div v-for="(file, index) in currentSubmission.attachments" :key="index" class="attachment-item">
                <i class="el-icon-document"></i>
                <span>{{ file.name }}</span>
                <el-button type="text" size="small" @click="downloadFile(file)">下载</el-button>
              </div>
            </div>
          </div>
        </div>

        <el-divider></el-divider>

        <div class="correction-form">
          <h4>批改评分</h4>
          <el-form :model="correctionForm" label-width="80px">
            <el-form-item label="评分">
              <el-slider v-model="correctionForm.score" :max="100" show-input></el-slider>
            </el-form-item>
            <el-form-item label="评语">
              <el-input
                type="textarea"
                :rows="4"
                v-model="correctionForm.comment"
                placeholder="请输入评语，给予学生鼓励和建议">
              </el-input>
            </el-form-item>
            <el-form-item label="评语模板">
              <el-select v-model="selectedTemplate" placeholder="选择评语模板" clearable @change="applyTemplate" style="width: 100%">
                <el-option
                  v-for="template in commentTemplates"
                  :key="template.id"
                  :label="template.name"
                  :value="template.content">
                </el-option>
              </el-select>
            </el-form-item>
          </el-form>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="correctDialogVisible = false">取消</el-button>
        <el-button type="primary" icon="el-icon-check" @click="submitCorrection">提交批改</el-button>
      </span>
    </el-dialog>

    <!-- 查看批改对话框 -->
    <el-dialog title="批改详情" :visible.sync="viewDialogVisible" width="600px">
      <div class="correction-detail" v-if="currentSubmission && currentSubmission.correction">
        <div class="detail-item">
          <span class="detail-label">学生姓名:</span>
          <span class="detail-value">{{ currentSubmission.studentName }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">作业名称:</span>
          <span class="detail-value">{{ currentSubmission.homeworkTitle }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">提交时间:</span>
          <span class="detail-value">{{ formatDateTime(currentSubmission.submitTime) }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">得分:</span>
          <span class="detail-value score" :class="getScoreClass(currentSubmission.score)">{{ currentSubmission.score }}分</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">批改时间:</span>
          <span class="detail-value">{{ formatDateTime(currentSubmission.correction.correctTime) }}</span>
        </div>
        <div class="detail-item block">
          <span class="detail-label">评语:</span>
          <div class="detail-value comment-box">{{ currentSubmission.correction.comment }}</div>
        </div>
      </div>
    </el-dialog>

    <!-- 批改记录对话框 -->
    <el-dialog title="批改记录" :visible.sync="historyDialogVisible" width="700px">
      <div class="history-list" v-if="currentStudentHistory.length > 0">
        <el-timeline>
          <el-timeline-item
            v-for="(record, index) in currentStudentHistory"
            :key="index"
            :type="record.type"
            :timestamp="formatDateTime(record.time)">
            <el-card class="history-card">
              <h4>{{ record.homeworkTitle }}</h4>
              <p><strong>得分:</strong> <span :class="getScoreClass(record.score)">{{ record.score }}分</span></p>
              <p><strong>评语:</strong> {{ record.comment }}</p>
            </el-card>
          </el-timeline-item>
        </el-timeline>
      </div>
      <div v-else class="empty-history">
        <i class="el-icon-document"></i>
        <p>暂无批改记录</p>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'HomeworkCorrect',
  data() {
    return {
      filterHomework: '',
      filterStatus: '',
      searchStudent: '',
      currentPage: 1,
      pageSize: 10,
      loading: false,
      correctDialogVisible: false,
      viewDialogVisible: false,
      historyDialogVisible: false,
      currentSubmission: null,
      correctionForm: {
        score: 80,
        comment: ''
      },
      selectedTemplate: '',
      homeworkList: [
        { id: 1, title: '观看健康饮食好习惯课件' },
        { id: 2, title: '保护视力知识问答' },
        { id: 3, title: '周末运动打卡' }
      ],
      commentTemplates: [
        { id: 1, name: '优秀', content: '完成得非常出色！继续保持，你是同学们的好榜样！' },
        { id: 2, name: '良好', content: '完成得很好，希望你能继续保持，争取更大的进步！' },
        { id: 3, name: '及格', content: '基本完成了作业要求，但还有提升空间，加油！' },
        { id: 4, name: '需努力', content: '作业完成度不够，需要更加努力，老师相信你可以做得更好！' }
      ],
      submissions: [
        {
          id: 1,
          studentId: 1,
          studentName: '张三',
          className: '一年级1班',
          homeworkId: 1,
          homeworkTitle: '观看健康饮食好习惯课件',
          homeworkContent: '请认真观看课件，并完成课后练习题',
          submitTime: '2024-01-19 20:30:00',
          content: '我认真观看了课件，学到了很多关于健康饮食的知识。以后我会多吃蔬菜水果，少吃零食。',
          attachments: [{ name: '学习笔记.pdf', url: '#' }],
          status: 'pending',
          score: null,
          correction: null
        },
        {
          id: 2,
          studentId: 2,
          studentName: '李四',
          className: '一年级1班',
          homeworkId: 1,
          homeworkTitle: '观看健康饮食好习惯课件',
          homeworkContent: '请认真观看课件，并完成课后练习题',
          submitTime: '2024-01-19 18:00:00',
          content: '课件内容很丰富，我学到了如何搭配营养餐。',
          attachments: [],
          status: 'corrected',
          score: 95,
          correction: {
            comment: '完成得非常出色！继续保持，你是同学们的好榜样！',
            correctTime: '2024-01-19 21:00:00'
          }
        },
        {
          id: 3,
          studentId: 3,
          studentName: '王五',
          className: '一年级1班',
          homeworkId: 2,
          homeworkTitle: '保护视力知识问答',
          homeworkContent: '完成视力保护相关知识问答，共10道题',
          submitTime: '2024-01-18 19:30:00',
          content: '问答已完成，我答对了8道题。',
          attachments: [{ name: '答题截图.jpg', url: '#' }],
          status: 'pending',
          score: null,
          correction: null
        },
        {
          id: 4,
          studentId: 4,
          studentName: '赵六',
          className: '一年级2班',
          homeworkId: 1,
          homeworkTitle: '观看健康饮食好习惯课件',
          homeworkContent: '请认真观看课件，并完成课后练习题',
          submitTime: '2024-01-19 21:00:00',
          content: '已观看课件，做了笔记。',
          attachments: [],
          status: 'pending',
          score: null,
          correction: null
        }
      ],
      currentStudentHistory: []
    };
  },
  computed: {
    pendingCorrectionCount() {
      return this.submissions.filter(s => s.status === 'pending').length;
    },
    correctedCount() {
      return this.submissions.filter(s => s.status === 'corrected').length;
    },
    avgScore() {
      const corrected = this.submissions.filter(s => s.score !== null);
      if (corrected.length === 0) return 0;
      const total = corrected.reduce((sum, s) => sum + s.score, 0);
      return Math.round(total / corrected.length);
    },
    totalSubmissions() {
      return this.filteredSubmissions.length;
    },
    filteredSubmissions() {
      let data = this.submissions;
      if (this.filterHomework) {
        data = data.filter(s => s.homeworkId === this.filterHomework);
      }
      if (this.filterStatus) {
        data = data.filter(s => s.status === this.filterStatus);
      }
      if (this.searchStudent) {
        data = data.filter(s => s.studentName.includes(this.searchStudent));
      }
      return data;
    }
  },
  methods: {
    filterData() {
      this.loading = true;
      setTimeout(() => {
        this.loading = false;
        this.$message.success('数据已更新');
      }, 500);
    },
    resetFilter() {
      this.filterHomework = '';
      this.filterStatus = '';
      this.searchStudent = '';
    },
    viewSubmission(submission) {
      this.$message.info(`查看 ${submission.studentName} 的提交内容`);
    },
    openCorrectDialog(submission) {
      this.currentSubmission = submission;
      this.correctionForm = {
        score: 80,
        comment: ''
      };
      this.selectedTemplate = '';
      this.correctDialogVisible = true;
    },
    applyTemplate(content) {
      if (content) {
        this.correctionForm.comment = content;
      }
    },
    submitCorrection() {
      if (!this.correctionForm.comment) {
        this.$message.warning('请输入评语');
        return;
      }
      this.currentSubmission.status = 'corrected';
      this.currentSubmission.score = this.correctionForm.score;
      this.currentSubmission.correction = {
        comment: this.correctionForm.comment,
        correctTime: new Date().toISOString()
      };
      this.$message.success('批改成功！');
      this.correctDialogVisible = false;
    },
    viewCorrection(submission) {
      this.currentSubmission = submission;
      this.viewDialogVisible = true;
    },
    viewHistory(submission) {
      // 模拟获取该学生的历史批改记录
      this.currentStudentHistory = [
        {
          homeworkTitle: '观看健康饮食好习惯课件',
          score: 95,
          comment: '完成得非常出色！继续保持，你是同学们的好榜样！',
          time: '2024-01-19 21:00:00',
          type: 'success'
        },
        {
          homeworkTitle: '保护视力知识问答',
          score: 88,
          comment: '完成得很好，希望你能继续保持，争取更大的进步！',
          time: '2024-01-15 20:30:00',
          type: 'primary'
        }
      ];
      this.historyDialogVisible = true;
    },
    exportRecords() {
      this.$message.success('批改记录导出成功！');
    },
    downloadFile(file) {
      this.$message.success(`正在下载: ${file.name}`);
    },
    handleCurrentChange(val) {
      this.currentPage = val;
    },
    formatDateTime(datetime) {
      if (!datetime) return '';
      const d = new Date(datetime);
      return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    },
    getScoreClass(score) {
      if (score >= 90) return 'score-excellent';
      if (score >= 80) return 'score-good';
      if (score >= 60) return 'score-pass';
      return 'score-fail';
    }
  }
};
</script>

<style scoped>
.homework-correct {
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
  color: #409EFF;
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

.stats-icon.orange {
  background: linear-gradient(135deg, #E6A23C 0%, #F5C878 100%);
}

.stats-icon.blue {
  background: linear-gradient(135deg, #409EFF 0%, #6BCBFF 100%);
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

/* 筛选区域 */
.filter-section {
  background: #fff;
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 25px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
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
  color: #409EFF;
}

.section-actions {
  display: flex;
  align-items: center;
}

/* 提交列表区域 */
.submission-list-section {
  background: #fff;
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

/* 学生信息单元格 */
.student-info-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.student-avatar-small {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #409EFF 0%, #6BCBFF 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #fff;
  font-weight: bold;
}

.student-name {
  font-weight: 500;
  color: #333;
}

/* 作业标题 */
.homework-title {
  font-weight: 500;
  color: #333;
}

/* 分数样式 */
.score-excellent {
  color: #67C23A;
  font-weight: bold;
  font-size: 16px;
}

.score-good {
  color: #409EFF;
  font-weight: bold;
  font-size: 16px;
}

.score-pass {
  color: #E6A23C;
  font-weight: bold;
  font-size: 16px;
}

.score-fail {
  color: #F56C6C;
  font-weight: bold;
  font-size: 16px;
}

.score-pending {
  color: #909399;
}

/* 分页 */
.pagination-wrapper {
  margin-top: 20px;
  text-align: right;
}

/* 批改对话框 */
.correct-content {
  max-height: 500px;
  overflow-y: auto;
}

.student-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.student-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #409EFF 0%, #6BCBFF 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #fff;
  font-weight: bold;
}

.student-detail h3 {
  font-size: 18px;
  color: #333;
  margin: 0 0 5px;
}

.student-detail p {
  font-size: 13px;
  color: #888;
  margin: 0;
}

.homework-info,
.submission-content,
.correction-form {
  margin-bottom: 20px;
}

.homework-info h4,
.submission-content h4,
.correction-form h4 {
  font-size: 16px;
  color: #333;
  margin-bottom: 10px;
}

.content-box {
  background: #f5f5f5;
  padding: 15px;
  border-radius: 8px;
  line-height: 1.6;
  color: #555;
}

.attachments {
  margin-top: 15px;
}

.attachment-list {
  margin-top: 10px;
}

.attachment-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  background: #f9f9f9;
  border-radius: 4px;
  margin-bottom: 8px;
}

.attachment-item i {
  color: #409EFF;
}

/* 批改详情 */
.correction-detail {
  padding: 20px;
}

.detail-item {
  display: flex;
  margin-bottom: 15px;
}

.detail-item.block {
  flex-direction: column;
}

.detail-label {
  width: 100px;
  color: #666;
  font-weight: 500;
}

.detail-value {
  flex: 1;
  color: #333;
}

.detail-value.score {
  font-size: 18px;
}

.comment-box {
  background: #f5f5f5;
  padding: 15px;
  border-radius: 8px;
  margin-top: 10px;
  line-height: 1.6;
}

/* 历史记录 */
.history-list {
  padding: 20px;
}

.history-card {
  margin-bottom: 10px;
}

.history-card h4 {
  font-size: 16px;
  color: #333;
  margin: 0 0 10px;
}

.history-card p {
  margin: 5px 0;
  color: #666;
}

.empty-history {
  text-align: center;
  padding: 50px;
  color: #999;
}

.empty-history i {
  font-size: 48px;
  margin-bottom: 15px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .homework-correct {
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

  .student-header {
    flex-direction: column;
    text-align: center;
  }

  .detail-item {
    flex-direction: column;
  }

  .detail-label {
    width: auto;
    margin-bottom: 5px;
  }
}
</style>
