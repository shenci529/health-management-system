<template>
  <div class="leave-request">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="title">
        <i class="el-icon-date"></i>
        缺勤请假
      </h1>
      <p class="subtitle">为孩子提交请假申请，方便老师及时了解孩子情况</p>
    </div>

    <!-- 请假申请表单 -->
    <div class="form-card">
      <div class="card-header">
        <div class="header-icon">
          <i class="el-icon-edit"></i>
        </div>
        <span class="header-title">提交请假申请</span>
      </div>

      <el-form :model="leaveForm" :rules="rules" ref="leaveForm" label-width="100px" class="leave-form">
        <!-- 请假类型 -->
        <el-form-item label="请假类型" prop="type">
          <el-radio-group v-model="leaveForm.type" size="medium">
            <el-radio-button label="sick">
              <i class="el-icon-first-aid-kit"></i> 病假
            </el-radio-button>
            <el-radio-button label="personal">
              <i class="el-icon-user"></i> 事假
            </el-radio-button>
            <el-radio-button label="other">
              <i class="el-icon-more"></i> 其他
            </el-radio-button>
          </el-radio-group>
        </el-form-item>

        <!-- 请假时间 -->
        <el-form-item label="请假时间" prop="dateRange">
          <el-date-picker
            v-model="leaveForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :picker-options="pickerOptions"
            style="width: 100%">
          </el-date-picker>
        </el-form-item>

        <!-- 每日请假时段 -->
        <el-form-item label="请假时段">
          <el-checkbox-group v-model="leaveForm.timeSlots">
            <el-checkbox label="morning">上午</el-checkbox>
            <el-checkbox label="afternoon">下午</el-checkbox>
            <el-checkbox label="whole">全天</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <!-- 请假原因 -->
        <el-form-item label="请假原因" prop="reason">
          <el-input
            v-model="leaveForm.reason"
            type="textarea"
            :rows="4"
            placeholder="请详细说明请假原因，如病假请描述症状">
          </el-input>
        </el-form-item>

        <!-- 附件上传 -->
        <el-form-item label="附件证明">
          <el-upload
            action="#"
            :auto-upload="false"
            :on-change="handleFileChange"
            :file-list="fileList"
            list-type="picture-card"
            :limit="3">
            <i class="el-icon-plus"></i>
            <div slot="tip" class="el-upload__tip">可上传医院证明、病历等（最多3张）</div>
          </el-upload>
        </el-form-item>

        <!-- 紧急联系人 -->
        <el-form-item label="紧急联系">
          <el-switch
            v-model="leaveForm.emergencyContact"
            active-text="需要老师紧急联系">
          </el-switch>
        </el-form-item>

        <!-- 提交按钮 -->
        <el-form-item>
          <el-button type="primary" size="large" icon="el-icon-check" @click="submitLeave" :loading="submitting">
            提交申请
          </el-button>
          <el-button size="large" icon="el-icon-refresh" @click="resetForm">
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 请假记录查询 -->
    <div class="history-card">
      <div class="card-header">
        <div class="header-icon history-icon">
          <i class="el-icon-time"></i>
        </div>
        <span class="header-title">请假记录</span>
        <el-radio-group v-model="filterStatus" size="small" class="filter-group">
          <el-radio-button label="all">全部</el-radio-button>
          <el-radio-button label="pending">待审批</el-radio-button>
          <el-radio-button label="approved">已通过</el-radio-button>
          <el-radio-button label="rejected">已拒绝</el-radio-button>
        </el-radio-group>
      </div>

      <!-- 请假记录列表 -->
      <div class="leave-list">
        <div v-for="record in filteredRecords" :key="record.id" class="leave-item">
          <div class="leave-status" :class="record.status">
            <i :class="statusIcon(record.status)"></i>
            <span>{{ statusText(record.status) }}</span>
          </div>
          <div class="leave-content">
            <div class="leave-type">
              <el-tag :type="typeTagType(record.type)" size="medium">
                {{ typeText(record.type) }}
              </el-tag>
              <span class="leave-date">{{ record.startDate }} 至 {{ record.endDate }}</span>
            </div>
            <p class="leave-reason">{{ record.reason }}</p>
            <div class="leave-meta">
              <span><i class="el-icon-time"></i> 申请时间：{{ record.applyTime }}</span>
              <span v-if="record.approveTime">
                <i class="el-icon-check"></i> 审批时间：{{ record.approveTime }}
              </span>
            </div>
          </div>
          <div class="leave-actions">
            <el-button 
              v-if="record.status === 'pending'" 
              type="text" 
              @click="cancelLeave(record.id)"
              class="cancel-btn">
              撤销申请
            </el-button>
            <el-button type="text" @click="viewDetail(record)">
              查看详情
            </el-button>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="filteredRecords.length === 0" class="empty-state">
          <i class="el-icon-document"></i>
          <p>暂无请假记录</p>
        </div>
      </div>

      <!-- 分页 -->
      <el-pagination
        v-if="leaveRecords.length > 0"
        background
        layout="prev, pager, next"
        :total="leaveRecords.length"
        :page-size="5"
        class="pagination">
      </el-pagination>
    </div>

    <!-- 详情弹窗 -->
    <el-dialog
      title="请假详情"
      :visible.sync="detailDialogVisible"
      width="500px">
      <div v-if="currentRecord" class="detail-content">
        <div class="detail-row">
          <span class="detail-label">请假类型：</span>
          <el-tag :type="typeTagType(currentRecord.type)">
            {{ typeText(currentRecord.type) }}
          </el-tag>
        </div>
        <div class="detail-row">
          <span class="detail-label">请假时间：</span>
          <span>{{ currentRecord.startDate }} 至 {{ currentRecord.endDate }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">请假时段：</span>
          <span>{{ timeSlotsText(currentRecord.timeSlots) }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">申请状态：</span>
          <el-tag :type="statusTagType(currentRecord.status)">
            {{ statusText(currentRecord.status) }}
          </el-tag>
        </div>
        <div class="detail-row">
          <span class="detail-label">请假原因：</span>
          <p class="detail-reason">{{ currentRecord.reason }}</p>
        </div>
        <div v-if="currentRecord.approveRemark" class="detail-row">
          <span class="detail-label">审批备注：</span>
          <p class="detail-remark">{{ currentRecord.approveRemark }}</p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'LeaveRequest',
  data() {
    return {
      submitting: false,
      filterStatus: 'all',
      detailDialogVisible: false,
      currentRecord: null,
      fileList: [],
      leaveForm: {
        type: 'sick',
        dateRange: [],
        timeSlots: ['whole'],
        reason: '',
        emergencyContact: false
      },
      rules: {
        type: [{ required: true, message: '请选择请假类型', trigger: 'change' }],
        dateRange: [{ required: true, message: '请选择请假时间', trigger: 'change' }],
        reason: [{ required: true, message: '请填写请假原因', trigger: 'blur' }]
      },
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() < Date.now() - 8.64e7;
        }
      },
      leaveRecords: [
        {
          id: 1,
          type: 'sick',
          startDate: '2024-06-03',
          endDate: '2024-06-03',
          timeSlots: ['whole'],
          reason: '感冒发烧，体温38.5度，需要在家休息',
          status: 'approved',
          applyTime: '2024-06-02 20:30',
          approveTime: '2024-06-02 21:00',
          approveRemark: '已批准，注意多喝水，早日康复'
        },
        {
          id: 2,
          type: 'personal',
          startDate: '2024-05-20',
          endDate: '2024-05-20',
          timeSlots: ['morning'],
          reason: '家中有事，需要请假半天',
          status: 'pending',
          applyTime: '2024-05-19 18:00'
        },
        {
          id: 3,
          type: 'sick',
          startDate: '2024-04-15',
          endDate: '2024-04-16',
          timeSlots: ['whole'],
          reason: '急性肠胃炎',
          status: 'rejected',
          applyTime: '2024-04-14 19:00',
          approveTime: '2024-04-14 20:00',
          approveRemark: '请提供医院证明后重新申请'
        }
      ]
    };
  },
  computed: {
    filteredRecords() {
      if (this.filterStatus === 'all') {
        return this.leaveRecords;
      }
      return this.leaveRecords.filter(record => record.status === this.filterStatus);
    }
  },
  methods: {
    // 提交请假申请
    submitLeave() {
      this.$refs.leaveForm.validate(valid => {
        if (valid) {
          this.submitting = true;
          setTimeout(() => {
            const newRecord = {
              id: Date.now(),
              type: this.leaveForm.type,
              startDate: this.formatDate(this.leaveForm.dateRange[0]),
              endDate: this.formatDate(this.leaveForm.dateRange[1]),
              timeSlots: this.leaveForm.timeSlots,
              reason: this.leaveForm.reason,
              status: 'pending',
              applyTime: this.formatDateTime(new Date())
            };
            this.leaveRecords.unshift(newRecord);
            this.submitting = false;
            this.$message.success('请假申请提交成功！');
            this.resetForm();
          }, 1000);
        }
      });
    },
    // 重置表单
    resetForm() {
      this.$refs.leaveForm.resetFields();
      this.leaveForm.timeSlots = ['whole'];
      this.leaveForm.emergencyContact = false;
      this.fileList = [];
    },
    // 撤销请假
    cancelLeave(id) {
      this.$confirm('确定要撤销该请假申请吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const index = this.leaveRecords.findIndex(r => r.id === id);
        if (index > -1) {
          this.leaveRecords.splice(index, 1);
          this.$message.success('已撤销申请');
        }
      }).catch(() => {});
    },
    // 查看详情
    viewDetail(record) {
      this.currentRecord = record;
      this.detailDialogVisible = true;
    },
    // 文件上传
    handleFileChange(file, fileList) {
      this.fileList = fileList;
    },
    // 格式化日期
    formatDate(date) {
      if (!date) return '';
      const d = new Date(date);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    },
    // 格式化日期时间
    formatDateTime(date) {
      return `${this.formatDate(date)} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    },
    // 状态文本
    statusText(status) {
      const map = {
        pending: '待审批',
        approved: '已通过',
        rejected: '已拒绝'
      };
      return map[status] || status;
    },
    // 状态图标
    statusIcon(status) {
      const map = {
        pending: 'el-icon-time',
        approved: 'el-icon-check',
        rejected: 'el-icon-close'
      };
      return map[status] || 'el-icon-question';
    },
    // 状态标签类型
    statusTagType(status) {
      const map = {
        pending: 'warning',
        approved: 'success',
        rejected: 'danger'
      };
      return map[status] || 'info';
    },
    // 请假类型文本
    typeText(type) {
      const map = {
        sick: '病假',
        personal: '事假',
        other: '其他'
      };
      return map[type] || type;
    },
    // 请假类型标签类型
    typeTagType(type) {
      const map = {
        sick: 'danger',
        personal: 'primary',
        other: 'info'
      };
      return map[type] || 'info';
    },
    // 时段文本
    timeSlotsText(slots) {
      if (!slots || slots.length === 0) return '未指定';
      if (slots.includes('whole')) return '全天';
      const map = {
        morning: '上午',
        afternoon: '下午'
      };
      return slots.map(s => map[s] || s).join('、');
    }
  }
};
</script>

<style scoped>
.leave-request {
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

/* 卡片样式 */
.form-card, .history-card {
  background: #fff;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 25px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 1px solid #EBEEF5;
}

.header-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #409EFF;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 20px;
}

.history-icon {
  background: #67C23A;
}

.header-title {
  font-size: 18px;
  font-weight: 500;
  color: #333;
  flex: 1;
}

.filter-group {
  margin-left: auto;
}

/* 表单样式 */
.leave-form >>> .el-form-item__label {
  font-weight: 500;
}

.leave-form >>> .el-radio-button__inner {
  padding: 12px 20px;
}

.leave-form >>> .el-radio-button__inner i {
  margin-right: 5px;
}

/* 请假记录列表 */
.leave-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.leave-item {
  display: flex;
  align-items: flex-start;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #ddd;
  transition: all 0.3s ease;
}

.leave-item:hover {
  background: #f0f2f5;
}

.leave-item .leave-status {
  width: 80px;
  text-align: center;
  padding: 10px;
  border-radius: 8px;
  margin-right: 20px;
}

.leave-status.pending {
  background: #fdf6ec;
  color: #e6a23c;
  border-left-color: #e6a23c;
}

.leave-status.approved {
  background: #f0f9eb;
  color: #67c23a;
  border-left-color: #67c23a;
}

.leave-status.rejected {
  background: #fef0f0;
  color: #f56c6c;
  border-left-color: #f56c6c;
}

.leave-status i {
  font-size: 24px;
  display: block;
  margin-bottom: 5px;
}

.leave-content {
  flex: 1;
}

.leave-type {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 10px;
}

.leave-date {
  color: #666;
  font-size: 14px;
}

.leave-reason {
  color: #333;
  margin: 10px 0;
  line-height: 1.6;
}

.leave-meta {
  display: flex;
  gap: 20px;
  color: #999;
  font-size: 13px;
}

.leave-meta i {
  margin-right: 5px;
}

.leave-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.cancel-btn {
  color: #f56c6c;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.empty-state i {
  font-size: 60px;
  color: #ddd;
  margin-bottom: 15px;
}

/* 分页 */
.pagination {
  margin-top: 20px;
  text-align: center;
}

/* 详情弹窗 */
.detail-content {
  padding: 10px;
}

.detail-row {
  margin-bottom: 20px;
}

.detail-label {
  font-weight: 500;
  color: #666;
  display: inline-block;
  width: 100px;
}

.detail-reason, .detail-remark {
  margin: 10px 0 0 100px;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 4px;
  line-height: 1.6;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .leave-request {
    padding: 15px;
  }

  .title {
    font-size: 22px;
  }

  .leave-item {
    flex-direction: column;
  }

  .leave-status {
    width: 100% !important;
    margin-right: 0 !important;
    margin-bottom: 15px;
  }

  .leave-actions {
    flex-direction: row;
    margin-top: 15px;
  }

  .filter-group {
    margin-top: 10px;
  }

  .card-header {
    flex-wrap: wrap;
  }
}
</style>
