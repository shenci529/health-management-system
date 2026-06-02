<template>
  <div class="absence-track">
    <el-card class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h2>缺勤追踪管理</h2>
          <p class="subtitle">管理学生请假、缺勤记录，支持流行病趋势分析</p>
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
          <el-button type="primary" icon="el-icon-plus" @click="handleAddLeave">请假登记</el-button>
          <el-button type="success" icon="el-icon-download" @click="handleExport">导出</el-button>
        </div>
      </div>
    </el-card>

    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-icon today-icon">
              <i class="el-icon-date"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.todayAbsent }}</div>
              <div class="stat-label">今日缺勤</div>
              <div class="stat-sub">请假: {{ stats.todayLeave }}人 | 病假: {{ stats.todaySick }}人</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-icon week-icon">
              <i class="el-icon-data-line"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.weekAbsent }}</div>
              <div class="stat-label">本周缺勤</div>
              <div class="stat-sub">较上周 {{ stats.weekChange > 0 ? '+' : '' }}{{ stats.weekChange }}%</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-icon disease-icon">
              <i class="el-icon-first-aid-kit"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.diseaseCount }}</div>
              <div class="stat-label">疑似传染病</div>
              <div class="stat-sub">需关注病例</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-icon rate-icon">
              <i class="el-icon-s-data"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.absentRate }}%</div>
              <div class="stat-label">缺勤率</div>
              <div class="stat-sub">本月平均</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="16">
        <el-card>
          <div slot="header">
            <span>缺勤记录列表</span>
            <el-radio-group v-model="listFilter" size="small" style="margin-left: 20px">
              <el-radio-button label="all">全部</el-radio-button>
              <el-radio-button label="leave">事假</el-radio-button>
              <el-radio-button label="sick">病假</el-radio-button>
              <el-radio-button label="absent">无故缺勤</el-radio-button>
            </el-radio-group>
          </div>
          <el-table :data="absenceList" stripe v-loading="loading" style="width: 100%">
            <el-table-column prop="studentName" label="学生姓名" width="100" />
            <el-table-column prop="studentNo" label="学号" width="100" />
            <el-table-column prop="gradeClass" label="班级" width="120" />
            <el-table-column prop="absenceDate" label="缺勤日期" width="120" />
            <el-table-column prop="type" label="类型" width="100">
              <template slot-scope="scope">
                <el-tag :type="getAbsenceTypeTag(scope.row.type)" size="mini">{{ scope.row.type }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="reason" label="原因/症状" min-width="150" show-overflow-tooltip />
            <el-table-column prop="days" label="天数" width="70" align="center" />
            <el-table-column prop="status" label="状态" width="100">
              <template slot-scope="scope">
                <el-tag :type="getStatusTag(scope.row.status)" size="mini">{{ scope.row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150" align="center">
              <template slot-scope="scope">
                <el-button type="text" size="mini" @click="handleViewDetail(scope.row)">详情</el-button>
                <el-button type="text" size="mini" @click="handleEdit(scope.row)">编辑</el-button>
                <el-button v-if="scope.row.status === '进行中'" type="text" size="mini" style="color: #67c23a" @click="handleReturn(scope.row)">销假</el-button>
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
      </el-col>

      <el-col :span="8">
        <el-card>
          <div slot="header">缺勤原因统计</div>
          <div ref="reasonChart" style="height: 250px"></div>
        </el-card>

        <el-card style="margin-top: 20px">
          <div slot="header">
            <span>流行病趋势预警</span>
            <el-tag v-if="epidemicAlert.level === 'high'" type="danger" size="mini" style="margin-left: 10px">高风险</el-tag>
            <el-tag v-else-if="epidemicAlert.level === 'medium'" type="warning" size="mini" style="margin-left: 10px">中风险</el-tag>
            <el-tag v-else type="success" size="mini" style="margin-left: 10px">正常</el-tag>
          </div>
          <div class="epidemic-content">
            <div v-for="(item, index) in epidemicAlert.diseases" :key="index" class="epidemic-item">
              <div class="disease-name">{{ item.name }}</div>
              <div class="disease-bar">
                <el-progress :percentage="item.rate" :color="getEpidemicColor(item.rate)" :stroke-width="12" />
              </div>
              <div class="disease-count">{{ item.count }}例</div>
            </div>
          </div>
          <div v-if="epidemicAlert.suggestions.length > 0" class="epidemic-suggestions">
            <p class="suggestion-title">防控建议：</p>
            <ul>
              <li v-for="(suggestion, index) in epidemicAlert.suggestions" :key="index">{{ suggestion }}</li>
            </ul>
          </div>
        </el-card>

        <el-card style="margin-top: 20px">
          <div slot="header">班级缺勤排行</div>
          <el-table :data="classRanking" stripe size="small">
            <el-table-column type="index" label="排名" width="60" align="center" />
            <el-table-column prop="className" label="班级" />
            <el-table-column prop="absentCount" label="缺勤人数" width="90" align="center" />
            <el-table-column prop="absentRate" label="缺勤率" width="90" align="center">
              <template slot-scope="scope">
                <el-tag :type="scope.row.absentRate > 10 ? 'danger' : scope.row.absentRate > 5 ? 'warning' : 'success'" size="mini">{{ scope.row.absentRate }}%</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- 请假登记对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="600px">
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
            <el-form-item label="缺勤类型" prop="type">
              <el-select v-model="form.type" placeholder="请选择类型" style="width: 100%">
                <el-option label="事假" value="事假" />
                <el-option label="病假" value="病假" />
                <el-option label="无故缺勤" value="无故缺勤" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="开始日期" prop="startDate">
              <el-date-picker v-model="form.startDate" type="date" placeholder="选择日期" style="width: 100%" value-format="yyyy-MM-dd" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结束日期" prop="endDate">
              <el-date-picker v-model="form.endDate" type="date" placeholder="选择日期" style="width: 100%" value-format="yyyy-MM-dd" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="缺勤原因" prop="reason">
          <el-input v-model="form.reason" placeholder="请详细描述缺勤原因或症状" />
        </el-form-item>
        <el-form-item label="症状描述" v-if="form.type === '病假'">
          <el-checkbox-group v-model="form.symptoms">
            <el-checkbox label="发热" />
            <el-checkbox label="咳嗽" />
            <el-checkbox label="腹泻" />
            <el-checkbox label="呕吐" />
            <el-checkbox label="皮疹" />
            <el-checkbox label="咽痛" />
            <el-checkbox label="头痛" />
            <el-checkbox label="其他" />
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="是否传染病" v-if="form.type === '病假'">
          <el-switch v-model="form.isInfectious" active-text="是" inactive-text="否" />
        </el-form-item>
        <el-form-item label="就医情况" v-if="form.type === '病假'">
          <el-radio-group v-model="form.medicalStatus">
            <el-radio label="未就医">未就医</el-radio>
            <el-radio label="校医务室">校医务室</el-radio>
            <el-radio label="医院就诊">医院就诊</el-radio>
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

    <!-- 详情对话框 -->
    <el-dialog title="缺勤详情" :visible.sync="detailVisible" width="600px">
      <div v-if="currentRecord" class="detail-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="学生姓名">{{ currentRecord.studentName }}</el-descriptions-item>
          <el-descriptions-item label="学号">{{ currentRecord.studentNo }}</el-descriptions-item>
          <el-descriptions-item label="班级">{{ currentRecord.gradeClass }}</el-descriptions-item>
          <el-descriptions-item label="缺勤类型">
            <el-tag :type="getAbsenceTypeTag(currentRecord.type)" size="mini">{{ currentRecord.type }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="缺勤日期">{{ currentRecord.absenceDate }}</el-descriptions-item>
          <el-descriptions-item label="天数">{{ currentRecord.days }}天</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusTag(currentRecord.status)" size="mini">{{ currentRecord.status }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="登记时间">{{ currentRecord.createTime }}</el-descriptions-item>
        </el-descriptions>

        <div class="detail-section" v-if="currentRecord.symptoms && currentRecord.symptoms.length > 0">
          <h4>症状</h4>
          <div class="symptom-tags">
            <el-tag v-for="(symptom, index) in currentRecord.symptoms" :key="index" size="small" style="margin-right: 8px; margin-bottom: 5px">{{ symptom }}</el-tag>
          </div>
        </div>

        <div class="detail-section">
          <h4>原因/症状描述</h4>
          <p class="detail-text">{{ currentRecord.reason }}</p>
        </div>

        <div class="detail-section" v-if="currentRecord.medicalStatus">
          <h4>就医情况</h4>
          <p class="detail-text">{{ currentRecord.medicalStatus }}</p>
        </div>

        <div class="detail-section" v-if="currentRecord.remark">
          <h4>备注</h4>
          <p class="detail-text">{{ currentRecord.remark }}</p>
        </div>

        <el-timeline style="margin-top: 20px">
          <el-timeline-item
            v-for="(log, index) in currentRecord.logs"
            :key="index"
            :timestamp="log.time"
            :type="log.type"
          >
            {{ log.content }}
          </el-timeline-item>
        </el-timeline>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'AbsenceTrack',
  data() {
    return {
      loading: false,
      dateRange: [],
      listFilter: 'all',
      currentPage: 1,
      pageSize: 10,
      total: 100,
      stats: {
        todayAbsent: 12,
        todayLeave: 5,
        todaySick: 7,
        weekAbsent: 68,
        weekChange: -5.2,
        diseaseCount: 3,
        absentRate: 3.2
      },
      absenceList: [
        {
          id: '1',
          studentName: '小明',
          studentNo: '2024001',
          gradeClass: '一年级1班',
          absenceDate: '2024-01-15',
          type: '病假',
          reason: '感冒发烧，体温38.5度',
          days: 2,
          status: '进行中',
          symptoms: ['发热', '咳嗽'],
          isInfectious: false,
          medicalStatus: '校医务室',
          remark: '已服药，建议休息',
          createTime: '2024-01-15 08:30',
          logs: [
            { time: '2024-01-15 08:30', content: '家长电话请假，登记病假', type: 'primary' },
            { time: '2024-01-15 09:00', content: '校医确认症状，建议居家休息', type: 'success' }
          ]
        },
        {
          id: '2',
          studentName: '小红',
          studentNo: '2024002',
          gradeClass: '一年级1班',
          absenceDate: '2024-01-15',
          type: '事假',
          reason: '家中有事',
          days: 1,
          status: '已销假',
          createTime: '2024-01-15 07:50',
          logs: [
            { time: '2024-01-15 07:50', content: '家长电话请假，登记事假', type: 'primary' },
            { time: '2024-01-15 16:30', content: '学生返校，办理销假', type: 'success' }
          ]
        },
        {
          id: '3',
          studentName: '小刚',
          studentNo: '2024003',
          gradeClass: '一年级2班',
          absenceDate: '2024-01-14',
          type: '病假',
          reason: '急性肠胃炎，腹泻呕吐',
          days: 3,
          status: '进行中',
          symptoms: ['腹泻', '呕吐'],
          isInfectious: false,
          medicalStatus: '医院就诊',
          remark: '已就医，开具病假证明',
          createTime: '2024-01-14 07:00',
          logs: [
            { time: '2024-01-14 07:00', content: '家长电话请假，登记病假', type: 'primary' },
            { time: '2024-01-14 10:00', content: '家长提交医院诊断证明', type: 'success' }
          ]
        }
      ],
      epidemicAlert: {
        level: 'medium',
        diseases: [
          { name: '流感', count: 12, rate: 60 },
          { name: '诺如病毒', count: 5, rate: 25 },
          { name: '水痘', count: 3, rate: 15 }
        ],
        suggestions: [
          '加强教室通风消毒',
          '提醒学生勤洗手、戴口罩',
          '建议易感人群接种流感疫苗'
        ]
      },
      classRanking: [
        { className: '一年级3班', absentCount: 8, absentRate: 17.8 },
        { className: '一年级1班', absentCount: 5, absentRate: 11.1 },
        { className: '一年级2班', absentCount: 3, absentRate: 6.5 },
        { className: '二年级1班', absentCount: 2, absentRate: 4.3 }
      ],
      dialogVisible: false,
      dialogTitle: '请假登记',
      form: {
        studentId: '',
        type: '',
        startDate: '',
        endDate: '',
        reason: '',
        symptoms: [],
        isInfectious: false,
        medicalStatus: '未就医',
        remark: ''
      },
      rules: {
        studentId: [{ required: true, message: '请选择学生', trigger: 'change' }],
        type: [{ required: true, message: '请选择缺勤类型', trigger: 'change' }],
        startDate: [{ required: true, message: '请选择开始日期', trigger: 'change' }],
        endDate: [{ required: true, message: '请选择结束日期', trigger: 'change' }],
        reason: [{ required: true, message: '请输入缺勤原因', trigger: 'blur' }]
      },
      studentList: [
        { id: '1', name: '小明', studentNo: '2024001' },
        { id: '2', name: '小红', studentNo: '2024002' },
        { id: '3', name: '小刚', studentNo: '2024003' }
      ],
      detailVisible: false,
      currentRecord: null
    }
  },
  methods: {
    handleSizeChange(val) {
      this.pageSize = val
    },
    handleCurrentChange(val) {
      this.currentPage = val
    },
    handleAddLeave() {
      this.dialogTitle = '请假登记'
      this.form = {
        studentId: '',
        type: '',
        startDate: '',
        endDate: '',
        reason: '',
        symptoms: [],
        isInfectious: false,
        medicalStatus: '未就医',
        remark: ''
      }
      this.dialogVisible = true
    },
    handleEdit(row) {
      this.dialogTitle = '编辑请假记录'
      this.form = {
        studentId: row.id,
        type: row.type,
        startDate: row.absenceDate,
        endDate: row.absenceDate,
        reason: row.reason,
        symptoms: row.symptoms || [],
        isInfectious: row.isInfectious || false,
        medicalStatus: row.medicalStatus || '未就医',
        remark: row.remark || ''
      }
      this.dialogVisible = true
    },
    handleViewDetail(row) {
      this.currentRecord = row
      this.detailVisible = true
    },
    handleReturn(row) {
      this.$confirm(`确定为 ${row.studentName} 办理销假吗？`, '提示', { type: 'warning' }).then(() => {
        this.$message.success('销假成功')
      })
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.$message.success('保存成功')
          this.dialogVisible = false
        }
      })
    },
    handleExport() {
      this.$message.success('导出成功')
    },
    getAbsenceTypeTag(type) {
      const map = { '事假': 'primary', '病假': 'danger', '无故缺勤': 'warning' }
      return map[type] || ''
    },
    getStatusTag(status) {
      const map = { '进行中': 'warning', '已销假': 'success', '已过期': 'info' }
      return map[status] || ''
    },
    getEpidemicColor(rate) {
      if (rate >= 50) return '#F56C6C'
      if (rate >= 25) return '#E6A23C'
      return '#67C23A'
    }
  }
}
</script>

<style scoped>
.absence-track {
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
.today-icon {
  background: #f0f9ff;
  color: #409eff;
}
.week-icon {
  background: #f5f0ff;
  color: #9254de;
}
.disease-icon {
  background: #fff2f0;
  color: #ff4d4f;
}
.rate-icon {
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
.pagination-wrapper {
  margin-top: 20px;
  text-align: right;
}
.epidemic-content {
  padding: 10px 0;
}
.epidemic-item {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}
.disease-name {
  width: 80px;
  font-size: 14px;
  color: #606266;
}
.disease-bar {
  flex: 1;
  margin: 0 10px;
}
.disease-count {
  width: 50px;
  text-align: right;
  font-size: 14px;
  color: #909399;
}
.epidemic-suggestions {
  margin-top: 20px;
  padding: 15px;
  background: #fffbe6;
  border: 1px solid #ffe58f;
  border-radius: 4px;
}
.suggestion-title {
  font-weight: bold;
  color: #d48806;
  margin-bottom: 8px;
}
.epidemic-suggestions ul {
  margin: 0;
  padding-left: 20px;
  color: #ad6800;
}
.epidemic-suggestions li {
  margin-bottom: 5px;
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
.symptom-tags {
  padding: 5px 0;
}
</style>
