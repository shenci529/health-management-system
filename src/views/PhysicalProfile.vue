<template>
  <div class="physical-profile">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="title">
        <i class="el-icon-data-line"></i>
        体质小档案
      </h1>
      <p class="subtitle">记录成长点滴，见证健康变化</p>
    </div>

    <!-- 当前体质数据卡片 -->
    <div class="current-data">
      <div class="data-card height-card">
        <div class="data-icon">
          <span class="data-emoji">📏</span>
        </div>
        <div class="data-info">
          <div class="data-label">当前身高</div>
          <div class="data-value">{{ currentData.height }} cm</div>
          <div class="data-change positive" v-if="heightChange > 0">
            <i class="el-icon-top"></i>
            +{{ heightChange }} cm
          </div>
        </div>
        <div class="data-chart-mini">
          <div class="mini-bar" :style="{ height: (currentData.height / 180 * 100) + '%' }"></div>
        </div>
      </div>

      <div class="data-card weight-card">
        <div class="data-icon">
          <span class="data-emoji">⚖️</span>
        </div>
        <div class="data-info">
          <div class="data-label">当前体重</div>
          <div class="data-value">{{ currentData.weight }} kg</div>
          <div class="data-change" :class="weightChangeClass">
            <i :class="weightChangeIcon"></i>
            {{ weightChangeText }}
          </div>
        </div>
        <div class="data-chart-mini">
          <div class="mini-bar weight-bar" :style="{ height: (currentData.weight / 80 * 100) + '%' }"></div>
        </div>
      </div>

      <div class="data-card bmi-card">
        <div class="data-icon">
          <span class="data-emoji">💪</span>
        </div>
        <div class="data-info">
          <div class="data-label">BMI指数</div>
          <div class="data-value">{{ currentData.bmi }}</div>
          <div class="bmi-status" :class="bmiStatusClass">{{ bmiStatusText }}</div>
        </div>
        <div class="bmi-indicator">
          <div class="bmi-scale">
            <div class="scale-section underweight"></div>
            <div class="scale-section normal"></div>
            <div class="scale-section overweight"></div>
            <div class="scale-section obese"></div>
          </div>
          <div class="bmi-pointer" :style="{ left: bmiPointerPosition + '%' }"></div>
        </div>
      </div>
    </div>

    <!-- 身高体重曲线图表 -->
    <div class="chart-section">
      <div class="section-header">
        <h2>
          <i class="el-icon-s-marketing"></i>
          成长曲线
        </h2>
        <div class="chart-tabs">
          <el-radio-group v-model="chartType" size="medium">
            <el-radio-button label="height">身高</el-radio-button>
            <el-radio-button label="weight">体重</el-radio-button>
            <el-radio-button label="both">双曲线</el-radio-button>
          </el-radio-group>
        </div>
      </div>

      <!-- CSS图表容器 -->
      <div class="chart-container">
        <div class="chart-wrapper">
          <!-- Y轴标签 -->
          <div class="y-axis">
            <div class="y-label" v-for="(label, index) in yLabels" :key="index">{{ label }}</div>
          </div>

          <!-- 图表主体 -->
          <div class="chart-main">
            <!-- 网格线 -->
            <div class="grid-lines">
              <div class="grid-line" v-for="n in 6" :key="n"></div>
            </div>

            <!-- 身高曲线 -->
            <div class="line-chart height-line" v-if="chartType === 'height' || chartType === 'both'">
              <div class="chart-point" v-for="(point, index) in heightData" :key="'h-' + index"
                   :style="{ left: (index / (heightData.length - 1) * 90) + '%', bottom: (point.value / maxYValue * 85) + '%' }">
                <div class="point-dot height-dot"></div>
                <div class="point-label">{{ point.value }}</div>
              </div>
              <!-- 连接线 -->
              <svg class="line-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
                <polyline :points="heightLinePoints" fill="none" stroke="#FF6B6B" stroke-width="2"/>
              </svg>
            </div>

            <!-- 体重曲线 -->
            <div class="line-chart weight-line" v-if="chartType === 'weight' || chartType === 'both'">
              <div class="chart-point" v-for="(point, index) in weightData" :key="'w-' + index"
                   :style="{ left: (index / (weightData.length - 1) * 90) + '%', bottom: (point.value / maxYValue * 85) + '%' }">
                <div class="point-dot weight-dot"></div>
                <div class="point-label">{{ point.value }}</div>
              </div>
              <!-- 连接线 -->
              <svg class="line-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
                <polyline :points="weightLinePoints" fill="none" stroke="#4D96FF" stroke-width="2"/>
              </svg>
            </div>

            <!-- X轴标签 -->
            <div class="x-axis">
              <div class="x-label" v-for="(label, index) in xLabels" :key="index">{{ label }}</div>
            </div>
          </div>
        </div>

        <!-- 图例 -->
        <div class="chart-legend" v-if="chartType === 'both'">
          <div class="legend-item height-legend">
            <span class="legend-dot"></span>
            <span>身高 (cm)</span>
          </div>
          <div class="legend-item weight-legend">
            <span class="legend-dot"></span>
            <span>体重 (kg)</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 发育评估结果 -->
    <div class="assessment-section">
      <div class="section-header">
        <h2>
          <i class="el-icon-document-checked"></i>
          发育评估
        </h2>
      </div>

      <div class="assessment-cards">
        <!-- 身高评估 -->
        <div class="assessment-card">
          <div class="assessment-header">
            <div class="assessment-icon height-icon">
              <i class="el-icon-top"></i>
            </div>
            <div class="assessment-title">身高发育</div>
          </div>
          <div class="assessment-content">
            <div class="assessment-level" :class="heightLevelClass">{{ heightLevel }}</div>
            <div class="assessment-desc">{{ heightDesc }}</div>
            <div class="assessment-bar">
              <div class="bar-track">
                <div class="bar-fill height-fill" :style="{ width: heightPercent + '%' }"></div>
              </div>
              <div class="bar-labels">
                <span>偏低</span>
                <span>标准</span>
                <span>偏高</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 体重评估 -->
        <div class="assessment-card">
          <div class="assessment-header">
            <div class="assessment-icon weight-icon">
              <i class="el-icon-bottom"></i>
            </div>
            <div class="assessment-title">体重发育</div>
          </div>
          <div class="assessment-content">
            <div class="assessment-level" :class="weightLevelClass">{{ weightLevel }}</div>
            <div class="assessment-desc">{{ weightDesc }}</div>
            <div class="assessment-bar">
              <div class="bar-track">
                <div class="bar-fill weight-fill" :style="{ width: weightPercent + '%' }"></div>
              </div>
              <div class="bar-labels">
                <span>偏轻</span>
                <span>标准</span>
                <span>偏重</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 综合评估 -->
        <div class="assessment-card overall-card">
          <div class="assessment-header">
            <div class="assessment-icon overall-icon">
              <i class="el-icon-star-on"></i>
            </div>
            <div class="assessment-title">综合发育</div>
          </div>
          <div class="assessment-content">
            <div class="overall-score">
              <div class="score-circle">
                <div class="score-value">{{ overallScore }}</div>
                <div class="score-label">综合得分</div>
              </div>
              <div class="score-stars">
                <i class="el-icon-star-on" v-for="n in overallStars" :key="n"></i>
                <i class="el-icon-star-off" v-for="n in (5 - overallStars)" :key="'off-' + n"></i>
              </div>
            </div>
            <div class="overall-suggestion">
              <div class="suggestion-title">健康建议</div>
              <div class="suggestion-list">
                <div class="suggestion-item" v-for="(item, index) in suggestions" :key="index">
                  <i class="el-icon-check"></i>
                  {{ item }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 成长变化可视化 -->
    <div class="growth-section">
      <div class="section-header">
        <h2>
          <i class="el-icon-time"></i>
          成长记录
        </h2>
        <el-button type="primary" size="medium" @click="showAddDialog = true">
          <i class="el-icon-plus"></i>
          添加记录
        </el-button>
      </div>

      <!-- 成长时间轴 -->
      <div class="growth-timeline">
        <div class="timeline-item" v-for="(record, index) in growthRecords" :key="index">
          <div class="timeline-marker">
            <div class="marker-dot" :class="{ latest: index === 0 }"></div>
            <div class="marker-line" v-if="index < growthRecords.length - 1"></div>
          </div>
          <div class="timeline-content">
            <div class="record-date">{{ record.date }}</div>
            <div class="record-data">
              <div class="record-item">
                <span class="record-label">身高</span>
                <span class="record-value">{{ record.height }} cm</span>
                <span class="record-change" v-if="record.heightChange" :class="{ positive: record.heightChange > 0 }">
                  {{ record.heightChange > 0 ? '+' : '' }}{{ record.heightChange }} cm
                </span>
              </div>
              <div class="record-item">
                <span class="record-label">体重</span>
                <span class="record-value">{{ record.weight }} kg</span>
                <span class="record-change" :class="record.weightChange > 0 ? 'positive' : 'negative'">
                  {{ record.weightChange > 0 ? '+' : '' }}{{ record.weightChange }} kg
                </span>
              </div>
            </div>
            <div class="record-badge" v-if="record.milestone">
              <el-tag type="warning" size="small">
                <i class="el-icon-medal"></i>
                {{ record.milestone }}
              </el-tag>
            </div>
          </div>
        </div>
      </div>

      <!-- 成长里程碑 -->
      <div class="milestone-section">
        <h3 class="milestone-title">
          <i class="el-icon-trophy"></i>
          成长里程碑
        </h3>
        <div class="milestone-grid">
          <div class="milestone-item" v-for="(milestone, index) in milestones" :key="index" :class="{ achieved: milestone.achieved }">
            <div class="milestone-icon">
              <span class="milestone-emoji">{{ milestone.emoji }}</span>
            </div>
            <div class="milestone-info">
              <div class="milestone-name">{{ milestone.name }}</div>
              <div class="milestone-date" v-if="milestone.achieved">{{ milestone.date }}</div>
              <div class="milestone-target" v-else>目标: {{ milestone.target }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加记录弹窗 -->
    <el-dialog
      title="添加成长记录"
      :visible.sync="showAddDialog"
      width="400px"
      center
      custom-class="add-dialog">
      <el-form :model="newRecord" label-width="80px" label-position="left">
        <el-form-item label="记录日期">
          <el-date-picker
            v-model="newRecord.date"
            type="date"
            placeholder="选择日期"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd"
            style="width: 100%;">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="身高 (cm)">
          <el-input-number
            v-model="newRecord.height"
            :min="50"
            :max="200"
            :precision="1"
            style="width: 100%;">
          </el-input-number>
        </el-form-item>
        <el-form-item label="体重 (kg)">
          <el-input-number
            v-model="newRecord.weight"
            :min="10"
            :max="100"
            :precision="1"
            style="width: 100%;">
          </el-input-number>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="addRecord">保存记录</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'PhysicalProfile',
  data() {
    return {
      currentData: {
        height: 145,
        weight: 38,
        bmi: 18.2
      },
      heightData: [
        { month: '1月', value: 120 },
        { month: '3月', value: 125 },
        { month: '5月', value: 130 },
        { month: '7月', value: 135 },
        { month: '9月', value: 140 },
        { month: '11月', value: 145 }
      ],
      weightData: [
        { month: '1月', value: 25 },
        { month: '3月', value: 28 },
        { month: '5月', value: 30 },
        { month: '7月', value: 33 },
        { month: '9月', value: 35 },
        { month: '11月', value: 38 }
      ],
      chartType: 'both',
      maxYValue: 150,
      growthRecords: [
        { date: '2024年11月', height: 145, weight: 38, heightChange: 5, weightChange: 3, milestone: '身高突破145cm！' },
        { date: '2024年9月', height: 140, weight: 35, heightChange: 5, weightChange: 2 },
        { date: '2024年7月', height: 135, weight: 33, heightChange: 5, weightChange: 3 },
        { date: '2024年5月', height: 130, weight: 30, heightChange: 5, weightChange: 2, milestone: '体重达标！' },
        { date: '2024年3月', height: 125, weight: 28, heightChange: 5, weightChange: 3 },
        { date: '2024年1月', height: 120, weight: 25, heightChange: 0, weightChange: 0 }
      ],
      milestones: [
        { name: '身高150cm', emoji: '📏', target: '150cm', achieved: false, date: '' },
        { name: '体重40kg', emoji: '⚖️', target: '40kg', achieved: false, date: '' },
        { name: 'BMI达标', emoji: '💪', target: '18.5-23', achieved: true, date: '2024年5月' },
        { name: '身高增长10cm', emoji: '📈', target: '年增10cm', achieved: true, date: '2024年11月' }
      ],
      showAddDialog: false,
      newRecord: {
        date: '',
        height: 145,
        weight: 38
      },
      suggestions: [
        '保持规律作息，每天睡眠不少于9小时',
        '多参加户外运动，增强体质',
        '均衡饮食，多吃蔬菜水果',
        '定期体检，关注成长发育'
      ]
    };
  },
  computed: {
    heightChange() {
      if (this.growthRecords.length < 2) return 0;
      return this.growthRecords[0].height - this.growthRecords[1].height;
    },
    weightChange() {
      if (this.growthRecords.length < 2) return 0;
      return this.growthRecords[0].weight - this.growthRecords[1].weight;
    },
    weightChangeClass() {
      const change = this.weightChange;
      if (change > 0) return 'positive';
      if (change < 0) return 'negative';
      return 'neutral';
    },
    weightChangeIcon() {
      const change = this.weightChange;
      if (change > 0) return 'el-icon-top';
      if (change < 0) return 'el-icon-bottom';
      return 'el-icon-minus';
    },
    weightChangeText() {
      const change = this.weightChange;
      if (change > 0) return '+' + change + ' kg';
      if (change < 0) return change + ' kg';
      return '持平';
    },
    bmiStatusClass() {
      const bmi = this.currentData.bmi;
      if (bmi < 18.5) return 'underweight';
      if (bmi >= 18.5 && bmi < 24) return 'normal';
      if (bmi >= 24 && bmi < 28) return 'overweight';
      return 'obese';
    },
    bmiStatusText() {
      const bmi = this.currentData.bmi;
      if (bmi < 18.5) return '偏瘦';
      if (bmi >= 18.5 && bmi < 24) return '正常';
      if (bmi >= 24 && bmi < 28) return '偏重';
      return '需关注';
    },
    bmiPointerPosition() {
      const bmi = this.currentData.bmi;
      // BMI范围 15-30 映射到 0-100%
      return Math.min(Math.max((bmi - 15) / 15 * 100, 0), 100);
    },
    yLabels() {
      if (this.chartType === 'weight') {
        return ['40', '32', '24', '16', '8', '0'];
      }
      return ['150', '120', '90', '60', '30', '0'];
    },
    xLabels() {
      return this.heightData.map(d => d.month);
    },
    heightLinePoints() {
      const points = this.heightData.map((point, index) => {
        const x = (index / (this.heightData.length - 1) * 90) + 5;
        const y = 100 - (point.value / this.maxYValue * 85) - 5;
        return `${x},${y}`;
      });
      return points.join(' ');
    },
    weightLinePoints() {
      const maxWeight = 40;
      const points = this.weightData.map((point, index) => {
        const x = (index / (this.weightData.length - 1) * 90) + 5;
        const y = 100 - (point.value / maxWeight * 85) - 5;
        return `${x},${y}`;
      });
      return points.join(' ');
    },
    heightLevel() {
      const age = 10; // 假设年龄
      const height = this.currentData.height;
      // 简化的评估逻辑
      if (height >= 140) return '优秀';
      if (height >= 130) return '良好';
      if (height >= 120) return '正常';
      return '需关注';
    },
    heightLevelClass() {
      const level = this.heightLevel;
      if (level === '优秀') return 'level-excellent';
      if (level === '良好') return 'level-good';
      if (level === '正常') return 'level-normal';
      return 'level-warning';
    },
    heightDesc() {
      return '身高发育符合年龄标准，继续保持良好的生活习惯有助于进一步成长。';
    },
    heightPercent() {
      return Math.min((this.currentData.height / 150) * 100, 100);
    },
    weightLevel() {
      const weight = this.currentData.weight;
      if (weight >= 35 && weight <= 45) return '标准';
      if (weight < 35) return '偏轻';
      return '偏重';
    },
    weightLevelClass() {
      const level = this.weightLevel;
      if (level === '标准') return 'level-excellent';
      if (level === '偏轻') return 'level-warning';
      return 'level-warning';
    },
    weightDesc() {
      return '体重发育处于健康范围，注意均衡饮食和适量运动。';
    },
    weightPercent() {
      return Math.min((this.currentData.weight / 50) * 100, 100);
    },
    overallScore() {
      return 85;
    },
    overallStars() {
      return Math.round(this.overallScore / 20);
    }
  },
  created() {
    this.loadProfileData();
  },
  methods: {
    loadProfileData() {
      const savedData = localStorage.getItem('physicalProfileData');
      if (savedData) {
        const data = JSON.parse(savedData);
        this.currentData = data.currentData || this.currentData;
        this.growthRecords = data.growthRecords || this.growthRecords;
        this.milestones = data.milestones || this.milestones;
        this.updateChartData();
      }
    },
    updateChartData() {
      // 根据记录更新图表数据
      const recentRecords = this.growthRecords.slice(0, 6).reverse();
      this.heightData = recentRecords.map(r => ({
        month: r.date.split('年')[1] || r.date,
        value: r.height
      }));
      this.weightData = recentRecords.map(r => ({
        month: r.date.split('年')[1] || r.date,
        value: r.weight
      }));
    },
    addRecord() {
      if (!this.newRecord.date) {
        this.$message.warning('请选择记录日期');
        return;
      }

      const lastRecord = this.growthRecords[0];
      const heightChange = lastRecord ? this.newRecord.height - lastRecord.height : 0;
      const weightChange = lastRecord ? this.newRecord.weight - lastRecord.weight : 0;

      // 格式化日期
      const date = this.formatDate(this.newRecord.date);

      // 检查里程碑
      let milestone = '';
      if (this.newRecord.height >= 150 && !this.milestones[0].achieved) {
        milestone = '身高突破150cm！';
        this.milestones[0].achieved = true;
        this.milestones[0].date = date;
      }
      if (this.newRecord.weight >= 40 && !this.milestones[1].achieved) {
        milestone = '体重突破40kg！';
        this.milestones[1].achieved = true;
        this.milestones[1].date = date;
      }

      this.growthRecords.unshift({
        date: date,
        height: this.newRecord.height,
        weight: this.newRecord.weight,
        heightChange: heightChange,
        weightChange: weightChange,
        milestone: milestone
      });

      // 更新当前数据
      this.currentData.height = this.newRecord.height;
      this.currentData.weight = this.newRecord.weight;
      this.currentData.bmi = this.calculateBMI(this.newRecord.height, this.newRecord.weight);

      this.updateChartData();
      this.saveData();
      this.showAddDialog = false;
      this.$message.success('记录添加成功！');
    },
    formatDate(dateStr) {
      const date = new Date(dateStr);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      return `${year}年${month}月`;
    },
    calculateBMI(height, weight) {
      const heightM = height / 100;
      return (weight / (heightM * heightM)).toFixed(1);
    },
    saveData() {
      localStorage.setItem('physicalProfileData', JSON.stringify({
        currentData: this.currentData,
        growthRecords: this.growthRecords,
        milestones: this.milestones,
        updateTime: new Date().toISOString()
      }));
    }
  }
};
</script>

<style scoped>
.physical-profile {
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
  color: #4D96FF;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.title i {
  color: #6BCB77;
  font-size: 32px;
}

.subtitle {
  color: #888;
  font-size: 16px;
  margin-top: 8px;
}

/* 当前体质数据 */
.current-data {
  display: flex;
  gap: 15px;
  margin-bottom: 25px;
}

.data-card {
  flex: 1;
  background: #fff;
  border-radius: 15px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.data-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #FFE66D 0%, #FFD93D 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.height-card .data-icon {
  background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
}

.weight-card .data-icon {
  background: linear-gradient(135deg, #4D96FF 0%, #6BCB77 100%);
}

.bmi-card .data-icon {
  background: linear-gradient(135deg, #6BCB77 0%, #4CAF50 100%);
}

.data-emoji {
  font-size: 24px;
}

.data-info {
  flex: 1;
}

.data-label {
  font-size: 14px;
  color: #888;
}

.data-value {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.data-change {
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 3px;
}

.data-change.positive {
  color: #4CAF50;
}

.data-change.negative {
  color: #F44336;
}

.data-change.neutral {
  color: #888;
}

/* 小图表 */
.data-chart-mini {
  width: 40px;
  height: 60px;
  background: #f5f5f5;
  border-radius: 5px;
  display: flex;
  align-items: flex-end;
  overflow: hidden;
}

.mini-bar {
  width: 100%;
  background: linear-gradient(to top, #FF6B6B 0%, #FF8E53 100%);
  border-radius: 3px;
  transition: height 0.5s ease;
}

.weight-bar {
  background: linear-gradient(to top, #4D96FF 0%, #6BCB77 100%);
}

/* BMI指示器 */
.bmi-indicator {
  width: 100%;
  margin-top: 10px;
}

.bmi-scale {
  display: flex;
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
}

.scale-section {
  flex: 1;
}

.scale-section.underweight {
  background: #E3F2FD;
}

.scale-section.normal {
  background: #E8F5E9;
}

.scale-section.overweight {
  background: #FFF3E0;
}

.scale-section.obese {
  background: #FFEBEE;
}

.bmi-pointer {
  width: 12px;
  height: 12px;
  background: #333;
  border-radius: 50%;
  position: relative;
  top: -2px;
  transition: left 0.3s ease;
}

.bmi-status {
  font-size: 12px;
  padding: 3px 8px;
  border-radius: 10px;
  margin-top: 5px;
  display: inline-block;
}

.bmi-status.underweight {
  background: #E3F2FD;
  color: #2196F3;
}

.bmi-status.normal {
  background: #E8F5E9;
  color: #4CAF50;
}

.bmi-status.overweight {
  background: #FFF3E0;
  color: #FF9800;
}

.bmi-status.obese {
  background: #FFEBEE;
  color: #F44336;
}

/* 图表区块 */
.chart-section,
.assessment-section,
.growth-section {
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
  color: #4D96FF;
}

.chart-tabs >>> .el-radio-button__inner {
  border-radius: 15px;
  padding: 10px 20px;
}

/* CSS图表 */
.chart-container {
  padding: 20px 0;
}

.chart-wrapper {
  display: flex;
  height: 200px;
}

.y-axis {
  width: 40px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-right: 10px;
}

.y-label {
  font-size: 12px;
  color: #888;
  text-align: right;
}

.chart-main {
  flex: 1;
  position: relative;
  background: #f9f9f9;
  border-radius: 10px;
}

.grid-lines {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.grid-line {
  width: 100%;
  height: 1px;
  background: #e0e0e0;
}

.line-chart {
  position: absolute;
  width: 100%;
  height: 100%;
}

.chart-point {
  position: absolute;
  transform: translateX(-50%);
}

.point-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  position: absolute;
  top: -5px;
  left: 50%;
  transform: translateX(-50%);
}

.height-dot {
  background: #FF6B6B;
  box-shadow: 0 0 5px rgba(255, 107, 107, 0.5);
}

.weight-dot {
  background: #4D96FF;
  box-shadow: 0 0 5px rgba(77, 150, 255, 0.5);
}

.point-label {
  font-size: 11px;
  color: #666;
  position: absolute;
  top: -25px;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
}

.line-svg {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}

.x-axis {
  position: absolute;
  bottom: -25px;
  width: 100%;
  display: flex;
  justify-content: space-around;
  padding-left: 5%;
  padding-right: 5%;
}

.x-label {
  font-size: 12px;
  color: #888;
}

/* 图例 */
.chart-legend {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-top: 20px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.height-legend .legend-dot {
  background: #FF6B6B;
}

.weight-legend .legend-dot {
  background: #4D96FF;
}

/* 评估卡片 */
.assessment-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

.assessment-card {
  background: #f9f9f9;
  border-radius: 15px;
  padding: 20px;
}

.assessment-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.assessment-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #fff;
}

.height-icon {
  background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
}

.weight-icon {
  background: linear-gradient(135deg, #4D96FF 0%, #6BCB77 100%);
}

.overall-icon {
  background: linear-gradient(135deg, #FFD93D 0%, #FF9500 100%);
}

.assessment-title {
  font-size: 16px;
  color: #333;
  font-weight: 500;
}

.assessment-level {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
}

.level-excellent {
  color: #4CAF50;
}

.level-good {
  color: #2196F3;
}

.level-normal {
  color: #FF9800;
}

.level-warning {
  color: #F44336;
}

.assessment-desc {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  margin-bottom: 15px;
}

.assessment-bar {
  margin-top: 10px;
}

.bar-track {
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease;
}

.height-fill {
  background: linear-gradient(to right, #FF6B6B 0%, #FF8E53 100%);
}

.weight-fill {
  background: linear-gradient(to right, #4D96FF 0%, #6BCB77 100%);
}

.bar-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 5px;
  font-size: 12px;
  color: #888;
}

/* 综合评估 */
.overall-card {
  background: linear-gradient(135deg, #FFE66D 0%, #FFD93D 100%);
}

.overall-score {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 15px;
}

.score-circle {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.score-value {
  font-size: 24px;
  font-weight: bold;
  color: #FF9500;
}

.score-label {
  font-size: 12px;
  color: #888;
}

.score-stars {
  display: flex;
  gap: 3px;
}

.score-stars i {
  font-size: 20px;
  color: #FF9500;
}

.score-stars .el-icon-star-off {
  color: #ccc;
}

.suggestion-title {
  font-size: 14px;
  color: #333;
  font-weight: 500;
  margin-bottom: 10px;
}

.suggestion-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #555;
}

.suggestion-item i {
  color: #4CAF50;
}

/* 成长时间轴 */
.growth-timeline {
  position: relative;
  padding-left: 30px;
}

.timeline-item {
  position: relative;
  padding-bottom: 25px;
}

.timeline-item:last-child {
  padding-bottom: 0;
}

.timeline-marker {
  position: absolute;
  left: -30px;
  top: 0;
}

.marker-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #4D96FF;
}

.marker-dot.latest {
  background: #4CAF50;
  width: 16px;
  height: 16px;
  box-shadow: 0 0 10px rgba(76, 175, 80, 0.5);
}

.marker-line {
  width: 2px;
  height: 100%;
  background: #e0e0e0;
  position: absolute;
  top: 12px;
  left: 5px;
}

.timeline-content {
  background: #f9f9f9;
  border-radius: 10px;
  padding: 15px;
}

.record-date {
  font-size: 14px;
  color: #4D96FF;
  font-weight: 500;
  margin-bottom: 10px;
}

.record-data {
  display: flex;
  gap: 20px;
}

.record-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.record-label {
  font-size: 13px;
  color: #888;
}

.record-value {
  font-size: 16px;
  color: #333;
  font-weight: 500;
}

.record-change {
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 8px;
  background: #f0f0f0;
}

.record-change.positive {
  background: #E8F5E9;
  color: #4CAF50;
}

.record-change.negative {
  background: #FFEBEE;
  color: #F44336;
}

.record-badge {
  margin-top: 10px;
}

.record-badge >>> .el-tag {
  border-radius: 10px;
}

/* 成长里程碑 */
.milestone-section {
  margin-top: 25px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
}

.milestone-title {
  font-size: 16px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 15px;
}

.milestone-title i {
  color: #FFD93D;
}

.milestone-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
}

.milestone-item {
  background: #f5f5f5;
  border-radius: 10px;
  padding: 15px;
  text-align: center;
  transition: all 0.3s ease;
}

.milestone-item.achieved {
  background: linear-gradient(135deg, #FFE66D 0%, #FFD93D 100%);
}

.milestone-icon {
  font-size: 30px;
  margin-bottom: 10px;
}

.milestone-item:not(.achieved) .milestone-emoji {
  opacity: 0.5;
  filter: grayscale(50%);
}

.milestone-name {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.milestone-date {
  font-size: 12px;
  color: #FF9500;
  margin-top: 5px;
}

.milestone-target {
  font-size: 12px;
  color: #888;
  margin-top: 5px;
}

/* 添加记录弹窗 */
.add-dialog >>> .el-dialog {
  border-radius: 15px;
}

.add-dialog >>> .el-dialog__header {
  background: linear-gradient(135deg, #4D96FF 0%, #6BCB77 100%);
  border-radius: 15px 15px 0 0;
  padding: 15px 20px;
}

.add-dialog >>> .el-dialog__title {
  color: #fff;
}

.add-dialog >>> .el-dialog__headerbtn .el-dialog__close {
  color: #fff;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .physical-profile {
    padding: 15px;
  }

  .title {
    font-size: 22px;
  }

  .current-data {
    flex-direction: column;
  }

  .assessment-cards {
    grid-template-columns: 1fr;
  }

  .milestone-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .chart-wrapper {
    height: 150px;
  }

  .record-data {
    flex-direction: column;
    gap: 10px;
  }
}
</style>