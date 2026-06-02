<template>
  <div class="dining-record">
    <el-card class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h2>学生就餐记录</h2>
          <p class="subtitle">管理学生就餐签到、特殊饮食需求及就餐统计</p>
        </div>
        <div class="header-actions">
          <el-date-picker
            v-model="selectedDate"
            type="date"
            placeholder="选择日期"
            style="margin-right: 10px"
          />
          <el-button type="primary" icon="el-icon-plus" @click="handleAddRecord">登记就餐</el-button>
          <el-button type="success" icon="el-icon-download" @click="handleExport">导出</el-button>
        </div>
      </div>
    </el-card>

    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-icon total-icon">
              <i class="el-icon-food"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalStudents }}</div>
              <div class="stat-label">应到人数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-icon checked-icon">
              <i class="el-icon-circle-check"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.checkedIn }}</div>
              <div class="stat-label">已就餐</div>
              <div class="stat-sub">出勤率 {{ stats.attendanceRate }}%</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-icon special-icon">
              <i class="el-icon-warning"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.specialDiet }}</div>
              <div class="stat-label">特殊饮食</div>
              <div class="stat-sub">需特别关注</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-icon absent-icon">
              <i class="el-icon-circle-close"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.absent }}</div>
              <div class="stat-label">未就餐</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="table-card">
      <div slot="header">
        <span>就餐记录</span>
        <el-radio-group v-model="mealType" size="small" style="margin-left: 20px">
          <el-radio-button label="breakfast">早餐</el-radio-button>
          <el-radio-button label="lunch">午餐</el-radio-button>
          <el-radio-button label="dinner">晚餐</el-radio-button>
        </el-radio-group>
        <el-radio-group v-model="listFilter" size="small" style="margin-left: 20px">
          <el-radio-button label="all">全部</el-radio-button>
          <el-radio-button label="checked">已就餐</el-radio-button>
          <el-radio-button label="unchecked">未就餐</el-radio-button>
          <el-radio-button label="special">特殊饮食</el-radio-button>
        </el-radio-group>
      </div>
      <el-table :data="diningList" stripe v-loading="loading" style="width: 100%">
        <el-table-column prop="studentName" label="学生姓名" width="100" />
        <el-table-column prop="studentNo" label="学号" width="120" />
        <el-table-column prop="gradeClass" label="班级" width="120" />
        <el-table-column prop="mealType" label="餐次" width="80">
          <template slot-scope="scope">
            <el-tag :type="getMealTypeTag(scope.row.mealType)" size="mini">{{ scope.row.mealType }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="checkInTime" label="签到时间" width="150" />
        <el-table-column label="就餐状态" width="100" align="center">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status === '已就餐' ? 'success' : 'info'" size="mini">{{ scope.row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="特殊饮食" min-width="200">
          <template slot-scope="scope">
            <el-tag v-for="(diet, index) in scope.row.specialDiet" :key="index" size="mini" type="warning" style="margin-right: 5px">
              {{ diet }}
            </el-tag>
            <span v-if="!scope.row.specialDiet || scope.row.specialDiet.length === 0">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip />
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button v-if="scope.row.status === '未就餐'" type="text" size="mini" @click="handleCheckIn(scope.row)">签到</el-button>
            <el-button type="text" size="mini" @click="handleEdit(scope.row)">编辑</el-button>
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

    <!-- 登记就餐对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="600px">
      <el-form :model="form" :rules="rules" ref="form" label-width="100px">
        <el-form-item label="学生" prop="studentId">
          <el-select v-model="form.studentId" placeholder="请选择学生" style="width: 100%" filterable>
            <el-option v-for="student in studentList" :key="student.id" :label="student.name + ' (' + student.studentNo + ')'" :value="student.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="餐次" prop="mealType">
          <el-radio-group v-model="form.mealType">
            <el-radio-button label="早餐">早餐</el-radio-button>
            <el-radio-button label="午餐">午餐</el-radio-button>
            <el-radio-button label="晚餐">晚餐</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="就餐状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio label="已就餐">已就餐</el-radio>
            <el-radio label="未就餐">未就餐</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="特殊饮食">
          <el-checkbox-group v-model="form.specialDiet">
            <el-checkbox label="素食">素食</el-checkbox>
            <el-checkbox label="过敏">过敏</el-checkbox>
            <el-checkbox label="宗教禁忌">宗教禁忌</el-checkbox>
            <el-checkbox label="糖尿病餐">糖尿病餐</el-checkbox>
            <el-checkbox label="低盐">低盐</el-checkbox>
            <el-checkbox label="其他">其他</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="其他说明" />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'DiningRecord',
  data() {
    return {
      loading: false,
      selectedDate: new Date(),
      mealType: 'lunch',
      listFilter: 'all',
      currentPage: 1,
      pageSize: 10,
      total: 100,
      stats: {
        totalStudents: 500,
        checkedIn: 485,
        attendanceRate: 97,
        specialDiet: 25,
        absent: 15
      },
      diningList: [
        {
          id: '1',
          studentName: '小明',
          studentNo: '2024001',
          gradeClass: '一年级1班',
          mealType: '午餐',
          checkInTime: '2024-01-15 11:45',
          status: '已就餐',
          specialDiet: ['过敏-花生'],
          remark: '需特别注意'
        },
        {
          id: '2',
          studentName: '小红',
          studentNo: '2024002',
          gradeClass: '一年级1班',
          mealType: '午餐',
          checkInTime: '2024-01-15 11:42',
          status: '已就餐',
          specialDiet: [],
          remark: ''
        },
        {
          id: '3',
          studentName: '小刚',
          studentNo: '2024003',
          gradeClass: '一年级2班',
          mealType: '午餐',
          checkInTime: '',
          status: '未就餐',
          specialDiet: [],
          remark: '病假'
        }
      ],
      dialogVisible: false,
      dialogTitle: '登记就餐',
      form: {
        studentId: '',
        mealType: '午餐',
        status: '已就餐',
        specialDiet: [],
        remark: ''
      },
      rules: {
        studentId: [{ required: true, message: '请选择学生', trigger: 'change' }],
        mealType: [{ required: true, message: '请选择餐次', trigger: 'change' }],
        status: [{ required: true, message: '请选择就餐状态', trigger: 'change' }]
      },
      studentList: [
        { id: '1', name: '小明', studentNo: '2024001' },
        { id: '2', name: '小红', studentNo: '2024002' },
        { id: '3', name: '小刚', studentNo: '2024003' }
      ]
    }
  },
  methods: {
    handleSizeChange(val) {
      this.pageSize = val
    },
    handleCurrentChange(val) {
      this.currentPage = val
    },
    handleAddRecord() {
      this.dialogTitle = '登记就餐'
      this.form = {
        studentId: '',
        mealType: '午餐',
        status: '已就餐',
        specialDiet: [],
        remark: ''
      }
      this.dialogVisible = true
    },
    handleCheckIn(row) {
      this.$confirm(`确定为 ${row.studentName} 进行就餐签到吗？`, '提示', { type: 'warning' }).then(() => {
        this.$message.success('签到成功')
      })
    },
    handleEdit(row) {
      this.dialogTitle = '编辑就餐记录'
      this.form = {
        studentId: row.id,
        mealType: row.mealType,
        status: row.status,
        specialDiet: row.specialDiet || [],
        remark: row.remark || ''
      }
      this.dialogVisible = true
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
    getMealTypeTag(type) {
      const map = { '早餐': 'info', '午餐': 'success', '晚餐': 'warning' }
      return map[type] || ''
    }
  }
}
</script>

<style scoped>
.dining-record {
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
.checked-icon {
  background: #f6ffed;
  color: #52c41a;
}
.special-icon {
  background: #fffbe6;
  color: #faad14;
}
.absent-icon {
  background: #fff2f0;
  color: #ff4d4f;
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
</style>
