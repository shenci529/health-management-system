<template>
  <div class="user-health-manage">
    <div class="search-bar">
      <el-select v-model="searchUserId" placeholder="选择用户" clearable style="width: 200px;">
        <el-option
          v-for="user in userList"
          :key="user.id"
          :label="user.username"
          :value="user.id">
        </el-option>
      </el-select>
      <el-date-picker
        v-model="searchDateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        value-format="yyyy-MM-dd">
      </el-date-picker>
      <div class="search-btns">
        <el-button type="primary" icon="el-icon-search" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
    </div>

    <div class="table-container">
      <el-table :data="pagedData" border style="width: 100%">
        <el-table-column type="index" label="序号" width="70"></el-table-column>
        <el-table-column label="用户名" width="100">
          <template slot-scope="scope">
            {{ getUserName(scope.row.userId) }}
          </template>
        </el-table-column>
        <el-table-column prop="date" label="日期" width="120"></el-table-column>
        <el-table-column prop="height" label="身高(m)" width="90"></el-table-column>
        <el-table-column prop="weight" label="体重(kg)" width="90"></el-table-column>
        <el-table-column prop="bmi" label="BMI" width="80">
          <template slot-scope="scope">
            <el-tag :type="getBmiType(scope.row.bmi)" size="small">{{ scope.row.bmi }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="heartRate" label="心率" width="80"></el-table-column>
        <el-table-column prop="vision" label="视力(度)" width="90"></el-table-column>
        <el-table-column prop="bloodPressure" label="血压" width="100"></el-table-column>
        <el-table-column prop="bloodSugar" label="血糖" width="80"></el-table-column>
        <el-table-column prop="sleepStatus" label="睡眠" width="80">
          <template slot-scope="scope">
            <el-tag :type="getSleepType(scope.row.sleepStatus)" size="small">{{ scope.row.sleepStatus }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template slot-scope="scope">
            <div class="action-btns">
              <el-button type="primary" size="mini" icon="el-icon-edit" circle @click="handleEdit(scope.row)" title="编辑"></el-button>
              <el-button type="danger" size="mini" icon="el-icon-delete" circle @click="handleDelete(scope.row)" title="删除"></el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="pagination">
      <el-pagination
        background
        layout="total, prev, pager, next, jumper"
        :total="filteredData.length"
        :page-size="pageSize"
        :current-page.sync="currentPage">
      </el-pagination>
    </div>

    <!-- 编辑对话框 -->
    <el-dialog title="编辑健康记录" :visible.sync="dialogVisible" width="600px" @close="resetDialogForm">
      <el-form :model="dialogForm" :rules="dialogRules" ref="dialogForm" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="身高(m)" prop="height">
              <el-input-number v-model="dialogForm.height" :min="0" :step="0.01" :precision="2" style="width: 100%;"></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="体重(kg)" prop="weight">
              <el-input-number v-model="dialogForm.weight" :min="0" :step="0.1" :precision="1" style="width: 100%;"></el-input-number>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="血压">
              <el-input v-model="dialogForm.bloodPressure" placeholder="如：120/80"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="心率(BPM)">
              <el-input-number v-model="dialogForm.heartRate" :min="0" style="width: 100%;"></el-input-number>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="视力(度)">
              <el-input-number v-model="dialogForm.vision" :min="0" style="width: 100%;"></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="血糖(mmol/L)">
              <el-input-number v-model="dialogForm.bloodSugar" :min="0" :step="0.1" :precision="1" style="width: 100%;"></el-input-number>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="胆固醇">
              <el-input-number v-model="dialogForm.cholesterol" :min="0" :step="0.1" :precision="1" style="width: 100%;"></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="睡眠状态">
              <el-select v-model="dialogForm.sleepStatus" placeholder="请选择" style="width: 100%;">
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
              <el-radio-group v-model="dialogForm.smoke">
                <el-radio :label="true">是</el-radio>
                <el-radio :label="false">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否饮酒">
              <el-radio-group v-model="dialogForm.drink">
                <el-radio :label="true">是</el-radio>
                <el-radio :label="false">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleSubmit">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import store from '@/store.js';

export default {
  name: 'UserHealthManage',
  data() {
    return {
      searchUserId: '',
      searchDateRange: [],
      currentPage: 1,
      pageSize: 10,
      dialogVisible: false,
      editRow: null,
      dialogForm: {
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
      dialogRules: {}
    };
  },
  computed: {
    userList() {
      return store.getUserList();
    },
    allRecords() {
      return store.healthRecords.map(record => {
        const bmi = record.height && record.weight 
          ? (record.weight / (record.height * record.height)).toFixed(1)
          : '-';
        return { ...record, bmi };
      }).sort((a, b) => b.date.localeCompare(a.date));
    },
    filteredData() {
      return this.allRecords.filter(item => {
        const matchUser = !this.searchUserId || item.userId === this.searchUserId;
        let matchDate = true;
        if (this.searchDateRange && this.searchDateRange.length === 2) {
          matchDate = item.date >= this.searchDateRange[0] && item.date <= this.searchDateRange[1];
        }
        return matchUser && matchDate;
      });
    },
    pagedData() {
      const start = (this.currentPage - 1) * this.pageSize;
      return this.filteredData.slice(start, start + this.pageSize);
    }
  },
  methods: {
    getUserName(userId) {
      const user = store.getUserById(userId);
      return user ? user.username : '未知';
    },
    getBmiType(bmi) {
      if (bmi === '-') return 'info';
      const val = parseFloat(bmi);
      if (val < 18.5) return 'warning';
      if (val < 24) return 'success';
      if (val < 28) return 'warning';
      return 'danger';
    },
    getSleepType(status) {
      const map = { '好': 'success', '一般': 'warning', '差': 'danger' };
      return map[status] || 'info';
    },
    handleSearch() {
      this.currentPage = 1;
      this.$message.success('查询完成，共找到 ' + this.filteredData.length + ' 条记录');
    },
    handleReset() {
      this.searchUserId = '';
      this.searchDateRange = [];
      this.currentPage = 1;
      this.$message.success('已重置查询条件');
    },
    handleEdit(row) {
      this.editRow = row;
      this.dialogForm = {
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
      this.dialogVisible = true;
    },
    handleSubmit() {
      if (this.editRow) {
        const record = store.healthRecords.find(r => r.id === this.editRow.id);
        if (record) {
          record.height = this.dialogForm.height;
          record.weight = this.dialogForm.weight;
          record.bloodPressure = this.dialogForm.bloodPressure;
          record.heartRate = this.dialogForm.heartRate;
          record.vision = this.dialogForm.vision;
          record.bloodSugar = this.dialogForm.bloodSugar;
          record.cholesterol = this.dialogForm.cholesterol;
          record.sleepStatus = this.dialogForm.sleepStatus;
          record.smoke = this.dialogForm.smoke;
          record.drink = this.dialogForm.drink;
          store.healthRecords = store.healthRecords.slice();
          this.$message.success('健康记录已更新');
          this.dialogVisible = false;
        }
      }
    },
    resetDialogForm() {
      this.dialogForm = {
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
    },
    handleDelete(row) {
      this.$confirm('确定要删除该条健康记录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const index = store.healthRecords.findIndex(r => r.id === row.id);
        if (index !== -1) {
          store.healthRecords.splice(index, 1);
          store.healthRecords = store.healthRecords.slice();
        }
        this.$message.success('删除成功');
      }).catch(() => {});
    }
  }
};
</script>

<style scoped>
.user-health-manage {
  background: #fff;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.search-bar {
  margin-bottom: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 6px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}

.search-bar .el-select,
.search-bar .el-date-editor {
  margin-right: 0;
}

.search-btns {
  display: flex;
  gap: 8px;
}

.table-container {
  margin-bottom: 20px;
  border-radius: 6px;
  overflow: hidden;
}

.action-btns {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.action-btns .el-button {
  transition: all 0.3s;
}

.action-btns .el-button:hover {
  transform: scale(1.1);
}

.pagination {
  display: flex;
  justify-content: flex-end;
  padding-top: 10px;
}

/* 表格样式优化 */
.el-table {
  border-radius: 6px;
  overflow: hidden;
}

.el-table th {
  background-color: #f5f7fa !important;
  color: #606266;
  font-weight: 600;
}

.el-table td {
  padding: 12px 0;
}
</style>
