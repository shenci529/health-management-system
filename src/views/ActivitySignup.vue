<template>
  <div class="activity-signup">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="title">
        <i class="el-icon-basketball"></i>
        校园活动报名
      </h1>
      <p class="subtitle">丰富多彩的校园活动，等你来参加</p>
    </div>

    <!-- 活动筛选 -->
    <div class="filter-section">
      <div class="filter-row">
        <div class="filter-group">
          <span class="filter-label">活动类型：</span>
          <el-radio-group v-model="filterType" size="small">
            <el-radio-button label="all">全部</el-radio-button>
            <el-radio-button label="sports">体育运动</el-radio-button>
            <el-radio-button label="art">艺术文化</el-radio-button>
            <el-radio-button label="science">科技创造</el-radio-button>
            <el-radio-button label="social">社会实践</el-radio-button>
          </el-radio-group>
        </div>
        <div class="filter-group">
          <span class="filter-label">活动状态：</span>
          <el-radio-group v-model="filterStatus" size="small">
            <el-radio-button label="all">全部</el-radio-button>
            <el-radio-button label="signup">报名中</el-radio-button>
            <el-radio-button label="ongoing">进行中</el-radio-button>
            <el-radio-button label="ended">已结束</el-radio-button>
          </el-radio-group>
        </div>
      </div>
    </div>

    <!-- 活动列表 -->
    <div class="activity-list">
      <div v-for="activity in filteredActivities" :key="activity.id" class="activity-card">
        <div class="activity-image">
          <div class="image-placeholder" :class="activity.type">
            <i :class="typeIcon(activity.type)"></i>
          </div>
          <div class="activity-status" :class="activity.status">
            {{ statusText(activity.status) }}
          </div>
        </div>
        <div class="activity-content">
          <div class="activity-header">
            <h3 class="activity-title">{{ activity.title }}</h3>
            <el-tag size="small" :type="typeTag(activity.type)">
              {{ typeText(activity.type) }}
            </el-tag>
          </div>
          <p class="activity-desc">{{ activity.description }}</p>
          <div class="activity-meta">
            <div class="meta-item">
              <i class="el-icon-time"></i>
              <span>{{ activity.time }}</span>
            </div>
            <div class="meta-item">
              <i class="el-icon-location"></i>
              <span>{{ activity.location }}</span>
            </div>
            <div class="meta-item">
              <i class="el-icon-user"></i>
              <span>{{ activity.signedCount }}/{{ activity.maxCount }}人</span>
            </div>
          </div>
          <div class="activity-progress">
            <el-progress 
              :percentage="(activity.signedCount / activity.maxCount) * 100" 
              :color="progressColor"
              :show-text="false"
              :stroke-width="6">
            </el-progress>
            <span class="progress-text">已报名 {{ activity.signedCount }}/{{ activity.maxCount }}人</span>
          </div>
          <div class="activity-footer">
            <div class="signup-deadline">
              <i class="el-icon-alarm-clock"></i>
              报名截止：{{ activity.deadline }}
            </div>
            <el-button 
              :type="activity.isSigned ? 'success' : 'primary'"
              :disabled="activity.status !== 'signup' || activity.isFull"
              @click="handleSignup(activity)">
              {{ signupButtonText(activity) }}
            </el-button>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="filteredActivities.length === 0" class="empty-state">
        <i class="el-icon-box"></i>
        <p>暂无符合条件的活动</p>
      </div>
    </div>

    <!-- 活动详情弹窗 -->
    <el-dialog
      :title="currentActivity?.title"
      :visible.sync="detailDialogVisible"
      width="600px">
      <div v-if="currentActivity" class="activity-detail">
        <div class="detail-image">
          <div class="image-placeholder large" :class="currentActivity.type">
            <i :class="typeIcon(currentActivity.type)"></i>
          </div>
        </div>
        <div class="detail-section">
          <h4><i class="el-icon-document"></i> 活动简介</h4>
          <p>{{ currentActivity.description }}</p>
        </div>
        <div class="detail-section">
          <h4><i class="el-icon-info"></i> 活动信息</h4>
          <div class="detail-info">
            <div class="info-row">
              <span class="info-label">活动时间：</span>
              <span>{{ currentActivity.time }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">活动地点：</span>
              <span>{{ currentActivity.location }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">报名截止：</span>
              <span>{{ currentActivity.deadline }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">活动人数：</span>
              <span>{{ currentActivity.maxCount }}人</span>
            </div>
            <div class="info-row">
              <span class="info-label">已报名：</span>
              <span>{{ currentActivity.signedCount }}人</span>
            </div>
          </div>
        </div>
        <div class="detail-section">
          <h4><i class="el-icon-s-custom"></i> 组织者</h4>
          <div class="organizer-info">
            <el-avatar :size="50" icon="el-icon-user-solid"></el-avatar>
            <div class="organizer-detail">
              <div class="organizer-name">{{ currentActivity.organizer }}</div>
              <div class="organizer-contact">
                <i class="el-icon-phone"></i> {{ currentActivity.contact }}
              </div>
            </div>
          </div>
        </div>
        <div class="detail-section" v-if="currentActivity.requirements">
          <h4><i class="el-icon-warning"></i> 参与要求</h4>
          <ul class="requirements-list">
            <li v-for="(req, index) in currentActivity.requirements" :key="index">
              {{ req }}
            </li>
          </ul>
        </div>
      </div>
      <div slot="footer">
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button 
          :type="currentActivity?.isSigned ? 'success' : 'primary'"
          :disabled="currentActivity?.status !== 'signup' || currentActivity?.isFull"
          @click="confirmSignup">
          {{ signupButtonText(currentActivity) }}
        </el-button>
      </div>
    </el-dialog>

    <!-- 报名记录 -->
    <div class="signup-records">
      <div class="section-header">
        <div class="section-icon">
          <i class="el-icon-time"></i>
        </div>
        <span class="section-title">我的报名记录</span>
      </div>

      <div class="records-list">
        <div v-for="record in mySignups" :key="record.id" class="record-item">
          <div class="record-status" :class="record.status">
            <i :class="recordStatusIcon(record.status)"></i>
          </div>
          <div class="record-content">
            <div class="record-title">{{ record.activityTitle }}</div>
            <div class="record-meta">
              <span><i class="el-icon-time"></i> {{ record.time }}</span>
              <span><i class="el-icon-location"></i> {{ record.location }}</span>
            </div>
            <div class="record-signup-time">
              报名时间：{{ record.signupTime }}
            </div>
          </div>
          <div class="record-actions">
            <el-button 
              v-if="record.status === 'upcoming'" 
              type="danger" 
              size="small"
              plain
              @click="cancelSignup(record.id)">
              取消报名
            </el-button>
            <el-tag v-else :type="recordStatusTag(record.status)">
              {{ recordStatusText(record.status) }}
            </el-tag>
          </div>
        </div>

        <div v-if="mySignups.length === 0" class="empty-state">
          <i class="el-icon-document"></i>
          <p>暂无报名记录</p>
          <span class="empty-tip">快去报名感兴趣的活动吧！</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ActivitySignup',
  data() {
    return {
      filterType: 'all',
      filterStatus: 'all',
      detailDialogVisible: false,
      currentActivity: null,
      progressColor: ['#67C23A', '#E6A23C', '#F56C6C'],
      activities: [
        {
          id: 1,
          title: '春季运动会',
          description: '一年一度的春季运动会，包含田径、跳远、投掷等多个项目，欢迎同学们踊跃参加！',
          type: 'sports',
          status: 'signup',
          time: '2024年6月15日 08:00-17:00',
          location: '学校操场',
          maxCount: 200,
          signedCount: 156,
          deadline: '2024年6月10日',
          organizer: '体育组',
          contact: '13800138000',
          requirements: ['穿着运动服', '携带水杯', '提前做好热身'],
          isSigned: false,
          isFull: false
        },
        {
          id: 2,
          title: '校园歌手大赛',
          description: '展示你的歌喉，唱响青春旋律！校园歌手大赛等你来战！',
          type: 'art',
          status: 'signup',
          time: '2024年6月20日 14:00-17:00',
          location: '学校礼堂',
          maxCount: 50,
          signedCount: 48,
          deadline: '2024年6月15日',
          organizer: '音乐组',
          contact: '13900139000',
          requirements: ['准备一首歌曲', '提前30分钟到场'],
          isSigned: true,
          isFull: false
        },
        {
          id: 3,
          title: '机器人编程工作坊',
          description: '学习机器人编程基础，动手制作属于自己的机器人！',
          type: 'science',
          status: 'signup',
          time: '2024年6月18日 09:00-11:30',
          location: '科技楼实验室',
          maxCount: 30,
          signedCount: 30,
          deadline: '2024年6月12日',
          organizer: '科技组',
          contact: '13700137000',
          requirements: ['对编程感兴趣', '自带笔记本电脑'],
          isSigned: false,
          isFull: true
        },
        {
          id: 4,
          title: '环保志愿者活动',
          description: '参与校园环保行动，共同守护绿色家园。',
          type: 'social',
          status: 'ongoing',
          time: '2024年6月8日 14:00-16:00',
          location: '校园各区域',
          maxCount: 100,
          signedCount: 85,
          deadline: '2024年6月7日',
          organizer: '学生会',
          contact: '13600136000',
          requirements: ['穿着校服', '携带垃圾袋'],
          isSigned: false,
          isFull: false
        },
        {
          id: 5,
          title: '书法比赛',
          description: '弘扬传统文化，展示书法魅力。',
          type: 'art',
          status: 'ended',
          time: '2024年5月20日',
          location: '美术教室',
          maxCount: 40,
          signedCount: 38,
          deadline: '2024年5月15日',
          organizer: '美术组',
          contact: '13500135000',
          requirements: ['自带毛笔'],
          isSigned: true,
          isFull: false
        },
        {
          id: 6,
          title: '篮球友谊赛',
          description: '班级篮球友谊赛，增进同学友谊！',
          type: 'sports',
          status: 'signup',
          time: '2024年6月22日 15:00-17:00',
          location: '篮球场',
          maxCount: 40,
          signedCount: 32,
          deadline: '2024年6月18日',
          organizer: '体育组',
          contact: '13800138000',
          requirements: ['穿着篮球鞋', '组队参加'],
          isSigned: false,
          isFull: false
        }
      ],
      mySignups: [
        {
          id: 1,
          activityId: 2,
          activityTitle: '校园歌手大赛',
          time: '2024年6月20日 14:00-17:00',
          location: '学校礼堂',
          signupTime: '2024-06-05 10:30',
          status: 'upcoming'
        },
        {
          id: 2,
          activityId: 5,
          activityTitle: '书法比赛',
          time: '2024年5月20日',
          location: '美术教室',
          signupTime: '2024-05-10 14:20',
          status: 'completed'
        }
      ]
    };
  },
  computed: {
    filteredActivities() {
      let result = this.activities;
      
      // 按类型筛选
      if (this.filterType !== 'all') {
        result = result.filter(a => a.type === this.filterType);
      }
      
      // 按状态筛选
      if (this.filterStatus !== 'all') {
        result = result.filter(a => a.status === this.filterStatus);
      }
      
      return result;
    }
  },
  methods: {
    // 查看活动详情
    viewDetail(activity) {
      this.currentActivity = activity;
      this.detailDialogVisible = true;
    },
    // 报名
    handleSignup(activity) {
      this.currentActivity = activity;
      this.confirmSignup();
    },
    // 确认报名
    confirmSignup() {
      if (this.currentActivity.isSigned) {
        this.$message.warning('您已报名该活动');
        return;
      }
      
      this.$confirm(`确定要报名"${this.currentActivity.title}"吗？`, '确认报名', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }).then(() => {
        this.currentActivity.isSigned = true;
        this.currentActivity.signedCount++;
        
        // 添加到我的报名记录
        this.mySignups.unshift({
          id: Date.now(),
          activityId: this.currentActivity.id,
          activityTitle: this.currentActivity.title,
          time: this.currentActivity.time,
          location: this.currentActivity.location,
          signupTime: new Date().toLocaleString(),
          status: 'upcoming'
        });
        
        this.$message.success('报名成功！');
        this.detailDialogVisible = false;
      }).catch(() => {});
    },
    // 取消报名
    cancelSignup(signupId) {
      this.$confirm('确定要取消报名吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const index = this.mySignups.findIndex(s => s.id === signupId);
        if (index > -1) {
          const signup = this.mySignups[index];
          // 更新活动报名状态
          const activity = this.activities.find(a => a.id === signup.activityId);
          if (activity) {
            activity.isSigned = false;
            activity.signedCount--;
          }
          this.mySignups.splice(index, 1);
          this.$message.success('已取消报名');
        }
      }).catch(() => {});
    },
    // 类型图标
    typeIcon(type) {
      const map = {
        sports: 'el-icon-basketball',
        art: 'el-icon-magic-stick',
        science: 'el-icon-cpu',
        social: 'el-icon-user-solid'
      };
      return map[type] || 'el-icon-star-on';
    },
    // 类型文本
    typeText(type) {
      const map = {
        sports: '体育运动',
        art: '艺术文化',
        science: '科技创造',
        social: '社会实践'
      };
      return map[type] || type;
    },
    // 类型标签
    typeTag(type) {
      const map = {
        sports: 'success',
        art: 'warning',
        science: 'primary',
        social: 'info'
      };
      return map[type] || '';
    },
    // 状态文本
    statusText(status) {
      const map = {
        signup: '报名中',
        ongoing: '进行中',
        ended: '已结束'
      };
      return map[status] || status;
    },
    // 报名按钮文本
    signupButtonText(activity) {
      if (!activity) return '';
      if (activity.isSigned) return '已报名';
      if (activity.isFull) return '已满员';
      if (activity.status === 'ended') return '已结束';
      if (activity.status === 'ongoing') return '进行中';
      return '立即报名';
    },
    // 记录状态图标
    recordStatusIcon(status) {
      const map = {
        upcoming: 'el-icon-time',
        ongoing: 'el-icon-loading',
        completed: 'el-icon-check',
        cancelled: 'el-icon-close'
      };
      return map[status] || 'el-icon-question';
    },
    // 记录状态标签
    recordStatusTag(status) {
      const map = {
        upcoming: 'primary',
        ongoing: 'warning',
        completed: 'success',
        cancelled: 'info'
      };
      return map[status] || 'info';
    },
    // 记录状态文本
    recordStatusText(status) {
      const map = {
        upcoming: '即将开始',
        ongoing: '进行中',
        completed: '已完成',
        cancelled: '已取消'
      };
      return map[status] || status;
    }
  }
};
</script>

