<template>
  <div class="incident-report">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="title">
        <i class="el-icon-warning"></i>
        传染病/意外上报
      </h1>
      <p class="subtitle">及时上报异常情况，保障学生健康安全</p>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <div class="stats-card">
        <div class="stats-icon red">
          <i class="el-icon-bacteria"></i>
        </div>
        <div class="stats-info">
          <div class="stats-value">{{ diseaseCount }}</div>
          <div class="stats-label">传染病事件</div>
        </div>
      </div>
      <div class="stats-card">
        <div class="stats-icon orange">
          <i class="el-icon-first-aid-kit"></i>
        </div>
        <div class="stats-info">
          <div class="stats-value">{{ accidentCount }}</div>
          <div class="stats-label">意外伤害</div>
        </div>
      </div>
      <div class="stats-card">
        <div class="stats-icon blue">
          <i class="el-icon-time"></i>
        </div>
        <div class="stats-info">
          <div class="stats-value">{{ pendingCount }}</div>
          <div class="stats-label">待处理</div>
        </div>
      </div>
    </div>

    <!-- 事件上报表单 -->
    <div class="report-section">
      <div class="section-header">
        <h2>
          <i class="el-icon-edit-outline"></i>
          事件上报
        </h2>
      </div>

      <el-form :model="reportForm" :rules="rules" ref="reportForm" label-width="100px" class="report-form">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="事件类型" prop="incidentType">
              <el-select v-model="reportForm.incidentType" placeholder="请选择事件类型" style="width: 100%">
                <el-option label="传染病" value="disease">
                  <i class="el-icon-bacteria" style="color: #F56C6C; margin-right: 5px;"></i>传染病
                </el-option>
                <el-option label="意外伤害" value="accident">
                  <i class="el-icon-first-aid-kit" style="color: #E6A23C; margin-right: 5px;"></i>意外伤害
                </el-option>
                <el-option label="其他" value="other">
                  <i class="el-icon-more" style="color: #909399; margin-right: 5px;"></i>其他
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="发生时间" prop="incidentTime">
              <el-date-picker
                v-model="reportForm.incidentTime"
                type="datetime"
                placeholder="选择发生时间"
                style="width: 100%">
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="发生地点" prop="location">
              <el-input v-model="reportForm.location" placeholder="请输入发生地点"></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="涉及学生" prop="students">
              <el-select v-model="reportForm.students" multiple filterable placeholder="请选择涉及学生" style="width: 100%">
                <el-option
                  v-for="student in studentList"
                  :key="student.id"
                  :label="student.name"
                  :value="student.id">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="紧急程度" prop="urgency">
              <el-radio-group v-model="reportForm.urgency">
                <el-radio-button label="normal">一般</el-radio-button>
                <el-radio-button label="urgent">紧急</el-radio-button>
                <el-radio-button label="critical">严重</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="事件详情" prop="details">
          <el-input
            type="textarea"
            :rows="4"
            v-model="reportForm.details"
            placeholder="请详细描述事件经过、症状表现、受伤情况等">
          </el-input>
        </el-form-item>

        <el-form-item label="已采取措施" prop="measures">
          <el-input
            type="textarea"
            :rows="3"
            v-model="reportForm.measures"
            placeholder="请描述已采取的应急处理措施">
          </el-input>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" icon="el-icon-upload2" @click="submitReport">立即上报</el-button>
          <el-button icon="el-icon-refresh" @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 上报记录列表 -->
    <div class="record-section">
      <div class="section-header">
        <h2>
          <i class="el-icon-document-copy"></i>
          上报记录
        </h2>
        <div class="section-actions">
          <el-select v-model="filterStatus" placeholder="处理状态" size="small" style="width: 120px; margin-right: 10px;">
            <el-option label="全部" value=""></el-option>
            <el-option label="待处理" value="pending"></el-option>
            <el-option label="处理中" value="processing"></el-option>
            <el-option label="已处理" value="resolved"></el-option>
          </el-select>
          <el-button type="primary" size="small" icon="el-icon-search" @click="filterRecords">筛选</el-button>
        </div>
      </div>

      <el-timeline>
        <el-timeline-item
          v-for="record in filteredRecords"
          :key="record.id"
          :type="getTimelineType(record.status)"
          :color="getTimelineColor(record.status)"
          :timestamp="formatDateTime(record.reportTime)">
          <el-card class="timeline-card">
            <div class="record-header">
              <div class="record-title">
                <el-tag :type="getTypeTag(record.incidentType)" size="small">{{ getTypeText(record.incidentType) }}</el-tag>
                <el-tag :type="getUrgencyTag(record.urgency)" size="small" style="margin-left: 8px;">{{ getUrgencyText(record.urgency) }}</el-tag>
                <span class="record-location">
                  <i class="el-icon-location"></i>{{ record.location }}
                </span>
              </div>
              <el-tag :type="getStatusTag(record.status)" effect="dark" size="small">{{ getStatusText(record.status) }}</el-tag>
            </div>
            <div class="record-content">
              <p><strong>涉及学生：</strong>{{ record.studentNames.join('、') }}</p>
              <p><strong>事件详情：</strong>{{ record.details }}</p>
              <p v-if="record.measures"><strong>已采取措施：</strong>{{ record.measures }}</p>
            </div>
            <div class="record-footer" v-if="record.status !== 'pending'">
              <p><strong>处理结果：</strong>{{ record.result || '暂无' }}</p>
              <p><strong>处理时间：</strong>{{ record.handleTime ? formatDateTime(record.handleTime) : '-' }}</p>
            </div>
            <div class="record-actions" v-if="record.status === 'pending'">
              <el-button type="primary" size="small" icon="el-icon-check" @click="handleProcess(record)">处理</el-button>
            </div>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </div>

    <!-- 处理对话框 -->
    <el-dialog title="事件处理" :visible.sync="processDialogVisible" width="500px">
      <el-form :model="processForm" label-width="100px">
        <el-form-item label="处理结果">
          <el-radio-group v-model="processForm.resultType">
            <el-radio label="resolved">已解决</el-radio>
            <el-radio label="processing">处理中</el-radio>
            <el-radio label="escalated">已上报</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="处理详情">
          <el-input
            type="textarea"
            :rows="4"
            v-model="processForm.result"
            placeholder="请详细描述处理结果">
          </el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="processDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmProcess">确认</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'IncidentReport',
  data() {
    return {
      reportForm: {
        incidentType: '',
        incidentTime: new Date(),
        location: '',
        students: [],
        urgency: 'normal',
        details: '',
        measures: ''
      },
      rules: {
        incidentType: [{ required: true, message: '请选择事件类型', trigger: 'change' }],
        incidentTime: [{ required: true, message: '请选择发生时间', trigger: 'change' }],
        location: [{ required: true, message: '请输入发生地点', trigger: 'blur' }],
        students: [{ required: true, message: '请选择涉及学生', trigger: 'change' }],
        details: [{ required: true, message: '请填写事件详情', trigger: 'blur' }]
      },
      studentList: [
        { id: 1, name: '张三' },
        { id: 2, name: '李四' },
        { id: 3, name: '王五' },
        { id: 4, name: '赵六' },
        { id: 5, name: '钱七' }
      ],
      incidentRecords: [
        {
          id: 1,
          incidentType: 'disease',
          incidentTime: '2024-01-15 09:30:00',
          location: '教室',
          students: [1],
          studentNames: ['张三'],
          urgency: 'urgent',
          details: '学生出现发热症状，体温38.5度，伴有咳嗽',
          measures: '已通知家长，学生已离校就医',
          status: 'processing',
          result: '已就医，确诊为普通感冒，建议休息3天',
          handleTime: '2024-01-15 10:00:00',
          reportTime: '2024-01-15 09:35:00'
        },
        {
          id: 2,
          incidentType: 'accident',
          incidentTime: '2024-01-14 14:20:00',
          location: '操场',
          students: [2],
          studentNames: ['李四'],
          urgency: 'normal',
          details: '体育课跑步时不慎摔倒，膝盖擦伤',
          measures: '已送至医务室进行伤口消毒处理',
          status: 'resolved',
          result: '伤口已处理，无大碍，可以继续上课',
          handleTime: '2024-01-14 14:40:00',
          reportTime: '2024-01-14 14:25:00'
        },
        {
          id: 3,
          incidentType: 'disease',
          incidentTime: '2024-01-15 08:00:00',
          location: '教室',
          students: [3],
          studentNames: ['王五'],
          urgency: 'normal',
          details: '学生反映肚子疼，伴有腹泻症状',
          measures: '已联系家长接回',
          status: 'pending',
          result: '',
          handleTime: null,
          reportTime: '2024-01-15 08:05:00'
        }
      ],
      filterStatus: '',
      processDialogVisible: false,
      currentRecord: null,
      processForm: {
        resultType: 'resolved',
        result: ''
      }
    };
  },
  computed: {
    diseaseCount() {
      return this.incidentRecords.filter(r => r.incidentType === 'disease').length;
    },
    accidentCount() {
      return this.incidentRecords.filter(r => r.incidentType === 'accident').length;
    },
    pendingCount() {
      return this.incidentRecords.filter(r => r.status === 'pending').length;
    },
    filteredRecords() {
      let records = this.incidentRecords;
      if (this.filterStatus) {
        records = records.filter(r => r.status === this.filterStatus);
      }
      return records.sort((a, b) => new Date(b.reportTime) - new Date(a.reportTime));
    }
  },
  methods: {
    submitReport() {
      this.$refs.reportForm.validate(valid => {
        if (valid) {
          const studentNames = this.reportForm.students.map(id => {
            const student = this.studentList.find(s => s.id === id);
            return student ? student.name : '';
          });
          const newRecord = {
            id: Date.now(),
            incidentType: this.reportForm.incidentType,
            incidentTime: this.reportForm.incidentTime.toISOString(),
            location: this.reportForm.location,
            students: this.reportForm.students,
            studentNames: studentNames,
            urgency: this.reportForm.urgency,
            details: this.reportForm.details,
            measures: this.reportForm.measures,
            status: 'pending',
            result: '',
            handleTime: null,
            reportTime: new Date().toISOString()
          };
          this.incidentRecords.unshift(newRecord);
          this.$message.success('事件上报成功！');
          this.resetForm();
        }
      });
    },
    resetForm() {
      this.$refs.reportForm.resetFields();
      this.reportForm.incidentTime = new Date();
    },
    filterRecords() {
      // 筛选逻辑已在计算属性中实现
    },
    handleProcess(record) {
      this.currentRecord = record;
      this.processForm = {
        resultType: 'resolved',
        result: ''
      };
      this.processDialogVisible = true;
    },
    confirmProcess() {
      if (this.currentRecord) {
        this.currentRecord.status = this.processForm.resultType;
        this.currentRecord.result = this.processForm.result;
        this.currentRecord.handleTime = new Date().toISOString();
        this.$message.success('处理完成！');
        this.processDialogVisible = false;
      }
    },
    formatDateTime(datetime) {
      if (!datetime) return '';
      const d = new Date(datetime);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    },
    getTypeTag(type) {
      const typeMap = {
        disease: 'danger',
        accident: 'warning',
        other: 'info'
      };
      return typeMap[type] || 'info';
    },
    getTypeText(type) {
      const typeMap = {
        disease: '传染病',
        accident: '意外伤害',
        other: '其他'
      };
      return typeMap[type] || type;
    },
    getUrgencyTag(urgency) {
      const urgencyMap = {
        normal: 'success',
        urgent: 'warning',
        critical: 'danger'
      };
      return urgencyMap[urgency] || 'info';
    },
    getUrgencyText(urgency) {
      const urgencyMap = {
        normal: '一般',
        urgent: '紧急',
        critical: '严重'
      };
      return urgencyMap[urgency] || urgency;
    },
    getStatusTag(status) {
      const statusMap = {
        pending: 'warning',
        processing: 'primary',
        resolved: 'success',
        escalated: 'danger'
      };
      return statusMap[status] || 'info';
    },
    getStatusText(status) {
      const statusMap = {
        pending: '待处理',
        processing: '处理中',
        resolved: '已处理',
        escalated: '已上报'
      };
      return statusMap[status] || status;
    },
    getTimelineType(status) {
      const typeMap = {
        pending: 'warning',
        processing: 'primary',
        resolved: 'success',
        escalated: 'danger'
      };
      return typeMap[status];
    },
    getTimelineColor(status) {
      const colorMap = {
        pending: '#E6A23C',
        processing: '#409EFF',
        resolved: '#67C23A',
        escalated: '#F56C6C'
      };
      return colorMap[status];
    }
  }
};
</script>

