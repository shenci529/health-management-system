<template>
  <div class="consultation-manage">
    <el-tabs v-model="activeTab" type="card">
      <!-- 咨询工单列表 -->
      <el-tab-pane label="工单列表" name="list">
        <div class="search-bar">
          <el-select v-model="listSearch.category" placeholder="咨询分类" clearable style="width: 150px;">
            <el-option label="健康问题" value="health"></el-option>
            <el-option label="饮食问题" value="diet"></el-option>
            <el-option label="心理问题" value="mental"></el-option>
            <el-option label="体检问题" value="checkup"></el-option>
            <el-option label="其他" value="other"></el-option>
          </el-select>
          <el-select v-model="listSearch.status" placeholder="工单状态" clearable style="width: 120px;">
            <el-option label="待处理" value="pending"></el-option>
            <el-option label="处理中" value="processing"></el-option>
            <el-option label="已回复" value="replied"></el-option>
            <el-option label="已关闭" value="closed"></el-option>
          </el-select>
          <el-select v-model="listSearch.priority" placeholder="紧急程度" clearable style="width: 120px;">
            <el-option label="紧急" value="urgent"></el-option>
            <el-option label="普通" value="normal"></el-option>
            <el-option label="一般" value="low"></el-option>
          </el-select>
          <el-input v-model="listSearch.keyword" placeholder="搜索标题/学生姓名" style="width: 200px;" clearable></el-input>
          <el-button type="primary" icon="el-icon-search" @click="searchConsultations">查询</el-button>
        </div>
        <el-table :data="pagedConsultations" border style="width: 100%">
          <el-table-column type="index" label="序号" width="60"></el-table-column>
          <el-table-column prop="ticketNo" label="工单编号" width="120"></el-table-column>
          <el-table-column prop="title" label="咨询标题" width="200" show-overflow-tooltip></el-table-column>
          <el-table-column prop="category" label="分类" width="100">
            <template slot-scope="scope">
              <el-tag size="small" :type="getCategoryTagType(scope.row.category)">{{ getCategoryName(scope.row.category) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="studentName" label="学生姓名" width="100"></el-table-column>
          <el-table-column prop="submitter" label="提交人" width="100"></el-table-column>
          <el-table-column prop="submitTime" label="提交时间" width="160"></el-table-column>
          <el-table-column prop="priority" label="紧急程度" width="80">
            <template slot-scope="scope">
              <el-tag size="small" :type="getPriorityTagType(scope.row.priority)">{{ getPriorityName(scope.row.priority) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="80">
            <template slot-scope="scope">
              <el-tag size="small" :type="getStatusTagType(scope.row.status)">{{ getStatusName(scope.row.status) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="handler" label="处理人" width="100"></el-table-column>
          <el-table-column label="操作" width="180" fixed="right">
            <template slot-scope="scope">
              <el-button type="text" size="small" @click="viewConsultation(scope.row)">详情</el-button>
              <el-button type="text" size="small" v-if="scope.row.status === 'pending'" @click="handleConsultation(scope.row)">处理</el-button>
              <el-button type="text" size="small" v-if="scope.row.status === 'replied'" @click="closeConsultation(scope.row)">关闭</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="pagination">
          <el-pagination background layout="total, prev, pager, next" :total="filteredConsultations.length" :page-size="10" :current-page.sync="listCurrentPage"></el-pagination>
        </div>
      </el-tab-pane>

      <!-- 工单详情 -->
      <el-tab-pane label="工单详情" name="detail" :disabled="!currentConsultation">
        <div class="consultation-detail" v-if="currentConsultation">
          <div class="detail-header">
            <h3>{{ currentConsultation.title }}</h3>
            <div class="detail-meta">
              <span>工单编号：{{ currentConsultation.ticketNo }}</span>
              <span>分类：{{ getCategoryName(currentConsultation.category) }}</span>
              <span>状态：<el-tag size="small" :type="getStatusTagType(currentConsultation.status)">{{ getStatusName(currentConsultation.status) }}</el-tag></span>
            </div>
          </div>

          <div class="detail-section">
            <el-descriptions :column="4" border>
              <el-descriptions-item label="学生姓名">{{ currentConsultation.studentName }}</el-descriptions-item>
              <el-descriptions-item label="班级">{{ currentConsultation.class }}</el-descriptions-item>
              <el-descriptions-item label="提交人">{{ currentConsultation.submitter }}</el-descriptions-item>
              <el-descriptions-item label="联系方式">{{ currentConsultation.phone }}</el-descriptions-item>
              <el-descriptions-item label="提交时间">{{ currentConsultation.submitTime }}</el-descriptions-item>
              <el-descriptions-item label="紧急程度">
                <el-tag size="small" :type="getPriorityTagType(currentConsultation.priority)">{{ getPriorityName(currentConsultation.priority) }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="处理人">{{ currentConsultation.handler || '未分配' }}</el-descriptions-item>
              <el-descriptions-item label="处理时间">{{ currentConsultation.handleTime || '未处理' }}</el-descriptions-item>
            </el-descriptions>
          </div>

          <div class="detail-section">
            <h4>咨询内容</h4>
            <div class="content-box">
              {{ currentConsultation.content }}
            </div>
          </div>

          <div class="detail-section">
            <h4>回复记录</h4>
            <div class="reply-list">
              <div class="reply-item" v-for="(reply, index) in currentConsultation.replies" :key="index">
                <div class="reply-header">
                  <span class="reply-author">{{ reply.author }}</span>
                  <span class="reply-time">{{ reply.time }}</span>
                  <el-tag size="mini" :type="reply.type === 'handler' ? 'primary' : 'success'">{{ reply.type === 'handler' ? '官方回复' : '用户回复' }}</el-tag>
                </div>
                <div class="reply-content">{{ reply.content }}</div>
              </div>
              <div class="no-reply" v-if="!currentConsultation.replies || currentConsultation.replies.length === 0">
                暂无回复记录
              </div>
            </div>
          </div>

          <div class="reply-form" v-if="currentConsultation.status !== 'closed'">
            <h4>添加回复</h4>
            <el-form :model="replyForm" label-width="80px">
              <el-form-item label="回复内容">
                <el-input type="textarea" v-model="replyForm.content" :rows="4" placeholder="请输入回复内容"></el-input>
              </el-form-item>
              <el-form-item label="附件">
                <el-upload action="#" :auto-upload="false" :file-list="replyForm.files" :limit="3">
                  <el-button size="small" type="primary">上传附件</el-button>
                </el-upload>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="submitReply">提交回复</el-button>
                <el-button v-if="currentConsultation.status === 'replied'" @click="closeConsultation(currentConsultation)">关闭工单</el-button>
              </el-form-item>
            </el-form>
          </div>
        </div>
      </el-tab-pane>

      <!-- 工单统计 -->
      <el-tab-pane label="统计分析" name="stats">
        <div class="stats-section">
          <div class="stats-summary">
            <el-row :gutter="20">
              <el-col :span="4">
                <div class="stat-card pending">
                  <span class="stat-value">{{ statsSummary.pending }}</span>
                  <span class="stat-label">待处理</span>
                </div>
              </el-col>
              <el-col :span="4">
                <div class="stat-card processing">
                  <span class="stat-value">{{ statsSummary.processing }}</span>
                  <span class="stat-label">处理中</span>
                </div>
              </el-col>
              <el-col :span="4">
                <div class="stat-card replied">
                  <span class="stat-value">{{ statsSummary.replied }}</span>
                  <span class="stat-label">已回复</span>
                </div>
              </el-col>
              <el-col :span="4">
                <div class="stat-card closed">
                  <span class="stat-value">{{ statsSummary.closed }}</span>
                  <span class="stat-label">已关闭</span>
                </div>
              </el-col>
              <el-col :span="4">
                <div class="stat-card urgent">
                  <span class="stat-value">{{ statsSummary.urgent }}</span>
                  <span class="stat-label">紧急工单</span>
                </div>
              </el-col>
              <el-col :span="4">
                <div class="stat-card avg">
                  <span class="stat-value">{{ statsSummary.avgTime }}h</span>
                  <span class="stat-label">平均处理时长</span>
                </div>
              </el-col>
            </el-row>
          </div>

          <div class="charts-section">
            <el-row :gutter="20">
              <el-col :span="6">
                <div class="chart-card">
                  <div class="chart-title">咨询分类统计</div>
                  <div class="category-stats">
                    <div class="stat-bar" v-for="(item, index) in categoryStats" :key="index">
                      <span class="bar-label">{{ item.label }}</span>
                      <div class="bar-wrapper">
                        <div class="bar-fill" :style="{ width: (item.value / maxCategory * 100) + '%', background: item.color }"></div>
                      </div>
                      <span class="bar-value">{{ item.value }}</span>
                    </div>
                  </div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="chart-card">
                  <div class="chart-title">状态分布</div>
                  <div class="pie-chart-container">
                    <div class="pie-chart" :style="{ background: generatePieGradient(statusPieData) }">
                      <div class="pie-center"></div>
                    </div>
                    <div class="pie-legend">
                      <div class="legend-item" v-for="item in statusPieData" :key="item.label">
                        <span class="legend-color" :style="{ background: item.color }"></span>
                        <span>{{ item.label }}</span>
                        <span>{{ item.value }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="chart-card">
                  <div class="chart-title">近7天工单趋势</div>
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

    <!-- 工单详情对话框 -->
    <el-dialog title="工单详情" :visible.sync="detailDialogVisible" width="700px">
      <div class="consultation-detail-dialog" v-if="currentConsultation">
        <el-descriptions :column="4" border>
          <el-descriptions-item label="工单编号">{{ currentConsultation.ticketNo }}</el-descriptions-item>
          <el-descriptions-item label="咨询标题">{{ currentConsultation.title }}</el-descriptions-item>
          <el-descriptions-item label="分类">{{ getCategoryName(currentConsultation.category) }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag size="small" :type="getStatusTagType(currentConsultation.status)">{{ getStatusName(currentConsultation.status) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="学生姓名">{{ currentConsultation.studentName }}</el-descriptions-item>
          <el-descriptions-item label="班级">{{ currentConsultation.class }}</el-descriptions-item>
          <el-descriptions-item label="提交人">{{ currentConsultation.submitter }}</el-descriptions-item>
          <el-descriptions-item label="联系方式">{{ currentConsultation.phone }}</el-descriptions-item>
          <el-descriptions-item label="提交时间">{{ currentConsultation.submitTime }}</el-descriptions-item>
          <el-descriptions-item label="紧急程度">
            <el-tag size="small" :type="getPriorityTagType(currentConsultation.priority)">{{ getPriorityName(currentConsultation.priority) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="处理人">{{ currentConsultation.handler || '未分配' }}</el-descriptions-item>
          <el-descriptions-item label="处理时间">{{ currentConsultation.handleTime || '未处理' }}</el-descriptions-item>
        </el-descriptions>
        <div class="content-section" style="margin-top: 20px;">
          <h4>咨询内容</h4>
          <p>{{ currentConsultation.content }}</p>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button type="primary" v-if="currentConsultation && currentConsultation.status === 'pending'" @click="handleConsultation(currentConsultation)">处理</el-button>
      </span>
    </el-dialog>

    <!-- 处理工单对话框 -->
    <el-dialog title="处理工单" :visible.sync="handleDialogVisible" width="500px">
      <el-form :model="handleForm" label-width="100px">
        <el-form-item label="分配处理人">
          <el-select v-model="handleForm.handler" placeholder="选择处理人" style="width: 100%;">
            <el-option label="张医生" value="张医生"></el-option>
            <el-option label="李医生" value="李医生"></el-option>
            <el-option label="王老师" value="王老师"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="回复内容">
          <el-input type="textarea" v-model="handleForm.reply" :rows="4" placeholder="请输入回复内容"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitHandle">提交处理</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { NotificationStore } from '@/permission';

export default {
  name: 'ConsultationManage',
  data() {
    return {
      activeTab: 'list',
      listSearch: { category: '', status: '', priority: '', keyword: '' },
      listCurrentPage: 1,
      consultations: [
        { id: 1, ticketNo: 'TK2024001', title: '孩子最近视力下降明显', category: 'health', studentName: '张三', class: '一年级1班', submitter: '张三家长', phone: '13800138001', submitTime: '2024-01-15 10:30', priority: 'urgent', status: 'pending', handler: '', handleTime: '', content: '孩子最近看黑板模糊，怀疑视力下降，想咨询是否需要配眼镜。', replies: [] },
        { id: 2, ticketNo: 'TK2024002', title: '孩子不爱吃蔬菜怎么办', category: 'diet', studentName: '李四', class: '一年级2班', submitter: '李四家长', phone: '13800138002', submitTime: '2024-01-14 14:20', priority: 'normal', status: 'replied', handler: '张医生', handleTime: '2024-01-14 16:30', content: '孩子不爱吃蔬菜，营养不均衡，想咨询如何改善饮食习惯。', replies: [
          { author: '张医生', time: '2024-01-14 16:30', type: 'handler', content: '建议循序渐进引导，可以从孩子喜欢的蔬菜开始，逐步增加种类。也可以尝试把蔬菜做成有趣的形状或搭配孩子喜欢的食材。' },
          { author: '李四家长', time: '2024-01-14 17:00', type: 'user', content: '谢谢医生的建议，我会尝试的。' }
        ]},
        { id: 3, ticketNo: 'TK2024003', title: '孩子最近情绪不稳定', category: 'mental', studentName: '王五', class: '二年级1班', submitter: '王五家长', phone: '13800138003', submitTime: '2024-01-13 09:15', priority: 'urgent', status: 'processing', handler: '王老师', handleTime: '2024-01-13 10:00', content: '孩子最近情绪波动大，有时会突然发脾气，想咨询是否需要心理辅导。', replies: [
          { author: '王老师', time: '2024-01-13 10:00', type: 'handler', content: '已收到您的咨询，我们会安排心理老师进行评估，请稍后。' }
        ]},
        { id: 4, ticketNo: 'TK2024004', title: '体检报告解读咨询', category: 'checkup', studentName: '赵六', class: '三年级2班', submitter: '赵六家长', phone: '13800138004', submitTime: '2024-01-12 16:40', priority: 'low', status: 'closed', handler: '李医生', handleTime: '2024-01-12 18:00', content: '体检报告显示孩子体重偏重，想咨询如何调整。', replies: [
          { author: '李医生', time: '2024-01-12 18:00', type: 'handler', content: '建议控制饮食，增加运动量，每周至少运动3次，每次30分钟以上。' },
          { author: '赵六家长', time: '2024-01-12 19:00', type: 'user', content: '明白了，谢谢医生。' }
        ]},
        { id: 5, ticketNo: 'TK2024005', title: '孩子经常感冒咨询', category: 'health', studentName: '钱七', class: '一年级3班', submitter: '钱七家长', phone: '13800138005', submitTime: '2024-01-11 08:00', priority: 'normal', status: 'pending', handler: '', handleTime: '', content: '孩子最近经常感冒，想咨询如何增强免疫力。', replies: [] }
      ],
      currentConsultation: null,
      detailDialogVisible: false,
      handleDialogVisible: false,
      handleForm: { handler: '', reply: '' },
      replyForm: { content: '', files: [] },
      statsSummary: { pending: 8, processing: 3, replied: 15, closed: 25, urgent: 5, avgTime: 4.5 },
      categoryStats: [
        { label: '健康问题', value: 18, color: '#409eff' },
        { label: '饮食问题', value: 12, color: '#67c23a' },
        { label: '心理问题', value: 8, color: '#e6a23c' },
        { label: '体检问题', value: 15, color: '#909399' },
        { label: '其他', value: 5, color: '#f56c6c' }
      ],
      statusPieData: [
        { label: '待处理', value: 8, color: '#e6a23c' },
        { label: '处理中', value: 3, color: '#409eff' },
        { label: '已回复', value: 15, color: '#67c23a' },
        { label: '已关闭', value: 25, color: '#909399' }
      ],
      trendData: [
        { day: '周一', value: 5 },
        { day: '周二', value: 8 },
        { day: '周三', value: 12 },
        { day: '周四', value: 7 },
        { day: '周五', value: 10 },
        { day: '周六', value: 3 },
        { day: '周日', value: 2 }
      ]
    };
  },
  computed: {
    filteredConsultations() {
      return this.consultations.filter(item => {
        const matchCategory = !this.listSearch.category || item.category === this.listSearch.category;
        const matchStatus = !this.listSearch.status || item.status === this.listSearch.status;
        const matchPriority = !this.listSearch.priority || item.priority === this.listSearch.priority;
        const matchKeyword = !this.listSearch.keyword || item.title.includes(this.listSearch.keyword) || item.studentName.includes(this.listSearch.keyword);
        return matchCategory && matchStatus && matchPriority && matchKeyword;
      });
    },
    pagedConsultations() {
      const start = (this.listCurrentPage - 1) * 10;
      return this.filteredConsultations.slice(start, start + 10);
    },
    maxCategory() {
      return Math.max(...this.categoryStats.map(d => d.value));
    },
    maxTrend() {
      return Math.max(...this.trendData.map(d => d.value));
    }
  },
  methods: {
    getCurrentUser() {
      try {
        const raw = localStorage.getItem('userInfo');
        return raw ? JSON.parse(raw) : null;
      } catch { return null; }
    },
    getCategoryName(category) {
      const map = { health: '健康问题', diet: '饮食问题', mental: '心理问题', checkup: '体检问题', other: '其他' };
      return map[category] || category;
    },
    getCategoryTagType(category) {
      const map = { health: 'primary', diet: 'success', mental: 'warning', checkup: 'info', other: '' };
      return map[category] || '';
    },
    getPriorityName(priority) {
      const map = { urgent: '紧急', normal: '普通', low: '一般' };
      return map[priority] || priority;
    },
    getPriorityTagType(priority) {
      const map = { urgent: 'danger', normal: 'warning', low: 'info' };
      return map[priority] || '';
    },
    getStatusName(status) {
      const map = { pending: '待处理', processing: '处理中', replied: '已回复', closed: '已关闭' };
      return map[status] || status;
    },
    getStatusTagType(status) {
      const map = { pending: 'warning', processing: 'primary', replied: 'success', closed: 'info' };
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
    searchConsultations() {
      this.listCurrentPage = 1;
      this.$message.success('查询完成，共找到 ' + this.filteredConsultations.length + ' 条工单');
    },
    viewConsultation(row) {
      this.currentConsultation = row;
      this.detailDialogVisible = true;
    },
    handleConsultation(row) {
      this.currentConsultation = row;
      this.handleForm = { handler: '', reply: '' };
      this.handleDialogVisible = true;
    },
    submitHandle() {
      if (!this.handleForm.handler) {
        this.$message.warning('请选择处理人');
        return;
      }
      this.currentConsultation.handler = this.handleForm.handler;
      this.currentConsultation.status = 'processing';
      this.currentConsultation.handleTime = new Date().toLocaleString();
      if (this.handleForm.reply) {
        this.currentConsultation.replies.push({
          author: this.handleForm.handler,
          time: new Date().toLocaleString(),
          type: 'handler',
          content: this.handleForm.reply
        });
        this.currentConsultation.status = 'replied';
      }
      this.handleDialogVisible = false;
      this.$message.success('工单已处理');
    },
    submitReply() {
      if (!this.replyForm.content) {
        this.$message.warning('请输入回复内容');
        return;
      }
      const userInfo = this.getCurrentUser();
      this.currentConsultation.replies.push({
        author: '管理员',
        time: new Date().toLocaleString(),
        type: 'handler',
        content: this.replyForm.content
      });
      this.currentConsultation.status = 'replied';

      // 通知家长：健康咨询已回复
      NotificationStore.send({
        type: 'consultation',
        title: '💬 健康咨询已回复',
        content: `您提交的咨询"${this.currentConsultation.title}"已有回复：${this.replyForm.content.substring(0, 50)}...`,
        fromRole: 'doctor',
        fromUser: userInfo ? userInfo.username : '医生/老师',
        toRoles: ['parent'],
        link: '/consultation-manage'
      });

      this.replyForm = { content: '', files: [] };
      this.$message.success('回复已提交');
    },
    closeConsultation(row) {
      this.$confirm('确定关闭该工单吗？', '提示', { type: 'warning' }).then(() => {
        row.status = 'closed';
        this.$message.success('工单已关闭');
      }).catch(() => {});
    }
  }
};
</script>

<style scoped>
.consultation-manage {
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

.consultation-detail {
  padding: 20px;
}

.detail-header {
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 15px;
}

.detail-header h3 {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.detail-meta {
  margin-top: 10px;
  color: #606266;
}

.detail-meta span {
  margin-right: 20px;
}

.detail-section {
  margin: 20px 0;
}

.detail-section h4 {
  margin: 0 0 15px 0;
  font-size: 14px;
  color: #606266;
}

.content-box {
  padding: 15px;
  background: #f5f7fa;
  border-radius: 6px;
  line-height: 1.8;
}

.reply-list {
  max-height: 300px;
  overflow-y: auto;
}

.reply-item {
  padding: 15px;
  border-bottom: 1px dashed #ebeef5;
}

.reply-item:last-child {
  border-bottom: none;
}

.reply-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.reply-author {
  font-weight: 500;
  color: #303133;
}

.reply-time {
  color: #909399;
  font-size: 12px;
}

.reply-content {
  color: #606266;
  line-height: 1.6;
}

.no-reply {
  text-align: center;
  color: #909399;
  padding: 20px;
}

.reply-form {
  margin-top: 20px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 6px;
}

.reply-form h4 {
  margin: 0 0 15px 0;
}

.stats-section {
  padding: 20px 0;
}

.stats-summary {
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

.stat-card.processing {
  background: linear-gradient(135deg, #ecf5ff 0%, #d9ecff 100%);
  border-left: 4px solid #409eff;
}

.stat-card.replied {
  background: linear-gradient(135deg, #f0f9eb 0%, #e1f3d8 100%);
  border-left: 4px solid #67c23a;
}

.stat-card.closed {
  background: linear-gradient(135deg, #f4f4f5 0%, #e9e9eb 100%);
  border-left: 4px solid #909399;
}

.stat-card.urgent {
  background: linear-gradient(135deg, #fef0f0 0%, #fde2e2 100%);
  border-left: 4px solid #f56c6c;
}

.stat-card.avg {
  background: linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%);
  border-left: 4px solid #00bcd4;
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

.category-stats {
  padding: 10px;
}

.stat-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.bar-label {
  width: 80px;
  font-size: 12px;
  color: #606266;
}

.bar-wrapper {
  flex: 1;
  height: 20px;
  background: #f0f2f5;
  border-radius: 4px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 4px;
}

.bar-value {
  width: 30px;
  font-size: 12px;
  color: #303133;
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

.trend-bar .bar-fill {
  width: 30px;
  border-radius: 4px 4px 0 0;
}

.trend-bar .bar-label {
  margin-top: 10px;
  width: auto;
}

.trend-bar .bar-value {
  margin-bottom: 5px;
}

.consultation-detail-dialog .content-section {
  padding: 15px;
  background: #f5f7fa;
  border-radius: 6px;
}

.consultation-detail-dialog .content-section h4 {
  margin: 0 0 10px 0;
}

.consultation-detail-dialog .content-section p {
  margin: 0;
  line-height: 1.8;
}
</style>