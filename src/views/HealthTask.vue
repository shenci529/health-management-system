<template>
  <div class="health-task">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="title">
        <i class="el-icon-medal"></i>
        趣味健康任务
      </h1>
      <p class="subtitle">完成健康任务，收集勋章，成为健康小达人！</p>
    </div>

    <!-- 勋章统计 -->
    <div class="medal-stats">
      <div class="stats-card">
        <div class="stats-icon">
          <i class="el-icon-star-on"></i>
        </div>
        <div class="stats-info">
          <div class="stats-value">{{ totalMedals }}</div>
          <div class="stats-label">已获得勋章</div>
        </div>
      </div>
      <div class="stats-card">
        <div class="stats-icon green">
          <i class="el-icon-check"></i>
        </div>
        <div class="stats-info">
          <div class="stats-value">{{ completedTasks }}</div>
          <div class="stats-label">今日完成任务</div>
        </div>
      </div>
      <div class="stats-card">
        <div class="stats-icon orange">
          <i class="el-icon-trophy"></i>
        </div>
        <div class="stats-info">
          <div class="stats-value">{{ currentLevel }}</div>
          <div class="stats-label">当前等级</div>
        </div>
      </div>
    </div>

    <!-- 健康习惯闯关列表 -->
    <div class="task-section">
      <div class="section-header">
        <h2>
          <i class="el-icon-sunny"></i>
          健康习惯闯关
        </h2>
        <div class="section-badge">
          <span>{{ completedTasks }}/{{ tasks.length }}</span>
        </div>
      </div>

      <div class="task-grid">
        <!-- 刷牙任务 -->
        <div class="task-card" :class="{ completed: tasksData.brushTeeth.completed }" @click="completeTask('brushTeeth')">
          <div class="task-icon-wrapper">
            <div class="task-icon" :class="{ active: tasksData.brushTeeth.completed }">
              <span class="icon-emoji">🦷</span>
            </div>
            <div class="medal-badge" v-if="tasksData.brushTeeth.completed">
              <i class="el-icon-medal"></i>
            </div>
          </div>
          <div class="task-content">
            <h3 class="task-title">刷牙打卡</h3>
            <p class="task-desc">早晚刷牙，牙齿白白</p>
            <div class="task-progress">
              <el-progress
                :percentage="tasksData.brushTeeth.progress"
                :stroke-width="8"
                :color="tasksData.brushTeeth.completed ? '#4CAF50' : '#FF6B6B'"
                :show-text="false">
              </el-progress>
              <span class="progress-text">{{ tasksData.brushTeeth.progress }}%</span>
            </div>
          </div>
          <div class="task-action">
            <el-button
              :type="tasksData.brushTeeth.completed ? 'success' : 'primary'"
              size="large"
              circle
              :disabled="tasksData.brushTeeth.completed">
              <i :class="tasksData.brushTeeth.completed ? 'el-icon-check' : 'el-icon-plus'"></i>
            </el-button>
          </div>
        </div>

        <!-- 喝水任务 -->
        <div class="task-card" :class="{ completed: tasksData.drinkWater.completed }" @click="completeTask('drinkWater')">
          <div class="task-icon-wrapper">
            <div class="task-icon water" :class="{ active: tasksData.drinkWater.completed }">
              <span class="icon-emoji">💧</span>
            </div>
            <div class="medal-badge" v-if="tasksData.drinkWater.completed">
              <i class="el-icon-medal"></i>
            </div>
          </div>
          <div class="task-content">
            <h3 class="task-title">喝水打卡</h3>
            <p class="task-desc">多喝水，身体棒</p>
            <div class="task-progress">
              <el-progress
                :percentage="tasksData.drinkWater.progress"
                :stroke-width="8"
                :color="tasksData.drinkWater.completed ? '#4CAF50' : '#4D96FF'"
                :show-text="false">
              </el-progress>
              <span class="progress-text">{{ tasksData.drinkWater.progress }}%</span>
            </div>
          </div>
          <div class="task-action">
            <el-button
              :type="tasksData.drinkWater.completed ? 'success' : 'primary'"
              size="large"
              circle
              :disabled="tasksData.drinkWater.completed">
              <i :class="tasksData.drinkWater.completed ? 'el-icon-check' : 'el-icon-plus'"></i>
            </el-button>
          </div>
        </div>

        <!-- 坐姿矫正 -->
        <div class="task-card" :class="{ completed: tasksData.posture.completed }" @click="completeTask('posture')">
          <div class="task-icon-wrapper">
            <div class="task-icon posture" :class="{ active: tasksData.posture.completed }">
              <span class="icon-emoji">🧘</span>
            </div>
            <div class="medal-badge" v-if="tasksData.posture.completed">
              <i class="el-icon-medal"></i>
            </div>
          </div>
          <div class="task-content">
            <h3 class="task-title">坐姿矫正</h3>
            <p class="task-desc">坐姿端正，保护脊柱</p>
            <div class="task-progress">
              <el-progress
                :percentage="tasksData.posture.progress"
                :stroke-width="8"
                :color="tasksData.posture.completed ? '#4CAF50' : '#FFD93D'"
                :show-text="false">
              </el-progress>
              <span class="progress-text">{{ tasksData.posture.progress }}%</span>
            </div>
          </div>
          <div class="task-action">
            <el-button
              :type="tasksData.posture.completed ? 'success' : 'primary'"
              size="large"
              circle
              :disabled="tasksData.posture.completed">
              <i :class="tasksData.posture.completed ? 'el-icon-check' : 'el-icon-plus'"></i>
            </el-button>
          </div>
        </div>

        <!-- 户外运动 -->
        <div class="task-card" :class="{ completed: tasksData.outdoor.completed }" @click="completeTask('outdoor')">
          <div class="task-icon-wrapper">
            <div class="task-icon outdoor" :class="{ active: tasksData.outdoor.completed }">
              <span class="icon-emoji">🏃</span>
            </div>
            <div class="medal-badge" v-if="tasksData.outdoor.completed">
              <i class="el-icon-medal"></i>
            </div>
          </div>
          <div class="task-content">
            <h3 class="task-title">户外运动</h3>
            <p class="task-desc">户外活动，健康成长</p>
            <div class="task-progress">
              <el-progress
                :percentage="tasksData.outdoor.progress"
                :stroke-width="8"
                :color="tasksData.outdoor.completed ? '#4CAF50' : '#6BCB77'"
                :show-text="false">
              </el-progress>
              <span class="progress-text">{{ tasksData.outdoor.progress }}%</span>
            </div>
          </div>
          <div class="task-action">
            <el-button
              :type="tasksData.outdoor.completed ? 'success' : 'primary'"
              size="large"
              circle
              :disabled="tasksData.outdoor.completed">
              <i :class="tasksData.outdoor.completed ? 'el-icon-check' : 'el-icon-plus'"></i>
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 勋章展示区 -->
    <div class="medal-section">
      <div class="section-header">
        <h2>
          <i class="el-icon-medal"></i>
          我的勋章墙
        </h2>
      </div>

      <div class="medal-wall">
        <div class="medal-item" v-for="(medal, index) in allMedals" :key="index" :class="{ earned: medal.earned }">
          <div class="medal-icon">
            <span class="medal-emoji">{{ medal.emoji }}</span>
          </div>
          <div class="medal-name">{{ medal.name }}</div>
          <div class="medal-date" v-if="medal.earned">{{ medal.date }}</div>
          <div class="medal-lock" v-else>
            <i class="el-icon-lock"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- 健康科普小游戏入口 -->
    <div class="game-section">
      <div class="section-header">
        <h2>
          <i class="el-icon-game"></i>
          健康科普小游戏
        </h2>
      </div>

      <div class="game-grid">
        <!-- 健康知识问答 -->
        <div class="game-card" @click="startGame('quiz')">
          <div class="game-icon">
            <span class="game-emoji">🎯</span>
          </div>
          <div class="game-content">
            <h3 class="game-title">健康知识问答</h3>
            <p class="game-desc">答题闯关，学习健康知识</p>
          </div>
          <div class="game-badge">
            <el-tag type="warning" size="small">趣味</el-tag>
          </div>
        </div>

        <!-- 营养搭配游戏 -->
        <div class="game-card" @click="startGame('nutrition')">
          <div class="game-icon">
            <span class="game-emoji">🥗</span>
          </div>
          <div class="game-content">
            <h3 class="game-title">营养搭配大师</h3>
            <p class="game-desc">学习健康饮食搭配</p>
          </div>
          <div class="game-badge">
            <el-tag type="success" size="small">益智</el-tag>
          </div>
        </div>

        <!-- 运动挑战 -->
        <div class="game-card" @click="startGame('exercise')">
          <div class="game-icon">
            <span class="game-emoji">⚽</span>
          </div>
          <div class="game-content">
            <h3 class="game-title">运动小达人</h3>
            <p class="game-desc">完成运动挑战任务</p>
          </div>
          <div class="game-badge">
            <el-tag type="primary" size="small">运动</el-tag>
          </div>
        </div>

        <!-- 卫生习惯游戏 -->
        <div class="game-card" @click="startGame('hygiene')">
          <div class="game-icon">
            <span class="game-emoji">🧼</span>
          </div>
          <div class="game-content">
            <h3 class="game-title">卫生小卫士</h3>
            <p class="game-desc">养成良好卫生习惯</p>
          </div>
          <div class="game-badge">
            <el-tag type="info" size="small">习惯</el-tag>
          </div>
        </div>
      </div>
    </div>

    <!-- 勋章获得动画弹窗 -->
    <el-dialog
      :visible.sync="showMedalDialog"
      width="350px"
      center
      :show-close="false"
      custom-class="medal-dialog">
      <div class="medal-animation">
        <div class="sparkle-container">
          <div class="sparkle" v-for="n in 8" :key="n"></div>
        </div>
        <div class="medal-reveal">
          <div class="medal-earned-icon">
            <span class="earned-emoji">{{ earnedMedalEmoji }}</span>
          </div>
        </div>
        <div class="medal-earned-info">
          <h3 class="medal-earned-title">恭喜获得勋章！</h3>
          <div class="medal-earned-name">{{ earnedMedalName }}</div>
          <div class="medal-stars">
            <i class="el-icon-star-on" v-for="n in 5" :key="n"></i>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 游戏开始提示 -->
    <el-dialog
      :visible.sync="showGameDialog"
      width="320px"
      center
      custom-class="game-dialog">
      <div class="game-start-content">
        <div class="game-start-icon">
          <span class="start-emoji">{{ selectedGameEmoji }}</span>
        </div>
        <h3 class="game-start-title">{{ selectedGameTitle }}</h3>
        <p class="game-start-desc">准备好开始游戏了吗？</p>
        <div class="game-start-actions">
          <el-button type="primary" size="large" @click="playGame">
            <i class="el-icon-video-play"></i>
            开始游戏
          </el-button>
          <el-button size="large" @click="showGameDialog = false">
            稍后再玩
          </el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { NotificationStore } from '@/permission';