<style scoped>
.incident-report {
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
  color: #F56C6C;
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

.stats-icon.red {
  background: linear-gradient(135deg, #F56C6C 0%, #FF8E8E 100%);
}

.stats-icon.orange {
  background: linear-gradient(135deg, #E6A23C 0%, #F5C878 100%);
}

.stats-icon.blue {
  background: linear-gradient(135deg, #409EFF 0%, #6BCBFF 100%);
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
  color: #F56C6C;
}

.section-actions {
  display: flex;
  align-items: center;
}

/* 登记区块 */
.report-section,
.record-section {
  background: #fff;
  border-radius: 15px;
  padding: 25px;
  margin-bottom: 25px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

.report-form {
  margin-top: 20px;
}

/* 时间线卡片 */
.timeline-card {
  margin-bottom: 10px;
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.record-title {
  display: flex;
  align-items: center;
}

.record-location {
  margin-left: 15px;
  color: #666;
  font-size: 14px;
}

.record-location i {
  margin-right: 5px;
  color: #409EFF;
}

.record-content p {
  margin: 8px 0;
  color: #555;
  line-height: 1.6;
}

.record-footer {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px dashed #ddd;
  background: #f9f9f9;
  padding: 15px;
  border-radius: 8px;
}

.record-footer p {
  margin: 5px 0;
  color: #666;
}

.record-actions {
  margin-top: 15px;
  text-align: right;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .incident-report {
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
  }

  .record-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>
