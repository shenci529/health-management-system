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

    <!-- 家长请假申请 - 待审批 -->
    <div class="pending-section" v-if="pendingCount > 0">
      <div class="section-header pending-header">
        <h2>
          <i class="el-icon-bell pending-bell-icon"></i>
          🔔 待审批的请假申请
          <el-tag type="warning" size="medium" effect="dark">{{ pendingCount }} 条待处理</el-tag>
        </h2>
        <span class="pending-hint">请及时审批，家长将收到通知</span>
      </div>
      <div class="pending-list">
        <div v-for="item in pendingRequests" :key="item.id" class="pending-item">
          <div class="pending-info">
            <div class="pending-main">
              <el-tag :type="getTypeTag(item.type)" size="small">
                {{ getTypeText(item.type) }}
              </el-tag>
              <span class="pending-name">{{ item.studentName }}</span>
              <span v-if="item.parentName" class="pending-parent">({{ item.parentName }})</span>
              <span class="pending-date">{{ item.startDate }}{{ item.endDate && item.endDate !== item.startDate ? ' 至 ' + item.endDate : '' }}</span>
            </div>
            <div class="pending-reason">{{ item.reason }}</div>
            <div class="pending-meta">
              <span><i class="el-icon-time"></i> 申请时间：{{ item.applyTime }}</span>
            </div>
          </div>
          <div class="pending-actions">
            <el-button type="success" size="medium" icon="el-icon-check" plain @click="openApproveDialog(item)">
              ✅ 通过
            </el-button>
            <el-button type="danger" size="medium" icon="el-icon-close" plain @click="openApproveDialog(item)">
              ❌ 拒绝
            </el-button>
          </div>
        </div>
      </div>
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
          <el-select v-model="filterStatus" placeholder="状态" size="small" style="width: 120px; margin-right: 10px;">
            <el-option label="全部状态" value=""></el-option>
            <el-option label="已通过" value="approved"></el-option>
            <el-option label="已拒绝" value="rejected"></el-option>
            <el-option label="已撤销" value="cancelled"></el-option>
            <el-option label="已登记" value="registered"></el-option>
            <el-option label="待审批" value="pending"></el-option>
          </el-select>
          <el-button type="primary" size="small" icon="el-icon-search" @click="filterRecords">筛选</el-button>
          <el-button size="small" icon="el-icon-refresh" @click="loadRecords">刷新</el-button>
        </div>
      </div>

      <el-table :data="filteredRecords" style="width: 100%" border>
        <el-table-column prop="studentName" label="学生姓名" width="120"></el-table-column>
        <el-table-column label="缺勤日期" width="160">
          <template slot-scope="scope">{{ getDateRange(scope.row) }}</template>
        </el-table-column>
        <el-table-column label="缺勤类型" width="100">
          <template slot-scope="scope">
            <el-tag :type="getTypeTag(scope.row.type || scope.row.absenceType)" size="small">
              {{ getTypeText(scope.row.type || scope.row.absenceType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="来源" width="110">
          <template slot-scope="scope">
            <el-tag :type="scope.row.source === '家长申请' ? 'success' : 'primary'" size="small">
              {{ getSourceText(scope.row) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="getStatusTag(scope.row.status)" size="small">
              {{ getStatusText(scope.row.status) }}
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
        <el-table-column prop="approver" label="审批人" width="100"></el-table-column>
        <el-table-column label="申请/登记时间" width="160">
          <template slot-scope="scope">
            {{ formatDateTime(scope.row.applyTime || scope.row.registerTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template slot-scope="scope">
            <el-button v-if="scope.row.status === 'pending'" size="mini" type="success" icon="el-icon-check" @click="openApproveDialog(scope.row)">审批</el-button>
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

    <!-- 审批弹窗 -->
    <el-dialog
      title="✅ 审批请假申请"
      :visible.sync="approveDialogVisible"
      width="560px"
      @closed="approveRecord = null; approveRemark = ''">
      <div v-if="approveRecord" class="approve-form">
        <!-- 信息摘要卡片 -->
        <div class="approve-summary">
          <div class="summary-row">
            <span class="summary-label">👨‍🎓 学生：</span>
            <span class="summary-value">{{ approveRecord.studentName }}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">👤 申请人：</span>
            <span class="summary-value">{{ approveRecord.parentName || '家长' }}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">📋 类型：</span>
            <el-tag :type="getTypeTag(approveRecord.type)" size="small">{{ getTypeText(approveRecord.type) }}</el-tag>
          </div>
          <div class="summary-row">
            <span class="summary-label">📅 时间：</span>
            <span class="summary-value">{{ approveRecord.startDate }}{{ approveRecord.endDate && approveRecord.endDate !== approveRecord.startDate ? ' 至 ' + approveRecord.endDate : '' }}</span>
          </div>
          <div class="summary-row reason-row">
            <span class="summary-label">💬 原因：</span>
            <div class="reason-text">{{ approveRecord.reason }}</div>
          </div>
        </div>

        <el-form label-width="100px" class="approve-input">
          <el-form-item label="审批意见">
            <el-input
              type="textarea"
              :rows="3"
              v-model="approveRemark"
              placeholder="请输入审批意见（家长会收到此通知）">
            </el-input>
          </el-form-item>
        </el-form>

        <div class="approve-notice">
          <i class="el-icon-info"></i> 审批后，家长会立即收到通知。
        </div>
      </div>
      <div slot="footer" class="approve-footer">
        <el-button size="medium" @click="approveDialogVisible = false">取消</el-button>
        <el-button type="danger" size="medium" icon="el-icon-close" @click="rejectRequest">
          ❌ 拒绝申请
        </el-button>
        <el-button type="success" size="medium" icon="el-icon-check" @click="approveRequest">
          ✅ 通过申请
        </el-button>
      </div>
    </el-dialog>

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
import { LeaveStore } from '@/permission';

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
        { id: 1, name: '小明' },
        { id: 2, name: '李四' },
        { id: 3, name: '王五' },
        { id: 4, name: '赵六' },
        { id: 5, name: '钱七' }
      ],
      // 统一从 LeaveStore 加载，不再使用本地 mock
      allRecords: [],
      filterDate: '',
      filterType: '',
      filterStatus: '',
      currentPage: 1,
      pageSize: 10,
      chartPeriod: 'week',
      // 审批弹窗相关
      approveDialogVisible: false,
      approveRecord: null,
      approveRemark: '',
      // 审批用户名（教师）
      approverName: '老师'
    };
  },
  mounted() {
    this.loadRecords();
  },
  activated() {
    this.loadRecords();
  },
  computed: {
    // 家长提交的待审批请假申请
    pendingRequests() {
      return this.allRecords.filter(r => r.status === 'pending');
    },
    // 待审批的数量
    pendingCount() {
      return this.pendingRequests.length;
    },
    // 今日缺勤数（基于已通过/已登记的记录）
    todayAbsenceCount() {
      const today = new Date().toISOString().split('T')[0];
      return this.allRecords.filter(r =>
        (r.status === 'approved' || r.status === 'registered') &&
        (r.startDate === today || r.absenceDate === today)
      ).length;
    },
    sickLeaveCount() {
      return this.allRecords.filter(r =>
        (r.status === 'approved' || r.status === 'registered') &&
        (r.type === 'sick' || r.absenceType === 'sick')
      ).length;
    },
    personalLeaveCount() {
      return this.allRecords.filter(r =>
        (r.status === 'approved' || r.status === 'registered') &&
        (r.type === 'personal' || r.absenceType === 'personal')
      ).length;
    },
    otherLeaveCount() {
      return this.allRecords.filter(r =>
        (r.status === 'approved' || r.status === 'registered') &&
        (r.type === 'other' || r.absenceType === 'other')
      ).length;
    },
    // 筛选后的全部记录（缺勤记录表格）
    filteredRecords() {
      let records = this.allRecords;
      if (this.filterDate) {
        const dateStr = this.formatDate(this.filterDate);
        records = records.filter(r =>
          r.startDate === dateStr || r.absenceDate === dateStr ||
          r.endDate === dateStr
        );
      }
      if (this.filterType) {
        records = records.filter(r =>
          r.type === this.filterType || r.absenceType === this.filterType
        );
      }
      if (this.filterStatus) {
        records = records.filter(r => r.status === this.filterStatus);
      }
      return records;
    },
    totalRecords() {
      return this.filteredRecords.length;
    }
  },
  methods: {
    // 从共享存储加载
    loadRecords() {
      this.allRecords = LeaveStore.getAll();
    },
    // 获取当前教师名
    getApproverName() {
      try {
        const raw = localStorage.getItem('userInfo');
        if (raw) {
          const obj = JSON.parse(raw);
          return obj.username || '老师';
        }
      } catch (e) { /* ignore */ }
      return '老师';
    },
    // 教师手动登记缺勤
    submitAbsence() {
      this.$refs.absenceForm.validate(valid => {
        if (!valid) return;
        const student = this.studentList.find(s => s.id === this.absenceForm.studentId);
        if (!student) {
          this.$message.error('请选择学生');
          return;
        }
        LeaveStore.registerByTeacher({
          studentName: student.name,
          absenceDate: this.formatDate(this.absenceForm.absenceDate),
          absenceType: this.absenceForm.absenceType,
          reason: this.absenceForm.reason,
          healthStatus: this.absenceForm.healthStatus,
          approver: this.getApproverName()
        });
        this.loadRecords();
        this.$message.success('缺勤登记成功！');
        this.resetForm();
      });
    },
    resetForm() {
      this.$refs.absenceForm.resetFields();
      this.absenceForm.absenceDate = new Date();
    },
    filterRecords() {
      this.currentPage = 1;
    },
    // 打开审批弹窗
    openApproveDialog(record) {
      this.approveRecord = record;
      this.approveRemark = '';
      this.approveDialogVisible = true;
    },
    // 批准请假
    approveRequest() {
      if (!this.approveRecord) return;
      const record = this.approveRecord;
      LeaveStore.approve(
        record.id,
        'approve',
        this.approveRemark || '已批准',
        this.getApproverName()
      );
      this.approveDialogVisible = false;
      this.loadRecords();
      this.$message({
        type: 'success',
        message: `✅ 已批准 ${record.studentName} 的请假申请，通知已发送给家长`,
        duration: 3000
      });
    },
    // 拒绝请假
    rejectRequest() {
      if (!this.approveRecord) return;
      const record = this.approveRecord;
      LeaveStore.approve(
        record.id,
        'reject',
        this.approveRemark || '已拒绝',
        this.getApproverName()
      );
      this.approveDialogVisible = false;
      this.loadRecords();
      this.$message({
        type: 'warning',
        message: `❌ 已拒绝 ${record.studentName} 的请假申请，通知已发送给家长`,
        duration: 3000
      });
    },
    // 删除记录
    deleteRecord(row) {
      this.$confirm('确定删除该条记录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const list = LeaveStore.getAll().filter(r => r.id !== row.id);
        LeaveStore.saveAll(list);
        this.loadRecords();
        this.$message.success('删除成功！');
      }).catch(() => {});
    },
    editRecord(row) {
      this.absenceForm = {
        studentId: row.studentId || '',
        studentName: row.studentName || '',
        absenceDate: row.startDate || row.absenceDate ? new Date(row.startDate || row.absenceDate) : new Date(),
        absenceType: row.type || row.absenceType || '',
        reason: row.reason || '',
        healthStatus: row.healthStatus || ''
      };
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
      if (typeof datetime === 'string' && datetime.includes(' ') && !datetime.includes('T')) {
        return datetime;
      }
      const d = new Date(datetime);
      return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    },
    getTypeTag(type) {
      const typeMap = { sick: 'danger', personal: 'warning', other: 'info' };
      return typeMap[type] || 'info';
    },
    getTypeText(type) {
      const typeMap = { sick: '病假', personal: '事假', other: '其他' };
      return typeMap[type] || type;
    },
    getStatusTag(status) {
      const statusMap = {
        pending: 'warning',
        approved: 'success',
        rejected: 'danger',
        cancelled: 'info',
        registered: 'primary'
      };
      return statusMap[status] || 'info';
    },
    getStatusText(status) {
      const statusMap = {
        pending: '待审批',
        approved: '已通过',
        rejected: '已拒绝',
        cancelled: '已撤销',
        registered: '已登记'
      };
      return statusMap[status] || status;
    },
    getSourceText(record) {
      if (record.source === '家长申请') return '家长申请';
      if (record.source === '教师登记') return '教师登记';
      return '记录';
    },
    getDateRange(record) {
      const start = record.startDate || record.absenceDate || '';
      const end = record.endDate || '';
      if (!start) return '';
      if (end && end !== start) return `${start} 至 ${end}`;
      return start;
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

/* 待审批申请区块 */
.pending-section {
  background: linear-gradient(135deg, #fef5e0 0%, #fdf0d5 100%);
  border: 2px solid #e6a23c;
  border-radius: 15px;
  padding: 25px;
  margin-bottom: 25px;
  box-shadow: 0 4px 15px rgba(230, 162, 60, 0.2);
  animation: pulse-pending 2s ease-in-out infinite;
}

@keyframes pulse-pending {
  0%, 100% { box-shadow: 0 4px 15px rgba(230, 162, 60, 0.2); }
  50% { box-shadow: 0 4px 25px rgba(230, 162, 60, 0.4); }
}

.pending-header {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.pending-header h2 {
  display: flex;
  align-items: center;
  gap: 10px;
}

.pending-bell-icon {
  animation: shake 1.5s ease-in-out infinite;
  display: inline-block;
}

@keyframes shake {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-15deg); }
  75% { transform: rotate(15deg); }
}

.pending-hint {
  font-size: 13px;
  color: #e6a23c;
  margin-top: 8px;
  font-weight: 500;
}

.pending-list {
  margin-top: 15px;
}

.pending-item {
  background: #fff;
  border-radius: 12px;
  padding: 18px 25px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-left: 5px solid #e6a23c;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.pending-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
}

.pending-info {
  flex: 1;
}

.pending-main {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.pending-name {
  font-weight: 700;
  color: #303133;
  font-size: 16px;
}

.pending-parent {
  color: #909399;
  font-size: 13px;
}

.pending-date {
  color: #666;
  font-size: 14px;
  margin-left: 10px;
}

.pending-reason {
  color: #606266;
  font-size: 14px;
  margin-bottom: 8px;
  background: #f5f7fa;
  padding: 10px 12px;
  border-radius: 6px;
}

.pending-meta {
  color: #909399;
  font-size: 12px;
}

.pending-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.pending-actions .el-button {
  padding: 12px 24px !important;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s ease;
}

/* 审批弹窗 */
.approve-form {
  margin-top: 10px;
}

/* 信息摘要卡片 */
.approve-summary {
  background: linear-gradient(135deg, #ecf5ff 0%, #d9ecff 100%);
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
  border-left: 4px solid #409eff;
}

.summary-row {
  display: flex;
  align-items: flex-start;
  margin-bottom: 12px;
}

.summary-row:last-child {
  margin-bottom: 0;
}

.summary-row.reason-row {
  flex-direction: column;
}

.summary-label {
  font-weight: 600;
  color: #303133;
  min-width: 80px;
  margin-right: 10px;
}

.summary-value {
  color: #606266;
  flex: 1;
}

.reason-text {
  background: #fff;
  padding: 12px 15px;
  border-radius: 6px;
  color: #606266;
  line-height: 1.6;
  margin-top: 8px;
  border: 1px solid #e4e7ed;
}

.approve-input {
  margin-top: 15px;
}

.approve-notice {
  background: #fdf6ec;
  border-left: 3px solid #e6a23c;
  padding: 10px 15px;
  margin-top: 15px;
  color: #e6a23c;
  font-size: 13px;
  border-radius: 4px;
}

.approve-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.approve-footer .el-button {
  padding: 12px 28px !important;
  font-weight: 600;
  font-size: 14px;
}
</style>