<style scoped>
.activity-signup {
  padding: 20px;
  max-width: 1200px;
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
  color: #67C23A;
  font-size: 32px;
}

.subtitle {
  color: #888;
  font-size: 16px;
  margin-top: 8px;
}

/* 筛选区域 */
.filter-section {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 25px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-label {
  color: #666;
  font-weight: 500;
}

/* 活动列表 */
.activity-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.activity-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.activity-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.activity-image {
  position: relative;
  height: 160px;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 60px;
  color: #fff;
}

.image-placeholder.sports {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.image-placeholder.art {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.image-placeholder.science {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.image-placeholder.social {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.image-placeholder.large {
  height: 200px;
  font-size: 80px;
}

.activity-status {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  color: #fff;
}

.activity-status.signup {
  background: #67C23A;
}

.activity-status.ongoing {
  background: #E6A23C;
}

.activity-status.ended {
  background: #909399;
}

.activity-content {
  padding: 20px;
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.activity-title {
  margin: 0;
  font-size: 18px;
  color: #333;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.activity-desc {
  color: #666;
  font-size: 14px;
  line-height: 1.6;
  margin: 0 0 15px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.activity-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 15px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #999;
  font-size: 13px;
}

.meta-item i {
  color: #409EFF;
}

.activity-progress {
  margin-bottom: 15px;
}

.progress-text {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
  display: block;
}

.activity-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 15px;
  border-top: 1px solid #EBEEF5;
}

.signup-deadline {
  color: #999;
  font-size: 13px;
}

.signup-deadline i {
  color: #E6A23C;
  margin-right: 5px;
}

/* 活动详情 */
.activity-detail {
  padding: 10px;
}

.detail-image {
  margin-bottom: 20px;
}

.detail-section {
  margin-bottom: 25px;
}

.detail-section h4 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 15px;
  color: #333;
  font-size: 16px;
}

.detail-section h4 i {
  color: #409EFF;
}

.detail-section p {
  color: #666;
  line-height: 1.8;
  margin: 0;
}

.detail-info {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
}

.info-row {
  display: flex;
  margin-bottom: 10px;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-label {
  color: #999;
  width: 100px;
  flex-shrink: 0;
}

.organizer-info {
  display: flex;
  align-items: center;
  gap: 15px;
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
}

.organizer-detail {
  flex: 1;
}

.organizer-name {
  font-weight: 500;
  color: #333;
  margin-bottom: 5px;
}

.organizer-contact {
  color: #666;
  font-size: 14px;
}

.organizer-contact i {
  color: #67C23A;
  margin-right: 5px;
}

.requirements-list {
  background: #f8f9fa;
  padding: 15px 20px;
  border-radius: 8px;
  margin: 0;
}

.requirements-list li {
  margin-bottom: 8px;
  color: #666;
}

.requirements-list li:last-child {
  margin-bottom: 0;
}

/* 报名记录 */
.signup-records {
  background: #fff;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #EBEEF5;
}

.section-icon {
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

.section-title {
  font-size: 18px;
  font-weight: 500;
  color: #333;
  flex: 1;
}

.records-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.record-item {
  display: flex;
  align-items: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.record-item:hover {
  background: #f0f2f5;
}

.record-status {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-right: 20px;
  flex-shrink: 0;
}

.record-status.upcoming {
  background: #ecf5ff;
  color: #409EFF;
}

.record-status.ongoing {
  background: #fdf6ec;
  color: #E6A23C;
}

.record-status.completed {
  background: #f0f9eb;
  color: #67C23A;
}

.record-status.cancelled {
  background: #f4f4f5;
  color: #909399;
}

.record-content {
  flex: 1;
}

.record-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
}

.record-meta {
  display: flex;
  gap: 20px;
  color: #999;
  font-size: 13px;
  margin-bottom: 5px;
}

.record-meta i {
  margin-right: 5px;
}

.record-signup-time {
  color: #999;
  font-size: 12px;
}

.record-actions {
  margin-left: 15px;
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

.empty-tip {
  font-size: 14px;
  color: #bbb;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .activity-signup {
    padding: 15px;
  }

  .title {
    font-size: 22px;
  }

  .filter-row {
    flex-direction: column;
    gap: 15px;
  }

  .activity-list {
    grid-template-columns: 1fr;
  }

  .activity-footer {
    flex-direction: column;
    gap: 10px;
    align-items: stretch;
  }

  .record-item {
    flex-direction: column;
    text-align: center;
  }

  .record-status {
    margin-right: 0;
    margin-bottom: 15px;
  }

  .record-actions {
    margin-left: 0;
    margin-top: 15px;
  }
}
</style>
