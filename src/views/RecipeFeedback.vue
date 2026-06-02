<template>
  <div class="recipe-feedback">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="title">
        <i class="el-icon-food"></i>
        食谱反馈
      </h1>
      <p class="subtitle">查看每周食谱，反馈饮食需求，关注孩子营养健康</p>
    </div>

    <!-- 本周日期选择 -->
    <div class="week-selector">
      <el-button icon="el-icon-arrow-left" circle @click="prevWeek"></el-button>
      <div class="week-info">
        <span class="week-label">本周食谱</span>
        <span class="week-range">{{ currentWeekRange }}</span>
      </div>
      <el-button icon="el-icon-arrow-right" circle @click="nextWeek" :disabled="isCurrentWeek"></el-button>
    </div>

    <!-- 过敏原提醒 -->
    <div class="allergy-alert" v-if="hasAllergyWarning">
      <el-alert
        title="过敏原提醒"
        type="warning"
        :closable="false"
        show-icon>
        <template slot="title">
          <i class="el-icon-warning"></i>
          <span>过敏原提醒：本周食谱包含您孩子过敏的食物（{{ allergyFoods.join('、') }}），请注意避免</span>
        </template>
      </el-alert>
    </div>

    <!-- 每周食谱展示 -->
    <div class="recipe-calendar">
      <el-row :gutter="15">
        <el-col :span="24" :md="12" :lg="8" v-for="day in weekRecipes" :key="day.date">
          <div class="day-card" :class="{ today: isToday(day.date) }">
            <div class="day-header">
              <span class="day-name">{{ day.name }}</span>
              <span class="day-date">{{ day.date }}</span>
              <el-tag v-if="isToday(day.date)" size="mini" type="danger">今天</el-tag>
            </div>
            <div class="day-meals">
              <div class="meal-item">
                <div class="meal-label">
                  <i class="el-icon-sunrise"></i>
                  早餐
                </div>
                <div class="meal-content">
                  <span v-for="(food, index) in day.breakfast" :key="index" class="food-tag">
                    <el-tag size="small" :type="getFoodTagType(food)">{{ food.name }}</el-tag>
                  </span>
                </div>
              </div>
              <div class="meal-item">
                <div class="meal-label">
                  <i class="el-icon-sunny"></i>
                  午餐
                </div>
                <div class="meal-content">
                  <span v-for="(food, index) in day.lunch" :key="index" class="food-tag">
                    <el-tag size="small" :type="getFoodTagType(food)">{{ food.name }}</el-tag>
                  </span>
                </div>
              </div>
              <div class="meal-item">
                <div class="meal-label">
                  <i class="el-icon-moon"></i>
                  午点
                </div>
                <div class="meal-content">
                  <span v-for="(food, index) in day.snack" :key="index" class="food-tag">
                    <el-tag size="small" :type="getFoodTagType(food)">{{ food.name }}</el-tag>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 营养分析 -->
    <div class="nutrition-section">
      <div class="section-header">
        <div class="section-icon">
          <i class="el-icon-data-analysis"></i>
        </div>
        <span class="section-title">本周营养分析</span>
      </div>
      <el-row :gutter="20">
        <el-col :span="12" :md="6" v-for="item in nutritionData" :key="item.name">
          <div class="nutrition-item">
            <div class="nutrition-name">{{ item.name }}</div>
            <el-progress 
              :percentage="item.value" 
              :color="item.color"
              :stroke-width="12"
              :show-text="true">
            </el-progress>
            <div class="nutrition-desc">{{ item.desc }}</div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 饮食需求反馈 -->
    <div class="feedback-section">
      <div class="section-header">
        <div class="section-icon feedback-icon">
          <i class="el-icon-edit-outline"></i>
        </div>
        <span class="section-title">饮食需求反馈</span>
      </div>

      <el-form :model="feedbackForm" label-width="100px" class="feedback-form">
        <el-form-item label="反馈类型">
          <el-radio-group v-model="feedbackForm.type">
            <el-radio-button label="allergy">
              <i class="el-icon-warning"></i> 过敏食物
            </el-radio-button>
            <el-radio-button label="preference">
              <i class="el-icon-star-off"></i> 饮食偏好
            </el-radio-button>
            <el-radio-button label="suggestion">
              <i class="el-icon-chat-dot-round"></i> 改进建议
            </el-radio-button>
            <el-radio-button label="other">
              <i class="el-icon-more"></i> 其他
            </el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="具体食物" v-if="feedbackForm.type === 'allergy'">
          <el-select
            v-model="feedbackForm.foods"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="请选择或输入过敏食物"
            style="width: 100%">
            <el-option
              v-for="food in commonAllergens"
              :key="food"
              :label="food"
              :value="food">
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="饮食偏好" v-if="feedbackForm.type === 'preference'">
          <el-checkbox-group v-model="feedbackForm.preferences">
            <el-checkbox label="less_salt">少盐</el-checkbox>
            <el-checkbox label="less_sugar">少糖</el-checkbox>
            <el-checkbox label="less_oil">少油</el-checkbox>
            <el-checkbox label="more_veg">多蔬菜</el-checkbox>
            <el-checkbox label="more_fruit">多水果</el-checkbox>
            <el-checkbox label="more_protein">多蛋白质</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="详细说明">
          <el-input
            v-model="feedbackForm.content"
            type="textarea"
            :rows="4"
            :placeholder="feedbackPlaceholder">
          </el-input>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" icon="el-icon-position" @click="submitFeedback" :loading="submitting">
            提交反馈
          </el-button>
          <el-button icon="el-icon-refresh" @click="resetFeedback">
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 反馈历史 -->
    <div class="feedback-history">
      <div class="section-header">
        <div class="section-icon history-icon">
          <i class="el-icon-time"></i>
        </div>
        <span class="section-title">反馈记录</span>
      </div>

      <div class="history-list">
        <div v-for="record in feedbackRecords" :key="record.id" class="history-item">
          <div class="history-status" :class="record.status">
            <i :class="statusIcon(record.status)"></i>
          </div>
          <div class="history-content">
            <div class="history-header">
              <el-tag size="mini" :type="feedbackTypeTag(record.type)">
                {{ feedbackTypeText(record.type) }}
              </el-tag>
              <span class="history-time">{{ record.time }}</span>
            </div>
            <p class="history-text">{{ record.content }}</p>
            <div v-if="record.reply" class="history-reply">
              <i class="el-icon-s-comment"></i>
              <span>{{ record.reply }}</span>
            </div>
          </div>
        </div>

        <div v-if="feedbackRecords.length === 0" class="empty-state">
          <i class="el-icon-document"></i>
          <p>暂无反馈记录</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RecipeFeedback',
  data() {
    return {
      currentWeekOffset: 0,
      submitting: false,
      childAllergens: ['花生', '海鲜'],
      commonAllergens: ['牛奶', '鸡蛋', '花生', '海鲜', '大豆', '小麦', '坚果', '芒果'],
      feedbackForm: {
        type: 'allergy',
        foods: [],
        preferences: [],
        content: ''
      },
      feedbackRecords: [
        {
          id: 1,
          type: 'allergy',
          content: '孩子对花生过敏，请避免在食谱中使用含花生的食物',
          time: '2024-05-20 10:30',
          status: 'processed',
          reply: '已收到，我们会在食谱中注意避免花生及制品'
        },
        {
          id: 2,
          type: 'preference',
          content: '希望能增加更多蔬菜种类',
          time: '2024-05-15 14:20',
          status: 'pending'
        }
      ],
      nutritionData: [
        { name: '蛋白质', value: 85, color: '#67C23A', desc: '摄入充足' },
        { name: '碳水化合物', value: 75, color: '#409EFF', desc: '摄入适中' },
        { name: '脂肪', value: 65, color: '#E6A23C', desc: '摄入适中' },
        { name: '维生素', value: 90, color: '#F56C6C', desc: '摄入丰富' }
      ],
      weekRecipes: []
    };
  },
  computed: {
    currentWeekRange() {
      const now = new Date();
      now.setDate(now.getDate() + this.currentWeekOffset * 7);
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay() + 1);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      return `${this.formatDate(weekStart)} - ${this.formatDate(weekEnd)}`;
    },
    isCurrentWeek() {
      return this.currentWeekOffset === 0;
    },
    hasAllergyWarning() {
      return this.allergyFoods.length > 0;
    },
    allergyFoods() {
      const foods = [];
      this.weekRecipes.forEach(day => {
        [...day.breakfast, ...day.lunch, ...day.snack].forEach(food => {
          if (food.isAllergen && !foods.includes(food.allergenType)) {
            foods.push(food.allergenType);
          }
        });
      });
      return foods.filter(f => this.childAllergens.includes(f));
    },
    feedbackPlaceholder() {
      const map = {
        allergy: '请详细描述过敏情况及需要注意的事项',
        preference: '请描述孩子的饮食偏好或忌口',
        suggestion: '请提出您对食谱的改进建议',
        other: '请输入您想要反馈的内容'
      };
      return map[this.feedbackForm.type] || '请输入反馈内容';
    }
  },
  created() {
    this.generateWeekRecipes();
  },
  methods: {
    // 生成本周食谱数据
    generateWeekRecipes() {
      const days = ['周一', '周二', '周三', '周四', '周五'];
      const recipes = [
        {
          breakfast: [
            { name: '牛奶', isAllergen: true, allergenType: '牛奶' },
            { name: '全麦面包', isAllergen: false },
            { name: '水煮蛋', isAllergen: true, allergenType: '鸡蛋' }
          ],
          lunch: [
            { name: '米饭', isAllergen: false },
            { name: '红烧肉', isAllergen: false },
            { name: '炒青菜', isAllergen: false },
            { name: '番茄蛋汤', isAllergen: true, allergenType: '鸡蛋' }
          ],
          snack: [
            { name: '苹果', isAllergen: false },
            { name: '小饼干', isAllergen: false }
          ]
        },
        {
          breakfast: [
            { name: '豆浆', isAllergen: true, allergenType: '大豆' },
            { name: '花卷', isAllergen: false },
            { name: '小菜', isAllergen: false }
          ],
          lunch: [
            { name: '米饭', isAllergen: false },
            { name: '清蒸鱼', isAllergen: true, allergenType: '海鲜' },
            { name: '土豆丝', isAllergen: false },
            { name: '紫菜蛋汤', isAllergen: true, allergenType: '鸡蛋' }
          ],
          snack: [
            { name: '香蕉', isAllergen: false },
            { name: '酸奶', isAllergen: true, allergenType: '牛奶' }
          ]
        },
        {
          breakfast: [
            { name: '小米粥', isAllergen: false },
            { name: '肉包', isAllergen: false },
            { name: '咸菜', isAllergen: false }
          ],
          lunch: [
            { name: '米饭', isAllergen: false },
            { name: '宫保鸡丁', isAllergen: true, allergenType: '花生' },
            { name: '炒白菜', isAllergen: false },
            { name: '冬瓜汤', isAllergen: false }
          ],
          snack: [
            { name: '橙子', isAllergen: false },
            { name: '小蛋糕', isAllergen: true, allergenType: '鸡蛋' }
          ]
        },
        {
          breakfast: [
            { name: '牛奶', isAllergen: true, allergenType: '牛奶' },
            { name: '三明治', isAllergen: true, allergenType: '鸡蛋' },
            { name: '水果沙拉', isAllergen: false }
          ],
          lunch: [
            { name: '米饭', isAllergen: false },
            { name: '糖醋里脊', isAllergen: false },
            { name: '炒豆芽', isAllergen: false },
            { name: '青菜豆腐汤', isAllergen: true, allergenType: '大豆' }
          ],
          snack: [
            { name: '梨', isAllergen: false },
            { name: '小面包', isAllergen: false }
          ]
        },
        {
          breakfast: [
            { name: '燕麦粥', isAllergen: false },
            { name: '鸡蛋饼', isAllergen: true, allergenType: '鸡蛋' },
            { name: '牛奶', isAllergen: true, allergenType: '牛奶' }
          ],
          lunch: [
            { name: '米饭', isAllergen: false },
            { name: '虾仁炒蛋', isAllergen: true, allergenType: '海鲜' },
            { name: '炒西兰花', isAllergen: false },
            { name: '萝卜汤', isAllergen: false }
          ],
          snack: [
            { name: '西瓜', isAllergen: false },
            { name: '小馒头', isAllergen: false }
          ]
        }
      ];

      const now = new Date();
      now.setDate(now.getDate() + this.currentWeekOffset * 7);
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay() + 1);

      this.weekRecipes = days.map((day, index) => {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + index);
        return {
          name: day,
          date: this.formatDate(date),
          ...recipes[index]
        };
      });
    },
    // 上一周
    prevWeek() {
      this.currentWeekOffset--;
      this.generateWeekRecipes();
    },
    // 下一周
    nextWeek() {
      if (!this.isCurrentWeek) {
        this.currentWeekOffset++;
        this.generateWeekRecipes();
      }
    },
    // 判断是否是今天
    isToday(dateStr) {
      return dateStr === this.formatDate(new Date());
    },
    // 格式化日期
    formatDate(date) {
      return `${date.getMonth() + 1}月${date.getDate()}日`;
    },
    // 获取食物标签类型
    getFoodTagType(food) {
      if (food.isAllergen && this.childAllergens.includes(food.allergenType)) {
        return 'danger';
      }
      if (food.isAllergen) {
        return 'warning';
      }
      return '';
    },
    // 提交反馈
    submitFeedback() {
      if (!this.feedbackForm.content.trim()) {
        this.$message.warning('请输入反馈内容');
        return;
      }

      this.submitting = true;
      setTimeout(() => {
        const newRecord = {
          id: Date.now(),
          type: this.feedbackForm.type,
          content: this.feedbackForm.content,
          time: this.formatDateTime(new Date()),
          status: 'pending'
        };
        this.feedbackRecords.unshift(newRecord);
        this.submitting = false;
        this.$message.success('反馈提交成功！');
        this.resetFeedback();
      }, 1000);
    },
    // 重置反馈表单
    resetFeedback() {
      this.feedbackForm = {
        type: 'allergy',
        foods: [],
        preferences: [],
        content: ''
      };
    },
    // 格式化日期时间
    formatDateTime(date) {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    },
    // 反馈类型标签
    feedbackTypeTag(type) {
      const map = {
        allergy: 'danger',
        preference: 'primary',
        suggestion: 'success',
        other: 'info'
      };
      return map[type] || 'info';
    },
    // 反馈类型文本
    feedbackTypeText(type) {
      const map = {
        allergy: '过敏反馈',
        preference: '饮食偏好',
        suggestion: '改进建议',
        other: '其他'
      };
      return map[type] || type;
    },
    // 状态图标
    statusIcon(status) {
      const map = {
        pending: 'el-icon-time',
        processed: 'el-icon-check'
      };
      return map[status] || 'el-icon-question';
    }
  }
};
</script>

