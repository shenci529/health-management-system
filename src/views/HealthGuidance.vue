<template>
  <div class="health-guidance">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>专业健康咨询诊疗服务</h2>
      <div class="header-actions">
        <el-button type="primary" icon="el-icon-plus" @click="showCreateTicketDialog">新建工单</el-button>
        <el-button type="success" icon="el-icon-download" @click="exportRecords">导出记录</el-button>
      </div>
    </div>

    <!-- 服务概览卡片 -->
    <div class="service-overview">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="overview-card pending">
            <div class="card-icon">
              <i class="el-icon-message"></i>
            </div>
            <div class="card-content">
              <div class="card-value">{{ serviceStats.pendingTickets }}</div>
              <div class="card-label">待处理工单</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="overview-card processing">
            <div class="card-icon">
              <i class="el-icon-loading"></i>
            </div>
            <div class="card-content">
              <div class="card-value">{{ serviceStats.processingTickets }}</div>
              <div class="card-label">处理中工单</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="overview-card completed">
            <div class="card-icon">
              <i class="el-icon-circle-check"></i>
            </div>
            <div class="card-content">
              <div class="card-value">{{ serviceStats.completedTickets }}</div>
              <div class="card-label">已完成工单</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="overview-card urgent">
            <div class="card-icon">
              <i class="el-icon-warning"></i>
            </div>
            <div class="card-content">
              <div class="card-value">{{ serviceStats.urgentTickets }}</div>
              <div class="card-label">紧急工单</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 咨询工单处理区域 -->
    <div class="ticket-section">
      <div class="section-header">
        <h3>咨询工单列表</h3>
        <div class="filter-group">
          <el-select v-model="filterTicketStatus" placeholder="工单状态" clearable style="width: 120px;">
            <el-option label="待处理" value="pending" />
            <el-option label="处理中" value="processing" />
            <el-option label="已完成" value="completed" />
            <el-option label="已关闭" value="closed" />
          </el-select>
          <el-select v-model="filterTicketType" placeholder="咨询类型" clearable style="width: 120px;">
            <el-option label="健康咨询" value="health" />
            <el-option label="疾病咨询" value="disease" />
            <el-option label="疫苗接种" value="vaccine" />
            <el-option label="心理健康" value="mental" />
            <el-option label="营养指导" value="nutrition" />
          </el-select>
          <el-select v-model="filterUrgency" placeholder="紧急程度" clearable style="width: 120px;">
            <el-option label="紧急" value="urgent" />
            <el-option label="普通" value="normal" />
            <el-option label="低优先" value="low" />
          </el-select>
        </div>
      </div>

      <el-table :data="filteredTicketList" border stripe style="width: 100%">
        <el-table-column prop="ticketNo" label="工单编号" width="120" />
        <el-table-column prop="requesterName" label="咨询人" width="100" />
        <el-table-column prop="requesterRole" label="身份" width="80">
          <template slot-scope="scope">
            <el-tag size="small" :type="scope.row.requesterRole === '家长' ? 'primary' : 'success'">
              {{ scope.row.requesterRole }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="studentName" label="关联学生" width="100" />
        <el-table-column prop="consultType" label="咨询类型" width="100">
          <template slot-scope="scope">
            <el-tag :type="getConsultTagType(scope.row.consultType)" size="small">
              {{ getConsultText(scope.row.consultType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="咨询标题" min-width="180" show-overflow-tooltip />
        <el-table-column prop="urgency" label="紧急程度" width="100" align="center">
          <template slot-scope="scope">
            <el-tag :type="getUrgencyType(scope.row.urgency)" effect="dark" size="small">
              {{ getUrgencyText(scope.row.urgency) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="160" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template slot-scope="scope">
            <el-tag :type="getTicketStatusType(scope.row.status)" size="small">
              {{ getTicketStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="viewTicketDetail(scope.row)">详情</el-button>
            <el-button type="text" size="small" @click="handleTicket(scope.row)" v-if="scope.row.status === 'pending'">
              处理
            </el-button>
            <el-button type="text" size="small" @click="closeTicket(scope.row)" v-if="scope.row.status !== 'closed'">
              关闭
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          background
          layout="total, prev, pager, next"
          :total="ticketTotal"
          :page-size="pageSize"
          :current-page="currentPage"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <!-- 健康指导建议区域 -->
    <div class="guidance-section">
      <div class="section-header">
        <h3>健康指导建议模板</h3>
        <el-button type="primary" size="small" icon="el-icon-plus" @click="showAddGuidanceDialog">新增模板</el-button>
      </div>
      
      <el-row :gutter="20">
        <el-col :span="8" v-for="(guidance, index) in guidanceTemplates" :key="index">
          <div class="guidance-card">
            <div class="guidance-header">
              <span class="guidance-title">{{ guidance.title }}</span>
              <el-tag :type="guidance.category === 'common' ? 'primary' : guidance.category === 'seasonal' ? 'warning' : 'info'" size="mini">
                {{ guidance.category === 'common' ? '常用' : guidance.category === 'seasonal' ? '季节性' : '专项' }}
              </el-tag>
            </div>
            <div class="guidance-body">
              <p class="guidance-desc">{{ guidance.description }}</p>
              <div class="guidance-tags">
                <el-tag v-for="(tag, idx) in guidance.tags" :key="idx" size="mini" style="margin-right: 5px;">
                  {{ tag }}
                </el-tag>
              </div>
            </div>
            <div class="guidance-footer">
              <el-button type="text" size="mini" @click="useGuidance(guidance)">使用模板</el-button>
              <el-button type="text" size="mini" @click="editGuidance(guidance)">编辑</el-button>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 干预方案制定区域 -->
    <div class="intervention-section">
      <div class="section-header">
        <h3>干预方案管理</h3>
        <div class="filter-group">
          <el-select v-model="filterInterventionType" placeholder="干预类型" clearable style="width: 120px;">
            <el-option label="健康干预" value="health" />
            <el-option label="行为干预" value="behavior" />
            <el-option label="心理干预" value="mental" />
            <el-option label="营养干预" value="nutrition" />
          </el-select>
          <el-select v-model="filterInterventionStatus" placeholder="执行状态" clearable style="width: 120px;">
            <el-option label="执行中" value="active" />
            <el-option label="已完成" value="completed" />
            <el-option label="已暂停" value="paused" />
          </el-select>
        </div>
      </div>

      <el-table :data="filteredInterventionList" border stripe style="width: 100%">
        <el-table-column prop="planNo" label="方案编号" width="120" />
        <el-table-column prop="studentName" label="学生姓名" width="100" />
        <el-table-column prop="className" label="班级" width="120" />
        <el-table-column prop="interventionType" label="干预类型" width="100">
          <template slot-scope="scope">
            <el-tag :type="getInterventionTagType(scope.row.interventionType)" size="small">
              {{ getInterventionText(scope.row.interventionType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="targetProblem" label="目标问题" min-width="150" show-overflow-tooltip />
        <el-table-column prop="startDate" label="开始日期" width="110" />
        <el-table-column prop="endDate" label="结束日期" width="110" />
        <el-table-column prop="progress" label="执行进度" width="100" align="center">
          <template slot-scope="scope">
            <el-progress :percentage="scope.row.progress" :status="getProgressStatus(scope.row.progress)" :stroke-width="6" />
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template slot-scope="scope">
            <el-tag :type="getInterventionStatusType(scope.row.status)" size="small">
              {{ getInterventionStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="viewInterventionDetail(scope.row)">详情</el-button>
            <el-button type="text" size="small" @click="updateInterventionProgress(scope.row)">更新进度</el-button>
            <el-button type="text" size="small" @click="editIntervention(scope.row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 健康教育资料推送区域 -->
    <div class="education-section">
      <div class="section-header">
        <h3>健康教育资料库</h3>
        <el-button type="primary" size="small" icon="el-icon-plus" @click="showAddMaterialDialog">新增资料</el-button>
      </div>

      <el-tabs v-model="activeMaterialTab" @tab-click="handleMaterialTabChange">
        <el-tab-pane label="全部资料" name="all">
          <el-row :gutter="20">
            <el-col :span="6" v-for="(material, index) in filteredMaterials" :key="index">
              <div class="material-card">
                <div class="material-icon">
                  <i :class="getMaterialIcon(material.type)"></i>
                </div>
                <div class="material-content">
                  <h4 class="material-title">{{ material.title }}</h4>
                  <p class="material-desc">{{ material.description }}</p>
                  <div class="material-meta">
                    <span class="material-type">{{ material.type }}</span>
                    <span class="material-date">{{ material.createDate }}</span>
                  </div>
                </div>
                <div class="material-actions">
                  <el-button type="text" size="mini" @click="previewMaterial(material)">预览</el-button>
                  <el-button type="text" size="mini" @click="pushMaterial(material)">推送</el-button>
                </div>
              </div>
            </el-col>
          </el-row>
        </el-tab-pane>
        <el-tab-pane label="图文资料" name="image">
          <el-row :gutter="20">
            <el-col :span="6" v-for="(material, index) in imageMaterials" :key="index">
              <div class="material-card">
                <div class="material-icon">
                  <i class="el-icon-picture"></i>
                </div>
                <div class="material-content">
                  <h4 class="material-title">{{ material.title }}</h4>
                  <p class="material-desc">{{ material.description }}</p>
                </div>
                <div class="material-actions">
                  <el-button type="text" size="mini" @click="previewMaterial(material)">预览</el-button>
                  <el-button type="text" size="mini" @click="pushMaterial(material)">推送</el-button>
                </div>
              </div>
            </el-col>
          </el-row>
        </el-tab-pane>
        <el-tab-pane label="视频资料" name="video">
          <el-row :gutter="20">
            <el-col :span="6" v-for="(material, index) in videoMaterials" :key="index">
              <div class="material-card">
                <div class="material-icon">
                  <i class="el-icon-video-camera"></i>
                </div>
                <div class="material-content">
                  <h4 class="material-title">{{ material.title }}</h4>
                  <p class="material-desc">{{ material.description }}</p>
                </div>
                <div class="material-actions">
                  <el-button type="text" size="mini" @click="previewMaterial(material)">预览</el-button>
                  <el-button type="text" size="mini" @click="pushMaterial(material)">推送</el-button>
                </div>
              </div>
            </el-col>
          </el-row>
        </el-tab-pane>
        <el-tab-pane label="文档资料" name="document">
          <el-row :gutter="20">
            <el-col :span="6" v-for="(material, index) in documentMaterials" :key="index">
              <div class="material-card">
                <div class="material-icon">
                  <i class="el-icon-document"></i>
                </div>
                <div class="material-content">
                  <h4 class="material-title">{{ material.title }}</h4>
                  <p class="material-desc">{{ material.description }}</p>
                </div>
                <div class="material-actions">
                  <el-button type="text" size="mini" @click="previewMaterial(material)">预览</el-button>
                  <el-button type="text" size="mini" @click="pushMaterial(material)">推送</el-button>
                </div>
              </div>
            </el-col>
          </el-row>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 工单详情弹窗 -->
    <el-dialog title="工单详情" :visible.sync="ticketDetailDialogVisible" width="700px">
      <el-descriptions :column="2" border v-if="currentTicket">
        <el-descriptions-item label="工单编号">{{ currentTicket.ticketNo }}</el-descriptions-item>
        <el-descriptions-item label="咨询类型">
          <el-tag :type="getConsultTagType(currentTicket.consultType)" size="small">
            {{ getConsultText(currentTicket.consultType) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="咨询人">{{ currentTicket.requesterName }}</el-descriptions-item>
        <el-descriptions-item label="身份">{{ currentTicket.requesterRole }}</el-descriptions-item>
        <el-descriptions-item label="关联学生">{{ currentTicket.studentName }}</el-descriptions-item>
        <el-descriptions-item label="紧急程度">
          <el-tag :type="getUrgencyType(currentTicket.urgency)" effect="dark" size="small">
            {{ getUrgencyText(currentTicket.urgency) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ currentTicket.createTime }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getTicketStatusType(currentTicket.status)" size="small">
            {{ getTicketStatusText(currentTicket.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="咨询标题" :span="2">{{ currentTicket.title }}</el-descriptions-item>
        <el-descriptions-item label="咨询内容" :span="2">
          <div class="ticket-content">{{ currentTicket.content }}</div>
        </el-descriptions-item>
      </el-descriptions>
      
      <div class="ticket-reply-history" v-if="currentTicket && currentTicket.replies">
        <h4>回复记录</h4>
        <el-timeline>
          <el-timeline-item v-for="(reply, index) in currentTicket.replies" :key="index" :timestamp="reply.time" placement="top">
            <el-card>
              <div class="reply-content">
                <div class="reply-header">
                  <span class="reply-author">{{ reply.author }}</span>
                  <el-tag size="mini" :type="reply.type === 'guidance' ? 'success' : 'primary'">
                    {{ reply.type === 'guidance' ? '健康指导' : '回复' }}
                  </el-tag>
                </div>
                <div class="reply-text">{{ reply.content }}</div>
              </div>
            </el-card>
          </el-timeline-item>
        </el-timeline>
      </div>
      
      <span slot="footer">
        <el-button @click="ticketDetailDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="handleTicket(currentTicket)" v-if="currentTicket && currentTicket.status === 'pending'">
          处理工单
        </el-button>
      </span>
    </el-dialog>

    <!-- 处理工单弹窗 -->
    <el-dialog title="处理工单" :visible.sync="handleTicketDialogVisible" width="600px">
      <el-form :model="handleTicketForm" :rules="handleTicketRules" ref="handleTicketForm" label-width="100px">
        <el-form-item label="工单编号">
          <el-input v-model="handleTicketForm.ticketNo" disabled />
        </el-form-item>
        <el-form-item label="咨询内容">
          <el-input v-model="handleTicketForm.content" type="textarea" :rows="2" disabled />
        </el-form-item>
        <el-form-item label="诊断评估" prop="diagnosis">
          <el-input v-model="handleTicketForm.diagnosis" type="textarea" :rows="3" placeholder="请输入诊断评估" />
        </el-form-item>
        <el-form-item label="健康指导" prop="guidance">
          <el-input v-model="handleTicketForm.guidance" type="textarea" :rows="4" placeholder="请输入健康指导建议" />
        </el-form-item>
        <el-form-item label="推荐资料">
          <el-select v-model="handleTicketForm.recommendedMaterials" multiple placeholder="选择推荐资料" style="width: 100%;">
            <el-option label="流感预防指南" value="flu_guide" />
            <el-option label="儿童营养手册" value="nutrition_handbook" />
            <el-option label="心理健康手册" value="mental_handbook" />
            <el-option label="疫苗接种须知" value="vaccine_notice" />
          </el-select>
        </el-form-item>
        <el-form-item label="是否转介">
          <el-radio-group v-model="handleTicketForm.needReferral">
            <el-radio label="no">无需转介</el-radio>
            <el-radio label="hospital">转介医院</el-radio>
            <el-radio label="specialist">转介专科</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="转介说明" v-if="handleTicketForm.needReferral !== 'no'">
          <el-input v-model="handleTicketForm.referralNote" placeholder="请输入转介说明" />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="handleTicketDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitHandleTicket">提交处理</el-button>
      </span>
    </el-dialog>

    <!-- 新建工单弹窗 -->
    <el-dialog title="新建咨询工单" :visible.sync="createTicketDialogVisible" width="600px">
      <el-form :model="createTicketForm" :rules="createTicketRules" ref="createTicketForm" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="咨询人" prop="requesterName">
              <el-input v-model="createTicketForm.requesterName" placeholder="请输入咨询人姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="身份" prop="requesterRole">
              <el-select v-model="createTicketForm.requesterRole" placeholder="请选择" style="width: 100%;">
                <el-option label="家长" value="家长" />
                <el-option label="教师" value="教师" />
                <el-option label="学生" value="学生" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="关联学生" prop="studentName">
              <el-select v-model="createTicketForm.studentName" placeholder="请选择学生" filterable style="width: 100%;">
                <el-option label="张小明" value="张小明" />
                <el-option label="李小红" value="李小红" />
                <el-option label="王小华" value="王小华" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="咨询类型" prop="consultType">
              <el-select v-model="createTicketForm.consultType" placeholder="请选择" style="width: 100%;">
                <el-option label="健康咨询" value="health" />
                <el-option label="疾病咨询" value="disease" />
                <el-option label="疫苗接种" value="vaccine" />
                <el-option label="心理健康" value="mental" />
                <el-option label="营养指导" value="nutrition" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="紧急程度" prop="urgency">
          <el-radio-group v-model="createTicketForm.urgency">
            <el-radio label="urgent">紧急</el-radio>
            <el-radio label="normal">普通</el-radio>
            <el-radio label="low">低优先</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="咨询标题" prop="title">
          <el-input v-model="createTicketForm.title" placeholder="请输入咨询标题" />
        </el-form-item>
        <el-form-item label="咨询内容" prop="content">
          <el-input v-model="createTicketForm.content" type="textarea" :rows="4" placeholder="请输入详细咨询内容" />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="createTicketDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitCreateTicket">创建工单</el-button>
      </span>
    </el-dialog>

    <!-- 推送资料弹窗 -->
    <el-dialog title="推送健康教育资料" :visible.sync="pushMaterialDialogVisible" width="500px">
      <el-form :model="pushMaterialForm" :rules="pushMaterialRules" ref="pushMaterialForm" label-width="100px">
        <el-form-item label="资料名称">
          <el-input v-model="pushMaterialForm.materialName" disabled />
        </el-form-item>
        <el-form-item label="推送对象" prop="pushTarget">
          <el-radio-group v-model="pushMaterialForm.pushTarget">
            <el-radio label="class">按班级推送</el-radio>
            <el-radio label="student">按学生推送</el-radio>
            <el-radio label="all">全校推送</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="选择班级" v-if="pushMaterialForm.pushTarget === 'class'">
          <el-select v-model="pushMaterialForm.targetClasses" multiple placeholder="请选择班级" style="width: 100%;">
            <el-option label="一年级1班" value="一年级1班" />
            <el-option label="一年级2班" value="一年级2班" />
            <el-option label="二年级1班" value="二年级1班" />
            <el-option label="二年级2班" value="二年级2班" />
          </el-select>
        </el-form-item>
        <el-form-item label="选择学生" v-if="pushMaterialForm.pushTarget === 'student'">
          <el-select v-model="pushMaterialForm.targetStudents" multiple placeholder="请选择学生" filterable style="width: 100%;">
            <el-option label="张小明" value="张小明" />
            <el-option label="李小红" value="李小红" />
            <el-option label="王小华" value="王小华" />
          </el-select>
        </el-form-item>
        <el-form-item label="推送说明">
          <el-input v-model="pushMaterialForm.pushNote" type="textarea" :rows="2" placeholder="请输入推送说明" />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="pushMaterialDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitPushMaterial">确认推送</el-button>
      </span>
    </el-dialog>

    <!-- 干预方案详情弹窗 -->
    <el-dialog title="干预方案详情" :visible.sync="interventionDetailDialogVisible" width="700px">
      <el-descriptions :column="2" border v-if="currentIntervention">
        <el-descriptions-item label="方案编号">{{ currentIntervention.planNo }}</el-descriptions-item>
        <el-descriptions-item label="干预类型">
          <el-tag :type="getInterventionTagType(currentIntervention.interventionType)" size="small">
            {{ getInterventionText(currentIntervention.interventionType) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="学生姓名">{{ currentIntervention.studentName }}</el-descriptions-item>
        <el-descriptions-item label="班级">{{ currentIntervention.className }}</el-descriptions-item>
        <el-descriptions-item label="开始日期">{{ currentIntervention.startDate }}</el-descriptions-item>
        <el-descriptions-item label="结束日期">{{ currentIntervention.endDate }}</el-descriptions-item>
        <el-descriptions-item label="目标问题" :span="2">{{ currentIntervention.targetProblem }}</el-descriptions-item>
        <el-descriptions-item label="干预措施" :span="2">
          <div class="intervention-measures">
            <div v-for="(measure, index) in currentIntervention.measures" :key="index" class="measure-item">
              <el-checkbox :value="measure.completed" disabled>{{ measure.content }}</el-checkbox>
              <span class="measure-date">{{ measure.date }}</span>
            </div>
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="执行进度">
          <el-progress :percentage="currentIntervention.progress" :stroke-width="10" />
        </el-descriptions-item>
        <el-descriptions-item label="执行状态">
          <el-tag :type="getInterventionStatusType(currentIntervention.status)" size="small">
            {{ getInterventionStatusText(currentIntervention.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="效果评估" :span="2">{{ currentIntervention.evaluation || '暂无评估' }}</el-descriptions-item>
      </el-descriptions>
      <span slot="footer">
        <el-button @click="interventionDetailDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="updateInterventionProgress(currentIntervention)">更新进度</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'HealthGuidance',
  data() {
    return {
      filterTicketStatus: '',
      filterTicketType: '',
      filterUrgency: '',
      filterInterventionType: '',
      filterInterventionStatus: '',
      currentPage: 1,
      pageSize: 10,
      ticketTotal: 50,
      activeMaterialTab: 'all',
      ticketDetailDialogVisible: false,
      handleTicketDialogVisible: false,
      createTicketDialogVisible: false,
      pushMaterialDialogVisible: false,
      interventionDetailDialogVisible: false,
      currentTicket: null,
      currentIntervention: null,
      serviceStats: {
        pendingTickets: 5,
        processingTickets: 8,
        completedTickets: 45,
        urgentTickets: 2
      },
      ticketList: [
        {
          id: 1,
          ticketNo: 'GD20240601001',
          requesterName: '张女士',
          requesterRole: '家长',
          studentName: '张小明',
          consultType: 'health',
          title: '孩子最近总是咳嗽，需要注意什么？',
          content: '孩子最近一周咳嗽比较频繁，尤其是早上起床时，没有发热症状，请问需要注意什么？是否需要就医？',
          urgency: 'normal',
          createTime: '2024-06-01 09:30',
          status: 'pending',
          replies: []
        },
        {
          id: 2,
          ticketNo: 'GD20240601002',
          requesterName: '李老师',
          requesterRole: '教师',
          studentName: '李小红',
          consultType: 'mental',
          title: '学生近期情绪低落，如何帮助？',
          content: '李小红同学最近在课堂上表现消极，不愿参与活动，与同学交流减少，疑似有心理困扰，请给予指导。',
          urgency: 'urgent',
          createTime: '2024-06-01 10:15',
          status: 'processing',
          replies: [
            { time: '2024-06-01 11:00', author: '校医', type: 'reply', content: '已了解情况，建议先与学生单独沟通，了解具体原因。' },
            { time: '2024-06-01 11:30', author: '校医', type: 'guidance', content: '建议安排心理咨询老师进行专业评估，同时关注家庭因素。' }
          ]
        },
        {
          id: 3,
          ticketNo: 'GD20240601003',
          requesterName: '王先生',
          requesterRole: '家长',
          studentName: '王小华',
          consultType: 'nutrition',
          title: '孩子偏食严重，如何改善？',
          content: '孩子不爱吃蔬菜，只喜欢吃肉类和零食，身高体重都偏低，请给予营养指导建议。',
          urgency: 'normal',
          createTime: '2024-06-01 14:00',
          status: 'completed',
          replies: [
            { time: '2024-06-01 15:00', author: '校医', type: 'reply', content: '偏食问题需要逐步改善，建议家长以身作则，创造良好饮食环境。' },
            { time: '2024-06-01 15:30', author: '校医', type: 'guidance', content: '已推送《儿童营养手册》和《健康饮食习惯培养》资料，建议制定渐进式饮食改善计划。' }
          ]
        },
        {
          id: 4,
          ticketNo: 'GD20240601004',
          requesterName: '赵女士',
          requesterRole: '家长',
          studentName: '赵小刚',
          consultType: 'vaccine',
          title: '疫苗接种时间咨询',
          content: '孩子乙肝疫苗第三针即将到期，请问学校医务室是否可以接种？需要携带什么材料？',
          urgency: 'low',
          createTime: '2024-06-01 16:00',
          status: 'completed',
          replies: [
            { time: '2024-06-01 16:30', author: '校医', type: 'reply', content: '学校医务室可以接种乙肝疫苗，请携带疫苗接种证到医务室登记，接种时间为每周二、周四下午。' }
          ]
        }
      ],
      guidanceTemplates: [
        {
          id: 1,
          title: '流感预防健康指导',
          description: '针对流感季节的健康预防建议，包括日常防护、饮食调理、运动建议等。',
          category: 'seasonal',
          tags: ['流感', '预防', '季节性']
        },
        {
          id: 2,
          title: '儿童营养均衡指导',
          description: '针对儿童偏食、营养不良问题的饮食指导方案，包含食谱建议。',
          category: 'common',
          tags: ['营养', '饮食', '偏食']
        },
        {
          id: 3,
          title: '心理健康关怀建议',
          description: '针对学生情绪问题、心理困扰的关怀指导，包含沟通技巧建议。',
          category: 'special',
          tags: ['心理', '情绪', '关怀']
        },
        {
          id: 4,
          title: '视力保护指导',
          description: '针对视力下降、近视预防的用眼健康指导，包含护眼习惯建议。',
          category: 'common',
          tags: ['视力', '近视', '护眼']
        },
        {
          id: 5,
          title: '运动损伤预防指导',
          description: '针对体育活动中的运动损伤预防和处理建议。',
          category: 'special',
          tags: ['运动', '损伤', '体育']
        },
        {
          id: 6,
          title: '疫苗接种须知',
          description: '各类疫苗接种的时间安排、注意事项和禁忌说明。',
          category: 'common',
          tags: ['疫苗', '接种', '须知']
        }
      ],
      interventionList: [
        {
          id: 1,
          planNo: 'IV20240601001',
          studentName: '张小明',
          className: '一年级1班',
          interventionType: 'health',
          targetProblem: '反复咳嗽症状，疑似过敏性鼻炎',
          startDate: '2024-06-01',
          endDate: '2024-06-30',
          progress: 30,
          status: 'active',
          measures: [
            { content: '每日晨检记录咳嗽情况', date: '06-01', completed: true },
            { content: '安排过敏源检测', date: '06-05', completed: true },
            { content: '调整座位远离粉尘源', date: '06-10', completed: false },
            { content: '家长配合用药监督', date: '06-15', completed: false }
          ],
          evaluation: ''
        },
        {
          id: 2,
          planNo: 'IV20240601002',
          studentName: '李小红',
          className: '二年级2班',
          interventionType: 'mental',
          targetProblem: '情绪低落，社交退缩',
          startDate: '2024-06-01',
          endDate: '2024-07-15',
          progress: 20,
          status: 'active',
          measures: [
            { content: '安排心理咨询评估', date: '06-02', completed: true },
            { content: '班主任日常关怀记录', date: '06-05', completed: true },
            { content: '组织小组活动融入', date: '06-10', completed: false },
            { content: '家长沟通了解家庭情况', date: '06-15', completed: false }
          ],
          evaluation: ''
        },
        {
          id: 3,
          planNo: 'IV20240601003',
          studentName: '王小华',
          className: '一年级1班',
          interventionType: 'nutrition',
          targetProblem: '偏食严重，身高体重偏低',
          startDate: '2024-05-15',
          endDate: '2024-08-15',
          progress: 60,
          status: 'active',
          measures: [
            { content: '制定渐进式饮食计划', date: '05-15', completed: true },
            { content: '午餐监督蔬菜摄入', date: '05-20', completed: true },
            { content: '营养知识教育课程', date: '06-01', completed: true },
            { content: '定期体重身高监测', date: '06-15', completed: false }
          ],
          evaluation: '饮食情况有所改善，蔬菜摄入量增加'
        },
        {
          id: 4,
          planNo: 'IV20240601004',
          studentName: '赵小刚',
          className: '三年级1班',
          interventionType: 'behavior',
          targetProblem: '上课注意力不集中，多动倾向',
          startDate: '2024-05-01',
          endDate: '2024-06-30',
          progress: 80,
          status: 'active',
          measures: [
            { content: '座位调整至前排', date: '05-01', completed: true },
            { content: '课堂行为记录表', date: '05-05', completed: true },
            { content: '注意力训练游戏', date: '05-15', completed: true },
            { content: '家长配合行为矫正', date: '05-20', completed: true }
          ],
          evaluation: '注意力明显改善，课堂表现好转'
        }
      ],
      materialList: [
        { id: 1, title: '流感预防指南', description: '流感症状识别、预防措施、就医指南', type: '图文', createDate: '2024-05-01' },
        { id: 2, title: '儿童营养手册', description: '儿童各年龄段营养需求、食谱推荐', type: '文档', createDate: '2024-05-10' },
        { id: 3, title: '心理健康手册', description: '常见心理问题识别、关怀技巧', type: '文档', createDate: '2024-05-15' },
        { id: 4, title: '疫苗接种须知', description: '疫苗接种时间表、注意事项', type: '图文', createDate: '2024-05-20' },
        { id: 5, title: '护眼健康视频', description: '正确用眼习惯、近视预防方法', type: '视频', createDate: '2024-05-25' },
        { id: 6, title: '运动安全指南', description: '体育活动安全注意事项', type: '图文', createDate: '2024-05-28' },
        { id: 7, title: '心理健康教育视频', description: '学生心理健康教育课程', type: '视频', createDate: '2024-05-30' },
        { id: 8, title: '健康饮食习惯', description: '培养健康饮食习惯的方法', type: '图文', createDate: '2024-06-01' }
      ],
      handleTicketForm: {
        ticketNo: '',
        content: '',
        diagnosis: '',
        guidance: '',
        recommendedMaterials: [],
        needReferral: 'no',
        referralNote: ''
      },
      handleTicketRules: {
        diagnosis: [{ required: true, message: '请输入诊断评估', trigger: 'blur' }],
        guidance: [{ required: true, message: '请输入健康指导建议', trigger: 'blur' }]
      },
      createTicketForm: {
        requesterName: '',
        requesterRole: '',
        studentName: '',
        consultType: '',
        urgency: 'normal',
        title: '',
        content: ''
      },
      createTicketRules: {
        requesterName: [{ required: true, message: '请输入咨询人姓名', trigger: 'blur' }],
        requesterRole: [{ required: true, message: '请选择身份', trigger: 'change' }],
        consultType: [{ required: true, message: '请选择咨询类型', trigger: 'change' }],
        title: [{ required: true, message: '请输入咨询标题', trigger: 'blur' }],
        content: [{ required: true, message: '请输入咨询内容', trigger: 'blur' }]
      },
      pushMaterialForm: {
        materialName: '',
        pushTarget: 'class',
        targetClasses: [],
        targetStudents: [],
        pushNote: ''
      },
      pushMaterialRules: {
        pushTarget: [{ required: true, message: '请选择推送对象', trigger: 'change' }]
      }
    };
  },
  computed: {
    filteredTicketList() {
      let list = this.ticketList;
      
      if (this.filterTicketStatus) {
        list = list.filter(item => item.status === this.filterTicketStatus);
      }
      
      if (this.filterTicketType) {
        list = list.filter(item => item.consultType === this.filterTicketType);
      }
      
      if (this.filterUrgency) {
        list = list.filter(item => item.urgency === this.filterUrgency);
      }
      
      return list;
    },
    filteredInterventionList() {
      let list = this.interventionList;
      
      if (this.filterInterventionType) {
        list = list.filter(item => item.interventionType === this.filterInterventionType);
      }
      
      if (this.filterInterventionStatus) {
        list = list.filter(item => item.status === this.filterInterventionStatus);
      }
      
      return list;
    },
    filteredMaterials() {
      return this.materialList;
    },
    imageMaterials() {
      return this.materialList.filter(item => item.type === '图文');
    },
    videoMaterials() {
      return this.materialList.filter(item => item.type === '视频');
    },
    documentMaterials() {
      return this.materialList.filter(item => item.type === '文档');
    }
  },
  methods: {
    getConsultTagType(type) {
      const map = {
        health: 'primary',
        disease: 'danger',
        vaccine: 'warning',
        mental: 'success',
        nutrition: 'info'
      };
      return map[type] || 'info';
    },
    getConsultText(type) {
      const map = {
        health: '健康咨询',
        disease: '疾病咨询',
        vaccine: '疫苗接种',
        mental: '心理健康',
        nutrition: '营养指导'
      };
      return map[type] || '未知';
    },
    getUrgencyType(urgency) {
      const map = {
        urgent: 'danger',
        normal: 'warning',
        low: 'info'
      };
      return map[urgency] || 'info';
    },
    getUrgencyText(urgency) {
      const map = {
        urgent: '紧急',
        normal: '普通',
        low: '低优先'
      };
      return map[urgency] || '未知';
    },
    getTicketStatusType(status) {
      const map = {
        pending: 'danger',
        processing: 'warning',
        completed: 'success',
        closed: 'info'
      };
      return map[status] || 'info';
    },
    getTicketStatusText(status) {
      const map = {
        pending: '待处理',
        processing: '处理中',
        completed: '已完成',
        closed: '已关闭'
      };
      return map[status] || '未知';
    },
    getInterventionTagType(type) {
      const map = {
        health: 'primary',
        behavior: 'warning',
        mental: 'success',
        nutrition: 'info'
      };
      return map[type] || 'info';
    },
    getInterventionText(type) {
      const map = {
        health: '健康干预',
        behavior: '行为干预',
        mental: '心理干预',
        nutrition: '营养干预'
      };
      return map[type] || '未知';
    },
    getInterventionStatusType(status) {
      const map = {
        active: 'warning',
        completed: 'success',
        paused: 'info'
      };
      return map[status] || 'info';
    },
    getInterventionStatusText(status) {
      const map = {
        active: '执行中',
        completed: '已完成',
        paused: '已暂停'
      };
      return map[status] || '未知';
    },
    getProgressStatus(progress) {
      if (progress >= 100) return 'success';
      if (progress >= 80) return '';
      return 'warning';
    },
    getMaterialIcon(type) {
      const map = {
        '图文': 'el-icon-picture',
        '视频': 'el-icon-video-camera',
        '文档': 'el-icon-document'
      };
      return map[type] || 'el-icon-document';
    },
    viewTicketDetail(row) {
      this.currentTicket = row;
      this.ticketDetailDialogVisible = true;
    },
    handleTicket(row) {
      this.handleTicketForm = {
        ticketNo: row.ticketNo,
        content: row.content,
        diagnosis: '',
        guidance: '',
        recommendedMaterials: [],
        needReferral: 'no',
        referralNote: ''
      };
      this.currentTicket = row;
      this.handleTicketDialogVisible = true;
    },
    submitHandleTicket() {
      this.$refs.handleTicketForm.validate(valid => {
        if (valid) {
          this.$message.success('工单处理成功');
          this.handleTicketDialogVisible = false;
          this.ticketDetailDialogVisible = false;
        }
      });
    },
    closeTicket(row) {
      this.$confirm('确认关闭该工单?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$message.success('工单已关闭');
      }).catch(() => {});
    },
    showCreateTicketDialog() {
      this.createTicketForm = {
        requesterName: '',
        requesterRole: '',
        studentName: '',
        consultType: '',
        urgency: 'normal',
        title: '',
        content: ''
      };
      this.createTicketDialogVisible = true;
    },
    submitCreateTicket() {
      this.$refs.createTicketForm.validate(valid => {
        if (valid) {
          this.$message.success('工单创建成功');
          this.createTicketDialogVisible = false;
        }
      });
    },
    useGuidance(guidance) {
      this.$message.success(`已应用模板：${guidance.title}`);
    },
    editGuidance(guidance) {
      this.$message.info(`编辑模板：${guidance.title}`);
    },
    showAddGuidanceDialog() {
      this.$message.info('新增模板功能开发中');
    },
    viewInterventionDetail(row) {
      this.currentIntervention = row;
      this.interventionDetailDialogVisible = true;
    },
    updateInterventionProgress(row) {
      this.$message.info(`更新进度：${row.planNo}`);
    },
    editIntervention(row) {
      this.$message.info(`编辑方案：${row.planNo}`);
    },
    previewMaterial(material) {
      this.$message.info(`预览资料：${material.title}`);
    },
    pushMaterial(material) {
      this.pushMaterialForm = {
        materialName: material.title,
        pushTarget: 'class',
        targetClasses: [],
        targetStudents: [],
        pushNote: ''
      };
      this.pushMaterialDialogVisible = true;
    },
    submitPushMaterial() {
      this.$refs.pushMaterialForm.validate(valid => {
        if (valid) {
          if (this.pushMaterialForm.pushTarget === 'class' && this.pushMaterialForm.targetClasses.length === 0) {
            this.$message.warning('请选择推送班级');
            return;
          }
          if (this.pushMaterialForm.pushTarget === 'student' && this.pushMaterialForm.targetStudents.length === 0) {
            this.$message.warning('请选择推送学生');
            return;
          }
          this.$message.success('资料推送成功');
          this.pushMaterialDialogVisible = false;
        }
      });
    },
    showAddMaterialDialog() {
      this.$message.info('新增资料功能开发中');
    },
    handleMaterialTabChange(tab) {
      // 标签切换逻辑已在computed中实现
    },
    exportRecords() {
      this.$message.success('记录导出成功');
    },
    handlePageChange(page) {
      this.currentPage = page;
    }
  }
};
</script>

<style scoped>
.health-guidance {
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

.service-overview {
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

.overview-card.pending .card-icon {
  background: #fff2f0;
  color: #ff4d4f;
}

.overview-card.processing .card-icon {
  background: #fffbe6;
  color: #faad14;
}

.overview-card.completed .card-icon {
  background: #f6ffed;
  color: #52c41a;
}

.overview-card.urgent .card-icon {
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

.ticket-section,
.guidance-section,
.intervention-section,
.education-section {
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

.guidance-card {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
}

.guidance-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.guidance-title {
  font-size: 14px;
  font-weight: bold;
  color: #303133;
}

.guidance-body {
  margin-bottom: 10px;
}

.guidance-desc {
  font-size: 12px;
  color: #606266;
  line-height: 1.5;
  margin-bottom: 10px;
}

.guidance-tags {
  display: flex;
  flex-wrap: wrap;
}

.guidance-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.material-card {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
}

.material-icon {
  width: 40px;
  height: 40px;
  background: #1890ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 20px;
  margin-bottom: 10px;
}

.material-title {
  font-size: 14px;
  font-weight: bold;
  color: #303133;
  margin: 0 0 5px 0;
}

.material-desc {
  font-size: 12px;
  color: #606266;
  margin: 0 0 10px 0;
}

.material-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #909399;
}

.material-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 10px;
}

.ticket-content {
  background: #f5f7fa;
  padding: 10px;
  border-radius: 4px;
  line-height: 1.6;
}

.ticket-reply-history {
  margin-top: 20px;
}

.ticket-reply-history h4 {
  margin: 0 0 15px 0;
  font-size: 14px;
  color: #303133;
}

.reply-content {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.reply-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.reply-author {
  font-weight: bold;
  color: #303133;
}

.reply-text {
  font-size: 13px;
  color: #606266;
  line-height: 1.5;
}

.intervention-measures {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.measure-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.measure-date {
  font-size: 12px;
  color: #909399;
}
</style>