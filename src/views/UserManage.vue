<template>
  <div class="user-manage">
    <div class="search-bar">
      <el-input v-model="searchUser" placeholder="用户名" style="width: 200px;"></el-input>
      <el-input v-model="searchPhone" placeholder="手机号" style="width: 200px;"></el-input>
      <div class="search-btns">
        <el-button type="primary" icon="el-icon-search" @click="handleSearch">查询</el-button>
        <el-button type="success" icon="el-icon-plus" @click="handleAdd">新增</el-button>
      </div>
    </div>
    <div class="table-container">
      <el-table :data="pagedData" border style="width: 100%">
        <el-table-column type="index" label="序号" width="70"></el-table-column>
        <el-table-column prop="id" label="用户ID" width="80"></el-table-column>
        <el-table-column prop="username" label="用户名" width="120"></el-table-column>
        <el-table-column prop="gender" label="性别" width="70"></el-table-column>
        <el-table-column prop="age" label="年龄" width="70"></el-table-column>
        <el-table-column prop="phone" label="电话" width="140"></el-table-column>
        <el-table-column label="操作" width="150" align="center">
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
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="480px" @close="resetDialogForm">
      <el-form :model="dialogForm" :rules="dialogRules" ref="dialogForm" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="dialogForm.username" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="dialogForm.gender">
            <el-radio label="男">男</el-radio>
            <el-radio label="女">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="年龄" prop="age">
          <el-input-number v-model="dialogForm.age" :min="1" :max="100" style="width: 100%;"></el-input-number>
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="dialogForm.phone" placeholder="请输入电话号码"></el-input>
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
import store from '@/store.js';

export default {
  name: 'UserManage',
  data() {
    return {
      searchUser: '',
      searchPhone: '',
      currentPage: 1,
      pageSize: 10,
      dialogVisible: false,
      dialogTitle: '新增用户',
      isEdit: false,
      editRow: null,
      dialogForm: {
        username: '',
        gender: '男',
        age: 18,
        phone: ''
      },
      dialogRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        gender: [
          { required: true, message: '请选择性别', trigger: 'change' }
        ],
        age: [
          { required: true, message: '请输入年龄', trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请输入电话号码', trigger: 'blur' }
        ]
      }
    };
  },
  computed: {
    tableData() {
      return store.getUserList();
    },
    filteredData() {
      return this.tableData.filter(item => {
        const matchUser = !this.searchUser || item.username.includes(this.searchUser);
        const matchPhone = !this.searchPhone || item.phone.includes(this.searchPhone);
        return matchUser && matchPhone;
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
      const count = this.filteredData.length;
      if (count > 0) {
        this.$message.success('查询成功，共找到 ' + count + ' 条记录');
      } else {
        this.$message.warning('未找到匹配的记录');
      }
    },
    handleAdd() {
      this.isEdit = false;
      this.editRow = null;
      this.dialogTitle = '新增用户';
      this.dialogForm = { username: '', gender: '男', age: 18, phone: '' };
      this.dialogVisible = true;
    },
    handleEdit(row) {
      this.isEdit = true;
      this.editRow = row;
      this.dialogTitle = '编辑用户';
      this.dialogForm = { username: row.username, gender: row.gender, age: row.age, phone: row.phone };
      this.dialogVisible = true;
    },
    handleSubmit() {
      this.$refs.dialogForm.validate((valid) => {
        if (valid) {
          if (this.isEdit && this.editRow) {
            store.updateUser(this.editRow.id, {
              username: this.dialogForm.username,
              gender: this.dialogForm.gender,
              age: this.dialogForm.age,
              phone: this.dialogForm.phone
            });
            this.$message.success('用户信息已更新');
          } else {
            store.addUser({
              username: this.dialogForm.username,
              gender: this.dialogForm.gender,
              age: this.dialogForm.age,
              phone: this.dialogForm.phone
            });
            this.$message.success('用户创建成功');
          }
          this.dialogVisible = false;
        }
      });
    },
    resetDialogForm() {
      this.dialogForm = { username: '', gender: '男', age: 18, phone: '' };
      if (this.$refs.dialogForm) {
        this.$refs.dialogForm.resetFields();
      }
    },
    handleDelete(row) {
      this.$confirm('确定要删除用户 ' + row.username + ' 吗？删除后该用户的健康记录也会被清除。', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        store.deleteUser(row.id);
        this.$message.success('删除成功');
      }).catch(() => {
        this.$message.info('取消删除');
      });
    }
  }
};
</script>

<style scoped>
.user-manage {
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

/* 性别标签样式 */
:deep(.el-table .cell) {
  white-space: nowrap;
}
</style>
