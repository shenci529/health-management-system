<template>
  <div class="sports-ranking">
    <el-card class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h2>班级运动排行</h2>
          <p class="subtitle">打卡数据统计、积分排行榜、班级对比</p>
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
          <el-select v-model="rankingType" placeholder="排行类型" style="width: 150px; margin-right: 10px">
            <el-option label="周排行" value="week" />
            <el-option label="月排行" value="month" />
            <el-option label="学期排行" value="semester" />
          </el-select>
          <el-button type="primary" icon="el-icon-download" @click="handleExport">导出</el-button>
        </div>
      </div>
    </el-card>

    <el-row :gutter="20">
      <el-col :span="8">
        <el-card class="ranking-card">
          <div slot="header">
            <i class="el-icon-trophy" style="color: #FFD700; margin-right: 5px"></i>
            <span>班级积分排行 TOP10</span>
          </div>
          <div class="ranking-list">
            <div v-for="(item, index) in classRanking" :key="index" class="ranking-item" :class="{ 'top3': index < 3 }">
              <div class="rank-number">{{ index + 1 }}</div>
              <div class="rank-info">
                <div class="rank-name">{{ item.className }}</div>
                <div class="rank-detail">参与率 {{ item.participationRate }}%</div>
              </div>
              <div class="rank-score">{{ item.score }}分</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card class="ranking-card">
          <div slot="header">
            <i class="el-icon-user" style="color: #409EFF; margin-right: 5px"></i>
            <span>个人运动达人 TOP10</span>
          </div>
          <div class="ranking-list">
            <div v-for="(item, index) in studentRanking" :key="index" class="ranking-item" :class="{ 'top3': index < 3 }">
              <div class="rank-number">{{ index + 1 }}</div>
              <div class="rank-avatar">
                <el-avatar :size="40" :src="item.avatar">{{ item.name.charAt(0) }}</el-avatar>
              </div>
              <div class="rank-info">
                <div class="rank-name">{{ item.name }}</div>
                <div class="rank-detail">{{ item.className }}</div>
              </div>
              <div class="rank-score">{{ item.score }}分</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card class="ranking-card">
          <div slot="header">
            <i class="el-icon-data-line" style="color: #67C23A; margin-right: 5px"></i>
            <span>运动项目热度排行</span>
          </div>
          <div class="ranking-list">
            <div v-for="(item, index) in activityRanking" :key="index" class="ranking-item">
              <div class="rank-number">{{ index + 1 }}</div>
              <div class="rank-info">
                <div class="rank-name">{{ item.name }}</div>
                <div class="rank-detail">参与人数 {{ item.count }}人</div>
              </div>
              <div class="rank-score">{{ item.percentage }}%</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="chart-card">
      <div slot="header">
        <i class="el-icon-bar-chart"></i>
        <span>班级运动数据对比</span>
      </div>
      <div class="chart-container">
        <div class="bar-chart">
          <div v-for="(item, index) in classRanking.slice(0, 5)" :key="index" class="bar-item">
            <div class="bar-label">{{ item.className }}</div>
            <div class="bar-wrapper">
              <div class="bar" :style="{ width: item.score / 10 + '%', backgroundColor: getBarColor(index) }"></div>
            </div>
            <div class="bar-value">{{ item.score }}分</div>
          </div>
        </div>
      </div>
    </el-card>

    <el-card class="stats-card">
      <div slot="header">
        <i class="el-icon-document"></i>
        <span>运动数据统计概览</span>
      </div>
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-icon" style="background: #409EFF;">
              <i class="el-icon-user"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.totalStudents }}</div>
              <div class="stat-label">参与学生总数</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-icon" style="background: #67C23A;">
              <i class="el-icon-check"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.totalCheckins }}</div>
              <div class="stat-label">累计打卡次数</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-icon" style="background: #E6A23C;">
              <i class="el-icon-time"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.avgDuration }}分钟</div>
              <div class="stat-label">平均运动时长</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-icon" style="background: #F56C6C;">
              <i class="el-icon-star-on"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.participationRate }}%</div>
              <div class="stat-label">整体参与率</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'SportsRanking',
  data() {
    return {
      dateRange: [],
      rankingType: 'week',
      classRanking: [
        { className: '三年级一班', score: 98.5, participationRate: 100 },
        { className: '四年级二班', score: 95.2, participationRate: 98 },
        { className: '二年级三班', score: 92.8, participationRate: 95 },
        { className: '五年级一班', score: 90.1, participationRate: 92 },
        { className: '一年级二班', score: 88.6, participationRate: 90 },
        { className: '六年级三班', score: 85.3, participationRate: 88 },
        { className: '三年级二班', score: 82.1, participationRate: 85 },
        { className: '四年级一班', score: 79.5, participationRate: 82 },
        { className: '二年级一班', score: 76.8, participationRate: 80 },
        { className: '五年级二班', score: 73.2, participationRate: 78 }
      ],
      studentRanking: [
        { name: '张小明', className: '三年级一班', score: 156, avatar: '' },
        { name: '李华', className: '四年级二班', score: 148, avatar: '' },
        { name: '王芳', className: '二年级三班', score: 142, avatar: '' },
        { name: '刘强', className: '五年级一班', score: 138, avatar: '' },
        { name: '陈静', className: '一年级二班', score: 135, avatar: '' },
        { name: '赵伟', className: '六年级三班', score: 128, avatar: '' },
        { name: '孙丽', className: '三年级二班', score: 122, avatar: '' },
        { name: '周明', className: '四年级一班', score: 118, avatar: '' },
        { name: '吴娜', className: '二年级一班', score: 112, avatar: '' },
        { name: '郑凯', className: '五年级二班', score: 105, avatar: '' }
      ],
      activityRanking: [
        { name: '跑步', count: 356, percentage: 85 },
        { name: '跳绳', count: 289, percentage: 72 },
        { name: '篮球', count: 245, percentage: 61 },
        { name: '足球', count: 198, percentage: 50 },
        { name: '游泳', count: 156, percentage: 39 },
        { name: '乒乓球', count: 128, percentage: 32 },
        { name: '羽毛球', count: 98, percentage: 25 },
        { name: '体操', count: 76, percentage: 19 }
      ],
      stats: {
        totalStudents: 425,
        totalCheckins: 3568,
        avgDuration: 45,
        participationRate: 92
      }
    }
  },
  methods: {
    getBarColor(index) {
      const colors = ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399'];
      return colors[index] || '#409EFF';
    },
    handleExport() {
      this.$message.success('导出排行榜数据成功');
    }
  }
}
</script>

