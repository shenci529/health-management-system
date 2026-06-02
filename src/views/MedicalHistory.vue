<template>
  <div class="medical-history">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="title">
        <i class="el-icon-first-aid-kit"></i>
        病史过敏登记
      </h1>
      <p class="subtitle">记录孩子的健康状况，让学校更好地照顾孩子</p>
    </div>

    <!-- 过敏史登记 -->
    <div class="section-card">
      <div class="section-header">
        <div class="section-icon allergy-icon">
          <i class="el-icon-warning"></i>
        </div>
        <div class="section-title">
          <h2>过敏史登记</h2>
          <span class="section-desc">请详细填写孩子的过敏信息</span>
        </div>
      </div>

      <div class="section-content">
        <!-- 食物过敏 -->
        <div class="form-group">
          <label class="group-label">
            <i class="el-icon-food"></i>
            食物过敏
          </label>
          <el-checkbox-group v-model="allergy.food" class="checkbox-group">
            <el-checkbox label="milk">牛奶/乳制品</el-checkbox>
            <el-checkbox label="egg">鸡蛋</el-checkbox>
            <el-checkbox label="peanut">花生/坚果</el-checkbox>
            <el-checkbox label="seafood">海鲜/鱼虾</el-checkbox>
            <el-checkbox label="soy">大豆/豆制品</el-checkbox>
            <el-checkbox label="wheat">小麦/麸质</el-checkbox>
            <el-checkbox label="fruit">某些水果</el-checkbox>
            <el-checkbox label="other_food">其他食物</el-checkbox>
          </el-checkbox-group>
          <el-input
            v-if="allergy.food.includes('other_food')"
            v-model="allergy.foodOther"
            placeholder="请描述其他食物过敏"
            class="other-input"
            type="textarea"
            :rows="2">
          </el-input>
        </div>

        <!-- 药物过敏 -->
        <div class="form-group">
          <label class="group-label">
            <i class="el-icon-medicine-box"></i>
            药物过敏
          </label>
          <el-checkbox-group v-model="allergy.medicine" class="checkbox-group">
            <el-checkbox label="penicillin">青霉素</el-checkbox>
            <el-checkbox label="cephalosporin">头孢类</el-checkbox>
            <el-checkbox label="sulfonamide">磺胺类</el-checkbox>
            <el-checkbox label="aspirin">阿司匹林</el-checkbox>
            <el-checkbox label="ibuprofen">布洛芬</el-checkbox>
            <el-checkbox label="other_medicine">其他药物</el-checkbox>
          </el-checkbox-group>
          <el-input
            v-if="allergy.medicine.includes('other_medicine')"
            v-model="allergy.medicineOther"
            placeholder="请描述其他药物过敏"
            class="other-input"
            type="textarea"
            :rows="2">
          </el-input>
        </div>

        <!-- 环境过敏 -->
        <div class="form-group">
          <label class="group-label">
            <i class="el-icon-cloudy"></i>
            环境过敏
          </label>
          <el-checkbox-group v-model="allergy.environment" class="checkbox-group">
            <el-checkbox label="pollen">花粉</el-checkbox>
            <el-checkbox label="dust">尘螨/灰尘</el-checkbox>
            <el-checkbox label="pet">宠物毛发</el-checkbox>
            <el-checkbox label="mold">霉菌</el-checkbox>
            <el-checkbox label="insect">昆虫叮咬</el-checkbox>
            <el-checkbox label="sunlight">日光/紫外线</el-checkbox>
            <el-checkbox label="cold">寒冷刺激</el-checkbox>
            <el-checkbox label="other_env">其他环境因素</el-checkbox>
          </el-checkbox-group>
          <el-input
            v-if="allergy.environment.includes('other_env')"
            v-model="allergy.environmentOther"
            placeholder="请描述其他环境过敏"
            class="other-input"
            type="textarea"
            :rows="2">
          </el-input>
        </div>

        <!-- 过敏反应描述 -->
        <div class="form-group">
          <label class="group-label">
            <i class="el-icon-document"></i>
            过敏反应描述
          </label>
          <el-input
            v-model="allergy.reactionDesc"
            type="textarea"
            :rows="3"
            placeholder="请描述过敏反应的症状（如皮疹、呼吸困难、恶心呕吐等）">
          </el-input>
        </div>
      </div>
    </div>

    <!-- 既往病史登记 -->
    <div class="section-card">
      <div class="section-header">
        <div class="section-icon history-icon">
          <i class="el-icon-time"></i>
        </div>
        <div class="section-title">
          <h2>既往病史</h2>
          <span class="section-desc">记录孩子曾经患过的疾病</span>
        </div>
      </div>

      <div class="section-content">
        <!-- 常见疾病 -->
        <div class="form-group">
          <label class="group-label">
            <i class="el-icon-collection"></i>
            常见疾病史
          </label>
          <el-checkbox-group v-model="medicalHistory.commonDiseases" class="checkbox-group">
            <el-checkbox label="asthma">哮喘</el-checkbox>
            <el-checkbox label="epilepsy">癫痫</el-checkbox>
            <el-checkbox label="heart">先天性心脏病</el-checkbox>
            <el-checkbox label="diabetes">糖尿病</el-checkbox>
            <el-checkbox label="anemia">贫血</el-checkbox>
            <el-checkbox label="hepatitis">肝炎</el-checkbox>
            <el-checkbox label="tuberculosis">结核</el-checkbox>
            <el-checkbox label="pneumonia">肺炎史</el-checkbox>
            <el-checkbox label="surgery">手术史</el-checkbox>
            <el-checkbox label="fracture">骨折史</el-checkbox>
            <el-checkbox label="other_disease">其他疾病</el-checkbox>
          </el-checkbox-group>
        </div>

        <!-- 详细病史记录 -->
        <div class="form-group">
          <label class="group-label">
            <i class="el-icon-notebook-2"></i>
            详细病史记录
          </label>
          <el-button type="primary" plain icon="el-icon-plus" @click="addDiseaseRecord" class="add-btn">
            添加病史记录
          </el-button>
          
          <div class="disease-list">
            <div v-for="(record, index) in diseaseRecords" :key="index" class="disease-item">
              <div class="disease-header">
                <span class="disease-number">记录 {{ index + 1 }}</span>
                <el-button type="text" class="delete-btn" @click="removeDiseaseRecord(index)">
                  <i class="el-icon-delete"></i> 删除
                </el-button>
              </div>
              <el-row :gutter="15">
                <el-col :span="8">
                  <el-input v-model="record.diseaseName" placeholder="疾病名称"></el-input>
                </el-col>
                <el-col :span="8">
                  <el-date-picker
                    v-model="record.diagnosisDate"
                    type="date"
                    placeholder="确诊日期"
                    style="width: 100%">
                  </el-date-picker>
                </el-col>
                <el-col :span="8">
                  <el-select v-model="record.status" placeholder="当前状态" style="width: 100%">
                    <el-option label="已痊愈" value="cured"></el-option>
                    <el-option label="治疗中" value="treating"></el-option>
                    <el-option label="长期管理" value="managing"></el-option>
                  </el-select>
                </el-col>
              </el-row>
              <el-input
                v-model="record.treatment"
                type="textarea"
                :rows="2"
                placeholder="治疗情况"
                class="treatment-input">
              </el-input>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 家族病史记录 -->
    <div class="section-card">
      <div class="section-header">
        <div class="section-icon family-icon">
          <i class="el-icon-house"></i>
        </div>
        <div class="section-title">
          <h2>家族病史</h2>
          <span class="section-desc">记录家族遗传性疾病史</span>
        </div>
      </div>

      <div class="section-content">
        <div class="form-group">
          <label class="group-label">
            <i class="el-icon-s-custom"></i>
            家族遗传病史
          </label>
          <el-checkbox-group v-model="familyHistory.diseases" class="checkbox-group">
            <el-checkbox label="hypertension">高血压</el-checkbox>
            <el-checkbox label="diabetes">糖尿病</el-checkbox>
            <el-checkbox label="heart_disease">心脏病</el-checkbox>
            <el-checkbox label="stroke">脑卒中</el-checkbox>
            <el-checkbox label="cancer">肿瘤/癌症</el-checkbox>
            <el-checkbox label="mental">精神疾病</el-checkbox>
            <el-checkbox label="epilepsy">癫痫</el-checkbox>
            <el-checkbox label="hemophilia">血友病</el-checkbox>
            <el-checkbox label="thalassemia">地中海贫血</el-checkbox>
            <el-checkbox label="other_family">其他</el-checkbox>
          </el-checkbox-group>
        </div>

        <!-- 家族成员病史详情 -->
        <div class="form-group">
          <label class="group-label">
            <i class="el-icon-user"></i>
            家族成员病史详情
          </label>
          <el-button type="primary" plain icon="el-icon-plus" @click="addFamilyRecord" class="add-btn">
            添加家族病史记录
          </el-button>
          
          <div class="family-list">
            <div v-for="(record, index) in familyRecords" :key="index" class="family-item">
              <div class="family-header">
                <span class="family-number">记录 {{ index + 1 }}</span>
                <el-button type="text" class="delete-btn" @click="removeFamilyRecord(index)">
                  <i class="el-icon-delete"></i> 删除
                </el-button>
              </div>
              <el-row :gutter="15">
                <el-col :span="8">
                  <el-select v-model="record.relation" placeholder="与患者关系" style="width: 100%">
                    <el-option label="父亲" value="father"></el-option>
                    <el-option label="母亲" value="mother"></el-option>
                    <el-option label="祖父" value="grandfather"></el-option>
                    <el-option label="祖母" value="grandmother"></el-option>
                    <el-option label="外祖父" value="maternal_grandfather"></el-option>
                    <el-option label="外祖母" value="maternal_grandmother"></el-option>
                    <el-option label="兄弟姐妹" value="sibling"></el-option>
                    <el-option label="其他亲属" value="other"></el-option>
                  </el-select>
                </el-col>
                <el-col :span="8">
                  <el-input v-model="record.diseaseName" placeholder="疾病名称"></el-input>
                </el-col>
                <el-col :span="8">
                  <el-input v-model="record.age" placeholder="发病年龄">
                    <template slot="append">岁</template>
                  </el-input>
                </el-col>
              </el-row>
              <el-input
                v-model="record.remarks"
                type="textarea"
                :rows="2"
                placeholder="备注说明"
                class="remarks-input">
              </el-input>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 保存按钮 -->
    <div class="action-bar">
      <el-button type="primary" size="large" icon="el-icon-check" @click="saveMedicalHistory" :loading="saving">
        保存健康档案
      </el-button>
      <el-button size="large" icon="el-icon-refresh" @click="resetForm">
        重置
      </el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MedicalHistory',
  data() {
    return {
      saving: false,
      // 过敏史
      allergy: {
        food: [],
        foodOther: '',
        medicine: [],
        medicineOther: '',
        environment: [],
        environmentOther: '',
        reactionDesc: ''
      },
      // 既往病史
      medicalHistory: {
        commonDiseases: []
      },
      diseaseRecords: [],
      // 家族病史
      familyHistory: {
        diseases: []
      },
      familyRecords: []
    };
  },
  created() {
    this.loadMedicalHistory();
  },
  methods: {
    // 添加病史记录
    addDiseaseRecord() {
      this.diseaseRecords.push({
        diseaseName: '',
        diagnosisDate: '',
        status: '',
        treatment: ''
      });
    },
    // 删除病史记录
    removeDiseaseRecord(index) {
      this.diseaseRecords.splice(index, 1);
    },
    // 添加家族病史记录
    addFamilyRecord() {
      this.familyRecords.push({
        relation: '',
        diseaseName: '',
        age: '',
        remarks: ''
      });
    },
    // 删除家族病史记录
    removeFamilyRecord(index) {
      this.familyRecords.splice(index, 1);
    },
    // 保存健康档案
    saveMedicalHistory() {
      this.saving = true;
      const data = {
        allergy: this.allergy,
        medicalHistory: this.medicalHistory,
        diseaseRecords: this.diseaseRecords,
        familyHistory: this.familyHistory,
        familyRecords: this.familyRecords,
        updateTime: new Date().toISOString()
      };
      
      // 模拟保存到localStorage
      setTimeout(() => {
        localStorage.setItem('medicalHistory', JSON.stringify(data));
        this.saving = false;
        this.$message.success('健康档案保存成功！');
      }, 1000);
    },
    // 加载健康档案
    loadMedicalHistory() {
      const savedData = localStorage.getItem('medicalHistory');
      if (savedData) {
        const data = JSON.parse(savedData);
        this.allergy = data.allergy || this.allergy;
        this.medicalHistory = data.medicalHistory || this.medicalHistory;
        this.diseaseRecords = data.diseaseRecords || [];
        this.familyHistory = data.familyHistory || this.familyHistory;
        this.familyRecords = data.familyRecords || [];
      }
    },
    // 重置表单
    resetForm() {
      this.$confirm('确定要重置所有信息吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.allergy = {
          food: [],
          foodOther: '',
          medicine: [],
          medicineOther: '',
          environment: [],
          environmentOther: '',
          reactionDesc: ''
        };
        this.medicalHistory = { commonDiseases: [] };
        this.diseaseRecords = [];
        this.familyHistory = { diseases: [] };
        this.familyRecords = [];
        this.$message.success('已重置');
      }).catch(() => {});
    }
  }
};
</script>

