<template>
  <div class="class-courseware">
    <div class="page-header">
      <h3>健康班会课件管理</h3>
      <el-button type="primary" icon="el-icon-upload2" @click="handleUpload">上传课件</el-button>
    </div>

    <!-- 分类筛选 -->
    <div class="filter-bar">
      <el-select v-model="filterCategory" placeholder="课件分类" clearable style="width: 150px;">
        <el-option label="护眼教育" value="eye"></el-option>
        <el-option label="防溺水" value="drowning"></el-option>
        <el-option label="禁毒教育" value="drug"></el-option>
        <el-option label="青春期教育" value="puberty"></el-option>
        <el-option label="心理健康" value="mental"></el-option>
        <el-option label="营养健康" value="nutrition"></el-option>
      </el-select>
      <el-select v-model="filterGrade" placeholder="适用年级" clearable style="width: 150px;">
        <el-option label="幼儿园" value="kindergarten"></el-option>
        <el-option label="小学低年级" value="primary_low"></el-option>
        <el-option label="小学高年级" value="primary_high"></el-option>
        <el-option label="初中" value="junior"></el-option>
        <el-option label="高中" value="senior"></el-option>
      </el-select>
      <el-input v-model="searchKeyword" placeholder="搜索课件名称" style="width: 200px;" clearable>
        <el-button slot="append" icon="el-icon-search" @click="handleSearch"></el-button>
      </el-input>
    </div>

    <!-- 课件列表 -->
    <div class="courseware-grid">
      <el-row :gutter="20">
        <el-col :span="6" v-for="item in pagedCourseware" :key="item.id">
          <el-card class="courseware-card" shadow="hover">
            <div class="card-header" :style="{ background: getCategoryColor(item.category) }">
              <i :class="getCategoryIcon(item.category)"></i>
              <span>{{ getCategoryName(item.category) }}</span>
            </div>
            <div class="card-body">
              <h4 class="card-title">{{ item.name }}</h4>
              <p class="card-desc">{{ item.description }}</p>
              <div class="card-meta">
                <span><i class="el-icon-document"></i> {{ item.pages }}页</span>
                <span><i class="el-icon-time"></i> {{ item.duration }}分钟</span>
              </div>
              <div class="card-tags">
                <el-tag size="mini" v-for="tag in item.tags" :key="tag">{{ tag }}</el-tag>
              </div>
            </div>
            <div class="card-footer">
              <span class="download-count"><i class="el-icon-download"></i> {{ item.downloads }}</span>
              <div class="card-actions">
                <el-button type="text" size="small" icon="el-icon-view" @click="handlePreview(item)">预览</el-button>
                <el-button type="text" size="small" icon="el-icon-s-promotion" @click="handleSend(item)">下发</el-button>
                <el-dropdown trigger="click">
                  <el-button type="text" size="small" icon="el-icon-more"></el-button>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item @click.native="handleEdit(item)">编辑</el-dropdown-item>
                    <el-dropdown-item @click.native="handleDelete(item)">删除</el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <div class="pagination">
      <el-pagination background layout="total, prev, pager, next" :total="filteredCourseware.length" :page-size="8" :current-page.sync="currentPage"></el-pagination>
    </div>

    <!-- 上传/编辑课件对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="600px">
      <el-form :model="coursewareForm" :rules="coursewareRules" ref="coursewareForm" label-width="100px">
        <el-form-item label="课件名称" prop="name">
          <el-input v-model="coursewareForm.name" placeholder="请输入课件名称"></el-input>
        </el-form-item>
        <el-form-item label="课件分类" prop="category">
          <el-select v-model="coursewareForm.category" placeholder="请选择分类" style="width: 100%;">
            <el-option label="护眼教育" value="eye"></el-option>
            <el-option label="防溺水" value="drowning"></el-option>
            <el-option label="禁毒教育" value="drug"></el-option>
            <el-option label="青春期教育" value="puberty"></el-option>
            <el-option label="心理健康" value="mental"></el-option>
            <el-option label="营养健康" value="nutrition"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="适用年级" prop="grades">
          <el-checkbox-group v-model="coursewareForm.grades">
            <el-checkbox label="kindergarten">幼儿园</el-checkbox>
            <el-checkbox label="primary_low">小学低年级</el-checkbox>
            <el-checkbox label="primary_high">小学高年级</el-checkbox>
            <el-checkbox label="junior">初中</el-checkbox>
            <el-checkbox label="senior">高中</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="课件描述" prop="description">
          <el-input type="textarea" v-model="coursewareForm.description" :rows="3" placeholder="请输入课件描述"></el-input>
        </el-form-item>
        <el-form-item label="课件文件" prop="file">
          <el-upload
            class="upload-file"
            action="#"
            :auto-upload="false"
            :on-change="handleFileChange"
            :file-list="fileList"
            :limit="1"
            accept=".ppt,.pptx,.pdf">
            <el-button size="small" type="primary">选择文件</el-button>
            <span slot="tip" class="el-upload__tip" style="margin-left: 10px;">支持 PPT/PDF 格式</span>
          </el-upload>
        </el-form-item>
        <el-form-item label="标签">
          <el-tag v-for="tag in coursewareForm.tags" :key="tag" closable @close="removeTag(tag)" style="margin-right: 5px;">{{ tag }}</el-tag>
          <el-input v-if="tagInputVisible" ref="tagInput" v-model="tagInputValue" size="small" style="width: 100px;" @keyup.enter.native="addTag" @blur="addTag"></el-input>
          <el-button v-else size="small" icon="el-icon-plus" @click="showTagInput">添加标签</el-button>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </span>
    </el-dialog>

    <!-- 预览对话框 -->
    <el-dialog title="课件预览" :visible.sync="previewVisible" width="80%" top="5vh">
      <div class="preview-container">
        <div class="preview-placeholder">
          <i class="el-icon-document"></i>
          <p>{{ previewItem ? previewItem.name : '' }}</p>
          <p class="preview-info">共 {{ previewItem ? previewItem.pages : 0 }} 页 | 预计时长 {{ previewItem ? previewItem.duration : 0 }} 分钟</p>
          <el-button type="primary" icon="el-icon-download">下载课件</el-button>
        </div>
      </div>
    </el-dialog>

    <!-- 下发对话框 -->
    <el-dialog title="下发课件到班级" :visible.sync="sendVisible" width="500px">
      <el-form label-width="80px">
        <el-form-item label="课件名称">
          <el-input :value="sendItem ? sendItem.name : ''" disabled></el-input>
        </el-form-item>
        <el-form-item label="选择班级">
          <el-tree
            ref="classTree"
            :data="classTreeData"
            show-checkbox
            node-key="id"
            :default-expanded-keys="['all']"
            :props="{ children: 'children', label: 'label' }">
          </el-tree>
        </el-form-item>
        <el-form-item label="下发说明">
          <el-input type="textarea" :rows="3" v-model="sendNote" placeholder="请输入下发说明（可选）"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="sendVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmSend">确认下发</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'ClassCourseware',
  data() {
    return {
      filterCategory: '',
      filterGrade: '',
      searchKeyword: '',
      currentPage: 1,
      coursewareList: [
        { id: 1, name: '爱护眼睛，预防近视', category: 'eye', description: '通过生动的图片和动画，帮助学生了解眼睛的结构，掌握正确的用眼习惯。', pages: 25, duration: 40, downloads: 156, tags: ['近视防控', '用眼卫生'], grades: ['primary_low', 'primary_high'] },
        { id: 2, name: '珍爱生命，预防溺水', category: 'drowning', description: '夏季防溺水安全教育，包含危险水域识别、自救互救知识。', pages: 30, duration: 45, downloads: 230, tags: ['安全教育', '夏季'], grades: ['kindergarten', 'primary_low', 'primary_high'] },
        { id: 3, name: '远离毒品，健康成长', category: 'drug', description: '禁毒知识普及，认识毒品危害，学会拒绝毒品。', pages: 20, duration: 35, downloads: 89, tags: ['禁毒', '安全教育'], grades: ['junior', 'senior'] },
        { id: 4, name: '青春期的变化', category: 'puberty', description: '帮助青少年正确认识青春期的生理和心理变化。', pages: 35, duration: 50, downloads: 178, tags: ['青春期', '生理卫生'], grades: ['junior'] },
        { id: 5, name: '阳光心态，快乐成长', category: 'mental', description: '心理健康教育，培养积极乐观的心态。', pages: 22, duration: 30, downloads: 145, tags: ['心理健康', '情绪管理'], grades: ['primary_high', 'junior'] },
        { id: 6, name: '均衡营养，健康饮食', category: 'nutrition', description: '营养知识科普，培养健康的饮食习惯。', pages: 18, duration: 25, downloads: 112, tags: ['营养', '饮食健康'], grades: ['kindergarten', 'primary_low'] },
        { id: 7, name: '眼保健操规范教学', category: 'eye', description: '眼保健操的标准动作示范和注意事项。', pages: 15, duration: 20, downloads: 320, tags: ['眼保健操', '护眼'], grades: ['primary_low', 'primary_high', 'junior'] },
        { id: 8, name: '游泳安全知识', category: 'drowning', description: '游泳前的准备、游泳中的注意事项及紧急情况处理。', pages: 28, duration: 40, downloads: 167, tags: ['游泳', '安全'], grades: ['primary_high', 'junior'] },
        { id: 9, name: '认识情绪，管理情绪', category: 'mental', description: '情绪认知与管理技巧，帮助学生建立良好的情绪调节能力。', pages: 24, duration: 35, downloads: 198, tags: ['情绪管理', '心理'], grades: ['primary_high', 'junior', 'senior'] },
        { id: 10, name: '食品安全与健康', category: 'nutrition', description: '食品安全知识，如何辨别不健康食品。', pages: 20, duration: 30, downloads: 134, tags: ['食品安全', '健康'], grades: ['primary_low', 'primary_high'] }
      ],
      dialogVisible: false,
      dialogTitle: '上传课件',
      isEdit: false,
      editItem: null,
      coursewareForm: {
        name: '',
        category: '',
        grades: [],
        description: '',
        file: null,
        tags: []
      },
      coursewareRules: {
        name: [{ required: true, message: '请输入课件名称', trigger: 'blur' }],
        category: [{ required: true, message: '请选择课件分类', trigger: 'change' }],
        grades: [{ required: true, message: '请选择适用年级', trigger: 'change', type: 'array', min: 1 }]
      },
      fileList: [],
      tagInputVisible: false,
      tagInputValue: '',
      previewVisible: false,
      previewItem: null,
      sendVisible: false,
      sendItem: null,
      sendNote: '',
      classTreeData: [
        {
          id: 'all',
          label: '全部班级',
          children: [
            { id: 'grade1', label: '一年级', children: [
              { id: 'class1-1', label: '一年级1班' },
              { id: 'class1-2', label: '一年级2班' },
              { id: 'class1-3', label: '一年级3班' }
            ]},
            { id: 'grade2', label: '二年级', children: [
              { id: 'class2-1', label: '二年级1班' },
              { id: 'class2-2', label: '二年级2班' }
            ]},
            { id: 'grade3', label: '三年级', children: [
              { id: 'class3-1', label: '三年级1班' },
              { id: 'class3-2', label: '三年级2班' }
            ]}
          ]
        }
      ]
    };
  },
  computed: {
    filteredCourseware() {
      return this.coursewareList.filter(item => {
        const matchCategory = !this.filterCategory || item.category === this.filterCategory;
        const matchGrade = !this.filterGrade || item.grades.includes(this.filterGrade);
        const matchKeyword = !this.searchKeyword || item.name.includes(this.searchKeyword);
        return matchCategory && matchGrade && matchKeyword;
      });
    },
    pagedCourseware() {
      const start = (this.currentPage - 1) * 8;
      return this.filteredCourseware.slice(start, start + 8);
    }
  },
  methods: {
    getCategoryName(category) {
      const map = { eye: '护眼教育', drowning: '防溺水', drug: '禁毒教育', puberty: '青春期教育', mental: '心理健康', nutrition: '营养健康' };
      return map[category] || category;
    },
    getCategoryColor(category) {
      const map = { eye: '#409eff', drowning: '#67c23a', drug: '#f56c6c', puberty: '#e6a23c', mental: '#909399', nutrition: '#00bcd4' };
      return map[category] || '#409eff';
    },
    getCategoryIcon(category) {
      const map = { eye: 'el-icon-view', drowning: 'el-icon-help', drug: 'el-icon-warning', puberty: 'el-icon-user', mental: 'el-icon-sunny', nutrition: 'el-icon-food' };
      return map[category] || 'el-icon-document';
    },
    handleSearch() {
      this.currentPage = 1;
      this.$message.success('搜索完成，共找到 ' + this.filteredCourseware.length + ' 个课件');
    },
    handleUpload() {
      this.isEdit = false;
      this.editItem = null;
      this.dialogTitle = '上传课件';
      this.coursewareForm = { name: '', category: '', grades: [], description: '', file: null, tags: [] };
      this.fileList = [];
      this.dialogVisible = true;
    },
    handleEdit(item) {
      this.isEdit = true;
      this.editItem = item;
      this.dialogTitle = '编辑课件';
      this.coursewareForm = { name: item.name, category: item.category, grades: [...item.grades], description: item.description, file: null, tags: [...item.tags] };
      this.dialogVisible = true;
    },
    handleDelete(item) {
      this.$confirm('确定要删除课件 "' + item.name + '" 吗？', '提示', { type: 'warning' }).then(() => {
        const index = this.coursewareList.findIndex(c => c.id === item.id);
        if (index > -1) {
          this.coursewareList.splice(index, 1);
        }
        this.$message.success('删除成功');
      }).catch(() => {});
    },
    handlePreview(item) {
      this.previewItem = item;
      this.previewVisible = true;
    },
    handleSend(item) {
      this.sendItem = item;
      this.sendNote = '';
      this.sendVisible = true;
    },
    confirmSend() {
      const checkedNodes = this.$refs.classTree.getCheckedNodes();
      const classes = checkedNodes.filter(n => !n.children);
      if (classes.length === 0) {
        this.$message.warning('请选择要下发的班级');
        return;
      }
      this.$message.success('课件已成功下发到 ' + classes.length + ' 个班级');
      this.sendVisible = false;
    },
    handleFileChange(file) {
      this.coursewareForm.file = file.raw;
    },
    showTagInput() {
      this.tagInputVisible = true;
      this.$nextTick(() => {
        this.$refs.tagInput.$refs.input.focus();
      });
    },
    addTag() {
      if (this.tagInputValue && !this.coursewareForm.tags.includes(this.tagInputValue)) {
        this.coursewareForm.tags.push(this.tagInputValue);
      }
      this.tagInputVisible = false;
      this.tagInputValue = '';
    },
    removeTag(tag) {
      const index = this.coursewareForm.tags.indexOf(tag);
      if (index > -1) {
        this.coursewareForm.tags.splice(index, 1);
      }
    },
    handleSubmit() {
      this.$refs.coursewareForm.validate((valid) => {
        if (valid) {
          if (this.isEdit && this.editItem) {
            this.editItem.name = this.coursewareForm.name;
            this.editItem.category = this.coursewareForm.category;
            this.editItem.grades = this.coursewareForm.grades;
            this.editItem.description = this.coursewareForm.description;
            this.editItem.tags = this.coursewareForm.tags;
            this.$message.success('课件更新成功');
          } else {
            this.coursewareList.push({
              id: Date.now(),
              name: this.coursewareForm.name,
              category: this.coursewareForm.category,
              description: this.coursewareForm.description,
              pages: 20,
              duration: 30,
              downloads: 0,
              tags: this.coursewareForm.tags,
              grades: this.coursewareForm.grades
            });
            this.$message.success('课件上传成功');
          }
          this.dialogVisible = false;
        }
      });
    }
  }
};
</script>

