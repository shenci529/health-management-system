<template>
  <div class="push-message">
    <el-tabs v-model="activeTab" type="card">
      <!-- 消息模板 -->
      <el-tab-pane label="消息模板" name="template">
        <div class="template-header">
          <el-button type="primary" icon="el-icon-plus" @click="addTemplate">新建模板</el-button>
        </div>
        <el-table :data="templateList" border style="width: 100%">
          <el-table-column type="index" label="序号" width="60"></el-table-column>
          <el-table-column prop="name" label="模板名称" width="200"></el-table-column>
          <el-table-column prop="type" label="消息类型" width="100">
            <template slot-scope="scope">
              <el-tag size="small" :type="scope.row.type === 'sms' ? 'warning' : 'primary'">{{ scope.row.type === 'sms' ? '短信' : '站内信' }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="category" label="模板分类" width="120">
            <template slot-scope="scope">
              <span>{{ getCategoryName(scope.row.category) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="content" label="模板内容" show-overflow-tooltip></el-table-column>
          <el-table-column prop="createTime" label="创建时间" width="160"></el-table-column>
          <el-table-column prop="useCount" label="使用次数" width="80"></el-table-column>
          <el-table-column label="操作" width="150">
            <template slot-scope="scope">
              <el-button type="text" size="small" @click="editTemplate(scope.row)">编辑</el-button>
              <el-button type="text" size="small" @click="useTemplate(scope.row)">使用</el-button>
              <el-button type="text" size="small" style="color: #f56c6c;" @click="deleteTemplate(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- 批量推送 -->
      <el-tab-pane label="批量推送" name="push">
        <div class="push-form">
          <el-form :model="pushForm" :rules="pushRules" ref="pushForm" label-width="100px" style="max-width: 800px;">
            <el-form-item label="推送方式" prop="method">
              <el-checkbox-group v-model="pushForm.methods">
                <el-checkbox label="sms">短信推送</el-checkbox>
                <el-checkbox label="app">站内信</el-checkbox>
                <el-checkbox label="wechat">微信推送</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            <el-form-item label="推送对象" prop="target">
              <el-radio-group v-model="pushForm.targetType">
                <el-radio label="all">全校师生</el-radio>
                <el-radio label="grade">按年级</el-radio>
                <el-radio label="class">按班级</el-radio>
                <el-radio label="role">按角色</el-radio>
              </el-radio-group>
              <div v-if="pushForm.targetType !== 'all'" style="margin-top: 10px;">
                <el-tree
                  ref="targetTree"
                  :data="targetTreeData"
                  show-checkbox
                  node-key="id"
                  :default-expanded-keys="['all']"
                  :props="{ children: 'children', label: 'label' }">
                </el-tree>
              </div>
            </el-form-item>
            <el-form-item label="选择模板">
              <el-select v-model="pushForm.templateId" placeholder="选择消息模板" clearable style="width: 300px;" @change="selectTemplate">
                <el-option v-for="item in templateList" :key="item.id" :label="item.name" :value="item.id"></el-option>
              </el-select>
              <el-button type="text" icon="el-icon-plus" @click="addTemplate">新建模板</el-button>
            </el-form-item>
            <el-form-item label="消息标题" prop="title">
              <el-input v-model="pushForm.title" placeholder="请输入消息标题"></el-input>
            </el-form-item>
            <el-form-item label="消息内容" prop="content">
              <el-input type="textarea" v-model="pushForm.content" :rows="6" placeholder="请输入消息内容"></el-input>
              <div class="content-tip">
                <span>支持变量：{学生姓名}、{班级}、{日期}、{时间}</span>
              </div>
            </el-form-item>
            <el-form-item label="发送时间">
              <el-radio-group v-model="pushForm.sendType">
                <el-radio label="now">立即发送</el-radio>
                <el-radio label="schedule">定时发送</el-radio>
              </el-radio-group>
              <el-date-picker v-if="pushForm.sendType === 'schedule'" v-model="pushForm.scheduleTime" type="datetime" placeholder="选择发送时间" style="width: 200px; margin-left: 15px;"></el-date-picker>
            </el-form-item>
            <el-form-item label="预计接收人数">
              <span class="receiver-count">{{ estimatedReceivers }} 人</span>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="sendPush">发送推送</el-button>
              <el-button @click="previewPush">预览消息</el-button>
              <el-button @click="resetPushForm">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>

      <!-- 推送记录 -->
      <el-tab-pane label="推送记录" name="record">
        <div class="search-bar">
          <el-select v-model="recordSearch.method" placeholder="推送方式" clearable style="width: 120px;">
            <el-option label="短信" value="sms"></el-option>
            <el-option label="站内信" value="app"></el-option>
            <el-option label="微信" value="wechat"></el-option>
          </el-select>
          <el-select v-model="recordSearch.status" placeholder="发送状态" clearable style="width: 120px;">
            <el-option label="发送成功" value="success"></el-option>
            <el-option label="发送中" value="sending"></el-option>
            <el-option label="发送失败" value="failed"></el-option>
          </el-select>
          <el-date-picker v-model="recordSearch.dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" style="width: 240px;"></el-date-picker>
          <el-input v-model="recordSearch.keyword" placeholder="搜索标题" style="width: 200px;" clearable></el-input>
          <el-button type="primary" icon="el-icon-search" @click="searchRecords">查询</el-button>
        </div>
        <el-table :data="pagedRecords" border style="width: 100%">
          <el-table-column type="index" label="序号" width="60"></el-table-column>
          <el-table-column prop="title" label="消息标题" width="200" show-overflow-tooltip></el-table-column>
          <el-table-column prop="method" label="推送方式" width="100">
            <template slot-scope="scope">
              <el-tag size="small" :type="getMethodTagType(scope.row.method)">{{ getMethodName(scope.row.method) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="target" label="推送对象" width="120"></el-table-column>
          <el-table-column prop="receiverCount" label="接收人数" width="80"></el-table-column>
          <el-table-column prop="successCount" label="成功数" width="80">
            <template slot-scope="scope">
              <span style="color: #67c23a;">{{ scope.row.successCount }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="failCount" label="失败数" width="80">
            <template slot-scope="scope">
              <span :style="{ color: scope.row.failCount > 0 ? '#f56c6c' : '#909399' }">{{ scope.row.failCount }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="sender" label="发送人" width="100"></el-table-column>
          <el-table-column prop="sendTime" label="发送时间" width="160"></el-table-column>
          <el-table-column prop="status" label="状态" width="80">
            <template slot-scope="scope">
              <el-tag size="small" :type="getStatusTagType(scope.row.status)">{{ getStatusName(scope.row.status) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150">
            <template slot-scope="scope">
              <el-button type="text" size="small" @click="viewRecordDetail(scope.row)">详情</el-button>
              <el-button type="text" size="small" v-if="scope.row.status === 'failed'" @click="resendRecord(scope.row)">重发</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="pagination">
          <el-pagination background layout="total, prev, pager, next" :total="filteredRecords.length" :page-size="10" :current-page.sync="recordCurrentPage"></el-pagination>
        </div>
      </el-tab-pane>

      <!-- 推送统计 -->
      <el-tab-pane label="统计分析" name="stats">
        <div class="stats-section">
          <div class="stats-summary">
            <el-row :gutter="20">
              <el-col :span="4">
                <div class="stat-card" style="border-left: 4px solid #409eff;">
                  <span class="stat-value">{{ statsSummary.total }}</span>
                  <span class="stat-label">总推送数</span>
                </div>
              </el-col>
              <el-col :span="4">
                <div class="stat-card" style="border-left: 4px solid #67c23a;">
                  <span class="stat-value">{{ statsSummary.success }}</span>
                  <span class="stat-label">成功数</span>
                </div>
              </el-col>
              <el-col :span="4">
                <div class="stat-card" style="border-left: 4px solid #f56c6c;">
                  <span class="stat-value">{{ statsSummary.failed }}</span>
                  <span class="stat-label">失败数</span>
                </div>
              </el-col>
              <el-col :span="4">
                <div class="stat-card" style="border-left: 4px solid #e6a23c;">
                  <span class="stat-value">{{ statsSummary.sms }}</span>
                  <span class="stat-label">短信推送</span>
                </div>
              </el-col>
              <el-col :span="4">
                <div class="stat-card" style="border-left: 4px solid #909399;">
                  <span class="stat-value">{{ statsSummary.app }}</span>
                  <span class="stat-label">站内信</span>
                </div>
              </el-col>
              <el-col :span="4">
                <div class="stat-card" style="border-left: 4px solid #00bcd4;">
                  <span class="stat-value">{{ statsSummary.wechat }}</span>
                  <span class="stat-label">微信推送</span>
                </div>
              </el-col>
            </el-row>
          </div>

          <div class="charts-section">
            <el-row :gutter="20">
              <el-col :span="6">
                <div class="chart-card">
                  <div class="chart-title">推送方式占比</div>
                  <div class="pie-chart-container">
                    <div class="pie-chart" :style="{ background: generatePieGradient(methodPieData) }">
                      <div class="pie-center"></div>
                    </div>
                    <div class="pie-legend">
                      <div class="legend-item" v-for="item in methodPieData" :key="item.label">
                        <span class="legend-color" :style="{ background: item.color }"></span>
                        <span>{{ item.label }}</span>
                        <span>{{ item.value }}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="chart-card">
                  <div class="chart-title">发送成功率</div>
                  <div class="success-rate">
                    <div class="rate-circle" :style="{ background: '#67c23a' }">
                      <span class="rate-value">{{ successRate }}%</span>
                    </div>
                    <div class="rate-info">
                      <span>成功 {{ statsSummary.success }} 条</span>
                      <span>失败 {{ statsSummary.failed }} 条</span>
                    </div>
                  </div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="chart-card">
                  <div class="chart-title">近7天推送趋势</div>
                  <div class="trend-chart">
                    <div class="trend-bars">
                      <div class="trend-bar" v-for="(item, index) in trendData" :key="index">
                        <div class="bar-fill" :style="{ height: (item.value / maxTrend * 100) + '%', background: '#409eff' }"></div>
                        <span class="bar-label">{{ item.day }}</span>
                        <span class="bar-value">{{ item.value }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 模板编辑对话框 -->
    <el-dialog :title="templateDialogTitle" :visible.sync="templateDialogVisible" width="500px">
      <el-form :model="templateForm" :rules="templateRules" ref="templateForm" label-width="100px">
        <el-form-item label="模板名称" prop="name">
          <el-input v-model="templateForm.name" placeholder="请输入模板名称"></el-input>
        </el-form-item>
        <el-form-item label="消息类型" prop="type">
          <el-radio-group v-model="templateForm.type">
            <el-radio label="sms">短信</el-radio>
            <el-radio label="app">站内信</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="模板分类" prop="category">
          <el-select v-model="templateForm.category" placeholder="请选择分类" style="width: 100%;">
            <el-option label="健康通知" value="health"></el-option>
            <el-option label="活动通知" value="activity"></el-option>
            <el-option label="预警通知" value="warning"></el-option>
            <el-option label="体检通知" value="checkup"></el-option>
            <el-option label="其他" value="other"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="模板内容" prop="content">
          <el-input type="textarea" v-model="templateForm.content" :rows="4" placeholder="请输入模板内容"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="templateDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitTemplate">确定</el-button>
      </span>
    </el-dialog>

    <!-- 消息预览对话框 -->
    <el-dialog title="消息预览" :visible.sync="previewDialogVisible" width="400px">
      <div class="message-preview">
        <div class="preview-header">
          <span class="preview-title">{{ pushForm.title || '消息标题' }}</span>
        </div>
        <div class="preview-body">
          <p>{{ pushForm.content || '消息内容预览...' }}</p>
        </div>
        <div class="preview-footer">
          <span>预计接收人数：{{ estimatedReceivers }} 人</span>
          <span>推送方式：{{ getSelectedMethods() }}</span>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="previewDialogVisible = false">关闭</el-button>
      </span>
    </el-dialog>

    <!-- 推送详情对话框 -->
    <el-dialog title="推送详情" :visible.sync="recordDetailVisible" width="600px">
      <div class="record-detail" v-if="currentRecord">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="消息标题">{{ currentRecord.title }}</el-descriptions-item>
          <el-descriptions-item label="推送方式">{{ getMethodName(currentRecord.method) }}</el-descriptions-item>
          <el-descriptions-item label="推送对象">{{ currentRecord.target }}</el-descriptions-item>
          <el-descriptions-item label="接收人数">{{ currentRecord.receiverCount }}</el-descriptions-item>
          <el-descriptions-item label="成功数">{{ currentRecord.successCount }}</el-descriptions-item>
          <el-descriptions-item label="失败数">{{ currentRecord.failCount }}</el-descriptions-item>
          <el-descriptions-item label="发送人">{{ currentRecord.sender }}</el-descriptions-item>
          <el-descriptions-item label="发送时间">{{ currentRecord.sendTime }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag size="small" :type="getStatusTagType(currentRecord.status)">{{ getStatusName(currentRecord.status) }}</el-tag>
          </el-descriptions-item>
        </el-descriptions>
        <div class="record-content" style="margin-top: 20px;">
          <h4>消息内容</h4>
          <p>{{ currentRecord.content }}</p>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="recordDetailVisible = false">关闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'PushMessage',
  data() {
    return {
      activeTab: 'template',
      templateList: [
        { id: 1, name: '体检通知模板', type: 'sms', category: 'checkup', content: '尊敬的家长，您的孩子{学生姓名}将于{日期}进行体检，请做好准备。', createTime: '2024-01-10 10:30', useCount: 25 },
        { id: 2, name: '流感预警模板', type: 'app', category: 'warning', content: '近期流感高发，请家长注意孩子健康防护。', createTime: '2024-01-08 14:20', useCount: 18 },
        { id: 3, name: '活动通知模板', type: 'sms', category: 'activity', content: '{班级}将于{日期}举办健康讲座，请家长准时参加。', createTime: '2024-01-05 09:15', useCount: 12 },
        { id: 4, name: '健康提醒模板', type: 'app', category: 'health', content: '温馨提示：请督促孩子保持良好作息，注意用眼卫生。', createTime: '2024-01-03 16:40', useCount: 30 }
      ],
      templateDialogVisible: false,
      templateDialogTitle: '新建模板',
      isEditTemplate: false,
      editTemplateItem: null,
      templateForm: { name: '', type: 'sms', category: '', content: '' },
      templateRules: {
        name: [{ required: true, message: '请输入模板名称', trigger: 'blur' }],
        type: [{ required: true, message: '请选择消息类型', trigger: 'change' }],
        category: [{ required: true, message: '请选择模板分类', trigger: 'change' }],
        content: [{ required: true, message: '请输入模板内容', trigger: 'blur' }]
      },
      pushForm: {
        methods: ['app'],
        targetType: 'all',
        templateId: '',
        title: '',
        content: '',
        sendType: 'now',
        scheduleTime: null
      },
      pushRules: {
        title: [{ required: true, message: '请输入消息标题', trigger: 'blur' }],
        content: [{ required: true, message: '请输入消息内容', trigger: 'blur' }]
      },
      targetTreeData: [
        {
          id: 'all',
          label: '全部',
          children: [
            { id: 'role_parent', label: '家长' },
            { id: 'role_teacher', label: '教师' },
            { id: 'role_student', label: '学生' },
            { id: 'grade1', label: '一年级', children: [
              { id: 'class1-1', label: '一年级1班' },
              { id: 'class1-2', label: '一年级2班' }
            ]},
            { id: 'grade2', label: '二年级', children: [
              { id: 'class2-1', label: '二年级1班' },
              { id: 'class2-2', label: '二年级2班' }
            ]}
          ]
        }
      ],
      estimatedReceivers: 2580,
      previewDialogVisible: false,
      recordSearch: { method: '', status: '', dateRange: null, keyword: '' },
      recordCurrentPage: 1,
      pushRecords: [
        { id: 1, title: '体检通知', method: 'sms', target: '全校家长', receiverCount: 1200, successCount: 1185, failCount: 15, sender: '张医生', sendTime: '2024-01-15 10:30', status: 'success', content: '体检通知内容...' },
        { id: 2, title: '流感预警', method: 'app', target: '全校师生', receiverCount: 2580, successCount: 2550, failCount: 30, sender: '李医生', sendTime: '2024-01-14 14:20', status: 'success', content: '流感预警内容...' },
        { id: 3, title: '健康讲座通知', method: 'wechat', target: '一年级家长', receiverCount: 450, successCount: 420, failCount: 30, sender: '王老师', sendTime: '2024-01-13 09:15', status: 'sending', content: '讲座通知内容...' },
        { id: 4, title: '疫苗接种提醒', method: 'sms', target: '二年级家长', receiverCount: 380, successCount: 350, failCount: 30, sender: '赵医生', sendTime: '2024-01-12 16:40', status: 'failed', content: '疫苗提醒内容...' },
        { id: 5, title: '运动会通知', method: 'app', target: '全校师生', receiverCount: 2580, successCount: 2580, failCount: 0, sender: '体育组', sendTime: '2024-01-11 08:00', status: 'success', content: '运动会通知...' }
      ],
      recordDetailVisible: false,
      currentRecord: null,
      statsSummary: { total: 156, success: 148, failed: 8, sms: 45, app: 80, wechat: 31 },
      methodPieData: [
        { label: '短信', value: 30, color: '#e6a23c' },
        { label: '站内信', value: 50, color: '#409eff' },
        { label: '微信', value: 20, color: '#00bcd4' }
      ],
      trendData: [
        { day: '周一', value: 25 },
        { day: '周二', value: 18 },
        { day: '周三', value: 32 },
        { day: '周四', value: 28 },
        { day: '周五', value: 45 },
        { day: '周六', value: 12 },
        { day: '周日', value: 8 }
      ]
    };
  },
  computed: {
    successRate() {
      const total = this.statsSummary.success + this.statsSummary.failed;
      return Math.round((this.statsSummary.success / total) * 100);
    },
    maxTrend() {
      return Math.max(...this.trendData.map(d => d.value));
    },
    filteredRecords() {
      return this.pushRecords.filter(item => {
        const matchMethod = !this.recordSearch.method || item.method === this.recordSearch.method;
        const matchStatus = !this.recordSearch.status || item.status === this.recordSearch.status;
        const matchKeyword = !this.recordSearch.keyword || item.title.includes(this.recordSearch.keyword);
        return matchMethod && matchStatus && matchKeyword;
      });
    },
    pagedRecords() {
      const start = (this.recordCurrentPage - 1) * 10;
      return this.filteredRecords.slice(start, start + 10);
    }
  },
  methods: {
    getCategoryName(category) {
      const map = { health: '健康通知', activity: '活动通知', warning: '预警通知', checkup: '体检通知', other: '其他' };
      return map[category] || category;
    },
    getMethodName(method) {
      const map = { sms: '短信', app: '站内信', wechat: '微信' };
      return map[method] || method;
    },
    getMethodTagType(method) {
      const map = { sms: 'warning', app: 'primary', wechat: 'success' };
      return map[method] || '';
    },
    getStatusName(status) {
      const map = { success: '发送成功', sending: '发送中', failed: '发送失败' };
      return map[status] || status;
    },
    getStatusTagType(status) {
      const map = { success: 'success', sending: 'warning', failed: 'danger' };
      return map[status] || '';
    },
    generatePieGradient(data) {
      const total = data.reduce((sum, item) => sum + item.value, 0);
      let gradient = 'conic-gradient(';
      let currentAngle = 0;
      data.forEach((item, index) => {
        const angle = (item.value / total) * 360;
        gradient += `${item.color} ${currentAngle}deg ${currentAngle + angle}deg`;
        if (index < data.length - 1) gradient += ', ';
        currentAngle += angle;
      });
      gradient += ')';
      return gradient;
    },
    getSelectedMethods() {
      return this.pushForm.methods.map(m => this.getMethodName(m)).join('、');
    },
    addTemplate() {
      this.isEditTemplate = false;
      this.editTemplateItem = null;
      this.templateDialogTitle = '新建模板';
      this.templateForm = { name: '', type: 'sms', category: '', content: '' };
      this.templateDialogVisible = true;
    },
    editTemplate(row) {
      this.isEditTemplate = true;
      this.editTemplateItem = row;
      this.templateDialogTitle = '编辑模板';
      this.templateForm = { name: row.name, type: row.type, category: row.category, content: row.content };
      this.templateDialogVisible = true;
    },
    useTemplate(row) {
      this.activeTab = 'push';
      this.pushForm.templateId = row.id;
      this.pushForm.title = row.name;
      this.pushForm.content = row.content;
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
            this.editTemplateItem.category = this.templateForm.category;
            this.editTemplateItem.content = this.templateForm.content;
            this.$message.success('模板更新成功');
          } else {
            this.templateList.push({
              id: Date.now(),
              name: this.templateForm.name,
              type: this.templateForm.type,
              category: this.templateForm.category,
              content: this.templateForm.content,
              createTime: new Date().toLocaleString(),
              useCount: 0
            });
            this.$message.success('模板创建成功');
          }
          this.templateDialogVisible = false;
        }
      });
    },
    selectTemplate(id) {
      const template = this.templateList.find(t => t.id === id);
      if (template) {
        this.pushForm.title = template.name;
        this.pushForm.content = template.content;
      }
    },
    sendPush() {
      this.$refs.pushForm.validate((valid) => {
        if (valid) {
          this.$message.success('消息推送已发送，预计接收 ' + this.estimatedReceivers + ' 人');
          this.resetPushForm();
        }
      });
    },
    previewPush() {
      this.previewDialogVisible = true;
    },
    resetPushForm() {
      this.pushForm = {
        methods: ['app'],
        targetType: 'all',
        templateId: '',
        title: '',
        content: '',
        sendType: 'now',
        scheduleTime: null
      };
    },
    searchRecords() {
      this.recordCurrentPage = 1;
      this.$message.success('查询完成，共找到 ' + this.filteredRecords.length + ' 条记录');
    },
    viewRecordDetail(row) {
      this.currentRecord = row;
      this.recordDetailVisible = true;
    },
    resendRecord(row) {
      this.$confirm('确定重新发送该消息吗？', '提示', { type: 'info' }).then(() => {
        row.status = 'sending';
        this.$message.success('消息已重新发送');
      }).catch(() => {});
    }
  }
};
</script>

<style scoped>
.push-message {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.template-header {
  margin-bottom: 20px;
}

.push-form {
  padding: 20px;
}

.content-tip {
  margin-top: 5px;
  color: #909399;
  font-size: 12px;
}

.receiver-count {
  color: #409eff;
  font-weight: bold;
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

.stats-section {
  padding: 20px 0;
}

.stats-summary {
  margin-bottom: 20px;
}

.stat-card {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  text-align: center;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 5px;
}

.charts-section {
  margin-top: 20px;
}

.chart-card {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.chart-title {
  font-size: 14px;
  color: #303133;
  margin-bottom: 15px;
  text-align: center;
}

.pie-chart-container {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 10px;
}

.pie-chart {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  position: relative;
}

.pie-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 50px;
  height: 50px;
  background: #fff;
  border-radius: 50%;
}

.pie-legend {
  flex: 1;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 0;
  font-size: 12px;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.success-rate {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 20px;
}

.rate-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rate-value {
  color: #fff;
  font-size: 18px;
  font-weight: bold;
}

.rate-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-size: 12px;
  color: #606266;
}

.trend-chart {
  padding: 10px;
}

.trend-bars {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  height: 150px;
  border-bottom: 1px solid #ebeef5;
}

.trend-bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 40px;
}

.bar-fill {
  width: 30px;
  border-radius: 4px 4px 0 0;
  transition: height 0.5s;
}

.bar-label {
  margin-top: 10px;
  font-size: 12px;
  color: #909399;
}

.bar-value {
  font-size: 12px;
  color: #303133;
  margin-bottom: 5px;
}

.message-preview {
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
}

.preview-header {
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 10px;
}

.preview-title {
  font-size: 16px;
  color: #303133;
}

.preview-body {
  padding: 15px 0;
  color: #606266;
  line-height: 1.8;
}

.preview-footer {
  border-top: 1px solid #ebeef5;
  padding-top: 10px;
  font-size: 12px;
  color: #909399;
}

.preview-footer span {
  margin-right: 20px;
}

.record-detail {
  padding: 10px;
}

.record-content h4 {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #606266;
}

.record-content p {
  color: #303133;
  line-height: 1.8;
}
</style>