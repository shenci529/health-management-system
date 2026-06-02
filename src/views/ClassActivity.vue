<template>
  <div class="class-activity">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="title">
        <i class="el-icon-s-flag"></i>
        班级活动管理
      </h1>
      <p class="subtitle">组织班级健康活动，增强学生体质</p>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <div class="stats-card">
        <div class="stats-icon blue">
          <i class="el-icon-s-flag"></i>
        </div>
        <div class="stats-info">
          <div class="stats-value">{{ upcomingActivitiesCount }}</div>
          <div class="stats-label">即将开始</div>
        </div>
      </div>
      <div class="stats-card">
        <div class="stats-icon green">
          <i class="el-icon-video-play"></i>
        </div>
        <div class="stats-info">
          <div class="stats-value">{{ ongoingActivitiesCount }}</div>
          <div class="stats-label">进行中</div>
        </div>
      </div>
      <div class="stats-card">
        <div class="stats-icon orange">
          <i class="el-icon-check"></i>
        </div>
        <div class="stats-info">
          <div class="stats-value">{{ completedActivitiesCount }}</div>
          <div class="stats-label">已完成</div>
        </div>
      </div>
    </div>

    <!-- 创建活动表单 -->
    <div class="create-section">
      <div class="section-header">
        <h2>
          <i class="el-icon-plus"></i>
          创建新活动
        </h2>
      </div>

      <el-form :model="activityForm" :rules="rules" ref="activityForm" label-width="100px" class="activity-form">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="活动名称" prop="activityName">
              <el-input v-model="activityForm.activityName" placeholder="请输入活动名称"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="活动类型" prop="activityType">
              <el-select v-model="activityForm.activityType" placeholder="请选择活动类型" style="width: 100%">
                <el-option label="运动活动" value="sports">
                  <i class="el-icon-basketball" style="color: #409EFF; margin-right: 5px;"></i>运动活动
                </el-option>
                <el-option label="健康班会" value="classMeeting">
                  <i class="el-icon-s-management" style="color: #67C23A; margin-right: 5px;"></i>健康班会
                </el-option>
                <el-option label="户外活动" value="outdoor">
                  <i class="el-icon-sunny" style="color: #E6A23C; margin-right: 5px;"></i>户外活动
                </el-option>
                <el-option label="健康讲座" value="lecture">
                  <i class="el-icon-microphone" style="color: #909399; margin-right: 5px;"></i>健康讲座
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="开始时间" prop="startTime">
              <el-date-picker
                v-model="activityForm.startTime"
                type="datetime"
                placeholder="选择开始时间"
                style="width: 100%">
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结束时间" prop="endTime">
              <el-date-picker
                v-model="activityForm.endTime"
                type="datetime"
                placeholder="选择结束时间"
                style="width: 100%">
              </el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="活动地点" prop="location">
              <el-input v-model="activityForm.location" placeholder="请输入活动地点"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="参与人数" prop="maxParticipants">
              <el-input-number v-model="activityForm.maxParticipants" :min="1" :max="100" style="width: 100%"></el-input-number>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="活动描述" prop="description">
          <el-input
            type="textarea"
            :rows="3"
            v-model="activityForm.description"
            placeholder="请描述活动内容、目的和注意事项">
          </el-input>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" icon="el-icon-plus" @click="submitActivity">创建活动</el-button>
          <el-button icon="el-icon-refresh" @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 活动列表 -->
    <div class="activity-list-section">
      <div class="section-header">
        <h2>
          <i class="el-icon-list"></i>
          活动列表
        </h2>
        <div class="section-actions">
          <el-radio-group v-model="activityFilter" size="small">
            <el-radio-button label="all">全部</el-radio-button>
            <el-radio-button label="upcoming">即将开始</el-radio-button>
            <el-radio-button label="ongoing">进行中</el-radio-button>
            <el-radio-button label="completed">已完成</el-radio-button>
          </el-radio-group>
        </div>
      </div>

      <div class="activity-grid">
        <div v-for="activity in filteredActivities" :key="activity.id" class="activity-card" :class="activity.status">
          <div class="activity-header">
            <el-tag :type="getTypeTag(activity.activityType)" size="small">{{ getTypeText(activity.activityType) }}</el-tag>
            <el-tag :type="getStatusTag(activity.status)" effect="dark" size="small">{{ getStatusText(activity.status) }}</el-tag>
          </div>
          <div class="activity-body">
            <h3 class="activity-name">{{ activity.activityName }}</h3>
            <p class="activity-desc">{{ activity.description }}</p>
            <div class="activity-info">
              <span><i class="el-icon-time"></i>{{ formatDateTime(activity.startTime) }}</span>
              <span><i class="el-icon-location"></i>{{ activity.location }}</span>
            </div>
            <div class="activity-stats">
              <div class="stat-item">
                <span class="stat-label">报名人数</span>
                <span class="stat-value">{{ activity.registeredCount }}/{{ activity.maxParticipants }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">签到人数</span>
                <span class="stat-value">{{ activity.checkedInCount }}</span>
              </div>
            </div>
            <el-progress :percentage="getParticipationRate(activity)" :color="getProgressColor(activity.status)"></el-progress>
          </div>
          <div class="activity-footer">
            <el-button 
              v-if="activity.status === 'upcoming'" 
              type="primary" 
              size="small" 
              icon="el-icon-user"
              @click="viewRegistrations(activity)">
              报名管理
            </el-button>
            <el-button 
              v-if="activity.status === 'ongoing'" 
              type="success" 
              size="small" 
              icon="el-icon-check"
              @click="handleCheckIn(activity)">
              活动签到
            </el-button>
            <el-button 
              v-if="activity.status === 'completed'" 
              type="info" 
              size="small" 
              icon="el-icon-document"
              @click="viewSummary(activity)">
              活动总结
            </el-button>
            <el-button type="danger" size="small" icon="el-icon-delete" @click="deleteActivity(activity)">删除</el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 报名管理对话框 -->
    <el-dialog title="报名管理" :visible.sync="registrationDialogVisible" width="600px">
      <div class="registration-stats">
        <span>已报名: {{ currentActivity.registeredCount || 0 }}人</span>
        <span>名额限制: {{ currentActivity.maxParticipants }}人</span>
        <span>剩余名额: {{ (currentActivity.maxParticipants || 0) - (currentActivity.registeredCount || 0) }}人</span>
      </div>
      <el-table :data="registrationList" style="width: 100%" border>
        <el-table-column prop="studentName" label="学生姓名" width="120"></el-table-column>
        <el-table-column prop="registerTime" label="报名时间" width="150">
          <template slot-scope="scope">
            {{ formatDateTime(scope.row.registerTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status === 'confirmed' ? 'success' : 'warning'" size="small">
              {{ scope.row.status === 'confirmed' ? '已确认' : '待确认' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template slot-scope="scope">
            <el-button 
              v-if="scope.row.status !== 'confirmed'" 
              type="primary" 
              size="mini" 
              @click="confirmRegistration(scope.row)">确认</el-button>
            <el-button type="danger" size="mini" @click="cancelRegistration(scope.row)">取消</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <!-- 签到对话框 -->
    <el-dialog title="活动签到" :visible.sync="checkInDialogVisible" width="500px">
      <div class="check-in-form">
        <el-select v-model="selectedStudent" filterable placeholder="选择学生进行签到" style="width: 100%; margin-bottom: 15px;">
          <el-option
            v-for="student in studentList"
            :key="student.id"
            :label="student.name"
            :value="student.id">
          </el-option>
        </el-select>
        <el-button type="primary" icon="el-icon-check" @click="confirmCheckIn" style="width: 100%">确认签到</el-button>
      </div>
      <div class="checked-in-list" style="margin-top: 20px;">
        <h4>已签到学生 ({{ checkedInStudents.length }}人)</h4>
        <el-tag v-for="student in checkedInStudents" :key="student.id" style="margin: 5px;">{{ student.name }}</el-tag>
      </div>
    </el-dialog>

    <!-- 活动总结对话框 -->
    <el-dialog title="活动总结" :visible.sync="summaryDialogVisible" width="600px">
      <el-form :model="summaryForm" label-width="100px">
        <el-form-item label="活动效果">
          <el-rate v-model="summaryForm.effectiveness" show-text></el-rate>
        </el-form-item>
        <el-form-item label="参与情况">
          <el-input type="textarea" :rows="3" v-model="summaryForm.participation" placeholder="描述学生的参与情况"></el-input>
        </el-form-item>
        <el-form-item label="活动亮点">
          <el-input type="textarea" :rows="3" v-model="summaryForm.highlights" placeholder="记录活动中的亮点"></el-input>
        </el-form-item>
        <el-form-item label="改进建议">
          <el-input type="textarea" :rows="3" v-model="summaryForm.suggestions" placeholder="记录需要改进的地方"></el-input>
        </el-form-item>
        <el-form-item label="活动照片">
          <el-upload
            action="#"
            list-type="picture-card"
            :auto-upload="false">
            <i class="el-icon-plus"></i>
          </el-upload>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="summaryDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveSummary">保存总结</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'ClassActivity',
  data() {
    return {
      activityForm: {
        activityName: '',
        activityType: '',
        startTime: new Date(),
        endTime: '',
        location: '',
        maxParticipants: 30,
        description: ''
      },
      rules: {
        activityName: [{ required: true, message: '请输入活动名称', trigger: 'blur' }],
        activityType: [{ required: true, message: '请选择活动类型', trigger: 'change' }],
        startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
        endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }],
        location: [{ required: true, message: '请输入活动地点', trigger: 'blur' }],
        description: [{ required: true, message: '请填写活动描述', trigger: 'blur' }]
      },
      studentList: [
        { id: 1, name: '张三' },
        { id: 2, name: '李四' },
        { id: 3, name: '王五' },
        { id: 4, name: '赵六' },
        { id: 5, name: '钱七' }
      ],
      activities: [
        {
          id: 1,
          activityName: '春季运动会',
          activityType: 'sports',
          startTime: '2024-03-15 08:00:00',
          endTime: '2024-03-15 12:00:00',
          location: '学校操场',
          maxParticipants: 50,
          description: '班级春季运动会，包含跑步、跳远、接力等项目',
          status: 'upcoming',
          registeredCount: 35,
          checkedInCount: 0
        },
        {
          id: 2,
          activityName: '健康饮食习惯班会',
          activityType: 'classMeeting',
          startTime: '2024-01-15 14:00:00',
          endTime: '2024-01-15 15:30:00',
          location: '教室',
          maxParticipants: 40,
          description: '学习健康饮食知识，培养良好饮食习惯',
          status: 'ongoing',
          registeredCount: 38,
          checkedInCount: 35
        },
        {
          id: 3,
          activityName: '户外徒步活动',
          activityType: 'outdoor',
          startTime: '2024-01-10 09:00:00',
          endTime: '2024-01-10 11:00:00',
          location: '城市公园',
          maxParticipants: 30,
          description: '班级户外徒步，增强体质，亲近自然',
          status: 'completed',
          registeredCount: 28,
          checkedInCount: 26
        }
      ],
      activityFilter: 'all',
      registrationDialogVisible: false,
      checkInDialogVisible: false,
      summaryDialogVisible: false,
      currentActivity: {},
      registrationList: [
        { id: 1, studentId: 1, studentName: '张三', registerTime: '2024-01-10 10:00:00', status: 'confirmed' },
        { id: 2, studentId: 2, studentName: '李四', registerTime: '2024-01-10 10:30:00', status: 'pending' },
        { id: 3, studentId: 3, studentName: '王五', registerTime: '2024-01-10 11:00:00', status: 'confirmed' }
      ],
      selectedStudent: '',
      checkedInStudents: [],
      summaryForm: {
        effectiveness: 5,
        participation: '',
        highlights: '',
        suggestions: ''
      }
    };
  },
  computed: {
    upcomingActivitiesCount() {
      return this.activities.filter(a => a.status === 'upcoming').length;
    },
    ongoingActivitiesCount() {
      return this.activities.filter(a => a.status === 'ongoing').length;
    },
    completedActivitiesCount() {
      return this.activities.filter(a => a.status === 'completed').length;
    },
    filteredActivities() {
      if (this.activityFilter === 'all') {
        return this.activities;
      }
      return this.activities.filter(a => a.status === this.activityFilter);
    }
  },
  methods: {
    submitActivity() {
      this.$refs.activityForm.validate(valid => {
        if (valid) {
          const newActivity = {
            id: Date.now(),
            ...this.activityForm,
            startTime: this.activityForm.startTime.toISOString(),
            endTime: this.activityForm.endTime.toISOString(),
            status: 'upcoming',
            registeredCount: 0,
            checkedInCount: 0
          };
          this.activities.unshift(newActivity);
          this.$message.success('活动创建成功！');
          this.resetForm();
        }
      });
    },
    resetForm() {
      this.$refs.activityForm.resetFields();
      this.activityForm.startTime = new Date();
      this.activityForm.maxParticipants = 30;
    },
    viewRegistrations(activity) {
      this.currentActivity = activity;
      this.registrationDialogVisible = true;
    },
    confirmRegistration(registration) {
      registration.status = 'confirmed';
      this.$message.success('报名确认成功！');
    },
    cancelRegistration(registration) {
      const index = this.registrationList.findIndex(r => r.id === registration.id);
      if (index > -1) {
        this.registrationList.splice(index, 1);
        this.currentActivity.registeredCount--;
        this.$message.success('报名已取消！');
      }
    },
    handleCheckIn(activity) {
      this.currentActivity = activity;
      this.checkInDialogVisible = true;
      this.selectedStudent = '';
      this.checkedInStudents = [];
    },
    confirmCheckIn() {
      if (!this.selectedStudent) {
        this.$message.warning('请选择学生');
        return;
      }
      const student = this.studentList.find(s => s.id === this.selectedStudent);
      if (student && !this.checkedInStudents.find(s => s.id === student.id)) {
        this.checkedInStudents.push(student);
        this.currentActivity.checkedInCount++;
        this.$message.success(`${student.name} 签到成功！`);
        this.selectedStudent = '';
      }
    },
    viewSummary(activity) {
      this.currentActivity = activity;
      this.summaryDialogVisible = true;
    },
    saveSummary() {
      this.$message.success('活动总结保存成功！');
      this.summaryDialogVisible = false;
    },
    deleteActivity(activity) {
      this.$confirm('确定删除该活动吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const index = this.activities.findIndex(a => a.id === activity.id);
        if (index > -1) {
          this.activities.splice(index, 1);
          this.$message.success('删除成功！');
        }
      });
    },
    formatDateTime(datetime) {
      if (!datetime) return '';
      const d = new Date(datetime);
      return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    },
    getTypeTag(type) {
      const typeMap = {
        sports: 'primary',
        classMeeting: 'success',
        outdoor: 'warning',
        lecture: 'info'
      };
      return typeMap[type] || 'info';
    },
    getTypeText(type) {
      const typeMap = {
        sports: '运动活动',
        classMeeting: '健康班会',
        outdoor: '户外活动',
        lecture: '健康讲座'
      };
      return typeMap[type] || type;
    },
    getStatusTag(status) {
      const statusMap = {
        upcoming: 'info',
        ongoing: 'primary',
        completed: 'success'
      };
      return statusMap[status] || 'info';
    },
    getStatusText(status) {
      const statusMap = {
        upcoming: '即将开始',
        ongoing: '进行中',
        completed: '已完成'
      };
      return statusMap[status] || status;
    },
    getParticipationRate(activity) {
      if (!activity.maxParticipants) return 0;
      return Math.round((activity.registeredCount / activity.maxParticipants) * 100);
    },
    getProgressColor(status) {
      const colorMap = {
        upcoming: '#409EFF',
        ongoing: '#67C23A',
        completed: '#909399'
      };
      return colorMap[status] || '#409EFF';
    }
  }
};
</script>

<style scoped>
.class-activity {
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
  color: #67C23A;
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

.stats-icon.blue {
  background: linear-gradient(135deg, #409EFF 0%, #6BCBFF 100%);
}

.stats-icon.green {
  background: linear-gradient(135deg, #67C23A 0%, #95D475 100%);
}

.stats-icon.orange {
  background: linear-gradient(135deg, #E6A23C 0%, #F5C878 100%);
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
  color: #67C23A;
}

.section-actions {
  display: flex;
  align-items: center;
}

/* 区块样式 */
.create-section,
.activity-list-section {
  background: #fff;
  border-radius: 15px;
  padding: 25px;
  margin-bottom: 25px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

.activity-form {
  margin-top: 20px;
}

/* 活动网格 */
.activity-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.activity-card {
  background: #f9f9f9;
  border-radius: 12px;
  padding: 20px;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.activity-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.activity-card.upcoming {
  border-color: #409EFF;
}

.activity-card.ongoing {
  border-color: #67C23A;
}

.activity-card.completed {
  border-color: #909399;
  opacity: 0.8;
}

.activity-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
}

.activity-body {
  margin-bottom: 15px;
}

.activity-name {
  font-size: 18px;
  color: #333;
  margin: 0 0 10px;
}

.activity-desc {
  font-size: 14px;
  color: #666;
  margin: 0 0 15px;
  line-height: 1.5;
}

.activity-info {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
  font-size: 13px;
  color: #888;
}

.activity-info i {
  margin-right: 5px;
  color: #409EFF;
}

.activity-stats {
  display: flex;
  gap: 30px;
  margin-bottom: 15px;
}

.stat-item {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 12px;
  color: #888;
}

.stat-value {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.activity-footer {
  display: flex;
  gap: 10px;
}

/* 报名统计 */
.registration-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 8px;
}

.registration-stats span {
  font-size: 14px;
  color: #666;
}

/* 签到表单 */
.check-in-form {
  padding: 20px;
}

.checked-in-list h4 {
  margin-bottom: 10px;
  color: #333;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .class-activity {
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

  .activity-grid {
    grid-template-columns: 1fr;
  }

  .activity-footer {
    flex-wrap: wrap;
  }
}
</style>
