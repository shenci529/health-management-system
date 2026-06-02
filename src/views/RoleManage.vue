<template>
  <div class="role-manage">
    <div class="search-bar">
      <el-input v-model="searchName" placeholder="角色名称" style="width: 200px;"></el-input>
      <div class="search-btns">
        <el-button type="primary" icon="el-icon-search" @click="handleSearch">查询</el-button>
        <el-button type="success" icon="el-icon-plus" @click="handleAdd">新增</el-button>
      </div>
    </div>

    <div class="table-container">
      <el-table :data="pagedData" border style="width: 100%">
        <el-table-column type="index" label="序号" width="70"></el-table-column>
        <el-table-column prop="id" label="角色ID" width="80"></el-table-column>
        <el-table-column prop="name" label="角色名称" width="150"></el-table-column>
        <el-table-column prop="description" label="角色描述" min-width="200"></el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180"></el-table-column>
        <el-table-column label="操作" width="120" align="center">
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
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="500px" @close="resetDialogForm">
      <el-form :model="dialogForm" :rules="dialogRules" ref="dialogForm" label-width="100px">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="dialogForm.name" placeholder="请输入角色名称"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="description">
          <el-input type="textarea" v-model="dialogForm.description" :rows="3" placeholder="请输入角色描述"></el-input>
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
  name: 'RoleManage',
  data() {
    return {
      searchName: '',
      currentPage: 1,
      pageSize: 10,
      dialogVisible: false,
      dialogTitle: '新增角色',
      isEdit: false,
      editRow: null,
      dialogForm: {
        name: '',
        description: ''
      },
      dialogRules: {
        name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }]
      },
      tableData: [
        { id: 1, name: '系统管理员', description: '拥有系统所有权限', createTime: '2024-01-15 10:30:00' },
        { id: 2, name: '健康管理员', description: '管理用户健康数据和评估', createTime: '2024-01-15 10:35:00' },
        { id: 3, name: '普通用户', description: '查看个人健康信息', createTime: '2024-01-15 10:40:00' }
      ]
    };
  },
  computed: {
    filteredData() {
      return this.tableData.filter(item => {
        return !this.searchName || item.name.includes(this.searchName);
      });
    },
    pagedData() {
      const start = (this.currentPage - 1) * this.pageSize;
      return this.filteredData.slice(start, start + this.pageSize);
    }
  },
  methods: {
    handleSearch() {
      this.currentPage = 1;
      this.$message.success('查询完成，共找到 ' + this.filteredData.length + ' 条记录');
    },
    handleAdd() {
      this.isEdit = false;
      this.editRow = null;
      this.dialogTitle = '新增角色';
      this.dialogForm = { name: '', description: '' };
      this.dialogVisible = true;
    },
    handleEdit(row) {
      this.isEdit = true;
      this.editRow = row;
      this.dialogTitle = '编辑角色';
      this.dialogForm = { name: row.name, description: row.description };
      this.dialogVisible = true;
    },
    handleSubmit() {
      this.$refs.dialogForm.validate((valid) => {
        if (valid) {
          if (this.isEdit && this.editRow) {
            this.editRow.name = this.dialogForm.name;
            this.editRow.description = this.dialogForm.description;
            this.$message.success('角色信息已更新');
          } else {
            this.tableData.push({
              id: this.tableData.length + 1,
              name: this.dialogForm.name,
              description: this.dialogForm.description,
              createTime: new Date().toLocaleString()
            });
            this.$message.success('角色创建成功');
          }
          this.dialogVisible = false;
        }
      });
    },
    resetDialogForm() {
      this.dialogForm = { name: '', description: '' };
      if (this.$refs.dialogForm) {
        this.$refs.dialogForm.resetFields();
      }
    },
    handleDelete(row) {
      this.$confirm('确定要删除角色 ' + row.name + ' 吗？', '提示', {
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
.role-manage {
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

.search-bar .el-input {
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