<style scoped>
.class-courseware {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h3 {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.filter-bar {
  margin-bottom: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 6px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}

.courseware-grid {
  margin-bottom: 20px;
}

.courseware-card {
  margin-bottom: 20px;
  overflow: hidden;
}

.courseware-card .card-header {
  padding: 15px;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 10px;
}

.courseware-card .card-header i {
  font-size: 24px;
}

.courseware-card .card-body {
  padding: 15px;
}

.card-title {
  margin: 0 0 10px 0;
  font-size: 16px;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-desc {
  margin: 0 0 10px 0;
  font-size: 13px;
  color: #909399;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 36px;
}

.card-meta {
  display: flex;
  gap: 15px;
  margin-bottom: 10px;
  font-size: 12px;
  color: #909399;
}

.card-meta i {
  margin-right: 3px;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.courseware-card .card-footer {
  padding: 10px 15px;
  border-top: 1px solid #ebeef5;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.download-count {
  font-size: 12px;
  color: #909399;
}

.download-count i {
  margin-right: 3px;
}

.card-actions {
  display: flex;
  gap: 5px;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  padding-top: 10px;
}

.preview-container {
  height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-placeholder {
  text-align: center;
  color: #909399;
}

.preview-placeholder i {
  font-size: 80px;
  margin-bottom: 20px;
  color: #dcdfe6;
}

.preview-placeholder p {
  font-size: 18px;
  color: #303133;
  margin-bottom: 10px;
}

.preview-info {
  font-size: 14px;
  color: #909399;
  margin-bottom: 20px;
}
</style>