<style scoped>
.medical-history {
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
  color: #F56C6C;
  font-size: 32px;
}

.subtitle {
  color: #888;
  font-size: 16px;
  margin-top: 8px;
}

/* 卡片样式 */
.section-card {
  background: #fff;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 25px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 1px solid #EBEEF5;
}

.section-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.allergy-icon {
  background: #FEF0F0;
  color: #F56C6C;
}

.history-icon {
  background: #FDF6EC;
  color: #E6A23C;
}

.family-icon {
  background: #F0F9EB;
  color: #67C23A;
}

.section-title h2 {
  font-size: 20px;
  color: #333;
  margin: 0;
}

.section-desc {
  color: #999;
  font-size: 14px;
}

/* 表单组 */
.form-group {
  margin-bottom: 25px;
}

.group-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  color: #555;
  margin-bottom: 15px;
  font-weight: 500;
}

.group-label i {
  color: #409EFF;
}

.checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.checkbox-group >>> .el-checkbox {
  margin-right: 0;
  padding: 10px 15px;
  border-radius: 20px;
  background: #f5f7fa;
  transition: all 0.3s ease;
}

.checkbox-group >>> .el-checkbox:hover {
  background: #e4e7ed;
}

.checkbox-group >>> .el-checkbox.is-checked {
  background: #ecf5ff;
}

.checkbox-group >>> .el-checkbox__label {
  font-size: 14px;
}

.other-input {
  margin-top: 15px;
}

/* 病史列表 */
.add-btn {
  margin-bottom: 15px;
}

.disease-list, .family-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.disease-item, .family-item {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e4e7ed;
}

.disease-header, .family-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.disease-number, .family-number {
  font-weight: 500;
  color: #409EFF;
}

.delete-btn {
  color: #F56C6C;
}

.treatment-input, .remarks-input {
  margin-top: 15px;
}

/* 操作栏 */
.action-bar {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
  padding: 20px;
}

.action-bar >>> .el-button {
  padding: 15px 40px;
  font-size: 16px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .medical-history {
    padding: 15px;
  }

  .title {
    font-size: 22px;
  }

  .section-card {
    padding: 15px;
  }

  .checkbox-group >>> .el-checkbox {
    padding: 8px 12px;
  }
}
</style>
