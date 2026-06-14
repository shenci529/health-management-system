<template>
  <div class="dashboard">
    <div class="stat-cards">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="stat-card">
            <div class="icon-container" style="background: #e6f7ff;">
              <i class="el-icon-s-grid" style="font-size: 36px; color: #1890ff;"></i>
            </div>
            <div class="stat-content">
              <span class="stat-label">身高</span>
              <span class="stat-value">1.8 m</span>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="icon-container" style="background: #f6ffed;">
              <i class="el-icon-goods" style="font-size: 36px; color: #52c41a;"></i>
            </div>
            <div class="stat-content">
              <span class="stat-label">体重</span>
              <span class="stat-value">50 kg</span>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="icon-container" style="background: #fff7e6;">
              <i class="el-icon-s-check" style="font-size: 36px; color: #faad14;"></i>
            </div>
            <div class="stat-content">
              <span class="stat-label">BMI</span>
              <span class="stat-value">15.43</span>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="icon-container" style="background: #f9f0ff;">
              <i class="el-icon-user" style="font-size: 36px; color: #722ed1;"></i>
            </div>
            <div class="stat-content">
              <span class="stat-label">年龄</span>
              <span class="stat-value">18</span>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <div class="charts-section" style="margin-top: 20px;">
      <el-row :gutter="20">
        <el-col :span="8">
          <div class="chart-card">
            <div class="chart-title">心率变化趋势图</div>
            <div ref="heartRateChart" class="chart-container"></div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="chart-card">
            <div class="chart-title">视力变化趋势图</div>
            <div ref="visionChart" class="chart-container"></div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="chart-card">
            <div class="chart-title">血压血糖变化趋势图</div>
            <div ref="bloodChart" class="chart-container"></div>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Dashboard',
  data() {
    return {
      heartRateChart: null,
      visionChart: null,
      bloodChart: null
    };
  },
  mounted() {
    this.$nextTick(() => {
      this.initCharts();
    });
  },
  methods: {
    async initCharts() {
      await Promise.all([
        this.initHeartRateChart(),
        this.initVisionChart(),
        this.initBloodChart()
      ]);
    },
    async initHeartRateChart() {
      const chart = await this.$echarts.init(this.$refs.heartRateChart);
      const option = {
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          data: ['04/16/2024', '04/17/2024', '04/18/2024', '04/19/2024', '04/20/2024', '04/21/2024', '04/22/2024']
        },
        yAxis: {
          type: 'value',
          min: 30,
          max: 160
        },
        series: [{
          name: '心率',
          type: 'line',
          smooth: true,
          data: [75, 80, 95, 85, 90, 78, 88],
          lineStyle: {
            color: '#1890ff'
          },
          areaStyle: {
            color: 'rgba(24, 144, 255, 0.1)'
          }
        }]
      };
      chart.setOption(option);
      this.heartRateChart = chart;
      window.addEventListener('resize', () => chart.resize());
    },
    async initVisionChart() {
      const chart = await this.$echarts.init(this.$refs.visionChart);
      const option = {
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          data: ['04/16/2024', '04/17/2024', '04/18/2024', '04/19/2024', '04/20/2024', '04/21/2024', '04/22/2024']
        },
        yAxis: {
          type: 'value',
          min: 0,
          max: 250
        },
        series: [{
          name: '视力',
          type: 'bar',
          data: [60, 80, 100, 120, 150, 180, 220],
          itemStyle: {
            color: '#1890ff'
          }
        }]
      };
      chart.setOption(option);
      this.visionChart = chart;
      window.addEventListener('resize', () => chart.resize());
    },
    async initBloodChart() {
      const chart = await this.$echarts.init(this.$refs.bloodChart);
      const option = {
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['血压', '血糖'],
          top: 10
        },
        xAxis: {
          type: 'category',
          data: ['04/16/2024', '04/17/2024', '04/18/2024', '04/19/2024', '04/20/2024', '04/21/2024', '04/22/2024']
        },
        yAxis: {
          type: 'value',
          min: 0,
          max: 25
        },
        series: [{
          name: '血压',
          type: 'line',
          data: [15, 10, 12, 8, 18, 14, 16],
          lineStyle: {
            color: '#52c41a'
          }
        }, {
          name: '血糖',
          type: 'line',
          data: [12, 8, 15, 5, 20, 10, 18],
          lineStyle: {
            color: '#faad14'
          }
        }]
      };
      chart.setOption(option);
      this.bloodChart = chart;
      window.addEventListener('resize', () => chart.resize());
    }
  }
};
</script>

<style scoped>
.dashboard {
  padding: 10px;
}

.stat-cards {
  margin-bottom: 20px;
}

.stat-card {
  display: flex;
  background: #fff;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  align-items: center;
  gap: 15px;
}

.icon-container {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.charts-section {
  margin-top: 20px;
}

.chart-card {
  background: #fff;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.chart-title {
  font-size: 14px;
  color: #333;
  margin-bottom: 15px;
  text-align: center;
}

.chart-container {
  width: 100%;
  height: 250px;
}

/* ============ 移动端适配 ============ */
@media screen and (max-width: 992px) {
  .stat-card {
    margin-bottom: 12px;
  }

  .chart-container {
    height: 240px;
  }
}

@media screen and (max-width: 768px) {
  .dashboard {
    padding: 4px;
  }

  .stat-cards {
    margin-bottom: 12px;
  }

  .stat-card {
    padding: 14px 12px;
    gap: 10px;
    margin-bottom: 10px;
    border-radius: 6px;
  }

  .icon-container {
    width: 48px;
    height: 48px;
    flex-shrink: 0;
  }

  .stat-label {
    font-size: 12px;
  }

  .stat-value {
    font-size: 20px;
  }

  .charts-section {
    margin-top: 12px;
  }

  .chart-card {
    padding: 14px;
    margin-bottom: 12px;
  }

  .chart-title {
    font-size: 14px;
    margin-bottom: 12px;
  }

  .chart-container {
    height: 220px;
  }
}

@media screen and (max-width: 480px) {
  .dashboard {
    padding: 2px;
  }

  .stat-card {
    padding: 10px;
    gap: 8px;
  }

  .icon-container {
    width: 40px;
    height: 40px;
  }

  .stat-label {
    font-size: 11px;
  }

  .stat-value {
    font-size: 16px;
  }

  .chart-container {
    height: 200px;
  }
}
</style>
