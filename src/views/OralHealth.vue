<template>
  <div class="oral-health">
    <el-card class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h2>口腔健康档案</h2>
          <p class="subtitle">管理学生口腔健康检查记录，包括龋齿、涂氟、窝沟封闭等</p>
        </div>
        <div class="header-actions">
          <el-input
            v-model="searchQuery"
            placeholder="搜索学生姓名/学号"
            prefix-icon="el-icon-search"
            style="width: 250px; margin-right: 10px"
          />
          <el-button type="primary" icon="el-icon-plus" @click="handleAddRecord">新增检查记录</el-button>
          <el-button type="success" icon="el-icon-download" @click="handleExport">导出</el-button>
        </div>
      </div>
    </el-card>

    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-icon decay-icon">
              <i class="el-icon-tooth"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.decayRate }}%</div>
              <div class="stat-label">龋齿患病率</div>
              <div class="stat-sub">{{ stats.decayCount }}人</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-icon fluoride-icon">
              <i class="el-icon-magic-stick"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.fluorideRate }}%</div>
              <div class="stat-label">涂氟覆盖率</div>
              <div class="stat-sub">{{ stats.fluorideCount }}人</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-icon sealant-icon">
              <i class="el-icon-circle-check"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.sealantRate }}%</div>
              <div class="stat-label">窝沟封闭率</div>
              <div class="stat-sub">{{ stats.sealantCount }}人</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-icon check-icon">
              <i class="el-icon-first-aid-kit"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.checkRate }}%</div>
              <div class="stat-label">检查覆盖率</div>
              <div class="stat-sub">{{ stats.checkCount }}人</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="table-card">
      <el-tabs v-model="activeTab" @tab-click="handleTabClick">
        <el-tab-pane label="口腔档案总览" name="overview">
          <el-table :data="oralRecords" stripe v-loading="loading" style="width: 100%">
            <el-table-column prop="studentName" label="学生姓名" width="100">
              <template slot-scope="scope">
                <el-link type="primary" @click="handleViewDetail(scope.row)">{{ scope.row.studentName }}</el-link>
              </template>
            </el-table-column>
            <el-table-column prop="studentNo" label="学号" width="120" />
            <el-table-column prop="gradeClass" label="班级" width="120" />
            <el-table-column prop="age" label="年龄" width="70" align="center" />
            <el-table-column label="乳牙情况" min-width="150">
              <template slot-scope="scope">
                <el-tag v-if="scope.row.primaryTeeth.decay > 0" type="danger" size="mini" style="margin-right: 5px">龋{{ scope.row.primaryTeeth.decay }}颗</el-tag>
                <el-tag v-if="scope.row.primaryTeeth.filled > 0" type="warning" size="mini" style="margin-right: 5px">充{{ scope.row.primaryTeeth.filled }}颗</el-tag>
                <span v-if="scope.row.primaryTeeth.decay === 0 && scope.row.primaryTeeth.filled === 0" class="healthy-text">健康</span>
              </template>
            </el-table-column>
            <el-table-column label="恒牙情况" min-width="150">
              <template slot-scope="scope">
                <el-tag v-if="scope.row.permanentTeeth.decay > 0" type="danger" size="mini" style="margin-right: 5px">龋{{ scope.row.permanentTeeth.decay }}颗</el-tag>
                <el-tag v-if="scope.row.permanentTeeth.filled > 0" type="warning" size="mini" style="margin-right: 5px">充{{ scope.row.permanentTeeth.filled }}颗</el-tag>
                <span v-if="scope.row.permanentTeeth.decay === 0 && scope.row.permanentTeeth.filled === 0" class="healthy-text">健康</span>
              </template>
            </el-table-column>
            <el-table-column label="涂氟记录" width="100" align="center">
              <template slot-scope="scope">
                <el-tag v-if="scope.row.fluoride.count > 0" type="success" size="mini">{{ scope.row.fluoride.count }}次</el-tag>
                <span v-else class="empty-text">-</span>
              </template>
            </el-table-column>
            <el-table-column label="窝沟封闭" width="100" align="center">
              <template slot-scope="scope">
                <el-tag v-if="scope.row.sealant.count > 0" type="success" size="mini">{{ scope.row.sealant.count }}颗</el-tag>
                <span v-else class="empty-text">-</span>
              </template>
            </el-table-column>
            <el-table-column prop="lastCheckDate" label="最近检查" width="120" />
            <el-table-column label="操作" width="150" align="center" fixed="right">
              <template slot-scope="scope">
                <el-button type="text" size="mini" @click="handleEdit(scope.row)">编辑</el-button>
                <el-button type="text" size="mini" @click="handleViewDetail(scope.row)">详情</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="龋齿记录" name="decay">
          <el-table :data="decayRecords" stripe style="width: 100%">
            <el-table-column prop="studentName" label="学生姓名" width="100" />
            <el-table-column prop="studentNo" label="学号" width="120" />
            <el-table-column prop="gradeClass" label="班级" width="120" />
            <el-table-column label="牙齿类型" width="100">
              <template slot-scope="scope">
                <el-tag :type="scope.row.toothType === '乳牙' ? 'info' : 'primary'" size="mini">{{ scope.row.toothType }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="toothPosition" label="牙位" width="80" />
            <el-table-column prop="decayType" label="龋坏类型" width="120" />
            <el-table-column prop="decayDegree" label="龋坏程度" width="100">
              <template slot-scope="scope">
                <el-tag :type="getDecayDegreeTag(scope.row.decayDegree)" size="mini">{{ scope.row.decayDegree }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="treatment" label="治疗情况" min-width="150" />
            <el-table-column prop="checkDate" label="检查日期" width="120" />
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="涂氟记录" name="fluoride">
          <el-table :data="fluorideRecords" stripe style="width: 100%">
            <el-table-column prop="studentName" label="学生姓名" width="100" />
            <el-table-column prop="studentNo" label="学号" width="120" />
            <el-table-column prop="gradeClass" label="班级" width="120" />
            <el-table-column prop="fluorideDate" label="涂氟日期" width="120" />
            <el-table-column prop="fluorideType" label="涂氟类型" width="120" />
            <el-table-column prop="operator" label="操作人" width="100" />
            <el-table-column prop="nextDate" label="下次建议日期" width="120" />
            <el-table-column prop="remark" label="备注" min-width="200" />
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="窝沟封闭" name="sealant">
          <el-table :data="sealantRecords" stripe style="width: 100%">
            <el-table-column prop="studentName" label="学生姓名" width="100" />
            <el-table-column prop="studentNo" label="学号" width="120" />
            <el-table-column prop="gradeClass" label="班级" width="120" />
            <el-table-column prop="toothPosition" label="牙位" width="80" />
            <el-table-column prop="sealantDate" label="封闭日期" width="120" />
            <el-table-column prop="sealantStatus" label="封闭状态" width="100">
              <template slot-scope="scope">
                <el-tag :type="scope.row.sealantStatus === '完好' ? 'success' : 'warning'" size="mini">{{ scope.row.sealantStatus }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="operator" label="操作人" width="100" />
            <el-table-column prop="checkDate" label="复查日期" width="120" />
          </el-table>
        </el-tab-pane>
      </el-tabs>
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

    <!-- 新增/编辑检查记录对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="800px">
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
            <el-form-item label="检查日期" prop="checkDate">
              <el-date-picker v-model="form.checkDate" type="date" placeholder="选择日期" style="width: 100%" value-format="yyyy-MM-dd" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">乳牙情况</el-divider>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="龋齿颗数">
              <el-input-number v-model="form.primaryDecay" :min="0" :max="20" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="充填颗数">
              <el-input-number v-model="form.primaryFilled" :min="0" :max="20" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="缺失颗数">
              <el-input-number v-model="form.primaryMissing" :min="0" :max="20" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">恒牙情况</el-divider>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="龋齿颗数">
              <el-input-number v-model="form.permanentDecay" :min="0" :max="32" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="充填颗数">
              <el-input-number v-model="form.permanentFilled" :min="0" :max="32" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="缺失颗数">
              <el-input-number v-model="form.permanentMissing" :min="0" :max="32" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">牙周情况</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="牙龈状况">
              <el-select v-model="form.gumStatus" placeholder="请选择" style="width: 100%">
                <el-option label="健康" value="健康" />
                <el-option label="轻度炎症" value="轻度炎症" />
                <el-option label="中度炎症" value="中度炎症" />
                <el-option label="重度炎症" value="重度炎症" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="牙结石">
              <el-select v-model="form.calculus" placeholder="请选择" style="width: 100%">
                <el-option label="无" value="无" />
                <el-option label="轻度" value="轻度" />
                <el-option label="中度" value="中度" />
                <el-option label="重度" value="重度" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">错颌畸形</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="是否有畸形">
              <el-switch v-model="form.hasMalocclusion" active-text="是" inactive-text="否" />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.hasMalocclusion">
            <el-form-item label="畸形类型">
              <el-input v-model="form.malocclusionType" placeholder="如：牙列拥挤、反颌等" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="口腔卫生" prop="oralHygiene">
          <el-rate v-model="form.oralHygiene" :max="5" show-score />
        </el-form-item>

        <el-form-item label="医生建议">
          <el-input v-model="form.suggestion" type="textarea" :rows="3" placeholder="请输入医生建议" />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </div>
    </el-dialog>

    <!-- 详情对话框 -->
    <el-dialog title="口腔健康详情" :visible.sync="detailVisible" width="700px">
      <div v-if="currentRecord" class="detail-content">
        <div class="detail-header">
          <div class="student-info">
            <h3>{{ currentRecord.studentName }}</h3>
            <p>{{ currentRecord.studentNo }} | {{ currentRecord.gradeClass }} | {{ currentRecord.age }}岁</p>
          </div>
          <el-tag v-if="currentRecord.primaryTeeth.decay === 0 && currentRecord.permanentTeeth.decay === 0" type="success">口腔健康</el-tag>
          <el-tag v-else type="warning">需关注</el-tag>
        </div>

        <el-divider content-position="left">牙齿健康情况</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-card class="teeth-card">
              <div slot="header">乳牙（20颗）</div>
              <div class="teeth-stats">
                <div class="stat-row">
                  <span class="stat-label">龋齿：</span>
                  <span class="stat-value" :class="{ 'danger': currentRecord.primaryTeeth.decay > 0 }">{{ currentRecord.primaryTeeth.decay }}颗</span>
                </div>
                <div class="stat-row">
                  <span class="stat-label">充填：</span>
                  <span class="stat-value">{{ currentRecord.primaryTeeth.filled }}颗</span>
                </div>
                <div class="stat-row">
                  <span class="stat-label">缺失：</span>
                  <span class="stat-value">{{ currentRecord.primaryTeeth.missing }}颗</span>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card class="teeth-card">
              <div slot="header">恒牙（32颗）</div>
              <div class="teeth-stats">
                <div class="stat-row">
                  <span class="stat-label">龋齿：</span>
                  <span class="stat-value" :class="{ 'danger': currentRecord.permanentTeeth.decay > 0 }">{{ currentRecord.permanentTeeth.decay }}颗</span>
                </div>
                <div class="stat-row">
                  <span class="stat-label">充填：</span>
                  <span class="stat-value">{{ currentRecord.permanentTeeth.filled }}颗</span>
                </div>
                <div class="stat-row">
                  <span class="stat-label">缺失：</span>
                  <span class="stat-value">{{ currentRecord.permanentTeeth.missing }}颗</span>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <el-divider content-position="left">预防保健记录</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-card class="record-card">
              <div slot="header">涂氟记录</div>
              <div v-if="currentRecord.fluoride.records && currentRecord.fluoride.records.length > 0">
                <div v-for="(record, index) in currentRecord.fluoride.records" :key="index" class="record-item">
                  <span class="record-date">{{ record.date }}</span>
                  <span class="record-type">{{ record.type }}</span>
                </div>
              </div>
              <el-empty v-else description="暂无涂氟记录" :image-size="60" />
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card class="record-card">
              <div slot="header">窝沟封闭记录</div>
              <div v-if="currentRecord.sealant.records && currentRecord.sealant.records.length > 0">
                <div v-for="(record, index) in currentRecord.sealant.records" :key="index" class="record-item">
                  <span class="record-date">{{ record.date }}</span>
                  <span class="record-position">{{ record.position }}号牙</span>
                </div>
              </div>
              <el-empty v-else description="暂无窝沟封闭记录" :image-size="60" />
            </el-card>
          </el-col>
        </el-row>

        <el-divider content-position="left">检查历史</el-divider>
        <el-timeline>
          <el-timeline-item
            v-for="(history, index) in currentRecord.checkHistory"
            :key="index"
            :timestamp="history.date"
            :type="history.hasIssue ? 'warning' : 'success'"
          >
            <p>{{ history.result }}</p>
            <p v-if="history.suggestion" class="suggestion">建议：{{ history.suggestion }}</p>
          </el-timeline-item>
        </el-timeline>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'OralHealth',
  data() {
    return {
      loading: false,
      searchQuery: '',
      activeTab: 'overview',
      currentPage: 1,
      pageSize: 10,
      total: 100,
      stats: {
        decayRate: 35.2,
        decayCount: 352,
        fluorideRate: 68.5,
        fluorideCount: 685,
        sealantRate: 42.3,
        sealantCount: 423,
        checkRate: 95.8,
        checkCount: 958
      },
      oralRecords: [
        {
          id: '1',
          studentName: '小明',
          studentNo: '2024001',
          gradeClass: '一年级1班',
          age: 7,
          primaryTeeth: { decay: 2, filled: 1, missing: 0 },
          permanentTeeth: { decay: 0, filled: 0, missing: 0 },
          fluoride: { count: 2, records: [{ date: '2024-01-15', type: '专业涂氟' }, { date: '2023-07-10', type: '专业涂氟' }] },
          sealant: { count: 4, records: [{ date: '2024-01-15', position: '16' }, { date: '2024-01-15', position: '26' }] },
          lastCheckDate: '2024-01-15',
          checkHistory: [
            { date: '2024-01-15', result: '发现2颗乳牙龋齿，已治疗', hasIssue: true, suggestion: '建议3个月后复查' },
            { date: '2023-07-10', result: '口腔健康状况良好', hasIssue: false, suggestion: '' }
          ]
        },
        {
          id: '2',
          studentName: '小红',
          studentNo: '2024002',
          gradeClass: '一年级1班',
          age: 7,
          primaryTeeth: { decay: 0, filled: 0, missing: 0 },
          permanentTeeth: { decay: 0, filled: 0, missing: 0 },
          fluoride: { count: 1, records: [{ date: '2024-01-10', type: '专业涂氟' }] },
          sealant: { count: 0, records: [] },
          lastCheckDate: '2024-01-10',
          checkHistory: [
            { date: '2024-01-10', result: '口腔健康状况良好', hasIssue: false, suggestion: '继续保持良好口腔卫生习惯' }
          ]
        }
      ],
      decayRecords: [
        { studentName: '小明', studentNo: '2024001', gradeClass: '一年级1班', toothType: '乳牙', toothPosition: '54', decayType: '窝沟龋', decayDegree: '中度', treatment: '树脂充填', checkDate: '2024-01-15' },
        { studentName: '小明', studentNo: '2024001', gradeClass: '一年级1班', toothType: '乳牙', toothPosition: '64', decayType: '窝沟龋', decayDegree: '轻度', treatment: '树脂充填', checkDate: '2024-01-15' }
      ],
      fluorideRecords: [
        { studentName: '小明', studentNo: '2024001', gradeClass: '一年级1班', fluorideDate: '2024-01-15', fluorideType: '专业涂氟', operator: '李医生', nextDate: '2024-07-15', remark: '配合良好' },
        { studentName: '小红', studentNo: '2024002', gradeClass: '一年级1班', fluorideDate: '2024-01-10', fluorideType: '专业涂氟', operator: '李医生', nextDate: '2024-07-10', remark: '' }
      ],
      sealantRecords: [
        { studentName: '小明', studentNo: '2024001', gradeClass: '一年级1班', toothPosition: '16', sealantDate: '2024-01-15', sealantStatus: '完好', operator: '李医生', checkDate: '2024-07-15' },
        { studentName: '小明', studentNo: '2024001', gradeClass: '一年级1班', toothPosition: '26', sealantDate: '2024-01-15', sealantStatus: '完好', operator: '李医生', checkDate: '2024-07-15' }
      ],
      dialogVisible: false,
      dialogTitle: '新增检查记录',
      form: {
        studentId: '',
        checkDate: '',
        primaryDecay: 0,
        primaryFilled: 0,
        primaryMissing: 0,
        permanentDecay: 0,
        permanentFilled: 0,
        permanentMissing: 0,
        gumStatus: '',
        calculus: '',
        hasMalocclusion: false,
        malocclusionType: '',
        oralHygiene: 5,
        suggestion: ''
      },
      rules: {
        studentId: [{ required: true, message: '请选择学生', trigger: 'change' }],
        checkDate: [{ required: true, message: '请选择检查日期', trigger: 'change' }]
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
    handleTabClick(tab) {
      console.log('切换到标签:', tab.name)
    },
    handleSizeChange(val) {
      this.pageSize = val
    },
    handleCurrentChange(val) {
      this.currentPage = val
    },
    handleAddRecord() {
      this.dialogTitle = '新增检查记录'
      this.form = {
        studentId: '',
        checkDate: '',
        primaryDecay: 0,
        primaryFilled: 0,
        primaryMissing: 0,
        permanentDecay: 0,
        permanentFilled: 0,
        permanentMissing: 0,
        gumStatus: '',
        calculus: '',
        hasMalocclusion: false,
        malocclusionType: '',
        oralHygiene: 5,
        suggestion: ''
      }
      this.dialogVisible = true
    },
    handleEdit(row) {
      this.dialogTitle = '编辑检查记录'
      this.form = {
        studentId: row.id,
        checkDate: row.lastCheckDate,
        primaryDecay: row.primaryTeeth.decay,
        primaryFilled: row.primaryTeeth.filled,
        primaryMissing: row.primaryTeeth.missing,
        permanentDecay: row.permanentTeeth.decay,
        permanentFilled: row.permanentTeeth.filled,
        permanentMissing: row.permanentTeeth.missing,
        gumStatus: '健康',
        calculus: '无',
        hasMalocclusion: false,
        malocclusionType: '',
        oralHygiene: 5,
        suggestion: ''
      }
      this.dialogVisible = true
    },
    handleViewDetail(row) {
      this.currentRecord = row
      this.detailVisible = true
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
    getDecayDegreeTag(degree) {
      const map = { '轻度': 'info', '中度': 'warning', '重度': 'danger' }
      return map[degree] || ''
    }
  }
}
</script>

<style scoped>
.oral-health {
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
.decay-icon {
  background: #fef0f0;
  color: #f56c6c;
}
.fluoride-icon {
  background: #f0f9eb;
  color: #67c23a;
}
.sealant-icon {
  background: #ecf5ff;
  color: #409eff;
}
.check-icon {
  background: #fdf6ec;
  color: #e6a23c;
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
.healthy-text {
  color: #67c23a;
  font-size: 12px;
}
.empty-text {
  color: #909399;
  font-size: 12px;
}
.pagination-wrapper {
  margin-top: 20px;
  text-align: right;
}
.detail-content {
  padding: 10px;
}
.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.student-info h3 {
  margin: 0 0 5px 0;
  font-size: 18px;
}
.student-info p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}
.teeth-card, .record-card {
  margin-bottom: 15px;
}
.teeth-stats {
  padding: 10px;
}
.stat-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}
.stat-label {
  color: #606266;
}
.stat-value {
  font-weight: bold;
  color: #303133;
}
.stat-value.danger {
  color: #f56c6c;
}
.record-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #ebeef5;
}
.record-item:last-child {
  border-bottom: none;
}
.record-date {
  color: #606266;
}
.record-type, .record-position {
  color: #409eff;
}
.suggestion {
  color: #e6a23c;
  font-size: 13px;
  margin-top: 5px;
}
</style>
