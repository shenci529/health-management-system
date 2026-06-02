<template>
  <div class="exercise-detail-manage">
    <div class="search-bar">
      <el-input v-model="searchName" placeholder="运动名称" style="width: 200px;"></el-input>
      <el-select v-model="searchType" placeholder="运动类型" style="width: 150px;">
        <el-option label="全部" value=""></el-option>
        <el-option label="有氧运动" value="有氧运动"></el-option>
        <el-option label="力量训练" value="力量训练"></el-option>
        <el-option label="柔韧性" value="柔韧性"></el-option>
        <el-option label="球类运动" value="球类运动"></el-option>
      </el-select>
      <div class="search-btns">
        <el-button type="primary" icon="el-icon-search" @click="handleSearch">查询</el-button>
        <el-button type="success" icon="el-icon-plus" @click="handleAdd">新增</el-button>
      </div>
    </div>

    <div class="table-container">
      <el-table :data="pagedData" border style="width: 100%">
        <el-table-column type="index" label="序号" width="70"></el-table-column>
        <el-table-column prop="name" label="运动名称" width="120"></el-table-column>
        <el-table-column prop="type" label="运动类型" width="100">
          <template slot-scope="scope">
            <el-tag size="small" :type="getTypeTag(scope.row.type)">{{ scope.row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="duration" label="适宜时间(分钟)" width="120"></el-table-column>
        <el-table-column prop="heartRate" label="适宜心率" width="140"></el-table-column>
        <el-table-column prop="frequency" label="适宜频率" width="120"></el-table-column>
        <el-table-column prop="intensity" label="推荐强度" width="100"></el-table-column>
        <el-table-column prop="description" label="详细说明" min-width="200" show-overflow-tooltip></el-table-column>
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

    <!-- 新增/编辑对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="600px" @close="resetDialogForm">
      <el-form :model="dialogForm" :rules="dialogRules" ref="dialogForm" label-width="120px">
        <el-form-item label="运动名称" prop="name">
          <el-input v-model="dialogForm.name" placeholder="请输入运动名称"></el-input>
        </el-form-item>
        <el-form-item label="运动类型" prop="type">
          <el-select v-model="dialogForm.type" placeholder="请选择运动类型" style="width: 100%;">
            <el-option label="有氧运动" value="有氧运动"></el-option>
            <el-option label="力量训练" value="力量训练"></el-option>
            <el-option label="柔韧性" value="柔韧性"></el-option>
            <el-option label="球类运动" value="球类运动"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="适宜时间" prop="duration">
          <el-input-number v-model="dialogForm.duration" :min="1" :max="300" style="width: 100%;"></el-input-number>
        </el-form-item>
        <el-form-item label="适宜心率" prop="heartRate">
          <el-input v-model="dialogForm.heartRate" placeholder="如：120-140次/分钟"></el-input>
        </el-form-item>
        <el-form-item label="适宜频率" prop="frequency">
          <el-input v-model="dialogForm.frequency" placeholder="如：3-4次/周"></el-input>
        </el-form-item>
        <el-form-item label="推荐强度" prop="intensity">
          <el-input v-model="dialogForm.intensity" placeholder="如：中等强度"></el-input>
        </el-form-item>
        <el-form-item label="详细说明" prop="description">
          <el-input type="textarea" v-model="dialogForm.description" :rows="3" placeholder="请输入详细说明"></el-input>
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
  name: 'ExerciseDetailManage',
  data() {
    return {
      searchName: '',
      searchType: '',
      currentPage: 1,
      pageSize: 10,
      dialogVisible: false,
      dialogTitle: '新增运动详情',
      isEdit: false,
      editRow: null,
      dialogForm: {
        name: '',
        type: '',
        duration: 30,
        heartRate: '',
        frequency: '',
        intensity: '',
        description: ''
      },
      dialogRules: {
        name: [{ required: true, message: '请输入运动名称', trigger: 'blur' }],
        type: [{ required: true, message: '请选择运动类型', trigger: 'change' }],
        duration: [{ required: true, message: '请输入适宜时间', trigger: 'blur' }]
      },
      tableData: [
        { id: 1, name: '跑步', type: '有氧运动', duration: 30, heartRate: '120-160次/分钟', frequency: '3-5次/周', intensity: '中等强度', description: '慢跑是最常见的有氧运动，适合各年龄段人群' },
        { id: 2, name: '游泳', type: '有氧运动', duration: 45, heartRate: '110-150次/分钟', frequency: '2-3次/周', intensity: '中等强度', description: '全身性运动，对关节冲击小，适合肥胖人群' },
        { id: 3, name: '瑜伽', type: '柔韧性', duration: 60, heartRate: '80-100次/分钟', frequency: '3-4次/周', intensity: '低强度', description: '提高身体柔韧性，缓解压力，改善睡眠' },
        { id: 4, name: '篮球', type: '球类运动', duration: 60, heartRate: '130-170次/分钟', frequency: '2-3次/周', intensity: '高强度', description: '团队运动，提高协调性和反应能力' },
        { id: 5, name: '力量训练', type: '力量训练', duration: 45, heartRate: '100-140次/分钟', frequency: '3-4次/周', intensity: '中等强度', description: '增强肌肉力量，提高基础代谢率' }
      ]
    };
  },
  computed: {
    filteredData() {
      return this.tableData.filter(item => {
        const matchName = !this.searchName || item.name.includes(this.searchName);
        const matchType = !this.searchType || item.type === this.searchType;
        return matchName && matchType;
      });
    },
    pagedData() {
      const start = (this.currentPage - 1) * this.pageSize;
      return this.filteredData.slice(start, start + this.pageSize);
    }
  },
  methods: {
    getTypeTag(type) {
      const map = {
        '有氧运动': 'success',
        '力量训练': 'warning',
        '柔韧性': 'info',
        '球类运动': 'primary'
      };
      return map[type] || '';
    },
    handleSearch() {
      this.currentPage = 1;
      this.$message.success('查询完成，共找到 ' + this.filteredData.length + ' 条记录');
    },
    handleAdd() {
      this.isEdit = false;
      this.editRow = null;
      this.dialogTitle = '新增运动详情';
      this.dialogForm = { name: '', type: '', duration: 30, heartRate: '', frequency: '', intensity: '', description: '' };
      this.dialogVisible = true;
    },
    handleEdit(row) {
      this.isEdit = true;
      this.editRow = row;
      this.dialogTitle = '编辑运动详情';
      this.dialogForm = { ...row };
      this.dialogVisible = true;
    },
    handleSubmit() {
      this.$refs.dialogForm.validate((valid) => {
        if (valid) {
          if (this.isEdit && this.editRow) {
            Object.assign(this.editRow, this.dialogForm);
            this.$message.success('运动详情已更新');
          } else {
            this.tableData.push({
              id: this.tableData.length + 1,
              ...this.dialogForm
            });
            this.$message.success('运动详情添加成功');
          }
          this.dialogVisible = false;
        }
      });
    },
    resetDialogForm() {
      this.dialogForm = { name: '', type: '', duration: 30, heartRate: '', frequency: '', intensity: '', description: '' };
      if (this.$refs.dialogForm) {
        this.$refs.dialogForm.resetFields();
      }
    },
    handleDelete(row) {
      this.$confirm('确定要删除运动详情 ' + row.name + ' 吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const index = this.tableData.indexOf(row);
        if (index !== -1) {
          this.tableData.splice(index, 1);
        }
        this.$message.success('删除成功');
      }).catch(() => {});
    }
  }
};
</script>

<style scoped>
.exercise-detail-manage {
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

.search-bar .el-input,
.search-bar .el-select {
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
