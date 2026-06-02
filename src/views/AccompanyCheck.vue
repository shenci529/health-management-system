<template>
  <div class="accompany-check">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="title">
        <i class="el-icon-user-solid"></i>
        陪同打卡
      </h1>
      <p class="subtitle">陪伴孩子完成每日健康打卡，共同培养健康习惯</p>
    </div>

    <!-- 今日打卡状态 -->
    <div class="today-status">
      <div class="status-card" :class="{ completed: isTodayCompleted }">
        <div class="status-icon">
          <i :class="isTodayCompleted ? 'el-icon-success' : 'el-icon-time'"></i>
        </div>
        <div class="status-info">
          <h3>{{ isTodayCompleted ? '今日已完成打卡' : '今日尚未打卡' }}</h3>
          <p v-if="isTodayCompleted">太棒了！您已陪伴孩子完成今日健康打卡</p>
          <p v-else>记得和孩子一起完成今日的健康打卡哦</p>
        </div>
        <div class="status-action">
          <el-button 
            v-if="!isTodayCompleted"
            type="primary" 
            size="large" 
            icon="el-icon-check"
            @click="showCheckDialog = true">
            立即打卡
          </el-button>
          <el-tag v-else type="success" size="large">
            <i class="el-icon-check"></i> 已完成
          </el-tag>
        </div>
      </div>
    </div>

    <!-- 打卡统计 -->
    <div class="stats-section">
      <el-row :gutter="20">
        <el-col :span="8">
          <div class="stat-item">
            <div class="stat-number">{{ consecutiveDays }}</div>
            <div class="stat-label">连续打卡天数</div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="stat-item">
            <div class="stat-number">{{ totalDays }}</div>
            <div class="stat-label">累计打卡天数</div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="stat-item">
            <div class="stat-number">{{ thisMonthDays }}</div>
            <div class="stat-label">本月打卡天数</div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 打卡日历 -->
    <div class="calendar-section">
      <div class="section-header">
        <div class="section-icon">
          <i class="el-icon-date"></i>
        </div>
        <span class="section-title">打卡日历</span>
        <el-radio-group v-model="calendarView" size="small" class="view-switch">
          <el-radio-button label="month">月视图</el-radio-button>
          <el-radio-button label="week">周视图</el-radio-button>
        </el-radio-group>
      </div>

      <!-- 月视图 -->
      <div v-if="calendarView === 'month'" class="month-calendar">
        <div class="calendar-header">
          <el-button icon="el-icon-arrow-left" circle size="small" @click="prevMonth"></el-button>
          <span class="current-month">{{ currentYearMonth }}</span>
          <el-button icon="el-icon-arrow-right" circle size="small" @click="nextMonth"></el-button>
        </div>
        <div class="weekdays">
          <span v-for="day in weekdays" :key="day" class="weekday">{{ day }}</span>
        </div>
        <div class="days-grid">
          <div 
            v-for="(day, index) in calendarDays" 
            :key="index"
            class="day-cell"
            :class="{ 
              'other-month': !day.isCurrentMonth, 
              'today': day.isToday,
              'checked': day.isChecked,
              'weekend': day.isWeekend
            }"
            @click="day.isCurrentMonth && viewDayDetail(day)">
            <span class="day-number">{{ day.date }}</span>
            <div v-if="day.isChecked" class="check-mark">
              <i class="el-icon-check"></i>
            </div>
            <div v-if="day.hasNote" class="note-indicator"></div>
          </div>
        </div>
      </div>

      <!-- 周视图 -->
      <div v-else class="week-calendar">
        <div class="calendar-header">
          <el-button icon="el-icon-arrow-left" circle size="small" @click="prevWeek"></el-button>
          <span class="current-week">{{ currentWeekRange }}</span>
          <el-button icon="el-icon-arrow-right" circle size="small" @click="nextWeek"></el-button>
        </div>
        <div class="week-days">
          <div 
            v-for="day in weekDays" 
            :key="day.fullDate"
            class="week-day"
            :class="{ 'today': day.isToday, 'checked': day.isChecked }"
            @click="viewDayDetail(day)">
            <div class="day-name">{{ day.name }}</div>
            <div class="day-date">{{ day.date }}</div>
            <div class="check-status">
              <i v-if="day.isChecked" class="el-icon-success"></i>
              <i v-else class="el-icon-circle-check"></i>
            </div>
            <div v-if="day.notes" class="day-notes">
              <el-tooltip :content="day.notes" placement="top">
                <i class="el-icon-notebook-2"></i>
              </el-tooltip>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 打卡记录列表 -->
    <div class="records-section">
      <div class="section-header">
        <div class="section-icon records-icon">
          <i class="el-icon-document"></i>
        </div>
        <span class="section-title">打卡记录</span>
      </div>

      <div class="records-list">
        <div v-for="record in checkRecords" :key="record.id" class="record-item">
          <div class="record-date">
            <div class="date-day">{{ record.day }}</div>
            <div class="date-month">{{ record.month }}</div>
          </div>
          <div class="record-content">
            <div class="record-header">
              <span class="record-title">陪同打卡</span>
              <el-tag size="mini" :type="record.status === 'completed' ? 'success' : 'warning'">
                {{ record.status === 'completed' ? '已完成' : '部分完成' }}
              </el-tag>
            </div>
            <div class="record-details">
              <div class="detail-item">
                <i class="el-icon-thermometer"></i>
                <span>体温：{{ record.temperature }}°C</span>
              </div>
              <div class="detail-item">
                <i class="el-icon-star-on"></i>
                <span>状态：{{ record.spirit }}</span>
              </div>
              <div class="detail-item">
                <i class="el-icon-time"></i>
                <span>打卡时间：{{ record.checkTime }}</span>
              </div>
            </div>
            <p v-if="record.notes" class="record-notes">
              <i class="el-icon-edit"></i> {{ record.notes }}
            </p>
          </div>
        </div>

        <div v-if="checkRecords.length === 0" class="empty-state">
          <i class="el-icon-calendar"></i>
          <p>暂无打卡记录</p>
        </div>
      </div>
    </div>

    <!-- 打卡弹窗 -->
    <el-dialog
      title="陪同打卡"
      :visible.sync="showCheckDialog"
      width="500px"
      center>
      <div class="check-form">
        <div class="form-header">
          <i class="el-icon-sunny"></i>
          <span>{{ currentDate }}</span>
        </div>

        <el-form :model="checkForm" label-width="100px">
          <el-form-item label="今日体温">
            <el-input-number 
              v-model="checkForm.temperature" 
              :min="35" 
              :max="42" 
              :precision="1"
              :step="0.1"
              style="width: 150px">
            </el-input-number>
            <span class="unit">°C</span>
            <div class="temp-hint" :class="tempHintClass">
              {{ tempHintText }}
            </div>
          </el-form-item>

          <el-form-item label="精神状态">
            <div class="spirit-options">
              <div 
                v-for="option in spiritOptions" 
                :key="option.value"
                class="spirit-option"
                :class="{ active: checkForm.spirit === option.value }"
                @click="checkForm.spirit = option.value">
                <div class="spirit-emoji">{{ option.emoji }}</div>
                <div class="spirit-label">{{ option.label }}</div>
              </div>
            </div>
          </el-form-item>

          <el-form-item label="身体状况">
            <el-checkbox-group v-model="checkForm.symptoms">
              <el-checkbox label="normal">一切正常</el-checkbox>
              <el-checkbox label="cough">咳嗽</el-checkbox>
              <el-checkbox label="fever">发热</el-checkbox>
              <el-checkbox label="stomach">肚子不舒服</el-checkbox>
              <el-checkbox label="other">其他不适</el-checkbox>
            </el-checkbox-group>
          </el-form-item>

          <el-form-item label="备注">
            <el-input
              v-model="checkForm.notes"
              type="textarea"
              :rows="3"
              placeholder="如有特殊情况请在此说明">
            </el-input>
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer">
        <el-button @click="showCheckDialog = false">取消</el-button>
        <el-button type="primary" @click="submitCheck" :loading="submitting">
          确认打卡
        </el-button>
      </div>
    </el-dialog>

    <!-- 打卡成功动画 -->
    <el-dialog
      :visible.sync="showSuccessAnimation"
      width="350px"
      center
      :show-close="false"
      custom-class="success-dialog">
      <div class="success-content">
        <div class="success-icon">
          <i class="el-icon-success"></i>
        </div>
        <h3>打卡成功！</h3>
        <p>您已陪伴孩子完成今日健康打卡</p>
        <div class="success-stars">
          <span v-for="n in 5" :key="n">⭐</span>
        </div>
        <div class="success-message">
          <p>连续打卡 {{ consecutiveDays }} 天</p>
          <p>继续保持哦！</p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'AccompanyCheck',
  data() {
    return {
      isTodayCompleted: false,
      consecutiveDays: 12,
      totalDays: 156,
      thisMonthDays: 28,
      calendarView: 'month',
      currentMonthOffset: 0,
      currentWeekOffset: 0,
      showCheckDialog: false,
      showSuccessAnimation: false,
      submitting: false,
      weekdays: ['日', '一', '二', '三', '四', '五', '六'],
      spiritOptions: [
        { value: 'excellent', label: '很好', emoji: '😊' },
        { value: 'good', label: '良好', emoji: '🙂' },
        { value: 'normal', label: '一般', emoji: '😐' },
        { value: 'tired', label: '疲倦', emoji: '😔' }
      ],
      checkForm: {
        temperature: 36.5,
        spirit: 'good',
        symptoms: ['normal'],
        notes: ''
      },
      checkRecords: [
        {
          id: 1,
          day: '05',
          month: '6月',
          status: 'completed',
          temperature: 36.5,
          spirit: '很好',
          checkTime: '07:30',
          notes: '今天精神很好，早餐吃得也不错'
        },
        {
          id: 2,
          day: '04',
          month: '6月',
          status: 'completed',
          temperature: 36.3,
          spirit: '良好',
          checkTime: '07:45',
          notes: ''
        },
        {
          id: 3,
          day: '03',
          month: '6月',
          status: 'completed',
          temperature: 36.6,
          spirit: '很好',
          checkTime: '07:20',
          notes: '参加了运动会，很开心'
        }
      ]
    };
  },
  computed: {
    currentDate() {
      const date = new Date();
      return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
    },
    currentYearMonth() {
      const date = new Date();
      date.setMonth(date.getMonth() + this.currentMonthOffset);
      return `${date.getFullYear()}年${date.getMonth() + 1}月`;
    },
    currentWeekRange() {
      const now = new Date();
      now.setDate(now.getDate() + this.currentWeekOffset * 7);
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      return `${weekStart.getMonth() + 1}月${weekStart.getDate()}日 - ${weekEnd.getMonth() + 1}月${weekEnd.getDate()}日`;
    },
    calendarDays() {
      const days = [];
      const date = new Date();
      date.setMonth(date.getMonth() + this.currentMonthOffset);
      date.setDate(1);
      
      const firstDay = date.getDay();
      const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
      const daysInPrevMonth = new Date(date.getFullYear(), date.getMonth(), 0).getDate();
      
      // 上个月的日期
      for (let i = firstDay - 1; i >= 0; i--) {
        days.push({
          date: daysInPrevMonth - i,
          isCurrentMonth: false,
          isToday: false,
          isChecked: Math.random() > 0.5,
          isWeekend: (days.length % 7 === 0) || (days.length % 7 === 6)
        });
      }
      
      // 当前月的日期
      const today = new Date();
      for (let i = 1; i <= daysInMonth; i++) {
        const isToday = i === today.getDate() && 
                       date.getMonth() === today.getMonth() && 
                       date.getFullYear() === today.getFullYear();
        days.push({
          date: i,
          isCurrentMonth: true,
          isToday: isToday,
          isChecked: i < today.getDate() || (isToday && this.isTodayCompleted),
          isWeekend: (days.length % 7 === 0) || (days.length % 7 === 6),
          hasNote: Math.random() > 0.7
        });
      }
      
      // 下个月的日期
      const remainingDays = 42 - days.length;
      for (let i = 1; i <= remainingDays; i++) {
        days.push({
          date: i,
          isCurrentMonth: false,
          isToday: false,
          isChecked: false,
          isWeekend: (days.length % 7 === 0) || (days.length % 7 === 6)
        });
      }
      
      return days;
    },
    weekDays() {
      const days = [];
      const now = new Date();
      now.setDate(now.getDate() + this.currentWeekOffset * 7);
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      
      const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
      const today = new Date();
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + i);
        const isToday = date.toDateString() === today.toDateString();
        days.push({
          name: dayNames[i],
          date: `${date.getMonth() + 1}/${date.getDate()}`,
          fullDate: date.toISOString().split('T')[0],
          isToday: isToday,
          isChecked: date < today || (isToday && this.isTodayCompleted),
          notes: isToday ? '今天精神很好' : null
        });
      }
      
      return days;
    },
    tempHintClass() {
      const temp = this.checkForm.temperature;
      if (temp < 36.0) return 'temp-low';
      if (temp >= 36.0 && temp <= 37.3) return 'temp-normal';
      if (temp > 37.3 && temp <= 38.0) return 'temp-warm';
      return 'temp-high';
    },
    tempHintText() {
      const temp = this.checkForm.temperature;
      if (temp < 36.0) return '体温偏低';
      if (temp >= 36.0 && temp <= 37.3) return '体温正常';
      if (temp > 37.3 && temp <= 38.0) return '体温偏高';
      return '体温较高，请注意';
    }
  },
  methods: {
    // 提交打卡
    submitCheck() {
      this.submitting = true;
      setTimeout(() => {
        this.isTodayCompleted = true;
        this.submitting = false;
        this.showCheckDialog = false;
        this.showSuccessAnimation = true;
        
        // 添加新记录
        const now = new Date();
        const spiritMap = {
          'excellent': '很好',
          'good': '良好',
          'normal': '一般',
          'tired': '疲倦'
        };
        
        this.checkRecords.unshift({
          id: Date.now(),
          day: String(now.getDate()).padStart(2, '0'),
          month: `${now.getMonth() + 1}月`,
          status: 'completed',
          temperature: this.checkForm.temperature,
          spirit: spiritMap[this.checkForm.spirit],
          checkTime: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
          notes: this.checkForm.notes
        });
        
        setTimeout(() => {
          this.showSuccessAnimation = false;
        }, 3000);
      }, 1000);
    },
    // 查看日期详情
    viewDayDetail(day) {
      if (!day.isChecked) {
        this.$message.info('该日期尚未打卡');
        return;
      }
      // 可以展开显示当天的详细打卡信息
      this.$message.success(`查看 ${day.date} 日的打卡详情`);
    },
    // 上个月
    prevMonth() {
      this.currentMonthOffset--;
    },
    // 下个月
    nextMonth() {
      this.currentMonthOffset++;
    },
    // 上周
    prevWeek() {
      this.currentWeekOffset--;
    },
    // 下周
    nextWeek() {
      this.currentWeekOffset++;
    }
  }
};
</script>

