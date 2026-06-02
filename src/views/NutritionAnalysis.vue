<template>
  <div class="nutrition-analysis">
    <el-card class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h2>营养分析报表</h2>
          <p class="subtitle">班级/年级营养摄入统计，挑食/肥胖预警及营养分析图表</p>
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
          <el-select v-model="selectedClass" placeholder="选择班级" style="width: 150px; margin-right: 10px">
            <el-option label="全部班级" value="" />
            <el-option label="一年级1班" value="1-1" />
            <el-option label="一年级2班" value="1-2" />
          </el-select>
          <el-button type="primary" icon="el-icon-download" @click="handleExport">导出报表</el-button>
        </div>
      </div>
    </el-card>

    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-icon normal-icon">
              <i class="el-icon-check"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.normalWeight }}%</div>
              <div class="stat-label">正常体重</div>
              <div class="stat-sub">{{ stats.normalCount }}人</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-icon overweight-icon">
              <i class="el-icon-warning"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.overweight }}%</div>
              <div class="stat-label">超重/肥胖</div>
              <div class="stat-sub">{{ stats.overweightCount }}人</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-icon underweight-icon">
              <i class="el-icon-info"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.underweight }}%</div>
              <div class="stat-label">偏瘦</div>
              <div class="stat-sub">{{ stats.underweightCount }}人</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-icon picky-icon">
              <i class="el-icon-food"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.pickyEater }}%</div>
              <div class="stat-label">挑食学生</div>
              <div class="stat-sub">{{ stats.pickyCount }}人</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card>
          <div slot="header">体重分布</div>
          <div ref="weightChart" style="height: 350px"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <div slot="header">营养素摄入分析</div>
          <div ref="nutritionChart" style="height: 350px"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card>
          <div slot="header">
            <span>肥胖预警名单</span>
            <el-tag type="danger" size="mini" style="margin-left: 10px">{{ overweightList.length }}人</el-tag>
          </div>
          <el-table :data="overweightList" stripe size="small" style="width: 100%">
            <el-table-column prop="studentName" label="姓名" width="80" />
            <el-table-column prop="gradeClass" label="班级" width="100" />
            <el-table-column prop="bmi" label="BMI" width="80" />
            <el-table-column prop="weightStatus" label="体重状态" width="100">
              <template slot-scope="scope">
                <el-tag :type="scope.row.weightStatus === '肥胖' ? 'danger' : 'warning'" size="mini">{{ scope.row.weightStatus }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="suggestion" label="建议" min-width="150" show-overflow-tooltip />
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <div slot="header">
            <span>挑食学生名单</span>
            <el-tag type="warning" size="mini" style="margin-left: 10px">{{ pickyList.length }}人</el-tag>
          </div>
          <el-table :data="pickyList" stripe size="small" style="width: 100%">
            <el-table-column prop="studentName" label="姓名" width="80" />
            <el-table-column prop="gradeClass" label="班级" width="100" />
            <el-table-column prop="pickyFoods" label="挑食食物" min-width="150">
              <template slot-scope="scope">
                <el-tag v-for="(food, index) in scope.row.pickyFoods" :key="index" size="mini" style="margin-right: 5px">{{ food }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="intervention" label="干预措施" min-width="150" show-overflow-tooltip />
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <el-card style="margin-top: 20px">
      <div slot="header">班级营养对比</div>
      <el-table :data="classComparison" stripe border>
        <el-table-column prop="className" label="班级" />
        <el-table-column prop="totalStudents" label="总人数" align="center" />
        <el-table-column prop="normalRate" label="正常体重率" align="center">
          <template slot-scope="scope">
            <el-progress :percentage="scope.row.normalRate" :color="'#67C23A'" />
          </template>
        </el-table-column>
        <el-table-column prop="overweightRate" label="超重率" align="center">
          <template slot-scope="scope">
            <el-tag :type="scope.row.overweightRate > 15 ? 'danger' : 'warning'" size="mini">{{ scope.row.overweightRate }}%</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="avgCalories" label="日均热量(kcal)" align="center" />
        <el-table-column prop="avgProtein" label="日均蛋白质(g)" align="center" />
        <el-table-column prop="avgVegetables" label="蔬菜摄入(g)" align="center" />
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'NutritionAnalysis',
  data() {
    return {
      dateRange: [],
      selectedClass: '',
      stats: {
        normalWeight: 72.5,
        normalCount: 362,
        overweight: 15.2,
        overweightCount: 76,
        underweight: 12.3,
        underweightCount: 62,
        pickyEater: 8.5,
        pickyCount: 42
      },
      overweightList: [
        { studentName: '小明', gradeClass: '一年级1班', bmi: 24.5, weightStatus: '超重', suggestion: '控制零食摄入，增加运动' },
        { studentName: '小红', gradeClass: '一年级2班', bmi: 26.8, weightStatus: '肥胖', suggestion: '建议家长配合控制饮食，每天运动1小时' }
      ],
      pickyList: [
        { studentName: '小刚', gradeClass: '一年级1班', pickyFoods: ['蔬菜', '水果'], intervention: '采用趣味摆盘，逐步引导' },
        { studentName: '小丽', gradeClass: '一年级3班', pickyFoods: ['肉类'], intervention: '变换烹饪方式，增加营养搭配' }
      ],
      classComparison: [
        { className: '一年级1班', totalStudents: 45, normalRate: 80, overweightRate: 10, avgCalories: 1850, avgProtein: 55, avgVegetables: 180 },
        { className: '一年级2班', totalStudents: 46, normalRate: 70, overweightRate: 18, avgCalories: 1920, avgProtein: 58, avgVegetables: 150 },
        { className: '一年级3班', totalStudents: 44, normalRate: 75, overweightRate: 12, avgCalories: 1800, avgProtein: 52, avgVegetables: 200 }
      ]
    }
  },
  methods: {
    handleExport() {
      this.$message.success('导出成功')
    }
  }
}
</script>

<style scoped>
.nutrition-analysis {
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
  margin: 0 0 8px 0;
  font-size: 20px;
  color: #303133;
}
.subtitle {
  margin: 0;
  color: #909399;
  font-size: 14px;
}
.header-actions {
  display: flex;
  align-items: center;
}
.stat-card {
  margin-bottom: 20px;
}
.stat-item {
  display: flex;
  align-items: center;
}
.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  margin-right: 15px;
}
.normal-icon {
  background: #f6ffed;
  color: #52c41a;
}
.overweight-icon {
  background: #fff2f0;
  color: #ff4d4f;
}
.underweight-icon {
  background: #f0f9ff;
  color: #409eff;
}
.picky-icon {
  background: #fffbe6;
  color: #faad14;
}
.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}
.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}
.stat-sub {
  font-size: 12px;
  color: #606266;
  margin-top: 2px;
}
</style>
