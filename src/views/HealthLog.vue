<template>
  <div class="health-log">
    <el-card>
      <div slot="header" class="clearfix">
        <span style="font-size: 16px; font-weight: bold;"><i class="el-icon-document"></i> 个人健康日志</span>
        <el-button style="float: right;" type="success" size="small" @click="handleAddLog">
          <i class="el-icon-plus"></i> 添加日志
        </el-button>
      </div>
      
      <el-tabs v-model="activeTab" @tab-click="handleTabChange">
        <el-tab-pane label="饮食记录" name="diet">
          <div v-if="dietLogs.length === 0" class="empty-state">
            <p>暂无饮食记录</p>
          </div>
          <div v-else class="log-list">
            <div v-for="(log, index) in dietLogs" :key="index" class="log-item">
              <div class="log-header">
                <span class="log-date">{{ log.date }}</span>
                <el-tag size="small" type="success">饮食</el-tag>
              </div>
              <div class="log-content">{{ log.content }}</div>
              <div class="log-actions">
                <el-button size="small" type="text" @click="handleEdit(log, 'diet', index)">编辑</el-button>
                <el-button size="small" type="text" @click="handleDelete(index, 'diet')">删除</el-button>
              </div>
            </div>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="运动记录" name="exercise">
          <div v-if="exerciseLogs.length === 0" class="empty-state">
            <p>暂无运动记录</p>
          </div>
          <div v-else class="log-list">
            <div v-for="(log, index) in exerciseLogs" :key="index" class="log-item">
              <div class="log-header">
                <span class="log-date">{{ log.date }}</span>
                <el-tag size="small" type="primary">运动</el-tag>
              </div>
              <div class="log-content">{{ log.content }}</div>
              <div class="log-actions">
                <el-button size="small" type="text" @click="handleEdit(log, 'exercise', index)">编辑</el-button>
                <el-button size="small" type="text" @click="handleDelete(index, 'exercise')">删除</el-button>
              </div>
            </div>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="睡眠记录" name="sleep">
          <div v-if="sleepLogs.length === 0" class="empty-state">
            <p>暂无睡眠记录</p>
          </div>
          <div v-else class="log-list">
            <div v-for="(log, index) in sleepLogs" :key="index" class="log-item">
              <div class="log-header">
                <span class="log-date">{{ log.date }}</span>
                <el-tag size="small" type="warning">睡眠</el-tag>
              </div>
              <div class="log-content">{{ log.content }}</div>
              <div class="log-actions">
                <el-button size="small" type="text" @click="handleEdit(log, 'sleep', index)">编辑</el-button>
                <el-button size="small" type="text" @click="handleDelete(index, 'sleep')">删除</el-button>
              </div>
            </div>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="其他笔记" name="note">
          <div v-if="noteLogs.length === 0" class="empty-state">
            <p>暂无其他笔记</p>
          </div>
          <div v-else class="log-list">
            <div v-for="(log, index) in noteLogs" :key="index" class="log-item">
              <div class="log-header">
                <span class="log-date">{{ log.date }}</span>
                <el-tag size="small">笔记</el-tag>
              </div>
              <div class="log-content">{{ log.content }}</div>
              <div class="log-actions">
                <el-button size="small" type="text" @click="handleEdit(log, 'note', index)">编辑</el-button>
                <el-button size="small" type="text" @click="handleDelete(index, 'note')">删除</el-button>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 新增/编辑日志对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="480px" @close="resetDialogForm">
      <el-form :model="dialogForm" :rules="dialogRules" ref="dialogForm" label-width="80px">
        <el-form-item label="日期" prop="date">
          <el-date-picker
            v-model="dialogForm.date"
            type="date"
            placeholder="选择日期"
            value-format="yyyy-MM-dd"
            style="width: 100%;">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input
            type="textarea"
            v-model="dialogForm.content"
            placeholder="请输入日志内容"
            :rows="4">
          </el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleSubmit">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'HealthLog',
  data() {
    return {
      activeTab: 'diet',
      dialogVisible: false,
      dialogTitle: '添加日志',
      isEdit: false,
      editType: '',
      editIndex: -1,
      dialogForm: {
        date: '',
        content: ''
      },
      dialogRules: {
        date: [
          { required: true, message: '请选择日期', trigger: 'change' }
        ],
        content: [
          { required: true, message: '请输入日志内容', trigger: 'blur' }
        ]
      },
      dietLogs: [
        { date: '2024-04-22', content: '早餐：牛奶+面包\n午餐：米饭+青菜+鸡肉\n晚餐：面条+蔬菜汤' },
        { date: '2024-04-21', content: '早餐：粥+鸡蛋\n午餐：饺子\n晚餐：米饭+红烧肉+青菜' }
      ],
      exerciseLogs: [
        { date: '2024-04-22', content: '慢跑30分钟，感觉良好' },
        { date: '2024-04-20', content: '游泳1小时，消耗卡路里约400大卡' }
      ],
      sleepLogs: [
        { date: '2024-04-22', content: '睡眠时长：8小时，睡眠质量良好' },
        { date: '2024-04-21', content: '睡眠时长：7.5小时，有轻微失眠' }
      ],
      noteLogs: [
        { date: '2024-04-22', content: '今天感觉精神状态不错，要继续保持' },
        { date: '2024-04-20', content: '喝水2000ml，达标！' }
      ],
      currentType: 'diet'
    };
  },
  methods: {
    handleTabChange(tab) {
      this.currentType = tab.name;
    },
    handleAddLog() {
      this.isEdit = false;
      this.editType = '';
      this.editIndex = -1;
      this.dialogTitle = '添加' + this.getTypeName(this.currentType) + '日志';
      this.dialogForm = { date: '', content: '' };
      this.dialogVisible = true;
    },
    handleEdit(log, type, index) {
      this.isEdit = true;
      this.editType = type;
      this.editIndex = index;
      this.dialogTitle = '编辑日志';
      this.dialogForm = { date: log.date, content: log.content };
      this.dialogVisible = true;
    },
    handleSubmit() {
      this.$refs.dialogForm.validate((valid) => {
        if (valid) {
          if (this.isEdit) {
            const list = this.getLogList(this.editType);
            list[this.editIndex].date = this.dialogForm.date;
            list[this.editIndex].content = this.dialogForm.content;
            this.$message.success('日志更新成功');
          } else {
            const newLog = {
              date: this.dialogForm.date,
              content: this.dialogForm.content
            };
            this.getLogList(this.currentType).unshift(newLog);
            this.$message.success('日志添加成功');
          }
          this.dialogVisible = false;
        }
      });
    },
    resetDialogForm() {
      this.dialogForm = { date: '', content: '' };
      if (this.$refs.dialogForm) {
        this.$refs.dialogForm.resetFields();
      }
    },
    handleDelete(index, type) {
      this.$confirm('确定要删除这条日志吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.getLogList(type).splice(index, 1);
        this.$message.success('删除成功');
      }).catch(() => {
        this.$message.info('取消删除');
      });
    },
    getTypeName(type) {
      const map = { diet: '饮食', exercise: '运动', sleep: '睡眠', note: '笔记' };
      return map[type] || '';
    },
    getLogList(type) {
      const map = {
        diet: this.dietLogs,
        exercise: this.exerciseLogs,
        sleep: this.sleepLogs,
        note: this.noteLogs
      };
      return map[type];
    }
  }
};
</script>

<style scoped>
.health-log {
  padding: 20px;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #999;
}

.log-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.log-item {
  background: #f5f5f5;
  padding: 15px;
  border-radius: 4px;
  border-left: 3px solid #4CAF50;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.log-date {
  font-size: 14px;
  color: #666;
}

.log-content {
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-line;
  margin-bottom: 10px;
}

.log-actions {
  display: flex;
  gap: 10px;
}
</style>