<style scoped>
.accompany-check {
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

/* 今日状态 */
.today-status {
  margin-bottom: 25px;
}

.status-card {
  background: #fff;
  border-radius: 12px;
  padding: 30px;
  display: flex;
  align-items: center;
  gap: 25px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border-left: 4px solid #E6A23C;
}

.status-card.completed {
  border-left-color: #67C23A;
}

.status-icon {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  background: #fdf6ec;
  color: #E6A23C;
}

.status-card.completed .status-icon {
  background: #f0f9eb;
  color: #67C23A;
}

.status-info {
  flex: 1;
}

.status-info h3 {
  margin: 0 0 8px;
  font-size: 20px;
  color: #333;
}

.status-info p {
  margin: 0;
  color: #999;
  font-size: 14px;
}

/* 统计区域 */
.stats-section {
  background: #fff;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 25px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.stat-item {
  text-align: center;
  padding: 20px;
}

.stat-number {
  font-size: 36px;
  font-weight: bold;
  color: #409EFF;
  margin-bottom: 8px;
}

.stat-label {
  color: #666;
  font-size: 14px;
}

/* 日历区域 */
.calendar-section {
  background: #fff;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 25px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
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

.records-icon {
  background: #67C23A;
}

.section-title {
  font-size: 18px;
  font-weight: 500;
  color: #333;
  flex: 1;
}

.view-switch {
  margin-left: auto;
}

/* 月视图日历 */
.month-calendar {
  padding: 10px;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.current-month {
  font-size: 18px;
  font-weight: 500;
  color: #333;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 10px;
  margin-bottom: 10px;
}

.weekday {
  text-align: center;
  font-weight: 500;
  color: #666;
  padding: 10px;
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 10px;
}

.day-cell {
  aspect-ratio: 1;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  background: #f5f7fa;
}

.day-cell:hover {
  background: #e4e7ed;
}

.day-cell.other-month {
  color: #c0c4cc;
  background: transparent;
}

.day-cell.today {
  background: #ecf5ff;
  border: 2px solid #409EFF;
}

.day-cell.checked {
  background: #f0f9eb;
}

.day-cell.weekend:not(.other-month) {
  background: #fdf6ec;
}

.day-number {
  font-size: 16px;
  font-weight: 500;
}

.check-mark {
  position: absolute;
  bottom: 5px;
  color: #67C23A;
  font-size: 14px;
}

.note-indicator {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #E6A23C;
}

/* 周视图日历 */
.week-calendar {
  padding: 10px;
}

.current-week {
  font-size: 16px;
  color: #333;
}

.week-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 15px;
}

.week-day {
  background: #f5f7fa;
  border-radius: 12px;
  padding: 20px 10px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.week-day:hover {
  background: #e4e7ed;
}

.week-day.today {
  background: #ecf5ff;
  border: 2px solid #409EFF;
}

.week-day.checked {
  background: #f0f9eb;
}

.day-name {
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
}

.day-date {
  font-size: 18px;
  font-weight: 500;
  color: #333;
  margin-bottom: 10px;
}

.check-status {
  font-size: 24px;
}

.check-status .el-icon-success {
  color: #67C23A;
}

.check-status .el-icon-circle-check {
  color: #c0c4cc;
}

.day-notes {
  position: absolute;
  top: 10px;
  right: 10px;
  color: #E6A23C;
}

/* 打卡记录 */
.records-section {
  background: #fff;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.records-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.record-item {
  display: flex;
  gap: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.record-item:hover {
  background: #f0f2f5;
}

.record-date {
  width: 60px;
  height: 60px;
  background: #409EFF;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
}

.date-day {
  font-size: 24px;
  font-weight: bold;
}

.date-month {
  font-size: 12px;
}

.record-content {
  flex: 1;
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.record-title {
  font-weight: 500;
  color: #333;
}

.record-details {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 10px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #666;
  font-size: 14px;
}

.detail-item i {
  color: #409EFF;
}

.record-notes {
  margin: 0;
  padding: 10px;
  background: #fff;
  border-radius: 4px;
  color: #666;
  font-size: 14px;
}

.record-notes i {
  color: #E6A23C;
  margin-right: 5px;
}

/* 打卡表单 */
.check-form {
  padding: 10px;
}

.form-header {
  text-align: center;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #EBEEF5;
}

.form-header i {
  font-size: 36px;
  color: #E6A23C;
  margin-bottom: 10px;
  display: block;
}

.form-header span {
  font-size: 16px;
  color: #666;
}

.unit {
  margin-left: 10px;
  color: #666;
}

.temp-hint {
  margin-top: 8px;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 13px;
  display: inline-block;
}

.temp-low {
  background: #e3f2fd;
  color: #2196f3;
}

.temp-normal {
  background: #e8f5e9;
  color: #4caf50;
}

.temp-warm {
  background: #fff3e0;
  color: #ff9800;
}

.temp-high {
  background: #ffebee;
  color: #f44336;
}

.spirit-options {
  display: flex;
  gap: 15px;
}

.spirit-option {
  flex: 1;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.spirit-option:hover {
  background: #e4e7ed;
}

.spirit-option.active {
  background: #ecf5ff;
  border-color: #409EFF;
}

.spirit-emoji {
  font-size: 32px;
  margin-bottom: 5px;
}

.spirit-label {
  font-size: 14px;
  color: #666;
}

/* 成功动画 */
.success-dialog >>> .el-dialog {
  border-radius: 20px;
}

.success-content {
  text-align: center;
  padding: 20px;
}

.success-icon {
  font-size: 80px;
  color: #67C23A;
  margin-bottom: 15px;
}

.success-content h3 {
  font-size: 24px;
  color: #333;
  margin: 0 0 10px;
}

.success-content p {
  color: #666;
  margin: 0 0 15px;
}

.success-stars {
  font-size: 24px;
  margin-bottom: 15px;
}

.success-message {
  background: #f0f9eb;
  padding: 15px;
  border-radius: 8px;
}

.success-message p {
  margin: 5px 0;
  color: #67C23A;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 40px;
  color: #999;
}

.empty-state i {
  font-size: 48px;
  color: #ddd;
  margin-bottom: 10px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .accompany-check {
    padding: 15px;
  }

  .title {
    font-size: 22px;
  }

  .status-card {
    flex-direction: column;
    text-align: center;
    padding: 20px;
  }

  .week-days {
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
  }

  .week-day:nth-child(5),
  .week-day:nth-child(6),
  .week-day:nth-child(7) {
    grid-column: span 1;
  }

  .days-grid {
    gap: 5px;
  }

  .day-cell {
    font-size: 14px;
  }

  .spirit-options {
    flex-wrap: wrap;
  }

  .spirit-option {
    min-width: 70px;
  }
}
</style>
