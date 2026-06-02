<template>
  <div class="batch-entry">
    <el-tabs v-model="activeTab" type="card">
      <!-- 批量导入 -->
      <el-tab-pane label="批量导入" name="import">
        <div class="import-section">
          <div class="upload-area">
            <el-upload
              class="upload-dragger"
              drag
              action="#"
              :auto-upload="false"
              :on-change="handleFileChange"
              :show-file-list="false"
              accept=".xlsx,.xls">
              <i class="el-icon-upload"></i>
              <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
              <div class="el-upload__tip" slot="tip">只能上传 xlsx/xls 文件，且不超过10MB</div>
            </el-upload>
          </div>
          <div class="template-download">
            <span>体检数据录入模板：</span>
            <el-button type="text" icon="el-icon-download" @click="downloadTemplate('standard')">标准模板</el-button>
            <el-button type="text" icon="el-icon-download" @click="downloadTemplate('simple')">简化模板</el-button>
          </div>
          <div v-if="uploadFile" class="file-info">
            <el-card shadow="hover">
              <div class="file-detail">
                <i class="el-icon-document"></i>
                <span class="file-name">{{ uploadFile.name }}</span>
                <span class="file-size">{{ formatFileSize(uploadFile.size) }}</span>
                <el-button type="danger" size="mini" icon="el-icon-delete" circle @click="clearFile"></el-button>
              </div>
            </el-card>
          </div>
          <div v-if="uploadFile" class="import-actions">
            <el-button type="primary" icon="el-icon-upload2" @click="handleImport" :loading="importing">开始导入</el-button>
            <el-button @click="clearFile">取消</el-button>
          </div>
        </div>
      </el-tab-pane>

      <!-- 数据校验 -->
      <el-tab-pane label="数据校验" name="validate" :disabled="!hasValidationData">
        <div v-if="validationResult" class="validation-section">
          <div class="validation-summary">
            <el-row :gutter="20">
              <el-col :span="6">
                <div class="summary-card success">
                  <div class="summary-value">{{ validationResult.success }}</div>
                  <div class="summary-label">校验通过</div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="summary-card warning">
                  <div class="summary-value">{{ validationResult.warning }}</div>
                  <div class="summary-label">警告数据</div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="summary-card error">
                  <div class="summary-value">{{ validationResult.error }}</div>
                  <div class="summary-label">错误数据</div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="summary-card total">
                  <div class="summary-value">{{ validationResult.total }}</div>
                  <div class="summary-label">总数据量</div>
                </div>
              </el-col>
            </el-row>
          </div>
          <div class="validation-actions">
            <el-button type="success" icon="el-icon-check" @click="confirmImport">确认导入有效数据</el-button>
            <el-button type="warning" icon="el-icon-download" @click="exportErrorData">导出错误数据</el-button>
            <el-button @click="clearValidation">清空校验结果</el-button>
          </div>
          <el-table :data="validationResult.details" border style="width: 100%; margin-top: 20px;" max-height="400">
            <el-table-column type="index" label="行号" width="60"></el-table-column>
            <el-table-column prop="studentId" label="学号" width="120"></el-table-column>
            <el-table-column prop="name" label="姓名" width="100"></el-table-column>
            <el-table-column prop="class" label="班级" width="120"></el-table-column>
            <el-table-column prop="height" label="身高(cm)" width="100"></el-table-column>
            <el-table-column prop="weight" label="体重(kg)" width="100"></el-table-column>
            <el-table-column prop="vision" label="视力" width="100"></el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template slot-scope="scope">
                <el-tag :type="scope.row.status === '通过' ? 'success' : scope.row.status === '警告' ? 'warning' : 'danger'" size="small">{{ scope.row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="message" label="校验信息" show-overflow-tooltip></el-table-column>
          </el-table>
        </div>
        <div v-else class="no-data">
          <i class="el-icon-folder-opened"></i>
          <p>暂无校验数据，请先上传文件进行导入</p>
        </div>
      </el-tab-pane>

      <!-- 录入历史 -->
      <el-tab-pane label="录入历史" name="history">
        <div class="search-bar">
          <el-date-picker v-model="historySearch.dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" style="width: 240px;"></el-date-picker>
          <el-select v-model="historySearch.status" placeholder="导入状态" clearable style="width: 120px;">
            <el-option label="成功" value="success"></el-option>
            <el-option label="部分成功" value="partial"></el-option>
            <el-option label="失败" value="failed"></el-option>
          </el-select>
          <el-input v-model="historySearch.operator" placeholder="操作人" style="width: 150px;"></el-input>
          <el-button type="primary" icon="el-icon-search" @click="searchHistory">查询</el-button>
        </div>
        <el-table :data="pagedHistory" border style="width: 100%">
          <el-table-column type="index" label="序号" width="60"></el-table-column>
          <el-table-column prop="fileName" label="文件名" width="200" show-overflow-tooltip></el-table-column>
          <el-table-column prop="totalCount" label="总数据量" width="100"></el-table-column>
          <el-table-column prop="successCount" label="成功数" width="100">
            <template slot-scope="scope">
              <span style="color: #67c23a;">{{ scope.row.successCount }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="failCount" label="失败数" width="100">
            <template slot-scope="scope">
              <span :style="{ color: scope.row.failCount > 0 ? '#f56c6c' : '#909399' }">{{ scope.row.failCount }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="operator" label="操作人" width="100"></el-table-column>
          <el-table-column prop="time" label="导入时间" width="180"></el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template slot-scope="scope">
              <el-tag :type="scope.row.status === '成功' ? 'success' : scope.row.status === '部分成功' ? 'warning' : 'danger'" size="small">{{ scope.row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150">
            <template slot-scope="scope">
              <el-button type="text" size="small" @click="viewHistoryDetail(scope.row)">详情</el-button>
              <el-button type="text" size="small" @click="downloadHistoryFile(scope.row)">下载</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="pagination">
          <el-pagination background layout="total, prev, pager, next" :total="filteredHistory.length" :page-size="10" :current-page.sync="historyCurrentPage"></el-pagination>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 历史详情对话框 -->
    <el-dialog title="导入详情" :visible.sync="historyDetailVisible" width="700px">
      <el-descriptions :column="2" border v-if="currentHistory">
        <el-descriptions-item label="文件名">{{ currentHistory.fileName }}</el-descriptions-item>
        <el-descriptions-item label="操作人">{{ currentHistory.operator }}</el-descriptions-item>
        <el-descriptions-item label="导入时间">{{ currentHistory.time }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="currentHistory.status === '成功' ? 'success' : currentHistory.status === '部分成功' ? 'warning' : 'danger'" size="small">{{ currentHistory.status }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="总数据量">{{ currentHistory.totalCount }}</el-descriptions-item>
        <el-descriptions-item label="成功数量">{{ currentHistory.successCount }}</el-descriptions-item>
        <el-descriptions-item label="失败数量">{{ currentHistory.failCount }}</el-descriptions-item>
        <el-descriptions-item label="耗时">{{ currentHistory.duration }}</el-descriptions-item>
      </el-descriptions>
      <div style="margin-top: 20px;">
        <h4>导入日志</h4>
        <div class="log-container">
          <div v-for="(log, index) in currentHistory.logs" :key="index" class="log-item" :class="log.type">
            <span class="log-time">[{{ log.time }}]</span>
            <span class="log-content">{{ log.content }}</span>
          </div>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="historyDetailVisible = false">关闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'BatchEntry',
  data() {
    return {
      activeTab: 'import',
      uploadFile: null,
      importing: false,
      hasValidationData: false,
      validationResult: null,
      historySearch: { dateRange: null, status: '', operator: '' },
      historyCurrentPage: 1,
      historyList: [
        { id: 1, fileName: '2024春季体检数据.xlsx', totalCount: 450, successCount: 445, failCount: 5, operator: '张医生', time: '2024-01-15 14:30:25', status: '部分成功', duration: '32秒', logs: [
          { time: '14:30:25', content: '开始解析文件...', type: 'info' },
          { time: '14:30:28', content: '文件解析完成，共450条数据', type: 'success' },
          { time: '14:30:30', content: '开始数据校验...', type: 'info' },
          { time: '14:30:45', content: '校验完成，445条通过，5条错误', type: 'warning' },
          { time: '14:30:57', content: '导入完成', type: 'success' }
        ]},
        { id: 2, fileName: '一年级体检数据.xlsx', totalCount: 120, successCount: 120, failCount: 0, operator: '李医生', time: '2024-01-14 10:15:33', status: '成功', duration: '15秒', logs: [
          { time: '10:15:33', content: '开始解析文件...', type: 'info' },
          { time: '10:15:35', content: '文件解析完成，共120条数据', type: 'success' },
          { time: '10:15:40', content: '数据校验全部通过', type: 'success' },
          { time: '10:15:48', content: '导入完成', type: 'success' }
        ]},
        { id: 3, fileName: '视力检查数据.xlsx', totalCount: 80, successCount: 75, failCount: 5, operator: '王医生', time: '2024-01-13 16:20:18', status: '部分成功', duration: '12秒', logs: [
          { time: '16:20:18', content: '开始解析文件...', type: 'info' },
          { time: '16:20:20', content: '文件解析完成，共80条数据', type: 'success' },
          { time: '16:20:25', content: '校验完成，75条通过，5条错误', type: 'warning' },
          { time: '16:20:30', content: '导入完成', type: 'success' }
        ]},
        { id: 4, fileName: '错误格式文件.xlsx', totalCount: 50, successCount: 0, failCount: 50, operator: '张医生', time: '2024-01-12 09:45:10', status: '失败', duration: '5秒', logs: [
          { time: '09:45:10', content: '开始解析文件...', type: 'info' },
          { time: '09:45:12', content: '文件格式错误，缺少必要列', type: 'error' },
          { time: '09:45:15', content: '导入失败', type: 'error' }
        ]}
      ],
      historyDetailVisible: false,
      currentHistory: null
    };
  },
  computed: {
    filteredHistory() {
      return this.historyList.filter(item => {
        const matchStatus = !this.historySearch.status || item.status.includes(this.historySearch.status === 'success' ? '成功' : this.historySearch.status === 'partial' ? '部分' : '失败');
        const matchOperator = !this.historySearch.operator || item.operator.includes(this.historySearch.operator);
        return matchStatus && matchOperator;
      });
    },
    pagedHistory() {
      const start = (this.historyCurrentPage - 1) * 10;
      return this.filteredHistory.slice(start, start + 10);
    }
  },
  methods: {
    handleFileChange(file) {
      const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isExcel) {
        this.$message.error('只能上传 xlsx/xls 格式的文件！');
        return;
      }
      if (!isLt10M) {
        this.$message.error('文件大小不能超过 10MB！');
        return;
      }
      this.uploadFile = file.raw;
      this.$message.success('文件选择成功，请点击"开始导入"按钮');
    },
    formatFileSize(size) {
      if (size < 1024) return size + ' B';
      if (size < 1024 * 1024) return (size / 1024).toFixed(2) + ' KB';
      return (size / 1024 / 1024).toFixed(2) + ' MB';
    },
    clearFile() {
      this.uploadFile = null;
    },
    downloadTemplate(type) {
      this.$message.success((type === 'standard' ? '标准' : '简化') + '模板下载成功');
    },
    handleImport() {
      if (!this.uploadFile) {
        this.$message.warning('请先选择要导入的文件');
        return;
      }
      this.importing = true;
      setTimeout(() => {
        this.importing = false;
        this.hasValidationData = true;
        this.validationResult = {
          success: 445,
          warning: 3,
          error: 2,
          total: 450,
          details: [
            { studentId: '2024001', name: '张三', class: '一年级1班', height: '125', weight: '25', vision: '5.0', status: '通过', message: '' },
            { studentId: '2024002', name: '李四', class: '一年级1班', height: '123', weight: '24', vision: '4.8', status: '通过', message: '' },
            { studentId: '2024003', name: '王五', class: '一年级1班', height: '', weight: '23', vision: '5.1', status: '错误', message: '身高不能为空' },
            { studentId: '2024004', name: '赵六', class: '一年级2班', height: '128', weight: '35', vision: '4.9', status: '警告', message: '体重偏重，建议关注' },
            { studentId: '2024005', name: '钱七', class: '一年级2班', height: '126', weight: '22', vision: '4.5', status: '警告', message: '视力偏低，建议复查' },
            { studentId: '2024006', name: '孙八', class: '一年级2班', height: '130', weight: '', vision: '5.0', status: '错误', message: '体重不能为空' },
            { studentId: '2024007', name: '周九', class: '一年级3班', height: '127', weight: '26', vision: '5.2', status: '通过', message: '' },
            { studentId: '2024008', name: '吴十', class: '一年级3班', height: '124', weight: '24', vision: '5.0', status: '通过', message: '' }
          ]
        };
        this.activeTab = 'validate';
        this.$message.success('数据校验完成');
      }, 2000);
    },
    confirmImport() {
      this.$confirm('确认导入 ' + this.validationResult.success + ' 条有效数据吗？', '提示', { type: 'info' }).then(() => {
        this.$message.success('成功导入 ' + this.validationResult.success + ' 条数据');
        this.clearValidation();
        this.activeTab = 'import';
      }).catch(() => {});
    },
    exportErrorData() {
      this.$message.success('错误数据导出成功');
    },
    clearValidation() {
      this.hasValidationData = false;
      this.validationResult = null;
      this.uploadFile = null;
    },
    searchHistory() {
      this.historyCurrentPage = 1;
      this.$message.success('查询完成，共找到 ' + this.filteredHistory.length + ' 条记录');
    },
    viewHistoryDetail(row) {
      this.currentHistory = row;
      this.historyDetailVisible = true;
    },
    downloadHistoryFile(row) {
      this.$message.success('文件下载成功：' + row.fileName);
    }
  }
};
</script>

<style scoped>
.batch-entry {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.import-section {
  max-width: 600px;
  margin: 0 auto;
  padding: 40px 20px;
}

.upload-area {
  margin-bottom: 20px;
}

.upload-dragger {
  width: 100%;
}

.template-download {
  text-align: center;
  margin-bottom: 20px;
  color: #606266;
}

.file-info {
  margin-bottom: 20px;
}

.file-detail {
  display: flex;
  align-items: center;
  gap: 10px;
}

.file-name {
  flex: 1;
  font-weight: 500;
}

.file-size {
  color: #909399;
  font-size: 12px;
}

.import-actions {
  text-align: center;
}

.validation-section {
  padding: 20px 0;
}

.validation-summary {
  margin-bottom: 20px;
}

.summary-card {
  padding: 20px;
  border-radius: 8px;
  text-align: center;
}

.summary-card.success {
  background: linear-gradient(135deg, #f0f9eb 0%, #e1f3d8 100%);
  border-left: 4px solid #67c23a;
}

.summary-card.warning {
  background: linear-gradient(135deg, #fdf6ec 0%, #faecd8 100%);
  border-left: 4px solid #e6a23c;
}

.summary-card.error {
  background: linear-gradient(135deg, #fef0f0 0%, #fde2e2 100%);
  border-left: 4px solid #f56c6c;
}

.summary-card.total {
  background: linear-gradient(135deg, #ecf5ff 0%, #d9ecff 100%);
  border-left: 4px solid #409eff;
}

.summary-value {
  font-size: 32px;
  font-weight: bold;
  color: #303133;
}

.summary-label {
  font-size: 14px;
  color: #606266;
  margin-top: 5px;
}

.validation-actions {
  text-align: center;
  margin-bottom: 20px;
}

.no-data {
  text-align: center;
  padding: 60px 20px;
  color: #909399;
}

.no-data i {
  font-size: 60px;
  margin-bottom: 20px;
}

.no-data p {
  font-size: 16px;
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

.pagination {
  display: flex;
  justify-content: flex-end;
  padding-top: 15px;
}

.log-container {
  max-height: 300px;
  overflow-y: auto;
  background: #f5f7fa;
  padding: 15px;
  border-radius: 6px;
  font-family: monospace;
  font-size: 13px;
}

.log-item {
  padding: 5px 0;
  border-bottom: 1px dashed #e4e7ed;
}

.log-item:last-child {
  border-bottom: none;
}

.log-item.info .log-content {
  color: #409eff;
}

.log-item.success .log-content {
  color: #67c23a;
}

.log-item.warning .log-content {
  color: #e6a23c;
}

.log-item.error .log-content {
  color: #f56c6c;
}

.log-time {
  color: #909399;
  margin-right: 10px;
}
</style>