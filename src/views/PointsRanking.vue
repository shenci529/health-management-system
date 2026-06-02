<template>
  <div class="points-ranking">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="title">
        <i class="el-icon-trophy"></i>
        积分排行榜
      </h1>
      <p class="subtitle">坚持健康打卡，积累积分，争做健康小达人</p>
    </div>

    <!-- 个人积分卡片 -->
    <div class="my-points-card">
      <div class="points-info">
        <div class="points-avatar">
          <el-avatar :size="80" icon="el-icon-user-solid"></el-avatar>
          <div class="rank-badge" v-if="myRank <= 3">
            <i class="el-icon-medal"></i>
          </div>
        </div>
        <div class="points-detail">
          <h3>我的积分</h3>
          <div class="points-number">{{ myPoints }}</div>
          <div class="points-rank">
            <el-tag type="warning" size="medium">
              <i class="el-icon-medal-1"></i> 班级排名：第 {{ myRank }} 名
            </el-tag>
          </div>
        </div>
      </div>
      <div class="points-progress">
        <div class="progress-header">
          <span>距离上一名还差 {{ nextRankPoints }} 分</span>
          <span>{{ progressPercent }}%</span>
        </div>
        <el-progress :percentage="progressPercent" :color="progressColors" :stroke-width="16"></el-progress>
      </div>
    </div>

    <!-- 排行榜切换 -->
    <div class="ranking-tabs">
      <el-radio-group v-model="currentTab" size="large">
        <el-radio-button label="class">
          <i class="el-icon-school"></i> 班级排行
        </el-radio-button>
        <el-radio-button label="grade">
          <i class="el-icon-office-building"></i> 年级排行
        </el-radio-button>
        <el-radio-button label="school">
          <i class="el-icon-s-data"></i> 全校排行
        </el-radio-button>
      </el-radio-group>
    </div>

    <!-- 前三名展示 -->
    <div class="top-three">
      <div class="podium">
        <!-- 第二名 -->
        <div class="podium-item second">
          <div class="podium-avatar">
            <el-avatar :size="70" :src="topThree[1]?.avatar"></el-avatar>
            <div class="rank-number">2</div>
          </div>
          <div class="podium-info">
            <div class="podium-name">{{ topThree[1]?.name }}</div>
            <div class="podium-points">{{ topThree[1]?.points }} 分</div>
          </div>
          <div class="podium-base second-base"></div>
        </div>

        <!-- 第一名 -->
        <div class="podium-item first">
          <div class="crown">
            <i class="el-icon-trophy"></i>
          </div>
          <div class="podium-avatar">
            <el-avatar :size="90" :src="topThree[0]?.avatar"></el-avatar>
            <div class="rank-number">1</div>
          </div>
          <div class="podium-info">
            <div class="podium-name">{{ topThree[0]?.name }}</div>
            <div class="podium-points">{{ topThree[0]?.points }} 分</div>
          </div>
          <div class="podium-base first-base"></div>
        </div>

        <!-- 第三名 -->
        <div class="podium-item third">
          <div class="podium-avatar">
            <el-avatar :size="70" :src="topThree[2]?.avatar"></el-avatar>
            <div class="rank-number">3</div>
          </div>
          <div class="podium-info">
            <div class="podium-name">{{ topThree[2]?.name }}</div>
            <div class="podium-points">{{ topThree[2]?.points }} 分</div>
          </div>
          <div class="podium-base third-base"></div>
        </div>
      </div>
    </div>

    <!-- 排行榜列表 -->
    <div class="ranking-list">
      <div class="list-header">
        <div class="section-icon">
          <i class="el-icon-s-flag"></i>
        </div>
        <span class="section-title">完整榜单</span>
        <div class="list-filter">
          <el-radio-group v-model="timeRange" size="small">
            <el-radio-button label="week">本周</el-radio-button>
            <el-radio-button label="month">本月</el-radio-button>
            <el-radio-button label="total">总榜</el-radio-button>
          </el-radio-group>
        </div>
      </div>

      <div class="ranking-table">
        <div 
          v-for="(item, index) in rankingList" 
          :key="item.id"
          class="ranking-item"
          :class="{ 'is-me': item.isMe, 'top-rank': index < 3 }">
          <div class="rank-number-col">
            <div class="rank-badge-small" :class="`rank-${index + 1}`" v-if="index < 3">
              <i class="el-icon-medal"></i>
            </div>
            <span v-else>{{ index + 1 }}</span>
          </div>
          <div class="rank-avatar">
            <el-avatar :size="50" :src="item.avatar"></el-avatar>
          </div>
          <div class="rank-info">
            <div class="rank-name">{{ item.name }}</div>
            <div class="rank-class">{{ item.class }}</div>
          </div>
          <div class="rank-points">
            <div class="points-value">{{ item.points }}</div>
            <div class="points-label">积分</div>
          </div>
          <div class="rank-trend">
            <el-tag :type="trendType(item.trend)" size="small">
              <i :class="trendIcon(item.trend)"></i>
              {{ Math.abs(item.trend) }}
            </el-tag>
          </div>
        </div>
      </div>
    </div>

    <!-- 积分规则说明 -->
    <div class="rules-section">
      <div class="section-header">
        <div class="section-icon rules-icon">
          <i class="el-icon-question"></i>
        </div>
        <span class="section-title">积分规则</span>
        <el-button type="text" @click="showRulesDialog = true">
          查看全部规则 <i class="el-icon-arrow-right"></i>
        </el-button>
      </div>

      <div class="rules-grid">
        <div class="rule-item">
          <div class="rule-icon daily-icon">
            <i class="el-icon-sunny"></i>
          </div>
          <div class="rule-content">
            <div class="rule-title">每日打卡</div>
            <div class="rule-desc">完成每日健康打卡 +10分</div>
          </div>
        </div>
        <div class="rule-item">
          <div class="rule-icon continuous-icon">
            <i class="el-icon-time"></i>
          </div>
          <div class="rule-content">
            <div class="rule-title">连续打卡</div>
            <div class="rule-desc">连续7天打卡额外 +50分</div>
          </div>
        </div>
        <div class="rule-item">
          <div class="rule-icon exercise-icon">
            <i class="el-icon-basketball"></i>
          </div>
          <div class="rule-content">
            <div class="rule-title">运动打卡</div>
            <div class="rule-desc">完成运动任务 +15分</div>
          </div>
        </div>
        <div class="rule-item">
          <div class="rule-icon knowledge-icon">
            <i class="el-icon-reading"></i>
          </div>
          <div class="rule-content">
            <div class="rule-title">健康知识</div>
            <div class="rule-desc">学习健康知识 +5分</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 积分规则弹窗 -->
    <el-dialog
      title="积分规则说明"
      :visible.sync="showRulesDialog"
      width="600px">
      <div class="rules-dialog-content">
        <div class="rule-category">
          <h4><i class="el-icon-sunny"></i> 日常任务</h4>
          <el-table :data="dailyRules" style="width: 100%">
            <el-table-column prop="task" label="任务内容"></el-table-column>
            <el-table-column prop="points" label="获得积分" width="100">
              <template slot-scope="scope">
                <el-tag type="success">+{{ scope.row.points }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div class="rule-category">
          <h4><i class="el-icon-trophy"></i> 成就奖励</h4>
          <el-table :data="achievementRules" style="width: 100%">
            <el-table-column prop="task" label="成就内容"></el-table-column>
            <el-table-column prop="points" label="获得积分" width="100">
              <template slot-scope="scope">
                <el-tag type="warning">+{{ scope.row.points }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div class="rule-category">
          <h4><i class="el-icon-warning"></i> 注意事项</h4>
          <ul class="rule-notes">
            <li>积分每日凌晨自动结算</li>
            <li>连续打卡中断后需重新计算</li>
            <li>作弊行为将被扣除全部积分</li>
            <li>积分可用于兑换小礼品</li>
          </ul>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'PointsRanking',
  data() {
    return {
      currentTab: 'class',
      timeRange: 'week',
      showRulesDialog: false,
      myPoints: 1250,
      myRank: 5,
      nextRankPoints: 50,
      progressColors: [
        { color: '#f56c6c', percentage: 20 },
        { color: '#e6a23c', percentage: 40 },
        { color: '#5cb87a', percentage: 60 },
        { color: '#1989fa', percentage: 80 },
        { color: '#6f7ad3', percentage: 100 }
      ],
      topThree: [
        { name: '小明', points: 1580, avatar: '' },
        { name: '小红', points: 1420, avatar: '' },
        { name: '小刚', points: 1380, avatar: '' }
      ],
      rankingList: [
        { id: 1, name: '小明', class: '三年级二班', points: 1580, avatar: '', trend: 2, isMe: false },
        { id: 2, name: '小红', class: '三年级二班', points: 1420, avatar: '', trend: -1, isMe: false },
        { id: 3, name: '小刚', class: '三年级二班', points: 1380, avatar: '', trend: 3, isMe: false },
        { id: 4, name: '小丽', class: '三年级二班', points: 1320, avatar: '', trend: 0, isMe: false },
        { id: 5, name: '我', class: '三年级二班', points: 1250, avatar: '', trend: 1, isMe: true },
        { id: 6, name: '小军', class: '三年级二班', points: 1180, avatar: '', trend: -2, isMe: false },
        { id: 7, name: '小芳', class: '三年级二班', points: 1150, avatar: '', trend: 1, isMe: false },
        { id: 8, name: '小华', class: '三年级二班', points: 1100, avatar: '', trend: 0, isMe: false },
        { id: 9, name: '小敏', class: '三年级二班', points: 1050, avatar: '', trend: -1, isMe: false },
        { id: 10, name: '小杰', class: '三年级二班', points: 980, avatar: '', trend: 2, isMe: false }
      ],
      dailyRules: [
        { task: '完成每日健康打卡', points: 10 },
        { task: '完成运动打卡', points: 15 },
        { task: '学习健康知识', points: 5 },
        { task: '参与健康问答', points: 10 },
        { task: '分享健康心得', points: 5 }
      ],
      achievementRules: [
        { task: '连续打卡7天', points: 50 },
        { task: '连续打卡30天', points: 200 },
        { task: '累计打卡100天', points: 500 },
        { task: '获得健康达人称号', points: 100 },
        { task: '班级排名前三', points: 100 }
      ]
    };
  },
  computed: {
    progressPercent() {
      const prevPoints = this.rankingList[this.myRank - 2]?.points || this.myPoints + 100;
      const diff = prevPoints - this.myPoints;
      const total = 100;
      return Math.round((1 - diff / total) * 100);
    }
  },
  methods: {
    trendType(trend) {
      if (trend > 0) return 'success';
      if (trend < 0) return 'danger';
      return 'info';
    },
    trendIcon(trend) {
      if (trend > 0) return 'el-icon-top';
      if (trend < 0) return 'el-icon-bottom';
      return 'el-icon-minus';
    }
  }
};
</script>

<style scoped>
.points-ranking {
  padding: 20px;
  max-width: 1000px;
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
  color: #E6A23C;
  font-size: 32px;
}

.subtitle {
  color: #888;
  font-size: 16px;
  margin-top: 8px;
}

/* 我的积分卡片 */
.my-points-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 30px;
  color: #fff;
  margin-bottom: 25px;
}

