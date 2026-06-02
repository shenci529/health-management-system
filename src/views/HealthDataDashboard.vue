<template>
  <div class="health-data-dashboard">
    <!-- 顶部统计卡片 -->
    <div class="stat-cards">
      <el-row :gutter="20">
        <el-col :span="4">
          <div class="stat-card" style="border-left: 4px solid #409eff;">
            <div class="stat-icon" style="background: #ecf5ff;">
              <i class="el-icon-view" style="color: #409eff;"></i>
            </div>
            <div class="stat-info">
              <span class="stat-value">32.5%</span>
              <span class="stat-label">近视率</span>
            </div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="stat-card" style="border-left: 4px solid #e6a23c;">
            <div class="stat-icon" style="background: #fdf6ec;">
              <i class="el-icon-user" style="color: #e6a23c;"></i>
            </div>
            <div class="stat-info">
              <span class="stat-value">18.2%</span>
              <span class="stat-label">肥胖率</span>
            </div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="stat-card" style="border-left: 4px solid #67c23a;">
            <div class="stat-icon" style="background: #f0f9eb;">
              <i class="el-icon-medal" style="color: #67c23a;"></i>
            </div>
            <div class="stat-info">
              <span class="stat-value">85.6%</span>
              <span class="stat-label">体质达标率</span>
            </div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="stat-card" style="border-left: 4px solid #f56c6c;">
            <div class="stat-icon" style="background: #fef0f0;">
              <i class="el-icon-warning" style="color: #f56c6c;"></i>
            </div>
            <div class="stat-info">
              <span class="stat-value">5.8%</span>
              <span class="stat-label">发病率</span>
            </div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="stat-card" style="border-left: 4px solid #909399;">
            <div class="stat-icon" style="background: #f4f4f5;">
              <i class="el-icon-document-checked" style="color: #909399;"></i>
            </div>
            <div class="stat-info">
              <span class="stat-value">98.2%</span>
              <span class="stat-label">体检完成率</span>
            </div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="stat-card" style="border-left: 4px solid #00bcd4;">
            <div class="stat-icon" style="background: #e0f7fa;">
              <i class="el-icon-s-data" style="color: #00bcd4;"></i>
            </div>
            <div class="stat-info">
              <span class="stat-value">2,580</span>
              <span class="stat-label">学生总数</span>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 图表区域 -->
    <div class="charts-section">
      <el-row :gutter="20">
        <!-- 近视率饼图 -->
        <el-col :span="6">
          <div class="chart-card">
            <div class="chart-title">近视率分布</div>
            <div class="pie-chart-container">
              <div class="pie-chart" :style="{ background: generatePieGradient(myopiaData) }">
                <div class="pie-center">
                  <span class="pie-value">32.5%</span>
                </div>
              </div>
              <div class="pie-legend">
                <div class="legend-item" v-for="(item, index) in myopiaData" :key="index">
                  <span class="legend-color" :style="{ background: item.color }"></span>
                  <span class="legend-label">{{ item.label }}</span>
                  <span class="legend-value">{{ item.value }}%</span>
                </div>
              </div>
            </div>
          </div>
        </el-col>

        <!-- 肥胖率饼图 -->
        <el-col :span="6">
          <div class="chart-card">
            <div class="chart-title">肥胖率分布</div>
            <div class="pie-chart-container">
              <div class="pie-chart" :style="{ background: generatePieGradient(obesityData) }">
                <div class="pie-center">
                  <span class="pie-value">18.2%</span>
                </div>
              </div>
              <div class="pie-legend">
                <div class="legend-item" v-for="(item, index) in obesityData" :key="index">
                  <span class="legend-color" :style="{ background: item.color }"></span>
                  <span class="legend-label">{{ item.label }}</span>
                  <span class="legend-value">{{ item.value }}%</span>
                </div>
              </div>
            </div>
          </div>
        </el-col>

        <!-- 近视率趋势图 -->
        <el-col :span="12">
          <div class="chart-card">
            <div class="chart-title">近视率年度趋势</div>
            <div class="line-chart-container">
              <div class="line-chart">
                <div class="chart-y-axis">
                  <span v-for="val in [40, 30, 20, 10, 0]" :key="val">{{ val }}%</span>
                </div>
                <div class="chart-x-axis">
                  <span v-for="year in ['2019', '2020', '2021', '2022', '2023', '2024']" :key="year">{{ year }}</span>
                </div>
                <div class="chart-bars">
                  <div class="bar-line">
                    <div class="line-point" v-for="(val, index) in myopiaTrend" :key="index" :style="{ bottom: (val / 40 * 100) + '%' }">
                      <span class="point-value">{{ val }}%</span>
                    </div>
                    <svg class="line-svg" viewBox="0 0 300 150" preserveAspectRatio="none">
                      <polyline :points="generateLinePoints(myopiaTrend, 40)" fill="none" stroke="#409eff" stroke-width="2"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>

      <el-row :gutter="20" style="margin-top: 20px;">
        <!-- 体质达标率 -->
        <el-col :span="8">
          <div class="chart-card">
            <div class="chart-title">体质达标率分布</div>
            <div class="bar-chart-container">
              <div class="bar-chart">
                <div class="bar-item" v-for="(item, index) in fitnessData" :key="index">
                  <div class="bar-label">{{ item.label }}</div>
                  <div class="bar-wrapper">
                    <div class="bar-fill" :style="{ width: item.value + '%', background: item.color }"></div>
                  </div>
                  <div class="bar-value">{{ item.value }}%</div>
                </div>
              </div>
            </div>
          </div>
        </el-col>

        <!-- 发病率统计 -->
        <el-col :span="8">
          <div class="chart-card">
            <div class="chart-title">发病率统计（按疾病类型）</div>
            <div class="bar-chart-container">
              <div class="bar-chart horizontal">
                <div class="bar-item" v-for="(item, index) in diseaseData" :key="index">
                  <div class="bar-label">{{ item.label }}</div>
                  <div class="bar-wrapper">
                    <div class="bar-fill" :style="{ width: item.value * 10 + '%', background: item.color }"></div>
                  </div>
                  <div class="bar-value">{{ item.value }}%</div>
                </div>
              </div>
            </div>
          </div>
        </el-col>

        <!-- 年级对比 -->
        <el-col :span="8">
          <div class="chart-card">
            <div class="chart-title">各年级健康指标对比</div>
            <div class="grade-comparison">
              <div class="comparison-header">
                <span>年级</span>
                <span>近视率</span>
                <span>肥胖率</span>
                <span>达标率</span>
              </div>
              <div class="comparison-row" v-for="(item, index) in gradeData" :key="index">
                <span class="grade-name">{{ item.grade }}</span>
                <div class="comparison-bar">
                  <div class="mini-bar" :style="{ width: item.myopia + '%', background: '#409eff' }"></div>
                  <span>{{ item.myopia }}%</span>
                </div>
                <div class="comparison-bar">
                  <div class="mini-bar" :style="{ width: item.obesity + '%', background: '#e6a23c' }"></div>
                  <span>{{ item.obesity }}%</span>
                </div>
                <div class="comparison-bar">
                  <div class="mini-bar" :style="{ width: item.fitness + '%', background: '#67c23a' }"></div>
                  <span>{{ item.fitness }}%</span>
                </div>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 数据筛选 -->
    <div class="filter-bar">
      <el-select v-model="filterGrade" placeholder="选择年级" clearable style="width: 150px;">
        <el-option label="全部年级" value=""></el-option>
        <el-option label="一年级" value="1"></el-option>
        <el-option label="二年级" value="2"></el-option>
        <el-option label="三年级" value="3"></el-option>
        <el-option label="四年级" value="4"></el-option>
        <el-option label="五年级" value="5"></el-option>
        <el-option label="六年级" value="6"></el-option>
      </el-select>
      <el-select v-model="filterYear" placeholder="选择学年" clearable style="width: 150px;">
        <el-option label="2023-2024" value="2024"></el-option>
        <el-option label="2022-2023" value="2023"></el-option>
        <el-option label="2021-2022" value="2022"></el-option>
      </el-select>
      <el-button type="primary" icon="el-icon-search" @click="handleFilter">筛选数据</el-button>
      <el-button type="success" icon="el-icon-download" @click="exportData">导出报告</el-button>
      <el-button type="warning" icon="el-icon-printer" @click="printDashboard">打印大屏</el-button>
    </div>

    <!-- 实时数据更新提示 -->
    <div class="data-update-info">
      <i class="el-icon-refresh"></i>
      <span>数据最后更新时间：2024-01-15 14:30:25</span>
      <el-button type="text" icon="el-icon-refresh-right" @click="refreshData">刷新数据</el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HealthDataDashboard',
  data() {
    return {
      filterGrade: '',
      filterYear: '2024',
      myopiaData: [
        { label: '轻度近视', value: 15.2, color: '#409eff' },
        { label: '中度近视', value: 12.3, color: '#e6a23c' },
        { label: '重度近视', value: 5.0, color: '#f56c6c' },
        { label: '视力正常', value: 67.5, color: '#67c23a' }
      ],
      obesityData: [
        { label: '超重', value: 8.5, color: '#e6a23c' },
        { label: '肥胖', value: 9.7, color: '#f56c6c' },
        { label: '体重正常', value: 81.8, color: '#67c23a' }
      ],
      myopiaTrend: [28.5, 29.8, 30.2, 31.5, 32.0, 32.5],
      fitnessData: [
        { label: '优秀', value: 25.6, color: '#67c23a' },
        { label: '良好', value: 35.2, color: '#409eff' },
        { label: '及格', value: 24.8, color: '#e6a23c' },
        { label: '不及格', value: 14.4, color: '#f56c6c' }
      ],
      diseaseData: [
        { label: '流感', value: 2.5, color: '#409eff' },
        { label: '手足口', value: 1.8, color: '#e6a23c' },
        { label: '腹泻', value: 0.8, color: '#67c23a' },
        { label: '其他', value: 0.7, color: '#909399' }
      ],
      gradeData: [
        { grade: '一年级', myopia: 15, obesity: 12, fitness: 92 },
        { grade: '二年级', myopia: 22, obesity: 15, fitness: 88 },
        { grade: '三年级', myopia: 28, obesity: 18, fitness: 85 },
        { grade: '四年级', myopia: 35, obesity: 20, fitness: 82 },
        { grade: '五年级', myopia: 42, obesity: 22, fitness: 78 },
        { grade: '六年级', myopia: 48, obesity: 25, fitness: 75 }
      ]
    };
  },
  methods: {
    generatePieGradient(data) {
      const total = data.reduce((sum, item) => sum + item.value, 0);
      let gradient = 'conic-gradient(';
      let currentAngle = 0;
      data.forEach((item, index) => {
        const angle = (item.value / total) * 360;
        gradient += `${item.color} ${currentAngle}deg ${currentAngle + angle}deg`;
        if (index < data.length - 1) gradient += ', ';
        currentAngle += angle;
      });
      gradient += ')';
      return gradient;
    },
    generateLinePoints(data, maxVal) {
      const width = 300;
      const height = 150;
      const stepX = width / (data.length - 1);
      return data.map((val, index) => {
        const x = index * stepX;
        const y = height - (val / maxVal) * height;
        return `${x},${y}`;
      }).join(' ');
    },
    handleFilter() {
      this.$message.success('数据筛选完成');
    },
    exportData() {
      this.$message.success('健康数据报告导出成功');
    },
    printDashboard() {
      this.$message.success('正在生成打印版本...');
    },
    refreshData() {
      this.$message.success('数据已刷新');
    }
  }
};
</script>

