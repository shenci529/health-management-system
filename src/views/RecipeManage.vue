<template>
  <div class="recipe-manage">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>校园食谱管理</h2>
      <div class="header-actions">
        <el-button type="primary" icon="el-icon-plus" @click="showAddRecipeDialog">新增食谱</el-button>
        <el-button type="success" icon="el-icon-download" @click="exportRecipe">导出食谱</el-button>
      </div>
    </div>

    <!-- 过敏预警卡片 -->
    <div class="allergy-alert-section">
      <el-alert
        title="过敏预警提示"
        type="warning"
        :closable="false"
        show-icon
      >
        <template slot="default">
          当前共有 <strong>{{ allergyStudentCount }}</strong> 名学生有食物过敏记录，请注意食谱中过敏原标注。
        </template>
      </el-alert>
    </div>

    <!-- 周选择和食谱日历视图 -->
    <div class="week-selector">
      <el-date-picker
        v-model="selectedWeek"
        type="week"
        format="yyyy 第 WW 周"
        placeholder="选择周"
        @change="handleWeekChange"
      />
      <span class="week-range">{{ weekRangeText }}</span>
    </div>

    <!-- 食谱日历视图 -->
    <div class="recipe-calendar">
      <div class="calendar-header">
        <div class="calendar-cell header-cell">日期</div>
        <div class="calendar-cell header-cell">早餐</div>
        <div class="calendar-cell header-cell">午餐</div>
        <div class="calendar-cell header-cell">晚餐</div>
      </div>
      <div class="calendar-body">
        <div v-for="(day, index) in weekRecipes" :key="index" class="calendar-row">
          <div class="calendar-cell date-cell">
            <div class="date-info">
              <span class="day-name">{{ day.dayName }}</span>
              <span class="date-text">{{ day.date }}</span>
            </div>
          </div>
          <div class="calendar-cell meal-cell">
            <div class="meal-content" @click="editMeal(day, 'breakfast')">
              <div v-for="(item, idx) in day.breakfast" :key="idx" class="meal-item">
                <span>{{ item.name }}</span>
                <el-tag v-if="item.allergens && item.allergens.length > 0" size="mini" type="warning">
                  {{ item.allergens.join(',') }}
                </el-tag>
              </div>
              <el-button type="text" size="mini" icon="el-icon-edit" v-if="day.breakfast.length > 0">编辑</el-button>
              <el-button type="text" size="mini" icon="el-icon-plus" v-else>添加</el-button>
            </div>
          </div>
          <div class="calendar-cell meal-cell">
            <div class="meal-content" @click="editMeal(day, 'lunch')">
              <div v-for="(item, idx) in day.lunch" :key="idx" class="meal-item">
                <span>{{ item.name }}</span>
                <el-tag v-if="item.allergens && item.allergens.length > 0" size="mini" type="warning">
                  {{ item.allergens.join(',') }}
                </el-tag>
              </div>
              <el-button type="text" size="mini" icon="el-icon-edit" v-if="day.lunch.length > 0">编辑</el-button>
              <el-button type="text" size="mini" icon="el-icon-plus" v-else>添加</el-button>
            </div>
          </div>
          <div class="calendar-cell meal-cell">
            <div class="meal-content" @click="editMeal(day, 'dinner')">
              <div v-for="(item, idx) in day.dinner" :key="idx" class="meal-item">
                <span>{{ item.name }}</span>
                <el-tag v-if="item.allergens && item.allergens.length > 0" size="mini" type="warning">
                  {{ item.allergens.join(',') }}
                </el-tag>
              </div>
              <el-button type="text" size="mini" icon="el-icon-edit" v-if="day.dinner.length > 0">编辑</el-button>
              <el-button type="text" size="mini" icon="el-icon-plus" v-else>添加</el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 过敏原管理 -->
    <div class="allergen-section">
      <div class="section-header">
        <h3>过敏原类型管理</h3>
        <el-button type="primary" size="small" icon="el-icon-plus" @click="showAddAllergenDialog">新增过敏原</el-button>
      </div>
      <div class="allergen-tags">
        <el-tag
          v-for="(allergen, index) in allergenList"
          :key="index"
          :type="allergen.type"
          size="medium"
          closable
          @close="removeAllergen(allergen)"
        >
          <i :class="allergen.icon"></i>
          {{ allergen.name }}
        </el-tag>
      </div>
    </div>

    <!-- 学生过敏档案列表 -->
    <div class="allergy-student-section">
      <div class="section-header">
        <h3>学生过敏档案</h3>
        <div class="filter-group">
          <el-select v-model="filterAllergen" placeholder="筛选过敏原" clearable>
            <el-option v-for="item in allergenList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
          <el-input
            v-model="searchStudent"
            placeholder="搜索学生姓名"
            prefix-icon="el-icon-search"
            clearable
            style="width: 200px;"
          />
        </div>
      </div>

      <el-table :data="filteredAllergyStudents" border stripe style="width: 100%">
        <el-table-column prop="studentName" label="学生姓名" width="120" />
        <el-table-column prop="className" label="班级" width="120" />
        <el-table-column prop="allergens" label="过敏原" min-width="200">
          <template slot-scope="scope">
            <el-tag
              v-for="(allergen, index) in scope.row.allergens"
              :key="index"
              :type="getAllergenTagType(allergen)"
              size="small"
              style="margin-right: 5px;"
            >
              {{ allergen }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="severity" label="过敏程度" width="100" align="center">
          <template slot-scope="scope">
            <el-tag :type="getSeverityType(scope.row.severity)" size="small">
              {{ getSeverityText(scope.row.severity) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="symptoms" label="过敏症状" min-width="150" />
        <el-table-column prop="emergencyContact" label="紧急联系人" width="120" />
        <el-table-column prop="emergencyPhone" label="联系电话" width="130" />
        <el-table-column prop="notes" label="备注" min-width="120" />
        <el-table-column label="操作" width="150" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="editAllergyProfile(scope.row)">编辑</el-button>
            <el-button type="text" size="small" @click="matchRecipe(scope.row)">食谱匹配</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          background
          layout="total, prev, pager, next"
          :total="allergyStudentTotal"
          :page-size="pageSize"
          :current-page="currentPage"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <!-- 食谱上传表单弹窗 -->
    <el-dialog title="食谱上传" :visible.sync="recipeDialogVisible" width="600px">
      <el-form :model="recipeForm" label-width="100px">
        <el-form-item label="日期">
          <el-date-picker v-model="recipeForm.date" type="date" placeholder="选择日期" value-format="yyyy-MM-dd" />
        </el-form-item>
        <el-form-item label="餐次">
          <el-select v-model="recipeForm.mealType" placeholder="选择餐次">
            <el-option label="早餐" value="breakfast" />
            <el-option label="午餐" value="lunch" />
            <el-option label="晚餐" value="dinner" />
          </el-select>
        </el-form-item>
        <el-form-item label="菜品名称">
          <el-input v-model="recipeForm.dishName" placeholder="请输入菜品名称" />
        </el-form-item>
        <el-form-item label="主要食材">
          <el-input v-model="recipeForm.ingredients" placeholder="请输入主要食材" />
        </el-form-item>
        <el-form-item label="过敏原标注">
          <el-checkbox-group v-model="recipeForm.allergens">
            <el-checkbox v-for="item in allergenList" :key="item.id" :label="item.name">
              {{ item.name }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="营养信息">
          <el-row :gutter="10">
            <el-col :span="6">
              <el-input v-model="recipeForm.calories" placeholder="热量(kcal)" />
            </el-col>
            <el-col :span="6">
              <el-input v-model="recipeForm.protein" placeholder="蛋白质(g)" />
            </el-col>
            <el-col :span="6">
              <el-input v-model="recipeForm.carbs" placeholder="碳水(g)" />
            </el-col>
            <el-col :span="6">
              <el-input v-model="recipeForm.fat" placeholder="脂肪(g)" />
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="recipeForm.remark" type="textarea" :rows="2" placeholder="请输入备注信息" />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="recipeDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitRecipe">保存</el-button>
      </span>
    </el-dialog>

    <!-- 食谱匹配结果弹窗 -->
    <el-dialog title="食谱过敏匹配分析" :visible.sync="matchDialogVisible" width="700px">
      <div class="match-result" v-if="currentMatchStudent">
        <el-alert
          :title="`学生 ${currentMatchStudent.studentName} 的过敏原匹配分析`"
          type="info"
          :closable="false"
          show-icon
          style="margin-bottom: 20px;"
        />
        <el-table :data="matchResults" border stripe>
          <el-table-column prop="date" label="日期" width="120" />
          <el-table-column prop="meal" label="餐次" width="80" />
          <el-table-column prop="dish" label="菜品" width="150" />
          <el-table-column prop="allergens" label="含过敏原" min-width="150">
            <template slot-scope="scope">
              <el-tag v-for="(a, i) in scope.row.allergens" :key="i" type="danger" size="small" style="margin-right: 5px;">
                {{ a }}
              </el-tag>
              <span v-if="scope.row.allergens.length === 0" style="color: #52c41a;">无过敏原</span>
            </template>
          </el-table-column>
          <el-table-column prop="matchStatus" label="匹配状态" width="100" align="center">
            <template slot-scope="scope">
              <el-tag :type="scope.row.matchStatus === 'safe' ? 'success' : 'danger'" size="small">
                {{ scope.row.matchStatus === 'safe' ? '安全' : '禁忌' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="suggestion" label="建议" min-width="150" />
        </el-table>
      </div>
      <span slot="footer">
        <el-button @click="matchDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="notifyKitchen">通知食堂</el-button>
      </span>
    </el-dialog>

    <!-- 编辑过敏档案弹窗 -->
    <el-dialog title="编辑过敏档案" :visible.sync="allergyProfileDialogVisible" width="500px">
      <el-form :model="allergyProfileForm" label-width="100px">
        <el-form-item label="学生姓名">
          <el-input v-model="allergyProfileForm.studentName" disabled />
        </el-form-item>
        <el-form-item label="班级">
          <el-input v-model="allergyProfileForm.className" disabled />
        </el-form-item>
        <el-form-item label="过敏原">
          <el-checkbox-group v-model="allergyProfileForm.allergens">
            <el-checkbox v-for="item in allergenList" :key="item.id" :label="item.name">
              {{ item.name }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="过敏程度">
          <el-select v-model="allergyProfileForm.severity" placeholder="选择过敏程度">
            <el-option label="轻度" value="mild" />
            <el-option label="中度" value="moderate" />
            <el-option label="重度" value="severe" />
          </el-select>
        </el-form-item>
        <el-form-item label="过敏症状">
          <el-input v-model="allergyProfileForm.symptoms" placeholder="请输入过敏症状" />
        </el-form-item>
        <el-form-item label="紧急联系人">
          <el-input v-model="allergyProfileForm.emergencyContact" placeholder="请输入紧急联系人" />
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="allergyProfileForm.emergencyPhone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="allergyProfileForm.notes" type="textarea" :rows="2" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="allergyProfileDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveAllergyProfile">保存</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'RecipeManage',
  data() {
    return {
      selectedWeek: new Date(),
      filterAllergen: '',
      searchStudent: '',
      currentPage: 1,
      pageSize: 10,
      allergyStudentTotal: 0,
      allergyStudentCount: 12,
      recipeDialogVisible: false,
      matchDialogVisible: false,
      allergyProfileDialogVisible: false,
      currentMatchStudent: null,
      weekRangeText: '2024年6月3日 - 2024年6月7日',
      allergenList: [
        { id: 1, name: '坚果类', type: 'danger', icon: 'el-icon-apple' },
        { id: 2, name: '海鲜类', type: 'warning', icon: 'el-icon-fish' },
        { id: 3, name: '乳制品', type: 'info', icon: 'el-icon-milk-cup' },
        { id: 4, name: '蛋类', type: 'warning', icon: 'el-icon-egg' },
        { id: 5, name: '小麦/麸质', type: 'info', icon: 'el-icon-grain' },
        { id: 6, name: '大豆', type: 'info', icon: 'el-icon-seedling' },
        { id: 7, name: '花生', type: 'danger', icon: 'el-icon-seed' }
      ],
      weekRecipes: [
        {
          dayName: '周一',
          date: '06/03',
          breakfast: [
            { name: '牛奶', allergens: ['乳制品'] },
            { name: '鸡蛋饼', allergens: ['蛋类', '小麦/麸质'] },
            { name: '小米粥', allergens: [] }
          ],
          lunch: [
            { name: '红烧鸡腿', allergens: [] },
            { name: '清炒西兰花', allergens: [] },
            { name: '米饭', allergens: [] }
          ],
          dinner: [
            { name: '番茄蛋汤', allergens: ['蛋类'] },
            { name: '馒头', allergens: ['小麦/麸质'] }
          ]
        },
        {
          dayName: '周二',
          date: '06/04',
          breakfast: [
            { name: '豆浆', allergens: ['大豆'] },
            { name: '包子', allergens: ['小麦/麸质'] }
          ],
          lunch: [
            { name: '清蒸鱼', allergens: ['海鲜类'] },
            { name: '炒青菜', allergens: [] },
            { name: '米饭', allergens: [] }
          ],
          dinner: [
            { name: '肉末豆腐', allergens: ['大豆'] },
            { name: '面条', allergens: ['小麦/麸质'] }
          ]
        },
        {
          dayName: '周三',
          date: '06/05',
          breakfast: [
            { name: '酸奶', allergens: ['乳制品'] },
            { name: '面包', allergens: ['小麦/麸质', '蛋类'] },
            { name: '花生酱', allergens: ['花生'] }
          ],
          lunch: [
            { name: '糖醋排骨', allergens: [] },
            { name: '凉拌黄瓜', allergens: [] },
            { name: '米饭', allergens: [] }
          ],
          dinner: [
            { name: '紫菜蛋花汤', allergens: ['海鲜类', '蛋类'] },
            { name: '花卷', allergens: ['小麦/麸质'] }
          ]
        },
        {
          dayName: '周四',
          date: '06/06',
          breakfast: [
            { name: '牛奶', allergens: ['乳制品'] },
            { name: '煎蛋', allergens: ['蛋类'] },
            { name: '燕麦粥', allergens: ['小麦/麸质'] }
          ],
          lunch: [
            { name: '宫保鸡丁', allergens: ['花生'] },
            { name: '炒豆芽', allergens: ['大豆'] },
            { name: '米饭', allergens: [] }
          ],
          dinner: [
            { name: '馄饨', allergens: ['小麦/麸质', '蛋类'] },
            { name: '水果沙拉', allergens: ['坚果类'] }
          ]
        },
        {
          dayName: '周五',
          date: '06/07',
          breakfast: [
            { name: '豆浆', allergens: ['大豆'] },
            { name: '油条', allergens: ['小麦/麸质'] },
            { name: '煮鸡蛋', allergens: ['蛋类'] }
          ],
          lunch: [
            { name: '红烧肉', allergens: [] },
            { name: '炒菠菜', allergens: [] },
            { name: '米饭', allergens: [] }
          ],
          dinner: [
            { name: '海鲜粥', allergens: ['海鲜类'] },
            { name: '蛋糕', allergens: ['蛋类', '乳制品', '小麦/麸质'] }
          ]
        }
      ],
      allergyStudents: [
        { id: 1, studentName: '张小明', className: '一年级1班', allergens: ['坚果类', '花生'], severity: 'severe', symptoms: '呼吸困难、皮疹', emergencyContact: '张父', emergencyPhone: '13800138001', notes: '需随身携带抗过敏药' },
        { id: 2, studentName: '李小红', className: '一年级2班', allergens: ['海鲜类'], severity: 'moderate', symptoms: '皮疹、腹泻', emergencyContact: '李母', emergencyPhone: '13800138002', notes: '' },
        { id: 3, studentName: '王小华', className: '二年级1班', allergens: ['乳制品'], severity: 'mild', symptoms: '轻微腹泻', emergencyContact: '王父', emergencyPhone: '13800138003', notes: '可少量饮用' },
        { id: 4, studentName: '赵小刚', className: '二年级2班', allergens: ['蛋类', '小麦/麸质'], severity: 'moderate', symptoms: '皮疹、呕吐', emergencyContact: '赵母', emergencyPhone: '13800138004', notes: '' },
        { id: 5, studentName: '刘小芳', className: '三年级1班', allergens: ['大豆'], severity: 'mild', symptoms: '轻微不适', emergencyContact: '刘父', emergencyPhone: '13800138005', notes: '' },
        { id: 6, studentName: '陈小强', className: '三年级2班', allergens: ['花生', '坚果类'], severity: 'severe', symptoms: '严重过敏反应', emergencyContact: '陈母', emergencyPhone: '13800138006', notes: '严禁接触' }
      ],
      recipeForm: {
        date: '',
        mealType: '',
        dishName: '',
        ingredients: '',
        allergens: [],
        calories: '',
        protein: '',
        carbs: '',
        fat: '',
        remark: ''
      },
      allergyProfileForm: {
        studentName: '',
        className: '',
        allergens: [],
        severity: '',
        symptoms: '',
        emergencyContact: '',
        emergencyPhone: '',
        notes: ''
      },
      matchResults: []
    };
  },
  computed: {
    filteredAllergyStudents() {
      let list = this.allergyStudents;
      
      if (this.filterAllergen) {
        const allergenName = this.allergenList.find(a => a.id === this.filterAllergen)?.name;
        list = list.filter(item => item.allergens.includes(allergenName));
      }
      
      if (this.searchStudent) {
        list = list.filter(item => item.studentName.includes(this.searchStudent));
      }
      
      this.allergyStudentTotal = list.length;
      return list;
    }
  },
  methods: {
    handleWeekChange() {
      this.$message.success('周数据已更新');
    },
    showAddRecipeDialog() {
      this.recipeForm = {
        date: '',
        mealType: '',
        dishName: '',
        ingredients: '',
        allergens: [],
        calories: '',
        protein: '',
        carbs: '',
        fat: '',
        remark: ''
      };
      this.recipeDialogVisible = true;
    },
    editMeal(day, mealType) {
      this.recipeForm = {
        date: day.date,
        mealType: mealType,
        dishName: '',
        ingredients: '',
        allergens: [],
        calories: '',
        protein: '',
        carbs: '',
        fat: '',
        remark: ''
      };
      this.recipeDialogVisible = true;
    },
    submitRecipe() {
      if (!this.recipeForm.dishName) {
        this.$message.warning('请输入菜品名称');
        return;
      }
      this.$message.success('食谱保存成功');
      this.recipeDialogVisible = false;
    },
    exportRecipe() {
      this.$message.success('食谱导出成功');
    },
    showAddAllergenDialog() {
      this.$prompt('请输入过敏原名称', '新增过敏原', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /\S+/,
        inputErrorMessage: '过敏原名称不能为空'
      }).then(({ value }) => {
        this.allergenList.push({
          id: this.allergenList.length + 1,
          name: value,
          type: 'info',
          icon: 'el-icon-warning'
        });
        this.$message.success('过敏原添加成功');
      }).catch(() => {});
    },
    removeAllergen(allergen) {
      const index = this.allergenList.findIndex(a => a.id === allergen.id);
      if (index > -1) {
        this.allergenList.splice(index, 1);
        this.$message.success('过敏原已删除');
      }
    },
    getAllergenTagType(allergen) {
      const item = this.allergenList.find(a => a.name === allergen);
      return item ? item.type : 'info';
    },
    getSeverityType(severity) {
      const map = {
        mild: 'success',
        moderate: 'warning',
        severe: 'danger'
      };
      return map[severity] || 'info';
    },
    getSeverityText(severity) {
      const map = {
        mild: '轻度',
        moderate: '中度',
        severe: '重度'
      };
      return map[severity] || '未知';
    },
    editAllergyProfile(row) {
      this.allergyProfileForm = {
        studentName: row.studentName,
        className: row.className,
        allergens: [...row.allergens],
        severity: row.severity,
        symptoms: row.symptoms,
        emergencyContact: row.emergencyContact,
        emergencyPhone: row.emergencyPhone,
        notes: row.notes
      };
      this.allergyProfileDialogVisible = true;
    },
    saveAllergyProfile() {
      this.$message.success('过敏档案保存成功');
      this.allergyProfileDialogVisible = false;
    },
    matchRecipe(row) {
      this.currentMatchStudent = row;
      this.matchResults = [];
      
      // 模拟匹配分析
      this.weekRecipes.forEach(day => {
        const meals = [
          { type: 'breakfast', items: day.breakfast },
          { type: 'lunch', items: day.lunch },
          { type: 'dinner', items: day.dinner }
        ];
        
        meals.forEach(meal => {
          meal.items.forEach(item => {
            const matchedAllergens = item.allergens.filter(a => row.allergens.includes(a));
            this.matchResults.push({
              date: day.date,
              meal: meal.type === 'breakfast' ? '早餐' : meal.type === 'lunch' ? '午餐' : '晚餐',
              dish: item.name,
              allergens: matchedAllergens,
              matchStatus: matchedAllergens.length > 0 ? 'danger' : 'safe',
              suggestion: matchedAllergens.length > 0 ? `建议替换为不含${matchedAllergens.join(',')}的菜品` : '可正常食用'
            });
          });
        });
      });
      
      this.matchDialogVisible = true;
    },
    notifyKitchen() {
      this.$message.success('已通知食堂注意过敏学生饮食');
      this.matchDialogVisible = false;
    },
    handlePageChange(page) {
      this.currentPage = page;
    }
  }
};
</script>

<style scoped>
.recipe-manage {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
  color: #303133;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.allergy-alert-section {
  margin-bottom: 20px;
}

.week-selector {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
}

.week-range {
  font-size: 14px;
  color: #606266;
}

.recipe-calendar {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.calendar-header {
  display: flex;
  border-bottom: 1px solid #ebeef5;
}

.calendar-cell {
  padding: 15px;
  border-right: 1px solid #ebeef5;
  flex: 1;
}

.header-cell {
  background: #f5f7fa;
  font-weight: 500;
  color: #303133;
  text-align: center;
}

.calendar-body {
  padding: 0;
}

.calendar-row {
  display: flex;
  border-bottom: 1px solid #ebeef5;
}

.calendar-row:last-child {
  border-bottom: none;
}

.date-cell {
  flex: 0 0 100px;
  background: #fafafa;
}

.date-info {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.day-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.date-text {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.meal-cell {
  min-height: 100px;
}

.meal-content {
  padding: 10px;
  cursor: pointer;
}

.meal-item {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 8px;
}

.meal-item span {
  font-size: 13px;
  color: #606266;
}

.allergen-section,
.allergy-student-section {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.section-header h3 {
  margin: 0;
  font-size: 16px;
  color: #303133;
}

.filter-group {
  display: flex;
  gap: 10px;
}

.allergen-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.allergen-tags .el-tag {
  padding: 8px 15px;
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.match-result {
  padding: 10px 0;
}
</style>