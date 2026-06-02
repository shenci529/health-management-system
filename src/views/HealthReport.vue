<template>
  <div class="health-report">
    <el-tabs v-model="activeTab" type="card">
      <!-- 报表配置 -->
      <el-tab-pane label="报表配置" name="config">
        <div class="config-section">
          <el-form :model="reportConfig" label-width="120px" style="max-width: 800px;">
            <el-form-item label="报表类型">
              <el-radio-group v-model="reportConfig.type">
                <el-radio label="weekly">周报</el-radio>
                <el-radio label="monthly">月报</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="报表名称">
              <el-input v-model="reportConfig.name" placeholder="请输入报表名称"></el-input>
            </el-form-item>
            <el-form-item label="统计周期">
              <el-date-picker v-model="reportConfig.period" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" style="width: 300px;"></el-date-picker>
            </el-form-item>
            <el-form-item label="统计班级">
              <el-tree
                ref="classTree"
                :data="classTreeData"
                show-checkbox
                node-key="id"
                :default-expanded-keys="['all']"
                :props="{ children: 'children', label: 'label' }"
                style="max-height: 300px; overflow-y: auto;">
              </el-tree>
            </el-form-item>
            <el-form-item label="统计内容">
              <el-checkbox-group v-model="reportConfig.contents">
                <el-checkbox label="myopia">近视情况统计</el-checkbox>
                <el-checkbox label="obesity">肥胖情况统计</el-checkbox>
                <el-checkbox label="fitness">体质达标情况</el-checkbox>
                <el-checkbox label="disease">发病率统计</el-checkbox>
                <el-checkbox label="vaccine">疫苗接种情况</el-checkbox>
                <el-checkbox label="checkup">体检完成情况</el-checkbox>
                <el-checkbox label="absence">请假缺勤统计</el-checkbox>
                <el-checkbox label="activity">健康活动统计</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            <el-form-item label="图表类型">
              <el-checkbox-group v-model="reportConfig.chartTypes">
                <el-checkbox label="pie">饼图</el-checkbox>
                <el-checkbox label="bar">柱状图</el-checkbox>
                <el-checkbox label="line">折线图</el-checkbox>
                <el-checkbox label="table">数据表格</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            <el-form-item label="生成时间">
              <el-time-picker v-model="reportConfig.generateTime" placeholder="选择自动生成时间" style="width: 200px;"></el-time-picker>
              <el-checkbox v-model="reportConfig.autoGenerate" style="margin-left: 20px;">自动生成</el-checkbox>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveReportConfig">保存配置</el-button>
              <el-button type="success" @click="previewReport">预览报表</el-button>
              <el-button @click="resetReportConfig">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>

      <!-- 报表模板 -->
      <el-tab-pane label="报表模板" name="template">
        <div class="template-section">
          <div class="template-header">
            <el-button type="primary" icon="el-icon-plus" @click="addTemplate">新建模板</el-button>
          </div>
          <el-table :data="templateList" border style="width: 100%">
            <el-table-column type="index" label="序号" width="60"></el-table-column>
            <el-table-column prop="name" label="模板名称" width="200"></el-table-column>
            <el-table-column prop="type" label="报表类型" width="100">
              <template slot-scope="scope">
                <el-tag size="small">{{ scope.row.type === 'weekly' ? '周报' : '月报' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="contents" label="包含内容" show-overflow-tooltip></el-table-column>
            <el-table-column prop="createTime" label="创建时间" width="160"></el-table-column>
            <el-table-column prop="isDefault" label="默认模板" width="100">
              <template slot-scope="scope">
                <el-tag size="small" :type="scope.row.isDefault ? 'success' : 'info'">{{ scope.row.isDefault ? '默认' : '普通' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200">
              <template slot-scope="scope">
                <el-button type="text" size="small" @click="editTemplate(scope.row)">编辑</el-button>
                <el-button type="text" size="small" @click="previewTemplate(scope.row)">预览</el-button>
                <el-button type="text" size="small" v-if="!scope.row.isDefault" @click="setDefaultTemplate(scope.row)">设为默认</el-button>
                <el-button type="text" size="small" style="color: #f56c6c;" @click="deleteTemplate(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>

      <!-- 报表导出 -->
      <el-tab-pane label="报表导出" name="export">
        <div class="export-section">
          <div class="search-bar">
            <el-select v-model="exportSearch.type" placeholder="报表类型" clearable style="width: 120px;">
              <el-option label="周报" value="weekly"></el-option>
              <el-option label="月报" value="monthly"></el-option>
            </el-select>
            <el-date-picker v-model="exportSearch.dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" style="width: 240px;"></el-date-picker>
            <el-input v-model="exportSearch.class" placeholder="班级名称" style="width: 150px;"></el-input>
            <el-button type="primary" icon="el-icon-search" @click="searchExportList">查询</el-button>
          </div>
          <el-table :data="pagedExportList" border style="width: 100%">
            <el-table-column type="index" label="序号" width="60"></el-table-column>
            <el-table-column prop="name" label="报表名称" width="200" show-overflow-tooltip></el-table-column>
            <el-table-column prop="type" label="类型" width="80">
              <template slot-scope="scope">
                <el-tag size="small">{{ scope.row.type === 'weekly' ? '周报' : '月报' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="class" label="班级" width="120"></el-table-column>
            <el-table-column prop="period" label="统计周期" width="180"></el-table-column>
            <el-table-column prop="createTime" label="生成时间" width="160"></el-table-column>
            <el-table-column prop="creator" label="生成人" width="100"></el-table-column>
            <el-table-column prop="status" label="状态" width="80">
              <template slot-scope="scope">
                <el-tag size="small" :type="scope.row.status === '已生成' ? 'success' : 'warning'">{{ scope.row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200" fixed="right">
              <template slot-scope="scope">
                <el-button type="text" size="small" icon="el-icon-view" @click="viewReport(scope.row)">查看</el-button>
                <el-button type="text" size="small" icon="el-icon-download" @click="exportPDF(scope.row)">PDF</el-button>
                <el-button type="text" size="small" icon="el-icon-download" @click="exportExcel(scope.row)">Excel</el-button>
                <el-button type="text" size="small" icon="el-icon-printer" @click="printReport(scope.row)">打印</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="pagination">
            <el-pagination background layout="total, prev, pager, next" :total="filteredExportList.length" :page-size="10" :current-page.sync="exportCurrentPage"></el-pagination>
          </div>
        </div>
      </el-tab-pane>

      <!-- 打印预览 -->
      <el-tab-pane label="打印预览" name="preview">
        <div class="preview-section">
          <div class="preview-toolbar">
            <el-button-group>
              <el-button type="primary" icon="el-icon-arrow-left" size="small">上一页</el-button>
              <el-button type="primary" icon="el-icon-arrow-right" size="small">下一页</el-button>
            </el-button-group>
            <span class="page-info">第 1 页 / 共 3 页</span>
            <el-button type="primary" icon="el-icon-printer" @click="printPreview">打印</el-button>
            <el-button type="success" icon="el-icon-download" @click="downloadPreview">下载PDF</el-button>
          </div>
          <div class="preview-content">
            <div class="report-paper">
              <div class="report-header">
                <h2>班级健康周报</h2>
                <div class="report-meta">
                  <span>班级：一年级1班</span>
                  <span>统计周期：2024年1月8日 - 2024年1月14日</span>
                  <span>生成时间：2024年1月15日</span>
                </div>
              </div>
              <div class="report-summary">
                <h3>本周健康概况</h3>
                <el-row :gutter="20">
                  <el-col :span="6">
                    <div class="summary-item">
                      <span class="summary-label">近视率</span>
                      <span class="summary-value">15.2%</span>
                    </div>
                  </el-col>
                  <el-col :span="6">
                    <div class="summary-item">
                      <span class="summary-label">肥胖率</span>
                      <span class="summary-value">12.5%</span>
                    </div>
                  </el-col>
                  <el-col :span="6">
                    <div class="summary-item">
                      <span class="summary-label">体质达标率</span>
                      <span class="summary-value">92.0%</span>
                    </div>
                  </el-col>
                  <el-col :span="6">
                    <div class="summary-item">
                      <span class="summary-label">请假人数</span>
                      <span class="summary-value">3人</span>
                    </div>
                  </el-col>
                </el-row>
              </div>
              <div class="report-chart-section">
                <h3>视力情况分析</h3>
                <div class="chart-placeholder">
                  <div class="css-pie-chart">
                    <div class="pie-segment" style="--value: 15; --color: #409eff;"></div>
                    <div class="pie-segment" style="--value: 85; --color: #67c23a;"></div>
                    <div class="pie-center-text">15.2%</div>
                  </div>
                  <div class="chart-legend">
                    <span><i style="background: #409eff;"></i> 近视 15.2%</span>
                    <span><i style="background: #67c23a;"></i> 正常 84.8%</span>
                  </div>
                </div>
              </div>
              <div class="report-table-section">
                <h3>本周健康事件记录</h3>
                <table class="report-table">
                  <thead>
                    <tr>
                      <th>日期</th>
                      <th>事件类型</th>
                      <th>涉及人数</th>
                      <th>处理情况</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>1月10日</td>
                      <td>感冒请假</td>
                      <td>2人</td>
                      <td>已康复返校</td>
                    </tr>
                    <tr>
                      <td>1月12日</td>
                      <td>体检复查</td>
                      <td>5人</td>
                      <td>已完成复查</td>
                    </tr>
                    <tr>
                      <td>1月13日</td>
                      <td>健康讲座</td>
                      <td>全班</td>
                      <td>护眼知识普及</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="report-footer">
                <span>报告生成人：张老师</span>
                <span>审核人：李主任</span>
                <span>学校健康管理系统</span>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 模板编辑对话框 -->
    <el-dialog :title="templateDialogTitle" :visible.sync="templateDialogVisible" width="600px">
      <el-form :model="templateForm" :rules="templateRules" ref="templateForm" label-width="100px">
        <el-form-item label="模板名称" prop="name">
          <el-input v-model="templateForm.name" placeholder="请输入模板名称"></el-input>
        </el-form-item>
        <el-form-item label="报表类型" prop="type">
          <el-radio-group v-model="templateForm.type">
            <el-radio label="weekly">周报</el-radio>
            <el-radio label="monthly">月报</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="包含内容">
          <el-checkbox-group v-model="templateForm.contents">
            <el-checkbox label="myopia">近视情况</el-checkbox>
            <el-checkbox label="obesity">肥胖情况</el-checkbox>
            <el-checkbox label="fitness">体质达标</el-checkbox>
            <el-checkbox label="disease">发病率</el-checkbox>
            <el-checkbox label="vaccine">疫苗接种</el-checkbox>
            <el-checkbox label="checkup">体检情况</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="模板说明">
          <el-input type="textarea" v-model="templateForm.description" :rows="3" placeholder="请输入模板说明"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="templateDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitTemplate">确定</el-button>
      </span>
    </el-dialog>

    <!-- 报表查看对话框 -->
    <el-dialog title="报表详情" :visible.sync="reportDialogVisible" width="80%" top="5vh">
      <div class="report-detail" v-if="currentReport">
        <el-descriptions :column="4" border>
          <el-descriptions-item label="报表名称">{{ currentReport.name }}</el-descriptions-item>
          <el-descriptions-item label="报表类型">{{ currentReport.type === 'weekly' ? '周报' : '月报' }}</el-descriptions-item>
          <el-descriptions-item label="班级">{{ currentReport.class }}</el-descriptions-item>
          <el-descriptions-item label="统计周期">{{ currentReport.period }}</el-descriptions-item>
          <el-descriptions-item label="生成时间">{{ currentReport.createTime }}</el-descriptions-item>
          <el-descriptions-item label="生成人">{{ currentReport.creator }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag size="small" :type="currentReport.status === '已生成' ? 'success' : 'warning'">{{ currentReport.status }}</el-tag>
          </el-descriptions-item>
        </el-descriptions>
        <div style="margin-top: 20px;">
          <h4>报表内容预览</h4>
          <div class="report-preview-content">
            <p>近视率：15.2% | 肥胖率：12.5% | 体质达标率：92.0%</p>
            <p>本周请假人数：3人 | 体检完成率：100%</p>
          </div>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="reportDialogVisible = false">关闭</el-button>
        <el-button type="primary" icon="el-icon-download" @click="exportPDF(currentReport)">导出PDF</el-button>
        <el-button type="success" icon="el-icon-download" @click="exportExcel(currentReport)">导出Excel</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'HealthReport',
  data() {
    return {
      activeTab: 'config',
      reportConfig: {
        type: 'weekly',
        name: '班级健康周报',
        period: null,
        contents: ['myopia', 'obesity', 'fitness', 'checkup'],
        chartTypes: ['pie', 'bar', 'table'],
        generateTime: new Date(2024, 1, 1, 8, 0),
        autoGenerate: true
      },
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
      ],
      templateList: [
        { id: 1, name: '标准周报模板', type: 'weekly', contents: '近视、肥胖、体质达标、体检情况', createTime: '2024-01-10 10:30', isDefault: true },
        { id: 2, name: '详细月报模板', type: 'monthly', contents: '全部健康指标统计', createTime: '2024-01-08 14:20', isDefault: false },
        { id: 3, name: '简版周报模板', type: 'weekly', contents: '近视、体质达标', createTime: '2024-01-05 09:15', isDefault: false }
      ],
      templateDialogVisible: false,
      templateDialogTitle: '新建模板',
      isEditTemplate: false,
      editTemplateItem: null,
      templateForm: { name: '', type: 'weekly', contents: [], description: '' },
      templateRules: {
        name: [{ required: true, message: '请输入模板名称', trigger: 'blur' }],
        type: [{ required: true, message: '请选择报表类型', trigger: 'change' }]
      },
      exportSearch: { type: '', dateRange: null, class: '' },
      exportCurrentPage: 1,
      exportList: [
        { id: 1, name: '一年级1班健康周报', type: 'weekly', class: '一年级1班', period: '2024-01-08 至 2024-01-14', createTime: '2024-01-15 08:30', creator: '张老师', status: '已生成' },
        { id: 2, name: '一年级2班健康周报', type: 'weekly', class: '一年级2班', period: '2024-01-08 至 2024-01-14', createTime: '2024-01-15 08:35', creator: '张老师', status: '已生成' },
        { id: 3, name: '二年级健康月报', type: 'monthly', class: '二年级', period: '2024-01-01 至 2024-01-31', createTime: '2024-01-15 09:00', creator: '李老师', status: '生成中' },
        { id: 4, name: '全校健康周报', type: 'weekly', class: '全校', period: '2024-01-08 至 2024-01-14', createTime: '2024-01-15 10:00', creator: '王主任', status: '已生成' },
        { id: 5, name: '三年级1班健康周报', type: 'weekly', class: '三年级1班', period: '2024-01-08 至 2024-01-14', createTime: '2024-01-15 08:40', creator: '赵老师', status: '已生成' }
      ],
      reportDialogVisible: false,
      currentReport: null
    };
  },
  computed: {
    filteredExportList() {
      return this.exportList.filter(item => {
        const matchType = !this.exportSearch.type || item.type === this.exportSearch.type;
        const matchClass = !this.exportSearch.class || item.class.includes(this.exportSearch.class);
        return matchType && matchClass;
      });
    },
    pagedExportList() {
      const start = (this.exportCurrentPage - 1) * 10;
      return this.filteredExportList.slice(start, start + 10);
    }
  },
  methods: {
    saveReportConfig() {
      this.$message.success('报表配置已保存');
    },
    previewReport() {
      this.activeTab = 'preview';
      this.$message.success('正在生成报表预览...');
    },
    resetReportConfig() {
      this.reportConfig = {
        type: 'weekly',
        name: '班级健康周报',
        period: null,
        contents: ['myopia', 'obesity', 'fitness', 'checkup'],
        chartTypes: ['pie', 'bar', 'table'],
        generateTime: new Date(2024, 1, 1, 8, 0),
        autoGenerate: true
      };
      this.$message.info('配置已重置');
    },
    addTemplate() {
      this.isEditTemplate = false;
      this.editTemplateItem = null;
      this.templateDialogTitle = '新建模板';
      this.templateForm = { name: '', type: 'weekly', contents: [], description: '' };
      this.templateDialogVisible = true;
    },
    editTemplate(row) {
      this.isEditTemplate = true;
      this.editTemplateItem = row;
      this.templateDialogTitle = '编辑模板';
      this.templateForm = { name: row.name, type: row.type, contents: [], description: '' };
      this.templateDialogVisible = true;
    },
    previewTemplate(row) {
      this.activeTab = 'preview';
      this.$message.success('正在预览模板：' + row.name);
    },
    setDefaultTemplate(row) {
      this.templateList.forEach(t => t.isDefault = false);
      row.isDefault = true;
      this.$message.success('已设为默认模板');
    },
    deleteTemplate(row) {
      this.$confirm('确定删除模板 "' + row.name + '" 吗？', '提示', { type: 'warning' }).then(() => {
        const index = this.templateList.findIndex(t => t.id === row.id);
        if (index > -1) this.templateList.splice(index, 1);
        this.$message.success('删除成功');
      }).catch(() => {});
    },
    submitTemplate() {
      this.$refs.templateForm.validate((valid) => {
        if (valid) {
          if (this.isEditTemplate && this.editTemplateItem) {
            this.editTemplateItem.name = this.templateForm.name;
            this.editTemplateItem.type = this.templateForm.type;
            this.$message.success('模板更新成功');
          } else {
            this.templateList.push({
              id: Date.now(),
              name: this.templateForm.name,
              type: this.templateForm.type,
              contents: '近视、肥胖、体质达标',
              createTime: new Date().toLocaleString(),
              isDefault: false
            });
            this.$message.success('模板创建成功');
          }
          this.templateDialogVisible = false;
        }
      });
    },
    searchExportList() {
      this.exportCurrentPage = 1;
      this.$message.success('查询完成，共找到 ' + this.filteredExportList.length + ' 条记录');
    },
    viewReport(row) {
      this.currentReport = row;
      this.reportDialogVisible = true;
    },
    exportPDF(row) {
      this.$message.success('PDF导出成功：' + (row ? row.name : '报表'));
    },
    exportExcel(row) {
      this.$message.success('Excel导出成功：' + (row ? row.name : '报表'));
    },
    printReport(row) {
      this.$message.success('正在打印：' + row.name);
    },
    printPreview() {
      this.$message.success('正在打印预览页面...');
    },
    downloadPreview() {
      this.$message.success('PDF下载成功');
    }
  }
};
</script>

<style scoped>
.health-report {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.config-section, .template-section, .export-section {
  padding: 20px 0;
}

.template-header {
  margin-bottom: 20px;
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

.preview-section {
  padding: 20px 0;
}

.preview-toolbar {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
  padding: 10px;
  background: #f5f7fa;
  border-radius: 6px;
}

.page-info {
  color: #606266;
}

.preview-content {
  background: #f0f2f5;
  padding: 30px;
  border-radius: 8px;
  min-height: 500px;
  display: flex;
  justify-content: center;
}

.report-paper {
  width: 800px;
  background: #fff;
  padding: 40px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  font-family: 'SimSun', serif;
}

.report-header {
  text-align: center;
  border-bottom: 2px solid #303133;
  padding-bottom: 20px;
}

.report-header h2 {
  margin: 0;
  font-size: 24px;
  color: #303133;
}

.report-meta {
  margin-top: 10px;
  color: #606266;
  font-size: 14px;
}

.report-meta span {
  margin: 0 15px;
}

.report-summary {
  margin: 20px 0;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 6px;
}

.report-summary h3 {
  margin: 0 0 15px 0;
  font-size: 16px;
  color: #303133;
}

.summary-item {
  text-align: center;
}

.summary-label {
  display: block;
  font-size: 14px;
  color: #909399;
  margin-bottom: 5px;
}

.summary-value {
  display: block;
  font-size: 20px;
  font-weight: bold;
  color: #303133;
}

.report-chart-section {
  margin: 20px 0;
}

.report-chart-section h3 {
  font-size: 16px;
  color: #303133;
  margin-bottom: 15px;
}

.chart-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 30px;
  padding: 20px;
}

.css-pie-chart {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: conic-gradient(#409eff 0% 15%, #67c23a 15% 100%);
  position: relative;
}

.pie-center-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 50px;
  height: 50px;
  background: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

.chart-legend {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.chart-legend span {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.chart-legend i {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.report-table-section {
  margin: 20px 0;
}

.report-table-section h3 {
  font-size: 16px;
  color: #303133;
  margin-bottom: 15px;
}

.report-table {
  width: 100%;
  border-collapse: collapse;
}

.report-table th, .report-table td {
  border: 1px solid #ebeef5;
  padding: 10px;
  text-align: center;
}

.report-table th {
  background: #f5f7fa;
  font-weight: normal;
  color: #606266;
}

.report-footer {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
  text-align: center;
  color: #909399;
  font-size: 12px;
}

.report-footer span {
  margin: 0 20px;
}

.report-preview-content {
  padding: 20px;
  background: #f5f7fa;
  border-radius: 6px;
  line-height: 2;
}
</style>