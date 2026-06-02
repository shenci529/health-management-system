<template>
  <div class="physical-test-manage">
    <el-card class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h2>国标体测数据管理</h2>
          <p class="subtitle">管理学生体质健康测试数据，支持成绩录入、统计与评级</p>
        </div>
        <div class="header-actions">
          <el-select v-model="selectedSemester" placeholder="选择学期" style="width: 150px; margin-right: 10px">
            <el-option label="2024年春季学期" value="2024-spring" />
            <el-option label="2024年秋季学期" value="2024-fall" />
          </el-select>
          <el-button type="primary" icon="el-icon-upload2" @click="handleBatchImport">批量导入</el-button>
          <el-button type="success" icon="el-icon-download" @click="handleExport">导出</el-button>
        </div>
      </div>
    </el-card>

    <el-row :gutter="20">
      <el-col :span="4">
        <el-card class="filter-card">
          <div slot="header">筛选条件</div>
          <el-form label-position="top" size="small">
            <el-form-item label="年级">
              <el-select v-model="filter.grade" placeholder="全部年级" style="width: 100%">
                <el-option label="全部年级" value="" />
                <el-option label="一年级" value="1" />
                <el-option label="二年级" value="2" />
                <el-option label="三年级" value="3" />
                <el-option label="四年级" value="4" />
                <el-option label="五年级" value="5" />
                <el-option label="六年级" value="6" />
              </el-select>
            </el-form-item>
            <el-form-item label="班级">
              <el-select v-model="filter.class" placeholder="全部班级" style="width: 100%">
                <el-option label="全部班级" value="" />
                <el-option label="1班" value="1" />
                <el-option label="2班" value="2" />
                <el-option label="3班" value="3" />
              </el-select>
            </el-form-item>
            <el-form-item label="性别">
              <el-select v-model="filter.gender" placeholder="全部" style="width: 100%">
                <el-option label="全部" value="" />
                <el-option label="男" value="male" />
                <el-option label="女" value="female" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" style="width: 100%" @click="handleSearch">查询</el-button>
              <el-button style="width: 100%; margin-top: 10px; margin-left: 0" @click="handleReset">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <el-col :span="20">
        <el-card>
          <el-tabs v-model="activeTab">
            <el-tab-pane label="体测成绩录入" name="input">
              <div class="table-toolbar">
                <el-button type="primary" size="small" icon="el-icon-edit" @click="handleBatchEdit">批量录入</el-button>
                <el-button type="warning" size="small" icon="el-icon-s-data" @click="handleCalculate">计算评分</el-button>
              </div>
              <el-table :data="testData" stripe v-loading="loading" border style="width: 100%" height="500">
                <el-table-column type="selection" width="50" align="center" fixed="left" />
                <el-table-column prop="studentName" label="姓名" width="80" fixed="left" />
                <el-table-column prop="studentNo" label="学号" width="100" fixed="left" />
                <el-table-column prop="gender" label="性别" width="60" align="center" fixed="left">
                  <template slot-scope="scope">
                    <el-tag :type="scope.row.gender === '男' ? 'primary' : 'danger'" size="mini">{{ scope.row.gender }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="gradeClass" label="班级" width="100" fixed="left" />
                <el-table-column label="身高体重" align="center">
                  <el-table-column prop="height" label="身高(cm)" width="90">
                    <template slot-scope="scope">
                      <el-input v-model="scope.row.height" size="mini" @blur="calculateBMI(scope.row)" />
                    </template>
                  </el-table-column>
                  <el-table-column prop="weight" label="体重(kg)" width="90">
                    <template slot-scope="scope">
                      <el-input v-model="scope.row.weight" size="mini" @blur="calculateBMI(scope.row)" />
                    </template>
                  </el-table-column>
                  <el-table-column prop="bmi" label="BMI" width="70" />
                </el-table-column>
                <el-table-column label="身体机能" align="center">
                  <el-table-column prop="vitalCapacity" label="肺活量(ml)" width="100">
                    <template slot-scope="scope">
                      <el-input v-model="scope.row.vitalCapacity" size="mini" />
                    </template>
                  </el-table-column>
                </el-table-column>
                <el-table-column label="身体素质" align="center">
                  <el-table-column prop="run50m" label="50米跑(s)" width="90">
                    <template slot-scope="scope">
                      <el-input v-model="scope.row.run50m" size="mini" />
                    </template>
                  </el-table-column>
                  <el-table-column prop="sitAndReach" label="坐位体前屈(cm)" width="120">
                    <template slot-scope="scope">
                      <el-input v-model="scope.row.sitAndReach" size="mini" />
                    </template>
                  </el-table-column>
                  <el-table-column prop="standingJump" label="立定跳远(cm)" width="110">
                    <template slot-scope="scope">
                      <el-input v-model="scope.row.standingJump" size="mini" />
                    </template>
                  </el-table-column>
                  <el-table-column prop="strength" :label="strengthLabel" width="110">
                    <template slot-scope="scope">
                      <el-input v-model="scope.row.strength" size="mini" />
                    </template>
                  </el-table-column>
                  <el-table-column prop="endurance" :label="enduranceLabel" width="110">
                    <template slot-scope="scope">
                      <el-input v-model="scope.row.endurance" size="mini" />
                    </template>
                  </el-table-column>
                </el-table-column>
                <el-table-column label="总分" width="100" align="center" fixed="right">
                  <template slot-scope="scope">
                    <el-tag :type="getScoreTag(scope.row.totalScore)">{{ scope.row.totalScore || '-' }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="等级" width="80" align="center" fixed="right">
                  <template slot-scope="scope">
                    <el-tag :type="getLevelTag(scope.row.level)">{{ scope.row.level || '-' }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="80" align="center" fixed="right">
                  <template slot-scope="scope">
                    <el-button type="text" size="mini" @click="handleSaveRow(scope.row)">保存</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>

            <el-tab-pane label="成绩统计" name="statistics">
              <el-row :gutter="20" class="stats-row">
                <el-col :span="6">
                  <div class="stats-card">
                    <div class="stats-title">优秀率</div>
                    <div class="stats-value excellent">{{ statistics.excellentRate }}%</div>
                    <div class="stats-count">{{ statistics.excellentCount }}人</div>
                  </div>
                </el-col>
                <el-col :span="6">
                  <div class="stats-card">
                    <div class="stats-title">良好率</div>
                    <div class="stats-value good">{{ statistics.goodRate }}%</div>
                    <div class="stats-count">{{ statistics.goodCount }}人</div>
                  </div>
                </el-col>
                <el-col :span="6">
                  <div class="stats-card">
                    <div class="stats-title">及格率</div>
                    <div class="stats-value pass">{{ statistics.passRate }}%</div>
                    <div class="stats-count">{{ statistics.passCount }}人</div>
                  </div>
                </el-col>
                <el-col :span="6">
                  <div class="stats-card">
                    <div class="stats-title">不及格率</div>
                    <div class="stats-value fail">{{ statistics.failRate }}%</div>
                    <div class="stats-count">{{ statistics.failCount }}人</div>
                  </div>
                </el-col>
              </el-row>

              <el-row :gutter="20" style="margin-top: 20px">
                <el-col :span="12">
                  <el-card>
                    <div slot="header">成绩等级分布</div>
                    <div ref="gradeChart" style="height: 300px"></div>
                  </el-card>
                </el-col>
                <el-col :span="12">
                  <el-card>
                    <div slot="header">各项目平均分</div>
                    <div ref="itemChart" style="height: 300px"></div>
                  </el-card>
                </el-col>
              </el-row>

              <el-card style="margin-top: 20px">
                <div slot="header">班级对比</div>
                <el-table :data="classComparison" stripe border>
                  <el-table-column prop="className" label="班级" />
                  <el-table-column prop="totalStudents" label="总人数" align="center" />
                  <el-table-column prop="testedStudents" label="已测人数" align="center" />
                  <el-table-column prop="avgScore" label="平均分" align="center" />
                  <el-table-column prop="excellentRate" label="优秀率" align="center">
                    <template slot-scope="scope">
                      <el-progress :percentage="scope.row.excellentRate" :color="'#67C23A'" />
                    </template>
                  </el-table-column>
                  <el-table-column prop="passRate" label="及格率" align="center">
                    <template slot-scope="scope">
                      <el-progress :percentage="scope.row.passRate" :color="'#409EFF'" />
                    </template>
                  </el-table-column>
                </el-table>
              </el-card>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>

    <!-- 批量录入对话框 -->
    <el-dialog title="批量录入体测数据" :visible.sync="batchDialogVisible" width="900px">
      <el-form :model="batchForm" label-width="100px">
        <el-form-item label="测试项目">
          <el-select v-model="batchForm.project" placeholder="选择测试项目" style="width: 200px">
            <el-option label="身高" value="height" />
            <el-option label="体重" value="weight" />
            <el-option label="肺活量" value="vitalCapacity" />
            <el-option label="50米跑" value="run50m" />
            <el-option label="坐位体前屈" value="sitAndReach" />
            <el-option label="立定跳远" value="standingJump" />
            <el-option label="引体向上/仰卧起坐" value="strength" />
            <el-option label="800/1000米跑" value="endurance" />
          </el-select>
        </el-form-item>
        <el-form-item label="数据录入">
          <el-input
            v-model="batchForm.data"
            type="textarea"
            :rows="10"
            placeholder="请输入数据，格式：学号,成绩（每行一条记录）&#10;例如：&#10;2024001,175.5&#10;2024002,168.0"
          />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="batchDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitBatchData">确认录入</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'PhysicalTestManage',
  data() {
    return {
      selectedSemester: '2024-spring',
      loading: false,
      activeTab: 'input',
      filter: {
        grade: '',
        class: '',
        gender: ''
      },
      testData: [
        {
          studentName: '小明',
          studentNo: '2024001',
          gender: '男',
          gradeClass: '一年级1班',
          height: 135.5,
          weight: 32.5,
          bmi: 17.7,
          vitalCapacity: 2200,
          run50m: 9.2,
          sitAndReach: 12.5,
          standingJump: 165,
          strength: 15,
          endurance: '4:25',
          totalScore: 85,
          level: '良好'
        },
        {
          studentName: '小红',
          studentNo: '2024002',
          gender: '女',
          gradeClass: '一年级1班',
          height: 132.0,
          weight: 28.0,
          bmi: 16.1,
          vitalCapacity: 1950,
          run50m: 9.8,
          sitAndReach: 15.2,
          standingJump: 148,
          strength: 38,
          endurance: '4:15',
          totalScore: 90,
          level: '优秀'
        },
        {
          studentName: '小刚',
          studentNo: '2024003',
          gender: '男',
          gradeClass: '一年级1班',
          height: 138.0,
          weight: 35.0,
          bmi: 18.4,
          vitalCapacity: 2100,
          run50m: 9.5,
          sitAndReach: 8.5,
          standingJump: 158,
          strength: 12,
          endurance: '4:45',
          totalScore: 72,
          level: '及格'
        }
      ],
      statistics: {
        excellentRate: 25,
        excellentCount: 125,
        goodRate: 35,
        goodCount: 175,
        passRate: 30,
        passCount: 150,
        failRate: 10,
        failCount: 50
      },
      classComparison: [
        { className: '一年级1班', totalStudents: 45, testedStudents: 45, avgScore: 82.5, excellentRate: 30, passRate: 95 },
        { className: '一年级2班', totalStudents: 46, testedStudents: 46, avgScore: 80.2, excellentRate: 25, passRate: 92 },
        { className: '一年级3班', totalStudents: 44, testedStudents: 44, avgScore: 78.8, excellentRate: 20, passRate: 90 }
      ],
      batchDialogVisible: false,
      batchForm: {
        project: '',
        data: ''
      }
    }
  },
  computed: {
    strengthLabel() {
      return '引体向上(个)/仰卧起坐(个)'
    },
    enduranceLabel() {
      return '1000米跑(男)/800米跑(女)'
    }
  },
  methods: {
    handleSearch() {
      this.$message.success('查询成功')
    },
    handleReset() {
      this.filter = { grade: '', class: '', gender: '' }
    },
    calculateBMI(row) {
      if (row.height && row.weight) {
        const heightInM = row.height / 100
        row.bmi = (row.weight / (heightInM * heightInM)).toFixed(1)
      }
    },
    getScoreTag(score) {
      if (!score) return ''
      if (score >= 90) return 'success'
      if (score >= 80) return ''
      if (score >= 60) return 'warning'
      return 'danger'
    },
    getLevelTag(level) {
      if (!level) return ''
      if (level === '优秀') return 'success'
      if (level === '良好') return ''
      if (level === '及格') return 'warning'
      return 'danger'
    },
    handleSaveRow(row) {
      this.$message.success(`保存 ${row.studentName} 的数据成功`)
    },
    handleBatchEdit() {
      this.batchDialogVisible = true
      this.batchForm = { project: '', data: '' }
    },
    submitBatchData() {
      this.$message.success('批量录入成功')
      this.batchDialogVisible = false
    },
    handleCalculate() {
      this.$message.success('评分计算完成')
    },
    handleBatchImport() {
      this.$message.info('请选择Excel文件导入')
    },
    handleExport() {
      this.$message.success('导出成功')
    }
  }
}
</script>

<style scoped>
.physical-test-manage {
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
.filter-card {
  height: calc(100vh - 200px);
}
.table-toolbar {
  margin-bottom: 15px;
}
.stats-row {
  margin-bottom: 20px;
}
.stats-card {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
}
.stats-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 10px;
}
.stats-value {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 5px;
}
.stats-value.excellent {
  color: #67C23A;
}
.stats-value.good {
  color: #409EFF;
}
.stats-value.pass {
  color: #E6A23C;
}
.stats-value.fail {
  color: #F56C6C;
}
.stats-count {
  font-size: 14px;
  color: #606266;
}
</style>
