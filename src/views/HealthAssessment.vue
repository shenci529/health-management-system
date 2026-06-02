<template>
  <div class="health-assessment">
    <!-- 顶部选择区域 -->
    <div class="select-bar">
      <el-form :inline="true" :model="queryForm">
        <el-form-item label="选择人员">
          <el-select v-model="queryForm.personId" placeholder="请选择人员" @change="handlePersonChange" style="width: 200px;">
            <el-option
              v-for="p in userList"
              :key="p.id"
              :label="p.username"
              :value="p.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="评估日期">
          <el-select v-model="queryForm.date" placeholder="请选择日期" style="width: 200px;" :disabled="!queryForm.personId">
            <el-option
              v-for="d in availableDates"
              :key="d"
              :label="d"
              :value="d">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleAssess">开始评估</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 未选择时的提示 -->
    <div v-if="!assessed" class="empty-state">
      <i class="el-icon-data-analysis" style="font-size: 64px; color: #ccc;"></i>
      <p style="margin-top: 20px; color: #999; font-size: 16px;">请选择人员和日期后点击"开始评估"</p>
      <p v-if="userList.length === 0" style="margin-top: 10px; color: #f5222d;">暂无人员数据，请先在"用户管理"中添加人员</p>
    </div>

    <!-- 评估结果 -->
    <div v-else>
      <el-row :gutter="20">
        <el-col :span="12">
          <div class="info-card">
            <h3 style="text-align: center; margin-bottom: 20px;">
              <i class="el-icon-user"></i> 身体信息 - {{ currentPerson.username }}
            </h3>
            <el-table :data="bodyInfo" style="width: 100%;" :show-header="false" border>
              <el-table-column prop="label" width="120"></el-table-column>
              <el-table-column prop="value"></el-table-column>
            </el-table>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="info-card">
            <h3 style="text-align: center; margin-bottom: 20px;">
              <i class="el-icon-odometer"></i> 基础能量消耗状况
            </h3>
            <div style="display: flex; justify-content: space-around;">
              <div class="progress-item">
                <el-progress type="circle" :percentage="bmrPercent" :color="bmrPercent > 60 ? '#4CAF50' : '#faad14'"></el-progress>
                <p style="margin-top: 10px; font-size: 14px;">到达身体年龄的百分比</p>
              </div>
              <div class="progress-item">
                <el-progress type="circle" :percentage="bmrScore" :color="bmrScore > 60 ? '#4CAF50' : '#faad14'"></el-progress>
                <p style="margin-top: 10px; font-size: 14px;">基础能量消耗</p>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>

      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="12">
          <div class="info-card">
            <h3 style="text-align: center; margin-bottom: 20px; border-bottom: 3px solid #1890ff; padding-bottom: 10px;">
              <i class="el-icon-user"></i> 肥胖分析
            </h3>
            <p style="font-size: 14px; margin-bottom: 10px;">根据计算：{{ obesityResult }}</p>
            <p style="font-size: 14px; color: #faad14;">
              <i class="el-icon-warning"></i>
              {{ obesityRisk }}
            </p>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="info-card">
            <h3 style="text-align: center; margin-bottom: 20px;">
              <i class="el-icon-s-grid"></i> 生活习惯分析
            </h3>
            <p style="font-size: 14px; margin-bottom: 8px;">{{ currentPerson.username }}的习惯如下：</p>
            <p style="font-size: 13px; color: #666;">饮食习惯：{{ dietHabit }}</p>
            <p style="font-size: 13px; color: #666;">运动习惯：{{ exerciseHabit }}</p>
            <p style="font-size: 13px; color: #666;">
              <i class="el-icon-warning" style="color: #faad14;"></i>
              建议：{{ lifeSuggestion }}
            </p>
          </div>
        </el-col>
      </el-row>

      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="12">
          <div class="info-card">
            <h3 style="text-align: center; margin-bottom: 20px;">
              <i class="el-icon-view"></i> 视力分析
            </h3>
            <p style="font-size: 14px;">{{ currentPerson.username }}的视力为：{{ currentRecord.vision }} 度</p>
            <p style="font-size: 14px; color: #666;">近视程度：{{ visionLevel }}</p>
            <p style="font-size: 14px; color: #666;">建议：{{ visionSuggestion }}</p>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="info-card">
            <h3 style="text-align: center; margin-bottom: 20px;">
              <i class="el-icon-goods"></i> 体型判断
            </h3>
            <p style="font-size: 14px;">{{ currentPerson.username }}的体型属于：{{ bodyType }}</p>
            <p style="font-size: 14px; color: #666;">建议：{{ bodyTypeSuggestion }}</p>
          </div>
        </el-col>
      </el-row>

      <div style="text-align: center; margin-top: 30px;">
        <div style="display: inline-block; background: #fff; padding: 20px; border-radius: 8px;">
          <h3 style="margin-bottom: 15px;">
            <i class="el-icon-check"></i> 健康评分
          </h3>
          <div :style="{fontSize: '48px', fontWeight: 'bold', color: healthScoreColor}">{{ healthScore }}分</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import store from '@/store.js';

