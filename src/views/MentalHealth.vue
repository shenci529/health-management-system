<template>
  <div class="mental-health">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>心理情绪健康管理</h2>
      <div class="header-actions">
        <el-button type="primary" icon="el-icon-plus" @click="showAddRecordDialog">新增记录</el-button>
        <el-button type="success" icon="el-icon-download" @click="exportReport">导出报告</el-button>
      </div>
    </div>

    <!-- 隐私保护提示 -->
    <div class="privacy-alert">
      <el-alert
        title="隐私保护提示"
        type="warning"
        :closable="false"
        show-icon
      >
        <template slot="default">
          本模块涉及学生心理健康敏感信息，所有数据均已加密存储，仅授权教师可查看。请严格遵守隐私保护规定，不得泄露学生信息。
        </template>
      </el-alert>
    </div>

    <!-- 心理健康统计看板 -->
    <div class="stats-dashboard">
      <el-row :gutter="20">
        <el-col :span="4">
          <div class="stat-card total">
            <div class="stat-icon">
              <i class="el-icon-s-custom"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalRecords }}</div>
              <div class="stat-label">记录总数</div>
            </div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="stat-card normal">
            <div class="stat-icon">
              <i class="el-icon-circle-check"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.normalCount }}</div>
              <div class="stat-label">情绪正常</div>
            </div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="stat-card anxiety">
            <div class="stat-icon">
              <i class="el-icon-warning-outline"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.anxietyCount }}</div>
              <div class="stat-label">焦虑状态</div>
            </div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="stat-card depressed">
            <div class="stat-icon">
              <i class="el-icon-sad"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.depressedCount }}</div>
              <div class="stat-label">低落状态</div>
            </div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="stat-card conflict">
            <div class="stat-icon">
              <i class="el-icon-s-flag"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.conflictCount }}</div>
              <div class="stat-label">冲突事件</div>
            </div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="stat-card counseling">
            <div class="stat-icon">
              <i class="el-icon-chat-dot-round"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.counselingCount }}</div>
              <div class="stat-label">疏导次数</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 情绪分布图表 -->
    <div class="chart-section">
      <el-row :gutter="20">
        <el-col :span="8">
          <div class="chart-card">
            <div class="chart-title">情绪状态分布</div>
            <div class="emotion-chart">
              <div class="emotion-bar-item">
                <div class="bar-label">正常</div>
                <div class="bar-wrapper">
                  <div class="bar normal" :style="{ width: emotionPercent.normal + '%' }"></div>
                </div>
                <div class="bar-value">{{ emotionPercent.normal }}%</div>
              </div>
              <div class="emotion-bar-item">
                <div class="bar-label">焦虑</div>
                <div class="bar-wrapper">
                  <div class="bar anxiety" :style="{ width: emotionPercent.anxiety + '%' }"></div>
                </div>
                <div class="bar-value">{{ emotionPercent.anxiety }}%</div>
              </div>
              <div class="emotion-bar-item">
                <div class="bar-label">低落</div>
                <div class="bar-wrapper">
                  <div class="bar depressed" :style="{ width: emotionPercent.depressed + '%' }"></div>
                </div>
                <div class="bar-value">{{ emotionPercent.depressed }}%</div>
              </div>
              <div class="emotion-bar-item">
                <div class="bar-label">冲突</div>
                <div class="bar-wrapper">
                  <div class="bar conflict" :style="{ width: emotionPercent.conflict + '%' }"></div>
                </div>
                <div class="bar-value">{{ emotionPercent.conflict }}%</div>
              </div>
            </div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="chart-card">
            <div class="chart-title">本月情绪趋势</div>
            <div class="trend-chart">
              <div class="trend-line">
                <svg width="100%" height="150" preserveAspectRatio="none">
                  <polyline
                    points="0,120 20,100 40,80 60,90 80,70 100,85"
                    fill="none"
                    stroke="#52c41a"
                    stroke-width="2"
                  />
                  <polyline
                    points="0,130 20,125 40,120 60,115 80,110 100,105"
                    fill="none"
                    stroke="#faad14"
                    stroke-width="2"
                  />
                </svg>
              </div>
              <div class="trend-legend">
                <span class="legend-item"><span class="color normal"></span>正常情绪</span>
                <span class="legend-item"><span class="color warning"></span>异常情绪</span>
              </div>
            </div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="chart-card">
            <div class="chart-title">重点关注学生</div>
            <div class="focus-list">
              <div v-for="(student, index) in focusStudents" :key="index" class="focus-item">
                <div class="student-info">
                  <span class="student-name encrypted">{{ maskName(student.name) }}</span>
                  <span class="student-class">{{ student.className }}</span>
                </div>
                <el-tag :type="getEmotionTagType(student.emotion)" size="small">{{ student.emotion }}</el-tag>
                <el-button type="text" size="small" @click="viewFocusDetail(student)">详情</el-button>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 情绪状态记录表单 -->
    <div class="record-section">
      <div class="section-header">
        <h3>情绪状态记录</h3>
        <div class="filter-group">
          <el-select v-model="recordFilter.emotion" placeholder="情绪类型" clearable style="width: 120px;">
            <el-option label="正常" value="normal" />
            <el-option label="焦虑" value="anxiety" />
            <el-option label="低落" value="depressed" />
            <el-option label="冲突" value="conflict" />
          </el-select>
          <el-select v-model="recordFilter.class" placeholder="班级" clearable style="width: 120px;">
            <el-option label="一年级1班" value="1-1" />
            <el-option label="一年级2班" value="1-2" />
            <el-option label="二年级1班" value="2-1" />
          </el-select>
          <el-date-picker
            v-model="recordFilter.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd"
          />
        </div>
      </div>

      <el-table :data="filteredRecordList" border stripe style="width: 100%">
        <el-table-column prop="studentName" label="学生姓名" width="120">
          <template slot-scope="scope">
            <span class="encrypted-name">{{ maskName(scope.row.studentName) }}</span>
            <el-button type="text" size="mini" icon="el-icon-view" @click="revealName(scope.row)" v-if="!scope.row.revealed"></el-button>
          </template>
        </el-table-column>
        <el-table-column prop="className" label="班级" width="100" />
        <el-table-column prop="recordDate" label="记录日期" width="120" />
        <el-table-column prop="emotionType" label="情绪类型" width="100" align="center">
          <template slot-scope="scope">
            <el-tag :type="getEmotionTagType(scope.row.emotionType)" size="small">
              {{ getEmotionText(scope.row.emotionType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="emotionLevel" label="程度等级" width="100" align="center">
          <template slot-scope="scope">
            <el-tag :type="getLevelTagType(scope.row.emotionLevel)" size="small">
              {{ getLevelText(scope.row.emotionLevel) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="情况描述" min-width="180">
          <template slot-scope="scope">
            <span class="encrypted-content">{{ scope.row.revealed ? scope.row.description : maskContent(scope.row.description) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="trigger" label="触发因素" width="120">
          <template slot-scope="scope">
            <span class="encrypted-content">{{ scope.row.revealed ? scope.row.trigger : maskContent(scope.row.trigger) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="recorder" label="记录人" width="100" />
        <el-table-column prop="status" label="处理状态" width="100" align="center">
          <template slot-scope="scope">
            <el-tag :type="getStatusTagType(scope.row.status)" size="small">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="viewRecordDetail(scope.row)">详情</el-button>
            <el-button type="text" size="small" @click="startCounseling(scope.row)" v-if="scope.row.status !== 'completed'">
              疏导
            </el-button>
            <el-button type="text" size="small" @click="editRecord(scope.row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          background
          layout="total, prev, pager, next"
          :total="recordTotal"
          :page-size="pageSize"
          :current-page="currentPage"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <!-- 心理疏导记录列表 -->
    <div class="counseling-section">
      <div class="section-header">
        <h3>心理疏导记录</h3>
        <div class="filter-group">
          <el-input v-model="counselingSearch" placeholder="搜索学生" prefix-icon="el-icon-search" clearable style="width: 200px;" />
        </div>
      </div>

      <el-table :data="filteredCounselingList" border stripe style="width: 100%">
        <el-table-column prop="studentName" label="学生姓名" width="120">
          <template slot-scope="scope">
            <span class="encrypted-name">{{ maskName(scope.row.studentName) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="className" label="班级" width="100" />
        <el-table-column prop="counselingDate" label="疏导日期" width="120" />
        <el-table-column prop="counselingType" label="疏导类型" width="120">
          <template slot-scope="scope">
            <el-tag type="info" size="small">{{ scope.row.counselingType }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="counselor" label="疏导人员" width="100" />
        <el-table-column prop="duration" label="疏导时长" width="80" align="center" />
        <el-table-column prop="content" label="疏导内容" min-width="200">
          <template slot-scope="scope">
            <span class="encrypted-content">{{ maskContent(scope.row.content) }}</span>
            <el-button type="text" size="mini" icon="el-icon-view" @click="revealCounseling(scope.row)"></el-button>
          </template>
        </el-table-column>
        <el-table-column prop="effect" label="疏导效果" width="100" align="center">
          <template slot-scope="scope">
            <el-tag :type="getEffectTagType(scope.row.effect)" size="small">
              {{ getEffectText(scope.row.effect) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="followUp" label="后续跟进" width="100" align="center">
          <template slot-scope="scope">
            <el-tag :type="scope.row.followUp ? 'warning' : 'success'" size="small">
              {{ scope.row.followUp ? '需要' : '无需' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="viewCounselingDetail(scope.row)">详情</el-button>
            <el-button type="text" size="small" @click="addFollowUp(scope.row)" v-if="scope.row.followUp">
              跟进
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 新增记录弹窗 -->
    <el-dialog title="情绪状态记录" :visible.sync="recordDialogVisible" width="600px">
      <el-form :model="recordForm" label-width="100px">
        <el-form-item label="学生">
          <el-select v-model="recordForm.studentId" placeholder="选择学生" filterable>
            <el-option label="张小明 (2024001)" value="1" />
            <el-option label="李小红 (2024002)" value="2" />
            <el-option label="王小华 (2024003)" value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="记录日期">
          <el-date-picker v-model="recordForm.recordDate" type="date" placeholder="选择日期" value-format="yyyy-MM-dd" />
        </el-form-item>
        <el-form-item label="情绪类型">
          <el-select v-model="recordForm.emotionType" placeholder="选择情绪类型">
            <el-option label="正常" value="normal" />
            <el-option label="焦虑" value="anxiety" />
            <el-option label="低落" value="depressed" />
            <el-option label="冲突" value="conflict" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="程度等级">
          <el-select v-model="recordForm.emotionLevel" placeholder="选择程度等级">
            <el-option label="轻微" value="mild" />
            <el-option label="中度" value="moderate" />
            <el-option label="严重" value="severe" />
          </el-select>
        </el-form-item>
        <el-form-item label="情况描述">
          <el-input v-model="recordForm.description" type="textarea" :rows="3" placeholder="请详细描述学生情绪表现" />
        </el-form-item>
        <el-form-item label="触发因素">
          <el-input v-model="recordForm.trigger" placeholder="如：学业压力、家庭因素、同伴关系等" />
        </el-form-item>
        <el-form-item label="初步建议">
          <el-input v-model="recordForm.suggestion" type="textarea" :rows="2" placeholder="请输入初步干预建议" />
        </el-form-item>
        <el-form-item label="是否需要疏导">
          <el-radio-group v-model="recordForm.needCounseling">
            <el-radio :label="true">需要</el-radio>
            <el-radio :label="false">不需要</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="recordDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitRecord">保存</el-button>
      </span>
    </el-dialog>

    <!-- 心理疏导弹窗 -->
    <el-dialog title="心理疏导记录" :visible.sync="counselingDialogVisible" width="600px">
      <el-form :model="counselingForm" label-width="100px">
        <el-form-item label="学生">
          <el-input :value="maskName(counselingForm.studentName)" disabled />
        </el-form-item>
        <el-form-item label="疏导日期">
          <el-date-picker v-model="counselingForm.counselingDate" type="date" placeholder="选择日期" value-format="yyyy-MM-dd" />
        </el-form-item>
        <el-form-item label="疏导类型">
          <el-select v-model="counselingForm.counselingType" placeholder="选择疏导类型">
            <el-option label="个别谈话" value="个别谈话" />
            <el-option label="心理辅导" value="心理辅导" />
            <el-option label="团体活动" value="团体活动" />
            <el-option label="家校沟通" value="家校沟通" />
          </el-select>
        </el-form-item>
        <el-form-item label="疏导人员">
          <el-input v-model="counselingForm.counselor" placeholder="请输入疏导人员姓名" />
        </el-form-item>
        <el-form-item label="疏导时长">
          <el-input-number v-model="counselingForm.duration" :min="5" :max="120" />
          <span style="margin-left: 10px; color: #909399;">分钟</span>
        </el-form-item>
        <el-form-item label="疏导内容">
          <el-input v-model="counselingForm.content" type="textarea" :rows="4" placeholder="请详细记录疏导过程和内容" />
        </el-form-item>
        <el-form-item label="疏导效果">
          <el-select v-model="counselingForm.effect" placeholder="选择疏导效果">
            <el-option label="显著改善" value="significant" />
            <el-option label="有所改善" value="improved" />
            <el-option label="无明显变化" value="unchanged" />
            <el-option label="需要持续关注" value="ongoing" />
          </el-select>
        </el-form-item>
        <el-form-item label="后续跟进">
          <el-radio-group v-model="counselingForm.followUp">
            <el-radio :label="true">需要跟进</el-radio>
            <el-radio :label="false">无需跟进</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="跟进计划" v-if="counselingForm.followUp">
          <el-input v-model="counselingForm.followUpPlan" type="textarea" :rows="2" placeholder="请输入后续跟进计划" />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="counselingDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitCounseling">保存</el-button>
      </span>
    </el-dialog>

    <!-- 详情查看弹窗（需验证权限） -->
    <el-dialog title="详细信息" :visible.sync="detailDialogVisible" width="700px">
      <el-alert
        title="敏感信息提示"
        type="warning"
        :closable="false"
        show-icon
        style="margin-bottom: 20px;"
      >
        您正在查看学生心理健康敏感信息，请确保在安全环境下操作。
      </el-alert>
      <el-descriptions :column="2" border v-if="currentDetail">
        <el-descriptions-item label="学生姓名">{{ currentDetail.studentName }}</el-descriptions-item>
        <el-descriptions-item label="班级">{{ currentDetail.className }}</el-descriptions-item>
        <el-descriptions-item label="记录日期">{{ currentDetail.recordDate }}</el-descriptions-item>
        <el-descriptions-item label="情绪类型">
          <el-tag :type="getEmotionTagType(currentDetail.emotionType)" size="small">
            {{ getEmotionText(currentDetail.emotionType) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="程度等级">
          <el-tag :type="getLevelTagType(currentDetail.emotionLevel)" size="small">
            {{ getLevelText(currentDetail.emotionLevel) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="触发因素">{{ currentDetail.trigger }}</el-descriptions-item>
        <el-descriptions-item label="情况描述" :span="2">{{ currentDetail.description }}</el-descriptions-item>
        <el-descriptions-item label="处理建议" :span="2">{{ currentDetail.suggestion }}</el-descriptions-item>
        <el-descriptions-item label="疏导记录" :span="2">
          <div v-if="currentDetail.counselingRecords && currentDetail.counselingRecords.length > 0">
            <div v-for="(record, index) in currentDetail.counselingRecords" :key="index" class="counseling-record-item">
              <span>{{ record.date }} - {{ record.type }} - {{ record.counselor }}</span>
            </div>
          </div>
          <span v-else>暂无疏导记录</span>
        </el-descriptions-item>
      </el-descriptions>
      <span slot="footer">
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="startCounselingFromDetail" v-if="currentDetail && currentDetail.status !== 'completed'">
          开始疏导
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'MentalHealth',
  data() {
    return {
      currentPage: 1,
      pageSize: 10,
      recordTotal: 0,
      counselingSearch: '',
      recordDialogVisible: false,
      counselingDialogVisible: false,
      detailDialogVisible: false,
      currentDetail: null,
      stats: {
        totalRecords: 156,
        normalCount: 120,
        anxietyCount: 18,
        depressedCount: 12,
        conflictCount: 6,
        counselingCount: 35
      },
      emotionPercent: {
        normal: 77,
        anxiety: 12,
        depressed: 8,
        conflict: 3
      },
      focusStudents: [
        { id: 1, name: '张小明', className: '一年级1班', emotion: '焦虑' },
        { id: 2, name: '李小红', className: '一年级2班', emotion: '低落' },
        { id: 3, name: '王小华', className: '二年级1班', emotion: '冲突' },
        { id: 4, name: '赵小刚', className: '二年级2班', emotion: '焦虑' }
      ],
      recordFilter: {
        emotion: '',
        class: '',
        dateRange: []
      },
      recordList: [
        { id: 1, studentName: '张小明', className: '一年级1班', recordDate: '2024-06-01', emotionType: 'anxiety', emotionLevel: 'moderate', description: '近期考试压力大，表现出明显的焦虑情绪，上课注意力不集中', trigger: '学业压力', recorder: '王老师', status: 'processing', revealed: false, suggestion: '建议进行心理疏导，减轻学业压力' },
        { id: 2, studentName: '李小红', className: '一年级2班', recordDate: '2024-06-01', emotionType: 'depressed', emotionLevel: 'mild', description: '近期情绪低落，与同学交流减少，独处时间增多', trigger: '家庭因素', recorder: '李老师', status: 'pending', revealed: false, suggestion: '建议家校沟通，了解家庭情况' },
        { id: 3, studentName: '王小华', className: '二年级1班', recordDate: '2024-06-01', emotionType: 'conflict', emotionLevel: 'severe', description: '与同学发生激烈冲突，情绪激动，有攻击性行为', trigger: '同伴关系', recorder: '张老师', status: 'processing', revealed: false, suggestion: '需要紧急干预，进行心理疏导' },
        { id: 4, studentName: '赵小刚', className: '二年级2班', recordDate: '2024-05-28', emotionType: 'anxiety', emotionLevel: 'mild', description: '对新环境适应困难，表现出轻微焦虑', trigger: '环境变化', recorder: '刘老师', status: 'completed', revealed: false, suggestion: '已完成疏导，情绪稳定' },
        { id: 5, studentName: '刘小芳', className: '三年级1班', recordDate: '2024-05-25', emotionType: 'normal', emotionLevel: 'mild', description: '情绪状态正常，日常观察记录', trigger: '-', recorder: '陈老师', status: 'completed', revealed: true, suggestion: '-' }
      ],
      counselingList: [
        { id: 1, studentName: '张小明', className: '一年级1班', counselingDate: '2024-06-02', counselingType: '个别谈话', counselor: '心理老师', duration: 30, content: '针对学业压力进行疏导，帮助学生建立合理的学习目标和时间管理方法', effect: 'improved', followUp: true },
        { id: 2, studentName: '王小华', className: '二年级1班', counselingDate: '2024-06-02', counselingType: '心理辅导', counselor: '心理老师', duration: 45, content: '针对同伴冲突进行疏导，引导学生正确处理人际关系', effect: 'ongoing', followUp: true },
        { id: 3, studentName: '李小红', className: '一年级2班', counselingDate: '2024-05-30', counselingType: '家校沟通', counselor: '班主任', duration: 60, content: '与家长沟通学生情绪低落情况，了解家庭因素', effect: 'improved', followUp: false },
        { id: 4, studentName: '赵小刚', className: '二年级2班', counselingDate: '2024-05-29', counselingType: '个别谈话', counselor: '班主任', duration: 20, content: '帮助学生适应新环境，建立信心', effect: 'significant', followUp: false }
      ],
      recordForm: {
        studentId: '',
        recordDate: '',
        emotionType: '',
        emotionLevel: '',
        description: '',
        trigger: '',
        suggestion: '',
        needCounseling: false
      },
      counselingForm: {
        studentName: '',
        counselingDate: '',
        counselingType: '',
        counselor: '',
        duration: 30,
        content: '',
        effect: '',
        followUp: false,
        followUpPlan: ''
      }
    };
  },
  computed: {
    filteredRecordList() {
      let list = this.recordList;
      
      if (this.recordFilter.emotion) {
        list = list.filter(item => item.emotionType === this.recordFilter.emotion);
      }
      
      if (this.recordFilter.class) {
        list = list.filter(item => item.className.includes(this.recordFilter.class));
      }
      
      this.recordTotal = list.length;
      return list;
    },
    filteredCounselingList() {
      let list = this.counselingList;
      
      if (this.counselingSearch) {
        list = list.filter(item => 
          this.maskName(item.studentName).includes(this.counselingSearch) ||
          item.className.includes(this.counselingSearch)
        );
      }
      
      return list;
    }
  },
  methods: {
    maskName(name) {
      if (!name) return '';
      return name.charAt(0) + '**';
    },
    maskContent(content) {
      if (!content) return '';
      if (content.length <= 10) return '******';
      return content.substring(0, 10) + '******';
    },
    revealName(row) {
      this.$confirm('此操作将显示学生真实姓名，是否继续？', '隐私保护提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        row.revealed = true;
      }).catch(() => {});
    },
    revealCounseling(row) {
      this.$confirm('此操作将显示完整疏导内容，是否继续？', '隐私保护提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$message.info('内容已显示');
      }).catch(() => {});
    },
    getEmotionTagType(emotion) {
      const map = {
        normal: 'success',
        anxiety: 'warning',
        depressed: 'info',
        conflict: 'danger'
      };
      return map[emotion] || 'info';
    },
    getEmotionText(emotion) {
      const map = {
        normal: '正常',
        anxiety: '焦虑',
        depressed: '低落',
        conflict: '冲突',
        other: '其他'
      };
      return map[emotion] || '未知';
    },
    getLevelTagType(level) {
      const map = {
        mild: 'success',
        moderate: 'warning',
        severe: 'danger'
      };
      return map[level] || 'info';
    },
    getLevelText(level) {
      const map = {
        mild: '轻微',
        moderate: '中度',
        severe: '严重'
      };
      return map[level] || '未知';
    },
    getStatusTagType(status) {
      const map = {
        pending: 'info',
        processing: 'warning',
        completed: 'success'
      };
      return map[status] || 'info';
    },
    getStatusText(status) {
      const map = {
        pending: '待处理',
        processing: '处理中',
        completed: '已完成'
      };
      return map[status] || '未知';
    },
    getEffectTagType(effect) {
      const map = {
        significant: 'success',
        improved: 'primary',
        unchanged: 'info',
        ongoing: 'warning'
      };
      return map[effect] || 'info';
    },
    getEffectText(effect) {
      const map = {
        significant: '显著改善',
        improved: '有所改善',
        unchanged: '无明显变化',
        ongoing: '持续关注'
      };
      return map[effect] || '未知';
    },
    showAddRecordDialog() {
      this.recordForm = {
        studentId: '',
        recordDate: '',
        emotionType: '',
        emotionLevel: '',
        description: '',
        trigger: '',
        suggestion: '',
        needCounseling: false
      };
      this.recordDialogVisible = true;
    },
    submitRecord() {
      if (!this.recordForm.studentId || !this.recordForm.recordDate || !this.recordForm.emotionType) {
        this.$message.warning('请填写完整信息');
        return;
      }
      this.$message.success('情绪记录保存成功');
      this.recordDialogVisible = false;
    },
    viewRecordDetail(row) {
      this.$confirm('此操作将显示学生心理健康敏感信息，是否继续？', '隐私保护提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.currentDetail = {
          ...row,
          counselingRecords: [
            { date: '2024-06-02', type: '个别谈话', counselor: '心理老师' }
          ]
        };
        this.detailDialogVisible = true;
      }).catch(() => {});
    },
    editRecord(row) {
      this.$message.info('编辑功能开发中');
    },
    startCounseling(row) {
      this.counselingForm = {
        studentName: row.studentName,
        counselingDate: '',
        counselingType: '',
        counselor: '',
        duration: 30,
        content: '',
        effect: '',
        followUp: false,
        followUpPlan: ''
      };
      this.counselingDialogVisible = true;
    },
    startCounselingFromDetail() {
      if (this.currentDetail) {
        this.startCounseling(this.currentDetail);
        this.detailDialogVisible = false;
      }
    },
    submitCounseling() {
      if (!this.counselingForm.counselingDate || !this.counselingForm.counselingType || !this.counselingForm.content) {
        this.$message.warning('请填写完整信息');
        return;
      }
      this.$message.success('疏导记录保存成功');
      this.counselingDialogVisible = false;
    },
    viewCounselingDetail(row) {
      this.$message.info(`查看疏导详情：${this.maskName(row.studentName)}`);
    },
    addFollowUp(row) {
      this.$message.info('跟进功能开发中');
    },
    viewFocusDetail(student) {
      this.$message.info(`查看重点关注学生详情`);
    },
    exportReport() {
      this.$message.success('心理健康报告导出成功');
    },
    handlePageChange(page) {
      this.currentPage = page;
    }
  }
};
</script>

<style scoped>
.mental-health {
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

.privacy-alert {
  margin-bottom: 20px;
}

.stats-dashboard {
  margin-bottom: 20px;
}

.stat-card {
  background: #fff;
  border-radius: 8px;
  padding: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.stat-card .stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.stat-card.total .stat-icon {
  background: #e6f7ff;
  color: #1890ff;
}

.stat-card.normal .stat-icon {
  background: #f6ffed;
  color: #52c41a;
}

.stat-card.anxiety .stat-icon {
  background: #fffbe6;
  color: #faad14;
}

.stat-card.depressed .stat-icon {
  background: #f9f0ff;
  color: #722ed1;
}

.stat-card.conflict .stat-icon {
  background: #fff2f0;
  color: #ff4d4f;
}

.stat-card.counseling .stat-icon {
  background: #e6fffb;
  color: #13c2c2;
}

.stat-card .stat-info .stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.stat-card .stat-info .stat-label {
  font-size: 12px;
  color: #909399;
  margin-top: 3px;
}

.chart-section {
  margin-bottom: 20px;
}

.chart-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.chart-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 15px;
  text-align: center;
}

.emotion-chart {
  padding: 10px 0;
}

.emotion-bar-item {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.bar-label {
  width: 50px;
  font-size: 12px;
  color: #606266;
}

.bar-wrapper {
  flex: 1;
  height: 20px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.bar {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.bar.normal {
  background: #52c41a;
}

.bar.anxiety {
  background: #faad14;
}

.bar.depressed {
  background: #722ed1;
}

.bar.conflict {
  background: #ff4d4f;
}

.bar-value {
  width: 50px;
  font-size: 12px;
  color: #606266;
  text-align: right;
}

.trend-chart {
  height: 150px;
  position: relative;
}

.trend-line {
  height: 100%;
}

.trend-legend {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 10px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: #606266;
}

.legend-item .color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.legend-item .color.normal {
  background: #52c41a;
}

.legend-item .color.warning {
  background: #faad14;
}

.focus-list {
  padding: 10px 0;
}

.focus-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #f0f0f0;
}

.focus-item:last-child {
  border-bottom: none;
}

.student-info {
  flex: 1;
}

.student-name {
  font-size: 14px;
  color: #303133;
}

.student-name.encrypted {
  color: #909399;
}

.student-class {
  font-size: 12px;
  color: #909399;
  margin-left: 10px;
}

.record-section,
.counseling-section {
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

.encrypted-name {
  color: #909399;
}

.encrypted-content {
  color: #909399;
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.counseling-record-item {
  padding: 5px 0;
  font-size: 13px;
  color: #606266;
}
</style>