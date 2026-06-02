<template>
  <div class="absence-register">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="title">
        <i class="el-icon-user-solid"></i>
        缺勤健康登记
      </h1>
      <p class="subtitle">记录学生缺勤情况，关注学生健康状况</p>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <div class="stats-card">
        <div class="stats-icon blue">
          <i class="el-icon-user"></i>
        </div>
        <div class="stats-info">
          <div class="stats-value">{{ todayAbsenceCount }}</div>
          <div class="stats-label">今日缺勤</div>
        </div>
      </div>
      <div class="stats-card">
        <div class="stats-icon orange">
          <i class="el-icon-first-aid-kit"></i>
        </div>
        <div class="stats-info">
          <div class="stats-value">{{ sickLeaveCount }}</div>
          <div class="stats-label">病假人数</div>
        </div>
      </div>
      <div class="stats-card">
        <div class="stats-icon green">
          <i class="el-icon-document-checked"></i>
        </div>
        <div class="stats-info">
          <div class="stats-value">{{ personalLeaveCount }}</div>
          <div class="stats-label">事假人数</div>
        </div>
      </div>
    </div>

    <!-- 缺勤登记表单 -->
    <div class="register-section">
      <div class="section-header">
        <h2>
          <i class="el-icon-edit"></i>
          学生缺勤登记
        </h2>
      </div>

      <el-form :model="absenceForm" :rules="rules" ref="absenceForm" label-width="100px" class="absence-form">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="选择学生" prop="studentName">
              <el-select v-model="absenceForm.studentId" filterable placeholder="请选择学生" style="width: 100%">
                <el-option
                  v-for="student in studentList"
                  :key="student.id"
                  :label="student.name"
                  :value="student.id">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="缺勤日期" prop="absenceDate">
              <el-date-picker
                v-model="absenceForm.absenceDate"
                type="date"
                placeholder="选择日期"
                style="width: 100%">
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="缺勤类型" prop="absenceType">
              <el-select v-model="absenceForm.absenceType" placeholder="请选择类型" style="width: 100%">
                <el-option label="病假" value="sick">
                  <i class="el-icon-first-aid-kit" style="color: #F56C6C; margin-right: 5px;"></i>病假
                </el-option>
                <el-option label="事假" value="personal">
                  <i class="el-icon-suitcase" style="color: #E6A23C; margin-right: 5px;"></i>事假
                </el-option>
                <el-option label="其他" value="other">
                  <i class="el-icon-more" style="color: #909399; margin-right: 5px;"></i>其他
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="缺勤原因" prop="reason">
              <el-input
                type="textarea"
                :rows="3"
                v-model="absenceForm.reason"
                placeholder="请详细描述缺勤原因">
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="健康状况" prop="healthStatus">
              <el-input
                type="textarea"
                :rows="3"
                v-model="absenceForm.healthStatus"
                placeholder="请描述学生健康状况（如病假需填写症状）">
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item>
          <el-button type="primary" icon="el-icon-plus" @click="submitAbsence">提交登记</el-button>
          <el-button icon="el-icon-refresh" @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 缺勤记录列表 -->
    <div class="record-section">
      <div class="section-header">
        <h2>
          <i class="el-icon-document"></i>
          缺勤记录
        </h2>
        <div class="section-actions">
          <el-date-picker
            v-model="filterDate"
            type="date"
            placeholder="筛选日期"
            size="small"
            style="width: 150px; margin-right: 10px;">
          </el-date-picker>
          <el-select v-model="filterType" placeholder="缺勤类型" size="small" style="width: 120px; margin-right: 10px;">
            <el-option label="全部" value=""></el-option>
            <el-option label="病假" value="sick"></el-option>
            <el-option label="事假" value="personal"></el-option>
            <el-option label="其他" value="other"></el-option>
          </el-select>
          <el-button type="primary" size="small" icon="el-icon-search" @click="filterRecords">筛选</el-button>
        </div>
      </div>

      <el-table :data="filteredRecords" style="width: 100%" border>
        <el-table-column prop="studentName" label="学生姓名" width="120">
          <template slot-scope="scope">
            <span class="student-name">{{ scope.row.studentName }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="absenceDate" label="缺勤日期" width="120">
          <template slot-scope="scope">
            {{ formatDate(scope.row.absenceDate) }}
          </template>
        </el-table-column>
        <el-table-column prop="absenceType" label="缺勤类型" width="100">
          <template slot-scope="scope">
            <el-tag :type="getTypeTag(scope.row.absenceType)" size="small">
              {{ getTypeText(scope.row.absenceType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="reason" label="缺勤原因" min-width="200">
          <template slot-scope="scope">
            <el-tooltip :content="scope.row.reason" placement="top">
              <span class="ellipsis">{{ scope.row.reason }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="healthStatus" label="健康状况" min-width="200">
          <template slot-scope="scope">
            <el-tooltip :content="scope.row.healthStatus" placement="top">
              <span class="ellipsis">{{ scope.row.healthStatus || '-' }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="registerTime" label="登记时间" width="150">
          <template slot-scope="scope">
            {{ formatDateTime(scope.row.registerTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit" @click="editRecord(scope.row)">编辑</el-button>
            <el-button size="mini" type="danger" icon="el-icon-delete" @click="deleteRecord(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-size="pageSize"
          layout="total, prev, pager, next"
          :total="totalRecords">
        </el-pagination>
      </div>
    </div>

    <!-- 缺勤统计图表 -->
    <div class="chart-section">
      <div class="section-header">
        <h2>
          <i class="el-icon-data-analysis"></i>
          缺勤统计
        </h2>
        <el-radio-group v-model="chartPeriod" size="small">
          <el-radio-button label="week">本周</el-radio-button>
          <el-radio-button label="month">本月</el-radio-button>
          <el-radio-button label="semester">本学期</el-radio-button>
        </el-radio-group>
      </div>

      <el-row :gutter="20">
        <el-col :span="12">
          <div class="chart-card">
            <h3>缺勤类型分布</h3>
            <div class="chart-placeholder">
              <div class="pie-chart">
                <div class="pie-item sick" :style="{flex: sickLeaveCount}">
                  <span>病假 {{ sickLeaveCount }}</span>
                </div>
                <div class="pie-item personal" :style="{flex: personalLeaveCount}">
                  <span>事假 {{ personalLeaveCount }}</span>
                </div>
                <div class="pie-item other" :style="{flex: otherLeaveCount}">
                  <span>其他 {{ otherLeaveCount }}</span>
                </div>
              </div>
            </div>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="chart-card">
            <h3>近期缺勤趋势</h3>
            <div class="chart-placeholder">
              <div class="trend-chart">
                <div v-for="(item, index) in trendData" :key="index" class="trend-bar-wrapper">
                  <div class="trend-bar" :style="{height: item.count * 20 + 'px'}"></div>
                  <span class="trend-label">{{ item.date }}</span>
                  <span class="trend-value">{{ item.count }}人</span>
                </div>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AbsenceRegister',
  data() {
    return {
      absenceForm: {
        studentId: '',
        studentName: '',
        absenceDate: new Date(),
        absenceType: '',
        reason: '',
        healthStatus: ''
      },
      rules: {
        studentId: [{ required: true, message: '请选择学生', trigger: 'change' }],
        absenceDate: [{ required: true, message: '请选择缺勤日期', trigger: 'change' }],
        absenceType: [{ required: true, message: '请选择缺勤类型', trigger: 'change' }],
        reason: [{ required: true, message: '请填写缺勤原因', trigger: 'blur' }]
      },
      studentList: [
        { id: 1, name: '张三' },
        { id: 2, name: '李四' },
        { id: 3, name: '王五' },
        { id: 4, name: '赵六' },
        { id: 5, name: '钱七' }
      ],
      absenceRecords: [
        {
          id: 1,
          studentId: 1,
          studentName: '张三',
          absenceDate: '2024-01-15',
          absenceType: 'sick',
          reason: '感冒发烧，体温38.5度',
          healthStatus: '已就医，正在服药治疗',
          registerTime: '2024-01-15 08:30:00'
        },
        {
          id: 2,
          studentId: 2,
          studentName: '李四',
          absenceDate: '2024-01-15',
          absenceType: 'personal',
          reason: '家中有事，需请假一天',
          healthStatus: '身体健康',
          registerTime: '2024-01-15 08:00:00'
        },
        {
          id: 3,
          studentId: 3,
          studentName: '王五',
          absenceDate: '2024-01-14',
          absenceType: 'sick',
          reason: '腹泻，肠胃不适',
          healthStatus: '已服药，症状缓解',
          registerTime: '2024-01-14 07:45:00'
        }
      ],
      filterDate: '',
      filterType: '',
      currentPage: 1,
      pageSize: 10,
      chartPeriod: 'week',
      trendData: [
        { date: '周一', count: 2 },
        { date: '周二', count: 1 },
        { date: '周三', count: 3 },
        { date: '周四', count: 0 },
        { date: '周五', count: 2 },
        { date: '周六', count: 0 },
        { date: '周日', count: 1 }
      ]
    };
  },
  computed: {
    todayAbsenceCount() {
      const today = new Date().toISOString().split('T')[0];
      return this.absenceRecords.filter(r => r.absenceDate === today).length;
    },
    sickLeaveCount() {
      return this.absenceRecords.filter(r => r.absenceType === 'sick').length;
    },
    personalLeaveCount() {
      return this.absenceRecords.filter(r => r.absenceType === 'personal').length;
    },
    otherLeaveCount() {
      return this.absenceRecords.filter(r => r.absenceType === 'other').length;
    },
    filteredRecords() {
      let records = this.absenceRecords;
      if (this.filterDate) {
        const dateStr = this.formatDate(this.filterDate);
        records = records.filter(r => r.absenceDate === dateStr);
      }
      if (this.filterType) {
        records = records.filter(r => r.absenceType === this.filterType);
      }
      return records;
    },
    totalRecords() {
      return this.filteredRecords.length;
    }
  },
  methods: {
    submitAbsence() {
      this.$refs.absenceForm.validate(valid => {
        if (valid) {
          const student = this.studentList.find(s => s.id === this.absenceForm.studentId);
          const newRecord = {
            id: Date.now(),
            studentId: this.absenceForm.studentId,
            studentName: student ? student.name : '',
            absenceDate: this.formatDate(this.absenceForm.absenceDate),
            absenceType: this.absenceForm.absenceType,
            reason: this.absenceForm.reason,
            healthStatus: this.absenceForm.healthStatus,
            registerTime: new Date().toISOString()
          };
          this.absenceRecords.unshift(newRecord);
          this.$message.success('缺勤登记成功！');
          this.resetForm();
        }
      });
    },
    resetForm() {
      this.$refs.absenceForm.resetFields();
      this.absenceForm.absenceDate = new Date();
    },
    filterRecords() {
      this.currentPage = 1;
    },
    editRecord(row) {
      this.absenceForm = { ...row };
      this.absenceForm.absenceDate = new Date(row.absenceDate);
    },
    deleteRecord(row) {
      this.$confirm('确定删除该条记录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const index = this.absenceRecords.findIndex(r => r.id === row.id);
        if (index > -1) {
          this.absenceRecords.splice(index, 1);
          this.$message.success('删除成功！');
        }
      });
    },
    handleCurrentChange(val) {
      this.currentPage = val;
    },
    formatDate(date) {
      if (!date) return '';
      const d = new Date(date);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    },
    formatDateTime(datetime) {
      if (!datetime) return '';
      const d = new Date(datetime);
      return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    },
    getTypeTag(type) {
      const typeMap = {
        sick: 'danger',
        personal: 'warning',
        other: 'info'
      };
      return typeMap[type] || 'info';
    },
    getTypeText(type) {
      const typeMap = {
        sick: '病假',
        personal: '事假',
        other: '其他'
      };
      return typeMap[type] || type;
    }
  }
};
</script>

<style scoped>
.absence-register {
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
  color: #FF6B6B;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.title i {
  color: #409EFF;
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
  background: linear-gradient(135deg, #409EFF 0%, #67C23A 100%);
}

.stats-icon.orange {
  background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
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
  color: #409EFF;
}

.section-actions {
  display: flex;
  align-items: center;
}

/* 登记区块 */
.register-section,
.record-section,
.chart-section {
  background: #fff;
  border-radius: 15px;
  padding: 25px;
  margin-bottom: 25px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

.absence-form {
  margin-top: 20px;
}

/* 表格样式 */
.student-name {
  font-weight: 500;
  color: #333;
}

.ellipsis {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 200px;
}

/* 分页 */
.pagination-wrapper {
  margin-top: 20px;
  text-align: right;
}

/* 图表区块 */
.chart-card {
  background: #f9f9f9;
  border-radius: 10px;
  padding: 20px;
}

.chart-card h3 {
  font-size: 16px;
  color: #333;
  margin-bottom: 15px;
  text-align: center;
}

.chart-placeholder {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 饼图 */
.pie-chart {
  display: flex;
  width: 100%;
  height: 150px;
  border-radius: 10px;
  overflow: hidden;
}

.pie-item {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  min-width: 30px;
}

.pie-item.sick {
  background: #F56C6C;
}

.pie-item.personal {
  background: #E6A23C;
}

.pie-item.other {
  background: #909399;
}

/* 趋势图 */
.trend-chart {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  width: 100%;
  height: 150px;
  padding: 0 10px;
}

.trend-bar-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.trend-bar {
  width: 30px;
  background: linear-gradient(to top, #409EFF, #67C23A);
  border-radius: 5px 5px 0 0;
  transition: height 0.3s ease;
}

.trend-label {
  font-size: 12px;
  color: #666;
  margin-top: 8px;
}

.trend-value {
  font-size: 12px;
  color: #409EFF;
  margin-top: 4px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .absence-register {
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

  .section-actions {
    width: 100%;
    flex-wrap: wrap;
  }
}
</style>