<style scoped>
.sports-ranking {
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
  margin: 0;
  font-size: 24px;
  color: #303133;
}

.subtitle {
  margin: 5px 0 0;
  font-size: 14px;
  color: #909399;
}

.ranking-card {
  margin-bottom: 20px;
}

.ranking-list {
  max-height: 400px;
  overflow-y: auto;
}

.ranking-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #EBEEF5;
}

.ranking-item:last-child {
  border-bottom: none;
}

.ranking-item.top3 {
  background: linear-gradient(90deg, #FFF9E6, transparent);
}

.rank-number {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #F0F2F5;
  color: #606266;
  font-weight: bold;
  margin-right: 15px;
}

.ranking-item.top3 .rank-number {
  background: linear-gradient(135deg, #FFD700, #FFA500);
  color: white;
}

.rank-avatar {
  margin-right: 10px;
}

.rank-info {
  flex: 1;
}

.rank-name {
  font-size: 16px;
  color: #303133;
  font-weight: 500;
}

.rank-detail {
  font-size: 12px;
  color: #909399;
  margin-top: 3px;
}

.rank-score {
  font-size: 18px;
  color: #409EFF;
  font-weight: bold;
}

.chart-card {
  margin-bottom: 20px;
}

.chart-container {
  padding: 20px;
}

.bar-chart {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.bar-item {
  display: flex;
  align-items: center;
}

.bar-label {
  width: 120px;
  font-size: 14px;
  color: #606266;
}

.bar-wrapper {
  flex: 1;
  height: 24px;
  background: #F0F2F5;
  border-radius: 4px;
  overflow: hidden;
}

.bar {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s;
}

.bar-value {
  width: 60px;
  text-align: right;
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}

.stats-card {
  margin-bottom: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  padding: 20px;
  background: #F5F7FA;
  border-radius: 8px;
}

.stat-icon {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  color: white;
  font-size: 24px;
  margin-right: 15px;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  color: #303133;
  font-weight: bold;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 5px;
}
</style>