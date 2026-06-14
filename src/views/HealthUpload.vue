<template>
  <div class="health-upload">
    <div class="upload-form">
      <h3 style="text-align: center; margin-bottom: 20px;"><i class="el-icon-upload2"></i> 身体信息上传</h3>
      <el-form :model="form" :rules="formRules" ref="uploadForm" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="选择人员" prop="userId">
              <el-select v-model="form.userId" placeholder="请选择人员" style="width: 100%;" @change="handlePersonChange">
                <el-option
                  v-for="user in userList"
                  :key="user.id"
                  :label="user.username"
                  :value="user.id">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="日期" prop="date">
              <el-date-picker
                v-model="form.date"
                type="date"
                placeholder="选择日期"
                value-format="yyyy-MM-dd"
                style="width: 100%;">
              </el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="身高(m)">
              <el-input-number v-model="form.height" :min="0" :step="0.01" :precision="2" style="width: 100%;"></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="体重(kg)">
              <el-input-number v-model="form.weight" :min="0" :step="0.1" :precision="1" style="width: 100%;"></el-input-number>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="血压">
              <el-input v-model="form.bloodPressure" placeholder="如：120/80"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="心率(BPM)">
              <el-input-number v-model="form.heartRate" :min="0" style="width: 100%;"></el-input-number>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="视力(度)">
              <el-input-number v-model="form.vision" :min="0" style="width: 100%;"></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="血糖(mmol/L)">
              <el-input-number v-model="form.bloodSugar" :min="0" :step="0.1" :precision="1" style="width: 100%;"></el-input-number>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="胆固醇">
              <el-input-number v-model="form.cholesterol" :min="0" :step="0.1" :precision="1" style="width: 100%;"></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="睡眠状态">
              <el-select v-model="form.sleepStatus" placeholder="请选择" style="width: 100%;">
                <el-option label="好" value="好"></el-option>
                <el-option label="一般" value="一般"></el-option>
                <el-option label="差" value="差"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="是否吸烟">
              <el-radio-group v-model="form.smoke">
                <el-radio :label="true">是</el-radio>
                <el-radio :label="false">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否饮酒">
              <el-radio-group v-model="form.drink">
                <el-radio :label="true">是</el-radio>
                <el-radio :label="false">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item>
          <el-button type="primary" @click="handleUpload" style="width: 150px;" v-if="!editingRecordId">
            <i class="el-icon-upload2"></i> 点击上传
          </el-button>
          <el-button type="warning" @click="handleSaveEdit" style="width: 150px;" v-else>
            <i class="el-icon-check"></i> 保存修改
          </el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button v-if="editingRecordId" @click="cancelEdit" type="info">取消编辑</el-button>
        </el-form-item>
      </el-form>

      <!-- 已上传记录列表 -->
      <div v-if="allRecords.length > 0" style="margin-top: 30px;">
        <h4 style="margin-bottom: 15px;"><i class="el-icon-tickets"></i> 所有上传记录</h4>
        <el-table :data="allRecords" border style="width: 100%;" size="small">
          <el-table-column label="用户名" width="100">
            <template slot-scope="scope">
              {{ getUserName(scope.row.userId) }}
            </template>
          </el-table-column>
          <el-table-column prop="date" label="日期" width="120"></el-table-column>
          <el-table-column prop="height" label="身高(m)" width="90"></el-table-column>
          <el-table-column prop="weight" label="体重(kg)" width="90"></el-table-column>
          <el-table-column prop="heartRate" label="心率" width="80"></el-table-column>
          <el-table-column prop="vision" label="视力(度)" width="90"></el-table-column>
          <el-table-column prop="bloodPressure" label="血压" width="100"></el-table-column>
          <el-table-column prop="bloodSugar" label="血糖" width="90"></el-table-column>
          <el-table-column prop="sleepStatus" label="睡眠" width="70"></el-table-column>
          <el-table-column label="操作" width="150">
            <template slot-scope="scope">
              <el-button type="primary" size="mini" @click="handleEditRecord(scope.row)">修改</el-button>
              <el-button type="danger" size="mini" @click="handleDeleteRecord(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script>
import store from '@/store.js';
import { NotificationStore } from '@/permission';

