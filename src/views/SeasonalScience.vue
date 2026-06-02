<template>
  <div class="seasonal-science">
    <el-tabs v-model="activeTab" type="card">
      <!-- 科普文章管理 -->
      <el-tab-pane label="科普文章" name="articles">
        <div class="search-bar">
          <el-select v-model="articleSearch.category" placeholder="文章分类" clearable style="width: 150px;">
            <el-option label="流感预防" value="flu"></el-option>
            <el-option label="手足口病" value="hfmd"></el-option>
            <el-option label="中暑预防" value="heatstroke"></el-option>
            <el-option label="传染病" value="infectious"></el-option>
            <el-option label="营养健康" value="nutrition"></el-option>
            <el-option label="心理健康" value="mental"></el-option>
          </el-select>
          <el-select v-model="articleSearch.season" placeholder="适用季节" clearable style="width: 120px;">
            <el-option label="春季" value="spring"></el-option>
            <el-option label="夏季" value="summer"></el-option>
            <el-option label="秋季" value="autumn"></el-option>
            <el-option label="冬季" value="winter"></el-option>
          </el-select>
          <el-select v-model="articleSearch.status" placeholder="发布状态" clearable style="width: 120px;">
            <el-option label="已发布" value="published"></el-option>
            <el-option label="待审核" value="pending"></el-option>
            <el-option label="草稿" value="draft"></el-option>
          </el-select>
          <el-input v-model="articleSearch.keyword" placeholder="搜索标题" style="width: 200px;" clearable></el-input>
          <el-button type="primary" icon="el-icon-search" @click="searchArticles">查询</el-button>
          <el-button type="success" icon="el-icon-plus" @click="handleAddArticle">新增文章</el-button>
        </div>
        <el-table :data="pagedArticles" border style="width: 100%">
          <el-table-column type="index" label="序号" width="60"></el-table-column>
          <el-table-column prop="title" label="文章标题" width="200" show-overflow-tooltip></el-table-column>
          <el-table-column prop="category" label="分类" width="100">
            <template slot-scope="scope">
              <el-tag size="small" :type="getCategoryTagType(scope.row.category)">{{ getCategoryName(scope.row.category) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="season" label="适用季节" width="80">
            <template slot-scope="scope">
              <span>{{ getSeasonName(scope.row.season) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="author" label="作者" width="100"></el-table-column>
          <el-table-column prop="views" label="阅读量" width="80"></el-table-column>
          <el-table-column prop="likes" label="点赞数" width="80"></el-table-column>
          <el-table-column prop="publishTime" label="发布时间" width="160"></el-table-column>
          <el-table-column prop="status" label="状态" width="80">
            <template slot-scope="scope">
              <el-tag size="small" :type="getStatusTagType(scope.row.status)">{{ getStatusName(scope.row.status) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" fixed="right">
            <template slot-scope="scope">
              <el-button type="text" size="small" @click="handleEditArticle(scope.row)">编辑</el-button>
              <el-button type="text" size="small" @click="handlePreviewArticle(scope.row)">预览</el-button>
              <el-button type="text" size="small" v-if="scope.row.status === 'pending'" @click="handleApproveArticle(scope.row)">审核</el-button>
              <el-button type="text" size="small" style="color: #f56c6c;" @click="handleDeleteArticle(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="pagination">
          <el-pagination background layout="total, prev, pager, next" :total="filteredArticles.length" :page-size="10" :current-page.sync="articleCurrentPage"></el-pagination>
        </div>
      </el-tab-pane>

      <!-- 季节预警配置 -->
      <el-tab-pane label="预警配置" name="warning">
        <div class="warning-config">
          <el-row :gutter="20">
            <el-col :span="6" v-for="season in seasonWarnings" :key="season.id">
              <el-card class="season-card" shadow="hover">
                <div class="season-header" :style="{ background: season.color }">
                  <i :class="season.icon"></i>
                  <span>{{ season.name }}</span>
                </div>
                <div class="season-body">
                  <div class="warning-list">
                    <div class="warning-item" v-for="(item, index) in season.items" :key="index">
                      <el-checkbox v-model="item.enabled">{{ item.name }}</el-checkbox>
                      <el-button type="text" size="mini" icon="el-icon-edit" @click="editWarningItem(season, item)"></el-button>
                    </div>
                  </div>
                </div>
                <div class="season-footer">
                  <el-button type="primary" size="small" @click="saveSeasonConfig(season)">保存配置</el-button>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>
      </el-tab-pane>

      <!-- 推送设置 -->
      <el-tab-pane label="推送设置" name="push">
        <div class="push-config">
          <el-form :model="pushConfig" label-width="120px" style="max-width: 600px;">
            <el-form-item label="推送方式">
              <el-checkbox-group v-model="pushConfig.methods">
                <el-checkbox label="app">APP推送</el-checkbox>
                <el-checkbox label="sms">短信推送</el-checkbox>
                <el-checkbox label="email">邮件推送</el-checkbox>
                <el-checkbox label="wechat">微信推送</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            <el-form-item label="推送时间">
              <el-time-picker v-model="pushConfig.time" placeholder="选择推送时间" style="width: 200px;"></el-time-picker>
              <span style="color: #909399; margin-left: 10px;">每日定时推送</span>
            </el-form-item>
            <el-form-item label="推送对象">
              <el-checkbox-group v-model="pushConfig.targets">
                <el-checkbox label="all">全校师生</el-checkbox>
                <el-checkbox label="parents">家长</el-checkbox>
                <el-checkbox label="teachers">教师</el-checkbox>
                <el-checkbox label="students">学生</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            <el-form-item label="推送频率">
              <el-radio-group v-model="pushConfig.frequency">
                <el-radio label="daily">每日推送</el-radio>
                <el-radio label="weekly">每周推送</el-radio>
                <el-radio label="monthly">每月推送</el-radio>
                <el-radio label="important">仅重要预警</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="推送内容">
              <el-checkbox-group v-model="pushConfig.content">
                <el-checkbox label="warning">健康预警</el-checkbox>
                <el-checkbox label="science">科普文章</el-checkbox>
                <el-checkbox label="notice">通知公告</el-checkbox>
                <el-checkbox label="tips">健康小贴士</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="savePushConfig">保存设置</el-button>
              <el-button @click="resetPushConfig">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>

      <!-- 内容审核 -->
      <el-tab-pane label="内容审核" name="review">
        <div class="review-section">
          <div class="review-stats">
            <el-row :gutter="20">
              <el-col :span="4">
                <div class="stat-item pending">
                  <span class="stat-value">{{ reviewStats.pending }}</span>
                  <span class="stat-label">待审核</span>
                </div>
              </el-col>
              <el-col :span="4">
                <div class="stat-item approved">
                  <span class="stat-value">{{ reviewStats.approved }}</span>
                  <span class="stat-label">已通过</span>
                </div>
              </el-col>
              <el-col :span="4">
                <div class="stat-item rejected">
                  <span class="stat-value">{{ reviewStats.rejected }}</span>
                  <span class="stat-label">已驳回</span>
                </div>
              </el-col>
            </el-row>
          </div>
          <el-table :data="reviewList" border style="width: 100%; margin-top: 20px;">
            <el-table-column type="index" label="序号" width="60"></el-table-column>
            <el-table-column prop="title" label="文章标题" width="200" show-overflow-tooltip></el-table-column>
            <el-table-column prop="category" label="分类" width="100">
              <template slot-scope="scope">
                <el-tag size="small">{{ getCategoryName(scope.row.category) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="author" label="提交人" width="100"></el-table-column>
            <el-table-column prop="submitTime" label="提交时间" width="160"></el-table-column>
            <el-table-column prop="status" label="状态" width="80">
              <template slot-scope="scope">
                <el-tag size="small" :type="getReviewStatusType(scope.row.status)">{{ scope.row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200" fixed="right">
              <template slot-scope="scope">
                <el-button type="text" size="small" @click="previewReviewItem(scope.row)">查看</el-button>
                <el-button type="success" size="small" v-if="scope.row.status === '待审核'" @click="approveReviewItem(scope.row)">通过</el-button>
                <el-button type="danger" size="small" v-if="scope.row.status === '待审核'" @click="rejectReviewItem(scope.row)">驳回</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 文章编辑对话框 -->
    <el-dialog :title="articleDialogTitle" :visible.sync="articleDialogVisible" width="700px">
      <el-form :model="articleForm" :rules="articleRules" ref="articleForm" label-width="100px">
        <el-form-item label="文章标题" prop="title">
          <el-input v-model="articleForm.title" placeholder="请输入文章标题"></el-input>
        </el-form-item>
        <el-form-item label="文章分类" prop="category">
          <el-select v-model="articleForm.category" placeholder="请选择分类" style="width: 100%;">
            <el-option label="流感预防" value="flu"></el-option>
            <el-option label="手足口病" value="hfmd"></el-option>
            <el-option label="中暑预防" value="heatstroke"></el-option>
            <el-option label="传染病" value="infectious"></el-option>
            <el-option label="营养健康" value="nutrition"></el-option>
            <el-option label="心理健康" value="mental"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="适用季节" prop="season">
          <el-select v-model="articleForm.season" placeholder="请选择季节" style="width: 100%;">
            <el-option label="春季" value="spring"></el-option>
            <el-option label="夏季" value="summer"></el-option>
            <el-option label="秋季" value="autumn"></el-option>
            <el-option label="冬季" value="winter"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="文章摘要" prop="summary">
          <el-input type="textarea" v-model="articleForm.summary" :rows="2" placeholder="请输入文章摘要"></el-input>
        </el-form-item>
        <el-form-item label="文章内容" prop="content">
          <el-input type="textarea" v-model="articleForm.content" :rows="8" placeholder="请输入文章内容"></el-input>
        </el-form-item>
        <el-form-item label="封面图片">
          <el-upload action="#" :auto-upload="false" :show-file-list="false" accept="image/*">
            <el-button size="small" type="primary">上传图片</el-button>
            <span slot="tip" class="el-upload__tip" style="margin-left: 10px;">建议尺寸 800x400</span>
          </el-upload>
        </el-form-item>
        <el-form-item label="发布状态">
          <el-radio-group v-model="articleForm.status">
            <el-radio label="draft">保存草稿</el-radio>
            <el-radio label="pending">提交审核</el-radio>
            <el-radio label="published">直接发布</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="articleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitArticle">确定</el-button>
      </span>
    </el-dialog>

    <!-- 预览对话框 -->
    <el-dialog title="文章预览" :visible.sync="previewDialogVisible" width="700px">
      <div class="article-preview" v-if="previewArticle">
        <h2 class="preview-title">{{ previewArticle.title }}</h2>
        <div class="preview-meta">
          <span><i class="el-icon-user"></i> {{ previewArticle.author }}</span>
          <span><i class="el-icon-time"></i> {{ previewArticle.publishTime }}</span>
          <span><i class="el-icon-view"></i> {{ previewArticle.views }} 阅读</span>
        </div>
        <div class="preview-content">
          {{ previewArticle.content || '这是文章内容预览区域...' }}
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="previewDialogVisible = false">关闭</el-button>
      </span>
    </el-dialog>

    <!-- 预警编辑对话框 -->
    <el-dialog title="编辑预警内容" :visible.sync="warningDialogVisible" width="500px">
      <el-form :model="warningForm" label-width="100px">
        <el-form-item label="预警名称">
          <el-input v-model="warningForm.name" placeholder="请输入预警名称"></el-input>
        </el-form-item>
        <el-form-item label="预警内容">
          <el-input type="textarea" v-model="warningForm.content" :rows="4" placeholder="请输入预警内容"></el-input>
        </el-form-item>
        <el-form-item label="预警等级">
          <el-radio-group v-model="warningForm.level">
            <el-radio label="high">高</el-radio>
            <el-radio label="medium">中</el-radio>
            <el-radio label="low">低</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="生效时间">
          <el-date-picker v-model="warningForm.effectTime" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" style="width: 100%;"></el-date-picker>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="warningDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveWarningConfig">保存</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'SeasonalScience',
  data() {
    return {
      activeTab: 'articles',
      // 文章管理
      articleSearch: { category: '', season: '', status: '', keyword: '' },
      articleCurrentPage: 1,
      articles: [
        { id: 1, title: '春季流感预防指南', category: 'flu', season: 'spring', author: '张医生', views: 1250, likes: 89, publishTime: '2024-01-15 10:30', status: 'published', content: '春季是流感高发季节，请注意预防...' },
        { id: 2, title: '手足口病防控知识', category: 'hfmd', season: 'summer', author: '李医生', views: 890, likes: 56, publishTime: '2024-01-14 14:20', status: 'published', content: '手足口病主要发生在儿童群体...' },
        { id: 3, title: '夏季防中暑小贴士', category: 'heatstroke', season: 'summer', author: '王医生', views: 1560, likes: 120, publishTime: '2024-01-13 09:15', status: 'published', content: '夏季高温天气，注意防暑降温...' },
        { id: 4, title: '秋季传染病预防', category: 'infectious', season: 'autumn', author: '赵医生', views: 680, likes: 45, publishTime: '2024-01-12 16:40', status: 'pending', content: '秋季是多种传染病的高发期...' },
        { id: 5, title: '冬季保暖与健康', category: 'nutrition', season: 'winter', author: '钱医生', views: 520, likes: 32, publishTime: '2024-01-11 11:30', status: 'draft', content: '冬季注意保暖，增强体质...' },
        { id: 6, title: '儿童心理健康关注', category: 'mental', season: 'spring', author: '孙医生', views: 980, likes: 78, publishTime: '2024-01-10 15:20', status: 'published', content: '关注儿童心理健康成长...' }
      ],
      articleDialogVisible: false,
      articleDialogTitle: '新增文章',
      isEditArticle: false,
      editArticleItem: null,
      articleForm: { title: '', category: '', season: '', summary: '', content: '', status: 'draft' },
      articleRules: {
        title: [{ required: true, message: '请输入文章标题', trigger: 'blur' }],
        category: [{ required: true, message: '请选择文章分类', trigger: 'change' }],
        season: [{ required: true, message: '请选择适用季节', trigger: 'change' }]
      },
      previewDialogVisible: false,
      previewArticle: null,
      // 季节预警
      seasonWarnings: [
        { id: 'spring', name: '春季', color: '#67c23a', icon: 'el-icon-sunny', items: [
          { name: '流感预警', enabled: true, content: '春季流感高发，注意预防', level: 'medium' },
          { name: '过敏预警', enabled: true, content: '花粉过敏季，过敏体质注意', level: 'low' }
        ]},
        { id: 'summer', name: '夏季', color: '#e6a23c', icon: 'el-icon-sunrise', items: [
          { name: '中暑预警', enabled: true, content: '高温天气，注意防暑', level: 'high' },
          { name: '手足口病预警', enabled: true, content: '手足口病高发期', level: 'medium' },
          { name: '溺水预警', enabled: true, content: '游泳安全提醒', level: 'high' }
        ]},
        { id: 'autumn', name: '秋季', color: '#909399', icon: 'el-icon-cloudy', items: [
          { name: '腹泻预警', enabled: true, content: '秋季腹泻高发', level: 'medium' },
          { name: '传染病预警', enabled: false, content: '秋季传染病防控', level: 'low' }
        ]},
        { id: 'winter', name: '冬季', color: '#409eff', icon: 'el-icon-cloudy-and-sunny', items: [
          { name: '流感预警', enabled: true, content: '冬季流感高发', level: 'high' },
          { name: '冻伤预警', enabled: false, content: '低温天气注意保暖', level: 'low' }
        ]}
      ],
      warningDialogVisible: false,
      warningForm: { name: '', content: '', level: 'medium', effectTime: null },
      currentWarningSeason: null,
      currentWarningItem: null,
      // 推送设置
      pushConfig: {
        methods: ['app', 'wechat'],
        time: new Date(2024, 1, 1, 8, 0),
        targets: ['parents', 'teachers'],
        frequency: 'daily',
        content: ['warning', 'science']
      },
      // 内容审核
      reviewStats: { pending: 3, approved: 15, rejected: 2 },
      reviewList: [
        { id: 1, title: '秋季传染病预防', category: 'infectious', author: '赵医生', submitTime: '2024-01-12 16:40', status: '待审核' },
        { id: 2, title: '冬季保暖与健康', category: 'nutrition', author: '钱医生', submitTime: '2024-01-11 11:30', status: '待审核' },
        { id: 3, title: '春季过敏预防', category: 'flu', author: '周医生', submitTime: '2024-01-10 09:20', status: '待审核' },
        { id: 4, title: '夏季防晒指南', category: 'heatstroke', author: '吴医生', submitTime: '2024-01-09 14:15', status: '已通过' },
        { id: 5, title: '冬季室内通风', category: 'nutrition', author: '郑医生', submitTime: '2024-01-08 10:30', status: '已驳回' }
      ]
    };
  },
  computed: {
    filteredArticles() {
      return this.articles.filter(item => {
        const matchCategory = !this.articleSearch.category || item.category === this.articleSearch.category;
        const matchSeason = !this.articleSearch.season || item.season === this.articleSearch.season;
        const matchStatus = !this.articleSearch.status || item.status === this.articleSearch.status;
        const matchKeyword = !this.articleSearch.keyword || item.title.includes(this.articleSearch.keyword);
        return matchCategory && matchSeason && matchStatus && matchKeyword;
      });
    },
    pagedArticles() {
      const start = (this.articleCurrentPage - 1) * 10;
      return this.filteredArticles.slice(start, start + 10);
    }
  },
  methods: {
    getCategoryName(category) {
      const map = { flu: '流感预防', hfmd: '手足口病', heatstroke: '中暑预防', infectious: '传染病', nutrition: '营养健康', mental: '心理健康' };
      return map[category] || category;
    },
    getCategoryTagType(category) {
      const map = { flu: 'danger', hfmd: 'warning', heatstroke: 'warning', infectious: 'danger', nutrition: 'success', mental: 'info' };
      return map[category] || '';
    },
    getSeasonName(season) {
      const map = { spring: '春季', summer: '夏季', autumn: '秋季', winter: '冬季' };
      return map[season] || season;
    },
    getStatusName(status) {
      const map = { published: '已发布', pending: '待审核', draft: '草稿' };
      return map[status] || status;
    },
    getStatusTagType(status) {
      const map = { published: 'success', pending: 'warning', draft: 'info' };
      return map[status] || '';
    },
    getReviewStatusType(status) {
      const map = { '待审核': 'warning', '已通过': 'success', '已驳回': 'danger' };
      return map[status] || '';
    },
    searchArticles() {
      this.articleCurrentPage = 1;
      this.$message.success('查询完成，共找到 ' + this.filteredArticles.length + ' 条记录');
    },
    handleAddArticle() {
      this.isEditArticle = false;
      this.editArticleItem = null;
      this.articleDialogTitle = '新增文章';
      this.articleForm = { title: '', category: '', season: '', summary: '', content: '', status: 'draft' };
      this.articleDialogVisible = true;
    },
    handleEditArticle(row) {
      this.isEditArticle = true;
      this.editArticleItem = row;
      this.articleDialogTitle = '编辑文章';
      this.articleForm = { title: row.title, category: row.category, season: row.season, summary: row.summary || '', content: row.content, status: row.status };
      this.articleDialogVisible = true;
    },
    handlePreviewArticle(row) {
      this.previewArticle = row;
      this.previewDialogVisible = true;
    },
    handleApproveArticle(row) {
      this.$confirm('确定审核通过该文章吗？', '提示', { type: 'info' }).then(() => {
        row.status = 'published';
        this.$message.success('审核通过，文章已发布');
      }).catch(() => {});
    },
    handleDeleteArticle(row) {
      this.$confirm('确定删除文章 "' + row.title + '" 吗？', '提示', { type: 'warning' }).then(() => {
        const index = this.articles.findIndex(a => a.id === row.id);
        if (index > -1) this.articles.splice(index, 1);
        this.$message.success('删除成功');
      }).catch(() => {});
    },
    submitArticle() {
      this.$refs.articleForm.validate((valid) => {
        if (valid) {
          if (this.isEditArticle && this.editArticleItem) {
            Object.assign(this.editArticleItem, this.articleForm);
            this.$message.success('文章更新成功');
          } else {
            this.articles.push({
              id: Date.now(),
              title: this.articleForm.title,
              category: this.articleForm.category,
              season: this.articleForm.season,
              author: '当前用户',
              views: 0,
              likes: 0,
              publishTime: new Date().toLocaleString(),
              status: this.articleForm.status,
              content: this.articleForm.content
            });
            this.$message.success('文章创建成功');
          }
          this.articleDialogVisible = false;
        }
      });
    },
    editWarningItem(season, item) {
      this.currentWarningSeason = season;
      this.currentWarningItem = item;
      this.warningForm = { name: item.name, content: item.content, level: item.level, effectTime: null };
      this.warningDialogVisible = true;
    },
    saveWarningConfig() {
      if (this.currentWarningItem) {
        this.currentWarningItem.name = this.warningForm.name;
        this.currentWarningItem.content = this.warningForm.content;
        this.currentWarningItem.level = this.warningForm.level;
      }
      this.warningDialogVisible = false;
      this.$message.success('预警配置已保存');
    },
    saveSeasonConfig(season) {
      this.$message.success(season.name + '预警配置已保存');
    },
    savePushConfig() {
      this.$message.success('推送设置已保存');
    },
    resetPushConfig() {
      this.pushConfig = {
        methods: ['app', 'wechat'],
        time: new Date(2024, 1, 1, 8, 0),
        targets: ['parents', 'teachers'],
        frequency: 'daily',
        content: ['warning', 'science']
      };
      this.$message.info('推送设置已重置');
    },
    previewReviewItem(row) {
      this.previewArticle = row;
      this.previewDialogVisible = true;
    },
    approveReviewItem(row) {
      this.$confirm('确定审核通过吗？', '提示', { type: 'info' }).then(() => {
        row.status = '已通过';
        this.reviewStats.pending--;
        this.reviewStats.approved++;
        this.$message.success('审核通过');
      }).catch(() => {});
    },
    rejectReviewItem(row) {
      this.$prompt('请输入驳回原因', '驳回审核', { inputPattern: /.+/, inputErrorMessage: '请输入驳回原因' }).then(({ value }) => {
        row.status = '已驳回';
        row.rejectReason = value;
        this.reviewStats.pending--;
        this.reviewStats.rejected++;
        this.$message.success('已驳回');
      }).catch(() => {});
    }
  }
};
</script>

<style scoped>
.seasonal-science {
  background: #fff;
  padding: 20px;
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

.pagination {
  display: flex;
  justify-content: flex-end;
  padding-top: 15px;
}

.warning-config {
  padding: 20px 0;
}

.season-card {
  overflow: hidden;
}

.season-header {
  padding: 15px;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
}

.season-header i {
  font-size: 20px;
}

.season-body {
  padding: 15px;
}

.warning-list {
  min-height: 100px;
}

.warning-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px dashed #ebeef5;
}

.warning-item:last-child {
  border-bottom: none;
}

.season-footer {
  padding: 10px 15px;
  border-top: 1px solid #ebeef5;
  text-align: center;
}

.push-config {
  padding: 20px;
}

.review-section {
  padding: 20px 0;
}

.review-stats {
  margin-bottom: 20px;
}

.stat-item {
  padding: 20px;
  border-radius: 8px;
  text-align: center;
}

.stat-item.pending {
  background: linear-gradient(135deg, #fdf6ec 0%, #faecd8 100%);
  border-left: 4px solid #e6a23c;
}

.stat-item.approved {
  background: linear-gradient(135deg, #f0f9eb 0%, #e1f3d8 100%);
  border-left: 4px solid #67c23a;
}

.stat-item.rejected {
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

.article-preview {
  padding: 20px;
}

.preview-title {
  font-size: 20px;
  color: #303133;
  margin-bottom: 15px;
}

.preview-meta {
  display: flex;
  gap: 20px;
  color: #909399;
  font-size: 14px;
  margin-bottom: 20px;
}

.preview-meta i {
  margin-right: 5px;
}

.preview-content {
  color: #606266;
  line-height: 1.8;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 6px;
}
</style>