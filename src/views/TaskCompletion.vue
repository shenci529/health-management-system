<template>
  <div class="task-completion">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="title">
        <i class="el-icon-data-line"></i>
        任务完成统计
      </h1>
      <p class="subtitle">查看学生打卡任务完成情况，导出统计报表</p>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <div class="stats-card">
        <div class="stats-icon blue">
          <i class="el-icon-document"></i>
        </div>
        <div class="stats-info">
          <div class="stats-value">{{ totalTasks }}</div>
          <div class="stats-label">总任务数</div>
        </div>
      </div>
      <div class="stats-card">
        <div class="stats-icon green">
          <i class="el-icon-check"></i>
        </div>
        <div class="stats-info">
          <div class="stats-value">{{ avgCompletionRate }}%</div>
          <div class="stats-label">平均完成率</div>
        </div>
      </div>
      <div class="stats-card">
        <div class="stats-icon orange">
          <i class="el-icon-user"></i>
        </div>
        <div class="stats-info">
          <div class="stats-value">{{ totalStudents }}</div>
          <div class="stats-label">参与学生</div>
        </div>
      </div>
    </div>

    <!-- 筛选条件 -->
    <div class="filter-section">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-select v-model="filterTask" placeholder="选择任务" clearable style="width: 100%">
            <el-option
              v-for="task in taskList"
              :key="task.id"
              :label="task.taskName"
              :value="task.id">
            </el-option>
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-date-picker
            v-model="filterDateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 100%">
          </el-date-picker>
        </el-col>
        <el-col :span="6">
          <el-select v-model="filterClass" placeholder="选择班级" clearable style="width: 100%">
            <el-option label="一年级1班" value="class1"></el-option>
            <el-option label="一年级2班" value="class2"></el-option>
            <el-option label="一年级3班" value="class3"></el-option>
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-button type="primary" icon="el-icon-search" @click="filterData">查询</el-button>
          <el-button icon="el-icon-refresh" @click="resetFilter">重置</el-button>
        </el-col>
      </el-row>
    </div>

    <!-- 图表区域 -->
    <div class="chart-section">
      <el-row :gutter="20">
        <el-col :span="12">
          <div class="chart-card">
            <div class="chart-header">
              <h3>任务完成率分布</h3>
            </div>
            <div class="chart-content">
              <div class="completion-chart">
                <div class="chart-item">
                  <div class="chart-label">优秀 (90-100%)</div>
                  <div class="chart-bar-wrapper">
                    <div class="chart-bar excellent" :style="{width: excellentRate + '%'}"></div>
                    <span class="chart-value">{{ excellentCount }}人</span>
                  </div>
                </div>
                <div class="chart-item">
                  <div class="chart-label">良好 (70-89%)</div>
                  <div class="chart-bar-wrapper">
                    <div class="chart-bar good" :style="{width: goodRate + '%'}"></div>
                    <span class="chart-value">{{ goodCount }}人</span>
                  </div>
                </div>
                <div class="chart-item">
                  <div class="chart-label">及格 (60-69%)</div>
                  <div class="chart-bar-wrapper">
                    <div class="chart-bar pass" :style="{width: passRate + '%'}"></div>
                    <span class="chart-value">{{ passCount }}人</span>
                  </div>
                </div>
                <div class="chart-item">
                  <div class="chart-label">不及格 (&lt;60%)</div>
                  <div class="chart-bar-wrapper">
                    <div class="chart-bar fail" :style="{width: failRate + '%'}"></div>
                    <span class="chart-value">{{ failCount }}人</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="chart-card">
            <div class="chart-header">
              <h3>任务类型完成率</h3>
            </div>
            <div class="chart-content">
              <div class="type-chart">
                <div v-for="(item, index) in typeCompletionData" :key="index" class="type-item">
                  <div class="type-info">
                    <span class="type-name">{{ item.name }}</span>
                    <span class="type-rate">{{ item.rate }}%</span>
                  </div>
                  <el-progress :percentage="item.rate" :color="item.color" :stroke-width="12"></el-progress>
                </div>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 学生完成情况表格 -->
    <div class="table-section">
      <div class="section-header">
        <h2>
          <i class="el-icon-s-data"></i>
          学生完成情况
        </h2>
        <div class="section-actions">
          <el-radio-group v-model="tableFilter" size="small" style="margin-right: 10px;">
            <el-radio-button label="all">全部</el-radio-button>
            <el-radio-button label="incomplete">未完成</el-radio-button>
          </el-radio-group>
          <el-button type="primary" size="small" icon="el-icon-download" @click="exportReport">导出报表</el-button>
        </div>
      </div>

      <el-table :data="filteredStudentData" style="width: 100%" border v-loading="loading">
        <el-table-column type="index" label="序号" width="60" align="center"></el-table-column>
        <el-table-column prop="studentName" label="学生姓名" width="120">
          <template slot-scope="scope">
            <span class="student-name">{{ scope.row.studentName }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="className" label="班级" width="120"></el-table-column>
        <el-table-column label="任务完成情况" min-width="300">
          <template slot-scope="scope">
            <div class="task-completion-list">
              <div v-for="(task, index) in scope.row.taskCompletions" :key="index" class="task-item">
                <span class="task-name">{{ task.name }}</span>
                <el-tag :type="task.completed ? 'success' : 'danger'" size="mini">
                  {{ task.completed ? '已完成' : '未完成' }}
                </el-tag>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="完成率" width="150" align="center">
          <template slot-scope="scope">
            <div class="completion-rate">
              <el-progress 
                :percentage="scope.row.completionRate" 
                :color="getRateColor(scope.row.completionRate)"
                :stroke-width="8">
              </el-progress>
              <span class="rate-text">{{ scope.row.completionRate }}%</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template slot-scope="scope">
            <el-tag :type="getStatusType(scope.row.completionRate)" effect="dark" size="small">
              {{ getStatusLabel(scope.row.completionRate) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" icon="el-icon-view" @click="viewDetail(scope.row)">详情</el-button>
            <el-button size="mini" type="warning" icon="el-icon-bell" @click="remindStudent(scope.row)">提醒</el-button>
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
          :total="totalStudents">
        </el-pagination>
      </div>
    </div>

    <!-- 学生详情对话框 -->
    <el-dialog title="学生任务详情" :visible.sync="detailDialogVisible" width="700px">
      <div class="student-detail" v-if="currentStudent">
        <div class="student-header">
          <div class="student-avatar">{{ currentStudent.studentName.charAt(0) }}</div>
          <div class="student-info">
            <h3>{{ currentStudent.studentName }}</h3>
            <p>{{ currentStudent.className }}</p>
          </div>
          <div class="student-rate">
            <div class="rate-circle" :style="{background: getRateColor(currentStudent.completionRate)}">
              {{ currentStudent.completionRate }}%
            </div>
          </div>
        </div>
        <div class="task-detail-list">
          <h4>任务完成明细</h4>
          <el-timeline>
            <el-timeline-item
              v-for="(task, index) in currentStudent.taskCompletions"
              :key="index"
              :type="task.completed ? 'success' : 'danger'"
              :icon="task.completed ? 'el-icon-check' : 'el-icon-close'">
              <div class="timeline-content">
                <span class="task-title">{{ task.name }}</span>
                <el-tag :type="task.completed ? 'success' : 'danger'" size="small">
                  {{ task.completed ? '已完成' : '未完成' }}
                </el-tag>
                <span v-if="task.completedTime" class="complete-time">
                  完成时间: {{ formatDateTime(task.completedTime) }}
                </span>
              </div>
            </el-timeline-item>
          </el-timeline>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'TaskCompletion',
  data() {
    return {
      filterTask: '',
      filterDateRange: [],
      filterClass: '',
      tableFilter: 'all',
      currentPage: 1,
      pageSize: 10,
      loading: false,
      detailDialogVisible: false,
      currentStudent: null,
      taskList: [
        { id: 1, taskName: '每日健康打卡' },
        { id: 2, taskName: '周末劳动任务' },
        { id: 3, taskName: '运动打卡' },
        { id: 4, taskName: '阅读打卡' }
      ],
      studentData: [
        {
          id: 1,
          studentName: '张三',
          className: '一年级1班',
          taskCompletions: [
            { name: '每日健康打卡', completed: true, completedTime: '2024-01-15 08:30:00' },
            { name: '周末劳动任务', completed: true, completedTime: '2024-01-14 10:00:00' },
            { name: '运动打卡', completed: true, completedTime: '2024-01-15 16:00:00' },
            { name: '阅读打卡', completed: false }
          ],
          completionRate: 75
        },
        {
          id: 2,
          studentName: '李四',
          className: '一年级1班',
          taskCompletions: [
            { name: '每日健康打卡', completed: true, completedTime: '2024-01-15 08:00:00' },
            { name: '周末劳动任务', completed: true, completedTime: '2024-01-14 09:30:00' },
            { name: '运动打卡', completed: true, completedTime: '2024-01-15 15:30:00' },
            { name: '阅读打卡', completed: true, completedTime: '2024-01-15 20:00:00' }
          ],
          completionRate: 100
        },
        {
          id: 3,
          studentName: '王五',
          className: '一年级1班',
          taskCompletions: [
            { name: '每日健康打卡', completed: false },
            { name: '周末劳动任务', completed: false },
            { name: '运动打卡', completed: true, completedTime: '2024-01-15 17:00:00' },
            { name: '阅读打卡', completed: false }
          ],
          completionRate: 25
        },
        {
          id: 4,
          studentName: '赵六',
          className: '一年级2班',
          taskCompletions: [
            { name: '每日健康打卡', completed: true, completedTime: '2024-01-15 07:30:00' },
            { name: '周末劳动任务', completed: true, completedTime: '2024-01-14 11:00:00' },
            { name: '运动打卡', completed: false },
            { name: '阅读打卡', completed: true, completedTime: '2024-01-15 21:00:00' }
          ],
          completionRate: 75
        },
        {
          id: 5,
          studentName: '钱七',
          className: '一年级2班',
          taskCompletions: [
            { name: '每日健康打卡', completed: true, completedTime: '2024-01-15 08:15:00' },
            { name: '周末劳动任务', completed: false },
            { name: '运动打卡', completed: false },
            { name: '阅读打卡', completed: false }
          ],
          completionRate: 25
        }
      ],
      typeCompletionData: [
        { name: '健康打卡', rate: 85, color: '#67C23A' },
        { name: '劳动打卡', rate: 72, color: '#E6A23C' },
        { name: '运动打卡', rate: 68, color: '#409EFF' },
        { name: '阅读打卡', rate: 90, color: '#909399' }
      ]
    };
  },
  computed: {
    totalTasks() {
      return this.taskList.length;
    },
    avgCompletionRate() {
      if (this.studentData.length === 0) return 0;
      const total = this.studentData.reduce((sum, s) => sum + s.completionRate, 0);
      return Math.round(total / this.studentData.length);
    },
    totalStudents() {
      return this.studentData.length;
    },
    excellentCount() {
      return this.studentData.filter(s => s.completionRate >= 90).length;
    },
    goodCount() {
      return this.studentData.filter(s => s.completionRate >= 70 && s.completionRate < 90).length;
    },
    passCount() {
      return this.studentData.filter(s => s.completionRate >= 60 && s.completionRate < 70).length;
    },
    failCount() {
      return this.studentData.filter(s => s.completionRate < 60).length;
    },
    excellentRate() {
      return this.totalStudents > 0 ? (this.excellentCount / this.totalStudents) * 100 : 0;
    },
    goodRate() {
      return this.totalStudents > 0 ? (this.goodCount / this.totalStudents) * 100 : 0;
    },
    passRate() {
      return this.totalStudents > 0 ? (this.passCount / this.totalStudents) * 100 : 0;
    },
    failRate() {
      return this.totalStudents > 0 ? (this.failCount / this.totalStudents) * 100 : 0;
    },
    filteredStudentData() {
      let data = this.studentData;
      if (this.tableFilter === 'incomplete') {
        data = data.filter(s => s.completionRate < 100);
      }
      if (this.filterClass) {
        data = data.filter(s => s.className.includes(this.filterClass === 'class1' ? '1班' : this.filterClass === 'class2' ? '2班' : '3班'));
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
      this.filterTask = '';
      this.filterDateRange = [];
      this.filterClass = '';
      this.tableFilter = 'all';
    },
    viewDetail(student) {
      this.currentStudent = student;
      this.detailDialogVisible = true;
    },
    remindStudent(student) {
      this.$message.success(`已向 ${student.studentName} 发送任务提醒`);
    },
    exportReport() {
      this.$message.success('统计报表导出成功！');
    },
    handleCurrentChange(val) {
      this.currentPage = val;
    },
    formatDateTime(datetime) {
      if (!datetime) return '';
      const d = new Date(datetime);
      return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    },
    getRateColor(rate) {
      if (rate >= 90) return '#67C23A';
      if (rate >= 70) return '#E6A23C';
      if (rate >= 60) return '#409EFF';
      return '#F56C6C';
    },
    getStatusType(rate) {
      if (rate >= 90) return 'success';
      if (rate >= 70) return 'warning';
      if (rate >= 60) return 'primary';
      return 'danger';
    },
    getStatusLabel(rate) {
      if (rate >= 90) return '优秀';
      if (rate >= 70) return '良好';
      if (rate >= 60) return '及格';
      return '不及格';
    }
  }
};
</script>

<style scoped>
.task-completion {
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

.stats-icon.blue {
  background: linear-gradient(135deg, #409EFF 0%, #6BCBFF 100%);
}

.stats-icon.green {
  background: linear-gradient(135deg, #67C23A 0%, #95D475 100%);
}

.stats-icon.orange {
  background: linear-gradient(135deg, #E6A23C 0%, #F5C878 100%);
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

/* 图表区域 */
.chart-section {
  margin-bottom: 25px;
}

.chart-card {
  background: #fff;
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

.chart-header {
  margin-bottom: 20px;
}

.chart-header h3 {
  font-size: 18px;
  color: #333;
  margin: 0;
}

/* 完成率图表 */
.completion-chart {
  padding: 10px 0;
}

.chart-item {
  margin-bottom: 20px;
}

.chart-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.chart-bar-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}

.chart-bar {
  height: 24px;
  border-radius: 12px;
  transition: width 0.5s ease;
}

.chart-bar.excellent {
  background: linear-gradient(to right, #67C23A, #95D475);
}

.chart-bar.good {
  background: linear-gradient(to right, #E6A23C, #F5C878);
}

.chart-bar.pass {
  background: linear-gradient(to right, #409EFF, #6BCBFF);
}

.chart-bar.fail {
  background: linear-gradient(to right, #F56C6C, #FF8E8E);
}

.chart-value {
  font-size: 14px;
  color: #666;
  min-width: 50px;
}

/* 类型图表 */
.type-chart {
  padding: 10px 0;
}

.type-item {
  margin-bottom: 20px;
}

.type-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.type-name {
  font-size: 14px;
  color: #666;
}

.type-rate {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

/* 表格区域 */
.table-section {
  background: #fff;
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

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

/* 学生名称 */
.student-name {
  font-weight: 500;
  color: #333;
}

/* 任务完成列表 */
.task-completion-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 5px;
  background: #f5f5f5;
  padding: 4px 8px;
  border-radius: 4px;
}

.task-name {
  font-size: 12px;
  color: #666;
}

/* 完成率 */
.completion-rate {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.rate-text {
  font-size: 12px;
  color: #666;
}

/* 分页 */
.pagination-wrapper {
  margin-top: 20px;
  text-align: right;
}

/* 学生详情 */
.student-detail {
  padding: 20px;
}

.student-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.student-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #409EFF 0%, #6BCBFF 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #fff;
  font-weight: bold;
}

.student-info {
  flex: 1;
}

.student-info h3 {
  font-size: 20px;
  color: #333;
  margin: 0 0 5px;
}

.student-info p {
  font-size: 14px;
  color: #888;
  margin: 0;
}

.rate-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #fff;
  font-weight: bold;
}

.task-detail-list h4 {
  font-size: 16px;
  color: #333;
  margin-bottom: 20px;
}

.timeline-content {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.task-title {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.complete-time {
  font-size: 12px;
  color: #888;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .task-completion {
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
}
</style>
