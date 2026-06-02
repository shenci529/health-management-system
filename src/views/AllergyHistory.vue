<template>
  <div class="allergy-history">
    <el-card class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h2>过敏史/既往病史管理</h2>
          <p class="subtitle">管理学生过敏史、既往病史及特殊体质信息</p>
        </div>
        <div class="header-actions">
          <el-input
            v-model="searchQuery"
            placeholder="搜索学生姓名/学号"
            prefix-icon="el-icon-search"
            style="width: 250px; margin-right: 10px"
          />
          <el-button type="primary" icon="el-icon-plus" @click="handleAddRecord">新增记录</el-button>
          <el-button type="success" icon="el-icon-download" @click="handleExport">导出</el-button>
        </div>
      </div>
    </el-card>

    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-icon allergy-icon">
              <i class="el-icon-warning"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.allergyCount }}</div>
              <div class="stat-label">过敏学生</div>
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
              <div class="stat-label">既往病史</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-icon special-icon">
              <i class="el-icon-star-off"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.specialCount }}</div>
              <div class="stat-label">特殊体质</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-icon total-icon">
              <i class="el-icon-user"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalCount }}</div>
              <div class="stat-label">总记录数</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="table-card">
      <el-tabs v-model="activeTab" @tab-click="handleTabClick">
        <el-tab-pane label="全部记录" name="all">
          <el-table :data="filteredRecords" stripe v-loading="loading" style="width: 100%">
            <el-table-column prop="studentName" label="学生姓名" width="100">
              <template slot-scope="scope">
                <el-link type="primary" @click="handleViewDetail(scope.row)">{{ scope.row.studentName }}</el-link>
              </template>
            </el-table-column>
            <el-table-column prop="studentNo" label="学号" width="120" />
            <el-table-column prop="gradeClass" label="班级" width="120" />
            <el-table-column label="过敏史" min-width="200">
              <template slot-scope="scope">
                <el-tag v-for="(item, index) in scope.row.allergies" :key="index" size="mini" type="danger" style="margin-right: 5px; margin-bottom: 3px">
                  {{ item }}
                </el-tag>
                <span v-if="!scope.row.allergies || scope.row.allergies.length === 0" class="empty-text">无</span>
              </template>
            </el-table-column>
            <el-table-column label="既往病史" min-width="200">
              <template slot-scope="scope">
                <el-tag v-for="(item, index) in scope.row.diseases" :key="index" size="mini" type="warning" style="margin-right: 5px; margin-bottom: 3px">
                  {{ item }}
                </el-tag>
                <span v-if="!scope.row.diseases || scope.row.diseases.length === 0" class="empty-text">无</span>
              </template>
            </el-table-column>
            <el-table-column label="特殊体质" width="100" align="center">
              <template slot-scope="scope">
                <el-tag v-if="scope.row.isSpecial" type="success" size="mini">是</el-tag>
                <span v-else class="empty-text">否</span>
              </template>
            </el-table-column>
            <el-table-column prop="updateTime" label="更新时间" width="150" />
            <el-table-column label="操作" width="150" align="center" fixed="right">
              <template slot-scope="scope">
                <el-button type="text" size="mini" @click="handleEdit(scope.row)">编辑</el-button>
                <el-button type="text" size="mini" @click="handleViewDetail(scope.row)">详情</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="过敏史" name="allergy">
          <el-table :data="allergyRecords" stripe v-loading="loading" style="width: 100%">
            <el-table-column prop="studentName" label="学生姓名" width="100" />
            <el-table-column prop="studentNo" label="学号" width="120" />
            <el-table-column prop="gradeClass" label="班级" width="120" />
            <el-table-column label="过敏类型" width="120">
              <template slot-scope="scope">
                <el-tag :type="getAllergyTypeTag(scope.row.allergyType)" size="mini">{{ scope.row.allergyType }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="allergen" label="过敏原" min-width="150" />
            <el-table-column prop="severity" label="严重程度" width="100">
              <template slot-scope="scope">
                <el-tag :type="getSeverityTag(scope.row.severity)" size="mini">{{ scope.row.severity }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="symptoms" label="症状描述" min-width="200" show-overflow-tooltip />
            <el-table-column prop="updateTime" label="记录时间" width="150" />
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="既往病史" name="disease">
          <el-table :data="diseaseRecords" stripe v-loading="loading" style="width: 100%">
            <el-table-column prop="studentName" label="学生姓名" width="100" />
            <el-table-column prop="studentNo" label="学号" width="120" />
            <el-table-column prop="gradeClass" label="班级" width="120" />
            <el-table-column label="病史类型" width="120">
              <template slot-scope="scope">
                <el-tag type="warning" size="mini">{{ scope.row.diseaseType }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="diseaseName" label="疾病名称" min-width="150" />
            <el-table-column prop="diagnosisDate" label="确诊日期" width="120" />
            <el-table-column prop="treatment" label="治疗情况" min-width="150" />
            <el-table-column prop="currentStatus" label="当前状态" width="100">
              <template slot-scope="scope">
                <el-tag :type="scope.row.currentStatus === '已痊愈' ? 'success' : 'info'" size="mini">{{ scope.row.currentStatus }}</el-tag>
              </template>
            </el-table-column>
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

    <!-- 新增/编辑记录对话框 -->
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
            <el-form-item label="特殊体质">
              <el-switch v-model="form.isSpecial" active-text="是" inactive-text="否" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">过敏史</el-divider>
        <div v-for="(allergy, index) in form.allergyList" :key="'allergy-' + index" class="dynamic-item">
          <el-row :gutter="10">
            <el-col :span="6">
              <el-select v-model="allergy.type" placeholder="过敏类型" size="small">
                <el-option label="食物过敏" value="食物过敏" />
                <el-option label="药物过敏" value="药物过敏" />
                <el-option label="环境过敏" value="环境过敏" />
                <el-option label="其他" value="其他" />
              </el-select>
            </el-col>
            <el-col :span="6">
              <el-input v-model="allergy.allergen" placeholder="过敏原" size="small" />
            </el-col>
            <el-col :span="5">
              <el-select v-model="allergy.severity" placeholder="严重程度" size="small">
                <el-option label="轻度" value="轻度" />
                <el-option label="中度" value="中度" />
                <el-option label="重度" value="重度" />
              </el-select>
            </el-col>
            <el-col :span="5">
              <el-input v-model="allergy.symptoms" placeholder="症状" size="small" />
            </el-col>
            <el-col :span="2">
              <el-button type="text" style="color: #F56C6C" @click="removeAllergy(index)">
                <i class="el-icon-delete"></i>
              </el-button>
            </el-col>
          </el-row>
        </div>
        <el-button type="primary" size="small" icon="el-icon-plus" @click="addAllergy">添加过敏史</el-button>

        <el-divider content-position="left">既往病史</el-divider>
        <div v-for="(disease, index) in form.diseaseList" :key="'disease-' + index" class="dynamic-item">
          <el-row :gutter="10">
            <el-col :span="6">
              <el-select v-model="disease.type" placeholder="病史类型" size="small">
                <el-option label="慢性病" value="慢性病" />
                <el-option label="手术史" value="手术史" />
                <el-option label="家族病史" value="家族病史" />
                <el-option label="传染病史" value="传染病史" />
                <el-option label="其他" value="其他" />
              </el-select>
            </el-col>
            <el-col :span="6">
              <el-input v-model="disease.name" placeholder="疾病名称" size="small" />
            </el-col>
            <el-col :span="5">
              <el-date-picker v-model="disease.diagnosisDate" type="date" placeholder="确诊日期" size="small" style="width: 100%" value-format="yyyy-MM-dd" />
            </el-col>
            <el-col :span="5">
              <el-select v-model="disease.currentStatus" placeholder="当前状态" size="small">
                <el-option label="治疗中" value="治疗中" />
                <el-option label="已痊愈" value="已痊愈" />
                <el-option label="长期管理" value="长期管理" />
              </el-select>
            </el-col>
            <el-col :span="2">
              <el-button type="text" style="color: #F56C6C" @click="removeDisease(index)">
                <i class="el-icon-delete"></i>
              </el-button>
            </el-col>
          </el-row>
          <el-input v-model="disease.treatment" placeholder="治疗情况说明" size="small" style="margin-top: 5px" />
        </div>
        <el-button type="primary" size="small" icon="el-icon-plus" @click="addDisease">添加既往病史</el-button>

        <el-form-item label="备注" style="margin-top: 20px">
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="其他需要说明的情况" />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </div>
    </el-dialog>

    <!-- 详情对话框 -->
    <el-dialog title="健康档案详情" :visible.sync="detailVisible" width="700px">
      <div v-if="currentRecord" class="detail-content">
        <div class="detail-header">
          <div class="student-info">
            <h3>{{ currentRecord.studentName }}</h3>
            <p>{{ currentRecord.studentNo }} | {{ currentRecord.gradeClass }}</p>
          </div>
          <el-tag v-if="currentRecord.isSpecial" type="success">特殊体质</el-tag>
        </div>

        <el-divider content-position="left">过敏史</el-divider>
        <div v-if="currentRecord.allergyDetails && currentRecord.allergyDetails.length > 0">
          <el-table :data="currentRecord.allergyDetails" stripe size="small">
            <el-table-column prop="type" label="类型" width="100">
              <template slot-scope="scope">
                <el-tag :type="getAllergyTypeTag(scope.row.type)" size="mini">{{ scope.row.type }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="allergen" label="过敏原" width="120" />
            <el-table-column prop="severity" label="严重程度" width="100">
              <template slot-scope="scope">
                <el-tag :type="getSeverityTag(scope.row.severity)" size="mini">{{ scope.row.severity }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="symptoms" label="症状" />
          </el-table>
        </div>
        <el-empty v-else description="暂无过敏史记录" :image-size="80" />

        <el-divider content-position="left">既往病史</el-divider>
        <div v-if="currentRecord.diseaseDetails && currentRecord.diseaseDetails.length > 0">
          <el-table :data="currentRecord.diseaseDetails" stripe size="small">
            <el-table-column prop="type" label="类型" width="100">
              <template slot-scope="scope">
                <el-tag type="warning" size="mini">{{ scope.row.type }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="name" label="疾病名称" width="120" />
            <el-table-column prop="diagnosisDate" label="确诊日期" width="120" />
            <el-table-column prop="currentStatus" label="状态" width="100">
              <template slot-scope="scope">
                <el-tag :type="scope.row.currentStatus === '已痊愈' ? 'success' : 'info'" size="mini">{{ scope.row.currentStatus }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <el-empty v-else description="暂无既往病史记录" :image-size="80" />

        <el-divider content-position="left">备注</el-divider>
        <p class="remark-text">{{ currentRecord.remark || '无' }}</p>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'AllergyHistory',
  data() {
    return {
      loading: false,
      searchQuery: '',
      activeTab: 'all',
      currentPage: 1,
      pageSize: 10,
      total: 100,
      stats: {
        allergyCount: 156,
        diseaseCount: 89,
        specialCount: 45,
        totalCount: 245
      },
      records: [
        {
          id: '1',
          studentName: '小明',
          studentNo: '2024001',
          gradeClass: '一年级1班',
          allergies: ['花生过敏', '青霉素过敏'],
          diseases: ['哮喘'],
          isSpecial: true,
          updateTime: '2024-01-15 10:30',
          allergyDetails: [
            { type: '食物过敏', allergen: '花生', severity: '重度', symptoms: '呼吸困难、皮疹' },
            { type: '药物过敏', allergen: '青霉素', severity: '中度', symptoms: '皮肤红肿' }
          ],
          diseaseDetails: [
            { type: '慢性病', name: '哮喘', diagnosisDate: '2022-03-15', currentStatus: '长期管理', treatment: '定期使用吸入剂' }
          ],
          remark: '需随身携带急救药物'
        },
        {
          id: '2',
          studentName: '小红',
          studentNo: '2024002',
          gradeClass: '一年级1班',
          allergies: ['尘螨过敏'],
          diseases: [],
          isSpecial: false,
          updateTime: '2024-01-14 14:20',
          allergyDetails: [
            { type: '环境过敏', allergen: '尘螨', severity: '轻度', symptoms: '打喷嚏、流鼻涕' }
          ],
          diseaseDetails: [],
          remark: ''
        },
        {
          id: '3',
          studentName: '小刚',
          studentNo: '2024003',
          gradeClass: '一年级2班',
          allergies: [],
          diseases: ['阑尾炎手术史'],
          isSpecial: false,
          updateTime: '2024-01-13 09:15',
          allergyDetails: [],
          diseaseDetails: [
            { type: '手术史', name: '阑尾炎手术', diagnosisDate: '2023-06-10', currentStatus: '已痊愈', treatment: '手术切除' }
          ],
          remark: ''
        }
      ],
      allergyRecords: [
        { studentName: '小明', studentNo: '2024001', gradeClass: '一年级1班', allergyType: '食物过敏', allergen: '花生', severity: '重度', symptoms: '呼吸困难、皮疹', updateTime: '2024-01-15' },
        { studentName: '小明', studentNo: '2024001', gradeClass: '一年级1班', allergyType: '药物过敏', allergen: '青霉素', severity: '中度', symptoms: '皮肤红肿', updateTime: '2024-01-15' },
        { studentName: '小红', studentNo: '2024002', gradeClass: '一年级1班', allergyType: '环境过敏', allergen: '尘螨', severity: '轻度', symptoms: '打喷嚏、流鼻涕', updateTime: '2024-01-14' }
      ],
      diseaseRecords: [
        { studentName: '小明', studentNo: '2024001', gradeClass: '一年级1班', diseaseType: '慢性病', diseaseName: '哮喘', diagnosisDate: '2022-03-15', treatment: '定期使用吸入剂', currentStatus: '长期管理' },
        { studentName: '小刚', studentNo: '2024003', gradeClass: '一年级2班', diseaseType: '手术史', diseaseName: '阑尾炎手术', diagnosisDate: '2023-06-10', treatment: '手术切除', currentStatus: '已痊愈' }
      ],
      dialogVisible: false,
      dialogTitle: '新增记录',
      form: {
        studentId: '',
        isSpecial: false,
        allergyList: [],
        diseaseList: [],
        remark: ''
      },
      rules: {
        studentId: [{ required: true, message: '请选择学生', trigger: 'change' }]
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
  computed: {
    filteredRecords() {
      if (!this.searchQuery) return this.records
      return this.records.filter(r => 
        r.studentName.includes(this.searchQuery) || 
        r.studentNo.includes(this.searchQuery)
      )
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
      this.dialogTitle = '新增健康记录'
      this.form = {
        studentId: '',
        isSpecial: false,
        allergyList: [],
        diseaseList: [],
        remark: ''
      }
      this.dialogVisible = true
    },
    handleEdit(row) {
      this.dialogTitle = '编辑健康记录'
      this.form = {
        studentId: row.id,
        isSpecial: row.isSpecial,
        allergyList: row.allergyDetails || [],
        diseaseList: row.diseaseDetails || [],
        remark: row.remark || ''
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
    addAllergy() {
      this.form.allergyList.push({ type: '', allergen: '', severity: '', symptoms: '' })
    },
    removeAllergy(index) {
      this.form.allergyList.splice(index, 1)
    },
    addDisease() {
      this.form.diseaseList.push({ type: '', name: '', diagnosisDate: '', currentStatus: '', treatment: '' })
    },
    removeDisease(index) {
      this.form.diseaseList.splice(index, 1)
    },
    handleExport() {
      this.$message.success('导出成功')
    },
    getAllergyTypeTag(type) {
      const map = { '食物过敏': 'danger', '药物过敏': 'warning', '环境过敏': 'info', '其他': '' }
      return map[type] || ''
    },
    getSeverityTag(severity) {
      const map = { '轻度': 'info', '中度': 'warning', '重度': 'danger' }
      return map[severity] || ''
    }
  }
}
</script>

<style scoped>
.allergy-history {
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
  width: 50px;
  height: 50px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-right: 15px;
}
.allergy-icon {
  background: #fef0f0;
  color: #f56c6c;
}
.disease-icon {
  background: #fdf6ec;
  color: #e6a23c;
}
.special-icon {
  background: #f0f9ff;
  color: #409eff;
}
.total-icon {
  background: #f0f9eb;
  color: #67c23a;
}
.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}
.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}
.table-card {
  margin-top: 0;
}
.empty-text {
  color: #909399;
  font-size: 12px;
}
.pagination-wrapper {
  margin-top: 20px;
  text-align: right;
}
.dynamic-item {
  margin-bottom: 10px;
  padding: 10px;
  background: #f5f7fa;
  border-radius: 4px;
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
.remark-text {
  color: #606266;
  line-height: 1.6;
  padding: 10px;
  background: #f5f7fa;
  border-radius: 4px;
}
</style>