<style scoped>
.recipe-feedback {
  padding: 20px;
  max-width: 1200px;
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
  color: #67C23A;
  font-size: 32px;
}

.subtitle {
  color: #888;
  font-size: 16px;
  margin-top: 8px;
}

/* 周选择器 */
.week-selector {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-bottom: 25px;
}

.week-info {
  text-align: center;
}

.week-label {
  display: block;
  font-size: 14px;
  color: #999;
}

.week-range {
  display: block;
  font-size: 18px;
  font-weight: 500;
  color: #333;
  margin-top: 5px;
}

/* 过敏原提醒 */
.allergy-alert {
  margin-bottom: 25px;
}

/* 食谱日历 */
.recipe-calendar {
  margin-bottom: 30px;
}

.day-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 15px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.day-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
}

.day-card.today {
  border: 2px solid #F56C6C;
}

.day-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #EBEEF5;
}

.day-name {
  font-size: 18px;
  font-weight: 500;
  color: #333;
}

.day-date {
  color: #999;
  font-size: 14px;
}

.day-meals {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.meal-item {
  display: flex;
  align-items: flex-start;
  gap: 15px;
}

.meal-label {
  display: flex;
  align-items: center;
  gap: 5px;
  min-width: 70px;
  color: #666;
  font-weight: 500;
}

.meal-label i {
  color: #E6A23C;
}

.meal-content {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  flex: 1;
}

.food-tag {
  margin-bottom: 5px;
}

/* 营养分析 */
.nutrition-section {
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

.feedback-icon {
  background: #67C23A;
}

.history-icon {
  background: #E6A23C;
}

.section-title {
  font-size: 18px;
  font-weight: 500;
  color: #333;
}

.nutrition-item {
  margin-bottom: 20px;
}

.nutrition-name {
  font-weight: 500;
  color: #555;
  margin-bottom: 10px;
}

.nutrition-desc {
  font-size: 13px;
  color: #999;
  margin-top: 5px;
}

/* 反馈区域 */
.feedback-section {
  background: #fff;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 25px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.feedback-form >>> .el-radio-button__inner {
  padding: 10px 20px;
}

.feedback-form >>> .el-radio-button__inner i {
  margin-right: 5px;
}

/* 反馈历史 */
.feedback-history {
  background: #fff;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.history-item {
  display: flex;
  gap: 15px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.history-status {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.history-status.pending {
  background: #fdf6ec;
  color: #e6a23c;
}

.history-status.processed {
  background: #f0f9eb;
  color: #67c23a;
}

.history-content {
  flex: 1;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.history-time {
  color: #999;
  font-size: 13px;
}

.history-text {
  color: #333;
  margin: 0 0 10px;
  line-height: 1.6;
}

.history-reply {
  padding: 10px 15px;
  background: #e6f7ff;
  border-radius: 4px;
  color: #1890ff;
  font-size: 14px;
}

.history-reply i {
  margin-right: 5px;
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
  .recipe-feedback {
    padding: 15px;
  }

  .title {
    font-size: 22px;
  }

  .day-card {
    padding: 15px;
  }

  .meal-item {
    flex-direction: column;
    gap: 8px;
  }

  .meal-label {
    min-width: auto;
  }

  .feedback-form >>> .el-radio-group {
    display: flex;
    flex-wrap: wrap;
  }
}
</style>