export default {
  name: 'HealthTask',
  data() {
    return {
      tasksData: {
        brushTeeth: {
          completed: false,
          progress: 0,
          medal: 'tooth-medal'
        },
        drinkWater: {
          completed: false,
          progress: 0,
          medal: 'water-medal'
        },
        posture: {
          completed: false,
          progress: 0,
          medal: 'posture-medal'
        },
        outdoor: {
          completed: false,
          progress: 0,
          medal: 'outdoor-medal'
        }
      },
      allMedals: [
        { name: '刷牙达人', emoji: '🦷', earned: false, date: '' },
        { name: '喝水小能手', emoji: '💧', earned: false, date: '' },
        { name: '坐姿标兵', emoji: '🧘', earned: false, date: '' },
        { name: '运动健将', emoji: '🏃', earned: false, date: '' },
        { name: '健康之星', emoji: '⭐', earned: false, date: '' },
        { name: '卫生模范', emoji: '🧼', earned: false, date: '' },
        { name: '营养专家', emoji: '🥗', earned: false, date: '' },
        { name: '睡眠冠军', emoji: '😴', earned: false, date: '' }
      ],
      games: {
        quiz: { title: '健康知识问答', emoji: '🎯' },
        nutrition: { title: '营养搭配大师', emoji: '🥗' },
        exercise: { title: '运动小达人', emoji: '⚽' },
        hygiene: { title: '卫生小卫士', emoji: '🧼' }
      },
      showMedalDialog: false,
      showGameDialog: false,
      earnedMedalEmoji: '',
      earnedMedalName: '',
      selectedGame: '',
      selectedGameEmoji: '',
      selectedGameTitle: ''
    };
  },
  computed: {
    tasks() {
      return Object.keys(this.tasksData);
    },
    completedTasks() {
      let count = 0;
      Object.values(this.tasksData).forEach(task => {
        if (task.completed) count++;
      });
      return count;
    },
    totalMedals() {
      return this.allMedals.filter(m => m.earned).length;
    },
    currentLevel() {
      const medals = this.totalMedals;
      if (medals >= 8) return 'Lv.5 大师';
      if (medals >= 6) return 'Lv.4 专家';
      if (medals >= 4) return 'Lv.3 达人';
      if (medals >= 2) return 'Lv.2 学徒';
      return 'Lv.1 新手';
    }
  },
  created() {
    this.loadTaskData();
    this.updateProgress();
  },
  methods: {
    getCurrentUser() {
      try {
        const raw = localStorage.getItem('userInfo');
        return raw ? JSON.parse(raw) : null;
      } catch { return null; }
    },
    loadTaskData() {
      const savedData = localStorage.getItem('healthTaskData');
      if (savedData) {
        const data = JSON.parse(savedData);
        this.tasksData = data.tasksData || this.tasksData;
        this.allMedals = data.allMedals || this.allMedals;
      }
    },
    updateProgress() {
      // 模拟进度更新
      Object.keys(this.tasksData).forEach(key => {
        if (!this.tasksData[key].completed) {
          // 根据历史完成次数计算进度
          const historyKey = `taskHistory_${key}`;
          const history = localStorage.getItem(historyKey);
          const count = history ? parseInt(history) : 0;
          this.tasksData[key].progress = Math.min(count * 20, 80);
        }
      });
    },
    completeTask(taskKey) {
      if (this.tasksData[taskKey].completed) return;

      // 增加进度
      this.tasksData[taskKey].progress += 20;

      // 检查是否完成
      if (this.tasksData[taskKey].progress >= 100) {
        this.tasksData[taskKey].completed = true;
        this.tasksData[taskKey].progress = 100;

        // 记录历史
        const historyKey = `taskHistory_${taskKey}`;
        const history = localStorage.getItem(historyKey);
        const count = history ? parseInt(history) + 1 : 1;
        localStorage.setItem(historyKey, count.toString());

        // 获得勋章
        this.awardMedal(taskKey);

        // 通知老师：学生完成了健康任务
        const medalMap = {
          brushTeeth: '刷牙打卡',
          drinkWater: '喝水打卡',
          posture: '坐姿矫正',
          outdoor: '户外运动'
        };
        const userInfo = this.getCurrentUser();
        NotificationStore.send({
          type: 'task_completed',
          title: '🏅 健康任务完成',
          content: `学生 ${userInfo ? userInfo.username : '学生'} 完成了健康任务"${medalMap[taskKey] || taskKey}"，获得了相应勋章。`,
          fromRole: 'student',
          fromUser: userInfo ? userInfo.username : '学生',
          toRoles: ['teacher', 'parent'],
          link: '/health-task'
        });
      }

      this.saveData();
    },
    awardMedal(taskKey) {
      const medalMap = {
        brushTeeth: { index: 0, name: '刷牙达人', emoji: '🦷' },
        drinkWater: { index: 1, name: '喝水小能手', emoji: '💧' },
        posture: { index: 2, name: '坐姿标兵', emoji: '🧘' },
        outdoor: { index: 3, name: '运动健将', emoji: '🏃' }
      };

      const medalInfo = medalMap[taskKey];
      if (medalInfo && !this.allMedals[medalInfo.index].earned) {
        this.allMedals[medalInfo.index].earned = true;
        this.allMedals[medalInfo.index].date = this.formatDate(new Date());

        // 显示勋章获得动画
        this.earnedMedalEmoji = medalInfo.emoji;
        this.earnedMedalName = medalInfo.name;
        this.showMedalDialog = true;

        setTimeout(() => {
          this.showMedalDialog = false;
        }, 3000);
      }
    },
    formatDate(date) {
      const month = date.getMonth() + 1;
      const day = date.getDate();
      return `${month}月${day}日`;
    },
    startGame(gameType) {
      this.selectedGame = gameType;
      this.selectedGameEmoji = this.games[gameType].emoji;
      this.selectedGameTitle = this.games[gameType].title;
      this.showGameDialog = true;
    },
    playGame() {
      this.showGameDialog = false;
      this.$message.success(`${this.selectedGameTitle} 游戏即将开始！`);
      // 这里可以跳转到游戏页面或显示游戏内容
    },
    saveData() {
      localStorage.setItem('healthTaskData', JSON.stringify({
        tasksData: this.tasksData,
        allMedals: this.allMedals,
        updateTime: new Date().toISOString()
      }));
    }
  }
};
</script>

