<template>
  <div class="announcement-manage">
    <el-tabs v-model="activeTab" type="card">
      <!-- 公告发布 -->
      <el-tab-pane label="公告发布" name="publish">
        <div class="publish-form">
          <el-form :model="announcementForm" :rules="announcementRules" ref="announcementForm" label-width="100px" style="max-width: 800px;">
            <el-form-item label="公告标题" prop="title">
              <el-input v-model="announcementForm.title" placeholder="请输入公告标题"></el-input>
            </el-form-item>
            <el-form-item label="公告分类" prop="category">
              <el-select v-model="announcementForm.category" placeholder="请选择分类" style="width: 200px;">
                <el-option label="健康通知" value="health"></el-option>
                <el-option label="活动公告" value="activity"></el-option>
                <el-option label="政策通知" value="policy"></el-option>
                <el-option label="紧急通知" value="urgent"></el-option>
                <el-option label="其他" value="other"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="发布范围" prop="scope">
              <el-radio-group v-model="announcementForm.scope">
                <el-radio label="all">全校发布</el-radio>
                <el-radio label="grade">年级发布</el-radio>
                <el-radio label="class">班级发布</el-radio>
              </el-radio-group>
              <div v-if="announcementForm.scope !== 'all'" style="margin-top: 10px;">
                <el-tree
                  ref="scopeTree"
                  :data="scopeTreeData"
                  show-checkbox
                  node-key="id"
                  :default-expanded-keys="['all']"
                  :props="{ children: 'children', label: 'label' }">
                </el-tree>
              </div>
            </el-form-item>
            <el-form-item label="公告内容" prop="content">
              <el-input type="textarea" v-model="announcementForm.content" :rows="6" placeholder="请输入公告内容"></el-input>
            </el-form-item>
            <el-form-item label="附件上传">
              <el-upload action="#" :auto-upload="false" :file-list="fileList" :limit="3">
                <el-button size="small" type="primary">上传附件</el-button>
                <span slot="tip" class="el-upload__tip" style="margin-left: 10px;">最多上传3个附件，单个文件不超过10MB</span>
              </el-upload>
            </el-form-item>
            <el-form-item label="发布时间">
              <el-radio-group v-model="announcementForm.publishType">
                <el-radio label="now">立即发布</el-radio>
                <el-radio label="schedule">定时发布</el-radio>
              </el-radio-group>
              <el-date-picker v-if="announcementForm.publishType === 'schedule'" v-model="announcementForm.scheduleTime" type="datetime" placeholder="选择发布时间" style="width: 200px; margin-left: 15px;"></el-date-picker>
            </el-form-item>
            <el-form-item label="是否置顶">
              <el-switch v-model="announcementForm.isTop"></el-switch>
            </el-form-item>
            <el-form-item label="需要审核">
              <el-switch v-model="announcementForm.needReview"></el-switch>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="submitAnnouncement">发布公告</el-button>
              <el-button @click="saveDraft">保存草稿</el-button>
              <el-button @click="previewAnnouncement">预览</el-button>
              <el-button @click="resetForm">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>

      <!-- 公告管理 -->
      <el-tab-pane label="公告管理" name="manage">
        <div class="search-bar">
          <el-select v-model="manageSearch.category" placeholder="公告分类" clearable style="width: 120px;">
            <el-option label="健康通知" value="health"></el-option>
            <el-option label="活动公告" value="activity"></el-option>
            <el-option label="政策通知" value="policy"></el-option>
            <el-option label="紧急通知" value="urgent"></el-option>
            <el-option label="其他" value="other"></el-option>
          </el-select>
          <el-select v-model="manageSearch.status" placeholder="发布状态" clearable style="width: 120px;">
            <el-option label="已发布" value="published"></el-option>
            <el-option label="待审核" value="pending"></el-option>
            <el-option label="草稿" value="draft"></el-option>
            <el-option label="已撤回" value="withdrawn"></el-option>
          </el-select>
          <el-input v-model="manageSearch.keyword" placeholder="搜索标题" style="width: 200px;" clearable></el-input>
          <el-button type="primary" icon="el-icon-search" @click="searchAnnouncements">查询</el-button>
        </div>
        <el-table :data="pagedAnnouncements" border style="width: 100%">
          <el-table-column type="index" label="序号" width="60"></el-table-column>
          <el-table-column prop="title" label="公告标题" width="200" show-overflow-tooltip></el-table-column>
          <el-table-column prop="category" label="分类" width="100">
            <template slot-scope="scope">
              <el-tag size="small" :type="getCategoryTagType(scope.row.category)">{{ getCategoryName(scope.row.category) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="scope" label="发布范围" width="100">
            <template slot-scope="scope">
              <span>{{ getScopeName(scope.row.scope) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="publisher" label="发布人" width="100"></el-table-column>
          <el-table-column prop="publishTime" label="发布时间" width="160"></el-table-column>
          <el-table-column prop="readCount" label="阅读量" width="80"></el-table-column>
          <el-table-column prop="isTop" label="置顶" width="60">
            <template slot-scope="scope">
              <el-tag size="mini" v-if="scope.row.isTop" type="danger">置顶</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="80">
            <template slot-scope="scope">
              <el-tag size="small" :type="getStatusTagType(scope.row.status)">{{ getStatusName(scope.row.status) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="220" fixed="right">
            <template slot-scope="scope">
              <el-button type="text" size="small" @click="editAnnouncement(scope.row)">编辑</el-button>
              <el-button type="text" size="small" v-if="scope.row.status === 'published'" @click="withdrawAnnouncement(scope.row)">撤回</el-button>
              <el-button type="text" size="small" v-if="scope.row.status === 'withdrawn'" @click="republishAnnouncement(scope.row)">重新发布</el-button>
              <el-button type="text" size="small" v-if="scope.row.status === 'pending'" @click="reviewAnnouncement(scope.row)">审核</el-button>
              <el-button type="text" size="small" style="color: #f56c6c;" @click="deleteAnnouncement(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="pagination">
          <el-pagination background layout="total, prev, pager, next" :total="filteredAnnouncements.length" :page-size="10" :current-page.sync="manageCurrentPage"></el-pagination>
        </div>
      </el-tab-pane>

      <!-- 公告审核 -->
      <el-tab-pane label="公告审核" name="review">
        <div class="review-section">
          <div class="review-stats">
            <el-row :gutter="20">
              <el-col :span="4">
                <div class="stat-card pending">
                  <span class="stat-value">{{ reviewStats.pending }}</span>
                  <span class="stat-label">待审核</span>
                </div>
              </el-col>
              <el-col :span="4">
                <div class="stat-card approved">
                  <span class="stat-value">{{ reviewStats.approved }}</span>
                  <span class="stat-label">已通过</span>
                </div>
              </el-col>
              <el-col :span="4">
                <div class="stat-card rejected">
                  <span class="stat-value">{{ reviewStats.rejected }}</span>
                  <span class="stat-label">已驳回</span>
                </div>
              </el-col>
            </el-row>
          </div>
          <el-table :data="reviewList" border style="width: 100%; margin-top: 20px;">
            <el-table-column type="index" label="序号" width="60"></el-table-column>
            <el-table-column prop="title" label="公告标题" width="200" show-overflow-tooltip></el-table-column>
            <el-table-column prop="category" label="分类" width="100">
              <template slot-scope="scope">
                <el-tag size="small">{{ getCategoryName(scope.row.category) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="submitter" label="提交人" width="100"></el-table-column>
            <el-table-column prop="submitTime" label="提交时间" width="160"></el-table-column>
            <el-table-column prop="status" label="状态" width="80">
              <template slot-scope="scope">
                <el-tag size="small" :type="getReviewStatusType(scope.row.status)">{{ scope.row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200" fixed="right">
              <template slot-scope="scope">
                <el-button type="text" size="small" @click="viewReviewItem(scope.row)">查看</el-button>
                <el-button type="success" size="small" v-if="scope.row.status === '待审核'" @click="approveReview(scope.row)">通过</el-button>
                <el-button type="danger" size="small" v-if="scope.row.status === '待审核'" @click="rejectReview(scope.row)">驳回</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>

      <!-- 公告历史 -->
      <el-tab-pane label="历史查询" name="history">
        <div class="search-bar">
          <el-date-picker v-model="historySearch.dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" style="width: 240px;"></el-date-picker>
          <el-input v-model="historySearch.keyword" placeholder="搜索标题" style="width: 200px;" clearable></el-input>
          <el-button type="primary" icon="el-icon-search" @click="searchHistory">查询</el-button>
          <el-button type="success" icon="el-icon-download" @click="exportHistory">导出记录</el-button>
        </div>
        <el-table :data="pagedHistory" border style="width: 100%">
          <el-table-column type="index" label="序号" width="60"></el-table-column>
          <el-table-column prop="title" label="公告标题" width="200" show-overflow-tooltip></el-table-column>
          <el-table-column prop="category" label="分类" width="100">
            <template slot-scope="scope">
              <el-tag size="small">{{ getCategoryName(scope.row.category) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="publisher" label="发布人" width="100"></el-table-column>
          <el-table-column prop="publishTime" label="发布时间" width="160"></el-table-column>
          <el-table-column prop="withdrawTime" label="撤回时间" width="160"></el-table-column>
          <el-table-column prop="readCount" label="阅读量" width="80"></el-table-column>
          <el-table-column prop="status" label="状态" width="80">
            <template slot-scope="scope">
              <el-tag size="small">{{ scope.row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100">
            <template slot-scope="scope">
              <el-button type="text" size="small" @click="viewHistoryDetail(scope.row)">详情</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="pagination">
          <el-pagination background layout="total, prev, pager, next" :total="filteredHistory.length" :page-size="10" :current-page.sync="historyCurrentPage"></el-pagination>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 公告预览对话框 -->
    <el-dialog title="公告预览" :visible.sync="previewDialogVisible" width="600px">
      <div class="announcement-preview">
        <h2>{{ announcementForm.title || '公告标题' }}</h2>
        <div class="preview-meta">
          <span>分类：{{ getCategoryName(announcementForm.category) }}</span>
          <span>发布范围：{{ getScopeName(announcementForm.scope) }}</span>
        </div>
        <div class="preview-content">
          {{ announcementForm.content || '公告内容预览...' }}
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="previewDialogVisible = false">关闭</el-button>
      </span>
    </el-dialog>

    <!-- 审核详情对话框 -->
    <el-dialog title="审核详情" :visible.sync="reviewDetailVisible" width="600px">
      <div class="review-detail" v-if="currentReviewItem">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="公告标题">{{ currentReviewItem.title }}</el-descriptions-item>
          <el-descriptions-item label="分类">{{ getCategoryName(currentReviewItem.category) }}</el-descriptions-item>
          <el-descriptions-item label="提交人">{{ currentReviewItem.submitter }}</el-descriptions-item>
          <el-descriptions-item label="提交时间">{{ currentReviewItem.submitTime }}</el-descriptions-item>
        </el-descriptions>
        <div class="review-content" style="margin-top: 20px;">
          <h4>公告内容</h4>
          <p>{{ currentReviewItem.content }}</p>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="reviewDetailVisible = false">关闭</el-button>
        <el-button type="success" @click="approveReview(currentReviewItem)">通过</el-button>
        <el-button type="danger" @click="rejectReview(currentReviewItem)">驳回</el-button>
      </span>
    </el-dialog>

    <!-- 历史详情对话框 -->
    <el-dialog title="公告详情" :visible.sync="historyDetailVisible" width="600px">
      <div class="history-detail" v-if="currentHistoryItem">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="公告标题">{{ currentHistoryItem.title }}</el-descriptions-item>
          <el-descriptions-item label="分类">{{ getCategoryName(currentHistoryItem.category) }}</el-descriptions-item>
          <el-descriptions-item label="发布人">{{ currentHistoryItem.publisher }}</el-descriptions-item>
          <el-descriptions-item label="发布时间">{{ currentHistoryItem.publishTime }}</el-descriptions-item>
          <el-descriptions-item label="撤回时间">{{ currentHistoryItem.withdrawTime || '未撤回' }}</el-descriptions-item>
          <el-descriptions-item label="阅读量">{{ currentHistoryItem.readCount }}</el-descriptions-item>
          <el-descriptions-item label="状态">{{ currentHistoryItem.status }}</el-descriptions-item>
        </el-descriptions>
        <div class="history-content" style="margin-top: 20px;">
          <h4>公告内容</h4>
          <p>{{ currentHistoryItem.content }}</p>
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
  name: 'AnnouncementManage',
  data() {
    return {
      activeTab: 'publish',
      announcementForm: {
        title: '',
        category: '',
        scope: 'all',
        content: '',
        publishType: 'now',
        scheduleTime: null,
        isTop: false,
        needReview: true
      },
      announcementRules: {
        title: [{ required: true, message: '请输入公告标题', trigger: 'blur' }],
        category: [{ required: true, message: '请选择公告分类', trigger: 'change' }],
        scope: [{ required: true, message: '请选择发布范围', trigger: 'change' }],
        content: [{ required: true, message: '请输入公告内容', trigger: 'blur' }]
      },
      fileList: [],
      scopeTreeData: [
        {
          id: 'all',
          label: '全部',
          children: [
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
      previewDialogVisible: false,
      manageSearch: { category: '', status: '', keyword: '' },
      manageCurrentPage: 1,
      announcements: [
        { id: 1, title: '春季流感预防通知', category: 'health', scope: 'all', publisher: '张医生', publishTime: '2024-01-15 10:30', readCount: 580, isTop: true, status: 'published', content: '春季是流感高发季节...' },
        { id: 2, title: '健康体检安排通知', category: 'health', scope: 'grade', publisher: '李医生', publishTime: '2024-01-14 14:20', readCount: 320, isTop: false, status: 'published', content: '本学期体检安排...' },
        { id: 3, title: '运动会健康安全提示', category: 'activity', scope: 'all', publisher: '王老师', publishTime: '2024-01-13 09:15', readCount: 450, isTop: false, status: 'published', content: '运动会期间请注意安全...' },
        { id: 4, title: '疫苗接种通知', category: 'policy', scope: 'all', publisher: '赵医生', publishTime: '2024-01-12 16:40', readCount: 680, isTop: true, status: 'pending', content: '流感疫苗接种安排...' },
        { id: 5, title: '紧急停课通知', category: 'urgent', scope: 'all', publisher: '校长', publishTime: '2024-01-11 08:00', readCount: 1200, isTop: true, status: 'withdrawn', content: '因特殊情况...' },
        { id: 6, title: '健康讲座预告', category: 'activity', scope: 'class', publisher: '钱老师', publishTime: '2024-01-10 15:30', readCount: 150, isTop: false, status: 'draft', content: '健康知识讲座...' }
      ],
      reviewStats: { pending: 3, approved: 12, rejected: 2 },
      reviewList: [
        { id: 1, title: '疫苗接种通知', category: 'policy', submitter: '赵医生', submitTime: '2024-01-12 16:40', status: '待审核', content: '流感疫苗接种安排...' },
        { id: 2, title: '心理健康辅导通知', category: 'health', submitter: '孙老师', submitTime: '2024-01-11 14:30', status: '待审核', content: '心理健康辅导活动...' },
        { id: 3, title: '食堂卫生检查通知', category: 'policy', submitter: '周主任', submitTime: '2024-01-10 10:20', status: '待审核', content: '食堂卫生检查安排...' },
        { id: 4, title: '防溺水安全教育', category: 'health', submitter: '吴老师', submitTime: '2024-01-09 09:15', status: '已通过', content: '夏季防溺水...' },
        { id: 5, title: '视力检查通知', category: 'health', submitter: '郑医生', submitTime: '2024-01-08 16:50', status: '已驳回', content: '视力检查安排...' }
      ],
      reviewDetailVisible: false,
      currentReviewItem: null,
      historySearch: { dateRange: null, keyword: '' },
      historyCurrentPage: 1,
      historyList: [
        { id: 1, title: '2023年体检总结报告', category: 'health', publisher: '张医生', publishTime: '2023-12-30 10:00', withdrawTime: '', readCount: 850, status: '已发布', content: '体检工作总结...' },
        { id: 2, title: '冬季传染病预防', category: 'health', publisher: '李医生', publishTime: '2023-12-15 14:30', withdrawTime: '', readCount: 420, status: '已发布', content: '冬季传染病预防...' },
        { id: 3, title: '紧急放假通知', category: 'urgent', publisher: '校长', publishTime: '2023-11-20 08:00', withdrawTime: '2023-11-21 10:00', readCount: 1500, status: '已撤回', content: '因天气原因...' },
        { id: 4, title: '运动会通知', category: 'activity', publisher: '体育组', publishTime: '2023-10-15 09:00', withdrawTime: '', readCount: 680, status: '已发布', content: '运动会安排...' }
      ],
      historyDetailVisible: false,
      currentHistoryItem: null
    };
  },
  computed: {
    filteredAnnouncements() {
      return this.announcements.filter(item => {
        const matchCategory = !this.manageSearch.category || item.category === this.manageSearch.category;
        const matchStatus = !this.manageSearch.status || item.status === this.manageSearch.status;
        const matchKeyword = !this.manageSearch.keyword || item.title.includes(this.manageSearch.keyword);
        return matchCategory && matchStatus && matchKeyword;
      });
    },
    pagedAnnouncements() {
      const start = (this.manageCurrentPage - 1) * 10;
      return this.filteredAnnouncements.slice(start, start + 10);
    },
    filteredHistory() {
      return this.historyList.filter(item => {
        const matchKeyword = !this.historySearch.keyword || item.title.includes(this.historySearch.keyword);
        return matchKeyword;
      });
    },
    pagedHistory() {
      const start = (this.historyCurrentPage - 1) * 10;
      return this.filteredHistory.slice(start, start + 10);
    }
  },
  methods: {
    getCategoryName(category) {
      const map = { health: '健康通知', activity: '活动公告', policy: '政策通知', urgent: '紧急通知', other: '其他' };
      return map[category] || category;
    },
    getCategoryTagType(category) {
      const map = { health: 'success', activity: 'primary', policy: 'info', urgent: 'danger', other: 'warning' };
      return map[category] || '';
    },
    getScopeName(scope) {
      const map = { all: '全校', grade: '年级', class: '班级' };
      return map[scope] || scope;
    },
    getStatusName(status) {
      const map = { published: '已发布', pending: '待审核', draft: '草稿', withdrawn: '已撤回' };
      return map[status] || status;
    },
    getStatusTagType(status) {
      const map = { published: 'success', pending: 'warning', draft: 'info', withdrawn: 'danger' };
      return map[status] || '';
    },
    getReviewStatusType(status) {
      const map = { '待审核': 'warning', '已通过': 'success', '已驳回': 'danger' };
      return map[status] || '';
    },
    submitAnnouncement() {
      this.$refs.announcementForm.validate((valid) => {
        if (valid) {
          if (this.announcementForm.needReview) {
            this.$message.success('公告已提交审核');
          } else {
            this.$message.success('公告已发布成功');
          }
          this.resetForm();
        }
      });
    },
    saveDraft() {
      this.$message.success('公告已保存为草稿');
    },
    previewAnnouncement() {
      this.previewDialogVisible = true;
    },
    resetForm() {
      this.announcementForm = {
        title: '',
        category: '',
        scope: 'all',
        content: '',
        publishType: 'now',
        scheduleTime: null,
        isTop: false,
        needReview: true
      };
      this.fileList = [];
      if (this.$refs.announcementForm) {
        this.$refs.announcementForm.resetFields();
      }
    },
    searchAnnouncements() {
      this.manageCurrentPage = 1;
      this.$message.success('查询完成，共找到 ' + this.filteredAnnouncements.length + ' 条公告');
    },
    editAnnouncement(row) {
      this.activeTab = 'publish';
      this.announcementForm = {
        title: row.title,
        category: row.category,
        scope: row.scope,
        content: row.content,
        publishType: 'now',
        scheduleTime: null,
        isTop: row.isTop,
        needReview: false
      };
    },
    withdrawAnnouncement(row) {
      this.$confirm('确定要撤回该公告吗？', '提示', { type: 'warning' }).then(() => {
        row.status = 'withdrawn';
        this.$message.success('公告已撤回');
      }).catch(() => {});
    },
    republishAnnouncement(row) {
      this.$confirm('确定要重新发布该公告吗？', '提示', { type: 'info' }).then(() => {
        row.status = 'published';
        this.$message.success('公告已重新发布');
      }).catch(() => {});
    },
    reviewAnnouncement(row) {
      this.activeTab = 'review';
    },
    deleteAnnouncement(row) {
      this.$confirm('确定删除公告 "' + row.title + '" 吗？', '提示', { type: 'warning' }).then(() => {
        const index = this.announcements.findIndex(a => a.id === row.id);
        if (index > -1) this.announcements.splice(index, 1);
        this.$message.success('删除成功');
      }).catch(() => {});
    },
    viewReviewItem(row) {
      this.currentReviewItem = row;
      this.reviewDetailVisible = true;
    },
    approveReview(row) {
      this.$confirm('确定审核通过吗？', '提示', { type: 'info' }).then(() => {
        row.status = '已通过';
        this.reviewStats.pending--;
        this.reviewStats.approved++;
        this.$message.success('审核通过');
        this.reviewDetailVisible = false;
      }).catch(() => {});
    },
    rejectReview(row) {
      this.$prompt('请输入驳回原因', '驳回审核', { inputPattern: /.+/, inputErrorMessage: '请输入驳回原因' }).then(({ value }) => {
        row.status = '已驳回';
        row.rejectReason = value;
        this.reviewStats.pending--;
        this.reviewStats.rejected++;
        this.$message.success('已驳回');
        this.reviewDetailVisible = false;
      }).catch(() => {});
    },
    searchHistory() {
      this.historyCurrentPage = 1;
      this.$message.success('查询完成，共找到 ' + this.filteredHistory.length + ' 条历史记录');
    },
    exportHistory() {
      this.$message.success('历史记录导出成功');
    },
    viewHistoryDetail(row) {
      this.currentHistoryItem = row;
      this.historyDetailVisible = true;
    }
  }
};
</script>

<style scoped>
.announcement-manage {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.publish-form {
  padding: 20px;
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

.review-section {
  padding: 20px 0;
}

.review-stats {
  margin-bottom: 20px;
}

.stat-card {
  padding: 20px;
  border-radius: 8px;
  text-align: center;
}

.stat-card.pending {
  background: linear-gradient(135deg, #fdf6ec 0%, #faecd8 100%);
  border-left: 4px solid #e6a23c;
}

.stat-card.approved {
  background: linear-gradient(135deg, #f0f9eb 0%, #e1f3d8 100%);
  border-left: 4px solid #67c23a;
}

.stat-card.rejected {
  background: linear-gradient(135deg, #fef0f0 0%, #fde2e2 100%);
  border-left: 4px solid #f56c6c;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}

.stat-label {
  font-size: 14px;
  color: #606266;
  margin-top: 5px;
}

.announcement-preview {
  padding: 20px;
}

.announcement-preview h2 {
  font-size: 18px;
  color: #303133;
  margin-bottom: 15px;
}

.preview-meta {
  color: #909399;
  font-size: 14px;
  margin-bottom: 20px;
}

.preview-meta span {
  margin-right: 20px;
}

.preview-content {
  padding: 20px;
  background: #f5f7fa;
  border-radius: 6px;
  line-height: 1.8;
}

.review-detail, .history-detail {
  padding: 10px;
}

.review-content h4, .history-content h4 {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #606266;
}

.review-content p, .history-content p {
  color: #303133;
  line-height: 1.8;
}
</style>