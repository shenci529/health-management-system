<template>
  <div class="exercise-knowledge-manage">
    <div class="search-bar">
      <el-input v-model="searchTitle" placeholder="知识标题" style="width: 200px;"></el-input>
      <el-select v-model="searchCategory" placeholder="分类" clearable style="width: 150px;">
        <el-option label="运动技巧" value="运动技巧"></el-option>
        <el-option label="健康知识" value="健康知识"></el-option>
        <el-option label="营养饮食" value="营养饮食"></el-option>
        <el-option label="损伤预防" value="损伤预防"></el-option>
      </el-select>
      <div class="search-btns">
        <el-button type="primary" icon="el-icon-search" @click="handleSearch">查询</el-button>
        <el-button type="success" icon="el-icon-plus" @click="handleAdd">新增</el-button>
      </div>
    </div>

    <div class="table-container">
      <el-table :data="pagedData" border style="width: 100%">
        <el-table-column type="index" label="序号" width="70"></el-table-column>
        <el-table-column prop="title" label="知识标题" min-width="200"></el-table-column>
        <el-table-column prop="category" label="分类" width="120">
          <template slot-scope="scope">
            <el-tag size="small" :type="getCategoryType(scope.row.category)">{{ scope.row.category }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="author" label="作者" width="100"></el-table-column>
        <el-table-column prop="publishTime" label="发布时间" width="180"></el-table-column>
        <el-table-column prop="viewCount" label="浏览量" width="100"></el-table-column>
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
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="700px" @close="resetDialogForm">
      <el-form :model="dialogForm" :rules="dialogRules" ref="dialogForm" label-width="100px">
        <el-form-item label="知识标题" prop="title">
          <el-input v-model="dialogForm.title" placeholder="请输入知识标题"></el-input>
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select v-model="dialogForm.category" placeholder="请选择分类" style="width: 100%;">
            <el-option label="运动技巧" value="运动技巧"></el-option>
            <el-option label="健康知识" value="健康知识"></el-option>
            <el-option label="营养饮食" value="营养饮食"></el-option>
            <el-option label="损伤预防" value="损伤预防"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="作者" prop="author">
          <el-input v-model="dialogForm.author" placeholder="请输入作者"></el-input>
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input type="textarea" v-model="dialogForm.content" :rows="6" placeholder="请输入知识内容"></el-input>
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
  name: 'ExerciseKnowledgeManage',
  data() {
    return {
      searchTitle: '',
      searchCategory: '',
      currentPage: 1,
      pageSize: 10,
      dialogVisible: false,
      dialogTitle: '新增知识',
      isEdit: false,
      editRow: null,
      dialogForm: {
        title: '',
        category: '',
        author: '',
        content: ''
      },
      dialogRules: {
        title: [{ required: true, message: '请输入知识标题', trigger: 'blur' }],
        category: [{ required: true, message: '请选择分类', trigger: 'change' }],
        content: [{ required: true, message: '请输入内容', trigger: 'blur' }]
      },
      tableData: [
        { id: 1, title: '如何正确进行热身运动', category: '运动技巧', author: '张教练', publishTime: '2024-03-15 09:00:00', viewCount: 1250 },
        { id: 2, title: '运动后的拉伸方法', category: '运动技巧', author: '李教练', publishTime: '2024-03-16 10:30:00', viewCount: 980 },
        { id: 3, title: '青少年营养搭配指南', category: '营养饮食', author: '王营养师', publishTime: '2024-03-18 14:00:00', viewCount: 1560 },
        { id: 4, title: '常见运动损伤及预防', category: '损伤预防', author: '刘医生', publishTime: '2024-03-20 11:00:00', viewCount: 2100 }
      ]
    };
  },
  computed: {
    filteredData() {
      return this.tableData.filter(item => {
        const matchTitle = !this.searchTitle || item.title.includes(this.searchTitle);
        const matchCategory = !this.searchCategory || item.category === this.searchCategory;
        return matchTitle && matchCategory;
      });
    },
    pagedData() {
      const start = (this.currentPage - 1) * this.pageSize;
      return this.filteredData.slice(start, start + this.pageSize);
    }
  },
  methods: {
    getCategoryType(category) {
      const map = {
        '运动技巧': 'primary',
        '健康知识': 'success',
        '营养饮食': 'warning',
        '损伤预防': 'danger'
      };
      return map[category] || 'info';
    },
    handleSearch() {
      this.currentPage = 1;
      this.$message.success('查询完成，共找到 ' + this.filteredData.length + ' 条记录');
    },
    handleAdd() {
      this.isEdit = false;
      this.editRow = null;
      this.dialogTitle = '新增知识';
      this.dialogForm = { title: '', category: '', author: '', content: '' };
      this.dialogVisible = true;
    },
    handleEdit(row) {
      this.isEdit = true;
      this.editRow = row;
      this.dialogTitle = '编辑知识';
      this.dialogForm = { title: row.title, category: row.category, author: row.author, content: row.content || '' };
      this.dialogVisible = true;
    },
    handleSubmit() {
      this.$refs.dialogForm.validate((valid) => {
        if (valid) {
          if (this.isEdit && this.editRow) {
            this.editRow.title = this.dialogForm.title;
            this.editRow.category = this.dialogForm.category;
            this.editRow.author = this.dialogForm.author;
            this.editRow.content = this.dialogForm.content;
            this.$message.success('知识内容已更新');
          } else {
            this.tableData.push({
              id: this.tableData.length + 1,
              title: this.dialogForm.title,
              category: this.dialogForm.category,
              author: this.dialogForm.author,
              content: this.dialogForm.content,
              publishTime: new Date().toLocaleString(),
              viewCount: 0
            });
            this.$message.success('知识发布成功');
          }
          this.dialogVisible = false;
        }
      });
    },
    resetDialogForm() {
      this.dialogForm = { title: '', category: '', author: '', content: '' };
      if (this.$refs.dialogForm) {
        this.$refs.dialogForm.resetFields();
      }
    },
    handleDelete(row) {
      this.$confirm('确定要删除知识 ' + row.title + ' 吗？', '提示', {
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
.exercise-knowledge-manage {
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
