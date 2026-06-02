<template>
  <div class="accident-report">
    <el-card class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h2>意外伤害上报</h2>
          <p class="subtitle">管理校园意外伤害事件，支持事件登记、处理流程跟踪</p>
        </div>
        <div class="header-actions">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="margin-right: 10px"
          />
          <el-button type="primary" icon="el-icon-plus" @click="handleAddReport">上报事件</el-button>
          <el-button type="success" icon="el-icon-download" @click="handleExport">导出</el-button>
        </div>
      </div>
    </el-card>

    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-icon total-icon">
              <i class="el-icon-document"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalCount }}</div>
              <div class="stat-label">本月事件</div>
              <div class="stat-sub">较上月 {{ stats.monthChange > 0 ? '+' : '' }}{{ stats.monthChange }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-icon processing-icon">
              <i class="el-icon-time"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.processingCount }}</div>
              <div class="stat-label">处理中</div>
              <div class="stat-sub">待跟进</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-icon serious-icon">
              <i class="el-icon-warning"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.seriousCount }}</div>
              <div class="stat-label">严重伤害</div>
              <div class="stat-sub">需重点关注</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-icon resolved-icon">
              <i class="el-icon-check"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.resolvedCount }}</div>
              <div class="stat-label">已处理</div>
              <div class="stat-sub">本月完成</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="table-card">
      <div slot="header">
        <span>伤害事件列表</span>
        <el-radio-group v-model="listFilter" size="small" style="margin-left: 20px">
          <el-radio-button label="all">全部</el-radio-button>
          <el-radio-button label="processing">处理中</el-radio-button>
          <el-radio-button label="resolved">已处理</el-radio-button>
          <el-radio-button label="serious">严重伤害</el-radio-button>
        </el-radio-group>
      </div>
      <el-table :data="accidentList" stripe v-loading="loading" style="width: 100%">
        <el-table-column prop="reportNo" label="事件编号" width="120" />
        <el-table-column prop="studentName" label="学生姓名" width="100" />
        <el-table-column prop="gradeClass" label="班级" width="100" />
        <el-table-column prop="accidentTime" label="发生时间" width="150" />
        <el-table-column prop="location" label="发生地点" width="120" />
        <el-table-column prop="injuryType" label="伤害类型" width="100">
          <template slot-scope="scope">
            <el-tag :type="getInjuryTypeTag(scope.row.injuryType)" size="mini">{{ scope.row.injuryType }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="severity" label="严重程度" width="100">
          <template slot-scope="scope">
            <el-tag :type="getSeverityTag(scope.row.severity)" size="mini">{{ scope.row.severity }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="处理状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="getStatusTag(scope.row.status)" size="mini">{{ scope.row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="reporter" label="报告人" width="100" />
        <el-table-column prop="reportTime" label="报告时间" width="150" />
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" size="mini" @click="handleViewDetail(scope.row)">详情</el-button>
            <el-button type="text" size="mini" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button v-if="scope.row.status !== '已结案'" type="text" size="mini" style="color: #67c23a" @click="handleProcess(scope.row)">处理</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-wrapper">
        <el-pagination
          background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
        />
      </div>
    </el-card>

    <!-- 上报事件对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="700px">
      <el-form :model="form" :rules="rules" ref="form" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="学生" prop="studentId">
              <el-select v-model="form.studentId" placeholder="请选择学生" style="width: 100%" filterable>
                <el-option v-for="student in studentList" :key="student.id" :label="student.name + ' (' + student.studentNo + ')'" :value="student.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="发生时间" prop="accidentTime">
              <el-date-picker v-model="form.accidentTime" type="datetime" placeholder="选择时间" style="width: 100%" value-format="yyyy-MM-dd HH:mm" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="发生地点" prop="location">
              <el-select v-model="form.location" placeholder="请选择地点" style="width: 100%">
                <el-option label="教室" value="教室" />
                <el-option label="操场" value="操场" />
                <el-option label="走廊" value="走廊" />
                <el-option label="楼梯" value="楼梯" />
                <el-option label="食堂" value="食堂" />
                <el-option label="卫生间" value="卫生间" />
                <el-option label="医务室" value="医务室" />
                <el-option label="其他" value="其他" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="伤害类型" prop="injuryType">
              <el-select v-model="form.injuryType" placeholder="请选择类型" style="width: 100%">
                <el-option label="跌倒" value="跌倒" />
                <el-option label="碰撞" value="碰撞" />
                <el-option label="擦伤" value="擦伤" />
                <el-option label="扭伤" value="扭伤" />
                <el-option label="骨折" value="骨折" />
                <el-option label="烫伤" value="烫伤" />
                <el-option label="其他" value="其他" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="严重程度" prop="severity">
          <el-radio-group v-model="form.severity">
            <el-radio-button label="轻微">轻微</el-radio-button>
            <el-radio-button label="一般">一般</el-radio-button>
            <el-radio-button label="严重">严重</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="事件经过" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请详细描述事件经过" />
        </el-form-item>
        <el-form-item label="受伤部位">
          <el-checkbox-group v-model="form.injuryParts">
            <el-checkbox label="头部" />
            <el-checkbox label="面部" />
            <el-checkbox label="手臂" />
            <el-checkbox label="腿部" />
            <el-checkbox label="躯干" />
            <el-checkbox label="其他" />
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="处理措施" prop="treatment">
          <el-input v-model="form.treatment" type="textarea" :rows="2" placeholder="已采取的处理措施" />
        </el-form-item>
        <el-form-item label="就医情况">
          <el-radio-group v-model="form.medicalStatus">
            <el-radio label="未就医">未就医</el-radio>
            <el-radio label="校医务室处理">校医务室处理</el-radio>
            <el-radio label="送医院就诊">送医院就诊</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="其他需要说明的情况" />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </div>
    </el-dialog>

    <!-- 详情/处理对话框 -->
    <el-dialog title="事件详情" :visible.sync="detailVisible" width="800px">
      <div v-if="currentRecord" class="detail-content">
        <el-steps :active="getProcessStep(currentRecord.status)" finish-status="success" simple>
          <el-step title="事件上报" />
          <el-step title="初步处理" />
          <el-step title="跟进观察" />
          <el-step title="结案归档" />
        </el-steps>

        <el-descriptions :column="2" border style="margin-top: 20px">
          <el-descriptions-item label="事件编号">{{ currentRecord.reportNo }}</el-descriptions-item>
          <el-descriptions-item label="报告时间">{{ currentRecord.reportTime }}</el-descriptions-item>
          <el-descriptions-item label="学生姓名">{{ currentRecord.studentName }}</el-descriptions-item>
          <el-descriptions-item label="班级">{{ currentRecord.gradeClass }}</el-descriptions-item>
          <el-descriptions-item label="发生时间">{{ currentRecord.accidentTime }}</el-descriptions-item>
          <el-descriptions-item label="发生地点">{{ currentRecord.location }}</el-descriptions-item>
          <el-descriptions-item label="伤害类型">
            <el-tag :type="getInjuryTypeTag(currentRecord.injuryType)" size="mini">{{ currentRecord.injuryType }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="严重程度">
            <el-tag :type="getSeverityTag(currentRecord.severity)" size="mini">{{ currentRecord.severity }}</el-tag>
          </el-descriptions-item>
        </el-descriptions>

        <div class="detail-section">
          <h4>事件经过</h4>
          <p class="detail-text">{{ currentRecord.description }}</p>
        </div>

        <div class="detail-section">
          <h4>处理记录</h4>
          <el-timeline>
            <el-timeline-item
              v-for="(log, index) in currentRecord.processLogs"
              :key="index"
              :timestamp="log.time"
              :type="log.type"
            >
              <p><strong>{{ log.operator }}</strong> {{ log.action }}</p>
              <p v-if="log.content" class="log-content">{{ log.content }}</p>
            </el-timeline-item>
          </el-timeline>
        </div>

        <div v-if="currentRecord.status !== '已结案'" class="process-form">
          <el-divider content-position="left">添加处理记录</el-divider>
          <el-form :model="processForm" label-width="100px">
            <el-form-item label="处理动作">
              <el-select v-model="processForm.action" placeholder="请选择处理动作" style="width: 100%">
                <el-option label="初步处理" value="初步处理" />
                <el-option label="送医治疗" value="送医治疗" />
                <el-option label="家长沟通" value="家长沟通" />
                <el-option label="跟进观察" value="跟进观察" />
                <el-option label="结案归档" value="结案归档" />
              </el-select>
            </el-form-item>
            <el-form-item label="处理内容">
              <el-input v-model="processForm.content" type="textarea" :rows="2" placeholder="请输入处理内容" />
            </el-form-item>
          </el-form>
        </div>
      </div>
      <div slot="footer">
        <el-button @click="detailVisible = false">关闭</el-button>
        <el-button v-if="currentRecord && currentRecord.status !== '已结案'" type="primary" @click="submitProcess">提交处理</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'AccidentReport',
  data() {
    return {
      loading: false,
      dateRange: [],
      listFilter: 'all',
      currentPage: 1,
      pageSize: 10,
      total: 100,
      stats: {
        totalCount: 28,
        monthChange: -3,
        processingCount: 5,
        seriousCount: 2,
        resolvedCount: 23
      },
      accidentList: [
        {
          id: '1',
          reportNo: 'ACC20240115001',
          studentName: '小明',
          gradeClass: '一年级1班',
          accidentTime: '2024-01-15 10:30',
          location: '操场',
          injuryType: '跌倒',
          severity: '轻微',
          status: '已结案',
          reporter: '王老师',
          reportTime: '2024-01-15 10:35',
          description: '体育课上跑步时不慎摔倒，膝盖擦伤',
          injuryParts: ['腿部'],
          treatment: '校医室消毒包扎',
          medicalStatus: '校医务室处理',
          processLogs: [
            { time: '2024-01-15 10:35', operator: '王老师', action: '上报事件', type: 'primary', content: '' },
            { time: '2024-01-15 10:40', operator: '李医生', action: '初步处理', type: 'success', content: '消毒包扎，建议观察' },
            { time: '2024-01-15 16:30', operator: '王老师', action: '结案归档', type: 'success', content: '学生恢复良好，家长已知晓' }
          ]
        },
        {
          id: '2',
          reportNo: 'ACC20240114002',
          studentName: '小红',
          gradeClass: '一年级2班',
          accidentTime: '2024-01-14 14:20',
          location: '楼梯',
          injuryType: '碰撞',
          severity: '一般',
          status: '处理中',
          reporter: '张老师',
          reportTime: '2024-01-14 14:25',
          description: '下楼梯时被同学碰撞，手臂擦伤',
          injuryParts: ['手臂'],
          treatment: '校医室清洗伤口',
          medicalStatus: '校医务室处理',
          processLogs: [
            { time: '2024-01-14 14:25', operator: '张老师', action: '上报事件', type: 'primary', content: '' },
            { time: '2024-01-14 14:30', operator: '李医生', action: '初步处理', type: 'success', content: '清洗消毒，建议观察' }
          ]
        }
      ],
      dialogVisible: false,
      dialogTitle: '上报事件',
      form: {
        studentId: '',
        accidentTime: '',
        location: '',
        injuryType: '',
        severity: '轻微',
        description: '',
        injuryParts: [],
        treatment: '',
        medicalStatus: '未就医',
        remark: ''
      },
      rules: {
        studentId: [{ required: true, message: '请选择学生', trigger: 'change' }],
        accidentTime: [{ required: true, message: '请选择发生时间', trigger: 'change' }],
        location: [{ required: true, message: '请选择发生地点', trigger: 'change' }],
        injuryType: [{ required: true, message: '请选择伤害类型', trigger: 'change' }],
        severity: [{ required: true, message: '请选择严重程度', trigger: 'change' }],
        description: [{ required: true, message: '请输入事件经过', trigger: 'blur' }],
        treatment: [{ required: true, message: '请输入处理措施', trigger: 'blur' }]
      },
      studentList: [
        { id: '1', name: '小明', studentNo: '2024001' },
        { id: '2', name: '小红', studentNo: '2024002' },
        { id: '3', name: '小刚', studentNo: '2024003' }
      ],
      detailVisible: false,
      currentRecord: null,
      processForm: {
        action: '',
        content: ''
      }
    }
  },
  methods: {
    handleSizeChange(val) {
      this.pageSize = val
    },
    handleCurrentChange(val) {
      this.currentPage = val
    },
    handleAddReport() {
      this.dialogTitle = '上报事件'
      this.form = {
        studentId: '',
        accidentTime: '',
        location: '',
        injuryType: '',
        severity: '轻微',
        description: '',
        injuryParts: [],
        treatment: '',
        medicalStatus: '未就医',
        remark: ''
      }
      this.dialogVisible = true
    },
    handleEdit(row) {
      this.dialogTitle = '编辑事件'
      this.form = { ...row, studentId: row.id }
      this.dialogVisible = true
    },
    handleViewDetail(row) {
      this.currentRecord = row
      this.processForm = { action: '', content: '' }
      this.detailVisible = true
    },
    handleProcess(row) {
      this.handleViewDetail(row)
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.$message.success('保存成功')
          this.dialogVisible = false
        }
      })
    },
    submitProcess() {
      this.$message.success('处理记录已添加')
      this.detailVisible = false
    },
    handleExport() {
      this.$message.success('导出成功')
    },
    getInjuryTypeTag(type) {
      const map = { '跌倒': 'info', '碰撞': 'warning', '擦伤': 'info', '扭伤': 'warning', '骨折': 'danger', '烫伤': 'danger', '其他': '' }
      return map[type] || ''
    },
    getSeverityTag(severity) {
      const map = { '轻微': 'success', '一般': 'warning', '严重': 'danger' }
      return map[severity] || ''
    },
    getStatusTag(status) {
      const map = { '处理中': 'warning', '已结案': 'success' }
      return map[status] || ''
    },
    getProcessStep(status) {
      const map = { '处理中': 2, '已结案': 4 }
      return map[status] || 1
    }
  }
}
</script>

