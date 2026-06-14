<template>
  <div class="abnormal-handle">
    <div class="page-header">
      <h1 class="title">
        <i class="el-icon-first-aid-kit"></i>
        异常学生处理
      </h1>
      <p class="subtitle">集中处理异常学生情况，确保校园健康安全</p>
    </div>

    <div class="stats-row">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="stat-card urgent">
            <div class="stat-icon">
              <i class="el-icon-warning"></i>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ urgentCount }}</span>
              <span class="stat-label">需紧急处理</span>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card fever">
            <div class="stat-icon">
              <i class="el-icon-thermometer"></i>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ feverCount }}</span>
              <span class="stat-label">发热学生</span>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card allergy">
            <div class="stat-icon">
              <i class="el-icon-question"></i>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ allergyCount }}</span>
              <span class="stat-label">过敏反应</span>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card other">
            <div class="stat-icon">
              <i class="el-icon-user-solid"></i>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ otherCount }}</span>
              <span class="stat-label">其他不适</span>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <div class="filter-bar">
      <div class="filter-group">
        <span class="filter-label">异常类型：</span>
        <el-radio-group v-model="filterType" size="small">
          <el-radio-button label="all">全部</el-radio-button>
          <el-radio-button label="fever">发热</el-radio-button>
          <el-radio-button label="allergy">过敏</el-radio-button>
          <el-radio-button label="stomach">肠胃不适</el-radio-button>
          <el-radio-button label="injury">外伤</el-radio-button>
          <el-radio-button label="other">其他</el-radio-button>
        </el-radio-group>
      </div>
      <div class="filter-group">
        <span class="filter-label">处理状态：</span>
        <el-select v-model="statusFilter" placeholder="全部状态" size="small">
          <el-option label="待处理" value="pending"></el-option>
          <el-option label="处理中" value="processing"></el-option>
          <el-option label="已完成" value="completed"></el-option>
          <el-option label="已转诊" value="referred"></el-option>
        </el-select>
      </div>
      <div class="filter-group">
        <span class="filter-label">时间范围：</span>
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          size="small">
        </el-date-picker>
      </div>
      <div class="filter-group">
        <el-input
          v-model="searchText"
          placeholder="搜索学生姓名或学号"
          size="small"
          class="search-input">
        </el-input>
        <el-button type="primary" size="small" @click="handleSearch">
          <i class="el-icon-search"></i>
          查询
        </el-button>
      </div>
    </div>

    <div class="table-container">
      <el-table :data="tableData" border stripe :loading="loading">
        <el-table-column type="index" label="序号" width="60"></el-table-column>
        <el-table-column prop="student_name" label="学生姓名" width="100"></el-table-column>
        <el-table-column prop="student_no" label="学号" width="100"></el-table-column>
        <el-table-column prop="class_name" label="班级" width="100"></el-table-column>
        <el-table-column prop="abnormal_type" label="异常类型" width="120">
          <template slot-scope="scope">
            <el-tag :type="getTagType(scope.row.abnormal_type)">{{ getTypeName(scope.row.abnormal_type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="symptoms" label="症状描述" min-width="200"></el-table-column>
        <el-table-column prop="temperature" label="体温" width="80"></el-table-column>
        <el-table-column prop="report_time" label="上报时间" width="150"></el-table-column>
        <el-table-column prop="status" label="处理状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="getStatusType(scope.row.status)">{{ getStatusName(scope.row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template slot-scope="scope">
            <el-button type="text" @click="viewDetail(scope.row)">详情</el-button>
            <el-button type="text" @click="handleAbnormal(scope.row)" v-if="scope.row.status === 'pending'">处理</el-button>
            <el-button type="text" @click="editRecord(scope.row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        class="pagination"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </div>

    <el-dialog title="异常处理" :visible.sync="dialogVisible" width="600px">
      <el-form :model="formData" label-width="100px">
        <el-form-item label="学生信息">
          <span>{{ formData.student_name }} - {{ formData.student_no }}</span>
        </el-form-item>
        <el-form-item label="异常类型">
          <el-tag :type="getTagType(formData.abnormal_type)">{{ getTypeName(formData.abnormal_type) }}</el-tag>
        </el-form-item>
        <el-form-item label="症状描述">
          <span>{{ formData.symptoms }}</span>
        </el-form-item>
        <el-form-item label="处理措施">
          <el-select v-model="formData.handling_measure" placeholder="请选择处理措施">
            <el-option label="送医务室" value="clinic"></el-option>
            <el-option label="通知家长接回" value="notify_parent"></el-option>
            <el-option label="转诊医院" value="referral"></el-option>
            <el-option label="观察留观" value="observation"></el-option>
            <el-option label="其他" value="other"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="处理备注">
          <el-input type="textarea" v-model="formData.remarks" rows="3" placeholder="请输入处理备注"></el-input>
        </el-form-item>
        <el-form-item label="处理人员">
          <span>{{ currentUser }}</span>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitHandle">确认处理</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'AbnormalHandle',
  data() {
    return {
      filterType: 'all',
      statusFilter: '',
      dateRange: '',
      searchText: '',
      loading: false,
      currentPage: 1,
      pageSize: 10,
      total: 0,
      dialogVisible: false,
      currentUser: '李校医',
      currentUserId: 1,
      formData: {},
      urgentCount: 0,
      feverCount: 0,
      allergyCount: 0,
      otherCount: 0,
      tableData: []
    };
  },
  mounted() {
    this.loadData();
    this.loadStats();
  },
  methods: {
    async loadData() {
      this.loading = true;
      try {
        const params = {
          abnormalType: this.filterType === 'all' ? undefined : this.filterType,
          status: this.statusFilter || undefined,
          keyword: this.searchText || undefined
        };
        
        const query = Object.entries(params)
          .filter(([_, v]) => v !== undefined)
          .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
          .join('&');
        
        const res = await fetch(this.$api(`/api/abnormal?${query}`));
        const data = await res.json();
        if (data.success) {
          this.tableData = data.data;
          this.total = data.data.length;
        }
      } catch (error) {
        console.error('加载数据失败:', error);
        this.$message.error('加载数据失败');
      } finally {
        this.loading = false;
      }
    },
    async loadStats() {
      try {
        const res = await fetch(this.$api('/api/abnormal/stats'));
        const data = await res.json();
        if (data.success) {
          this.urgentCount = data.data.urgentCount;
          this.feverCount = data.data.feverCount;
          this.allergyCount = data.data.allergyCount;
          this.otherCount = data.data.otherCount;
        }
      } catch (error) {
        console.error('加载统计失败:', error);
      }
    },
    getTagType(type) {
      const types = { fever: 'danger', allergy: 'warning', stomach: 'info', injury: 'primary', other: 'default' };
      return types[type] || 'default';
    },
    getTypeName(type) {
      const names = { fever: '发热', allergy: '过敏', stomach: '肠胃不适', injury: '外伤', other: '其他' };
      return names[type] || '未知';
    },
    getStatusType(status) {
      const types = { pending: 'danger', processing: 'warning', completed: 'success', referred: 'info' };
      return types[status] || 'default';
    },
    getStatusName(status) {
      const names = { pending: '待处理', processing: '处理中', completed: '已完成', referred: '已转诊' };
      return names[status] || '未知';
    },
    handleSearch() {
      this.loadData();
    },
    handleSizeChange(val) {
      this.pageSize = val;
    },
    handleCurrentChange(val) {
      this.currentPage = val;
    },
    viewDetail(row) {
      this.$alert(`
        <div style="line-height: 1.8;">
          <p><strong>学生姓名：</strong>${row.student_name}</p>
          <p><strong>学号：</strong>${row.student_no}</p>
          <p><strong>班级：</strong>${row.class_name}</p>
          <p><strong>异常类型：</strong>${this.getTypeName(row.abnormal_type)}</p>
          <p><strong>症状：</strong>${row.symptoms}</p>
          <p><strong>体温：</strong>${row.temperature}℃</p>
          <p><strong>上报时间：</strong>${row.report_time}</p>
          <p><strong>处理状态：</strong>${this.getStatusName(row.status)}</p>
          ${row.handling_measure ? `<p><strong>处理措施：</strong>${row.handling_measure}</p>` : ''}
          ${row.remarks ? `<p><strong>备注：</strong>${row.remarks}</p>` : ''}
        </div>
      `, '异常详情', {
        dangerouslyUseHTMLString: true
      });
    },
    handleAbnormal(row) {
      this.formData = { ...row };
      this.dialogVisible = true;
    },
    editRecord(row) {
      this.$message.info('编辑功能请联系管理员');
    },
    async submitHandle() {
      if (!this.formData.handling_measure) {
        this.$message.warning('请选择处理措施');
        return;
      }
      
      try {
        const res = await fetch(this.$api(`/api/abnormal/${this.formData.id}/handle`), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            handling_measure: this.formData.handling_measure,
            remarks: this.formData.remarks,
            handled_by: this.currentUserId
          })
        });
        const data = await res.json();
        if (data.success) {
          this.dialogVisible = false;
          this.$message.success('处理完成');
          this.loadData();
          this.loadStats();
        } else {
          this.$message.error(data.message);
        }
      } catch (error) {
        console.error('处理失败:', error);
        this.$message.error('处理失败');
      }
    }
  }
};
</script>

<style scoped>
.abnormal-handle {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header .title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
}

.page-header .subtitle {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 20px;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.stat-card.urgent { border-left: 4px solid #F56C6C; }
.stat-card.fever { border-left: 4px solid #E6A23C; }
.stat-card.allergy { border-left: 4px solid #909399; }
.stat-card.other { border-left: 4px solid #67C23A; }

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-size: 24px;
}

.stat-card.urgent .stat-icon { background: #fef0f0; color: #F56C6C; }
.stat-card.fever .stat-icon { background: #fdf6ec; color: #E6A23C; }
.stat-card.allergy .stat-icon { background: #f5f5f5; color: #909399; }
.stat-card.other .stat-icon { background: #f0f9eb; color: #67C23A; }

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  display: block;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  padding: 16px 20px;
  background: #fff;
  border-radius: 8px;
  margin-bottom: 20px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-label {
  font-size: 14px;
  color: #606266;
}

.search-input {
  width: 200px;
}

.table-container {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}

.dialog-footer {
  text-align: right;
}
</style>
