<template>
  <div class="archive-export">
    <div class="page-header">
      <h3>学生成长档案导出</h3>
      <el-button type="primary" icon="el-icon-download" @click="batchExport">批量导出</el-button>
    </div>

    <!-- 搜索筛选 -->
    <div class="search-bar">
      <el-input v-model="searchForm.studentId" placeholder="学号" style="width: 150px;"></el-input>
      <el-input v-model="searchForm.name" placeholder="姓名" style="width: 150px;"></el-input>
      <el-select v-model="searchForm.grade" placeholder="年级" clearable style="width: 120px;">
        <el-option label="一年级" value="1"></el-option>
        <el-option label="二年级" value="2"></el-option>
        <el-option label="三年级" value="3"></el-option>
        <el-option label="四年级" value="4"></el-option>
        <el-option label="五年级" value="5"></el-option>
        <el-option label="六年级" value="6"></el-option>
      </el-select>
      <el-select v-model="searchForm.class" placeholder="班级" clearable style="width: 120px;">
        <el-option label="1班" value="1"></el-option>
        <el-option label="2班" value="2"></el-option>
        <el-option label="3班" value="3"></el-option>
      </el-select>
      <el-button type="primary" icon="el-icon-search" @click="handleSearch">查询</el-button>
      <el-button @click="resetSearch">重置</el-button>
    </div>

    <!-- 模板选择 -->
    <div class="template-section">
      <h4>档案模板选择</h4>
      <el-radio-group v-model="selectedTemplate" @change="changeTemplate">
        <el-radio label="standard">
          <div class="template-option">
            <i class="el-icon-document"></i>
            <span>标准档案模板</span>
            <el-tag size="mini">推荐</el-tag>
          </div>
        </el-radio>
        <el-radio label="simple">
          <div class="template-option">
            <i class="el-icon-document-copy"></i>
            <span>简化档案模板</span>
          </div>
        </el-radio>
        <el-radio label="comprehensive">
          <div class="template-option">
            <i class="el-icon-files"></i>
            <span>综合素质报告模板</span>
          </div>
        </el-radio>
        <el-radio label="custom">
          <div class="template-option">
            <i class="el-icon-edit-outline"></i>
            <span>自定义模板</span>
          </div>
        </el-radio>
      </el-radio-group>
    </div>

    <!-- 学生列表 -->
    <div class="student-table">
      <el-table :data="pagedStudents" border style="width: 100%" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column type="index" label="序号" width="60"></el-table-column>
        <el-table-column prop="studentId" label="学号" width="120"></el-table-column>
        <el-table-column prop="name" label="姓名" width="100"></el-table-column>
        <el-table-column prop="grade" label="年级" width="80"></el-table-column>
        <el-table-column prop="class" label="班级" width="80"></el-table-column>
        <el-table-column prop="gender" label="性别" width="60"></el-table-column>
        <el-table-column prop="checkupCount" label="体检次数" width="80"></el-table-column>
        <el-table-column prop="healthScore" label="健康评分" width="80">
          <template slot-scope="scope">
            <el-tag size="small" :type="getScoreTagType(scope.row.healthScore)">{{ scope.row.healthScore }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastCheckup" label="最近体检" width="120"></el-table-column>
        <el-table-column prop="archiveStatus" label="档案状态" width="100">
          <template slot-scope="scope">
            <el-tag size="small" :type="scope.row.archiveStatus === '完整' ? 'success' : 'warning'">{{ scope.row.archiveStatus }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" size="small" icon="el-icon-view" @click="previewArchive(scope.row)">预览</el-button>
            <el-button type="text" size="small" icon="el-icon-download" @click="exportSingle(scope.row)">导出PDF</el-button>
            <el-button type="text" size="small" icon="el-icon-printer" @click="printArchive(scope.row)">打印</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination">
        <el-pagination background layout="total, prev, pager, next" :total="filteredStudents.length" :page-size="10" :current-page.sync="currentPage"></el-pagination>
      </div>
    </div>

    <!-- 已选学生操作 -->
    <div class="selected-actions" v-if="selectedStudents.length > 0">
      <span>已选择 {{ selectedStudents.length }} 名学生</span>
      <el-button type="primary" icon="el-icon-download" @click="exportSelected">批量导出PDF</el-button>
      <el-button type="success" icon="el-icon-printer" @click="printSelected">批量打印</el-button>
      <el-button @click="clearSelection">清空选择</el-button>
    </div>

    <!-- 档案预览对话框 -->
    <el-dialog title="学生健康档案预览" :visible.sync="previewDialogVisible" width="800px" top="5vh">
      <div class="archive-preview" v-if="previewStudent">
        <div class="archive-header">
          <h2>学生综合素质健康报告</h2>
          <div class="archive-meta">
            <span>学号：{{ previewStudent.studentId }}</span>
            <span>姓名：{{ previewStudent.name }}</span>
            <span>年级：{{ previewStudent.grade }}</span>
            <span>班级：{{ previewStudent.class }}</span>
          </div>
        </div>
        
        <div class="archive-section">
          <h3>基本信息</h3>
          <el-descriptions :column="4" border>
            <el-descriptions-item label="姓名">{{ previewStudent.name }}</el-descriptions-item>
            <el-descriptions-item label="性别">{{ previewStudent.gender }}</el-descriptions-item>
            <el-descriptions-item label="出生日期">2015年6月15日</el-descriptions-item>
            <el-descriptions-item label="民族">汉族</el-descriptions-item>
            <el-descriptions-item label="身高">125 cm</el-descriptions-item>
            <el-descriptions-item label="体重">25 kg</el-descriptions-item>
            <el-descriptions-item label="BMI">16.0</el-descriptions-item>
            <el-descriptions-item label="血型">A型</el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="archive-section">
          <h3>体检记录</h3>
          <el-table :data="previewStudent.checkupRecords" border size="small">
            <el-table-column prop="date" label="体检日期" width="120"></el-table-column>
            <el-table-column prop="height" label="身高(cm)" width="80"></el-table-column>
            <el-table-column prop="weight" label="体重(kg)" width="80"></el-table-column>
            <el-table-column prop="vision" label="视力" width="80"></el-table-column>
            <el-table-column prop="hearing" label="听力" width="80"></el-table-column>
            <el-table-column prop="teeth" label="牙齿" width="80"></el-table-column>
            <el-table-column prop="result" label="体检结论"></el-table-column>
          </el-table>
        </div>

        <div class="archive-section">
          <h3>健康指标趋势</h3>
          <div class="trend-chart">
            <div class="trend-item">
              <span class="trend-label">身高增长</span>
              <div class="trend-bar">
                <div class="trend-fill" style="width: 80%; background: #409eff;"></div>
              </div>
              <span class="trend-value">+15cm (近3年)</span>
            </div>
            <div class="trend-item">
              <span class="trend-label">体重变化</span>
              <div class="trend-bar">
                <div class="trend-fill" style="width: 60%; background: #67c23a;"></div>
              </div>
              <span class="trend-value">+8kg (近3年)</span>
            </div>
            <div class="trend-item">
              <span class="trend-label">视力变化</span>
              <div class="trend-bar">
                <div class="trend-fill" style="width: 30%; background: #e6a23c;"></div>
              </div>
              <span class="trend-value">略有下降</span>
            </div>
          </div>
        </div>

        <div class="archive-section">
          <h3>疫苗接种记录</h3>
          <el-table :data="previewStudent.vaccineRecords" border size="small">
            <el-table-column prop="name" label="疫苗名称" width="150"></el-table-column>
            <el-table-column prop="date" label="接种日期" width="120"></el-table-column>
            <el-table-column prop="dose" label="接种剂次" width="80"></el-table-column>
            <el-table-column prop="status" label="接种状态">
              <template slot-scope="scope">
                <el-tag size="mini" :type="scope.row.status === '已完成' ? 'success' : 'warning'">{{ scope.row.status }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="archive-section">
          <h3>健康评价</h3>
          <div class="health-evaluation">
            <div class="evaluation-item">
              <span class="eval-label">总体健康评分</span>
              <span class="eval-score" :style="{ color: previewStudent.healthScore >= 80 ? '#67c23a' : '#e6a23c' }">{{ previewStudent.healthScore }}分</span>
            </div>
            <div class="evaluation-item">
              <span class="eval-label">体质达标等级</span>
              <span class="eval-value">良好</span>
            </div>
            <div class="evaluation-item">
              <span class="eval-label">健康建议</span>
              <span class="eval-value">建议加强户外活动，注意用眼卫生</span>
            </div>
          </div>
        </div>

        <div class="archive-footer">
          <span>报告生成日期：{{ new Date().toLocaleDateString() }}</span>
          <span>学校健康管理系统</span>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="previewDialogVisible = false">关闭</el-button>
        <el-button type="primary" icon="el-icon-download" @click="exportSingle(previewStudent)">导出PDF</el-button>
        <el-button type="success" icon="el-icon-printer" @click="printArchive(previewStudent)">打印</el-button>
      </span>
    </el-dialog>

    <!-- 批量导出进度对话框 -->
    <el-dialog title="批量导出进度" :visible.sync="exportProgressDialogVisible" width="400px">
      <div class="export-progress">
        <el-progress :percentage="exportProgress" :status="exportStatus"></el-progress>
        <p class="progress-text">正在导出第 {{ exportCurrent }} / {{ exportTotal }} 个档案...</p>
        <p class="progress-file" v-if="currentExportFile">当前文件：{{ currentExportFile }}</p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button v-if="exportStatus !== 'success'" @click="cancelExport">取消导出</el-button>
        <el-button v-if="exportStatus === 'success'" type="primary" @click="exportProgressDialogVisible = false">完成</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'ArchiveExport',
  data() {
    return {
      searchForm: { studentId: '', name: '', grade: '', class: '' },
      currentPage: 1,
      selectedTemplate: 'standard',
      selectedStudents: [],
      students: [
        { id: 1, studentId: '2024001', name: '张三', grade: '一年级', class: '1班', gender: '男', checkupCount: 3, healthScore: 85, lastCheckup: '2024-01-10', archiveStatus: '完整', checkupRecords: [
          { date: '2024-01-10', height: '125', weight: '25', vision: '5.0', hearing: '正常', teeth: '良好', result: '健康' },
          { date: '2023-09-15', height: '122', weight: '23', vision: '5.1', hearing: '正常', teeth: '良好', result: '健康' },
          { date: '2023-03-20', height: '118', weight: '21', vision: '5.2', hearing: '正常', teeth: '良好', result: '健康' }
        ], vaccineRecords: [
          { name: '乙肝疫苗', date: '2023-09-01', dose: '第3剂', status: '已完成' },
          { name: '流感疫苗', date: '2023-11-15', dose: '第1剂', status: '已完成' },
          { name: '麻疹疫苗', date: '2022-03-10', dose: '第1剂', status: '已完成' }
        ]},
        { id: 2, studentId: '2024002', name: '李四', grade: '一年级', class: '1班', gender: '女', checkupCount: 3, healthScore: 92, lastCheckup: '2024-01-10', archiveStatus: '完整', checkupRecords: [], vaccineRecords: [] },
        { id: 3, studentId: '2024003', name: '王五', grade: '一年级', class: '2班', gender: '男', checkupCount: 2, healthScore: 78, lastCheckup: '2024-01-09', archiveStatus: '部分', checkupRecords: [], vaccineRecords: [] },
        { id: 4, studentId: '2024004', name: '赵六', grade: '二年级', class: '1班', gender: '女', checkupCount: 4, healthScore: 88, lastCheckup: '2024-01-08', archiveStatus: '完整', checkupRecords: [], vaccineRecords: [] },
        { id: 5, studentId: '2024005', name: '钱七', grade: '二年级', class: '2班', gender: '男', checkupCount: 3, healthScore: 75, lastCheckup: '2024-01-07', archiveStatus: '部分', checkupRecords: [], vaccineRecords: [] },
        { id: 6, studentId: '2024006', name: '孙八', grade: '三年级', class: '1班', gender: '女', checkupCount: 5, healthScore: 95, lastCheckup: '2024-01-06', archiveStatus: '完整', checkupRecords: [], vaccineRecords: [] },
        { id: 7, studentId: '2024007', name: '周九', grade: '三年级', class: '2班', gender: '男', checkupCount: 4, healthScore: 82, lastCheckup: '2024-01-05', archiveStatus: '完整', checkupRecords: [], vaccineRecords: [] },
        { id: 8, studentId: '2024008', name: '吴十', grade: '四年级', class: '1班', gender: '女', checkupCount: 6, healthScore: 90, lastCheckup: '2024-01-04', archiveStatus: '完整', checkupRecords: [], vaccineRecords: [] }
      ],
      previewDialogVisible: false,
      previewStudent: null,
      exportProgressDialogVisible: false,
      exportProgress: 0,
      exportCurrent: 0,
      exportTotal: 0,
      exportStatus: '',
      currentExportFile: ''
    };
  },
  computed: {
    filteredStudents() {
      return this.students.filter(item => {
        const matchId = !this.searchForm.studentId || item.studentId.includes(this.searchForm.studentId);
        const matchName = !this.searchForm.name || item.name.includes(this.searchForm.name);
        const matchGrade = !this.searchForm.grade || item.grade.includes(this.searchForm.grade);
        const matchClass = !this.searchForm.class || item.class.includes(this.searchForm.class);
        return matchId && matchName && matchGrade && matchClass;
      });
    },
    pagedStudents() {
      const start = (this.currentPage - 1) * 10;
      return this.filteredStudents.slice(start, start + 10);
    }
  },
  methods: {
    getScoreTagType(score) {
      if (score >= 90) return 'success';
      if (score >= 80) return '';
      if (score >= 70) return 'warning';
      return 'danger';
    },
    handleSearch() {
      this.currentPage = 1;
      this.$message.success('查询完成，共找到 ' + this.filteredStudents.length + ' 名学生');
    },
    resetSearch() {
      this.searchForm = { studentId: '', name: '', grade: '', class: '' };
      this.currentPage = 1;
    },
    changeTemplate(val) {
      this.$message.success('已选择' + (val === 'standard' ? '标准' : val === 'simple' ? '简化' : val === 'comprehensive' ? '综合素质' : '自定义') + '模板');
    },
    handleSelectionChange(selection) {
      this.selectedStudents = selection;
    },
    clearSelection() {
      this.selectedStudents = [];
    },
    previewArchive(row) {
      this.previewStudent = row;
      this.previewDialogVisible = true;
    },
    exportSingle(row) {
      this.$message.success('PDF导出成功：' + row.name + '的健康档案');
    },
    printArchive(row) {
      this.$message.success('正在打印：' + row.name + '的健康档案');
    },
    batchExport() {
      if (this.selectedStudents.length === 0) {
        this.$message.warning('请先选择要导出的学生');
        return;
      }
      this.startExport(this.selectedStudents);
    },
    exportSelected() {
      this.startExport(this.selectedStudents);
    },
    printSelected() {
      this.$message.success('正在批量打印 ' + this.selectedStudents.length + ' 名学生的健康档案');
    },
    startExport(students) {
      this.exportProgressDialogVisible = true;
      this.exportTotal = students.length;
      this.exportCurrent = 0;
      this.exportProgress = 0;
      this.exportStatus = '';
      
      const timer = setInterval(() => {
        this.exportCurrent++;
        this.currentExportFile = students[this.exportCurrent - 1].name + '健康档案.pdf';
        this.exportProgress = Math.round((this.exportCurrent / this.exportTotal) * 100);
        
        if (this.exportCurrent >= this.exportTotal) {
          clearInterval(timer);
          this.exportStatus = 'success';
          this.currentExportFile = '';
          this.$message.success('批量导出完成，共导出 ' + this.exportTotal + ' 个档案');
        }
      }, 500);
    },
    cancelExport() {
      this.exportProgressDialogVisible = false;
      this.$message.info('导出已取消');
    }
  }
};
</script>

<style scoped>
.archive-export {
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

.template-section {
  margin-bottom: 20px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 6px;
}

.template-section h4 {
  margin: 0 0 15px 0;
  font-size: 14px;
  color: #606266;
}

.template-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.template-option i {
  font-size: 18px;
  color: #409eff;
}

.student-table {
  margin-bottom: 20px;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  padding-top: 15px;
}

.selected-actions {
  padding: 15px;
  background: #ecf5ff;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 15px;
}

.selected-actions span {
  color: #409eff;
  font-weight: 500;
}

.archive-preview {
  padding: 20px;
}

.archive-header {
  text-align: center;
  border-bottom: 2px solid #303133;
  padding-bottom: 20px;
}

.archive-header h2 {
  margin: 0;
  font-size: 22px;
  color: #303133;
}

.archive-meta {
  margin-top: 10px;
  color: #606266;
}

.archive-meta span {
  margin: 0 15px;
}

.archive-section {
  margin: 20px 0;
}

.archive-section h3 {
  font-size: 16px;
  color: #303133;
  margin-bottom: 15px;
  border-left: 3px solid #409eff;
  padding-left: 10px;
}

.trend-chart {
  padding: 15px;
}

.trend-item {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.trend-label {
  width: 80px;
  font-size: 14px;
  color: #606266;
}

.trend-bar {
  flex: 1;
  height: 20px;
  background: #f0f2f5;
  border-radius: 4px;
  overflow: hidden;
}

.trend-fill {
  height: 100%;
  border-radius: 4px;
}

.trend-value {
  width: 100px;
  font-size: 14px;
  color: #303133;
}

.health-evaluation {
  padding: 15px;
  background: #f5f7fa;
  border-radius: 6px;
}

.evaluation-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 10px 0;
}

.eval-label {
  width: 120px;
  font-size: 14px;
  color: #606266;
}

.eval-score {
  font-size: 20px;
  font-weight: bold;
}

.eval-value {
  font-size: 14px;
  color: #303133;
}

.archive-footer {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
  text-align: center;
  color: #909399;
}

.archive-footer span {
  margin: 0 30px;
}

.export-progress {
  text-align: center;
  padding: 20px;
}

.progress-text {
  margin-top: 15px;
  color: #606266;
}

.progress-file {
  margin-top: 10px;
  color: #909399;
  font-size: 12px;
}
</style>