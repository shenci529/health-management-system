<template>
  <div class="child-health">
    <!-- 孩子信息卡片 -->
    <el-card class="child-info-card">
      <div class="child-info">
        <el-avatar :size="64" icon="el-icon-user-solid"></el-avatar>
        <div class="info-content">
          <h3>{{ childInfo.name }}</h3>
          <p>
            <span>{{ childInfo.grade }} - {{ childInfo.class }}</span>
            <el-divider direction="vertical"></el-divider>
            <span>年龄：{{ childInfo.age }}岁</span>
          </p>
        </div>
      </div>
    </el-card>

    <!-- 健康预警通知 -->
    <el-card class="section-card">
      <div slot="header" class="section-header">
        <span class="section-title">
          <i class="el-icon-warning-outline"></i> 健康预警通知
        </span>
        <el-badge :value="warningList.length" class="badge-item" type="danger"></el-badge>
      </div>
      <div class="warning-list">
        <el-empty v-if="warningList.length === 0" description="暂无健康预警" :image-size="80"></el-empty>
        <div v-for="(item, index) in warningList" :key="index" class="warning-item">
          <div class="warning-icon" :class="item.type">
            <i :class="getWarningIcon(item.type)"></i>
          </div>
          <div class="warning-content">
            <div class="warning-title">
              <el-tag size="small" :type="getWarningTagType(item.type)">{{ getWarningTypeName(item.type) }}</el-tag>
              <span class="warning-time">{{ item.time }}</span>
            </div>
            <div class="warning-desc">{{ item.description }}</div>
          </div>
          <el-button type="text" size="small" @click="handleWarningDetail(item)">查看详情</el-button>
        </div>
      </div>
    </el-card>

    <!-- 在校生活记录 -->
    <el-card class="section-card">
      <div slot="header" class="section-header">
        <span class="section-title">
          <i class="el-icon-date"></i> 在校生活记录
        </span>
        <el-date-picker
          v-model="selectedDate"
          type="date"
          placeholder="选择日期"
          size="small"
          value-format="yyyy-MM-dd"
          @change="handleDateChange"
          style="width: 150px;">
        </el-date-picker>
      </div>
      
      <el-row :gutter="20">
        <!-- 饮食记录 -->
        <el-col :span="8">
          <div class="life-card diet-card">
            <div class="life-header">
              <i class="el-icon-food"></i>
              <span>饮食记录</span>
            </div>
            <el-timeline class="life-timeline">
              <el-timeline-item
                v-for="(item, index) in dietRecords"
                :key="index"
                :timestamp="item.time"
                placement="top"
                color="#67c23a">
                <div class="timeline-content">
                  <div class="meal-type">{{ item.meal }}</div>
                  <div class="meal-detail">{{ item.content }}</div>
                </div>
              </el-timeline-item>
            </el-timeline>
          </div>
        </el-col>
        
        <!-- 饮水记录 -->
        <el-col :span="8">
          <div class="life-card water-card">
            <div class="life-header">
              <i class="el-icon-glass"></i>
              <span>饮水记录</span>
            </div>
            <div class="water-progress">
              <el-progress type="circle" :percentage="waterProgress" :color="waterColor"></el-progress>
              <div class="water-info">
                <span class="water-current">{{ waterCurrent }}ml</span>
                <span class="water-target">目标：{{ waterTarget }}ml</span>
              </div>
            </div>
            <div class="water-list">
              <div v-for="(item, index) in waterRecords" :key="index" class="water-item">
                <span class="water-time">{{ item.time }}</span>
                <span class="water-amount">{{ item.amount }}ml</span>
              </div>
            </div>
          </div>
        </el-col>
        
        <!-- 午休记录 -->
        <el-col :span="8">
          <div class="life-card rest-card">
            <div class="life-header">
              <i class="el-icon-moon-night"></i>
              <span>午休记录</span>
            </div>
            <div class="rest-info" v-if="restRecord">
              <div class="rest-time">
                <i class="el-icon-time"></i>
                <span>{{ restRecord.startTime }} - {{ restRecord.endTime }}</span>
              </div>
              <div class="rest-duration">
                <span class="duration-label">休息时长：</span>
                <span class="duration-value">{{ restRecord.duration }}</span>
              </div>
              <div class="rest-quality">
                <span class="quality-label">休息质量：</span>
                <el-rate v-model="restRecord.quality" disabled></el-rate>
              </div>
            </div>
            <el-empty v-else description="暂无午休记录" :image-size="60"></el-empty>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 居家健康数据补充 -->
    <el-card class="section-card">
      <div slot="header" class="section-header">
        <span class="section-title">
          <i class="el-icon-edit-outline"></i> 居家健康数据补充
        </span>
      </div>
      
      <el-form :model="homeHealthForm" :rules="homeHealthRules" ref="homeHealthForm" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="记录日期" prop="date">
              <el-date-picker
                v-model="homeHealthForm.date"
                type="date"
                placeholder="选择日期"
                value-format="yyyy-MM-dd"
                style="width: 100%;">
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="体温" prop="temperature">
              <el-input v-model="homeHealthForm.temperature" placeholder="请输入体温（℃）">
                <template slot="append">℃</template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="睡眠时长" prop="sleepHours">
              <el-input v-model="homeHealthForm.sleepHours" placeholder="请输入睡眠时长">
                <template slot="append">小时</template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="睡眠质量" prop="sleepQuality">
              <el-rate v-model="homeHealthForm.sleepQuality" show-text :texts="['很差', '较差', '一般', '较好', '很好']"></el-rate>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="饮水量" prop="waterIntake">
              <el-input v-model="homeHealthForm.waterIntake" placeholder="请输入饮水量">
                <template slot="append">ml</template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="运动时长" prop="exerciseMinutes">
              <el-input v-model="homeHealthForm.exerciseMinutes" placeholder="请输入运动时长">
                <template slot="append">分钟</template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="备注说明" prop="notes">
          <el-input
            type="textarea"
            v-model="homeHealthForm.notes"
            placeholder="请输入其他健康相关说明"
            :rows="3">
          </el-input>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="submitHomeHealth">
            <i class="el-icon-check"></i> 提交记录
          </el-button>
          <el-button @click="resetHomeHealthForm">
            <i class="el-icon-refresh"></i> 重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 健康数据历史记录 -->
    <el-card class="section-card">
      <div slot="header" class="section-header">
        <span class="section-title">
          <i class="el-icon-data-line"></i> 健康数据历史
        </span>
      </div>
      
      <el-table :data="healthHistory" stripe style="width: 100%">
        <el-table-column prop="date" label="日期" width="120"></el-table-column>
        <el-table-column prop="temperature" label="体温(℃)" width="100"></el-table-column>
        <el-table-column prop="sleepHours" label="睡眠(小时)" width="110"></el-table-column>
        <el-table-column prop="sleepQuality" label="睡眠质量" width="120">
          <template slot-scope="scope">
            <el-rate v-model="scope.row.sleepQuality" disabled></el-rate>
          </template>
        </el-table-column>
        <el-table-column prop="waterIntake" label="饮水(ml)" width="100"></el-table-column>
        <el-table-column prop="exerciseMinutes" label="运动(分钟)" width="110"></el-table-column>
        <el-table-column prop="notes" label="备注" show-overflow-tooltip></el-table-column>
        <el-table-column label="操作" width="100">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="handleEditHistory(scope.row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 预警详情对话框 -->
    <el-dialog title="预警详情" :visible.sync="warningDialogVisible" width="500px">
      <div v-if="currentWarning" class="warning-detail">
        <div class="detail-item">
          <span class="detail-label">预警类型：</span>
          <el-tag :type="getWarningTagType(currentWarning.type)">{{ getWarningTypeName(currentWarning.type) }}</el-tag>
        </div>
        <div class="detail-item">
          <span class="detail-label">发生时间：</span>
          <span>{{ currentWarning.time }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">详细描述：</span>
          <p>{{ currentWarning.description }}</p>
        </div>
        <div class="detail-item">
          <span class="detail-label">处理建议：</span>
          <p>{{ currentWarning.suggestion }}</p>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="warningDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="handleWarningConfirm">确认已读</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'ChildHealth',
  data() {
    return {
      // 孩子信息
      childInfo: {
        name: '张小明',
        grade: '三年级',
        class: '2班',
        age: 9
      },
      // 健康预警列表
      warningList: [
        {
          type: 'fever',
          time: '2024-04-22 14:30',
          description: '孩子体温检测为38.2℃，有发热症状',
          suggestion: '建议及时就医，注意观察体温变化，多喝水休息。'
        },
        {
          type: 'allergy',
          time: '2024-04-21 10:15',
          description: '午餐后出现轻微皮肤过敏反应',
          suggestion: '已服用抗过敏药物，建议家长关注过敏源，避免接触。'
        },
        {
          type: 'injury',
          time: '2024-04-20 15:45',
          description: '体育课时不慎摔倒，膝盖轻微擦伤',
          suggestion: '已进行消毒处理，伤口较浅，注意保持清洁干燥。'
        }
      ],
      warningDialogVisible: false,
      currentWarning: null,
      // 日期选择
      selectedDate: '2024-04-22',
      // 饮食记录
      dietRecords: [
        { time: '08:00', meal: '早餐', content: '牛奶、鸡蛋、面包' },
        { time: '12:00', meal: '午餐', content: '米饭、红烧肉、青菜、番茄蛋汤' },
        { time: '17:30', meal: '晚餐', content: '面条、蔬菜沙拉' }
      ],
      // 饮水记录
      waterTarget: 1500,
      waterCurrent: 1200,
      waterRecords: [
        { time: '08:30', amount: 200 },
        { time: '10:00', amount: 250 },
        { time: '12:30', amount: 300 },
        { time: '15:00', amount: 250 },
        { time: '17:00', amount: 200 }
      ],
      // 午休记录
      restRecord: {
        startTime: '12:30',
        endTime: '14:00',
        duration: '1小时30分钟',
        quality: 4
      },
      // 居家健康表单
      homeHealthForm: {
        date: '',
        temperature: '',
        sleepHours: '',
        sleepQuality: 0,
        waterIntake: '',
        exerciseMinutes: '',
        notes: ''
      },
      homeHealthRules: {
        date: [{ required: true, message: '请选择日期', trigger: 'change' }],
        temperature: [{ pattern: /^([3-4])?(\d)(\.\d)?$/, message: '请输入正确的体温', trigger: 'blur' }]
      },
      // 健康历史记录
      healthHistory: [
        { date: '2024-04-21', temperature: '36.8', sleepHours: '9', sleepQuality: 4, waterIntake: '1400', exerciseMinutes: '60', notes: '精神状态良好' },
        { date: '2024-04-20', temperature: '36.5', sleepHours: '8.5', sleepQuality: 5, waterIntake: '1600', exerciseMinutes: '45', notes: '运动后食欲好' },
        { date: '2024-04-19', temperature: '37.0', sleepHours: '8', sleepQuality: 3, waterIntake: '1200', exerciseMinutes: '30', notes: '晚上有点咳嗽' }
      ]
    };
  },
  computed: {
    waterProgress() {
      return Math.min(Math.round((this.waterCurrent / this.waterTarget) * 100), 100);
    },
    waterColor() {
      if (this.waterProgress < 50) return '#f56c6c';
      if (this.waterProgress < 80) return '#e6a23c';
      return '#67c23a';
    }
  },
  methods: {
    // 获取预警图标
    getWarningIcon(type) {
      const icons = {
        fever: 'el-icon-temperature-high',
        allergy: 'el-icon-warning',
        injury: 'el-icon-first-aid-kit'
      };
      return icons[type] || 'el-icon-warning';
    },
    // 获取预警类型名称
    getWarningTypeName(type) {
      const names = {
        fever: '发热',
        allergy: '过敏',
        injury: '磕碰'
      };
      return names[type] || '其他';
    },
    // 获取预警标签类型
    getWarningTagType(type) {
      const types = {
        fever: 'danger',
        allergy: 'warning',
        injury: 'info'
      };
      return types[type] || '';
    },
    // 查看预警详情
    handleWarningDetail(item) {
      this.currentWarning = item;
      this.warningDialogVisible = true;
    },
    // 确认预警已读
    handleWarningConfirm() {
      this.$message.success('已确认');
      this.warningDialogVisible = false;
    },
    // 日期变化
    handleDateChange(date) {
      this.$message.info('查询日期：' + date);
    },
    // 提交居家健康数据
    submitHomeHealth() {
      this.$refs.homeHealthForm.validate((valid) => {
        if (valid) {
          const newRecord = {
            date: this.homeHealthForm.date,
            temperature: this.homeHealthForm.temperature,
            sleepHours: this.homeHealthForm.sleepHours,
            sleepQuality: this.homeHealthForm.sleepQuality,
            waterIntake: this.homeHealthForm.waterIntake,
            exerciseMinutes: this.homeHealthForm.exerciseMinutes,
            notes: this.homeHealthForm.notes
          };
          this.healthHistory.unshift(newRecord);
          this.$message.success('居家健康数据提交成功');
          this.resetHomeHealthForm();
        }
      });
    },
    // 重置表单
    resetHomeHealthForm() {
      this.$refs.homeHealthForm.resetFields();
    },
    // 编辑历史记录
    handleEditHistory(row) {
      this.homeHealthForm = {
        date: row.date,
        temperature: row.temperature,
        sleepHours: row.sleepHours,
        sleepQuality: row.sleepQuality,
        waterIntake: row.waterIntake,
        exerciseMinutes: row.exerciseMinutes,
        notes: row.notes
      };
      this.$message.info('已加载历史数据，可修改后重新提交');
    }
  }
};
</script>

