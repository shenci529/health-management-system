<template>
  <div class="task-publish">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="title">
        <i class="el-icon-circle-plus"></i>
        发布打卡任务
      </h1>
      <p class="subtitle">创建健康打卡任务，督促学生养成良好习惯</p>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <div class="stats-card">
        <div class="stats-icon blue">
          <i class="el-icon-document"></i>
        </div>
        <div class="stats-info">
          <div class="stats-value">{{ activeTasksCount }}</div>
          <div class="stats-label">进行中任务</div>
        </div>
      </div>
      <div class="stats-card">
        <div class="stats-icon green">
          <i class="el-icon-check"></i>
        </div>
        <div class="stats-info">
          <div class="stats-value">{{ completedTasksCount }}</div>
          <div class="stats-label">已完成任务</div>
        </div>
      </div>
      <div class="stats-card">
        <div class="stats-icon orange">
          <i class="el-icon-collection-tag"></i>
        </div>
        <div class="stats-info">
          <div class="stats-value">{{ templateCount }}</div>
          <div class="stats-label">任务模板</div>
        </div>
      </div>
    </div>

    <!-- 创建任务表单 -->
    <div class="create-section">
      <div class="section-header">
        <h2>
          <i class="el-icon-edit"></i>
          创建新任务
        </h2>
      </div>

      <el-form :model="taskForm" :rules="rules" ref="taskForm" label-width="100px" class="task-form">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="任务名称" prop="taskName">
              <el-input v-model="taskForm.taskName" placeholder="请输入任务名称"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="任务类型" prop="taskType">
              <el-select v-model="taskForm.taskType" placeholder="请选择任务类型" style="width: 100%">
                <el-option label="健康打卡" value="health">
                  <i class="el-icon-first-aid-kit" style="color: #67C23A; margin-right: 5px;"></i>健康打卡
                </el-option>
                <el-option label="劳动打卡" value="labor">
                  <i class="el-icon-brush" style="color: #E6A23C; margin-right: 5px;"></i>劳动打卡
                </el-option>
                <el-option label="运动打卡" value="exercise">
                  <i class="el-icon-basketball" style="color: #409EFF; margin-right: 5px;"></i>运动打卡
                </el-option>
                <el-option label="阅读打卡" value="reading">
                  <i class="el-icon-reading" style="color: #909399; margin-right: 5px;"></i>阅读打卡
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="开始时间" prop="startTime">
              <el-date-picker
                v-model="taskForm.startTime"
                type="datetime"
                placeholder="选择开始时间"
                style="width: 100%">
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="截止时间" prop="endTime">
              <el-date-picker
                v-model="taskForm.endTime"
                type="datetime"
                placeholder="选择截止时间"
                style="width: 100%">
              </el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="任务下发" prop="targetType">
          <el-radio-group v-model="taskForm.targetType">
            <el-radio-button label="all">全班</el-radio-button>
            <el-radio-button label="group">分组</el-radio-button>
            <el-radio-button label="individual">指定学生</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="选择对象" prop="targets" v-if="taskForm.targetType !== 'all'">
          <el-select 
            v-model="taskForm.targets" 
            multiple 
            filterable 
            :placeholder="targetPlaceholder" 
            style="width: 100%">
            <el-option
              v-for="item in targetOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="任务描述" prop="description">
          <el-input
            type="textarea"
            :rows="3"
            v-model="taskForm.description"
            placeholder="请描述任务要求和注意事项">
          </el-input>
        </el-form-item>

        <el-form-item label="提醒设置">
          <el-checkbox-group v-model="taskForm.reminders">
            <el-checkbox label="start">任务开始时提醒</el-checkbox>
            <el-checkbox label="daily">每日提醒</el-checkbox>
            <el-checkbox label="end">截止前提醒</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" icon="el-icon-plus" @click="submitTask">发布任务</el-button>
          <el-button icon="el-icon-refresh" @click="resetForm">重置</el-button>
          <el-button icon="el-icon-collection-tag" @click="saveAsTemplate">保存为模板</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 任务模板管理 -->
    <div class="template-section">
      <div class="section-header">
        <h2>
          <i class="el-icon-collection-tag"></i>
          任务模板
        </h2>
      </div>

      <div class="template-grid">
        <div 
          v-for="template in taskTemplates" 
          :key="template.id" 
          class="template-card"
          @click="useTemplate(template)">
          <div class="template-icon" :class="template.type">
            <i :class="getTemplateIcon(template.type)"></i>
          </div>
          <div class="template-info">
            <h3>{{ template.name }}</h3>
            <p>{{ template.description }}</p>
            <div class="template-meta">
              <span class="template-type">{{ getTypeText(template.type) }}</span>
              <span class="template-count">使用 {{ template.useCount }} 次</span>
            </div>
          </div>
          <div class="template-actions">
            <el-button type="text" icon="el-icon-delete" @click.stop="deleteTemplate(template)"></el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 任务列表 -->
    <div class="task-list-section">
      <div class="section-header">
        <h2>
          <i class="el-icon-document-copy"></i>
          任务列表
        </h2>
        <div class="section-actions">
          <el-radio-group v-model="taskFilter" size="small">
            <el-radio-button label="all">全部</el-radio-button>
            <el-radio-button label="active">进行中</el-radio-button>
            <el-radio-button label="completed">已完成</el-radio-button>
          </el-radio-group>
        </div>
      </div>

      <el-table :data="filteredTasks" style="width: 100%" border>
        <el-table-column prop="taskName" label="任务名称" min-width="150">
          <template slot-scope="scope">
            <span class="task-name">{{ scope.row.taskName }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="taskType" label="任务类型" width="120">
          <template slot-scope="scope">
            <el-tag :type="getTypeTag(scope.row.taskType)" size="small">
              {{ getTypeText(scope.row.taskType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="targetType" label="下发对象" width="120">
          <template slot-scope="scope">
            {{ getTargetText(scope.row.targetType) }}
          </template>
        </el-table-column>
        <el-table-column prop="startTime" label="开始时间" width="150">
          <template slot-scope="scope">
            {{ formatDateTime(scope.row.startTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="endTime" label="截止时间" width="150">
          <template slot-scope="scope">
            {{ formatDateTime(scope.row.endTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="getStatusTag(scope.row.status)" effect="dark" size="small">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="完成进度" width="150">
          <template slot-scope="scope">
            <el-progress 
              :percentage="scope.row.progress" 
              :color="getProgressColor(scope.row.progress)"
              :stroke-width="8">
            </el-progress>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" icon="el-icon-view" @click="viewTask(scope.row)">查看</el-button>
            <el-button size="mini" type="warning" icon="el-icon-bell" @click="remindTask(scope.row)">提醒</el-button>
            <el-button size="mini" type="danger" icon="el-icon-delete" @click="deleteTask(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TaskPublish',
  data() {
    return {
      taskForm: {
        taskName: '',
        taskType: '',
        startTime: new Date(),
        endTime: '',
        targetType: 'all',
        targets: [],
        description: '',
        reminders: ['start', 'daily']
      },
      rules: {
        taskName: [{ required: true, message: '请输入任务名称', trigger: 'blur' }],
        taskType: [{ required: true, message: '请选择任务类型', trigger: 'change' }],
        startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
        endTime: [{ required: true, message: '请选择截止时间', trigger: 'change' }],
        description: [{ required: true, message: '请填写任务描述', trigger: 'blur' }]
      },
      studentList: [
        { id: 1, name: '张三' },
        { id: 2, name: '李四' },
        { id: 3, name: '王五' },
        { id: 4, name: '赵六' },
        { id: 5, name: '钱七' }
      ],
      groupList: [
        { id: 'g1', name: '第一组' },
        { id: 'g2', name: '第二组' },
        { id: 'g3', name: '第三组' },
        { id: 'g4', name: '第四组' }
      ],
      taskTemplates: [
        {
          id: 1,
          name: '每日健康打卡',
          type: 'health',
          description: '记录每日体温、精神状态和身体状况',
          useCount: 25
        },
        {
          id: 2,
          name: '周末劳动任务',
          type: 'labor',
          description: '完成一项家务劳动并拍照记录',
          useCount: 18
        },
        {
          id: 3,
          name: '每日运动打卡',
          type: 'exercise',
          description: '完成30分钟户外运动',
          useCount: 30
        },
        {
          id: 4,
          name: '睡前阅读',
          type: 'reading',
          description: '每日睡前阅读30分钟',
          useCount: 22
        }
      ],
      taskList: [
        {
          id: 1,
          taskName: '本周健康打卡',
          taskType: 'health',
          targetType: 'all',
          targets: [],
          startTime: '2024-01-15 00:00:00',
          endTime: '2024-01-21 23:59:59',
          status: 'active',
          progress: 75
        },
        {
          id: 2,
          taskName: '周末大扫除',
          taskType: 'labor',
          targetType: 'all',
          targets: [],
          startTime: '2024-01-13 00:00:00',
          endTime: '2024-01-14 23:59:59',
          status: 'completed',
          progress: 100
        },
        {
          id: 3,
          taskName: '寒假阅读计划',
          taskType: 'reading',
          targetType: 'individual',
          targets: [1, 2, 3],
          startTime: '2024-01-20 00:00:00',
          endTime: '2024-02-20 23:59:59',
          status: 'pending',
          progress: 0
        }
      ],
      taskFilter: 'all'
    };
  },
  computed: {
    activeTasksCount() {
      return this.taskList.filter(t => t.status === 'active').length;
    },
    completedTasksCount() {
      return this.taskList.filter(t => t.status === 'completed').length;
    },
    templateCount() {
      return this.taskTemplates.length;
    },
    targetPlaceholder() {
      const map = {
        group: '请选择分组',
        individual: '请选择学生'
      };
      return map[this.taskForm.targetType] || '请选择';
    },
    targetOptions() {
      if (this.taskForm.targetType === 'group') {
        return this.groupList;
      } else if (this.taskForm.targetType === 'individual') {
        return this.studentList;
      }
      return [];
    },
    filteredTasks() {
      if (this.taskFilter === 'all') {
        return this.taskList;
      }
      return this.taskList.filter(t => t.status === this.taskFilter);
    }
  },
  methods: {
    submitTask() {
      this.$refs.taskForm.validate(valid => {
        if (valid) {
          const newTask = {
            id: Date.now(),
            ...this.taskForm,
            startTime: this.taskForm.startTime.toISOString(),
            endTime: this.taskForm.endTime.toISOString(),
            status: 'active',
            progress: 0
          };
          this.taskList.unshift(newTask);
          this.$message.success('任务发布成功！');
          this.resetForm();
        }
      });
    },
    resetForm() {
      this.$refs.taskForm.resetFields();
      this.taskForm.startTime = new Date();
      this.taskForm.reminders = ['start', 'daily'];
    },
    saveAsTemplate() {
      if (!this.taskForm.taskName || !this.taskForm.taskType) {
        this.$message.warning('请先填写任务名称和类型');
        return;
      }
      const newTemplate = {
        id: Date.now(),
        name: this.taskForm.taskName,
        type: this.taskForm.taskType,
        description: this.taskForm.description || '暂无描述',
        useCount: 0
      };
      this.taskTemplates.push(newTemplate);
      this.$message.success('模板保存成功！');
    },
    useTemplate(template) {
      this.taskForm.taskName = template.name;
      this.taskForm.taskType = template.type;
      this.taskForm.description = template.description;
      this.$message.success('已加载模板，请完善其他信息后发布');
    },
    deleteTemplate(template) {
      this.$confirm('确定删除该模板吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const index = this.taskTemplates.findIndex(t => t.id === template.id);
        if (index > -1) {
          this.taskTemplates.splice(index, 1);
          this.$message.success('删除成功！');
        }
      });
    },
    viewTask(task) {
      this.$message.info(`查看任务: ${task.taskName}`);
    },
    remindTask(task) {
      this.$message.success(`已向学生发送任务提醒: ${task.taskName}`);
    },
    deleteTask(task) {
      this.$confirm('确定删除该任务吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const index = this.taskList.findIndex(t => t.id === task.id);
        if (index > -1) {
          this.taskList.splice(index, 1);
          this.$message.success('删除成功！');
        }
      });
    },
    formatDateTime(datetime) {
      if (!datetime) return '';
      const d = new Date(datetime);
      return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    },
    getTypeTag(type) {
      const typeMap = {
        health: 'success',
        labor: 'warning',
        exercise: 'primary',
        reading: 'info'
      };
      return typeMap[type] || 'info';
    },
    getTypeText(type) {
      const typeMap = {
        health: '健康打卡',
        labor: '劳动打卡',
        exercise: '运动打卡',
        reading: '阅读打卡'
      };
      return typeMap[type] || type;
    },
    getTargetText(targetType) {
      const targetMap = {
        all: '全班',
        group: '分组',
        individual: '指定学生'
      };
      return targetMap[targetType] || targetType;
    },
    getStatusTag(status) {
      const statusMap = {
        pending: 'info',
        active: 'primary',
        completed: 'success'
      };
      return statusMap[status] || 'info';
    },
    getStatusText(status) {
      const statusMap = {
        pending: '待开始',
        active: '进行中',
        completed: '已完成'
      };
      return statusMap[status] || status;
    },
    getProgressColor(progress) {
      if (progress < 30) return '#F56C6C';
      if (progress < 70) return '#E6A23C';
      return '#67C23A';
    },
    getTemplateIcon(type) {
      const iconMap = {
        health: 'el-icon-first-aid-kit',
        labor: 'el-icon-brush',
        exercise: 'el-icon-basketball',
        reading: 'el-icon-reading'
      };
      return iconMap[type] || 'el-icon-document';
    }
  }
};
</script>

<style scoped>
.task-publish {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

/* 页面标题 */
.page-header {
  text-align: center;
  margin-bottom: 25px;
}

.title {
  font-size: 28px;
  color: #409EFF;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.title i {
  font-size: 32px;
}

.subtitle {
  color: #888;
  font-size: 16px;
  margin-top: 8px;
}

/* 统计卡片 */
.stats-cards {
  display: flex;
  gap: 20px;
  margin-bottom: 25px;
}

.stats-card {
  flex: 1;
  background: #fff;
  border-radius: 15px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.stats-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: #fff;
}

.stats-icon.blue {
  background: linear-gradient(135deg, #409EFF 0%, #6BCBFF 100%);
}

.stats-icon.green {
  background: linear-gradient(135deg, #67C23A 0%, #95D475 100%);
}

.stats-icon.orange {
  background: linear-gradient(135deg, #E6A23C 0%, #F5C878 100%);
}

.stats-value {
  font-size: 28px;
  font-weight: bold;
  color: #333;
}

.stats-label {
  font-size: 14px;
  color: #888;
}

/* 区块标题 */
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
  color: #409EFF;
}

.section-actions {
  display: flex;
  align-items: center;
}

/* 区块样式 */
.create-section,
.template-section,
.task-list-section {
  background: #fff;
  border-radius: 15px;
  padding: 25px;
  margin-bottom: 25px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

.task-form {
  margin-top: 20px;
}

/* 模板网格 */
.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.template-card {
  background: #f9f9f9;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: flex-start;
  gap: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.template-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #409EFF;
}

.template-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #fff;
  flex-shrink: 0;
}

.template-icon.health {
  background: linear-gradient(135deg, #67C23A 0%, #95D475 100%);
}

.template-icon.labor {
  background: linear-gradient(135deg, #E6A23C 0%, #F5C878 100%);
}

.template-icon.exercise {
  background: linear-gradient(135deg, #409EFF 0%, #6BCBFF 100%);
}

.template-icon.reading {
  background: linear-gradient(135deg, #909399 0%, #C0C4CC 100%);
}

.template-info {
  flex: 1;
}

.template-info h3 {
  font-size: 16px;
  color: #333;
  margin: 0 0 8px;
}

.template-info p {
  font-size: 13px;
  color: #888;
  margin: 0 0 10px;
  line-height: 1.4;
}

.template-meta {
  display: flex;
  gap: 10px;
}

.template-type {
  font-size: 12px;
  color: #409EFF;
  background: #E3F2FD;
  padding: 2px 8px;
  border-radius: 10px;
}

.template-count {
  font-size: 12px;
  color: #888;
}

/* 任务名称 */
.task-name {
  font-weight: 500;
  color: #333;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .task-publish {
    padding: 15px;
  }

  .title {
    font-size: 22px;
  }

  .stats-cards {
    flex-direction: column;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .template-grid {
    grid-template-columns: 1fr;
  }
}
</style>