export default {
  name: 'HealthUpload',
  data() {
    return {
      form: {
        userId: '',
        date: '',
        height: 0,
        weight: 0,
        bloodPressure: '',
        heartRate: 0,
        vision: 0,
        bloodSugar: 0,
        cholesterol: 0,
        sleepStatus: '一般',
        smoke: false,
        drink: false
      },
      formRules: {
        userId: [
          { required: true, message: '请选择人员', trigger: 'change' }
        ],
        date: [
          { required: true, message: '请选择日期', trigger: 'change' }
        ]
      },
      editingRecordId: null
    };
  },
  computed: {
    userList() {
      return store.getUserList();
    },
    allRecords() {
      return store.healthRecords.slice().sort((a, b) => b.date.localeCompare(a.date));
    }
  },
  methods: {
    getCurrentUser() {
      try {
        const raw = localStorage.getItem('userInfo');
        return raw ? JSON.parse(raw) : null;
      } catch { return null; }
    },
    getUserName(userId) {
      const user = store.getUserById(userId);
      return user ? user.username : '未知';
    },
    handleEditRecord(row) {
      this.form = {
        userId: row.userId,
        date: row.date,
        height: row.height,
        weight: row.weight,
        bloodPressure: row.bloodPressure,
        heartRate: row.heartRate,
        vision: row.vision,
        bloodSugar: row.bloodSugar,
        cholesterol: row.cholesterol,
        sleepStatus: row.sleepStatus,
        smoke: row.smoke,
        drink: row.drink
      };
      this.editingRecordId = row.id;
      this.$message.info('已加载记录到表单，修改后点击"保存修改"');
      // 滚动到顶部表单
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    handleDeleteRecord(row) {
      this.$confirm('确定要删除该条记录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const index = store.healthRecords.findIndex(r => r.id === row.id);
        if (index !== -1) {
          store.healthRecords.splice(index, 1);
        }
        this.$message.success('删除成功');
      }).catch(() => {});
    },
    handlePersonChange() {
      // 切换人员时刷新记录列表
    },
    handleUpload() {
      this.$refs.uploadForm.validate((valid) => {
        if (valid) {
          // 检查是否已有同一天的记录
          const existing = store.getRecordByUserAndDate(this.form.userId, this.form.date);
          if (existing) {
            this.$confirm('该人员在此日期已有记录，是否覆盖？', '提示', {
              confirmButtonText: '覆盖',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(() => {
              Object.assign(existing, {
                height: this.form.height,
                weight: this.form.weight,
                bloodPressure: this.form.bloodPressure,
                heartRate: this.form.heartRate,
                vision: this.form.vision,
                bloodSugar: this.form.bloodSugar,
                cholesterol: this.form.cholesterol,
                sleepStatus: this.form.sleepStatus,
                smoke: this.form.smoke,
                drink: this.form.drink
              });
              this.$message.success('记录已覆盖更新！');
            }).catch(() => {});
            return;
          }

          const userInfo = this.getCurrentUser();
          store.addHealthRecord({
            userId: this.form.userId,
            date: this.form.date,
            height: this.form.height,
            weight: this.form.weight,
            bloodPressure: this.form.bloodPressure,
            heartRate: this.form.heartRate,
            vision: this.form.vision,
            bloodSugar: this.form.bloodSugar,
            cholesterol: this.form.cholesterol,
            sleepStatus: this.form.sleepStatus,
            smoke: this.form.smoke,
            drink: this.form.drink
          });

          // 通知老师：家长/学生上传了健康数据
          NotificationStore.send({
            type: 'health_upload',
            title: '📊 健康数据已上传',
            content: `${userInfo ? userInfo.username : '用户'}于${this.form.date}上传了健康数据（身高${this.form.height}m，体重${this.form.weight}kg），请老师及时查看。`,
            fromRole: userInfo ? userInfo.role : 'parent',
            fromUser: userInfo ? userInfo.username : '用户',
            toRoles: ['teacher', 'admin'],
            link: '/health-upload'
          });

          this.$message.success('上传成功！');
        }
      });
    },
    handleSaveEdit() {
      this.$refs.uploadForm.validate((valid) => {
        if (valid) {
          const record = store.healthRecords.find(r => r.id === this.editingRecordId);
          if (record) {
            record.userId = this.form.userId;
            record.date = this.form.date;
            record.height = this.form.height;
            record.weight = this.form.weight;
            record.bloodPressure = this.form.bloodPressure;
            record.heartRate = this.form.heartRate;
            record.vision = this.form.vision;
            record.bloodSugar = this.form.bloodSugar;
            record.cholesterol = this.form.cholesterol;
            record.sleepStatus = this.form.sleepStatus;
            record.smoke = this.form.smoke;
            record.drink = this.form.drink;
            // 触发响应式更新
            store.healthRecords = store.healthRecords.slice();
            this.$message.success('记录修改成功！');
            this.editingRecordId = null;
          }
        }
      });
    },
    cancelEdit() {
      this.editingRecordId = null;
      this.handleReset();
    },
    handleReset() {
      this.editingRecordId = null;
      this.form = {
        userId: '',
        date: '',
        height: 0,
        weight: 0,
        bloodPressure: '',
        heartRate: 0,
        vision: 0,
        bloodSugar: 0,
        cholesterol: 0,
        sleepStatus: '一般',
        smoke: false,
        drink: false
      };
      if (this.$refs.uploadForm) {
        this.$refs.uploadForm.resetFields();
      }
    }
  }
};
</script>

<style scoped>
.health-upload {
  background: #fff;
  padding: 30px;
  border-radius: 4px;
}

.upload-form {
  max-width: 800px;
  margin: 0 auto;
  background: #f5f5f5;
  padding: 30px;
  border-radius: 4px;
}
</style>