.points-info {
  display: flex;
  align-items: center;
  gap: 25px;
  margin-bottom: 25px;
}

.points-avatar {
  position: relative;
}

.rank-badge {
  position: absolute;
  bottom: -5px;
  right: -5px;
  width: 30px;
  height: 30px;
  background: #FFD700;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 16px;
}

.points-detail h3 {
  margin: 0 0 10px;
  font-size: 16px;
  opacity: 0.9;
}

.points-number {
  font-size: 48px;
  font-weight: bold;
  margin-bottom: 10px;
}

.points-progress {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  padding: 15px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 14px;
}

.points-progress >>> .el-progress-bar__outer {
  background-color: rgba(255, 255, 255, 0.3);
}

.points-progress >>> .el-progress__text {
  color: #fff;
}

/* 排行榜切换 */
.ranking-tabs {
  text-align: center;
  margin-bottom: 30px;
}

.ranking-tabs >>> .el-radio-button__inner {
  padding: 15px 30px;
  font-size: 16px;
}

.ranking-tabs >>> .el-radio-button__inner i {
  margin-right: 8px;
}

/* 前三名展示 */
.top-three {
  margin-bottom: 30px;
}

.podium {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 30px;
  padding: 20px;
}

.podium-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.podium-item.first {
  order: 2;
  margin-bottom: 20px;
}