<style scoped>
.child-health {
  padding: 20px;
}

.child-info-card {
  margin-bottom: 20px;
}

.child-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.info-content h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  color: #303133;
}

.info-content p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.section-card {
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.section-title i {
  margin-right: 8px;
  color: #409EFF;
}

/* 预警列表样式 */
.warning-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.warning-item {
  display: flex;
  align-items: center;
  padding: 15px;
  background: #fafafa;
  border-radius: 8px;
  border-left: 4px solid #f56c6c;
}

.warning-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
}

.warning-icon.fever {
  background: #fef0f0;
  color: #f56c6c;
}

.warning-icon.allergy {
  background: #fdf6ec;
  color: #e6a23c;
}

.warning-icon.injury {
  background: #f4f4f5;
  color: #909399;
}

.warning-icon i {
  font-size: 24px;
}

.warning-content {
  flex: 1;
}

.warning-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 5px;
}

.warning-time {
  font-size: 12px;
  color: #909399;
}

.warning-desc {
  font-size: 14px;
  color: #606266;
}

/* 在校生活记录卡片 */
.life-card {
  background: #fafafa;
  border-radius: 8px;
  padding: 15px;
  height: 300px;
  overflow-y: auto;
}

.life-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 15px;
  font-size: 15px;
  font-weight: bold;
  color: #303133;
}

