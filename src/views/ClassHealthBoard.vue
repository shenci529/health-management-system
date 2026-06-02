<template>
  <div class="class-health-board">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>班级健康看板</h2>
      <div class="header-actions">
        <el-date-picker
          v-model="selectedDate"
          type="date"
          placeholder="选择日期"
          format="yyyy-MM-dd"
          value-format="yyyy-MM-dd"
          @change="handleDateChange"
        />
        <el-button type="primary" icon="el-icon-download" @click="exportReport">导出统计报表</el-button>
      </div>
    </div>

    <!-- 班级选择 -->
    <div class="filter-section">
      <el-select v-model="selectedClass" placeholder="选择班级" @change="handleClassChange">
        <el-option v-for="item in classList" :key="item.id" :label="item.name" :value="item.id" />
      </el-select>
    </div>

    <!-- 统计卡片 -->
    <div class="stat-cards">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="stat-card total">
            <div class="stat-icon">
              <i class="el-icon-s-custom"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.totalStudents }}</div>
              <div class="stat-label">班级总人数</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card checked">
            <div class="stat-icon">
              <i class="el-icon-circle-check"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.checkedCount }}</div>
              <div class="stat-label">已打卡人数</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card fever">
            <div class="stat-icon">
              <i class="el-icon-warning-outline"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.feverCount }}</div>
              <div class="stat-label">发热人数</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card absent">
            <div class="stat-icon">
              <i class="el-icon-close"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.absentCount }}</div>
              <div class="stat-label">缺勤人数</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 快捷筛选按钮 -->
    <div class="quick-filter">
      <el-button-group>
        <el-button :type="activeFilter === 'all' ? 'primary' : 'default'" @click="filterStudents('all')">
          全部学生
        </el-button>
        <el-button :type="activeFilter === 'fever' ? 'danger' : 'default'" @click="filterStudents('fever')">
          发热学生 ({{ statistics.feverCount }})
        </el-button>
        <el-button :type="activeFilter === 'absent' ? 'warning' : 'default'" @click="filterStudents('absent')">
          缺勤学生 ({{ statistics.absentCount }})
        </el-button>
        <el-button :type="activeFilter === 'unwell' ? 'info' : 'default'" @click="filterStudents('unwell')">
          身体不适 ({{ statistics.unwellCount }})
        </el-button>
      </el-button-group>
    </div>

    <!-- 图表区域 -->
    <div class="charts-section">
      <el-row :gutter="20">
        <el-col :span="12">
          <div class="chart-card">
            <div class="chart-title">晨检状态分布（饼图）</div>
            <div class="pie-chart-container">
              <div class="css-pie-chart">
                <div class="pie-segment segment-normal" :style="{ '--value': pieData.normal }"></div>
                <div class="pie-segment segment-fever" :style="{ '--value': pieData.fever }"></div>
                <div class="pie-segment segment-absent" :style="{ '--value': pieData.absent }"></div>
                <div class="pie-segment segment-unwell" :style="{ '--value': pieData.unwell }"></div>
              </div>
              <div class="pie-legend">
                <div class="legend-item">
                  <span class="legend-color normal"></span>
                  <span>正常 ({{ pieData.normal }}%)</span>
                </div>
                <div class="legend-item">
                  <span class="legend-color fever"></span>
                  <span>发热 ({{ pieData.fever }}%)</span>
                </div>
                <div class="legend-item">
                  <span class="legend-color absent"></span>
                  <span>缺勤 ({{ pieData.absent }}%)</span>
                </div>
                <div class="legend-item">
                  <span class="legend-color unwell"></span>
                  <span>不适 ({{ pieData.unwell }}%)</span>
                </div>
              </div>
            </div>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="chart-card">
            <div class="chart-title">本周出勤趋势（柱状图）</div>
            <div class="bar-chart-container">
              <div class="css-bar-chart">
                <div v-for="(item, index) in barData" :key="index" class="bar-item">
                  <div class="bar-wrapper">
                    <div class="bar" :style="{ height: item.value + '%' }">
                      <span class="bar-value">{{ item.value }}</span>
                    </div>
                  </div>
                  <div class="bar-label">{{ item.day }}</div>
                </div>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 学生打卡列表 -->
    <div class="table-section">
      <div class="table-header">
        <h3>学生晨检打卡记录</h3>
        <el-input
          v-model="searchKeyword"
          placeholder="搜索学生姓名"
          prefix-icon="el-icon-search"
          clearable
          style="width: 200px;"
        />
      </div>
      <el-table :data="filteredStudentList" border stripe style="width: 100%">
        <el-table-column prop="studentName" label="学生姓名" width="120" />
        <el-table-column prop="studentNo" label="学号" width="120" />
        <el-table-column prop="checkTime" label="打卡时间" width="160" />
        <el-table-column prop="temperature" label="体温(℃)" width="100">
          <template slot-scope="scope">
            <span :class="{ 'temp-abnormal': scope.row.temperature >= 37.3 }">
              {{ scope.row.temperature }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="getStatusType(scope.row.status)" size="small">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="symptoms" label="症状描述" min-width="150" />
        <el-table-column prop="remark" label="备注" min-width="120" />
        <el-table-column label="操作" width="100" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="viewDetail(scope.row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination-wrapper">
        <el-pagination
          background
          layout="total, prev, pager, next"
          :total="totalStudents"
          :page-size="pageSize"
          :current-page="currentPage"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <!-- 详情弹窗 -->
    <el-dialog title="学生晨检详情" :visible.sync="detailDialogVisible" width="500px">
      <el-descriptions :column="1" border v-if="currentStudent">
        <el-descriptions-item label="学生姓名">{{ currentStudent.studentName }}</el-descriptions-item>
        <el-descriptions-item label="学号">{{ currentStudent.studentNo }}</el-descriptions-item>
        <el-descriptions-item label="打卡时间">{{ currentStudent.checkTime }}</el-descriptions-item>
        <el-descriptions-item label="体温">{{ currentStudent.temperature }}℃</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(currentStudent.status)" size="small">
            {{ getStatusText(currentStudent.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="症状描述">{{ currentStudent.symptoms || '无' }}</el-descriptions-item>
        <el-descriptions-item label="备注">{{ currentStudent.remark || '无' }}</el-descriptions-item>
      </el-descriptions>
      <span slot="footer">
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'ClassHealthBoard',
  data() {
    return {
      selectedDate: new Date().toISOString().split('T')[0],
      selectedClass: '',
      activeFilter: 'all',
      searchKeyword: '',
      currentPage: 1,
      pageSize: 10,
      totalStudents: 0,
      detailDialogVisible: false,
      currentStudent: null,
      classList: [
        { id: '1', name: '一年级1班' },
        { id: '2', name: '一年级2班' },
        { id: '3', name: '二年级1班' },
        { id: '4', name: '二年级2班' },
        { id: '5', name: '三年级1班' }
      ],
      statistics: {
        totalStudents: 45,
        checkedCount: 42,
        feverCount: 2,
        absentCount: 3,
        unwellCount: 5
      },
      pieData: {
        normal: 75,
        fever: 5,
        absent: 7,
        unwell: 13
      },
      barData: [
        { day: '周一', value: 95 },
        { day: '周二', value: 92 },
        { day: '周三', value: 88 },
        { day: '周四', value: 96 },
        { day: '周五', value: 93 }
      ],
      studentList: [
        { id: 1, studentName: '张小明', studentNo: '2024001', checkTime: '2024-06-01 07:45', temperature: 36.5, status: 'normal', symptoms: '', remark: '' },
        { id: 2, studentName: '李小红', studentNo: '2024002', checkTime: '2024-06-01 07:50', temperature: 37.8, status: 'fever', symptoms: '咳嗽、流涕', remark: '已通知家长接回' },
        { id: 3, studentName: '王小华', studentNo: '2024003', checkTime: '-', temperature: '-', status: 'absent', symptoms: '-', remark: '请假' },
        { id: 4, studentName: '赵小刚', studentNo: '2024004', checkTime: '2024-06-01 07:55', temperature: 36.8, status: 'unwell', symptoms: '轻微头痛', remark: '持续观察' },
        { id: 5, studentName: '刘小芳', studentNo: '2024005', checkTime: '2024-06-01 08:00', temperature: 36.3, status: 'normal', symptoms: '', remark: '' },
        { id: 6, studentName: '陈小强', studentNo: '2024006', checkTime: '2024-06-01 08:05', temperature: 38.2, status: 'fever', symptoms: '发热、乏力', remark: '已送医务室' },
        { id: 7, studentName: '周小敏', studentNo: '2024007', checkTime: '2024-06-01 08:10', temperature: 36.6, status: 'normal', symptoms: '', remark: '' },
        { id: 8, studentName: '吴小伟', studentNo: '2024008', checkTime: '2024-06-01 08:15', temperature: 36.4, status: 'unwell', symptoms: '腹痛', remark: '饮食注意' }
      ]
    };
  },
  computed: {
    filteredStudentList() {
      let list = this.studentList;
      
      if (this.activeFilter !== 'all') {
        list = list.filter(item => item.status === this.activeFilter);
      }
      
      if (this.searchKeyword) {
        list = list.filter(item => 
          item.studentName.includes(this.searchKeyword) ||
          item.studentNo.includes(this.searchKeyword)
        );
      }
      
      this.totalStudents = list.length;
      return list;
    }
  },
  created() {
    if (this.classList.length > 0) {
      this.selectedClass = this.classList[0].id;
    }
  },
  methods: {
    handleDateChange() {
      this.loadCheckData();
    },
    handleClassChange() {
      this.loadCheckData();
    },
    loadCheckData() {
      // 模拟加载数据
      this.$message.success('数据已更新');
    },
    filterStudents(type) {
      this.activeFilter = type;
      this.currentPage = 1;
    },
    getStatusType(status) {
      const map = {
        normal: 'success',
        fever: 'danger',
        absent: 'warning',
        unwell: 'info'
      };
      return map[status] || 'info';
    },
    getStatusText(status) {
      const map = {
        normal: '正常',
        fever: '发热',
        absent: '缺勤',
        unwell: '不适'
      };
      return map[status] || '未知';
    },
    viewDetail(row) {
      this.currentStudent = row;
      this.detailDialogVisible = true;
    },
    handlePageChange(page) {
      this.currentPage = page;
    },
    exportReport() {
      this.$message.success('统计报表导出成功！');
    }
  }
};
</script>

<style scoped>
.class-health-board {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
  color: #303133;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.filter-section {
  margin-bottom: 20px;
}

.stat-cards {
  margin-bottom: 20px;
}

.stat-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.stat-card .stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.stat-card.total .stat-icon {
  background: #e6f7ff;
  color: #1890ff;
}

.stat-card.checked .stat-icon {
  background: #f6ffed;
  color: #52c41a;
}

.stat-card.fever .stat-icon {
  background: #fff2f0;
  color: #ff4d4f;
}

.stat-card.absent .stat-icon {
  background: #fffbe6;
  color: #faad14;
}

.stat-card .stat-info .stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}

.stat-card .stat-info .stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 5px;
}

.quick-filter {
  margin-bottom: 20px;
}

.charts-section {
  margin-bottom: 20px;
}

.chart-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.chart-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 20px;
  text-align: center;
}

