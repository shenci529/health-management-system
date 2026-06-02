<template>
  <div class="safety-education">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>安全教育素材库</h2>
      <div class="header-actions">
        <el-button type="primary" icon="el-icon-plus" @click="showUploadDialog">上传素材</el-button>
        <el-button type="success" icon="el-icon-download" @click="exportStatistics">导出统计</el-button>
      </div>
    </div>

    <!-- 统计概览 -->
    <div class="stats-overview">
      <el-row :gutter="20">
        <el-col :span="4">
          <div class="stat-card total">
            <div class="stat-icon">
              <i class="el-icon-folder-opened"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalMaterials }}</div>
              <div class="stat-label">素材总数</div>
            </div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="stat-card courseware">
            <div class="stat-icon">
              <i class="el-icon-document"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.coursewareCount }}</div>
              <div class="stat-label">课件数量</div>
            </div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="stat-card video">
            <div class="stat-icon">
              <i class="el-icon-video-camera"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.videoCount }}</div>
              <div class="stat-label">视频数量</div>
            </div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="stat-card task">
            <div class="stat-icon">
              <i class="el-icon-s-order"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.taskCount }}</div>
              <div class="stat-label">下发任务</div>
            </div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="stat-card completed">
            <div class="stat-icon">
              <i class="el-icon-circle-check"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.completedRate }}%</div>
              <div class="stat-label">完成率</div>
            </div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="stat-card student">
            <div class="stat-icon">
              <i class="el-icon-s-custom"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.studentCount }}</div>
              <div class="stat-label">参与学生</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 素材分类管理 -->
    <div class="material-section">
      <el-tabs v-model="activeTab" type="card">
        <el-tab-pane label="安全课件" name="courseware">
          <div class="section-header">
            <div class="filter-group">
              <el-select v-model="coursewareFilter.category" placeholder="课件分类" clearable style="width: 150px;">
                <el-option label="消防安全" value="fire" />
                <el-option label="交通安全" value="traffic" />
                <el-option label="食品安全" value="food" />
                <el-option label="防溺水" value="water" />
                <el-option label="防欺凌" value="bully" />
                <el-option label="网络安全" value="network" />
              </el-select>
              <el-input v-model="coursewareFilter.search" placeholder="搜索课件名称" prefix-icon="el-icon-search" clearable style="width: 200px;" />
            </div>
            <el-button type="primary" size="small" icon="el-icon-plus" @click="uploadCourseware">上传课件</el-button>
          </div>

          <el-table :data="filteredCoursewareList" border stripe style="width: 100%">
            <el-table-column prop="name" label="课件名称" min-width="200" />
            <el-table-column prop="category" label="分类" width="120">
              <template slot-scope="scope">
                <el-tag :type="getCategoryTagType(scope.row.category)" size="small">
                  {{ getCategoryText(scope.row.category) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="size" label="文件大小" width="100" align="center" />
            <el-table-column prop="format" label="格式" width="80" align="center">
              <template slot-scope="scope">
                <el-tag type="info" size="small">{{ scope.row.format }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="uploadTime" label="上传时间" width="160" />
            <el-table-column prop="uploader" label="上传人" width="100" />
            <el-table-column prop="downloadCount" label="下载次数" width="100" align="center" />
            <el-table-column prop="viewCount" label="浏览次数" width="100" align="center" />
            <el-table-column label="操作" width="200" fixed="right">
              <template slot-scope="scope">
                <el-button type="text" size="small" @click="previewMaterial(scope.row)">预览</el-button>
                <el-button type="text" size="small" @click="downloadMaterial(scope.row)">下载</el-button>
                <el-button type="text" size="small" @click="assignTask(scope.row)">下发</el-button>
                <el-button type="text" size="small" @click="deleteMaterial(scope.row)" style="color: #ff4d4f;">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="演练视频" name="video">
          <div class="section-header">
            <div class="filter-group">
              <el-select v-model="videoFilter.type" placeholder="演练类型" clearable style="width: 150px;">
                <el-option label="消防演练" value="fire" />
                <el-option label="地震演练" value="earthquake" />
                <el-option label="防暴演练" value="security" />
                <el-option label="急救演练" value="firstaid" />
              </el-select>
              <el-input v-model="videoFilter.search" placeholder="搜索视频名称" prefix-icon="el-icon-search" clearable style="width: 200px;" />
            </div>
            <el-button type="primary" size="small" icon="el-icon-plus" @click="uploadVideo">上传视频</el-button>
          </div>

          <el-table :data="filteredVideoList" border stripe style="width: 100%">
            <el-table-column prop="name" label="视频名称" min-width="200" />
            <el-table-column prop="type" label="演练类型" width="120">
              <template slot-scope="scope">
                <el-tag :type="getDrillTypeTagType(scope.row.type)" size="small">
                  {{ getDrillTypeText(scope.row.type) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="duration" label="时长" width="80" align="center" />
            <el-table-column prop="size" label="文件大小" width="100" align="center" />
            <el-table-column prop="uploadTime" label="上传时间" width="160" />
            <el-table-column prop="uploader" label="上传人" width="100" />
            <el-table-column prop="playCount" label="播放次数" width="100" align="center" />
            <el-table-column prop="description" label="描述" min-width="150" />
            <el-table-column label="操作" width="200" fixed="right">
              <template slot-scope="scope">
                <el-button type="text" size="small" @click="playVideo(scope.row)">播放</el-button>
                <el-button type="text" size="small" @click="downloadMaterial(scope.row)">下载</el-button>
                <el-button type="text" size="small" @click="assignTask(scope.row)">下发</el-button>
                <el-button type="text" size="small" @click="deleteMaterial(scope.row)" style="color: #ff4d4f;">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 学习任务下发 -->
    <div class="task-section">
      <div class="section-header">
        <h3>学习任务管理</h3>
        <div class="filter-group">
          <el-select v-model="taskFilter.class" placeholder="选择班级" clearable style="width: 150px;">
            <el-option label="一年级1班" value="1-1" />
            <el-option label="一年级2班" value="1-2" />
            <el-option label="二年级1班" value="2-1" />
            <el-option label="二年级2班" value="2-2" />
          </el-select>
          <el-select v-model="taskFilter.status" placeholder="任务状态" clearable style="width: 120px;">
            <el-option label="进行中" value="ongoing" />
            <el-option label="已完成" value="completed" />
            <el-option label="已过期" value="expired" />
          </el-select>
        </div>
      </div>

      <el-table :data="filteredTaskList" border stripe style="width: 100%">
        <el-table-column prop="taskName" label="任务名称" min-width="180" />
        <el-table-column prop="materialName" label="关联素材" width="150" />
        <el-table-column prop="targetClass" label="下发班级" width="120" />
        <el-table-column prop="startTime" label="开始时间" width="120" />
        <el-table-column prop="endTime" label="结束时间" width="120" />
        <el-table-column prop="totalStudents" label="学生总数" width="80" align="center" />
        <el-table-column prop="completedStudents" label="已完成" width="80" align="center" />
        <el-table-column prop="completionRate" label="完成率" width="100" align="center">
          <template slot-scope="scope">
            <div class="completion-rate">
              <el-progress :percentage="scope.row.completionRate" :color="getProgressColor(scope.row.completionRate)" :stroke-width="8" />
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template slot-scope="scope">
            <el-tag :type="getTaskStatusType(scope.row.status)" size="small">
              {{ getTaskStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="160" />
        <el-table-column label="操作" width="180" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="viewTaskDetail(scope.row)">详情</el-button>
            <el-button type="text" size="small" @click="viewCompletionTable(scope.row)">完成情况</el-button>
            <el-button type="text" size="small" @click="remindTask(scope.row)" v-if="scope.row.status === 'ongoing'">
              提醒
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 完成率统计表格 -->
    <div class="completion-section">
      <div class="section-header">
        <h3>班级完成率统计</h3>
        <el-date-picker
          v-model="statDateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="yyyy-MM-dd"
        />
      </div>

      <el-table :data="classCompletionList" border stripe style="width: 100%">
        <el-table-column prop="className" label="班级" width="120" />
        <el-table-column prop="totalTasks" label="任务总数" width="100" align="center" />
        <el-table-column prop="completedTasks" label="已完成任务" width="120" align="center" />
        <el-table-column prop="avgCompletionRate" label="平均完成率" width="120" align="center">
          <template slot-scope="scope">
            <span :class="{ 'rate-high': scope.row.avgCompletionRate >= 90, 'rate-low': scope.row.avgCompletionRate < 60 }">
              {{ scope.row.avgCompletionRate }}%
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="fireSafety" label="消防安全" width="100" align="center">
          <template slot-scope="scope">
            <el-progress :percentage="scope.row.fireSafety" :stroke-width="6" />
          </template>
        </el-table-column>
        <el-table-column prop="trafficSafety" label="交通安全" width="100" align="center">
          <template slot-scope="scope">
            <el-progress :percentage="scope.row.trafficSafety" :stroke-width="6" />
          </template>
        </el-table-column>
        <el-table-column prop="waterSafety" label="防溺水" width="100" align="center">
          <template slot-scope="scope">
            <el-progress :percentage="scope.row.waterSafety" :stroke-width="6" />
          </template>
        </el-table-column>
        <el-table-column prop="networkSafety" label="网络安全" width="100" align="center">
          <template slot-scope="scope">
            <el-progress :percentage="scope.row.networkSafety" :stroke-width="6" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="viewClassDetail(scope.row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 上传素材弹窗 -->
    <el-dialog title="上传安全教育素材" :visible.sync="uploadDialogVisible" width="600px">
      <el-form :model="uploadForm" label-width="100px">
        <el-form-item label="素材类型">
          <el-radio-group v-model="uploadForm.materialType">
            <el-radio label="courseware">安全课件</el-radio>
            <el-radio label="video">演练视频</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="素材名称">
          <el-input v-model="uploadForm.name" placeholder="请输入素材名称" />
        </el-form-item>
        <el-form-item label="分类" v-if="uploadForm.materialType === 'courseware'">
          <el-select v-model="uploadForm.category" placeholder="选择课件分类">
            <el-option label="消防安全" value="fire" />
            <el-option label="交通安全" value="traffic" />
            <el-option label="食品安全" value="food" />
            <el-option label="防溺水" value="water" />
            <el-option label="防欺凌" value="bully" />
            <el-option label="网络安全" value="network" />
          </el-select>
        </el-form-item>
        <el-form-item label="演练类型" v-if="uploadForm.materialType === 'video'">
          <el-select v-model="uploadForm.drillType" placeholder="选择演练类型">
            <el-option label="消防演练" value="fire" />
            <el-option label="地震演练" value="earthquake" />
            <el-option label="防暴演练" value="security" />
            <el-option label="急救演练" value="firstaid" />
          </el-select>
        </el-form-item>
        <el-form-item label="上传文件">
          <el-upload
            class="upload-area"
            drag
            action="#"
            :auto-upload="false"
            :on-change="handleFileChange"
            :limit="1"
          >
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
            <div class="el-upload__tip" slot="tip">
              支持 ppt/pptx/pdf/mp4/avi 格式，单个文件不超过500MB
            </div>
          </el-upload>
        </el-form-item>
        <el-form-item label="素材描述">
          <el-input v-model="uploadForm.description" type="textarea" :rows="3" placeholder="请输入素材描述" />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="uploadDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitUpload">上传</el-button>
      </span>
    </el-dialog>

    <!-- 下发任务弹窗 -->
    <el-dialog title="下发学习任务" :visible.sync="assignDialogVisible" width="500px">
      <el-form :model="assignForm" label-width="100px">
        <el-form-item label="素材名称">
          <el-input :value="assignForm.materialName" disabled />
        </el-form-item>
        <el-form-item label="任务名称">
          <el-input v-model="assignForm.taskName" placeholder="请输入任务名称" />
        </el-form-item>
        <el-form-item label="下发班级">
          <el-checkbox-group v-model="assignForm.targetClasses">
            <el-checkbox label="一年级1班">一年级1班</el-checkbox>
            <el-checkbox label="一年级2班">一年级2班</el-checkbox>
            <el-checkbox label="二年级1班">二年级1班</el-checkbox>
            <el-checkbox label="二年级2班">二年级2班</el-checkbox>
            <el-checkbox label="三年级1班">三年级1班</el-checkbox>
            <el-checkbox label="三年级2班">三年级2班</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="开始时间">
          <el-date-picker v-model="assignForm.startTime" type="date" placeholder="选择开始时间" value-format="yyyy-MM-dd" />
        </el-form-item>
        <el-form-item label="结束时间">
          <el-date-picker v-model="assignForm.endTime" type="date" placeholder="选择结束时间" value-format="yyyy-MM-dd" />
        </el-form-item>
        <el-form-item label="任务要求">
          <el-input v-model="assignForm.requirement" type="textarea" :rows="2" placeholder="请输入任务要求" />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="assignDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAssign">下发</el-button>
      </span>
    </el-dialog>

    <!-- 任务完成详情弹窗 -->
    <el-dialog title="任务完成情况" :visible.sync="completionDialogVisible" width="700px">
      <el-table :data="studentCompletionList" border stripe style="width: 100%">
        <el-table-column prop="studentName" label="学生姓名" width="100" />
        <el-table-column prop="studentNo" label="学号" width="100" />
        <el-table-column prop="className" label="班级" width="100" />
        <el-table-column prop="completeTime" label="完成时间" width="160">
          <template slot-scope="scope">
            <span v-if="scope.row.completeTime">{{ scope.row.completeTime }}</span>
            <span v-else style="color: #909399;">未完成</span>
          </template>
        </el-table-column>
        <el-table-column prop="studyDuration" label="学习时长" width="100" align="center">
          <template slot-scope="scope">
            <span v-if="scope.row.studyDuration">{{ scope.row.studyDuration }}分钟</span>
            <span v-else style="color: #909399;">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="score" label="测验得分" width="100" align="center">
          <template slot-scope="scope">
            <span v-if="scope.row.score">{{ scope.row.score }}分</span>
            <span v-else style="color: #909399;">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80" align="center">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status === 'completed' ? 'success' : 'warning'" size="small">
              {{ scope.row.status === 'completed' ? '已完成' : '未完成' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
      <span slot="footer">
        <el-button @click="completionDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="remindUncompleted">提醒未完成学生</el-button>
      </span>
    </el-dialog>

    <!-- 视频播放弹窗 -->
    <el-dialog title="视频播放" :visible.sync="videoDialogVisible" width="800px" top="5vh">
      <div class="video-player">
        <div class="video-placeholder">
          <i class="el-icon-video-camera" style="font-size: 80px; color: #909399;"></i>
          <p>{{ currentVideo ? currentVideo.name : '' }}</p>
          <p style="color: #909399; font-size: 12px;">视频播放区域（实际项目中接入视频播放器）</p>
        </div>
      </div>
      <el-descriptions :column="2" border v-if="currentVideo" style="margin-top: 20px;">
        <el-descriptions-item label="演练类型">{{ getDrillTypeText(currentVideo.type) }}</el-descriptions-item>
        <el-descriptions-item label="时长">{{ currentVideo.duration }}</el-descriptions-item>
        <el-descriptions-item label="上传时间">{{ currentVideo.uploadTime }}</el-descriptions-item>
        <el-descriptions-item label="播放次数">{{ currentVideo.playCount }}</el-descriptions-item>
        <el-descriptions-item label="描述" :span="2">{{ currentVideo.description }}</el-descriptions-item>
      </el-descriptions>
      <span slot="footer">
        <el-button @click="videoDialogVisible = false">关闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'SafetyEducation',
  data() {
    return {
      activeTab: 'courseware',
      statDateRange: [],
      uploadDialogVisible: false,
      assignDialogVisible: false,
      completionDialogVisible: false,
      videoDialogVisible: false,
      currentVideo: null,
      stats: {
        totalMaterials: 45,
        coursewareCount: 28,
        videoCount: 17,
        taskCount: 12,
        completedRate: 85,
        studentCount: 320
      },
      coursewareFilter: {
        category: '',
        search: ''
      },
      videoFilter: {
        type: '',
        search: ''
      },
      taskFilter: {
        class: '',
        status: ''
      },
      coursewareList: [
        { id: 1, name: '消防安全知识讲座', category: 'fire', size: '15.2MB', format: 'PPT', uploadTime: '2024-05-15 10:30', uploader: '张老师', downloadCount: 56, viewCount: 120 },
        { id: 2, name: '交通安全教育课件', category: 'traffic', size: '8.5MB', format: 'PDF', uploadTime: '2024-05-18 14:20', uploader: '李老师', downloadCount: 42, viewCount: 85 },
        { id: 3, name: '防溺水安全教育', category: 'water', size: '12.8MB', format: 'PPTX', uploadTime: '2024-05-20 09:15', uploader: '王老师', downloadCount: 68, viewCount: 150 },
        { id: 4, name: '校园防欺凌指南', category: 'bully', size: '6.2MB', format: 'PDF', uploadTime: '2024-05-22 16:45', uploader: '赵老师', downloadCount: 35, viewCount: 72 },
        { id: 5, name: '网络安全基础知识', category: 'network', size: '10.5MB', format: 'PPT', uploadTime: '2024-05-25 11:30', uploader: '刘老师', downloadCount: 48, viewCount: 96 },
        { id: 6, name: '食品安全与健康', category: 'food', size: '7.8MB', format: 'PDF', uploadTime: '2024-05-28 08:50', uploader: '陈老师', downloadCount: 30, viewCount: 60 }
      ],
      videoList: [
        { id: 1, name: '消防疏散演练示范', type: 'fire', duration: '15:30', size: '120MB', uploadTime: '2024-05-10 10:00', uploader: '张老师', playCount: 156, description: '展示标准消防疏散演练流程' },
        { id: 2, name: '地震应急避险演练', type: 'earthquake', duration: '12:45', size: '95MB', uploadTime: '2024-05-12 14:30', uploader: '李老师', playCount: 128, description: '地震发生时的正确避险方法' },
        { id: 3, name: '校园防暴演练视频', type: 'security', duration: '18:20', size: '150MB', uploadTime: '2024-05-15 09:20', uploader: '王老师', playCount: 85, description: '应对校园突发安全事件的处理方法' },
        { id: 4, name: '心肺复苏急救演示', type: 'firstaid', duration: '10:15', size: '80MB', uploadTime: '2024-05-18 11:45', uploader: '赵老师', playCount: 200, description: '心肺复苏术的标准操作演示' }
      ],
      taskList: [
        { id: 1, taskName: '消防安全学习任务', materialName: '消防安全知识讲座', targetClass: '一年级1班', startTime: '2024-05-20', endTime: '2024-05-27', totalStudents: 45, completedStudents: 42, completionRate: 93, status: 'completed', createTime: '2024-05-20 08:00' },
        { id: 2, taskName: '交通安全学习任务', materialName: '交通安全教育课件', targetClass: '一年级2班', startTime: '2024-05-22', endTime: '2024-05-29', totalStudents: 42, completedStudents: 38, completionRate: 90, status: 'completed', createTime: '2024-05-22 09:30' },
        { id: 3, taskName: '防溺水安全教育', materialName: '防溺水安全教育', targetClass: '二年级1班', startTime: '2024-05-25', endTime: '2024-06-02', totalStudents: 48, completedStudents: 36, completionRate: 75, status: 'ongoing', createTime: '2024-05-25 10:00' },
        { id: 4, taskName: '网络安全学习', materialName: '网络安全基础知识', targetClass: '二年级2班', startTime: '2024-05-28', endTime: '2024-06-05', totalStudents: 45, completedStudents: 20, completionRate: 44, status: 'ongoing', createTime: '2024-05-28 14:00' },
        { id: 5, taskName: '防欺凌教育任务', materialName: '校园防欺凌指南', targetClass: '三年级1班', startTime: '2024-05-10', endTime: '2024-05-17', totalStudents: 50, completedStudents: 50, completionRate: 100, status: 'completed', createTime: '2024-05-10 08:00' }
      ],
      classCompletionList: [
        { className: '一年级1班', totalTasks: 3, completedTasks: 3, avgCompletionRate: 95, fireSafety: 93, trafficSafety: 90, waterSafety: 100, networkSafety: 92 },
        { className: '一年级2班', totalTasks: 3, completedTasks: 2, avgCompletionRate: 88, fireSafety: 90, trafficSafety: 85, waterSafety: 88, networkSafety: 80 },
        { className: '二年级1班', totalTasks: 4, completedTasks: 2, avgCompletionRate: 75, fireSafety: 80, trafficSafety: 75, waterSafety: 75, networkSafety: 70 },
        { className: '二年级2班', totalTasks: 4, completedTasks: 1, avgCompletionRate: 60, fireSafety: 65, trafficSafety: 60, waterSafety: 55, networkSafety: 44 },
        { className: '三年级1班', totalTasks: 2, completedTasks: 2, avgCompletionRate: 100, fireSafety: 100, trafficSafety: 100, waterSafety: 100, networkSafety: 100 },
        { className: '三年级2班', totalTasks: 2, completedTasks: 1, avgCompletionRate: 82, fireSafety: 85, trafficSafety: 80, waterSafety: 78, networkSafety: 85 }
      ],
      uploadForm: {
        materialType: 'courseware',
        name: '',
        category: '',
        drillType: '',
        file: null,
        description: ''
      },
      assignForm: {
        materialId: '',
        materialName: '',
        taskName: '',
        targetClasses: [],
        startTime: '',
        endTime: '',
        requirement: ''
      },
      studentCompletionList: []
    };
  },
  computed: {
    filteredCoursewareList() {
      let list = this.coursewareList;
      
      if (this.coursewareFilter.category) {
        list = list.filter(item => item.category === this.coursewareFilter.category);
      }
      
      if (this.coursewareFilter.search) {
        list = list.filter(item => item.name.includes(this.coursewareFilter.search));
      }
      
      return list;
    },
    filteredVideoList() {
      let list = this.videoList;
      
      if (this.videoFilter.type) {
        list = list.filter(item => item.type === this.videoFilter.type);
      }
      
      if (this.videoFilter.search) {
        list = list.filter(item => item.name.includes(this.videoFilter.search));
      }
      
      return list;
    },
    filteredTaskList() {
      let list = this.taskList;
      
      if (this.taskFilter.class) {
        list = list.filter(item => item.targetClass.includes(this.taskFilter.class));
      }
      
      if (this.taskFilter.status) {
        list = list.filter(item => item.status === this.taskFilter.status);
      }
      
      return list;
    }
  },
  methods: {
    getCategoryTagType(category) {
      const map = {
        fire: 'danger',
        traffic: 'warning',
        food: 'success',
        water: 'primary',
        bully: 'info',
        network: ''
      };
      return map[category] || 'info';
    },
    getCategoryText(category) {
      const map = {
        fire: '消防安全',
        traffic: '交通安全',
        food: '食品安全',
        water: '防溺水',
        bully: '防欺凌',
        network: '网络安全'
      };
      return map[category] || '其他';
    },
    getDrillTypeTagType(type) {
      const map = {
        fire: 'danger',
        earthquake: 'warning',
        security: 'info',
        firstaid: 'success'
      };
      return map[type] || 'info';
    },
    getDrillTypeText(type) {
      const map = {
        fire: '消防演练',
        earthquake: '地震演练',
        security: '防暴演练',
        firstaid: '急救演练'
      };
      return map[type] || '其他';
    },
    getTaskStatusType(status) {
      const map = {
        ongoing: 'warning',
        completed: 'success',
        expired: 'info'
      };
      return map[status] || 'info';
    },
    getTaskStatusText(status) {
      const map = {
        ongoing: '进行中',
        completed: '已完成',
        expired: '已过期'
      };
      return map[status] || '未知';
    },
    getProgressColor(rate) {
      if (rate >= 90) return '#52c41a';
      if (rate >= 60) return '#1890ff';
      return '#ff4d4f';
    },
    showUploadDialog() {
      this.uploadForm = {
        materialType: 'courseware',
        name: '',
        category: '',
        drillType: '',
        file: null,
        description: ''
      };
      this.uploadDialogVisible = true;
    },
    uploadCourseware() {
      this.uploadForm.materialType = 'courseware';
      this.showUploadDialog();
    },
    uploadVideo() {
      this.uploadForm.materialType = 'video';
      this.showUploadDialog();
    },
    handleFileChange(file) {
      this.uploadForm.file = file;
    },
    submitUpload() {
      if (!this.uploadForm.name || !this.uploadForm.file) {
        this.$message.warning('请填写完整信息并选择文件');
        return;
      }
      this.$message.success('素材上传成功');
      this.uploadDialogVisible = false;
    },
    previewMaterial(row) {
      this.$message.info(`预览课件：${row.name}`);
    },
    downloadMaterial(row) {
      this.$message.success(`下载素材：${row.name}`);
    },
    playVideo(row) {
      this.currentVideo = row;
      this.videoDialogVisible = true;
    },
    deleteMaterial(row) {
      this.$confirm('确定要删除该素材吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$message.success('素材已删除');
      }).catch(() => {});
    },
    assignTask(row) {
      this.assignForm = {
        materialId: row.id,
        materialName: row.name,
        taskName: '',
        targetClasses: [],
        startTime: '',
        endTime: '',
        requirement: ''
      };
      this.assignDialogVisible = true;
    },
    submitAssign() {
      if (!this.assignForm.taskName || this.assignForm.targetClasses.length === 0) {
        this.$message.warning('请填写任务名称并选择下发班级');
        return;
      }
      this.$message.success('学习任务已下发');
      this.assignDialogVisible = false;
    },
    viewTaskDetail(row) {
      this.$message.info(`查看任务详情：${row.taskName}`);
    },
    viewCompletionTable(row) {
      this.studentCompletionList = [
        { studentName: '张小明', studentNo: '2024001', className: row.targetClass, completeTime: '2024-05-25 10:30', studyDuration: 25, score: 85, status: 'completed' },
        { studentName: '李小红', studentNo: '2024002', className: row.targetClass, completeTime: '2024-05-26 14:20', studyDuration: 30, score: 92, status: 'completed' },
        { studentName: '王小华', studentNo: '2024003', className: row.targetClass, completeTime: '-', studyDuration: '-', score: '-', status: 'uncompleted' },
        { studentName: '赵小刚', studentNo: '2024004', className: row.targetClass, completeTime: '2024-05-27 09:15', studyDuration: 20, score: 78, status: 'completed' },
        { studentName: '刘小芳', studentNo: '2024005', className: row.targetClass, completeTime: '-', studyDuration: '-', score: '-', status: 'uncompleted' }
      ];
      this.completionDialogVisible = true;
    },
    remindTask(row) {
      this.$message.success(`已提醒未完成学生完成任务：${row.taskName}`);
    },
    remindUncompleted() {
      this.$message.success('已提醒所有未完成学生');
      this.completionDialogVisible = false;
    },
    viewClassDetail(row) {
      this.$message.info(`查看班级详情：${row.className}`);
    },
    exportStatistics() {
      this.$message.success('统计数据导出成功');
    }
  }
};
</script>

<style scoped>
.safety-education {
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

.stat-card.courseware .stat-icon {
  background: #f6ffed;
  color: #52c41a;
}

.stat-card.video .stat-icon {
  background: #fff7e6;
  color: #faad14;
}

.stat-card.task .stat-icon {
  background: #f9f0ff;
  color: #722ed1;
}

.stat-card.completed .stat-icon {
  background: #e6fffb;
  color: #13c2c2;
}

.stat-card.student .stat-icon {
  background: #fff2f0;
  color: #ff4d4f;
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

.material-section,
.task-section,
.completion-section {
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

.completion-rate {
  display: flex;
  align-items: center;
}

.rate-high {
  color: #52c41a;
  font-weight: bold;
}

.rate-low {
  color: #ff4d4f;
  font-weight: bold;
}

.upload-area {
  width: 100%;
}

.video-player {
  background: #f5f5f5;
  border-radius: 8px;
  padding: 40px;
}

.video-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.video-placeholder p {
  margin: 10px 0 0 0;
  font-size: 14px;
  color: #606266;
}
</style>