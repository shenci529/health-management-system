<template>
  <div class="class-grade-manage">
    <el-card class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h2>班级年级架构管理</h2>
          <p class="subtitle">管理学校年级、班级架构及人员分配</p>
        </div>
        <el-button type="primary" icon="el-icon-plus" @click="handleAddGrade">新增年级</el-button>
      </div>
    </el-card>

    <el-row :gutter="20" class="content-row">
      <!-- 年级列表 -->
      <el-col :span="6">
        <el-card class="grade-card">
          <div slot="header">
            <span>年级列表</span>
            <el-tag type="info" size="mini">{{ gradeList.length }}个年级</el-tag>
          </div>
          <el-menu
            :default-active="selectedGrade"
            class="grade-menu"
            @select="handleGradeSelect"
          >
            <el-menu-item v-for="grade in gradeList" :key="grade.id" :index="grade.id">
              <i class="el-icon-s-data"></i>
              <span>{{ grade.name }}</span>
              <el-tag :type="grade.type === 'primary' ? 'success' : grade.type === 'junior' ? 'warning' : 'danger'" size="mini" class="grade-tag">
                {{ grade.typeText }}
              </el-tag>
            </el-menu-item>
          </el-menu>
        </el-card>
      </el-col>

      <!-- 班级列表 -->
      <el-col :span="9">
        <el-card class="class-card">
          <div slot="header">
            <span>班级列表</span>
            <div class="header-actions">
              <el-tag type="info" size="mini">{{ currentClassList.length }}个班级</el-tag>
              <el-button type="primary" size="mini" icon="el-icon-plus" @click="handleAddClass">新增班级</el-button>
            </div>
          </div>
          <el-table :data="currentClassList" stripe style="width: 100%">
            <el-table-column prop="name" label="班级名称" min-width="100">
              <template slot-scope="scope">
                <el-link type="primary" @click="handleClassDetail(scope.row)">{{ scope.row.name }}</el-link>
              </template>
            </el-table-column>
            <el-table-column prop="studentCount" label="学生数" width="80" align="center">
              <template slot-scope="scope">
                <el-tag size="mini">{{ scope.row.studentCount }}人</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="teacherName" label="班主任" width="100" />
            <el-table-column label="操作" width="120" align="center">
              <template slot-scope="scope">
                <el-button type="text" size="mini" @click="handleEditClass(scope.row)">编辑</el-button>
                <el-button type="text" size="mini" style="color: #F56C6C" @click="handleDeleteClass(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <!-- 人员分配 -->
      <el-col :span="9">
        <el-card class="assignment-card">
          <div slot="header">
            <span>人员分配</span>
            <el-button v-if="selectedClass" type="primary" size="mini" icon="el-icon-user" @click="handleAssignPerson">分配人员</el-button>
          </div>
          <div v-if="!selectedClass" class="empty-tip">
            <i class="el-icon-info"></i>
            <p>请先选择班级进行人员分配</p>
          </div>
          <div v-else>
            <el-tabs v-model="activeTab">
              <el-tab-pane label="学生" name="students">
                <div class="tab-header">
                  <span>共 {{ classStudents.length }} 名学生</span>
                  <el-input
                    v-model="studentSearch"
                    placeholder="搜索学生"
                    prefix-icon="el-icon-search"
                    size="mini"
                    style="width: 150px"
                  />
                </div>
                <el-table :data="filteredStudents" stripe size="small" height="300">
                  <el-table-column prop="name" label="姓名" width="80" />
                  <el-table-column prop="studentNo" label="学号" width="100" />
                  <el-table-column prop="gender" label="性别" width="60">
                    <template slot-scope="scope">
                      <el-tag :type="scope.row.gender === '男' ? 'primary' : 'danger'" size="mini">{{ scope.row.gender }}</el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="80" align="center">
                    <template slot-scope="scope">
                      <el-button type="text" size="mini" style="color: #F56C6C" @click="handleRemoveStudent(scope.row)">移除</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </el-tab-pane>
              <el-tab-pane label="教师" name="teachers">
                <div class="tab-header">
                  <span>共 {{ classTeachers.length }} 名教师</span>
                </div>
                <el-table :data="classTeachers" stripe size="small" height="300">
                  <el-table-column prop="name" label="姓名" width="80" />
                  <el-table-column prop="subject" label="任教科目" width="100" />
                  <el-table-column prop"role" label="职务" width="100">
                    <template slot-scope="scope">
                      <el-tag :type="scope.row.role === '班主任' ? 'success' : 'info'" size="mini">{{ scope.row.role }}</el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="80" align="center">
                    <template slot-scope="scope">
                      <el-button type="text" size="mini" style="color: #F56C6C" @click="handleRemoveTeacher(scope.row)">移除</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </el-tab-pane>
            </el-tabs>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 新增/编辑年级对话框 -->
    <el-dialog :title="gradeDialogTitle" :visible.sync="gradeDialogVisible" width="500px">
      <el-form :model="gradeForm" :rules="gradeRules" ref="gradeForm" label-width="100px">
        <el-form-item label="年级名称" prop="name">
          <el-input v-model="gradeForm.name" placeholder="如：一年级" />
        </el-form-item>
        <el-form-item label="学段" prop="type">
          <el-select v-model="gradeForm.type" placeholder="请选择学段" style="width: 100%">
            <el-option label="小学" value="primary" />
            <el-option label="初中" value="junior" />
            <el-option label="高中" value="senior" />
          </el-select>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="gradeForm.sort" :min="1" :max="20" style="width: 100%" />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="gradeDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitGradeForm">确定</el-button>
      </div>
    </el-dialog>

    <!-- 新增/编辑班级对话框 -->
    <el-dialog :title="classDialogTitle" :visible.sync="classDialogVisible" width="500px">
      <el-form :model="classForm" :rules="classRules" ref="classForm" label-width="100px">
        <el-form-item label="所属年级" prop="gradeId">
          <el-select v-model="classForm.gradeId" placeholder="请选择年级" style="width: 100%" disabled>
            <el-option v-for="grade in gradeList" :key="grade.id" :label="grade.name" :value="grade.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="班级名称" prop="name">
          <el-input v-model="classForm.name" placeholder="如：1班" />
        </el-form-item>
        <el-form-item label="班主任" prop="teacherId">
          <el-select v-model="classForm.teacherId" placeholder="请选择班主任" style="width: 100%" filterable>
            <el-option v-for="teacher in teacherList" :key="teacher.id" :label="teacher.name" :value="teacher.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="教室位置" prop="classroom">
          <el-input v-model="classForm.classroom" placeholder="如：教学楼A-101" />
        </el-form-item>
        <el-form-item label="容纳人数" prop="capacity">
          <el-input-number v-model="classForm.capacity" :min="20" :max="60" style="width: 100%" />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="classDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitClassForm">确定</el-button>
      </div>
    </el-dialog>

    <!-- 分配人员对话框 -->
    <el-dialog title="分配人员" :visible.sync="assignDialogVisible" width="700px">
      <el-tabs v-model="assignTab">
        <el-tab-pane label="分配学生" name="assignStudent">
          <el-transfer
            v-model="selectedStudents"
            :data="availableStudents"
            :titles="['待分配学生', '已选学生']"
            :props="{ key: 'id', label: 'name' }"
            filterable
            filter-placeholder="搜索学生姓名"
          />
        </el-tab-pane>
        <el-tab-pane label="分配教师" name="assignTeacher">
          <el-transfer
            v-model="selectedTeachers"
            :data="availableTeachers"
            :titles="['待分配教师', '已选教师']'
            :props="{ key: 'id', label: 'name' }"
            filterable
            filter-placeholder="搜索教师姓名"
          />
        </el-tab-pane>
      </el-tabs>
      <div slot="footer">
        <el-button @click="assignDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAssign">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'ClassGradeManage',
  data() {
    return {
      selectedGrade: '',
      selectedClass: null,
      activeTab: 'students',
      studentSearch: '',
      gradeList: [
        { id: '1', name: '一年级', type: 'primary', typeText: '小学', sort: 1 },
        { id: '2', name: '二年级', type: 'primary', typeText: '小学', sort: 2 },
        { id: '3', name: '三年级', type: 'primary', typeText: '小学', sort: 3 },
        { id: '4', name: '四年级', type: 'primary', typeText: '小学', sort: 4 },
        { id: '5', name: '五年级', type: 'primary', typeText: '小学', sort: 5 },
        { id: '6', name: '六年级', type: 'primary', typeText: '小学', sort: 6 },
        { id: '7', name: '初一', type: 'junior', typeText: '初中', sort: 7 },
        { id: '8', name: '初二', type: 'junior', typeText: '初中', sort: 8 },
        { id: '9', name: '初三', type: 'junior', typeText: '初中', sort: 9 }
      ],
      classList: [
        { id: '101', gradeId: '1', name: '1班', studentCount: 45, teacherName: '张老师', classroom: '教学楼A-101', capacity: 50 },
        { id: '102', gradeId: '1', name: '2班', studentCount: 42, teacherName: '李老师', classroom: '教学楼A-102', capacity: 50 },
        { id: '103', gradeId: '1', name: '3班', studentCount: 48, teacherName: '王老师', classroom: '教学楼A-103', capacity: 50 },
        { id: '201', gradeId: '2', name: '1班', studentCount: 46, teacherName: '赵老师', classroom: '教学楼A-201', capacity: 50 },
        { id: '202', gradeId: '2', name: '2班', studentCount: 44, teacherName: '陈老师', classroom: '教学楼A-202', capacity: 50 }
      ],
      teacherList: [
        { id: 't1', name: '张老师' },
        { id: 't2', name: '李老师' },
        { id: 't3', name: '王老师' },
        { id: 't4', name: '赵老师' },
        { id: 't5', name: '陈老师' }
      ],
      classStudents: [
        { id: 's1', name: '小明', studentNo: '2024001', gender: '男' },
        { id: 's2', name: '小红', studentNo: '2024002', gender: '女' },
        { id: 's3', name: '小刚', studentNo: '2024003', gender: '男' },
        { id: 's4', name: '小丽', studentNo: '2024004', gender: '女' },
        { id: 's5', name: '小华', studentNo: '2024005', gender: '男' }
      ],
      classTeachers: [
        { id: 't1', name: '张老师', subject: '语文', role: '班主任' },
        { id: 't2', name: '李老师', subject: '数学', role: '任课教师' }
      ],
      gradeDialogVisible: false,
      gradeDialogTitle: '新增年级',
      gradeForm: {
        name: '',
        type: '',
        sort: 1
      },
      gradeRules: {
        name: [{ required: true, message: '请输入年级名称', trigger: 'blur' }],
        type: [{ required: true, message: '请选择学段', trigger: 'change' }]
      },
      classDialogVisible: false,
      classDialogTitle: '新增班级',
      classForm: {
        gradeId: '',
        name: '',
        teacherId: '',
        classroom: '',
        capacity: 50
      },
      classRules: {
        name: [{ required: true, message: '请输入班级名称', trigger: 'blur' }],
        teacherId: [{ required: true, message: '请选择班主任', trigger: 'change' }]
      },
      assignDialogVisible: false,
      assignTab: 'assignStudent',
      selectedStudents: [],
      selectedTeachers: [],
      availableStudents: [
        { id: 's6', name: '小强', studentNo: '2024006' },
        { id: 's7', name: '小美', studentNo: '2024007' },
        { id: 's8', name: '小军', studentNo: '2024008' },
        { id: 's9', name: '小芳', studentNo: '2024009' },
        { id: 's10', name: '小伟', studentNo: '2024010' }
      ],
      availableTeachers: [
        { id: 't3', name: '王老师' },
        { id: 't4', name: '赵老师' },
        { id: 't5', name: '陈老师' }
      ]
    }
  },
  computed: {
    currentClassList() {
      return this.classList.filter(item => item.gradeId === this.selectedGrade)
    },
    filteredStudents() {
      if (!this.studentSearch) return this.classStudents
      return this.classStudents.filter(s => s.name.includes(this.studentSearch) || s.studentNo.includes(this.studentSearch))
    }
  },
  created() {
    if (this.gradeList.length > 0) {
      this.selectedGrade = this.gradeList[0].id
    }
  },
  methods: {
    handleGradeSelect(gradeId) {
      this.selectedGrade = gradeId
      this.selectedClass = null
    },
    handleAddGrade() {
      this.gradeDialogTitle = '新增年级'
      this.gradeForm = { name: '', type: '', sort: this.gradeList.length + 1 }
      this.gradeDialogVisible = true
    },
    submitGradeForm() {
      this.$refs.gradeForm.validate(valid => {
        if (valid) {
          this.$message.success('保存成功')
          this.gradeDialogVisible = false
        }
      })
    },
    handleAddClass() {
      this.classDialogTitle = '新增班级'
      this.classForm = { gradeId: this.selectedGrade, name: '', teacherId: '', classroom: '', capacity: 50 }
      this.classDialogVisible = true
    },
    handleEditClass(row) {
      this.classDialogTitle = '编辑班级'
      this.classForm = { ...row, teacherId: 't1' }
      this.classDialogVisible = true
    },
    handleDeleteClass(row) {
      this.$confirm('确定删除该班级吗？', '提示', { type: 'warning' }).then(() => {
        this.$message.success('删除成功')
      })
    },
    submitClassForm() {
      this.$refs.classForm.validate(valid => {
        if (valid) {
          this.$message.success('保存成功')
          this.classDialogVisible = false
        }
      })
    },
    handleClassDetail(row) {
      this.selectedClass = row
    },
    handleAssignPerson() {
      this.assignDialogVisible = true
      this.assignTab = 'assignStudent'
    },
    submitAssign() {
      this.$message.success('分配成功')
      this.assignDialogVisible = false
    },
    handleRemoveStudent(row) {
      this.$confirm('确定从该班级移除该学生吗？', '提示', { type: 'warning' }).then(() => {
        this.$message.success('移除成功')
      })
    },
    handleRemoveTeacher(row) {
      this.$confirm('确定从该班级移除该教师吗？', '提示', { type: 'warning' }).then(() => {
        this.$message.success('移除成功')
      })
    }
  }
}
</script>

<style scoped>
.class-grade-manage {
  padding: 20px;
}
.page-header {
  margin-bottom: 20px;
}
.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.title-section h2 {
  margin: 0 0 8px 0;
  font-size: 20px;
  color: #303133;
}
.subtitle {
  margin: 0;
  color: #909399;
  font-size: 14px;
}
.content-row {
  margin-top: 0;
}
.grade-card, .class-card, .assignment-card {
  height: calc(100vh - 200px);
}
.grade-card ::v-deep .el-card__body {
  padding: 0;
  height: calc(100% - 55px);
  overflow-y: auto;
}
.class-card ::v-deep .el-card__body {
  height: calc(100% - 55px);
  overflow-y: auto;
}
.assignment-card ::v-deep .el-card__body {
  height: calc(100% - 55px);
  overflow-y: auto;
}
.grade-menu {
  border-right: none;
}
.grade-tag {
  margin-left: 8px;
}
.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}
.empty-tip {
  text-align: center;
  padding: 60px 20px;
  color: #909399;
}
.empty-tip i {
  font-size: 48px;
  margin-bottom: 16px;
}
.tab-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding: 0 5px;
}
</style>