<style scoped>
.health-task {
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
}

/* 页面标题 */
.page-header {
  text-align: center;
  margin-bottom: 25px;
}

.title {
  font-size: 28px;
  color: #FF6B6B;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.title i {
  color: #FFD93D;
  font-size: 32px;
}

.subtitle {
  color: #888;
  font-size: 16px;
  margin-top: 8px;
}

/* 勋章统计 */
.medal-stats {
  display: flex;
  gap: 15px;
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
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #fff;
}

.stats-icon.green {
  background: linear-gradient(135deg, #6BCB77 0%, #4CAF50 100%);
}

.stats-icon.orange {
  background: linear-gradient(135deg, #FFD93D 0%, #FF9500 100%);
}

.stats-info {
  flex: 1;
}

.stats-value {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.stats-label {
  font-size: 14px;
  color: #888;
}

/* 任务区块 */
.task-section,
.medal-section,
.game-section {
  background: #fff;
  border-radius: 20px;
  padding: 25px;
  margin-bottom: 25px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

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
  color: #FF6B6B;
}

.section-badge {
  background: #E3F2FD;
  color: #2196F3;
  padding: 8px 15px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
}

/* 任务网格 */
.task-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.task-card {
  background: #f9f9f9;
  border-radius: 15px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.task-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.task-card.completed {
  background: #E8F5E9;
  border-color: #4CAF50;
}

.task-icon-wrapper {
  position: relative;
}

.task-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #FFE66D 0%, #FFD93D 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  transition: all 0.3s ease;
}

.task-icon.water {
  background: linear-gradient(135deg, #4D96FF 0%, #6BCB77 100%);
}

.task-icon.posture {
  background: linear-gradient(135deg, #FFD93D 0%, #FF9500 100%);
}

.task-icon.outdoor {
  background: linear-gradient(135deg, #6BCB77 0%, #4CAF50 100%);
}

.task-icon.active {
  animation: icon-bounce 0.5s ease;
}

@keyframes icon-bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
}

.medal-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  width: 25px;
  height: 25px;
  background: #FFD93D;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FF9500;
  font-size: 14px;
  animation: medal-shine 1s ease infinite;
}

@keyframes medal-shine {
  0%, 100% { box-shadow: 0 0 5px rgba(255, 217, 61, 0.5); }
  50% { box-shadow: 0 0 15px rgba(255, 217, 61, 0.8); }
}

.icon-emoji {
  font-size: 28px;
}

.task-content {
  flex: 1;
}

.task-title {
  font-size: 18px;
  color: #333;
  margin: 0 0 5px;
}

.task-desc {
  font-size: 14px;
  color: #888;
  margin: 0 0 10px;
}

.task-progress {
  display: flex;
  align-items: center;
  gap: 10px;
}

.task-progress >>> .el-progress {
  flex: 1;
}

.progress-text {
  font-size: 12px;
  color: #666;
}

.task-action >>> .el-button {
  width: 45px;
  height: 45px;
  font-size: 18px;
}

/* 勋章墙 */
.medal-wall {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
}

.medal-item {
  background: #f5f5f5;
  border-radius: 15px;
  padding: 15px;
  text-align: center;
  transition: all 0.3s ease;
}

.medal-item.earned {
  background: linear-gradient(135deg, #FFE66D 0%, #FFD93D 100%);
  animation: medal-glow 2s ease infinite;
}

@keyframes medal-glow {
  0%, 100% { box-shadow: 0 0 10px rgba(255, 217, 61, 0.3); }
  50% { box-shadow: 0 0 20px rgba(255, 217, 61, 0.6); }
}

.medal-icon {
  width: 50px;
  height: 50px;
  margin: 0 auto 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.medal-emoji {
  font-size: 36px;
}

.medal-item:not(.earned) .medal-emoji {
  opacity: 0.3;
  filter: grayscale(100%);
}

.medal-name {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.medal-item:not(.earned) .medal-name {
  color: #999;
}

.medal-date {
  font-size: 12px;
  color: #FF9500;
  margin-top: 5px;
}

.medal-lock {
  margin-top: 5px;
  color: #999;
  font-size: 16px;
}

/* 游戏网格 */
.game-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.game-card {
  background: #f9f9f9;
  border-radius: 15px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.game-card:hover {
  background: #E3F2FD;
  transform: translateY(-3px);
}

.game-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.game-emoji {
  font-size: 24px;
}

.game-content {
  flex: 1;
}

.game-title {
  font-size: 16px;
  color: #333;
  margin: 0 0 5px;
}

.game-desc {
  font-size: 13px;
  color: #888;
  margin: 0;
}

.game-badge >>> .el-tag {
  border-radius: 10px;
}

/* 勋章获得弹窗 */
.medal-dialog >>> .el-dialog {
  border-radius: 20px;
  overflow: hidden;
  background: linear-gradient(135deg, #FFE66D 0%, #FFD93D 100%);
}

.medal-animation {
  text-align: center;
  padding: 30px;
}

.sparkle-container {
  position: relative;
  height: 20px;
}

.sparkle {
  position: absolute;
  width: 8px;
  height: 8px;
  background: #fff;
  border-radius: 50%;
  animation: sparkle-float 1.5s ease-out infinite;
}

.sparkle:nth-child(1) { left: 10%; animation-delay: 0s; }
.sparkle:nth-child(2) { left: 25%; animation-delay: 0.1s; }
.sparkle:nth-child(3) { left: 40%; animation-delay: 0.2s; }
.sparkle:nth-child(4) { left: 55%; animation-delay: 0.3s; }
.sparkle:nth-child(5) { left: 70%; animation-delay: 0.4s; }
.sparkle:nth-child(6) { left: 85%; animation-delay: 0.5s; }
.sparkle:nth-child(7) { left: 50%; animation-delay: 0.6s; }
.sparkle:nth-child(8) { left: 30%; animation-delay: 0.7s; }

@keyframes sparkle-float {
  0% {
    transform: translateY(0) scale(0);
    opacity: 1;
  }
  50% {
    transform: translateY(-30px) scale(1);
    opacity: 1;
  }
  100% {
    transform: translateY(-60px) scale(0);
    opacity: 0;
  }
}

.medal-reveal {
  margin: 20px 0;
}

.medal-earned-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto;
  background: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: medal-reveal 0.5s ease;
}

@keyframes medal-reveal {
  0% { transform: scale(0) rotate(-180deg); }
  100% { transform: scale(1) rotate(0deg); }
}

.earned-emoji {
  font-size: 50px;
}

.medal-earned-info {
  color: #333;
}

.medal-earned-title {
  font-size: 22px;
  margin: 0 0 10px;
}

.medal-earned-name {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 15px;
}

.medal-stars {
  display: flex;
  justify-content: center;
  gap: 5px;
}

.medal-stars i {
  font-size: 20px;
  color: #FF9500;
  animation: star-spin 0.5s ease infinite alternate;
}

@keyframes star-spin {
  0% { transform: scale(1); }
  100% { transform: scale(1.3); }
}

/* 游戏开始弹窗 */
.game-dialog >>> .el-dialog {
  border-radius: 20px;
}

.game-start-content {
  text-align: center;
  padding: 20px;
}

.game-start-icon {
  width: 70px;
  height: 70px;
  margin: 0 auto 15px;
  background: linear-gradient(135deg, #6BCB77 0%, #4CAF50 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.start-emoji {
  font-size: 40px;
}

.game-start-title {
  font-size: 20px;
  color: #333;
  margin: 0 0 10px;
}

.game-start-desc {
  font-size: 14px;
  color: #888;
  margin-bottom: 20px;
}

.game-start-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.game-start-actions >>> .el-button {
  padding: 15px 25px;
  border-radius: 15px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .health-task {
    padding: 15px;
  }

  .title {
    font-size: 22px;
  }

  .medal-stats {
    flex-direction: column;
  }

  .task-grid,
  .game-grid {
    grid-template-columns: 1fr;
  }

  .medal-wall {
    grid-template-columns: repeat(2, 1fr);
  }

  .task-card {
    flex-wrap: wrap;
  }

  .task-action {
    width: 100%;
    display: flex;
    justify-content: flex-end;
  }
}
</style>