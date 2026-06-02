<template>
  <div class="isolation-manage">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>传染病隔离管控</h2>
      <div class="header-actions">
        <el-button type="primary" icon="el-icon-plus" @click="showAddIsolationDialog">新增隔离</el-button>
        <el-button type="success" icon="el-icon-download" @click="exportIsolation">导出记录</el-button>
      </div>
    </div>

    <!-- 隔离概览卡片 -->
    <div class="isolation-overview">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="overview-card active">
            <div class="card-icon">
              <i class="el-icon-user"></i>
            </div>
            <div class="card-content">
              <div class="card-value">{{ isolationStats.active }}</div>
              <div class="card-label">正在隔离</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="overview-card pending">
            <div class="card-icon">
              <i class="el-icon-time"></i>
            </div>
            <div class="card-content">
              <div class="card-value">{{ isolationStats.pendingReturn }}</div>
              <div class="card-label">待复课审批</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="overview-card completed">
            <div class="card-icon">
              <i class="el-icon-circle-check"></i>
            </div>
            <div class="card-content">
              <div class="card-value">{{ isolationStats.completed }}</div>
              <div class="card-label">已完成隔离</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="overview-card warning">
            <div class="card-icon">
              <i class="el-icon-warning"></i>
            </div>
            <div class="card-content">
              <div class="card-value">{{ isolationStats.overdue }}</div>
              <div class="card-label">逾期未复课</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 隔离学生列表 -->
    <div class="isolation-section">
      <div class="section-header">
        <h3>隔离学生列表</h3>
        <div class="filter-group">
          <el-select v-model="filterStatus" placeholder="隔离状态" clearable style="width: 120px;">
            <el-option label="正在隔离" value="active" />
            <el-option label="待复课审批" value="pending" />
            <el-option label="已复课" value="completed" />
            <el-option label="逾期未复课" value="overdue" />
          </el-select>
          <el-select v-model="filterDisease" placeholder="疾病类型" clearable style="width: 120px;">
            <el-option label="流感" value="flu" />
            <el-option label="水痘" value="chickenpox" />
            <el-option label="手足口病" value="handfoot" />
            <el-option label="诺如病毒" value="norovirus" />
            <el-option label="其他" value="other" />
          </el-select>
          <el-input v-model="searchKeyword" placeholder="搜索学生姓名" prefix-icon="el-icon-search" clearable style="width: 180px;" />
        </div>
      </div>

      <el-table :data="filteredIsolationList" border stripe style="width: 100%">
        <el-table-column prop="studentName" label="学生姓名" width="100" />
        <el-table-column prop="className" label="班级" width="120" />
        <el-table-column prop="diseaseType" label="疾病类型" width="120">
          <template slot-scope="scope">
            <el-tag :type="getDiseaseTagType(scope.row.diseaseType)" size="small">
              {{ getDiseaseText(scope.row.diseaseType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="isolationReason" label="隔离原因" min-width="150" show-overflow-tooltip />
        <el-table-column prop="startDate" label="隔离开始" width="110" />
        <el-table-column prop="endDate" label="隔离结束" width="110">
          <template slot-scope="scope">
            <span :class="{ 'overdue-date': isOverdue(scope.row.endDate) }">
              {{ scope.row.endDate }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="isolationDays" label="隔离天数" width="90" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.isolationDays }}天</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template slot-scope="scope">
            <el-tag :type="getStatusType(scope.row.status)" effect="dark" size="small">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="viewIsolationDetail(scope.row)">详情</el-button>
            <el-button type="text" size="small" @click="showFollowUpDialog(scope.row)">随访</el-button>
            <el-button type="text" size="small" @click="showReturnApprovalDialog(scope.row)" v-if="scope.row.status === 'pending'">
              复课审批
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          background
          layout="total, prev, pager, next"
          :total="isolationTotal"
          :page-size="pageSize"
          :current-page="currentPage"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <!-- 隔离原因登记区域 -->
    <div class="reason-section">
      <div class="section-header">
        <h3>隔离原因登记统计</h3>
      </div>
      <el-row :gutter="20">
        <el-col :span="6" v-for="(reason, index) in isolationReasons" :key="index">
          <div class="reason-card">
            <div class="reason-header">
              <span class="reason-title">{{ reason.name }}</span>
              <el-tag :type="reason.level === 'high' ? 'danger' : reason.level === 'medium' ? 'warning' : 'info'" size="mini">
                {{ reason.level === 'high' ? '高风险' : reason.level === 'medium' ? '中风险' : '低风险' }}
              </el-tag>
            </div>
            <div class="reason-body">
              <div class="reason-count">{{ reason.count }}人</div>
              <div class="reason-days">建议隔离：{{ reason.suggestDays }}天</div>
            </div>
            <div class="reason-footer">
              <el-button type="text" size="mini" @click="showReasonDetail(reason)">查看详情</el-button>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 随访记录列表 -->
    <div class="followup-section">
      <div class="section-header">
        <h3>随访记录</h3>
        <div class="header-actions">
          <el-date-picker
            v-model="followupDateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd"
          />
        </div>
      </div>

      <el-table :data="followupList" border stripe style="width: 100%">
        <el-table-column prop="studentName" label="学生姓名" width="100" />
        <el-table-column prop="className" label="班级" width="120" />
        <el-table-column prop="followupDate" label="随访日期" width="110" />
        <el-table-column prop="followupType" label="随访方式" width="100">
          <template slot-scope="scope">
            <el-tag size="small">{{ scope.row.followupType }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="healthStatus" label="健康状况" width="100">
          <template slot-scope="scope">
            <el-tag :type="getHealthTagType(scope.row.healthStatus)" size="small">
              {{ scope.row.healthStatus }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="symptoms" label="当前症状" min-width="150" show-overflow-tooltip />
        <el-table-column prop="suggestion" label="健康建议" min-width="150" show-overflow-tooltip />
        <el-table-column prop="nextFollowup" label="下次随访" width="110" />
        <el-table-column label="操作" width="100" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="editFollowup(scope.row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 新增隔离弹窗 -->
    <el-dialog title="新增隔离记录" :visible.sync="addIsolationDialogVisible" width="600px">
      <el-form :model="isolationForm" :rules="isolationRules" ref="isolationForm" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="学生姓名" prop="studentName">
              <el-select v-model="isolationForm.studentName" placeholder="请选择学生" filterable style="width: 100%;">
                <el-option label="张小明" value="张小明" />
                <el-option label="李小红" value="李小红" />
                <el-option label="王小华" value="王小华" />
                <el-option label="赵小刚" value="赵小刚" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="班级" prop="className">
              <el-select v-model="isolationForm.className" placeholder="请选择班级" style="width: 100%;">
                <el-option label="一年级1班" value="一年级1班" />
                <el-option label="一年级2班" value="一年级2班" />
                <el-option label="二年级1班" value="二年级1班" />
                <el-option label="二年级2班" value="二年级2班" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="疾病类型" prop="diseaseType">
              <el-select v-model="isolationForm.diseaseType" placeholder="请选择疾病类型" style="width: 100%;">
                <el-option label="流感" value="flu" />
                <el-option label="水痘" value="chickenpox" />
                <el-option label="手足口病" value="handfoot" />
                <el-option label="诺如病毒" value="norovirus" />
                <el-option label="其他" value="other" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="隔离天数" prop="isolationDays">
              <el-input-number v-model="isolationForm.isolationDays" :min="1" :max="30" style="width: 100%;" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="隔离原因" prop="isolationReason">
          <el-input v-model="isolationForm.isolationReason" type="textarea" :rows="3" placeholder="请输入隔离原因" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="隔离开始" prop="startDate">
              <el-date-picker v-model="isolationForm.startDate" type="date" placeholder="选择日期" style="width: 100%;" value-format="yyyy-MM-dd" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="隔离结束" prop="endDate">
              <el-date-picker v-model="isolationForm.endDate" type="date" placeholder="选择日期" style="width: 100%;" value-format="yyyy-MM-dd" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="家长通知">
          <el-checkbox v-model="isolationForm.notifyParent">已通知家长</el-checkbox>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="isolationForm.remark" type="textarea" :rows="2" placeholder="其他备注信息" />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="addIsolationDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitIsolation">确认新增</el-button>
      </span>
    </el-dialog>

    <!-- 隔离详情弹窗 -->
    <el-dialog title="隔离详情" :visible.sync="detailDialogVisible" width="700px">
      <el-descriptions :column="2" border v-if="currentIsolation">
        <el-descriptions-item label="学生姓名">{{ currentIsolation.studentName }}</el-descriptions-item>
        <el-descriptions-item label="班级">{{ currentIsolation.className }}</el-descriptions-item>
        <el-descriptions-item label="疾病类型">
          <el-tag :type="getDiseaseTagType(currentIsolation.diseaseType)" size="small">
            {{ getDiseaseText(currentIsolation.diseaseType) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="隔离状态">
          <el-tag :type="getStatusType(currentIsolation.status)" effect="dark" size="small">
            {{ getStatusText(currentIsolation.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="隔离开始">{{ currentIsolation.startDate }}</el-descriptions-item>
        <el-descriptions-item label="隔离结束">{{ currentIsolation.endDate }}</el-descriptions-item>
        <el-descriptions-item label="隔离天数">{{ currentIsolation.isolationDays }}天</el-descriptions-item>
        <el-descriptions-item label="已隔离">{{ currentIsolation.elapsedDays }}天</el-descriptions-item>
        <el-descriptions-item label="隔离原因" :span="2">{{ currentIsolation.isolationReason }}</el-descriptions-item>
        <el-descriptions-item label="家长通知">{{ currentIsolation.notifyParent ? '已通知' : '未通知' }}</el-descriptions-item>
        <el-descriptions-item label="疾控上报">{{ currentIsolation.reportCDC ? '已上报' : '未上报' }}</el-descriptions-item>
      </el-descriptions>
      
      <div class="followup-history" v-if="currentIsolation && currentIsolation.followups">
        <h4>随访记录</h4>
        <el-timeline>
          <el-timeline-item v-for="(item, index) in currentIsolation.followups" :key="index" :timestamp="item.date" placement="top">
            <el-card>
              <div class="timeline-content">
                <span class="health-status">
                  <el-tag :type="getHealthTagType(item.healthStatus)" size="mini">{{ item.healthStatus }}</el-tag>
                </span>
                <span class="symptoms">症状：{{ item.symptoms }}</span>
                <span class="suggestion">建议：{{ item.suggestion }}</span>
              </div>
            </el-card>
          </el-timeline-item>
        </el-timeline>
      </div>
      
      <span slot="footer">
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="showFollowUpDialog(currentIsolation)">添加随访</el-button>
      </span>
    </el-dialog>

    <!-- 随访记录弹窗 -->
    <el-dialog title="添加随访记录" :visible.sync="followupDialogVisible" width="500px">
      <el-form :model="followupForm" :rules="followupRules" ref="followupForm" label-width="100px">
        <el-form-item label="学生姓名">
          <el-input v-model="followupForm.studentName" disabled />
        </el-form-item>
        <el-form-item label="随访日期" prop="followupDate">
          <el-date-picker v-model="followupForm.followupDate" type="date" placeholder="选择日期" style="width: 100%;" value-format="yyyy-MM-dd" />
        </el-form-item>
        <el-form-item label="随访方式" prop="followupType">
          <el-select v-model="followupForm.followupType" placeholder="请选择" style="width: 100%;">
            <el-option label="电话随访" value="电话随访" />
            <el-option label="微信随访" value="微信随访" />
            <el-option label="上门随访" value="上门随访" />
            <el-option label="返校检查" value="返校检查" />
          </el-select>
        </el-form-item>
        <el-form-item label="健康状况" prop="healthStatus">
          <el-select v-model="followupForm.healthStatus" placeholder="请选择" style="width: 100%;">
            <el-option label="好转" value="好转" />
            <el-option label="稳定" value="稳定" />
            <el-option label="加重" value="加重" />
            <el-option label="痊愈" value="痊愈" />
          </el-select>
        </el-form-item>
        <el-form-item label="当前症状" prop="symptoms">
          <el-input v-model="followupForm.symptoms" placeholder="请输入当前症状" />
        </el-form-item>
        <el-form-item label="健康建议" prop="suggestion">
          <el-input v-model="followupForm.suggestion" type="textarea" :rows="3" placeholder="请输入健康建议" />
        </el-form-item>
        <el-form-item label="下次随访">
          <el-date-picker v-model="followupForm.nextFollowup" type="date" placeholder="选择日期" style="width: 100%;" value-format="yyyy-MM-dd" />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="followupDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitFollowup">确认添加</el-button>
      </span>
    </el-dialog>

    <!-- 复课审批弹窗 -->
    <el-dialog title="复课审批" :visible.sync="returnApprovalDialogVisible" width="600px">
      <el-form :model="returnApprovalForm" :rules="returnApprovalRules" ref="returnApprovalForm" label-width="100px">
        <el-form-item label="学生姓名">
          <el-input v-model="returnApprovalForm.studentName" disabled />
        </el-form-item>
        <el-form-item label="隔离信息">
          <el-descriptions :column="1" border size="small">
            <el-descriptions-item label="疾病类型">{{ getDiseaseText(returnApprovalForm.diseaseType) }}</el-descriptions-item>
            <el-descriptions-item label="隔离天数">{{ returnApprovalForm.isolationDays }}天</el-descriptions-item>
            <el-descriptions-item label="隔离结束">{{ returnApprovalForm.endDate }}</el-descriptions-item>
          </el-descriptions>
        </el-form-item>
        <el-form-item label="复课条件">
          <el-checkbox-group v-model="returnApprovalForm.conditions">
            <el-checkbox label="symptomFree">症状已消失</el-checkbox>
            <el-checkbox label="doctorApproval">有医生复课证明</el-checkbox>
            <el-checkbox label="isolationComplete">隔离期满</el-checkbox>
            <el-checkbox label="parentRequest">家长申请复课</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="审批结果" prop="approvalResult">
          <el-radio-group v-model="returnApprovalForm.approvalResult">
            <el-radio label="approved">批准复课</el-radio>
            <el-radio label="rejected">不予批准</el-radio>
            <el-radio label="pending">待观察</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审批意见" prop="approvalOpinion">
          <el-input v-model="returnApprovalForm.approvalOpinion" type="textarea" :rows="3" placeholder="请输入审批意见" />
        </el-form-item>
        <el-form-item label="复课日期" v-if="returnApprovalForm.approvalResult === 'approved'">
          <el-date-picker v-model="returnApprovalForm.returnDate" type="date" placeholder="选择日期" style="width: 100%;" value-format="yyyy-MM-dd" />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="returnApprovalDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitReturnApproval">确认审批</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'IsolationManage',
  data() {
    return {
      filterStatus: '',
      filterDisease: '',
      searchKeyword: '',
      currentPage: 1,
      pageSize: 10,
      isolationTotal: 50,
      followupDateRange: [],
      addIsolationDialogVisible: false,
      detailDialogVisible: false,
      followupDialogVisible: false,
      returnApprovalDialogVisible: false,
      currentIsolation: null,
      isolationStats: {
        active: 8,
        pendingReturn: 3,
        completed: 25,
        overdue: 2
      },
      isolationList: [
        {
          id: 1,
          studentName: '张小明',
          className: '一年级1班',
          diseaseType: 'flu',
          isolationReason: '确诊流感，发热38.5℃，咳嗽、头痛症状明显',
          startDate: '2024-06-01',
          endDate: '2024-06-07',
          isolationDays: 7,
          elapsedDays: 3,
          status: 'active',
          notifyParent: true,
          reportCDC: true,
          followups: [
            { date: '2024-06-02', healthStatus: '稳定', symptoms: '发热37.8℃，咳嗽减轻', suggestion: '继续居家隔离，多喝水' },
            { date: '2024-06-03', healthStatus: '好转', symptoms: '体温正常，偶有咳嗽', suggestion: '保持休息，注意观察' }
          ]
        },
        {
          id: 2,
          studentName: '李小红',
          className: '二年级2班',
          diseaseType: 'chickenpox',
          isolationReason: '确诊水痘，躯干出现皮疹，伴有发热',
          startDate: '2024-05-25',
          endDate: '2024-06-08',
          isolationDays: 14,
          elapsedDays: 7,
          status: 'active',
          notifyParent: true,
          reportCDC: true,
          followups: [
            { date: '2024-05-28', healthStatus: '稳定', symptoms: '皮疹增多，体温37.5℃', suggestion: '避免抓挠，保持皮肤清洁' },
            { date: '2024-06-01', healthStatus: '好转', symptoms: '皮疹开始结痂，体温正常', suggestion: '继续隔离至全部结痂' }
          ]
        },
        {
          id: 3,
          studentName: '王小华',
          className: '一年级1班',
          diseaseType: 'handfoot',
          isolationReason: '手足口病，手部皮疹，口腔溃疡',
          startDate: '2024-05-28',
          endDate: '2024-06-04',
          isolationDays: 7,
          elapsedDays: 7,
          status: 'pending',
          notifyParent: true,
          reportCDC: false,
          followups: [
            { date: '2024-06-02', healthStatus: '痊愈', symptoms: '皮疹消退，口腔溃疡愈合', suggestion: '可申请复课审批' }
          ]
        },
        {
          id: 4,
          studentName: '赵小刚',
          className: '三年级1班',
          diseaseType: 'norovirus',
          isolationReason: '诺如病毒感染，呕吐、腹泻症状',
          startDate: '2024-05-30',
          endDate: '2024-06-05',
          isolationDays: 5,
          elapsedDays: 5,
          status: 'pending',
          notifyParent: true,
          reportCDC: true,
          followups: [
            { date: '2024-06-03', healthStatus: '好转', symptoms: '症状明显改善', suggestion: '注意饮食卫生' },
            { date: '2024-06-05', healthStatus: '痊愈', symptoms: '无症状', suggestion: '可申请复课' }
          ]
        },
        {
          id: 5,
          studentName: '周小敏',
          className: '二年级1班',
          diseaseType: 'flu',
          isolationReason: '流感痊愈后申请复课',
          startDate: '2024-05-20',
          endDate: '2024-05-27',
          isolationDays: 7,
          elapsedDays: 7,
          status: 'completed',
          notifyParent: true,
          reportCDC: true,
          returnDate: '2024-05-28',
          followups: []
        }
      ],
      isolationReasons: [
        { name: '流感', count: 12, suggestDays: 7, level: 'medium' },
        { name: '水痘', count: 5, suggestDays: 14, level: 'high' },
        { name: '手足口病', count: 8, suggestDays: 7, level: 'high' },
        { name: '诺如病毒', count: 3, suggestDays: 5, level: 'medium' }
      ],
      followupList: [
        {
          id: 1,
          studentName: '张小明',
          className: '一年级1班',
          followupDate: '2024-06-03',
          followupType: '电话随访',
          healthStatus: '好转',
          symptoms: '体温正常，偶有咳嗽',
          suggestion: '保持休息，注意观察',
          nextFollowup: '2024-06-05'
        },
        {
          id: 2,
          studentName: '李小红',
          className: '二年级2班',
          followupDate: '2024-06-01',
          followupType: '微信随访',
          healthStatus: '好转',
          symptoms: '皮疹开始结痂，体温正常',
          suggestion: '继续隔离至全部结痂',
          nextFollowup: '2024-06-04'
        },
        {
          id: 3,
          studentName: '王小华',
          className: '一年级1班',
          followupDate: '2024-06-02',
          followupType: '电话随访',
          healthStatus: '痊愈',
          symptoms: '皮疹消退，口腔溃疡愈合',
          suggestion: '可申请复课审批',
          nextFollowup: '-'
        }
      ],
      isolationForm: {
        studentName: '',
        className: '',
        diseaseType: '',
        isolationReason: '',
        startDate: '',
        endDate: '',
        isolationDays: 7,
        notifyParent: false,
        remark: ''
      },
      isolationRules: {
        studentName: [{ required: true, message: '请选择学生', trigger: 'change' }],
        className: [{ required: true, message: '请选择班级', trigger: 'change' }],
        diseaseType: [{ required: true, message: '请选择疾病类型', trigger: 'change' }],
        isolationReason: [{ required: true, message: '请输入隔离原因', trigger: 'blur' }],
        startDate: [{ required: true, message: '请选择隔离开始日期', trigger: 'change' }],
        endDate: [{ required: true, message: '请选择隔离结束日期', trigger: 'change' }]
      },
      followupForm: {
        studentName: '',
        followupDate: '',
        followupType: '',
        healthStatus: '',
        symptoms: '',
        suggestion: '',
        nextFollowup: ''
      },
      followupRules: {
        followupDate: [{ required: true, message: '请选择随访日期', trigger: 'change' }],
        followupType: [{ required: true, message: '请选择随访方式', trigger: 'change' }],
        healthStatus: [{ required: true, message: '请选择健康状况', trigger: 'change' }],
        symptoms: [{ required: true, message: '请输入当前症状', trigger: 'blur' }],
        suggestion: [{ required: true, message: '请输入健康建议', trigger: 'blur' }]
      },
      returnApprovalForm: {
        studentName: '',
        diseaseType: '',
        isolationDays: 0,
        endDate: '',
        conditions: [],
        approvalResult: '',
        approvalOpinion: '',
        returnDate: ''
      },
      returnApprovalRules: {
        approvalResult: [{ required: true, message: '请选择审批结果', trigger: 'change' }],
        approvalOpinion: [{ required: true, message: '请输入审批意见', trigger: 'blur' }]
      }
    };
  },
  computed: {
    filteredIsolationList() {
      let list = this.isolationList;
      
      if (this.filterStatus) {
        list = list.filter(item => item.status === this.filterStatus);
      }
      
      if (this.filterDisease) {
        list = list.filter(item => item.diseaseType === this.filterDisease);
      }
      
      if (this.searchKeyword) {
        list = list.filter(item => item.studentName.includes(this.searchKeyword));
      }
      
      return list;
    }
  },
  methods: {
    getDiseaseTagType(type) {
      const map = {
        flu: 'warning',
        chickenpox: 'danger',
        handfoot: 'danger',
        norovirus: 'warning',
        other: 'info'
      };
      return map[type] || 'info';
    },
    getDiseaseText(type) {
      const map = {
        flu: '流感',
        chickenpox: '水痘',
        handfoot: '手足口病',
        norovirus: '诺如病毒',
        other: '其他'
      };
      return map[type] || '未知';
    },
    getStatusType(status) {
      const map = {
        active: 'warning',
        pending: 'info',
        completed: 'success',
        overdue: 'danger'
      };
      return map[status] || 'info';
    },
    getStatusText(status) {
      const map = {
        active: '正在隔离',
        pending: '待复课审批',
        completed: '已复课',
        overdue: '逾期未复课'
      };
      return map[status] || '未知';
    },
    getHealthTagType(status) {
      const map = {
        '好转': 'success',
        '稳定': 'info',
        '加重': 'danger',
        '痊愈': 'success'
      };
      return map[status] || 'info';
    },
    isOverdue(date) {
      const endDate = new Date(date);
      const today = new Date();
      return endDate < today;
    },
    showAddIsolationDialog() {
      this.isolationForm = {
        studentName: '',
        className: '',
        diseaseType: '',
        isolationReason: '',
        startDate: '',
        endDate: '',
        isolationDays: 7,
        notifyParent: false,
        remark: ''
      };
      this.addIsolationDialogVisible = true;
    },
    submitIsolation() {
      this.$refs.isolationForm.validate(valid => {
        if (valid) {
          this.$message.success('隔离记录添加成功');
          this.addIsolationDialogVisible = false;
        }
      });
    },
    viewIsolationDetail(row) {
      this.currentIsolation = row;
      this.detailDialogVisible = true;
    },
    showFollowUpDialog(row) {
      this.followupForm = {
        studentName: row.studentName,
        followupDate: new Date().toISOString().split('T')[0],
        followupType: '电话随访',
        healthStatus: '',
        symptoms: '',
        suggestion: '',
        nextFollowup: ''
      };
      this.currentIsolation = row;
      this.followupDialogVisible = true;
    },
    submitFollowup() {
      this.$refs.followupForm.validate(valid => {
        if (valid) {
          this.$message.success('随访记录添加成功');
          this.followupDialogVisible = false;
          this.detailDialogVisible = false;
        }
      });
    },
    showReturnApprovalDialog(row) {
      this.returnApprovalForm = {
        studentName: row.studentName,
        diseaseType: row.diseaseType,
        isolationDays: row.isolationDays,
        endDate: row.endDate,
        conditions: [],
        approvalResult: '',
        approvalOpinion: '',
        returnDate: ''
      };
      this.returnApprovalDialogVisible = true;
    },
    submitReturnApproval() {
      this.$refs.returnApprovalForm.validate(valid => {
        if (valid) {
          if (this.returnApprovalForm.conditions.length === 0) {
            this.$message.warning('请勾选复课条件');
            return;
          }
          this.$message.success('复课审批成功');
          this.returnApprovalDialogVisible = false;
        }
      });
    },
    exportIsolation() {
      this.$message.success('隔离记录导出成功');
    },
    showReasonDetail(reason) {
      this.$message.info(`查看${reason.name}详情`);
    },
    editFollowup(row) {
      this.$message.info(`编辑随访记录：${row.studentName}`);
    },
    handlePageChange(page) {
      this.currentPage = page;
    }
  }
};
</script>

<style scoped>
.isolation-manage {
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

.isolation-overview {
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

.overview-card.active .card-icon {
  background: #fff7e6;
  color: #fa8c16;
}

.overview-card.pending .card-icon {
  background: #e6f7ff;
  color: #1890ff;
}

.overview-card.completed .card-icon {
  background: #f6ffed;
  color: #52c41a;
}

.overview-card.warning .card-icon {
  background: #fff2f0;
  color: #ff4d4f;
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

.isolation-section,
.reason-section,
.followup-section {
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

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.overdue-date {
  color: #ff4d4f;
  font-weight: bold;
}

.reason-card {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
}

.reason-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.reason-title {
  font-size: 14px;
  font-weight: bold;
  color: #303133;
}

.reason-body {
  margin-bottom: 10px;
}

.reason-count {
  font-size: 24px;
  font-weight: bold;
  color: #1890ff;
}

.reason-days {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.followup-history {
  margin-top: 20px;
}

.followup-history h4 {
  margin: 0 0 15px 0;
  font-size: 14px;
  color: #303133;
}

.timeline-content {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.timeline-content .symptoms,
.timeline-content .suggestion {
  font-size: 12px;
  color: #606266;
}
</style>