<style scoped>
.health-data-dashboard {
  background: #f5f7fa;
  padding: 20px;
  min-height: calc(100vh - 100px);
}

.stat-cards {
  margin-bottom: 20px;
}

.stat-card {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.charts-section {
  margin-bottom: 20px;
}

.chart-card {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.chart-title {
  font-size: 16px;
  color: #303133;
  margin-bottom: 20px;
  text-align: center;
  font-weight: 500;
}

/* 饼图样式 */
.pie-chart-container {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 10px;
}

.pie-chart {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  position: relative;
}

.pie-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 60px;
  background: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pie-value {
  font-size: 14px;
  font-weight: bold;
  color: #303133;
}

.pie-legend {
  flex: 1;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 0;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.legend-label {
  flex: 1;
  font-size: 12px;
  color: #606266;
}

.legend-value {
  font-size: 12px;
  color: #303133;
  font-weight: 500;
}

/* 折线图样式 */
.line-chart-container {
  height: 200px;
}

.line-chart {
  position: relative;
  height: 100%;
  padding: 20px 40px;
}

.chart-y-axis {
  position: absolute;
  left: 0;
  top: 20px;
  height: calc(100% - 40px);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  font-size: 12px;
  color: #909399;
}

.chart-x-axis {
  position: absolute;
  bottom: 0;
  left: 40px;
  right: 20px;
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #909399;
}

.chart-bars {
  position: absolute;
  left: 40px;
  right: 20px;
  top: 20px;
  bottom: 30px;
}

.bar-line {
  position: relative;
  width: 100%;
  height: 100%;
}

.line-point {
  position: absolute;
  width: 8px;
  height: 8px;
  background: #409eff;
  border-radius: 50%;
  transform: translateX(-50%);
}

.point-value {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 10px;
  color: #409eff;
  white-space: nowrap;
}

.line-svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

/* 柱状图样式 */
.bar-chart-container {
  padding: 10px;
}

.bar-chart {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.bar-chart.horizontal {
  flex-direction: column;
}

.bar-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.bar-label {
  width: 60px;
  font-size: 12px;
  color: #606266;
}

.bar-wrapper {
  flex: 1;
  height: 20px;
  background: #f0f2f5;
  border-radius: 4px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease;
}

.bar-value {
  width: 50px;
  font-size: 12px;
  color: #303133;
  text-align: right;
}

/* 年级对比样式 */
.grade-comparison {
  padding: 10px;
}

.comparison-header {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  font-size: 12px;
  color: #909399;
  border-bottom: 1px solid #ebeef5;
}

.comparison-header span {
  flex: 1;
  text-align: center;
}

.comparison-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px dashed #ebeef5;
}

.comparison-row:last-child {
  border-bottom: none;
}

.grade-name {
  flex: 1;
  font-size: 12px;
  color: #606266;
  text-align: center;
}

.comparison-bar {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}

.mini-bar {
  height: 8px;
  border-radius: 2px;
  max-width: 80px;
}

.comparison-bar span {
  font-size: 11px;
  color: #303133;
}

.filter-bar {
  margin-bottom: 20px;
  padding: 16px;
  background: #fff;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.data-update-info {
  text-align: center;
  color: #909399;
  font-size: 14px;
  padding: 10px;
}

.data-update-info i {
  margin-right: 5px;
}
</style>