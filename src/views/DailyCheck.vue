<template>
  <div class="daily-check">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="title">
        <i class="el-icon-sunny"></i>
        每日健康打卡
      </h1>
      <p class="subtitle">今天是 {{ currentDate }}，一起来打卡吧！</p>
    </div>

    <!-- 晨间健康打卡卡片 -->
    <div class="check-card morning-card">
      <div class="card-header">
        <div class="card-icon morning-icon">
          <i class="el-icon-sunny"></i>
        </div>
        <div class="card-title">
          <h2>晨间健康打卡</h2>
          <span class="card-desc">记录今天的健康状态</span>
        </div>
      </div>

      <div class="card-content">
        <!-- 体温输入 -->
        <div class="form-item">
          <label class="form-label">
            <i class="el-icon-thermometer"></i>
            今日体温
          </label>
          <div class="temperature-input">
            <el-input-number
              v-model="morningCheck.temperature"
              :min="35"
              :max="42"
              :step="0.1"
              :precision="1"
              size="large"
              class="temp-number">
            </el-input-number>
            <span class="temp-unit">°C</span>
          </div>
          <div class="temp-hint" :class="tempStatusClass">
            {{ tempStatusText }}
          </div>
        </div>

        <!-- 精神状态选择 -->
        <div class="form-item">
          <label class="form-label">
            <i class="el-icon-star-on"></i>
            精神状态
          </label>
          <div class="status-buttons">
            <div
              class="status-btn good"
              :class="{ active: morningCheck.spirit === 'good' }"
              @click="morningCheck.spirit = 'good'">
              <div class="status-emoji">😊</div>
              <span>很好</span>
            </div>
            <div
              class="status-btn normal"
              :class="{ active: morningCheck.spirit === 'normal' }"
              @click="morningCheck.spirit = 'normal'">
              <div class="status-emoji">😐</div>
              <span>一般</span>
            </div>
            <div
              class="status-btn bad"
              :class="{ active: morningCheck.spirit === 'bad' }"
              @click="morningCheck.spirit = 'bad'">
              <div class="status-emoji">😔</div>
              <span>不好</span>
            </div>
          </div>
        </div>

        <!-- 过敏/不适选项 -->
        <div class="form-item">
          <label class="form-label">
            <i class="el-icon-warning-outline"></i>
            身体状况
          </label>
          <div class="symptom-options">
            <el-checkbox-group v-model="morningCheck.symptoms">
              <el-checkbox label="none">一切正常</el-checkbox>
              <el-checkbox label="allergy">有过敏症状</el-checkbox>
              <el-checkbox label="cough">咳嗽/流涕</el-checkbox>
              <el-checkbox label="headache">头痛/头晕</el-checkbox>
              <el-checkbox label="stomach">肚子不舒服</el-checkbox>
              <el-checkbox label="other">其他不适</el-checkbox>
            </el-checkbox-group>
          </div>
        </div>

        <!-- 提交按钮 -->
        <el-button
          type="primary"
          size="large"
          class="submit-btn morning-submit"
          @click="submitMorningCheck"
          :loading="morningLoading">
          <i class="el-icon-check"></i>
          完成晨间打卡
        </el-button>
      </div>
    </div>

    <!-- 课间运动打卡卡片 -->
    <div class="check-card exercise-card">
      <div class="card-header">
        <div class="card-icon exercise-icon">
          <i class="el-icon-basketball"></i>
        </div>
        <div class="card-title">
          <h2>课间运动打卡</h2>
          <span class="card-desc">运动让身体更健康</span>
        </div>
      </div>

      <div class="card-content">
        <div class="exercise-items">
          <!-- 课间操 -->
          <div class="exercise-item" :class="{ completed: exerciseCheck.morningExercise }">
            <div class="exercise-icon-wrapper">
              <i class="el-icon-video-play"></i>
            </div>
            <div class="exercise-info">
              <h3>课间操</h3>
              <p>跟着音乐动起来</p>
            </div>
            <div class="exercise-action">
              <el-button
                :type="exerciseCheck.morningExercise ? 'success' : 'primary'"
                size="large"
                @click="toggleExercise('morningExercise')">
                <i :class="exerciseCheck.morningExercise ? 'el-icon-check' : 'el-icon-circle-check'"></i>
                {{ exerciseCheck.morningExercise ? '已完成' : '打卡' }}
              </el-button>
            </div>
          </div>

          <!-- 眼保健操 -->
          <div class="exercise-item" :class="{ completed: exerciseCheck.eyeExercise }">
            <div class="exercise-icon-wrapper">
              <i class="el-icon-view"></i>
            </div>
            <div class="exercise-info">
              <h3>眼保健操</h3>
              <p>保护明亮眼睛</p>
            </div>
            <div class="exercise-action">
              <el-button
                :type="exerciseCheck.eyeExercise ? 'success' : 'primary'"
                size="large"
                @click="toggleExercise('eyeExercise')">
                <i :class="exerciseCheck.eyeExercise ? 'el-icon-check' : 'el-icon-circle-check'"></i>
                {{ exerciseCheck.eyeExercise ? '已完成' : '打卡' }}
              </el-button>
            </div>
          </div>

          <!-- 户外活动 -->
          <div class="exercise-item" :class="{ completed: exerciseCheck.outdoorActivity }">
            <div class="exercise-icon-wrapper">
              <i class="el-icon-sunrise"></i>
            </div>
            <div class="exercise-info">
              <h3>户外活动</h3>
              <p>享受阳光和新鲜空气</p>
            </div>
            <div class="exercise-action">
              <el-button
                :type="exerciseCheck.outdoorActivity ? 'success' : 'primary'"
                size="large"
                @click="toggleExercise('outdoorActivity')">
                <i :class="exerciseCheck.outdoorActivity ? 'el-icon-check' : 'el-icon-circle-check'"></i>
                {{ exerciseCheck.outdoorActivity ? '已完成' : '打卡' }}
              </el-button>
            </div>
          </div>
        </div>

        <!-- 今日运动统计 -->
        <div class="exercise-summary">
          <div class="summary-item">
            <span class="summary-label">今日完成</span>
            <span class="summary-value">{{ completedExerciseCount }}/3</span>
          </div>
          <el-progress
            :percentage="exerciseProgress"
            :color="progressColors"
            :stroke-width="12"
            class="exercise-progress">
          </el-progress>
        </div>
      </div>
    </div>

    <!-- 打卡成功动画弹窗 -->
    <el-dialog
      :visible.sync="showSuccessDialog"
      width="320px"
      center
      :show-close="false"
      custom-class="success-dialog">
      <div class="success-content">
        <div class="success-animation">
          <div class="confetti"></div>
          <div class="confetti"></div>
          <div class="confetti"></div>
          <div class="confetti"></div>
          <div class="confetti"></div>
          <div class="success-icon">
            <i class="el-icon-success"></i>
          </div>
        </div>
        <h3 class="success-title">{{ successTitle }}</h3>
        <p class="success-message">{{ successMessage }}</p>
        <div class="stars">
          <span v-for="n in 5" :key="n" class="star">⭐</span>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'DailyCheck',
  data() {
    return {
      currentDate: '',
      morningCheck: {
        temperature: 36.5,
        spirit: '',
        symptoms: []
      },
      exerciseCheck: {
        morningExercise: false,
        eyeExercise: false,
        outdoorActivity: false
      },
      morningLoading: false,
      showSuccessDialog: false,
      successTitle: '打卡成功！',
      successMessage: '你真棒！继续保持哦~'
    };
  },
  computed: {
    tempStatusClass() {
      const temp = this.morningCheck.temperature;
      if (temp < 36.0) return 'temp-low';
      if (temp >= 36.0 && temp <= 37.3) return 'temp-normal';
      if (temp > 37.3 && temp <= 38.0) return 'temp-warm';
      return 'temp-high';
    },
    tempStatusText() {
      const temp = this.morningCheck.temperature;
      if (temp < 36.0) return '体温偏低，注意保暖哦~';
      if (temp >= 36.0 && temp <= 37.3) return '体温正常，身体棒棒哒！';
      if (temp > 37.3 && temp <= 38.0) return '体温偏高，多喝水休息~';
      return '体温较高，请及时就医！';
    },
    completedExerciseCount() {
      let count = 0;
      if (this.exerciseCheck.morningExercise) count++;
      if (this.exerciseCheck.eyeExercise) count++;
      if (this.exerciseCheck.outdoorActivity) count++;
      return count;
    },
    exerciseProgress() {
      return Math.round((this.completedExerciseCount / 3) * 100);
    },
    progressColors() {
      if (this.exerciseProgress < 50) return '#FF9800';
      if (this.exerciseProgress < 100) return '#2196F3';
      return '#4CAF50';
    }
  },
  created() {
    this.currentDate = this.formatDate(new Date());
    this.loadTodayData();
  },
  methods: {
    formatDate(date) {
      const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const weekDay = weekDays[date.getDay()];
      return `${year}年${month}月${day}日 ${weekDay}`;
    },
    loadTodayData() {
      // 从localStorage加载今日打卡数据
      const todayKey = `dailyCheck_${this.getDateKey()}`;
      const savedData = localStorage.getItem(todayKey);
      if (savedData) {
        const data = JSON.parse(savedData);
        this.morningCheck = data.morningCheck || this.morningCheck;
        this.exerciseCheck = data.exerciseCheck || this.exerciseCheck;
      }
    },
    getDateKey() {
      const date = new Date();
      return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    },
    submitMorningCheck() {
      if (!this.morningCheck.spirit) {
        this.$message.warning('请选择今天的精神状态哦~');
        return;
      }
      
      this.morningLoading = true;
      setTimeout(() => {
        this.saveData();
        this.morningLoading = false;
        this.successTitle = '晨间打卡成功！';
        this.successMessage = '你真棒！今天也要元气满满哦~';
        this.showSuccessDialog = true;
        
        setTimeout(() => {
          this.showSuccessDialog = false;
        }, 2500);
      }, 800);
    },
    toggleExercise(type) {
      this.exerciseCheck[type] = !this.exerciseCheck[type];
      this.saveData();
      
      if (this.exerciseCheck[type]) {
        const exerciseNames = {
          morningExercise: '课间操',
          eyeExercise: '眼保健操',
          outdoorActivity: '户外活动'
        };
        this.successTitle = `${exerciseNames[type]}打卡成功！`;
        this.successMessage = this.getExerciseMessage(type);
        this.showSuccessDialog = true;
        
        setTimeout(() => {
          this.showSuccessDialog = false;
        }, 2000);
      }
    },
    getExerciseMessage(type) {
      const messages = {
        morningExercise: '运动让身体更健康！继续加油~',
        eyeExercise: '眼睛是心灵的窗户，保护好它们哦~',
        outdoorActivity: '户外活动真棒！阳光和新鲜空气让你更健康~'
      };
      return messages[type];
    },
    saveData() {
      const todayKey = `dailyCheck_${this.getDateKey()}`;
      const data = {
        morningCheck: this.morningCheck,
        exerciseCheck: this.exerciseCheck,
        updateTime: new Date().toISOString()
      };
      localStorage.setItem(todayKey, JSON.stringify(data));
    }
  }
};
</script>

