<template>
  <div class="sports-activity">
    <el-card class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h2>阳光体育活动</h2>
          <p class="subtitle">发布和管理运动会、晨跑、课间活动等体育活动</p>
        </div>
        <div class="header-actions">
          <el-button type="primary" icon="el-icon-plus" @click="handleAddActivity">发布活动</el-button>
        </div>
      </div>
    </el-card>

    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-icon ongoing-icon">
              <i class="el-icon-time"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.ongoingCount }}</div>
              <div class="stat-label">进行中</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-icon upcoming-icon">
              <i class="el-icon-date"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.upcomingCount }}</div>
              <div class="stat-label">即将开始</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-icon completed-icon">
              <i class="el-icon-check"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.completedCount }}</div>
              <div class="stat-label">已完成</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-icon total-icon">
              <i class="el-icon-s-data"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalParticipants }}</div>
              <div class="stat-label">总参与人次</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="table-card">
      <div slot="header">
        <span>活动列表</span>
        <el-radio-group v-model="listFilter" size="small" style="margin-left: 20px">
          <el-radio-button label="all">全部</el-radio-button>
          <el-radio-button label="ongoing">进行中</el-radio-button>
          <el-radio-button label="upcoming">即将开始</el-radio-button>
          <el-radio-button label="completed">已完成</el-radio-button>
        </el-radio-group>
      </div>
      <el-table :data="activityList" stripe v-loading="loading" style="width: 100%">
        <el-table-column prop="title" label="活动名称" min-width="150">
          <template slot-scope="scope">
            <el-link type="primary" @click="handleViewDetail(scope.row)">{{ scope.row.title }}</el-link>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="活动类型" width="120">
          <template slot-scope="scope">
            <el-tag :type="getTypeTag(scope.row.type)" size="mini">{{ scope.row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="startTime" label="开始时间" width="150" />
        <el-table-column prop="endTime" label="结束时间" width="150" />
        <el-table-column prop="location" label="活动地点" width="120" />
        <el-table-column prop="participants" label="参与人数" width="100" align="center">
          <template slot-scope="scope">
            <el-tag size="mini">{{ scope.row.participants }}人</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="getStatusTag(scope.row.status)" size="mini">{{ scope.row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" size="mini" @click="handleViewDetail(scope.row)">详情</el-button>
            <el-button type="text" size="mini" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button v-if="scope.row.status === '即将开始'" type="text" size="mini" style="color: #67c23a" @click="handleManageSignup(scope.row)">报名管理</el-button>
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

    <!-- 发布/编辑活动对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="700px">
      <el-form :model="form" :rules="rules" ref="form" label-width="100px">
        <el-form-item label="活动名称" prop="title">
          <el-input v-model="form.title" placeholder="请输入活动名称" />
        </el-form-item>
        <el-form-item label="活动类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择活动类型" style="width: 100%">
            <el-option label="运动会" value="运动会" />
            <el-option label="晨跑" value="晨跑" />
            <el-option label="课间活动" value="课间活动" />
            <el-option label="体育比赛" value="体育比赛" />
            <el-option label="趣味运动" value="趣味运动" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="开始时间" prop="startTime">
              <el-date-picker v-model="form.startTime" type="datetime" placeholder="选择时间" style="width: 100%" value-format="yyyy-MM-dd HH:mm" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结束时间" prop="endTime">
              <el-date-picker v-model="form.endTime" type="datetime" placeholder="选择时间" style="width: 100%" value-format="yyyy-MM-dd HH:mm" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="活动地点" prop="location">
          <el-input v-model="form.location" placeholder="请输入活动地点" />
        </el-form-item>
        <el-form-item label="参与对象" prop="target">
          <el-checkbox-group v-model="form.target">
            <el-checkbox label="一年级">一年级</el-checkbox>
            <el-checkbox label="二年级">二年级</el-checkbox>
            <el-checkbox label="三年级">三年级</el-checkbox>
            <el-checkbox label="四年级">四年级</el-checkbox>
            <el-checkbox label="五年级">五年级</el-checkbox>
            <el-checkbox label="六年级">六年级</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="活动描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="4" placeholder="请描述活动内容、规则、注意事项等" />
        </el-form-item>
        <el-form-item label="需要报名">
          <el-switch v-model="form.needSignup" active-text="是" inactive-text="否" />
        </el-form-item>
        <el-form-item label="报名截止时间" v-if="form.needSignup">
          <el-date-picker v-model="form.signupDeadline" type="datetime" placeholder="选择时间" style="width: 100%" value-format="yyyy-MM-dd HH:mm" />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </div>
    </el-dialog>

    <!-- 报名管理对话框 -->
    <el-dialog title="报名管理" :visible.sync="signupVisible" width="800px">
      <div v-if="currentActivity" class="signup-header">
        <h4>{{ currentActivity.title }}</h4>
        <p>已报名：{{ signupList.length }}人 | 限额：{{ currentActivity.maxParticipants || '无限制' }}人</p>
      </div>
      <el-table :data="signupList" stripe size="small" style="width: 100%">
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="studentName" label="学生姓名" width="100" />
        <el-table-column prop="gradeClass" label="班级" width="120" />
        <el-table-column prop="signupTime" label="报名时间" width="150" />
        <el-table-column prop="contact" label="联系方式" width="120" />
        <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip />
        <el-table-column label="操作" width="80" align="center">
          <template slot-scope="scope">
            <el-button type="text" size="mini" style="color: #F56C6C" @click="handleCancelSignup(scope.row)">取消</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div slot="footer">
        <el-button @click="signupVisible = false">关闭</el-button>
        <el-button type="primary" icon="el-icon-plus" @click="handleAddSignup">添加报名</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'SportsActivity',
  data() {
    return {
      loading: false,
      listFilter: 'all',
      currentPage: 1,
      pageSize: 10,
      total: 100,
      stats: {
        ongoingCount: 3,
        upcomingCount: 5,
        completedCount: 28,
        totalParticipants: 1250
      },
      activityList: [
        {
          id: '1',
          title: '春季运动会',
          type: '运动会',
          startTime: '2024-04-15 08:00',
          endTime: '2024-04-15 17:00',
          location: '学校操场',
          participants: 450,
          status: '即将开始',
          description: '全校春季运动会，包含田赛、径赛等项目',
          target: ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级'],
          needSignup: true,
          maxParticipants: 500
        },
        {
          id: '2',
          title: '晨跑打卡活动',
          type: '晨跑',
          startTime: '2024-01-01 07:00',
          endTime: '2024-01-31 08:00',
          location: '操场',
          participants: 280,
          status: '进行中',
          description: '每日晨跑打卡，累计满20天可获得奖励',
          target: ['一年级', '二年级', '三年级'],
          needSignup: false
        }
      ],
      dialogVisible: false,
      dialogTitle: '发布活动',
      form: {
        title: '',
        type: '',
        startTime: '',
        endTime: '',
        location: '',
        target: [],
        description: '',
        needSignup: false,
        signupDeadline: ''
      },
      rules: {
        title: [{ required: true, message: '请输入活动名称', trigger: 'blur' }],
        type: [{ required: true, message: '请选择活动类型', trigger: 'change' }],
        startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
        endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }],
        location: [{ required: true, message: '请输入活动地点', trigger: 'blur' }],
        target: [{ required: true, message: '请选择参与对象', trigger: 'change' }],
        description: [{ required: true, message: '请输入活动描述', trigger: 'blur' }]
      },
      signupVisible: false,
      currentActivity: null,
      signupList: [
        { studentName: '小明', gradeClass: '一年级1班', signupTime: '2024-01-10 09:30', contact: '13800138001', remark: '参加100米跑' },
        { studentName: '小红', gradeClass: '一年级2班', signupTime: '2024-01-10 10:15', contact: '13800138002', remark: '参加跳远' }
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
    handleAddActivity() {
      this.dialogTitle = '发布活动'
      this.form = {
        title: '',
        type: '',
        startTime: '',
        endTime: '',
        location: '',
        target: [],
        description: '',
        needSignup: false,
        signupDeadline: ''
      }
      this.dialogVisible = true
    },
    handleEdit(row) {
      this.dialogTitle = '编辑活动'
      this.form = { ...row }
      this.dialogVisible = true
    },
    handleViewDetail(row) {
      this.$message.info('查看活动详情：' + row.title)
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.$message.success('保存成功')
          this.dialogVisible = false
        }
      })
    },
    handleManageSignup(row) {
      this.currentActivity = row
      this.signupVisible = true
    },
    handleCancelSignup(row) {
      this.$confirm('确定取消该学生的报名吗？', '提示', { type: 'warning' }).then(() => {
        this.$message.success('取消成功')
      })
    },
    handleAddSignup() {
      this.$message.info('添加报名')
    },
    getTypeTag(type) {
      const map = { '运动会': 'danger', '晨跑': 'success', '课间活动': 'primary', '体育比赛': 'warning', '趣味运动': 'info', '其他': '' }
      return map[type] || ''
    },
    getStatusTag(status) {
      const map = { '进行中': 'success', '即将开始': 'warning', '已完成': 'info' }
      return map[status] || ''
    }
  }
}
</script>

<style scoped>
.sports-activity {
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
.ongoing-icon {
  background: #f6ffed;
  color: #52c41a;
}
.upcoming-icon {
  background: #fffbe6;
  color: #faad14;
}
.completed-icon {
  background: #f0f9ff;
  color: #409eff;
}
.total-icon {
  background: #f5f0ff;
  color: #9254de;
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
.table-card {
  margin-top: 0;
}
.pagination-wrapper {
  margin-top: 20px;
  text-align: right;
}
.signup-header {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #ebeef5;
}
.signup-header h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
}
.signup-header p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}
</style>