export default {
  name: 'HealthAssessment',
  data() {
    return {
      assessed: false,
      queryForm: {
        personId: '',
        date: ''
      },
      currentPerson: {},
      currentRecord: {}
    };
  },
  computed: {
    userList() {
      return store.getUserList();
    },
    availableDates() {
      if (!this.queryForm.personId) return [];
      return store.getDatesByUser(this.queryForm.personId);
    },
    bmi() {
      if (!this.currentRecord.height || !this.currentRecord.weight) return 0;
      const h = this.currentRecord.height;
      const w = this.currentRecord.weight;
      return (w / (h * h)).toFixed(2);
    },
    bodyInfo() {
      return [
        { label: '姓名', value: this.currentPerson.username || '-' },
        { label: '性别', value: this.currentPerson.gender || '-' },
        { label: '年龄', value: (this.currentPerson.age || '-') + ' 岁' },
        { label: '身高', value: (this.currentRecord.height || '-') + ' m' },
        { label: '体重', value: (this.currentRecord.weight || '-') + ' kg' },
        { label: 'BMI', value: this.bmi || '-' },
        { label: '血压', value: (this.currentRecord.bloodPressure || '-') + ' mmHg' },
        { label: '血糖', value: (this.currentRecord.bloodSugar || '-') + ' mmol/L' },
        { label: '胆固醇', value: (this.currentRecord.cholesterol || '-') + ' mmol/L' },
        { label: '心率', value: (this.currentRecord.heartRate || '-') + ' 次/分钟' },
        { label: '视力', value: (this.currentRecord.vision || '-') + ' 度' }
      ];
    },
    bmrPercent() {
      if (!this.currentPerson.age) return 0;
      return Math.min(100, Math.round((this.currentPerson.age / 25) * 100));
    },
    bmrScore() {
      const bmi = parseFloat(this.bmi);
      if (!bmi) return 0;
      if (bmi >= 18.5 && bmi <= 24) return 80;
      if (bmi >= 17 && bmi <= 28) return 60;
      return 40;
    },
    obesityResult() {
      const bmi = parseFloat(this.bmi);
      if (bmi < 18.5) return '您的体重偏瘦（BMI=' + bmi + '），建议增加营养摄入';
      if (bmi < 24) return '您的体重正常（BMI=' + bmi + '），请保持运动生活习惯';
      if (bmi < 28) return '您的体重偏重（BMI=' + bmi + '），建议适当控制饮食并加强运动';
      return '您的体重肥胖（BMI=' + bmi + '），建议尽快调整饮食结构并坚持运动';
    },
    obesityRisk() {
      const bmi = parseFloat(this.bmi);
      if (bmi < 18.5) return '偏瘦风险：注意营养均衡，避免免疫力下降';
      if (bmi < 24) return '风险不大，保持足够的蛋白质、碳水化合物和维生素即可';
      if (bmi < 28) return '超重风险：存在心血管疾病隐患，建议控制体重';
      return '肥胖风险较高：容易引发高血压、糖尿病等，建议尽快就医咨询';
    },
    dietHabit() {
      if (this.currentRecord.smoke && this.currentRecord.drink) return '存在吸烟和饮酒习惯，建议戒烟限酒';
      if (this.currentRecord.smoke) return '存在吸烟习惯，建议戒烟';
      if (this.currentRecord.drink) return '存在饮酒习惯，建议适量饮酒';
      return '饮食习惯良好，摄入足够的碳水化合物和蔬菜，未过度饮酒';
    },
    exerciseHabit() {
      const hr = this.currentRecord.heartRate;
      if (hr && hr < 70) return '心率偏低，建议增加有氧运动';
      if (hr && hr <= 85) return '心率正常，运动习惯良好';
      return '心率偏高，建议适度运动，避免剧烈运动';
    },
    lifeSuggestion() {
      if (this.currentRecord.sleepStatus === '差') return '睡眠质量较差，建议调整作息时间，保证每天8小时睡眠';
      if (this.currentRecord.sleepStatus === '一般') return '睡眠质量一般，可以更好地制定作息计划，减少熬夜';
      return '生活习惯良好，继续保持，注意规律运动';
    },
    visionLevel() {
      const v = this.currentRecord.vision;
      if (!v) return '-';
      if (v <= 100) return '正常视力';
      if (v <= 200) return '轻度近视';
      if (v <= 400) return '中度近视';
      return '重度近视';
    },
    visionSuggestion() {
      const v = this.currentRecord.vision;
      if (!v) return '-';
      if (v <= 100) return '视力正常，继续保持良好用眼习惯';
      if (v <= 200) return '轻度近视，注意用眼卫生，避免长时间看电子屏幕';
      if (v <= 400) return '中度近视，建议佩戴眼镜，定期检查视力';
      return '重度近视，建议尽早就医，避免剧烈运动';
    },
    bodyType() {
      const bmi = parseFloat(this.bmi);
      if (bmi < 18.5) return '偏瘦体型';
      if (bmi < 24) return '正常体型';
      if (bmi < 28) return '偏胖体型';
      return '肥胖体型';
    },
    bodyTypeSuggestion() {
      const bmi = parseFloat(this.bmi);
      if (bmi < 18.5) return '建议增加营养摄入，适当进行力量训练，增强体质';
      if (bmi < 24) return '保持良好的生活习惯，适当参加运动，保持体型健康';
      if (bmi < 28) return '建议控制饮食热量，增加有氧运动，每周至少运动3次';
      return '建议尽快调整饮食结构，在医生指导下进行科学减重';
    },
    healthScore() {
      let score = 100;
      const bmi = parseFloat(this.bmi);
      if (bmi < 18.5 || bmi >= 28) score -= 20;
      else if (bmi >= 24) score -= 10;
      const v = this.currentRecord.vision || 0;
      if (v > 400) score -= 20;
      else if (v > 200) score -= 10;
      else if (v > 100) score -= 5;
      if (this.currentRecord.sleepStatus === '差') score -= 10;
      else if (this.currentRecord.sleepStatus === '一般') score -= 5;
      if (this.currentRecord.smoke) score -= 10;
      if (this.currentRecord.drink) score -= 5;
      const bs = this.currentRecord.bloodSugar || 0;
      if (bs > 7) score -= 15;
      else if (bs > 6) score -= 5;
      return Math.max(0, score);
    },
    healthScoreColor() {
      if (this.healthScore >= 80) return '#4CAF50';
      if (this.healthScore >= 60) return '#faad14';
      return '#f5222d';
    }
  },
  methods: {
    handlePersonChange() {
      this.queryForm.date = '';
      this.assessed = false;
    },
    handleAssess() {
      if (!this.queryForm.personId) {
        this.$message.warning('请选择人员');
        return;
      }
      if (!this.queryForm.date) {
        this.$message.warning('请选择日期');
        return;
      }
      const person = store.getUserById(this.queryForm.personId);
      if (!person) {
        this.$message.error('未找到该人员');
        return;
      }
      const record = store.getRecordByUserAndDate(this.queryForm.personId, this.queryForm.date);
      if (!record) {
        this.$message.warning('该日期没有健康记录，请先在"健康信息上传"中录入数据');
        return;
      }
      this.currentPerson = person;
      this.currentRecord = record;
      this.assessed = true;
      this.$message.success('评估完成');
    }
  }
};
</script>

<style scoped>
.health-assessment {
  padding: 10px;
}

.select-bar {
  background: #fff;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.info-card {
  background: #fff;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.progress-item {
  text-align: center;
}
</style>