<style scoped>
.daily-check {
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
}

/* 页面标题 */
.page-header {
  text-align: center;
  margin-bottom: 30px;
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

/* 卡片通用样式 */
.check-card {
  background: #fff;
  border-radius: 20px;
  padding: 25px;
  margin-bottom: 25px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease;
}

.check-card:hover {
  transform: translateY(-3px);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 25px;
}

.card-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.morning-icon {
  background: linear-gradient(135deg, #FFE66D 0%, #FFD93D 100%);
  color: #FF9500;
}

.exercise-icon {
  background: linear-gradient(135deg, #6BCB77 0%, #4CAF50 100%);
  color: #fff;
}

.card-title h2 {
  font-size: 22px;
  color: #333;
  margin: 0;
}

.card-desc {
  color: #999;
  font-size: 14px;
}

/* 表单项样式 */
.form-item {
  margin-bottom: 25px;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  color: #555;
  margin-bottom: 12px;
  font-weight: 500;
}

.form-label i {
  color: #FF6B6B;
}

/* 体温输入 */
.temperature-input {
  display: flex;
  align-items: center;
  gap: 10px;
}

.temp-number {
  width: 150px;
}

.temp-number >>> .el-input__inner {
  font-size: 24px;
  text-align: center;
  height: 50px;
}

.temp-unit {
  font-size: 20px;
  color: #666;
}

.temp-hint {
  margin-top: 10px;
  padding: 10px 15px;
  border-radius: 10px;
  font-size: 14px;
  display: inline-block;
}

.temp-normal {
  background: #E8F5E9;
  color: #4CAF50;
}

.temp-low {
  background: #E3F2FD;
  color: #2196F3;
}

.temp-warm {
  background: #FFF3E0;
  color: #FF9800;
}

.temp-high {
  background: #FFEBEE;
  color: #F44336;
}

/* 精神状态按钮 */
.status-buttons {
  display: flex;
  gap: 15px;
}

.status-btn {
  flex: 1;
  padding: 20px;
  border-radius: 15px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 3px solid transparent;
  background: #f5f5f5;
}

.status-btn:hover {
  transform: scale(1.02);
}

.status-btn.active {
  border-color: currentColor;
  transform: scale(1.02);
}

.status-btn.good {
  color: #4CAF50;
}

.status-btn.good.active {
  background: #E8F5E9;
  border-color: #4CAF50;
}

.status-btn.normal {
  color: #FF9800;
}

.status-btn.normal.active {
  background: #FFF3E0;
  border-color: #FF9800;
}

.status-btn.bad {
  color: #F44336;
}

.status-btn.bad.active {
  background: #FFEBEE;
  border-color: #F44336;
}

.status-emoji {
  font-size: 40px;
  margin-bottom: 8px;
}

.status-btn span {
  font-size: 16px;
  font-weight: 500;
}

/* 症状选项 */
.symptom-options >>> .el-checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.symptom-options >>> .el-checkbox {
  margin-right: 0;
  padding: 12px 18px;
  border-radius: 25px;
  background: #f5f5f5;
  transition: all 0.3s ease;
}

.symptom-options >>> .el-checkbox:hover {
  background: #e0e0e0;
}

.symptom-options >>> .el-checkbox.is-checked {
  background: #E3F2FD;
}

.symptom-options >>> .el-checkbox__label {
  font-size: 15px;
  color: #555;
}

.symptom-options >>> .el-checkbox__input.is-checked + .el-checkbox__label {
  color: #2196F3;
}

/* 提交按钮 */
.submit-btn {
  width: 100%;
  height: 55px;
  font-size: 18px;
  border-radius: 15px;
  font-weight: 500;
}

.morning-submit {
  background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
  border: none;
}

.morning-submit:hover {
  background: linear-gradient(135deg, #FF5252 0%, #FF7043 100%);
}

/* 运动打卡项目 */
.exercise-items {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.exercise-item {
  display: flex;
  align-items: center;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 15px;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.exercise-item:hover {
  background: #f0f0f0;
}

.exercise-item.completed {
  background: #E8F5E9;
  border-color: #4CAF50;
}

.exercise-icon-wrapper {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6BCB77 0%, #4CAF50 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #fff;
  margin-right: 15px;
}

.exercise-info {
  flex: 1;
}

.exercise-info h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.exercise-info p {
  margin: 5px 0 0;
  font-size: 14px;
  color: #888;
}

.exercise-action >>> .el-button {
  padding: 15px 25px;
  font-size: 16px;
  border-radius: 25px;
}

/* 运动统计 */
.exercise-summary {
  margin-top: 25px;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 15px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.summary-label {
  color: #666;
  font-size: 16px;
}

.summary-value {
  font-size: 20px;
  font-weight: bold;
  color: #4CAF50;
}

.exercise-progress >>> .el-progress-bar__outer {
  border-radius: 10px;
}

.exercise-progress >>> .el-progress-bar__inner {
  border-radius: 10px;
}

/* 成功弹窗 */
.success-dialog >>> .el-dialog {
  border-radius: 20px;
  overflow: hidden;
}

.success-content {
  text-align: center;
  padding: 20px;
}

.success-animation {
  position: relative;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.success-icon {
  font-size: 80px;
  color: #4CAF50;
  animation: bounce 0.5s ease;
}

@keyframes bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

.confetti {
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  animation: confetti-fall 1.5s ease-out infinite;
}

.confetti:nth-child(1) {
  background: #FF6B6B;
  left: 20%;
  animation-delay: 0s;
}

.confetti:nth-child(2) {
  background: #FFD93D;
  left: 35%;
  animation-delay: 0.1s;
}

.confetti:nth-child(3) {
  background: #6BCB77;
  left: 50%;
  animation-delay: 0.2s;
}

.confetti:nth-child(4) {
  background: #4D96FF;
  left: 65%;
  animation-delay: 0.3s;
}

.confetti:nth-child(5) {
  background: #FF9FF3;
  left: 80%;
  animation-delay: 0.4s;
}

@keyframes confetti-fall {
  0% {
    transform: translateY(-50px) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(50px) rotate(360deg);
    opacity: 0;
  }
}

.success-title {
  font-size: 24px;
  color: #333;
  margin: 15px 0 10px;
}

.success-message {
  font-size: 16px;
  color: #666;
  margin-bottom: 15px;
}

.stars {
  display: flex;
  justify-content: center;
  gap: 5px;
}

.star {
  font-size: 24px;
  animation: star-pulse 0.5s ease infinite alternate;
}

.star:nth-child(1) { animation-delay: 0s; }
.star:nth-child(2) { animation-delay: 0.1s; }
.star:nth-child(3) { animation-delay: 0.2s; }
.star:nth-child(4) { animation-delay: 0.3s; }
.star:nth-child(5) { animation-delay: 0.4s; }

@keyframes star-pulse {
  0% { transform: scale(1); }
  100% { transform: scale(1.2); }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .daily-check {
    padding: 15px;
  }

  .title {
    font-size: 22px;
  }

  .status-buttons {
    flex-direction: column;
  }

  .status-btn {
    padding: 15px;
  }

  .exercise-item {
    flex-wrap: wrap;
  }

  .exercise-action {
    width: 100%;
    margin-top: 10px;
  }

  .exercise-action >>> .el-button {
    width: 100%;
  }
}
</style>