/* CSS饼图样式 */
.pie-chart-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 40px;
  padding: 20px;
}

.css-pie-chart {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  background: conic-gradient(
    #52c41a 0deg calc(var(--value, 75) * 3.6deg),
    #ff4d4f calc(var(--value, 75) * 3.6deg) calc((var(--value, 75) + 5) * 3.6deg),
    #faad14 calc((var(--value, 75) + 5) * 3.6deg) calc((var(--value, 75) + 5 + 7) * 3.6deg),
    #1890ff calc((var(--value, 75) + 5 + 7) * 3.6deg) 360deg
  );
  position: relative;
}

.css-pie-chart::before {
  content: '';
  position: absolute;
  width: 100px;
  height: 100px;
  background: #fff;
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.pie-legend {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #606266;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
}

.legend-color.normal {
  background: #52c41a;
}

.legend-color.fever {
  background: #ff4d4f;
}

.legend-color.absent {
  background: #faad14;
}

.legend-color.unwell {
  background: #1890ff;
}

/* CSS柱状图样式 */
.bar-chart-container {
  padding: 20px;
}

.css-bar-chart {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  height: 200px;
  padding: 0 20px;
}

.bar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.bar-wrapper {
  width: 40px;
  height: 180px;
  display: flex;
  align-items: flex-end;
}

.bar {
  width: 100%;
  background: linear-gradient(180deg, #1890ff 0%, #69c0ff 100%);
  border-radius: 4px 4px 0 0;
  transition: height 0.3s ease;
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

.bar-value {
  color: #fff;
  font-size: 12px;
  font-weight: bold;
  padding-top: 5px;
}

.bar-label {
  font-size: 12px;
  color: #909399;
}

.table-section {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.table-header h3 {
  margin: 0;
  font-size: 16px;
  color: #303133;
}

.temp-abnormal {
  color: #ff4d4f;
  font-weight: bold;
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>