.life-header i {
  font-size: 18px;
}

.life-timeline {
  padding-left: 0;
}

.timeline-content {
  padding: 8px 12px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.meal-type {
  font-weight: bold;
  color: #67c23a;
  margin-bottom: 4px;
}

.meal-detail {
  font-size: 13px;
  color: #606266;
}

/* 饮水进度 */
.water-progress {
  text-align: center;
  margin: 15px 0;
}

.water-info {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.water-current {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
}

.water-target {
  font-size: 12px;
  color: #909399;
}

.water-list {
  margin-top: 15px;
}

.water-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  background: #fff;
  border-radius: 4px;
  margin-bottom: 8px;
}

.water-time {
  color: #909399;
  font-size: 13px;
}

.water-amount {
  color: #409EFF;
  font-weight: bold;
}

/* 午休记录 */
.rest-info {
  padding: 10px;
}

.rest-time {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 15px;
  font-size: 16px;
  color: #303133;
}

.rest-duration, .rest-quality {
  margin-bottom: 12px;
}

.duration-label, .quality-label {
  color: #909399;
  margin-right: 8px;
}

.duration-value {
  font-size: 18px;
  font-weight: bold;
  color: #67c23a;
}

/* 预警详情 */
.warning-detail {
  padding: 10px;
}

.detail-item {
  margin-bottom: 15px;
}

.detail-label {
  font-weight: bold;
  color: #606266;
  display: block;
  margin-bottom: 5px;
}

.detail-item p {
  margin: 5px 0 0 0;
  color: #303133;
  line-height: 1.6;
}
</style>