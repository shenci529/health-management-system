<template>
  <div class="vision-posture">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>视力体态管理</h2>
      <div class="header-actions">
        <el-button type="primary" icon="el-icon-plus" @click="showAddScreeningDialog">新增筛查</el-button>
        <el-button type="success" icon="el-icon-download" @click="exportReport">导出报告</el-button>
      </div>
    </div>

    <!-- 统计概览 -->
    <div class="stats-overview">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="stat-card vision-normal">
            <div class="stat-icon">
              <i class="el-icon-view"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ visionStats.normal }}</div>
              <div class="stat-label">视力正常</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card vision-abnormal">
            <div class="stat-icon">
              <i class="el-icon-warning"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ visionStats.abnormal }}</div>
              <div class="stat-label">视力异常</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card posture-normal">
            <div class="stat-icon">
              <i class="el-icon-user"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ postureStats.normal }}</div>
              <div class="stat-label">体态正常</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card posture-abnormal">
            <div class="stat-icon">
              <i class="el-icon-s-claim"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ postureStats.abnormal }}</div>
              <div class="stat-label">体态异常</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 筛查数据录入区域 -->
    <div class="screening-section">
      <el-tabs v-model="activeTab" type="card">
        <el-tab-pane label="视力筛查数据" name="vision">
          <div class="section-header">
            <div class="filter-group">
              <el-select v-model="visionFilter.class" placeholder="选择班级" clearable style="width: 150px;">
                <el-option label="一年级1班" value="1-1" />
                <el-option label="一年级2班" value="1-2" />
                <el-option label="二年级1班" value="2-1" />
                <el-option label="二年级2班" value="2-2" />
              </el-select>
              <el-select v-model="visionFilter.status" placeholder="视力状态" clearable style="width: 120px;">
                <el-option label="正常" value="normal" />
                <el-option label="近视" value="myopia" />
                <el-option label="远视" value="hyperopia" />
                <el-option label="散光" value="astigmatism" />
              </el-select>
              <el-input v-model="visionFilter.search" placeholder="搜索学生" prefix-icon="el-icon-search" clearable style="width: 200px;" />
            </div>
            <el-button type="primary" size="small" icon="el-icon-plus" @click="showBatchVisionDialog">批量录入</el-button>
          </div>

          <el-table :data="filteredVisionList" border stripe style="width: 100%">
            <el-table-column prop="studentName" label="学生姓名" width="100" />
            <el-table-column prop="studentNo" label="学号" width="100" />
            <el-table-column prop="className" label="班级" width="100" />
            <el-table-column prop="screeningDate" label="筛查日期" width="120" />
            <el-table-column prop="leftEye" label="左眼视力" width="80" align="center">
              <template slot-scope="scope">
                <span :class="{ 'vision-warning': scope.row.leftEye < 5.0 }">{{ scope.row.leftEye }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="rightEye" label="右眼视力" width="80" align="center">
              <template slot-scope="scope">
                <span :class="{ 'vision-warning': scope.row.rightEye < 5.0 }">{{ scope.row.rightEye }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="visionStatus" label="视力状态" width="100" align="center">
              <template slot-scope="scope">
                <el-tag :type="getVisionStatusType(scope.row.visionStatus)" size="small">
                  {{ getVisionStatusText(scope.row.visionStatus) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="correctionMethod" label="矫正方式" width="100" />
            <el-table-column prop="lastChange" label="上次变化" width="100" align="center">
              <template slot-scope="scope">
                <span :class="{ 'change-worse': scope.row.lastChange < 0, 'change-better': scope.row.lastChange > 0 }">
                  {{ scope.row.lastChange > 0 ? '+' + scope.row.lastChange : scope.row.lastChange }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="remark" label="备注" min-width="120" />
            <el-table-column label="操作" width="150" fixed="right">
              <template slot-scope="scope">
                <el-button type="text" size="small" @click="editVision(scope.row)">编辑</el-button>
                <el-button type="text" size="small" @click="viewVisionHistory(scope.row)">历史</el-button>
              </template>
            </el-table-column>
          </el-table>

          <div class="pagination-wrapper">
            <el-pagination
              background
              layout="total, prev, pager, next"
              :total="visionTotal"
              :page-size="pageSize"
              :current-page="currentPage"
              @current-change="handlePageChange"
            />
          </div>
        </el-tab-pane>

        <el-tab-pane label="脊柱侧弯筛查数据" name="posture">
          <div class="section-header">
            <div class="filter-group">
              <el-select v-model="postureFilter.class" placeholder="选择班级" clearable style="width: 150px;">
                <el-option label="一年级1班" value="1-1" />
                <el-option label="一年级2班" value="1-2" />
                <el-option label="二年级1班" value="2-1" />
                <el-option label="二年级2班" value="2-2" />
              </el-select>
              <el-select v-model="postureFilter.status" placeholder="筛查结果" clearable style="width: 120px;">
                <el-option label="正常" value="normal" />
                <el-option label="疑似侧弯" value="suspected" />
                <el-option label="确诊侧弯" value="confirmed" />
              </el-select>
              <el-input v-model="postureFilter.search" placeholder="搜索学生" prefix-icon="el-icon-search" clearable style="width: 200px;" />
            </div>
            <el-button type="primary" size="small" icon="el-icon-plus" @click="showBatchPostureDialog">批量录入</el-button>
          </div>

          <el-table :data="filteredPostureList" border stripe style="width: 100%">
            <el-table-column prop="studentName" label="学生姓名" width="100" />
            <el-table-column prop="studentNo" label="学号" width="100" />
            <el-table-column prop="className" label="班级" width="100" />
            <el-table-column prop="screeningDate" label="筛查日期" width="120" />
            <el-table-column prop="adamTest" label="Adam测试" width="100" align="center">
              <template slot-scope="scope">
                <el-tag :type="scope.row.adamTest === 'negative' ? 'success' : 'danger'" size="small">
                  {{ scope.row.adamTest === 'negative' ? '阴性' : '阳性' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="scoliometer" label="脊柱测量仪角度" width="120" align="center">
              <template slot-scope="scope">
                <span :class="{ 'angle-warning': scope.row.scoliometer >= 5 }">{{ scope.row.scoliometer }}度</span>
              </template>
            </el-table-column>
            <el-table-column prop="postureStatus" label="筛查结果" width="100" align="center">
              <template slot-scope="scope">
                <el-tag :type="getPostureStatusType(scope.row.postureStatus)" size="small">
                  {{ getPostureStatusText(scope.row.postureStatus) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="severity" label="程度分级" width="100" align="center">
              <template slot-scope="scope">
                <el-tag v-if="scope.row.severity" :type="getSeverityType(scope.row.severity)" size="small">
                  {{ getSeverityText(scope.row.severity) }}
                </el-tag>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column prop="recommendation" label="建议" min-width="150" />
            <el-table-column prop="remark" label="备注" min-width="100" />
            <el-table-column label="操作" width="150" fixed="right">
              <template slot-scope="scope">
                <el-button type="text" size="small" @click="editPosture(scope.row)">编辑</el-button>
                <el-button type="text" size="small" @click="viewPostureHistory(scope.row)">历史</el-button>
              </template>
            </el-table-column>
          </el-table>

          <div class="pagination-wrapper">
            <el-pagination
              background
              layout="total, prev, pager, next"
              :total="postureTotal"
              :page-size="pageSize"
              :current-page="currentPage"
              @current-change="handlePageChange"
            />
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 长期跟踪变化曲线图 -->
    <div class="tracking-chart-section">
      <div class="section-header">
        <h3>长期跟踪变化曲线</h3>
        <div class="filter-group">
          <el-select v-model="chartStudent" placeholder="选择学生" style="width: 200px;">
            <el-option label="张小明" value="1" />
            <el-option label="李小红" value="2" />
            <el-option label="王小华" value="3" />
          </el-select>
          <el-select v-model="chartType" placeholder="图表类型" style="width: 150px;">
            <el-option label="视力变化" value="vision" />
            <el-option label="脊柱角度变化" value="posture" />
          </el-select>
        </div>
      </div>

      <div class="chart-container">
        <div class="css-line-chart">
          <div class="chart-y-axis">
            <span v-for="(val, i) in yAxisLabels" :key="i">{{ val }}</span>
          </div>
          <div class="chart-area">
            <div class="chart-grid">
              <div v-for="i in 5" :key="i" class="grid-line"></div>
            </div>
            <div class="chart-line">
              <svg width="100%" height="200" preserveAspectRatio="none">
                <polyline
                  :points="chartPoints"
                  fill="none"
                  stroke="#1890ff"
                  stroke-width="2"
                />
              </svg>
            </div>
            <div class="chart-points">
              <div v-for="(point, index) in chartDataPoints" :key="index" class="point" :style="{ left: point.x + '%', top: point.y + '%' }">
                <span class="point-value">{{ point.value }}</span>
              </div>
            </div>
          </div>
          <div class="chart-x-axis">
            <span v-for="(label, i) in xAxisLabels" :key="i">{{ label }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 异常预警推送列表 -->
    <div class="warning-section">
      <div class="section-header">
        <h3>异常预警推送</h3>
        <el-badge :value="warningCount" type="danger">
          <el-button size="small" @click="markAllWarningsRead">全部标记已读</el-button>
        </el-badge>
      </div>

      <el-table :data="warningList" border stripe style="width: 100%">
        <el-table-column prop="studentName" label="学生姓名" width="100" />
        <el-table-column prop="className" label="班级" width="100" />
        <el-table-column prop="warningType" label="预警类型" width="120">
          <template slot-scope="scope">
            <el-tag :type="scope.row.warningType === 'vision' ? 'warning' : 'danger'" size="small">
              {{ scope.row.warningType === 'vision' ? '视力下降' : '体态异常' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="warningContent" label="预警内容" min-width="200" />
        <el-table-column prop="changeValue" label="变化幅度" width="100" align="center">
          <template slot-scope="scope">
            <span class="change-worse">{{ scope.row.changeValue }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="推送时间" width="160" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status === 'unread' ? 'danger' : 'success'" size="small">
              {{ scope.row.status === 'unread' ? '未读' : '已读' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="viewWarningDetail(scope.row)">详情</el-button>
            <el-button type="text" size="small" @click="notifyParent(scope.row)">通知家长</el-button>
            <el-button type="text" size="small" @click="markWarningRead(scope.row)" v-if="scope.row.status === 'unread'">
              标记已读
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 视力录入弹窗 -->
    <el-dialog title="视力筛查数据录入" :visible.sync="visionDialogVisible" width="500px">
      <el-form :model="visionForm" label-width="100px">
        <el-form-item label="学生">
          <el-select v-model="visionForm.studentId" placeholder="选择学生" filterable>
            <el-option label="张小明 (2024001)" value="1" />
            <el-option label="李小红 (2024002)" value="2" />
            <el-option label="王小华 (2024003)" value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="筛查日期">
          <el-date-picker v-model="visionForm.screeningDate" type="date" placeholder="选择日期" value-format="yyyy-MM-dd" />
        </el-form-item>
        <el-form-item label="左眼视力">
          <el-input-number v-model="visionForm.leftEye" :min="3.0" :max="5.5" :step="0.1" :precision="1" />
        </el-form-item>
        <el-form-item label="右眼视力">
          <el-input-number v-model="visionForm.rightEye" :min="3.0" :max="5.5" :step="0.1" :precision="1" />
        </el-form-item>
        <el-form-item label="视力状态">
          <el-select v-model="visionForm.visionStatus" placeholder="选择视力状态">
            <el-option label="正常" value="normal" />
            <el-option label="近视" value="myopia" />
            <el-option label="远视" value="hyperopia" />
            <el-option label="散光" value="astigmatism" />
          </el-select>
        </el-form-item>
        <el-form-item label="矫正方式">
          <el-input v-model="visionForm.correctionMethod" placeholder="如：佩戴眼镜、角膜塑形镜等" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="visionForm.remark" type="textarea" :rows="2" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="visionDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitVision">保存</el-button>
      </span>
    </el-dialog>

    <!-- 体态录入弹窗 -->
    <el-dialog title="脊柱侧弯筛查数据录入" :visible.sync="postureDialogVisible" width="500px">
      <el-form :model="postureForm" label-width="120px">
        <el-form-item label="学生">
          <el-select v-model="postureForm.studentId" placeholder="选择学生" filterable>
            <el-option label="张小明 (2024001)" value="1" />
            <el-option label="李小红 (2024002)" value="2" />
            <el-option label="王小华 (2024003)" value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="筛查日期">
          <el-date-picker v-model="postureForm.screeningDate" type="date" placeholder="选择日期" value-format="yyyy-MM-dd" />
        </el-form-item>
        <el-form-item label="Adam测试结果">
          <el-radio-group v-model="postureForm.adamTest">
            <el-radio label="negative">阴性（正常）</el-radio>
            <el-radio label="positive">阳性（异常）</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="脊柱测量仪角度">
          <el-input-number v-model="postureForm.scoliometer" :min="0" :max="30" :precision="1" />
          <span style="margin-left: 10px; color: #909399;">度</span>
        </el-form-item>
        <el-form-item label="筛查结果">
          <el-select v-model="postureForm.postureStatus" placeholder="选择筛查结果">
            <el-option label="正常" value="normal" />
            <el-option label="疑似侧弯" value="suspected" />
            <el-option label="确诊侧弯" value="confirmed" />
          </el-select>
        </el-form-item>
        <el-form-item label="程度分级" v-if="postureForm.postureStatus !== 'normal'">
          <el-select v-model="postureForm.severity" placeholder="选择程度分级">
            <el-option label="轻度" value="mild" />
            <el-option label="中度" value="moderate" />
            <el-option label="重度" value="severe" />
          </el-select>
        </el-form-item>
        <el-form-item label="建议">
          <el-input v-model="postureForm.recommendation" type="textarea" :rows="2" placeholder="请输入建议" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="postureForm.remark" type="textarea" :rows="2" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="postureDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitPosture">保存</el-button>
      </span>
    </el-dialog>

    <!-- 历史记录弹窗 -->
    <el-dialog title="筛查历史记录" :visible.sync="historyDialogVisible" width="700px">
      <el-table :data="historyList" border stripe style="width: 100%">
        <el-table-column prop="screeningDate" label="筛查日期" width="120" />
        <el-table-column prop="leftEye" label="左眼视力" width="80" v-if="historyType === 'vision'" />
        <el-table-column prop="rightEye" label="右眼视力" width="80" v-if="historyType === 'vision'" />
        <el-table-column prop="visionStatus" label="视力状态" width="100" v-if="historyType === 'vision'" />
        <el-table-column prop="scoliometer" label="脊柱角度" width="100" v-if="historyType === 'posture'" />
        <el-table-column prop="postureStatus" label="筛查结果" width="100" v-if="historyType === 'posture'" />
        <el-table-column prop="change" label="变化" width="80">
          <template slot-scope="scope">
            <span :class="{ 'change-worse': scope.row.change < 0, 'change-better': scope.row.change > 0 }">
              {{ scope.row.change > 0 ? '+' + scope.row.change : scope.row.change || '-' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="150" />
      </el-table>
      <span slot="footer">
        <el-button @click="historyDialogVisible = false">关闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'VisionPosture',
  data() {
    return {
      activeTab: 'vision',
      currentPage: 1,
      pageSize: 10,
      visionTotal: 0,
      postureTotal: 0,
      warningCount: 5,
      visionDialogVisible: false,
      postureDialogVisible: false,
      historyDialogVisible: false,
      historyType: 'vision',
      chartStudent: '1',
      chartType: 'vision',
      visionStats: {
        normal: 120,
        abnormal: 35
      },
      postureStats: {
        normal: 145,
        abnormal: 10
      },
      visionFilter: {
        class: '',
        status: '',
        search: ''
      },
      postureFilter: {
        class: '',
        status: '',
        search: ''
      },
      visionList: [
        { id: 1, studentName: '张小明', studentNo: '2024001', className: '一年级1班', screeningDate: '2024-06-01', leftEye: 4.8, rightEye: 4.9, visionStatus: 'myopia', correctionMethod: '佩戴眼镜', lastChange: -0.2, remark: '近视度数加深' },
        { id: 2, studentName: '李小红', studentNo: '2024002', className: '一年级1班', screeningDate: '2024-06-01', leftEye: 5.0, rightEye: 5.1, visionStatus: 'normal', correctionMethod: '-', lastChange: 0, remark: '' },
        { id: 3, studentName: '王小华', studentNo: '2024003', className: '一年级2班', screeningDate: '2024-06-01', leftEye: 4.5, rightEye: 4.6, visionStatus: 'myopia', correctionMethod: '角膜塑形镜', lastChange: -0.3, remark: '需定期复查' },
        { id: 4, studentName: '赵小刚', studentNo: '2024004', className: '二年级1班', screeningDate: '2024-06-01', leftEye: 5.2, rightEye: 5.2, visionStatus: 'normal', correctionMethod: '-', lastChange: 0.1, remark: '' },
        { id: 5, studentName: '刘小芳', studentNo: '2024005', className: '二年级2班', screeningDate: '2024-06-01', leftEye: 4.7, rightEye: 4.7, visionStatus: 'astigmatism', correctionMethod: '佩戴眼镜', lastChange: -0.1, remark: '散光' }
      ],
      postureList: [
        { id: 1, studentName: '张小明', studentNo: '2024001', className: '一年级1班', screeningDate: '2024-06-01', adamTest: 'negative', scoliometer: 2, postureStatus: 'normal', severity: null, recommendation: '-', remark: '' },
        { id: 2, studentName: '李小红', studentNo: '2024002', className: '一年级2班', screeningDate: '2024-06-01', adamTest: 'positive', scoliometer: 6, postureStatus: 'suspected', severity: 'mild', recommendation: '建议进一步检查', remark: '需复查' },
        { id: 3, studentName: '王小华', studentNo: '2024003', className: '二年级1班', screeningDate: '2024-06-01', adamTest: 'positive', scoliometer: 12, postureStatus: 'confirmed', severity: 'moderate', recommendation: '建议就医治疗', remark: '已通知家长' },
        { id: 4, studentName: '赵小刚', studentNo: '2024004', className: '二年级2班', screeningDate: '2024-06-01', adamTest: 'negative', scoliometer: 1, postureStatus: 'normal', severity: null, recommendation: '-', remark: '' }
      ],
      warningList: [
        { id: 1, studentName: '张小明', className: '一年级1班', warningType: 'vision', warningContent: '视力较上次筛查下降0.2，近视程度加深', changeValue: '-0.2', createTime: '2024-06-01 10:30', status: 'unread' },
        { id: 2, studentName: '王小华', className: '一年级2班', warningType: 'vision', warningContent: '视力较上次筛查下降0.3，建议加强用眼卫生教育', changeValue: '-0.3', createTime: '2024-06-01 10:35', status: 'unread' },
        { id: 3, studentName: '李小红', className: '一年级2班', warningType: 'posture', warningContent: '脊柱侧弯筛查疑似阳性，测量角度6度', changeValue: '+6度', createTime: '2024-06-01 11:00', status: 'unread' },
        { id: 4, studentName: '王小华', className: '二年级1班', warningType: 'posture', warningContent: '脊柱侧弯确诊，测量角度12度，需就医治疗', changeValue: '+12度', createTime: '2024-06-01 11:15', status: 'read' },
        { id: 5, studentName: '刘小芳', className: '二年级2班', warningType: 'vision', warningContent: '散光程度略有加重，需关注矫正效果', changeValue: '-0.1', createTime: '2024-06-01 11:30', status: 'unread' }
      ],
      visionForm: {
        studentId: '',
        screeningDate: '',
        leftEye: 5.0,
        rightEye: 5.0,
        visionStatus: '',
        correctionMethod: '',
        remark: ''
      },
      postureForm: {
        studentId: '',
        screeningDate: '',
        adamTest: 'negative',
        scoliometer: 0,
        postureStatus: '',
        severity: '',
        recommendation: '',
        remark: ''
      },
      historyList: [],
      yAxisLabels: ['5.5', '5.0', '4.5', '4.0', '3.5'],
      xAxisLabels: ['2023-09', '2023-12', '2024-03', '2024-06'],
      chartPoints: '0,100 33,80 66,60 100,40',
      chartDataPoints: [
        { x: 0, y: 50, value: 5.0 },
        { x: 33, y: 60, value: 4.8 },
        { x: 66, y: 70, value: 4.6 },
        { x: 100, y: 80, value: 4.5 }
      ]
    };
  },
  computed: {
    filteredVisionList() {
      let list = this.visionList;
      
      if (this.visionFilter.class) {
        list = list.filter(item => item.className.includes(this.visionFilter.class));
      }
      
      if (this.visionFilter.status) {
        list = list.filter(item => item.visionStatus === this.visionFilter.status);
      }
      
      if (this.visionFilter.search) {
        list = list.filter(item => 
          item.studentName.includes(this.visionFilter.search) ||
          item.studentNo.includes(this.visionFilter.search)
        );
      }
      
      this.visionTotal = list.length;
      return list;
    },
    filteredPostureList() {
      let list = this.postureList;
      
      if (this.postureFilter.class) {
        list = list.filter(item => item.className.includes(this.postureFilter.class));
      }
      
      if (this.postureFilter.status) {
        list = list.filter(item => item.postureStatus === this.postureFilter.status);
      }
      
      if (this.postureFilter.search) {
        list = list.filter(item => 
          item.studentName.includes(this.postureFilter.search) ||
          item.studentNo.includes(this.postureFilter.search)
        );
      }
      
      this.postureTotal = list.length;
      return list;
    }
  },
  methods: {
    getVisionStatusType(status) {
      const map = {
        normal: 'success',
        myopia: 'warning',
        hyperopia: 'warning',
        astigmatism: 'info'
      };
      return map[status] || 'info';
    },
    getVisionStatusText(status) {
      const map = {
        normal: '正常',
        myopia: '近视',
        hyperopia: '远视',
        astigmatism: '散光'
      };
      return map[status] || '未知';
    },
    getPostureStatusType(status) {
      const map = {
        normal: 'success',
        suspected: 'warning',
        confirmed: 'danger'
      };
      return map[status] || 'info';
    },
    getPostureStatusText(status) {
      const map = {
        normal: '正常',
        suspected: '疑似侧弯',
        confirmed: '确诊侧弯'
      };
      return map[status] || '未知';
    },
    getSeverityType(severity) {
      const map = {
        mild: 'success',
        moderate: 'warning',
        severe: 'danger'
      };
      return map[severity] || 'info';
    },
    getSeverityText(severity) {
      const map = {
        mild: '轻度',
        moderate: '中度',
        severe: '重度'
      };
      return map[severity] || '未知';
    },
    showAddScreeningDialog() {
      if (this.activeTab === 'vision') {
        this.showBatchVisionDialog();
      } else {
        this.showBatchPostureDialog();
      }
    },
    showBatchVisionDialog() {
      this.visionForm = {
        studentId: '',
        screeningDate: '',
        leftEye: 5.0,
        rightEye: 5.0,
        visionStatus: '',
        correctionMethod: '',
        remark: ''
      };
      this.visionDialogVisible = true;
    },
    showBatchPostureDialog() {
      this.postureForm = {
        studentId: '',
        screeningDate: '',
        adamTest: 'negative',
        scoliometer: 0,
        postureStatus: '',
        severity: '',
        recommendation: '',
        remark: ''
      };
      this.postureDialogVisible = true;
    },
    submitVision() {
      if (!this.visionForm.studentId || !this.visionForm.screeningDate) {
        this.$message.warning('请填写完整信息');
        return;
      }
      this.$message.success('视力筛查数据保存成功');
      this.visionDialogVisible = false;
    },
    submitPosture() {
      if (!this.postureForm.studentId || !this.postureForm.screeningDate) {
        this.$message.warning('请填写完整信息');
        return;
      }
      this.$message.success('脊柱筛查数据保存成功');
      this.postureDialogVisible = false;
    },
    editVision(row) {
      this.visionForm = {
        studentId: row.studentNo,
        screeningDate: row.screeningDate,
        leftEye: row.leftEye,
        rightEye: row.rightEye,
        visionStatus: row.visionStatus,
        correctionMethod: row.correctionMethod,
        remark: row.remark
      };
      this.visionDialogVisible = true;
    },
    editPosture(row) {
      this.postureForm = {
        studentId: row.studentNo,
        screeningDate: row.screeningDate,
        adamTest: row.adamTest,
        scoliometer: row.scoliometer,
        postureStatus: row.postureStatus,
        severity: row.severity || '',
        recommendation: row.recommendation,
        remark: row.remark
      };
      this.postureDialogVisible = true;
    },
    viewVisionHistory(row) {
      this.historyType = 'vision';
      this.historyList = [
        { screeningDate: '2023-09-01', leftEye: 5.0, rightEye: 5.0, visionStatus: '正常', change: 0, remark: '入学筛查' },
        { screeningDate: '2023-12-01', leftEye: 4.9, rightEye: 5.0, visionStatus: '近视', change: -0.1, remark: '轻微下降' },
        { screeningDate: '2024-03-01', leftEye: 4.8, rightEye: 4.9, visionStatus: '近视', change: -0.1, remark: '佩戴眼镜' },
        { screeningDate: '2024-06-01', leftEye: 4.8, rightEye: 4.9, visionStatus: '近视', change: -0.2, remark: '近视加深' }
      ];
      this.historyDialogVisible = true;
    },
    viewPostureHistory(row) {
      this.historyType = 'posture';
      this.historyList = [
        { screeningDate: '2023-09-01', scoliometer: 1, postureStatus: '正常', change: '-', remark: '入学筛查' },
        { screeningDate: '2023-12-01', scoliometer: 2, postureStatus: '正常', change: '+1', remark: '正常范围' },
        { screeningDate: '2024-03-01', scoliometer: 4, postureStatus: '疑似', change: '+2', remark: '需观察' },
        { screeningDate: '2024-06-01', scoliometer: 6, postureStatus: '疑似', change: '+2', remark: '建议复查' }
      ];
      this.historyDialogVisible = true;
    },
    viewWarningDetail(row) {
      this.$message.info(`查看预警详情：${row.studentName}`);
    },
    notifyParent(row) {
      this.$message.success(`已通知${row.studentName}的家长`);
    },
    markWarningRead(row) {
      row.status = 'read';
      this.warningCount--;
      this.$message.success('已标记为已读');
    },
    markAllWarningsRead() {
      this.warningList.forEach(w => w.status = 'read');
      this.warningCount = 0;
      this.$message.success('全部预警已标记为已读');
    },
    exportReport() {
      this.$message.success('筛查报告导出成功');
    },
    handlePageChange(page) {
      this.currentPage = page;
    }
  }
};
</script>

<style scoped>
.vision-posture {
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

.stats-overview {
  margin-bottom: 20px;
}

.stat-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.stat-card .stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.stat-card.vision-normal .stat-icon {
  background: #f6ffed;
  color: #52c41a;
}

.stat-card.vision-abnormal .stat-icon {
  background: #fff7e6;
  color: #faad14;
}

.stat-card.posture-normal .stat-icon {
  background: #e6f7ff;
  color: #1890ff;
}

.stat-card.posture-abnormal .stat-icon {
  background: #fff2f0;
  color: #ff4d4f;
}

.stat-card .stat-info .stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}

.stat-card .stat-info .stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 5px;
}

.screening-section,
.tracking-chart-section,
.warning-section {
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

.vision-warning {
  color: #faad14;
  font-weight: bold;
}

.angle-warning {
  color: #ff4d4f;
  font-weight: bold;
}

.change-worse {
  color: #ff4d4f;
}

.change-better {
  color: #52c41a;
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* CSS折线图样式 */
.chart-container {
  padding: 20px;
}

.css-line-chart {
  display: flex;
  height: 250px;
}

.chart-y-axis {
  width: 50px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 10px 0;
  text-align: right;
  font-size: 12px;
  color: #909399;
}

.chart-area {
  flex: 1;
  position: relative;
  border-left: 1px solid #e8e8e8;
  border-bottom: 1px solid #e8e8e8;
}

.chart-grid {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.grid-line {
  height: 20%;
  border-bottom: 1px dashed #f0f0f0;
}

.chart-line {
  position: absolute;
  top: 10px;
  left: 0;
  right: 0;
  bottom: 40px;
}

.chart-points {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 50px;
}

.point {
  position: absolute;
  width: 8px;
  height: 8px;
  background: #1890ff;
  border-radius: 50%;
  transform: translate(-50%, -50%);
}

.point-value {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  color: #1890ff;
  white-space: nowrap;
}

.chart-x-axis {
  height: 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  font-size: 12px;
  color: #909399;
}
</style>