.podium-item.second {
  order: 1;
}

.podium-item.third {
  order: 3;
}

.crown {
  position: absolute;
  top: -30px;
  font-size: 36px;
  color: #FFD700;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.podium-avatar {
  position: relative;
  margin-bottom: 15px;
}

.podium-avatar .el-avatar {
  border: 4px solid #fff;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.podium-item.first .el-avatar {
  border-color: #FFD700;
}

.podium-item.second .el-avatar {
  border-color: #C0C0C0;
}

.podium-item.third .el-avatar {
  border-color: #CD7F32;
}

.rank-number {
  position: absolute;
  bottom: -5px;
  left: 50%;
  transform: translateX(-50%);
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
  color: #fff;
}

.first .rank-number {
  background: #FFD700;
}

.second .rank-number {
  background: #C0C0C0;
}

.third .rank-number {
  background: #CD7F32;
}

.podium-info {
  text-align: center;
  margin-bottom: 15px;
}

.podium-name {
  font-size: 18px;
  font-weight: 500;
  color: #333;
  margin-bottom: 5px;
}

.podium-points {
  font-size: 20px;
  font-weight: bold;
  color: #409EFF;
}

.podium-base {
  width: 120px;
  border-radius: 8px 8px 0 0;
}

.first-base {
  height: 120px;
  background: linear-gradient(180deg, #FFD700 0%, #FFA500 100%);
}

.second-base {
  height: 90px;
  background: linear-gradient(180deg, #C0C0C0 0%, #A0A0A0 100%);
}

.third-base {
  height: 70px;
  background: linear-gradient(180deg, #CD7F32 0%, #B87333 100%);
}

/* 排行榜列表 */
.ranking-list {
  background: #fff;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 25px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.list-header {
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

.rules-icon {
  background: #E6A23C;
}

.section-title {
  font-size: 18px;
  font-weight: 500;
  color: #333;
  flex: 1;
}

.list-filter {
  margin-left: auto;
}

.ranking-table {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ranking-item {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  background: #f8f9fa;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.ranking-item:hover {
  background: #f0f2f5;
  transform: translateX(5px);
}

.ranking-item.is-me {
  background: #ecf5ff;
  border: 2px solid #409EFF;
}

.rank-number-col {
  width: 50px;
  text-align: center;
  font-size: 20px;
  font-weight: bold;
  color: #666;
}

.rank-badge-small {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #fff;
}

.rank-badge-small.rank-1 {
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
}

.rank-badge-small.rank-2 {
  background: linear-gradient(135deg, #C0C0C0 0%, #A0A0A0 100%);
}

.rank-badge-small.rank-3 {
  background: linear-gradient(135deg, #CD7F32 0%, #B87333 100%);
}

.rank-avatar {
  margin: 0 15px;
}

.rank-info {
  flex: 1;
}

.rank-name {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 5px;
}

.rank-class {
  font-size: 13px;
  color: #999;
}

.rank-points {
  text-align: center;
  margin-right: 20px;
}

.points-value {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
}

.points-label {
  font-size: 12px;
  color: #999;
}

/* 积分规则 */
.rules-section {
  background: #fff;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.rules-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.rule-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.rule-item:hover {
  background: #f0f2f5;
  transform: translateY(-3px);
}

.rule-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #fff;
}

.daily-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.continuous-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.exercise-icon {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.knowledge-icon {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.rule-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 5px;
}

.rule-desc {
  font-size: 13px;
  color: #666;
}

/* 规则弹窗 */
.rules-dialog-content {
  padding: 10px;
}

.rule-category {
  margin-bottom: 25px;
}

.rule-category h4 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 15px;
  color: #333;
  font-size: 16px;
}

.rule-category h4 i {
  color: #409EFF;
}

.rule-notes {
  background: #f8f9fa;
  padding: 15px 20px;
  border-radius: 8px;
  margin: 0;
}

.rule-notes li {
  margin-bottom: 8px;
  color: #666;
}

.rule-notes li:last-child {
  margin-bottom: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .points-ranking {
    padding: 15px;
  }

  .title {
    font-size: 22px;
  }

  .points-info {
    flex-direction: column;
    text-align: center;
  }

  .podium {
    gap: 15px;
  }

  .podium-base {
    width: 80px;
  }

  .first-base {
    height: 80px;
  }

  .second-base {
    height: 60px;
  }

  .third-base {
    height: 50px;
  }

  .ranking-item {
    padding: 10px 15px;
  }

  .rank-avatar {
    margin: 0 10px;
  }

  .rank-points {
    margin-right: 10px;
  }

  .rules-grid {
    grid-template-columns: 1fr;
  }
}
</style>
