<template>
  <div class="disease-warning">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>传染病预警管理</h2>
      <div class="header-actions">
        <el-button type="primary" icon="el-icon-plus" @click="showAddWarningDialog">新增预警</el-button>
        <el-button type="success" icon="el-icon-download" @click="exportTracking">导出台账</el-button>
      </div>
    </div>

    <!-- 预警概览卡片 -->
    <div class="warning-overview">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="overview-card high">
            <div class="card-icon">
              <i class="el-icon-warning"></i>
            </div>
            <div class="card-content">
              <div class="card-value">{{ warningStats.high }}</div>
              <div class="card-label">高危预警</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="overview-card medium">
            <div class="card-icon">
              <i class="el-icon-info"></i>
            </div>
            <div class="card-content">
              <div class="card-value">{{ warningStats.medium }}</div>
              <div class="card-label">中危预警</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="overview-card low">
            <div class="card-icon">
              <i class="el-icon-reminder"></i>
            </div>
            <div class="card-content">
              <div class="card-value">{{ warningStats.low }}</div>
              <div class="card-label">低危预警</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="overview-card resolved">
            <div class="card-icon">
              <i class="el-icon-circle-check"></i>
            </div>
            <div class="card-content">
              <div class="card-value">{{ warningStats.resolved }}</div>
              <div class="card-label">已处理</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 预警列表区域 -->
    <div class="warning-section">
      <div class="section-header">
        <h3>预警列表</h3>
        <div class="filter-group">
          <el-select v-model="filterLevel" placeholder="预警级别" clearable style="width: 120px;">
            <el-option label="高危" value="high" />
            <el-option label="中危" value="medium" />
            <el-option label="低危" value="low" />
          </el-select>
          <el-select v-model="filterStatus" placeholder="处理状态" clearable style="width: 120px;">
            <el-option label="待处理" value="pending" />
            <el-option label="处理中" value="processing" />
            <el-option label="已处理" value="resolved" />
          </el-select>
        </div>
      </div>

      <el-table :data="filteredWarningList" border stripe style="width: 100%">
        <el-table-column prop="warningNo" label="预警编号" width="120" />
        <el-table-column prop="className" label="班级" width="120" />
        <el-table-column prop="diseaseType" label="疑似类型" width="120">
          <template slot-scope="scope">
            <span>{{ scope.row.diseaseType }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="symptoms" label="相似症状" min-width="180">
          <template slot-scope="scope">
            <el-tag v-for="(symptom, index) in scope.row.symptoms" :key="index" size="small" style="margin-right: 5px;">
              {{ symptom }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="studentCount" label="涉及人数" width="100" align="center">
          <template slot-scope="scope">
            <span class="student-count" :class="{ 'count-warning': scope.row.studentCount >= 3 }">
              {{ scope.row.studentCount }}人
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="level" label="预警级别" width="100" align="center">
          <template slot-scope="scope">
            <el-tag :type="getLevelType(scope.row.level)" effect="dark" size="small">
              {{ getLevelText(scope.row.level) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="预警时间" width="160" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template slot-scope="scope">
            <el-tag :type="getStatusType(scope.row.status)" size="small">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="viewWarningDetail(scope.row)">详情</el-button>
            <el-button type="text" size="small" @click="showSuggestion(scope.row)">建议</el-button>
            <el-button type="text" size="small" @click="handleWarning(scope.row)" v-if="scope.row.status !== 'resolved'">
              处理
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 防疫处理建议区域 -->
    <div class="suggestion-section">
      <div class="section-header">
        <h3>防疫处理建议</h3>
      </div>
      <el-row :gutter="20">
        <el-col :span="8" v-for="(suggestion, index) in suggestions" :key="index">
          <div class="suggestion-card">
            <div class="suggestion-icon">
              <i :class="suggestion.icon"></i>
            </div>
            <div class="suggestion-content">
              <h4>{{ suggestion.title }}</h4>
              <p>{{ suggestion.content }}</p>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 传染病跟踪台账 -->
    <div class="tracking-section">
      <div class="section-header">
        <h3>传染病跟踪台账</h3>
        <div class="header-actions">
          <el-date-picker
            v-model="trackingDateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd"
          />
        </div>
      </div>

      <el-table :data="trackingList" border stripe style="width: 100%">
        <el-table-column prop="studentName" label="学生姓名" width="100" />
        <el-table-column prop="className" label="班级" width="100" />
        <el-table-column prop="diseaseName" label="确诊疾病" width="120" />
        <el-table-column prop="diagnosisDate" label="确诊日期" width="120" />
        <el-table-column prop="symptoms" label="主要症状" min-width="150" />
        <el-table-column prop="treatment" label="治疗情况" min-width="150" />
        <el-table-column prop="isolationStart" label="隔离开始" width="120" />
        <el-table-column prop="isolationEnd" label="隔离结束" width="120" />
        <el-table-column prop="returnDate" label="返校日期" width="120" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template slot-scope="scope">
            <el-tag :type="getTrackingStatusType(scope.row.status)" size="small">
              {{ getTrackingStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="editTracking(scope.row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          background
          layout="total, prev, pager, next"
          :total="trackingTotal"
          :page-size="pageSize"
          :current-page="currentPage"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <!-- 预警详情弹窗 -->
    <el-dialog title="预警详情" :visible.sync="detailDialogVisible" width="700px">
      <el-descriptions :column="2" border v-if="currentWarning">
        <el-descriptions-item label="预警编号">{{ currentWarning.warningNo }}</el-descriptions-item>
        <el-descriptions-item label="预警级别">
          <el-tag :type="getLevelType(currentWarning.level)" effect="dark" size="small">
            {{ getLevelText(currentWarning.level) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="涉及班级">{{ currentWarning.className }}</el-descriptions-item>
        <el-descriptions-item label="疑似类型">{{ currentWarning.diseaseType }}</el-descriptions-item>
        <el-descriptions-item label="涉及人数">{{ currentWarning.studentCount }}人</el-descriptions-item>
        <el-descriptions-item label="预警时间">{{ currentWarning.createTime }}</el-descriptions-item>
        <el-descriptions-item label="相似症状" :span="2">
          <el-tag v-for="(symptom, index) in currentWarning.symptoms" :key="index" size="small" style="margin-right: 5px;">
            {{ symptom }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="涉及学生" :span="2">
          <div class="student-list">
            <span v-for="(student, index) in currentWarning.students" :key="index" class="student-tag">
              {{ student.name }} ({{ student.symptoms }})
            </span>
          </div>
        </el-descriptions-item>
      </el-descriptions>
      <span slot="footer">
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="handleWarning(currentWarning)" v-if="currentWarning && currentWarning.status !== 'resolved'">
          立即处理
        </el-button>
      </span>
    </el-dialog>

    <!-- 处理建议弹窗 -->
    <el-dialog title="防疫处理建议" :visible.sync="suggestionDialogVisible" width="600px">
      <div class="suggestion-detail" v-if="currentSuggestion">
        <el-alert
          :title="currentSuggestion.title"
          :type="currentSuggestion.level === 'high' ? 'error' : currentSuggestion.level === 'medium' ? 'warning' : 'info'"
          :closable="false"
          show-icon
          style="margin-bottom: 20px;"
        />
        <div class="suggestion-steps">
          <h4>处理步骤：</h4>
          <el-steps :active="0" direction="vertical">
            <el-step v-for="(step, index) in currentSuggestion.steps" :key="index" :title="step.title" :description="step.desc" />
          </el-steps>
        </div>
        <div class="suggestion-note">
          <h4>注意事项：</h4>
          <ul>
            <li v-for="(note, index) in currentSuggestion.notes" :key="index">{{ note }}</li>
          </ul>
        </div>
      </div>
      <span slot="footer">
        <el-button @click="suggestionDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="applySuggestion">应用建议</el-button>
      </span>
    </el-dialog>

    <!-- 处理预警弹窗 -->
    <el-dialog title="处理预警" :visible.sync="handleDialogVisible" width="500px">
      <el-form :model="handleForm" label-width="100px">
        <el-form-item label="处理措施">
          <el-checkbox-group v-model="handleForm.measures">
            <el-checkbox label="isolation">隔离观察</el-checkbox>
            <el-checkbox label="notify">通知家长</el-checkbox>
            <el-checkbox label="disinfect">教室消毒</el-checkbox>
            <el-checkbox label="report">上报疾控</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="处理说明">
          <el-input v-model="handleForm.remark" type="textarea" :rows="4" placeholder="请输入处理说明" />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="handleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitHandle">确认处理</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { NotificationStore } from '@/permission';

export default {
  name: 'DiseaseWarning',
  data() {
    return {
      filterLevel: '',
      filterStatus: '',
      trackingDateRange: [],
      currentPage: 1,
      pageSize: 10,
      trackingTotal: 0,
      detailDialogVisible: false,
      suggestionDialogVisible: false,
      handleDialogVisible: false,
      currentWarning: null,
      currentSuggestion: null,
      warningStats: {
        high: 2,
        medium: 5,
        low: 8,
        resolved: 15
      },
      warningList: [
        {
          id: 1,
          warningNo: 'YW20240601001',
          className: '一年级1班',
          diseaseType: '流感',
          symptoms: ['发热', '咳嗽', '头痛'],
          studentCount: 4,
          level: 'high',
          createTime: '2024-06-01 09:30',
          status: 'pending',
          students: [
            { name: '张小明', symptoms: '发热38.5℃' },
            { name: '李小红', symptoms: '咳嗽、流涕' },
            { name: '王小华', symptoms: '发热37.8℃' },
            { name: '赵小刚', symptoms: '头痛、乏力' }
          ]
        },
        {
          id: 2,
          warningNo: 'YW20240601002',
          className: '二年级2班',
          diseaseType: '手足口病',
          symptoms: ['皮疹', '发热', '口腔溃疡'],
          studentCount: 2,
          level: 'medium',
          createTime: '2024-06-01 10:15',
          status: 'processing',
          students: [
            { name: '刘小芳', symptoms: '手部皮疹' },
            { name: '陈小强', symptoms: '口腔溃疡' }
          ]
        },
        {
          id: 3,
          warningNo: 'YW20240601003',
          className: '三年级1班',
          diseaseType: '水痘',
          symptoms: ['皮疹', '发热', '瘙痒'],
          studentCount: 1,
          level: 'low',
          createTime: '2024-06-01 11:00',
          status: 'resolved',
          students: [
            { name: '周小敏', symptoms: '躯干皮疹' }
          ]
        }
      ],
      suggestions: [
        {
          icon: 'el-icon-first-aid-kit',
          title: '隔离措施',
          content: '发现疑似病例立即隔离，避免交叉感染。隔离室应保持通风，配备必要医疗物资。'
        },
        {
          icon: 'el-icon-phone',
          title: '通知家长',
          content: '及时通知学生家长，告知病情及注意事项，建议及时就医并做好居家隔离。'
        },
        {
          icon: 'el-icon-document-checked',
          title: '上报疾控',
          content: '按规定时限向疾控中心报告，配合流行病学调查，做好疫情监测和追踪。'
        }
      ],
      trackingList: [
        {
          id: 1,
          studentName: '张小明',
          className: '一年级1班',
          diseaseName: '流感',
          diagnosisDate: '2024-05-28',
          symptoms: '发热、咳嗽、头痛',
          treatment: '居家隔离治疗',
          isolationStart: '2024-05-28',
          isolationEnd: '2024-06-04',
          returnDate: '-',
          status: 'isolating'
        },
        {
          id: 2,
          studentName: '李小红',
          className: '一年级1班',
          diseaseName: '流感',
          diagnosisDate: '2024-05-29',
          symptoms: '咳嗽、流涕',
          treatment: '居家隔离治疗',
          isolationStart: '2024-05-29',
          isolationEnd: '2024-06-05',
          returnDate: '-',
          status: 'isolating'
        },
        {
          id: 3,
          studentName: '王小华',
          className: '二年级1班',
          diseaseName: '水痘',
          diagnosisDate: '2024-05-15',
          symptoms: '皮疹、发热',
          treatment: '居家隔离治疗',
          isolationStart: '2024-05-15',
          isolationEnd: '2024-05-29',
          returnDate: '2024-05-30',
          status: 'returned'
        }
      ],
      handleForm: {
        measures: [],
        remark: ''
      }
    };
  },
  computed: {
    filteredWarningList() {
      let list = this.warningList;
      
      if (this.filterLevel) {
        list = list.filter(item => item.level === this.filterLevel);
      }
      
      if (this.filterStatus) {
        list = list.filter(item => item.status === this.filterStatus);
      }
      
      return list;
    }
  },
  methods: {
    getCurrentUser() {
      try {
        const raw = localStorage.getItem('userInfo');
        return raw ? JSON.parse(raw) : null;
      } catch { return null; }
    },
    getLevelType(level) {
      const map = {
        high: 'danger',
        medium: 'warning',
        low: 'info'
      };
      return map[level] || 'info';
    },
    getLevelText(level) {
      const map = {
        high: '高危',
        medium: '中危',
        low: '低危'
      };
      return map[level] || '未知';
    },
    getStatusType(status) {
      const map = {
        pending: 'danger',
        processing: 'warning',
        resolved: 'success'
      };
      return map[status] || 'info';
    },
    getStatusText(status) {
      const map = {
        pending: '待处理',
        processing: '处理中',
        resolved: '已处理'
      };
      return map[status] || '未知';
    },
    getTrackingStatusType(status) {
      const map = {
        isolating: 'warning',
        returned: 'success',
        cured: 'info'
      };
      return map[status] || 'info';
    },
    getTrackingStatusText(status) {
      const map = {
        isolating: '隔离中',
        returned: '已返校',
        cured: '已痊愈'
      };
      return map[status] || '未知';
    },
    viewWarningDetail(row) {
      this.currentWarning = row;
      this.detailDialogVisible = true;
    },
    showSuggestion(row) {
      this.currentSuggestion = {
        title: `${row.diseaseType}预警处理建议`,
        level: row.level,
        steps: [
          { title: '立即隔离', desc: '将疑似学生送至隔离室进行观察' },
          { title: '通知家长', desc: '联系学生家长，告知情况并建议就医' },
          { title: '教室消毒', desc: '对教室进行全面消毒处理' },
          { title: '健康监测', desc: '对同班学生进行健康监测' },
          { title: '上报疾控', desc: '按规定向疾控中心报告' }
        ],
        notes: [
          '隔离期间禁止学生返校',
          '做好学生健康追踪记录',
          '教室保持通风换气',
          '加强学生卫生教育'
        ]
      };
      this.suggestionDialogVisible = true;
    },
    handleWarning(row) {
      this.currentWarning = row;
      this.handleForm = {
        measures: [],
        remark: ''
      };
      this.handleDialogVisible = true;
    },
    submitHandle() {
      if (this.handleForm.measures.length === 0) {
        this.$message.warning('请选择至少一项处理措施');
        return;
      }
      // 更新预警状态为已处理
      if (this.currentWarning) {
        this.currentWarning.status = 'resolved';
        const idx = this.warningList.findIndex(w => w.id === this.currentWarning.id);
        if (idx >= 0) this.warningList[idx] = this.currentWarning;
        // 发送通知给家长和老师
        const userInfo = this.getCurrentUser();
        NotificationStore.send({
          type: 'disease_warning',
          title: '🦠 传染病预警已处理',
          content: `班级 ${this.currentWarning.className} 的 ${this.currentWarning.diseaseType} 预警已由教师处理，处理措施：${this.handleForm.measures.join('、')}。${this.handleForm.remark ? ('备注：' + this.handleForm.remark) : ''}`,
          fromRole: userInfo ? userInfo.role : 'teacher',
          fromUser: userInfo ? userInfo.username : '教师',
          toRoles: ['parent', 'teacher'],
          link: '/disease-warning'
        });
      }
      this.$message.success('预警处理成功');
      this.handleDialogVisible = false;
      this.detailDialogVisible = false;
    },
    applySuggestion() {
      this.$message.success('建议已应用');
      this.suggestionDialogVisible = false;
    },
    showAddWarningDialog() {
      this.$prompt('请输入班级名称', '新增预警', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /.+/,
        inputErrorMessage: '班级名称不能为空'
      }).then(({ value }) => {
        const newWarning = {
          id: Date.now(),
          warningNo: 'YW' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '001',
          className: value,
          diseaseType: '流感',
          symptoms: ['发热', '咳嗽'],
          studentCount: 1,
          level: 'medium',
          createTime: new Date().toLocaleString(),
          status: 'pending',
          students: [{ name: '待登记', symptoms: '待确认' }]
        };
        this.warningList.unshift(newWarning);
        // 发送预警通知给家长和老师
        const userInfo = this.getCurrentUser();
        NotificationStore.send({
          type: 'disease_warning',
          title: '🦠 传染病预警通知',
          content: `班级 ${value} 发布了新的传染病预警，类型：流感，请家长和老师注意防范。`,
          fromRole: userInfo ? userInfo.role : 'doctor',
          fromUser: userInfo ? userInfo.username : '校医',
          toRoles: ['parent', 'teacher'],
          link: '/disease-warning'
        });
        this.$message.success('预警已发布');
      }).catch(() => {});
    },
    exportTracking() {
      this.$message.success('台账导出成功');
    },
    editTracking(row) {
      this.$message.info(`编辑学生：${row.studentName}`);
    },
    handlePageChange(page) {
      this.currentPage = page;
    }
  }
};
</script>

<style scoped>
.disease-warning {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
  color: #303133;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.warning-overview {
  margin-bottom: 20px;
}

.overview-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.overview-card .card-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.overview-card.high .card-icon {
  background: #fff2f0;
  color: #ff4d4f;
}

.overview-card.medium .card-icon {
  background: #fffbe6;
  color: #faad14;
}

.overview-card.low .card-icon {
  background: #e6f7ff;
  color: #1890ff;
}

.overview-card.resolved .card-icon {
  background: #f6ffed;
  color: #52c41a;
}

.overview-card .card-content .card-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}

.overview-card .card-content .card-label {
  font-size: 14px;
  color: #909399;
  margin-top: 5px;
}

.warning-section,
.suggestion-section,
.tracking-section {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.section-header h3 {
  margin: 0;
  font-size: 16px;
  color: #303133;
}

.filter-group {
  display: flex;
  gap: 10px;
}

.student-count {
  font-weight: bold;
}

.student-count.count-warning {
  color: #ff4d4f;
}

.suggestion-card {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  gap: 15px;
  align-items: flex-start;
}

.suggestion-card .suggestion-icon {
  width: 40px;
  height: 40px;
  background: #1890ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 20px;
  flex-shrink: 0;
}

.suggestion-card .suggestion-content h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #303133;
}

.suggestion-card .suggestion-content p {
  margin: 0;
  font-size: 12px;
  color: #606266;
  line-height: 1.6;
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.student-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.student-tag {
  background: #f0f0f0;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: #606266;
}

.suggestion-detail {
  padding: 10px 0;
}

.suggestion-steps {
  margin-bottom: 20px;
}

.suggestion-steps h4,
.suggestion-note h4 {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #303133;
}

.suggestion-note ul {
  margin: 0;
  padding-left: 20px;
}

.suggestion-note li {
  margin-bottom: 5px;
  color: #606266;
  font-size: 13px;
}
</style>