<style scoped>
.accident-report {
  padding: 20px;
}
.page-header {
  margin-bottom: 20px;
}
.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.title-section h2 {
  margin: 0 0 8px 0;
  font-size: 20px;
  color: #303133;
}
.subtitle {
  margin: 0;
  color: #909399;
  font-size: 14px;
}
.header-actions {
  display: flex;
  align-items: center;
}
.stat-card {
  margin-bottom: 20px;
}
.stat-item {
  display: flex;
  align-items: center;
}
.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  margin-right: 15px;
}
.total-icon {
  background: #f0f9ff;
  color: #409eff;
}
.processing-icon {
  background: #fffbe6;
  color: #faad14;
}
.serious-icon {
  background: #fff2f0;
  color: #ff4d4f;
}
.resolved-icon {
  background: #f6ffed;
  color: #52c41a;
}
.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}
.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}
.stat-sub {
  font-size: 12px;
  color: #606266;
  margin-top: 2px;
}
.table-card {
  margin-top: 0;
}
.pagination-wrapper {
  margin-top: 20px;
  text-align: right;
}
.detail-content {
  padding: 10px;
}
.detail-section {
  margin-top: 20px;
}
.detail-section h4 {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #606266;
}
.detail-text {
  color: #303133;
  line-height: 1.6;
  padding: 10px;
  background: #f5f7fa;
  border-radius: 4px;
}
.log-content {
  color: #606266;
  margin-top: 5px;
}
.process-form {
  margin-top: 20px;
}
</style>